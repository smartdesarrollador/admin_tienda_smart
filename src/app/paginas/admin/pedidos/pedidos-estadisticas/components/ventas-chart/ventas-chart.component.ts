import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  inject,
  signal,
  computed,
  effect,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';

import { PedidoService } from '../../../../../../core/services/pedido.service';

// Registrar componentes de Chart.js
Chart.register(...registerables);

export interface VentasData {
  fecha: string;
  ventas: number;
  pedidos: number;
  ticket_promedio: number;
}

export interface VentasChartConfig {
  tipo: 'diario' | 'semanal' | 'mensual' | 'anual';
  periodo: number; // días, semanas, meses o años hacia atrás
  mostrar_pedidos: boolean;
  mostrar_ticket_promedio: boolean;
}

/**
 * Componente para mostrar gráficos de ventas
 * Soporta diferentes tipos de períodos y métricas
 */
@Component({
  selector: 'app-ventas-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ventas-chart.component.html',
  styleUrls: ['./ventas-chart.component.css'],
})
export class VentasChartComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChild('chartCanvas', { static: false })
  chartCanvas!: ElementRef<HTMLCanvasElement>;
  @Input() config = signal<VentasChartConfig>({
    tipo: 'mensual',
    periodo: 12,
    mostrar_pedidos: true,
    mostrar_ticket_promedio: true,
  });
  @Input() periodo: '7d' | '30d' | '90d' | '1y' = '30d';

  private readonly pedidoService = inject(PedidoService);
  private chart: Chart | null = null;

  // Signals para estado del componente
  isLoading = signal(false);
  error = signal<string | null>(null);
  ventasData = signal<VentasData[]>([]);

  // Computed signals para métricas
  totalVentas = computed(() => {
    return this.ventasData().reduce((sum, item) => sum + item.ventas, 0);
  });

  totalPedidos = computed(() => {
    return this.ventasData().reduce((sum, item) => sum + item.pedidos, 0);
  });

  ticketPromedio = computed(() => {
    const total = this.totalVentas();
    const pedidos = this.totalPedidos();
    return pedidos > 0 ? total / pedidos : 0;
  });

  crecimiento = computed(() => {
    const data = this.ventasData();
    if (data.length < 2) return 0;

    const actual = data[data.length - 1].ventas;
    const anterior = data[data.length - 2].ventas;

    return anterior > 0 ? ((actual - anterior) / anterior) * 100 : 0;
  });

  // Effect para actualizar el gráfico cuando cambian los datos
  private updateChartEffect = effect(() => {
    const data = this.ventasData();
    if (data.length > 0 && this.chart) {
      this.updateChart();
    }
  });

  constructor() {}

  ngOnInit(): void {
    this.loadChartData();
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['periodo']) {
      // Solo recargar si el periodo realmente cambió y no es la primera vez (manejado por ngOnInit)
      if (!changes['periodo'].firstChange) {
        this.loadChartData();
      }
    }
  }

  /**
   * Carga los datos de ventas
   */
  private async loadVentasData(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      // Simular datos por ahora - en producción usar el servicio real
      const data = this.generateMockData();
      this.ventasData.set(data);

      // Crear el gráfico después de que se renderice el canvas
      setTimeout(() => {
        this.createChart();
      }, 100);
    } catch (error) {
      console.error('Error al cargar datos de ventas:', error);
      this.error.set('Error al cargar los datos de ventas');
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Genera datos mock para desarrollo
   */
  private generateMockData(): VentasData[] {
    const data: VentasData[] = [];
    const config = this.config();
    const now = new Date();

    for (let i = config.periodo - 1; i >= 0; i--) {
      const fecha = new Date(now);

      switch (config.tipo) {
        case 'diario':
          fecha.setDate(fecha.getDate() - i);
          break;
        case 'semanal':
          fecha.setDate(fecha.getDate() - i * 7);
          break;
        case 'mensual':
          fecha.setMonth(fecha.getMonth() - i);
          break;
        case 'anual':
          fecha.setFullYear(fecha.getFullYear() - i);
          break;
      }

      const ventas = Math.random() * 10000 + 5000;
      const pedidos = Math.floor(Math.random() * 50 + 20);

      data.push({
        fecha: this.formatFecha(fecha, config.tipo),
        ventas,
        pedidos,
        ticket_promedio: ventas / pedidos,
      });
    }

    return data;
  }

  /**
   * Crea el gráfico de Chart.js
   */
  private createChart(): void {
    if (!this.chartCanvas) return;

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const data = this.ventasData();
    const config = this.config();

    const chartConfig: ChartConfiguration = {
      type: 'line' as ChartType,
      data: {
        labels: data.map((item) => item.fecha),
        datasets: [
          {
            label: 'Ventas (S/)',
            data: data.map((item) => item.ventas),
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            yAxisID: 'y',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.dataset.label || '';
                const value = context.parsed.y;
                return `${label}: ${this.formatCurrency(value)}`;
              },
            },
          },
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: this.getXAxisLabel(),
            },
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Ventas (S/)',
            },
            ticks: {
              callback: (value) => this.formatCurrency(Number(value)),
            },
          },
        },
      },
    };

    // Agregar dataset de pedidos si está habilitado
    if (config.mostrar_pedidos) {
      chartConfig.data!.datasets!.push({
        label: 'Pedidos',
        data: data.map((item) => item.pedidos),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        yAxisID: 'y1',
      });

      // Agregar escala Y secundaria
      chartConfig.options!.scales!['y1'] = {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Pedidos',
        },
        grid: {
          drawOnChartArea: false,
        },
      };
    }

    this.chart = new Chart(ctx, chartConfig);
  }

  /**
   * Actualiza el gráfico con nuevos datos
   */
  private updateChart(): void {
    if (!this.chart) return;

    const data = this.ventasData();
    this.chart.data.labels = data.map((item) => item.fecha);
    this.chart.data.datasets[0].data = data.map((item) => item.ventas);

    if (this.chart.data.datasets[1]) {
      this.chart.data.datasets[1].data = data.map((item) => item.pedidos);
    }

    this.chart.update();
  }

  /**
   * Maneja el cambio de tipo de período
   */
  onTipoChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const nuevoTipo = target.value as VentasChartConfig['tipo'];

    this.config.update((config) => ({
      ...config,
      tipo: nuevoTipo,
      periodo: this.getDefaultPeriodo(nuevoTipo),
    }));

    this.refreshData();
  }

  /**
   * Actualiza los datos
   */
  refreshData(): void {
    this.loadVentasData();
  }

  /**
   * Obtiene el período por defecto según el tipo
   */
  private getDefaultPeriodo(tipo: VentasChartConfig['tipo']): number {
    switch (tipo) {
      case 'diario':
        return 30;
      case 'semanal':
        return 12;
      case 'mensual':
        return 12;
      case 'anual':
        return 5;
      default:
        return 12;
    }
  }

  /**
   * Formatea la fecha según el tipo
   */
  private formatFecha(fecha: Date, tipo: VentasChartConfig['tipo']): string {
    switch (tipo) {
      case 'diario':
        return fecha.toLocaleDateString('es-PE', {
          day: '2-digit',
          month: 'short',
        });
      case 'semanal':
        return `Sem ${this.getWeekNumber(fecha)}`;
      case 'mensual':
        return fecha.toLocaleDateString('es-PE', {
          month: 'short',
          year: 'numeric',
        });
      case 'anual':
        return fecha.getFullYear().toString();
      default:
        return fecha.toLocaleDateString('es-PE');
    }
  }

  /**
   * Obtiene el número de semana del año
   */
  private getWeekNumber(fecha: Date): number {
    const firstDayOfYear = new Date(fecha.getFullYear(), 0, 1);
    const pastDaysOfYear =
      (fecha.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  /**
   * Obtiene la etiqueta del eje X
   */
  private getXAxisLabel(): string {
    switch (this.config().tipo) {
      case 'diario':
        return 'Días';
      case 'semanal':
        return 'Semanas';
      case 'mensual':
        return 'Meses';
      case 'anual':
        return 'Años';
      default:
        return 'Período';
    }
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

  loadChartData(): void {
    console.log(
      `VentasChartComponent: Cargando datos para el período: ${this.periodo}`
    );
    // Aquí iría la lógica para obtener datos y renderizar el gráfico
  }
}
