# VariacionListComponent

## Descripción

Componente Angular 17 standalone para listar y gestionar variaciones de productos en el panel administrativo. Utiliza Angular Signals para gestión reactiva del estado y Tailwind CSS para los estilos.

## Características

### ✅ Funcionalidades Principales

- **Listado paginado** de variaciones de productos
- **Filtros avanzados** (producto, SKU, precio, stock, estado)
- **Búsqueda en tiempo real** con debounce
- **Ordenamiento** por múltiples campos
- **Selección múltiple** para operaciones en lote
- **Gestión de stock** con modal dedicado
- **Estadísticas en tiempo real**
- **Operaciones CRUD** completas

### ✅ Características Técnicas

- **Angular 17** con componente standalone
- **Angular Signals** para gestión reactiva del estado
- **Tailwind CSS** para estilos responsivos
- **TypeScript** con tipado estricto
- **Reactive Forms** para filtros y formularios
- **RxJS** para manejo de observables
- **Debounce** en búsquedas para optimización

## Estructura de Archivos

```
variacion-list/
├── variacion-list.component.ts     # Lógica del componente
├── variacion-list.component.html   # Template con Tailwind CSS
├── variacion-list.component.css    # Estilos adicionales
└── README.md                       # Esta documentación
```

## Dependencias

### Servicios

- `VariacionProductoService` - Gestión de variaciones
- `ProductoService` - Datos de productos para filtros

### Modelos/Interfaces

- `VariacionProductoInterface`
- `VariacionProductoFilters`
- `EstadoStock`, `SortField`, `SortOrder`
- `OperacionStock`

### Angular Modules

- `CommonModule`
- `FormsModule`, `ReactiveFormsModule`
- `RouterModule`

## Uso del Componente

### Importación

```typescript
import { VariacionListComponent } from "./variacion-list/variacion-list.component";
```

### En Template

```html
<app-variacion-list></app-variacion-list>
```

### En Rutas

```typescript
{
  path: 'variaciones-producto',
  component: VariacionListComponent
}
```

## Signals Utilizados

### Del Servicio

```typescript
readonly variaciones = this.variacionService.variaciones;
readonly loading = this.variacionService.loading;
readonly error = this.variacionService.error;
readonly pagination = this.variacionService.pagination;
readonly hasVariaciones = this.variacionService.hasVariaciones;
readonly totalVariaciones = this.variacionService.totalVariaciones;
readonly variacionesActivas = this.variacionService.variacionesActivas;
readonly variacionesConStock = this.variacionService.variacionesConStock;
readonly variacionesSinStock = this.variacionService.variacionesSinStock;
readonly stockTotal = this.variacionService.stockTotal;
```

### Locales

```typescript
readonly showFilters = signal(false);
readonly selectedVariaciones = signal<number[]>([]);
readonly viewMode = signal<'grid' | 'table'>('table');
readonly showStatistics = signal(false);
readonly showStockModal = signal(false);
readonly currentStockVariacion = signal<VariacionProductoInterface | null>(null);
```

### Computados

```typescript
readonly variacionesConDescuento = computed(() =>
  this.variaciones().filter(v => v.precio_oferta && v.precio_oferta < v.precio).length
);

readonly precioPromedio = computed(() => {
  const variaciones = this.variaciones();
  if (variaciones.length === 0) return 0;
  return variaciones.reduce((sum, v) => sum + v.precio, 0) / variaciones.length;
});

readonly valorTotalInventario = computed(() =>
  this.variaciones().reduce((total, v) => total + (v.precio * v.stock), 0)
);
```

## Funcionalidades

### 1. Filtros y Búsqueda

#### Filtros Disponibles

- **Producto**: Filtrar por producto específico
- **SKU**: Búsqueda por SKU con debounce
- **Rango de precios**: Precio mínimo y máximo
- **Estado de stock**: Con stock / Sin stock
- **Estado activo**: Activo / Inactivo
- **Ordenamiento**: Por múltiples campos y direcciones

#### Filtros Rápidos

```html
<!-- Botones de filtro rápido -->
<button (click)="filterByEstadoStock(null)">Todos</button>
<button (click)="filterByEstadoStock(true)">Con Stock</button>
<button (click)="filterByEstadoStock(false)">Sin Stock</button>
```

### 2. Operaciones CRUD

#### Crear Variación

```typescript
createVariacion(): void {
  this.router.navigate(['/admin/variaciones-producto/create']);
}
```

#### Editar Variación

```typescript
editVariacion(id: number): void {
  this.router.navigate(['/admin/variaciones-producto/edit', id]);
}
```

#### Eliminar Variación

```typescript
deleteVariacion(variacion: VariacionProductoInterface): void {
  if (confirm(`¿Estás seguro de eliminar la variación ${variacion.sku}?`)) {
    this.variacionService.deleteVariacion(variacion.id).subscribe();
  }
}
```

#### Alternar Estado

```typescript
toggleActivo(variacion: VariacionProductoInterface): void {
  this.variacionService.toggleActivo(variacion.id).subscribe();
}
```

### 3. Gestión de Stock

#### Modal de Stock

```typescript
openStockModal(variacion: VariacionProductoInterface): void {
  this.currentStockVariacion.set(variacion);
  this.stockForm.patchValue({
    stock: variacion.stock,
    operacion: OperacionStock.SET,
  });
  this.showStockModal.set(true);
}
```

#### Operaciones de Stock

- **SET**: Establecer cantidad exacta
- **ADD**: Agregar al stock actual
- **SUBTRACT**: Reducir del stock actual

### 4. Selección Múltiple

#### Seleccionar/Deseleccionar

```typescript
toggleVariacionSelection(variacionId: number): void {
  const selected = this.selectedVariaciones();
  const index = selected.indexOf(variacionId);

  if (index > -1) {
    this.selectedVariaciones.set(selected.filter(id => id !== variacionId));
  } else {
    this.selectedVariaciones.set([...selected, variacionId]);
  }
}
```

#### Operaciones en Lote

```typescript
bulkToggleActivo(): void {
  const selected = this.selectedVariaciones();
  if (selected.length === 0) return;

  if (confirm(`¿Cambiar estado de ${selected.length} variaciones?`)) {
    selected.forEach(id => {
      this.variacionService.toggleActivo(id).subscribe();
    });
    this.clearSelection();
  }
}
```

### 5. Paginación

#### Navegación

```typescript
nextPage(): void {
  this.variacionService.nextPage();
}

prevPage(): void {
  this.variacionService.prevPage();
}

goToPage(page: number): void {
  this.variacionService.goToPage(page);
}
```

#### Cambio de Tamaño

```typescript
changePageSize(): void {
  const perPage = this.filterForm.get('per_page')?.value;
  if (perPage) {
    this.variacionService.changePageSize(perPage);
  }
}
```

## Estilos y UI

### Tailwind CSS Classes Principales

#### Layout

- `bg-white shadow-sm border-b border-gray-200` - Header
- `grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-6` - Estadísticas
- `divide-y divide-gray-200` - Lista de elementos

#### Estados

- `bg-green-100 text-green-800` - Estado activo/disponible
- `bg-red-100 text-red-800` - Estado inactivo/sin stock
- `bg-yellow-100 text-yellow-800` - Stock limitado
- `bg-indigo-100 text-indigo-800` - Seleccionado

#### Botones

- `bg-indigo-600 hover:bg-indigo-700` - Botón primario
- `bg-red-600 hover:bg-red-700` - Botón de eliminar
- `bg-green-600 hover:bg-green-700` - Botón de activar

#### Responsive

- `sm:grid-cols-2 lg:grid-cols-4` - Grid responsivo
- `sm:flex sm:items-center sm:justify-between` - Layout móvil

### Estados Visuales

#### Loading

```html
<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
```

#### Error

```html
<div class="bg-red-50 border border-red-200 rounded-md p-4">
  <!-- Contenido del error -->
</div>
```

#### Empty State

```html
<div class="text-center py-12">
  <svg class="mx-auto h-12 w-12 text-gray-400">...</svg>
  <h3 class="mt-2 text-sm font-medium text-gray-900">No hay variaciones</h3>
</div>
```

## Optimizaciones

### Performance

- **TrackBy Function**: `trackByVariacionId` para optimizar ngFor
- **Debounce**: 300ms para búsqueda, 500ms para filtros de precio
- **Computed Signals**: Para estadísticas en tiempo real
- **Lazy Loading**: Paginación para grandes datasets

### UX/UI

- **Loading States**: Indicadores de carga
- **Error Handling**: Mensajes de error claros
- **Confirmaciones**: Para operaciones destructivas
- **Responsive Design**: Adaptable a móviles
- **Keyboard Navigation**: Accesibilidad

## Configuración

### Formularios Reactivos

#### Filtros

```typescript
this.filterForm = this.fb.group({
  producto_id: [""],
  search: [""],
  precio_min: [""],
  precio_max: [""],
  con_stock: [""],
  activo: [""],
  sort_by: [SortField.CREATED_AT],
  sort_order: [SortOrder.DESC],
  per_page: [15],
});
```

#### Stock

```typescript
this.stockForm = this.fb.group({
  stock: [0],
  operacion: [OperacionStock.SET],
});
```

### Debounce Configuration

```typescript
// Búsqueda: 300ms
this.filterForm
  .get("search")
  ?.valueChanges.pipe(debounceTime(300), distinctUntilChanged())
  .subscribe(() => this.applyFilters());

// Precios: 500ms
["precio_min", "precio_max"].forEach((field) => {
  this.filterForm
    .get(field)
    ?.valueChanges.pipe(debounceTime(500), distinctUntilChanged())
    .subscribe(() => this.applyFilters());
});
```

## Testing

### Unit Tests

```typescript
describe("VariacionListComponent", () => {
  let component: VariacionListComponent;
  let fixture: ComponentFixture<VariacionListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [VariacionListComponent],
    });
    fixture = TestBed.createComponent(VariacionListComponent);
    component = fixture.componentInstance;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should load variaciones on init", () => {
    spyOn(component, "loadVariaciones");
    component.ngOnInit();
    expect(component.loadVariaciones).toHaveBeenCalled();
  });
});
```

## Mejores Prácticas Implementadas

### Angular 17

- ✅ Componente standalone
- ✅ Angular Signals para estado reactivo
- ✅ Control flow syntax (@if, @for)
- ✅ Inject function para DI
- ✅ Computed signals para derivaciones

### TypeScript

- ✅ Tipado estricto
- ✅ Readonly properties
- ✅ Enums para constantes
- ✅ Interfaces bien definidas

### Performance

- ✅ OnPush change detection (implícito con signals)
- ✅ TrackBy functions
- ✅ Debounce en búsquedas
- ✅ Lazy loading con paginación

### UX/UI

- ✅ Loading states
- ✅ Error handling
- ✅ Responsive design
- ✅ Accessibility (ARIA labels)
- ✅ Confirmaciones para acciones destructivas

### Mantenibilidad

- ✅ Separación de responsabilidades
- ✅ Código reutilizable
- ✅ Documentación completa
- ✅ Naming conventions consistentes

## Extensiones Futuras

### Posibles Mejoras

1. **Exportación**: Excel/PDF de variaciones
2. **Importación**: Carga masiva desde CSV
3. **Filtros Avanzados**: Filtros por atributos específicos
4. **Vista de Grilla**: Modo de visualización alternativo
5. **Drag & Drop**: Reordenamiento de variaciones
6. **Historial**: Tracking de cambios de stock
7. **Notificaciones**: Alertas de stock bajo
8. **Búsqueda Avanzada**: Filtros combinados complejos

### Integraciones

1. **WebSockets**: Updates en tiempo real
2. **PWA**: Funcionalidad offline
3. **Analytics**: Métricas de uso
4. **API Caching**: Optimización de requests

## Troubleshooting

### Problemas Comunes

#### 1. Filtros no funcionan

```typescript
// Verificar que el FormGroup esté correctamente inicializado
console.log(this.filterForm.value);
```

#### 2. Paginación no actualiza

```typescript
// Asegurar que el servicio esté actualizando el estado
console.log(this.pagination());
```

#### 3. Modal no se cierra

```typescript
// Verificar que el signal se esté actualizando
this.showStockModal.set(false);
```

#### 4. Selección múltiple no funciona

```typescript
// Verificar el estado del signal
console.log(this.selectedVariaciones());
```

## Soporte

Para problemas o mejoras, consultar:

- Documentación del servicio: `VariacionProductoService`
- Interfaces: `variacion-producto.interface.ts`
- Guía de uso del servicio: `variacion-producto.service.usage.md`
