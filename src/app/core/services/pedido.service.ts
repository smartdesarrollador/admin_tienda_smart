import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  Observable,
  BehaviorSubject,
  map,
  tap,
  catchError,
  throwError,
} from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Pedido,
  PedidoResponse,
  CreatePedidoDto,
  UpdatePedidoDto,
  CambiarEstadoDto,
  AplicarCuponDto,
  AsignarRepartidorDto,
  PedidoFilters,
  EstadisticasResponse,
  PedidosPorUsuarioResponse,
  AplicarCuponResponse,
  PedidosPorRepartidorResponse,
  RastrearPedidoResponse,
  PedidosPorZonaResponse,
  EstadoPedido,
  TipoPago,
  TipoEntrega,
  CanalVenta,
  SIMBOLOS_MONEDA,
  formatearTiempoEntrega,
  puedeEditarPedido,
  puedeEliminarPedido,
  puedeCambiarEstado,
  puedeAplicarCupon,
  puedeCancelar,
} from '../models/pedido.interface';

@Injectable({
  providedIn: 'root',
})
export class PedidoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/admin/pedidos`;

  // Estado reactivo para la lista de pedidos
  private pedidosSubject = new BehaviorSubject<Pedido[]>([]);
  public pedidos$ = this.pedidosSubject.asObservable();

  // Estado para el pedido seleccionado
  private pedidoSeleccionadoSubject = new BehaviorSubject<Pedido | null>(null);
  public pedidoSeleccionado$ = this.pedidoSeleccionadoSubject.asObservable();

  // Estado para loading
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  // Estado para estadísticas
  private estadisticasSubject =
    new BehaviorSubject<EstadisticasResponse | null>(null);
  public estadisticas$ = this.estadisticasSubject.asObservable();

  // Estado para filtros actuales
  private filtrosActualesSubject = new BehaviorSubject<PedidoFilters | null>(
    null
  );
  public filtrosActuales$ = this.filtrosActualesSubject.asObservable();

  /**
   * Obtener lista paginada de pedidos con filtros
   */
  obtenerPedidos(filtros?: PedidoFilters): Observable<PedidoResponse> {
    this.setLoading(true);
    this.filtrosActualesSubject.next(filtros || null);

    let params = new HttpParams();

    if (filtros) {
      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach((v) => (params = params.append(key, v.toString())));
          } else {
            params = params.set(key, value.toString());
          }
        }
      });
    }

    return this.http.get<PedidoResponse>(this.apiUrl, { params }).pipe(
      tap((response) => {
        this.pedidosSubject.next(response.data);
        this.setLoading(false);
      }),
      catchError((error) => {
        this.setLoading(false);
        return this.handleError(error);
      })
    );
  }

  /**
   * Obtener un pedido específico por ID
   */
  obtenerPedido(id: number): Observable<Pedido> {
    this.setLoading(true);

    return this.http.get<{ data: Pedido }>(`${this.apiUrl}/${id}`).pipe(
      map((response) => response.data),
      tap((pedido) => {
        this.pedidoSeleccionadoSubject.next(pedido);
        this.setLoading(false);
      }),
      catchError((error) => {
        this.setLoading(false);
        return this.handleError(error);
      })
    );
  }

  /**
   * Crear un nuevo pedido
   */
  crearPedido(pedidoData: CreatePedidoDto): Observable<Pedido> {
    this.setLoading(true);

    return this.http.post<{ data: Pedido }>(this.apiUrl, pedidoData).pipe(
      map((response) => response.data),
      tap((nuevoPedido) => {
        // Actualizar la lista de pedidos agregando el nuevo
        const pedidosActuales = this.pedidosSubject.value;
        this.pedidosSubject.next([nuevoPedido, ...pedidosActuales]);
        this.setLoading(false);
      }),
      catchError((error) => {
        this.setLoading(false);
        return this.handleError(error);
      })
    );
  }

  /**
   * Actualizar un pedido existente
   */
  actualizarPedido(
    id: number,
    pedidoData: UpdatePedidoDto
  ): Observable<Pedido> {
    this.setLoading(true);

    return this.http
      .put<{ data: Pedido }>(`${this.apiUrl}/${id}`, pedidoData)
      .pipe(
        map((response) => response.data),
        tap((pedidoActualizado) => {
          this.actualizarPedidoEnLista(id, pedidoActualizado);
          this.setLoading(false);
        }),
        catchError((error) => {
          this.setLoading(false);
          return this.handleError(error);
        })
      );
  }

  /**
   * Eliminar un pedido
   */
  eliminarPedido(id: number): Observable<void> {
    this.setLoading(true);

    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.removerPedidoDeLista(id);
        this.setLoading(false);
      }),
      catchError((error) => {
        this.setLoading(false);
        return this.handleError(error);
      })
    );
  }

  /**
   * Cambiar estado de un pedido
   */
  cambiarEstado(
    id: number,
    cambioEstado: CambiarEstadoDto
  ): Observable<Pedido> {
    this.setLoading(true);

    return this.http
      .post<{ data: Pedido }>(
        `${this.apiUrl}/${id}/cambiar-estado`,
        cambioEstado
      )
      .pipe(
        map((response) => response.data),
        tap((pedidoActualizado) => {
          this.actualizarPedidoEnLista(id, pedidoActualizado);
          this.setLoading(false);
        }),
        catchError((error) => {
          this.setLoading(false);
          return this.handleError(error);
        })
      );
  }

  /**
   * Aplicar cupón a un pedido
   */
  aplicarCupon(
    id: number,
    cuponData: AplicarCuponDto
  ): Observable<AplicarCuponResponse> {
    this.setLoading(true);

    return this.http
      .post<AplicarCuponResponse>(
        `${this.apiUrl}/${id}/aplicar-cupon`,
        cuponData
      )
      .pipe(
        tap((response) => {
          this.actualizarPedidoEnLista(id, response.pedido);
          this.setLoading(false);
        }),
        catchError((error) => {
          this.setLoading(false);
          return this.handleError(error);
        })
      );
  }

  /**
   * Asignar repartidor a un pedido
   */
  asignarRepartidor(
    id: number,
    asignacionData: AsignarRepartidorDto
  ): Observable<Pedido> {
    this.setLoading(true);

    return this.http
      .post<{ data: Pedido }>(
        `${this.apiUrl}/${id}/asignar-repartidor`,
        asignacionData
      )
      .pipe(
        map((response) => response.data),
        tap((pedidoActualizado) => {
          this.actualizarPedidoEnLista(id, pedidoActualizado);
          this.setLoading(false);
        }),
        catchError((error) => {
          this.setLoading(false);
          return this.handleError(error);
        })
      );
  }

  /**
   * Obtener pedidos por usuario
   */
  obtenerPedidosPorUsuario(
    usuarioId: number,
    filtros?: Partial<PedidoFilters>
  ): Observable<PedidosPorUsuarioResponse> {
    this.setLoading(true);

    let params = new HttpParams();

    if (filtros) {
      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http
      .get<PedidosPorUsuarioResponse>(`${this.apiUrl}/usuario/${usuarioId}`, {
        params,
      })
      .pipe(
        tap(() => this.setLoading(false)),
        catchError((error) => {
          this.setLoading(false);
          return this.handleError(error);
        })
      );
  }

  /**
   * Obtener pedidos por repartidor
   */
  obtenerPedidosPorRepartidor(
    repartidorId: number,
    fecha?: string,
    estado?: EstadoPedido
  ): Observable<PedidosPorRepartidorResponse> {
    this.setLoading(true);

    let params = new HttpParams().set('repartidor_id', repartidorId.toString());

    if (fecha) {
      params = params.set('fecha', fecha);
    }

    if (estado) {
      params = params.set('estado', estado);
    }

    return this.http
      .get<PedidosPorRepartidorResponse>(`${this.apiUrl}/por-repartidor`, {
        params,
      })
      .pipe(
        tap(() => this.setLoading(false)),
        catchError((error) => {
          this.setLoading(false);
          return this.handleError(error);
        })
      );
  }

  /**
   * Rastrear pedido por código
   */
  rastrearPedido(codigoRastreo: string): Observable<RastrearPedidoResponse> {
    this.setLoading(true);

    const params = new HttpParams().set('codigo_rastreo', codigoRastreo);

    return this.http
      .get<RastrearPedidoResponse>(`${this.apiUrl}/rastrear`, { params })
      .pipe(
        tap(() => this.setLoading(false)),
        catchError((error) => {
          this.setLoading(false);
          return this.handleError(error);
        })
      );
  }

  /**
   * Obtener pedidos por zona de reparto
   */
  obtenerPedidosPorZona(
    zonaRepartoId: number,
    fechaDesde?: string,
    fechaHasta?: string,
    estado?: EstadoPedido
  ): Observable<PedidosPorZonaResponse> {
    this.setLoading(true);

    let params = new HttpParams().set(
      'zona_reparto_id',
      zonaRepartoId.toString()
    );

    if (fechaDesde) {
      params = params.set('fecha_desde', fechaDesde);
    }

    if (fechaHasta) {
      params = params.set('fecha_hasta', fechaHasta);
    }

    if (estado) {
      params = params.set('estado', estado);
    }

    return this.http
      .get<PedidosPorZonaResponse>(`${this.apiUrl}/por-zona`, { params })
      .pipe(
        tap(() => this.setLoading(false)),
        catchError((error) => {
          this.setLoading(false);
          return this.handleError(error);
        })
      );
  }

  /**
   * Obtener estadísticas de pedidos
   */
  obtenerEstadisticas(
    fechaDesde?: string,
    fechaHasta?: string
  ): Observable<EstadisticasResponse> {
    this.setLoading(true);

    let params = new HttpParams();

    if (fechaDesde) {
      params = params.set('fecha_desde', fechaDesde);
    }

    if (fechaHasta) {
      params = params.set('fecha_hasta', fechaHasta);
    }

    return this.http
      .get<EstadisticasResponse>(`${this.apiUrl}/statistics`, { params })
      .pipe(
        tap((estadisticas) => {
          this.estadisticasSubject.next(estadisticas);
          this.setLoading(false);
        }),
        catchError((error) => {
          this.setLoading(false);
          return this.handleError(error);
        })
      );
  }

  /**
   * Métodos de utilidad para filtros rápidos
   */
  obtenerPedidosPorEstado(estado: EstadoPedido): Observable<PedidoResponse> {
    return this.obtenerPedidos({ estado });
  }

  obtenerPedidosPorTipoPago(tipoPago: TipoPago): Observable<PedidoResponse> {
    return this.obtenerPedidos({ tipo_pago: tipoPago });
  }

  obtenerPedidosPorTipoEntrega(
    tipoEntrega: TipoEntrega
  ): Observable<PedidoResponse> {
    return this.obtenerPedidos({ tipo_entrega: tipoEntrega });
  }

  obtenerPedidosPorCanalVenta(
    canalVenta: CanalVenta
  ): Observable<PedidoResponse> {
    return this.obtenerPedidos({ canal_venta: canalVenta });
  }

  obtenerPedidosPendientes(): Observable<PedidoResponse> {
    return this.obtenerPedidosPorEstado('pendiente');
  }

  obtenerPedidosEnProceso(): Observable<PedidoResponse> {
    return this.obtenerPedidos({
      estado: ['aprobado', 'en_proceso', 'enviado'],
    });
  }

  obtenerPedidosFinalizados(): Observable<PedidoResponse> {
    return this.obtenerPedidos({
      estado: ['entregado', 'cancelado', 'devuelto'],
    });
  }

  obtenerPedidosDelivery(): Observable<PedidoResponse> {
    return this.obtenerPedidosPorTipoEntrega('delivery');
  }

  obtenerPedidosRecojoTienda(): Observable<PedidoResponse> {
    return this.obtenerPedidosPorTipoEntrega('recojo_tienda');
  }

  /**
   * Buscar pedidos por término
   */
  buscarPedidos(termino: string): Observable<PedidoResponse> {
    return this.obtenerPedidos({ search: termino });
  }

  /**
   * Obtener pedidos por rango de fechas
   */
  obtenerPedidosPorRangoFechas(
    fechaDesde: string,
    fechaHasta: string
  ): Observable<PedidoResponse> {
    return this.obtenerPedidos({
      fecha_desde: fechaDesde,
      fecha_hasta: fechaHasta,
    });
  }

  /**
   * Obtener pedidos por rango de fechas de entrega
   */
  obtenerPedidosPorRangoFechasEntrega(
    fechaDesde: string,
    fechaHasta: string
  ): Observable<PedidoResponse> {
    return this.obtenerPedidos({
      fecha_entrega_desde: fechaDesde,
      fecha_entrega_hasta: fechaHasta,
    });
  }

  /**
   * Obtener pedidos por rango de totales
   */
  obtenerPedidosPorRangoTotales(
    totalMin: number,
    totalMax: number
  ): Observable<PedidoResponse> {
    return this.obtenerPedidos({ total_min: totalMin, total_max: totalMax });
  }

  /**
   * Obtener pedidos por zona de reparto
   */
  obtenerPedidosPorZonaReparto(
    zonaRepartoId: number
  ): Observable<PedidoResponse> {
    return this.obtenerPedidos({ zona_reparto_id: zonaRepartoId });
  }

  /**
   * Obtener pedidos por repartidor
   */
  obtenerPedidosPorRepartidorId(
    repartidorId: number
  ): Observable<PedidoResponse> {
    return this.obtenerPedidos({ repartidor_id: repartidorId });
  }

  /**
   * Buscar por código de rastreo
   */
  buscarPorCodigoRastreo(codigo: string): Observable<PedidoResponse> {
    return this.obtenerPedidos({ codigo_rastreo: codigo });
  }

  /**
   * Buscar por número de pedido
   */
  buscarPorNumeroPedido(numero: string): Observable<PedidoResponse> {
    return this.obtenerPedidos({ numero_pedido: numero });
  }

  /**
   * Métodos para gestión de estado local
   */
  seleccionarPedido(pedido: Pedido): void {
    this.pedidoSeleccionadoSubject.next(pedido);
  }

  limpiarPedidoSeleccionado(): void {
    this.pedidoSeleccionadoSubject.next(null);
  }

  limpiarPedidos(): void {
    this.pedidosSubject.next([]);
  }

  limpiarEstadisticas(): void {
    this.estadisticasSubject.next(null);
  }

  limpiarFiltros(): void {
    this.filtrosActualesSubject.next(null);
  }

  /**
   * Métodos de utilidad para validaciones
   */
  puedeEditarPedido(pedido: Pedido): boolean {
    return puedeEditarPedido(pedido.estado);
  }

  puedeEliminarPedido(pedido: Pedido): boolean {
    return puedeEliminarPedido(pedido.estado);
  }

  puedeCambiarEstado(pedido: Pedido, nuevoEstado: EstadoPedido): boolean {
    return puedeCambiarEstado(pedido.estado, nuevoEstado);
  }

  puedeAplicarCupon(pedido: Pedido): boolean {
    return puedeAplicarCupon(pedido.estado);
  }

  puedeCancelar(pedido: Pedido): boolean {
    return puedeCancelar(pedido.estado);
  }

  puedeAsignarRepartidor(pedido: Pedido): boolean {
    return (
      ['aprobado', 'en_proceso'].includes(pedido.estado) &&
      pedido.tipo_entrega === 'delivery'
    );
  }

  /**
   * Métodos de utilidad para cálculos
   */
  calcularSubtotal(pedido: Pedido): number {
    return pedido.detalles.reduce((sum, detalle) => sum + detalle.subtotal, 0);
  }

  calcularTotalDescuentos(pedido: Pedido): number {
    const descuentosDetalles = pedido.detalles.reduce(
      (sum, detalle) => sum + (detalle.descuento || 0),
      0
    );
    return descuentosDetalles + (pedido.descuento || 0);
  }

  calcularTotalImpuestos(pedido: Pedido): number {
    return pedido.detalles.reduce(
      (sum, detalle) => sum + (detalle.impuesto || 0),
      0
    );
  }

  calcularTotalAdicionales(pedido: Pedido): number {
    return pedido.detalles.reduce(
      (sum, detalle) =>
        sum +
        detalle.adicionales.reduce(
          (sumAdicional, adicional) => sumAdicional + adicional.subtotal,
          0
        ),
      0
    );
  }

  obtenerSimboloMoneda(moneda: string): string {
    return SIMBOLOS_MONEDA[moneda as keyof typeof SIMBOLOS_MONEDA] || moneda;
  }

  formatearTiempoEntrega(minutos: number | null): string | null {
    return formatearTiempoEntrega(minutos);
  }

  /**
   * Obtener datos parseados
   */
  obtenerDatosEnvio(pedido: Pedido): any {
    try {
      return pedido.datos_envio ? JSON.parse(pedido.datos_envio) : null;
    } catch {
      return null;
    }
  }

  obtenerDatosCliente(pedido: Pedido): any {
    try {
      return pedido.datos_cliente ? JSON.parse(pedido.datos_cliente) : null;
    } catch {
      return null;
    }
  }

  obtenerMetodoEnvio(pedido: Pedido): any {
    try {
      return pedido.metodo_envio ? JSON.parse(pedido.metodo_envio) : null;
    } catch {
      return null;
    }
  }

  /**
   * Verificar estados de pago
   */
  tienePagosPendientes(pedido: Pedido): boolean {
    if (!pedido.pagos || pedido.pagos.length === 0) return true;

    const totalPagado = pedido.pagos
      .filter((pago) => pago.estado === 'pagado')
      .reduce((sum, pago) => sum + pago.monto, 0);

    return totalPagado < pedido.total;
  }

  calcularSaldoPendiente(pedido: Pedido): number {
    if (!pedido.pagos || pedido.pagos.length === 0) return pedido.total;

    const totalPagado = pedido.pagos
      .filter((pago) => pago.estado === 'pagado')
      .reduce((sum, pago) => sum + pago.monto, 0);

    return Math.max(0, pedido.total - totalPagado);
  }

  calcularTotalPagado(pedido: Pedido): number {
    if (!pedido.pagos || pedido.pagos.length === 0) return 0;

    return pedido.pagos
      .filter((pago) => pago.estado === 'pagado')
      .reduce((sum, pago) => sum + pago.monto, 0);
  }

  /**
   * Métodos para manejo de coordenadas
   */
  tieneCoordenadasEntrega(pedido: Pedido): boolean {
    return !!(pedido.latitud_entrega && pedido.longitud_entrega);
  }

  obtenerCoordenadasEntrega(
    pedido: Pedido
  ): { lat: number; lng: number } | null {
    if (!this.tieneCoordenadasEntrega(pedido)) return null;

    return {
      lat: pedido.latitud_entrega!,
      lng: pedido.longitud_entrega!,
    };
  }

  /**
   * Métodos para manejo de seguimiento
   */
  obtenerUltimoSeguimiento(pedido: Pedido): any {
    if (!pedido.seguimientos || pedido.seguimientos.length === 0) return null;

    return pedido.seguimientos.sort(
      (a, b) =>
        new Date(b.fecha_cambio).getTime() - new Date(a.fecha_cambio).getTime()
    )[0];
  }

  /**
   * Métodos privados
   */
  private actualizarPedidoEnLista(id: number, pedidoActualizado: Pedido): void {
    // Actualizar en la lista de pedidos
    const pedidosActuales = this.pedidosSubject.value;
    const index = pedidosActuales.findIndex((p) => p.id === id);
    if (index !== -1) {
      pedidosActuales[index] = pedidoActualizado;
      this.pedidosSubject.next([...pedidosActuales]);
    }

    // Actualizar pedido seleccionado si es el mismo
    if (this.pedidoSeleccionadoSubject.value?.id === id) {
      this.pedidoSeleccionadoSubject.next(pedidoActualizado);
    }
  }

  private removerPedidoDeLista(id: number): void {
    // Remover de la lista de pedidos
    const pedidosActuales = this.pedidosSubject.value;
    const pedidosFiltrados = pedidosActuales.filter((p) => p.id !== id);
    this.pedidosSubject.next(pedidosFiltrados);

    // Limpiar pedido seleccionado si es el mismo
    if (this.pedidoSeleccionadoSubject.value?.id === id) {
      this.pedidoSeleccionadoSubject.next(null);
    }
  }

  private setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  private handleError(error: any): Observable<never> {
    console.error('Error en PedidoService:', error);

    let errorMessage = 'Ha ocurrido un error inesperado';

    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return throwError(() => new Error(errorMessage));
  }

  /**
   * Método para refrescar datos
   */
  refrescarDatos(): void {
    // Refrescar lista de pedidos si hay filtros aplicados
    const filtrosActuales = this.filtrosActualesSubject.value;
    if (filtrosActuales) {
      this.obtenerPedidos(filtrosActuales).subscribe();
    }

    // Refrescar estadísticas si están cargadas
    if (this.estadisticasSubject.value) {
      this.obtenerEstadisticas().subscribe();
    }
  }

  /**
   * Método para exportar datos (preparación para futuras funcionalidades)
   */
  prepararDatosParaExportar(pedidos: Pedido[]): any[] {
    return pedidos.map((pedido) => ({
      id: pedido.id,
      numero_pedido: pedido.numero_pedido,
      fecha: pedido.created_at,
      cliente: pedido.usuario?.nombre || 'N/A',
      email: pedido.usuario?.email || 'N/A',
      estado: pedido.estado,
      tipo_pago: pedido.tipo_pago,
      tipo_entrega: pedido.tipo_entrega,
      canal_venta: pedido.canal_venta,
      zona_reparto: pedido.zona_reparto?.nombre || 'N/A',
      repartidor: pedido.repartidor?.nombre || 'N/A',
      subtotal: pedido.subtotal,
      descuentos: pedido.descuento_total,
      costo_envio: pedido.costo_envio,
      igv: pedido.igv,
      total: pedido.total,
      items: pedido.estadisticas.cantidad_items,
      productos_diferentes: pedido.estadisticas.productos_diferentes,
      tiempo_entrega_estimado: pedido.tiempo_entrega_estimado,
      direccion_entrega: pedido.direccion_entrega,
      observaciones: pedido.observaciones,
      codigo_rastreo: pedido.codigo_rastreo,
      fecha_entrega_programada: pedido.fecha_entrega_programada,
      fecha_entrega_real: pedido.fecha_entrega_real,
    }));
  }

  /**
   * Métodos para obtener opciones de filtros
   */
  obtenerEstadosDisponibles(): EstadoPedido[] {
    return [
      'pendiente',
      'aprobado',
      'rechazado',
      'en_proceso',
      'enviado',
      'entregado',
      'cancelado',
      'devuelto',
    ];
  }

  obtenerTiposPagoDisponibles(): TipoPago[] {
    return [
      'contado',
      'credito',
      'transferencia',
      'tarjeta',
      'yape',
      'plin',
      'paypal',
    ];
  }

  obtenerTiposEntregaDisponibles(): TipoEntrega[] {
    return ['delivery', 'recojo_tienda'];
  }

  obtenerCanalesVentaDisponibles(): CanalVenta[] {
    return ['web', 'app', 'tienda_fisica', 'telefono', 'whatsapp'];
  }

  /**
   * Métodos para validaciones de transiciones de estado
   */
  obtenerEstadosPermitidos(estadoActual: EstadoPedido): EstadoPedido[] {
    const transicionesValidas: Record<EstadoPedido, EstadoPedido[]> = {
      pendiente: ['aprobado', 'rechazado', 'cancelado'],
      aprobado: ['en_proceso', 'cancelado'],
      en_proceso: ['enviado', 'cancelado'],
      enviado: ['entregado', 'devuelto'],
      entregado: ['devuelto'],
      rechazado: [],
      cancelado: [],
      devuelto: [],
    };

    return transicionesValidas[estadoActual] || [];
  }

  /**
   * Métodos para generar reportes rápidos
   */
  generarResumenPedido(pedido: Pedido): any {
    return {
      informacion_basica: {
        id: pedido.id,
        numero_pedido: pedido.numero_pedido,
        estado: pedido.estado,
        fecha_creacion: pedido.created_at,
        canal_venta: pedido.canal_venta,
      },
      cliente: {
        nombre: pedido.usuario?.nombre,
        email: pedido.usuario?.email,
        telefono: pedido.usuario?.telefono,
      },
      totales: {
        subtotal: pedido.subtotal,
        descuentos: pedido.descuento_total,
        costo_envio: pedido.costo_envio,
        igv: pedido.igv,
        total: pedido.total,
        moneda: pedido.moneda,
      },
      entrega: {
        tipo: pedido.tipo_entrega,
        direccion: pedido.direccion_entrega,
        zona_reparto: pedido.zona_reparto?.nombre,
        repartidor: pedido.repartidor?.nombre,
        tiempo_estimado: this.formatearTiempoEntrega(
          pedido.tiempo_entrega_estimado
        ),
        fecha_programada: pedido.fecha_entrega_programada,
        fecha_real: pedido.fecha_entrega_real,
      },
      estadisticas: pedido.estadisticas,
    };
  }
}
