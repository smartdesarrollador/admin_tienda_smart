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
import { Router, RouterModule } from '@angular/router';
import { environment } from '../../../../../environments/environment';

import { ProductoService } from '../../../../core/services/producto.service';
import { CategoriasService } from '../../../../core/services/categorias.service';
import { CreateProductoRequest } from '../../../../core/models/producto.interface';
import { Categoria } from '../../../../core/models/categoria.model';

@Component({
  selector: 'app-producto-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './producto-create.component.html',
  styleUrl: './producto-create.component.css',
})
export class ProductoCreateComponent implements OnInit {
  private readonly productoService = inject(ProductoService);
  private readonly categoriasService = inject(CategoriasService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  // URL base para preview de imágenes
  readonly urlDominioApi = environment.urlDominioApi;

  // Signals
  loading = this.productoService.loading;
  error = this.productoService.error;

  // Signals locales
  selectedFile = signal<File | null>(null);
  imagePreview = signal<string | null>(null);
  showAdvanced = signal(false);
  categorias = signal<Categoria[]>([]);
  loadingCategorias = signal(false);

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
  }

  ngOnInit(): void {
    this.loadCategorias();
  }

  /**
   * Cargar categorías disponibles
   */
  loadCategorias(): void {
    this.loadingCategorias.set(true);

    this.categoriasService.getCategorias({ activo: true }).subscribe({
      next: (response) => {
        console.log('Categorías cargadas:', response.data);
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
   * Generar slug automático basado en nombre
   */
  generateSlug(): void {
    const nombre = this.productoForm.get('nombre')?.value;
    if (nombre) {
      const slug = nombre
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      // El slug se manejará en el backend, pero podemos mostrarlo como preview
      console.log('Slug generado:', slug);
    }
  }

  /**
   * Enviar formulario
   */
  onSubmit(): void {
    if (this.productoForm.valid) {
      const formData = this.buildCreateRequest();

      this.productoService.createProducto(formData).subscribe({
        next: (response) => {
          console.log('Producto creado exitosamente:', response);
          this.router.navigate(['/admin/productos']);
        },
        error: (error) => {
          console.error('Error al crear producto:', error);
        },
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  /**
   * Construir objeto de request
   */
  private buildCreateRequest(): CreateProductoRequest {
    const formValue = this.productoForm.value;
    const request: CreateProductoRequest = {
      nombre: formValue.nombre,
      precio: parseFloat(formValue.precio),
      stock: parseInt(formValue.stock),
      categoria_id: parseInt(formValue.categoria_id),
      descripcion: formValue.descripcion || undefined,
      precio_oferta: formValue.precio_oferta
        ? parseFloat(formValue.precio_oferta)
        : undefined,
      sku: formValue.sku || undefined,
      codigo_barras: formValue.codigo_barras || undefined,
      marca: formValue.marca || undefined,
      modelo: formValue.modelo || undefined,
      garantia: formValue.garantia || undefined,
      destacado: formValue.destacado,
      activo: formValue.activo,
      meta_title: formValue.meta_title || undefined,
      meta_description: formValue.meta_description || undefined,
      idioma: formValue.idioma,
      moneda: formValue.moneda,
    };

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
    this.router.navigate(['/admin/productos']);
  }

  /**
   * Limpiar formulario
   */
  resetForm(): void {
    this.productoForm.reset({
      destacado: false,
      activo: true,
      idioma: 'es',
      moneda: 'USD',
    });
    this.removeImage();
  }
}
