import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import {
  Pedido,
  PedidoFilters,
  EstadoPedido,
  TipoPago,
  TipoEntrega,
  CanalVenta,
  Moneda,
} from '../../../../core/models/pedido.interface';
import { PedidoService } from '../../../../core/services/pedido.service';

// Importar componentes específicos
import {
  PedidoCardComponent,
  PedidoFiltersComponent,
  PedidoActionsComponent,
  PedidoStatusBadgeComponent,
} from './components';

/**
 * Componente para listar y gestionar pedidos
 * Incluye filtros avanzados, selección múltiple y acciones masivas
 */
@Component({
  selector: 'app-pedidos-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    PedidoCardComponent,
    PedidoFiltersComponent,
    PedidoActionsComponent,
    PedidoStatusBadgeComponent,
  ],
  templateUrl: './pedidos-list.component.html',
  styleUrls: ['./pedidos-list.component.css'],
})
export class PedidosListComponent implements OnInit, OnDestroy {
  @Output() pedidoSelected = new EventEmitter<number>();
  @Output() editPedido = new EventEmitter<number>();

  private readonly pedidoService = inject(PedidoService);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();

  // Signals para estado reactivo
  pedidosData = signal<Pedido[]>([]);
  isLoading = signal(false);
  currentFilters = signal<PedidoFilters>({});
  selectedPedidos = signal<number[]>([]);
  viewMode = signal<'table' | 'cards'>('table');
  currentPage = signal(1);
  totalItems = signal(0);
  totalPages = signal(0);
  lastUpdate = signal('');

  // Estado de ordenamiento expandido
  currentSort = signal<{
    field:
      | 'numero_pedido'
      | 'created_at'
      | 'updated_at'
      | 'total'
      | 'estado'
      | 'tipo_pago'
      | 'tipo_entrega'
      | 'fecha_entrega_programada';
    direction: 'asc' | 'desc';
  }>({
    field: 'created_at',
    direction: 'desc',
  });

  // Variables para acciones masivas
  bulkEstado: EstadoPedido | '' = '';
  bulkTipoEntrega: TipoEntrega | '' = '';
  bulkCanalVenta: CanalVenta | '' = '';

  // Opciones expandidas para estados
  readonly estadosOptions = [
    { value: 'pendiente' as EstadoPedido, label: 'Pendiente', color: 'yellow' },
    { value: 'aprobado' as EstadoPedido, label: 'Aprobado', color: 'cyan' },
    { value: 'rechazado' as EstadoPedido, label: 'Rechazado', color: 'red' },
    { value: 'en_proceso' as EstadoPedido, label: 'En Proceso', color: 'blue' },
    { value: 'enviado' as EstadoPedido, label: 'Enviado', color: 'indigo' },
    { value: 'entregado' as EstadoPedido, label: 'Entregado', color: 'green' },
    { value: 'cancelado' as EstadoPedido, label: 'Cancelado', color: 'red' },
    { value: 'devuelto' as EstadoPedido, label: 'Devuelto', color: 'orange' },
  ];

  // Opciones para tipos de pago
  readonly tiposPagoOptions = [
    { value: 'contado' as TipoPago, label: 'Contado' },
    { value: 'credito' as TipoPago, label: 'Crédito' },
    { value: 'transferencia' as TipoPago, label: 'Transferencia' },
    { value: 'tarjeta' as TipoPago, label: 'Tarjeta' },
    { value: 'yape' as TipoPago, label: 'Yape' },
    { value: 'plin' as TipoPago, label: 'Plin' },
    { value: 'paypal' as TipoPago, label: 'PayPal' },
  ];

  // Opciones para tipos de entrega
  readonly tiposEntregaOptions = [
    { value: 'delivery' as TipoEntrega, label: 'Delivery' },
    { value: 'recojo_tienda' as TipoEntrega, label: 'Recojo en Tienda' },
  ];

  // Opciones para canales de venta
  readonly canalesVentaOptions = [
    { value: 'web' as CanalVenta, label: 'Sitio Web' },
    { value: 'app' as CanalVenta, label: 'App Móvil' },
    { value: 'tienda_fisica' as CanalVenta, label: 'Tienda Física' },
    { value: 'telefono' as CanalVenta, label: 'Teléfono' },
    { value: 'whatsapp' as CanalVenta, label: 'WhatsApp' },
  ];

  // Computed para selección
  isAllSelected = computed(() => {
    const pedidos = this.pedidosData();
    const selected = this.selectedPedidos();
    return pedidos.length > 0 && selected.length === pedidos.length;
  });

  isIndeterminate = computed(() => {
    const selected = this.selectedPedidos();
    const total = this.pedidosData().length;
    return selected.length > 0 && selected.length < total;
  });

  // Computed para estadísticas rápidas
  totalVentasVisible = computed(() =>
    this.pedidosData().reduce((sum, pedido) => sum + pedido.total, 0)
  );

  totalDescuentosVisible = computed(() =>
    this.pedidosData().reduce(
      (sum, pedido) => sum + (pedido.descuento_total || 0),
      0
    )
  );

  totalEnviosVisible = computed(() =>
    this.pedidosData().reduce(
      (sum, pedido) => sum + (pedido.costo_envio || 0),
      0
    )
  );

  totalIGVVisible = computed(() =>
    this.pedidosData().reduce((sum, pedido) => sum + (pedido.igv || 0), 0)
  );

  pedidosCredito = computed(
    () => this.pedidosData().filter((p) => p.es_credito).length
  );

  pedidosDelivery = computed(
    () => this.pedidosData().filter((p) => p.tipo_entrega === 'delivery').length
  );

  pedidosConRastreo = computed(
    () => this.pedidosData().filter((p) => p.codigo_rastreo).length
  );

  ngOnInit(): void {
    this.loadInitialData();
    this.updateLastUpdate();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carga los datos iniciales
   */
  private loadInitialData(): void {
    this.loadPedidos();
  }

  /**
   * Carga los pedidos con filtros
   */
  private loadPedidos(filters: PedidoFilters = {}): void {
    this.isLoading.set(true);

    const sort = this.currentSort();
    const page = this.currentPage();

    const finalFilters = {
      ...filters,
      page,
      sort_by: sort.field,
      sort_direction: sort.direction,
    };

    this.pedidoService
      .obtenerPedidos(finalFilters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.pedidosData.set(response.data || []);
          this.totalItems.set(
            response.meta?.total || (response.data || []).length
          );
          this.totalPages.set(response.meta?.last_page || 1);
          this.currentPage.set(response.meta?.current_page || 1);
          this.isLoading.set(false);
          this.updateLastUpdate();
        },
        error: (error) => {
          console.error('Error al cargar pedidos:', error);
          this.isLoading.set(false);
        },
      });
  }

  /**
   * Actualiza la marca de tiempo de última actualización
   */
  private updateLastUpdate(): void {
    const now = new Date();
    this.lastUpdate.set(
      now.toLocaleTimeString('es-PE', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    );
  }

  /**
   * Maneja cambios en los filtros
   */
  onFiltersChange(filters: PedidoFilters): void {
    this.currentFilters.set(filters);
    this.currentPage.set(1); // Reset a primera página
    this.loadPedidos(filters);
  }

  /**
   * Aplica filtros manualmente
   */
  onFiltersApply(filters: PedidoFilters): void {
    this.currentFilters.set(filters);
    this.currentPage.set(1);
    this.loadPedidos(filters);
  }

  /**
   * Limpia todos los filtros
   */
  onFiltersClear(): void {
    this.currentFilters.set({});
    this.currentPage.set(1);
    this.loadPedidos();
  }

  /**
   * Filtros rápidos por estado
   */
  filterByEstado(estado: EstadoPedido): void {
    const filters: PedidoFilters = { estado };
    this.onFiltersApply(filters);
  }

  /**
   * Filtros rápidos por tipo de entrega
   */
  filterByTipoEntrega(tipoEntrega: TipoEntrega): void {
    const filters: PedidoFilters = { tipo_entrega: tipoEntrega };
    this.onFiltersApply(filters);
  }

  /**
   * Filtros rápidos por canal de venta
   */
  filterByCanalVenta(canalVenta: CanalVenta): void {
    const filters: PedidoFilters = { canal_venta: canalVenta };
    this.onFiltersApply(filters);
  }

  /**
   * Filtros rápidos por fecha
   */
  filterByFechaHoy(): void {
    const hoy = new Date().toISOString().split('T')[0];
    const filters: PedidoFilters = { fecha_desde: hoy, fecha_hasta: hoy };
    this.onFiltersApply(filters);
  }

  filterByFechaUltimos7Dias(): void {
    const hoy = new Date();
    const hace7Dias = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);
    const filters: PedidoFilters = {
      fecha_desde: hace7Dias.toISOString().split('T')[0],
      fecha_hasta: hoy.toISOString().split('T')[0],
    };
    this.onFiltersApply(filters);
  }

  /**
   * Cambia el modo de vista
   */
  setViewMode(mode: 'table' | 'cards'): void {
    this.viewMode.set(mode);
  }

  /**
   * Actualiza los datos
   */
  refreshData(): void {
    this.loadPedidos(this.currentFilters());
  }

  /**
   * Alterna la selección de todos los elementos
   */
  toggleSelectAll(): void {
    const allSelected = this.isAllSelected();
    if (allSelected) {
      this.selectedPedidos.set([]);
    } else {
      const allIds = this.pedidosData().map((p) => p.id);
      this.selectedPedidos.set(allIds);
    }
  }

  /**
   * Alterna la selección de un elemento
   */
  toggleSelection(id: number): void {
    const selected = this.selectedPedidos();
    const index = selected.indexOf(id);

    if (index > -1) {
      this.selectedPedidos.set(
        selected.filter((selectedId) => selectedId !== id)
      );
    } else {
      this.selectedPedidos.set([...selected, id]);
    }
  }

  /**
   * Verifica si un elemento está seleccionado
   */
  isSelected(id: number): boolean {
    return this.selectedPedidos().includes(id);
  }

  /**
   * Limpia la selección
   */
  clearSelection(): void {
    this.selectedPedidos.set([]);
  }

  /**
   * Aplica cambio de estado masivo
   */
  applyBulkEstado(): void {
    if (!this.bulkEstado || this.selectedPedidos().length === 0) return;

    const selectedIds = this.selectedPedidos();
    const estado = this.bulkEstado as EstadoPedido;

    // Aplicar cambio de estado a cada pedido seleccionado
    selectedIds.forEach((id) => {
      this.pedidoService
        .cambiarEstado(id, { estado })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            console.log(`Estado actualizado para pedido ${id}:`, estado);
          },
          error: (error) => {
            console.error(`Error al cambiar estado del pedido ${id}:`, error);
          },
        });
    });

    // Reset
    this.bulkEstado = '';
    this.clearSelection();
    this.refreshData();
  }

  /**
   * Aplica cambio de tipo de entrega masivo
   */
  applyBulkTipoEntrega(): void {
    if (!this.bulkTipoEntrega || this.selectedPedidos().length === 0) return;

    const selectedIds = this.selectedPedidos();
    const tipoEntrega = this.bulkTipoEntrega as TipoEntrega;

    // Aquí implementarías la lógica para cambio masivo de tipo de entrega
    console.log('Cambiar tipo de entrega masivo:', {
      selectedIds,
      tipoEntrega,
    });

    // Reset
    this.bulkTipoEntrega = '';
    this.clearSelection();
    this.refreshData();
  }

  /**
   * Confirma eliminación masiva
   */
  confirmBulkDelete(): void {
    if (this.selectedPedidos().length === 0) return;

    const confirmed = confirm(
      `¿Estás seguro de que deseas eliminar ${
        this.selectedPedidos().length
      } pedido(s)?`
    );

    if (confirmed) {
      const selectedIds = this.selectedPedidos();

      selectedIds.forEach((id) => {
        this.pedidoService
          .eliminarPedido(id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              console.log(`Pedido ${id} eliminado`);
            },
            error: (error) => {
              console.error(`Error al eliminar pedido ${id}:`, error);
            },
          });
      });

      this.clearSelection();
      this.refreshData();
    }
  }

  /**
   * Alterna el ordenamiento
   */
  toggleSort(
    field:
      | 'numero_pedido'
      | 'created_at'
      | 'updated_at'
      | 'total'
      | 'estado'
      | 'tipo_pago'
      | 'tipo_entrega'
      | 'fecha_entrega_programada'
  ): void {
    const current = this.currentSort();
    if (current.field === field) {
      this.currentSort.set({
        field,
        direction: current.direction === 'asc' ? 'desc' : 'asc',
      });
    } else {
      this.currentSort.set({ field, direction: 'asc' });
    }

    // Recargar datos con nuevo ordenamiento
    this.loadPedidos(this.currentFilters());
  }

  /**
   * Obtiene el ícono de ordenamiento
   */
  getSortIcon(field: string): string {
    const current = this.currentSort();
    if (current.field !== field) return 'M8 9l4-4 4 4m0 6l-4 4-4-4';

    return current.direction === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7';
  }

  // Métodos de paginación
  previousPage(): void {
    const current = this.currentPage();
    if (current > 1) {
      this.currentPage.set(current - 1);
      this.loadPedidos(this.currentFilters());
    }
  }

  nextPage(): void {
    const current = this.currentPage();
    const total = this.totalPages();
    if (current < total) {
      this.currentPage.set(current + 1);
      this.loadPedidos(this.currentFilters());
    }
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadPedidos(this.currentFilters());
  }

  getStartItem(): number {
    const page = this.currentPage();
    const perPage = this.currentFilters().per_page || 15;
    return (page - 1) * perPage + 1;
  }

  getEndItem(): number {
    const page = this.currentPage();
    const perPage = this.currentFilters().per_page || 15;
    const total = this.totalItems();
    return Math.min(page * perPage, total);
  }

  getVisiblePages(): number[] {
    const current = this.currentPage();
    const total = this.totalPages();
    const delta = 2;

    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, current - delta);
      i <= Math.min(total - 1, current + delta);
      i++
    ) {
      range.push(i);
    }

    if (current - delta > 2) {
      rangeWithDots.push(1, '...' as any);
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (current + delta < total - 1) {
      rangeWithDots.push('...' as any, total);
    } else {
      rangeWithDots.push(total);
    }

    return rangeWithDots.filter((page) => typeof page === 'number') as number[];
  }

  getPageClasses(page: number): string {
    const current = this.currentPage();
    const baseClasses = 'border-gray-300';

    if (page === current) {
      return `${baseClasses} bg-blue-50 border-blue-500 text-blue-600`;
    }

    return `${baseClasses} bg-white text-gray-500 hover:bg-gray-50`;
  }

  // Métodos de acciones de pedidos
  onViewPedido(pedido: Pedido): void {
    this.pedidoSelected.emit(pedido.id);
  }

  onEditPedido(pedido: Pedido): void {
    if (this.pedidoService.puedeEditarPedido(pedido)) {
      this.editPedido.emit(pedido.id);
    } else {
      alert('No se puede editar este pedido en su estado actual');
    }
  }

  onDeletePedido(pedido: Pedido): void {
    if (!this.pedidoService.puedeEliminarPedido(pedido)) {
      alert('No se puede eliminar este pedido en su estado actual');
      return;
    }

    const confirmed = confirm(
      `¿Estás seguro de que deseas eliminar el pedido #${pedido.numero_pedido}?`
    );
    if (confirmed) {
      this.pedidoService
        .eliminarPedido(pedido.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            console.log('Pedido eliminado:', pedido.id);
            this.refreshData();
          },
          error: (error) => {
            console.error('Error al eliminar pedido:', error);
          },
        });
    }
  }

  onChangeEstado(pedido: Pedido, nuevoEstado: EstadoPedido): void {
    if (!this.pedidoService.puedeCambiarEstado(pedido, nuevoEstado)) {
      alert('No se puede cambiar a este estado desde el estado actual');
      return;
    }

    this.pedidoService
      .cambiarEstado(pedido.id, { estado: nuevoEstado })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('Estado actualizado:', {
            pedido: pedido.id,
            nuevoEstado,
          });
          this.refreshData();
        },
        error: (error) => {
          console.error('Error al cambiar estado:', error);
        },
      });
  }

  onCancelPedido(pedido: Pedido): void {
    if (!this.pedidoService.puedeCancelar(pedido)) {
      alert('No se puede cancelar este pedido en su estado actual');
      return;
    }

    const confirmed = confirm(
      `¿Estás seguro de que deseas cancelar el pedido #${pedido.numero_pedido}?`
    );

    if (confirmed) {
      this.onChangeEstado(pedido, 'cancelado');
    }
  }

  onDuplicatePedido(pedido: Pedido): void {
    console.log('Duplicar pedido:', pedido);
    // Implementar lógica de duplicación
    // Podría navegar al formulario con los datos pre-cargados
  }

  onPrintPedido(pedido: Pedido): void {
    console.log('Imprimir pedido:', pedido);
    // Implementar lógica de impresión
    window.print();
  }

  onExportPedido(pedido: Pedido): void {
    console.log('Exportar pedido:', pedido);
    // Implementar lógica de exportación
    const resumen = this.pedidoService.generarResumenPedido(pedido);
    const dataStr = JSON.stringify(resumen, null, 2);
    const dataUri =
      'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `pedido_${pedido.numero_pedido}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }

  onTrackPedido(pedido: Pedido): void {
    if (pedido.codigo_rastreo) {
      this.pedidoService
        .rastrearPedido(pedido.codigo_rastreo)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (rastreo) => {
            console.log('Información de rastreo:', rastreo);
            // Mostrar modal o navegar a vista de rastreo
          },
          error: (error) => {
            console.error('Error al rastrear pedido:', error);
          },
        });
    } else {
      alert('Este pedido no tiene código de rastreo asignado');
    }
  }

  // Métodos de utilidad expandidos
  formatCurrency(value: number, moneda: Moneda = 'PEN'): string {
    const currencies = {
      PEN: 'es-PE',
      USD: 'en-US',
      EUR: 'de-DE',
    };

    return new Intl.NumberFormat(currencies[moneda], {
      style: 'currency',
      currency: moneda,
      minimumFractionDigits: 2,
    }).format(value);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatDateOnly(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  formatTimeEntrega(minutos: number | null): string {
    return this.pedidoService.formatearTiempoEntrega(minutos) || 'No definido';
  }

  getEstadoColor(estado: EstadoPedido): string {
    const option = this.estadosOptions.find((opt) => opt.value === estado);
    return option
      ? `bg-${option.color}-100 text-${option.color}-800`
      : 'bg-gray-100 text-gray-800';
  }

  getTipoEntregaColor(tipo: TipoEntrega): string {
    return tipo === 'delivery'
      ? 'bg-emerald-100 text-emerald-800'
      : 'bg-teal-100 text-teal-800';
  }

  getCanalVentaColor(canal: CanalVenta): string {
    const colors: Record<CanalVenta, string> = {
      web: 'bg-blue-100 text-blue-800',
      app: 'bg-green-100 text-green-800',
      tienda_fisica: 'bg-purple-100 text-purple-800',
      telefono: 'bg-yellow-100 text-yellow-800',
      whatsapp: 'bg-green-100 text-green-800',
    };
    return colors[canal] || 'bg-gray-100 text-gray-800';
  }

  isPedidoVencido(pedido: Pedido): boolean {
    if (!pedido.fecha_entrega_programada) return false;

    const fechaPrograma = new Date(pedido.fecha_entrega_programada);
    const ahora = new Date();

    return pedido.estado !== 'entregado' && fechaPrograma < ahora;
  }

  getPedidoStatusText(pedido: Pedido): string {
    if (pedido.es_credito && pedido.tipo_pago === 'credito') {
      return `${pedido.estado} (Crédito)`;
    }

    if (pedido.codigo_rastreo) {
      return `${pedido.estado} (${pedido.codigo_rastreo})`;
    }

    return pedido.estado;
  }

  getSimboloMoneda(moneda: Moneda): string {
    return this.pedidoService.obtenerSimboloMoneda(moneda);
  }

  trackByPedidoId(index: number, pedido: Pedido): number {
    return pedido.id;
  }
}
