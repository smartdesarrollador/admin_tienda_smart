import {
  Component,
  OnInit,
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

import { ImagenProductoService } from '../../../../core/services/imagen-producto.service';
import {
  CreateImagenProductoRequest,
  TipoImagen,
  TIPOS_IMAGEN,
  IMAGEN_CONSTRAINTS,
} from '../../../../core/models/imagen-producto.interface';
import {
  imageFileValidator,
  imageDimensionsValidator,
  imageTypeValidator,
  imageSizeValidator,
} from '../../../../core/utils/imagen-validators.util';

@Component({
  selector: 'app-imagen-producto-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgOptimizedImage, RouterModule],
  templateUrl: './imagen-producto-create.component.html',
  styleUrls: ['./imagen-producto-create.component.css'],
})
export class ImagenProductoCreateComponent implements OnInit {
  private readonly imagenService = inject(ImagenProductoService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  // Signals del servicio
  readonly loading = this.imagenService.loading;
  readonly error = this.imagenService.error;

  // Signals locales
  private readonly _selectedFile = signal<File | null>(null);
  private readonly _previewUrl = signal<string | null>(null);
  private readonly _dragOver = signal<boolean>(false);
  private readonly _uploadProgress = signal<number>(0);
  private readonly _showPreview = signal<boolean>(false);

  // Signals públicos readonly
  readonly selectedFile = this._selectedFile.asReadonly();
  readonly previewUrl = this._previewUrl.asReadonly();
  readonly dragOver = this._dragOver.asReadonly();
  readonly uploadProgress = this._uploadProgress.asReadonly();
  readonly showPreview = this._showPreview.asReadonly();

  // Computed signals
  readonly hasFile = computed(() => this._selectedFile() !== null);
  readonly canSubmit = computed(
    () => this.createForm.valid && this.hasFile() && !this.loading()
  );
  readonly fileSize = computed(() => {
    const file = this._selectedFile();
    return file ? this.formatFileSize(file.size) : '';
  });
  readonly fileDimensions = computed(() => {
    // Se calculará cuando se cargue la imagen
    return '';
  });

  // Formulario reactivo
  createForm: FormGroup;

  // Opciones para selects
  readonly tiposImagen = Object.entries(TIPOS_IMAGEN).map(([key, value]) => ({
    value: key as TipoImagen,
    label: value,
  }));

  // Constantes para validación
  readonly constraints = IMAGEN_CONSTRAINTS;

  // Parámetros de URL
  private productoId: number | null = null;
  private variacionId: number | null = null;

  constructor() {
    this.createForm = this.fb.group({
      producto_id: ['', [Validators.required, Validators.min(1)]],
      variacion_id: [''],
      alt: ['', [Validators.maxLength(255)]],
      orden: [1, [Validators.required, Validators.min(1), Validators.max(999)]],
      principal: [false],
      tipo: ['galeria', [Validators.required]],
    });

    // Effect para limpiar preview cuando cambia el archivo
    effect(() => {
      const file = this._selectedFile();
      if (!file && this._previewUrl()) {
        URL.revokeObjectURL(this._previewUrl()!);
        this._previewUrl.set(null);
        this._showPreview.set(false);
      }
    });
  }

  ngOnInit(): void {
    this.loadRouteParams();
    this.setupFormValidation();
  }

  /**
   * Cargar parámetros de la URL
   */
  private loadRouteParams(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['producto_id']) {
        this.productoId = +params['producto_id'];
        this.createForm.patchValue({ producto_id: this.productoId });
      }
      if (params['variacion_id']) {
        this.variacionId = +params['variacion_id'];
        this.createForm.patchValue({ variacion_id: this.variacionId });
      }
    });
  }

  /**
   * Configurar validación del formulario
   */
  private setupFormValidation(): void {
    // Validación condicional para variación
    this.createForm.get('variacion_id')?.valueChanges.subscribe((value) => {
      if (value) {
        this.createForm.get('variacion_id')?.setValidators([Validators.min(1)]);
      } else {
        this.createForm.get('variacion_id')?.clearValidators();
      }
      this.createForm.get('variacion_id')?.updateValueAndValidity();
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
  private handleFile(file: File): void {
    // Validar archivo
    const validation = this.validateFile(file);
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
  private validateFile(file: File): { valid: boolean; message: string } {
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

    return { valid: true, message: '' };
  }

  /**
   * Crear preview de la imagen
   */
  private createPreview(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      this._previewUrl.set(url);
      this._showPreview.set(true);

      // Obtener dimensiones
      this.getImageDimensions(url);
    };
    reader.readAsDataURL(file);
  }

  /**
   * Obtener dimensiones de la imagen
   */
  private getImageDimensions(url: string): void {
    const img = new Image();
    img.onload = () => {
      // Validar dimensiones
      if (
        img.width < this.constraints.MIN_WIDTH ||
        img.height < this.constraints.MIN_HEIGHT ||
        img.width > this.constraints.MAX_WIDTH ||
        img.height > this.constraints.MAX_HEIGHT
      ) {
        alert(
          `Dimensiones no válidas. Rango permitido: ${this.constraints.MIN_WIDTH}x${this.constraints.MIN_HEIGHT} - ${this.constraints.MAX_WIDTH}x${this.constraints.MAX_HEIGHT}px`
        );
        this.removeFile();
        return;
      }
    };
    img.src = url;
  }

  /**
   * Remover archivo seleccionado
   */
  removeFile(): void {
    if (this._previewUrl()) {
      URL.revokeObjectURL(this._previewUrl()!);
    }
    this._selectedFile.set(null);
    this._previewUrl.set(null);
    this._showPreview.set(false);

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
    if (!this.canSubmit()) {
      this.markFormGroupTouched();
      return;
    }

    const file = this._selectedFile();
    if (!file) {
      alert('Debe seleccionar una imagen');
      return;
    }

    const formValue = this.createForm.value;
    const request: CreateImagenProductoRequest = {
      imagen: file,
      producto_id: +formValue.producto_id,
      variacion_id: formValue.variacion_id
        ? +formValue.variacion_id
        : undefined,
      alt: formValue.alt || undefined,
      orden: +formValue.orden,
      principal: formValue.principal,
      tipo: formValue.tipo,
    };

    this._uploadProgress.set(0);

    this.imagenService.createImagen(request).subscribe({
      next: (imagen) => {
        this._uploadProgress.set(100);
        // Navegar a la lista o mostrar mensaje de éxito
        this.router.navigate(['/admin/imagenes-producto'], {
          queryParams: { created: imagen.id },
        });
      },
      error: (error) => {
        console.error('Error al crear imagen:', error);
        this._uploadProgress.set(0);
      },
    });
  }

  /**
   * Marcar todos los campos como touched
   */
  private markFormGroupTouched(): void {
    Object.keys(this.createForm.controls).forEach((key) => {
      this.createForm.get(key)?.markAsTouched();
    });
  }

  /**
   * Cancelar y volver
   */
  cancel(): void {
    if (this.hasFile() || this.createForm.dirty) {
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
   * Formatear tamaño de archivo
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
    const field = this.createForm.get(fieldName);
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
    const field = this.createForm.get(fieldName);
    return !!(field?.errors && field.touched);
  }

  /**
   * Limpiar errores del servicio
   */
  clearError(): void {
    this.imagenService.clearError();
  }
}
