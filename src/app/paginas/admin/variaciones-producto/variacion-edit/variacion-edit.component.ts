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
  FormArray,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

import { VariacionProductoService } from '../../../../core/services/variacion-producto.service';
import { ProductoService } from '../../../../core/services/producto.service';
import {
  UpdateVariacionProductoRequest,
  VariacionProductoFormData,
  VariacionProductoInterface,
  Producto,
  Atributo,
  ValorAtributo,
} from '../../../../core/models';

@Component({
  selector: 'app-variacion-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './variacion-edit.component.html',
  styleUrls: ['./variacion-edit.component.css'],
})
export class VariacionEditComponent implements OnInit {
  private readonly variacionService = inject(VariacionProductoService);
  private readonly productoService = inject(ProductoService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  // Signals para el estado del componente
  readonly loading = signal(false);
  readonly loadingVariacion = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal(false);
  readonly showPreview = signal(true);
  readonly variacionId = signal<number | null>(null);
  readonly originalVariacion = signal<VariacionProductoInterface | null>(null);
  readonly selectedProducto = signal<Producto | null>(null);

  // Signals para datos
  readonly productos = this.productoService.productos;
  readonly atributos = signal<any[]>([]);
  readonly valoresAtributos = signal<ValorAtributo[]>([]);

  // Formulario reactivo
  variacionForm!: FormGroup;

  // Computed signals
  readonly isFormValid = computed(() => this.variacionForm?.valid ?? false);
  readonly hasSelectedProducto = computed(
    () => this.selectedProducto() !== null
  );
  readonly hasChanges = computed(() => {
    if (!this.originalVariacion() || !this.variacionForm) return false;
    return this.hasFormChanges();
  });
  readonly precioConDescuento = computed(() => {
    const precio = this.variacionForm?.get('precio')?.value || 0;
    const precioOferta = this.variacionForm?.get('precio_oferta')?.value;
    return precioOferta && precioOferta < precio ? precioOferta : null;
  });
  readonly descuentoPorcentaje = computed(() => {
    const precio = this.variacionForm?.get('precio')?.value || 0;
    const precioOferta = this.precioConDescuento();
    if (precioOferta && precio > 0) {
      return ((precio - precioOferta) / precio) * 100;
    }
    return 0;
  });

  constructor() {
    this.initializeForm();
    this.setupFormEffects();
  }

  ngOnInit(): void {
    this.loadVariacionId();
    this.loadProductos();
    this.loadAtributos();
  }

  private loadVariacionId(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.variacionId.set(parseInt(id, 10));
      this.loadVariacion();
    } else {
      this.error.set('ID de variación no válido');
    }
  }

  private loadVariacion(): void {
    const id = this.variacionId();
    if (!id) return;

    this.loadingVariacion.set(true);
    this.error.set(null);

    this.variacionService.getVariacion(id).subscribe({
      next: (response) => {
        this.originalVariacion.set(response.data);
        this.populateForm(response.data);
        this.loadingVariacion.set(false);
      },
      error: (error) => {
        this.error.set(error.message || 'Error al cargar la variación');
        this.loadingVariacion.set(false);
      },
    });
  }

  private populateForm(variacion: VariacionProductoInterface): void {
    // Buscar y establecer el producto
    const producto = this.productos().find(
      (p) => p.id === variacion.producto_id
    );
    if (producto) {
      this.selectedProducto.set(producto);
    }

    // Poblar el formulario con los datos de la variación
    this.variacionForm.patchValue({
      producto_id: variacion.producto_id,
      sku: variacion.sku,
      precio: variacion.precio,
      precio_oferta: variacion.precio_oferta,
      stock: variacion.stock,
      activo: variacion.activo,
    });

    // Poblar atributos si existen
    if (variacion.atributos && typeof variacion.atributos === 'object') {
      this.setupAtributosForm();
      this.variacionForm.get('atributos')?.patchValue(variacion.atributos);
    }
  }

  private initializeForm(): void {
    this.variacionForm = this.fb.group({
      producto_id: ['', [Validators.required]],
      sku: ['', [Validators.required, Validators.minLength(3)]],
      precio: [0, [Validators.required, Validators.min(0.01)]],
      precio_oferta: [null, [Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      activo: [true],
      atributos: this.fb.group({}),
      valores_atributos: this.fb.array([]),
    });
  }

  private setupFormEffects(): void {
    // Effect para reaccionar a cambios en el producto seleccionado
    effect(() => {
      const producto = this.selectedProducto();
      if (producto) {
        this.loadAtributosForProducto(producto.id);
      }
    });

    // Configurar validación de precio de oferta
    this.variacionForm
      .get('precio_oferta')
      ?.valueChanges.subscribe((precioOferta) => {
        const precio = this.variacionForm.get('precio')?.value;
        if (precioOferta && precio && precioOferta >= precio) {
          this.variacionForm
            .get('precio_oferta')
            ?.setErrors({ invalidDiscount: true });
        }
      });

    // Detectar cambios en el producto
    this.variacionForm
      .get('producto_id')
      ?.valueChanges.subscribe((productoId) => {
        if (productoId) {
          const producto = this.productos().find(
            (p) => p.id === parseInt(productoId)
          );
          this.selectedProducto.set(producto || null);
        }
      });
  }

  private loadProductos(): void {
    this.productoService.loadProductos({ per_page: 100, activo: true });
  }

  private loadAtributos(): void {
    // Aquí cargarías los atributos desde un servicio
    // Por ahora simulamos algunos atributos básicos
    const atributosEjemplo = [
      {
        id: 1,
        nombre: 'Color',
        slug: 'color',
        tipo: 'color' as const,
        requerido: true,
        activo: true,
        orden: 1,
        created_at: '',
        updated_at: '',
      },
      {
        id: 2,
        nombre: 'Talla',
        slug: 'talla',
        tipo: 'texto' as const,
        requerido: true,
        activo: true,
        orden: 2,
        created_at: '',
        updated_at: '',
      },
    ];

    this.atributos.set(atributosEjemplo);
  }

  private loadAtributosForProducto(productoId: number): void {
    // Aquí cargarías los atributos específicos del producto
    // y sus valores disponibles
    this.setupAtributosForm();
  }

  private setupAtributosForm(): void {
    const atributosGroup = this.fb.group({});
    const valoresArray = this.fb.array([]);

    this.atributos().forEach((atributo) => {
      if (atributo.requerido) {
        atributosGroup.addControl(
          atributo.slug,
          this.fb.control('', [Validators.required])
        );
      } else {
        atributosGroup.addControl(atributo.slug, this.fb.control(''));
      }
    });

    this.variacionForm.setControl('atributos', atributosGroup);
    this.variacionForm.setControl('valores_atributos', valoresArray);
  }

  private hasFormChanges(): boolean {
    const original = this.originalVariacion();
    if (!original) return false;

    const formValue = this.variacionForm.value;

    return (
      original.producto_id !== parseInt(formValue.producto_id) ||
      original.sku !== formValue.sku ||
      original.precio !== parseFloat(formValue.precio) ||
      original.precio_oferta !==
        (formValue.precio_oferta
          ? parseFloat(formValue.precio_oferta)
          : null) ||
      original.stock !== parseInt(formValue.stock) ||
      original.activo !== formValue.activo ||
      JSON.stringify(original.atributos) !== JSON.stringify(formValue.atributos)
    );
  }

  onSubmit(): void {
    if (this.variacionForm.valid && this.hasChanges()) {
      this.updateVariacion();
    } else if (!this.hasChanges()) {
      this.error.set('No hay cambios para guardar');
    } else {
      this.markFormGroupTouched();
    }
  }

  private updateVariacion(): void {
    const id = this.variacionId();
    if (!id) return;

    this.loading.set(true);
    this.error.set(null);

    const formData = this.buildUpdateRequest();

    this.variacionService.updateVariacion(id, formData).subscribe({
      next: (response) => {
        this.success.set(true);
        this.originalVariacion.set(response.data);
        this.showSuccessMessage();
        setTimeout(() => {
          this.router.navigate(['/admin/variaciones-producto']);
        }, 2000);
      },
      error: (error) => {
        this.error.set(error.message || 'Error al actualizar la variación');
        this.loading.set(false);
      },
      complete: () => {
        this.loading.set(false);
      },
    });
  }

  private buildUpdateRequest(): UpdateVariacionProductoRequest {
    const formValue = this.variacionForm.value;

    return {
      producto_id: parseInt(formValue.producto_id),
      sku: formValue.sku,
      precio: parseFloat(formValue.precio),
      precio_oferta: formValue.precio_oferta
        ? parseFloat(formValue.precio_oferta)
        : null,
      stock: parseInt(formValue.stock),
      activo: formValue.activo,
      atributos: formValue.atributos,
      valores_atributos: formValue.valores_atributos,
    };
  }

  private markFormGroupTouched(): void {
    Object.keys(this.variacionForm.controls).forEach((key) => {
      const control = this.variacionForm.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched();
      }
    });
  }

  private showSuccessMessage(): void {
    console.log('Variación actualizada exitosamente');
  }

  // Métodos para el template
  isFieldInvalid(fieldName: string): boolean {
    const field = this.variacionForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.variacionForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${fieldName} es requerido`;
      if (field.errors['min'])
        return `Valor mínimo: ${field.errors['min'].min}`;
      if (field.errors['minlength'])
        return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
      if (field.errors['invalidDiscount'])
        return 'El precio de oferta debe ser menor al precio normal';
    }
    return '';
  }

  togglePreview(): void {
    this.showPreview.set(!this.showPreview());
  }

  resetForm(): void {
    const original = this.originalVariacion();
    if (original) {
      this.populateForm(original);
      this.error.set(null);
      this.success.set(false);
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/variaciones-producto']);
  }

  // Utilidades para el template
  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(price);
  }

  get atributosFormGroup(): FormGroup {
    return this.variacionForm.get('atributos') as FormGroup;
  }

  get valoresAtributosFormArray(): FormArray {
    return this.variacionForm.get('valores_atributos') as FormArray;
  }

  // Helper para el template
  hasAtributosValues(): boolean {
    const value = this.atributosFormGroup.value;
    return value && Object.keys(value).length > 0;
  }

  getAtributosEntries(): Array<{ key: string; value: any }> {
    const value = this.atributosFormGroup.value;
    if (!value) return [];
    return Object.entries(value).map(([key, value]) => ({ key, value }));
  }
}
