import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

import { PedidoService } from '../../../../../../core/services/pedido.service';

export interface TendenciaData {
  fecha: string;
  pedidos: number;
  ventas: number;
  ticket_promedio: number;
  conversion_rate: number;
}

export interface TendenciasConfig {
  periodo_dias: number;
  tipo_grafico: 'linea' | 'area' | 'barras';
  mostrar_prediccion: boolean;
  comparar_periodo_anterior: boolean;
}

/**
 * Componente para mostrar gráficos de tendencias de ventas y pedidos
 * Incluye análisis temporal y predicciones
 */
@Component({
  selector: 'app-tendencias-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Header del componente -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h3 class="text-lg font-semibold text-gray-900">
            Tendencias de Ventas
          </h3>
          <p class="text-sm text-gray-500 mt-1">
            Análisis temporal de rendimiento (últimos
            {{ config().periodo_dias }} días)
          </p>
        </div>

        <!-- Controles -->
        <div class="flex items-center space-x-3">
          <!-- Selector de tipo de gráfico -->
          <select
            [value]="config().tipo_grafico"
            (change)="onTipoGraficoChange($event)"
            class="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="linea">Líneas</option>
            <option value="area">Área</option>
            <option value="barras">Barras</option>
          </select>

          <!-- Toggle predicción -->
          <label class="flex items-center">
            <input
              type="checkbox"
              [checked]="config().mostrar_prediccion"
              (change)="onMostrarPrediccionChange($event)"
              class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            <span class="ml-2 text-sm text-gray-700">Predicción</span>
          </label>

          <!-- Toggle comparación -->
          <label class="flex items-center">
            <input
              type="checkbox"
              [checked]="config().comparar_periodo_anterior"
              (change)="onCompararPeriodoChange($event)"
              class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            <span class="ml-2 text-sm text-gray-700">Comparar período</span>
          </label>

          <!-- Botón de actualizar -->
          <button
            type="button"
            (click)="refreshData()"
            [disabled]="isLoading()"
            class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              class="w-4 h-4 mr-2"
              [class.animate-spin]="isLoading()"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              ></path>
            </svg>
            Actualizar
          </button>
        </div>
      </div>

      <!-- Métricas resumen -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-blue-50 rounded-lg p-4">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg
                class="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                ></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-blue-600">Tendencia Ventas</p>
              <p class="text-2xl font-bold text-blue-900">
                {{ tendenciaVentas() >= 0 ? '+' : ''
                }}{{ tendenciaVentas().toFixed(1) }}%
              </p>
            </div>
          </div>
        </div>

        <div class="bg-green-50 rounded-lg p-4">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg
                class="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                ></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-green-600">
                Tendencia Pedidos
              </p>
              <p class="text-2xl font-bold text-green-900">
                {{ tendenciaPedidos() >= 0 ? '+' : ''
                }}{{ tendenciaPedidos().toFixed(1) }}%
              </p>
            </div>
          </div>
        </div>

        <div class="bg-purple-50 rounded-lg p-4">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg
                class="w-8 h-8 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                ></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-purple-600">Ticket Promedio</p>
              <p class="text-2xl font-bold text-purple-900">
                {{ formatCurrency(ticketPromedioActual()) }}
              </p>
            </div>
          </div>
        </div>

        <div class="bg-orange-50 rounded-lg p-4">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg
                class="w-8 h-8 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                ></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-orange-600">Conversión</p>
              <p class="text-2xl font-bold text-orange-900">
                {{ conversionActual().toFixed(1) }}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Estado de carga -->
      @if (isLoading()) {
      <div class="flex items-center justify-center py-12">
        <div class="flex items-center space-x-3">
          <svg
            class="animate-spin w-6 h-6 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span class="text-gray-600">Cargando tendencias...</span>
        </div>
      </div>
      }

      <!-- Error -->
      @if (error()) {
      <div class="bg-red-50 border border-red-200 rounded-md p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg
              class="h-5 w-5 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              ></path>
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">
              Error al cargar datos
            </h3>
            <div class="mt-2 text-sm text-red-700">
              <p>{{ error() }}</p>
            </div>
          </div>
        </div>
      </div>
      }

      <!-- Gráfico de tendencias -->
      @if (!isLoading() && !error()) {
      <div class="space-y-6">
        <!-- Gráfico principal -->
        <div class="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <div class="h-80 flex items-center justify-center">
            <!-- Simulación de gráfico -->
            <div class="text-center">
              <svg
                class="mx-auto h-16 w-16 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                ></path>
              </svg>
              <h3 class="mt-2 text-sm font-medium text-gray-900">
                Gráfico de Tendencias
              </h3>
              <p class="mt-1 text-sm text-gray-500">
                Aquí se mostraría el gráfico de {{ config().tipo_grafico }} con
                las tendencias de ventas y pedidos.
              </p>
              <p class="mt-1 text-xs text-gray-400">
                Integración con Chart.js o similar pendiente
              </p>
            </div>
          </div>
        </div>

        <!-- Tabla de datos -->
        <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200">
            <h4 class="text-lg font-medium text-gray-900">Datos Detallados</h4>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Fecha
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Pedidos
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Ventas
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Ticket Promedio
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Conversión
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                @for (item of tendenciasData().slice(0, 10); track item.fecha) {
                <tr class="hover:bg-gray-50">
                  <td
                    class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                  >
                    {{ formatDate(item.fecha) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ formatNumber(item.pedidos) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ formatCurrency(item.ventas) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ formatCurrency(item.ticket_promedio) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ item.conversion_rate.toFixed(1) }}%
                  </td>
                </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class TendenciasChartComponent implements OnInit, OnDestroy {
  @Input() config = signal<TendenciasConfig>({
    periodo_dias: 30,
    tipo_grafico: 'linea',
    mostrar_prediccion: false,
    comparar_periodo_anterior: false,
  });

  private readonly pedidoService = inject(PedidoService);
  private readonly destroy$ = new Subject<void>();

  // Signals para estado del componente
  isLoading = signal(false);
  error = signal<string | null>(null);
  tendenciasData = signal<TendenciaData[]>([]);

  // Computed signals para métricas
  tendenciaVentas = computed(() => {
    const data = this.tendenciasData();
    if (data.length < 2) return 0;

    const primera = data[0].ventas;
    const ultima = data[data.length - 1].ventas;
    return ((ultima - primera) / primera) * 100;
  });

  tendenciaPedidos = computed(() => {
    const data = this.tendenciasData();
    if (data.length < 2) return 0;

    const primera = data[0].pedidos;
    const ultima = data[data.length - 1].pedidos;
    return ((ultima - primera) / primera) * 100;
  });

  ticketPromedioActual = computed(() => {
    const data = this.tendenciasData();
    if (data.length === 0) return 0;
    return data[data.length - 1].ticket_promedio;
  });

  conversionActual = computed(() => {
    const data = this.tendenciasData();
    if (data.length === 0) return 0;
    return data[data.length - 1].conversion_rate;
  });

  ngOnInit(): void {
    this.loadTendencias();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carga los datos de tendencias
   */
  private async loadTendencias(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      // Simular datos por ahora - en producción usar el servicio real
      const data = this.generateMockData();
      this.tendenciasData.set(data);
    } catch (error) {
      console.error('Error al cargar tendencias:', error);
      this.error.set('Error al cargar los datos de tendencias');
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Genera datos mock para desarrollo
   */
  private generateMockData(): TendenciaData[] {
    const data: TendenciaData[] = [];
    const config = this.config();
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() - config.periodo_dias);

    for (let i = 0; i < config.periodo_dias; i++) {
      const fecha = new Date(fechaInicio);
      fecha.setDate(fecha.getDate() + i);

      // Simular tendencia creciente con variación
      const tendencia = 1 + (i / config.periodo_dias) * 0.3;
      const variacion = 0.8 + Math.random() * 0.4;

      const pedidos = Math.floor(
        (20 + Math.random() * 30) * tendencia * variacion
      );
      const ticketPromedio = (80 + Math.random() * 60) * tendencia;
      const ventas = pedidos * ticketPromedio;
      const conversionRate = 2 + Math.random() * 3;

      data.push({
        fecha: fecha.toISOString().split('T')[0],
        pedidos,
        ventas,
        ticket_promedio: ticketPromedio,
        conversion_rate: conversionRate,
      });
    }

    return data;
  }

  /**
   * Maneja el cambio de tipo de gráfico
   */
  onTipoGraficoChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const nuevoTipo = target.value as TendenciasConfig['tipo_grafico'];

    this.config.update((config) => ({
      ...config,
      tipo_grafico: nuevoTipo,
    }));
  }

  /**
   * Maneja el toggle de mostrar predicción
   */
  onMostrarPrediccionChange(event: Event): void {
    const target = event.target as HTMLInputElement;

    this.config.update((config) => ({
      ...config,
      mostrar_prediccion: target.checked,
    }));
  }

  /**
   * Maneja el toggle de comparar período
   */
  onCompararPeriodoChange(event: Event): void {
    const target = event.target as HTMLInputElement;

    this.config.update((config) => ({
      ...config,
      comparar_periodo_anterior: target.checked,
    }));
  }

  /**
   * Actualiza los datos
   */
  refreshData(): void {
    this.loadTendencias();
  }

  /**
   * Formatea fechas
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
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
}
