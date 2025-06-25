// Estados y configuración para UI
export const DISTRITO_ESTADOS = {
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

export const DISTRITO_DELIVERY_ESTADOS = {
  DISPONIBLE: {
    value: true,
    label: 'Disponible',
    color: 'text-blue-600 bg-blue-100',
  },
  NO_DISPONIBLE: {
    value: false,
    label: 'No disponible',
    color: 'text-gray-600 bg-gray-100',
  },
} as const;

// Validaciones
export const DISTRITO_VALIDATION_RULES = {
  NOMBRE: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
    PATTERN: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-\.]+$/,
    REQUIRED: true,
  },
  CODIGO: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 10,
    PATTERN: /^[A-Z0-9]+$/,
    REQUIRED: true,
  },
  CODIGO_INEI: {
    MAX_LENGTH: 10,
    PATTERN: /^\d+$/,
    REQUIRED: false,
  },
  CODIGO_POSTAL: {
    MAX_LENGTH: 10,
    PATTERN: /^[A-Z0-9]+$/,
    REQUIRED: false,
  },
  LATITUD: {
    MIN: -90,
    MAX: 90,
    REQUIRED: false,
  },
  LONGITUD: {
    MIN: -180,
    MAX: 180,
    REQUIRED: false,
  },
  RADIO_BUSQUEDA: {
    MIN: 0.1,
    MAX: 100,
    DEFAULT: 10,
  },
} as const;

// Mensajes de error
export const DISTRITO_ERROR_MESSAGES = {
  // Errores de validación de campos
  NOMBRE_REQUERIDO: 'El nombre del distrito es obligatorio',
  NOMBRE_MIN_LENGTH: `El nombre debe tener al menos ${DISTRITO_VALIDATION_RULES.NOMBRE.MIN_LENGTH} caracteres`,
  NOMBRE_MAX_LENGTH: `El nombre no puede exceder ${DISTRITO_VALIDATION_RULES.NOMBRE.MAX_LENGTH} caracteres`,
  NOMBRE_PATTERN:
    'El nombre solo puede contener letras, espacios, guiones y puntos',

  CODIGO_REQUERIDO: 'El código del distrito es obligatorio',
  CODIGO_MIN_LENGTH: `El código debe tener al menos ${DISTRITO_VALIDATION_RULES.CODIGO.MIN_LENGTH} caracteres`,
  CODIGO_MAX_LENGTH: `El código no puede exceder ${DISTRITO_VALIDATION_RULES.CODIGO.MAX_LENGTH} caracteres`,
  CODIGO_PATTERN: 'El código solo puede contener letras mayúsculas y números',
  CODIGO_UNICO: 'Ya existe un distrito con este código',

  CODIGO_INEI_MAX_LENGTH: `El código INEI no puede exceder ${DISTRITO_VALIDATION_RULES.CODIGO_INEI.MAX_LENGTH} caracteres`,
  CODIGO_INEI_PATTERN: 'El código INEI solo puede contener números',
  CODIGO_INEI_UNICO: 'Ya existe un distrito con este código INEI',

  CODIGO_POSTAL_MAX_LENGTH: `El código postal no puede exceder ${DISTRITO_VALIDATION_RULES.CODIGO_POSTAL.MAX_LENGTH} caracteres`,
  CODIGO_POSTAL_PATTERN:
    'El código postal solo puede contener letras mayúsculas y números',

  PROVINCIA_REQUERIDA: 'La provincia es obligatoria',
  PROVINCIA_NO_EXISTE: 'La provincia seleccionada no existe',
  PROVINCIA_INACTIVA: 'No se puede crear un distrito en una provincia inactiva',
  DEPARTAMENTO_INACTIVO:
    'No se puede crear un distrito en un departamento inactivo',

  LATITUD_RANGO: `La latitud debe estar entre ${DISTRITO_VALIDATION_RULES.LATITUD.MIN} y ${DISTRITO_VALIDATION_RULES.LATITUD.MAX} grados`,
  LONGITUD_RANGO: `La longitud debe estar entre ${DISTRITO_VALIDATION_RULES.LONGITUD.MIN} y ${DISTRITO_VALIDATION_RULES.LONGITUD.MAX} grados`,
  COORDENADAS_COMPLETAS:
    'Debe proporcionar tanto latitud como longitud, o ninguna de las dos',
  COORDENADAS_INVALIDAS: 'Las coordenadas proporcionadas no son válidas',

  LIMITES_GEOGRAFICOS_JSON: 'Los límites geográficos deben ser un JSON válido',

  // Errores de operaciones
  DISTRITO_NO_ENCONTRADO: 'Distrito no encontrado',
  ERROR_ELIMINAR_CON_ZONAS:
    'No se puede eliminar el distrito porque tiene zonas de reparto asociadas',
  ERROR_ACTIVAR_PROVINCIA_INACTIVA:
    'No se puede activar el distrito porque la provincia está inactiva',
  ERROR_ACTIVAR_DEPARTAMENTO_INACTIVO:
    'No se puede activar el distrito porque el departamento está inactivo',
  ERROR_DELIVERY_DISTRITO_INACTIVO:
    'No se puede activar delivery en un distrito inactivo',
  ERROR_MOVER_PROVINCIA_INACTIVA:
    'No se puede mover el distrito a una provincia inactiva',
  ERROR_MOVER_DEPARTAMENTO_INACTIVO:
    'No se puede mover el distrito a un departamento inactivo',

  // Errores de servidor
  ERROR_SERVIDOR: 'Error interno del servidor',
  ERROR_CONEXION: 'Error de conexión con el servidor',
  ERROR_TIMEOUT: 'Tiempo de espera agotado',
  ERROR_PERMISOS: 'No tiene permisos para realizar esta acción',
} as const;

// Mensajes de éxito
export const DISTRITO_SUCCESS_MESSAGES = {
  CREADO: 'Distrito creado exitosamente',
  ACTUALIZADO: 'Distrito actualizado exitosamente',
  ELIMINADO: 'Distrito eliminado exitosamente',
  ESTADO_CAMBIADO: 'Estado del distrito cambiado exitosamente',
  DELIVERY_CAMBIADO: 'Disponibilidad de delivery cambiada exitosamente',
  DATOS_CARGADOS: 'Datos cargados exitosamente',
  BUSQUEDA_COMPLETADA: 'Búsqueda completada exitosamente',
} as const;

// Opciones de ordenamiento
export const DISTRITO_SORT_OPTIONS = [
  { value: 'nombre', label: 'Nombre', icon: 'sort-alpha-down' },
  { value: 'codigo', label: 'Código', icon: 'sort-alpha-down' },
  { value: 'codigo_inei', label: 'Código INEI', icon: 'sort-numeric-down' },
  { value: 'codigo_postal', label: 'Código Postal', icon: 'sort-alpha-down' },
  { value: 'activo', label: 'Estado', icon: 'sort' },
  { value: 'disponible_delivery', label: 'Disponible Delivery', icon: 'sort' },
  {
    value: 'created_at',
    label: 'Fecha de Creación',
    icon: 'sort-calendar-down',
  },
  {
    value: 'updated_at',
    label: 'Última Actualización',
    icon: 'sort-calendar-down',
  },
] as const;

// Opciones de filtros
export const DISTRITO_FILTER_OPTIONS = {
  ESTADOS: [
    { value: '', label: 'Todos los estados' },
    { value: 'true', label: 'Activos' },
    { value: 'false', label: 'Inactivos' },
  ],
  DELIVERY: [
    { value: '', label: 'Todos' },
    { value: 'true', label: 'Con delivery' },
    { value: 'false', label: 'Sin delivery' },
  ],
  COORDENADAS: [
    { value: '', label: 'Todos' },
    { value: 'true', label: 'Con coordenadas' },
    { value: 'false', label: 'Sin coordenadas' },
  ],
  PAGINACION: [
    { value: 10, label: '10 por página' },
    { value: 25, label: '25 por página' },
    { value: 50, label: '50 por página' },
    { value: 100, label: '100 por página' },
  ],
} as const;

// Configuración de UI
export const DISTRITO_UI_CONFIG = {
  ICONOS: {
    DISTRITO: 'map-pin',
    DISTRITO_ACTIVO: 'map-pin',
    DISTRITO_INACTIVO: 'map-pin-off',
    DELIVERY_DISPONIBLE: 'truck',
    DELIVERY_NO_DISPONIBLE: 'truck-off',
    COORDENADAS: 'map',
    SIN_COORDENADAS: 'map-off',
    ZONA_REPARTO: 'route',
    EDITAR: 'edit',
    ELIMINAR: 'trash',
    VER: 'eye',
    ACTIVAR: 'toggle-right',
    DESACTIVAR: 'toggle-left',
    BUSCAR: 'search',
    FILTRAR: 'filter',
    EXPORTAR: 'download',
    IMPORTAR: 'upload',
    ACTUALIZAR: 'refresh-cw',
    CONFIGURAR: 'settings',
    ESTADISTICAS: 'bar-chart',
    MAPA: 'map',
    LISTA: 'list',
    TARJETAS: 'grid',
  },
  COLORES: {
    ACTIVO: 'text-green-600 bg-green-100 border-green-200',
    INACTIVO: 'text-red-600 bg-red-100 border-red-200',
    DELIVERY_SI: 'text-blue-600 bg-blue-100 border-blue-200',
    DELIVERY_NO: 'text-gray-600 bg-gray-100 border-gray-200',
    COORDENADAS_SI: 'text-purple-600 bg-purple-100 border-purple-200',
    COORDENADAS_NO: 'text-orange-600 bg-orange-100 border-orange-200',
    PRIMARIO: 'text-blue-600 bg-blue-50 border-blue-200',
    SECUNDARIO: 'text-gray-600 bg-gray-50 border-gray-200',
    EXITO: 'text-green-600 bg-green-50 border-green-200',
    ADVERTENCIA: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    ERROR: 'text-red-600 bg-red-50 border-red-200',
  },
  TOOLTIPS: {
    ACTIVAR: 'Activar distrito',
    DESACTIVAR: 'Desactivar distrito',
    ACTIVAR_DELIVERY: 'Activar delivery',
    DESACTIVAR_DELIVERY: 'Desactivar delivery',
    EDITAR: 'Editar distrito',
    ELIMINAR: 'Eliminar distrito',
    VER_DETALLES: 'Ver detalles',
    VER_MAPA: 'Ver en mapa',
    VER_ZONAS: 'Ver zonas de reparto',
    COPIAR_CODIGO: 'Copiar código',
    COPIAR_COORDENADAS: 'Copiar coordenadas',
  },
} as const;

// Configuración de modales
export const DISTRITO_MODAL_CONFIG = {
  CREAR: {
    TITULO: 'Crear Nuevo Distrito',
    SUBTITULO: 'Complete la información del distrito',
    BOTON_CONFIRMAR: 'Crear Distrito',
    BOTON_CANCELAR: 'Cancelar',
    ICONO: 'plus-circle',
  },
  EDITAR: {
    TITULO: 'Editar Distrito',
    SUBTITULO: 'Modifique la información del distrito',
    BOTON_CONFIRMAR: 'Guardar Cambios',
    BOTON_CANCELAR: 'Cancelar',
    ICONO: 'edit',
  },
  ELIMINAR: {
    TITULO: 'Eliminar Distrito',
    SUBTITULO: '¿Está seguro de que desea eliminar este distrito?',
    MENSAJE:
      'Esta acción no se puede deshacer. El distrito será eliminado permanentemente.',
    BOTON_CONFIRMAR: 'Eliminar',
    BOTON_CANCELAR: 'Cancelar',
    ICONO: 'trash',
  },
  CAMBIAR_ESTADO: {
    TITULO: 'Cambiar Estado',
    SUBTITULO: '¿Está seguro de que desea cambiar el estado de este distrito?',
    BOTON_CONFIRMAR: 'Cambiar Estado',
    BOTON_CANCELAR: 'Cancelar',
    ICONO: 'toggle-right',
  },
  CAMBIAR_DELIVERY: {
    TITULO: 'Cambiar Disponibilidad de Delivery',
    SUBTITULO:
      '¿Está seguro de que desea cambiar la disponibilidad de delivery?',
    BOTON_CONFIRMAR: 'Cambiar Disponibilidad',
    BOTON_CANCELAR: 'Cancelar',
    ICONO: 'truck',
  },
  VER_DETALLES: {
    TITULO: 'Detalles del Distrito',
    BOTON_CERRAR: 'Cerrar',
    ICONO: 'eye',
  },
} as const;

// Configuración de formularios
export const DISTRITO_FORM_CONFIG = {
  CAMPOS: {
    NOMBRE: {
      LABEL: 'Nombre del Distrito',
      PLACEHOLDER: 'Ingrese el nombre del distrito',
      HELP: 'Nombre oficial del distrito',
      REQUIRED: true,
    },
    CODIGO: {
      LABEL: 'Código',
      PLACEHOLDER: 'Ej: LIM01',
      HELP: 'Código único del distrito (2-10 caracteres)',
      REQUIRED: true,
    },
    CODIGO_INEI: {
      LABEL: 'Código INEI',
      PLACEHOLDER: 'Ej: 150101',
      HELP: 'Código INEI oficial (opcional)',
      REQUIRED: false,
    },
    CODIGO_POSTAL: {
      LABEL: 'Código Postal',
      PLACEHOLDER: 'Ej: 15001',
      HELP: 'Código postal del distrito (opcional)',
      REQUIRED: false,
    },
    PROVINCIA: {
      LABEL: 'Provincia',
      PLACEHOLDER: 'Seleccione una provincia',
      HELP: 'Provincia a la que pertenece el distrito',
      REQUIRED: true,
    },
    LATITUD: {
      LABEL: 'Latitud',
      PLACEHOLDER: 'Ej: -12.0464',
      HELP: 'Coordenada de latitud (-90 a 90)',
      REQUIRED: false,
    },
    LONGITUD: {
      LABEL: 'Longitud',
      PLACEHOLDER: 'Ej: -77.0428',
      HELP: 'Coordenada de longitud (-180 a 180)',
      REQUIRED: false,
    },
    ACTIVO: {
      LABEL: 'Estado',
      HELP: 'Estado del distrito (activo/inactivo)',
      REQUIRED: false,
    },
    DISPONIBLE_DELIVERY: {
      LABEL: 'Disponible para Delivery',
      HELP: 'Indica si el distrito tiene servicio de delivery',
      REQUIRED: false,
    },
    LIMITES_GEOGRAFICOS: {
      LABEL: 'Límites Geográficos',
      PLACEHOLDER: 'JSON con los límites geográficos',
      HELP: 'Datos geográficos en formato JSON (opcional)',
      REQUIRED: false,
    },
  },
  SECCIONES: {
    INFORMACION_BASICA: {
      TITULO: 'Información Básica',
      DESCRIPCION: 'Datos principales del distrito',
    },
    CODIGOS: {
      TITULO: 'Códigos de Identificación',
      DESCRIPCION: 'Códigos oficiales y postales',
    },
    UBICACION: {
      TITULO: 'Ubicación Geográfica',
      DESCRIPCION: 'Coordenadas y límites geográficos',
    },
    CONFIGURACION: {
      TITULO: 'Configuración',
      DESCRIPCION: 'Estado y disponibilidad de servicios',
    },
  },
} as const;

// Configuración de exportación
export const DISTRITO_EXPORT_CONFIG = {
  FORMATOS: [
    { value: 'excel', label: 'Excel (.xlsx)', icon: 'file-excel' },
    { value: 'csv', label: 'CSV (.csv)', icon: 'file-text' },
    { value: 'pdf', label: 'PDF (.pdf)', icon: 'file-pdf' },
    { value: 'json', label: 'JSON (.json)', icon: 'file-code' },
  ],
  COLUMNAS: [
    { key: 'id', label: 'ID', selected: true },
    { key: 'nombre', label: 'Nombre', selected: true },
    { key: 'codigo', label: 'Código', selected: true },
    { key: 'codigo_inei', label: 'Código INEI', selected: true },
    { key: 'codigo_postal', label: 'Código Postal', selected: false },
    { key: 'provincia', label: 'Provincia', selected: true },
    { key: 'departamento', label: 'Departamento', selected: true },
    { key: 'activo', label: 'Estado', selected: true },
    { key: 'disponible_delivery', label: 'Delivery', selected: true },
    { key: 'coordenadas', label: 'Coordenadas', selected: false },
    { key: 'zonas_reparto', label: 'Zonas de Reparto', selected: false },
    { key: 'created_at', label: 'Fecha Creación', selected: false },
    { key: 'updated_at', label: 'Última Actualización', selected: false },
  ],
} as const;

// Configuración de estadísticas
export const DISTRITO_STATS_CONFIG = {
  METRICAS: {
    TOTAL: {
      LABEL: 'Total de Distritos',
      ICONO: 'map-pin',
      COLOR: 'text-blue-600 bg-blue-100',
    },
    ACTIVOS: {
      LABEL: 'Distritos Activos',
      ICONO: 'check-circle',
      COLOR: 'text-green-600 bg-green-100',
    },
    INACTIVOS: {
      LABEL: 'Distritos Inactivos',
      ICONO: 'x-circle',
      COLOR: 'text-red-600 bg-red-100',
    },
    CON_DELIVERY: {
      LABEL: 'Con Delivery',
      ICONO: 'truck',
      COLOR: 'text-blue-600 bg-blue-100',
    },
    SIN_DELIVERY: {
      LABEL: 'Sin Delivery',
      ICONO: 'truck-off',
      COLOR: 'text-gray-600 bg-gray-100',
    },
    CON_COORDENADAS: {
      LABEL: 'Con Coordenadas',
      ICONO: 'map',
      COLOR: 'text-purple-600 bg-purple-100',
    },
    SIN_COORDENADAS: {
      LABEL: 'Sin Coordenadas',
      ICONO: 'map-off',
      COLOR: 'text-orange-600 bg-orange-100',
    },
    CON_ZONAS: {
      LABEL: 'Con Zonas de Reparto',
      ICONO: 'route',
      COLOR: 'text-indigo-600 bg-indigo-100',
    },
    SIN_ZONAS: {
      LABEL: 'Sin Zonas de Reparto',
      ICONO: 'route-off',
      COLOR: 'text-gray-600 bg-gray-100',
    },
  },
  GRAFICOS: {
    ESTADOS: {
      TITULO: 'Distribución por Estado',
      TIPO: 'donut',
    },
    DELIVERY: {
      TITULO: 'Disponibilidad de Delivery',
      TIPO: 'donut',
    },
    POR_PROVINCIA: {
      TITULO: 'Distritos por Provincia',
      TIPO: 'bar',
    },
    POR_DEPARTAMENTO: {
      TITULO: 'Distritos por Departamento',
      TIPO: 'bar',
    },
  },
} as const;

// Configuración de búsqueda
export const DISTRITO_SEARCH_CONFIG = {
  PLACEHOLDER: 'Buscar por nombre, código, INEI o postal...',
  MIN_CHARS: 2,
  DELAY: 300,
  CAMPOS_BUSQUEDA: [
    'nombre',
    'codigo',
    'codigo_inei',
    'codigo_postal',
    'provincia.nombre',
    'provincia.departamento.nombre',
  ],
  FILTROS_RAPIDOS: [
    { key: 'activos', label: 'Solo Activos', filter: { activo: true } },
    {
      key: 'con_delivery',
      label: 'Con Delivery',
      filter: { disponible_delivery: true },
    },
    {
      key: 'con_coordenadas',
      label: 'Con Coordenadas',
      filter: { con_coordenadas: true },
    },
    {
      key: 'sin_zonas',
      label: 'Sin Zonas',
      filter: { sin_zonas_reparto: true },
    },
  ],
} as const;

// Configuración de mapa
export const DISTRITO_MAP_CONFIG = {
  ZOOM_DEFAULT: 10,
  ZOOM_MIN: 5,
  ZOOM_MAX: 18,
  CENTER_DEFAULT: [-12.0464, -77.0428], // Lima, Perú
  MARCADORES: {
    ACTIVO: {
      COLOR: '#10B981',
      ICONO: 'map-pin',
    },
    INACTIVO: {
      COLOR: '#EF4444',
      ICONO: 'map-pin-off',
    },
    CON_DELIVERY: {
      COLOR: '#3B82F6',
      ICONO: 'truck',
    },
    SELECCIONADO: {
      COLOR: '#8B5CF6',
      ICONO: 'map-pin',
    },
  },
  CAPAS: [
    { key: 'todos', label: 'Todos los Distritos', visible: true },
    { key: 'activos', label: 'Solo Activos', visible: false },
    { key: 'delivery', label: 'Con Delivery', visible: false },
    { key: 'zonas', label: 'Con Zonas de Reparto', visible: false },
  ],
} as const;

// Configuración de notificaciones
export const DISTRITO_NOTIFICATION_CONFIG = {
  DURACION: 5000,
  POSICION: 'top-right',
  TIPOS: {
    EXITO: {
      ICONO: 'check-circle',
      COLOR: 'text-green-600 bg-green-100 border-green-200',
    },
    ERROR: {
      ICONO: 'x-circle',
      COLOR: 'text-red-600 bg-red-100 border-red-200',
    },
    ADVERTENCIA: {
      ICONO: 'alert-triangle',
      COLOR: 'text-yellow-600 bg-yellow-100 border-yellow-200',
    },
    INFO: {
      ICONO: 'info',
      COLOR: 'text-blue-600 bg-blue-100 border-blue-200',
    },
  },
} as const;

// Configuración de permisos
export const DISTRITO_PERMISSIONS = {
  VER: 'distritos.ver',
  CREAR: 'distritos.crear',
  EDITAR: 'distritos.editar',
  ELIMINAR: 'distritos.eliminar',
  CAMBIAR_ESTADO: 'distritos.cambiar_estado',
  CAMBIAR_DELIVERY: 'distritos.cambiar_delivery',
  EXPORTAR: 'distritos.exportar',
  IMPORTAR: 'distritos.importar',
  VER_ESTADISTICAS: 'distritos.estadisticas',
  GESTIONAR_ZONAS: 'distritos.gestionar_zonas',
} as const;

// Configuración de cache
export const DISTRITO_CACHE_CONFIG = {
  TTL: 300000, // 5 minutos
  KEYS: {
    LISTA: 'distritos_lista',
    DETALLE: 'distrito_detalle',
    ESTADISTICAS: 'distritos_estadisticas',
    PROVINCIAS: 'distritos_provincias',
    DEPARTAMENTOS: 'distritos_departamentos',
  },
} as const;

// Configuración de paginación
export const DISTRITO_PAGINATION_CONFIG = {
  PAGE_SIZE_DEFAULT: 25,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
  MAX_PAGES_SHOWN: 5,
  SHOW_SIZE_CHANGER: true,
  SHOW_QUICK_JUMPER: true,
  SHOW_TOTAL: true,
} as const;

// Configuración de validación en tiempo real
export const DISTRITO_REALTIME_VALIDATION = {
  DEBOUNCE_TIME: 500,
  VALIDACIONES: {
    CODIGO_UNICO: {
      ENDPOINT: '/admin/distritos/validate-codigo',
      METODO: 'GET',
    },
    CODIGO_INEI_UNICO: {
      ENDPOINT: '/admin/distritos/validate-codigo-inei',
      METODO: 'GET',
    },
    PROVINCIA_ACTIVA: {
      ENDPOINT: '/admin/provincias/{id}/status',
      METODO: 'GET',
    },
  },
} as const;

// Funciones de utilidad para constantes
export const getDistritoEstadoConfig = (activo: boolean) => {
  return activo ? DISTRITO_ESTADOS.ACTIVO : DISTRITO_ESTADOS.INACTIVO;
};

export const getDistritoDeliveryConfig = (disponible: boolean) => {
  return disponible
    ? DISTRITO_DELIVERY_ESTADOS.DISPONIBLE
    : DISTRITO_DELIVERY_ESTADOS.NO_DISPONIBLE;
};

export const getDistritoSortOption = (value: string) => {
  return DISTRITO_SORT_OPTIONS.find((option) => option.value === value);
};

export const getDistritoFilterOption = (type: string, value: string) => {
  switch (type) {
    case 'estados':
      return DISTRITO_FILTER_OPTIONS.ESTADOS.find(
        (option) => option.value === value
      );
    case 'delivery':
      return DISTRITO_FILTER_OPTIONS.DELIVERY.find(
        (option) => option.value === value
      );
    case 'coordenadas':
      return DISTRITO_FILTER_OPTIONS.COORDENADAS.find(
        (option) => option.value === value
      );
    default:
      return null;
  }
};

export const getDistritoIconConfig = (tipo: string) => {
  return (
    DISTRITO_UI_CONFIG.ICONOS[tipo as keyof typeof DISTRITO_UI_CONFIG.ICONOS] ||
    'map-pin'
  );
};

export const getDistritoColorConfig = (tipo: string) => {
  return (
    DISTRITO_UI_CONFIG.COLORES[
      tipo as keyof typeof DISTRITO_UI_CONFIG.COLORES
    ] || DISTRITO_UI_CONFIG.COLORES.SECUNDARIO
  );
};

export const getDistritoModalConfig = (tipo: string) => {
  return DISTRITO_MODAL_CONFIG[tipo as keyof typeof DISTRITO_MODAL_CONFIG];
};

export const getDistritoFormFieldConfig = (campo: string) => {
  return DISTRITO_FORM_CONFIG.CAMPOS[
    campo as keyof typeof DISTRITO_FORM_CONFIG.CAMPOS
  ];
};

export const getDistritoStatsConfig = (metrica: string) => {
  return DISTRITO_STATS_CONFIG.METRICAS[
    metrica as keyof typeof DISTRITO_STATS_CONFIG.METRICAS
  ];
};

export const getDistritoExportColumns = (selected: boolean = true) => {
  return DISTRITO_EXPORT_CONFIG.COLUMNAS.filter((col) =>
    selected ? col.selected : true
  );
};

export const getDistritoSearchFilter = (key: string) => {
  return DISTRITO_SEARCH_CONFIG.FILTROS_RAPIDOS.find(
    (filter) => filter.key === key
  );
};

export const getDistritoMapMarkerConfig = (tipo: string) => {
  return DISTRITO_MAP_CONFIG.MARCADORES[
    tipo as keyof typeof DISTRITO_MAP_CONFIG.MARCADORES
  ];
};

export const getDistritoNotificationConfig = (tipo: string) => {
  return DISTRITO_NOTIFICATION_CONFIG.TIPOS[
    tipo as keyof typeof DISTRITO_NOTIFICATION_CONFIG.TIPOS
  ];
};

export const hasDistritoPermission = (
  permission: string,
  userPermissions: string[] = []
) => {
  return userPermissions.includes(permission);
};

export const getDistritoCacheKey = (key: string, params?: any) => {
  const baseKey =
    DISTRITO_CACHE_CONFIG.KEYS[key as keyof typeof DISTRITO_CACHE_CONFIG.KEYS];
  return params ? `${baseKey}_${JSON.stringify(params)}` : baseKey;
};

export const getDistritoPaginationConfig = () => {
  return {
    pageSize: DISTRITO_PAGINATION_CONFIG.PAGE_SIZE_DEFAULT,
    pageSizeOptions: DISTRITO_PAGINATION_CONFIG.PAGE_SIZE_OPTIONS,
    showSizeChanger: DISTRITO_PAGINATION_CONFIG.SHOW_SIZE_CHANGER,
    showQuickJumper: DISTRITO_PAGINATION_CONFIG.SHOW_QUICK_JUMPER,
    showTotal: DISTRITO_PAGINATION_CONFIG.SHOW_TOTAL,
    maxPagesShown: DISTRITO_PAGINATION_CONFIG.MAX_PAGES_SHOWN,
  };
};

export const getDistritoValidationRule = (campo: string) => {
  return DISTRITO_VALIDATION_RULES[
    campo as keyof typeof DISTRITO_VALIDATION_RULES
  ];
};

export const getDistritoErrorMessage = (error: string) => {
  return (
    DISTRITO_ERROR_MESSAGES[error as keyof typeof DISTRITO_ERROR_MESSAGES] ||
    'Error desconocido'
  );
};

export const getDistritoSuccessMessage = (action: string) => {
  return (
    DISTRITO_SUCCESS_MESSAGES[
      action as keyof typeof DISTRITO_SUCCESS_MESSAGES
    ] || 'Operación exitosa'
  );
};

// Tipos para TypeScript
export type DistritoEstado =
  (typeof DISTRITO_ESTADOS)[keyof typeof DISTRITO_ESTADOS];
export type DistritoDeliveryEstado =
  (typeof DISTRITO_DELIVERY_ESTADOS)[keyof typeof DISTRITO_DELIVERY_ESTADOS];
export type DistritoSortOption = (typeof DISTRITO_SORT_OPTIONS)[number];
export type DistritoFilterOption =
  (typeof DISTRITO_FILTER_OPTIONS)[keyof typeof DISTRITO_FILTER_OPTIONS][number];
export type DistritoUIIcon = keyof typeof DISTRITO_UI_CONFIG.ICONOS;
export type DistritoUIColor = keyof typeof DISTRITO_UI_CONFIG.COLORES;
export type DistritoModalType = keyof typeof DISTRITO_MODAL_CONFIG;
export type DistritoFormField = keyof typeof DISTRITO_FORM_CONFIG.CAMPOS;
export type DistritoStatsMetric = keyof typeof DISTRITO_STATS_CONFIG.METRICAS;
export type DistritoExportFormat =
  (typeof DISTRITO_EXPORT_CONFIG.FORMATOS)[number]['value'];
export type DistritoSearchFilter =
  (typeof DISTRITO_SEARCH_CONFIG.FILTROS_RAPIDOS)[number];
export type DistritoMapMarker = keyof typeof DISTRITO_MAP_CONFIG.MARCADORES;
export type DistritoNotificationType =
  keyof typeof DISTRITO_NOTIFICATION_CONFIG.TIPOS;
export type DistritoPermission =
  (typeof DISTRITO_PERMISSIONS)[keyof typeof DISTRITO_PERMISSIONS];
export type DistritoCacheKey = keyof typeof DISTRITO_CACHE_CONFIG.KEYS;
export type DistritoValidationRule = keyof typeof DISTRITO_VALIDATION_RULES;
