/**
 * Interfaz para representar una dirección de usuario
 * Basada en la respuesta JSON real del DireccionController
 */
export interface Direccion {
  id: number;
  user_id: number;
  distrito_id: number;
  direccion: string;
  referencia: string | null;
  codigo_postal: string | null;
  numero_exterior: string | null;
  numero_interior: string | null;
  urbanizacion: string | null;
  etapa: string | null;
  manzana: string | null;
  lote: string | null;
  latitud: number | null;
  longitud: number | null;
  predeterminada: boolean;
  validada: boolean;
  alias: string | null;
  instrucciones_entrega: string | null;
  created_at: string;
  updated_at: string;

  // Campos legacy para compatibilidad
  distrito?: string;
  provincia?: string;
  departamento?: string;
  pais?: string;

  // Información calculada
  tiene_coordenadas: boolean;
  direccion_completa: string;
  direccion_completa_detallada: DireccionCompletaDetallada;
  coordenadas: Coordenadas | null;
  alias_formateado: string;
  numero_completo: string | null;

  // Información del distrito con relaciones
  distrito_detalle?: DistritoDetalle;

  // Usuario propietario
  usuario?: UsuarioDireccion;

  // Relación con direccion validada
  direccion_validada?: DireccionValidada | null;

  // Validaciones de la dirección
  validaciones: ValidacionesDireccion;

  // Ubicación legacy para compatibilidad
  ubicacion: UbicacionDireccion;
}

/**
 * Interfaz para coordenadas geográficas
 */
export interface Coordenadas {
  lat: number;
  lng: number;
}

/**
 * Interfaz para dirección completa detallada
 */
export interface DireccionCompletaDetallada {
  direccion_principal: string;
  numeracion: string | null;
  ubicacion_especifica: UbicacionEspecifica;
  referencia: string | null;
  instrucciones_entrega: string | null;
  alias: string | null;
  codigo_postal: string | null;
}

/**
 * Interfaz para ubicación específica
 */
export interface UbicacionEspecifica {
  urbanizacion?: string;
  etapa?: string;
  manzana?: string;
  lote?: string;
}

/**
 * Interfaz para detalles del distrito
 */
export interface DistritoDetalle {
  id: number;
  nombre: string;
  codigo: string;
  codigo_postal: string | null;
  disponible_delivery: boolean;
  provincia: ProvinciaDetalle | null;
}

/**
 * Interfaz para detalles de la provincia
 */
export interface ProvinciaDetalle {
  id: number;
  nombre: string;
  departamento: DepartamentoDetalle | null;
}

/**
 * Interfaz para detalles del departamento
 */
export interface DepartamentoDetalle {
  id: number;
  nombre: string;
  pais: string;
}

/**
 * Interfaz para datos del usuario asociado a la dirección
 */
export interface UsuarioDireccion {
  id: number;
  nombre: string;
  email: string;
}

/**
 * Interfaz para dirección validada
 */
export interface DireccionValidada {
  id: number;
  zona_reparto_id: number | null;
  en_zona_cobertura: boolean;
  costo_envio_calculado: number;
  distancia_tienda_km: number | null;
  zona_reparto: ZonaRepartoBasica | null;
}

/**
 * Interfaz para zona de reparto básica
 */
export interface ZonaRepartoBasica {
  id: number;
  nombre: string;
}

/**
 * Interfaz para validaciones de dirección
 */
export interface ValidacionesDireccion {
  es_direccion_completa: boolean;
  tiene_referencias_claras: boolean;
  tiene_instrucciones_entrega: boolean;
  esta_geolocalizada: boolean;
  esta_validada: boolean;
  es_predeterminada: boolean;
  tiene_numeracion: boolean;
  direccion_valida_delivery: boolean;
}

/**
 * Interfaz para la ubicación geográfica de una dirección
 */
export interface UbicacionDireccion {
  distrito?: string;
  provincia?: string;
  departamento?: string;
  pais?: string;
}

/**
 * DTO para crear una nueva dirección
 */
export interface CreateDireccionDto {
  user_id: number;
  distrito_id: number;
  direccion: string;
  referencia?: string;
  codigo_postal?: string;
  numero_exterior?: string;
  numero_interior?: string;
  urbanizacion?: string;
  etapa?: string;
  manzana?: string;
  lote?: string;
  latitud?: number;
  longitud?: number;
  predeterminada?: boolean;
  validada?: boolean;
  alias?: string;
  instrucciones_entrega?: string;
}

/**
 * DTO para actualizar una dirección existente
 */
export interface UpdateDireccionDto {
  distrito_id?: number;
  direccion?: string;
  referencia?: string;
  codigo_postal?: string;
  numero_exterior?: string;
  numero_interior?: string;
  urbanizacion?: string;
  etapa?: string;
  manzana?: string;
  lote?: string;
  latitud?: number;
  longitud?: number;
  predeterminada?: boolean;
  validada?: boolean;
  alias?: string;
  instrucciones_entrega?: string;
}

/**
 * Interfaz para filtros de búsqueda de direcciones
 */
export interface DireccionFilters {
  user_id?: number;
  distrito_id?: number;
  distrito?: string;
  provincia?: string;
  departamento?: string;
  pais?: string;
  predeterminada?: boolean;
  validada?: boolean;
  con_coordenadas?: boolean;
  con_alias?: boolean;
  con_instrucciones?: boolean;
  delivery_disponible?: boolean;
  search?: string;
  sort_field?: string;
  sort_direction?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
  with_direccion_validada?: boolean;
}

/**
 * Interfaz para la respuesta paginada de direcciones
 */
export interface DireccionResponse {
  success: boolean;
  data: Direccion[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
  };
  message: string;
}

/**
 * Interfaz para la respuesta de una sola dirección
 */
export interface DireccionSingleResponse {
  success: boolean;
  data: Direccion;
  message: string;
}

/**
 * Interfaz para la respuesta de direcciones por usuario
 */
export interface DireccionesByUsuarioResponse {
  success: boolean;
  data: Direccion[];
  resumen: {
    total_direcciones: number;
    direccion_predeterminada?: number;
    direcciones_validadas: number;
    direcciones_con_coordenadas: number;
    direcciones_con_alias: number;
    direcciones_delivery_disponible: number;
    distribución_geografica: {
      departamentos: Record<string, number>;
      provincias: Record<string, number>;
      distritos: Record<string, number>;
    };
  };
  user: {
    id: number;
    name: string;
    email: string;
    telefono?: string;
  };
  message: string;
}

/**
 * Interfaz para estadísticas de direcciones
 */
export interface EstadisticasDirecciones {
  success: boolean;
  data: {
    resumen_general: {
      total_direcciones: number;
      direcciones_predeterminadas: number;
      direcciones_validadas: number;
      direcciones_con_coordenadas: number;
      direcciones_con_alias: number;
      direcciones_con_instrucciones: number;
      usuarios_con_direcciones: number;
      promedio_direcciones_por_usuario: number;
    };
    estadisticas_delivery: {
      direcciones_delivery_disponible: number;
      direcciones_sin_delivery: number;
      porcentaje_delivery_disponible: number;
    };
    calidad_direcciones: {
      direcciones_completas: number;
      direcciones_con_numeracion: number;
      direcciones_con_urbanizacion: number;
      direcciones_con_codigo_postal: number;
    };
    distribucion_geografica: {
      por_departamento: Array<{ departamento: string; total: number }>;
      por_provincia: Array<{ provincia: string; total: number }>;
      por_distrito: Array<{ distrito: string; total: number }>;
    };
    top_distritos: Array<{
      distrito: string;
      total_direcciones: number;
      direcciones_validadas: number;
      disponible_delivery: boolean;
      porcentaje_validadas: number;
    }>;
    usuarios_con_mas_direcciones: Array<{
      user_id: number;
      nombre: string;
      email: string;
      total_direcciones: number;
    }>;
    tendencia_mensual: Array<{
      periodo: string;
      total_direcciones: number;
      direcciones_validadas: number;
      con_coordenadas: number;
    }>;
  };
  message: string;
}

/**
 * Interfaz para respuesta de operaciones simples (crear, actualizar, eliminar)
 */
export interface DireccionOperationResponse {
  success: boolean;
  data?: Direccion;
  message: string;
  error?: string;
}

/**
 * Interfaz para búsqueda por proximidad
 */
export interface BuscarPorProximidadRequest {
  latitud: number;
  longitud: number;
  radio_km?: number;
}

/**
 * Interfaz para respuesta de búsqueda por proximidad
 */
export interface BuscarPorProximidadResponse {
  success: boolean;
  data: Direccion[];
  meta: {
    punto_referencia: {
      latitud: number;
      longitud: number;
    };
    radio_busqueda_km: number;
    total_encontradas: number;
  };
  message: string;
}

/**
 * Interfaz para respuesta de direcciones por distrito
 */
export interface DireccionesPorDistritoResponse {
  success: boolean;
  data: Direccion[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
  };
  distrito: {
    id: number;
    nombre: string;
    disponible_delivery: boolean;
    provincia: string | null;
    departamento: string | null;
  };
  estadisticas: {
    total_direcciones: number;
    direcciones_validadas: number;
    direcciones_con_coordenadas: number;
    usuarios_unicos: number;
  };
  message: string;
}

/**
 * Interfaz para actualizar coordenadas
 */
export interface ActualizarCoordenadasRequest {
  latitud: number;
  longitud: number;
}

/**
 * Enum para los países soportados
 */
export enum PaisEnum {
  PERU = 'Perú',
  COLOMBIA = 'Colombia',
  ECUADOR = 'Ecuador',
  BOLIVIA = 'Bolivia',
  CHILE = 'Chile',
}

/**
 * Interfaz para validación de dirección
 */
export interface DireccionValidation {
  direccion: boolean;
  distrito_id: boolean;
  isValid: boolean;
  errors: string[];
}

/**
 * Constantes para validación
 */
export const DIRECCION_VALIDATION = {
  DIRECCION: {
    MIN_LENGTH: 5,
    MAX_LENGTH: 255,
  },
  REFERENCIA: {
    MAX_LENGTH: 255,
  },
  CODIGO_POSTAL: {
    MAX_LENGTH: 10,
  },
  NUMERO_EXTERIOR: {
    MAX_LENGTH: 10,
  },
  NUMERO_INTERIOR: {
    MAX_LENGTH: 10,
  },
  URBANIZACION: {
    MAX_LENGTH: 100,
  },
  ETAPA: {
    MAX_LENGTH: 50,
  },
  MANZANA: {
    MAX_LENGTH: 10,
  },
  LOTE: {
    MAX_LENGTH: 10,
  },
  ALIAS: {
    MAX_LENGTH: 50,
  },
  INSTRUCCIONES_ENTREGA: {
    MAX_LENGTH: 500,
  },
  LATITUD: {
    MIN: -90,
    MAX: 90,
  },
  LONGITUD: {
    MIN: -180,
    MAX: 180,
  },
} as const;

/**
 * Mensajes de error
 */
export const DIRECCION_ERROR_MESSAGES = {
  DIRECCION_REQUERIDA: 'La dirección es requerida',
  DIRECCION_MIN_LENGTH: `La dirección debe tener al menos ${DIRECCION_VALIDATION.DIRECCION.MIN_LENGTH} caracteres`,
  DIRECCION_MAX_LENGTH: `La dirección no puede exceder ${DIRECCION_VALIDATION.DIRECCION.MAX_LENGTH} caracteres`,
  DISTRITO_REQUERIDO: 'El distrito es requerido',
  DISTRITO_NO_EXISTE: 'El distrito seleccionado no existe',
  DISTRITO_INACTIVO: 'El distrito seleccionado no está disponible',
  COORDENADAS_INVALIDAS: 'Las coordenadas proporcionadas no son válidas',
  COORDENADAS_COMPLETAS:
    'Debe proporcionar tanto latitud como longitud, o ninguna de las dos',
  USUARIO_REQUERIDO: 'El usuario es requerido',
  DIRECCION_NO_ENCONTRADA: 'Dirección no encontrada',
  ERROR_ELIMINAR_UNICA: 'No se puede eliminar la única dirección del usuario',
  ERROR_DESMARCAR_UNICA_PREDETERMINADA:
    'No se puede desmarcar la única dirección predeterminada',
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
} as const;

/**
 * Funciones de utilidad
 */
export const getDireccionCompleta = (direccion: Direccion): string => {
  return direccion.direccion_completa || direccion.direccion;
};

export const tieneCoordenadasValidas = (direccion: Direccion): boolean => {
  return (
    direccion.tiene_coordenadas &&
    direccion.latitud !== null &&
    direccion.longitud !== null
  );
};

export const esDireccionCompleta = (direccion: Direccion): boolean => {
  return direccion.validaciones?.es_direccion_completa || false;
};

export const esValidaParaDelivery = (direccion: Direccion): boolean => {
  return direccion.validaciones?.direccion_valida_delivery || false;
};

export const getDistritoNombre = (direccion: Direccion): string => {
  return (
    direccion.distrito_detalle?.nombre || direccion.distrito || 'Sin distrito'
  );
};

export const getProvinciaNombre = (direccion: Direccion): string => {
  return (
    direccion.distrito_detalle?.provincia?.nombre ||
    direccion.provincia ||
    'Sin provincia'
  );
};

export const getDepartamentoNombre = (direccion: Direccion): string => {
  return (
    direccion.distrito_detalle?.provincia?.departamento?.nombre ||
    direccion.departamento ||
    'Sin departamento'
  );
};

export const formatearAlias = (direccion: Direccion): string => {
  return direccion.alias_formateado || direccion.alias || 'Sin alias';
};

export const calcularDistancia = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radio de la Tierra en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
