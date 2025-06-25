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
import { Router, RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { VariacionProductoService } from '../../../../core/services/variacion-producto.service';
import { ProductoService } from '../../../../core/services/producto.service';
import {
  CreateVariacionProductoRequest,
  VariacionProductoFormData,
  Producto,
  Atributo,
  ValorAtributo,
} from '../../../../core/models';

@Component({
  selector: 'app-variacion-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './variacion-create.component.html',
  styleUrls: ['./variacion-create.component.css'],
})
export class VariacionCreateComponent implements OnInit {
  private readonly variacionService = inject(VariacionProductoService);
  private readonly productoService = inject(ProductoService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  // Signals para el estado del componente
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal(false);
  readonly showPreview = signal(false);
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
    this.loadProductos();
    this.loadAtributos();
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
        this.generateSKU();
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

    // Auto-generar SKU cuando cambia el producto
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
      if ((atributo as any).requerido) {
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

  private generateSKU(): void {
    const producto = this.selectedProducto();
    if (producto) {
      const timestamp = Date.now().toString().slice(-6);
      const sku = `${producto.sku}-VAR-${timestamp}`;
      this.variacionForm.patchValue({ sku });
    }
  }

  onSubmit(): void {
    if (this.variacionForm.valid) {
      this.createVariacion();
    } else {
      this.markFormGroupTouched();
    }
  }

  private createVariacion(): void {
    this.loading.set(true);
    this.error.set(null);

    const formData = this.buildCreateRequest();

    this.variacionService.createVariacion(formData).subscribe({
      next: (response) => {
        this.success.set(true);
        this.showSuccessMessage();
        setTimeout(() => {
          this.router.navigate(['/admin/variaciones-producto']);
        }, 2000);
      },
      error: (error) => {
        this.error.set(error.message || 'Error al crear la variación');
        this.loading.set(false);
      },
      complete: () => {
        this.loading.set(false);
      },
    });
  }

  private buildCreateRequest(): CreateVariacionProductoRequest {
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
    // Aquí podrías mostrar una notificación toast
    console.log('Variación creada exitosamente');
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
    this.variacionForm.reset();
    this.selectedProducto.set(null);
    this.error.set(null);
    this.success.set(false);
    this.initializeForm();
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
