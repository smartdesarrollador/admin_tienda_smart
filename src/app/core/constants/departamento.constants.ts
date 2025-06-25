import {
  DepartamentoSortOption,
  PaisDisponible,
  SortDirection,
} from '../models/departamento.interface';

/**
 * Constantes para el módulo de Departamentos
 */

// Estados de departamento
export const DEPARTAMENTO_ESTADOS = {
  ACTIVO: {
    value: true,
    label: 'Activo',
    color: 'text-green-600 bg-green-100',
  },
  INACTIVO: {
    value: false,
    label: 'Inactivo',
    color: 'text-red-600 bg-red-100',
  },
} as const;

// Opciones de ordenamiento
export const DEPARTAMENTO_SORT_OPTIONS = [
  { value: 'nombre', label: 'Nombre' },
  { value: 'codigo', label: 'Código' },
  { value: 'codigo_inei', label: 'Código INEI' },
  { value: 'pais', label: 'País' },
  { value: 'activo', label: 'Estado' },
  { value: 'created_at', label: 'Fecha de Creación' },
  { value: 'updated_at', label: 'Última Actualización' },
] as const;

// Direcciones de ordenamiento
export const SORT_DIRECTIONS = [
  { value: 'asc', label: 'Ascendente' },
  { value: 'desc', label: 'Descendente' },
] as const;

// Países disponibles (expandible según necesidades)
export const PAISES_DISPONIBLES = [
  { value: 'Perú', label: 'Perú', codigo: 'PE' },
  { value: 'Colombia', label: 'Colombia', codigo: 'CO' },
  { value: 'Ecuador', label: 'Ecuador', codigo: 'EC' },
  { value: 'Bolivia', label: 'Bolivia', codigo: 'BO' },
  { value: 'Chile', label: 'Chile', codigo: 'CL' },
  { value: 'Argentina', label: 'Argentina', codigo: 'AR' },
  { value: 'Brasil', label: 'Brasil', codigo: 'BR' },
  { value: 'Uruguay', label: 'Uruguay', codigo: 'UY' },
  { value: 'Paraguay', label: 'Paraguay', codigo: 'PY' },
  { value: 'Venezuela', label: 'Venezuela', codigo: 'VE' },
] as const;

// Configuración de paginación
export const DEPARTAMENTO_PAGINATION = {
  DEFAULT_PAGE_SIZE: 15,
  PAGE_SIZE_OPTIONS: [10, 15, 25, 50, 100],
  MAX_PAGE_SIZE: 100,
} as const;

// Configuración de filtros
export const DEPARTAMENTO_FILTERS_CONFIG = {
  SEARCH_MIN_LENGTH: 2,
  SEARCH_DEBOUNCE_TIME: 300,
  DEFAULT_SORT_BY: 'nombre' as DepartamentoSortOption,
  DEFAULT_SORT_DIRECTION: 'asc' as SortDirection,
} as const;

// Validaciones
export const DEPARTAMENTO_VALIDATION = {
  NOMBRE: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
    PATTERN: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
  },
  CODIGO: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 10,
    PATTERN: /^[A-Z0-9]+$/,
  },
  CODIGO_INEI: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 10,
    PATTERN: /^\d{2,10}$/,
  },
  PAIS: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
    PATTERN: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
  },
} as const;

// Mensajes de error
export const DEPARTAMENTO_ERROR_MESSAGES = {
  // Errores de validación
  NOMBRE_REQUERIDO: 'El nombre del departamento es requerido',
  NOMBRE_MIN_LENGTH: `El nombre debe tener al menos ${DEPARTAMENTO_VALIDATION.NOMBRE.MIN_LENGTH} caracteres`,
  NOMBRE_MAX_LENGTH: `El nombre no puede exceder ${DEPARTAMENTO_VALIDATION.NOMBRE.MAX_LENGTH} caracteres`,
  NOMBRE_PATTERN: 'El nombre solo puede contener letras y espacios',

  CODIGO_REQUERIDO: 'El código del departamento es requerido',
  CODIGO_MIN_LENGTH: `El código debe tener al menos ${DEPARTAMENTO_VALIDATION.CODIGO.MIN_LENGTH} caracteres`,
  CODIGO_MAX_LENGTH: `El código no puede exceder ${DEPARTAMENTO_VALIDATION.CODIGO.MAX_LENGTH} caracteres`,
  CODIGO_PATTERN: 'El código solo puede contener letras mayúsculas y números',
  CODIGO_UNICO: 'Ya existe un departamento con este código',

  CODIGO_INEI_MAX_LENGTH: `El código INEI no puede exceder ${DEPARTAMENTO_VALIDATION.CODIGO_INEI.MAX_LENGTH} caracteres`,
  CODIGO_INEI_PATTERN: 'El código INEI debe ser numérico',
  CODIGO_INEI_UNICO: 'Ya existe un departamento con este código INEI',

  PAIS_REQUERIDO: 'El país es requerido',
  PAIS_MIN_LENGTH: `El país debe tener al menos ${DEPARTAMENTO_VALIDATION.PAIS.MIN_LENGTH} caracteres`,
  PAIS_MAX_LENGTH: `El país no puede exceder ${DEPARTAMENTO_VALIDATION.PAIS.MAX_LENGTH} caracteres`,
  PAIS_PATTERN: 'El país solo puede contener letras y espacios',

  // Errores de operación
  DEPARTAMENTO_NO_ENCONTRADO: 'Departamento no encontrado',
  ERROR_ELIMINAR_CON_PROVINCIAS:
    'No se puede eliminar el departamento porque tiene provincias asociadas',
  ERROR_SERVIDOR: 'Error interno del servidor',
  ERROR_CONEXION: 'Error de conexión con el servidor',
  ERROR_PERMISOS: 'No tiene permisos para realizar esta operación',

  // Errores de carga
  ERROR_CARGAR_DEPARTAMENTOS: 'Error al cargar los departamentos',
  ERROR_CARGAR_ESTADISTICAS: 'Error al cargar las estadísticas',
  ERROR_CARGAR_PAISES: 'Error al cargar la lista de países',
} as const;

// Mensajes de éxito
export const DEPARTAMENTO_SUCCESS_MESSAGES = {
  CREADO: 'Departamento creado exitosamente',
  ACTUALIZADO: 'Departamento actualizado exitosamente',
  ELIMINADO: 'Departamento eliminado exitosamente',
  ESTADO_CAMBIADO: 'Estado del departamento cambiado exitosamente',
  DATOS_CARGADOS: 'Datos cargados exitosamente',
  FILTROS_APLICADOS: 'Filtros aplicados correctamente',
} as const;

// Configuración de colores para estados
export const DEPARTAMENTO_COLORS = {
  ACTIVO: {
    text: 'text-green-600',
    bg: 'bg-green-100',
    border: 'border-green-200',
    hover: 'hover:bg-green-200',
  },
  INACTIVO: {
    text: 'text-red-600',
    bg: 'bg-red-100',
    border: 'border-red-200',
    hover: 'hover:bg-red-200',
  },
  NEUTRAL: {
    text: 'text-gray-600',
    bg: 'bg-gray-100',
    border: 'border-gray-200',
    hover: 'hover:bg-gray-200',
  },
} as const;

// Configuración de iconos
export const DEPARTAMENTO_ICONS = {
  DEPARTAMENTO: 'map-pin',
  ACTIVO: 'check-circle',
  INACTIVO: 'x-circle',
  EDITAR: 'edit',
  ELIMINAR: 'trash-2',
  VER: 'eye',
  BUSCAR: 'search',
  FILTRAR: 'filter',
  ORDENAR: 'arrow-up-down',
  EXPORTAR: 'download',
  AGREGAR: 'plus',
  REFRESCAR: 'refresh-cw',
  CONFIGURAR: 'settings',
  ESTADISTICAS: 'bar-chart-3',
  MAPA: 'map',
  UBICACION: 'map-pin',
} as const;

// Configuración de animaciones
export const DEPARTAMENTO_ANIMATIONS = {
  FADE_IN: 'animate-fade-in',
  SLIDE_IN: 'animate-slide-in',
  BOUNCE: 'animate-bounce',
  PULSE: 'animate-pulse',
  SPIN: 'animate-spin',
} as const;

// Configuración de tooltips
export const DEPARTAMENTO_TOOLTIPS = {
  ACTIVAR: 'Activar departamento',
  DESACTIVAR: 'Desactivar departamento',
  EDITAR: 'Editar departamento',
  ELIMINAR: 'Eliminar departamento',
  VER_DETALLES: 'Ver detalles del departamento',
  VER_PROVINCIAS: 'Ver provincias del departamento',
  EXPORTAR_DATOS: 'Exportar datos del departamento',
  REFRESCAR_LISTA: 'Refrescar lista de departamentos',
  LIMPIAR_FILTROS: 'Limpiar todos los filtros',
  APLICAR_FILTROS: 'Aplicar filtros de búsqueda',
} as const;

// Configuración de breadcrumbs
export const DEPARTAMENTO_BREADCRUMBS = {
  HOME: { label: 'Inicio', route: '/' },
  DEPARTAMENTOS: { label: 'Departamentos', route: '/departamentos' },
  CREAR: { label: 'Crear Departamento', route: '/departamentos/crear' },
  EDITAR: { label: 'Editar Departamento', route: '/departamentos/editar' },
  VER: { label: 'Ver Departamento', route: '/departamentos/ver' },
} as const;

// Configuración de exportación
export const DEPARTAMENTO_EXPORT_CONFIG = {
  FORMATOS: ['excel', 'csv', 'pdf'],
  CAMPOS_EXPORTABLES: [
    'id',
    'nombre',
    'codigo',
    'codigo_inei',
    'pais',
    'activo',
    'created_at',
    'updated_at',
  ],
  NOMBRE_ARCHIVO_DEFAULT: 'departamentos',
} as const;

// Funciones de utilidad
export const getDepartamentoStatusConfig = (activo: boolean) => {
  return activo ? DEPARTAMENTO_ESTADOS.ACTIVO : DEPARTAMENTO_ESTADOS.INACTIVO;
};

export const getDepartamentoColorConfig = (activo: boolean) => {
  return activo ? DEPARTAMENTO_COLORS.ACTIVO : DEPARTAMENTO_COLORS.INACTIVO;
};

export const formatDepartamentoCode = (codigo: string): string => {
  return codigo.toUpperCase().trim();
};

export const formatDepartamentoName = (nombre: string): string => {
  return nombre.trim().replace(/\s+/g, ' ');
};

export const isValidDepartamentoCode = (codigo: string): boolean => {
  return DEPARTAMENTO_VALIDATION.CODIGO.PATTERN.test(codigo.toUpperCase());
};

export const isValidDepartamentoName = (nombre: string): boolean => {
  return DEPARTAMENTO_VALIDATION.NOMBRE.PATTERN.test(nombre);
};

export const isValidCodigoInei = (codigoInei: string): boolean => {
  return DEPARTAMENTO_VALIDATION.CODIGO_INEI.PATTERN.test(codigoInei);
};

export const generateDepartamentoSlug = (nombre: string): string => {
  return nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^a-z0-9\s]/g, '') // Solo letras, números y espacios
    .replace(/\s+/g, '-') // Reemplazar espacios con guiones
    .trim();
};

export const getPaisInfo = (paisNombre: string) => {
  return PAISES_DISPONIBLES.find((pais) => pais.value === paisNombre);
};

export const getSortOptionLabel = (sortBy: string): string => {
  const option = DEPARTAMENTO_SORT_OPTIONS.find((opt) => opt.value === sortBy);
  return option?.label || sortBy;
};

export const getDefaultFilters = () => ({
  search: '',
  activo: undefined,
  pais: '',
  codigo: '',
  codigo_inei: '',
  with_provincias: false,
  with_distritos: false,
  sort_by: DEPARTAMENTO_FILTERS_CONFIG.DEFAULT_SORT_BY,
  sort_direction: DEPARTAMENTO_FILTERS_CONFIG.DEFAULT_SORT_DIRECTION,
  per_page: DEPARTAMENTO_PAGINATION.DEFAULT_PAGE_SIZE,
  page: 1,
  paginate: true,
});

// Tipos derivados de las constantes
export type DepartamentoEstado =
  (typeof DEPARTAMENTO_ESTADOS)[keyof typeof DEPARTAMENTO_ESTADOS];
export type DepartamentoColor =
  (typeof DEPARTAMENTO_COLORS)[keyof typeof DEPARTAMENTO_COLORS];
export type DepartamentoIcon =
  (typeof DEPARTAMENTO_ICONS)[keyof typeof DEPARTAMENTO_ICONS];
export type PaisInfo = (typeof PAISES_DISPONIBLES)[number];
