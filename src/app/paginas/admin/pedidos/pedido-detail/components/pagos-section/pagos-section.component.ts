import {
  Component,
  Input,
  Output,
  EventEmitter,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  Pedido,
  Pago,
  EstadoPago,
} from '../../../../../../core/models/pedido.interface';
import { MetodoPago } from '../../../../../../core/models/pago.interface';

/**
 * Interfaz para estadísticas de pagos
 */
interface EstadisticasPagos {
  totalPagado: number;
  totalPendiente: number;
  numeroPagos: number;
  ultimoPago: Pago | null;
  porcentajePagado: number;
}

/**
 * Componente para mostrar la sección de pagos del pedido
 * Incluye lista de pagos, estadísticas y acciones de gestión
 */
@Component({
  selector: 'app-pagos-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagos-section.component.html',
  styleUrls: ['./pagos-section.component.css'],
})
export class PagosSectionComponent {
  @Input({ required: true }) pedido!: Pedido;
  @Output() pagoAction = new EventEmitter<{
    action: string;
    pagoId?: number;
    data?: any;
  }>();

  // Signals para estado del componente
  showAddPaymentModal = signal(false);
  isProcessing = signal(false);

  // Computed signals para información derivada
  pagos = computed(() => {
    return this.pedido?.pagos || [];
  });

  estadisticasPagos = computed((): EstadisticasPagos => {
    const pagos = this.pagos();
    const totalPedido = this.pedido?.total || 0;

    const totalPagado = pagos
      .filter((pago) => pago.estado === 'pagado')
      .reduce((total, pago) => total + pago.monto, 0);

    const totalPendiente = totalPedido - totalPagado;
    const porcentajePagado =
      totalPedido > 0 ? (totalPagado / totalPedido) * 100 : 0;

    const ultimoPago = pagos.length > 0 ? pagos[pagos.length - 1] : null;

    return {
      totalPagado,
      totalPendiente,
      numeroPagos: pagos.length,
      ultimoPago,
      porcentajePagado,
    };
  });

  pagosPorEstado = computed(() => {
    const pagos = this.pagos();
    return {
      pagados: pagos.filter((pago) => pago.estado === 'pagado'),
      pendientes: pagos.filter((pago) => pago.estado === 'pendiente'),
      atrasados: pagos.filter((pago) => pago.estado === 'atrasado'),
      cancelados: pagos.filter((pago) => pago.estado === 'cancelado'),
    };
  });

  /**
   * Obtiene la información de estilo para un estado de pago
   */
  getEstadoPagoInfo(estado: EstadoPago): {
    label: string;
    color: string;
    icon: string;
  } {
    const estadosMap = {
      pendiente: {
        label: 'Pendiente',
        color: 'bg-yellow-100 text-yellow-800',
        icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      },
      pagado: {
        label: 'Pagado',
        color: 'bg-green-100 text-green-800',
        icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      },
      atrasado: {
        label: 'Atrasado',
        color: 'bg-red-100 text-red-800',
        icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z',
      },
      cancelado: {
        label: 'Cancelado',
        color: 'bg-gray-100 text-gray-800',
        icon: 'M6 18L18 6M6 6l12 12',
      },
    };
    return estadosMap[estado] || estadosMap.pendiente;
  }

  /**
   * Obtiene la información de estilo para un método de pago
   */
  getMetodoPagoInfo(metodo: string): {
    label: string;
    icon: string;
    color: string;
  } {
    const metodosMap: Record<
      string,
      { label: string; icon: string; color: string }
    > = {
      efectivo: {
        label: 'Efectivo',
        icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1',
        color: 'text-green-600',
      },
      tarjeta: {
        label: 'Tarjeta',
        icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
        color: 'text-blue-600',
      },
      transferencia: {
        label: 'Transferencia',
        icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
        color: 'text-purple-600',
      },
      yape: {
        label: 'Yape',
        icon: 'M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z',
        color: 'text-purple-600',
      },
      plin: {
        label: 'Plin',
        icon: 'M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z',
        color: 'text-blue-600',
      },
      paypal: {
        label: 'PayPal',
        icon: 'M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z',
        color: 'text-blue-500',
      },
    };
    return metodosMap[metodo] || metodosMap['efectivo'];
  }

  /**
   * Verifica si un pago está atrasado
   */
  isPagoAtrasado(pago: Pago): boolean {
    if (pago.estado === 'pagado') return false;

    // Si tiene fecha de pago y ya pasó, está atrasado
    if (pago.fecha_pago) {
      const fechaPago = new Date(pago.fecha_pago);
      const hoy = new Date();
      return fechaPago < hoy;
    }

    return false;
  }

  /**
   * Obtiene los días de atraso de un pago
   */
  getDiasAtraso(pago: Pago): number {
    if (!this.isPagoAtrasado(pago) || !pago.fecha_pago) return 0;

    const fechaPago = new Date(pago.fecha_pago);
    const hoy = new Date();
    const diffTime = hoy.getTime() - fechaPago.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Verifica si se puede agregar un nuevo pago
   */
  canAddPayment(): boolean {
    const stats = this.estadisticasPagos();
    return stats.totalPendiente > 0;
  }

  /**
   * Verifica si se puede marcar un pago como pagado
   */
  canMarkAsPaid(pago: Pago): boolean {
    return pago.estado === 'pendiente';
  }

  /**
   * Verifica si se puede cancelar un pago
   */
  canCancelPayment(pago: Pago): boolean {
    return pago.estado === 'pendiente';
  }

  /**
   * Abre el modal para agregar pago
   */
  openAddPaymentModal(): void {
    this.showAddPaymentModal.set(true);
  }

  /**
   * Cierra el modal para agregar pago
   */
  closeAddPaymentModal(): void {
    this.showAddPaymentModal.set(false);
  }

  /**
   * Marca un pago como pagado
   */
  markAsPaid(pago: Pago): void {
    if (!this.canMarkAsPaid(pago)) return;

    this.pagoAction.emit({
      action: 'mark_as_paid',
      pagoId: pago.id,
    });
  }

  /**
   * Cancela un pago
   */
  cancelPayment(pago: Pago): void {
    if (!this.canCancelPayment(pago)) return;

    this.pagoAction.emit({
      action: 'cancel_payment',
      pagoId: pago.id,
    });
  }

  /**
   * Edita un pago
   */
  editPayment(pago: Pago): void {
    this.pagoAction.emit({
      action: 'edit_payment',
      pagoId: pago.id,
      data: pago,
    });
  }

  /**
   * Elimina un pago
   */
  deletePayment(pago: Pago): void {
    this.pagoAction.emit({
      action: 'delete_payment',
      pagoId: pago.id,
    });
  }

  /**
   * Agrega un nuevo pago
   */
  addPayment(paymentData: any): void {
    this.pagoAction.emit({
      action: 'add_payment',
      data: paymentData,
    });
    this.closeAddPaymentModal();
  }

  /**
   * Formatea una fecha
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
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
   * Formatea porcentajes
   */
  formatPercentage(value: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value / 100);
  }

  /**
   * Track by function para pagos
   */
  trackByPagoId(index: number, pago: Pago): number {
    return pago.id;
  }
}
