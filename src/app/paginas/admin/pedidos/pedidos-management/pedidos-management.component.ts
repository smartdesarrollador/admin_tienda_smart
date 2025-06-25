import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { PedidoService } from '../../../../core/services/pedido.service';
import { DetallePedidoService } from '../../../../core/services/detalle-pedido.service';
import { PagoService } from '../../../../core/services/pago.service';
import { PedidosListComponent } from '../pedidos-list/pedidos-list.component';
import { PedidoFormComponent } from '../pedido-form/pedido-form.component';
import { PedidoDetailComponent } from '../pedido-detail/pedido-detail.component';
import { PedidosEstadisticasComponent } from '../pedidos-estadisticas/pedidos-estadisticas.component';
import {
  Pedido,
  EstadoPedido,
  TipoPago,
  TipoEntrega,
  CanalVenta,
  PedidoFilters,
  EstadisticasPedidos,
  ResumenEstadisticas,
} from '../../../../core/models/pedido.interface';

/**
 * Componente padre para la gestión completa de pedidos
 * Orquesta toda la funcionalidad de pedidos con navegación por tabs
 */
@Component({
  selector: 'app-pedidos-management',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    PedidosListComponent,
    PedidoFormComponent,
    PedidoDetailComponent,
    PedidosEstadisticasComponent,
  ],
  templateUrl: './pedidos-management.component.html',
  styleUrls: ['./pedidos-management.component.css'],
})
export class PedidosManagementComponent implements OnInit {
  private readonly pedidoService = inject(PedidoService);
  private readonly detallePedidoService = inject(DetallePedidoService);
  private readonly pagoService = inject(PagoService);
  private readonly router = inject(Router);

  // Signals del servicio de pedidos
  pedidos$ = this.pedidoService.pedidos$;
  loading$ = this.pedidoService.loading$;
  estadisticas$ = this.pedidoService.estadisticas$;

  // Signals locales para navegación y estado
  activeTab = signal<
    'lista' | 'crear' | 'detalle' | 'estadisticas' | 'reportes'
  >('lista');
  showKPIs = signal(true);
  refreshing = signal(false);
  pedidosData = signal<Pedido[]>([]);
  selectedPedidoId = signal<number | null>(null);
  resumenEstadisticas = signal<ResumenEstadisticas | null>(null);

  // Computed signals para estadísticas rápidas
  totalPedidos = computed(() => this.pedidosData().length);

  pedidosPendientes = computed(
    () =>
      this.pedidosData().filter((p: Pedido) => p.estado === 'pendiente').length
  );

  pedidosAprobados = computed(
    () =>
      this.pedidosData().filter((p: Pedido) => p.estado === 'aprobado').length
  );

  pedidosEnProceso = computed(
    () =>
      this.pedidosData().filter((p: Pedido) => p.estado === 'en_proceso').length
  );

  pedidosEnviados = computed(
    () =>
      this.pedidosData().filter((p: Pedido) => p.estado === 'enviado').length
  );

  pedidosEntregados = computed(
    () =>
      this.pedidosData().filter((p: Pedido) => p.estado === 'entregado').length
  );

  pedidosCancelados = computed(
    () =>
      this.pedidosData().filter((p: Pedido) => p.estado === 'cancelado').length
  );

  pedidosDevueltos = computed(
    () =>
      this.pedidosData().filter((p: Pedido) => p.estado === 'devuelto').length
  );

  valorTotalPedidos = computed(() =>
    this.pedidosData().reduce((total, pedido) => total + pedido.total, 0)
  );

  valorTotalConDescuento = computed(() =>
    this.pedidosData().reduce(
      (total, pedido) => total + pedido.total_con_descuento,
      0
    )
  );

  pedidosCredito = computed(
    () => this.pedidosData().filter((p: Pedido) => p.es_credito).length
  );

  pedidosDelivery = computed(
    () =>
      this.pedidosData().filter((p: Pedido) => p.tipo_entrega === 'delivery')
        .length
  );

  pedidosRecojoTienda = computed(
    () =>
      this.pedidosData().filter(
        (p: Pedido) => p.tipo_entrega === 'recojo_tienda'
      ).length
  );

  totalCostoEnvio = computed(() =>
    this.pedidosData().reduce(
      (total, pedido) => total + (pedido.costo_envio || 0),
      0
    )
  );

  totalDescuentos = computed(() =>
    this.pedidosData().reduce(
      (total, pedido) => total + (pedido.descuento_total || 0),
      0
    )
  );

  totalIGV = computed(() =>
    this.pedidosData().reduce((total, pedido) => total + (pedido.igv || 0), 0)
  );

  // Opciones de navegación
  readonly tabs = [
    {
      id: 'lista' as const,
      label: 'Lista de Pedidos',
      icon: 'M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
      description: 'Ver y gestionar todos los pedidos',
    },
    {
      id: 'crear' as const,
      label: 'Nuevo Pedido',
      icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6',
      description: 'Crear un nuevo pedido',
    },
    {
      id: 'detalle' as const,
      label: 'Detalle de Pedido',
      icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
      description: 'Ver detalles del pedido seleccionado',
      hidden: () => !this.selectedPedidoId(),
    },
    {
      id: 'estadisticas' as const,
      label: 'Estadísticas',
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      description: 'Análisis y métricas de pedidos',
    },
    {
      id: 'reportes' as const,
      label: 'Reportes',
      icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      description: 'Generar reportes de pedidos',
    },
  ];

  // Estados de pedidos para KPIs expandidos
  readonly estadosKPI = [
    {
      estado: 'pendientes',
      label: 'Pendientes',
      value: this.pedidosPendientes,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
      estado: 'aprobados',
      label: 'Aprobados',
      value: this.pedidosAprobados,
      color: 'bg-cyan-500',
      textColor: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
      estado: 'proceso',
      label: 'En Proceso',
      value: this.pedidosEnProceso,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    },
    {
      estado: 'enviados',
      label: 'Enviados',
      value: this.pedidosEnviados,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      icon: 'M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
      estado: 'entregados',
      label: 'Entregados',
      value: this.pedidosEntregados,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
      estado: 'cancelados',
      label: 'Cancelados',
      value: this.pedidosCancelados,
      color: 'bg-red-500',
      textColor: 'text-red-600',
      bgColor: 'bg-red-50',
      icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
      estado: 'devueltos',
      label: 'Devueltos',
      value: this.pedidosDevueltos,
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
      icon: 'M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6',
    },
    {
      estado: 'total',
      label: 'Total Pedidos',
      value: this.totalPedidos,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    },
  ];

  // KPIs adicionales para nuevos campos
  readonly kpisAdicionales = [
    {
      id: 'credito',
      label: 'Pedidos a Crédito',
      value: this.pedidosCredito,
      color: 'bg-amber-500',
      textColor: 'text-amber-600',
      bgColor: 'bg-amber-50',
      icon: 'M3 10h11M9 21V3m0 0l4-4M9 3L5 7',
    },
    {
      id: 'delivery',
      label: 'Delivery',
      value: this.pedidosDelivery,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      icon: 'M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
      id: 'recojo',
      label: 'Recojo en Tienda',
      value: this.pedidosRecojoTienda,
      color: 'bg-teal-500',
      textColor: 'text-teal-600',
      bgColor: 'bg-teal-50',
      icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    },
    {
      id: 'total_ventas',
      label: 'Total Ventas',
      value: computed(() => this.formatCurrency(this.valorTotalPedidos())),
      color: 'bg-violet-500',
      textColor: 'text-violet-600',
      bgColor: 'bg-violet-50',
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    },
  ];

  ngOnInit(): void {
    this.loadInitialData();
    this.subscribeToData();
  }

  /**
   * Suscribe a los datos del servicio
   */
  private subscribeToData(): void {
    this.pedidos$.subscribe((pedidos) => {
      this.pedidosData.set(pedidos);
    });

    this.estadisticas$.subscribe((estadisticas) => {
      if (estadisticas?.estadisticas?.resumen) {
        this.resumenEstadisticas.set(estadisticas.estadisticas.resumen);
      }
    });
  }

  /**
   * Carga los datos iniciales necesarios
   */
  private loadInitialData(): void {
    this.loadPedidos();
    this.loadEstadisticas();
  }

  /**
   * Carga la lista de pedidos
   */
  loadPedidos(): void {
    const filters: PedidoFilters = {
      per_page: 15,
      sort_by: 'created_at',
      sort_direction: 'desc',
    };

    this.pedidoService.obtenerPedidos(filters).subscribe();
  }

  /**
   * Carga estadísticas de pedidos
   */
  private loadEstadisticas(): void {
    this.pedidoService.obtenerEstadisticas().subscribe();
  }

  /**
   * Cambia el tab activo
   */
  setActiveTab(
    tab: 'lista' | 'crear' | 'detalle' | 'estadisticas' | 'reportes'
  ): void {
    this.activeTab.set(tab);

    // Cargar datos específicos según el tab activo
    if (tab === 'estadisticas') {
      this.loadEstadisticas();
    }

    // Si no es detalle, limpiar selección
    if (tab !== 'detalle') {
      this.selectedPedidoId.set(null);
    }
  }

  /**
   * Verifica si un tab está activo
   */
  isTabActive(tab: string): boolean {
    return this.activeTab() === tab;
  }

  /**
   * Maneja la selección de un pedido para ver detalles
   */
  onPedidoSelected(pedidoId: number): void {
    this.selectedPedidoId.set(pedidoId);
    this.setActiveTab('detalle');
  }

  /**
   * Maneja cuando se crea un nuevo pedido
   */
  onPedidoCreated(pedido: Pedido): void {
    this.loadPedidos(); // Recargar lista
    this.loadEstadisticas(); // Recargar estadísticas
    this.selectedPedidoId.set(pedido.id);
    this.setActiveTab('detalle'); // Ir a ver el detalle del nuevo pedido
  }

  /**
   * Maneja cuando se actualiza un pedido
   */
  onPedidoUpdated(pedido: Pedido): void {
    this.loadPedidos(); // Recargar lista
    this.loadEstadisticas(); // Recargar estadísticas
  }

  /**
   * Vuelve a la lista desde cualquier vista
   */
  backToList(): void {
    this.selectedPedidoId.set(null);
    this.setActiveTab('lista');
  }

  /**
   * Alterna la visibilidad de los KPIs
   */
  toggleKPIs(): void {
    this.showKPIs.set(!this.showKPIs());
  }

  /**
   * Actualiza todos los datos
   */
  async refreshAll(): Promise<void> {
    this.refreshing.set(true);
    try {
      await Promise.all([this.loadPedidos(), this.loadEstadisticas()]);
    } catch (error) {
      console.error('Error al actualizar datos:', error);
    } finally {
      this.refreshing.set(false);
    }
  }

  /**
   * Navega a crear nuevo pedido
   */
  navigateToCreate(): void {
    this.setActiveTab('crear');
  }

  /**
   * Navega al detalle de un pedido
   */
  navigateToDetail(pedidoId: number): void {
    this.onPedidoSelected(pedidoId);
  }

  /**
   * Navega a editar un pedido
   */
  navigateToEdit(pedidoId: number): void {
    this.selectedPedidoId.set(pedidoId);
    this.setActiveTab('crear'); // Usar el mismo formulario en modo edición
  }

  /**
   * Formatea valores monetarios
   */
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2,
    }).format(value);
  }

  /**
   * Obtiene el color del estado del pedido
   */
  getEstadoColor(estado: EstadoPedido): string {
    const colors: Record<EstadoPedido, string> = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      aprobado: 'bg-cyan-100 text-cyan-800',
      rechazado: 'bg-red-100 text-red-800',
      en_proceso: 'bg-blue-100 text-blue-800',
      enviado: 'bg-indigo-100 text-indigo-800',
      entregado: 'bg-green-100 text-green-800',
      cancelado: 'bg-red-100 text-red-800',
      devuelto: 'bg-orange-100 text-orange-800',
    };
    return colors[estado] || 'bg-gray-100 text-gray-800';
  }

  /**
   * Obtiene el texto del estado del pedido
   */
  getEstadoText(estado: EstadoPedido): string {
    const texts: Record<EstadoPedido, string> = {
      pendiente: 'Pendiente',
      aprobado: 'Aprobado',
      rechazado: 'Rechazado',
      en_proceso: 'En Proceso',
      enviado: 'Enviado',
      entregado: 'Entregado',
      cancelado: 'Cancelado',
      devuelto: 'Devuelto',
    };
    return texts[estado] || estado;
  }

  /**
   * Obtiene el color del tipo de entrega
   */
  getTipoEntregaColor(tipoEntrega: TipoEntrega): string {
    const colors: Record<TipoEntrega, string> = {
      delivery: 'bg-emerald-100 text-emerald-800',
      recojo_tienda: 'bg-teal-100 text-teal-800',
    };
    return colors[tipoEntrega] || 'bg-gray-100 text-gray-800';
  }

  /**
   * Obtiene el texto del tipo de entrega
   */
  getTipoEntregaText(tipoEntrega: TipoEntrega): string {
    const texts: Record<TipoEntrega, string> = {
      delivery: 'Delivery',
      recojo_tienda: 'Recojo en Tienda',
    };
    return texts[tipoEntrega] || tipoEntrega;
  }

  /**
   * Obtiene el color del canal de venta
   */
  getCanalVentaColor(canalVenta: CanalVenta): string {
    const colors: Record<CanalVenta, string> = {
      web: 'bg-blue-100 text-blue-800',
      app: 'bg-green-100 text-green-800',
      tienda_fisica: 'bg-purple-100 text-purple-800',
      telefono: 'bg-yellow-100 text-yellow-800',
      whatsapp: 'bg-green-100 text-green-800',
    };
    return colors[canalVenta] || 'bg-gray-100 text-gray-800';
  }

  /**
   * Obtiene estadísticas del resumen si están disponibles
   */
  getResumenEstadistica(campo: keyof ResumenEstadisticas): number {
    const resumen = this.resumenEstadisticas();
    return resumen ? resumen[campo] : 0;
  }

  /**
   * Función de tracking para ngFor de pedidos
   */
  trackByPedidoId(index: number, pedido: Pedido): number {
    return pedido.id;
  }

  /**
   * Función de tracking para ngFor de tabs
   */
  trackByTabId(index: number, tab: any): string {
    return tab.id;
  }

  /**
   * Función de tracking para ngFor de KPIs
   */
  trackByKpiId(index: number, kpi: any): string {
    return kpi.estado || kpi.id;
  }
}
