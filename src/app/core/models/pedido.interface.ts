import {
  PaginationMeta,
  PaginationLinks,
  PaginatedResponse,
  BaseFilters,
} from './common.interface';

export interface Pedido {
  id: number;
  numero_pedido: string;
  user_id: number;
  metodo_pago_id: number | null;
  zona_reparto_id: number | null;
  direccion_validada_id: number | null;
  total: number;
  subtotal: number;
  descuento: number;
  descuento_total: number;
  costo_envio: number;
  igv: number;
  estado: EstadoPedido;
  tipo_pago: TipoPago;
  tipo_entrega: TipoEntrega;
  cuotas: number | null;
  monto_cuota: number | null;
  interes_total: number | null;
  datos_envio: string | null;
  metodo_envio: string | null;
  datos_cliente: string | null;
  cupon_codigo: string | null;
  observaciones: string | null;
  codigo_rastreo: string | null;
  moneda: Moneda;
  canal_venta: CanalVenta;
  tiempo_entrega_estimado: number | null;
  fecha_entrega_programada: string | null;
  fecha_entrega_real: string | null;
  direccion_entrega: string | null;
  telefono_entrega: string | null;
  referencia_entrega: string | null;
  latitud_entrega: number | null;
  longitud_entrega: number | null;
  repartidor_id: number | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;

  // Campos calculados
  total_con_descuento: number;
  es_credito: boolean;
  estado_detallado: EstadoDetallado;
  tiempo_entrega_texto: string | null;
  coordenadas_entrega: Coordenadas | null;
  puede_cancelar: boolean;
  estimado_entrega: string | null;
  es_delivery: boolean;
  es_recojo_tienda: boolean;

  // Relaciones
  usuario: UsuarioPedido | null;
  cliente: ClientePedido | null;
  metodo_pago: MetodoPagoPedido | null;
  zona_reparto: ZonaRepartoPedido | null;
  direccion_validada: DireccionValidadaPedido | null;
  repartidor: RepartidorPedido | null;
  detalles: DetallePedido[];
  pagos?: Pago[];
  cuotas_credito?: CuotaCredito[];
  seguimientos?: SeguimientoPedido[];
  programacion_entrega?: ProgramacionEntrega;

  // Estadísticas del pedido
  estadisticas: EstadisticasPedido;
}

export interface DetallePedido {
  id: number;
  producto_id: number;
  variacion_id: number | null;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  descuento: number;
  impuesto: number;
  moneda: Moneda;

  // Relaciones
  producto: ProductoPedido | null;
  variacion: VariacionPedido | null;
  adicionales: DetalleAdicional[];
}

export interface DetalleAdicional {
  id: number;
  adicional_id: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  adicional: AdicionalPedido | null;
}

export interface AdicionalPedido {
  id: number;
  nombre: string;
}

export interface UsuarioPedido {
  id: number;
  nombre: string;
  email: string;
  telefono?: string;
}

export interface ClientePedido {
  id: number;
  nombre_completo: string;
  documento: string;
  telefono: string;
  activo: boolean;
}

export interface MetodoPagoPedido {
  id: number;
  nombre: string;
  tipo: string;
  slug: string;
  logo_url: string | null;
  permite_cuotas: boolean;
  comision_porcentaje: number;
  comision_fija: number;
}

export interface ZonaRepartoPedido {
  id: number;
  nombre: string;
  slug: string;
  costo_envio: number;
  tiempo_entrega_min: number;
  tiempo_entrega_max: number;
  activo: boolean;
}

export interface DireccionValidadaPedido {
  id: number;
  direccion_id: number;
  zona_reparto_id: number;
  en_zona_cobertura: boolean;
  costo_envio_calculado: number;
  distancia_tienda_km: number | null;
}

export interface RepartidorPedido {
  id: number;
  nombre: string;
  email: string;
  telefono?: string;
}

export interface ProductoPedido {
  id: number;
  nombre: string;
  sku: string;
  imagen_principal: string;
}

export interface VariacionPedido {
  id: number;
  sku: string;
  nombre: string;
  precio: number;
  precio_oferta: number | null;
}

export interface EstadisticasPedido {
  total_pagado?: number;
  saldo_pendiente?: number;
  cantidad_items: number;
  productos_diferentes: number;
  total_adicionales?: number;
}

export interface Pago {
  id: number;
  monto: number;
  comision: number;
  numero_cuota: number | null;
  fecha_pago: string | null;
  estado: EstadoPago;
  metodo: string;
  referencia: string | null;
  codigo_autorizacion: string | null;
  monto_con_comision: number;
  es_pagado: boolean;
  metodo_pago: MetodoPagoPago | null;
}

export interface MetodoPagoPago {
  id: number;
  nombre: string;
  tipo: string;
}

export interface CuotaCredito {
  id: number;
  numero_cuota: number;
  monto: number;
  fecha_vencimiento: string | null;
  fecha_pago: string | null;
  estado: EstadoCuota;
  observaciones: string | null;
}

export interface SeguimientoPedido {
  id: number;
  estado_anterior: EstadoPedido;
  estado_actual: EstadoPedido;
  observaciones: string | null;
  fecha_cambio: string;
  usuario_cambio: UsuarioCambio | null;
}

export interface UsuarioCambio {
  id: number;
  nombre: string;
}

export interface ProgramacionEntrega {
  id: number;
  repartidor_id: number;
  fecha_programada: string;
  hora_inicio_ventana: string | null;
  hora_fin_ventana: string | null;
  estado: EstadoProgramacion;
  orden_ruta: number | null;
}

export interface EstadoDetallado {
  codigo: EstadoPedido;
  nombre: string;
  descripcion: string;
  color: string;
  icono: string;
}

export interface Coordenadas {
  lat: number;
  lng: number;
}

// Enums y tipos
export type EstadoPedido =
  | 'pendiente'
  | 'aprobado'
  | 'rechazado'
  | 'en_proceso'
  | 'enviado'
  | 'entregado'
  | 'cancelado'
  | 'devuelto';

export type TipoPago =
  | 'contado'
  | 'credito'
  | 'transferencia'
  | 'tarjeta'
  | 'yape'
  | 'plin'
  | 'paypal';

export type TipoEntrega = 'delivery' | 'recojo_tienda';

export type CanalVenta =
  | 'web'
  | 'app'
  | 'tienda_fisica'
  | 'telefono'
  | 'whatsapp';

export type Moneda = 'PEN' | 'USD' | 'EUR';

export type EstadoPago = 'pendiente' | 'pagado' | 'atrasado' | 'cancelado';

export type EstadoCuota = 'pendiente' | 'pagada' | 'atrasada' | 'cancelada';

export type EstadoProgramacion =
  | 'programado'
  | 'en_ruta'
  | 'entregado'
  | 'cancelado';

// DTOs para crear y actualizar pedidos
export interface CreatePedidoDto {
  user_id: number;
  metodo_pago_id?: number;
  zona_reparto_id?: number;
  direccion_validada_id?: number;
  tipo_pago: TipoPago;
  tipo_entrega?: TipoEntrega;
  cuotas?: number;
  observaciones?: string;
  canal_venta?: CanalVenta;
  moneda?: Moneda;
  fecha_entrega_programada?: string;
  direccion_entrega?: string;
  telefono_entrega?: string;
  referencia_entrega?: string;
  latitud_entrega?: number;
  longitud_entrega?: number;
  datos_envio?: any;
  metodo_envio?: any;
  datos_cliente?: any;
  cupon_codigo?: string;
  items: CreateDetallePedidoDto[];
}

export interface CreateDetallePedidoDto {
  producto_id: number;
  variacion_id?: number;
  cantidad: number;
  descuento?: number;
}

export interface UpdatePedidoDto {
  metodo_pago_id?: number;
  zona_reparto_id?: number;
  direccion_validada_id?: number;
  observaciones?: string;
  canal_venta?: CanalVenta;
  codigo_rastreo?: string;
  fecha_entrega_programada?: string;
  direccion_entrega?: string;
  telefono_entrega?: string;
  referencia_entrega?: string;
  latitud_entrega?: number;
  longitud_entrega?: number;
  datos_cliente?: any;
  datos_envio?: any;
  metodo_envio?: any;
}

export interface CambiarEstadoDto {
  estado: EstadoPedido;
  observaciones?: string;
  codigo_rastreo?: string;
  repartidor_id?: number;
  fecha_entrega_real?: string;
}

export interface AplicarCuponDto {
  codigo_cupon: string;
}

export interface AsignarRepartidorDto {
  repartidor_id: number;
  fecha_programada?: string;
  hora_inicio_ventana?: string;
  hora_fin_ventana?: string;
}

// Filtros para búsqueda de pedidos
export interface PedidoFilters extends BaseFilters {
  user_id?: number;
  metodo_pago_id?: number;
  zona_reparto_id?: number;
  repartidor_id?: number;
  estado?: EstadoPedido | EstadoPedido[];
  tipo_pago?: TipoPago | TipoPago[];
  tipo_entrega?: TipoEntrega | TipoEntrega[];
  fecha_desde?: string;
  fecha_hasta?: string;
  fecha_entrega_desde?: string;
  fecha_entrega_hasta?: string;
  total_min?: number;
  total_max?: number;
  canal_venta?: CanalVenta;
  codigo_rastreo?: string;
  numero_pedido?: string;
  sort_by?:
    | 'created_at'
    | 'updated_at'
    | 'total'
    | 'estado'
    | 'tipo_pago'
    | 'tipo_entrega'
    | 'fecha_entrega_programada'
    | 'numero_pedido';
  sort_direction?: 'asc' | 'desc';
}

// Respuestas de la API
export interface PedidoResponse extends PaginatedResponse<Pedido> {}

export interface EstadisticasPedidos {
  resumen: ResumenEstadisticas;
  por_estado: EstadisticaPorEstado[];
  por_tipo_pago: EstadisticaPorTipoPago[];
  por_tipo_entrega: EstadisticaPorTipoEntrega[];
  por_zona_reparto: EstadisticaPorZonaReparto[];
  por_canal_venta: EstadisticaPorCanalVenta[];
  ventas_diarias: VentaDiaria[];
  top_clientes: TopCliente[];
  top_repartidores: TopRepartidor[];
  productos_mas_vendidos: ProductoMasVendido[];
  tiempos_entrega: TiemposEntrega;
}

export interface ResumenEstadisticas {
  total_pedidos: number;
  total_ventas: number;
  ticket_promedio: number;
  pedidos_pendientes: number;
  pedidos_entregados: number;
  total_deliveries: number;
  total_recojos: number;
  ingresos_envio: number;
}

export interface EstadisticaPorEstado {
  estado: EstadoPedido;
  cantidad: number;
  total_ventas: number;
}

export interface EstadisticaPorTipoPago {
  tipo_pago: TipoPago;
  cantidad: number;
  total_ventas: number;
}

export interface EstadisticaPorTipoEntrega {
  tipo_entrega: TipoEntrega;
  cantidad: number;
  total_ventas: number;
  total_envios: number;
}

export interface EstadisticaPorZonaReparto {
  zona_reparto_id: number;
  zona_reparto: ZonaRepartoPedido;
  cantidad: number;
  total_ventas: number;
  tiempo_promedio: number;
}

export interface EstadisticaPorCanalVenta {
  canal_venta: CanalVenta;
  cantidad: number;
  total_ventas: number;
}

export interface VentaDiaria {
  fecha: string;
  pedidos: number;
  ventas: number;
  envios: number;
}

export interface TopCliente {
  id: number;
  nombre: string;
  email: string;
  pedidos_count: number;
  pedidos_sum_total: number;
}

export interface TopRepartidor {
  id: number;
  nombre: string;
  email: string;
  pedidos_como_repartidor_count: number;
}

export interface ProductoMasVendido {
  producto_id: number;
  total_vendido: number;
  total_ingresos: number;
  producto: {
    id: number;
    nombre: string;
    sku: string;
  };
}

export interface TiemposEntrega {
  promedio_general: number;
  promedio_delivery: number;
  cumplimiento_entregas: {
    total_programadas: number;
    entregadas_a_tiempo: number;
  };
}

export interface EstadisticasResponse {
  estadisticas: EstadisticasPedidos;
  periodo: {
    desde: string;
    hasta: string;
    dias: number;
  };
}

export interface PedidosPorUsuarioResponse {
  data: Pedido[];
  meta: PaginationMeta;
  usuario: UsuarioPedido;
}

export interface AplicarCuponResponse {
  message: string;
  descuento_aplicado: number;
  total_anterior: number;
  nuevo_total: number;
  pedido: Pedido;
}

export interface PedidosPorRepartidorResponse {
  data: Pedido[];
  resumen: {
    total_pedidos: number;
    pedidos_enviados: number;
    pedidos_entregados: number;
    total_ventas: number;
  };
}

export interface RastrearPedidoResponse {
  pedido: {
    id: number;
    numero_pedido: string;
    estado: EstadoPedido;
    fecha_pedido: string;
    fecha_entrega_programada: string | null;
    fecha_entrega_real: string | null;
    tipo_entrega: TipoEntrega;
    direccion_entrega: string | null;
    tiempo_entrega_estimado: number | null;
    zona_reparto: ZonaRepartoPedido | null;
    repartidor: RepartidorPedido | null;
  };
  seguimiento: SeguimientoRastreo[];
}

export interface SeguimientoRastreo {
  estado_anterior: EstadoPedido;
  estado_actual: EstadoPedido;
  fecha_cambio: string;
  observaciones: string | null;
  usuario_cambio: string | null;
}

export interface PedidosPorZonaResponse {
  data: Pedido[];
  estadisticas: {
    total_pedidos: number;
    total_ventas: number;
    ingresos_envio: number;
    pedidos_por_estado: Record<EstadoPedido, number>;
    tiempo_entrega_promedio: number;
  };
}

// Constantes útiles
export const ESTADOS_PEDIDO: Record<EstadoPedido, string> = {
  pendiente: 'Pendiente',
  aprobado: 'Aprobado',
  rechazado: 'Rechazado',
  en_proceso: 'En Proceso',
  enviado: 'Enviado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
  devuelto: 'Devuelto',
};

export const TIPOS_PAGO: Record<TipoPago, string> = {
  contado: 'Contado',
  credito: 'Crédito',
  transferencia: 'Transferencia',
  tarjeta: 'Tarjeta',
  yape: 'Yape',
  plin: 'Plin',
  paypal: 'PayPal',
};

export const TIPOS_ENTREGA: Record<TipoEntrega, string> = {
  delivery: 'Delivery',
  recojo_tienda: 'Recojo en Tienda',
};

export const CANALES_VENTA: Record<CanalVenta, string> = {
  web: 'Sitio Web',
  app: 'Aplicación Móvil',
  tienda_fisica: 'Tienda Física',
  telefono: 'Teléfono',
  whatsapp: 'WhatsApp',
};

export const MONEDAS: Record<Moneda, string> = {
  PEN: 'Soles Peruanos',
  USD: 'Dólares Americanos',
  EUR: 'Euros',
};

export const SIMBOLOS_MONEDA: Record<Moneda, string> = {
  PEN: 'S/',
  USD: '$',
  EUR: '€',
};

export const COLORES_ESTADO: Record<EstadoPedido, string> = {
  pendiente: 'warning',
  aprobado: 'info',
  en_proceso: 'primary',
  enviado: 'secondary',
  entregado: 'success',
  cancelado: 'danger',
  rechazado: 'danger',
  devuelto: 'warning',
};

export const ICONOS_ESTADO: Record<EstadoPedido, string> = {
  pendiente: 'clock',
  aprobado: 'check-circle',
  en_proceso: 'gear',
  enviado: 'truck',
  entregado: 'check-circle-fill',
  cancelado: 'x-circle',
  rechazado: 'x-circle-fill',
  devuelto: 'arrow-counterclockwise',
};

// Funciones utilitarias
export function formatearTiempoEntrega(minutos: number | null): string | null {
  if (!minutos) return null;

  if (minutos < 60) {
    return `${minutos} minutos`;
  }

  const horas = Math.floor(minutos / 60);
  const minutosRestantes = minutos % 60;

  if (minutosRestantes === 0) {
    return `${horas} hora${horas > 1 ? 's' : ''}`;
  }

  return `${horas}h ${minutosRestantes}min`;
}

export function obtenerSimboloMoneda(moneda: Moneda): string {
  return SIMBOLOS_MONEDA[moneda] || moneda;
}

export function puedeEditarPedido(estado: EstadoPedido): boolean {
  return !['entregado', 'cancelado', 'devuelto'].includes(estado);
}

export function puedeEliminarPedido(estado: EstadoPedido): boolean {
  return estado === 'pendiente';
}

export function puedeCambiarEstado(
  estadoActual: EstadoPedido,
  nuevoEstado: EstadoPedido
): boolean {
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

  return transicionesValidas[estadoActual]?.includes(nuevoEstado) ?? false;
}

export function puedeAplicarCupon(estado: EstadoPedido): boolean {
  return estado === 'pendiente';
}

export function puedeCancelar(estado: EstadoPedido): boolean {
  return ['pendiente', 'aprobado'].includes(estado);
}
