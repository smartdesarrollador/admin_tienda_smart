# VariacionCreateComponent

## Descripción

Componente Angular 17 standalone para crear nuevas variaciones de productos en el panel administrativo. Utiliza Angular Signals para gestión reactiva del estado, Reactive Forms para validación y Tailwind CSS para los estilos.

## Características

### ✅ Funcionalidades Principales

- **Formulario reactivo** con validaciones en tiempo real
- **Selección de producto** con auto-generación de SKU
- **Gestión de precios** con cálculo automático de descuentos
- **Atributos dinámicos** según el producto seleccionado
- **Vista previa en tiempo real** de la variación
- **Validaciones personalizadas** para precios y campos requeridos
- **Estados de carga y error** con feedback visual
- **Navegación con breadcrumbs**

### ✅ Características Técnicas

- **Angular 17** con componente standalone
- **Angular Signals** para gestión reactiva del estado
- **Reactive Forms** con validaciones personalizadas
- **Tailwind CSS** para estilos responsivos
- **TypeScript** con tipado estricto
- **Effects** para reaccionar a cambios de estado

## Estructura de Archivos

```
variacion-create/
├── variacion-create.component.ts     # Lógica del componente
├── variacion-create.component.html   # Template con Tailwind CSS
├── variacion-create.component.css    # Estilos adicionales
└── README.md                         # Esta documentación
```

## Dependencias

### Servicios

- `VariacionProductoService` - Gestión de variaciones
- `ProductoService` - Datos de productos para selección

### Modelos/Interfaces

- `CreateVariacionProductoRequest`
- `VariacionProductoFormData`
- `Producto`
- `Atributo`
- `ValorAtributo`

### Angular Modules

- `CommonModule`
- `ReactiveFormsModule`
- `RouterModule`

## Uso del Componente

### Importación

```typescript
import { VariacionCreateComponent } from "./variacion-create/variacion-create.component";
```

### En Template

```html
<app-variacion-create></app-variacion-create>
```

### En Rutas

```typescript
{
  path: 'variaciones-producto/create',
  component: VariacionCreateComponent,
  data: {
    title: 'Crear Variación',
    breadcrumb: 'Nueva Variación'
  }
}
```

## Signals Utilizados

### Del Componente

```typescript
readonly loading = signal(false);
readonly error = signal<string | null>(null);
readonly success = signal(false);
readonly showPreview = signal(false);
readonly selectedProducto = signal<Producto | null>(null);
readonly productos = this.productoService.productos;
readonly atributos = signal<any[]>([]);
readonly valoresAtributos = signal<ValorAtributo[]>([]);
```

### Computados

```typescript
readonly isFormValid = computed(() => this.variacionForm?.valid ?? false);
readonly hasSelectedProducto = computed(() => this.selectedProducto() !== null);
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
```

## Formulario Reactivo

### Estructura

```typescript
this.variacionForm = this.fb.group({
  producto_id: ["", [Validators.required]],
  sku: ["", [Validators.required, Validators.minLength(3)]],
  precio: [0, [Validators.required, Validators.min(0.01)]],
  precio_oferta: [null, [Validators.min(0)]],
  stock: [0, [Validators.required, Validators.min(0)]],
  activo: [true],
  atributos: this.fb.group({}),
  valores_atributos: this.fb.array([]),
});
```

### Validaciones

- **producto_id**: Requerido
- **sku**: Requerido, mínimo 3 caracteres
- **precio**: Requerido, mínimo 0.01
- **precio_oferta**: Opcional, mínimo 0, debe ser menor que precio
- **stock**: Requerido, mínimo 0
- **activo**: Boolean, por defecto true

### Validaciones Personalizadas

```typescript
// Validación de precio de oferta
this.variacionForm.get("precio_oferta")?.valueChanges.subscribe((precioOferta) => {
  const precio = this.variacionForm.get("precio")?.value;
  if (precioOferta && precio && precioOferta >= precio) {
    this.variacionForm.get("precio_oferta")?.setErrors({ invalidDiscount: true });
  }
});
```

## Funcionalidades

### 1. Selección de Producto

```typescript
// Auto-generar SKU cuando cambia el producto
this.variacionForm.get("producto_id")?.valueChanges.subscribe((productoId) => {
  if (productoId) {
    const producto = this.productos().find((p) => p.id === parseInt(productoId));
    this.selectedProducto.set(producto || null);
  }
});
```

### 2. Generación Automática de SKU

```typescript
private generateSKU(): void {
  const producto = this.selectedProducto();
  if (producto) {
    const timestamp = Date.now().toString().slice(-6);
    const sku = `${producto.sku}-VAR-${timestamp}`;
    this.variacionForm.patchValue({ sku });
  }
}
```

### 3. Gestión de Atributos Dinámicos

```typescript
private setupAtributosForm(): void {
  const atributosGroup = this.fb.group({});
  const valoresArray = this.fb.array([]);

  this.atributos().forEach(atributo => {
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
```

### 4. Creación de Variación

```typescript
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
```

## UI/UX con Tailwind CSS

### Layout Responsivo

- **Desktop**: Grid de 3 columnas (formulario 2/3, vista previa 1/3)
- **Tablet**: Grid adaptativo
- **Mobile**: Stack vertical

### Estados Visuales

#### Loading

```html
@if (loading()) {
<svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-white">
  <!-- Spinner SVG -->
</svg>
Creando... }
```

#### Success

```html
@if (success()) {
<div class="bg-green-50 border border-green-200 rounded-md p-4 m-4">
  <!-- Mensaje de éxito -->
</div>
}
```

#### Error

```html
@if (error()) {
<div class="bg-red-50 border border-red-200 rounded-md p-4 m-4">
  <!-- Mensaje de error -->
</div>
}
```

### Validación Visual

```html
[class]=" isFieldInvalid('precio') ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500' "
```

### Vista Previa

- **Sticky positioning** en desktop
- **Información en tiempo real** del formulario
- **Cálculos automáticos** de descuentos
- **Estados visuales** para activo/inactivo

## Effects y Reactividad

### Effect para Producto Seleccionado

```typescript
effect(() => {
  const producto = this.selectedProducto();
  if (producto) {
    this.generateSKU();
    this.loadAtributosForProducto(producto.id);
  }
});
```

### Computed Signals

- **isFormValid**: Estado de validación del formulario
- **hasSelectedProducto**: Si hay un producto seleccionado
- **precioConDescuento**: Precio con descuento aplicado
- **descuentoPorcentaje**: Porcentaje de descuento calculado

## Métodos Principales

### Validación

```typescript
isFieldInvalid(fieldName: string): boolean {
  const field = this.variacionForm.get(fieldName);
  return !!(field && field.invalid && (field.dirty || field.touched));
}

getFieldError(fieldName: string): string {
  const field = this.variacionForm.get(fieldName);
  if (field?.errors) {
    if (field.errors['required']) return `${fieldName} es requerido`;
    if (field.errors['min']) return `Valor mínimo: ${field.errors['min'].min}`;
    if (field.errors['minlength']) return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
    if (field.errors['invalidDiscount']) return 'El precio de oferta debe ser menor al precio normal';
  }
  return '';
}
```

### Navegación

```typescript
goBack(): void {
  this.router.navigate(['/admin/variaciones-producto']);
}

resetForm(): void {
  this.variacionForm.reset();
  this.selectedProducto.set(null);
  this.error.set(null);
  this.success.set(false);
  this.initializeForm();
}
```

### Utilidades

```typescript
formatPrice(price: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
  }).format(price);
}

togglePreview(): void {
  this.showPreview.set(!this.showPreview());
}
```

## Optimizaciones

### Performance

- **OnPush change detection** (implícito con signals)
- **Computed signals** para cálculos derivados
- **Effects** para reacciones específicas
- **Lazy loading** de atributos por producto

### UX/UI

- **Validación en tiempo real** con feedback visual
- **Auto-generación de SKU** para facilitar el proceso
- **Vista previa en tiempo real** para verificar datos
- **Estados de carga** para feedback del usuario
- **Breadcrumbs** para navegación clara

## Configuración

### Formulario Inicial

```typescript
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
```

### Effects Setup

```typescript
private setupFormEffects(): void {
  // Effect para producto seleccionado
  effect(() => {
    const producto = this.selectedProducto();
    if (producto) {
      this.generateSKU();
      this.loadAtributosForProducto(producto.id);
    }
  });

  // Validación de precio de oferta
  this.variacionForm.get('precio_oferta')?.valueChanges.subscribe((precioOferta) => {
    const precio = this.variacionForm.get('precio')?.value;
    if (precioOferta && precio && precioOferta >= precio) {
      this.variacionForm.get('precio_oferta')?.setErrors({ invalidDiscount: true });
    }
  });
}
```

## Testing

### Unit Tests

```typescript
describe("VariacionCreateComponent", () => {
  let component: VariacionCreateComponent;
  let fixture: ComponentFixture<VariacionCreateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [VariacionCreateComponent],
    });
    fixture = TestBed.createComponent(VariacionCreateComponent);
    component = fixture.componentInstance;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should initialize form correctly", () => {
    expect(component.variacionForm).toBeDefined();
    expect(component.variacionForm.get("producto_id")).toBeTruthy();
  });

  it("should generate SKU when product is selected", () => {
    const mockProducto = { id: 1, sku: "PROD-001", nombre: "Test" };
    component.selectedProducto.set(mockProducto);

    expect(component.variacionForm.get("sku")?.value).toContain("PROD-001-VAR-");
  });
});
```

## Mejores Prácticas Implementadas

### Angular 17

- ✅ Componente standalone
- ✅ Angular Signals para estado reactivo
- ✅ Control flow syntax (@if, @for)
- ✅ Inject function para DI
- ✅ Effects para reacciones específicas

### TypeScript

- ✅ Tipado estricto
- ✅ Readonly properties
- ✅ Interfaces bien definidas
- ✅ Computed signals

### Forms

- ✅ Reactive Forms con validaciones
- ✅ Validaciones personalizadas
- ✅ Feedback visual de errores
- ✅ FormGroups y FormArrays dinámicos

### UX/UI

- ✅ Loading states
- ✅ Error handling
- ✅ Responsive design
- ✅ Accessibility (ARIA labels)
- ✅ Vista previa en tiempo real

### Performance

- ✅ OnPush change detection (implícito)
- ✅ Computed signals para derivaciones
- ✅ Effects específicos
- ✅ Lazy loading de datos

## Extensiones Futuras

### Posibles Mejoras

1. **Subida de imágenes**: Gestión de imágenes para variaciones
2. **Validaciones avanzadas**: Validaciones de negocio más complejas
3. **Autocompletado**: Sugerencias para atributos
4. **Plantillas**: Plantillas predefinidas para variaciones
5. **Duplicación**: Crear variaciones basadas en existentes
6. **Importación masiva**: Carga de variaciones desde CSV/Excel
7. **Preview 3D**: Vista previa visual del producto
8. **Historial**: Tracking de cambios en variaciones

### Integraciones

1. **Notificaciones**: Toast notifications para feedback
2. **Analytics**: Tracking de uso del formulario
3. **Webhooks**: Notificaciones a sistemas externos
4. **API Caching**: Optimización de requests

## Troubleshooting

### Problemas Comunes

#### 1. Formulario no válido

```typescript
// Verificar validaciones
console.log(this.variacionForm.errors);
console.log(this.variacionForm.get("precio")?.errors);
```

#### 2. SKU no se genera

```typescript
// Verificar producto seleccionado
console.log(this.selectedProducto());
```

#### 3. Atributos no aparecen

```typescript
// Verificar carga de atributos
console.log(this.atributos());
```

#### 4. Vista previa no actualiza

```typescript
// Verificar signals
console.log(this.showPreview());
console.log(this.hasSelectedProducto());
```

## Soporte

Para problemas o mejoras, consultar:

- Documentación del servicio: `VariacionProductoService`
- Interfaces: `variacion-producto.interface.ts`
- Componente de listado: `VariacionListComponent`
