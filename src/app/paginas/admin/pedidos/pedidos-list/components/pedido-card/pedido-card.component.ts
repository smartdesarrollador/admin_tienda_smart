import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import {
  Pedido,
  EstadoPedido,
  TipoPago,
} from '../../../../../../core/models/pedido.interface';

/**
 * Componente para mostrar un pedido en formato de tarjeta
 * Diseñado para vista responsive y fácil lectura
 */
@Component({
  selector: 'app-pedido-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div
      class="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden"
      [class.ring-2]="isSelected()"
      [class.ring-blue-500]="isSelected()"
      [class.bg-blue-50]="isSelected()"
    >
      <!-- Header de la tarjeta -->
      <div class="p-4 border-b border-gray-100">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <!-- Checkbox de selección -->
            <input
              type="checkbox"
              [checked]="isSelected()"
              (change)="onSelectionChange()"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />

            <!-- ID del pedido -->
            <div class="flex flex-col">
              <span class="text-sm font-medium text-gray-900">
                Pedido #{{ pedido.id }}
              </span>
              <span class="text-xs text-gray-500">
                {{ formatDate(pedido.created_at) }}
              </span>
            </div>
          </div>

          <!-- Estado del pedido -->
          <span
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
            [class]="getEstadoBadgeClasses(pedido.estado)"
          >
            <span
              class="w-2 h-2 rounded-full mr-1.5"
              [class]="getEstadoDotClasses(pedido.estado)"
            ></span>
            {{ getEstadoText(pedido.estado) }}
          </span>
        </div>
      </div>

      <!-- Contenido principal -->
      <div class="p-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Información del cliente -->
          <div class="space-y-2">
            <h4 class="text-sm font-medium text-gray-900 flex items-center">
              <svg
                class="w-4 h-4 mr-2 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Cliente
            </h4>
            <p class="text-sm text-gray-600">
              {{ pedido.usuario?.nombre || 'Cliente no especificado' }}
            </p>
            @if (pedido.usuario?.email) {
            <p class="text-xs text-gray-500">{{ pedido.usuario?.email }}</p>
            }
          </div>

          <!-- Información del pedido -->
          <div class="space-y-2">
            <h4 class="text-sm font-medium text-gray-900 flex items-center">
              <svg
                class="w-4 h-4 mr-2 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              Detalles
            </h4>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Total:</span>
              <span class="text-sm font-semibold text-gray-900">
                {{ formatCurrency(pedido.total) }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Tipo de pago:</span>
              <div class="flex items-center">
                <svg
                  class="w-4 h-4 mr-1 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    [attr.d]="getTipoPagoIcon(pedido.tipo_pago)"
                  />
                </svg>
                <span class="text-sm text-gray-600 capitalize">
                  {{ getTipoPagoText(pedido.tipo_pago) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Información adicional -->
        @if (pedido.codigo_rastreo || pedido.canal_venta) {
        <div class="mt-4 pt-4 border-t border-gray-100">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            @if (pedido.codigo_rastreo) {
            <div class="flex items-center">
              <svg
                class="w-4 h-4 mr-2 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
              <span class="text-xs text-gray-500">
                Tracking: {{ pedido.codigo_rastreo }}
              </span>
            </div>
            } @if (pedido.canal_venta) {
            <div class="flex items-center">
              <svg
                class="w-4 h-4 mr-2 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"
                />
              </svg>
              <span class="text-xs text-gray-500 capitalize">
                Canal: {{ getCanalVentaText(pedido.canal_venta) }}
              </span>
            </div>
            }
          </div>
        </div>
        }
      </div>

      <!-- Footer con acciones -->
      <div class="px-4 py-3 bg-gray-50 border-t border-gray-100">
        <div class="flex items-center justify-between">
          <div class="text-xs text-gray-500">
            Actualizado: {{ formatDate(pedido.updated_at) }}
          </div>

          <!-- Botones de acción inline -->
          <div class="flex items-center space-x-1">
            <!-- Botón Ver -->
            <button
              type="button"
              (click)="onView()"
              class="inline-flex items-center p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors duration-200"
              title="Ver detalles del pedido"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </button>

            <!-- Botón Editar -->
            <button
              type="button"
              (click)="onEdit()"
              class="inline-flex items-center p-1.5 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-md transition-colors duration-200"
              title="Editar pedido"
              [disabled]="!canEdit()"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>

            <!-- Botón Eliminar -->
            <button
              type="button"
              (click)="onDelete()"
              class="inline-flex items-center p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors duration-200"
              title="Eliminar pedido"
              [disabled]="!canDelete()"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .card-hover {
        transition: all 0.2s ease-in-out;
      }

      .card-hover:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1),
          0 10px 10px -5px rgba(0, 0, 0, 0.04);
      }

      button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    `,
  ],
})
export class PedidoCardComponent implements OnChanges {
  @Input({ required: true }) pedido!: Pedido;
  @Input() selected = false;

  @Output() selectionChange = new EventEmitter<boolean>();
  @Output() view = new EventEmitter<void>();
  @Output() edit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();
  @Output() changeEstado = new EventEmitter<EstadoPedido>();

  // Signals
  isSelected = signal(false);

  ngOnChanges(): void {
    this.isSelected.set(this.selected);
  }

  /**
   * Maneja el cambio de selección
   */
  onSelectionChange(): void {
    const newValue = !this.isSelected();
    this.isSelected.set(newValue);
    this.selectionChange.emit(newValue);
  }

  /**
   * Emite evento de visualización
   */
  onView(): void {
    this.view.emit();
  }

  /**
   * Emite evento de edición
   */
  onEdit(): void {
    this.edit.emit();
  }

  /**
   * Emite evento de eliminación
   */
  onDelete(): void {
    this.delete.emit();
  }

  /**
   * Verifica si se puede editar el pedido
   */
  canEdit(): boolean {
    const estadosEditables: EstadoPedido[] = ['pendiente', 'aprobado'];
    return estadosEditables.includes(this.pedido.estado);
  }

  /**
   * Verifica si se puede eliminar el pedido
   */
  canDelete(): boolean {
    const estadosEliminables: EstadoPedido[] = [
      'pendiente',
      'rechazado',
      'cancelado',
    ];
    return estadosEliminables.includes(this.pedido.estado);
  }

  /**
   * Obtiene las clases del badge de estado
   */
  getEstadoBadgeClasses(estado: EstadoPedido): string {
    const baseClasses =
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border';

    const stateClasses = {
      pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      aprobado: 'bg-blue-100 text-blue-800 border-blue-200',
      rechazado: 'bg-red-100 text-red-800 border-red-200',
      en_proceso: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      enviado: 'bg-purple-100 text-purple-800 border-purple-200',
      entregado: 'bg-green-100 text-green-800 border-green-200',
      cancelado: 'bg-red-100 text-red-800 border-red-200',
      devuelto: 'bg-gray-100 text-gray-800 border-gray-200',
    };

    return `${baseClasses} ${stateClasses[estado] || stateClasses.pendiente}`;
  }

  /**
   * Obtiene las clases del punto de estado
   */
  getEstadoDotClasses(estado: EstadoPedido): string {
    const dotClasses = {
      pendiente: 'bg-yellow-400',
      aprobado: 'bg-blue-400',
      rechazado: 'bg-red-400',
      en_proceso: 'bg-indigo-400',
      enviado: 'bg-purple-400',
      entregado: 'bg-green-400',
      cancelado: 'bg-red-400',
      devuelto: 'bg-gray-400',
    };

    return dotClasses[estado] || dotClasses.pendiente;
  }

  /**
   * Obtiene el texto del estado
   */
  getEstadoText(estado: EstadoPedido): string {
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
   * Formatea un valor monetario
   */
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2,
    }).format(value);
  }

  /**
   * Formatea una fecha
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Obtiene el icono del tipo de pago
   */
  getTipoPagoIcon(tipoPago: TipoPago): string {
    const iconos = {
      contado:
        'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      credito:
        'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
      transferencia: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
      tarjeta:
        'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
      yape: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z',
      plin: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z',
      paypal:
        'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
    };

    return iconos[tipoPago] || iconos.contado;
  }

  /**
   * Obtiene el texto del tipo de pago
   */
  getTipoPagoText(tipoPago: TipoPago): string {
    const textos = {
      contado: 'Contado',
      credito: 'Crédito',
      transferencia: 'Transferencia',
      tarjeta: 'Tarjeta',
      yape: 'Yape',
      plin: 'Plin',
      paypal: 'PayPal',
    };

    return textos[tipoPago] || 'Contado';
  }

  /**
   * Obtiene el texto del canal de venta
   */
  getCanalVentaText(canal: string): string {
    const textos: Record<string, string> = {
      web: 'Web',
      app: 'App Móvil',
      tienda_fisica: 'Tienda Física',
      telefono: 'Teléfono',
      whatsapp: 'WhatsApp',
    };

    return textos[canal] || canal;
  }
}
