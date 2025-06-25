// Estados y configuración para provincias
export const PROVINCIA_ESTADOS = {
  ACTIVA: {
    value: true,
    label: 'Activa',
    color: 'text-green-600 bg-green-100',
  },
  INACTIVA: {
    value: false,
    label: 'Inactiva',
    color: 'text-red-600 bg-red-100',
  },
} as const;

// Configuración de paginación
export const PROVINCIA_PAGINATION = {
  DEFAULT_PAGE_SIZE: 15,
  PAGE_SIZE_OPTIONS: [10, 15, 25, 50, 100],
  MAX_PAGE_SIZE: 100,
} as const;

// Opciones de ordenamiento
export const PROVINCIA_SORT_OPTIONS = [
  { value: 'nombre', label: 'Nombre' },
  { value: 'codigo', label: 'Código' },
  { value: 'codigo_inei', label: 'Código INEI' },
  { value: 'activo', label: 'Estado' },
  { value: 'created_at', label: 'Fecha de Creación' },
  { value: 'updated_at', label: 'Última Actualización' },
] as const;

// Direcciones de ordenamiento
export const SORT_DIRECTIONS = [
  { value: 'asc', label: 'Ascendente' },
  { value: 'desc', label: 'Descendente' },
] as const;

// Validaciones
export const PROVINCIA_VALIDATION = {
  NOMBRE: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
    PATTERN: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
    REQUIRED: true,
  },
  CODIGO: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 10,
    PATTERN: /^[A-Z0-9]+$/,
    REQUIRED: true,
  },
  CODIGO_INEI: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 10,
    PATTERN: /^\d+$/,
    REQUIRED: false,
  },
  DEPARTAMENTO_ID: {
    REQUIRED: true,
    MIN_VALUE: 1,
  },
} as const;

// Mensajes de error
export const PROVINCIA_ERROR_MESSAGES = {
  // Errores de validación de campos
  NOMBRE_REQUERIDO: 'El nombre de la provincia es requerido',
  NOMBRE_MIN_LENGTH: `El nombre debe tener al menos ${PROVINCIA_VALIDATION.NOMBRE.MIN_LENGTH} caracteres`,
  NOMBRE_MAX_LENGTH: `El nombre no puede exceder ${PROVINCIA_VALIDATION.NOMBRE.MAX_LENGTH} caracteres`,
  NOMBRE_PATTERN: 'El nombre solo puede contener letras y espacios',

  CODIGO_REQUERIDO: 'El código de la provincia es requerido',
  CODIGO_MIN_LENGTH: `El código debe tener al menos ${PROVINCIA_VALIDATION.CODIGO.MIN_LENGTH} caracteres`,
  CODIGO_MAX_LENGTH: `El código no puede exceder ${PROVINCIA_VALIDATION.CODIGO.MAX_LENGTH} caracteres`,
  CODIGO_PATTERN: 'El código solo puede contener letras mayúsculas y números',
  CODIGO_UNICO: 'Ya existe una provincia con este código',

  CODIGO_INEI_MIN_LENGTH: `El código INEI debe tener al menos ${PROVINCIA_VALIDATION.CODIGO_INEI.MIN_LENGTH} caracteres`,
  CODIGO_INEI_MAX_LENGTH: `El código INEI no puede exceder ${PROVINCIA_VALIDATION.CODIGO_INEI.MAX_LENGTH} caracteres`,
  CODIGO_INEI_PATTERN: 'El código INEI solo puede contener números',
  CODIGO_INEI_UNICO: 'Ya existe una provincia con este código INEI',

  DEPARTAMENTO_REQUERIDO: 'El departamento es requerido',
  DEPARTAMENTO_NO_EXISTE: 'El departamento seleccionado no existe',
  DEPARTAMENTO_INACTIVO:
    'No se puede crear una provincia en un departamento inactivo',

  // Errores de operaciones
  PROVINCIA_NO_ENCONTRADA: 'Provincia no encontrada',
  ERROR_ELIMINAR_CON_DISTRITOS:
    'No se puede eliminar la provincia porque tiene distritos asociados',
  ERROR_ACTIVAR_DEPARTAMENTO_INACTIVO:
    'No se puede activar la provincia porque el departamento está inactivo',
  ERROR_MOVER_DEPARTAMENTO_INACTIVO:
    'No se puede mover la provincia a un departamento inactivo',

  // Errores de servidor
  ERROR_SERVIDOR: 'Error interno del servidor',
  ERROR_CONEXION: 'Error de conexión con el servidor',
  ERROR_TIMEOUT: 'Tiempo de espera agotado',
  ERROR_PERMISOS: 'No tienes permisos para realizar esta acción',
} as const;

// Mensajes de éxito
export const PROVINCIA_SUCCESS_MESSAGES = {
  CREADA: 'Provincia creada exitosamente',
  ACTUALIZADA: 'Provincia actualizada exitosamente',
  ELIMINADA: 'Provincia eliminada exitosamente',
  ESTADO_CAMBIADO: 'Estado de la provincia cambiado exitosamente',
  DATOS_CARGADOS: 'Datos cargados exitosamente',
  BUSQUEDA_COMPLETADA: 'Búsqueda completada',
} as const;

// Configuración de UI
export const PROVINCIA_UI_CONFIG = {
  COLORS: {
    PRIMARY: 'blue',
    SUCCESS: 'green',
    WARNING: 'yellow',
    DANGER: 'red',
    INFO: 'indigo',
  },
  ICONS: {
    PROVINCIA: 'map-pin',
    ACTIVA: 'check-circle',
    INACTIVA: 'x-circle',
    EDITAR: 'edit',
    ELIMINAR: 'trash',
    VER: 'eye',
    BUSCAR: 'search',
    FILTRAR: 'filter',
    EXPORTAR: 'download',
    AGREGAR: 'plus',
    DEPARTAMENTO: 'building-office',
    DISTRITO: 'map',
  },
  ANIMATIONS: {
    FADE_IN: 'fadeIn',
    SLIDE_IN: 'slideIn',
    BOUNCE: 'bounce',
  },
  TOOLTIPS: {
    ACTIVAR: 'Activar provincia',
    DESACTIVAR: 'Desactivar provincia',
    EDITAR: 'Editar provincia',
    ELIMINAR: 'Eliminar provincia',
    VER_DETALLES: 'Ver detalles',
    VER_DISTRITOS: 'Ver distritos',
    BUSCAR: 'Buscar provincias',
    FILTRAR: 'Filtrar resultados',
    LIMPIAR_FILTROS: 'Limpiar filtros',
    EXPORTAR: 'Exportar datos',
    REFRESCAR: 'Refrescar datos',
  },
} as const;

// Configuración de filtros
export const PROVINCIA_FILTERS_CONFIG = {
  SEARCH: {
    PLACEHOLDER: 'Buscar por nombre, código o departamento...',
    MIN_LENGTH: 2,
    DEBOUNCE_TIME: 300,
  },
  DEPARTAMENTO: {
    PLACEHOLDER: 'Seleccionar departamento',
    ALL_OPTION: { value: '', label: 'Todos los departamentos' },
  },
  ESTADO: {
    PLACEHOLDER: 'Seleccionar estado',
    ALL_OPTION: { value: '', label: 'Todos los estados' },
    OPTIONS: [
      { value: '', label: 'Todos los estados' },
      { value: 'true', label: 'Activas' },
      { value: 'false', label: 'Inactivas' },
    ],
  },
  PAIS: {
    PLACEHOLDER: 'Seleccionar país',
    ALL_OPTION: { value: '', label: 'Todos los países' },
  },
} as const;

// Configuración de exportación
export const PROVINCIA_EXPORT_CONFIG = {
  FORMATS: [
    { value: 'excel', label: 'Excel (.xlsx)', icon: 'document-text' },
    { value: 'csv', label: 'CSV (.csv)', icon: 'document-text' },
    { value: 'pdf', label: 'PDF (.pdf)', icon: 'document' },
  ],
  FILENAME_PREFIX: 'provincias',
  COLUMNS: [
    { key: 'id', label: 'ID' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'codigo', label: 'Código' },
    { key: 'codigo_inei', label: 'Código INEI' },
    { key: 'departamento.nombre', label: 'Departamento' },
    { key: 'activo', label: 'Estado' },
    { key: 'created_at', label: 'Fecha de Creación' },
  ],
} as const;

// Configuración de estadísticas
export const PROVINCIA_STATS_CONFIG = {
  CARDS: [
    {
      key: 'total',
      label: 'Total de Provincias',
      icon: 'map-pin',
      color: 'blue',
    },
    {
      key: 'activas',
      label: 'Provincias Activas',
      icon: 'check-circle',
      color: 'green',
    },
    {
      key: 'inactivas',
      label: 'Provincias Inactivas',
      icon: 'x-circle',
      color: 'red',
    },
    {
      key: 'con_distritos',
      label: 'Con Distritos',
      icon: 'map',
      color: 'indigo',
    },
  ],
  CHARTS: {
    POR_DEPARTAMENTO: {
      type: 'bar',
      title: 'Provincias por Departamento',
    },
    POR_ESTADO: {
      type: 'pie',
      title: 'Distribución por Estado',
    },
  },
} as const;

// Configuración de formularios
export const PROVINCIA_FORM_CONFIG = {
  FIELDS: {
    NOMBRE: {
      type: 'text',
      label: 'Nombre de la Provincia',
      placeholder: 'Ingrese el nombre de la provincia',
      required: true,
      autocomplete: 'off',
    },
    CODIGO: {
      type: 'text',
      label: 'Código',
      placeholder: 'Ej: LIM, CUS, ARE',
      required: true,
      maxlength: 10,
      transform: 'uppercase',
    },
    CODIGO_INEI: {
      type: 'text',
      label: 'Código INEI',
      placeholder: 'Código INEI (opcional)',
      required: false,
      maxlength: 10,
      pattern: '[0-9]*',
    },
    DEPARTAMENTO_ID: {
      type: 'select',
      label: 'Departamento',
      placeholder: 'Seleccione un departamento',
      required: true,
    },
    ACTIVO: {
      type: 'checkbox',
      label: 'Provincia Activa',
      defaultValue: true,
    },
  },
  BUTTONS: {
    GUARDAR: {
      label: 'Guardar',
      color: 'primary',
      icon: 'check',
    },
    CANCELAR: {
      label: 'Cancelar',
      color: 'secondary',
      icon: 'x',
    },
    LIMPIAR: {
      label: 'Limpiar',
      color: 'warning',
      icon: 'refresh',
    },
  },
} as const;

// Configuración de modales
export const PROVINCIA_MODAL_CONFIG = {
  CREATE: {
    title: 'Crear Nueva Provincia',
    size: 'md',
    confirmText: 'Crear Provincia',
    cancelText: 'Cancelar',
  },
  EDIT: {
    title: 'Editar Provincia',
    size: 'md',
    confirmText: 'Guardar Cambios',
    cancelText: 'Cancelar',
  },
  DELETE: {
    title: 'Eliminar Provincia',
    size: 'sm',
    confirmText: 'Eliminar',
    cancelText: 'Cancelar',
    message: '¿Está seguro de que desea eliminar esta provincia?',
    warningMessage: 'Esta acción no se puede deshacer.',
  },
  VIEW: {
    title: 'Detalles de la Provincia',
    size: 'lg',
    confirmText: 'Cerrar',
  },
} as const;

// Configuración de notificaciones
export const PROVINCIA_NOTIFICATION_CONFIG = {
  DURATION: 5000,
  POSITION: 'top-right',
  TYPES: {
    SUCCESS: {
      icon: 'check-circle',
      color: 'green',
    },
    ERROR: {
      icon: 'x-circle',
      color: 'red',
    },
    WARNING: {
      icon: 'exclamation-triangle',
      color: 'yellow',
    },
    INFO: {
      icon: 'information-circle',
      color: 'blue',
    },
  },
} as const;

// Funciones de utilidad para constantes
export const getProvinciaEstadoConfig = (activo: boolean) => {
  return activo ? PROVINCIA_ESTADOS.ACTIVA : PROVINCIA_ESTADOS.INACTIVA;
};

export const getProvinciaEstadoLabel = (activo: boolean): string => {
  return getProvinciaEstadoConfig(activo).label;
};

export const getProvinciaEstadoColor = (activo: boolean): string => {
  return getProvinciaEstadoConfig(activo).color;
};

export const getSortOptionLabel = (value: string): string => {
  const option = PROVINCIA_SORT_OPTIONS.find((opt) => opt.value === value);
  return option ? option.label : value;
};

export const getSortDirectionLabel = (value: string): string => {
  const direction = SORT_DIRECTIONS.find((dir) => dir.value === value);
  return direction ? direction.label : value;
};

export const getValidationMessage = (field: string, error: string): string => {
  const key =
    `${field.toUpperCase()}_${error.toUpperCase()}` as keyof typeof PROVINCIA_ERROR_MESSAGES;
  return PROVINCIA_ERROR_MESSAGES[key] || `Error en el campo ${field}`;
};

export const formatProvinciaForExport = (provincia: any): any => {
  return {
    id: provincia.id,
    nombre: provincia.nombre,
    codigo: provincia.codigo,
    codigo_inei: provincia.codigo_inei || 'N/A',
    departamento: provincia.departamento?.nombre || 'N/A',
    estado: provincia.activo ? 'Activa' : 'Inactiva',
    fecha_creacion: new Date(provincia.created_at).toLocaleDateString('es-ES'),
  };
};

export const getExportFilename = (format: string): string => {
  const timestamp = new Date().toISOString().split('T')[0];
  return `${PROVINCIA_EXPORT_CONFIG.FILENAME_PREFIX}_${timestamp}.${format}`;
};

export const getUIIcon = (key: string): string => {
  return (
    PROVINCIA_UI_CONFIG.ICONS[key as keyof typeof PROVINCIA_UI_CONFIG.ICONS] ||
    'question-mark-circle'
  );
};

export const getUIColor = (key: string): string => {
  return (
    PROVINCIA_UI_CONFIG.COLORS[
      key as keyof typeof PROVINCIA_UI_CONFIG.COLORS
    ] || 'gray'
  );
};

export const getTooltipText = (key: string): string => {
  return (
    PROVINCIA_UI_CONFIG.TOOLTIPS[
      key as keyof typeof PROVINCIA_UI_CONFIG.TOOLTIPS
    ] || ''
  );
};

export const getFilterPlaceholder = (filterType: string): string => {
  switch (filterType) {
    case 'search':
      return PROVINCIA_FILTERS_CONFIG.SEARCH.PLACEHOLDER;
    case 'departamento':
      return PROVINCIA_FILTERS_CONFIG.DEPARTAMENTO.PLACEHOLDER;
    case 'estado':
      return PROVINCIA_FILTERS_CONFIG.ESTADO.PLACEHOLDER;
    case 'pais':
      return PROVINCIA_FILTERS_CONFIG.PAIS.PLACEHOLDER;
    default:
      return 'Seleccionar...';
  }
};

export const getFormFieldConfig = (fieldName: string) => {
  return PROVINCIA_FORM_CONFIG.FIELDS[
    fieldName as keyof typeof PROVINCIA_FORM_CONFIG.FIELDS
  ];
};

export const getModalConfig = (modalType: string) => {
  return PROVINCIA_MODAL_CONFIG[
    modalType as keyof typeof PROVINCIA_MODAL_CONFIG
  ];
};

export const getNotificationConfig = (type: string) => {
  return PROVINCIA_NOTIFICATION_CONFIG.TYPES[
    type as keyof typeof PROVINCIA_NOTIFICATION_CONFIG.TYPES
  ];
};

// Validadores de formato
export const isValidProvinciaName = (name: string): boolean => {
  return (
    PROVINCIA_VALIDATION.NOMBRE.PATTERN.test(name) &&
    name.length >= PROVINCIA_VALIDATION.NOMBRE.MIN_LENGTH &&
    name.length <= PROVINCIA_VALIDATION.NOMBRE.MAX_LENGTH
  );
};

export const isValidProvinciaCodigo = (codigo: string): boolean => {
  return (
    PROVINCIA_VALIDATION.CODIGO.PATTERN.test(codigo) &&
    codigo.length >= PROVINCIA_VALIDATION.CODIGO.MIN_LENGTH &&
    codigo.length <= PROVINCIA_VALIDATION.CODIGO.MAX_LENGTH
  );
};

export const isValidProvinciaCodigoInei = (codigoInei: string): boolean => {
  if (!codigoInei) return true; // Es opcional
  return (
    PROVINCIA_VALIDATION.CODIGO_INEI.PATTERN.test(codigoInei) &&
    codigoInei.length >= PROVINCIA_VALIDATION.CODIGO_INEI.MIN_LENGTH &&
    codigoInei.length <= PROVINCIA_VALIDATION.CODIGO_INEI.MAX_LENGTH
  );
};

// Generadores de código
export const generateProvinciaCode = (nombre: string): string => {
  return nombre
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^A-Z0-9]/g, '') // Solo letras y números
    .substring(0, 3); // Máximo 3 caracteres
};

export const generateProvinciaSlug = (nombre: string): string => {
  return nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^a-z0-9]/g, '-') // Reemplazar caracteres especiales con guiones
    .replace(/-+/g, '-') // Reemplazar múltiples guiones con uno solo
    .replace(/^-|-$/g, ''); // Remover guiones al inicio y final
};

// Funciones de formateo
export const formatProvinciaDisplay = (provincia: any): string => {
  return `${provincia.nombre} (${provincia.codigo})`;
};

export const formatProvinciaFullName = (provincia: any): string => {
  if (provincia.departamento) {
    return `${provincia.nombre}, ${provincia.departamento.nombre}`;
  }
  return provincia.nombre;
};

export const formatCodigoInei = (codigoInei: string | null): string => {
  return codigoInei || 'No asignado';
};

export const formatProvinciaStats = (stats: any): string => {
  if (!stats.total_distritos) return 'Sin distritos';

  const total = stats.total_distritos;
  const activos = stats.distritos_activos || 0;
  const conDelivery = stats.distritos_con_delivery || 0;

  return `${activos}/${total} activos, ${conDelivery} con delivery`;
};
