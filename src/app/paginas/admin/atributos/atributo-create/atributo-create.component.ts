import {
  Component,
  inject,
  signal,
  WritableSignal,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs/operators';

import { AtributosService } from '../../../../core/services/atributos.service';
import { TipoAtributo } from '../../../../core/models/atributo.model';
// import { ToastService } from '../../../../core/services/toast.service'; // TODO: Implementar ToastService

@Component({
  selector: 'app-atributo-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './atributo-create.component.html',
  styleUrls: ['./atributo-create.component.css'],
})
export class AtributoCreateComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly atributosService = inject(AtributosService);
  private readonly router = inject(Router);
  // private readonly toastService = inject(ToastService); // TODO: Implementar ToastService

  readonly atributoForm: FormGroup;
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
    this.nombreChanged
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        tap(() => {
          this.checkingNombre.set(true);
          this.nombreDisponible.set(null); // Resetear mientras se verifica
        }),
        switchMap((nombre) =>
          this.atributosService.validateNombreDisponible(nombre)
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
            // Si estaba el error nombreNoDisponible y ahora está disponible, quitarlo
            const nombreControl = this.atributoForm.get('nombre');
            if (nombreControl?.hasError('nombreNoDisponible')) {
              delete nombreControl.errors?.['nombreNoDisponible'];
              nombreControl.updateValueAndValidity();
            }
          }
        },
        error: () => {
          this.nombreDisponible.set(false); // Asumir no disponible en caso de error
          this.checkingNombre.set(false);
          // Considerar mostrar un error más específico al usuario aquí
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onNombreChange(event: Event): void {
    const nombre = (event.target as HTMLInputElement).value.trim();
    if (nombre && nombre.length >= 3) {
      this.nombreChanged.next(nombre);
    } else {
      this.nombreDisponible.set(null); // Resetear si el nombre es muy corto o vacío
      this.checkingNombre.set(false);
      const nombreControl = this.atributoForm.get('nombre');
      if (nombreControl?.hasError('nombreNoDisponible')) {
        delete nombreControl.errors?.['nombreNoDisponible'];
        nombreControl.updateValueAndValidity();
      }
    }
  }

  onSubmit(): void {
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

    const formData = this.atributoForm.value;

    this.atributosService
      .createAtributo(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isSubmitting.set(false);
          // this.toastService.showSuccess( // TODO: Implementar ToastService
          //   `Atributo "${response.data.nombre}" creado con éxito.`
          // );
          console.log(`Atributo "${response.data.nombre}" creado con éxito.`);
          this.router.navigate(['/admin/atributos']);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          const message =
            err?.error?.message ||
            err?.message ||
            'Ocurrió un error al crear el atributo.';
          this.generalError.set(message);
          // this.toastService.showError(message); // TODO: Implementar ToastService
          console.error('Error al crear atributo:', err);
        },
      });
  }

  getControlError(controlName: string, errorName: string): boolean {
    const control = this.atributoForm.get(controlName);
    return control ? control.hasError(errorName) && control.touched : false;
  }

  hasGeneralError(): boolean {
    return this.generalError() !== null;
  }
}
