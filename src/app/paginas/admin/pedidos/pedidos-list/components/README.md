# Componentes de Pedidos

Este directorio contiene los componentes reutilizables para la gestión de pedidos en el administrador.

## Componentes Disponibles

### 1. PedidoCardComponent (`pedido-card/`)

**Propósito**: Muestra un pedido en formato de tarjeta para vista responsive.

**Características**:

- Diseño responsive con información completa del pedido
- Checkbox de selección integrado
- Estados visuales con colores específicos
- Botones de acción inline (ver, editar, eliminar)
- Información del cliente y detalles del pedido
- Soporte para código de rastreo y canal de venta

**Uso**:

```html
<app-pedido-card [pedido]="pedido" [selected]="isSelected" (selectionChange)="onSelectionChange($event)" (view)="onViewPedido()" (edit)="onEditPedido()" (delete)="onDeletePedido()" />
```

**Inputs**:

- `pedido: Pedido` (requerido) - Datos del pedido
- `selected: boolean` - Estado de selección

**Outputs**:

- `selectionChange: boolean` - Cambio en la selección
- `view: void` - Evento de visualización
- `edit: void` - Evento de edición
- `delete: void` - Evento de eliminación

### 2. PedidoStatusBadgeComponent (`pedido-status-badge/`)

**Propósito**: Muestra el estado de un pedido con badge visual y colores específicos.

**Características**:

- Colores específicos para cada estado
- Iconos SVG para cada estado
- Tres tamaños disponibles (sm, md, lg)
- Animaciones suaves
- Soporte para mostrar/ocultar iconos

**Uso**:

```html
<app-pedido-status-badge [estado]="pedido.estado" [size]="'md'" [showIcon]="true" />
```

**Inputs**:

- `estado: EstadoPedido` (requerido) - Estado del pedido
- `size: 'sm' | 'md' | 'lg'` - Tamaño del badge (default: 'md')
- `showIcon: boolean` - Mostrar icono (default: true)

**Estados Soportados**:

- `pendiente` - Amarillo con icono de reloj
- `aprobado` - Azul con icono de check
- `rechazado` - Rojo con icono de X
- `en_proceso` - Índigo con icono de rayo
- `enviado` - Púrpura con icono de avión
- `entregado` - Verde con icono de check
- `cancelado` - Rojo con icono de X
- `devuelto` - Gris con icono de flecha

### 3. PedidoActionsComponent (`pedido-actions/`)

**Propósito**: Proporciona botones de acción para cada pedido con lógica de permisos.

**Características**:

- Botones contextuales según el estado del pedido
- Dropdown para cambio de estados
- Modo compacto para espacios reducidos
- Acciones adicionales (duplicar, imprimir, exportar)
- Validación de permisos por estado
- Tooltips informativos

**Uso**:

```html
<app-pedido-actions [pedido]="pedido" [compact]="false" [showEstadoActions]="true" [showDeleteAction]="true" [showMoreActions]="false" (view)="onView()" (edit)="onEdit()" (delete)="onDelete()" (changeEstado)="onChangeEstado($event)" (duplicate)="onDuplicate()" (print)="onPrint()" (export)="onExport()" />
```

**Inputs**:

- `pedido: Pedido` (requerido) - Datos del pedido
- `compact: boolean` - Modo compacto (default: false)
- `showEstadoActions: boolean` - Mostrar acciones de estado (default: true)
- `showDeleteAction: boolean` - Mostrar acción de eliminar (default: true)
- `showMoreActions: boolean` - Mostrar más acciones (default: false)

**Outputs**:

- `view: void` - Ver detalles
- `edit: void` - Editar pedido
- `delete: void` - Eliminar pedido
- `changeEstado: EstadoPedido` - Cambiar estado
- `duplicate: void` - Duplicar pedido
- `print: void` - Imprimir pedido
- `export: void` - Exportar pedido

**Lógica de Permisos**:

- **Editar**: Solo pedidos en estado 'pendiente' o 'aprobado'
- **Cambiar Estado**: Todos excepto 'cancelado' y 'devuelto'
- **Eliminar**: Solo pedidos en estado 'pendiente', 'rechazado' o 'cancelado'

### 4. PedidoFiltersComponent (`pedido-filters/`)

**Propósito**: Panel de filtros avanzados para la lista de pedidos.

**Características**:

- 11 campos de filtrado diferentes
- Filtros rápidos predefinidos (hoy, semana, mes, pendientes)
- Debounce en campos de búsqueda
- Panel colapsible
- Contador de filtros activos
- Validación de rangos de fechas y montos

**Uso**:

```html
<app-pedido-filters [initialFilters]="currentFilters" [collapsed]="false" (filtersChange)="onFiltersChange($event)" (filtersApply)="onFiltersApply($event)" (filtersClear)="onFiltersClear()" />
```

**Inputs**:

- `initialFilters: PedidoFilters` - Filtros iniciales
- `collapsed: boolean` - Estado inicial colapsado (default: false)

**Outputs**:

- `filtersChange: PedidoFilters` - Cambios en filtros (con debounce)
- `filtersApply: PedidoFilters` - Aplicar filtros manualmente
- `filtersClear: void` - Limpiar todos los filtros

**Filtros Disponibles**:

- **ID Cliente**: Búsqueda por ID de usuario
- **Estado**: Selector de estado del pedido
- **Tipo de Pago**: Selector de método de pago
- **Canal de Venta**: Selector de canal
- **Rango de Fechas**: Desde y hasta
- **Rango de Montos**: Mínimo y máximo
- **Código de Rastreo**: Búsqueda de texto
- **Ordenamiento**: Campo y dirección
- **Paginación**: Elementos por página

**Filtros Rápidos**:

- **Hoy**: Pedidos de hoy
- **Esta semana**: Pedidos de la semana actual
- **Este mes**: Pedidos del mes actual
- **Pendientes**: Solo pedidos pendientes

## Tecnologías Utilizadas

### Angular 17

- **Signals**: Para estado reactivo
- **Computed Signals**: Para valores derivados
- **Control Flow Syntax**: @if, @for para lógica de template
- **Standalone Components**: Componentes independientes
- **Reactive Forms**: Para formularios complejos

### Tailwind CSS

- **Utility Classes**: Para estilos rápidos y consistentes
- **Responsive Design**: Mobile-first approach
- **Color Palette**: Colores semánticos por estado
- **Animations**: Transiciones suaves
- **Focus States**: Accesibilidad mejorada

### RxJS

- **Debounce**: Para optimizar búsquedas
- **Distinct Until Changed**: Evitar emisiones duplicadas
- **BehaviorSubject**: Para estado compartido

## Patrones de Diseño

### Container/Presentational

- Componentes padre manejan lógica de negocio
- Componentes hijo solo presentan datos
- Comunicación vía @Input/@Output

### Reactive Programming

- Uso de Observables para datos asíncronos
- Signals para estado local reactivo
- Effects para efectos secundarios

### Composition over Inheritance

- Componentes pequeños y reutilizables
- Composición de funcionalidades
- Interfaces bien definidas

## Mejores Prácticas Implementadas

### Performance

- OnPush change detection donde aplicable
- TrackBy functions en \*ngFor
- Lazy loading de componentes
- Debounce en búsquedas

### Accesibilidad

- Etiquetas ARIA apropiadas
- Navegación por teclado
- Contraste de colores adecuado
- Tooltips informativos

### Mantenibilidad

- Código autodocumentado
- Interfaces TypeScript estrictas
- Separación de responsabilidades
- Testing-friendly architecture

### UX/UI

- Feedback visual inmediato
- Estados de carga
- Animaciones suaves
- Diseño responsive

## Estructura de Archivos

```
components/
├── pedido-card/
│   └── pedido-card.component.ts
├── pedido-status-badge/
│   └── pedido-status-badge.component.ts
├── pedido-actions/
│   └── pedido-actions.component.ts
├── pedido-filters/
│   └── pedido-filters.component.ts
├── index.ts                    # Exportaciones
└── README.md                   # Esta documentación
```

## Próximos Pasos

1. **Testing**: Implementar tests unitarios para cada componente
2. **Storybook**: Crear stories para documentación visual
3. **Internacionalización**: Agregar soporte i18n
4. **Optimización**: Implementar virtual scrolling para listas grandes
5. **Accesibilidad**: Auditoría completa de accesibilidad

## Contribución

Al modificar estos componentes, asegúrate de:

1. Mantener la compatibilidad con las interfaces existentes
2. Actualizar la documentación si cambias las APIs
3. Seguir las convenciones de naming establecidas
4. Agregar tests para nuevas funcionalidades
5. Verificar el diseño responsive en diferentes dispositivos
