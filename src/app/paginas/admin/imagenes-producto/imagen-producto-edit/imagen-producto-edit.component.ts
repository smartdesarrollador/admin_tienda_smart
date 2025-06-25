import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { Subject, takeUntil, switchMap } from 'rxjs';

import { ImagenProductoService } from '../../../../core/services/imagen-producto.service';
import {
  ImagenProducto,
  UpdateImagenProductoRequest,
  TipoImagen,
  TIPOS_IMAGEN,
  IMAGEN_CONSTRAINTS,
} from '../../../../core/models/imagen-producto.interface';
import {
  imageFileValidator,
  validateImageDimensions,
  formatFileSize,
} from '../../../../core/utils/imagen-validators.util';

@Component({
  selector: 'app-imagen-producto-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgOptimizedImage, RouterModule],
  templateUrl: './imagen-producto-edit.component.html',
  styleUrl: './imagen-producto-edit.component.css',
})
export class ImagenProductoEditComponent implements OnInit, OnDestroy {
  private readonly imagenService = inject(ImagenProductoService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly destroy$ = new Subject<void>();

  // Signals del servicio
  readonly loading = this.imagenService.loading;
  readonly error = this.imagenService.error;
  readonly currentImagen = this.imagenService.currentImagen;

  // Signals locales
  private readonly _imagenId = signal<number | null>(null);
  private readonly _originalImagen = signal<ImagenProducto | null>(null);
  private readonly _selectedFile = signal<File | null>(null);
  private readonly _newPreviewUrl = signal<string | null>(null);
  private readonly _dragOver = signal<boolean>(false);
  private readonly _uploadProgress = signal<number>(0);
  private readonly _hasChanges = signal<boolean>(false);
  private readonly _showComparison = signal<boolean>(false);

  // Signals públicos readonly
  readonly imagenId = this._imagenId.asReadonly();
  readonly originalImagen = this._originalImagen.asReadonly();
  readonly selectedFile = this._selectedFile.asReadonly();
  readonly newPreviewUrl = this._newPreviewUrl.asReadonly();
  readonly dragOver = this._dragOver.asReadonly();
  readonly uploadProgress = this._uploadProgress.asReadonly();
  readonly hasChanges = this._hasChanges.asReadonly();
  readonly showComparison = this._showComparison.asReadonly();

  // Computed signals
  readonly hasNewFile = computed(() => this._selectedFile() !== null);
  readonly canSubmit = computed(
    () => this.editForm.valid && this.hasChanges() && !this.loading()
  );
  readonly fileSize = computed(() => {
    const file = this._selectedFile();
    return file ? formatFileSize(file.size) : '';
  });
  readonly isImageChanged = computed(() => this.hasNewFile());
  readonly formTitle = computed(() => {
    const imagen = this._originalImagen();
    return imagen ? `Editar Imagen #${imagen.id}` : 'Editar Imagen de Producto';
  });
  readonly breadcrumbText = computed(() => {
    const imagen = this._originalImagen();
    return imagen ? `Imagen #${imagen.id}` : 'Editar';
  });

  // Formulario reactivo
  editForm: FormGroup;

  // Opciones para selects
  readonly tiposImagen = Object.entries(TIPOS_IMAGEN).map(([key, value]) => ({
    value: key as TipoImagen,
    label: value,
  }));

  // Constantes para validación
  readonly constraints = IMAGEN_CONSTRAINTS;

  constructor() {
    this.editForm = this.fb.group({
      alt: ['', [Validators.maxLength(255)]],
      orden: [1, [Validators.required, Validators.min(1), Validators.max(999)]],
      principal: [false],
      tipo: ['galeria', [Validators.required]],
    });

    // Effect para detectar cambios en el formulario
    effect(
      () => {
        const originalImagen = this._originalImagen();
        if (originalImagen) {
          const formValue = this.editForm.value;
          const hasFormChanges =
            formValue.alt !== (originalImagen.alt || '') ||
            formValue.orden !== originalImagen.orden ||
            formValue.principal !== originalImagen.principal ||
            formValue.tipo !== (originalImagen.tipo || 'galeria');

          const hasFileChanges = this.hasNewFile();
          this._hasChanges.set(hasFormChanges || hasFileChanges);
        }
      },
      { allowSignalWrites: true }
    );

    // Effect para limpiar preview cuando cambia el archivo
    effect(
      () => {
        const file = this._selectedFile();
        if (!file && this._newPreviewUrl()) {
          URL.revokeObjectURL(this._newPreviewUrl()!);
          this._newPreviewUrl.set(null);
        }
      },
      { allowSignalWrites: true }
    );
  }

  ngOnInit(): void {
    this.loadImagenFromRoute();
    this.setupFormChangeDetection();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    // Limpiar URLs de preview
    if (this._newPreviewUrl()) {
      URL.revokeObjectURL(this._newPreviewUrl()!);
    }
  }

  /**
   * Cargar imagen desde la ruta
   */
  private loadImagenFromRoute(): void {
    this.route.params
      .pipe(
        takeUntil(this.destroy$),
        switchMap((params) => {
          const id = +params['id'];
          this._imagenId.set(id);
          return this.imagenService.getImagenById(id);
        })
      )
      .subscribe({
        next: (imagen) => {
          this._originalImagen.set(imagen);
          this.populateForm(imagen);
        },
        error: (error) => {
          console.error('Error al cargar imagen:', error);
          this.router.navigate(['/admin/imagenes-producto']);
        },
      });
  }

  /**
   * Poblar formulario con datos de la imagen
   */
  private populateForm(imagen: ImagenProducto): void {
    this.editForm.patchValue({
      alt: imagen.alt || '',
      orden: imagen.orden,
      principal: imagen.principal,
      tipo: imagen.tipo || 'galeria',
    });

    // Marcar formulario como pristine después de cargar datos
    this.editForm.markAsPristine();
    this._hasChanges.set(false);
  }

  /**
   * Configurar detección de cambios en el formulario
   */
  private setupFormChangeDetection(): void {
    this.editForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      // Los cambios se detectan en el effect
    });
  }

  /**
   * Manejar selección de archivo
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  /**
   * Manejar drag over
   */
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this._dragOver.set(true);
  }

  /**
   * Manejar drag leave
   */
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this._dragOver.set(false);
  }

  /**
   * Manejar drop de archivo
   */
  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this._dragOver.set(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  /**
   * Procesar archivo seleccionado
   */
  private async handleFile(file: File): Promise<void> {
    // Validar archivo
    const validation = await this.validateFile(file);
    if (!validation.valid) {
      alert(validation.message);
      return;
    }

    this._selectedFile.set(file);
    this.createPreview(file);
  }

  /**
   * Validar archivo
   */
  private async validateFile(
    file: File
  ): Promise<{ valid: boolean; message: string }> {
    // Validar tipo
    if (!this.constraints.ALLOWED_TYPES.includes(file.type as any)) {
      return {
        valid: false,
        message: `Tipo de archivo no permitido. Use: ${this.constraints.ALLOWED_EXTENSIONS.join(
          ', '
        )}`,
      };
    }

    // Validar tamaño
    if (file.size > this.constraints.MAX_SIZE_BYTES) {
      return {
        valid: false,
        message: `El archivo es demasiado grande. Máximo ${this.constraints.MAX_SIZE_MB}MB`,
      };
    }

    // Validar dimensiones
    try {
      const dimensionsResult = await validateImageDimensions(file);
      if (!dimensionsResult.valid) {
        return {
          valid: false,
          message: dimensionsResult.message || 'Dimensiones no válidas',
        };
      }
    } catch (error) {
      return {
        valid: false,
        message: 'Error al validar las dimensiones de la imagen',
      };
    }

    return { valid: true, message: '' };
  }

  /**
   * Crear preview de la nueva imagen
   */
  private createPreview(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      this._newPreviewUrl.set(url);
      this._showComparison.set(true);
    };
    reader.readAsDataURL(file);
  }

  /**
   * Remover archivo seleccionado
   */
  removeFile(): void {
    if (this._newPreviewUrl()) {
      URL.revokeObjectURL(this._newPreviewUrl()!);
    }
    this._selectedFile.set(null);
    this._newPreviewUrl.set(null);
    this._showComparison.set(false);

    // Limpiar input file
    const fileInput = document.getElementById('imagen') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  /**
   * Alternar vista de comparación
   */
  toggleComparison(): void {
    this._showComparison.set(!this._showComparison());
  }

  /**
   * Enviar formulario
   */
  onSubmit(): void {
    if (!this.canSubmit()) {
      this.markFormGroupTouched();
      return;
    }

    const imagenId = this._imagenId();
    if (!imagenId) {
      alert('ID de imagen no válido');
      return;
    }

    const formValue = this.editForm.value;
    const request: UpdateImagenProductoRequest = {
      alt: formValue.alt || undefined,
      orden: +formValue.orden,
      principal: formValue.principal,
      tipo: formValue.tipo,
    };

    // Agregar archivo si se seleccionó uno nuevo
    const file = this._selectedFile();
    if (file) {
      request.imagen = file;
    }

    this._uploadProgress.set(0);

    this.imagenService.updateImagen(imagenId, request).subscribe({
      next: (imagen) => {
        this._uploadProgress.set(100);
        this._originalImagen.set(imagen);
        this.populateForm(imagen);
        this.removeFile();

        // Navegar de vuelta con mensaje de éxito
        this.router.navigate(['/admin/imagenes-producto'], {
          queryParams: { updated: imagen.id },
        });
      },
      error: (error) => {
        console.error('Error al actualizar imagen:', error);
        this._uploadProgress.set(0);
      },
    });
  }

  /**
   * Marcar todos los campos como touched
   */
  private markFormGroupTouched(): void {
    Object.keys(this.editForm.controls).forEach((key) => {
      this.editForm.get(key)?.markAsTouched();
    });
  }

  /**
   * Cancelar y volver
   */
  cancel(): void {
    if (this.hasChanges()) {
      if (
        confirm('¿Está seguro de que desea cancelar? Se perderán los cambios.')
      ) {
        this.goBack();
      }
    } else {
      this.goBack();
    }
  }

  /**
   * Volver a la lista
   */
  private goBack(): void {
    this.router.navigate(['/admin/imagenes-producto']);
  }

  /**
   * Obtener label del tipo de imagen
   */
  getTipoLabel(tipo: string): string {
    const tipoObj = this.tiposImagen.find((t) => t.value === tipo);
    return tipoObj ? tipoObj.label : '-';
  }

  /**
   * Obtener mensaje de error para un campo
   */
  getFieldError(fieldName: string): string {
    const field = this.editForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return 'Este campo es requerido';
      }
      if (field.errors['min']) {
        return `Valor mínimo: ${field.errors['min'].min}`;
      }
      if (field.errors['max']) {
        return `Valor máximo: ${field.errors['max'].max}`;
      }
      if (field.errors['maxlength']) {
        return `Máximo ${field.errors['maxlength'].requiredLength} caracteres`;
      }
    }
    return '';
  }

  /**
   * Verificar si un campo tiene error
   */
  hasFieldError(fieldName: string): boolean {
    const field = this.editForm.get(fieldName);
    return !!(field?.errors && field.touched);
  }

  /**
   * Limpiar errores del servicio
   */
  clearError(): void {
    this.imagenService.clearError();
  }

  /**
   * Formatear tamaño de archivo
   */
  formatFileSize(bytes: number): string {
    return formatFileSize(bytes);
  }
}
