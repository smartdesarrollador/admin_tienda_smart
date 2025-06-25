import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  signal,
  computed,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';

import { Cupon } from '../../../../../../core/models/cupon.model';

export interface CuponAplicado {
  cupon: Cupon;
  descuento_aplicado: number;
}

@Component({
  selector: 'app-cupon-aplicator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cupon-aplicator.component.html',
  styleUrls: ['./cupon-aplicator.component.css'],
})
export class CuponAplicatorComponent implements OnInit, OnDestroy {
  @Input() subtotal: number = 0;
  @Input() cuponesAplicadosEntrada: CuponAplicado[] = [];
  @Output() cuponesChange = new EventEmitter<CuponAplicado[]>();

  private readonly destroy$ = new Subject<void>();

  // Signals
  isLoading = signal(false);
  error = signal<string | null>(null);
  codigoCupon = signal('');
  cuponesDisponibles = signal<Cupon[]>([]);
  cuponesAplicadosData = signal<CuponAplicado[]>([]);

  // Computed signals
  totalDescuento = computed(() =>
    this.cuponesAplicadosData().reduce(
      (sum, c) => sum + c.descuento_aplicado,
      0
    )
  );

  ngOnInit(): void {
    this.loadCuponesDisponibles();
    this.cuponesAplicadosData.set(this.cuponesAplicadosEntrada);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCuponesDisponibles(): void {
    // Mock data por ahora
    const mockCupones: Cupon[] = [
      {
        id: 1,
        codigo: 'DESCUENTO10',
        descripcion: 'Descuento del 10%',
        tipo: 'porcentaje',
        descuento: 10,
        fecha_inicio: new Date().toISOString(),
        fecha_fin: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        activo: true,
        limite_uso: 100,
        usos: 5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        esta_vigente: true,
        puede_usarse: true,
        dias_restantes: 30,
        usos_restantes: 95,
        porcentaje_uso: 5,
        descuento_formateado: '10%',
        tipo_detallado: {
          codigo: 'porcentaje',
          nombre: 'Porcentaje',
          simbolo: '%',
        },
        periodo_vigencia: {
          inicio: new Date().toLocaleDateString(),
          fin: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toLocaleDateString(),
          inicio_formateado: 'Hoy',
          fin_formateado: 'En 30 días',
        },
      },
    ];
    this.cuponesDisponibles.set(mockCupones);
  }

  buscarPorCodigo(): void {
    const codigo = this.codigoCupon().trim();
    if (!codigo) return;

    this.isLoading.set(true);
    this.error.set(null);

    // Simular búsqueda
    setTimeout(() => {
      const cuponEncontrado = this.cuponesDisponibles().find(
        (c) => c.codigo.toLowerCase() === codigo.toLowerCase()
      );

      if (cuponEncontrado) {
        this.aplicarCupon(cuponEncontrado);
        this.codigoCupon.set('');
      } else {
        this.error.set('Cupón no encontrado o no válido');
      }

      this.isLoading.set(false);
    }, 1000);
  }

  aplicarCupon(cupon: Cupon): void {
    const cuponesActuales = this.cuponesAplicadosData();
    const yaAplicado = cuponesActuales.find((c) => c.cupon.id === cupon.id);

    if (yaAplicado) {
      this.error.set('Este cupón ya está aplicado');
      return;
    }

    // Calcular el descuento real basado en el subtotal y el tipo de cupón
    let descuentoReal = 0;
    if (cupon.tipo === 'porcentaje') {
      descuentoReal = (this.subtotal * cupon.descuento) / 100;
    } else if (cupon.tipo === 'fijo') {
      descuentoReal = cupon.descuento;
    }
    // Asegurarse que el descuento no sea mayor al subtotal
    descuentoReal = Math.min(descuentoReal, this.subtotal);

    const cuponAplicado: CuponAplicado = {
      cupon,
      descuento_aplicado: descuentoReal,
    };

    const nuevosAplicados = [...cuponesActuales, cuponAplicado];
    this.cuponesAplicadosData.set(nuevosAplicados);
    this.cuponesChange.emit(nuevosAplicados);
    this.error.set(null);
  }

  removerCupon(cuponId: number): void {
    const cuponesActuales = this.cuponesAplicadosData();
    const nuevosAplicados = cuponesActuales.filter(
      (c) => c.cupon.id !== cuponId
    );
    this.cuponesAplicadosData.set(nuevosAplicados);
    this.cuponesChange.emit(nuevosAplicados);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2,
    }).format(value);
  }

  // Nuevo método para verificar si un cupón está aplicado
  isCuponAplicado(cuponId: number): boolean {
    return this.cuponesAplicadosData().some((c) => c.cupon.id === cuponId);
  }

  // Propiedades que faltaban para el template
  get codigoCuponControl() {
    // Simulación de un FormControl
    return {
      value: this.codigoCupon(),
      reset: () => this.codigoCupon.set(''),
    };
  }

  get subtotalConDescuento(): number {
    // Simulación de un computed signal
    return this.subtotal - this.totalDescuento();
  }

  formatearDescuento(cuponAplicado: CuponAplicado): string {
    if (cuponAplicado.cupon.tipo === 'porcentaje') {
      return `${cuponAplicado.cupon.descuento}%`;
    }
    return `${this.formatCurrency(cuponAplicado.cupon.descuento)}`;
  }
}
