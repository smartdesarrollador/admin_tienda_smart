import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

// Services y Models
import { CategoriasService } from '../../../../core/services/categorias.service';
import {
  Categoria,
  CategoriaFilters,
} from '../../../../core/models/categoria.model';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-categoria-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './categoria-list.component.html',
  styleUrls: ['./categoria-list.component.css'],
})
export class CategoriaListComponent implements OnInit, OnDestroy {
  private readonly categoriasService = inject(CategoriasService);
  private readonly fb = inject(FormBuilder);
  private readonly destroy$ = new Subject<void>();

  // Environment
  private readonly env = environment;

  // Estados reactivos del servicio
  readonly categorias$ = this.categoriasService.categorias$;
  readonly loading$ = this.categoriasService.loading$;
  readonly totalCategorias$ = this.categoriasService.totalCategorias$;

  // Estados locales con signals
  readonly currentPage = signal(1);
  readonly perPage = signal(15);
  readonly sortField = signal<'nombre' | 'orden' | 'created_at'>('orden');
  readonly sortDirection = signal<'asc' | 'desc'>('asc');
  readonly activeFilter = signal<boolean | null>(null);

  // Formulario de filtros
  filtrosForm: FormGroup = this.fb.group({
    search: [''],
    activo: [''],
    sort_by: ['orden'],
    sort_direction: ['asc'],
    per_page: [15],
  });

  // Estados de UI
  readonly showFilters = signal(false);
  readonly selectedCategories = signal<number[]>([]);

  ngOnInit(): void {
    this.loadCategorias();
    this.setupFormSubscriptions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCategorias(): void {
    const filters = this.buildFilters();
    this.categoriasService.getCategorias(filters).subscribe({
      error: (error) => console.error('Error al cargar categorías:', error),
    });
  }

  private setupFormSubscriptions(): void {
    // Suscribirse a cambios en filtros con debounce
    this.filtrosForm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentPage.set(1); // Reset página al filtrar
        this.applyFilters();
      });
  }

  private buildFilters(): CategoriaFilters {
    const formValue = this.filtrosForm.value;
    const filters: CategoriaFilters = {
      page: this.currentPage(),
      per_page: this.perPage(),
      sort_by: this.sortField(),
      sort_direction: this.sortDirection(),
    };

    if (formValue.search?.trim()) {
      filters.search = formValue.search.trim();
    }

    if (formValue.activo !== '') {
      filters.activo = formValue.activo === 'true';
    }

    return filters;
  }

  private applyFilters(): void {
    const formValue = this.filtrosForm.value;

    // Actualizar signals desde el formulario
    if (formValue.sort_by) this.sortField.set(formValue.sort_by);
    if (formValue.sort_direction)
      this.sortDirection.set(formValue.sort_direction);
    if (formValue.per_page) this.perPage.set(formValue.per_page);

    const filters = this.buildFilters();
    this.categoriasService.getCategorias(filters).subscribe();
  }

  // Métodos de navegación
  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadCategorias();
  }

  nextPage(): void {
    this.currentPage.update((current) => current + 1);
    this.loadCategorias();
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update((current) => current - 1);
      this.loadCategorias();
    }
  }

  // Métodos de ordenamiento
  setSortBy(field: 'nombre' | 'orden' | 'created_at'): void {
    if (this.sortField() === field) {
      // Cambiar dirección si es el mismo campo
      this.sortDirection.update((dir) => (dir === 'asc' ? 'desc' : 'asc'));
    } else {
      // Nuevo campo, dirección por defecto
      this.sortField.set(field);
      this.sortDirection.set('asc');
    }

    // Actualizar formulario
    this.filtrosForm.patchValue({
      sort_by: this.sortField(),
      sort_direction: this.sortDirection(),
    });
  }

  // Métodos de selección múltiple
  toggleCategorySelection(categoriaId: number): void {
    this.selectedCategories.update((selected) => {
      const index = selected.indexOf(categoriaId);
      if (index > -1) {
        return selected.filter((id) => id !== categoriaId);
      } else {
        return [...selected, categoriaId];
      }
    });
  }

  selectAllCategories(): void {
    this.categorias$.pipe(takeUntil(this.destroy$)).subscribe((categorias) => {
      this.selectedCategories.set(categorias.map((c) => c.id));
    });
  }

  clearSelection(): void {
    this.selectedCategories.set([]);
  }

  isSelected(categoriaId: number): boolean {
    return this.selectedCategories().includes(categoriaId);
  }

  // Métodos de acciones
  async eliminarCategoria(categoria: Categoria): Promise<void> {
    // Verificar si tiene productos o subcategorías
    const hasProducts = await this.checkHasProducts(categoria.id);
    const hasSubcategorias =
      categoria.subcategorias_count && categoria.subcategorias_count > 0;

    if (hasProducts || hasSubcategorias) {
      const reasons = [];
      if (hasProducts) reasons.push('productos asociados');
      if (hasSubcategorias) reasons.push('subcategorías');

      alert(
        `No se puede eliminar la categoría "${
          categoria.nombre
        }" porque tiene ${reasons.join(' y ')}.`
      );
      return;
    }

    if (
      confirm(`¿Estás seguro de eliminar la categoría "${categoria.nombre}"?`)
    ) {
      this.categoriasService.deleteCategoria(categoria.id).subscribe({
        next: () => {
          console.log('Categoría eliminada exitosamente');
          // El servicio automáticamente actualiza la lista
        },
        error: (error) => {
          console.error('Error al eliminar categoría:', error);
          alert(`Error al eliminar: ${error.message}`);
        },
      });
    }
  }

  private async checkHasProducts(categoriaId: number): Promise<boolean> {
    return new Promise((resolve) => {
      this.categoriasService.checkCategoriaHasProducts(categoriaId).subscribe({
        next: (result) => resolve(result.has_products),
        error: () => resolve(false),
      });
    });
  }

  async eliminarSeleccionadas(): Promise<void> {
    const selected = this.selectedCategories();
    if (selected.length === 0) {
      alert('No hay categorías seleccionadas');
      return;
    }

    if (
      confirm(
        `¿Estás seguro de eliminar ${selected.length} categorías seleccionadas?`
      )
    ) {
      // TODO: Implementar eliminación múltiple en el backend
      for (const id of selected) {
        this.categoriasService.deleteCategoria(id).subscribe({
          error: (error) =>
            console.error(`Error al eliminar categoría ${id}:`, error),
        });
      }
      this.clearSelection();
    }
  }

  // Métodos de utilidad
  toggleFilters(): void {
    this.showFilters.update((show) => !show);
  }

  resetFilters(): void {
    this.filtrosForm.reset({
      search: '',
      activo: '',
      sort_by: 'orden',
      sort_direction: 'asc',
      per_page: 15,
    });
    this.currentPage.set(1);
  }

  trackByCategoria(index: number, categoria: Categoria): number {
    return categoria.id;
  }

  getStatusBadgeClass(activo: boolean): string {
    return activo
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-red-100 text-red-800 border-red-200';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  // Método para manejar el checkbox de seleccionar todos
  onSelectAllChange(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    checkbox.checked ? this.selectAllCategories() : this.clearSelection();
  }

  // Método para calcular páginas totales
  getTotalPages(): number {
    let total = 0;
    this.totalCategorias$.subscribe((value) => (total = value)).unsubscribe();
    return Math.ceil(total / this.perPage());
  }

  // Método para construir la URL completa de la imagen
  getFullImagePath(imagePath: string | undefined): string {
    if (!imagePath) {
      // Puedes retornar una imagen por defecto o una cadena vacía
      return 'assets/categorias/default.jpg'; // Ajusta la ruta a tu imagen por defecto
    }
    if (imagePath.startsWith('http')) {
      return imagePath; // Ya es una URL completa
    }
    return `${this.env.urlDominioApi}/${
      imagePath.startsWith('/') ? imagePath.substring(1) : imagePath
    }`;
  }
}
