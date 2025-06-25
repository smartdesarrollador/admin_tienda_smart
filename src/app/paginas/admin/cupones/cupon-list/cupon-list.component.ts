import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  effect,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import {
  debounceTime,
  distinctUntilChanged,
  catchError,
  tap,
} from 'rxjs/operators';

import {
  CuponesService,
  CuponFilters,
} from '../../../../core/services/cupones.service';
import {
  Cupon,
  TipoCupon,
  PaginatedResponse,
} from '../../../../core/models/cupon.model';
// import { ToastService } from '../../../../core/services/toast.service'; // Descomentar si se usa
// import { AlertComponent } from '../../../../shared/components/alert/alert.component';
// import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
// import { PaginatorComponent } from '../../../../shared/components/paginator/paginator.component';

@Component({
  selector: 'app-cupon-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    // AlertComponent,
    // SpinnerComponent,
    // PaginatorComponent,
    DatePipe,
  ],
  providers: [DatePipe],
  templateUrl: './cupon-list.component.html',
  styleUrls: ['./cupon-list.component.css'],
})
export class CuponListComponent implements OnInit {
  private cuponesService = inject(CuponesService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private datePipe = inject(DatePipe);
  // private toastService = inject(ToastService); // Descomentar si se usa

  cupones = signal<Cupon[]>([]);
  totalCupones = signal(0);
  isLoading = signal(false);
  error = signal<string | null>(null);

  currentPage = signal(1);
  itemsPerPage = signal(10);

  filterForm!: FormGroup;
  today = new Date();
  private todayFormatted = this.datePipe.transform(
    this.today,
    'yyyy-MM-ddTHH:mm:ssZ',
    'UTC'
  );

  tiposCupon: { value: TipoCupon | ''; label: string }[] = [
    { value: '', label: 'Todos los Tipos' },
    { value: 'porcentaje', label: 'Porcentaje' },
    { value: 'fijo', label: 'Monto Fijo' },
  ];

  estadosActivo: { value: boolean | null; label: string }[] = [
    { value: null, label: 'Todos (Activo)' },
    { value: true, label: 'Sí' },
    { value: false, label: 'No' },
  ];

  estadosVigencia: { value: CuponFilters['estado_vigencia']; label: string }[] =
    [
      { value: '', label: 'Todos (Vigencia)' },
      { value: 'vigente', label: 'Vigente' },
      { value: 'no_vigente', label: 'No Vigente' },
      { value: 'proximo', label: 'Próximo a Iniciar' },
      { value: 'usado_completamente', label: 'Usado Completamente' },
    ];

  private initialLoadDone = signal(false); // Para controlar la carga inicial del effect

  constructor() {
    this.filterForm = this.fb.group({
      codigo: [''],
      tipo: [''],
      activo: [null],
      estado_vigencia: [''],
    });

    this.filterForm.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe(() => {
        this.currentPage.set(1);
        if (this.initialLoadDone()) {
          this.applyFilters();
        }
      });

    effect(
      () => {
        if (this.initialLoadDone()) {
          this.loadCupones(
            this.currentPage(),
            this.itemsPerPage(),
            this.filterForm.value
          );
        }
      },
      { allowSignalWrites: true }
    );
  }

  ngOnInit(): void {
    this.loadCuponesInitial();
  }

  loadCuponesInitial(): void {
    this.currentPage.set(1);
    this.loadCupones(
      this.currentPage(),
      this.itemsPerPage(),
      this.filterForm.value,
      true
    );
  }

  applyFilters(): void {
    this.loadCupones(
      this.currentPage(),
      this.itemsPerPage(),
      this.filterForm.value
    );
  }

  loadCupones(
    page: number,
    perPage: number,
    currentFiltersFromForm?: any,
    isInitialLoad = false
  ): void {
    this.isLoading.set(true);
    this.error.set(null);

    const effectiveFilters: CuponFilters = {
      page,
      per_page: perPage,
      sort_by: 'created_at',
      sort_direction: 'desc',
    };

    if (currentFiltersFromForm?.codigo) {
      effectiveFilters.codigo = currentFiltersFromForm.codigo;
    }
    if (currentFiltersFromForm?.tipo) {
      effectiveFilters.tipo = currentFiltersFromForm.tipo;
    }
    if (
      currentFiltersFromForm?.activo !== null &&
      currentFiltersFromForm?.activo !== undefined
    ) {
      effectiveFilters.activo = currentFiltersFromForm.activo;
    }
    if (currentFiltersFromForm?.estado_vigencia) {
      effectiveFilters.estado_vigencia = currentFiltersFromForm.estado_vigencia;
    }

    this.cuponesService
      .getCupones(effectiveFilters)
      .pipe(
        tap((response: PaginatedResponse<Cupon>) => {
          this.cupones.set(response.data);
          this.totalCupones.set(response.meta.total);
          this.isLoading.set(false);
          if (isInitialLoad) {
            this.initialLoadDone.set(true); // Marcar la carga inicial como completada
          }
        }),
        catchError((err) => {
          this.error.set(err.message || 'Error al cargar los cupones.');
          this.isLoading.set(false);
          this.cupones.set([]);
          this.totalCupones.set(0);
          if (isInitialLoad) {
            this.initialLoadDone.set(true); // Asegurar que se marca incluso en error
          }
          return [];
        })
      )
      .subscribe();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  onItemsPerPageChange(itemsSelected: number): void {
    this.itemsPerPage.set(itemsSelected);
    this.currentPage.set(1);
  }

  clearFilters(): void {
    this.filterForm.reset({
      codigo: '',
      tipo: '',
      activo: null,
      estado_vigencia: '',
    });
  }

  navigateToCreate(): void {
    this.router.navigate(['/admin/cupones/crear']);
  }

  navigateToEdit(cuponId: number): void {
    this.router.navigate(['/admin/cupones/editar', cuponId]);
  }

  confirmDeleteCupon(cuponId: number): void {
    if (confirm('¿Está seguro de que desea eliminar este cupón?')) {
      this.deleteCupon(cuponId);
    }
  }

  private deleteCupon(cuponId: number): void {
    this.isLoading.set(true);
    this.cuponesService
      .deleteCupon(cuponId)
      .pipe(
        tap(() => {
          this.loadCupones(
            this.currentPage(),
            this.itemsPerPage(),
            this.filterForm.value
          );
        }),
        catchError((err) => {
          this.error.set(err.message || 'Error al eliminar el cupón.');
          this.isLoading.set(false);
          return [];
        })
      )
      .subscribe();
  }

  trackCuponById(index: number, cupon: Cupon): number {
    return cupon.id;
  }

  isCuponExpirado(cupon: Cupon): boolean {
    if (!cupon.fecha_fin) return false;
    const fechaFinFormateada = this.datePipe.transform(
      cupon.fecha_fin,
      'yyyy-MM-ddTHH:mm:ssZ',
      'UTC'
    );
    return !!(
      fechaFinFormateada &&
      this.todayFormatted &&
      fechaFinFormateada < this.todayFormatted
    );
  }

  isCuponProximo(cupon: Cupon): boolean {
    if (!cupon.fecha_inicio || cupon.esta_vigente) return false; // Si ya está vigente, no es próximo
    const fechaInicioFormateada = this.datePipe.transform(
      cupon.fecha_inicio,
      'yyyy-MM-ddTHH:mm:ssZ',
      'UTC'
    );
    return !!(
      fechaInicioFormateada &&
      this.todayFormatted &&
      fechaInicioFormateada > this.todayFormatted
    );
  }
}
