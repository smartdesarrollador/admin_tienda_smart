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
import { NgOptimizedImage } from '@angular/common';
import { Router } from '@angular/router';

import { ImagenProductoService } from '../../../../core/services/imagen-producto.service';
// Comentar servicios no existentes por ahora
// import { ProductoService } from '../../../../core/services/producto.service';
// import { VariacionProductoService } from '../../../../core/services/variacion-producto.service';
import {
  ImagenProducto,
  ImagenProductoFilters,
  TipoImagen,
  TIPOS_IMAGEN,
  getImageTypeDisplay,
} from '../../../../core/models/imagen-producto.interface';

@Component({
  selector: 'app-imagen-producto-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgOptimizedImage],
  templateUrl: './imagen-producto-list.component.html',
  styleUrls: ['./imagen-producto-list.component.css'],
})
export class ImagenProductoListComponent implements OnInit {
  private readonly imagenService = inject(ImagenProductoService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  // Signals del servicio
  readonly loading = this.imagenService.loading;
  readonly error = this.imagenService.error;
  readonly imagenes = this.imagenService.imagenes;

  // Signals locales
  private readonly _selectedImages = signal<Set<number>>(new Set());
  private readonly _viewMode = signal<'grid' | 'list'>('grid');
  private readonly _showFilters = signal<boolean>(false);
  private readonly _currentPage = signal<number>(1);
  private readonly _perPage = signal<number>(12);

  // Signals públicos readonly
  readonly selectedImages = this._selectedImages.asReadonly();
  readonly viewMode = this._viewMode.asReadonly();
  readonly showFilters = this._showFilters.asReadonly();
  readonly currentPage = this._currentPage.asReadonly();
  readonly perPage = this._perPage.asReadonly();

  // Computed signals
  readonly hasSelectedImages = computed(() => this._selectedImages().size > 0);
  readonly selectedCount = computed(() => this._selectedImages().size);
  readonly allSelected = computed(() => {
    const imagenes = this.imagenes();
    const selected = this._selectedImages();
    return (
      imagenes.length > 0 &&
      imagenes.every((img: ImagenProducto) => selected.has(img.id))
    );
  });
  readonly hasImagenes = computed(() => this.imagenes().length > 0);

  // Formulario de filtros
  filterForm: FormGroup;

  // Opciones para filtros
  readonly tiposImagen = Object.entries(TIPOS_IMAGEN).map(([key, value]) => ({
    value: key as TipoImagen,
    label: value,
  }));

  // Paginación
  pagination$ = this.imagenService.pagination$;

  // Búsqueda independiente
  searchValue = '';

  constructor() {
    this.filterForm = this.fb.group({
      search: [''],
      producto_id: [''],
      variacion_id: [''],
      tipo: [''],
      principal: [''],
      sort_by: ['orden'],
      sort_order: ['asc'],
    });

    // Effect para cargar imágenes cuando cambian los filtros
    effect(
      () => {
        this.loadImagenes();
      },
      { allowSignalWrites: true }
    );
  }

  ngOnInit(): void {
    this.loadImagenes();
    this.setupFilterSubscription();
  }

  /**
   * Cargar imágenes con filtros actuales
   */
  private loadImagenes(): void {
    const formValue = this.filterForm.value;
    const filters: ImagenProductoFilters = {
      ...formValue,
      page: this._currentPage(),
      per_page: this._perPage(),
    };

    // Limpiar valores vacíos
    Object.keys(filters).forEach((key) => {
      const filterKey = key as keyof ImagenProductoFilters;
      if (filters[filterKey] === '' || filters[filterKey] === null) {
        delete filters[filterKey];
      }
    });

    this.imagenService.getImagenes(filters).subscribe({
      next: () => {
        // Limpiar selección al cargar nuevas imágenes
        this._selectedImages.set(new Set());
      },
      error: (error) => {
        console.error('Error al cargar imágenes:', error);
      },
    });
  }

  /**
   * Configurar suscripción a cambios en filtros
   */
  private setupFilterSubscription(): void {
    this.filterForm.valueChanges.subscribe(() => {
      this._currentPage.set(1); // Reset página al cambiar filtros
      this.loadImagenes();
    });
  }

  /**
   * Cambiar modo de vista
   */
  toggleViewMode(): void {
    this._viewMode.set(this._viewMode() === 'grid' ? 'list' : 'grid');
  }

  /**
   * Mostrar/ocultar filtros
   */
  toggleFilters(): void {
    this._showFilters.set(!this._showFilters());
  }

  /**
   * Limpiar filtros
   */
  clearFilters(): void {
    this.filterForm.reset({
      search: '',
      producto_id: '',
      variacion_id: '',
      tipo: '',
      principal: '',
      sort_by: 'orden',
      sort_order: 'asc',
    });
  }

  /**
   * Seleccionar/deseleccionar imagen
   */
  toggleImageSelection(imageId: number): void {
    const selected = new Set(this._selectedImages());
    if (selected.has(imageId)) {
      selected.delete(imageId);
    } else {
      selected.add(imageId);
    }
    this._selectedImages.set(selected);
  }

  /**
   * Seleccionar/deseleccionar todas las imágenes
   */
  toggleSelectAll(): void {
    const imagenes = this.imagenes();
    if (this.allSelected()) {
      this._selectedImages.set(new Set());
    } else {
      const allIds = new Set(imagenes.map((img: ImagenProducto) => img.id));
      this._selectedImages.set(allIds);
    }
  }

  /**
   * Marcar imagen como principal
   */
  setPrincipal(imageId: number): void {
    this.imagenService.setPrincipal(imageId).subscribe({
      next: () => {
        // El servicio ya actualiza el estado local
      },
      error: (error) => {
        console.error('Error al marcar como principal:', error);
      },
    });
  }

  /**
   * Eliminar imagen
   */
  deleteImage(imageId: number): void {
    if (confirm('¿Está seguro de que desea eliminar esta imagen?')) {
      this.imagenService.deleteImagen(imageId).subscribe({
        next: () => {
          // Remover de selección si estaba seleccionada
          const selected = new Set(this._selectedImages());
          selected.delete(imageId);
          this._selectedImages.set(selected);
        },
        error: (error) => {
          console.error('Error al eliminar imagen:', error);
        },
      });
    }
  }

  /**
   * Eliminar imágenes seleccionadas
   */
  deleteSelectedImages(): void {
    const selectedIds = Array.from(this._selectedImages());
    if (selectedIds.length === 0) return;

    const message = `¿Está seguro de que desea eliminar ${selectedIds.length} imagen(es) seleccionada(s)?`;
    if (confirm(message)) {
      // Eliminar una por una (podrías implementar eliminación masiva en el backend)
      selectedIds.forEach((id) => {
        this.imagenService.deleteImagen(id).subscribe({
          error: (error) => {
            console.error(`Error al eliminar imagen ${id}:`, error);
          },
        });
      });
      this._selectedImages.set(new Set());
    }
  }

  /**
   * Navegar a crear nueva imagen
   */
  createImage(): void {
    this.router.navigate(['/admin/imagenes-producto/crear']);
  }

  /**
   * Navegar a editar imagen
   */
  editImage(imageId: number): void {
    this.router.navigate(['/admin/imagenes-producto/editar', imageId]);
  }

  /**
   * Ver detalles de imagen
   */
  viewImage(imageId: number): void {
    this.router.navigate(['/admin/imagenes-producto/ver', imageId]);
  }

  /**
   * Cambiar página
   */
  changePage(page: number): void {
    this._currentPage.set(page);
    this.loadImagenes();
  }

  /**
   * Cambiar elementos por página
   */
  changePerPage(perPage: number): void {
    this._perPage.set(perPage);
    this._currentPage.set(1);
    this.loadImagenes();
  }

  /**
   * Obtener display del tipo de imagen
   */
  getImageTypeDisplay(tipo: TipoImagen | null): string {
    return getImageTypeDisplay(tipo);
  }

  /**
   * Obtener clase CSS para el estado principal
   */
  getPrincipalClass(principal: boolean): string {
    return principal
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-gray-100 text-gray-800 border-gray-200';
  }

  /**
   * Obtener clase CSS para el tipo de imagen
   */
  getTipoClass(tipo: TipoImagen | null): string {
    const baseClass = 'px-2 py-1 text-xs font-medium rounded-full border';

    switch (tipo) {
      case 'miniatura':
        return `${baseClass} bg-blue-100 text-blue-800 border-blue-200`;
      case 'galeria':
        return `${baseClass} bg-purple-100 text-purple-800 border-purple-200`;
      case 'zoom':
        return `${baseClass} bg-orange-100 text-orange-800 border-orange-200`;
      case 'banner':
        return `${baseClass} bg-red-100 text-red-800 border-red-200`;
      case 'detalle':
        return `${baseClass} bg-yellow-100 text-yellow-800 border-yellow-200`;
      default:
        return `${baseClass} bg-gray-100 text-gray-800 border-gray-200`;
    }
  }

  /**
   * Limpiar errores
   */
  clearError(): void {
    this.imagenService.clearError();
  }

  /**
   * Recargar datos
   */
  refresh(): void {
    this.loadImagenes();
  }

  /**
   * Manejar cambios en la búsqueda
   */
  onSearchChange(value: string): void {
    this.filterForm.get('search')?.setValue(value);
  }
}
