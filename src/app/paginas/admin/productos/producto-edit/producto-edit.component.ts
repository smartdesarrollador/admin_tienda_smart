import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  effect,
  DestroyRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { environment } from '../../../../../environments/environment';

import { ProductoService } from '../../../../core/services/producto.service';
import { CategoriasService } from '../../../../core/services/categorias.service';
import {
  Producto,
  UpdateProductoRequest,
} from '../../../../core/models/producto.interface';
import { Categoria } from '../../../../core/models/categoria.model';

@Component({
  selector: 'app-producto-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './producto-edit.component.html',
  styleUrl: './producto-edit.component.css',
})
export class ProductoEditComponent implements OnInit {
  private readonly productoService = inject(ProductoService);
  private readonly categoriasService = inject(CategoriasService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  // URL base para preview de imágenes
  readonly urlDominioApi = environment.urlDominioApi;

  // Signals del servicio
  loading = this.productoService.loading;
  error = this.productoService.error;
  currentProducto = this.productoService.currentProducto;

  // Signals locales
  productoId = signal<number | null>(null);
  selectedFile = signal<File | null>(null);
  imagePreview = signal<string | null>(null);
  showAdvanced = signal(false);
  categorias = signal<Categoria[]>([]);
  loadingCategorias = signal(false);
  hasChanges = signal(false);
  originalFormValue = signal<any>(null);

  // Formulario reactivo
  productoForm: FormGroup;

  // Opciones para selects
  readonly idiomasOptions = [
    { value: 'es', label: 'Español' },
    { value: 'en', label: 'Inglés' },
  ];

  readonly monedasOptions = [
    { value: 'USD', label: 'Dólares (USD)' },
    { value: 'EUR', label: 'Euros (EUR)' },
    { value: 'COP', label: 'Pesos Colombianos (COP)' },
    { value: 'MXN', label: 'Pesos Mexicanos (MXN)' },
    { value: 'ARS', label: 'Pesos Argentinos (ARS)' },
  ];

  // Computed signals
  isFormValid = computed(() => this.productoForm?.valid ?? false);
  hasImageSelected = computed(() => this.selectedFile() !== null);
  canSave = computed(() => this.isFormValid() && this.hasChanges());
  currentImageUrl = computed(() => {
    const producto = this.currentProducto();
    if (this.imagePreview()) {
      return this.imagePreview();
    }
    if (producto?.imagen_principal) {
      return producto.imagen_principal;
    }
    return null;
  });

  constructor() {
    // Inicializar formulario
    this.productoForm = this.fb.group({
      // Campos obligatorios
      nombre: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(255),
        ],
      ],
      precio: [0, [Validators.required, Validators.min(0.01)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      categoria_id: ['', [Validators.required]],

      // Campos opcionales básicos
      descripcion: ['', [Validators.maxLength(1000)]],
      precio_oferta: [null, [Validators.min(0)]],
      sku: ['', [Validators.maxLength(100)]],
      codigo_barras: ['', [Validators.maxLength(50)]],
      marca: ['', [Validators.maxLength(100)]],
      modelo: ['', [Validators.maxLength(100)]],
      garantia: ['', [Validators.maxLength(255)]],

      // Estados
      destacado: [false],
      activo: [true],

      // Campos avanzados
      meta_title: ['', [Validators.maxLength(255)]],
      meta_description: ['', [Validators.maxLength(500)]],
      idioma: ['es'],
      moneda: ['USD'],
    });

    // Suscribirse a cambios del formulario usando takeUntilDestroyed
    this.productoForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.checkForChanges();
      });

    // Effect para validar precio de oferta
    effect(() => {
      const precio = this.productoForm?.get('precio')?.value;
      const precioOferta = this.productoForm?.get('precio_oferta')?.value;

      if (precio && precioOferta && precioOferta >= precio) {
        this.productoForm?.get('precio_oferta')?.setErrors({
          precioOfertaMayor: true,
        });
      }
    });

    // Effect para cargar producto cuando cambia el ID
    effect(
      () => {
        const id = this.productoId();
        if (id) {
          this.loadProducto(id);
        }
      },
      { allowSignalWrites: true }
    );
  }

  ngOnInit(): void {
    // Obtener ID del producto desde la ruta
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.productoId.set(parseInt(id, 10));
    } else {
      this.router.navigate(['/admin/productos']);
    }

    this.loadCategorias();
  }

  /**
   * Verificar cambios en el formulario
   */
  private checkForChanges(): void {
    const originalValue = this.originalFormValue();
    if (originalValue && this.productoForm.value) {
      const currentValue = this.productoForm.value;

      // Comparar cada campo por separado para mayor precisión
      let hasFormChanges = false;
      for (const key in originalValue) {
        if (originalValue[key] !== currentValue[key]) {
          hasFormChanges = true;
          break;
        }
      }

      const hasImageChanges = this.selectedFile() !== null;
      this.hasChanges.set(hasFormChanges || hasImageChanges);

      // Debug log para ayudar a diagnosticar
      console.log('Verificando cambios:', {
        hasFormChanges,
        hasImageChanges,
        originalValue,
        currentValue,
        totalChanges: hasFormChanges || hasImageChanges,
      });
    } else {
      // Si no hay valor original, considerar que hay cambios si el form es válido
      this.hasChanges.set(this.productoForm.valid);
    }
  }

  /**
   * Cargar producto por ID
   */
  loadProducto(id: number): void {
    this.productoService.getProducto(id).subscribe({
      next: (response) => {
        const producto = response.data;
        this.populateForm(producto);
      },
      error: (error) => {
        console.error('Error al cargar producto:', error);
        this.router.navigate(['/admin/productos']);
      },
    });
  }

  /**
   * Poblar formulario con datos del producto
   */
  populateForm(producto: Producto): void {
    const formValue = {
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      precio: producto.precio,
      precio_oferta: producto.precio_oferta,
      stock: producto.stock,
      categoria_id: producto.categoria_id,
      sku: producto.sku || '',
      codigo_barras: producto.codigo_barras || '',
      marca: producto.marca || '',
      modelo: producto.modelo || '',
      garantia: producto.garantia || '',
      destacado: producto.destacado,
      activo: producto.activo,
      meta_title: producto.meta_title || '',
      meta_description: producto.meta_description || '',
      idioma: producto.idioma,
      moneda: producto.moneda,
    };

    this.productoForm.patchValue(formValue);
    this.originalFormValue.set({ ...formValue });

    // Resetear estado de cambios
    this.hasChanges.set(false);
    this.selectedFile.set(null);
    this.imagePreview.set(null);
  }

  /**
   * Cargar categorías disponibles
   */
  loadCategorias(): void {
    this.loadingCategorias.set(true);

    this.categoriasService.getCategorias({ activo: true }).subscribe({
      next: (response) => {
        console.log('Categorías cargadas para edición:', response.data);
        this.categorias.set(response.data);
        this.loadingCategorias.set(false);
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
        this.loadingCategorias.set(false);
        // En caso de error, usar categorías vacías
        this.categorias.set([]);
      },
    });
  }

  /**
   * Manejar selección de archivo de imagen
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen válido');
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('El archivo es demasiado grande. Máximo 5MB');
        return;
      }

      this.selectedFile.set(file);

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Verificar cambios después de seleccionar archivo
      this.checkForChanges();
    }
  }

  /**
   * Remover imagen seleccionada
   */
  removeImage(): void {
    this.selectedFile.set(null);
    this.imagePreview.set(null);

    // Limpiar input file
    const fileInput = document.getElementById(
      'imagen_principal'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }

    // Verificar cambios después de remover imagen
    this.checkForChanges();
  }

  /**
   * Eliminar imagen principal del producto
   */
  deleteCurrentImage(): void {
    const id = this.productoId();
    if (
      id &&
      confirm('¿Estás seguro de que quieres eliminar la imagen actual?')
    ) {
      this.productoService.removeImagenPrincipal(id).subscribe({
        next: () => {
          // La imagen se eliminó del servidor, actualizar vista
          this.loadProducto(id);
        },
        error: (error) => {
          console.error('Error al eliminar imagen:', error);
        },
      });
    }
  }

  /**
   * Generar SKU automático basado en nombre
   */
  generateSku(): void {
    const nombre = this.productoForm.get('nombre')?.value;
    if (nombre) {
      const sku =
        nombre
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '')
          .substring(0, 20) +
        '-' +
        Date.now().toString().slice(-4);

      this.productoForm.patchValue({ sku });
    }
  }

  /**
   * Enviar formulario
   */
  onSubmit(): void {
    if (this.productoForm.valid && this.productoId()) {
      const formData = this.buildUpdateRequest();

      this.productoService
        .updateProducto(this.productoId()!, formData)
        .subscribe({
          next: (response) => {
            console.log('Producto actualizado exitosamente:', response);
            this.router.navigate(['/admin/productos']);
          },
          error: (error) => {
            console.error('Error al actualizar producto:', error);
          },
        });
    } else {
      this.markFormGroupTouched();
    }
  }

  /**
   * Construir objeto de request para actualización
   */
  private buildUpdateRequest(): UpdateProductoRequest {
    const formValue = this.productoForm.value;
    const request: UpdateProductoRequest = {};

    // Solo incluir campos que han cambiado
    const originalValue = this.originalFormValue();
    Object.keys(formValue).forEach((key) => {
      if (formValue[key] !== originalValue[key]) {
        switch (key) {
          case 'precio':
          case 'precio_oferta':
            if (formValue[key] !== null) {
              (request as any)[key] = parseFloat(formValue[key]);
            }
            break;
          case 'stock':
          case 'categoria_id':
            (request as any)[key] = parseInt(formValue[key]);
            break;
          default:
            (request as any)[key] = formValue[key] || undefined;
        }
      }
    });

    // Agregar imagen si está seleccionada
    if (this.selectedFile()) {
      request.imagen_principal = this.selectedFile()!;
    }

    return request;
  }

  /**
   * Marcar todos los campos como touched para mostrar errores
   */
  private markFormGroupTouched(): void {
    Object.keys(this.productoForm.controls).forEach((key) => {
      const control = this.productoForm.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Verificar si un campo tiene errores y ha sido touched
   */
  hasFieldError(fieldName: string): boolean {
    const field = this.productoForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  /**
   * Obtener mensaje de error para un campo
   */
  getFieldError(fieldName: string): string {
    const field = this.productoForm.get(fieldName);
    if (field && field.errors && field.touched) {
      const errors = field.errors;

      if (errors['required']) return `${fieldName} es requerido`;
      if (errors['minlength'])
        return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
      if (errors['maxlength'])
        return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
      if (errors['min']) return `Valor mínimo: ${errors['min'].min}`;
      if (errors['precioOfertaMayor'])
        return 'El precio de oferta debe ser menor al precio normal';
    }
    return '';
  }

  /**
   * Cancelar y volver a la lista
   */
  cancel(): void {
    if (this.hasChanges()) {
      if (
        confirm(
          'Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?'
        )
      ) {
        this.router.navigate(['/admin/productos']);
      }
    } else {
      this.router.navigate(['/admin/productos']);
    }
  }

  /**
   * Resetear formulario a valores originales
   */
  resetForm(): void {
    const originalValue = this.originalFormValue();
    if (originalValue) {
      this.productoForm.patchValue(originalValue);
      this.removeImage();
      this.hasChanges.set(false);
    }
  }

  /**
   * Alternar estado destacado
   */
  toggleDestacado(): void {
    const id = this.productoId();
    if (id) {
      this.productoService.toggleDestacado(id).subscribe({
        next: (response) => {
          this.populateForm(response.data);
        },
        error: (error) => {
          console.error('Error al cambiar estado destacado:', error);
        },
      });
    }
  }

  /**
   * Alternar estado activo
   */
  toggleActivo(): void {
    const id = this.productoId();
    if (id) {
      this.productoService.toggleActivo(id).subscribe({
        next: (response) => {
          this.populateForm(response.data);
        },
        error: (error) => {
          console.error('Error al cambiar estado activo:', error);
        },
      });
    }
  }

  /**
   * Método de depuración para diagnosticar el estado del formulario
   */
  debugFormState(): void {
    console.log('=== DEBUG FORM STATE ===');
    console.log('Form valid:', this.isFormValid);
    console.log('Has changes:', this.hasChanges());
    console.log('Can save:', this.canSave);
    console.log('Loading:', this.loading());
    console.log('Form value:', this.productoForm.value);
    console.log('Original value:', this.originalFormValue());
    console.log('Selected file:', this.selectedFile());
    console.log('Form errors:', this.getFormErrors());
    console.log('========================');
  }

  /**
   * Obtener todos los errores del formulario
   */
  private getFormErrors(): any {
    let formErrors: any = {};

    Object.keys(this.productoForm.controls).forEach((key) => {
      const controlErrors = this.productoForm.get(key)?.errors;
      if (controlErrors) {
        formErrors[key] = controlErrors;
      }
    });

    return formErrors;
  }
}
