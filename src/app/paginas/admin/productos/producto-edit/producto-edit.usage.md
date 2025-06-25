# Guía de Uso - ProductoEditComponent

## Integración en Rutas

### 1. Configuración de Rutas

```typescript
// app-routing.module.ts o en las rutas lazy-loaded
import { ProductoEditComponent } from "./paginas/admin/productos/producto-edit/producto-edit.component";

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
      {
        path: ":id/edit",
        loadComponent: () => import("./paginas/admin/productos/producto-edit/producto-edit.component").then((m) => m.ProductoEditComponent),
      },
    ],
  },
];
```

### 2. Navegación desde Lista de Productos

```typescript
// producto-list.component.ts
editProducto(id: number): void {
  this.router.navigate(['/admin/productos', id, 'edit']);
}
```

```html
<!-- producto-list.component.html -->
<button type="button" (click)="editProducto(producto.id)" class="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
  </svg>
  Editar
</button>
```

## Ejemplos de Uso

### 1. Uso Básico

```html
<!-- Simplemente incluir el componente en la ruta -->
<app-producto-edit></app-producto-edit>
```

### 2. Con Guards de Ruta

```typescript
// producto-edit.guard.ts
@Injectable({
  providedIn: 'root'
})
export class ProductoEditGuard implements CanActivate {
  private readonly productoService = inject(ProductoService);
  private readonly router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const id = parseInt(route.paramMap.get('id') || '0', 10);

    if (!id || isNaN(id)) {
      this.router.navigate(['/admin/productos']);
      return of(false);
    }

    return this.productoService.getProducto(id).pipe(
      map(() => true),
      catchError(() => {
        this.router.navigate(['/admin/productos']);
        return of(false);
      })
    );
  }
}

// En las rutas
{
  path: ':id/edit',
  component: ProductoEditComponent,
  canActivate: [ProductoEditGuard]
}
```

### 3. Con Resolvers para Pre-carga

```typescript
// producto.resolver.ts
@Injectable({
  providedIn: 'root'
})
export class ProductoResolver implements Resolve<Producto> {
  private readonly productoService = inject(ProductoService);

  resolve(route: ActivatedRouteSnapshot): Observable<Producto> {
    const id = parseInt(route.paramMap.get('id') || '0', 10);
    return this.productoService.getProducto(id).pipe(
      map(response => response.data)
    );
  }
}

// En las rutas
{
  path: ':id/edit',
  component: ProductoEditComponent,
  resolve: { producto: ProductoResolver }
}

// En el componente
ngOnInit(): void {
  // Si usas resolver, puedes obtener los datos así
  const producto = this.route.snapshot.data['producto'] as Producto;
  if (producto) {
    this.populateForm(producto);
  }
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
  if (value && value.toLowerCase().includes('test')) {
    return { invalidName: true };
  }
  return null;
}
```

### 2. Agregar Campos Personalizados

```typescript
// Extender el formulario
ngOnInit(): void {
  // Después de la inicialización básica
  this.productoForm.addControl("campo_personalizado", this.fb.control("", [Validators.required]));
  this.productoForm.addControl("otro_campo", this.fb.control(false));
}
```

```html
<!-- En el template -->
<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
  <div>
    <label for="campo_personalizado" class="block text-sm font-medium text-gray-700"> Campo Personalizado * </label>
    <input type="text" id="campo_personalizado" formControlName="campo_personalizado" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
  </div>
</div>
```

### 3. Personalizar Categorías con Servicio Real

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

// En producto-edit.component.ts
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

## Manejo de Estados Avanzado

### 1. Estados de Carga Personalizados

```typescript
// Agregar más signals para estados específicos
savingChanges = signal(false);
deletingImage = signal(false);
togglingState = signal(false);

// Métodos con estados específicos
onSubmit(): void {
  if (this.productoForm.valid && this.productoId()) {
    this.savingChanges.set(true);
    const formData = this.buildUpdateRequest();

    this.productoService.updateProducto(this.productoId()!, formData).subscribe({
      next: (response) => {
        this.savingChanges.set(false);
        this.showSuccessNotification('Producto actualizado exitosamente');
        this.router.navigate(['/admin/productos']);
      },
      error: (error) => {
        this.savingChanges.set(false);
        this.showErrorNotification('Error al actualizar producto');
      }
    });
  }
}
```

### 2. Notificaciones Personalizadas

```typescript
// notification.service.ts
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications = signal<Notification[]>([]);

  showSuccess(message: string): void {
    this.addNotification({
      type: 'success',
      message,
      duration: 3000
    });
  }

  showError(message: string): void {
    this.addNotification({
      type: 'error',
      message,
      duration: 5000
    });
  }

  private addNotification(notification: Notification): void {
    const notifications = this.notifications();
    this.notifications.set([...notifications, notification]);

    // Auto-remove después de duration
    setTimeout(() => {
      this.removeNotification(notification);
    }, notification.duration);
  }
}

// En producto-edit.component.ts
private readonly notificationService = inject(NotificationService);

onSubmit(): void {
  // ... lógica de envío
  this.productoService.updateProducto(this.productoId()!, formData).subscribe({
    next: (response) => {
      this.notificationService.showSuccess('Producto actualizado exitosamente');
      this.router.navigate(['/admin/productos']);
    },
    error: (error) => {
      this.notificationService.showError('Error al actualizar producto');
    }
  });
}
```

## Integración con Servicios

### 1. Servicio de Auditoría

```typescript
// audit.service.ts
@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private readonly http = inject(HttpClient);

  logProductoEdit(productoId: number, changes: any): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/audit/producto-edit`, {
      producto_id: productoId,
      changes,
      timestamp: new Date().toISOString()
    });
  }
}

// En producto-edit.component.ts
private readonly auditService = inject(AuditService);

onSubmit(): void {
  if (this.productoForm.valid && this.productoId()) {
    const changes = this.buildUpdateRequest();

    // Log de auditoría
    this.auditService.logProductoEdit(this.productoId()!, changes).subscribe();

    // Continuar con actualización normal
    this.productoService.updateProducto(this.productoId()!, changes).subscribe({
      // ... manejo de respuesta
    });
  }
}
```

### 2. Servicio de Validación Asíncrona

```typescript
// validation.service.ts
@Injectable({
  providedIn: "root",
})
export class ValidationService {
  private readonly http = inject(HttpClient);

  validateSku(sku: string, excludeId?: number): Observable<boolean> {
    const params = new HttpParams().set("sku", sku).set("exclude_id", excludeId?.toString() || "");

    return this.http.get<{ available: boolean }>(`${environment.apiUrl}/validate/sku`, { params }).pipe(map((response) => response.available));
  }
}

// Validador asíncrono
skuAsyncValidator = (control: AbstractControl): Observable<ValidationErrors | null> => {
  if (!control.value) {
    return of(null);
  }

  return this.validationService.validateSku(control.value, this.productoId()).pipe(
    map((available) => (available ? null : { skuTaken: true })),
    catchError(() => of(null))
  );
};

// En el formulario
this.productoForm = this.fb.group({
  sku: ["", [Validators.maxLength(100)], [this.skuAsyncValidator]],
  // ... otros campos
});
```

## Testing

### 1. Test Unitario Básico

```typescript
// producto-edit.component.spec.ts
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { ProductoEditComponent } from "./producto-edit.component";
import { ProductoService } from "../../../../core/services/producto.service";
import { of } from "rxjs";

describe("ProductoEditComponent", () => {
  let component: ProductoEditComponent;
  let fixture: ComponentFixture<ProductoEditComponent>;
  let mockProductoService: jasmine.SpyObj<ProductoService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    const productoServiceSpy = jasmine.createSpyObj("ProductoService", ["getProducto", "updateProducto", "toggleDestacado", "toggleActivo"]);
    const routerSpy = jasmine.createSpyObj("Router", ["navigate"]);

    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy("get").and.returnValue("1"),
        },
      },
    };

    await TestBed.configureTestingModule({
      imports: [ProductoEditComponent, ReactiveFormsModule],
      providers: [
        { provide: ProductoService, useValue: productoServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductoEditComponent);
    component = fixture.componentInstance;
    mockProductoService = TestBed.inject(ProductoService) as jasmine.SpyObj<ProductoService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should load producto on init", () => {
    const mockProducto = {
      id: 1,
      nombre: "Test Product",
      precio: 100,
      stock: 10,
      categoria_id: 1,
      // ... otros campos
    };

    mockProductoService.getProducto.and.returnValue(of({ data: mockProducto }));

    component.ngOnInit();

    expect(mockProductoService.getProducto).toHaveBeenCalledWith(1);
    expect(component.productoForm.get("nombre")?.value).toBe("Test Product");
  });

  it("should detect changes in form", () => {
    const mockProducto = {
      id: 1,
      nombre: "Test Product",
      precio: 100,
      // ... otros campos
    };

    component.populateForm(mockProducto as any);

    // Cambiar un valor
    component.productoForm.patchValue({ nombre: "Modified Product" });

    // Trigger change detection
    fixture.detectChanges();

    expect(component.hasChanges()).toBe(true);
  });
});
```

### 2. Test de Integración

```typescript
// producto-edit.integration.spec.ts
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { ProductoEditComponent } from "./producto-edit.component";
import { environment } from "../../../../../environments/environment";

describe("ProductoEditComponent Integration", () => {
  let component: ProductoEditComponent;
  let fixture: ComponentFixture<ProductoEditComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductoEditComponent, HttpClientTestingModule, RouterTestingModule.withRoutes([{ path: "admin/productos/:id/edit", component: ProductoEditComponent }])],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductoEditComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it("should load and update producto", () => {
    const mockProducto = {
      id: 1,
      nombre: "Test Product",
      precio: 100,
      stock: 10,
      categoria_id: 1,
      activo: true,
      destacado: false,
    };

    component.productoId.set(1);

    // Mock GET request
    const getReq = httpMock.expectOne(`${environment.apiUrl}/productos/1`);
    expect(getReq.request.method).toBe("GET");
    getReq.flush({ data: mockProducto });

    // Verificar que el formulario se pobló
    expect(component.productoForm.get("nombre")?.value).toBe("Test Product");

    // Modificar y enviar
    component.productoForm.patchValue({ nombre: "Updated Product" });
    component.onSubmit();

    // Mock PUT request
    const putReq = httpMock.expectOne(`${environment.apiUrl}/admin/productos/1`);
    expect(putReq.request.method).toBe("POST"); // Laravel usa POST con _method
    expect(putReq.request.body.get("nombre")).toBe("Updated Product");
    putReq.flush({ data: { ...mockProducto, nombre: "Updated Product" } });
  });
});
```

## Troubleshooting Común

### 1. Error: "Cannot read property of undefined"

```typescript
// Asegúrate de manejar valores null/undefined
populateForm(producto: Producto): void {
  const formValue = {
    nombre: producto.nombre || '',
    descripcion: producto.descripcion || '',
    precio: producto.precio || 0,
    precio_oferta: producto.precio_oferta || null,
    // ... usar valores por defecto
  };

  this.productoForm.patchValue(formValue);
  this.originalFormValue.set({ ...formValue });
}
```

### 2. Error: "Changes not detected"

```typescript
// Asegurar que el effect se ejecute correctamente
constructor() {
  // ... inicialización del formulario

  // Effect para detectar cambios
  effect(() => {
    const originalValue = this.originalFormValue();
    if (originalValue && this.productoForm) {
      const currentValue = this.productoForm.value;

      // Comparación más robusta
      const hasFormChanges = !this.deepEqual(originalValue, currentValue);
      const hasImageChanges = this.selectedFile() !== null;

      this.hasChanges.set(hasFormChanges || hasImageChanges);
    }
  });
}

private deepEqual(obj1: any, obj2: any): boolean {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
}
```

### 3. Error: "Route parameter not found"

```typescript
ngOnInit(): void {
  // Manejo más robusto del parámetro de ruta
  const idParam = this.route.snapshot.paramMap.get('id');

  if (!idParam) {
    console.error('No ID parameter found in route');
    this.router.navigate(['/admin/productos']);
    return;
  }

  const id = parseInt(idParam, 10);

  if (isNaN(id) || id <= 0) {
    console.error('Invalid ID parameter:', idParam);
    this.router.navigate(['/admin/productos']);
    return;
  }

  this.productoId.set(id);
  this.loadCategorias();
}
```

## Mejores Prácticas

### 1. Manejo de Memoria

```typescript
// Usar signals en lugar de subscripciones manuales
// Los signals se limpian automáticamente

// ❌ Evitar
private destroy$ = new Subject<void>();

ngOnInit() {
  this.productoService.loading$.pipe(
    takeUntil(this.destroy$)
  ).subscribe(loading => {
    this.loading = loading;
  });
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}

// ✅ Preferir
loading = this.productoService.loading; // Signal del servicio
```

### 2. Validaciones Eficientes

```typescript
// Usar computed signals para validaciones complejas
canSave = computed(() => {
  return this.isFormValid() && this.hasChanges() && !this.loading() && this.categorias().length > 0;
});

// Usar en el template
[disabled] = "!canSave()";
```

### 3. Accesibilidad

```html
<!-- Siempre incluir labels y ARIA attributes -->
<label for="nombre" class="block text-sm font-medium text-gray-700"> Nombre del Producto * </label>
<input type="text" id="nombre" formControlName="nombre" aria-describedby="nombre-error nombre-help" aria-invalid="hasFieldError('nombre')" aria-required="true" />
<p id="nombre-help" class="mt-1 text-sm text-gray-500">Ingresa un nombre descriptivo para el producto</p>
@if (hasFieldError('nombre')) {
<p id="nombre-error" class="mt-2 text-sm text-red-600" role="alert">{{ getFieldError('nombre') }}</p>
}
```

Esta guía te ayudará a integrar, personalizar y mantener el componente de edición según tus necesidades específicas.
