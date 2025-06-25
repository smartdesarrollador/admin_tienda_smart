import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import {
  PedidoFilters,
  EstadoPedido,
  TipoPago,
  CanalVenta,
} from '../../../../../../core/models/pedido.interface';

/**
 * Componente para filtros avanzados de pedidos
 * Incluye filtros por estado, fechas, montos, cliente, etc.
 */
@Component({
  selector: 'app-pedido-filters',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="bg-white border border-gray-200 rounded-lg shadow-sm">
      <!-- Header del panel de filtros -->
      <div class="px-4 py-3 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-medium text-gray-900 flex items-center">
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
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            Filtros Avanzados
          </h3>

          <div class="flex items-center space-x-2">
            <!-- Contador de filtros activos -->
            @if (activeFiltersCount() > 0) {
            <span
              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {{ activeFiltersCount() }} filtro{{
                activeFiltersCount() > 1 ? 's' : ''
              }}
            </span>
            }

            <!-- Botón limpiar filtros -->
            <button
              type="button"
              (click)="clearAllFilters()"
              class="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
              [disabled]="activeFiltersCount() === 0"
            >
              Limpiar
            </button>

            <!-- Botón colapsar/expandir -->
            <button
              type="button"
              (click)="toggleCollapsed()"
              class="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <svg
                class="w-4 h-4 transition-transform duration-200"
                [class.rotate-180]="!isCollapsed()"
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
          </div>
        </div>
      </div>

      <!-- Contenido de filtros -->
      @if (!isCollapsed()) {
      <div class="p-4 space-y-4" [formGroup]="filterForm">
        <!-- Primera fila: Filtros principales -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- ID de Usuario -->
          <div>
            <label
              for="user_id"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              ID Cliente
            </label>
            <input
              type="number"
              id="user_id"
              formControlName="user_id"
              placeholder="Buscar por ID..."
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <!-- Estado -->
          <div>
            <label
              for="estado"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Estado
            </label>
            <select
              id="estado"
              formControlName="estado"
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Todos los estados</option>
              @for (estado of estadosOptions; track estado.value) {
              <option [value]="estado.value">{{ estado.label }}</option>
              }
            </select>
          </div>

          <!-- Tipo de Pago -->
          <div>
            <label
              for="tipo_pago"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Tipo de Pago
            </label>
            <select
              id="tipo_pago"
              formControlName="tipo_pago"
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Todos los tipos</option>
              @for (tipo of tiposPagoOptions; track tipo.value) {
              <option [value]="tipo.value">{{ tipo.label }}</option>
              }
            </select>
          </div>

          <!-- Canal de Venta -->
          <div>
            <label
              for="canal_venta"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Canal de Venta
            </label>
            <select
              id="canal_venta"
              formControlName="canal_venta"
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Todos los canales</option>
              @for (canal of canalesVentaOptions; track canal.value) {
              <option [value]="canal.value">{{ canal.label }}</option>
              }
            </select>
          </div>
        </div>

        <!-- Segunda fila: Filtros de fecha -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Fecha Desde -->
          <div>
            <label
              for="fecha_desde"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Fecha Desde
            </label>
            <input
              type="date"
              id="fecha_desde"
              formControlName="fecha_desde"
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <!-- Fecha Hasta -->
          <div>
            <label
              for="fecha_hasta"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Fecha Hasta
            </label>
            <input
              type="date"
              id="fecha_hasta"
              formControlName="fecha_hasta"
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>

        <!-- Tercera fila: Filtros de monto -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Total Mínimo -->
          <div>
            <label
              for="total_min"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Total Mínimo (S/)
            </label>
            <input
              type="number"
              id="total_min"
              formControlName="total_min"
              placeholder="0.00"
              step="0.01"
              min="0"
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <!-- Total Máximo -->
          <div>
            <label
              for="total_max"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Total Máximo (S/)
            </label>
            <input
              type="number"
              id="total_max"
              formControlName="total_max"
              placeholder="0.00"
              step="0.01"
              min="0"
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>

        <!-- Cuarta fila: Filtros adicionales -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Código de Rastreo -->
          <div>
            <label
              for="codigo_rastreo"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Código de Rastreo
            </label>
            <input
              type="text"
              id="codigo_rastreo"
              formControlName="codigo_rastreo"
              placeholder="Buscar por código..."
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <!-- Ordenamiento -->
          <div>
            <label
              for="sort_by"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Ordenar por
            </label>
            <select
              id="sort_by"
              formControlName="sort_by"
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              @for (sort of sortOptions; track sort.value) {
              <option [value]="sort.value">{{ sort.label }}</option>
              }
            </select>
          </div>
        </div>

        <!-- Quinta fila: Configuración de paginación -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Elementos por página -->
          <div>
            <label
              for="per_page"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Elementos por página
            </label>
            <select
              id="per_page"
              formControlName="per_page"
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              @for (option of perPageOptions; track option) {
              <option [value]="option">{{ option }}</option>
              }
            </select>
          </div>

          <!-- Filtros rápidos -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Filtros Rápidos
            </label>
            <div class="flex flex-wrap gap-2">
              <button
                type="button"
                (click)="applyQuickFilter('today')"
                class="quick-filter-btn"
                [class.active]="isQuickFilterActive('today')"
              >
                Hoy
              </button>
              <button
                type="button"
                (click)="applyQuickFilter('week')"
                class="quick-filter-btn"
                [class.active]="isQuickFilterActive('week')"
              >
                Esta semana
              </button>
              <button
                type="button"
                (click)="applyQuickFilter('month')"
                class="quick-filter-btn"
                [class.active]="isQuickFilterActive('month')"
              >
                Este mes
              </button>
              <button
                type="button"
                (click)="applyQuickFilter('pending')"
                class="quick-filter-btn"
                [class.active]="isQuickFilterActive('pending')"
              >
                Pendientes
              </button>
            </div>
          </div>
        </div>

        <!-- Botones de acción -->
        <div
          class="flex items-center justify-between pt-4 border-t border-gray-200"
        >
          <div class="text-sm text-gray-500">
            @if (activeFiltersCount() > 0) {
            {{ activeFiltersCount() }} filtro{{
              activeFiltersCount() > 1 ? 's' : ''
            }}
            aplicado{{ activeFiltersCount() > 1 ? 's' : '' }}
            } @else { Sin filtros aplicados }
          </div>

          <div class="flex items-center space-x-3">
            <button
              type="button"
              (click)="clearAllFilters()"
              class="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              [disabled]="activeFiltersCount() === 0"
            >
              Limpiar Filtros
            </button>

            <button
              type="button"
              (click)="applyFilters()"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      </div>
      }
    </div>
  `,
  styles: [
    `
      .quick-filter-btn {
        @apply px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-full hover:bg-gray-200 transition-colors duration-200;
      }

      .quick-filter-btn.active {
        @apply bg-blue-100 text-blue-700 border-blue-300;
      }

      .quick-filter-btn:hover {
        @apply bg-gray-200;
      }

      .quick-filter-btn.active:hover {
        @apply bg-blue-200;
      }
    `,
  ],
})
export class PedidoFiltersComponent implements OnInit {
  @Input() initialFilters: PedidoFilters = {};
  @Input() collapsed = false;

  @Output() filtersChange = new EventEmitter<PedidoFilters>();
  @Output() filtersApply = new EventEmitter<PedidoFilters>();
  @Output() filtersClear = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);

  // Signals
  isCollapsed = signal(false);
  activeQuickFilter = signal<string | null>(null);

  // Form
  filterForm: FormGroup;

  // Computed para contar filtros activos
  activeFiltersCount = computed(() => {
    const formValue = this.filterForm?.value || {};
    return Object.keys(formValue).filter((key) => {
      const value = formValue[key];
      return value !== null && value !== undefined && value !== '';
    }).length;
  });

  // Opciones para los selectores
  readonly estadosOptions = [
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'aprobado', label: 'Aprobado' },
    { value: 'rechazado', label: 'Rechazado' },
    { value: 'en_proceso', label: 'En Proceso' },
    { value: 'enviado', label: 'Enviado' },
    { value: 'entregado', label: 'Entregado' },
    { value: 'cancelado', label: 'Cancelado' },
    { value: 'devuelto', label: 'Devuelto' },
  ];

  readonly tiposPagoOptions = [
    { value: 'contado', label: 'Contado' },
    { value: 'credito', label: 'Crédito' },
    { value: 'transferencia', label: 'Transferencia' },
    { value: 'tarjeta', label: 'Tarjeta' },
    { value: 'yape', label: 'Yape' },
    { value: 'plin', label: 'Plin' },
    { value: 'paypal', label: 'PayPal' },
  ];

  readonly canalesVentaOptions = [
    { value: 'web', label: 'Web' },
    { value: 'app', label: 'App Móvil' },
    { value: 'tienda_fisica', label: 'Tienda Física' },
    { value: 'telefono', label: 'Teléfono' },
    { value: 'whatsapp', label: 'WhatsApp' },
  ];

  readonly sortOptions = [
    { value: 'created_at', label: 'Fecha de Creación' },
    { value: 'updated_at', label: 'Última Actualización' },
    { value: 'total', label: 'Total' },
    { value: 'estado', label: 'Estado' },
  ];

  readonly perPageOptions = [10, 15, 25, 50, 100];

  constructor() {
    // Inicializar formulario
    this.filterForm = this.fb.group({
      user_id: [''],
      estado: [''],
      tipo_pago: [''],
      canal_venta: [''],
      fecha_desde: [''],
      fecha_hasta: [''],
      total_min: [''],
      total_max: [''],
      codigo_rastreo: [''],
      sort_by: ['created_at'],
      per_page: [15],
    });

    this.isCollapsed.set(this.collapsed);
  }

  ngOnInit(): void {
    this.setupFormSubscriptions();
    this.loadInitialFilters();
  }

  /**
   * Configura las suscripciones del formulario
   */
  private setupFormSubscriptions(): void {
    // Campos con debounce
    const searchFields = ['user_id', 'codigo_rastreo'];

    searchFields.forEach((field) => {
      this.filterForm
        .get(field)
        ?.valueChanges.pipe(debounceTime(300), distinctUntilChanged())
        .subscribe(() => {
          this.emitFiltersChange();
        });
    });

    // Campos con aplicación inmediata
    const immediateFields = [
      'estado',
      'tipo_pago',
      'canal_venta',
      'sort_by',
      'per_page',
    ];

    immediateFields.forEach((field) => {
      this.filterForm.get(field)?.valueChanges.subscribe(() => {
        this.emitFiltersChange();
      });
    });

    // Campos de fecha y monto con debounce menor
    const dateFields = ['fecha_desde', 'fecha_hasta', 'total_min', 'total_max'];

    dateFields.forEach((field) => {
      this.filterForm
        .get(field)
        ?.valueChanges.pipe(debounceTime(500), distinctUntilChanged())
        .subscribe(() => {
          this.emitFiltersChange();
        });
    });
  }

  /**
   * Carga los filtros iniciales
   */
  private loadInitialFilters(): void {
    if (this.initialFilters && Object.keys(this.initialFilters).length > 0) {
      this.filterForm.patchValue(this.initialFilters);
    }
  }

  /**
   * Emite los cambios de filtros
   */
  private emitFiltersChange(): void {
    const filters = this.buildFilters();
    this.filtersChange.emit(filters);
  }

  /**
   * Construye el objeto de filtros desde el formulario
   */
  private buildFilters(): PedidoFilters {
    const formValue = this.filterForm.value;
    const filters: PedidoFilters = {};

    Object.keys(formValue).forEach((key) => {
      const value = formValue[key];
      if (value !== null && value !== undefined && value !== '') {
        if (key === 'total_min' || key === 'total_max') {
          const numValue = parseFloat(value);
          if (!isNaN(numValue)) {
            (filters as any)[key] = numValue;
          }
        } else if (key === 'user_id') {
          const numValue = parseInt(value);
          if (!isNaN(numValue)) {
            filters.user_id = numValue;
          }
        } else {
          (filters as any)[key] = value;
        }
      }
    });

    return filters;
  }

  /**
   * Aplica los filtros
   */
  applyFilters(): void {
    const filters = this.buildFilters();
    this.filtersApply.emit(filters);
  }

  /**
   * Limpia todos los filtros
   */
  clearAllFilters(): void {
    this.filterForm.reset({
      sort_by: 'created_at',
      per_page: 15,
    });
    this.activeQuickFilter.set(null);
    this.filtersClear.emit();
  }

  /**
   * Alterna el estado colapsado
   */
  toggleCollapsed(): void {
    this.isCollapsed.set(!this.isCollapsed());
  }

  /**
   * Aplica un filtro rápido
   */
  applyQuickFilter(type: string): void {
    const today = new Date();
    const currentFilter = this.activeQuickFilter();

    // Si el mismo filtro está activo, lo desactivamos
    if (currentFilter === type) {
      this.activeQuickFilter.set(null);
      this.clearDateFilters();
      return;
    }

    this.activeQuickFilter.set(type);

    switch (type) {
      case 'today':
        this.filterForm.patchValue({
          fecha_desde: this.formatDate(today),
          fecha_hasta: this.formatDate(today),
        });
        break;

      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        this.filterForm.patchValue({
          fecha_desde: this.formatDate(weekStart),
          fecha_hasta: this.formatDate(today),
        });
        break;

      case 'month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        this.filterForm.patchValue({
          fecha_desde: this.formatDate(monthStart),
          fecha_hasta: this.formatDate(today),
        });
        break;

      case 'pending':
        this.filterForm.patchValue({
          estado: 'pendiente',
        });
        break;
    }
  }

  /**
   * Verifica si un filtro rápido está activo
   */
  isQuickFilterActive(type: string): boolean {
    return this.activeQuickFilter() === type;
  }

  /**
   * Limpia los filtros de fecha
   */
  private clearDateFilters(): void {
    this.filterForm.patchValue({
      fecha_desde: '',
      fecha_hasta: '',
      estado: '',
    });
  }

  /**
   * Formatea una fecha para input type="date"
   */
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
