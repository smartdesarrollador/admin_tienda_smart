import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  BehaviorSubject,
  Observable,
  catchError,
  finalize,
  map,
  tap,
  throwError,
} from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  PagoCompleto as Pago,
  MetodoPagoEnum as MetodoPago,
  EstadoPagoEnum as EstadoPago,
  CreatePagoDto,
  UpdatePagoDto,
  PagoFilters,
  PagoEstadisticas,
  ResumenPagosPedido,
  ProcesarPagoRequest,
  ProcesarPagoResponse,
  ReembolsoRequest,
  ReembolsoResponse,
  ConfiguracionMetodoPago,
  ConciliacionPago,
  NotificacionPago,
  AuditoriaPago,
  PagoPaginatedResponse,
  PAGO_CONSTANTS,
  PagoUtils,
  MetodoPagoInfo,
  PedidoInfo,
} from '../models';
import { ApiResponse } from '../models/common.interface';

/**
 * Servicio para gestión completa de pagos
 * Maneja la comunicación con la API Laravel para operaciones CRUD,
 * procesamiento de pagos, reembolsos y funcionalidades especializadas
 */
@Injectable({
  providedIn: 'root',
})
export class PagoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/admin/pagos`;

  // Signals para estado reactivo
  private readonly pagosSignal = signal<Pago[]>([]);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);
  private readonly processingSignal = signal<boolean>(false);
  private readonly estadisticasSignal = signal<PagoEstadisticas | null>(null);

  // Computed signals para datos derivados
  public readonly pagos = this.pagosSignal.asReadonly();
  public readonly loading = this.loadingSignal.asReadonly();
  public readonly error = this.errorSignal.asReadonly();
  public readonly processing = this.processingSignal.asReadonly();
  public readonly estadisticas = this.estadisticasSignal.asReadonly();

  // Computed signals para análisis de datos
  public readonly pagosPagados = computed(() =>
    PagoUtils.filtrarPorEstado(this.pagos(), EstadoPago.PAGADO)
  );

  public readonly pagosPendientes = computed(() =>
    PagoUtils.filtrarPorEstado(this.pagos(), EstadoPago.PENDIENTE)
  );

  public readonly pagosFallidos = computed(() =>
    this.pagos().filter((pago) => PagoUtils.esEstadoFallido(pago.estado))
  );

  public readonly totalMonto = computed(() =>
    PagoUtils.calcularTotal(this.pagos())
  );

  public readonly totalComisiones = computed(() =>
    PagoUtils.calcularTotalComisiones(this.pagos())
  );

  public readonly pagosPorEstado = computed(() =>
    PagoUtils.agruparPorEstado(this.pagos())
  );

  public readonly pagosPorMetodo = computed(() =>
    PagoUtils.agruparPorMetodo(this.pagos())
  );

  public readonly ultimoPago = computed(() =>
    PagoUtils.obtenerUltimoPago(this.pagos())
  );

  public readonly resumenGeneral = computed(() => ({
    total_pagos: this.pagos().length,
    monto_total: this.totalMonto(),
    total_comisiones: this.totalComisiones(),
    pagos_exitosos: this.pagosPagados().length,
    pagos_pendientes: this.pagosPendientes().length,
    pagos_fallidos: this.pagosFallidos().length,
    tasa_exito:
      this.pagos().length > 0
        ? (this.pagosPagados().length / this.pagos().length) * 100
        : 0,
  }));

  // Compatibilidad con BehaviorSubjects para código existente
  private pagosSubject = new BehaviorSubject<Pago[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);
  private processingSubject = new BehaviorSubject<boolean>(false);

  public readonly pagos$ = this.pagosSubject.asObservable();
  public readonly loading$ = this.loadingSubject.asObservable();
  public readonly error$ = this.errorSubject.asObservable();
  public readonly processing$ = this.processingSubject.asObservable();

  /**
   * Obtiene lista paginada de pagos con filtros
   */
  getPagos(filters?: PagoFilters): Observable<PagoPaginatedResponse> {
    this.setLoading(true);
    this.clearError();

    let params = new HttpParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(
              (v) => (params = params.append(`${key}[]`, v.toString()))
            );
          } else {
            params = params.set(key, value.toString());
          }
        }
      });
    }

    return this.http
      .get<ApiResponse<PagoPaginatedResponse>>(this.apiUrl, { params })
      .pipe(
        map((response) => response.data || (response as any)),
        tap((data) => {
          if (data.data) {
            this.updatePagos(data.data);
          }
        }),
        catchError((error) =>
          this.handleError('Error al obtener pagos', error)
        ),
        finalize(() => this.setLoading(false))
      );
  }

  /**
   * Obtiene un pago específico por ID
   */
  getPago(id: number): Observable<Pago> {
    this.setLoading(true);
    this.clearError();

    return this.http.get<ApiResponse<Pago>>(`${this.apiUrl}/${id}`).pipe(
      map((response) => response.data || (response as any)),
      catchError((error) =>
        this.handleError(`Error al obtener pago ${id}`, error)
      ),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * Crea un nuevo pago
   */
  createPago(data: CreatePagoDto): Observable<Pago> {
    this.setLoading(true);
    this.clearError();

    // Validaciones antes de enviar
    if (!this.validarDatosCreacion(data)) {
      return throwError(() => new Error('Datos de creación inválidos'));
    }

    return this.http.post<ApiResponse<Pago>>(this.apiUrl, data).pipe(
      map((response) => response.data || (response as any)),
      tap((pago) => {
        // Actualizar lista local
        const currentPagos = this.pagos();
        this.updatePagos([...currentPagos, pago]);
      }),
      catchError((error) => this.handleError('Error al crear pago', error)),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * Actualiza un pago existente
   */
  updatePago(id: number, data: UpdatePagoDto): Observable<Pago> {
    this.setLoading(true);
    this.clearError();

    return this.http.put<ApiResponse<Pago>>(`${this.apiUrl}/${id}`, data).pipe(
      map((response) => response.data || (response as any)),
      tap((pagoActualizado) => {
        // Actualizar en lista local
        const currentPagos = this.pagos();
        const index = currentPagos.findIndex((p) => p.id === id);
        if (index !== -1) {
          const updatedPagos = [...currentPagos];
          updatedPagos[index] = pagoActualizado;
          this.updatePagos(updatedPagos);
        }
      }),
      catchError((error) =>
        this.handleError(`Error al actualizar pago ${id}`, error)
      ),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * Elimina un pago
   */
  deletePago(id: number): Observable<void> {
    this.setLoading(true);
    this.clearError();

    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`).pipe(
      map(() => void 0),
      tap(() => {
        // Remover de lista local
        const currentPagos = this.pagos();
        const filteredPagos = currentPagos.filter((p) => p.id !== id);
        this.updatePagos(filteredPagos);
      }),
      catchError((error) =>
        this.handleError(`Error al eliminar pago ${id}`, error)
      ),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * Obtiene pagos de un pedido específico
   */
  getPagosByPedido(
    pedidoId: number
  ): Observable<{ data: Pago[]; resumen: ResumenPagosPedido }> {
    this.setLoading(true);
    this.clearError();

    return this.http
      .get<ApiResponse<{ data: Pago[]; resumen: ResumenPagosPedido }>>(
        `${this.apiUrl}/pedido/${pedidoId}`
      )
      .pipe(
        map((response) => response.data || (response as any)),
        catchError((error) =>
          this.handleError(
            `Error al obtener pagos del pedido ${pedidoId}`,
            error
          )
        ),
        finalize(() => this.setLoading(false))
      );
  }

  /**
   * Procesa un pago (marca como completado)
   */
  procesarPago(pagoId: number): Observable<Pago> {
    this.setProcessing(true);
    this.clearError();

    return this.http
      .post<ApiResponse<Pago>>(`${this.apiUrl}/${pagoId}/procesar`, {})
      .pipe(
        map((response) => response.data || (response as any)),
        tap((pagoActualizado) => {
          // Actualizar pago en lista local
          const currentPagos = this.pagos();
          const index = currentPagos.findIndex((p) => p.id === pagoId);
          if (index !== -1) {
            const updatedPagos = [...currentPagos];
            updatedPagos[index] = pagoActualizado;
            this.updatePagos(updatedPagos);
          }
        }),
        catchError((error) =>
          this.handleError('Error al procesar pago', error)
        ),
        finalize(() => this.setProcessing(false))
      );
  }

  /**
   * Cancela un pago
   */
  cancelarPago(id: number, motivo: string): Observable<Pago> {
    this.setLoading(true);
    this.clearError();

    const data = { motivo };

    return this.http
      .post<ApiResponse<Pago>>(`${this.apiUrl}/${id}/cancelar`, data)
      .pipe(
        map((response) => response.data || (response as any)),
        tap((pagoCancelado) => {
          // Actualizar en lista local
          const currentPagos = this.pagos();
          const index = currentPagos.findIndex((p) => p.id === id);
          if (index !== -1) {
            const updatedPagos = [...currentPagos];
            updatedPagos[index] = pagoCancelado;
            this.updatePagos(updatedPagos);
          }
        }),
        catchError((error) =>
          this.handleError(`Error al cancelar pago ${id}`, error)
        ),
        finalize(() => this.setLoading(false))
      );
  }

  /**
   * Obtiene estadísticas de pagos
   */
  getEstadisticas(
    filters?: Partial<PagoFilters>
  ): Observable<PagoEstadisticas> {
    this.setLoading(true);
    this.clearError();

    let params = new HttpParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http
      .get<ApiResponse<PagoEstadisticas>>(`${this.apiUrl}/statistics`, {
        params,
      })
      .pipe(
        map((response) => response.data || (response as any)),
        tap((estadisticas) => {
          this.estadisticasSignal.set(estadisticas);
        }),
        catchError((error) =>
          this.handleError('Error al obtener estadísticas de pagos', error)
        ),
        finalize(() => this.setLoading(false))
      );
  }

  /**
   * Obtiene pagos por método de pago
   */
  getPagosByMetodoPago(
    metodoPagoId: number,
    filters?: Partial<PagoFilters>
  ): Observable<{ data: Pago[]; resumen: any; meta: any }> {
    this.setLoading(true);
    this.clearError();

    let params = new HttpParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http
      .get<ApiResponse<{ data: Pago[]; resumen: any; meta: any }>>(
        `${this.apiUrl}/metodo-pago/${metodoPagoId}`,
        { params }
      )
      .pipe(
        map((response) => response.data || (response as any)),
        catchError((error) =>
          this.handleError('Error al obtener pagos por método de pago', error)
        ),
        finalize(() => this.setLoading(false))
      );
  }

  /**
   * Crea pago con método de pago específico
   */
  crearConMetodoPago(
    metodoPagoId: number,
    data: Partial<CreatePagoDto>
  ): Observable<Pago> {
    this.setLoading(true);
    this.clearError();

    return this.http
      .post<ApiResponse<Pago>>(
        `${this.apiUrl}/metodo-pago/${metodoPagoId}`,
        data
      )
      .pipe(
        map((response) => response.data || (response as any)),
        tap((pago) => {
          // Actualizar lista local
          const currentPagos = this.pagos();
          this.updatePagos([...currentPagos, pago]);
        }),
        catchError((error) =>
          this.handleError('Error al crear pago con método específico', error)
        ),
        finalize(() => this.setLoading(false))
      );
  }

  // Métodos de utilidad y análisis

  /**
   * Busca pagos por término
   */
  buscarPagos(termino: string): Pago[] {
    return PagoUtils.buscarPagos(this.pagos(), termino);
  }

  /**
   * Filtra pagos por estado
   */
  filtrarPorEstado(estado: EstadoPago): Pago[] {
    return PagoUtils.filtrarPorEstado(this.pagos(), estado);
  }

  /**
   * Filtra pagos por método
   */
  filtrarPorMetodo(metodo: string): Pago[] {
    return PagoUtils.filtrarPorMetodo(this.pagos(), metodo);
  }

  /**
   * Obtiene lista de métodos de pago disponibles
   */
  getMetodosPago(): MetodoPago[] {
    return Object.values(MetodoPago);
  }

  /**
   * Obtiene lista de estados de pago
   */
  getEstadosPago(): EstadoPago[] {
    return Object.values(EstadoPago);
  }

  /**
   * Obtiene métodos de pago que requieren autorización
   */
  getMetodosRequierenAutorizacion(): MetodoPago[] {
    return this.getMetodosPago().filter((metodo) =>
      PagoUtils.requiereAutorizacion(metodo)
    );
  }

  /**
   * Obtiene métodos de pago instantáneos
   */
  getMetodosInstantaneos(): MetodoPago[] {
    return this.getMetodosPago().filter((metodo) =>
      PagoUtils.esInstantaneo(metodo)
    );
  }

  /**
   * Calcula comisión de un pago
   */
  calcularComision(
    monto: number,
    metodo: MetodoPago,
    configuracion?: ConfiguracionMetodoPago
  ): number {
    if (configuracion) {
      const porcentaje = configuracion.comision_porcentaje || 0;
      const fija = configuracion.comision_fija || 0;
      return PagoUtils.calcularComision(monto, porcentaje, fija);
    }

    // Comisiones por defecto si no hay configuración
    const comisionesPorDefecto: Record<
      MetodoPago,
      { porcentaje: number; fija: number }
    > = {
      [MetodoPago.EFECTIVO]: { porcentaje: 0, fija: 0 },
      [MetodoPago.TARJETA_CREDITO]: { porcentaje: 3.5, fija: 0 },
      [MetodoPago.TARJETA_DEBITO]: { porcentaje: 2.5, fija: 0 },
      [MetodoPago.TRANSFERENCIA_BANCARIA]: { porcentaje: 0.5, fija: 2 },
      [MetodoPago.DEPOSITO_BANCARIO]: { porcentaje: 0.3, fija: 1 },
      [MetodoPago.YAPE]: { porcentaje: 1.5, fija: 0 },
      [MetodoPago.PLIN]: { porcentaje: 1.5, fija: 0 },
      [MetodoPago.PAYPAL]: { porcentaje: 4.0, fija: 0.5 },
      [MetodoPago.MERCADO_PAGO]: { porcentaje: 3.8, fija: 0 },
      [MetodoPago.VISA_NET]: { porcentaje: 3.2, fija: 0 },
      [MetodoPago.MASTERCARD]: { porcentaje: 3.2, fija: 0 },
      [MetodoPago.AMERICAN_EXPRESS]: { porcentaje: 4.5, fija: 0 },
      [MetodoPago.DINERS_CLUB]: { porcentaje: 4.0, fija: 0 },
      [MetodoPago.CREDITO_TIENDA]: { porcentaje: 0, fija: 0 },
      [MetodoPago.BITCOIN]: { porcentaje: 2.0, fija: 0 },
      [MetodoPago.OTROS]: { porcentaje: 2.0, fija: 0 },
    };

    const config = comisionesPorDefecto[metodo];
    return PagoUtils.calcularComision(monto, config.porcentaje, config.fija);
  }

  /**
   * Formatea monto según la moneda
   */
  formatearMonto(monto: number, moneda: 'PEN' | 'USD' | 'EUR'): string {
    return PagoUtils.formatearMonto(monto, moneda);
  }

  /**
   * Genera referencia de transacción
   */
  generarReferencia(metodo: string, pagoId?: number): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const metodoCodigo = metodo.substring(0, 3).toUpperCase();
    const id = pagoId ? pagoId.toString().padStart(6, '0') : '000000';

    return `${metodoCodigo}-${id}-${timestamp}-${random}`;
  }

  // Métodos de validación

  /**
   * Verifica si un pago puede ser reembolsado
   */
  puedeReembolsar(pago: Pago): boolean {
    const estadosReembolsables = [
      EstadoPago.COMPLETADO,
      EstadoPago.PAGADO,
      EstadoPago.PARCIALMENTE_REEMBOLSADO,
    ];

    return estadosReembolsables.includes(pago.estado) && pago.monto > 0;
  }

  /**
   * Verifica si un pago puede ser cancelado
   */
  puedeCancelar(pago: Pago): boolean {
    const estadosCancelables = [
      EstadoPago.PENDIENTE,
      EstadoPago.PROCESANDO,
      EstadoPago.AUTORIZADO,
    ];

    return estadosCancelables.includes(pago.estado);
  }

  /**
   * Valida los datos para crear un pago
   */
  private validarDatosCreacion(data: CreatePagoDto): boolean {
    if (!data.pedido_id || data.pedido_id <= 0) {
      this.setError('ID de pedido inválido');
      return false;
    }

    if (!data.metodo || data.metodo.trim() === '') {
      this.setError('Método de pago requerido');
      return false;
    }

    if (!this.validarMonto(data.monto)) {
      this.setError('Monto inválido');
      return false;
    }

    if (data.moneda && !['PEN', 'USD', 'EUR'].includes(data.moneda)) {
      this.setError('Moneda inválida');
      return false;
    }

    return true;
  }

  /**
   * Valida un monto
   */
  validarMonto(monto: number): boolean {
    return (
      monto >= PAGO_CONSTANTS.MONTO_MINIMO &&
      monto <= PAGO_CONSTANTS.MONTO_MAXIMO &&
      monto > 0 &&
      !isNaN(monto)
    );
  }

  /**
   * Formatea referencia según el método de pago
   */
  formatearReferencia(metodo: string, referencia: string): string {
    if (!referencia) return '';

    switch (metodo) {
      case 'tarjeta_credito':
      case 'tarjeta_debito':
        // Enmascarar número de tarjeta
        return referencia.replace(/(\d{4})\d{8}(\d{4})/, '$1****$2');

      case 'transferencia_bancaria':
        // Formato de número de operación
        return referencia.toUpperCase();

      case 'yape':
      case 'plin':
        // Enmascarar número de teléfono
        return referencia.replace(/(\d{3})\d{3}(\d{3})/, '$1***$2');

      default:
        return referencia;
    }
  }

  // Métodos de gestión de estado

  /**
   * Actualiza la lista de pagos en signals y subjects
   */
  private updatePagos(pagos: Pago[]): void {
    this.pagosSignal.set(pagos);
    this.pagosSubject.next(pagos);
  }

  /**
   * Establece el estado de carga
   */
  private setLoading(loading: boolean): void {
    this.loadingSignal.set(loading);
    this.loadingSubject.next(loading);
  }

  /**
   * Establece el estado de procesamiento
   */
  private setProcessing(processing: boolean): void {
    this.processingSignal.set(processing);
    this.processingSubject.next(processing);
  }

  /**
   * Establece un error
   */
  private setError(error: string): void {
    this.errorSignal.set(error);
    this.errorSubject.next(error);
  }

  /**
   * Limpia el error actual
   */
  private clearError(): void {
    this.errorSignal.set(null);
    this.errorSubject.next(null);
  }

  /**
   * Maneja errores de HTTP
   */
  private handleError(message: string, error: any): Observable<never> {
    console.error(message, error);

    let errorMessage = message;
    if (error?.error?.message) {
      errorMessage = `${message}: ${error.error.message}`;
    } else if (error?.message) {
      errorMessage = `${message}: ${error.message}`;
    }

    this.setError(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Limpia el estado del servicio
   */
  clearState(): void {
    this.updatePagos([]);
    this.estadisticasSignal.set(null);
    this.clearError();
    this.setLoading(false);
    this.setProcessing(false);
  }

  /**
   * Refresca los datos actuales
   */
  refresh(filters?: PagoFilters): Observable<PagoPaginatedResponse> {
    return this.getPagos(filters);
  }
}
