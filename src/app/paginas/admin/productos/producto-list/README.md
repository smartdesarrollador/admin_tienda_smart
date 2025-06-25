# ProductoListComponent

Componente para listar y gestionar productos en el panel de administración.

## Características

### 🎯 Funcionalidades Principales

- **Lista de productos** con vista de tabla y grid
- **Filtros avanzados** con búsqueda en tiempo real
- **Paginación completa** con navegación
- **Selección múltiple** con acciones masivas
- **Estadísticas en tiempo real** del inventario
- **Estados reactivos** usando Angular Signals
- **Responsive design** con Tailwind CSS

### 📊 Vistas Disponibles

#### Vista de Tabla

- Tabla responsive con scroll horizontal
- Información completa de cada producto
- Acciones rápidas por fila
- Selección múltiple con checkboxes

#### Vista de Grid

- Tarjetas visuales de productos
- Imágenes destacadas
- Información resumida
- Hover effects y animaciones

### 🔍 Sistema de Filtros

#### Búsqueda Rápida

- Campo de búsqueda por nombre con debounce (300ms)
- Búsqueda en tiempo real sin recargar

#### Filtros Avanzados

- **SKU**: Búsqueda exacta por código
- **Marca**: Filtro por marca del producto
- **Modelo**: Filtro por modelo específico
- **Rango de precios**: Precio mínimo y máximo
- **Stock**: Con stock, sin stock, todos
- **Estado**: Activo, inactivo, todos
- **Destacado**: Destacados, no destacados, todos
- **Ordenamiento**: Por nombre, precio, stock, fecha
- **Dirección**: Ascendente o descendente

### 📈 Panel de Estadísticas

Muestra métricas en tiempo real:

- **Total de productos** en la vista actual
- **Productos activos** contados dinámicamente
- **Productos destacados** en la lista
- **Productos sin stock** identificados

### ⚡ Acciones Disponibles

#### Acciones Individuales

- **Ver producto**: Navega a la vista detallada
- **Editar producto**: Abre el formulario de edición
- **Toggle destacado**: Cambia estado destacado
- **Toggle activo**: Cambia estado activo/inactivo
- **Eliminar producto**: Elimina con confirmación

#### Acciones Masivas

- **Seleccionar todos**: Selecciona todos los productos visibles
- **Toggle destacado masivo**: Cambia estado de seleccionados
- **Toggle activo masivo**: Activa/desactiva seleccionados
- **Eliminación masiva**: Elimina múltiples productos

### 🔄 Gestión de Estado

#### Signals Reactivos

```typescript
// Signals del servicio
productos = this.productoService.productos;
loading = this.productoService.loading;
error = this.productoService.error;
pagination = this.productoService.pagination;

// Signals locales
showFilters = signal(false);
selectedProducts = signal<number[]>([]);
viewMode = signal<"grid" | "table">("table");
```

#### Computed Signals

```typescript
// Estadísticas calculadas
productosActivos = computed(() => this.productos().filter((p) => p.activo).length);

productosDestacados = computed(() => this.productos().filter((p) => p.destacado).length);

// Estados de paginación
hasNextPage = this.productoService.hasNextPage;
hasPrevPage = this.productoService.hasPrevPage;
```

## Uso del Componente

### Importación

```typescript
import { ProductoListComponent } from "./producto-list.component";
```

### En el Template

```html
<app-producto-list></app-producto-list>
```

### Rutas Requeridas

El componente navega a estas rutas:

- `/admin/productos/create` - Crear producto
- `/admin/productos/edit/:id` - Editar producto
- `/admin/productos/view/:id` - Ver producto

## Dependencias

### Servicios

- `ProductoService` - Gestión de productos
- `Router` - Navegación
- `FormBuilder` - Formularios reactivos

### Módulos Angular

- `CommonModule` - Directivas básicas
- `FormsModule` - Formularios template-driven
- `ReactiveFormsModule` - Formularios reactivos
- `RouterModule` - Navegación

## Estructura del Formulario

### Campos de Filtro

```typescript
filterForm = this.fb.group({
  nombre: [""], // Búsqueda por nombre
  sku: [""], // Búsqueda por SKU
  marca: [""], // Filtro por marca
  modelo: [""], // Filtro por modelo
  categoria_id: [""], // Filtro por categoría
  precio_min: [""], // Precio mínimo
  precio_max: [""], // Precio máximo
  con_stock: [""], // Filtro de stock
  destacado: [""], // Filtro destacado
  activo: [""], // Filtro estado
  con_imagen: [""], // Con imagen principal
  order_by: ["nombre"], // Campo de ordenamiento
  order_direction: ["asc"], // Dirección
  per_page: [15], // Elementos por página
});
```

### Debounce en Búsqueda

```typescript
// Campos con debounce (300ms)
const searchFields = ["nombre", "sku", "marca", "modelo"];

// Campos con aplicación inmediata
const immediateFields = ["categoria_id", "con_stock", "destacado", "activo", "con_imagen", "order_by", "order_direction"];
```

## Estilos y Diseño

### Clases CSS Principales

- `.product-card` - Tarjetas de productos con hover
- `.filter-panel` - Panel de filtros con gradiente
- `.stat-card` - Tarjetas de estadísticas
- `.loading-spinner` - Animación de carga
- `.empty-state` - Estado sin productos

### Responsive Design

- **Mobile**: Grid de 1 columna, filtros apilados
- **Tablet**: Grid de 2 columnas, filtros en 2 columnas
- **Desktop**: Grid de 3-4 columnas, filtros en 4 columnas

### Animaciones

- **Hover effects** en tarjetas y botones
- **Fade in** para elementos que aparecen
- **Slide down** para paneles expandibles
- **Loading spinner** durante cargas

## Optimizaciones

### Performance

- **TrackBy function** para ngFor optimizado
- **OnPush change detection** implícito con signals
- **Debounce** en búsquedas para reducir requests
- **Lazy loading** de imágenes

### UX/UI

- **Estados de carga** visibles
- **Mensajes de error** informativos
- **Confirmaciones** para acciones destructivas
- **Feedback visual** para acciones exitosas

## Accesibilidad

### Características Implementadas

- **Etiquetas ARIA** en botones y controles
- **Texto alternativo** en imágenes
- **Focus visible** en elementos interactivos
- **Screen reader support** con texto oculto
- **Navegación por teclado** completa

### Clases de Accesibilidad

```css
.sr-only {
  /* Texto solo para lectores de pantalla */
}

.focus-visible:focus {
  /* Indicador de foco visible */
}
```

## Ejemplos de Uso

### Filtrar Productos

```typescript
// Aplicar filtros programáticamente
this.filterForm.patchValue({
  activo: "true",
  destacado: "true",
  precio_min: 10,
  precio_max: 100,
});
```

### Selección Múltiple

```typescript
// Seleccionar productos específicos
this.selectedProducts.set([1, 2, 3]);

// Verificar selección
const isSelected = this.isSelected(productId);
```

### Cambiar Vista

```typescript
// Cambiar entre tabla y grid
this.viewMode.set("grid");
this.viewMode.set("table");
```

## Integración con Backend

### Endpoints Utilizados

- `GET /api/productos` - Lista con filtros
- `POST /api/admin/productos/{id}/toggle-destacado`
- `POST /api/admin/productos/{id}/toggle-activo`
- `DELETE /api/admin/productos/{id}`
- `GET /api/admin/productos/statistics`

### Formato de Respuesta

```typescript
interface ProductosResponse {
  data: Producto[];
  links: PaginationLinks;
  meta: PaginationMeta;
}
```

## Testing

### Casos de Prueba Recomendados

1. **Carga inicial** de productos
2. **Aplicación de filtros** individuales y combinados
3. **Búsqueda con debounce** funcionando
4. **Paginación** navegando entre páginas
5. **Selección múltiple** y acciones masivas
6. **Cambio de vista** tabla/grid
7. **Manejo de errores** de red
8. **Estados de carga** visibles

### Mocks Necesarios

- `ProductoService` con datos de prueba
- `Router` para navegación
- Respuestas HTTP simuladas

## Mantenimiento

### Actualizaciones Futuras

- [ ] Filtro por categorías con dropdown
- [ ] Exportación a Excel/PDF
- [ ] Drag & drop para reordenar
- [ ] Vista de lista compacta
- [ ] Filtros guardados/favoritos
- [ ] Búsqueda avanzada con operadores

### Consideraciones

- Mantener compatibilidad con `ProductoService`
- Actualizar interfaces si cambia el backend
- Optimizar rendimiento con grandes datasets
- Mejorar accesibilidad continuamente

---

**Versión**: 1.0.0  
**Última actualización**: Mayo 2025  
**Compatibilidad**: Angular 17+, Tailwind CSS 3+
