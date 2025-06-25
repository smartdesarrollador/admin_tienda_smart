import {
  Component,
  inject,
  signal,
  WritableSignal,
  OnDestroy,
  OnInit,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  takeUntil,
  tap,
  filter,
} from 'rxjs/operators';

import { AtributosService } from '../../../../core/services/atributos.service';
import { Atributo, TipoAtributo } from '../../../../core/models/atributo.model';
// import { ToastService } from '../../../../core/services/toast.service'; // TODO: Implementar ToastService

@Component({
  selector: 'app-atributo-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './atributo-edit.component.html',
  styleUrls: ['./atributo-edit.component.css'],
})
export class AtributoEditComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly atributosService = inject(AtributosService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  // private readonly toastService = inject(ToastService); // TODO: Implementar ToastService

  readonly atributoForm: FormGroup;
  readonly atributoOriginal: WritableSignal<Atributo | null> = signal(null);
  readonly atributoId: WritableSignal<number | null> = signal(null);

  readonly isLoading: WritableSignal<boolean> = signal(true);
  readonly isSubmitting: WritableSignal<boolean> = signal(false);
  readonly generalError: WritableSignal<string | null> = signal(null);

  // Validación de nombre en tiempo real
  readonly nombreDisponible: WritableSignal<boolean | null> = signal(null);
  readonly checkingNombre: WritableSignal<boolean> = signal(false);
  private readonly nombreChanged = new Subject<string>();
  private readonly destroy$ = new Subject<void>();

  readonly tiposDeAtributo: { value: TipoAtributo; label: string }[] = [
    { value: 'texto', label: 'Texto' },
    { value: 'color', label: 'Color' },
    { value: 'numero', label: 'Número' },
    { value: 'tamaño', label: 'Tamaño' },
    { value: 'booleano', label: 'Sí/No (Booleano)' },
  ];

  readonly hasChanges = computed(() => {
    if (!this.atributoOriginal() || !this.atributoForm.dirty) {
      return false;
    }
    const formValues = this.atributoForm.getRawValue();
    const original = this.atributoOriginal();
    return (
      formValues.nombre !== original?.nombre ||
      formValues.tipo !== original?.tipo ||
      formValues.filtrable !== original?.filtrable ||
      formValues.visible !== original?.visible
    );
  });

  constructor() {
    this.atributoForm = this.fb.group({
      nombre: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
        ],
      ],
      tipo: ['texto' as TipoAtributo, Validators.required],
      filtrable: [false],
      visible: [true],
    });
  }

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        takeUntil(this.destroy$),
        switchMap((params) => {
          const id = params.get('id');
          if (id) {
            this.atributoId.set(+id);
            this.isLoading.set(true);
            return this.atributosService.getAtributoById(+id);
          }
          this.router.navigate(['/admin/atributos']); // Redirigir si no hay ID
          return []; // Observable vacío para evitar errores
        })
      )
      .subscribe({
        next: (response) => {
          if (response && response.data) {
            this.atributoOriginal.set(response.data);
            this.fillForm(response.data);
            this.isLoading.set(false);
          } else {
            // this.toastService.showError('Atributo no encontrado.'); // TODO
            console.error('Atributo no encontrado');
            this.router.navigate(['/admin/atributos']);
          }
        },
        error: (err) => {
          this.isLoading.set(false);
          this.generalError.set(err?.message || 'Error al cargar el atributo.');
          // this.toastService.showError(err?.message || 'Error al cargar el atributo.'); // TODO
          console.error('Error al cargar atributo:', err);
          this.router.navigate(['/admin/atributos']);
        },
      });

    this.nombreChanged
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        filter((nombre) => nombre !== this.atributoOriginal()?.nombre), // Solo validar si el nombre cambió
        tap(() => {
          this.checkingNombre.set(true);
          this.nombreDisponible.set(null);
        }),
        switchMap((nombre) =>
          this.atributosService.validateNombreDisponible(
            nombre,
            this.atributoId() ?? undefined
          )
        ),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response) => {
          this.nombreDisponible.set(response.available);
          this.checkingNombre.set(false);
          if (!response.available) {
            this.atributoForm
              .get('nombre')
              ?.setErrors({ nombreNoDisponible: true });
          } else {
            const nombreControl = this.atributoForm.get('nombre');
            if (nombreControl?.hasError('nombreNoDisponible')) {
              delete nombreControl.errors?.['nombreNoDisponible'];
              nombreControl.updateValueAndValidity();
            }
          }
        },
        error: () => {
          this.nombreDisponible.set(false);
          this.checkingNombre.set(false);
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fillForm(atributo: Atributo): void {
    this.atributoForm.patchValue({
      nombre: atributo.nombre,
      tipo: atributo.tipo,
      filtrable: atributo.filtrable,
      visible: atributo.visible,
    });
    this.atributoForm.markAsPristine();
  }

  onNombreChange(event: Event): void {
    const nombre = (event.target as HTMLInputElement).value.trim();
    if (nombre && nombre.length >= 3) {
      if (nombre === this.atributoOriginal()?.nombre) {
        this.nombreDisponible.set(null); // Si es el nombre original, no mostrar error de disponibilidad
        this.checkingNombre.set(false);
        const nombreControl = this.atributoForm.get('nombre');
        if (nombreControl?.hasError('nombreNoDisponible')) {
          delete nombreControl.errors?.['nombreNoDisponible'];
          nombreControl.updateValueAndValidity();
        }
      } else {
        this.nombreChanged.next(nombre);
      }
    } else {
      this.nombreDisponible.set(null);
      this.checkingNombre.set(false);
    }
  }

  onSubmit(): void {
    if (!this.hasChanges()) {
      this.generalError.set('No hay cambios para guardar.');
      return;
    }

    if (this.atributoForm.invalid) {
      this.atributoForm.markAllAsTouched();
      this.generalError.set('Por favor, corrige los errores en el formulario.');
      return;
    }

    if (this.nombreDisponible() === false) {
      this.generalError.set(
        'El nombre del atributo ya está en uso. Por favor, elige otro.'
      );
      return;
    }

    this.isSubmitting.set(true);
    this.generalError.set(null);

    const id = this.atributoId();
    if (!id) {
      this.generalError.set('ID de atributo no encontrado.');
      this.isSubmitting.set(false);
      return;
    }

    const formData = this.atributoForm.value;

    this.atributosService
      .updateAtributo(id, formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isSubmitting.set(false);
          this.atributoOriginal.set(response.data); // Actualizar el original con la respuesta
          this.fillForm(response.data); // Resetear el form con los nuevos datos y marcar como pristine
          // this.toastService.showSuccess( // TODO
          //   `Atributo "${response.data.nombre}" actualizado con éxito.`
          // );
          console.log(
            `Atributo "${response.data.nombre}" actualizado con éxito.`
          );
          // Considerar no redirigir automáticamente, o dar opción al usuario
        },
        error: (err) => {
          this.isSubmitting.set(false);
          const message =
            err?.error?.message ||
            err?.message ||
            'Ocurrió un error al actualizar el atributo.';
          this.generalError.set(message);
          // this.toastService.showError(message); // TODO
          console.error('Error al actualizar atributo:', err);
        },
      });
  }

  resetForm(): void {
    const original = this.atributoOriginal();
    if (original) {
      this.fillForm(original);
      this.nombreDisponible.set(null); // Limpiar estado de validación de nombre
      this.generalError.set(null);
    }
  }

  getControlError(controlName: string, errorName: string): boolean {
    const control = this.atributoForm.get(controlName);
    return control ? control.hasError(errorName) && control.touched : false;
  }

  hasGeneralError(): boolean {
    return this.generalError() !== null;
  }
}
