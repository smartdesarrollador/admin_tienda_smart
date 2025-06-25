import { DireccionValidadaFilters } from '../models/direccion-validada.interface';

// Estados de validación
export const ESTADOS_VALIDACION_DIRECCION = {
  NO_VALIDADA: 'no_validada',
  VALIDADA_COBERTURA: 'validada_cobertura',
  VALIDADA_SIN_COBERTURA: 'validada_sin_cobertura',
} as const;

// Colores para estados de validación
export const COLORES_ESTADO_VALIDACION = {
  [ESTADOS_VALIDACION_DIRECCION.NO_VALIDADA]: {
    text: 'text-gray-600',
    bg: 'bg-gray-100',
    border: 'border-gray-300',
    icon: 'text-gray-500',
  },
  [ESTADOS_VALIDACION_DIRECCION.VALIDADA_COBERTURA]: {
    text: 'text-green-600',
    bg: 'bg-green-100',
    border: 'border-green-300',
    icon: 'text-green-500',
  },
  [ESTADOS_VALIDACION_DIRECCION.VALIDADA_SIN_COBERTURA]: {
    text: 'text-red-600',
    bg: 'bg-red-100',
    border: 'border-red-300',
    icon: 'text-red-500',
  },
} as const;

// Iconos para estados de validación
export const ICONOS_ESTADO_VALIDACION = {
  [ESTADOS_VALIDACION_DIRECCION.NO_VALIDADA]: 'clock',
  [ESTADOS_VALIDACION_DIRECCION.VALIDADA_COBERTURA]: 'check-circle',
  [ESTADOS_VALIDACION_DIRECCION.VALIDADA_SIN_COBERTURA]: 'x-circle',
} as const;

// Mensajes de estado
export const MENSAJES_ESTADO_VALIDACION = {
  [ESTADOS_VALIDACION_DIRECCION.NO_VALIDADA]: 'Dirección no validada',
  [ESTADOS_VALIDACION_DIRECCION.VALIDADA_COBERTURA]:
    'Dirección validada y en cobertura',
  [ESTADOS_VALIDACION_DIRECCION.VALIDADA_SIN_COBERTURA]:
    'Dirección validada pero fuera de cobertura',
} as const;

// Configuración de filtros predeterminados
export const FILTROS_PREDETERMINADOS: DireccionValidadaFilters = {
  per_page: 15,
  sort_by: 'fecha_ultima_validacion',
  sort_direction: 'desc',
  with_direccion: true,
  with_zona: true,
};

// Opciones de paginación
export const OPCIONES_PAGINACION = [
  { value: 10, label: '10 por página' },
  { value: 15, label: '15 por página' },
  { value: 25, label: '25 por página' },
  { value: 50, label: '50 por página' },
  { value: 100, label: '100 por página' },
  { value: 'all', label: 'Todos' },
];

// Opciones de ordenamiento
export const OPCIONES_ORDENAMIENTO = [
  { value: 'fecha_ultima_validacion', label: 'Fecha de validación' },
  { value: 'distancia_tienda_km', label: 'Distancia' },
  { value: 'costo_envio_calculado', label: 'Costo de envío' },
  { value: 'en_zona_cobertura', label: 'Estado de cobertura' },
  { value: 'zona_reparto', label: 'Zona de reparto' },
  { value: 'created_at', label: 'Fecha de creación' },
];

// Filtros rápidos
export const FILTROS_RAPIDOS = [
  {
    key: 'todas',
    label: 'Todas las direcciones',
    filters: {},
    icon: 'list',
    color: 'text-gray-600',
  },
  {
    key: 'en_cobertura',
    label: 'En cobertura',
    filters: { en_zona_cobertura: true },
    icon: 'check-circle',
    color: 'text-green-600',
  },
  {
    key: 'fuera_cobertura',
    label: 'Fuera de cobertura',
    filters: { en_zona_cobertura: false },
    icon: 'x-circle',
    color: 'text-red-600',
  },
  {
    key: 'sin_coordenadas',
    label: 'Sin coordenadas',
    filters: { search: 'sin_coordenadas' },
    icon: 'map-pin',
    color: 'text-yellow-600',
  },
  {
    key: 'validadas_hoy',
    label: 'Validadas hoy',
    filters: {
      fecha_desde: new Date().toISOString().split('T')[0],
      fecha_hasta: new Date().toISOString().split('T')[0],
    },
    icon: 'calendar',
    color: 'text-blue-600',
  },
];

// Configuración de exportación
export const CONFIGURACION_EXPORTACION = {
  formatos: [
    { value: 'excel', label: 'Excel (.xlsx)', icon: 'file-spreadsheet' },
    { value: 'csv', label: 'CSV (.csv)', icon: 'file-text' },
    { value: 'pdf', label: 'PDF (.pdf)', icon: 'file-pdf' },
  ],
  campos: [
    { key: 'id', label: 'ID', incluido: true },
    { key: 'direccion_id', label: 'ID Dirección', incluido: true },
    { key: 'direccion_completa', label: 'Dirección', incluido: true },
    { key: 'zona_reparto', label: 'Zona de Reparto', incluido: true },
    { key: 'en_zona_cobertura', label: 'En Cobertura', incluido: true },
    { key: 'distancia_tienda_km', label: 'Distancia (km)', incluido: true },
    { key: 'costo_envio_calculado', label: 'Costo Envío', incluido: true },
    { key: 'tiempo_entrega_estimado', label: 'Tiempo Entrega', incluido: true },
    { key: 'coordenadas', label: 'Coordenadas', incluido: false },
    {
      key: 'fecha_ultima_validacion',
      label: 'Fecha Validación',
      incluido: true,
    },
    {
      key: 'observaciones_validacion',
      label: 'Observaciones',
      incluido: false,
    },
  ],
};

// Configuración de modales
export const CONFIGURACION_MODALES = {
  validar: {
    titulo: 'Validar Dirección',
    descripcion: 'Validar la dirección y asignar zona de reparto',
    ancho: 'max-w-2xl',
  },
  revalidar: {
    titulo: 'Revalidar Direcciones',
    descripcion: 'Revalidar direcciones seleccionadas',
    ancho: 'max-w-lg',
  },
  eliminar: {
    titulo: 'Eliminar Dirección Validada',
    descripcion: '¿Está seguro de que desea eliminar esta dirección validada?',
    ancho: 'max-w-md',
  },
  estadisticas: {
    titulo: 'Estadísticas de Validación',
    descripcion: 'Resumen de estadísticas de direcciones validadas',
    ancho: 'max-w-4xl',
  },
};

// Mensajes del sistema
export const MENSAJES_SISTEMA = {
  exito: {
    validacion: 'Dirección validada exitosamente',
    revalidacion: 'Direcciones revalidadas exitosamente',
    eliminacion: 'Dirección validada eliminada exitosamente',
    actualizacion: 'Dirección validada actualizada exitosamente',
  },
  error: {
    validacion: 'Error al validar la dirección',
    revalidacion: 'Error al revalidar las direcciones',
    eliminacion: 'Error al eliminar la dirección validada',
    actualizacion: 'Error al actualizar la dirección validada',
    carga: 'Error al cargar las direcciones validadas',
    coordenadas: 'Coordenadas inválidas o fuera de rango',
    sin_zona: 'No se encontró zona de reparto para esta ubicación',
  },
  confirmacion: {
    eliminacion: '¿Está seguro de que desea eliminar esta dirección validada?',
    revalidacion: '¿Desea revalidar las direcciones seleccionadas?',
    limpiar_filtros: '¿Desea limpiar todos los filtros aplicados?',
  },
  informacion: {
    sin_resultados: 'No se encontraron direcciones validadas',
    cargando: 'Cargando direcciones validadas...',
    validando: 'Validando dirección...',
    revalidando: 'Revalidando direcciones...',
    sin_coordenadas: 'Esta dirección no tiene coordenadas asignadas',
    fuera_cobertura: 'Esta dirección está fuera de la zona de cobertura',
  },
};

// Configuración de estadísticas
export const CONFIGURACION_ESTADISTICAS = {
  metricas: [
    {
      key: 'total_direcciones_validadas',
      label: 'Total Validadas',
      icon: 'check-circle',
      color: 'text-blue-600',
      formato: 'numero',
    },
    {
      key: 'en_cobertura',
      label: 'En Cobertura',
      icon: 'shield-check',
      color: 'text-green-600',
      formato: 'numero',
    },
    {
      key: 'fuera_cobertura',
      label: 'Fuera Cobertura',
      icon: 'shield-x',
      color: 'text-red-600',
      formato: 'numero',
    },
    {
      key: 'validadas_hoy',
      label: 'Validadas Hoy',
      icon: 'calendar',
      color: 'text-purple-600',
      formato: 'numero',
    },
    {
      key: 'costo_promedio_envio',
      label: 'Costo Promedio',
      icon: 'currency-dollar',
      color: 'text-yellow-600',
      formato: 'moneda',
    },
    {
      key: 'distancia_promedio',
      label: 'Distancia Promedio',
      icon: 'map-pin',
      color: 'text-indigo-600',
      formato: 'distancia',
    },
  ],
};

// Configuración de mapas
export const CONFIGURACION_MAPAS = {
  centro_default: {
    lat: -12.0464,
    lng: -77.0428,
  },
  zoom_default: 11,
  marcadores: {
    validada_cobertura: {
      color: '#10B981',
      icon: 'check-circle',
    },
    validada_sin_cobertura: {
      color: '#EF4444',
      icon: 'x-circle',
    },
    no_validada: {
      color: '#6B7280',
      icon: 'clock',
    },
  },
};

// Utilidades de validación
export const VALIDACIONES = {
  coordenadas: {
    latitud: {
      min: -90,
      max: 90,
      mensaje: 'La latitud debe estar entre -90 y 90 grados',
    },
    longitud: {
      min: -180,
      max: 180,
      mensaje: 'La longitud debe estar entre -180 y 180 grados',
    },
  },
  distancia: {
    max: 1000,
    mensaje: 'La distancia no puede ser mayor a 1000 km',
  },
  costo_envio: {
    min: 0,
    max: 1000,
    mensaje: 'El costo de envío debe estar entre 0 y 1000',
  },
  tiempo_entrega: {
    min: 0,
    max: 1440,
    mensaje: 'El tiempo de entrega debe estar entre 0 y 1440 minutos',
  },
};

// Configuración de notificaciones
export const CONFIGURACION_NOTIFICACIONES = {
  duracion: 5000,
  posicion: 'top-right',
  tipos: {
    exito: {
      color: 'green',
      icon: 'check-circle',
    },
    error: {
      color: 'red',
      icon: 'x-circle',
    },
    advertencia: {
      color: 'yellow',
      icon: 'exclamation-triangle',
    },
    informacion: {
      color: 'blue',
      icon: 'information-circle',
    },
  },
};
