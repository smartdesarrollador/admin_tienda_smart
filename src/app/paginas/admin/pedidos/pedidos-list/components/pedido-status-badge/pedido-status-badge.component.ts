import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EstadoPedido } from '../../../../../../core/models/pedido.interface';

/**
 * Componente para mostrar el estado de un pedido con badge visual
 * Incluye colores específicos y iconos para cada estado
 */
@Component({
  selector: 'app-pedido-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-200"
      [class]="badgeClasses()"
    >
      <!-- Icono del estado -->
      <svg
        class="w-3 h-3 mr-1.5"
        [class]="iconClasses()"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path [attr.d]="getIconPath()" />
      </svg>

      <!-- Texto del estado -->
      {{ getEstadoText() }}
    </span>
  `,
  styles: [
    `
      :host {
        display: inline-block;
      }
    `,
  ],
})
export class PedidoStatusBadgeComponent {
  @Input({ required: true }) estado!: EstadoPedido;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() showIcon = true;

  // Signal para el estado
  estadoSignal = signal<EstadoPedido>('pendiente');

  // Computed para las clases del badge
  badgeClasses = computed(() => {
    const estado = this.estadoSignal();
    const baseClasses = this.getBaseClasses();
    const stateClasses = this.getStateClasses(estado);
    const sizeClasses = this.getSizeClasses();

    return `${baseClasses} ${stateClasses} ${sizeClasses}`;
  });

  // Computed para las clases del icono
  iconClasses = computed(() => {
    const estado = this.estadoSignal();
    return this.getIconClasses(estado);
  });

  ngOnInit(): void {
    this.estadoSignal.set(this.estado);
  }

  ngOnChanges(): void {
    if (this.estado) {
      this.estadoSignal.set(this.estado);
    }
  }

  /**
   * Obtiene las clases base del badge
   */
  private getBaseClasses(): string {
    return 'inline-flex items-center rounded-full font-medium transition-all duration-200';
  }

  /**
   * Obtiene las clases específicas del estado
   */
  private getStateClasses(estado: EstadoPedido): string {
    const stateClasses = {
      pendiente: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      aprobado: 'bg-blue-100 text-blue-800 border border-blue-200',
      rechazado: 'bg-red-100 text-red-800 border border-red-200',
      en_proceso: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
      enviado: 'bg-purple-100 text-purple-800 border border-purple-200',
      entregado: 'bg-green-100 text-green-800 border border-green-200',
      cancelado: 'bg-red-100 text-red-800 border border-red-200',
      devuelto: 'bg-gray-100 text-gray-800 border border-gray-200',
    };

    return stateClasses[estado] || stateClasses.pendiente;
  }

  /**
   * Obtiene las clases de tamaño
   */
  private getSizeClasses(): string {
    const sizeClasses = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-0.5 text-xs',
      lg: 'px-3 py-1 text-sm',
    };

    return sizeClasses[this.size];
  }

  /**
   * Obtiene las clases del icono según el estado
   */
  private getIconClasses(estado: EstadoPedido): string {
    const iconClasses = {
      pendiente: 'text-yellow-600',
      aprobado: 'text-blue-600',
      rechazado: 'text-red-600',
      en_proceso: 'text-indigo-600',
      enviado: 'text-purple-600',
      entregado: 'text-green-600',
      cancelado: 'text-red-600',
      devuelto: 'text-gray-600',
    };

    const sizeClass =
      this.size === 'sm'
        ? 'w-2.5 h-2.5'
        : this.size === 'lg'
        ? 'w-4 h-4'
        : 'w-3 h-3';
    const marginClass =
      this.size === 'sm' ? 'mr-1' : this.size === 'lg' ? 'mr-2' : 'mr-1.5';

    return `${sizeClass} ${marginClass} ${
      iconClasses[estado] || iconClasses.pendiente
    }`;
  }

  /**
   * Obtiene el path del icono SVG según el estado
   */
  getIconPath(): string {
    const estado = this.estadoSignal();

    const iconPaths = {
      pendiente:
        'M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z',
      aprobado: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      rechazado:
        'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
      en_proceso: 'M13 10V3L4 14h7v7l9-11h-7z',
      enviado: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8',
      entregado: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      cancelado:
        'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
      devuelto: 'M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6',
    };

    return iconPaths[estado] || iconPaths.pendiente;
  }

  /**
   * Obtiene el texto del estado
   */
  getEstadoText(): string {
    const estado = this.estadoSignal();

    const textos = {
      pendiente: 'Pendiente',
      aprobado: 'Aprobado',
      rechazado: 'Rechazado',
      en_proceso: 'En Proceso',
      enviado: 'Enviado',
      entregado: 'Entregado',
      cancelado: 'Cancelado',
      devuelto: 'Devuelto',
    };

    return textos[estado] || 'Desconocido';
  }

  /**
   * Obtiene el color de fondo del estado (para uso programático)
   */
  getBackgroundColor(): string {
    const estado = this.estadoSignal();

    const colors = {
      pendiente: '#fef3c7',
      aprobado: '#dbeafe',
      rechazado: '#fee2e2',
      en_proceso: '#e0e7ff',
      enviado: '#ede9fe',
      entregado: '#d1fae5',
      cancelado: '#fee2e2',
      devuelto: '#f3f4f6',
    };

    return colors[estado] || colors.pendiente;
  }

  /**
   * Obtiene el color del texto del estado (para uso programático)
   */
  getTextColor(): string {
    const estado = this.estadoSignal();

    const colors = {
      pendiente: '#92400e',
      aprobado: '#1e40af',
      rechazado: '#991b1b',
      en_proceso: '#3730a3',
      enviado: '#5b21b6',
      entregado: '#065f46',
      cancelado: '#991b1b',
      devuelto: '#374151',
    };

    return colors[estado] || colors.pendiente;
  }
}
