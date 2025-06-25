import {
  Component,
  Input,
  Output,
  EventEmitter,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { Pedido } from '../../../../../../core/models/pedido.interface';
import {
  CuotaCredito,
  EstadoCuota,
} from '../../../../../../core/models/cuota-credito.interface';

/**
 * Interfaz para estadísticas de cuotas
 */
interface EstadisticasCuotas {
  totalCuotas: number;
  cuotasPagadas: number;
  cuotasPendientes: number;
  cuotasAtrasadas: number;
  montoPagado: number;
  montoPendiente: number;
  porcentajePagado: number;
  proximaVencimiento: CuotaCredito | null;
}

/**
 * Interfaz para el plan de cuotas
 */
interface PlanCuotas {
  numeroCuotas: number;
  montoCuota: number;
  frecuencia: 'semanal' | 'quincenal' | 'mensual';
  fechaInicio: string;
  fechaFin: string;
}

/**
 * Componente para mostrar la sección de cuotas del pedido
 * Incluye gestión de pagos a plazos y seguimiento de vencimientos
 */
@Component({
  selector: 'app-cuotas-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cuotas-section.component.html',
  styleUrls: ['./cuotas-section.component.css'],
})
export class CuotasSectionComponent {
  @Input({ required: true }) pedido!: Pedido;
  @Output() cuotaAction = new EventEmitter<{
    action: string;
    cuotaId?: number;
    data?: any;
  }>();

  // Signals para estado del componente
  showCreatePlanModal = signal(false);
  showPaymentModal = signal(false);
  selectedCuota = signal<CuotaCredito | null>(null);
  isProcessing = signal(false);

  // Computed signals para información derivada
  cuotas = computed(() => {
    // Como el pedido no tiene cuotas directamente, simulamos un array vacío
    // En una implementación real, esto vendría de un servicio separado
    return [] as CuotaCredito[];
  });

  hasCuotas = computed(() => {
    return this.cuotas().length > 0;
  });

  estadisticasCuotas = computed((): EstadisticasCuotas => {
    const cuotas = this.cuotas();
    const totalCuotas = cuotas.length;

    const cuotasPagadas = cuotas.filter(
      (cuota) => cuota.estado === EstadoCuota.PAGADA
    ).length;
    const cuotasPendientes = cuotas.filter(
      (cuota) => cuota.estado === EstadoCuota.PENDIENTE
    ).length;
    const cuotasAtrasadas = cuotas.filter(
      (cuota) =>
        cuota.estado === EstadoCuota.VENCIDA ||
        cuota.estado === EstadoCuota.EN_MORA
    ).length;

    const montoPagado = cuotas
      .filter((cuota) => cuota.estado === EstadoCuota.PAGADA)
      .reduce((total, cuota) => total + cuota.monto_cuota, 0);

    const montoPendiente = cuotas
      .filter((cuota) => cuota.estado !== EstadoCuota.PAGADA)
      .reduce((total, cuota) => total + cuota.monto_cuota, 0);

    const totalMonto = montoPagado + montoPendiente;
    const porcentajePagado =
      totalMonto > 0 ? (montoPagado / totalMonto) * 100 : 0;

    // Próxima cuota por vencer
    const cuotasPendientesOrdenadas = cuotas
      .filter((cuota) => cuota.estado === EstadoCuota.PENDIENTE)
      .sort(
        (a, b) =>
          new Date(a.fecha_vencimiento).getTime() -
          new Date(b.fecha_vencimiento).getTime()
      );

    const proximaVencimiento =
      cuotasPendientesOrdenadas.length > 0
        ? cuotasPendientesOrdenadas[0]
        : null;

    return {
      totalCuotas,
      cuotasPagadas,
      cuotasPendientes,
      cuotasAtrasadas,
      montoPagado,
      montoPendiente,
      porcentajePagado,
      proximaVencimiento,
    };
  });

  cuotasPorEstado = computed(() => {
    const cuotas = this.cuotas();
    return {
      pagadas: cuotas.filter((cuota) => cuota.estado === EstadoCuota.PAGADA),
      pendientes: cuotas.filter(
        (cuota) => cuota.estado === EstadoCuota.PENDIENTE
      ),
      atrasadas: cuotas.filter(
        (cuota) =>
          cuota.estado === EstadoCuota.VENCIDA ||
          cuota.estado === EstadoCuota.EN_MORA
      ),
      canceladas: cuotas.filter(
        (cuota) => cuota.estado === EstadoCuota.CANCELADA
      ),
    };
  });

  /**
   * Obtiene la información de estilo para un estado de cuota
   */
  getEstadoCuotaInfo(estado: EstadoCuota): {
    label: string;
    color: string;
    icon: string;
  } {
    const estadosMap = {
      [EstadoCuota.PENDIENTE]: {
        label: 'Pendiente',
        color: 'bg-yellow-100 text-yellow-800',
        icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      },
      [EstadoCuota.PAGADA]: {
        label: 'Pagada',
        color: 'bg-green-100 text-green-800',
        icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      },
      [EstadoCuota.PAGADA_PARCIAL]: {
        label: 'Pago Parcial',
        color: 'bg-blue-100 text-blue-800',
        icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      },
      [EstadoCuota.VENCIDA]: {
        label: 'Vencida',
        color: 'bg-red-100 text-red-800',
        icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z',
      },
      [EstadoCuota.EN_MORA]: {
        label: 'En Mora',
        color: 'bg-red-100 text-red-800',
        icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z',
      },
      [EstadoCuota.CANCELADA]: {
        label: 'Cancelada',
        color: 'bg-gray-100 text-gray-800',
        icon: 'M6 18L18 6M6 6l12 12',
      },
      [EstadoCuota.REFINANCIADA]: {
        label: 'Refinanciada',
        color: 'bg-purple-100 text-purple-800',
        icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
      },
      [EstadoCuota.CONDONADA]: {
        label: 'Condonada',
        color: 'bg-indigo-100 text-indigo-800',
        icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      },
    };
    return estadosMap[estado] || estadosMap[EstadoCuota.PENDIENTE];
  }

  /**
   * Verifica si una cuota está atrasada
   */
  isCuotaAtrasada(cuota: CuotaCredito): boolean {
    if (cuota.estado === EstadoCuota.PAGADA) return false;

    const fechaVencimiento = new Date(cuota.fecha_vencimiento);
    const hoy = new Date();
    return fechaVencimiento < hoy;
  }

  /**
   * Obtiene los días de atraso de una cuota
   */
  getDiasAtraso(cuota: CuotaCredito): number {
    if (!this.isCuotaAtrasada(cuota)) return 0;

    const fechaVencimiento = new Date(cuota.fecha_vencimiento);
    const hoy = new Date();
    const diffTime = hoy.getTime() - fechaVencimiento.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Obtiene los días hasta el vencimiento
   */
  getDiasHastaVencimiento(cuota: CuotaCredito): number {
    if (cuota.estado === EstadoCuota.PAGADA) return 0;

    const fechaVencimiento = new Date(cuota.fecha_vencimiento);
    const hoy = new Date();
    const diffTime = fechaVencimiento.getTime() - hoy.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Verifica si una cuota está próxima a vencer (7 días)
   */
  isCuotaProximaVencer(cuota: CuotaCredito): boolean {
    if (cuota.estado === EstadoCuota.PAGADA) return false;

    const diasHastaVencimiento = this.getDiasHastaVencimiento(cuota);
    return diasHastaVencimiento <= 7 && diasHastaVencimiento > 0;
  }

  /**
   * Verifica si se puede crear un plan de cuotas
   */
  canCreatePlan(): boolean {
    return !this.hasCuotas() && this.pedido?.estado !== 'cancelado';
  }

  /**
   * Verifica si se puede pagar una cuota
   */
  canPayCuota(cuota: CuotaCredito): boolean {
    return (
      cuota.estado === EstadoCuota.PENDIENTE ||
      cuota.estado === EstadoCuota.VENCIDA ||
      cuota.estado === EstadoCuota.EN_MORA
    );
  }

  /**
   * Verifica si se puede cancelar una cuota
   */
  canCancelCuota(cuota: CuotaCredito): boolean {
    return cuota.estado === EstadoCuota.PENDIENTE;
  }

  /**
   * Abre el modal para crear plan de cuotas
   */
  openCreatePlanModal(): void {
    this.showCreatePlanModal.set(true);
  }

  /**
   * Cierra el modal para crear plan de cuotas
   */
  closeCreatePlanModal(): void {
    this.showCreatePlanModal.set(false);
  }

  /**
   * Abre el modal para pagar cuota
   */
  openPaymentModal(cuota: CuotaCredito): void {
    this.selectedCuota.set(cuota);
    this.showPaymentModal.set(true);
  }

  /**
   * Cierra el modal de pago
   */
  closePaymentModal(): void {
    this.selectedCuota.set(null);
    this.showPaymentModal.set(false);
  }

  /**
   * Marca una cuota como pagada
   */
  markCuotaAsPaid(cuota: CuotaCredito): void {
    if (!this.canPayCuota(cuota)) return;

    this.cuotaAction.emit({
      action: 'mark_as_paid',
      cuotaId: cuota.id,
    });
  }

  /**
   * Cancela una cuota
   */
  cancelCuota(cuota: CuotaCredito): void {
    if (!this.canCancelCuota(cuota)) return;

    this.cuotaAction.emit({
      action: 'cancel_cuota',
      cuotaId: cuota.id,
    });
  }

  /**
   * Edita una cuota
   */
  editCuota(cuota: CuotaCredito): void {
    this.cuotaAction.emit({
      action: 'edit_cuota',
      cuotaId: cuota.id,
      data: cuota,
    });
  }

  /**
   * Elimina una cuota
   */
  deleteCuota(cuota: CuotaCredito): void {
    this.cuotaAction.emit({
      action: 'delete_cuota',
      cuotaId: cuota.id,
    });
  }

  /**
   * Crea un plan de cuotas
   */
  createPlan(planData: PlanCuotas): void {
    this.cuotaAction.emit({
      action: 'create_plan',
      data: planData,
    });
    this.closeCreatePlanModal();
  }

  /**
   * Procesa el pago de una cuota
   */
  processCuotaPayment(paymentData: any): void {
    this.cuotaAction.emit({
      action: 'process_payment',
      cuotaId: this.selectedCuota()?.id,
      data: paymentData,
    });
    this.closePaymentModal();
  }

  /**
   * Obtiene el color de progreso según el porcentaje
   */
  getProgressColor(porcentaje: number): string {
    if (porcentaje >= 80) return 'bg-green-600';
    if (porcentaje >= 50) return 'bg-blue-600';
    if (porcentaje >= 25) return 'bg-yellow-600';
    return 'bg-red-600';
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
    }).format(date);
  }

  /**
   * Formatea una fecha con hora
   */
  formatDateTime(dateString: string): string {
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
   * Track by function para cuotas
   */
  trackByCuotaId(index: number, cuota: CuotaCredito): number {
    return cuota.id;
  }
}
