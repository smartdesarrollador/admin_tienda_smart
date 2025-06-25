import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  Pedido,
  DetallePedido,
} from '../../../../../../core/models/pedido.interface';

/**
 * Componente para mostrar el detalle de los items/productos del pedido
 * Incluye información de productos, cantidades, precios y totales
 */
@Component({
  selector: 'app-items-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './items-detail.component.html',
  styleUrls: ['./items-detail.component.css'],
})
export class ItemsDetailComponent {
  @Input({ required: true }) pedido!: Pedido;

  // Computed signals para información derivada
  items = computed(() => {
    return this.pedido?.detalles || [];
  });

  totalItems = computed(() => {
    return this.items().reduce((total, item) => total + item.cantidad, 0);
  });

  subtotalItems = computed(() => {
    return this.items().reduce(
      (total, item) => total + item.precio_unitario * item.cantidad,
      0
    );
  });

  descuentoTotalItems = computed(() => {
    return this.items().reduce((total, item) => {
      const descuentoItem = item.descuento || 0;
      return total + descuentoItem;
    }, 0);
  });

  totalFinalItems = computed(() => {
    return this.subtotalItems() - this.descuentoTotalItems();
  });

  // Estadísticas de productos
  productosUnicos = computed(() => {
    return this.items().length;
  });

  /**
   * Calcula el subtotal de un item
   */
  getItemSubtotal(item: DetallePedido): number {
    return item.precio_unitario * item.cantidad;
  }

  /**
   * Calcula el descuento total de un item
   */
  getItemDescuento(item: DetallePedido): number {
    return item.descuento || 0;
  }

  /**
   * Calcula el total final de un item
   */
  getItemTotal(item: DetallePedido): number {
    return this.getItemSubtotal(item) - this.getItemDescuento(item);
  }

  /**
   * Obtiene el porcentaje de descuento de un item
   */
  getItemDescuentoPorcentaje(item: DetallePedido): number {
    const descuento = item.descuento || 0;
    if (!descuento || item.precio_unitario === 0) return 0;
    const subtotal = this.getItemSubtotal(item);
    return (descuento / subtotal) * 100;
  }

  /**
   * Verifica si un item tiene descuento
   */
  hasItemDescuento(item: DetallePedido): boolean {
    return (item.descuento || 0) > 0;
  }

  /**
   * Obtiene la URL de la imagen del producto
   */
  getProductImageUrl(item: DetallePedido): string {
    // Si el producto tiene imagen principal
    if (item.producto?.imagen_principal) {
      return item.producto.imagen_principal;
    }

    // Imagen por defecto
    return '/assets/images/product-placeholder.png';
  }

  /**
   * Obtiene el nombre completo del producto con variación
   */
  getProductFullName(item: DetallePedido): string {
    let nombre = item.producto?.nombre || 'Producto sin nombre';

    // Si hay variación, agregar información del SKU
    if (item.variacion && item.variacion.sku) {
      nombre += ` (${item.variacion.sku})`;
    }

    return nombre;
  }

  /**
   * Obtiene información adicional de la variación
   */
  getVariationInfo(item: DetallePedido): string {
    if (!item.variacion) return '';
    return item.variacion.nombre || item.variacion.sku || '';
  }

  /**
   * Obtiene el SKU del producto o variación
   */
  getProductSku(item: DetallePedido): string {
    return item.variacion?.sku || item.producto?.sku || 'N/A';
  }

  /**
   * Verifica si hay stock suficiente (información no disponible en pedidos)
   */
  hasStockIssue(item: DetallePedido): boolean {
    // En pedidos ya procesados, no tenemos información de stock actual
    return false;
  }

  /**
   * Obtiene el stock disponible (información no disponible en pedidos)
   */
  getAvailableStock(item: DetallePedido): number {
    // En pedidos ya procesados, no tenemos información de stock actual
    return 0;
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
   * Formatea porcentajes
   */
  formatPercentage(value: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }).format(value / 100);
  }

  /**
   * Track by function para items
   */
  trackByItemId(index: number, item: DetallePedido): number {
    return item.id;
  }

  /**
   * Maneja el error de carga de imagen
   */
  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = '/assets/productos/default.jpg';
  }
}
