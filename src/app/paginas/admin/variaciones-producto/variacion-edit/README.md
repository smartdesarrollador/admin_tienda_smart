# VariacionEditComponent

## Descripción

Componente Angular 17 standalone para editar variaciones de productos existentes en el panel administrativo. Utiliza Angular Signals para gestión reactiva del estado, Reactive Forms para validación y Tailwind CSS para los estilos. Incluye detección de cambios y vista previa en tiempo real.

## Características

### ✅ Funcionalidades Principales

- **Carga automática** de datos de la variación desde la URL
- **Formulario reactivo** con validaciones en tiempo real
- **Detección de cambios** para prevenir pérdida de datos
- **Gestión de precios** con cálculo automático de descuentos
- **Atributos dinámicos** según el producto seleccionado
- **Vista previa en tiempo real** de los cambios
- **Validaciones personalizadas** para precios y campos requeridos
- **Estados de carga y error** con feedback visual
- **Navegación con breadcrumbs** y información contextual

### ✅ Características Técnicas

- **Angular 17** con componente standalone
- **Angular Signals** para gestión reactiva del estado
- **Reactive Forms** con validaciones personalizadas
- **Tailwind CSS** para estilos responsivos
- **TypeScript** con tipado estricto
- **Effects** para reaccionar a cambios de estado
- **Route parameters** para obtener ID de variación

## Estructura de Archivos

```
variacion-edit/
├── variacion-edit.component.ts       # Lógica del componente
├── variacion-edit.component.html     # Template con Tailwind CSS
├── variacion-edit.component.css      # Estilos adicionales
└── README.md                         # Esta documentación
```

## Dependencias

### Servicios

- `VariacionProductoService` - Gestión de variaciones (CRUD)
- `ProductoService` - Datos de productos para selección

### Modelos/Interfaces

- `UpdateVariacionProductoRequest`
- `VariacionProductoFormData`
- `VariacionProductoInterface`
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
import { VariacionEditComponent } from "./variacion-edit/variacion-edit.component";
```

### En Template

```html
<app-variacion-edit></app-variacion-edit>
```

### En Rutas

```typescript
{
  path: 'variaciones-producto/edit/:id',
  component: VariacionEditComponent,
  data: {
    title: 'Editar Variación',
    breadcrumb: 'Editar'
  }
}
```

## Signals Utilizados

### Del Componente

```typescript
readonly loading = signal(false);
readonly loadingVariacion = signal(false);
readonly error = signal<string | null>(null);
readonly success = signal(false);
readonly showPreview = signal(true);
readonly variacionId = signal<number | null>(null);
readonly originalVariacion = signal<VariacionProductoInterface | null>(null);
readonly selectedProducto = signal<Producto | null>(null);
readonly productos = this.productoService.productos;
readonly atributos = signal<any[]>([]);
readonly valoresAtributos = signal<ValorAtributo[]>([]);
```

### Computados

```typescript
readonly isFormValid = computed(() => this.variacionForm?.valid ?? false);
readonly hasSelectedProducto = computed(() => this.selectedProducto() !== null);
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

## Funcionalidades Específicas de Edición

### 1. Carga de Variación

```typescript
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
```

### 2. Población del Formulario

```typescript
private populateForm(variacion: VariacionProductoInterface): void {
  // Buscar y establecer el producto
  const producto = this.productos().find(p => p.id === variacion.producto_id);
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
```

### 3. Detección de Cambios

```typescript
private hasFormChanges(): boolean {
  const original = this.originalVariacion();
  if (!original) return false;

  const formValue = this.variacionForm.value;

  return (
    original.producto_id !== parseInt(formValue.producto_id) ||
    original.sku !== formValue.sku ||
    original.precio !== parseFloat(formValue.precio) ||
    original.precio_oferta !== (formValue.precio_oferta ? parseFloat(formValue.precio_oferta) : null) ||
    original.stock !== parseInt(formValue.stock) ||
    original.activo !== formValue.activo ||
    JSON.stringify(original.atributos) !== JSON.stringify(formValue.atributos)
  );
}
```

### 4. Actualización de Variación

```typescript
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
```

### 5. Restablecimiento del Formulario

```typescript
resetForm(): void {
  const original = this.originalVariacion();
  if (original) {
    this.populateForm(original);
    this.error.set(null);
    this.success.set(false);
  }
}
```

## UI/UX con Tailwind CSS

### Layout Responsivo

- **Desktop**: Grid de 3 columnas (formulario 2/3, vista previa 1/3)
- **Tablet**: Grid adaptativo
- **Mobile**: Stack vertical

### Estados Visuales Específicos

#### Loading de Variación

```html
@if (loadingVariacion()) {
<div class="bg-white border-b border-gray-200">
  <div class="px-4 py-6 sm:px-6 lg:px-8">
    <div class="flex items-center justify-center">
      <svg class="animate-spin h-8 w-8 text-indigo-600">
        <!-- Spinner SVG -->
      </svg>
      <span class="ml-3 text-lg font-medium text-gray-900">Cargando variación...</span>
    </div>
  </div>
</div>
}
```

#### Indicador de Cambios

```html
@if (hasChanges()) {
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
  <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
    <!-- Warning icon -->
  </svg>
  Cambios sin guardar
</span>
}
```

#### Información de la Variación

```html
@if (originalVariacion()) {
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"> {{ originalVariacion()?.sku }} </span>
}
```

### Botones de Acción

- **Cancelar**: Navega de vuelta al listado
- **Restablecer**: Solo habilitado si hay cambios
- **Actualizar**: Solo habilitado si el formulario es válido y hay cambios

### Vista Previa Mejorada

- **Información original** vs **cambios pendientes**
- **Indicador visual** de cambios sin guardar
- **Cálculos en tiempo real** de descuentos

## Effects y Reactividad

### Effect para Producto Seleccionado

```typescript
effect(() => {
  const producto = this.selectedProducto();
  if (producto) {
    this.loadAtributosForProducto(producto.id);
  }
});
```

### Computed Signals Específicos

- **hasChanges**: Detecta si hay modificaciones pendientes
- **isFormValid**: Estado de validación del formulario
- **hasSelectedProducto**: Si hay un producto seleccionado
- **precioConDescuento**: Precio con descuento aplicado
- **descuentoPorcentaje**: Porcentaje de descuento calculado

## Métodos Principales

### Navegación y Estado

```typescript
goBack(): void {
  this.router.navigate(['/admin/variaciones-producto']);
}

togglePreview(): void {
  this.showPreview.set(!this.showPreview());
}
```

### Validación y Errores

```typescript
onSubmit(): void {
  if (this.variacionForm.valid && this.hasChanges()) {
    this.updateVariacion();
  } else if (!this.hasChanges()) {
    this.error.set('No hay cambios para guardar');
  } else {
    this.markFormGroupTouched();
  }
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

hasAtributosValues(): boolean {
  const value = this.atributosFormGroup.value;
  return value && Object.keys(value).length > 0;
}

getAtributosEntries(): Array<{key: string, value: any}> {
  const value = this.atributosFormGroup.value;
  if (!value) return [];
  return Object.entries(value).map(([key, value]) => ({key, value}));
}
```

## Optimizaciones

### Performance

- **OnPush change detection** (implícito con signals)
- **Computed signals** para cálculos derivados
- **Effects** para reacciones específicas
- **Lazy loading** de datos solo cuando es necesario

### UX/UI

- **Detección de cambios** para prevenir pérdida de datos
- **Validación en tiempo real** con feedback visual
- **Vista previa en tiempo real** para verificar cambios
- **Estados de carga** diferenciados (variación vs actualización)
- **Breadcrumbs** con información contextual
- **Indicadores visuales** de estado y cambios

## Configuración

### Inicialización

```typescript
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
```

### Effects Setup

```typescript
private setupFormEffects(): void {
  // Effect para producto seleccionado
  effect(() => {
    const producto = this.selectedProducto();
    if (producto) {
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

  // Detectar cambios en el producto
  this.variacionForm.get('producto_id')?.valueChanges.subscribe((productoId) => {
    if (productoId) {
      const producto = this.productos().find((p) => p.id === parseInt(productoId));
      this.selectedProducto.set(producto || null);
    }
  });
}
```

## Testing

### Unit Tests

```typescript
describe("VariacionEditComponent", () => {
  let component: VariacionEditComponent;
  let fixture: ComponentFixture<VariacionEditComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [VariacionEditComponent],
    });
    fixture = TestBed.createComponent(VariacionEditComponent);
    component = fixture.componentInstance;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should load variacion on init", () => {
    const mockVariacion = { id: 1, sku: "VAR-001", precio: 100 };
    spyOn(component["variacionService"], "getVariacion").and.returnValue(of({ data: mockVariacion }));

    component.ngOnInit();

    expect(component.originalVariacion()).toEqual(mockVariacion);
  });

  it("should detect changes correctly", () => {
    const mockVariacion = { id: 1, sku: "VAR-001", precio: 100 };
    component.originalVariacion.set(mockVariacion);
    component.variacionForm.patchValue({ precio: 150 });

    expect(component.hasChanges()).toBeTruthy();
  });

  it("should reset form to original values", () => {
    const mockVariacion = { id: 1, sku: "VAR-001", precio: 100 };
    component.originalVariacion.set(mockVariacion);
    component.variacionForm.patchValue({ precio: 150 });

    component.resetForm();

    expect(component.variacionForm.get("precio")?.value).toBe(100);
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
- ✅ Route parameters para navegación

### TypeScript

- ✅ Tipado estricto
- ✅ Readonly properties
- ✅ Interfaces bien definidas
- ✅ Computed signals
- ✅ Type guards para validaciones

### Forms

- ✅ Reactive Forms con validaciones
- ✅ Validaciones personalizadas
- ✅ Feedback visual de errores
- ✅ FormGroups y FormArrays dinámicos
- ✅ Detección de cambios

### UX/UI

- ✅ Loading states diferenciados
- ✅ Error handling robusto
- ✅ Responsive design
- ✅ Accessibility (ARIA labels)
- ✅ Vista previa en tiempo real
- ✅ Indicadores de cambios
- ✅ Navegación contextual

### Performance

- ✅ OnPush change detection (implícito)
- ✅ Computed signals para derivaciones
- ✅ Effects específicos
- ✅ Lazy loading de datos

## Diferencias con el Componente de Creación

### Funcionalidades Adicionales

1. **Carga de datos existentes** desde la API
2. **Detección de cambios** para prevenir pérdida de datos
3. **Restablecimiento** a valores originales
4. **Información contextual** en el header
5. **Estados de carga diferenciados**
6. **Validación de cambios** antes de guardar

### Comportamientos Diferentes

1. **Formulario pre-poblado** con datos existentes
2. **Botón de actualizar** en lugar de crear
3. **Navegación con ID** en la URL
4. **Vista previa** muestra cambios vs original
5. **Validaciones** incluyen comparación con datos originales

## Extensiones Futuras

### Posibles Mejoras

1. **Historial de cambios**: Tracking de modificaciones
2. **Comparación visual**: Diff de cambios lado a lado
3. **Autoguardado**: Guardado automático de borradores
4. **Validaciones de negocio**: Reglas específicas del dominio
5. **Notificaciones**: Alertas de cambios concurrentes
6. **Versionado**: Control de versiones de variaciones
7. **Auditoría**: Log de cambios realizados
8. **Rollback**: Deshacer cambios específicos

### Integraciones

1. **WebSockets**: Actualizaciones en tiempo real
2. **Optimistic updates**: Actualizaciones optimistas
3. **Conflict resolution**: Resolución de conflictos
4. **Backup automático**: Respaldo de cambios

## Troubleshooting

### Problemas Comunes

#### 1. Variación no carga

```typescript
// Verificar ID en la URL
console.log(this.variacionId());
console.log(this.route.snapshot.paramMap.get("id"));
```

#### 2. Cambios no se detectan

```typescript
// Verificar valores originales vs actuales
console.log("Original:", this.originalVariacion());
console.log("Form:", this.variacionForm.value);
console.log("Has changes:", this.hasChanges());
```

#### 3. Formulario no se pobla

```typescript
// Verificar población del formulario
console.log("Populating with:", variacion);
console.log("Form after patch:", this.variacionForm.value);
```

#### 4. Atributos no aparecen

```typescript
// Verificar atributos de la variación
console.log("Variacion atributos:", variacion.atributos);
console.log("Atributos disponibles:", this.atributos());
```

## Soporte

Para problemas o mejoras, consultar:

- Documentación del servicio: `VariacionProductoService`
- Interfaces: `variacion-producto.interface.ts`
- Componente de creación: `VariacionCreateComponent`
- Componente de listado: `VariacionListComponent`
