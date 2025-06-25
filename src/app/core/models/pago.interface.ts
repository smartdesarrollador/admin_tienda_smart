import { Pedido } from './pedido.interface';
import { CuotaCredito } from './cuota-credito.interface';
import { BaseFilters, PaginatedResponse } from './common.interface';

/**
 * Interface principal para pagos
 * Basada en la respuesta del PagoResource de Laravel
 */
export interface Pago {
  id: number;
  pedido_id: number;
  metodo_pago_id: number | null;
  monto: number;
  comision: number;
  numero_cuota: number | null;
  fecha_pago: string;
  estado: EstadoPago;
  metodo: string;
  referencia: string;
  moneda: 'PEN' | 'USD' | 'EUR';
  respuesta_proveedor: Record<string, any> | null;
  codigo_autorizacion: string | null;
  observaciones: string | null;
  created_at: string;
  updated_at: string;

  // Campos calculados del Resource
  monto_con_comision: number;
  es_pagado: boolean;
  es_pendiente: boolean;
  es_fallido: boolean;
  comision_porcentual: number;
  estado_detallado: EstadoDetallado;
  metodo_detallado: MetodoDetallado;
  es_cuota: boolean;
  dias_desde_pago: number | null;

  // Relaciones
  metodo_pago?: MetodoPagoInfo;
  pedido?: PedidoInfo;
}

/**
 * Interface para información del método de pago
 */
export interface MetodoPagoInfo {
  id: number;
  nombre: string;
  tipo: string;
  slug: string;
  logo_url: string;
  permite_cuotas: boolean;
  comision_porcentaje: number;
  comision_fija: number;
}

/**
 * Interface para información del pedido
 */
export interface PedidoInfo {
  id: number;
  numero_pedido: string;
  total: number;
  estado: string;
  tipo_pago: string;
  cuotas: number | null;
  moneda: string;
  usuario?: UsuarioInfo;
}

/**
 * Interface para información del usuario
 */
export interface UsuarioInfo {
  id: number;
  nombre: string;
  email: string;
}

/**
 * Interface para estado detallado
 */
export interface EstadoDetallado {
  codigo: string;
  nombre: string;
  color: string;
}

/**
 * Interface para método detallado
 */
export interface MetodoDetallado {
  codigo: string;
  nombre: string;
  requiere_referencia: boolean;
}

/**
 * Enum para estados de pago (basado en el controlador)
 */
export enum EstadoPago {
  PENDIENTE = 'pendiente',
  PROCESANDO = 'procesando',
  AUTORIZADO = 'autorizado',
  COMPLETADO = 'completado',
  PAGADO = 'pagado',
  FALLIDO = 'fallido',
  RECHAZADO = 'rechazado',
  CANCELADO = 'cancelado',
  REEMBOLSADO = 'reembolsado',
  PARCIALMENTE_REEMBOLSADO = 'parcialmente_reembolsado',
  EN_DISPUTA = 'en_disputa',
  EXPIRADO = 'expirado',
  ATRASADO = 'atrasado',
}

/**
 * Enum para métodos de pago disponibles
 */
export enum MetodoPago {
  EFECTIVO = 'efectivo',
  TARJETA_CREDITO = 'tarjeta_credito',
  TARJETA_DEBITO = 'tarjeta_debito',
  TRANSFERENCIA_BANCARIA = 'transferencia_bancaria',
  DEPOSITO_BANCARIO = 'deposito_bancario',
  YAPE = 'yape',
  PLIN = 'plin',
  PAYPAL = 'paypal',
  MERCADO_PAGO = 'mercado_pago',
  VISA_NET = 'visa_net',
  MASTERCARD = 'mastercard',
  AMERICAN_EXPRESS = 'american_express',
  DINERS_CLUB = 'diners_club',
  CREDITO_TIENDA = 'credito_tienda',
  BITCOIN = 'bitcoin',
  OTROS = 'otros',
}

/**
 * DTO para crear un nuevo pago
 */
export interface CreatePagoDto {
  pedido_id: number;
  metodo_pago_id?: number;
  monto: number;
  numero_cuota?: number;
  fecha_pago?: string;
  estado?: EstadoPago;
  metodo: string;
  referencia?: string;
  moneda?: 'PEN' | 'USD' | 'EUR';
  respuesta_proveedor?: Record<string, any>;
  codigo_autorizacion?: string;
  observaciones?: string;
}

/**
 * DTO para actualizar un pago existente
 */
export interface UpdatePagoDto {
  estado?: EstadoPago;
  codigo_autorizacion?: string;
  referencia?: string;
  observaciones?: string;
  respuesta_proveedor?: Record<string, any>;
  fecha_pago?: string;
  monto?: number;
}

/**
 * Filtros para búsqueda y listado de pagos
 */
export interface PagoFilters extends BaseFilters {
  pedido_id?: number;
  metodo_pago_id?: number;
  estado?: EstadoPago;
  metodo?: string;
  moneda?: 'PEN' | 'USD' | 'EUR';
  monto_min?: number;
  monto_max?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  numero_cuota?: number;
  referencia?: string;
  codigo_autorizacion?: string;
  comision_min?: number;
  comision_max?: number;
  search?: string;
  sort_field?:
    | 'id'
    | 'monto'
    | 'fecha_pago'
    | 'estado'
    | 'metodo'
    | 'created_at';
  sort_direction?: 'asc' | 'desc';
  per_page?: number;
}

/**
 * Interface para resumen de pagos por pedido
 */
export interface ResumenPagosPedido {
  total_pedido: number;
  total_pagado: number;
  total_pendiente: number;
  saldo_restante: number;
  cantidad_pagos: number;
  ultimo_pago: string | null;
}

/**
 * Interface para estadísticas de pagos
 */
export interface PagoEstadisticas {
  resumen_general: {
    total_pagos: number;
    monto_total: number;
    pagos_completados: number;
    pagos_pendientes: number;
    pagos_fallidos: number;
    monto_completado: number;
    monto_pendiente: number;
  };
  por_metodo: Array<{
    metodo: string;
    cantidad: number;
    monto_total: number;
  }>;
  por_estado: Array<{
    estado: string;
    cantidad: number;
    monto_total: number;
  }>;
  por_moneda: Array<{
    moneda: string;
    cantidad: number;
    monto_total: number;
  }>;
  tendencia_diaria: Array<{
    fecha: string;
    cantidad: number;
    monto_total: number;
  }>;
  pagos_mas_altos: Array<{
    id: number;
    monto: number;
    metodo: string;
    fecha: string;
    cliente: string;
    pedido_id: number;
  }>;
}

/**
 * Interface para procesamiento de pagos
 */
export interface ProcesarPagoRequest {
  pago_id: number;
  datos_tarjeta?: DatosTarjeta;
  datos_transferencia?: DatosTransferencia;
  datos_billetera_digital?: DatosBilleteraDigital;
  confirmar_procesamiento?: boolean;
  notificar_cliente?: boolean;
}

/**
 * Interface para datos de tarjeta
 */
export interface DatosTarjeta {
  numero_tarjeta: string;
  mes_expiracion: string;
  año_expiracion: string;
  cvv: string;
  nombre_titular: string;
  tipo_documento?: string;
  numero_documento?: string;
  direccion_facturacion?: DireccionFacturacion;
}

/**
 * Interface para datos de transferencia bancaria
 */
export interface DatosTransferencia {
  banco_origen: string;
  numero_cuenta_origen?: string;
  banco_destino: string;
  numero_cuenta_destino: string;
  numero_operacion: string;
  fecha_operacion: string;
  comprobante_url?: string;
}

/**
 * Interface para billeteras digitales
 */
export interface DatosBilleteraDigital {
  numero_telefono?: string;
  email?: string;
  codigo_qr?: string;
  token_autorizacion?: string;
  app_utilizada: 'yape' | 'plin' | 'paypal' | 'mercado_pago' | 'otros';
}

/**
 * Interface para dirección de facturación
 */
export interface DireccionFacturacion {
  direccion: string;
  ciudad: string;
  estado_provincia: string;
  codigo_postal: string;
  pais: string;
}

/**
 * Interface para respuesta de procesamiento
 */
export interface ProcesarPagoResponse {
  success: boolean;
  pago: Pago;
  codigo_autorizacion?: string;
  referencia_transaccion?: string;
  mensaje: string;
  requiere_accion_adicional?: boolean;
  url_redireccion?: string;
  tiempo_expiracion?: string;
  datos_adicionales?: Record<string, any>;
}

/**
 * Interface para reembolsos
 */
export interface ReembolsoRequest {
  pago_id: number;
  monto_reembolso?: number;
  motivo: string;
  tipo_reembolso: 'total' | 'parcial';
  notificar_cliente?: boolean;
  procesar_inmediatamente?: boolean;
}

/**
 * Interface para reembolso response
 */
export interface ReembolsoResponse {
  success: boolean;
  reembolso_id: number;
  monto_reembolsado: number;
  referencia_reembolso: string;
  fecha_procesamiento: string;
  estado: 'procesando' | 'completado' | 'fallido';
  mensaje: string;
}

/**
 * Interface para configuración de métodos de pago
 */
export interface ConfiguracionMetodoPago {
  metodo: MetodoPago;
  activo: boolean;
  nombre_mostrar: string;
  descripcion?: string;
  icono?: string;
  comision_porcentaje?: number;
  comision_fija?: number;
  monto_minimo?: number;
  monto_maximo?: number;
  monedas_soportadas: Array<'PEN' | 'USD' | 'EUR'>;
  requiere_autorizacion: boolean;
  tiempo_expiracion_minutos?: number;
  configuracion_adicional?: Record<string, any>;
}

/**
 * Interface para conciliación de pagos
 */
export interface ConciliacionPago {
  fecha_conciliacion: string;
  total_pagos_sistema: number;
  total_pagos_banco: number;
  diferencia: number;
  pagos_conciliados: number;
  pagos_pendientes: number;
  pagos_con_diferencias: Array<{
    pago_id: number;
    monto_sistema: number;
    monto_banco: number;
    diferencia: number;
    estado_conciliacion: 'pendiente' | 'resuelto' | 'en_revision';
  }>;
}

/**
 * Interface para notificaciones de pago
 */
export interface NotificacionPago {
  tipo: 'webhook' | 'email' | 'sms' | 'push';
  evento:
    | 'pago_creado'
    | 'pago_completado'
    | 'pago_fallido'
    | 'reembolso_procesado';
  destinatario: string;
  datos_pago: Partial<Pago>;
  plantilla?: string;
  programada_para?: string;
}

/**
 * Interface para auditoria de pagos
 */
export interface AuditoriaPago {
  id: number;
  pago_id: number;
  accion: string;
  usuario_id: number;
  usuario_nombre: string;
  datos_anteriores?: Record<string, any>;
  datos_nuevos?: Record<string, any>;
  ip_origen: string;
  user_agent: string;
  fecha_accion: string;
  observaciones?: string;
}

/**
 * Respuesta paginada para pagos
 */
export interface PagoPaginatedResponse extends PaginatedResponse<Pago> {
  estadisticas_resumen?: {
    total_monto_pagina: number;
    pagos_exitosos_pagina: number;
    pagos_pendientes_pagina: number;
    pagos_fallidos_pagina: number;
  };
}

/**
 * Constantes para pagos
 */
export const PAGO_CONSTANTS = {
  MONTO_MINIMO: 0.01,
  MONTO_MAXIMO: 999999.99,
  COMISION_MAXIMA_PORCENTAJE: 10,
  TIEMPO_EXPIRACION_DEFAULT_MINUTOS: 30,
  INTENTOS_MAXIMOS_PROCESAMIENTO: 3,
  MONEDAS_SOPORTADAS: ['PEN', 'USD', 'EUR'] as const,
  DECIMALES_MONTO: 2,

  METODOS_REQUIEREN_AUTORIZACION: [
    MetodoPago.TARJETA_CREDITO,
    MetodoPago.TARJETA_DEBITO,
    MetodoPago.PAYPAL,
    MetodoPago.MERCADO_PAGO,
  ] as const,

  METODOS_INSTANTANEOS: [
    MetodoPago.EFECTIVO,
    MetodoPago.YAPE,
    MetodoPago.PLIN,
  ] as const,

  ESTADOS_FINALES: [
    EstadoPago.COMPLETADO,
    EstadoPago.PAGADO,
    EstadoPago.CANCELADO,
    EstadoPago.REEMBOLSADO,
    EstadoPago.EXPIRADO,
  ] as const,

  ESTADOS_EXITOSOS: [EstadoPago.PAGADO, EstadoPago.COMPLETADO] as const,

  ESTADOS_PENDIENTES: [
    EstadoPago.PENDIENTE,
    EstadoPago.PROCESANDO,
    EstadoPago.AUTORIZADO,
  ] as const,

  ESTADOS_FALLIDOS: [
    EstadoPago.FALLIDO,
    EstadoPago.RECHAZADO,
    EstadoPago.CANCELADO,
    EstadoPago.EXPIRADO,
  ] as const,
} as const;

/**
 * Tipos de utilidad para pagos
 */
export type MonedaPago = (typeof PAGO_CONSTANTS.MONEDAS_SOPORTADAS)[number];
export type MetodoRequiereAutorizacion =
  (typeof PAGO_CONSTANTS.METODOS_REQUIEREN_AUTORIZACION)[number];
export type MetodoInstantaneo =
  (typeof PAGO_CONSTANTS.METODOS_INSTANTANEOS)[number];
export type EstadoFinal = (typeof PAGO_CONSTANTS.ESTADOS_FINALES)[number];
export type EstadoExitoso = (typeof PAGO_CONSTANTS.ESTADOS_EXITOSOS)[number];
export type EstadoPendiente =
  (typeof PAGO_CONSTANTS.ESTADOS_PENDIENTES)[number];
export type EstadoFallido = (typeof PAGO_CONSTANTS.ESTADOS_FALLIDOS)[number];
export type CampoOrdenamientoPago =
  | 'id'
  | 'monto'
  | 'fecha_pago'
  | 'created_at'
  | 'estado'
  | 'metodo';

/**
 * Funciones de utilidad para pagos
 */
export const PagoUtils = {
  /**
   * Verifica si un método de pago requiere autorización
   */
  requiereAutorizacion: (metodo: MetodoPago): boolean => {
    return PAGO_CONSTANTS.METODOS_REQUIEREN_AUTORIZACION.includes(
      metodo as any
    );
  },

  /**
   * Verifica si un método de pago es instantáneo
   */
  esInstantaneo: (metodo: MetodoPago): boolean => {
    return PAGO_CONSTANTS.METODOS_INSTANTANEOS.includes(metodo as any);
  },

  /**
   * Verifica si un estado es final
   */
  esEstadoFinal: (estado: EstadoPago): boolean => {
    return PAGO_CONSTANTS.ESTADOS_FINALES.includes(estado as any);
  },

  /**
   * Verifica si un estado es exitoso
   */
  esEstadoExitoso: (estado: EstadoPago): boolean => {
    return PAGO_CONSTANTS.ESTADOS_EXITOSOS.includes(estado as any);
  },

  /**
   * Verifica si un estado es pendiente
   */
  esEstadoPendiente: (estado: EstadoPago): boolean => {
    return PAGO_CONSTANTS.ESTADOS_PENDIENTES.includes(estado as any);
  },

  /**
   * Verifica si un estado es fallido
   */
  esEstadoFallido: (estado: EstadoPago): boolean => {
    return PAGO_CONSTANTS.ESTADOS_FALLIDOS.includes(estado as any);
  },

  /**
   * Calcula la comisión de un pago
   */
  calcularComision: (
    monto: number,
    porcentaje: number,
    fija: number = 0
  ): number => {
    return (monto * porcentaje) / 100 + fija;
  },

  /**
   * Formatea el monto según la moneda
   */
  formatearMonto: (monto: number, moneda: MonedaPago): string => {
    const simbolos = { PEN: 'S/', USD: '$', EUR: '€' };
    return `${simbolos[moneda]} ${monto.toFixed(
      PAGO_CONSTANTS.DECIMALES_MONTO
    )}`;
  },

  /**
   * Obtiene el color del estado
   */
  obtenerColorEstado: (estado: EstadoPago): string => {
    if (PagoUtils.esEstadoExitoso(estado)) return 'green';
    if (PagoUtils.esEstadoPendiente(estado)) return 'yellow';
    if (PagoUtils.esEstadoFallido(estado)) return 'red';
    return 'gray';
  },

  /**
   * Obtiene el nombre legible del estado
   */
  obtenerNombreEstado: (estado: EstadoPago): string => {
    const nombres: Record<EstadoPago, string> = {
      [EstadoPago.PENDIENTE]: 'Pendiente',
      [EstadoPago.PROCESANDO]: 'Procesando',
      [EstadoPago.AUTORIZADO]: 'Autorizado',
      [EstadoPago.COMPLETADO]: 'Completado',
      [EstadoPago.PAGADO]: 'Pagado',
      [EstadoPago.FALLIDO]: 'Fallido',
      [EstadoPago.RECHAZADO]: 'Rechazado',
      [EstadoPago.CANCELADO]: 'Cancelado',
      [EstadoPago.REEMBOLSADO]: 'Reembolsado',
      [EstadoPago.PARCIALMENTE_REEMBOLSADO]: 'Parcialmente Reembolsado',
      [EstadoPago.EN_DISPUTA]: 'En Disputa',
      [EstadoPago.EXPIRADO]: 'Expirado',
      [EstadoPago.ATRASADO]: 'Atrasado',
    };
    return nombres[estado] || 'Estado desconocido';
  },

  /**
   * Obtiene el nombre legible del método
   */
  obtenerNombreMetodo: (metodo: string): string => {
    const nombres: Record<string, string> = {
      efectivo: 'Efectivo',
      tarjeta_credito: 'Tarjeta de Crédito',
      tarjeta_debito: 'Tarjeta de Débito',
      transferencia_bancaria: 'Transferencia Bancaria',
      deposito_bancario: 'Depósito Bancario',
      yape: 'Yape',
      plin: 'Plin',
      paypal: 'PayPal',
      mercado_pago: 'Mercado Pago',
      visa_net: 'Visa Net',
      mastercard: 'Mastercard',
      american_express: 'American Express',
      diners_club: 'Diners Club',
      credito_tienda: 'Crédito de Tienda',
      bitcoin: 'Bitcoin',
      otros: 'Otros',
    };
    return nombres[metodo] || 'Método no especificado';
  },

  /**
   * Verifica si un método requiere referencia
   */
  requiereReferencia: (metodo: string): boolean => {
    return ['transferencia_bancaria', 'yape', 'plin', 'paypal'].includes(
      metodo
    );
  },

  /**
   * Filtra pagos por estado
   */
  filtrarPorEstado: (pagos: Pago[], estado: EstadoPago): Pago[] => {
    return pagos.filter((pago) => pago.estado === estado);
  },

  /**
   * Filtra pagos por método
   */
  filtrarPorMetodo: (pagos: Pago[], metodo: string): Pago[] => {
    return pagos.filter((pago) => pago.metodo === metodo);
  },

  /**
   * Agrupa pagos por estado
   */
  agruparPorEstado: (pagos: Pago[]): Record<EstadoPago, Pago[]> => {
    return pagos.reduce((grupos, pago) => {
      if (!grupos[pago.estado]) {
        grupos[pago.estado] = [];
      }
      grupos[pago.estado].push(pago);
      return grupos;
    }, {} as Record<EstadoPago, Pago[]>);
  },

  /**
   * Agrupa pagos por método
   */
  agruparPorMetodo: (pagos: Pago[]): Record<string, Pago[]> => {
    return pagos.reduce((grupos, pago) => {
      if (!grupos[pago.metodo]) {
        grupos[pago.metodo] = [];
      }
      grupos[pago.metodo].push(pago);
      return grupos;
    }, {} as Record<string, Pago[]>);
  },

  /**
   * Calcula el total de pagos
   */
  calcularTotal: (pagos: Pago[]): number => {
    return pagos.reduce((total, pago) => total + pago.monto, 0);
  },

  /**
   * Calcula el total de comisiones
   */
  calcularTotalComisiones: (pagos: Pago[]): number => {
    return pagos.reduce((total, pago) => total + pago.comision, 0);
  },

  /**
   * Obtiene el último pago
   */
  obtenerUltimoPago: (pagos: Pago[]): Pago | null => {
    if (pagos.length === 0) return null;
    return pagos.reduce((ultimo, pago) =>
      new Date(pago.fecha_pago) > new Date(ultimo.fecha_pago) ? pago : ultimo
    );
  },

  /**
   * Busca pagos por texto
   */
  buscarPagos: (pagos: Pago[], termino: string): Pago[] => {
    const terminoLower = termino.toLowerCase();
    return pagos.filter(
      (pago) =>
        pago.referencia?.toLowerCase().includes(terminoLower) ||
        pago.metodo.toLowerCase().includes(terminoLower) ||
        pago.codigo_autorizacion?.toLowerCase().includes(terminoLower) ||
        pago.observaciones?.toLowerCase().includes(terminoLower)
    );
  },
};
