import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { catchError, tap, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

import { CuponesService } from '../../../../core/services/cupones.service';
import {
  CuponFormData,
  TipoCupon,
  ApiResponse,
  Cupon,
} from '../../../../core/models/cupon.model';

@Component({
  selector: 'app-cupon-edit',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './cupon-edit.component.html',
  styleUrls: ['./cupon-edit.component.css'],
})
export class CuponEditComponent implements OnInit {
  private cuponesService = inject(CuponesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  cuponForm!: FormGroup;
  isLoading = signal(false);
  error = signal<string | null>(null);
  isSubmitting = signal(false);
  cuponId = signal<number | null>(null);
  cuponOriginal = signal<Cupon | null>(null);

  tiposCupon: { value: TipoCupon; label: string; descripcion: string }[] = [
    {
      value: 'porcentaje',
      label: 'Porcentaje',
      descripcion: 'Descuento basado en porcentaje del total',
    },
    {
      value: 'fijo',
      label: 'Monto Fijo',
      descripcion: 'Descuento de cantidad fija en pesos',
    },
  ];

  ngOnInit(): void {
    this.initializeForm();
    this.loadCupon();
  }

  private initializeForm(): void {
    this.cuponForm = this.fb.group(
      {
        codigo: [
          '',
          [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(50),
            Validators.pattern(/^[A-Z0-9_-]+$/),
          ],
        ],
        descuento: [
          '',
          [Validators.required, Validators.min(0.01), Validators.max(99999.99)],
        ],
        tipo: ['porcentaje', [Validators.required]],
        fecha_inicio: ['', [Validators.required]],
        fecha_fin: ['', [Validators.required]],
        limite_uso: ['', [Validators.min(1)]],
        activo: [true],
        descripcion: ['', [Validators.maxLength(500)]],
      },
      { validators: this.dateRangeValidator }
    );

    // Validador personalizado para descuento según tipo
    this.cuponForm.get('tipo')?.valueChanges.subscribe(() => {
      this.updateDescuentoValidators();
    });
  }

  private loadCupon(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = params.get('id');
          if (!id || isNaN(Number(id))) {
            throw new Error('ID de cupón inválido');
          }
          this.cuponId.set(Number(id));
          return this.cuponesService.getCuponById(Number(id));
        }),
        tap((response: ApiResponse<Cupon>) => {
          this.cuponOriginal.set(response.data);
          this.populateForm(response.data);
          this.updateDescuentoValidators();
          this.isLoading.set(false);
        }),
        catchError((err) => {
          this.isLoading.set(false);
          this.error.set(err.message || 'Error al cargar el cupón');
          return of(null);
        })
      )
      .subscribe();
  }

  private populateForm(cupon: Cupon): void {
    this.cuponForm.patchValue({
      codigo: cupon.codigo,
      descuento: cupon.descuento,
      tipo: cupon.tipo,
      fecha_inicio: this.formatDateForInput(cupon.fecha_inicio),
      fecha_fin: this.formatDateForInput(cupon.fecha_fin),
      limite_uso: cupon.limite_uso || '',
      activo: cupon.activo,
      descripcion: cupon.descripcion || '',
    });
  }

  private formatDateForInput(dateString: string): string {
    // Convertir de formato de API (YYYY-MM-DD HH:mm:ss) a datetime-local (YYYY-MM-DDTHH:mm)
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  private dateRangeValidator(
    control: AbstractControl
  ): ValidationErrors | null {
    if (!(control instanceof FormGroup)) {
      return null;
    }

    const fechaInicio = control.get('fecha_inicio')?.value;
    const fechaFin = control.get('fecha_fin')?.value;

    if (!fechaInicio || !fechaFin) {
      return null;
    }

    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    if (fin <= inicio) {
      return { fechaFinInvalida: true };
    }

    return null;
  }

  private updateDescuentoValidators(): void {
    const descuentoControl = this.cuponForm.get('descuento');
    const tipo = this.cuponForm.get('tipo')?.value as TipoCupon;

    if (!descuentoControl) return;

    if (tipo === 'porcentaje') {
      descuentoControl.setValidators([
        Validators.required,
        Validators.min(0.01),
        Validators.max(100),
      ]);
    } else if (tipo === 'fijo') {
      descuentoControl.setValidators([
        Validators.required,
        Validators.min(0.01),
        Validators.max(99999.99),
      ]);
    }

    descuentoControl.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.cuponForm.invalid || !this.cuponId()) {
      this.markFormGroupTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.error.set(null);

    const formData = this.prepareFormData();

    this.cuponesService
      .updateCupon(this.cuponId()!, formData)
      .pipe(
        tap((response: ApiResponse<Cupon>) => {
          this.isSubmitting.set(false);
          // Navegar de vuelta a la lista con mensaje de éxito
          this.router.navigate(['/admin/cupones'], {
            state: { message: 'Cupón actualizado exitosamente' },
          });
        }),
        catchError((err) => {
          this.isSubmitting.set(false);
          this.error.set(err.message || 'Error al actualizar el cupón');
          return of(null);
        })
      )
      .subscribe();
  }

  private prepareFormData(): Partial<CuponFormData> {
    const formValue = this.cuponForm.value;
    const original = this.cuponOriginal();

    // Solo incluir campos que han cambiado para una actualización más eficiente
    const formData: Partial<CuponFormData> = {};

    if (formValue.codigo !== original?.codigo) {
      formData.codigo = formValue.codigo.toUpperCase().trim();
    }
    if (formValue.descuento !== original?.descuento) {
      formData.descuento = parseFloat(formValue.descuento);
    }
    if (formValue.tipo !== original?.tipo) {
      formData.tipo = formValue.tipo;
    }
    if (
      this.formatDateForAPI(formValue.fecha_inicio) !==
      this.formatDateForAPI(
        this.formatDateForInput(original?.fecha_inicio || '')
      )
    ) {
      formData.fecha_inicio = this.formatDateForAPI(formValue.fecha_inicio);
    }
    if (
      this.formatDateForAPI(formValue.fecha_fin) !==
      this.formatDateForAPI(this.formatDateForInput(original?.fecha_fin || ''))
    ) {
      formData.fecha_fin = this.formatDateForAPI(formValue.fecha_fin);
    }
    if ((formValue.limite_uso || null) !== original?.limite_uso) {
      formData.limite_uso = formValue.limite_uso
        ? parseInt(formValue.limite_uso)
        : null;
    }
    if (formValue.activo !== original?.activo) {
      formData.activo = formValue.activo;
    }
    if ((formValue.descripcion?.trim() || null) !== original?.descripcion) {
      formData.descripcion = formValue.descripcion?.trim() || null;
    }

    return formData;
  }

  private formatDateForAPI(dateTimeLocal: string): string {
    // Convertir de formato datetime-local a formato que espera la API
    const date = new Date(dateTimeLocal);
    return date.toISOString().slice(0, 19).replace('T', ' ');
  }

  private markFormGroupTouched(): void {
    Object.keys(this.cuponForm.controls).forEach((key) => {
      const control = this.cuponForm.get(key);
      control?.markAsTouched();
    });
  }

  onCancel(): void {
    this.router.navigate(['/admin/cupones']);
  }

  // Helper methods para el template
  isFieldInvalid(fieldName: string): boolean {
    const field = this.cuponForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.cuponForm.get(fieldName);
    if (!field || !field.errors) return '';

    const errors = field.errors;

    if (errors['required'])
      return `${this.getFieldLabel(fieldName)} es requerido`;
    if (errors['minlength'])
      return `${this.getFieldLabel(fieldName)} debe tener al menos ${
        errors['minlength'].requiredLength
      } caracteres`;
    if (errors['maxlength'])
      return `${this.getFieldLabel(fieldName)} no puede tener más de ${
        errors['maxlength'].requiredLength
      } caracteres`;
    if (errors['min'])
      return `${this.getFieldLabel(fieldName)} debe ser mayor a ${
        errors['min'].min
      }`;
    if (errors['max'])
      return `${this.getFieldLabel(fieldName)} debe ser menor a ${
        errors['max'].max
      }`;
    if (errors['pattern'])
      return `${this.getFieldLabel(
        fieldName
      )} solo puede contener letras mayúsculas, números, guiones y guiones bajos`;

    return 'Campo inválido';
  }

  getFormErrors(): string[] {
    const errors: string[] = [];

    if (this.cuponForm.errors?.['fechaFinInvalida']) {
      errors.push('La fecha de fin debe ser posterior a la fecha de inicio');
    }

    return errors;
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      codigo: 'Código',
      descuento: 'Descuento',
      tipo: 'Tipo',
      fecha_inicio: 'Fecha de inicio',
      fecha_fin: 'Fecha de fin',
      limite_uso: 'Límite de uso',
      descripcion: 'Descripción',
    };
    return labels[fieldName] || fieldName;
  }

  generateCouponCode(): void {
    const prefixes = ['DESCUENTO', 'OFERTA', 'PROMO', 'AHORRO'];
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomNumber = Math.floor(Math.random() * 900) + 100;
    const generatedCode = `${randomPrefix}${randomNumber}`;

    this.cuponForm.patchValue({ codigo: generatedCode });
  }

  hasUnsavedChanges(): boolean {
    if (!this.cuponOriginal() || this.cuponForm.pristine) {
      return false;
    }

    const formData = this.prepareFormData();
    return Object.keys(formData).length > 0;
  }
}
