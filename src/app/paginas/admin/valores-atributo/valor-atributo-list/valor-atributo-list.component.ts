import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
  effect,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { ValorAtributoService } from '../../../../core/services'; // Usando index.ts
import {
  ValorAtributo,
  ValorAtributoFilters,
  PaginatedValorAtributoResponse,
  PaginationMeta,
} from '../../../../core/models'; // Usando index.ts

@Component({
  selector: 'app-valor-atributo-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, DatePipe],
  templateUrl: './valor-atributo-list.component.html',
  styleUrls: ['./valor-atributo-list.component.css'], // Podemos crear este archivo si se necesitan estilos muy específicos
})
export class ValorAtributoListComponent implements OnInit, OnDestroy {
  private readonly valorAtributoService = inject(ValorAtributoService);
  private readonly destroy$ = new Subject<void>();
  private readonly searchSubject = new Subject<string>();

  // Signals del servicio para reactividad directa en el template
  readonly isLoading = this.valorAtributoService.loading;
  readonly error = this.valorAtributoService.error;
  readonly valoresAtributo = this.valorAtributoService.valoresAtributo;

  // Signals locales para el componente
  readonly pagination = signal<PaginationMeta | null>(null);
  readonly searchTerm = signal<string>('');
  readonly imageModalUrl = signal<string | null>(null); // Para el modal de imagen

  // Objeto para los filtros, manejado con ngModel
  filters: ValorAtributoFilters = {
    per_page: 10,
    order_by: 'valor',
    order_direction: 'asc',
    page: 1,
  };

  // Computed signals para información derivada
  readonly totalValores = computed(() => this.valoresAtributo().length);
  readonly valoresConImagen = computed(
    () => this.valoresAtributo().filter((v) => v.tiene_imagen).length
  );

  constructor() {
    // Effect para suscribirse a cambios en la paginación del servicio
    effect(
      () => {
        this.valorAtributoService.pagination$
          .pipe(takeUntil(this.destroy$))
          .subscribe((meta) => {
            this.pagination.set(meta);
          });
      },
      { allowSignalWrites: true }
    );

    // Configurar la búsqueda con debounce para optimizar llamadas a la API
    this.searchSubject
      .pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((term) => {
        this.filters.valor = term;
        this.filters.page = 1; // Resetear a la primera página en nueva búsqueda
        this.loadValoresAtributo();
      });
  }

  ngOnInit(): void {
    this.loadValoresAtributo();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.valorAtributoService.clearState(); // Limpiar estado del servicio al destruir el componente
  }

  /**
   * Carga los valores de atributo aplicando los filtros actuales.
   */
  loadValoresAtributo(): void {
    this.valorAtributoService.getValoresAtributo(this.filters).subscribe();
  }

  /**
   * Maneja los cambios en el input de búsqueda.
   */
  onSearchTermChange(event: Event | string): void {
    const term =
      typeof event === 'string'
        ? event
        : (event.target as HTMLInputElement).value;
    this.searchTerm.set(term);
    this.searchSubject.next(term);
  }

  /**
   * Aplica los filtros seleccionados y recarga los datos.
   */
  applyFilters(): void {
    this.filters.page = 1; // Resetear a la primera página al aplicar filtros
    this.loadValoresAtributo();
  }

  /**
   * Limpia todos los filtros a sus valores por defecto y recarga los datos.
   */
  clearFilters(): void {
    this.filters = {
      per_page: 10,
      order_by: 'valor',
      order_direction: 'asc',
      page: 1,
      valor: '',
      codigo: '',
      tipo_atributo: '',
      con_imagen: undefined,
      include_usage: undefined,
    };
    this.searchTerm.set('');
    this.loadValoresAtributo();
  }

  /**
   * Refresca los datos manteniendo los filtros actuales.
   */
  refreshData(): void {
    this.valorAtributoService.refresh().subscribe();
  }

  /**
   * Navega a una página específica de la paginación.
   */
  goToPage(page: number): void {
    if (
      this.pagination() &&
      page >= 1 &&
      page <= this.pagination()!.last_page
    ) {
      this.filters.page = page;
      this.loadValoresAtributo();
    }
  }

  /**
   * Elimina un valor de atributo tras confirmación.
   */
  deleteValorAtributo(valor: ValorAtributo): void {
    if (
      confirm(
        `¿Estás seguro de eliminar el valor "${valor.valor}"? Esta acción no se puede deshacer.`
      )
    ) {
      this.valorAtributoService.deleteValorAtributo(valor.id).subscribe({
        next: () => {
          // La lista se actualiza automáticamente gracias a la reactividad del servicio
          // podrías añadir una notificación de éxito aquí
          console.log('Valor de atributo eliminado exitosamente.');
        },
        error: (err) => {
          // El servicio ya maneja el error y lo expone en errorSignal
          console.error('Error al eliminar valor de atributo:', err);
        },
      });
    }
  }

  /**
   * Elimina la imagen de un valor de atributo tras confirmación.
   */
  removeImagen(valor: ValorAtributo): void {
    if (
      confirm(`¿Estás seguro de eliminar la imagen del valor "${valor.valor}"?`)
    ) {
      this.valorAtributoService.removeImagenValorAtributo(valor.id).subscribe({
        next: () => {
          // La lista se actualiza automáticamente
          console.log('Imagen eliminada exitosamente.');
        },
        error: (err) => {
          console.error('Error al eliminar imagen:', err);
        },
      });
    }
  }

  /**
   * Construye la URL completa para mostrar una imagen.
   */
  getImageUrl(imagePath: string | null | undefined): string | null {
    return this.valorAtributoService.getImageUrl(imagePath || null);
  }

  /**
   * Rastrea los elementos en un bucle @for para optimizar el rendimiento.
   */
  trackById(index: number, item: ValorAtributo): number {
    return item.id;
  }

  /**
   * Abre el modal para previsualizar una imagen.
   */
  openImageModal(imageUrl: string | null): void {
    this.imageModalUrl.set(imageUrl);
  }

  /**
   * Cierra el modal de previsualización de imagen.
   */
  closeImageModal(): void {
    this.imageModalUrl.set(null);
  }
}
