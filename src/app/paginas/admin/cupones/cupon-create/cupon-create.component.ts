import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';

import { CuponesService } from '../../../../core/services/cupones.service';
import {
  CuponFormData,
  TipoCupon,
  ApiResponse,
  Cupon,
} from '../../../../core/models/cupon.model';

@Component({
  selector: 'app-cupon-create',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './cupon-create.component.html',
  styleUrls: ['./cupon-create.component.css'],
})
export class CuponCreateComponent implements OnInit {
  private cuponesService = inject(CuponesService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  cuponForm!: FormGroup;
  isLoading = signal(false);
  error = signal<string | null>(null);
  isSubmitting = signal(false);

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
  }

  private initializeForm(): void {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);

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
        fecha_inicio: [
          this.formatDateTimeLocal(tomorrow),
          [Validators.required],
        ],
        fecha_fin: [this.formatDateTimeLocal(nextWeek), [Validators.required]],
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

    this.updateDescuentoValidators();
  }

  private formatDateTimeLocal(date: Date): string {
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
    const now = new Date();

    if (inicio < now) {
      return { fechaInicioInvalida: true };
    }

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
    if (this.cuponForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.error.set(null);

    const formData = this.prepareFormData();

    this.cuponesService
      .createCupon(formData)
      .pipe(
        tap((response: ApiResponse<Cupon>) => {
          this.isSubmitting.set(false);
          // Navegar de vuelta a la lista con mensaje de éxito
          this.router.navigate(['/admin/cupones'], {
            state: { message: 'Cupón creado exitosamente' },
          });
        }),
        catchError((err) => {
          this.isSubmitting.set(false);
          this.error.set(err.message || 'Error al crear el cupón');
          return of(null);
        })
      )
      .subscribe();
  }

  private prepareFormData(): CuponFormData {
    const formValue = this.cuponForm.value;

    return {
      codigo: formValue.codigo.toUpperCase().trim(),
      descuento: parseFloat(formValue.descuento),
      tipo: formValue.tipo,
      fecha_inicio: this.formatDateForAPI(formValue.fecha_inicio),
      fecha_fin: this.formatDateForAPI(formValue.fecha_fin),
      limite_uso: formValue.limite_uso ? parseInt(formValue.limite_uso) : null,
      activo: formValue.activo,
      descripcion: formValue.descripcion?.trim() || null,
    };
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

    if (this.cuponForm.errors?.['fechaInicioInvalida']) {
      errors.push('La fecha de inicio debe ser posterior a la fecha actual');
    }
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
}
