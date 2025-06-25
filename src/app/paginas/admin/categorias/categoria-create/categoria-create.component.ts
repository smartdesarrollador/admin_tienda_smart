import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

// Services y Models
import { CategoriasService } from '../../../../core/services/categorias.service';
import { AuthService } from '../../../../core/auth/services/auth.service';
import {
  CategoriaFormData,
  Categoria,
} from '../../../../core/models/categoria.model';

@Component({
  selector: 'app-categoria-create',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './categoria-create.component.html',
  styleUrls: ['./categoria-create.component.css'],
})
export class CategoriaCreateComponent implements OnInit, OnDestroy {
  private readonly categoriasService = inject(CategoriasService);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();

  // Estados locales con signals
  readonly loading = signal(false);
  readonly submitting = signal(false);
  readonly categoriasPadre = signal<Categoria[]>([]);
  readonly nombreDisponible = signal<boolean | null>(null);
  readonly checkingNombre = signal(false);
  readonly selectedImage = signal<File | null>(null);
  readonly imagePreview = signal<string | null>(null);
  readonly uploadingImage = signal(false);

  // Formulario reactivo
  categoriaForm: FormGroup = this.fb.group({
    nombre: [
      '',
      [Validators.required, Validators.minLength(2), Validators.maxLength(100)],
    ],
    descripcion: ['', [Validators.maxLength(500)]],
    activo: [true],
    orden: [1, [Validators.required, Validators.min(1)]],
    categoria_padre_id: [null],
    meta_title: ['', [Validators.maxLength(60)]],
    meta_description: ['', [Validators.maxLength(160)]],
  });

  ngOnInit(): void {
    this.loadCategoriasPadre();
    this.setupNombreValidation();
    this.calculateNextOrder();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Cargar categorías padre para el selector
   */
  private loadCategoriasPadre(): void {
    this.loading.set(true);
    this.categoriasService.getCategoriasPrincipales().subscribe({
      next: (response) => {
        this.categoriasPadre.set(response.data);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar categorías padre:', error);
        this.loading.set(false);
      },
    });
  }

  /**
   * Configurar validación de nombre en tiempo real
   */
  private setupNombreValidation(): void {
    this.categoriaForm
      .get('nombre')
      ?.valueChanges.pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((nombre) => {
        if (nombre && nombre.length >= 2) {
          this.checkNombreDisponible(nombre);
        } else {
          this.nombreDisponible.set(null);
        }
      });
  }

  /**
   * Verificar disponibilidad del nombre
   */
  private checkNombreDisponible(nombre: string): void {
    this.checkingNombre.set(true);
    this.categoriasService.validateNombreDisponible(nombre).subscribe({
      next: (result) => {
        this.nombreDisponible.set(result.available);
        this.checkingNombre.set(false);

        // Agregar error personalizado si no está disponible
        const nombreControl = this.categoriaForm.get('nombre');
        if (!result.available) {
          nombreControl?.setErrors({ nombreNoDisponible: true });
        } else if (nombreControl?.hasError('nombreNoDisponible')) {
          // Limpiar solo el error de disponibilidad
          const errors = nombreControl.errors;
          delete errors?.['nombreNoDisponible'];
          nombreControl.setErrors(
            Object.keys(errors || {}).length ? errors : null
          );
        }
      },
      error: () => {
        this.checkingNombre.set(false);
        this.nombreDisponible.set(null);
      },
    });
  }

  /**
   * Calcular el siguiente orden disponible
   */
  private calculateNextOrder(): void {
    this.categoriasService
      .getCategorias({ per_page: 1, sort_by: 'orden', sort_direction: 'desc' })
      .subscribe({
        next: (response) => {
          const ultimoOrden = response.data[0]?.orden || 0;
          this.categoriaForm.patchValue({ orden: ultimoOrden + 1 });
        },
        error: () => {
          // Si hay error, mantener el valor por defecto
        },
      });
  }

  /**
   * Manejar selección de imagen
   */
  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validar tipo de archivo
      if (!file.type.match(/image\/(jpeg|jpg|png|gif|svg|webp)/)) {
        alert(
          'Solo se permiten archivos de imagen (JPEG, PNG, GIF, SVG, WebP)'
        );
        input.value = '';
        return;
      }

      // Validar tamaño (máximo 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('La imagen no puede ser mayor a 2MB');
        input.value = '';
        return;
      }

      this.selectedImage.set(file);

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  /**
   * Eliminar imagen seleccionada
   */
  removeSelectedImage(): void {
    this.selectedImage.set(null);
    this.imagePreview.set(null);

    // Limpiar input file
    const fileInput = document.getElementById('imagen') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  /**
   * Enviar formulario
   */
  onSubmit(): void {
    // Verificar autenticación antes de proceder
    if (!this.authService.isAuthenticated()) {
      alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      this.router.navigate(['/auth/login']);
      return;
    }

    const token = this.authService.getToken();
    if (!token) {
      alert(
        'No se encontró token de autenticación. Por favor, inicia sesión nuevamente.'
      );
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: '/admin/categorias/create' },
      });
      return;
    }

    if (this.categoriaForm.valid && !this.submitting()) {
      this.submitting.set(true);

      // Preparar datos del formulario con limpieza adecuada
      const formValues = this.categoriaForm.value;
      const formData: CategoriaFormData = {
        nombre: formValues.nombre?.trim() || '',
        descripcion: formValues.descripcion?.trim() || undefined,
        activo: Boolean(formValues.activo),
        orden: Number(formValues.orden) || 1,
        categoria_padre_id: formValues.categoria_padre_id || null,
        meta_title: formValues.meta_title?.trim() || undefined,
        meta_description: formValues.meta_description?.trim() || undefined,
      };

      // Limpiar campos undefined para evitar envío de valores vacíos
      Object.keys(formData).forEach((key) => {
        if (formData[key as keyof CategoriaFormData] === undefined) {
          delete formData[key as keyof CategoriaFormData];
        }
      });

      console.log('Datos a enviar:', formData);
      if (this.selectedImage()) {
        console.log('Imagen seleccionada:', this.selectedImage()?.name);
      }

      this.categoriasService
        .createCategoria(formData, this.selectedImage() || undefined)
        .subscribe({
          next: (response) => {
            console.log('Categoría creada exitosamente:', response);
            this.router.navigate(['/admin/categorias']);
          },
          error: (error) => {
            console.error('Error al crear categoría:', error);
            this.submitting.set(false);

            // Manejar errores específicos del servidor
            alert(`Error al crear la categoría: ${error.message}`);
          },
        });
    } else {
      // Marcar todos los campos como tocados para mostrar errores
      this.markFormGroupTouched();

      // Mostrar mensaje específico sobre errores de validación
      if (!this.categoriaForm.valid) {
        const firstError = this.getFirstFormError();
        if (firstError) {
          alert(`Por favor corrige el siguiente error: ${firstError}`);
        }
      }
    }
  }

  /**
   * Marcar todos los campos como tocados
   */
  private markFormGroupTouched(): void {
    Object.keys(this.categoriaForm.controls).forEach((key) => {
      const control = this.categoriaForm.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Cancelar y volver a la lista
   */
  onCancel(): void {
    if (this.categoriaForm.dirty || this.selectedImage()) {
      if (
        confirm(
          '¿Estás seguro de que deseas cancelar? Se perderán todos los cambios.'
        )
      ) {
        this.router.navigate(['/admin/categorias']);
      }
    } else {
      this.router.navigate(['/admin/categorias']);
    }
  }

  /**
   * Resetear formulario
   */
  resetForm(): void {
    if (
      confirm(
        '¿Estás seguro de que deseas resetear el formulario? Se perderán todos los datos.'
      )
    ) {
      this.categoriaForm.reset({
        activo: true,
        orden: 1,
      });
      this.removeSelectedImage();
      this.nombreDisponible.set(null);
    }
  }

  /**
   * Obtener mensaje de error para un campo
   */
  getFieldError(fieldName: string): string {
    const field = this.categoriaForm.get(fieldName);
    if (field?.errors && field.touched) {
      const errors = field.errors;

      if (errors['required']) return `El campo ${fieldName} es requerido`;
      if (errors['minlength'])
        return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
      if (errors['maxlength'])
        return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
      if (errors['min']) return `El valor mínimo es ${errors['min'].min}`;
      if (errors['pattern'])
        return 'Formato inválido (debe ser una URL válida)';
      if (errors['nombreNoDisponible']) return 'Este nombre ya está en uso';
    }
    return '';
  }

  /**
   * Verificar si un campo tiene errores
   */
  hasFieldError(fieldName: string): boolean {
    const field = this.categoriaForm.get(fieldName);
    return !!(field?.errors && field.touched);
  }

  /**
   * Obtener clases CSS para un campo
   */
  getFieldClasses(fieldName: string): string {
    const baseClasses =
      'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors';
    const field = this.categoriaForm.get(fieldName);

    if (field?.errors && field.touched) {
      return `${baseClasses} border-red-300 dark:border-red-600`;
    }

    if (field?.valid && field.touched) {
      return `${baseClasses} border-green-300 dark:border-green-600`;
    }

    return `${baseClasses} border-gray-300 dark:border-gray-600`;
  }

  /**
   * Obtener clases para el indicador de nombre
   */
  getNombreIndicatorClasses(): string {
    if (this.checkingNombre()) {
      return 'text-yellow-600';
    }

    if (this.nombreDisponible() === true) {
      return 'text-green-600';
    }

    if (this.nombreDisponible() === false) {
      return 'text-red-600';
    }

    return 'text-gray-400';
  }

  /**
   * Manejar error de carga de imagen
   */
  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.style.display = 'none';
    }
  }

  /**
   * Obtener el primer error del formulario
   */
  private getFirstFormError(): string | null {
    // Revisar errores de cada campo del formulario
    const controlNames = Object.keys(this.categoriaForm.controls);

    for (const controlName of controlNames) {
      const control = this.categoriaForm.get(controlName);
      if (control?.errors && control.touched) {
        return this.getFieldError(controlName);
      }
    }

    // Si no hay errores específicos de campos, buscar errores del formulario completo
    const formErrors = this.categoriaForm.errors;
    if (formErrors && Object.keys(formErrors).length > 0) {
      const firstErrorKey = Object.keys(formErrors)[0];
      return `Error en el formulario: ${firstErrorKey}`;
    }

    return null;
  }
}
