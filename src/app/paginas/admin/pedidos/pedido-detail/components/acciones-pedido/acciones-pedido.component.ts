import {
  Component,
  Input,
  Output,
  EventEmitter,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  Pedido,
  EstadoPedido,
} from '../../../../../../core/models/pedido.interface';

/**
 * Interfaz para las acciones disponibles
 */
interface AccionPedido {
  id: string;
  label: string;
  icon: string;
  color: string;
  description: string;
  requiresConfirmation: boolean;
  disabled?: boolean;
  visible?: boolean;
}

/**
 * Interfaz para configuración de impresión
 */
interface ConfiguracionImpresion {
  incluirDetalles: boolean;
  incluirPagos: boolean;
  incluirCuotas: boolean;
  formato: 'A4' | 'ticket' | 'carta';
  copias: number;
}

/**
 * Interfaz para configuración de notificación
 */
interface ConfiguracionNotificacion {
  tipo: 'email' | 'sms' | 'whatsapp';
  mensaje: string;
  incluirFactura: boolean;
  incluirGuiaEnvio: boolean;
}

/**
 * Componente para gestionar las acciones principales del pedido
 * Incluye cambio de estado, impresión, notificaciones, etc.
 */
@Component({
  selector: 'app-acciones-pedido',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './acciones-pedido.component.html',
  styleUrls: ['./acciones-pedido.component.css'],
})
export class AccionesPedidoComponent {
  @Input({ required: true }) pedido!: Pedido;
  @Input() isLoading = false;
  @Output() accionExecuted = new EventEmitter<{
    action: string;
    data?: any;
  }>();

  // Signals para estado del componente
  showEstadoModal = signal(false);
  showImpresionModal = signal(false);
  showNotificacionModal = signal(false);
  showConfirmModal = signal(false);
  selectedAction = signal<AccionPedido | null>(null);
  nuevoEstado = signal<EstadoPedido>('pendiente');
  motivoCambio = signal('');

  // Configuraciones
  configImpresion = signal<ConfiguracionImpresion>({
    incluirDetalles: true,
    incluirPagos: true,
    incluirCuotas: false,
    formato: 'A4',
    copias: 1,
  });

  configNotificacion = signal<ConfiguracionNotificacion>({
    tipo: 'email',
    mensaje: '',
    incluirFactura: false,
    incluirGuiaEnvio: false,
  });

  // Computed signals para acciones disponibles
  accionesDisponibles = computed((): AccionPedido[] => {
    const estado = this.pedido?.estado;
    const acciones: AccionPedido[] = [
      {
        id: 'cambiar_estado',
        label: 'Cambiar Estado',
        icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
        color: 'text-blue-600 hover:text-blue-900',
        description: 'Cambiar el estado del pedido',
        requiresConfirmation: true,
        visible:
          estado !== 'entregado' &&
          estado !== 'cancelado' &&
          estado !== 'devuelto',
      },
      {
        id: 'imprimir_pedido',
        label: 'Imprimir Pedido',
        icon: 'M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z',
        color: 'text-gray-600 hover:text-gray-900',
        description: 'Imprimir comprobante del pedido',
        requiresConfirmation: false,
        visible: true,
      },
      {
        id: 'generar_factura',
        label: 'Generar Factura',
        icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
        color: 'text-green-600 hover:text-green-900',
        description: 'Generar factura electrónica',
        requiresConfirmation: false,
        visible: ['aprobado', 'en_proceso', 'enviado', 'entregado'].includes(
          estado
        ),
        disabled: false, // Cambiar por lógica real cuando esté disponible
      },
      {
        id: 'enviar_notificacion',
        label: 'Enviar Notificación',
        icon: 'M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
        color: 'text-purple-600 hover:text-purple-900',
        description: 'Enviar notificación al cliente',
        requiresConfirmation: false,
        visible: true,
      },
      {
        id: 'generar_guia_envio',
        label: 'Generar Guía de Envío',
        icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
        color: 'text-indigo-600 hover:text-indigo-900',
        description: 'Generar guía de envío',
        requiresConfirmation: false,
        visible: ['aprobado', 'en_proceso', 'enviado'].includes(estado),
        disabled: false, // Cambiar por lógica real cuando esté disponible
      },
      {
        id: 'duplicar_pedido',
        label: 'Duplicar Pedido',
        icon: 'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z',
        color: 'text-yellow-600 hover:text-yellow-900',
        description: 'Crear una copia del pedido',
        requiresConfirmation: true,
        visible: true,
      },
      {
        id: 'cancelar_pedido',
        label: 'Cancelar Pedido',
        icon: 'M6 18L18 6M6 6l12 12',
        color: 'text-red-600 hover:text-red-900',
        description: 'Cancelar el pedido',
        requiresConfirmation: true,
        visible:
          estado !== 'cancelado' &&
          estado !== 'entregado' &&
          estado !== 'devuelto',
      },
      {
        id: 'reactivar_pedido',
        label: 'Reactivar Pedido',
        icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
        color: 'text-green-600 hover:text-green-900',
        description: 'Reactivar pedido cancelado',
        requiresConfirmation: true,
        visible: estado === 'cancelado' || estado === 'rechazado',
      },
    ];

    return acciones.filter((accion) => accion.visible !== false);
  });

  accionesPrincipales = computed(() => {
    return this.accionesDisponibles().slice(0, 4);
  });

  accionesSecundarias = computed(() => {
    return this.accionesDisponibles().slice(4);
  });

  // Estados disponibles para cambio
  estadosDisponibles = computed(
    (): { value: EstadoPedido; label: string; color: string }[] => {
      const estadoActual = this.pedido?.estado;
      const estados = [
        {
          value: 'pendiente' as EstadoPedido,
          label: 'Pendiente',
          color: 'text-yellow-600',
        },
        {
          value: 'aprobado' as EstadoPedido,
          label: 'Aprobado',
          color: 'text-blue-600',
        },
        {
          value: 'rechazado' as EstadoPedido,
          label: 'Rechazado',
          color: 'text-red-600',
        },
        {
          value: 'en_proceso' as EstadoPedido,
          label: 'En Proceso',
          color: 'text-orange-600',
        },
        {
          value: 'enviado' as EstadoPedido,
          label: 'Enviado',
          color: 'text-purple-600',
        },
        {
          value: 'entregado' as EstadoPedido,
          label: 'Entregado',
          color: 'text-green-600',
        },
        {
          value: 'cancelado' as EstadoPedido,
          label: 'Cancelado',
          color: 'text-red-600',
        },
        {
          value: 'devuelto' as EstadoPedido,
          label: 'Devuelto',
          color: 'text-gray-600',
        },
      ];

      // Filtrar estados según lógica de negocio
      return estados.filter((estado) => {
        if (estadoActual === 'entregado') return false;
        if (estadoActual === 'cancelado' && estado.value !== 'pendiente')
          return false;
        return estado.value !== estadoActual;
      });
    }
  );

  /**
   * Ejecuta una acción
   */
  executeAction(accion: AccionPedido): void {
    if (accion.disabled) return;

    this.selectedAction.set(accion);

    switch (accion.id) {
      case 'cambiar_estado':
        this.openEstadoModal();
        break;
      case 'imprimir_pedido':
        this.openImpresionModal();
        break;
      case 'enviar_notificacion':
        this.openNotificacionModal();
        break;
      default:
        if (accion.requiresConfirmation) {
          this.openConfirmModal();
        } else {
          this.confirmAction();
        }
        break;
    }
  }

  /**
   * Abre el modal de cambio de estado
   */
  openEstadoModal(): void {
    this.nuevoEstado.set('pendiente');
    this.motivoCambio.set('');
    this.showEstadoModal.set(true);
  }

  /**
   * Cierra el modal de cambio de estado
   */
  closeEstadoModal(): void {
    this.showEstadoModal.set(false);
  }

  /**
   * Abre el modal de impresión
   */
  openImpresionModal(): void {
    this.showImpresionModal.set(true);
  }

  /**
   * Cierra el modal de impresión
   */
  closeImpresionModal(): void {
    this.showImpresionModal.set(false);
  }

  /**
   * Abre el modal de notificación
   */
  openNotificacionModal(): void {
    this.configNotificacion.update((config) => ({
      ...config,
      mensaje: this.getDefaultMessage(),
    }));
    this.showNotificacionModal.set(true);
  }

  /**
   * Cierra el modal de notificación
   */
  closeNotificacionModal(): void {
    this.showNotificacionModal.set(false);
  }

  /**
   * Abre el modal de confirmación
   */
  openConfirmModal(): void {
    this.showConfirmModal.set(true);
  }

  /**
   * Cierra el modal de confirmación
   */
  closeConfirmModal(): void {
    this.showConfirmModal.set(false);
  }

  /**
   * Confirma el cambio de estado
   */
  confirmCambioEstado(): void {
    const data = {
      nuevoEstado: this.nuevoEstado(),
      motivo: this.motivoCambio(),
    };

    this.accionExecuted.emit({
      action: 'cambiar_estado',
      data,
    });

    this.closeEstadoModal();
  }

  /**
   * Confirma la impresión
   */
  confirmImpresion(): void {
    this.accionExecuted.emit({
      action: 'imprimir_pedido',
      data: this.configImpresion(),
    });

    this.closeImpresionModal();
  }

  /**
   * Confirma el envío de notificación
   */
  confirmNotificacion(): void {
    this.accionExecuted.emit({
      action: 'enviar_notificacion',
      data: this.configNotificacion(),
    });

    this.closeNotificacionModal();
  }

  /**
   * Confirma la acción seleccionada
   */
  confirmAction(): void {
    const accion = this.selectedAction();
    if (!accion) return;

    this.accionExecuted.emit({
      action: accion.id,
    });

    this.closeConfirmModal();
  }

  /**
   * Obtiene el mensaje por defecto para notificaciones
   */
  private getDefaultMessage(): string {
    const estado = this.pedido?.estado;
    const numero = this.pedido?.id || 'N/A'; // Usar id en lugar de numero_pedido

    const mensajes: Record<EstadoPedido, string> = {
      pendiente: `Hola, tu pedido #${numero} está pendiente de confirmación.`,
      aprobado: `¡Excelente! Tu pedido #${numero} ha sido aprobado y está siendo preparado.`,
      rechazado: `Lamentamos informarte que tu pedido #${numero} ha sido rechazado.`,
      en_proceso: `Tu pedido #${numero} está siendo preparado para el envío.`,
      enviado: `Tu pedido #${numero} ha sido enviado y está en camino.`,
      entregado: `Tu pedido #${numero} ha sido entregado exitosamente. ¡Gracias por tu compra!`,
      cancelado: `Lamentamos informarte que tu pedido #${numero} ha sido cancelado.`,
      devuelto: `Tu pedido #${numero} ha sido procesado para devolución.`,
    };

    return mensajes[estado] || `Actualización sobre tu pedido #${numero}.`;
  }

  /**
   * Obtiene la información de estilo para un estado
   */
  getEstadoInfo(estado: EstadoPedido): {
    label: string;
    color: string;
    icon: string;
  } {
    const estadosMap: Record<
      EstadoPedido,
      { label: string; color: string; icon: string }
    > = {
      pendiente: {
        label: 'Pendiente',
        color: 'text-yellow-600',
        icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      },
      aprobado: {
        label: 'Aprobado',
        color: 'text-blue-600',
        icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      },
      rechazado: {
        label: 'Rechazado',
        color: 'text-red-600',
        icon: 'M6 18L18 6M6 6l12 12',
      },
      en_proceso: {
        label: 'En Proceso',
        color: 'text-orange-600',
        icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
      },
      enviado: {
        label: 'Enviado',
        color: 'text-purple-600',
        icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
      },
      entregado: {
        label: 'Entregado',
        color: 'text-green-600',
        icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      },
      cancelado: {
        label: 'Cancelado',
        color: 'text-red-600',
        icon: 'M6 18L18 6M6 6l12 12',
      },
      devuelto: {
        label: 'Devuelto',
        color: 'text-gray-600',
        icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
      },
    };

    return estadosMap[estado] || estadosMap.pendiente;
  }

  /**
   * Verifica si una acción está deshabilitada
   */
  isActionDisabled(accion: AccionPedido): boolean {
    return accion.disabled || this.isLoading;
  }

  /**
   * Track by function para acciones
   */
  trackByActionId(index: number, accion: AccionPedido): string {
    return accion.id;
  }

  /**
   * Métodos para manejar cambios de configuración de impresión
   */
  onFormatoChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.configImpresion.update((config) => ({
      ...config,
      formato: target.value as 'A4' | 'ticket' | 'carta',
    }));
  }

  onCopiasChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.configImpresion.update((config) => ({
      ...config,
      copias: +target.value,
    }));
  }

  onIncluirDetallesChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.configImpresion.update((config) => ({
      ...config,
      incluirDetalles: target.checked,
    }));
  }

  onIncluirPagosChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.configImpresion.update((config) => ({
      ...config,
      incluirPagos: target.checked,
    }));
  }

  onIncluirCuotasChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.configImpresion.update((config) => ({
      ...config,
      incluirCuotas: target.checked,
    }));
  }

  /**
   * Métodos para manejar cambios de configuración de notificación
   */
  onTipoNotificacionChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.configNotificacion.update((config) => ({
      ...config,
      tipo: target.value as 'email' | 'sms' | 'whatsapp',
    }));
  }

  onMensajeChange(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.configNotificacion.update((config) => ({
      ...config,
      mensaje: target.value,
    }));
  }

  onIncluirFacturaChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.configNotificacion.update((config) => ({
      ...config,
      incluirFactura: target.checked,
    }));
  }

  onIncluirGuiaEnvioChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.configNotificacion.update((config) => ({
      ...config,
      incluirGuiaEnvio: target.checked,
    }));
  }
}
