import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

import { ProductoService } from '../../../../../../core/services/producto.service';
import { PedidoService } from '../../../../../../core/services/pedido.service';

export interface ProductoTop {
  id: number;
  nombre: string;
  imagen_url?: string;
  categoria: string;
  cantidad_vendida: number;
  ingresos_total: number;
  margen_promedio: number;
  precio_promedio: number;
  stock_actual: number;
  tendencia: 'up' | 'down' | 'stable';
  cambio_porcentual: number;
  rating_promedio: number;
  total_reviews: number;
}

export interface ProductosTopData {
  productos_mas_vendidos: ProductoTop[];
  productos_mas_ingresos: ProductoTop[];
  productos_mejor_margen: ProductoTop[];
  productos_tendencia: ProductoTop[];
  resumen: {
    total_productos_vendidos: number;
    ingresos_productos_top: number;
    margen_promedio_top: number;
    productos_agotados: number;
  };
}

/**
 * Componente para mostrar análisis de productos más vendidos
 * Incluye ranking por ventas, ingresos, márgenes y tendencias
 */
@Component({
  selector: 'app-productos-top',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './productos-top.component.html',
  styleUrls: ['./productos-top.component.css'],
})
export class ProductosTopComponent implements OnInit, OnDestroy {
  private readonly productoService = inject(ProductoService);
  private readonly pedidoService = inject(PedidoService);
  private readonly destroy$ = new Subject<void>();

  // Inputs
  @Input() periodo: '7d' | '30d' | '90d' | '1y' = '30d';
  @Input() limite: number = 10;

  // Signals para estado del componente
  isLoading = signal(false);
  error = signal<string | null>(null);
  productosData = signal<ProductosTopData | null>(null);
  activeView = signal<'ventas' | 'ingresos' | 'margen' | 'tendencia'>('ventas');

  // Computed signals para datos filtrados
  productosActivos = computed(() => {
    const data = this.productosData();
    const view = this.activeView();

    if (!data) return [];

    switch (view) {
      case 'ventas':
        return data.productos_mas_vendidos;
      case 'ingresos':
        return data.productos_mas_ingresos;
      case 'margen':
        return data.productos_mejor_margen;
      case 'tendencia':
        return data.productos_tendencia;
      default:
        return data.productos_mas_vendidos;
    }
  });

  // Computed signals para resumen
  totalProductosVendidos = computed(() => {
    const data = this.productosData();
    return data
      ? this.formatNumber(data.resumen.total_productos_vendidos)
      : '0';
  });

  ingresosProductosTop = computed(() => {
    const data = this.productosData();
    return data
      ? this.formatCurrency(data.resumen.ingresos_productos_top)
      : 'S/ 0';
  });

  margenPromedioTop = computed(() => {
    const data = this.productosData();
    return data ? `${data.resumen.margen_promedio_top.toFixed(1)}%` : '0%';
  });

  productosAgotados = computed(() => {
    const data = this.productosData();
    return data ? data.resumen.productos_agotados : 0;
  });

  ngOnInit(): void {
    this.loadProductosTop();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carga los datos de productos más vendidos
   */
  private loadProductosTop(): void {
    this.isLoading.set(true);
    this.error.set(null);

    // Simular datos por ahora - en producción usar servicios reales
    setTimeout(() => {
      const mockData: ProductosTopData = {
        productos_mas_vendidos: [
          {
            id: 1,
            nombre: 'Smartphone Galaxy S24',
            imagen_url: '/assets/productos/smartphone.jpg',
            categoria: 'Electrónicos',
            cantidad_vendida: 156,
            ingresos_total: 234000,
            margen_promedio: 25.5,
            precio_promedio: 1500,
            stock_actual: 45,
            tendencia: 'up',
            cambio_porcentual: 12.3,
            rating_promedio: 4.8,
            total_reviews: 89,
          },
          {
            id: 2,
            nombre: 'Laptop Gaming ROG',
            imagen_url: '/assets/productos/laptop.jpg',
            categoria: 'Computadoras',
            cantidad_vendida: 89,
            ingresos_total: 356000,
            margen_promedio: 18.2,
            precio_promedio: 4000,
            stock_actual: 12,
            tendencia: 'up',
            cambio_porcentual: 8.7,
            rating_promedio: 4.6,
            total_reviews: 45,
          },
          {
            id: 3,
            nombre: 'Auriculares Bluetooth',
            imagen_url: '/assets/productos/auriculares.jpg',
            categoria: 'Audio',
            cantidad_vendida: 234,
            ingresos_total: 46800,
            margen_promedio: 35.8,
            precio_promedio: 200,
            stock_actual: 78,
            tendencia: 'stable',
            cambio_porcentual: 2.1,
            rating_promedio: 4.4,
            total_reviews: 156,
          },
          {
            id: 4,
            nombre: 'Tablet iPad Pro',
            imagen_url: '/assets/productos/tablet.jpg',
            categoria: 'Tablets',
            cantidad_vendida: 67,
            ingresos_total: 201000,
            margen_promedio: 22.1,
            precio_promedio: 3000,
            stock_actual: 23,
            tendencia: 'down',
            cambio_porcentual: -5.4,
            rating_promedio: 4.7,
            total_reviews: 34,
          },
          {
            id: 5,
            nombre: 'Smartwatch Apple',
            imagen_url: '/assets/productos/smartwatch.jpg',
            categoria: 'Wearables',
            cantidad_vendida: 123,
            ingresos_total: 98400,
            margen_promedio: 28.9,
            precio_promedio: 800,
            stock_actual: 56,
            tendencia: 'up',
            cambio_porcentual: 15.2,
            rating_promedio: 4.5,
            total_reviews: 78,
          },
        ],
        productos_mas_ingresos: [],
        productos_mejor_margen: [],
        productos_tendencia: [],
        resumen: {
          total_productos_vendidos: 3456,
          ingresos_productos_top: 936200,
          margen_promedio_top: 26.1,
          productos_agotados: 8,
        },
      };

      // Duplicar datos para otras vistas (simplificado)
      mockData.productos_mas_ingresos = [
        ...mockData.productos_mas_vendidos,
      ].sort((a, b) => b.ingresos_total - a.ingresos_total);
      mockData.productos_mejor_margen = [
        ...mockData.productos_mas_vendidos,
      ].sort((a, b) => b.margen_promedio - a.margen_promedio);
      mockData.productos_tendencia = [...mockData.productos_mas_vendidos].sort(
        (a, b) => b.cambio_porcentual - a.cambio_porcentual
      );

      this.productosData.set(mockData);
      this.isLoading.set(false);
    }, 800);
  }

  /**
   * Cambia la vista activa
   */
  onViewChange(view: 'ventas' | 'ingresos' | 'margen' | 'tendencia'): void {
    this.activeView.set(view);
  }

  /**
   * Actualiza los datos
   */
  refreshData(): void {
    this.loadProductosTop();
  }

  /**
   * Obtiene el icono de tendencia
   */
  getTendenciaIcon(tendencia: string): string {
    switch (tendencia) {
      case 'up':
        return 'M7 14l3-3 3 3 4-4M5 21l4-4 4 4 4-4';
      case 'down':
        return 'M17 10l-3 3-3-3-4 4M5 3l4 4 4-4 4 4';
      default:
        return 'M5 12h14';
    }
  }

  /**
   * Obtiene el color de tendencia
   */
  getTendenciaColor(tendencia: string): string {
    switch (tendencia) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  }

  /**
   * Obtiene el color de stock
   */
  getStockColor(stock: number): string {
    if (stock === 0) return 'text-red-600 bg-red-100';
    if (stock < 20) return 'text-orange-600 bg-orange-100';
    return 'text-green-600 bg-green-100';
  }

  /**
   * Obtiene el texto de stock
   */
  getStockText(stock: number): string {
    if (stock === 0) return 'Agotado';
    if (stock < 20) return 'Stock bajo';
    return 'En stock';
  }

  /**
   * Obtiene la etiqueta de la vista
   */
  getViewLabel(view: string): string {
    const labels: Record<string, string> = {
      ventas: 'Más Vendidos',
      ingresos: 'Mayores Ingresos',
      margen: 'Mejor Margen',
      tendencia: 'Mejor Tendencia',
    };
    return labels[view] || view;
  }

  /**
   * Formatea valores monetarios
   */
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  /**
   * Formatea números con separadores de miles
   */
  formatNumber(value: number): string {
    return new Intl.NumberFormat('es-PE').format(value);
  }

  /**
   * Formatea porcentajes
   */
  formatPercentage(value: number): string {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  }

  /**
   * Genera estrellas para rating
   */
  getStars(rating: number): string[] {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push('full');
    }

    if (hasHalfStar) {
      stars.push('half');
    }

    while (stars.length < 5) {
      stars.push('empty');
    }

    return stars;
  }

  /**
   * Maneja el error de carga de imagen y establece una imagen placeholder.
   */
  handleImageError(event: Event, placeholderPath: string): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = placeholderPath;
    }
  }
}
