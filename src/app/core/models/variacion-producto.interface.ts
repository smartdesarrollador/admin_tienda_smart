import { Producto } from './producto.interface';

// Interfaz principal de VariacionProducto
export interface VariacionProducto {
  id: number;
  producto_id: number;
  sku: string;
  precio: number;
  precio_oferta: number | null;
  stock: number;
  activo: boolean;
  atributos: Record<string, any> | null;
  created_at: string;
  updated_at: string;

  // Campos calculados
  disponible?: boolean;
  estado_stock?: 'sin_stock' | 'stock_limitado' | 'disponible';
  descuento_porcentaje?: number;

  // Relaciones
  producto?: Producto;
  imagenes?: ImagenVariacion[];
  valores_atributos?: ValorAtributo[];
}

// Interfaz simplificada para listados
export interface VariacionProductoSimple {
  id: number;
  producto_id: number;
  sku: string;
  precio: number;
  precio_oferta: number | null;
  stock: number;
  activo: boolean;
  atributos: Record<string, any> | null;
  disponible: boolean;
  estado_stock: 'sin_stock' | 'stock_limitado' | 'disponible';
  descuento_porcentaje: number;
}

// Interfaz para imágenes de variaciones
export interface ImagenVariacion {
  id: number;
  variacion_producto_id: number;
  url: string;
  alt: string | null;
  principal: boolean;
  orden: number;
  created_at: string;
  updated_at: string;
}

// Interfaz para valores de atributos
export interface ValorAtributo {
  id: number;
  atributo_id: number;
  valor: string;
  color_hex: string | null;
  imagen: string | null;
  activo: boolean;
  orden: number | null;
  created_at: string;
  updated_at: string;
  atributo?: Atributo;
}

// Interfaz para atributos
export interface Atributo {
  id: number;
  nombre: string;
  slug: string;
  tipo: 'texto' | 'color' | 'imagen' | 'numero';
  requerido: boolean;
  activo: boolean;
  orden: number | null;
  created_at: string;
  updated_at: string;
}

// Request interfaces
export interface CreateVariacionProductoRequest {
  producto_id: number;
  sku: string;
  precio: number;
  precio_oferta?: number | null;
  stock: number;
  activo?: boolean;
  atributos?: Record<string, any> | null;
  valores_atributos?: number[];
}

export interface UpdateVariacionProductoRequest {
  producto_id?: number;
  sku?: string;
  precio?: number;
  precio_oferta?: number | null;
  stock?: number;
  activo?: boolean;
  atributos?: Record<string, any> | null;
  valores_atributos?: number[];
}

// Response interfaces
export interface VariacionProductoResponse {
  success: boolean;
  data: VariacionProducto;
  message?: string;
}

export interface VariacionesProductoResponse {
  success: boolean;
  data: VariacionProducto[];
  pagination: VariacionProductoPagination;
  filters: VariacionProductoFilters;
  message?: string;
}

export interface VariacionesByProductoResponse {
  success: boolean;
  data: VariacionProducto[];
  producto: {
    id: number;
    nombre: string;
    sku: string;
  };
  message?: string;
}

// Pagination interfaces
export interface VariacionProductoPagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

// Filter interfaces
export interface VariacionProductoFilters {
  producto_id?: number | null;
  activo?: boolean | null;
  con_stock?: boolean | null;
  precio_min?: number | null;
  precio_max?: number | null;
  search?: string | null;
  sort_by?:
    | 'id'
    | 'sku'
    | 'precio'
    | 'precio_oferta'
    | 'stock'
    | 'activo'
    | 'created_at';
  sort_order?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}

// Form data interface
export interface VariacionProductoFormData {
  producto_id: number;
  sku: string;
  precio: number;
  precio_oferta: number | null;
  stock: number;
  activo: boolean;
  atributos: Record<string, any>;
  valores_atributos: number[];
}

// Stock update interface
export interface UpdateStockRequest {
  stock: number;
  operacion?: 'set' | 'add' | 'subtract';
}

export interface UpdateStockResponse {
  success: boolean;
  data: VariacionProducto;
  stock_anterior: number;
  stock_nuevo: number;
  message: string;
}

// Error interface
export interface VariacionProductoApiError {
  success: false;
  message: string;
  error?: string;
  errors?: Record<string, string[]>;
}

// State interface para gestión de estado
export interface VariacionProductoState {
  variaciones: VariacionProducto[];
  currentVariacion: VariacionProducto | null;
  loading: boolean;
  error: string | null;
  filters: VariacionProductoFilters;
  pagination: VariacionProductoPagination | null;
}

// Enum para estados de stock
export enum EstadoStock {
  SIN_STOCK = 'sin_stock',
  STOCK_LIMITADO = 'stock_limitado',
  DISPONIBLE = 'disponible',
}

// Enum para operaciones de stock
export enum OperacionStock {
  SET = 'set',
  ADD = 'add',
  SUBTRACT = 'subtract',
}

// Enum para campos de ordenamiento
export enum SortField {
  ID = 'id',
  SKU = 'sku',
  PRECIO = 'precio',
  PRECIO_OFERTA = 'precio_oferta',
  STOCK = 'stock',
  ACTIVO = 'activo',
  CREATED_AT = 'created_at',
}

// Enum para dirección de ordenamiento
export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}
