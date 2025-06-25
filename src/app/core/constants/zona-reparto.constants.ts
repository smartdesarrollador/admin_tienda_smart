/**
 * Constantes para el módulo de Zonas de Reparto
 */

// Estados de zona
export const ZONA_ESTADOS = {
  ACTIVA: 'activa',
  INACTIVA: 'inactiva',
  MANTENIMIENTO: 'mantenimiento',
} as const;

// Colores predefinidos para el mapa
export const COLORES_ZONA_MAPA = [
  { value: '#FF5722', label: 'Rojo', class: 'bg-red-500' },
  { value: '#2196F3', label: 'Azul', class: 'bg-blue-500' },
  { value: '#4CAF50', label: 'Verde', class: 'bg-green-500' },
  { value: '#FF9800', label: 'Naranja', class: 'bg-orange-500' },
  { value: '#9C27B0', label: 'Púrpura', class: 'bg-purple-500' },
  { value: '#607D8B', label: 'Gris Azulado', class: 'bg-slate-500' },
  { value: '#795548', label: 'Marrón', class: 'bg-amber-700' },
  { value: '#E91E63', label: 'Rosa', class: 'bg-pink-500' },
  { value: '#00BCD4', label: 'Cian', class: 'bg-cyan-500' },
  { value: '#8BC34A', label: 'Verde Claro', class: 'bg-lime-500' },
] as const;

// Opciones de ordenamiento
export const ZONA_SORT_OPTIONS = [
  { value: 'nombre', label: 'Nombre' },
  { value: 'orden', label: 'Orden' },
  { value: 'costo_envio', label: 'Costo de Envío' },
  { value: 'tiempo_entrega_min', label: 'Tiempo Mínimo' },
  { value: 'created_at', label: 'Fecha de Creación' },
  { value: 'updated_at', label: 'Última Actualización' },
] as const;

// Direcciones de ordenamiento
export const SORT_DIRECTIONS = [
  { value: 'asc', label: 'Ascendente' },
  { value: 'desc', label: 'Descendente' },
] as const;

// Opciones de paginación
export const PAGINATION_OPTIONS = [
  { value: 10, label: '10 por página' },
  { value: 15, label: '15 por página' },
  { value: 25, label: '25 por página' },
  { value: 50, label: '50 por página' },
  { value: 'all', label: 'Todos' },
] as const;

// Rangos de tiempo de entrega predefinidos
export const TIEMPO_ENTREGA_PRESETS = [
  { min: 15, max: 25, label: 'Express (15-25 min)' },
  { min: 25, max: 45, label: 'Rápido (25-45 min)' },
  { min: 30, max: 60, label: 'Estándar (30-60 min)' },
  { min: 45, max: 90, label: 'Normal (45-90 min)' },
  { min: 60, max: 120, label: 'Extendido (1-2 horas)' },
] as const;

// Rangos de costo de envío predefinidos
export const COSTO_ENVIO_PRESETS = [
  { costo: 0, label: 'Gratis' },
  { costo: 3, label: 'S/ 3.00' },
  { costo: 5, label: 'S/ 5.00' },
  { costo: 7, label: 'S/ 7.00' },
  { costo: 10, label: 'S/ 10.00' },
  { costo: 15, label: 'S/ 15.00' },
] as const;

// Radios de cobertura predefinidos (en km)
export const RADIO_COBERTURA_PRESETS = [
  { value: 1, label: '1 km' },
  { value: 2, label: '2 km' },
  { value: 3, label: '3 km' },
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
  { value: 15, label: '15 km' },
] as const;

// Validaciones
export const ZONA_VALIDATIONS = {
  NOMBRE: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 100,
  },
  DESCRIPCION: {
    MAX_LENGTH: 500,
  },
  COSTO_ENVIO: {
    MIN: 0,
    MAX: 100,
  },
  TIEMPO_ENTREGA: {
    MIN: 5,
    MAX: 480, // 8 horas
  },
  PEDIDO_MINIMO: {
    MIN: 0,
    MAX: 500,
  },
  RADIO_COBERTURA: {
    MIN: 0.5,
    MAX: 50,
  },
  ORDEN: {
    MIN: 1,
    MAX: 999,
  },
} as const;

// Mensajes de error
export const ZONA_ERROR_MESSAGES = {
  NOMBRE_REQUERIDO: 'El nombre de la zona es requerido',
  NOMBRE_MIN_LENGTH: `El nombre debe tener al menos ${ZONA_VALIDATIONS.NOMBRE.MIN_LENGTH} caracteres`,
  NOMBRE_MAX_LENGTH: `El nombre no puede exceder ${ZONA_VALIDATIONS.NOMBRE.MAX_LENGTH} caracteres`,
  COSTO_ENVIO_REQUERIDO: 'El costo de envío es requerido',
  COSTO_ENVIO_MIN: `El costo de envío debe ser mayor o igual a ${ZONA_VALIDATIONS.COSTO_ENVIO.MIN}`,
  COSTO_ENVIO_MAX: `El costo de envío no puede exceder ${ZONA_VALIDATIONS.COSTO_ENVIO.MAX}`,
  TIEMPO_ENTREGA_REQUERIDO: 'Los tiempos de entrega son requeridos',
  TIEMPO_ENTREGA_MIN: `El tiempo mínimo debe ser al menos ${ZONA_VALIDATIONS.TIEMPO_ENTREGA.MIN} minutos`,
  TIEMPO_ENTREGA_MAX: `El tiempo máximo no puede exceder ${ZONA_VALIDATIONS.TIEMPO_ENTREGA.MAX} minutos`,
  TIEMPO_ENTREGA_LOGICO: 'El tiempo máximo debe ser mayor al tiempo mínimo',
  COORDENADAS_INVALIDAS: 'Las coordenadas del centro no son válidas',
  RADIO_COBERTURA_MIN: `El radio de cobertura debe ser al menos ${ZONA_VALIDATIONS.RADIO_COBERTURA.MIN} km`,
  RADIO_COBERTURA_MAX: `El radio de cobertura no puede exceder ${ZONA_VALIDATIONS.RADIO_COBERTURA.MAX} km`,
  DISTRITOS_REQUERIDOS: 'Debe seleccionar al menos un distrito',
  ZONA_NO_ENCONTRADA: 'Zona de reparto no encontrada',
  ERROR_ELIMINAR_CON_PEDIDOS:
    'No se puede eliminar una zona con pedidos asociados',
} as const;

// Mensajes de éxito
export const ZONA_SUCCESS_MESSAGES = {
  CREADA: 'Zona de reparto creada exitosamente',
  ACTUALIZADA: 'Zona de reparto actualizada exitosamente',
  ELIMINADA: 'Zona de reparto eliminada exitosamente',
  ESTADO_CAMBIADO: 'Estado de la zona cambiado exitosamente',
  DISTRITOS_ASIGNADOS: 'Distritos asignados exitosamente',
} as const;

// Configuración de mapas
export const MAPA_CONFIG = {
  ZOOM_DEFAULT: 12,
  ZOOM_MIN: 8,
  ZOOM_MAX: 18,
  CENTRO_LIMA: {
    lat: -12.0464,
    lng: -77.0428,
  },
  ESTILO_POLIGONO: {
    fillColor: '#2196F3',
    fillOpacity: 0.3,
    strokeColor: '#1976D2',
    strokeWeight: 2,
  },
  ESTILO_CIRCULO: {
    fillColor: '#4CAF50',
    fillOpacity: 0.2,
    strokeColor: '#388E3C',
    strokeWeight: 2,
  },
} as const;

// Iconos para diferentes estados
export const ZONA_ICONS = {
  ACTIVA: 'check-circle',
  INACTIVA: 'x-circle',
  DISPONIBLE_24H: 'clock',
  CON_RESTRICCIONES: 'exclamation-triangle',
  MAPA: 'map',
  ESTADISTICAS: 'chart-bar',
  CONFIGURACION: 'cog',
  EDITAR: 'pencil',
  ELIMINAR: 'trash',
} as const;

// Tipos de datos para TypeScript
export type ZonaEstado = (typeof ZONA_ESTADOS)[keyof typeof ZONA_ESTADOS];
export type ColorZonaMapa = (typeof COLORES_ZONA_MAPA)[number]['value'];
export type ZonaSortOption = (typeof ZONA_SORT_OPTIONS)[number]['value'];
export type SortDirection = (typeof SORT_DIRECTIONS)[number]['value'];
export type PaginationOption = (typeof PAGINATION_OPTIONS)[number]['value'];
export type ZonaIcon = (typeof ZONA_ICONS)[keyof typeof ZONA_ICONS];

// Funciones de utilidad
export const getColorZonaClass = (color: string): string => {
  const colorConfig = COLORES_ZONA_MAPA.find((c) => c.value === color);
  return colorConfig?.class || 'bg-gray-500';
};

export const getColorZonaLabel = (color: string): string => {
  const colorConfig = COLORES_ZONA_MAPA.find((c) => c.value === color);
  return colorConfig?.label || 'Color personalizado';
};

export const formatTiempoEntrega = (min: number, max: number): string => {
  if (min === max) {
    return `${min} min`;
  }
  return `${min} - ${max} min`;
};

export const formatCostoEnvio = (costo: number): string => {
  if (costo === 0) {
    return 'Gratis';
  }
  return `S/ ${costo.toFixed(2)}`;
};

export const isZonaActiva = (zona: { activo: boolean }): boolean => {
  return zona.activo;
};

export const isZona24h = (zona: { disponible_24h: boolean }): boolean => {
  return zona.disponible_24h;
};

export const getEstadoZonaText = (zona: {
  activo: boolean;
  disponible_24h: boolean;
}): string => {
  if (!zona.activo) return 'Inactiva';
  if (zona.disponible_24h) return 'Activa 24h';
  return 'Activa';
};

export const getEstadoZonaColor = (zona: {
  activo: boolean;
  disponible_24h: boolean;
}): string => {
  if (!zona.activo) return 'text-red-600 bg-red-100';
  if (zona.disponible_24h) return 'text-green-600 bg-green-100';
  return 'text-blue-600 bg-blue-100';
};
