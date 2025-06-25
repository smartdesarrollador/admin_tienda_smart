# Guía de Uso - ProductoCreateComponent

## Integración en Rutas

### 1. Configuración de Rutas

```typescript
// app-routing.module.ts o en las rutas lazy-loaded
import { ProductoCreateComponent } from "./paginas/admin/productos/producto-create/producto-create.component";

const routes: Routes = [
  {
    path: "admin/productos",
    children: [
      {
        path: "",
        loadComponent: () => import("./paginas/admin/productos/producto-list/producto-list.component").then((m) => m.ProductoListComponent),
      },
      {
        path: "create",
        loadComponent: () => import("./paginas/admin/productos/producto-create/producto-create.component").then((m) => m.ProductoCreateComponent),
      },
    ],
  },
];
```

### 2. Navegación desde Lista de Productos

```typescript
// producto-list.component.ts
createProducto(): void {
  this.router.navigate(['/admin/productos/create']);
}
```

```html
<!-- producto-list.component.html -->
<button type="button" (click)="createProducto()" class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
  </svg>
  Nuevo Producto
</button>
```

## Ejemplos de Uso

### 1. Uso Básico

```html
<!-- Simplemente incluir el componente en la ruta -->
<app-producto-create></app-producto-create>
```

### 2. Con Datos Precargados (Futuro)

```typescript
// Si necesitas precargar datos específicos
export class ProductoCreateComponent implements OnInit {
  ngOnInit(): void {
    // Cargar categorías desde el backend
    this.loadCategorias();

    // Si vienes con datos de otro componente
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      const preloadData = navigation.extras.state;
      this.preloadForm(preloadData);
    }
  }

  private preloadForm(data: any): void {
    this.productoForm.patchValue({
      categoria_id: data.categoriaId,
      marca: data.marca,
      // ... otros campos
    });
  }
}
```

### 3. Navegación con Estado

```typescript
// Desde otro componente, pasar datos
navigateToCreate(categoriaId?: number): void {
  this.router.navigate(['/admin/productos/create'], {
    state: { categoriaId }
  });
}
```

## Personalización

### 1. Modificar Validaciones

```typescript
// En el constructor, personalizar validaciones
this.productoForm = this.fb.group({
  nombre: ['', [
    Validators.required,
    Validators.minLength(5), // Cambiar mínimo
    Validators.maxLength(200), // Cambiar máximo
    this.customNameValidator // Validador personalizado
  ]],
  // ... otros campos
});

// Validador personalizado
private customNameValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (value && value.includes('test')) {
    return { invalidName: true };
  }
  return null;
}
```

### 2. Agregar Campos Personalizados

```typescript
// Extender el formulario
this.productoForm.addControl("campo_personalizado", this.fb.control("", [Validators.required]));
```

```html
<!-- En el template -->
<div>
  <label for="campo_personalizado" class="block text-sm font-medium text-gray-700"> Campo Personalizado * </label>
  <input type="text" id="campo_personalizado" formControlName="campo_personalizado" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
</div>
```

### 3. Personalizar Categorías

```typescript
// Reemplazar el mock con servicio real
loadCategorias(): void {
  this.loadingCategorias.set(true);

  this.categoriaService.getCategorias().subscribe({
    next: (categorias) => {
      this.categorias.set(categorias.filter(c => c.activo));
      this.loadingCategorias.set(false);
    },
    error: (error) => {
      console.error('Error al cargar categorías:', error);
      this.loadingCategorias.set(false);
    }
  });
}
```

## Manejo de Estados

### 1. Estados de Loading

```typescript
// El componente maneja automáticamente los estados de loading
// Pero puedes personalizar el comportamiento

onSubmit(): void {
  if (this.productoForm.valid) {
    // El loading se activa automáticamente en el servicio
    const formData = this.buildCreateRequest();

    this.productoService.createProducto(formData).subscribe({
      next: (response) => {
        // Mostrar notificación de éxito
        this.showSuccessNotification('Producto creado exitosamente');
        this.router.navigate(['/admin/productos']);
      },
      error: (error) => {
        // El error se maneja automáticamente en el servicio
        // Pero puedes agregar lógica adicional
        this.showErrorNotification('Error al crear producto');
      }
    });
  }
}
```

### 2. Validación en Tiempo Real

```typescript
// El componente ya incluye validación en tiempo real
// Pero puedes agregar validaciones adicionales

constructor() {
  // ... inicialización del formulario

  // Validación personalizada para precio de oferta
  this.productoForm.get('precio')?.valueChanges.subscribe(precio => {
    const precioOferta = this.productoForm.get('precio_oferta')?.value;
    if (precioOferta && precioOferta >= precio) {
      this.productoForm.get('precio_oferta')?.setErrors({
        precioOfertaMayor: true
      });
    }
  });
}
```

## Integración con Servicios

### 1. Servicio de Categorías

```typescript
// categoria.service.ts
@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}`;

  getCategorias(): Observable<Categoria[]> {
    return this.http.get<{data: Categoria[]}>(`${this.baseUrl}/categorias`)
      .pipe(map(response => response.data));
  }
}

// En producto-create.component.ts
private readonly categoriaService = inject(CategoriaService);

loadCategorias(): void {
  this.loadingCategorias.set(true);

  this.categoriaService.getCategorias().subscribe({
    next: (categorias) => {
      this.categorias.set(categorias.filter(c => c.activo));
      this.loadingCategorias.set(false);
    },
    error: (error) => {
      console.error('Error al cargar categorías:', error);
      this.loadingCategorias.set(false);
    }
  });
}
```

### 2. Servicio de Notificaciones

```typescript
// notification.service.ts
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  showSuccess(message: string): void {
    // Implementar notificación de éxito
  }

  showError(message: string): void {
    // Implementar notificación de error
  }
}

// En producto-create.component.ts
private readonly notificationService = inject(NotificationService);

onSubmit(): void {
  if (this.productoForm.valid) {
    const formData = this.buildCreateRequest();

    this.productoService.createProducto(formData).subscribe({
      next: (response) => {
        this.notificationService.showSuccess('Producto creado exitosamente');
        this.router.navigate(['/admin/productos']);
      },
      error: (error) => {
        this.notificationService.showError('Error al crear producto');
      }
    });
  }
}
```

## Testing

### 1. Test Unitario Básico

```typescript
// producto-create.component.spec.ts
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { ProductoCreateComponent } from "./producto-create.component";
import { ProductoService } from "../../../../core/services/producto.service";

describe("ProductoCreateComponent", () => {
  let component: ProductoCreateComponent;
  let fixture: ComponentFixture<ProductoCreateComponent>;
  let mockProductoService: jasmine.SpyObj<ProductoService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const productoServiceSpy = jasmine.createSpyObj("ProductoService", ["createProducto"]);
    const routerSpy = jasmine.createSpyObj("Router", ["navigate"]);

    await TestBed.configureTestingModule({
      imports: [ProductoCreateComponent, ReactiveFormsModule],
      providers: [
        { provide: ProductoService, useValue: productoServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductoCreateComponent);
    component = fixture.componentInstance;
    mockProductoService = TestBed.inject(ProductoService) as jasmine.SpyObj<ProductoService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should initialize form with default values", () => {
    expect(component.productoForm.get("activo")?.value).toBe(true);
    expect(component.productoForm.get("destacado")?.value).toBe(false);
    expect(component.productoForm.get("idioma")?.value).toBe("es");
    expect(component.productoForm.get("moneda")?.value).toBe("PEN");
  });

  it("should validate required fields", () => {
    const form = component.productoForm;

    expect(form.get("nombre")?.hasError("required")).toBe(true);
    expect(form.get("precio")?.hasError("required")).toBe(true);
    expect(form.get("stock")?.hasError("required")).toBe(true);
    expect(form.get("categoria_id")?.hasError("required")).toBe(true);
  });
});
```

### 2. Test de Integración

```typescript
// producto-create.integration.spec.ts
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { ProductoCreateComponent } from "./producto-create.component";

describe("ProductoCreateComponent Integration", () => {
  let component: ProductoCreateComponent;
  let fixture: ComponentFixture<ProductoCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductoCreateComponent, HttpClientTestingModule, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductoCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should submit form with valid data", async () => {
    // Llenar formulario con datos válidos
    component.productoForm.patchValue({
      nombre: "Producto Test",
      precio: 100,
      stock: 10,
      categoria_id: 1,
    });

    // Simular envío
    spyOn(component, "onSubmit").and.callThrough();

    const submitButton = fixture.debugElement.nativeElement.querySelector('button[type="submit"]');
    submitButton.click();

    expect(component.onSubmit).toHaveBeenCalled();
  });
});
```

## Troubleshooting Común

### 1. Error: "Cannot read property of undefined"

```typescript
// Asegúrate de inicializar signals correctamente
selectedFile = signal<File | null>(null); // ✅ Correcto
// selectedFile: Signal<File | null>; // ❌ Incorrecto
```

### 2. Error: "FormControl not found"

```typescript
// Verifica que el formControlName coincida con el FormGroup
this.productoForm = this.fb.group({
  nombre: [""], // ✅ Debe coincidir con formControlName="nombre"
});
```

### 3. Error: "Cannot upload file"

```typescript
// Verifica que el backend acepte FormData
private buildCreateRequest(): CreateProductoRequest {
  // ... código del formulario

  // Asegúrate de agregar la imagen correctamente
  if (this.selectedFile()) {
    request.imagen_principal = this.selectedFile()!;
  }

  return request;
}
```

## Mejores Prácticas

### 1. Manejo de Memoria

```typescript
// Usar signals en lugar de subscripciones manuales
// Los signals se limpian automáticamente

// ❌ Evitar
ngOnInit() {
  this.productoService.loading$.subscribe(loading => {
    this.loading = loading;
  });
}

// ✅ Preferir
loading = this.productoService.loading; // Signal del servicio
```

### 2. Validaciones Eficientes

```typescript
// Usar computed signals para validaciones complejas
isFormValid = computed(() => {
  return this.productoForm?.valid && this.selectedFile() !== null && this.categorias().length > 0;
});
```

### 3. Accesibilidad

```html
<!-- Siempre incluir labels y ARIA attributes -->
<label for="nombre" class="block text-sm font-medium text-gray-700"> Nombre del Producto * </label>
<input type="text" id="nombre" formControlName="nombre" aria-describedby="nombre-error" aria-invalid="hasFieldError('nombre')" />
<p id="nombre-error" class="mt-2 text-sm text-red-600" *ngIf="hasFieldError('nombre')">{{ getFieldError('nombre') }}</p>
```

Esta guía te ayudará a integrar y personalizar el componente según tus necesidades específicas.
