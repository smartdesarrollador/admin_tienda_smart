/**
 * Constantes para el sistema de gestión de direcciones
 * Incluye configuraciones UI, validaciones, mensajes y utilidades
 */

import { DireccionFilters } from '../models/direccion.interface';

// ===== CONFIGURACIÓN UI =====

/**
 * Estados de direcciones con iconos y colores
 */
export const DIRECCION_ESTADOS = {
  VALIDADA: {
    value: true,
    label: 'Validada',
    icon: 'check-circle',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-200',
    tooltip: 'Dirección verificada y validada',
  },
  NO_VALIDADA: {
    value: false,
    label: 'No Validada',
    icon: 'exclamation-circle',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-200',
    tooltip: 'Dirección pendiente de validación',
  },
} as const;

/**
 * Estados de direcciones predeterminadas
 */
export const DIRECCION_PREDETERMINADA_ESTADOS = {
  PREDETERMINADA: {
    value: true,
    label: 'Predeterminada',
    icon: 'star',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-200',
    tooltip: 'Dirección principal del usuario',
  },
  SECUNDARIA: {
    value: false,
    label: 'Secundaria',
    icon: 'star-outline',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-200',
    tooltip: 'Dirección adicional del usuario',
  },
} as const;

/**
 * Estados de delivery
 */
export const DIRECCION_DELIVERY_ESTADOS = {
  DISPONIBLE: {
    value: true,
    label: 'Delivery Disponible',
    icon: 'truck',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-200',
    tooltip: 'Zona con servicio de delivery',
  },
  NO_DISPONIBLE: {
    value: false,
    label: 'Sin Delivery',
    icon: 'truck-off',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-200',
    tooltip: 'Zona sin servicio de delivery',
  },
} as const;

/**
 * Estados de coordenadas
 */
export const DIRECCION_COORDENADAS_ESTADOS = {
  CON_COORDENADAS: {
    value: true,
    label: 'Geolocalizada',
    icon: 'map-pin',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-200',
    tooltip: 'Dirección con coordenadas GPS',
  },
  SIN_COORDENADAS: {
    value: false,
    label: 'Sin Coordenadas',
    icon: 'map-pin-off',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-200',
    tooltip: 'Dirección sin coordenadas GPS',
  },
} as const;

// ===== VALIDACIONES =====

/**
 * Reglas de validación para campos de dirección
 */
export const DIRECCION_VALIDATION_RULES = {
  DIRECCION: {
    MIN_LENGTH: 5,
    MAX_LENGTH: 255,
    REQUIRED: true,
    PATTERN: /^[a-zA-ZÀ-ÿ0-9\s\.\,\-\#\/]+$/,
    DESCRIPTION: 'Dirección principal (calle, avenida, jirón, etc.)',
  },
  REFERENCIA: {
    MAX_LENGTH: 255,
    REQUIRED: false,
    PATTERN: /^[a-zA-ZÀ-ÿ0-9\s\.\,\-\#\/\(\)]+$/,
    DESCRIPTION: 'Punto de referencia para ubicar la dirección',
  },
  CODIGO_POSTAL: {
    MAX_LENGTH: 10,
    REQUIRED: false,
    PATTERN: /^[0-9]{5}$/,
    DESCRIPTION: 'Código postal de 5 dígitos',
  },
  NUMERO_EXTERIOR: {
    MAX_LENGTH: 10,
    REQUIRED: false,
    PATTERN: /^[0-9A-Za-z\-\/]+$/,
    DESCRIPTION: 'Número exterior del inmueble',
  },
  NUMERO_INTERIOR: {
    MAX_LENGTH: 10,
    REQUIRED: false,
    PATTERN: /^[0-9A-Za-z\-\/]+$/,
    DESCRIPTION: 'Número interior, departamento o piso',
  },
  URBANIZACION: {
    MAX_LENGTH: 100,
    REQUIRED: false,
    PATTERN: /^[a-zA-ZÀ-ÿ0-9\s\.\,\-]+$/,
    DESCRIPTION: 'Urbanización, conjunto residencial o similar',
  },
  ETAPA: {
    MAX_LENGTH: 50,
    REQUIRED: false,
    PATTERN: /^[a-zA-ZÀ-ÿ0-9\s\-]+$/,
    DESCRIPTION: 'Etapa de la urbanización',
  },
  MANZANA: {
    MAX_LENGTH: 10,
    REQUIRED: false,
    PATTERN: /^[0-9A-Za-z\-]+$/,
    DESCRIPTION: 'Manzana del lote',
  },
  LOTE: {
    MAX_LENGTH: 10,
    REQUIRED: false,
    PATTERN: /^[0-9A-Za-z\-]+$/,
    DESCRIPTION: 'Número de lote',
  },
  ALIAS: {
    MAX_LENGTH: 50,
    REQUIRED: false,
    PATTERN: /^[a-zA-ZÀ-ÿ0-9\s\-]+$/,
    DESCRIPTION: 'Nombre descriptivo para la dirección',
  },
  INSTRUCCIONES_ENTREGA: {
    MAX_LENGTH: 500,
    REQUIRED: false,
    PATTERN: /^[a-zA-ZÀ-ÿ0-9\s\.\,\-\#\/\(\)\:\;]+$/,
    DESCRIPTION: 'Instrucciones especiales para la entrega',
  },
  LATITUD: {
    MIN: -90,
    MAX: 90,
    REQUIRED: false,
    DESCRIPTION: 'Coordenada de latitud GPS',
  },
  LONGITUD: {
    MIN: -180,
    MAX: 180,
    REQUIRED: false,
    DESCRIPTION: 'Coordenada de longitud GPS',
  },
} as const;

// ===== MENSAJES =====

/**
 * Mensajes de error específicos
 */
export const DIRECCION_ERROR_MESSAGES = {
  // Errores de validación
  DIRECCION_REQUERIDA: 'La dirección es requerida',
  DIRECCION_MIN_LENGTH: `La dirección debe tener al menos ${DIRECCION_VALIDATION_RULES.DIRECCION.MIN_LENGTH} caracteres`,
  DIRECCION_MAX_LENGTH: `La dirección no puede exceder ${DIRECCION_VALIDATION_RULES.DIRECCION.MAX_LENGTH} caracteres`,
  DIRECCION_PATTERN: 'La dirección contiene caracteres no válidos',

  DISTRITO_REQUERIDO: 'El distrito es requerido',
  DISTRITO_NO_EXISTE: 'El distrito seleccionado no existe',
  DISTRITO_INACTIVO: 'El distrito seleccionado no está disponible',

  COORDENADAS_INVALIDAS: 'Las coordenadas proporcionadas no son válidas',
  COORDENADAS_COMPLETAS:
    'Debe proporcionar tanto latitud como longitud, o ninguna de las dos',
  LATITUD_RANGO: `La latitud debe estar entre ${DIRECCION_VALIDATION_RULES.LATITUD.MIN} y ${DIRECCION_VALIDATION_RULES.LATITUD.MAX}`,
  LONGITUD_RANGO: `La longitud debe estar entre ${DIRECCION_VALIDATION_RULES.LONGITUD.MIN} y ${DIRECCION_VALIDATION_RULES.LONGITUD.MAX}`,

  USUARIO_REQUERIDO: 'El usuario es requerido',

  // Errores de operaciones
  DIRECCION_NO_ENCONTRADA: 'Dirección no encontrada',
  ERROR_ELIMINAR_UNICA: 'No se puede eliminar la única dirección del usuario',
  ERROR_DESMARCAR_UNICA_PREDETERMINADA:
    'No se puede desmarcar la única dirección predeterminada',
  ERROR_CREAR: 'Error al crear la dirección',
  ERROR_ACTUALIZAR: 'Error al actualizar la dirección',
  ERROR_ELIMINAR: 'Error al eliminar la dirección',
  ERROR_VALIDAR: 'Error al validar la dirección',
  ERROR_COORDENADAS: 'Error al actualizar las coordenadas',

  // Errores de red
  ERROR_CONEXION: 'Error de conexión. Verifique su conexión a internet',
  ERROR_SERVIDOR: 'Error interno del servidor. Intente nuevamente más tarde',
  ERROR_PERMISOS: 'No tiene permisos para realizar esta operación',

  // Errores de validación de campos
  REFERENCIA_MAX_LENGTH: `La referencia no puede exceder ${DIRECCION_VALIDATION_RULES.REFERENCIA.MAX_LENGTH} caracteres`,
  CODIGO_POSTAL_PATTERN: 'El código postal debe tener 5 dígitos',
  ALIAS_MAX_LENGTH: `El alias no puede exceder ${DIRECCION_VALIDATION_RULES.ALIAS.MAX_LENGTH} caracteres`,
  INSTRUCCIONES_MAX_LENGTH: `Las instrucciones no pueden exceder ${DIRECCION_VALIDATION_RULES.INSTRUCCIONES_ENTREGA.MAX_LENGTH} caracteres`,
} as const;

/**
 * Mensajes de éxito
 */
export const DIRECCION_SUCCESS_MESSAGES = {
  CREADA: 'Dirección creada exitosamente',
  ACTUALIZADA: 'Dirección actualizada exitosamente',
  ELIMINADA: 'Dirección eliminada exitosamente',
  PREDETERMINADA_ESTABLECIDA:
    'Dirección marcada como predeterminada exitosamente',
  VALIDADA: 'Dirección validada exitosamente',
  COORDENADAS_ACTUALIZADAS: 'Coordenadas actualizadas exitosamente',
  DATOS_CARGADOS: 'Datos cargados exitosamente',
  BUSQUEDA_COMPLETADA: 'Búsqueda completada exitosamente',
  FILTROS_APLICADOS: 'Filtros aplicados exitosamente',
} as const;

/**
 * Mensajes informativos
 */
export const DIRECCION_INFO_MESSAGES = {
  CARGANDO: 'Cargando direcciones...',
  BUSCANDO: 'Buscando direcciones...',
  VALIDANDO: 'Validando dirección...',
  GUARDANDO: 'Guardando dirección...',
  ELIMINANDO: 'Eliminando dirección...',
  ACTUALIZANDO_COORDENADAS: 'Actualizando coordenadas...',
  SIN_RESULTADOS: 'No se encontraron direcciones',
  SIN_DIRECCIONES: 'El usuario no tiene direcciones registradas',
  PRIMERA_DIRECCION: 'Esta será la dirección predeterminada del usuario',
} as const;

// ===== CONFIGURACIÓN UI =====

/**
 * Configuración de modales
 */
export const DIRECCION_MODAL_CONFIG = {
  CREATE: {
    title: 'Nueva Dirección',
    confirmText: 'Crear Dirección',
    cancelText: 'Cancelar',
    size: 'lg',
    icon: 'plus',
  },
  EDIT: {
    title: 'Editar Dirección',
    confirmText: 'Actualizar Dirección',
    cancelText: 'Cancelar',
    size: 'lg',
    icon: 'edit',
  },
  DELETE: {
    title: 'Eliminar Dirección',
    message: '¿Está seguro de que desea eliminar esta dirección?',
    confirmText: 'Eliminar',
    cancelText: 'Cancelar',
    size: 'sm',
    icon: 'trash',
    type: 'danger',
  },
  VALIDATE: {
    title: 'Validar Dirección',
    message: '¿Está seguro de que desea validar esta dirección?',
    confirmText: 'Validar',
    cancelText: 'Cancelar',
    size: 'sm',
    icon: 'check',
    type: 'success',
  },
  SET_DEFAULT: {
    title: 'Establecer como Predeterminada',
    message: '¿Desea establecer esta dirección como predeterminada?',
    confirmText: 'Establecer',
    cancelText: 'Cancelar',
    size: 'sm',
    icon: 'star',
    type: 'info',
  },
} as const;

/**
 * Configuración de formularios
 */
export const DIRECCION_FORM_CONFIG = {
  STEPS: [
    {
      id: 'basic',
      title: 'Información Básica',
      description: 'Datos principales de la dirección',
      icon: 'home',
      fields: ['direccion', 'distrito_id', 'referencia'],
    },
    {
      id: 'details',
      title: 'Detalles Adicionales',
      description: 'Información complementaria',
      icon: 'info',
      fields: [
        'numero_exterior',
        'numero_interior',
        'urbanizacion',
        'codigo_postal',
      ],
    },
    {
      id: 'location',
      title: 'Ubicación Específica',
      description: 'Datos de ubicación detallada',
      icon: 'map',
      fields: ['etapa', 'manzana', 'lote', 'latitud', 'longitud'],
    },
    {
      id: 'preferences',
      title: 'Preferencias',
      description: 'Configuración y preferencias',
      icon: 'settings',
      fields: ['alias', 'instrucciones_entrega', 'predeterminada'],
    },
  ],
  FIELD_GROUPS: {
    BASIC: ['direccion', 'distrito_id', 'referencia'],
    NUMBERING: ['numero_exterior', 'numero_interior'],
    LOCATION: ['urbanizacion', 'etapa', 'manzana', 'lote'],
    COORDINATES: ['latitud', 'longitud'],
    POSTAL: ['codigo_postal'],
    PREFERENCES: [
      'alias',
      'instrucciones_entrega',
      'predeterminada',
      'validada',
    ],
  },
} as const;

/**
 * Configuración de exportación
 */
export const DIRECCION_EXPORT_CONFIG = {
  FORMATS: [
    { value: 'excel', label: 'Excel (.xlsx)', icon: 'file-excel' },
    { value: 'csv', label: 'CSV (.csv)', icon: 'file-csv' },
    { value: 'pdf', label: 'PDF (.pdf)', icon: 'file-pdf' },
  ],
  COLUMNS: [
    { key: 'id', label: 'ID', width: 60 },
    { key: 'direccion', label: 'Dirección', width: 200 },
    { key: 'distrito', label: 'Distrito', width: 120 },
    { key: 'provincia', label: 'Provincia', width: 120 },
    { key: 'departamento', label: 'Departamento', width: 120 },
    { key: 'usuario', label: 'Usuario', width: 150 },
    { key: 'predeterminada', label: 'Predeterminada', width: 100 },
    { key: 'validada', label: 'Validada', width: 80 },
    { key: 'tiene_coordenadas', label: 'Coordenadas', width: 100 },
    { key: 'delivery_disponible', label: 'Delivery', width: 80 },
    { key: 'created_at', label: 'Fecha Creación', width: 120 },
  ],
} as const;

/**
 * Configuración de estadísticas
 */
export const DIRECCION_STATS_CONFIG = {
  CARDS: [
    {
      key: 'total_direcciones',
      title: 'Total Direcciones',
      icon: 'home',
      color: 'blue',
      format: 'number',
    },
    {
      key: 'direcciones_validadas',
      title: 'Direcciones Validadas',
      icon: 'check-circle',
      color: 'green',
      format: 'number',
    },
    {
      key: 'direcciones_con_coordenadas',
      title: 'Con Coordenadas',
      icon: 'map-pin',
      color: 'purple',
      format: 'number',
    },
    {
      key: 'direcciones_delivery_disponible',
      title: 'Delivery Disponible',
      icon: 'truck',
      color: 'orange',
      format: 'number',
    },
    {
      key: 'usuarios_con_direcciones',
      title: 'Usuarios con Direcciones',
      icon: 'users',
      color: 'indigo',
      format: 'number',
    },
    {
      key: 'promedio_direcciones_por_usuario',
      title: 'Promedio por Usuario',
      icon: 'trending-up',
      color: 'teal',
      format: 'decimal',
    },
  ],
  CHARTS: [
    {
      key: 'distribucion_geografica',
      title: 'Distribución Geográfica',
      type: 'pie',
      dataKey: 'por_departamento',
    },
    {
      key: 'tendencia_mensual',
      title: 'Tendencia Mensual',
      type: 'line',
      dataKey: 'tendencia_mensual',
    },
    {
      key: 'top_distritos',
      title: 'Top Distritos',
      type: 'bar',
      dataKey: 'top_distritos',
    },
  ],
} as const;

/**
 * Configuración de mapa
 */
export const DIRECCION_MAP_CONFIG = {
  DEFAULT_CENTER: {
    lat: -12.0464,
    lng: -77.0428,
  },
  DEFAULT_ZOOM: 13,
  MARKER_COLORS: {
    VALIDADA: '#10B981',
    NO_VALIDADA: '#F59E0B',
    PREDETERMINADA: '#3B82F6',
    DELIVERY_DISPONIBLE: '#8B5CF6',
    SIN_COORDENADAS: '#6B7280',
  },
  SEARCH_RADIUS: {
    MIN: 0.1,
    MAX: 50,
    DEFAULT: 5,
    STEP: 0.5,
  },
} as const;

/**
 * Configuración de búsqueda
 */
export const DIRECCION_SEARCH_CONFIG = {
  PLACEHOLDER: 'Buscar por dirección, distrito, usuario...',
  MIN_CHARS: 2,
  DEBOUNCE_TIME: 300,
  MAX_RESULTS: 50,
  HIGHLIGHT_CLASS: 'bg-yellow-200',
  FIELDS: [
    'direccion',
    'referencia',
    'distrito',
    'provincia',
    'departamento',
    'usuario.nombre',
    'alias',
    'codigo_postal',
  ],
} as const;

/**
 * Configuración de paginación
 */
export const DIRECCION_PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 15,
  PAGE_SIZE_OPTIONS: [10, 15, 25, 50, 100],
  MAX_PAGE_SIZE: 100,
  SHOW_SIZE_CHANGER: true,
  SHOW_QUICK_JUMPER: true,
  SHOW_TOTAL: true,
} as const;

// ===== FILTROS PREDEFINIDOS =====

/**
 * Filtros predefinidos comunes
 */
export const DIRECCION_PRESET_FILTERS: Record<
  string,
  Partial<DireccionFilters>
> = {
  ALL: {
    per_page: DIRECCION_PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
  },
  VALIDATED: {
    validada: true,
    per_page: DIRECCION_PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
  },
  NOT_VALIDATED: {
    validada: false,
    per_page: DIRECCION_PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
  },
  WITH_COORDINATES: {
    con_coordenadas: true,
    per_page: DIRECCION_PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
  },
  WITHOUT_COORDINATES: {
    con_coordenadas: false,
    per_page: DIRECCION_PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
  },
  DELIVERY_AVAILABLE: {
    delivery_disponible: true,
    per_page: DIRECCION_PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
  },
  NO_DELIVERY: {
    delivery_disponible: false,
    per_page: DIRECCION_PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
  },
  DEFAULT_ADDRESSES: {
    predeterminada: true,
    per_page: DIRECCION_PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
  },
  WITH_ALIAS: {
    con_alias: true,
    per_page: DIRECCION_PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
  },
  WITH_INSTRUCTIONS: {
    con_instrucciones: true,
    per_page: DIRECCION_PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
  },
} as const;

// ===== OPCIONES DE ORDENAMIENTO =====

/**
 * Opciones de ordenamiento disponibles
 */
export const DIRECCION_SORT_OPTIONS = [
  { value: 'created_at', label: 'Fecha de Creación', direction: 'desc' },
  { value: 'updated_at', label: 'Última Modificación', direction: 'desc' },
  { value: 'direccion', label: 'Dirección (A-Z)', direction: 'asc' },
  { value: 'distrito', label: 'Distrito (A-Z)', direction: 'asc' },
  { value: 'provincia', label: 'Provincia (A-Z)', direction: 'asc' },
  { value: 'departamento', label: 'Departamento (A-Z)', direction: 'asc' },
  {
    value: 'predeterminada',
    label: 'Predeterminadas Primero',
    direction: 'desc',
  },
  { value: 'validada', label: 'Validadas Primero', direction: 'desc' },
  { value: 'alias', label: 'Alias (A-Z)', direction: 'asc' },
] as const;

export type DireccionSortOption =
  (typeof DIRECCION_SORT_OPTIONS)[number]['value'];

// ===== UTILIDADES =====

/**
 * Obtiene el texto del estado de validación
 */
export const getDireccionValidationStatusText = (validada: boolean): string => {
  return validada
    ? DIRECCION_ESTADOS.VALIDADA.label
    : DIRECCION_ESTADOS.NO_VALIDADA.label;
};

/**
 * Obtiene el color del estado de validación
 */
export const getDireccionValidationStatusColor = (
  validada: boolean
): string => {
  return validada
    ? DIRECCION_ESTADOS.VALIDADA.color
    : DIRECCION_ESTADOS.NO_VALIDADA.color;
};

/**
 * Obtiene el texto del estado predeterminado
 */
export const getDireccionDefaultStatusText = (
  predeterminada: boolean
): string => {
  return predeterminada
    ? DIRECCION_PREDETERMINADA_ESTADOS.PREDETERMINADA.label
    : DIRECCION_PREDETERMINADA_ESTADOS.SECUNDARIA.label;
};

/**
 * Obtiene el color del estado predeterminado
 */
export const getDireccionDefaultStatusColor = (
  predeterminada: boolean
): string => {
  return predeterminada
    ? DIRECCION_PREDETERMINADA_ESTADOS.PREDETERMINADA.color
    : DIRECCION_PREDETERMINADA_ESTADOS.SECUNDARIA.color;
};

/**
 * Obtiene el texto del estado de delivery
 */
export const getDireccionDeliveryStatusText = (
  deliveryDisponible: boolean
): string => {
  return deliveryDisponible
    ? DIRECCION_DELIVERY_ESTADOS.DISPONIBLE.label
    : DIRECCION_DELIVERY_ESTADOS.NO_DISPONIBLE.label;
};

/**
 * Obtiene el color del estado de delivery
 */
export const getDireccionDeliveryStatusColor = (
  deliveryDisponible: boolean
): string => {
  return deliveryDisponible
    ? DIRECCION_DELIVERY_ESTADOS.DISPONIBLE.color
    : DIRECCION_DELIVERY_ESTADOS.NO_DISPONIBLE.color;
};

/**
 * Obtiene el texto del estado de coordenadas
 */
export const getDireccionCoordinatesStatusText = (
  tieneCoordenadas: boolean
): string => {
  return tieneCoordenadas
    ? DIRECCION_COORDENADAS_ESTADOS.CON_COORDENADAS.label
    : DIRECCION_COORDENADAS_ESTADOS.SIN_COORDENADAS.label;
};

/**
 * Obtiene el color del estado de coordenadas
 */
export const getDireccionCoordinatesStatusColor = (
  tieneCoordenadas: boolean
): string => {
  return tieneCoordenadas
    ? DIRECCION_COORDENADAS_ESTADOS.CON_COORDENADAS.color
    : DIRECCION_COORDENADAS_ESTADOS.SIN_COORDENADAS.color;
};

/**
 * Formatea una dirección para mostrar
 */
export const formatDireccionDisplay = (
  direccion: string,
  numeroExterior?: string | null
): string => {
  const parts = [direccion];
  if (numeroExterior) {
    parts.push(numeroExterior);
  }
  return parts.join(' ');
};

/**
 * Formatea coordenadas para mostrar
 */
export const formatCoordinatesDisplay = (lat: number, lng: number): string => {
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
};

/**
 * Valida si una dirección puede ser eliminada
 */
export const canDeleteDireccion = (
  direccion: any,
  totalDirecciones: number
): boolean => {
  return totalDirecciones > 1;
};

/**
 * Valida si una dirección puede ser desmarcada como predeterminada
 */
export const canUnsetAsDefault = (
  direccion: any,
  totalDireccionesPredeterminadas: number
): boolean => {
  return !direccion.predeterminada || totalDireccionesPredeterminadas > 1;
};

/**
 * Obtiene el icono apropiado para una dirección
 */
export const getDireccionIcon = (direccion: any): string => {
  if (direccion.predeterminada) return 'star';
  if (direccion.validada) return 'check-circle';
  if (direccion.tiene_coordenadas) return 'map-pin';
  return 'home';
};

/**
 * Obtiene el color del icono para una dirección
 */
export const getDireccionIconColor = (direccion: any): string => {
  if (direccion.predeterminada) return 'text-blue-600';
  if (direccion.validada) return 'text-green-600';
  if (direccion.tiene_coordenadas) return 'text-purple-600';
  return 'text-gray-600';
};
