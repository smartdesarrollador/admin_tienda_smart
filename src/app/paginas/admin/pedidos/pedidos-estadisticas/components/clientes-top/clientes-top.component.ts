import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

import { UsuariosService } from '../../../../../../core/services/usuarios.service';
import { PedidoService } from '../../../../../../core/services/pedido.service';

export interface ClienteTop {
  id: number;
  name: string;
  email: string;
  avatar_url?: string;
  total_pedidos: number;
  total_gastado: number;
  ticket_promedio: number;
  ultima_compra: string;
  frecuencia_compra: number; // días promedio entre compras
  categoria_favorita: string;
  estado_cliente: 'nuevo' | 'regular' | 'vip' | 'inactivo';
  tendencia: 'up' | 'down' | 'stable';
  cambio_porcentual: number;
  credito_disponible: number;
  mora_actual: number;
  puntos_fidelidad: number;
}

export interface ClientesTopData {
  clientes_mas_gastadores: ClienteTop[];
  clientes_mas_frecuentes: ClienteTop[];
  clientes_mejor_ticket: ClienteTop[];
  clientes_nuevos: ClienteTop[];
  resumen: {
    total_clientes_activos: number;
    ingresos_clientes_top: number;
    ticket_promedio_general: number;
    clientes_nuevos_mes: number;
    tasa_retencion: number;
    valor_vida_promedio: number;
  };
}

/**
 * Componente para mostrar análisis de los mejores clientes
 * Incluye ranking por gastos, frecuencia, ticket promedio y análisis de fidelización
 */
@Component({
  selector: 'app-clientes-top',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './clientes-top.component.html',
  styleUrls: ['./clientes-top.component.css'],
})
export class ClientesTopComponent implements OnInit, OnDestroy {
  private readonly usuariosService = inject(UsuariosService);
  private readonly pedidoService = inject(PedidoService);
  private readonly destroy$ = new Subject<void>();

  // Inputs
  @Input() periodo: '7d' | '30d' | '90d' | '1y' = '30d';
  @Input() limite: number = 10;

  // Signals para estado del componente
  isLoading = signal(false);
  error = signal<string | null>(null);
  clientesData = signal<ClientesTopData | null>(null);
  activeView = signal<'gastadores' | 'frecuentes' | 'ticket' | 'nuevos'>(
    'gastadores'
  );

  // Computed signals para datos filtrados
  clientesActivos = computed(() => {
    const data = this.clientesData();
    const view = this.activeView();

    if (!data) return [];

    switch (view) {
      case 'gastadores':
        return data.clientes_mas_gastadores;
      case 'frecuentes':
        return data.clientes_mas_frecuentes;
      case 'ticket':
        return data.clientes_mejor_ticket;
      case 'nuevos':
        return data.clientes_nuevos;
      default:
        return data.clientes_mas_gastadores;
    }
  });

  // Computed signals para resumen
  totalClientesActivos = computed(() => {
    const data = this.clientesData();
    return data ? this.formatNumber(data.resumen.total_clientes_activos) : '0';
  });

  ingresosClientesTop = computed(() => {
    const data = this.clientesData();
    return data
      ? this.formatCurrency(data.resumen.ingresos_clientes_top)
      : 'S/ 0';
  });

  ticketPromedioGeneral = computed(() => {
    const data = this.clientesData();
    return data
      ? this.formatCurrency(data.resumen.ticket_promedio_general)
      : 'S/ 0';
  });

  clientesNuevosMes = computed(() => {
    const data = this.clientesData();
    return data ? data.resumen.clientes_nuevos_mes : 0;
  });

  tasaRetencion = computed(() => {
    const data = this.clientesData();
    return data ? `${data.resumen.tasa_retencion.toFixed(1)}%` : '0%';
  });

  valorVidaPromedio = computed(() => {
    const data = this.clientesData();
    return data
      ? this.formatCurrency(data.resumen.valor_vida_promedio)
      : 'S/ 0';
  });

  ngOnInit(): void {
    this.loadClientesTop();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carga los datos de clientes top
   */
  private loadClientesTop(): void {
    this.isLoading.set(true);
    this.error.set(null);

    // Simular datos por ahora - en producción usar servicios reales
    setTimeout(() => {
      const mockData: ClientesTopData = {
        clientes_mas_gastadores: [
          {
            id: 1,
            name: 'María González',
            email: 'maria.gonzalez@email.com',
            avatar_url: '/assets/avatars/maria.jpg',
            total_pedidos: 45,
            total_gastado: 67890.5,
            ticket_promedio: 1508.68,
            ultima_compra: '2024-01-15',
            frecuencia_compra: 12,
            categoria_favorita: 'Electrónicos',
            estado_cliente: 'vip',
            tendencia: 'up',
            cambio_porcentual: 23.5,
            credito_disponible: 5000,
            mora_actual: 0,
            puntos_fidelidad: 2340,
          },
          {
            id: 2,
            name: 'Carlos Mendoza',
            email: 'carlos.mendoza@email.com',
            avatar_url: '/assets/avatars/carlos.jpg',
            total_pedidos: 38,
            total_gastado: 54320.75,
            ticket_promedio: 1429.49,
            ultima_compra: '2024-01-12',
            frecuencia_compra: 15,
            categoria_favorita: 'Computadoras',
            estado_cliente: 'vip',
            tendencia: 'up',
            cambio_porcentual: 18.2,
            credito_disponible: 3000,
            mora_actual: 0,
            puntos_fidelidad: 1890,
          },
          {
            id: 3,
            name: 'Ana Rodríguez',
            email: 'ana.rodriguez@email.com',
            avatar_url: '/assets/avatars/ana.jpg',
            total_pedidos: 52,
            total_gastado: 43210.25,
            ticket_promedio: 830.97,
            ultima_compra: '2024-01-18',
            frecuencia_compra: 8,
            categoria_favorita: 'Hogar',
            estado_cliente: 'regular',
            tendencia: 'stable',
            cambio_porcentual: 2.1,
            credito_disponible: 2000,
            mora_actual: 0,
            puntos_fidelidad: 1560,
          },
          {
            id: 4,
            name: 'Luis Fernández',
            email: 'luis.fernandez@email.com',
            avatar_url: '/assets/avatars/luis.jpg',
            total_pedidos: 29,
            total_gastado: 38950.8,
            ticket_promedio: 1343.13,
            ultima_compra: '2024-01-10',
            frecuencia_compra: 18,
            categoria_favorita: 'Deportes',
            estado_cliente: 'regular',
            tendencia: 'down',
            cambio_porcentual: -8.7,
            credito_disponible: 1500,
            mora_actual: 450.0,
            puntos_fidelidad: 980,
          },
          {
            id: 5,
            name: 'Patricia Silva',
            email: 'patricia.silva@email.com',
            avatar_url: '/assets/avatars/patricia.jpg',
            total_pedidos: 41,
            total_gastado: 35670.4,
            ticket_promedio: 870.25,
            ultima_compra: '2024-01-16',
            frecuencia_compra: 10,
            categoria_favorita: 'Moda',
            estado_cliente: 'regular',
            tendencia: 'up',
            cambio_porcentual: 12.8,
            credito_disponible: 2500,
            mora_actual: 0,
            puntos_fidelidad: 1245,
          },
        ],
        clientes_mas_frecuentes: [],
        clientes_mejor_ticket: [],
        clientes_nuevos: [],
        resumen: {
          total_clientes_activos: 1247,
          ingresos_clientes_top: 240042.7,
          ticket_promedio_general: 892.45,
          clientes_nuevos_mes: 89,
          tasa_retencion: 78.5,
          valor_vida_promedio: 2340.8,
        },
      };

      // Duplicar datos para otras vistas (simplificado)
      mockData.clientes_mas_frecuentes = [
        ...mockData.clientes_mas_gastadores,
      ].sort((a, b) => a.frecuencia_compra - b.frecuencia_compra);
      mockData.clientes_mejor_ticket = [
        ...mockData.clientes_mas_gastadores,
      ].sort((a, b) => b.ticket_promedio - a.ticket_promedio);
      mockData.clientes_nuevos = [...mockData.clientes_mas_gastadores]
        .filter((c) => c.estado_cliente === 'nuevo')
        .slice(0, 3);

      this.clientesData.set(mockData);
      this.isLoading.set(false);
    }, 900);
  }

  /**
   * Cambia la vista activa
   */
  onViewChange(view: 'gastadores' | 'frecuentes' | 'ticket' | 'nuevos'): void {
    this.activeView.set(view);
  }

  /**
   * Actualiza los datos
   */
  refreshData(): void {
    this.loadClientesTop();
  }

  /**
   * Obtiene el color del estado del cliente
   */
  getEstadoColor(estado: string): string {
    switch (estado) {
      case 'vip':
        return 'bg-purple-100 text-purple-800';
      case 'regular':
        return 'bg-blue-100 text-blue-800';
      case 'nuevo':
        return 'bg-green-100 text-green-800';
      case 'inactivo':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  /**
   * Obtiene el texto del estado del cliente
   */
  getEstadoText(estado: string): string {
    switch (estado) {
      case 'vip':
        return 'VIP';
      case 'regular':
        return 'Regular';
      case 'nuevo':
        return 'Nuevo';
      case 'inactivo':
        return 'Inactivo';
      default:
        return estado;
    }
  }

  /**
   * Obtiene el icono de tendencia
   */
  getTendenciaIcon(tendencia: string): string {
    switch (tendencia) {
      case 'up':
        return 'M7 14l3-3 3 3 4-4M5 21l4-4 4 4 4-4';
      case 'down':
        return 'M17 10l-3 3-3-3-4 4M5 3l4 4 4-4 4 4';
      default:
        return 'M5 12h14';
    }
  }

  /**
   * Obtiene el color de tendencia
   */
  getTendenciaColor(tendencia: string): string {
    switch (tendencia) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  }

  /**
   * Obtiene el color de mora
   */
  getMoraColor(mora: number): string {
    if (mora === 0) return 'text-green-600';
    if (mora < 500) return 'text-orange-600';
    return 'text-red-600';
  }

  /**
   * Calcula los días desde la última compra
   */
  getDiasSinComprar(ultimaCompra: string): number {
    const hoy = new Date();
    const fechaCompra = new Date(ultimaCompra);
    const diferencia = hoy.getTime() - fechaCompra.getTime();
    return Math.floor(diferencia / (1000 * 3600 * 24));
  }

  /**
   * Obtiene la etiqueta de la vista
   */
  getViewLabel(view: string): string {
    const labels: Record<string, string> = {
      gastadores: 'Más Gastadores',
      frecuentes: 'Más Frecuentes',
      ticket: 'Mejor Ticket',
      nuevos: 'Clientes Nuevos',
    };
    return labels[view] || view;
  }

  /**
   * Formatea valores monetarios
   */
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  /**
   * Formatea números con separadores de miles
   */
  formatNumber(value: number): string {
    return new Intl.NumberFormat('es-PE').format(value);
  }

  /**
   * Formatea porcentajes
   */
  formatPercentage(value: number): string {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  }

  /**
   * Formatea fechas
   */
  formatDate(date: string): string {
    return new Intl.DateTimeFormat('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  }

  /**
   * Maneja el error de carga de imagen y establece una imagen placeholder.
   */
  handleImageError(event: Event, placeholderPath: string): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = placeholderPath;
    }
  }
}
