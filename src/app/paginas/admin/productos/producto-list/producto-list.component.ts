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

import { ProductoService } from '../../../../core/services/producto.service';
import {
  Producto,
  ProductoFilters,
  ProductoStatistics,
} from '../../../../core/models/producto.interface';

@Component({
  selector: 'app-producto-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './producto-list.component.html',
  styleUrls: ['./producto-list.component.css'],
})
export class ProductoListComponent implements OnInit {
  private readonly productoService = inject(ProductoService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  // URL base para imágenes
  readonly urlDominioApi = environment.urlDominioApi;

  // Signals del servicio
  productos = this.productoService.productos;
  loading = this.productoService.loading;
  error = this.productoService.error;
  pagination = this.productoService.pagination;
  statistics = this.productoService.statistics;

  // Computed signals
  hasProductos = this.productoService.hasProductos;
  currentPage = this.productoService.currentPage;
  lastPage = this.productoService.lastPage;
  hasNextPage = this.productoService.hasNextPage;
  hasPrevPage = this.productoService.hasPrevPage;
  totalProductos = this.productoService.totalProductos;

  // Signals locales
  showFilters = signal(false);
  selectedProducts = signal<number[]>([]);
  viewMode = signal<'grid' | 'table'>('table');
  showStatistics = signal(false);

  // Formulario de filtros
  filterForm: FormGroup;

  // Opciones para filtros
  readonly orderByOptions = [
    { value: 'nombre', label: 'Nombre' },
    { value: 'precio', label: 'Precio' },
    { value: 'stock', label: 'Stock' },
    { value: 'created_at', label: 'Fecha de creación' },
    { value: 'categoria_id', label: 'Categoría' },
  ];

  readonly orderDirectionOptions = [
    { value: 'asc', label: 'Ascendente' },
    { value: 'desc', label: 'Descendente' },
  ];

  readonly perPageOptions = [10, 15, 25, 50, 100];

  // Computed para estadísticas
  productosActivos = computed(
    () => this.productos().filter((p) => p.activo).length
  );

  productosDestacados = computed(
    () => this.productos().filter((p) => p.destacado).length
  );

  productosSinStock = computed(
    () => this.productos().filter((p) => p.stock === 0).length
  );

  valorTotalVisible = computed(() =>
    this.productos().reduce((total, p) => total + p.precio * p.stock, 0)
  );

  constructor() {
    // Inicializar formulario de filtros
    this.filterForm = this.fb.group({
      nombre: [''],
      sku: [''],
      marca: [''],
      modelo: [''],
      categoria_id: [''],
      precio_min: [''],
      precio_max: [''],
      con_stock: [''],
      destacado: [''],
      activo: [''],
      con_imagen: [''],
      order_by: ['nombre'],
      order_direction: ['asc'],
      per_page: [15],
    });

    // Configurar búsqueda con debounce
    this.setupSearchDebounce();

    // Effect para reaccionar a errores
    effect(() => {
      const error = this.error();
      if (error) {
        console.error('Error en productos:', error);
        // Aquí podrías mostrar una notificación
      }
    });
  }

  ngOnInit(): void {
    this.loadProductos();
    this.loadStatistics();
  }

  private setupSearchDebounce(): void {
    // Configurar debounce para campos de búsqueda
    const searchFields = ['nombre', 'sku', 'marca', 'modelo'];

    searchFields.forEach((field) => {
      this.filterForm
        .get(field)
        ?.valueChanges.pipe(debounceTime(300), distinctUntilChanged())
        .subscribe(() => {
          this.applyFilters();
        });
    });

    // Aplicar filtros inmediatamente para otros campos
    const immediateFields = [
      'categoria_id',
      'con_stock',
      'destacado',
      'activo',
      'con_imagen',
      'order_by',
      'order_direction',
    ];

    immediateFields.forEach((field) => {
      this.filterForm.get(field)?.valueChanges.subscribe(() => {
        this.applyFilters();
      });
    });
  }

  loadProductos(): void {
    const filters = this.buildFilters();
    this.productoService.loadProductos(filters);
  }

  loadStatistics(): void {
    this.productoService.getStatistics().subscribe();
  }

  private buildFilters(): ProductoFilters {
    const formValue = this.filterForm.value;
    const filters: ProductoFilters = {};

    // Solo agregar filtros que tengan valor
    Object.keys(formValue).forEach((key) => {
      const value = formValue[key];
      if (value !== null && value !== undefined && value !== '') {
        if (key === 'precio_min' || key === 'precio_max') {
          const numValue = parseFloat(value);
          if (!isNaN(numValue)) {
            (filters as any)[key] = numValue;
          }
        } else if (key === 'categoria_id') {
          const numValue = parseInt(value);
          if (!isNaN(numValue)) {
            filters.categoria_id = numValue;
          }
        } else if (
          key === 'con_stock' ||
          key === 'destacado' ||
          key === 'activo' ||
          key === 'con_imagen'
        ) {
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
    this.loadProductos();
  }

  clearFilters(): void {
    this.filterForm.reset({
      order_by: 'nombre',
      order_direction: 'asc',
      per_page: 15,
    });
    this.productoService.clearFilters();
    this.loadProductos();
  }

  // Paginación
  goToPage(page: number): void {
    this.productoService.goToPage(page);
  }

  nextPage(): void {
    this.productoService.nextPage();
  }

  prevPage(): void {
    this.productoService.prevPage();
  }

  changePageSize(): void {
    const perPage = this.filterForm.get('per_page')?.value;
    if (perPage) {
      this.productoService.changePageSize(parseInt(perPage));
    }
  }

  // Acciones de productos
  toggleDestacado(producto: Producto): void {
    this.productoService.toggleDestacado(producto.id).subscribe({
      next: () => {
        // Producto actualizado automáticamente por el servicio
      },
      error: (error) => {
        console.error('Error al cambiar estado destacado:', error);
      },
    });
  }

  toggleActivo(producto: Producto): void {
    this.productoService.toggleActivo(producto.id).subscribe({
      next: () => {
        // Producto actualizado automáticamente por el servicio
      },
      error: (error) => {
        console.error('Error al cambiar estado activo:', error);
      },
    });
  }

  deleteProducto(producto: Producto): void {
    if (
      confirm(`¿Estás seguro de eliminar el producto "${producto.nombre}"?`)
    ) {
      this.productoService.deleteProducto(producto.id).subscribe({
        next: () => {
          console.log('Producto eliminado exitosamente');
        },
        error: (error) => {
          console.error('Error al eliminar producto:', error);
        },
      });
    }
  }

  removeImagenPrincipal(producto: Producto): void {
    if (confirm('¿Estás seguro de eliminar la imagen principal?')) {
      this.productoService.removeImagenPrincipal(producto.id).subscribe({
        next: () => {
          console.log('Imagen eliminada exitosamente');
        },
        error: (error) => {
          console.error('Error al eliminar imagen:', error);
        },
      });
    }
  }

  // Navegación
  createProducto(): void {
    this.router.navigate(['/admin/productos/create']);
  }

  editProducto(id: number): void {
    this.router.navigate(['/admin/productos/edit', id]);
  }

  viewProducto(id: number): void {
    this.router.navigate(['/admin/productos/view', id]);
  }

  // Selección múltiple
  toggleProductSelection(productId: number): void {
    const selected = this.selectedProducts();
    const index = selected.indexOf(productId);

    if (index > -1) {
      this.selectedProducts.set(selected.filter((id) => id !== productId));
    } else {
      this.selectedProducts.set([...selected, productId]);
    }
  }

  selectAllProducts(): void {
    const allIds = this.productos().map((p) => p.id);
    this.selectedProducts.set(allIds);
  }

  clearSelection(): void {
    this.selectedProducts.set([]);
  }

  isSelected(productId: number): boolean {
    return this.selectedProducts().includes(productId);
  }

  get hasSelection(): boolean {
    return this.selectedProducts().length > 0;
  }

  get isAllSelected(): boolean {
    const productos = this.productos();
    const selected = this.selectedProducts();
    return (
      productos.length > 0 && productos.every((p) => selected.includes(p.id))
    );
  }

  // Acciones masivas
  bulkToggleDestacado(): void {
    const selected = this.selectedProducts();
    if (selected.length === 0) return;

    if (confirm(`¿Cambiar estado destacado de ${selected.length} productos?`)) {
      selected.forEach((id) => {
        this.productoService.toggleDestacado(id).subscribe();
      });
      this.clearSelection();
    }
  }

  bulkToggleActivo(): void {
    const selected = this.selectedProducts();
    if (selected.length === 0) return;

    if (confirm(`¿Cambiar estado activo de ${selected.length} productos?`)) {
      selected.forEach((id) => {
        this.productoService.toggleActivo(id).subscribe();
      });
      this.clearSelection();
    }
  }

  bulkDelete(): void {
    const selected = this.selectedProducts();
    if (selected.length === 0) return;

    if (
      confirm(
        `¿Estás seguro de eliminar ${selected.length} productos? Esta acción no se puede deshacer.`
      )
    ) {
      selected.forEach((id) => {
        this.productoService.deleteProducto(id).subscribe();
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

  getStockStatus(stock: number): 'success' | 'warning' | 'danger' {
    if (stock === 0) return 'danger';
    if (stock <= 10) return 'warning';
    return 'success';
  }

  getStockStatusText(stock: number): string {
    if (stock === 0) return 'Sin stock';
    if (stock <= 10) return 'Stock bajo';
    return 'En stock';
  }

  refresh(): void {
    this.productoService.refresh();
    this.loadStatistics();
  }

  // Track by function para optimizar ngFor
  trackByProductId(index: number, producto: Producto): number {
    return producto.id;
  }
}
