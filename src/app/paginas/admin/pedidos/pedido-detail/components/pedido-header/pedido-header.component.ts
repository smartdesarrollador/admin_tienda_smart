import {
  Component,
  Input,
  Output,
  EventEmitter,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  Pedido,
  EstadoPedido,
} from '../../../../../../core/models/pedido.interface';

/**
 * Componente para mostrar la cabecera con información principal del pedido
 * Incluye datos del cliente, estado, totales y acciones rápidas
 */
@Component({
  selector: 'app-pedido-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pedido-header.component.html',
  styleUrls: ['./pedido-header.component.css'],
})
export class PedidoHeaderComponent {
  @Input({ required: true }) pedido!: Pedido;
  @Output() actionTriggered = new EventEmitter<string>();

  // Computed signals para información derivada
  estadoInfo = computed(() => {
    const estado = this.pedido?.estado;
    return this.getEstadoInfo(estado);
  });

  clienteInfo = computed(() => {
    const cliente = this.pedido?.cliente;
    const usuario = this.pedido?.usuario;

    if (!cliente && !usuario) return null;

    // Priorizar datos del cliente si están disponibles
    if (cliente) {
      return {
        nombre: cliente.nombre_completo || 'Cliente sin nombre',
        documento: cliente.documento || '',
        telefono: cliente.telefono || '',
        activo: cliente.activo || false,
        iniciales: this.getIniciales(cliente.nombre_completo || 'CN'),
        esClienteCompleto: true,
      };
    }

    // Fallback a datos del usuario
    return {
      nombre: usuario?.nombre || 'Cliente sin nombre',
      email: usuario?.email || '',
      telefono: usuario?.telefono || '',
      iniciales: this.getIniciales(usuario?.nombre || 'CN'),
      esClienteCompleto: false,
    };
  });

  totalesInfo = computed(() => {
    const pedido = this.pedido;
    if (!pedido) return null;

    return {
      subtotal: pedido.subtotal || 0,
      descuento: pedido.descuento_total || 0,
      total: pedido.total || 0,
      moneda: pedido.moneda || 'PEN',
      numeroItems: pedido.detalles?.length || 0,
    };
  });

  fechasInfo = computed(() => {
    const pedido = this.pedido;
    if (!pedido) return null;

    return {
      creacion: this.formatDate(pedido.created_at),
      entrega: pedido.estimado_entrega
        ? this.formatDate(pedido.estimado_entrega)
        : null,
      actualizacion: this.formatDate(pedido.updated_at),
      diasDesdePedido: this.calcularDiasDesdePedido(pedido.created_at),
    };
  });

  /**
   * Obtiene información del estado del pedido
   */
  private getEstadoInfo(estado?: EstadoPedido) {
    const estadosMap: Record<
      EstadoPedido,
      { label: string; color: string; icon: string }
    > = {
      pendiente: {
        label: 'Pendiente',
        color: 'bg-yellow-100 text-yellow-800',
        icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      },
      aprobado: {
        label: 'Aprobado',
        color: 'bg-green-100 text-green-800',
        icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      },
      rechazado: {
        label: 'Rechazado',
        color: 'bg-red-100 text-red-800',
        icon: 'M6 18L18 6M6 6l12 12',
      },
      en_proceso: {
        label: 'En Proceso',
        color: 'bg-blue-100 text-blue-800',
        icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
      },
      enviado: {
        label: 'Enviado',
        color: 'bg-purple-100 text-purple-800',
        icon: 'M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4',
      },
      entregado: {
        label: 'Entregado',
        color: 'bg-green-100 text-green-800',
        icon: 'M5 13l4 4L19 7',
      },
      cancelado: {
        label: 'Cancelado',
        color: 'bg-red-100 text-red-800',
        icon: 'M6 18L18 6M6 6l12 12',
      },
      devuelto: {
        label: 'Devuelto',
        color: 'bg-gray-100 text-gray-800',
        icon: 'M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6',
      },
    };

    return estadosMap[estado || 'pendiente'] || estadosMap.pendiente;
  }

  /**
   * Obtiene las iniciales de un nombre
   */
  private getIniciales(nombre: string): string {
    return nombre
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }

  /**
   * Formatea una fecha
   */
  private formatDate(dateString: string): string {
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
   * Calcula los días desde que se creó el pedido
   */
  private calcularDiasDesdePedido(fechaCreacion: string): number {
    const fechaPedido = new Date(fechaCreacion);
    const hoy = new Date();
    const diffTime = hoy.getTime() - fechaPedido.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Formatea valores monetarios
   */
  formatCurrency(value: number, currency: string = 'PEN'): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(value);
  }

  /**
   * Emite una acción
   */
  emitAction(action: string): void {
    this.actionTriggered.emit(action);
  }

  /**
   * Verifica si se puede realizar una acción según el estado
   */
  canPerformAction(action: string): boolean {
    const estado = this.pedido?.estado;

    switch (action) {
      case 'aprobar':
        return estado === 'pendiente';
      case 'rechazar':
        return estado === 'pendiente';
      case 'procesar':
        return estado === 'aprobado';
      case 'enviar':
        return estado === 'en_proceso';
      case 'entregar':
        return estado === 'enviado';
      case 'cancelar':
        return ['pendiente', 'aprobado'].includes(estado || '');
      case 'devolver':
        return estado === 'entregado';
      default:
        return true;
    }
  }

  /**
   * Obtiene el texto para el género
   */
  getGeneroTexto(genero: string | null): string {
    switch (genero) {
      case 'M':
        return 'Masculino';
      case 'F':
        return 'Femenino';
      case 'O':
        return 'Otro';
      default:
        return 'No especificado';
    }
  }

  /**
   * Obtiene el color CSS para el estado del cliente
   */
  getEstadoClienteColor(estado: string): string {
    switch (estado) {
      case 'activo':
        return 'text-green-600';
      case 'inactivo':
        return 'text-yellow-600';
      case 'bloqueado':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  }
}
