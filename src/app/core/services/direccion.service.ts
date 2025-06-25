import { Injectable, inject, signal, computed } from '@angular/core';
import {
  HttpClient,
  HttpParams,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, tap, catchError, finalize } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import {
  Direccion,
  CreateDireccionDto,
  UpdateDireccionDto,
  DireccionFilters,
  DireccionResponse,
  DireccionSingleResponse,
  DireccionesByUsuarioResponse,
  EstadisticasDirecciones,
  DireccionOperationResponse,
  DireccionValidation,
  BuscarPorProximidadRequest,
  BuscarPorProximidadResponse,
  DireccionesPorDistritoResponse,
  ActualizarCoordenadasRequest,
  DIRECCION_VALIDATION,
  DIRECCION_ERROR_MESSAGES,
} from '../models/direccion.interface';

/**
 * Servicio para gestión de direcciones de usuarios
 * Implementa todas las operaciones CRUD y funcionalidades especiales del DireccionController
 */
@Injectable({
  providedIn: 'root',
})
export class DireccionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/admin/direcciones`;

  // Signals para estado reactivo
  private readonly _direcciones = signal<Direccion[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);
  private readonly _totalItems = signal<number>(0);
  private readonly _selectedDireccion = signal<Direccion | null>(null);

  // Computed signals para datos derivados
  readonly direcciones = this._direcciones.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly totalItems = this._totalItems.asReadonly();
  readonly selectedDireccion = this._selectedDireccion.asReadonly();
  readonly isEmpty = computed(() => this._direcciones().length === 0);
  readonly hasError = computed(() => this._error() !== null);
  readonly direccionesValidadas = computed(() =>
    this._direcciones().filter((d) => d.validada)
  );
  readonly direccionesConCoordenadas = computed(() =>
    this._direcciones().filter((d) => d.tiene_coordenadas)
  );
  readonly direccionesDeliveryDisponible = computed(() =>
    this._direcciones().filter((d) => d.validaciones?.direccion_valida_delivery)
  );

  // BehaviorSubject para filtros actuales
  private readonly _currentFilters = new BehaviorSubject<DireccionFilters>({});
  readonly currentFilters$ = this._currentFilters.asObservable();

  /**
   * Obtiene todas las direcciones con filtros y paginación
   */
  getDirecciones(
    filters: DireccionFilters = {}
  ): Observable<DireccionResponse> {
    this._loading.set(true);
    this._error.set(null);

    const params = this.buildHttpParams(filters);

    return this.http.get<DireccionResponse>(this.apiUrl, { params }).pipe(
      tap((response) => {
        if (response.success) {
          this._direcciones.set(response.data);
          this._totalItems.set(response.meta.total);
          this._currentFilters.next(filters);
        }
      }),
      catchError((error) => this.handleError(error)),
      finalize(() => this._loading.set(false))
    );
  }

  /**
   * Obtiene una dirección específica por ID
   */
  getDireccion(
    id: number,
    withDireccionValidada = false
  ): Observable<DireccionSingleResponse> {
    this._loading.set(true);
    this._error.set(null);

    let params = new HttpParams();
    if (withDireccionValidada) {
      params = params.set('with_direccion_validada', 'true');
    }

    return this.http
      .get<DireccionSingleResponse>(`${this.apiUrl}/${id}`, { params })
      .pipe(
        tap((response) => {
          if (response.success) {
            this._selectedDireccion.set(response.data);
          }
        }),
        catchError((error) => this.handleError(error)),
        finalize(() => this._loading.set(false))
      );
  }

  /**
   * Crea una nueva dirección
   */
  createDireccion(
    direccionData: CreateDireccionDto
  ): Observable<DireccionOperationResponse> {
    this._loading.set(true);
    this._error.set(null);

    return this.http
      .post<DireccionOperationResponse>(this.apiUrl, direccionData)
      .pipe(
        tap((response) => {
          if (response.success && response.data) {
            // Agregar la nueva dirección al estado local
            const currentDirecciones = this._direcciones();
            this._direcciones.set([response.data, ...currentDirecciones]);
            this._totalItems.update((total) => total + 1);
          }
        }),
        catchError((error) => this.handleError(error)),
        finalize(() => this._loading.set(false))
      );
  }

  /**
   * Actualiza una dirección existente
   */
  updateDireccion(
    id: number,
    direccionData: UpdateDireccionDto
  ): Observable<DireccionOperationResponse> {
    this._loading.set(true);
    this._error.set(null);

    return this.http
      .put<DireccionOperationResponse>(`${this.apiUrl}/${id}`, direccionData)
      .pipe(
        tap((response) => {
          if (response.success && response.data) {
            // Actualizar la dirección en el estado local
            const currentDirecciones = this._direcciones();
            const updatedDirecciones = currentDirecciones.map((direccion) =>
              direccion.id === id ? response.data! : direccion
            );
            this._direcciones.set(updatedDirecciones);

            // Actualizar dirección seleccionada si es la misma
            if (this._selectedDireccion()?.id === id) {
              this._selectedDireccion.set(response.data);
            }
          }
        }),
        catchError((error) => this.handleError(error)),
        finalize(() => this._loading.set(false))
      );
  }

  /**
   * Elimina una dirección
   */
  deleteDireccion(id: number): Observable<DireccionOperationResponse> {
    this._loading.set(true);
    this._error.set(null);

    return this.http
      .delete<DireccionOperationResponse>(`${this.apiUrl}/${id}`)
      .pipe(
        tap((response) => {
          if (response.success) {
            // Remover la dirección del estado local
            const currentDirecciones = this._direcciones();
            const filteredDirecciones = currentDirecciones.filter(
              (direccion) => direccion.id !== id
            );
            this._direcciones.set(filteredDirecciones);
            this._totalItems.update((total) => total - 1);

            // Limpiar dirección seleccionada si es la misma
            if (this._selectedDireccion()?.id === id) {
              this._selectedDireccion.set(null);
            }
          }
        }),
        catchError((error) => this.handleError(error)),
        finalize(() => this._loading.set(false))
      );
  }

  /**
   * Obtiene direcciones por usuario específico
   */
  getDireccionesByUsuario(
    userId: number,
    filters: Partial<DireccionFilters> = {}
  ): Observable<DireccionesByUsuarioResponse> {
    this._loading.set(true);
    this._error.set(null);

    const params = this.buildHttpParams(filters);

    return this.http
      .get<DireccionesByUsuarioResponse>(`${this.apiUrl}/usuario/${userId}`, {
        params,
      })
      .pipe(
        catchError((error) => this.handleError(error)),
        finalize(() => this._loading.set(false))
      );
  }

  /**
   * Marca una dirección como predeterminada
   */
  setPredeterminada(id: number): Observable<DireccionOperationResponse> {
    this._loading.set(true);
    this._error.set(null);

    return this.http
      .post<DireccionOperationResponse>(
        `${this.apiUrl}/${id}/set-predeterminada`,
        {}
      )
      .pipe(
        tap((response) => {
          if (response.success && response.data) {
            // Actualizar el estado local
            const currentDirecciones = this._direcciones();
            const updatedDirecciones = currentDirecciones.map((direccion) => {
              if (direccion.id === id) {
                return { ...response.data!, predeterminada: true };
              } else if (direccion.user_id === response.data!.user_id) {
                return { ...direccion, predeterminada: false };
              }
              return direccion;
            });
            this._direcciones.set(updatedDirecciones);
          }
        }),
        catchError((error) => this.handleError(error)),
        finalize(() => this._loading.set(false))
      );
  }

  /**
   * Valida una dirección manualmente
   */
  validarDireccion(id: number): Observable<DireccionOperationResponse> {
    this._loading.set(true);
    this._error.set(null);

    return this.http
      .post<DireccionOperationResponse>(`${this.apiUrl}/${id}/validar`, {})
      .pipe(
        tap((response) => {
          if (response.success && response.data) {
            // Actualizar la dirección en el estado local
            const currentDirecciones = this._direcciones();
            const updatedDirecciones = currentDirecciones.map((direccion) =>
              direccion.id === id ? response.data! : direccion
            );
            this._direcciones.set(updatedDirecciones);
          }
        }),
        catchError((error) => this.handleError(error)),
        finalize(() => this._loading.set(false))
      );
  }

  /**
   * Actualiza las coordenadas de una dirección
   */
  actualizarCoordenadas(
    id: number,
    coordenadas: ActualizarCoordenadasRequest
  ): Observable<DireccionOperationResponse> {
    this._loading.set(true);
    this._error.set(null);

    return this.http
      .post<DireccionOperationResponse>(
        `${this.apiUrl}/${id}/actualizar-coordenadas`,
        coordenadas
      )
      .pipe(
        tap((response) => {
          if (response.success && response.data) {
            // Actualizar la dirección en el estado local
            const currentDirecciones = this._direcciones();
            const updatedDirecciones = currentDirecciones.map((direccion) =>
              direccion.id === id ? response.data! : direccion
            );
            this._direcciones.set(updatedDirecciones);
          }
        }),
        catchError((error) => this.handleError(error)),
        finalize(() => this._loading.set(false))
      );
  }

  /**
   * Busca direcciones por proximidad geográfica
   */
  buscarPorProximidad(
    request: BuscarPorProximidadRequest
  ): Observable<BuscarPorProximidadResponse> {
    this._loading.set(true);
    this._error.set(null);

    return this.http
      .post<BuscarPorProximidadResponse>(
        `${this.apiUrl}/buscar-proximidad`,
        request
      )
      .pipe(
        catchError((error) => this.handleError(error)),
        finalize(() => this._loading.set(false))
      );
  }

  /**
   * Obtiene direcciones por distrito
   */
  getDireccionesPorDistrito(
    distritoId: number,
    filters: Partial<DireccionFilters> = {}
  ): Observable<DireccionesPorDistritoResponse> {
    this._loading.set(true);
    this._error.set(null);

    const params = this.buildHttpParams(filters);

    return this.http
      .get<DireccionesPorDistritoResponse>(
        `${this.apiUrl}/distrito/${distritoId}`,
        { params }
      )
      .pipe(
        catchError((error) => this.handleError(error)),
        finalize(() => this._loading.set(false))
      );
  }

  /**
   * Obtiene estadísticas del sistema de direcciones
   */
  getEstadisticas(
    fechaDesde?: string,
    fechaHasta?: string
  ): Observable<EstadisticasDirecciones> {
    this._loading.set(true);
    this._error.set(null);

    let params = new HttpParams();
    if (fechaDesde) {
      params = params.set('fecha_desde', fechaDesde);
    }
    if (fechaHasta) {
      params = params.set('fecha_hasta', fechaHasta);
    }

    return this.http
      .get<EstadisticasDirecciones>(`${this.apiUrl}/statistics`, { params })
      .pipe(
        catchError((error) => this.handleError(error)),
        finalize(() => this._loading.set(false))
      );
  }

  /**
   * Valida los datos de una dirección antes de enviarlos
   */
  validateDireccion(
    direccionData: Partial<CreateDireccionDto>
  ): DireccionValidation {
    const errors: string[] = [];
    let direccionValid = true;
    let distritoIdValid = true;

    // Validar dirección
    if (
      !direccionData.direccion ||
      direccionData.direccion.trim().length === 0
    ) {
      errors.push(DIRECCION_ERROR_MESSAGES.DIRECCION_REQUERIDA);
      direccionValid = false;
    } else if (
      direccionData.direccion.length < DIRECCION_VALIDATION.DIRECCION.MIN_LENGTH
    ) {
      errors.push(DIRECCION_ERROR_MESSAGES.DIRECCION_MIN_LENGTH);
      direccionValid = false;
    } else if (
      direccionData.direccion.length > DIRECCION_VALIDATION.DIRECCION.MAX_LENGTH
    ) {
      errors.push(DIRECCION_ERROR_MESSAGES.DIRECCION_MAX_LENGTH);
      direccionValid = false;
    }

    // Validar distrito_id
    if (!direccionData.distrito_id) {
      errors.push(DIRECCION_ERROR_MESSAGES.DISTRITO_REQUERIDO);
      distritoIdValid = false;
    }

    // Validar coordenadas si se proporcionan
    if (
      direccionData.latitud !== undefined ||
      direccionData.longitud !== undefined
    ) {
      if (
        (direccionData.latitud !== undefined &&
          direccionData.longitud === undefined) ||
        (direccionData.latitud === undefined &&
          direccionData.longitud !== undefined)
      ) {
        errors.push(DIRECCION_ERROR_MESSAGES.COORDENADAS_COMPLETAS);
      } else if (
        direccionData.latitud !== undefined &&
        direccionData.longitud !== undefined
      ) {
        if (
          direccionData.latitud < DIRECCION_VALIDATION.LATITUD.MIN ||
          direccionData.latitud > DIRECCION_VALIDATION.LATITUD.MAX ||
          direccionData.longitud < DIRECCION_VALIDATION.LONGITUD.MIN ||
          direccionData.longitud > DIRECCION_VALIDATION.LONGITUD.MAX
        ) {
          errors.push(DIRECCION_ERROR_MESSAGES.COORDENADAS_INVALIDAS);
        }
      }
    }

    // Validar longitudes de campos opcionales
    if (
      direccionData.referencia &&
      direccionData.referencia.length >
        DIRECCION_VALIDATION.REFERENCIA.MAX_LENGTH
    ) {
      errors.push(
        `La referencia no puede exceder ${DIRECCION_VALIDATION.REFERENCIA.MAX_LENGTH} caracteres`
      );
    }

    if (
      direccionData.alias &&
      direccionData.alias.length > DIRECCION_VALIDATION.ALIAS.MAX_LENGTH
    ) {
      errors.push(
        `El alias no puede exceder ${DIRECCION_VALIDATION.ALIAS.MAX_LENGTH} caracteres`
      );
    }

    if (
      direccionData.instrucciones_entrega &&
      direccionData.instrucciones_entrega.length >
        DIRECCION_VALIDATION.INSTRUCCIONES_ENTREGA.MAX_LENGTH
    ) {
      errors.push(
        `Las instrucciones de entrega no pueden exceder ${DIRECCION_VALIDATION.INSTRUCCIONES_ENTREGA.MAX_LENGTH} caracteres`
      );
    }

    return {
      direccion: direccionValid,
      distrito_id: distritoIdValid,
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Busca direcciones con término de búsqueda
   */
  searchDirecciones(
    searchTerm: string,
    filters: Partial<DireccionFilters> = {}
  ): Observable<DireccionResponse> {
    const searchFilters: DireccionFilters = {
      ...filters,
      search: searchTerm,
    };

    return this.getDirecciones(searchFilters);
  }

  /**
   * Obtiene direcciones predeterminadas agrupadas por departamento
   */
  getDireccionesPredeterminadasByDepartamento(): Observable<
    Record<string, number>
  > {
    return this.getDirecciones({ predeterminada: true }).pipe(
      map((response) => {
        const grouped: Record<string, number> = {};
        response.data.forEach((direccion) => {
          const departamento = direccion.departamento || 'Sin departamento';
          grouped[departamento] = (grouped[departamento] || 0) + 1;
        });
        return grouped;
      })
    );
  }

  /**
   * Obtiene direcciones con delivery disponible
   */
  getDireccionesDeliveryDisponible(
    filters: Partial<DireccionFilters> = {}
  ): Observable<DireccionResponse> {
    return this.getDirecciones({
      ...filters,
      delivery_disponible: true,
    });
  }

  /**
   * Obtiene direcciones validadas
   */
  getDireccionesValidadas(
    filters: Partial<DireccionFilters> = {}
  ): Observable<DireccionResponse> {
    return this.getDirecciones({
      ...filters,
      validada: true,
    });
  }

  /**
   * Obtiene direcciones con coordenadas
   */
  getDireccionesConCoordenadas(
    filters: Partial<DireccionFilters> = {}
  ): Observable<DireccionResponse> {
    return this.getDirecciones({
      ...filters,
      con_coordenadas: true,
    });
  }

  /**
   * Refresca los datos actuales
   */
  refresh(): void {
    const currentFilters = this._currentFilters.value;
    this.getDirecciones(currentFilters).subscribe();
  }

  /**
   * Limpia el estado del servicio
   */
  clearState(): void {
    this._direcciones.set([]);
    this._selectedDireccion.set(null);
    this._totalItems.set(0);
    this._error.set(null);
    this._currentFilters.next({});
  }

  /**
   * Obtiene una dirección del estado local por ID
   */
  getDireccionFromState(id: number): Direccion | undefined {
    return this._direcciones().find((direccion) => direccion.id === id);
  }

  /**
   * Verifica si una dirección existe en el estado local
   */
  existsInState(id: number): boolean {
    return this._direcciones().some((direccion) => direccion.id === id);
  }

  /**
   * Obtiene direcciones filtradas del estado local
   */
  getFilteredDireccionesFromState(
    predicate: (direccion: Direccion) => boolean
  ): Direccion[] {
    return this._direcciones().filter(predicate);
  }

  /**
   * Establece la dirección seleccionada
   */
  setSelectedDireccion(direccion: Direccion | null): void {
    this._selectedDireccion.set(direccion);
  }

  /**
   * Construye HttpParams a partir de filtros
   */
  private buildHttpParams(filters: Record<string, any>): HttpParams {
    let params = new HttpParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (typeof value === 'boolean') {
          params = params.set(key, value ? '1' : '0');
        } else {
          params = params.set(key, value.toString());
        }
      }
    });

    return params;
  }

  /**
   * Maneja errores HTTP
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ha ocurrido un error inesperado';

    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    this._error.set(errorMessage);
    console.error('Error en DireccionService:', error);

    return throwError(() => new Error(errorMessage));
  }
}
