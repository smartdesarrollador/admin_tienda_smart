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

import { PedidoService } from '../../../../../../core/services/pedido.service';

export interface KPI {
  id: string;
  nombre: string;
  valor_actual: number;
  valor_anterior: number;
  unidad: string;
  tipo: 'porcentaje' | 'moneda' | 'numero' | 'tiempo';
  tendencia: 'up' | 'down' | 'stable';
  cambio_porcentual: number;
  objetivo: number;
  progreso_objetivo: number;
  categoria: 'ventas' | 'operaciones' | 'clientes' | 'financiero';
  icono: string;
  color: string;
  descripcion: string;
  formula?: string;
}

export interface MetricasKpiData {
  kpis_ventas: KPI[];
  kpis_operaciones: KPI[];
  kpis_clientes: KPI[];
  kpis_financieros: KPI[];
  resumen_general: {
    kpis_en_objetivo: number;
    kpis_por_debajo: number;
    kpis_criticos: number;
    score_general: number;
  };
}

/**
 * Componente para mostrar métricas KPI avanzadas del negocio
 * Incluye indicadores de ventas, operaciones, clientes y financieros
 */
@Component({
  selector: 'app-metricas-kpi',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './metricas-kpi.component.html',
  styleUrls: ['./metricas-kpi.component.css'],
})
export class MetricasKpiComponent implements OnInit, OnDestroy {
  private readonly pedidoService = inject(PedidoService);
  private readonly destroy$ = new Subject<void>();

  // Inputs
  @Input() periodo: '7d' | '30d' | '90d' | '1y' = '30d';

  // Signals para estado del componente
  isLoading = signal(false);
  error = signal<string | null>(null);
  kpisData = signal<MetricasKpiData | null>(null);
  activeCategory = signal<
    'ventas' | 'operaciones' | 'clientes' | 'financiero' | 'todos'
  >('todos');

  // Computed signals para datos filtrados
  kpisActivos = computed(() => {
    const data = this.kpisData();
    const category = this.activeCategory();

    if (!data) return [];

    switch (category) {
      case 'ventas':
        return data.kpis_ventas;
      case 'operaciones':
        return data.kpis_operaciones;
      case 'clientes':
        return data.kpis_clientes;
      case 'financiero':
        return data.kpis_financieros;
      case 'todos':
        return [
          ...data.kpis_ventas,
          ...data.kpis_operaciones,
          ...data.kpis_clientes,
          ...data.kpis_financieros,
        ];
      default:
        return [];
    }
  });

  // Computed signals para resumen
  kpisEnObjetivo = computed(() => {
    const data = this.kpisData();
    return data ? data.resumen_general.kpis_en_objetivo : 0;
  });

  kpisPorDebajo = computed(() => {
    const data = this.kpisData();
    return data ? data.resumen_general.kpis_por_debajo : 0;
  });

  kpisCriticos = computed(() => {
    const data = this.kpisData();
    return data ? data.resumen_general.kpis_criticos : 0;
  });

  scoreGeneral = computed(() => {
    const data = this.kpisData();
    return data ? data.resumen_general.score_general : 0;
  });

  scoreColor = computed(() => {
    const score = this.scoreGeneral();
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  });

  ngOnInit(): void {
    this.loadMetricasKpi();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carga los datos de métricas KPI
   */
  private loadMetricasKpi(): void {
    this.isLoading.set(true);
    this.error.set(null);

    // Simular datos por ahora - en producción usar servicios reales
    setTimeout(() => {
      const mockData: MetricasKpiData = {
        kpis_ventas: [
          {
            id: 'conversion_rate',
            nombre: 'Tasa de Conversión',
            valor_actual: 3.2,
            valor_anterior: 2.8,
            unidad: '%',
            tipo: 'porcentaje',
            tendencia: 'up',
            cambio_porcentual: 14.3,
            objetivo: 4.0,
            progreso_objetivo: 80,
            categoria: 'ventas',
            icono: 'chart-line',
            color: '#10b981',
            descripcion: 'Porcentaje de visitantes que realizan una compra',
            formula: '(Pedidos / Visitantes) * 100',
          },
          {
            id: 'ticket_promedio',
            nombre: 'Ticket Promedio',
            valor_actual: 125.75,
            valor_anterior: 118.5,
            unidad: 'S/',
            tipo: 'moneda',
            tendencia: 'up',
            cambio_porcentual: 6.1,
            objetivo: 150.0,
            progreso_objetivo: 84,
            categoria: 'ventas',
            icono: 'currency-dollar',
            color: '#3b82f6',
            descripcion: 'Valor promedio por pedido',
            formula: 'Total Ventas / Número de Pedidos',
          },
          {
            id: 'crecimiento_ventas',
            nombre: 'Crecimiento de Ventas',
            valor_actual: 12.5,
            valor_anterior: 8.2,
            unidad: '%',
            tipo: 'porcentaje',
            tendencia: 'up',
            cambio_porcentual: 52.4,
            objetivo: 15.0,
            progreso_objetivo: 83,
            categoria: 'ventas',
            icono: 'trending-up',
            color: '#8b5cf6',
            descripcion: 'Crecimiento mensual de ventas',
            formula:
              '((Ventas Actuales - Ventas Anteriores) / Ventas Anteriores) * 100',
          },
        ],
        kpis_operaciones: [
          {
            id: 'tiempo_entrega',
            nombre: 'Tiempo Promedio de Entrega',
            valor_actual: 2.3,
            valor_anterior: 2.8,
            unidad: 'días',
            tipo: 'tiempo',
            tendencia: 'up',
            cambio_porcentual: -17.9,
            objetivo: 2.0,
            progreso_objetivo: 85,
            categoria: 'operaciones',
            icono: 'clock',
            color: '#f59e0b',
            descripcion: 'Tiempo promedio desde pedido hasta entrega',
            formula: 'Suma(Días de Entrega) / Número de Entregas',
          },
          {
            id: 'tasa_cumplimiento',
            nombre: 'Tasa de Cumplimiento',
            valor_actual: 94.2,
            valor_anterior: 91.5,
            unidad: '%',
            tipo: 'porcentaje',
            tendencia: 'up',
            cambio_porcentual: 2.9,
            objetivo: 98.0,
            progreso_objetivo: 96,
            categoria: 'operaciones',
            icono: 'check-circle',
            color: '#10b981',
            descripcion: 'Porcentaje de pedidos entregados a tiempo',
            formula: '(Entregas a Tiempo / Total Entregas) * 100',
          },
        ],
        kpis_clientes: [
          {
            id: 'tasa_retencion',
            nombre: 'Tasa de Retención',
            valor_actual: 78.5,
            valor_anterior: 75.2,
            unidad: '%',
            tipo: 'porcentaje',
            tendencia: 'up',
            cambio_porcentual: 4.4,
            objetivo: 85.0,
            progreso_objetivo: 92,
            categoria: 'clientes',
            icono: 'users',
            color: '#6366f1',
            descripcion: 'Porcentaje de clientes que repiten compra',
            formula: '(Clientes Recurrentes / Total Clientes) * 100',
          },
          {
            id: 'nps',
            nombre: 'Net Promoter Score',
            valor_actual: 67,
            valor_anterior: 62,
            unidad: 'pts',
            tipo: 'numero',
            tendencia: 'up',
            cambio_porcentual: 8.1,
            objetivo: 75,
            progreso_objetivo: 89,
            categoria: 'clientes',
            icono: 'star',
            color: '#f59e0b',
            descripcion: 'Índice de satisfacción y recomendación',
            formula: '% Promotores - % Detractores',
          },
        ],
        kpis_financieros: [
          {
            id: 'margen_bruto',
            nombre: 'Margen Bruto',
            valor_actual: 42.3,
            valor_anterior: 39.8,
            unidad: '%',
            tipo: 'porcentaje',
            tendencia: 'up',
            cambio_porcentual: 6.3,
            objetivo: 45.0,
            progreso_objetivo: 94,
            categoria: 'financiero',
            icono: 'chart-pie',
            color: '#10b981',
            descripcion: 'Margen de ganancia bruta sobre ventas',
            formula: '((Ingresos - Costo de Ventas) / Ingresos) * 100',
          },
          {
            id: 'roi',
            nombre: 'Retorno de Inversión',
            valor_actual: 18.7,
            valor_anterior: 16.2,
            unidad: '%',
            tipo: 'porcentaje',
            tendencia: 'up',
            cambio_porcentual: 15.4,
            objetivo: 20.0,
            progreso_objetivo: 94,
            categoria: 'financiero',
            icono: 'calculator',
            color: '#8b5cf6',
            descripcion: 'Retorno sobre la inversión total',
            formula: '((Ganancia - Inversión) / Inversión) * 100',
          },
        ],
        resumen_general: {
          kpis_en_objetivo: 6,
          kpis_por_debajo: 2,
          kpis_criticos: 0,
          score_general: 87.5,
        },
      };

      this.kpisData.set(mockData);
      this.isLoading.set(false);
    }, 700);
  }

  /**
   * Cambia la categoría activa
   */
  onCategoryChange(
    category: 'ventas' | 'operaciones' | 'clientes' | 'financiero' | 'todos'
  ): void {
    this.activeCategory.set(category);
  }

  /**
   * Actualiza los datos
   */
  refreshData(): void {
    this.loadMetricasKpi();
  }

  /**
   * Obtiene el color de progreso del objetivo
   */
  getProgresoColor(progreso: number): string {
    if (progreso >= 90) return 'bg-green-500';
    if (progreso >= 70) return 'bg-yellow-500';
    if (progreso >= 50) return 'bg-orange-500';
    return 'bg-red-500';
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
   * Obtiene el estado del KPI basado en el progreso
   */
  getKpiEstado(
    progreso: number
  ): 'excelente' | 'bueno' | 'regular' | 'critico' {
    if (progreso >= 90) return 'excelente';
    if (progreso >= 70) return 'bueno';
    if (progreso >= 50) return 'regular';
    return 'critico';
  }

  /**
   * Obtiene la etiqueta de la categoría
   */
  getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      ventas: 'Ventas',
      operaciones: 'Operaciones',
      clientes: 'Clientes',
      financiero: 'Financiero',
      todos: 'Todos los KPIs',
    };
    return labels[category] || category;
  }

  /**
   * Formatea el valor según el tipo
   */
  formatValue(valor: number, tipo: string, unidad: string): string {
    switch (tipo) {
      case 'moneda':
        return new Intl.NumberFormat('es-PE', {
          style: 'currency',
          currency: 'PEN',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(valor);
      case 'porcentaje':
        return `${valor.toFixed(1)}%`;
      case 'tiempo':
        return `${valor.toFixed(1)} ${unidad}`;
      case 'numero':
        return `${valor.toFixed(0)} ${unidad}`;
      default:
        return `${valor} ${unidad}`;
    }
  }

  /**
   * Formatea el cambio porcentual
   */
  formatCambio(cambio: number): string {
    return `${cambio >= 0 ? '+' : ''}${cambio.toFixed(1)}%`;
  }

  /**
   * Obtiene el icono del KPI
   */
  getKpiIcon(icono: string): string {
    const iconos: Record<string, string> = {
      'chart-line': 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
      'currency-dollar':
        'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1',
      'trending-up': 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
      clock: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      'check-circle': 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      users:
        'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z',
      star: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
      'chart-pie':
        'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z',
      calculator:
        'M9 7h6m0 10v-3m-3 3h.01m-4.01 0h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z',
    };
    return iconos[icono] || iconos['chart-line'];
  }
}
