# ProductoCreateComponent

Componente standalone de Angular 17 para crear nuevos productos en el sistema de administración.

## Características

### 🚀 Tecnologías Utilizadas

- **Angular 17** con signals y control flow
- **Formularios reactivos** con validaciones
- **Tailwind CSS** para estilos
- **TypeScript** con tipado estricto
- **Inyección de dependencias** moderna con `inject()`

### ✨ Funcionalidades Principales

#### Formulario Completo

- **Información básica**: Nombre, descripción, categoría, precio, stock
- **Imagen principal**: Upload con preview y validaciones
- **Información adicional**: SKU, código de barras, marca, modelo, garantía
- **Estados**: Producto destacado y activo
- **SEO**: Meta título y descripción
- **Configuración**: Idioma y moneda

#### Validaciones Inteligentes

- Campos obligatorios marcados con `*`
- Validación de tipos de archivo (solo imágenes)
- Validación de tamaño de archivo (máximo 5MB)
- Validación de precio de oferta (debe ser menor al precio normal)
- Mensajes de error contextuales y descriptivos

#### UX/UI Avanzada

- **Signals reactivos** para estado en tiempo real
- **Preview de imagen** con opción de eliminar
- **Generación automática de SKU** basada en el nombre
- **Sección avanzada colapsible** para opciones SEO
- **Estados de loading** con spinners animados
- **Breadcrumb navigation** para mejor orientación

## Estructura del Componente

### Signals Utilizados

```typescript
// Del servicio
loading = this.productoService.loading;
error = this.productoService.error;

// Locales
selectedFile = signal<File | null>(null);
imagePreview = signal<string | null>(null);
showAdvanced = signal(false);
categorias = signal<Categoria[]>([]);
loadingCategorias = signal(false);

// Computed
isFormValid = computed(() => this.productoForm?.valid ?? false);
hasImageSelected = computed(() => this.selectedFile() !== null);
```

### Formulario Reactivo

```typescript
productoForm = this.fb.group({
  // Campos obligatorios
  nombre: ["", [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
  precio: [0, [Validators.required, Validators.min(0.01)]],
  stock: [0, [Validators.required, Validators.min(0)]],
  categoria_id: ["", [Validators.required]],

  // Campos opcionales
  descripcion: ["", [Validators.maxLength(1000)]],
  precio_oferta: [null, [Validators.min(0)]],
  // ... más campos
});
```

## Métodos Principales

### Gestión de Archivos

```typescript
onFileSelected(event: Event): void
removeImage(): void
```

### Utilidades

```typescript
generateSku(): void          // Genera SKU automático
generateSlug(): void         // Preview de slug
hasFieldError(field): boolean // Validación de campos
getFieldError(field): string  // Mensajes de error
```

### Acciones del Formulario

```typescript
onSubmit(): void            // Envío del formulario
resetForm(): void           // Limpiar formulario
cancel(): void              // Cancelar y volver
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
- ✅ Longitud de campos de texto

### Mensajes de Error

```typescript
getFieldError(fieldName: string): string {
  const errors = field.errors;

  if (errors['required']) return `${fieldName} es requerido`;
  if (errors['minlength']) return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
  if (errors['maxlength']) return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
  if (errors['min']) return `Valor mínimo: ${errors['min'].min}`;
  if (errors['precioOfertaMayor']) return 'El precio de oferta debe ser menor al precio normal';
}
```

## Estilos y Animaciones

### Animaciones CSS

- **fadeInScale**: Para preview de imágenes
- **slideInDown**: Para mensajes de error
- **slideInRight**: Para notificaciones de éxito
- **spin**: Para loading spinners

### Estados Visuales

- **Hover effects**: En botones y secciones
- **Focus states**: Para accesibilidad
- **Error states**: Campos con bordes rojos
- **Success states**: Campos válidos con bordes verdes

### Responsive Design

- **Mobile-first**: Diseño adaptativo
- **Grid layouts**: Que se colapsan en móvil
- **Button groups**: Que se apilan verticalmente

## Integración con Backend

### Endpoint Utilizado

```typescript
POST / api / admin / productos;
```

### Formato de Datos

```typescript
interface CreateProductoRequest {
  nombre: string;
  precio: number;
  stock: number;
  categoria_id: number;
  imagen_principal?: File;
  // ... más campos opcionales
}
```

### Manejo de FormData

```typescript
private buildCreateRequest(): CreateProductoRequest {
  const formValue = this.productoForm.value;
  const request: CreateProductoRequest = {
    nombre: formValue.nombre,
    precio: parseFloat(formValue.precio),
    stock: parseInt(formValue.stock),
    categoria_id: parseInt(formValue.categoria_id),
    // ... procesamiento de campos
  };

  if (this.selectedFile()) {
    request.imagen_principal = this.selectedFile()!;
  }

  return request;
}
```

## Uso del Componente

### En Rutas

```typescript
{
  path: 'productos/create',
  component: ProductoCreateComponent
}
```

### Navegación

```typescript
// Desde lista de productos
this.router.navigate(["/admin/productos/create"]);

// Después de crear
this.router.navigate(["/admin/productos"]);
```

## Mejores Prácticas Implementadas

### Angular 17

- ✅ Componente standalone
- ✅ Signals para estado reactivo
- ✅ Control flow syntax (`@if`, `@for`)
- ✅ Inyección de dependencias con `inject()`
- ✅ Effects para validaciones complejas

### TypeScript

- ✅ Tipado estricto
- ✅ Interfaces bien definidas
- ✅ Computed signals
- ✅ Métodos privados documentados

### UX/UI

- ✅ Loading states
- ✅ Error handling
- ✅ Feedback visual inmediato
- ✅ Navegación clara con breadcrumbs
- ✅ Accesibilidad (ARIA labels, focus management)

### Rendimiento

- ✅ Lazy loading de categorías
- ✅ Debounce en validaciones
- ✅ Optimización de re-renders con signals
- ✅ Validación de archivos antes de upload

## Extensiones Futuras

### Funcionalidades Planeadas

- [ ] Drag & drop para imágenes
- [ ] Múltiples imágenes del producto
- [ ] Autocompletado para marcas
- [ ] Integración con servicio de categorías real
- [ ] Modo oscuro
- [ ] Guardado automático como borrador
- [ ] Previsualización del producto

### Mejoras Técnicas

- [ ] Tests unitarios completos
- [ ] Tests de integración
- [ ] Documentación de Storybook
- [ ] Optimización de bundle size
- [ ] PWA capabilities

## Dependencias

### Principales

```json
{
  "@angular/core": "^17.0.0",
  "@angular/forms": "^17.0.0",
  "@angular/router": "^17.0.0",
  "@angular/common": "^17.0.0"
}
```

### Estilos

- **Tailwind CSS**: Framework de utilidades
- **CSS personalizado**: Animaciones y efectos

## Troubleshooting

### Problemas Comunes

#### Error de validación de archivo

```typescript
// Verificar tipo MIME
if (!file.type.startsWith("image/")) {
  alert("Por favor selecciona un archivo de imagen válido");
  return;
}
```

#### Error de formulario no válido

```typescript
// Marcar todos los campos como touched
private markFormGroupTouched(): void {
  Object.keys(this.productoForm.controls).forEach(key => {
    const control = this.productoForm.get(key);
    control?.markAsTouched();
  });
}
```

#### Error de navegación

```typescript
// Verificar rutas en app-routing.module.ts
{
  path: 'admin/productos/create',
  component: ProductoCreateComponent
}
```

## Contribución

Para contribuir al componente:

1. Seguir las convenciones de Angular
2. Mantener tipado estricto
3. Agregar tests para nuevas funcionalidades
4. Documentar cambios en este README
5. Seguir las guías de estilo de Tailwind CSS

## Licencia

Este componente es parte del sistema de administración y sigue la licencia del proyecto principal.
