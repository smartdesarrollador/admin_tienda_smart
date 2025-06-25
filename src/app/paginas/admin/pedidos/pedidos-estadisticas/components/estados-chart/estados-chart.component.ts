import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-estados-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './estados-chart.component.html',
  styleUrls: ['./estados-chart.component.css'],
})
export class EstadosChartComponent implements OnInit, OnDestroy, OnChanges {
  @Input() periodo: '7d' | '30d' | '90d' | '1y' = '30d';

  constructor() {}

  ngOnInit(): void {
    this.loadChartData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['periodo']) {
      if (!changes['periodo'].firstChange) {
        this.loadChartData();
      }
    }
  }

  loadChartData(): void {
    console.log(
      `EstadosChartComponent: Cargando datos para el período: ${this.periodo}`
    );
    // Lógica para cargar datos y renderizar gráfico de estados (ej. doughnut chart)
  }

  ngOnDestroy(): void {
    // Limpieza
  }
}
