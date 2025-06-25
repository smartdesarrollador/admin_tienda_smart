import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  computed,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

export interface MetodoPago {
  id: string;
  nombre: string;
  tipo: 'efectivo' | 'tarjeta' | 'transferencia' | 'digital';
  icono: string;
  descripcion: string;
  activo: boolean;
  requiere_datos_adicionales: boolean;
  comision_porcentaje?: number;
  comision_fija?: number;
}

export interface DatosPago {
  metodo_pago_id: string;
  metodo_pago_nombre: string;
  datos_adicionales?: {
    numero_tarjeta?: string;
    nombre_titular?: string;
    fecha_expiracion?: string;
    cvv?: string;
    numero_cuenta?: string;
    banco?: string;
    tipo_cuenta?: string;
    referencia_pago?: string;
    comprobante?: File;
  };
  comision_aplicada: number;
  total_con_comision: number;
}

@Component({
  selector: 'app-metodo-pago-selector',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './metodo-pago-selector.component.html',
  styleUrls: ['./metodo-pago-selector.component.css'],
})
export class MetodoPagoSelectorComponent implements OnInit {
  @Input() total: number = 0;
  @Input() datosPago: DatosPago | null = null;
  @Output() datosPagoChange = new EventEmitter<DatosPago | null>();

  // Signals
  metodosPago = signal<MetodoPago[]>([]);
  metodoSeleccionado = signal<MetodoPago | null>(null);
  mostrarFormularioDatos = signal(false);
  isLoading = signal(false);
  error = signal<string | null>(null);

  // Form controls
  metodoPagoControl = new FormControl('', [Validators.required]);

  datosAdicionales = new FormGroup({
    numero_tarjeta: new FormControl<string | null>(null),
    nombre_titular: new FormControl<string | null>(null),
    fecha_expiracion: new FormControl<string | null>(null),
    cvv: new FormControl<string | null>(null),
    numero_cuenta: new FormControl<string | null>(null),
    banco: new FormControl<string | null>(null),
    tipo_cuenta: new FormControl<string | null>(null),
    referencia_pago: new FormControl<string | null>(null),
    comprobante: new FormControl<File | null>(null),
  });

  // Computed signals
  comisionCalculada = computed(() => {
    const metodo = this.metodoSeleccionado();
    if (!metodo) return 0;

    let comision = 0;
    if (metodo.comision_porcentaje) {
      comision += (this.total * metodo.comision_porcentaje) / 100;
    }
    if (metodo.comision_fija) {
      comision += metodo.comision_fija;
    }
    return comision;
  });

  totalConComision = computed(() => {
    return this.total + this.comisionCalculada();
  });

  ngOnInit() {
    this.cargarMetodosPago();
    this.configurarFormulario();

    if (this.datosPago) {
      this.cargarDatosExistentes();
    }
  }

  private cargarMetodosPago() {
    // Simulamos métodos de pago disponibles
    // En una implementación real, esto vendría de un servicio
    const metodos: MetodoPago[] = [
      {
        id: 'efectivo',
        nombre: 'Efectivo',
        tipo: 'efectivo',
        icono: 'cash',
        descripcion: 'Pago en efectivo al momento de la entrega',
        activo: true,
        requiere_datos_adicionales: false,
      },
      {
        id: 'tarjeta_credito',
        nombre: 'Tarjeta de Crédito',
        tipo: 'tarjeta',
        icono: 'credit-card',
        descripcion: 'Visa, MasterCard, American Express',
        activo: true,
        requiere_datos_adicionales: true,
        comision_porcentaje: 3.5,
      },
      {
        id: 'tarjeta_debito',
        nombre: 'Tarjeta de Débito',
        tipo: 'tarjeta',
        icono: 'credit-card',
        descripcion: 'Débito directo desde tu cuenta bancaria',
        activo: true,
        requiere_datos_adicionales: true,
        comision_porcentaje: 2.0,
      },
      {
        id: 'transferencia',
        nombre: 'Transferencia Bancaria',
        tipo: 'transferencia',
        icono: 'bank',
        descripcion: 'Transferencia directa a nuestra cuenta bancaria',
        activo: true,
        requiere_datos_adicionales: true,
        comision_fija: 5000,
      },
      {
        id: 'pse',
        nombre: 'PSE',
        tipo: 'digital',
        icono: 'globe',
        descripcion: 'Pago seguro en línea',
        activo: true,
        requiere_datos_adicionales: true,
        comision_porcentaje: 2.5,
      },
      {
        id: 'nequi',
        nombre: 'Nequi',
        tipo: 'digital',
        icono: 'mobile',
        descripcion: 'Pago con Nequi',
        activo: true,
        requiere_datos_adicionales: true,
        comision_porcentaje: 1.5,
      },
    ];

    this.metodosPago.set(metodos.filter((m) => m.activo));
  }

  private configurarFormulario() {
    this.metodoPagoControl.valueChanges.subscribe((metodoId) => {
      if (metodoId) {
        const metodo = this.metodosPago().find((m) => m.id === metodoId);
        this.metodoSeleccionado.set(metodo || null);
        this.mostrarFormularioDatos.set(
          metodo?.requiere_datos_adicionales || false
        );
        this.datosAdicionales.reset();
        this.configurarValidacionesDatos(metodo);
        this.emitirCambio();
      } else {
        this.metodoSeleccionado.set(null);
        this.mostrarFormularioDatos.set(false);
        this.datosAdicionales.reset();
      }
    });

    this.datosAdicionales.valueChanges.subscribe(() => {
      this.emitirCambio();
    });
  }

  private configurarValidacionesDatos(metodo: MetodoPago | undefined) {
    // Limpiar validadores existentes
    Object.keys(this.datosAdicionales.controls).forEach((key) => {
      this.datosAdicionales.get(key)?.clearValidators();
      this.datosAdicionales.get(key)?.updateValueAndValidity();
    });

    if (!metodo?.requiere_datos_adicionales) return;

    // Configurar validadores según el tipo de método de pago
    switch (metodo.tipo) {
      case 'tarjeta':
        this.datosAdicionales
          .get('numero_tarjeta')
          ?.setValidators([
            Validators.required,
            Validators.pattern(/^\d{16}$/),
          ]);
        this.datosAdicionales
          .get('nombre_titular')
          ?.setValidators([Validators.required]);
        this.datosAdicionales
          .get('fecha_expiracion')
          ?.setValidators([
            Validators.required,
            Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/),
          ]);
        this.datosAdicionales
          .get('cvv')
          ?.setValidators([
            Validators.required,
            Validators.pattern(/^\d{3,4}$/),
          ]);
        break;

      case 'transferencia':
        this.datosAdicionales
          .get('numero_cuenta')
          ?.setValidators([Validators.required]);
        this.datosAdicionales
          .get('banco')
          ?.setValidators([Validators.required]);
        this.datosAdicionales
          .get('tipo_cuenta')
          ?.setValidators([Validators.required]);
        break;

      case 'digital':
        if (metodo.id === 'pse') {
          this.datosAdicionales
            .get('banco')
            ?.setValidators([Validators.required]);
        }
        this.datosAdicionales
          .get('referencia_pago')
          ?.setValidators([Validators.required]);
        break;
    }

    // Actualizar validaciones
    Object.keys(this.datosAdicionales.controls).forEach((key) => {
      this.datosAdicionales.get(key)?.updateValueAndValidity();
    });
  }

  private cargarDatosExistentes() {
    if (this.datosPago) {
      this.metodoPagoControl.setValue(this.datosPago.metodo_pago_id);
      const metodo = this.metodosPago().find(
        (m) => m.id === this.datosPago?.metodo_pago_id
      );
      this.metodoSeleccionado.set(metodo || null);
      this.mostrarFormularioDatos.set(
        metodo?.requiere_datos_adicionales || false
      );

      if (this.datosPago.datos_adicionales) {
        const { comprobante, ...otrosDatos } = this.datosPago.datos_adicionales;
        this.datosAdicionales.patchValue(otrosDatos);
        if (comprobante instanceof File) {
          this.datosAdicionales.get('comprobante')?.setValue(comprobante);
        }
      }
      this.configurarValidacionesDatos(metodo);
    }
  }

  private emitirCambio(): void {
    if (!this.metodoSeleccionado()) {
      this.datosPagoChange.emit(null);
      return;
    }

    const rawFormValues = this.datosAdicionales.getRawValue();

    let comprobanteFinal: File | undefined = undefined;
    if (rawFormValues.comprobante instanceof File) {
      comprobanteFinal = rawFormValues.comprobante;
    }

    // Convertir null a undefined para compatibilidad de tipos con DatosPago
    const datosAdicionalesFinal = this.mostrarFormularioDatos()
      ? {
          numero_tarjeta: rawFormValues.numero_tarjeta ?? undefined,
          nombre_titular: rawFormValues.nombre_titular ?? undefined,
          fecha_expiracion: rawFormValues.fecha_expiracion ?? undefined,
          cvv: rawFormValues.cvv ?? undefined,
          numero_cuenta: rawFormValues.numero_cuenta ?? undefined,
          banco: rawFormValues.banco ?? undefined,
          tipo_cuenta: rawFormValues.tipo_cuenta ?? undefined,
          referencia_pago: rawFormValues.referencia_pago ?? undefined,
          comprobante: comprobanteFinal,
        }
      : undefined;

    const datosEmitidos: DatosPago = {
      metodo_pago_id: this.metodoSeleccionado()!.id,
      metodo_pago_nombre: this.metodoSeleccionado()!.nombre,
      datos_adicionales: datosAdicionalesFinal,
      comision_aplicada: this.comisionCalculada(),
      total_con_comision: this.totalConComision(),
    };
    this.datosPagoChange.emit(datosEmitidos);
  }

  seleccionarMetodo(metodo: MetodoPago) {
    this.metodoPagoControl.setValue(metodo.id);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.datosAdicionales.patchValue({ comprobante: null }); // Simplificado por ahora
      this.emitirCambio();
    }
  }

  formatearMoneda(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(valor);
  }

  formatearTarjeta(numero: string): string {
    return numero.replace(/(\d{4})(?=\d)/g, '$1 ');
  }

  validarFormulario(): boolean {
    if (!this.metodoPagoControl.valid) return false;

    const metodo = this.metodoSeleccionado();
    if (metodo?.requiere_datos_adicionales) {
      return this.datosAdicionales.valid;
    }

    return true;
  }

  obtenerIconoMetodo(tipo: string): string {
    const iconos = {
      efectivo:
        'M12 2C13.1 2 14 2.9 14 4V8C14 9.1 13.1 10 12 10H4C2.9 10 2 9.1 2 8V4C2 2.9 2.9 2 4 2H12M12 4H4V8H12V4M21 6V20C21 21.1 20.1 22 19 22H5C3.9 22 3 21.1 3 20V18H19V6H21Z',
      tarjeta:
        'M20 4H4C2.89 4 2 4.89 2 6V18C2 19.11 2.89 20 4 20H20C21.11 20 22 19.11 22 18V6C22 4.89 21.11 4 20 4M20 18H4V12H20V18M20 8H4V6H20V8',
      transferencia:
        'M5,6H23V18H5V16H21V8H5V6M14,10V12H16V15H18V12H20V10H14M2,4V20H4V4H2Z',
      digital:
        'M17,7H22V17H17V19C17,20.11 16.11,21 15,21H5C3.89,21 3,20.11 3,19V5C3,3.89 3.89,3 5,3H15C16.11,3 17,3.89 17,5V7M7,9V11H9V9H7M7,13V15H9V13H7M11,9V11H13V9H11M11,13V15H13V13H11Z',
    };
    return iconos[tipo as keyof typeof iconos] || iconos.digital;
  }
}
