import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TotalesCalculados {
  subtotal: number;
  descuentoCupon: number;
  descuentoItems: number;
  impuestos: number;
  envio: number;
  total: number;
}

/**
 * Componente para mostrar el cálculo de totales del pedido
 * Muestra desglose detallado de subtotal, descuentos, impuestos y total
 */
@Component({
  selector: 'app-totales-calculator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './totales-calculator.component.html',
  styleUrls: ['./totales-calculator.component.css'],
})
export class TotalesCalculatorComponent {
  @Input() totales: TotalesCalculados = {
    subtotal: 0,
    descuentoCupon: 0,
    descuentoItems: 0,
    impuestos: 0,
    envio: 0,
    total: 0,
  };

  @Input() readonly: boolean = false;
  @Input() showDetails: boolean = true;

  // Computed para valores formateados
  subtotalFormatted = computed(() =>
    this.formatCurrency(this.totales.subtotal)
  );
  descuentoTotalFormatted = computed(() =>
    this.formatCurrency(
      this.totales.descuentoCupon + this.totales.descuentoItems
    )
  );
  impuestosFormatted = computed(() =>
    this.formatCurrency(this.totales.impuestos)
  );
  envioFormatted = computed(() => this.formatCurrency(this.totales.envio));
  totalFormatted = computed(() => this.formatCurrency(this.totales.total));

  // Computed para verificar si hay descuentos
  hasDescuentos = computed(
    () => this.totales.descuentoCupon > 0 || this.totales.descuentoItems > 0
  );

  hasEnvio = computed(() => this.totales.envio > 0);
  hasImpuestos = computed(() => this.totales.impuestos > 0);

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
   * Obtiene el porcentaje de descuento
   */
  getDescuentoPorcentaje(): number {
    if (this.totales.subtotal === 0) return 0;
    const descuentoTotal =
      this.totales.descuentoCupon + this.totales.descuentoItems;
    return (descuentoTotal / this.totales.subtotal) * 100;
  }

  /**
   * Obtiene el porcentaje de impuestos
   */
  getImpuestoPorcentaje(): number {
    const baseImponible =
      this.totales.subtotal -
      this.totales.descuentoCupon -
      this.totales.descuentoItems;
    if (baseImponible === 0) return 0;
    return (this.totales.impuestos / baseImponible) * 100;
  }
}
