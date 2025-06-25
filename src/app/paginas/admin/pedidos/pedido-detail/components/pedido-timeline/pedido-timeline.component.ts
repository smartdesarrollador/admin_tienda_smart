import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Pedido } from '../../../../../../core/models/pedido.interface';

/**
 * Interfaz para eventos del timeline
 */
interface TimelineEvent {
  id: string;
  tipo: 'estado' | 'pago' | 'sistema' | 'usuario';
  titulo: string;
  descripcion: string;
  fecha: string;
  usuario?: string;
  icono: string;
  color: string;
  detalles?: Record<string, any>;
}

/**
 * Componente para mostrar el timeline/historial del pedido
 * Muestra todos los eventos y cambios de estado del pedido
 */
@Component({
  selector: 'app-pedido-timeline',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pedido-timeline.component.html',
  styleUrls: ['./pedido-timeline.component.css'],
})
export class PedidoTimelineComponent {
  @Input({ required: true }) pedido!: Pedido;

  // Computed signal para generar eventos del timeline
  timelineEvents = computed(() => {
    const pedido = this.pedido;
    if (!pedido) return [];

    const eventos: TimelineEvent[] = [];

    // Evento inicial de creación del pedido
    eventos.push({
      id: 'created',
      tipo: 'sistema',
      titulo: 'Pedido Creado',
      descripcion: `Pedido #${pedido.id} creado por ${
        pedido.usuario?.nombre || 'Cliente'
      }`,
      fecha: pedido.created_at,
      usuario: pedido.usuario?.nombre,
      icono: 'M12 6v6m0 0v6m0-6h6m-6 0H6',
      color: 'bg-blue-500',
      detalles: {
        canal: pedido.canal_venta,
        tipo_pago: pedido.tipo_pago,
        total: pedido.total,
      },
    });

    // Eventos de cambios de estado (simulados basados en el estado actual)
    this.generateEstadoEvents(pedido, eventos);

    // Eventos de pagos
    if (pedido.pagos && pedido.pagos.length > 0) {
      pedido.pagos.forEach((pago, index) => {
        eventos.push({
          id: `pago-${pago.id}`,
          tipo: 'pago',
          titulo: 'Pago Registrado',
          descripcion: `Pago de ${this.formatCurrency(pago.monto)} vía ${
            pago.metodo
          }`,
          fecha: pago.fecha_pago || pedido.created_at,
          icono:
            'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
          color: 'bg-green-500',
          detalles: {
            metodo: pago.metodo,
            referencia: pago.referencia,
            estado: pago.estado,
          },
        });
      });
    }

    // Evento de última actualización
    if (pedido.updated_at !== pedido.created_at) {
      eventos.push({
        id: 'updated',
        tipo: 'sistema',
        titulo: 'Pedido Actualizado',
        descripcion: 'Información del pedido modificada',
        fecha: pedido.updated_at,
        icono:
          'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
        color: 'bg-gray-500',
      });
    }

    // Ordenar eventos por fecha (más reciente primero)
    return eventos.sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );
  });

  /**
   * Genera eventos de estado basados en el estado actual
   */
  private generateEstadoEvents(pedido: Pedido, eventos: TimelineEvent[]): void {
    const estadosProgresion = [
      'pendiente',
      'aprobado',
      'en_proceso',
      'enviado',
      'entregado',
    ];
    const estadoActual = pedido.estado;
    const indexActual = estadosProgresion.indexOf(estadoActual);

    // Simular eventos de estado hasta el estado actual
    for (let i = 0; i <= indexActual; i++) {
      const estado = estadosProgresion[i];
      if (estado === 'pendiente') continue; // Ya se agregó en la creación

      const fechaEvento = this.calculateEstadoDate(pedido.created_at, i);

      eventos.push({
        id: `estado-${estado}`,
        tipo: 'estado',
        titulo: this.getEstadoTitle(estado),
        descripcion: this.getEstadoDescription(estado),
        fecha: fechaEvento,
        icono: this.getEstadoIcon(estado),
        color: this.getEstadoColor(estado),
        detalles: {
          estado_anterior: i > 0 ? estadosProgresion[i - 1] : 'pendiente',
          estado_nuevo: estado,
        },
      });
    }

    // Eventos especiales para estados finales
    if (['cancelado', 'devuelto', 'rechazado'].includes(estadoActual)) {
      eventos.push({
        id: `estado-${estadoActual}`,
        tipo: 'estado',
        titulo: this.getEstadoTitle(estadoActual),
        descripcion: this.getEstadoDescription(estadoActual),
        fecha: pedido.updated_at,
        icono: this.getEstadoIcon(estadoActual),
        color: this.getEstadoColor(estadoActual),
      });
    }
  }

  /**
   * Calcula fecha estimada para eventos de estado
   */
  private calculateEstadoDate(
    fechaCreacion: string,
    diasOffset: number
  ): string {
    const fecha = new Date(fechaCreacion);
    fecha.setDate(fecha.getDate() + diasOffset);
    return fecha.toISOString();
  }

  /**
   * Obtiene el título para un estado
   */
  private getEstadoTitle(estado: string): string {
    const titulos: Record<string, string> = {
      aprobado: 'Pedido Aprobado',
      rechazado: 'Pedido Rechazado',
      en_proceso: 'En Proceso',
      enviado: 'Pedido Enviado',
      entregado: 'Pedido Entregado',
      cancelado: 'Pedido Cancelado',
      devuelto: 'Pedido Devuelto',
    };
    return titulos[estado] || `Estado: ${estado}`;
  }

  /**
   * Obtiene la descripción para un estado
   */
  private getEstadoDescription(estado: string): string {
    const descripciones: Record<string, string> = {
      aprobado: 'El pedido ha sido aprobado y está listo para procesar',
      rechazado: 'El pedido ha sido rechazado',
      en_proceso: 'El pedido está siendo preparado',
      enviado: 'El pedido ha sido enviado al cliente',
      entregado: 'El pedido ha sido entregado exitosamente',
      cancelado: 'El pedido ha sido cancelado',
      devuelto: 'El pedido ha sido devuelto',
    };
    return descripciones[estado] || `El pedido cambió a estado: ${estado}`;
  }

  /**
   * Obtiene el icono para un estado
   */
  private getEstadoIcon(estado: string): string {
    const iconos: Record<string, string> = {
      aprobado: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      rechazado: 'M6 18L18 6M6 6l12 12',
      en_proceso:
        'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
      enviado:
        'M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4',
      entregado: 'M5 13l4 4L19 7',
      cancelado: 'M6 18L18 6M6 6l12 12',
      devuelto: 'M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6',
    };
    return (
      iconos[estado] ||
      'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    );
  }

  /**
   * Obtiene el color para un estado
   */
  private getEstadoColor(estado: string): string {
    const colores: Record<string, string> = {
      aprobado: 'bg-green-500',
      rechazado: 'bg-red-500',
      en_proceso: 'bg-blue-500',
      enviado: 'bg-purple-500',
      entregado: 'bg-green-600',
      cancelado: 'bg-red-500',
      devuelto: 'bg-gray-500',
    };
    return colores[estado] || 'bg-gray-500';
  }

  /**
   * Obtiene la clase CSS para el badge del tipo de evento
   */
  getEventTypeBadgeClass(tipo: string): string {
    const clases: Record<string, string> = {
      estado: 'event-type-estado',
      pago: 'event-type-pago',
      sistema: 'event-type-sistema',
      usuario: 'event-type-usuario',
    };
    return clases[tipo] || 'event-type-sistema';
  }

  /**
   * Obtiene la etiqueta para el tipo de evento
   */
  getEventTypeLabel(tipo: string): string {
    const etiquetas: Record<string, string> = {
      estado: 'Estado',
      pago: 'Pago',
      sistema: 'Sistema',
      usuario: 'Usuario',
    };
    return etiquetas[tipo] || 'Sistema';
  }

  /**
   * Verifica si un evento tiene detalles para mostrar
   */
  hasEventDetails(detalles: Record<string, any>): boolean {
    return Object.keys(detalles).length > 0;
  }

  /**
   * Convierte los detalles del evento en un array para mostrar
   */
  getEventDetailsArray(
    detalles: Record<string, any>
  ): Array<{ key: string; label: string; value: string }> {
    return Object.entries(detalles).map(([key, value]) => ({
      key,
      label: this.formatDetailLabel(key),
      value: this.formatDetailValue(key, value),
    }));
  }

  /**
   * Formatea la etiqueta de un detalle
   */
  private formatDetailLabel(key: string): string {
    const etiquetas: Record<string, string> = {
      canal: 'Canal',
      tipo_pago: 'Tipo de Pago',
      total: 'Total',
      metodo: 'Método',
      referencia: 'Referencia',
      estado: 'Estado',
      estado_anterior: 'Estado Anterior',
      estado_nuevo: 'Estado Nuevo',
    };
    return etiquetas[key] || key.replace('_', ' ');
  }

  /**
   * Formatea el valor de un detalle
   */
  private formatDetailValue(key: string, value: any): string {
    if (key === 'total' && typeof value === 'number') {
      return this.formatCurrency(value);
    }
    if (typeof value === 'string') {
      return value.replace('_', ' ');
    }
    return String(value);
  }

  /**
   * Formatea una fecha para mostrar
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
   * Formatea fecha relativa (hace X tiempo)
   */
  formatRelativeDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays === 0) {
      if (diffInHours === 0) {
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        return `Hace ${diffInMinutes} minutos`;
      }
      return `Hace ${diffInHours} horas`;
    } else if (diffInDays === 1) {
      return 'Ayer';
    } else if (diffInDays < 7) {
      return `Hace ${diffInDays} días`;
    } else {
      return this.formatDate(dateString);
    }
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
   * Track by function para eventos
   */
  trackByEventId(index: number, event: TimelineEvent): string {
    return event.id;
  }
}
