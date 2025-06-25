import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface PedidoItem {
  id?: number;
  producto_id: number;
  variacion_producto_id?: number;
  cantidad: number;
  precio_unitario: number;
  descuento: number;
  subtotal: number;
  producto?: any;
  variacion?: any;
}

/**
 * Componente para gestionar los items/productos del pedido
 * Permite agregar, editar y eliminar productos del pedido
 */
@Component({
  selector: 'app-items-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './items-manager.component.html',
  styleUrls: ['./items-manager.component.css'],
})
export class ItemsManagerComponent {
  @Input() items: PedidoItem[] = [];
  @Input() clienteId: number | null = null;
  @Output() itemsChanged = new EventEmitter<PedidoItem[]>();

  // Signals para estado del componente
  showAddForm = signal(false);
  isLoading = signal(false);
  searchTerm = signal('');

  // Computed signals
  totalItems = computed(() =>
    this.items.reduce((sum, item) => sum + item.cantidad, 0)
  );

  subtotalItems = computed(() =>
    this.items.reduce((sum, item) => sum + item.subtotal, 0)
  );

  hasItems = computed(() => this.items.length > 0);

  /**
   * Agrega un nuevo item al pedido
   */
  addItem(itemData: Partial<PedidoItem>): void {
    const newItem: PedidoItem = {
      producto_id: itemData.producto_id || 0,
      variacion_producto_id: itemData.variacion_producto_id,
      cantidad: itemData.cantidad || 1,
      precio_unitario: itemData.precio_unitario || 0,
      descuento: itemData.descuento || 0,
      subtotal: this.calculateSubtotal(
        itemData.cantidad || 1,
        itemData.precio_unitario || 0,
        itemData.descuento || 0
      ),
      producto: itemData.producto,
      variacion: itemData.variacion,
    };

    const updatedItems = [...this.items, newItem];
    this.itemsChanged.emit(updatedItems);
    this.showAddForm.set(false);
  }

  /**
   * Actualiza un item existente
   */
  updateItem(index: number, updates: Partial<PedidoItem>): void {
    const updatedItems = [...this.items];
    const currentItem = updatedItems[index];

    updatedItems[index] = {
      ...currentItem,
      ...updates,
      subtotal: this.calculateSubtotal(
        updates.cantidad ?? currentItem.cantidad,
        updates.precio_unitario ?? currentItem.precio_unitario,
        updates.descuento ?? currentItem.descuento
      ),
    };

    this.itemsChanged.emit(updatedItems);
  }

  /**
   * Elimina un item del pedido
   */
  removeItem(index: number): void {
    const updatedItems = this.items.filter((_, i) => i !== index);
    this.itemsChanged.emit(updatedItems);
  }

  /**
   * Calcula el subtotal de un item
   */
  private calculateSubtotal(
    cantidad: number,
    precio: number,
    descuento: number
  ): number {
    const subtotal = cantidad * precio;
    const descuentoTotal = descuento * cantidad;
    return Math.max(0, subtotal - descuentoTotal);
  }

  /**
   * Muestra el formulario para agregar item
   */
  showAddItemForm(): void {
    this.showAddForm.set(true);
  }

  /**
   * Oculta el formulario para agregar item
   */
  hideAddItemForm(): void {
    this.showAddForm.set(false);
  }

  /**
   * Formatea valores monetarios
   */
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2,
    }).format(value);
  }

  /**
   * Obtiene el nombre del producto
   */
  getProductName(item: PedidoItem): string {
    return item.producto?.nombre || `Producto #${item.producto_id}`;
  }

  /**
   * Track by function para items
   */
  trackByItemId(index: number, item: PedidoItem): number {
    return item.id || index;
  }
}
