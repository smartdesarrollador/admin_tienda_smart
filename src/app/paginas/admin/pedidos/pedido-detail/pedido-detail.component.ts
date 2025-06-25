import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import {
  Pedido,
  EstadoPedido,
  TipoPago,
  TipoEntrega,
  CanalVenta,
  Moneda,
} from '../../../../core/models/pedido.interface';
import { PedidoService } from '../../../../core/services/pedido.service';

// Componentes hijos
import { PedidoHeaderComponent } from './components/pedido-header/pedido-header.component';
import { PedidoTimelineComponent } from './components/pedido-timeline/pedido-timeline.component';
import { ItemsDetailComponent } from './components/items-detail/items-detail.component';
import { PagosSectionComponent } from './components/pagos-section/pagos-section.component';
import { CuotasSectionComponent } from './components/cuotas-section/cuotas-section.component';
import { AccionesPedidoComponent } from './components/acciones-pedido/acciones-pedido.component';

/**
 * Componente para mostrar el detalle completo de un pedido
 * Incluye información del cliente, items, pagos, cuotas, entrega y acciones disponibles
 */
@Component({
  selector: 'app-pedido-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    PedidoHeaderComponent,
    PedidoTimelineComponent,
    ItemsDetailComponent,
    PagosSectionComponent,
    CuotasSectionComponent,
    AccionesPedidoComponent,
  ],
  templateUrl: './pedido-detail.component.html',
  styleUrls: ['./pedido-detail.component.css'],
})
export class PedidoDetailComponent implements OnInit, OnDestroy {
  @Input() pedidoId: number | null = null;
  @Output() pedidoUpdated = new EventEmitter<Pedido>();
  @Output() backToList = new EventEmitter<void>();

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly pedidoService = inject(PedidoService);
  private readonly destroy$ = new Subject<void>();

  // Signals para estado del componente
  isLoading = signal(false);
  error = signal<string | null>(null);
  pedido = signal<Pedido | null>(null);
  activeTab = signal<string>('general');

  // Computed signals expandidos
  hasItems = computed(() => {
    const pedido = this.pedido();
    return pedido?.detalles && pedido.detalles.length > 0;
  });

  hasPagos = computed(() => {
    const pedido = this.pedido();
    return pedido?.pagos && pedido.pagos.length > 0;
  });

  hasCuotas = computed(() => {
    const pedido = this.pedido();
    return pedido?.cuotas_credito && pedido.cuotas_credito.length > 0;
  });

  hasRastreo = computed(() => {
    const pedido = this.pedido();
    return pedido?.codigo_rastreo && pedido.codigo_rastreo.trim() !== '';
  });

  isDelivery = computed(() => {
    const pedido = this.pedido();
    return pedido?.tipo_entrega === 'delivery';
  });

  isCredito = computed(() => {
    const pedido = this.pedido();
    return pedido?.es_credito === true;
  });

  hasCoordenadasEntrega = computed(() => {
    const pedido = this.pedido();
    return pedido && this.pedidoService.tieneCoordenadasEntrega(pedido);
  });

  tienePagosPendientes = computed(() => {
    const pedido = this.pedido();
    return pedido ? this.pedidoService.tienePagosPendientes(pedido) : false;
  });

  saldoPendiente = computed(() => {
    const pedido = this.pedido();
    return pedido ? this.pedidoService.calcularSaldoPendiente(pedido) : 0;
  });

  totalPagado = computed(() => {
    const pedido = this.pedido();
    return pedido ? this.pedidoService.calcularTotalPagado(pedido) : 0;
  });

  // Datos parseados computados
  datosEnvio = computed(() => {
    const pedido = this.pedido();
    return pedido ? this.pedidoService.obtenerDatosEnvio(pedido) : null;
  });

  datosCliente = computed(() => {
    const pedido = this.pedido();
    return pedido ? this.pedidoService.obtenerDatosCliente(pedido) : null;
  });

  metodoEnvio = computed(() => {
    const pedido = this.pedido();
    return pedido ? this.pedidoService.obtenerMetodoEnvio(pedido) : null;
  });

  coordenadasEntrega = computed(() => {
    const pedido = this.pedido();
    return pedido ? this.pedidoService.obtenerCoordenadasEntrega(pedido) : null;
  });

  ultimoSeguimiento = computed(() => {
    const pedido = this.pedido();
    return pedido ? this.pedidoService.obtenerUltimoSeguimiento(pedido) : null;
  });

  // Tabs disponibles expandidos
  readonly tabs = [
    {
      id: 'general',
      label: 'Información General',
      icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      visible: () => true,
    },
    {
      id: 'items',
      label: 'Productos',
      icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
      visible: () => this.hasItems(),
    },
    {
      id: 'entrega',
      label: 'Entrega',
      icon: 'M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      visible: () => this.isDelivery(),
    },
    {
      id: 'pagos',
      label: 'Pagos',
      icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
      visible: () => this.hasPagos(),
    },
    {
      id: 'cuotas',
      label: 'Cuotas',
      icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z',
      visible: () => this.hasCuotas(),
    },
    {
      id: 'rastreo',
      label: 'Rastreo',
      icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z',
      visible: () => this.hasRastreo(),
    },
    {
      id: 'timeline',
      label: 'Historial',
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      visible: () => true,
    },
  ];

  // Información de estado del pedido
  readonly estadoInfo = computed(() => {
    const pedido = this.pedido();
    if (!pedido) return null;

    return {
      estado: pedido.estado,
      estadoDetallado: pedido.estado_detallado,
      puedeEditar: this.pedidoService.puedeEditarPedido(pedido),
      puedeEliminar: this.pedidoService.puedeEliminarPedido(pedido),
      puedeCancelar: this.pedidoService.puedeCancelar(pedido),
      puedeAplicarCupon: this.pedidoService.puedeAplicarCupon(pedido),
      puedeAsignarRepartidor: this.pedidoService.puedeAsignarRepartidor(pedido),
      estadosPermitidos: this.pedidoService.obtenerEstadosPermitidos(
        pedido.estado
      ),
    };
  });

  ngOnInit(): void {
    this.loadPedido();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carga los datos del pedido
   */
  private loadPedido(): void {
    if (!this.pedidoId) {
      this.error.set('ID de pedido no válido');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    this.pedidoService
      .obtenerPedido(this.pedidoId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (pedido) => {
          this.pedido.set(pedido);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error al cargar pedido:', error);
          this.error.set('Error al cargar el pedido');
          this.isLoading.set(false);
        },
      });
  }

  /**
   * Cambia la pestaña activa
   */
  setActiveTab(tabId: string): void {
    this.activeTab.set(tabId);
  }

  /**
   * Verifica si un tab está visible
   */
  isTabVisible(tab: any): boolean {
    return tab.visible();
  }

  /**
   * Recarga los datos del pedido
   */
  refreshPedido(): void {
    this.loadPedido();
  }

  /**
   * Navega de vuelta a la lista de pedidos
   */
  goBack(): void {
    this.backToList.emit();
  }

  /**
   * Navega al formulario de edición
   */
  editPedido(): void {
    if (this.pedidoId) {
      const estadoInfo = this.estadoInfo();
      if (estadoInfo?.puedeEditar) {
        this.backToList.emit();
      } else {
        alert('No se puede editar este pedido en su estado actual');
      }
    }
  }

  /**
   * Cambia el estado del pedido
   */
  onChangeEstado(nuevoEstado: EstadoPedido): void {
    const pedido = this.pedido();
    if (!pedido || !this.pedidoId) return;

    if (!this.pedidoService.puedeCambiarEstado(pedido, nuevoEstado)) {
      alert('No se puede cambiar a este estado desde el estado actual');
      return;
    }

    const observaciones = prompt('Observaciones (opcional):');

    this.pedidoService
      .cambiarEstado(this.pedidoId, {
        estado: nuevoEstado,
        observaciones: observaciones || undefined,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (pedidoActualizado) => {
          this.pedido.set(pedidoActualizado);
          this.pedidoUpdated.emit(pedidoActualizado);
        },
        error: (error) => {
          console.error('Error al cambiar estado:', error);
          alert('Error al cambiar el estado del pedido');
        },
      });
  }

  /**
   * Cancela el pedido
   */
  onCancelPedido(): void {
    const pedido = this.pedido();
    if (!pedido) return;

    if (!this.pedidoService.puedeCancelar(pedido)) {
      alert('No se puede cancelar este pedido en su estado actual');
      return;
    }

    const confirmed = confirm(
      `¿Estás seguro de que deseas cancelar el pedido #${pedido.numero_pedido}?`
    );

    if (confirmed) {
      this.onChangeEstado('cancelado');
    }
  }

  /**
   * Asigna repartidor al pedido
   */
  onAsignarRepartidor(): void {
    const pedido = this.pedido();
    if (!pedido || !this.pedidoId) return;

    if (!this.pedidoService.puedeAsignarRepartidor(pedido)) {
      alert('No se puede asignar repartidor a este pedido');
      return;
    }

    // Aquí abrirías un modal para seleccionar repartidor
    console.log('Abrir modal para asignar repartidor');
  }

  /**
   * Actualiza código de rastreo
   */
  onUpdateCodigoRastreo(): void {
    const pedido = this.pedido();
    if (!pedido || !this.pedidoId) return;

    const codigoRastreo = prompt(
      'Código de rastreo:',
      pedido.codigo_rastreo || ''
    );

    if (codigoRastreo !== null) {
      this.pedidoService
        .actualizarPedido(this.pedidoId, { codigo_rastreo: codigoRastreo })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (pedidoActualizado) => {
            this.pedido.set(pedidoActualizado);
            this.pedidoUpdated.emit(pedidoActualizado);
          },
          error: (error) => {
            console.error('Error al actualizar código de rastreo:', error);
            alert('Error al actualizar el código de rastreo');
          },
        });
    }
  }

  /**
   * Maneja acciones del pedido desde componentes hijos
   */
  onPedidoAction(event: { action: string; data?: any }): void {
    console.log('Acción del pedido:', event.action, event.data);

    switch (event.action) {
      case 'cambiar_estado':
        this.onChangeEstado(event.data.estado);
        break;
      case 'cancelar':
        this.onCancelPedido();
        break;
      case 'asignar_repartidor':
        this.onAsignarRepartidor();
        break;
      case 'update_codigo_rastreo':
        this.onUpdateCodigoRastreo();
        break;
      default:
        this.refreshPedido();
        break;
    }

    // Si se actualiza el pedido, emitir el evento
    if (event.action === 'update' && event.data) {
      this.pedidoUpdated.emit(event.data);
    }
  }

  /**
   * Maneja acciones del pedido desde PedidoHeaderComponent
   */
  onHeaderAction(action: string): void {
    console.log('Acción del header:', action);
    this.onPedidoAction({ action });
  }

  /**
   * Imprime el pedido
   */
  onPrintPedido(): void {
    console.log('Imprimir pedido');
    window.print();
  }

  /**
   * Exporta el pedido
   */
  onExportPedido(): void {
    const pedido = this.pedido();
    if (!pedido) return;

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

  /**
   * Obtiene el color del estado
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
   * Obtiene el color del tipo de pago
   */
  getTipoPagoColor(tipoPago: TipoPago): string {
    const colors: Record<TipoPago, string> = {
      contado: 'bg-green-100 text-green-800',
      credito: 'bg-amber-100 text-amber-800',
      transferencia: 'bg-blue-100 text-blue-800',
      tarjeta: 'bg-purple-100 text-purple-800',
      yape: 'bg-pink-100 text-pink-800',
      plin: 'bg-teal-100 text-teal-800',
      paypal: 'bg-indigo-100 text-indigo-800',
    };
    return colors[tipoPago] || 'bg-gray-100 text-gray-800';
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
   * Formatea valores monetarios
   */
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

  /**
   * Formatea fechas
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Formatea solo fecha
   */
  formatDateOnly(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  /**
   * Formatea tiempo de entrega
   */
  formatTiempoEntrega(minutos: number | null): string {
    return this.pedidoService.formatearTiempoEntrega(minutos) || 'No definido';
  }

  /**
   * Obtiene el símbolo de la moneda
   */
  getSimboloMoneda(moneda: Moneda): string {
    return this.pedidoService.obtenerSimboloMoneda(moneda);
  }

  /**
   * Verifica si una fecha está vencida
   */
  isFechaVencida(fechaString: string | null): boolean {
    if (!fechaString) return false;

    const fecha = new Date(fechaString);
    const ahora = new Date();

    return fecha < ahora;
  }

  /**
   * Track by function para tabs
   */
  trackByTabId(index: number, tab: any): string {
    return tab.id;
  }
}
