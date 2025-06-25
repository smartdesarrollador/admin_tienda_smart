import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';

import { VariacionProductoService } from '../../../../core/services/variacion-producto.service';
import { ProductoService } from '../../../../core/services/producto.service';
import {
  VariacionProductoInterface,
  VariacionProductoFilters,
  EstadoStock,
  SortField,
  SortOrder,
  OperacionStock,
} from '../../../../core/models';

@Component({
  selector: 'app-variacion-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './variacion-list.component.html',
  styleUrls: ['./variacion-list.component.css'],
})
export class VariacionListComponent implements OnInit {
  private readonly variacionService = inject(VariacionProductoService);
  private readonly productoService = inject(ProductoService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  // URL base para imágenes
  readonly urlDominioApi = environment.urlDominioApi;

  // Signals del servicio
  readonly variaciones = this.variacionService.variaciones;
  readonly loading = this.variacionService.loading;
  readonly error = this.variacionService.error;
  readonly pagination = this.variacionService.pagination;

  // Computed signals del servicio
  readonly hasVariaciones = this.variacionService.hasVariaciones;
  readonly currentPage = this.variacionService.currentPage;
  readonly lastPage = this.variacionService.lastPage;
  readonly hasNextPage = this.variacionService.hasNextPage;
  readonly hasPrevPage = this.variacionService.hasPrevPage;
  readonly totalVariaciones = this.variacionService.totalVariaciones;
  readonly variacionesActivas = this.variacionService.variacionesActivas;
  readonly variacionesConStock = this.variacionService.variacionesConStock;
  readonly variacionesSinStock = this.variacionService.variacionesSinStock;
  readonly stockTotal = this.variacionService.stockTotal;

  // Signals locales
  readonly showFilters = signal(false);
  readonly selectedVariaciones = signal<number[]>([]);
  readonly viewMode = signal<'grid' | 'table'>('table');
  readonly showStatistics = signal(false);
  readonly showStockModal = signal(false);
  readonly currentStockVariacion = signal<VariacionProductoInterface | null>(
    null
  );

  // Formulario de filtros
  filterForm: FormGroup;

  // Formulario de stock
  stockForm: FormGroup;

  // Productos para filtro
  readonly productos = this.productoService.productos;

  // Opciones para filtros
  readonly sortFieldOptions = [
    { value: SortField.ID, label: 'ID' },
    { value: SortField.SKU, label: 'SKU' },
    { value: SortField.PRECIO, label: 'Precio' },
    { value: SortField.PRECIO_OFERTA, label: 'Precio Oferta' },
    { value: SortField.STOCK, label: 'Stock' },
    { value: SortField.ACTIVO, label: 'Estado' },
    { value: SortField.CREATED_AT, label: 'Fecha de creación' },
  ];

  readonly sortOrderOptions = [
    { value: SortOrder.ASC, label: 'Ascendente' },
    { value: SortOrder.DESC, label: 'Descendente' },
  ];

  readonly perPageOptions = [10, 15, 25, 50, 100];

  readonly estadoStockOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 'true', label: 'Con stock' },
    { value: 'false', label: 'Sin stock' },
  ];

  readonly activoOptions = [
    { value: '', label: 'Todos' },
    { value: 'true', label: 'Activos' },
    { value: 'false', label: 'Inactivos' },
  ];

  // Enums para template
  readonly EstadoStock = EstadoStock;
  readonly OperacionStock = OperacionStock;

  // Computed para estadísticas locales
  readonly variacionesConDescuento = computed(
    () =>
      this.variaciones().filter(
        (v) => v.precio_oferta && v.precio_oferta < v.precio
      ).length
  );

  readonly precioPromedio = computed(() => {
    const variaciones = this.variaciones();
    if (variaciones.length === 0) return 0;
    return (
      variaciones.reduce((sum, v) => sum + v.precio, 0) / variaciones.length
    );
  });

  readonly valorTotalInventario = computed(() =>
    this.variaciones().reduce((total, v) => total + v.precio * v.stock, 0)
  );

  constructor() {
    // Inicializar formulario de filtros
    this.filterForm = this.fb.group({
      producto_id: [''],
      search: [''],
      precio_min: [''],
      precio_max: [''],
      con_stock: [''],
      activo: [''],
      sort_by: [SortField.CREATED_AT],
      sort_order: [SortOrder.DESC],
      per_page: [15],
    });

    // Inicializar formulario de stock
    this.stockForm = this.fb.group({
      stock: [0],
      operacion: [OperacionStock.SET],
    });

    // Configurar búsqueda con debounce
    this.setupSearchDebounce();

    // Effect para reaccionar a errores
    effect(() => {
      const error = this.error();
      if (error) {
        console.error('Error en variaciones:', error);
        // Aquí podrías mostrar una notificación
      }
    });
  }

  ngOnInit(): void {
    this.loadProductos();
    this.loadVariaciones();
  }

  private setupSearchDebounce(): void {
    // Configurar debounce para búsqueda
    this.filterForm
      .get('search')
      ?.valueChanges.pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.applyFilters();
      });

    // Configurar debounce para filtros de precio
    ['precio_min', 'precio_max'].forEach((field) => {
      this.filterForm
        .get(field)
        ?.valueChanges.pipe(debounceTime(500), distinctUntilChanged())
        .subscribe(() => {
          this.applyFilters();
        });
    });

    // Aplicar filtros inmediatamente para otros campos
    const immediateFields = [
      'producto_id',
      'con_stock',
      'activo',
      'sort_by',
      'sort_order',
    ];

    immediateFields.forEach((field) => {
      this.filterForm.get(field)?.valueChanges.subscribe(() => {
        this.applyFilters();
      });
    });
  }

  loadProductos(): void {
    this.productoService.loadProductos({ per_page: 100 });
  }

  loadVariaciones(): void {
    const filters = this.buildFilters();
    this.variacionService.loadVariaciones(filters);
  }

  private buildFilters(): VariacionProductoFilters {
    const formValue = this.filterForm.value;
    const filters: VariacionProductoFilters = {};

    // Solo agregar filtros que tengan valor
    Object.keys(formValue).forEach((key) => {
      const value = formValue[key];
      if (value !== null && value !== undefined && value !== '') {
        if (key === 'precio_min' || key === 'precio_max') {
          const numValue = parseFloat(value);
          if (!isNaN(numValue)) {
            (filters as any)[key] = numValue;
          }
        } else if (key === 'producto_id') {
          const numValue = parseInt(value);
          if (!isNaN(numValue)) {
            filters.producto_id = numValue;
          }
        } else if (key === 'con_stock' || key === 'activo') {
          if (value !== '') {
            (filters as any)[key] = value === 'true';
          }
        } else {
          (filters as any)[key] = value;
        }
      }
    });

    return filters;
  }

  applyFilters(): void {
    this.loadVariaciones();
  }

  clearFilters(): void {
    this.filterForm.reset({
      producto_id: '',
      search: '',
      precio_min: '',
      precio_max: '',
      con_stock: '',
      activo: '',
      sort_by: SortField.CREATED_AT,
      sort_order: SortOrder.DESC,
      per_page: 15,
    });
    this.loadVariaciones();
  }

  // Navegación de páginas
  goToPage(page: number): void {
    this.variacionService.goToPage(page);
  }

  nextPage(): void {
    this.variacionService.nextPage();
  }

  prevPage(): void {
    this.variacionService.prevPage();
  }

  changePageSize(): void {
    const perPage = this.filterForm.get('per_page')?.value;
    if (perPage) {
      this.variacionService.changePageSize(perPage);
    }
  }

  // Operaciones CRUD
  toggleActivo(variacion: VariacionProductoInterface): void {
    this.variacionService.toggleActivo(variacion.id).subscribe({
      next: () => {
        console.log(
          `Variación ${variacion.activo ? 'desactivada' : 'activada'}`
        );
      },
      error: (error) => {
        console.error('Error al cambiar estado:', error);
      },
    });
  }

  deleteVariacion(variacion: VariacionProductoInterface): void {
    if (confirm(`¿Estás seguro de eliminar la variación ${variacion.sku}?`)) {
      this.variacionService.deleteVariacion(variacion.id).subscribe({
        next: () => {
          console.log('Variación eliminada exitosamente');
        },
        error: (error) => {
          console.error('Error al eliminar variación:', error);
        },
      });
    }
  }

  // Gestión de stock
  openStockModal(variacion: VariacionProductoInterface): void {
    this.currentStockVariacion.set(variacion);
    this.stockForm.patchValue({
      stock: variacion.stock,
      operacion: OperacionStock.SET,
    });
    this.showStockModal.set(true);
  }

  closeStockModal(): void {
    this.showStockModal.set(false);
    this.currentStockVariacion.set(null);
    this.stockForm.reset();
  }

  updateStock(): void {
    const variacion = this.currentStockVariacion();
    if (!variacion) return;

    const stockData = this.stockForm.value;
    this.variacionService.updateStock(variacion.id, stockData).subscribe({
      next: (response) => {
        console.log(
          `Stock actualizado de ${response.stock_anterior} a ${response.stock_nuevo}`
        );
        this.closeStockModal();
      },
      error: (error) => {
        console.error('Error al actualizar stock:', error);
      },
    });
  }

  // Navegación
  createVariacion(): void {
    this.router.navigate(['/admin/variaciones-producto/create']);
  }

  editVariacion(id: number): void {
    this.router.navigate(['/admin/variaciones-producto/edit', id]);
  }

  viewVariacion(id: number): void {
    this.router.navigate(['/admin/variaciones-producto/view', id]);
  }

  viewProducto(productoId: number): void {
    this.router.navigate(['/admin/productos/view', productoId]);
  }

  // Selección múltiple
  toggleVariacionSelection(variacionId: number): void {
    const selected = this.selectedVariaciones();
    const index = selected.indexOf(variacionId);

    if (index > -1) {
      this.selectedVariaciones.set(selected.filter((id) => id !== variacionId));
    } else {
      this.selectedVariaciones.set([...selected, variacionId]);
    }
  }

  selectAllVariaciones(): void {
    const allIds = this.variaciones().map((v) => v.id);
    this.selectedVariaciones.set(allIds);
  }

  clearSelection(): void {
    this.selectedVariaciones.set([]);
  }

  isSelected(variacionId: number): boolean {
    return this.selectedVariaciones().includes(variacionId);
  }

  get hasSelection(): boolean {
    return this.selectedVariaciones().length > 0;
  }

  get isAllSelected(): boolean {
    const selected = this.selectedVariaciones();
    const variaciones = this.variaciones();
    return variaciones.length > 0 && selected.length === variaciones.length;
  }

  // Operaciones en lote
  bulkToggleActivo(): void {
    const selected = this.selectedVariaciones();
    if (selected.length === 0) return;

    if (confirm(`¿Cambiar estado de ${selected.length} variaciones?`)) {
      selected.forEach((id) => {
        this.variacionService.toggleActivo(id).subscribe();
      });
      this.clearSelection();
    }
  }

  bulkDelete(): void {
    const selected = this.selectedVariaciones();
    if (selected.length === 0) return;

    if (confirm(`¿Estás seguro de eliminar ${selected.length} variaciones?`)) {
      selected.forEach((id) => {
        this.variacionService.deleteVariacion(id).subscribe();
      });
      this.clearSelection();
    }
  }

  // Utilidades
  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(price);
  }

  getStockStatusClass(variacion: VariacionProductoInterface): string {
    switch (variacion.estado_stock) {
      case EstadoStock.SIN_STOCK:
        return 'bg-red-100 text-red-800';
      case EstadoStock.STOCK_LIMITADO:
        return 'bg-yellow-100 text-yellow-800';
      case EstadoStock.DISPONIBLE:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStockStatusText(variacion: VariacionProductoInterface): string {
    switch (variacion.estado_stock) {
      case EstadoStock.SIN_STOCK:
        return 'Sin stock';
      case EstadoStock.STOCK_LIMITADO:
        return 'Stock limitado';
      case EstadoStock.DISPONIBLE:
        return 'Disponible';
      default:
        return 'Desconocido';
    }
  }

  getActivoStatusClass(activo: boolean): string {
    return activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  }

  getActivoStatusText(activo: boolean): string {
    return activo ? 'Activo' : 'Inactivo';
  }

  refresh(): void {
    this.variacionService.refresh();
  }

  trackByVariacionId(
    index: number,
    variacion: VariacionProductoInterface
  ): number {
    return variacion.id;
  }

  // Filtros rápidos
  filterByProducto(productoId: number): void {
    this.filterForm.patchValue({ producto_id: productoId });
    this.applyFilters();
  }

  filterByEstadoStock(conStock: boolean | null): void {
    this.filterForm.patchValue({
      con_stock: conStock === null ? '' : conStock.toString(),
    });
    this.applyFilters();
  }

  filterByActivo(activo: boolean | null): void {
    this.filterForm.patchValue({
      activo: activo === null ? '' : activo.toString(),
    });
    this.applyFilters();
  }
}
