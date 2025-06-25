import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
  inject,
  signal,
  computed,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import {
  Pedido,
  CreatePedidoDto,
  UpdatePedidoDto,
  EstadoPedido,
  TipoPago,
  TipoEntrega,
  CanalVenta,
  Moneda,
} from '../../../../core/models/pedido.interface';
import { User } from '../../../../core/models/user.model';
import { Producto } from '../../../../core/models/producto.interface';
import { Cupon } from '../../../../core/models/cupon.model';

import { PedidoService } from '../../../../core/services/pedido.service';
import { UsuariosService } from '../../../../core/services/usuarios.service';
import { ProductoService } from '../../../../core/services/producto.service';
import { CuponesService } from '../../../../core/services/cupones.service';

// Componentes hijos
import { ClienteSelectorComponent } from './components/cliente-selector/cliente-selector.component';
import { ItemsManagerComponent } from './components/items-manager/items-manager.component';
import {
  CuponAplicatorComponent,
  CuponAplicado,
} from './components/cupon-aplicator/cupon-aplicator.component';
import { TotalesCalculatorComponent } from './components/totales-calculator/totales-calculator.component';
import {
  MetodoPagoSelectorComponent,
  DatosPago,
} from './components/metodo-pago-selector/metodo-pago-selector.component';

export interface PedidoFormData {
  cliente: User | null;
  items: PedidoItem[];
  cupon: Cupon | null;
  metodoPago: TipoPago | null;
  tipoEntrega: TipoEntrega;
  canalVenta: CanalVenta;
  observaciones: string;
  direccionEntrega: DireccionEntrega | null;
  fechaEntrega: string | null;
  horaInicioVentana: string | null;
  horaFinVentana: string | null;
  datosEnvio: any;
  datosCliente: any;
}

export interface PedidoItem {
  id?: number;
  producto_id: number;
  variacion_producto_id?: number;
  cantidad: number;
  precio_unitario: number;
  descuento: number;
  subtotal: number;
  producto?: Producto | any;
  variacion?: any;
}

export interface DireccionEntrega {
  direccion: string;
  telefono: string;
  referencia: string;
  latitud?: number;
  longitud?: number;
  zona_reparto_id?: number;
  costo_envio_calculado?: number;
}

export interface TotalesCalculados {
  subtotal: number;
  descuentoCupon: number;
  descuentoItems: number;
  descuentoTotal: number;
  impuestos: number;
  igv: number;
  envio: number;
  total: number;
  totalConDescuento: number;
}

/**
 * Componente para crear y editar pedidos
 * Incluye selección de cliente, gestión de items, aplicación de cupones,
 * configuración de entrega y cálculo de totales
 */
@Component({
  selector: 'app-pedido-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    ClienteSelectorComponent,
    ItemsManagerComponent,
    CuponAplicatorComponent,
    TotalesCalculatorComponent,
    MetodoPagoSelectorComponent,
  ],
  templateUrl: './pedido-form.component.html',
  styleUrls: ['./pedido-form.component.css'],
})
export class PedidoFormComponent implements OnInit, OnDestroy {
  @Input() pedidoId: number | null = null;
  @Output() pedidoCreated = new EventEmitter<Pedido>();
  @Output() pedidoUpdated = new EventEmitter<Pedido>();
  @Output() cancelled = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly pedidoService = inject(PedidoService);
  private readonly usuariosService = inject(UsuariosService);
  private readonly productoService = inject(ProductoService);
  private readonly cuponesService = inject(CuponesService);
  private readonly destroy$ = new Subject<void>();

  // Signals para estado del formulario
  isLoading = signal(false);
  isSaving = signal(false);
  isEditing = signal(false);
  currentStep = signal(1);
  formValid = signal(false);

  // Signals para datos del formulario
  selectedCliente = signal<User | null>(null);
  pedidoItems = signal<PedidoItem[]>([]);
  selectedCupon = signal<Cupon | null>(null);
  selectedMetodoPago = signal<TipoPago | null>(null);
  selectedTipoEntrega = signal<TipoEntrega>('delivery');
  selectedCanalVenta = signal<CanalVenta>('web');
  direccionEntrega = signal<DireccionEntrega | null>(null);
  datosEnvio = signal<any>(null);
  datosCliente = signal<any>(null);

  // Signals para cálculos
  totalesCalculados = signal<TotalesCalculados>({
    subtotal: 0,
    descuentoCupon: 0,
    descuentoItems: 0,
    descuentoTotal: 0,
    impuestos: 0,
    igv: 0,
    envio: 0,
    total: 0,
    totalConDescuento: 0,
  });

  // Formulario reactivo
  pedidoForm: FormGroup;

  // Computed signals
  hasItems = computed(() => this.pedidoItems().length > 0);
  hasCliente = computed(() => this.selectedCliente() !== null);
  canProceedToPayment = computed(() => this.hasCliente() && this.hasItems());
  totalItems = computed(() =>
    this.pedidoItems().reduce((sum, item) => sum + item.cantidad, 0)
  );

  needsDeliveryAddress = computed(
    () => this.selectedTipoEntrega() === 'delivery'
  );

  canProceedToDelivery = computed(() => {
    const tipoEntrega = this.selectedTipoEntrega();
    if (tipoEntrega === 'recojo_tienda') return true;

    const direccion = this.direccionEntrega();
    return direccion !== null && direccion.direccion.trim() !== '';
  });

  // Opciones para selects expandidas
  readonly estadosOptions = [
    { value: 'pendiente' as EstadoPedido, label: 'Pendiente' },
    { value: 'aprobado' as EstadoPedido, label: 'Aprobado' },
    { value: 'en_proceso' as EstadoPedido, label: 'En Proceso' },
    { value: 'enviado' as EstadoPedido, label: 'Enviado' },
    { value: 'entregado' as EstadoPedido, label: 'Entregado' },
  ];

  readonly tiposEntregaOptions = [
    { value: 'delivery' as TipoEntrega, label: 'Delivery', icon: 'truck' },
    {
      value: 'recojo_tienda' as TipoEntrega,
      label: 'Recojo en Tienda',
      icon: 'building-storefront',
    },
  ];

  readonly canalesVentaOptions = [
    { value: 'web' as CanalVenta, label: 'Tienda Web' },
    { value: 'app' as CanalVenta, label: 'App Móvil' },
    { value: 'tienda_fisica' as CanalVenta, label: 'Tienda Física' },
    { value: 'telefono' as CanalVenta, label: 'Teléfono' },
    { value: 'whatsapp' as CanalVenta, label: 'WhatsApp' },
  ];

  readonly monedasOptions = [
    { value: 'PEN' as Moneda, label: 'Soles (S/)', symbol: 'S/' },
    { value: 'USD' as Moneda, label: 'Dólares ($)', symbol: '$' },
    { value: 'EUR' as Moneda, label: 'Euros (€)', symbol: '€' },
  ];

  readonly pasos = [
    {
      numero: 1,
      titulo: 'Cliente',
      descripcion: 'Seleccionar cliente',
      icono:
        'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    },
    {
      numero: 2,
      titulo: 'Productos',
      descripcion: 'Agregar productos',
      icono: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    },
    {
      numero: 3,
      titulo: 'Entrega',
      descripcion: 'Configurar entrega',
      icono:
        'M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
      numero: 4,
      titulo: 'Descuentos',
      descripcion: 'Aplicar cupones',
      icono:
        'M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h3a1 1 0 110 2h-1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 010-2h4z',
    },
    {
      numero: 5,
      titulo: 'Pago',
      descripcion: 'Método de pago',
      icono:
        'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
    },
    {
      numero: 6,
      titulo: 'Confirmación',
      descripcion: 'Revisar y confirmar',
      icono: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    },
  ];

  constructor() {
    this.pedidoForm = this.createForm();
    this.setupFormValidation();
    this.setupCalculations();
  }

  ngOnInit(): void {
    this.checkEditMode();
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Crea el formulario reactivo expandido
   */
  private createForm(): FormGroup {
    return this.fb.group({
      // Campos básicos
      user_id: [null, [Validators.required]],
      estado: ['pendiente', [Validators.required]],
      tipo_pago: [null, [Validators.required]],
      tipo_entrega: ['delivery', [Validators.required]],
      canal_venta: ['web', [Validators.required]],
      moneda: ['PEN', [Validators.required]],

      // Totales
      subtotal: [0, [Validators.required, Validators.min(0)]],
      descuento: [0, [Validators.min(0)]],
      descuento_total: [0, [Validators.min(0)]],
      impuesto: [0, [Validators.min(0)]],
      igv: [0, [Validators.min(0)]],
      costo_envio: [0, [Validators.min(0)]],
      total: [0, [Validators.required, Validators.min(0)]],

      // Crédito
      cuotas: [null],
      monto_cuota: [null],
      interes_total: [null],

      // Información adicional
      observaciones: [''],
      cupon_codigo: [null],

      // Dirección y entrega
      direccion_entrega: [''],
      telefono_entrega: [''],
      referencia_entrega: [''],
      latitud_entrega: [null],
      longitud_entrega: [null],
      zona_reparto_id: [null],

      // Programación
      fecha_entrega_programada: [null],
      tiempo_entrega_estimado: [null],

      // Rastreo
      codigo_rastreo: [''],

      // Datos JSON
      datos_envio: [null],
      datos_cliente: [null],
      metodo_envio: [null],

      // Método de pago
      metodo_pago_id: [null],

      // Items
      items: this.fb.array([]),
    });
  }

  /**
   * Configura la validación del formulario
   */
  private setupFormValidation(): void {
    effect(() => {
      const hasCliente = this.hasCliente();
      const hasItems = this.hasItems();
      const metodoPago = this.selectedMetodoPago();
      const tipoEntrega = this.selectedTipoEntrega();
      const canProceedToDelivery = this.canProceedToDelivery();

      let isValid = hasCliente && hasItems && metodoPago !== null;

      if (tipoEntrega === 'delivery') {
        isValid = isValid && canProceedToDelivery;
      }

      this.formValid.set(isValid);
    });
  }

  /**
   * Configura los cálculos automáticos expandidos
   */
  private setupCalculations(): void {
    effect(() => {
      const items = this.pedidoItems();
      const cupon = this.selectedCupon();
      const tipoEntrega = this.selectedTipoEntrega();
      const direccion = this.direccionEntrega();

      const totales = this.calculateTotals(
        items,
        cupon,
        tipoEntrega,
        direccion
      );

      this.totalesCalculados.set(totales);

      // Actualizar formulario
      this.pedidoForm.patchValue({
        subtotal: totales.subtotal,
        descuento: totales.descuentoCupon,
        descuento_total: totales.descuentoTotal,
        impuesto: totales.impuestos,
        igv: totales.igv,
        costo_envio: totales.envio,
        total: totales.total,
      });
    });
  }

  /**
   * Verifica si está en modo edición
   */
  private checkEditMode(): void {
    if (this.pedidoId) {
      this.isEditing.set(true);
      this.loadPedidoForEdit(this.pedidoId);
    }
  }

  /**
   * Carga datos iniciales
   */
  private loadInitialData(): void {
    // Los datos se cargan bajo demanda en cada componente hijo
  }

  /**
   * Carga pedido para edición
   */
  private loadPedidoForEdit(id: number): void {
    this.isLoading.set(true);

    this.pedidoService
      .obtenerPedido(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (pedido) => {
          this.populateFormWithPedido(pedido);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error al cargar pedido:', error);
          this.isLoading.set(false);
        },
      });
  }

  /**
   * Llena el formulario con datos del pedido expandido
   */
  private populateFormWithPedido(pedido: Pedido): void {
    // Actualizar signals
    if (pedido.usuario) {
      const cliente: User = {
        id: pedido.usuario.id,
        name: pedido.usuario.nombre,
        email: pedido.usuario.email,
        rol: '',
        created_at: '',
        updated_at: '',
      };
      this.selectedCliente.set(cliente);
    }

    if (pedido.detalles) {
      const items: PedidoItem[] = pedido.detalles.map((detalle) => ({
        id: detalle.id,
        producto_id: detalle.producto_id,
        variacion_producto_id: detalle.variacion_id ?? undefined,
        cantidad: detalle.cantidad,
        precio_unitario: detalle.precio_unitario,
        descuento: detalle.descuento,
        subtotal: detalle.subtotal,
        producto: detalle.producto,
        variacion: detalle.variacion ?? undefined,
      }));
      this.pedidoItems.set(items);
    }

    // Configurar dirección de entrega
    if (pedido.direccion_entrega) {
      const direccionEntrega: DireccionEntrega = {
        direccion: pedido.direccion_entrega,
        telefono: pedido.telefono_entrega || '',
        referencia: pedido.referencia_entrega || '',
        latitud: pedido.latitud_entrega ?? undefined,
        longitud: pedido.longitud_entrega ?? undefined,
        zona_reparto_id: pedido.zona_reparto_id ?? undefined,
        costo_envio_calculado: pedido.costo_envio,
      };
      this.direccionEntrega.set(direccionEntrega);
    }

    // Configurar datos adicionales
    this.datosEnvio.set(this.pedidoService.obtenerDatosEnvio(pedido));
    this.datosCliente.set(this.pedidoService.obtenerDatosCliente(pedido));

    this.selectedCupon.set(null);
    this.selectedMetodoPago.set(pedido.tipo_pago);
    this.selectedTipoEntrega.set(pedido.tipo_entrega);
    this.selectedCanalVenta.set(pedido.canal_venta);

    // Actualizar formulario con todos los campos
    this.pedidoForm.patchValue({
      user_id: pedido.user_id,
      estado: pedido.estado,
      tipo_pago: pedido.tipo_pago,
      tipo_entrega: pedido.tipo_entrega,
      canal_venta: pedido.canal_venta,
      moneda: pedido.moneda,
      subtotal: pedido.subtotal,
      descuento: pedido.descuento,
      descuento_total: pedido.descuento_total,
      igv: pedido.igv,
      costo_envio: pedido.costo_envio,
      total: pedido.total,
      cuotas: pedido.cuotas,
      monto_cuota: pedido.monto_cuota,
      interes_total: pedido.interes_total,
      observaciones: pedido.observaciones ?? '',
      cupon_codigo: pedido.cupon_codigo,
      direccion_entrega: pedido.direccion_entrega ?? '',
      telefono_entrega: pedido.telefono_entrega ?? '',
      referencia_entrega: pedido.referencia_entrega ?? '',
      latitud_entrega: pedido.latitud_entrega,
      longitud_entrega: pedido.longitud_entrega,
      zona_reparto_id: pedido.zona_reparto_id,
      fecha_entrega_programada: pedido.fecha_entrega_programada,
      tiempo_entrega_estimado: pedido.tiempo_entrega_estimado,
      codigo_rastreo: pedido.codigo_rastreo ?? '',
      metodo_pago_id: pedido.metodo_pago_id,
      datos_envio: pedido.datos_envio,
      datos_cliente: pedido.datos_cliente,
      metodo_envio: pedido.metodo_envio,
    });
  }

  /**
   * Calcula los totales del pedido expandido
   */
  private calculateTotals(
    items: PedidoItem[],
    cupon: Cupon | null,
    tipoEntrega: TipoEntrega,
    direccionEntrega: DireccionEntrega | null
  ): TotalesCalculados {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const descuentoItems = items.reduce(
      (sum, item) => sum + item.descuento * item.cantidad,
      0
    );

    let descuentoCupon = 0;
    if (cupon) {
      if (cupon.tipo === 'porcentaje') {
        descuentoCupon = (subtotal * cupon.descuento) / 100;
      } else if (cupon.tipo === 'fijo') {
        descuentoCupon = cupon.descuento;
      }
    }

    const descuentoTotal = descuentoItems + descuentoCupon;
    const baseImponible = subtotal - descuentoTotal;

    // IGV 18%
    const igv = baseImponible * 0.18;
    const impuestos = igv; // En Perú, solo IGV

    // Cálculo de envío
    const envio = this.calculateShipping(
      baseImponible,
      tipoEntrega,
      direccionEntrega
    );

    const total = baseImponible + impuestos + envio;
    const totalConDescuento = total - descuentoTotal;

    return {
      subtotal,
      descuentoCupon,
      descuentoItems,
      descuentoTotal,
      impuestos,
      igv,
      envio,
      total: Math.max(0, total),
      totalConDescuento: Math.max(0, totalConDescuento),
    };
  }

  /**
   * Calcula el costo de envío expandido
   */
  private calculateShipping(
    baseImponible: number,
    tipoEntrega: TipoEntrega,
    direccionEntrega: DireccionEntrega | null
  ): number {
    if (tipoEntrega === 'recojo_tienda') return 0;

    // Si hay dirección validada con costo calculado
    if (direccionEntrega?.costo_envio_calculado) {
      return direccionEntrega.costo_envio_calculado;
    }

    // Lógica de cálculo de envío por defecto
    if (baseImponible >= 150) return 0; // Envío gratis
    if (baseImponible >= 100) return 10;
    if (baseImponible >= 50) return 15;
    return 20;
  }

  // Métodos para manejar eventos de componentes hijos

  /**
   * Maneja la selección de cliente
   */
  onClienteSelected(cliente: User | null): void {
    this.selectedCliente.set(cliente);
    this.pedidoForm.patchValue({ user_id: cliente?.id || null });

    // Actualizar datos del cliente
    if (cliente) {
      const datosCliente = {
        id: cliente.id,
        name: cliente.name,
        email: cliente.email,
      };
      this.datosCliente.set(datosCliente);
      this.pedidoForm.patchValue({
        datos_cliente: JSON.stringify(datosCliente),
      });
    }
  }

  /**
   * Maneja cambios en los items
   */
  onItemsChanged(items: PedidoItem[]): void {
    this.pedidoItems.set(items);
  }

  /**
   * Maneja la selección del tipo de entrega
   */
  onTipoEntregaChanged(tipoEntrega: TipoEntrega): void {
    this.selectedTipoEntrega.set(tipoEntrega);
    this.pedidoForm.patchValue({ tipo_entrega: tipoEntrega });

    // Si cambia a recojo en tienda, limpiar dirección
    if (tipoEntrega === 'recojo_tienda') {
      this.direccionEntrega.set(null);
      this.pedidoForm.patchValue({
        direccion_entrega: '',
        telefono_entrega: '',
        referencia_entrega: '',
        latitud_entrega: null,
        longitud_entrega: null,
        zona_reparto_id: null,
        costo_envio: 0,
      });
    }
  }

  /**
   * Maneja cambios en la dirección de entrega
   */
  onDireccionEntregaChanged(direccion: DireccionEntrega | null): void {
    this.direccionEntrega.set(direccion);

    if (direccion) {
      this.pedidoForm.patchValue({
        direccion_entrega: direccion.direccion,
        telefono_entrega: direccion.telefono,
        referencia_entrega: direccion.referencia,
        latitud_entrega: direccion.latitud,
        longitud_entrega: direccion.longitud,
        zona_reparto_id: direccion.zona_reparto_id,
      });

      // Actualizar datos de envío
      const datosEnvio = {
        direccion: direccion.direccion,
        telefono: direccion.telefono,
        referencia: direccion.referencia,
        coordenadas:
          direccion.latitud && direccion.longitud
            ? {
                lat: direccion.latitud,
                lng: direccion.longitud,
              }
            : null,
      };
      this.datosEnvio.set(datosEnvio);
      this.pedidoForm.patchValue({ datos_envio: JSON.stringify(datosEnvio) });
    }
  }

  /**
   * Maneja la aplicación de cupón
   */
  onCuponApplied(cuponesAplicados: CuponAplicado[]): void {
    if (cuponesAplicados.length > 0) {
      this.selectedCupon.set(cuponesAplicados[0].cupon);
      this.pedidoForm
        .get('cupon_codigo')
        ?.setValue(cuponesAplicados[0].cupon.codigo);
    } else {
      this.selectedCupon.set(null);
      this.pedidoForm.get('cupon_codigo')?.setValue(null);
    }
  }

  /**
   * Maneja la selección de método de pago
   */
  onMetodoPagoSelected(datosPago: any): void {
    const metodoPago = datosPago?.tipo_pago || null;
    const metodoPagoId = datosPago?.metodo_pago_id || null;

    this.selectedMetodoPago.set(metodoPago);
    this.pedidoForm.patchValue({
      tipo_pago: metodoPago,
      metodo_pago_id: metodoPagoId,
      cuotas: datosPago?.cuotas || null,
      monto_cuota: datosPago?.monto_cuota || null,
      interes_total: datosPago?.interes_total || null,
    });
  }

  // Métodos de navegación entre pasos

  /**
   * Avanza al siguiente paso
   */
  nextStep(): void {
    const current = this.currentStep();
    if (current < this.pasos.length && this.canProceedToStep(current + 1)) {
      this.currentStep.set(current + 1);
    }
  }

  /**
   * Retrocede al paso anterior
   */
  previousStep(): void {
    const current = this.currentStep();
    if (current > 1) {
      this.currentStep.set(current - 1);
    }
  }

  /**
   * Va a un paso específico
   */
  goToStep(step: number): void {
    if (this.canProceedToStep(step)) {
      this.currentStep.set(step);
    }
  }

  /**
   * Verifica si se puede proceder a un paso expandido
   */
  canProceedToStep(step: number): boolean {
    switch (step) {
      case 1:
        return true;
      case 2:
        return this.hasCliente();
      case 3:
        return this.hasCliente() && this.hasItems();
      case 4:
        return (
          this.hasCliente() && this.hasItems() && this.canProceedToDelivery()
        );
      case 5:
        return (
          this.hasCliente() && this.hasItems() && this.canProceedToDelivery()
        );
      case 6:
        return this.canProceedToPayment() && this.selectedMetodoPago() !== null;
      default:
        return false;
    }
  }

  /**
   * Verifica si un paso está completado expandido
   */
  isStepCompleted(step: number): boolean {
    switch (step) {
      case 1:
        return this.hasCliente();
      case 2:
        return this.hasItems();
      case 3:
        return this.canProceedToDelivery();
      case 4:
        return true; // El cupón es opcional
      case 5:
        return this.selectedMetodoPago() !== null;
      case 6:
        return this.formValid();
      default:
        return false;
    }
  }

  /**
   * Obtiene las clases CSS para un paso
   */
  getStepClasses(step: number): string {
    const current = this.currentStep();
    const completed = this.isStepCompleted(step);

    if (step === current) {
      return 'bg-blue-600 text-white border-blue-600';
    } else if (completed) {
      return 'bg-green-600 text-white border-green-600';
    } else {
      return 'bg-gray-200 text-gray-600 border-gray-300';
    }
  }

  // Métodos de guardado expandidos

  /**
   * Guarda el pedido
   */
  async savePedido(): Promise<void> {
    if (!this.formValid()) {
      console.warn('Formulario no válido');
      return;
    }

    this.isSaving.set(true);

    try {
      if (this.isEditing()) {
        const updateData = this.prepareUpdateData();
        await this.updatePedido(updateData);
      } else {
        const createData = this.prepareCreateData();
        await this.createPedido(createData);
      }

      this.router.navigate(['/admin/pedidos']);
    } catch (error) {
      console.error('Error al guardar pedido:', error);
    } finally {
      this.isSaving.set(false);
    }
  }

  /**
   * Prepara los datos para crear un pedido expandido
   */
  private prepareCreateData(): CreatePedidoDto {
    const formValue = this.pedidoForm.value;
    const items = this.pedidoItems();

    return {
      user_id: formValue.user_id,
      metodo_pago_id: formValue.metodo_pago_id || undefined,
      zona_reparto_id: formValue.zona_reparto_id || undefined,
      tipo_pago: formValue.tipo_pago,
      tipo_entrega: formValue.tipo_entrega || 'delivery',
      cuotas: formValue.cuotas || undefined,
      observaciones: formValue.observaciones || undefined,
      canal_venta: formValue.canal_venta || 'web',
      moneda: formValue.moneda || 'PEN',
      fecha_entrega_programada: formValue.fecha_entrega_programada || undefined,
      direccion_entrega: formValue.direccion_entrega || undefined,
      telefono_entrega: formValue.telefono_entrega || undefined,
      referencia_entrega: formValue.referencia_entrega || undefined,
      latitud_entrega: formValue.latitud_entrega || undefined,
      longitud_entrega: formValue.longitud_entrega || undefined,
      datos_envio: formValue.datos_envio || undefined,
      metodo_envio: formValue.metodo_envio || undefined,
      datos_cliente: formValue.datos_cliente || undefined,
      cupon_codigo: this.selectedCupon()?.codigo || undefined,
      items: items.map((item) => ({
        producto_id: item.producto_id,
        variacion_id: item.variacion_producto_id || undefined,
        cantidad: item.cantidad,
        descuento: item.descuento || undefined,
      })),
    };
  }

  /**
   * Prepara los datos para actualizar un pedido expandido
   */
  private prepareUpdateData(): UpdatePedidoDto {
    const formValue = this.pedidoForm.value;

    return {
      metodo_pago_id: formValue.metodo_pago_id || undefined,
      zona_reparto_id: formValue.zona_reparto_id || undefined,
      observaciones: formValue.observaciones || undefined,
      canal_venta: formValue.canal_venta,
      codigo_rastreo: formValue.codigo_rastreo || undefined,
      fecha_entrega_programada: formValue.fecha_entrega_programada || undefined,
      direccion_entrega: formValue.direccion_entrega || undefined,
      telefono_entrega: formValue.telefono_entrega || undefined,
      referencia_entrega: formValue.referencia_entrega || undefined,
      latitud_entrega: formValue.latitud_entrega || undefined,
      longitud_entrega: formValue.longitud_entrega || undefined,
      datos_cliente: formValue.datos_cliente || undefined,
      datos_envio: formValue.datos_envio || undefined,
      metodo_envio: formValue.metodo_envio || undefined,
    };
  }

  /**
   * Crea un nuevo pedido
   */
  private async createPedido(data: CreatePedidoDto): Promise<void> {
    try {
      const nuevoPedido = await this.pedidoService
        .crearPedido(data)
        .toPromise();
      if (nuevoPedido) {
        this.pedidoCreated.emit(nuevoPedido);
      }
    } catch (error) {
      console.error('Error al crear pedido:', error);
      throw error;
    }
  }

  /**
   * Actualiza un pedido existente
   */
  private async updatePedido(data: UpdatePedidoDto): Promise<void> {
    if (!this.pedidoId) {
      throw new Error('ID de pedido requerido para actualización');
    }

    try {
      const pedidoActualizado = await this.pedidoService
        .actualizarPedido(this.pedidoId, data)
        .toPromise();
      if (pedidoActualizado) {
        this.pedidoUpdated.emit(pedidoActualizado);
      }
    } catch (error) {
      console.error('Error al actualizar pedido:', error);
      throw error;
    }
  }

  /**
   * Cancela la edición
   */
  cancel(): void {
    this.cancelled.emit();
  }

  /**
   * Formatea valores monetarios
   */
  formatCurrency(value: number, moneda: Moneda = 'PEN'): string {
    const currencies = {
      PEN: 'es-PE',
      USD: 'en-US',
      EUR: 'de-DE',
    };

    return new Intl.NumberFormat(currencies[moneda], {
      style: 'currency',
      currency: moneda,
      minimumFractionDigits: 2,
    }).format(value);
  }

  /**
   * Formatea tiempo de entrega
   */
  formatTiempoEntrega(minutos: number | null): string {
    return this.pedidoService.formatearTiempoEntrega(minutos) || 'No definido';
  }

  /**
   * Track by function para pasos
   */
  trackByStepNumber(index: number, paso: any): number {
    return paso.numero;
  }

  /**
   * Obtiene el símbolo de la moneda
   */
  getSimboloMoneda(moneda: Moneda): string {
    return this.pedidoService.obtenerSimboloMoneda(moneda);
  }
}
