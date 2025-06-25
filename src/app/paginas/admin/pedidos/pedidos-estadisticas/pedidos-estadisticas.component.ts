import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

import { PedidoService } from '../../../../core/services/pedido.service';
import {
  EstadisticasResponse,
  EstadisticasPedidos,
  ResumenEstadisticas,
  EstadoPedido,
  TipoPago,
  TipoEntrega,
  CanalVenta,
  VentaDiaria,
  TopCliente,
  TopRepartidor,
  ProductoMasVendido,
  TiemposEntrega,
} from '../../../../core/models/pedido.interface';

// Componentes hijos
import { VentasChartComponent } from './components/ventas-chart/ventas-chart.component';
import { EstadosChartComponent } from './components/estados-chart/estados-chart.component';
import { ProductosTopComponent } from './components/productos-top/productos-top.component';
import { ClientesTopComponent } from './components/clientes-top/clientes-top.component';
import { MetricasKpiComponent } from './components/metricas-kpi/metricas-kpi.component';

/**
 * Componente principal para estadísticas de pedidos
 * Incluye análisis de productos, clientes, repartidores y métricas KPI
 */
@Component({
  selector: 'app-pedidos-estadisticas',
  standalone: true,
  imports: [
    CommonModule,
    VentasChartComponent,
    EstadosChartComponent,
    ProductosTopComponent,
    ClientesTopComponent,
    MetricasKpiComponent,
  ],
  templateUrl: './pedidos-estadisticas.component.html',
  styleUrls: ['./pedidos-estadisticas.component.css'],
})
export class PedidosEstadisticasComponent implements OnInit, OnDestroy {
  private readonly pedidoService = inject(PedidoService);
  private readonly destroy$ = new Subject<void>();

  // Signals para estado del componente
  isLoading = signal(false);
  error = signal<string | null>(null);
  estadisticasResponse = signal<EstadisticasResponse | null>(null);
  selectedPeriod = signal<'7d' | '30d' | '90d' | '1y'>('30d');
  activeTab = signal<
    | 'resumen'
    | 'kpis'
    | 'productos'
    | 'clientes'
    | 'repartidores'
    | 'tiempos'
    | 'canales'
  >('resumen');

  // Computed signals para datos específicos
  estadisticas = computed(
    () => this.estadisticasResponse()?.estadisticas || null
  );
  resumen = computed(() => this.estadisticas()?.resumen || null);
  estadisticasPorEstado = computed(() => this.estadisticas()?.por_estado || []);
  estadisticasPorTipoPago = computed(
    () => this.estadisticas()?.por_tipo_pago || []
  );
  estadisticasPorTipoEntrega = computed(
    () => this.estadisticas()?.por_tipo_entrega || []
  );
  estadisticasPorCanalVenta = computed(
    () => this.estadisticas()?.por_canal_venta || []
  );
  estadisticasPorZonaReparto = computed(
    () => this.estadisticas()?.por_zona_reparto || []
  );
  ventasDiarias = computed(() => this.estadisticas()?.ventas_diarias || []);
  topClientes = computed(() => this.estadisticas()?.top_clientes || []);
  topRepartidores = computed(() => this.estadisticas()?.top_repartidores || []);
  productosMasVendidos = computed(
    () => this.estadisticas()?.productos_mas_vendidos || []
  );
  tiemposEntrega = computed(() => this.estadisticas()?.tiempos_entrega || null);

  // Computed signals para formateo y métricas principales
  totalPedidos = computed(() => {
    const resumen = this.resumen();
    return resumen ? this.formatNumber(resumen.total_pedidos) : '0';
  });

  ingresosTotales = computed(() => {
    const resumen = this.resumen();
    return resumen ? this.formatCurrency(resumen.total_ventas) : 'S/ 0';
  });

  ticketPromedio = computed(() => {
    const resumen = this.resumen();
    return resumen ? this.formatCurrency(resumen.ticket_promedio) : 'S/ 0';
  });

  tasaConversion = computed(() => {
    const resumen = this.resumen();
    if (!resumen) return '0%';

    const totalPedidos = resumen.total_pedidos;
    const pedidosEntregados = resumen.pedidos_entregados;

    if (totalPedidos === 0) return '0%';
    const tasa = (pedidosEntregados / totalPedidos) * 100;
    return `${tasa.toFixed(1)}%`;
  });

  crecimientoVentas = computed(() => {
    const estadisticas = this.estadisticas();
    if (!estadisticas) return '0%';

    const ventasActuales = estadisticas.resumen.total_ventas;
    const ventasAnteriores = estadisticas.resumen.total_ventas * 0.85; // Mock data

    if (ventasAnteriores === 0) return '0%';
    const crecimiento =
      ((ventasActuales - ventasAnteriores) / ventasAnteriores) * 100;
    return `${crecimiento > 0 ? '+' : ''}${crecimiento.toFixed(1)}%`;
  });

  // Computed para métricas adicionales
  totalDeliveries = computed(() => {
    const resumen = this.resumen();
    return resumen ? this.formatNumber(resumen.total_deliveries) : '0';
  });

  totalRecojos = computed(() => {
    const resumen = this.resumen();
    return resumen ? this.formatNumber(resumen.total_recojos) : '0';
  });

  ingresosEnvio = computed(() => {
    const resumen = this.resumen();
    return resumen ? this.formatCurrency(resumen.ingresos_envio) : 'S/ 0';
  });

  pedidosPendientes = computed(() => {
    const resumen = this.resumen();
    return resumen ? this.formatNumber(resumen.pedidos_pendientes) : '0';
  });

  tiempoEntregaPromedio = computed(() => {
    const tiempos = this.tiemposEntrega();
    if (!tiempos) return 'No disponible';

    return this.formatTiempoEntrega(tiempos.promedio_general);
  });

  cumplimientoEntregas = computed(() => {
    const tiempos = this.tiemposEntrega();
    if (!tiempos || tiempos.cumplimiento_entregas.total_programadas === 0)
      return '0%';

    const { total_programadas, entregadas_a_tiempo } =
      tiempos.cumplimiento_entregas;
    const cumplimiento = (entregadas_a_tiempo / total_programadas) * 100;
    return `${cumplimiento.toFixed(1)}%`;
  });

  // Tabs de navegación expandidos
  readonly tabs = [
    {
      id: 'resumen',
      label: 'Resumen General',
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    },
    {
      id: 'kpis',
      label: 'Métricas KPI',
      icon: 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z',
    },
    {
      id: 'productos',
      label: 'Productos Top',
      icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    },
    {
      id: 'clientes',
      label: 'Clientes Top',
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
    },
    {
      id: 'repartidores',
      label: 'Repartidores',
      icon: 'M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
      id: 'tiempos',
      label: 'Tiempos de Entrega',
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
      id: 'canales',
      label: 'Canales de Venta',
      icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
    },
  ];

  // KPIs principales mejorados
  readonly kpisPrincipales = computed(() => [
    {
      id: 'total_pedidos',
      titulo: 'Total Pedidos',
      valor: this.totalPedidos(),
      icono:
        'M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
      color: 'blue',
      cambio: '+12%',
      tendencia: 'up',
    },
    {
      id: 'ingresos_totales',
      titulo: 'Ingresos Totales',
      valor: this.ingresosTotales(),
      icono:
        'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'green',
      cambio: this.crecimientoVentas(),
      tendencia: 'up',
    },
    {
      id: 'ticket_promedio',
      titulo: 'Ticket Promedio',
      valor: this.ticketPromedio(),
      icono:
        'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z',
      color: 'purple',
      cambio: '+5.2%',
      tendencia: 'up',
    },
    {
      id: 'tasa_conversion',
      titulo: 'Tasa Conversión',
      valor: this.tasaConversion(),
      icono: 'M13 10V3L4 14h7v7l9-11h-7z',
      color: 'indigo',
      cambio: '-2.1%',
      tendencia: 'down',
    },
    {
      id: 'tiempo_entrega',
      titulo: 'Tiempo Entrega Prom.',
      valor: this.tiempoEntregaPromedio(),
      icono: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'orange',
      cambio: '-15min',
      tendencia: 'up',
    },
    {
      id: 'cumplimiento',
      titulo: 'Cumplimiento',
      valor: this.cumplimientoEntregas(),
      icono: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'emerald',
      cambio: '+3.4%',
      tendencia: 'up',
    },
  ]);

  ngOnInit(): void {
    this.loadEstadisticas();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carga las estadísticas generales
   */
  private loadEstadisticas(): void {
    this.isLoading.set(true);
    this.error.set(null);

    const fechaDesde = this.getFechaDesde();
    const fechaHasta = this.getFechaHasta();

    this.pedidoService
      .obtenerEstadisticas(fechaDesde, fechaHasta)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.estadisticasResponse.set(response);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error al cargar estadísticas:', error);
          this.error.set('Error al cargar las estadísticas');
          this.isLoading.set(false);
        },
      });
  }

  /**
   * Obtiene la fecha desde según el período seleccionado
   */
  private getFechaDesde(): string {
    const ahora = new Date();
    const periodo = this.selectedPeriod();

    switch (periodo) {
      case '7d':
        return new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0];
      case '30d':
        return new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0];
      case '90d':
        return new Date(ahora.getTime() - 90 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0];
      case '1y':
        return new Date(ahora.getTime() - 365 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0];
      default:
        return new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0];
    }
  }

  /**
   * Obtiene la fecha hasta (hoy)
   */
  private getFechaHasta(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Cambia el período seleccionado
   */
  onPeriodChange(period: '7d' | '30d' | '90d' | '1y'): void {
    this.selectedPeriod.set(period);
    this.loadEstadisticas();
  }

  /**
   * Cambia el tab activo
   */
  onTabChange(
    tab:
      | 'resumen'
      | 'kpis'
      | 'productos'
      | 'clientes'
      | 'repartidores'
      | 'tiempos'
      | 'canales'
  ): void {
    this.activeTab.set(tab);
  }

  /**
   * Actualiza los datos
   */
  refreshData(): void {
    this.loadEstadisticas();
  }

  /**
   * Exporta las estadísticas a PDF
   */
  exportToPDF(): void {
    console.log('Exportando estadísticas a PDF...');
    // Implementar exportación a PDF usando jsPDF o similar
    const estadisticas = this.estadisticasResponse();
    if (estadisticas) {
      console.log('Datos para PDF:', estadisticas);
    }
  }

  /**
   * Exporta las estadísticas a Excel
   */
  exportToExcel(): void {
    console.log('Exportando estadísticas a Excel...');
    // Implementar exportación a Excel usando SheetJS o similar
    const estadisticas = this.estadisticasResponse();
    if (estadisticas) {
      const dataStr = JSON.stringify(estadisticas, null, 2);
      const dataUri =
        'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

      const exportFileDefaultName = `estadisticas_pedidos_${this.selectedPeriod()}_${
        new Date().toISOString().split('T')[0]
      }.json`;

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    }
  }

  /**
   * Obtiene la etiqueta del tab
   */
  getTabLabel(tab: string): string {
    const tabData = this.tabs.find((t) => t.id === tab);
    return tabData?.label || tab;
  }

  /**
   * Obtiene estadísticas por estado específico
   */
  getEstadisticasPorEstado(estado: EstadoPedido): number {
    const estadistica = this.estadisticasPorEstado().find(
      (e) => e.estado === estado
    );
    return estadistica?.cantidad || 0;
  }

  /**
   * Obtiene ingresos por estado específico
   */
  getIngresosPorEstado(estado: EstadoPedido): number {
    const estadistica = this.estadisticasPorEstado().find(
      (e) => e.estado === estado
    );
    return estadistica?.total_ventas || 0;
  }

  /**
   * Obtiene estadísticas por tipo de pago
   */
  getEstadisticasPorTipoPago(tipoPago: TipoPago): number {
    const estadistica = this.estadisticasPorTipoPago().find(
      (e) => e.tipo_pago === tipoPago
    );
    return estadistica?.cantidad || 0;
  }

  /**
   * Obtiene estadísticas por tipo de entrega
   */
  getEstadisticasPorTipoEntrega(tipoEntrega: TipoEntrega): number {
    const estadistica = this.estadisticasPorTipoEntrega().find(
      (e) => e.tipo_entrega === tipoEntrega
    );
    return estadistica?.cantidad || 0;
  }

  /**
   * Obtiene estadísticas por canal de venta
   */
  getEstadisticasPorCanalVenta(canalVenta: CanalVenta): number {
    const estadistica = this.estadisticasPorCanalVenta().find(
      (e) => e.canal_venta === canalVenta
    );
    return estadistica?.cantidad || 0;
  }

  /**
   * Obtiene el color para cada estado
   */
  getColorEstado(estado: EstadoPedido): string {
    const colores: Record<EstadoPedido, string> = {
      pendiente: 'yellow',
      aprobado: 'cyan',
      rechazado: 'red',
      en_proceso: 'blue',
      enviado: 'indigo',
      entregado: 'green',
      cancelado: 'red',
      devuelto: 'orange',
    };
    return colores[estado] || 'gray';
  }

  /**
   * Obtiene el color para cada tipo de pago
   */
  getColorTipoPago(tipoPago: TipoPago): string {
    const colores: Record<TipoPago, string> = {
      contado: 'green',
      credito: 'amber',
      transferencia: 'blue',
      tarjeta: 'purple',
      yape: 'pink',
      plin: 'teal',
      paypal: 'indigo',
    };
    return colores[tipoPago] || 'gray';
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
   * Formatea tiempo de entrega
   */
  formatTiempoEntrega(minutos: number): string {
    if (minutos < 60) {
      return `${minutos} min`;
    }

    const horas = Math.floor(minutos / 60);
    const minutosRestantes = minutos % 60;

    if (minutosRestantes === 0) {
      return `${horas}h`;
    }

    return `${horas}h ${minutosRestantes}min`;
  }

  /**
   * Obtiene la etiqueta del período
   */
  getPeriodLabel(period: string): string {
    const labels: Record<string, string> = {
      '7d': 'Últimos 7 días',
      '30d': 'Últimos 30 días',
      '90d': 'Últimos 90 días',
      '1y': 'Último año',
    };
    return labels[period] || period;
  }

  /**
   * Calcula el porcentaje de un valor respecto al total
   */
  calculatePercentage(value: number, total: number): number {
    if (total === 0) return 0;
    return (value / total) * 100;
  }

  /**
   * Tracking functions para ngFor
   */
  trackByTabId(index: number, tab: any): string {
    return tab.id;
  }

  trackByKpiId(index: number, kpi: any): string {
    return kpi.id;
  }

  trackByEstadoId(index: number, item: any): string {
    return item.estado;
  }

  trackByTipoPagoId(index: number, item: any): string {
    return item.tipo_pago;
  }

  trackByClienteId(index: number, cliente: TopCliente): number {
    return cliente.id;
  }

  trackByRepartidorId(index: number, repartidor: TopRepartidor): number {
    return repartidor.id;
  }

  trackByProductoId(index: number, producto: ProductoMasVendido): number {
    return producto.producto_id;
  }

  trackByFecha(index: number, venta: VentaDiaria): string {
    return venta.fecha;
  }
}
