import {
  Component,
  inject,
  OnInit,
  signal,
  computed,
  WritableSignal,
  effect,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

import { AtributosService } from '../../../../core/services/atributos.service';
import {
  Atributo,
  TipoAtributo,
  PaginatedResponse,
} from '../../../../core/models/atributo.model';
// import { ToastService } from '../../../../core/services/toast.service'; // Comentado temporalmente

interface FiltrosAtributos {
  nombre: string;
  tipo: TipoAtributo | ''; // '' para todos
  filtrable: boolean | null; // null para todos
  visible: boolean | null; // null para todos
}

@Component({
  selector: 'app-atributo-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './atributo-list.component.html',
  styleUrls: ['./atributo-list.component.css'],
})
export class AtributoListComponent implements OnInit, OnDestroy {
  private readonly atributosService = inject(AtributosService);
  private readonly router = inject(Router);
  // private readonly toastService = inject(ToastService); // Comentado temporalmente

  readonly atributos: WritableSignal<Atributo[]> = signal([]);
  readonly isLoading: WritableSignal<boolean> = signal(false);
  readonly error: WritableSignal<string | null> = signal(null);

  // Paginación
  readonly currentPage: WritableSignal<number> = signal(1);
  readonly itemsPerPage: WritableSignal<number> = signal(10);
  readonly totalItems: WritableSignal<number> = signal(0);
  readonly totalPages = computed(() =>
    Math.ceil(this.totalItems() / this.itemsPerPage())
  );

  // Filtros
  readonly filtros: WritableSignal<FiltrosAtributos> = signal({
    nombre: '',
    tipo: '',
    filtrable: null,
    visible: null,
  });

  private readonly destroy$ = new Subject<void>();
  private readonly searchSubject = new Subject<string>();

  readonly tiposDeAtributo: { value: TipoAtributo | ''; label: string }[] = [
    { value: '', label: 'Todos los tipos' },
    { value: 'texto', label: 'Texto' },
    { value: 'color', label: 'Color' },
    { value: 'numero', label: 'Número' },
    { value: 'tamaño', label: 'Tamaño' },
    { value: 'booleano', label: 'Sí/No' },
  ];

  readonly opcionesBooleanas: { value: boolean | null; label: string }[] = [
    { value: null, label: 'Todos' },
    { value: true, label: 'Sí' },
    { value: false, label: 'No' },
  ];

  constructor() {
    // Effect para recargar atributos cuando cambian los filtros o la página
    effect(
      () => {
        this.loadAtributos(
          this.currentPage(),
          this.itemsPerPage(),
          this.filtros()
        );
      },
      { allowSignalWrites: true }
    );
  }

  ngOnInit(): void {
    this.searchSubject
      .pipe(
        debounceTime(500), // Espera 500ms después de la última pulsación
        distinctUntilChanged(), // Solo emite si el valor ha cambiado
        takeUntil(this.destroy$)
      )
      .subscribe((nombre) => {
        this.filtros.update((f) => ({ ...f, nombre }));
        this.currentPage.set(1); // Reset page on new search
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAtributos(
    page: number,
    perPage: number,
    filtros: FiltrosAtributos
  ): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.atributosService
      .getAtributos(
        page,
        perPage,
        filtros.nombre || undefined,
        filtros.tipo || undefined,
        filtros.filtrable === null ? undefined : filtros.filtrable,
        filtros.visible === null ? undefined : filtros.visible
      )
      .subscribe({
        next: (response: PaginatedResponse<Atributo>) => {
          this.atributos.set(response.data);
          this.totalItems.set(response.meta.total);
          this.itemsPerPage.set(response.meta.per_page);
          this.currentPage.set(response.meta.current_page);
          this.isLoading.set(false);
        },
        error: (err: any) => {
          console.error('Error al cargar atributos:', err);
          const message =
            err?.message || 'No se pudieron cargar los atributos.';
          this.error.set(message);
          // this.toastService.showError(message); // Comentado temporalmente
          this.isLoading.set(false);
          this.atributos.set([]);
        },
      });
  }

  onSearchChange(nombre: string): void {
    this.searchSubject.next(nombre);
  }

  onFilterChange<K extends keyof FiltrosAtributos>(
    filterKey: K,
    value: FiltrosAtributos[K]
  ): void {
    this.filtros.update((f) => ({ ...f, [filterKey]: value }));
    this.applyFilters();
  }

  applyFilters(): void {
    this.currentPage.set(1);
  }

  clearFilters(): void {
    this.filtros.set({
      nombre: '',
      tipo: '',
      filtrable: null,
      visible: null,
    });
    this.currentPage.set(1);
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  onItemsPerPageChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.itemsPerPage.set(Number(selectElement.value));
    this.currentPage.set(1); // Resetear a la primera página
  }

  trackAtributoById(index: number, atributo: Atributo): number {
    return atributo.id;
  }

  getPageNumbers(): number[] {
    const totalPgs = this.totalPages();
    if (totalPgs <= 7) {
      return Array.from({ length: totalPgs }, (_, i) => i + 1);
    }

    const currentPageNum = this.currentPage();
    const pages: (number | string)[] = [];

    if (currentPageNum <= 4) {
      pages.push(1, 2, 3, 4, 5, '...', totalPgs);
    } else if (currentPageNum >= totalPgs - 3) {
      pages.push(
        1,
        '...',
        totalPgs - 4,
        totalPgs - 3,
        totalPgs - 2,
        totalPgs - 1,
        totalPgs
      );
    } else {
      pages.push(
        1,
        '...',
        currentPageNum - 1,
        currentPageNum,
        currentPageNum + 1,
        '...',
        totalPgs
      );
    }
    // Filtrar '...' para el return type number[], ya que el HTML lo manejará si es string.
    // O se podría adaptar el HTML para manejar '...' como string y no botones.
    return pages.filter((p) => typeof p === 'number') as number[];
  }

  goToCreateAtributo(): void {
    this.router.navigate(['/admin/atributos/crear']);
  }

  editAtributo(id: number): void {
    this.router.navigate(['/admin/atributos/editar', id]);
  }

  deleteAtributo(atributo: Atributo): void {
    if (
      confirm(
        `¿Estás seguro de que quieres eliminar el atributo "${atributo.nombre}"? Esta acción no se puede deshacer.`
      )
    ) {
      this.isLoading.set(true);
      this.atributosService.deleteAtributo(atributo.id).subscribe({
        next: () => {
          // this.toastService.showSuccess(`Atributo "${atributo.nombre}" eliminado con éxito.`); // Comentado temporalmente
          console.log(`Atributo "${atributo.nombre}" eliminado con éxito.`); // Log temporal
          // Forzar recarga desde la página actual, considerando si la página queda vacía
          if (this.atributos().length === 1 && this.currentPage() > 1) {
            this.currentPage.update((p) => p - 1); // Ir a la página anterior si era el último ítem
          } else {
            // Re-evaluar para forzar el effect si la página no cambia
            this.loadAtributos(
              this.currentPage(),
              this.itemsPerPage(),
              this.filtros()
            );
          }
          this.isLoading.set(false);
        },
        error: (err: any) => {
          console.error('Error al eliminar atributo:', err);
          const message = err?.message || 'No se pudo eliminar el atributo.';
          this.error.set(message);
          // this.toastService.showError(message); // Comentado temporalmente
          this.isLoading.set(false);
        },
      });
    }
  }
}
