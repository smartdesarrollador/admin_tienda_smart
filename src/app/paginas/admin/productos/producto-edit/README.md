# ProductoEditComponent

Componente standalone de Angular 17 para editar productos existentes en el sistema de administración.

## Características

### 🚀 Tecnologías Utilizadas

- **Angular 17** con signals y control flow
- **Formularios reactivos** con validaciones
- **Tailwind CSS** para estilos
- **TypeScript** con tipado estricto
- **Inyección de dependencias** moderna con `inject()`

### ✨ Funcionalidades Principales

#### Formulario Completo de Edición

- **Carga automática** de datos del producto desde la ruta
- **Información básica**: Nombre, descripción, categoría, precio, stock
- **Gestión de imagen**: Visualización actual, cambio y eliminación
- **Información adicional**: SKU, código de barras, marca, modelo, garantía
- **Estados**: Producto destacado y activo con toggle rápido
- **SEO**: Meta título y descripción
- **Configuración**: Idioma y moneda

#### Detección Inteligente de Cambios

- **Tracking automático** de modificaciones en el formulario
- **Indicador visual** de cambios sin guardar
- **Confirmación** antes de salir con cambios pendientes
- **Botón de deshacer** para revertir cambios

#### Gestión Avanzada de Imágenes

- **Preview de imagen actual** del producto
- **Upload de nueva imagen** con validaciones
- **Eliminación de imagen** actual del servidor
- **Validación de archivos** (tipo y tamaño)

#### Acciones Rápidas

- **Toggle destacado** sin recargar formulario
- **Toggle activo/inactivo** instantáneo
- **Badges de estado** visual en tiempo real

## Estructura del Componente

### Signals Utilizados

```typescript
// Del servicio
loading = this.productoService.loading;
error = this.productoService.error;
currentProducto = this.productoService.currentProducto;

// Locales
productoId = signal<number | null>(null);
selectedFile = signal<File | null>(null);
imagePreview = signal<string | null>(null);
showAdvanced = signal(false);
categorias = signal<Categoria[]>([]);
loadingCategorias = signal(false);
hasChanges = signal(false);
originalFormValue = signal<any>(null);

// Computed
isFormValid = computed(() => this.productoForm?.valid ?? false);
hasImageSelected = computed(() => this.selectedFile() !== null);
canSave = computed(() => this.isFormValid() && this.hasChanges());
currentImageUrl = computed(() => {
  const producto = this.currentProducto();
  if (this.imagePreview()) {
    return this.imagePreview();
  }
  if (producto?.imagen_principal) {
    return `${this.urlDominioApi}/storage/${producto.imagen_principal}`;
  }
  return null;
});
```

### Effects Implementados

```typescript
// Detección de cambios en formulario
effect(() => {
  const originalValue = this.originalFormValue();
  if (originalValue) {
    const currentValue = this.productoForm.value;
    const hasFormChanges = JSON.stringify(originalValue) !== JSON.stringify(currentValue);
    const hasImageChanges = this.selectedFile() !== null;
    this.hasChanges.set(hasFormChanges || hasImageChanges);
  }
});

// Validación de precio de oferta
effect(() => {
  const precio = this.productoForm?.get("precio")?.value;
  const precioOferta = this.productoForm?.get("precio_oferta")?.value;

  if (precio && precioOferta && precioOferta >= precio) {
    this.productoForm?.get("precio_oferta")?.setErrors({
      precioOfertaMayor: true,
    });
  }
});

// Carga automática del producto
effect(() => {
  const id = this.productoId();
  if (id) {
    this.loadProducto(id);
  }
});
```

## Métodos Principales

### Gestión de Datos

```typescript
loadProducto(id: number): void          // Cargar producto desde API
populateForm(producto: Producto): void  // Poblar formulario con datos
buildUpdateRequest(): UpdateProductoRequest // Construir request optimizado
```

### Gestión de Archivos

```typescript
onFileSelected(event: Event): void      // Manejar selección de archivo
removeImage(): void                     // Remover imagen seleccionada
deleteCurrentImage(): void             // Eliminar imagen del servidor
```

### Acciones Rápidas

```typescript
toggleDestacado(): void                 // Alternar estado destacado
toggleActivo(): void                    // Alternar estado activo
```

### Utilidades

```typescript
generateSku(): void                     // Generar SKU automático
hasFieldError(field): boolean           // Validación de campos
getFieldError(field): string            // Mensajes de error
resetForm(): void                       // Deshacer cambios
cancel(): void                          // Cancelar con confirmación
```

## Validaciones Implementadas

### Campos Obligatorios

- ✅ Nombre del producto (3-255 caracteres)
- ✅ Precio (mayor a 0.01)
- ✅ Stock (mayor o igual a 0)
- ✅ Categoría (selección requerida)

### Validaciones Especiales

- ✅ Precio de oferta menor al precio normal
- ✅ Archivos de imagen válidos (PNG, JPG, GIF)
- ✅ Tamaño máximo de archivo (5MB)
- ✅ Detección de cambios en tiempo real

### Optimización de Requests

```typescript
private buildUpdateRequest(): UpdateProductoRequest {
  const formValue = this.productoForm.value;
  const request: UpdateProductoRequest = {};

  // Solo incluir campos que han cambiado
  const originalValue = this.originalFormValue();
  Object.keys(formValue).forEach((key) => {
    if (formValue[key] !== originalValue[key]) {
      // Procesar según tipo de campo
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
```

## Características de UX/UI

### Estados Visuales

- **Indicador de cambios**: Banner amarillo cuando hay modificaciones
- **Badges de estado**: Verde/rojo para activo/inactivo, amarillo para destacado
- **Loading states**: Spinners durante operaciones
- **Error handling**: Mensajes contextuales de error

### Navegación Inteligente

- **Breadcrumb navigation**: Navegación clara
- **Confirmación de salida**: Si hay cambios sin guardar
- **Acciones rápidas**: Botones para toggle de estados

### Responsive Design

- **Mobile-first**: Diseño adaptativo
- **Grid layouts**: Que se colapsan en móvil
- **Button groups**: Que se apilan verticalmente
- **Touch-friendly**: Botones y controles optimizados

## Integración con Backend

### Endpoints Utilizados

```typescript
GET / api / productos / { id }; // Cargar producto
PUT / api / admin / productos / { id }; // Actualizar producto
POST / api / admin / productos / { id } / toggle - destacado; // Toggle destacado
POST / api / admin / productos / { id } / toggle - activo; // Toggle activo
DELETE / api / admin / productos / { id } / imagen - principal; // Eliminar imagen
```

### Manejo de FormData

```typescript
// El servicio maneja automáticamente la conversión a FormData
// para campos con archivos
private buildFormData(data: UpdateProductoRequest): FormData {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (key === 'imagen_principal' && value instanceof File) {
        formData.append(key, value);
      } else if (key === 'atributos_extra' && typeof value === 'object') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value.toString());
      }
    }
  });

  // Agregar _method para Laravel
  formData.append('_method', 'PUT');

  return formData;
}
```

## Uso del Componente

### En Rutas

```typescript
{
  path: 'productos/:id/edit',
  component: ProductoEditComponent
}
```

### Navegación

```typescript
// Desde lista de productos
editProducto(id: number): void {
  this.router.navigate(['/admin/productos', id, 'edit']);
}

// Después de editar
this.router.navigate(['/admin/productos']);
```

## Mejores Prácticas Implementadas

### Angular 17

- ✅ Componente standalone
- ✅ Signals para estado reactivo
- ✅ Control flow syntax (`@if`, `@for`)
- ✅ Inyección de dependencias con `inject()`
- ✅ Effects para lógica reactiva compleja

### Gestión de Estado

- ✅ Detección automática de cambios
- ✅ Optimización de requests (solo campos modificados)
- ✅ Estado compartido con el servicio
- ✅ Computed signals para lógica derivada

### UX/UI

- ✅ Feedback visual inmediato
- ✅ Confirmaciones para acciones destructivas
- ✅ Estados de loading y error
- ✅ Accesibilidad (ARIA labels, focus management)

### Rendimiento

- ✅ Lazy loading del componente
- ✅ Optimización de re-renders con signals
- ✅ Validación eficiente de archivos
- ✅ Requests optimizados (solo cambios)

## Diferencias con ProductoCreateComponent

### Funcionalidades Adicionales

1. **Carga de datos existentes** desde la API
2. **Detección de cambios** en tiempo real
3. **Acciones rápidas** (toggle estados)
4. **Gestión de imagen existente** (eliminar del servidor)
5. **Optimización de requests** (solo campos modificados)
6. **Confirmación de salida** con cambios pendientes

### Signals Específicos

```typescript
// Específicos del componente de edición
productoId = signal<number | null>(null);
hasChanges = signal(false);
originalFormValue = signal<any>(null);
currentImageUrl = computed(() => {
  /* lógica de imagen actual */
});
canSave = computed(() => this.isFormValid() && this.hasChanges());
```

## Extensiones Futuras

### Funcionalidades Planeadas

- [ ] Historial de cambios del producto
- [ ] Comparación con versión anterior
- [ ] Guardado automático como borrador
- [ ] Múltiples imágenes del producto
- [ ] Integración con sistema de versiones
- [ ] Notificaciones push para cambios

### Mejoras Técnicas

- [ ] Tests unitarios completos
- [ ] Tests de integración
- [ ] Optimización de bundle size
- [ ] Implementación de undo/redo
- [ ] Validaciones asíncronas

## Troubleshooting

### Problemas Comunes

#### Error: "Producto no encontrado"

```typescript
// Verificar que el ID en la ruta sea válido
ngOnInit(): void {
  const id = this.route.snapshot.paramMap.get('id');
  if (id && !isNaN(parseInt(id, 10))) {
    this.productoId.set(parseInt(id, 10));
  } else {
    this.router.navigate(['/admin/productos']);
  }
}
```

#### Error: "Cambios no detectados"

```typescript
// Asegurar que originalFormValue se establezca correctamente
populateForm(producto: Producto): void {
  const formValue = { /* mapear producto */ };
  this.productoForm.patchValue(formValue);
  this.originalFormValue.set({ ...formValue }); // Copia profunda
}
```

#### Error: "Imagen no se actualiza"

```typescript
// Verificar que currentImageUrl computed esté bien implementado
currentImageUrl = computed(() => {
  const producto = this.currentProducto();
  if (this.imagePreview()) {
    return this.imagePreview(); // Nueva imagen seleccionada
  }
  if (producto?.imagen_principal) {
    return `${this.urlDominioApi}/storage/${producto.imagen_principal}`;
  }
  return null;
});
```

## Contribución

Para contribuir al componente:

1. Seguir las convenciones de Angular 17
2. Mantener tipado estricto de TypeScript
3. Agregar tests para nuevas funcionalidades
4. Documentar cambios en este README
5. Seguir las guías de estilo de Tailwind CSS
6. Mantener compatibilidad con el servicio existente

## Licencia

Este componente es parte del sistema de administración y sigue la licencia del proyecto principal.
