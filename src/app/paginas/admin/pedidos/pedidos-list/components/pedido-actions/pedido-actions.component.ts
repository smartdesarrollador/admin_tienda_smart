import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  Pedido,
  EstadoPedido,
} from '../../../../../../core/models/pedido.interface';

/**
 * Componente para mostrar las acciones disponibles para un pedido
 * Incluye botones para ver, editar, eliminar y cambiar estado
 */
@Component({
  selector: 'app-pedido-actions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center space-x-1" [class]="containerClasses()">
      <!-- Botón Ver -->
      <button
        type="button"
        (click)="onView()"
        class="action-btn view-btn"
        [class]="buttonClasses()"
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
        @if (!compact) {
        <span class="ml-1">Ver</span>
        }
      </button>

      <!-- Botón Editar -->
      <button
        type="button"
        (click)="onEdit()"
        class="action-btn edit-btn"
        [class]="buttonClasses()"
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
        @if (!compact) {
        <span class="ml-1">Editar</span>
        }
      </button>

      <!-- Dropdown de cambio de estado -->
      @if (showEstadoActions) {
      <div class="relative" [class.inline-block]="true">
        <button
          type="button"
          (click)="toggleEstadoDropdown()"
          class="action-btn estado-btn"
          [class]="buttonClasses()"
          title="Cambiar estado"
          [disabled]="!canChangeEstado()"
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
              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
            />
          </svg>
          @if (!compact) {
          <span class="ml-1">Estado</span>
          }
          <svg
            class="w-3 h-3 ml-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        <!-- Dropdown menu -->
        @if (showEstadoDropdown()) {
        <div
          class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50"
        >
          <div class="py-1" role="menu">
            @for (estado of availableEstados(); track estado.value) {
            <button
              type="button"
              (click)="onChangeEstado(estado.value)"
              class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              [class.bg-gray-100]="estado.value === pedido.estado"
              role="menuitem"
            >
              <div class="flex items-center">
                <span
                  class="w-2 h-2 rounded-full mr-2"
                  [class]="getEstadoColor(estado.value)"
                ></span>
                {{ estado.label }}
              </div>
            </button>
            }
          </div>
        </div>
        }
      </div>
      }

      <!-- Botón Eliminar -->
      @if (showDeleteAction) {
      <button
        type="button"
        (click)="onDelete()"
        class="action-btn delete-btn"
        [class]="buttonClasses()"
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
        @if (!compact) {
        <span class="ml-1">Eliminar</span>
        }
      </button>
      }

      <!-- Botón de más acciones -->
      @if (showMoreActions) {
      <div class="relative">
        <button
          type="button"
          (click)="toggleMoreDropdown()"
          class="action-btn more-btn"
          [class]="buttonClasses()"
          title="Más acciones"
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
              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
            />
          </svg>
        </button>

        <!-- Dropdown de más acciones -->
        @if (showMoreDropdown()) {
        <div
          class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50"
        >
          <div class="py-1" role="menu">
            <button
              type="button"
              (click)="onDuplicate()"
              class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
            >
              <div class="flex items-center">
                <svg
                  class="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                Duplicar
              </div>
            </button>
            <button
              type="button"
              (click)="onPrint()"
              class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
            >
              <div class="flex items-center">
                <svg
                  class="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  />
                </svg>
                Imprimir
              </div>
            </button>
            <button
              type="button"
              (click)="onExport()"
              class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
            >
              <div class="flex items-center">
                <svg
                  class="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Exportar
              </div>
            </button>
          </div>
        </div>
        }
      </div>
      }
    </div>
  `,
  styles: [
    `
      .action-btn {
        @apply inline-flex items-center justify-center rounded-md border border-transparent font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2;
      }

      .action-btn:disabled {
        @apply opacity-50 cursor-not-allowed;
      }

      .view-btn {
        @apply text-blue-600 hover:text-blue-700 hover:bg-blue-50 focus:ring-blue-500;
      }

      .edit-btn {
        @apply text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 focus:ring-indigo-500;
      }

      .estado-btn {
        @apply text-purple-600 hover:text-purple-700 hover:bg-purple-50 focus:ring-purple-500;
      }

      .delete-btn {
        @apply text-red-600 hover:text-red-700 hover:bg-red-50 focus:ring-red-500;
      }

      .more-btn {
        @apply text-gray-600 hover:text-gray-700 hover:bg-gray-50 focus:ring-gray-500;
      }
    `,
  ],
})
export class PedidoActionsComponent {
  @Input({ required: true }) pedido!: Pedido;
  @Input() compact = false;
  @Input() showEstadoActions = true;
  @Input() showDeleteAction = true;
  @Input() showMoreActions = false;

  @Output() view = new EventEmitter<void>();
  @Output() edit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();
  @Output() changeEstado = new EventEmitter<EstadoPedido>();
  @Output() duplicate = new EventEmitter<void>();
  @Output() print = new EventEmitter<void>();
  @Output() export = new EventEmitter<void>();

  // Signals para dropdowns
  showEstadoDropdown = signal(false);
  showMoreDropdown = signal(false);

  // Estados disponibles
  readonly estadosOptions = [
    { value: 'pendiente' as EstadoPedido, label: 'Pendiente' },
    { value: 'aprobado' as EstadoPedido, label: 'Aprobado' },
    { value: 'rechazado' as EstadoPedido, label: 'Rechazado' },
    { value: 'en_proceso' as EstadoPedido, label: 'En Proceso' },
    { value: 'enviado' as EstadoPedido, label: 'Enviado' },
    { value: 'entregado' as EstadoPedido, label: 'Entregado' },
    { value: 'cancelado' as EstadoPedido, label: 'Cancelado' },
    { value: 'devuelto' as EstadoPedido, label: 'Devuelto' },
  ];

  // Computed para estados disponibles (excluye el estado actual)
  availableEstados = computed(() => {
    return this.estadosOptions.filter(
      (estado) => estado.value !== this.pedido.estado
    );
  });

  // Computed para clases del contenedor
  containerClasses = computed(() => {
    return this.compact ? 'space-x-0.5' : 'space-x-1';
  });

  // Computed para clases de botones
  buttonClasses = computed(() => {
    const baseClasses = 'action-btn';
    const sizeClasses = this.compact ? 'p-1.5 text-xs' : 'px-3 py-2 text-sm';
    return `${baseClasses} ${sizeClasses}`;
  });

  /**
   * Maneja el evento de ver
   */
  onView(): void {
    this.view.emit();
  }

  /**
   * Maneja el evento de editar
   */
  onEdit(): void {
    this.edit.emit();
  }

  /**
   * Maneja el evento de eliminar
   */
  onDelete(): void {
    this.delete.emit();
  }

  /**
   * Maneja el cambio de estado
   */
  onChangeEstado(estado: EstadoPedido): void {
    this.changeEstado.emit(estado);
    this.showEstadoDropdown.set(false);
  }

  /**
   * Maneja el evento de duplicar
   */
  onDuplicate(): void {
    this.duplicate.emit();
    this.showMoreDropdown.set(false);
  }

  /**
   * Maneja el evento de imprimir
   */
  onPrint(): void {
    this.print.emit();
    this.showMoreDropdown.set(false);
  }

  /**
   * Maneja el evento de exportar
   */
  onExport(): void {
    this.export.emit();
    this.showMoreDropdown.set(false);
  }

  /**
   * Alterna el dropdown de estados
   */
  toggleEstadoDropdown(): void {
    this.showEstadoDropdown.set(!this.showEstadoDropdown());
    this.showMoreDropdown.set(false);
  }

  /**
   * Alterna el dropdown de más acciones
   */
  toggleMoreDropdown(): void {
    this.showMoreDropdown.set(!this.showMoreDropdown());
    this.showEstadoDropdown.set(false);
  }

  /**
   * Verifica si se puede editar el pedido
   */
  canEdit(): boolean {
    const estadosEditables: EstadoPedido[] = ['pendiente', 'aprobado'];
    return estadosEditables.includes(this.pedido.estado);
  }

  /**
   * Verifica si se puede cambiar el estado
   */
  canChangeEstado(): boolean {
    const estadosNoModificables: EstadoPedido[] = ['cancelado', 'devuelto'];
    return !estadosNoModificables.includes(this.pedido.estado);
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
   * Obtiene el color del estado
   */
  getEstadoColor(estado: EstadoPedido): string {
    const colores = {
      pendiente: 'bg-yellow-400',
      aprobado: 'bg-blue-400',
      rechazado: 'bg-red-400',
      en_proceso: 'bg-indigo-400',
      enviado: 'bg-purple-400',
      entregado: 'bg-green-400',
      cancelado: 'bg-red-400',
      devuelto: 'bg-gray-400',
    };

    return colores[estado] || colores.pendiente;
  }
}
