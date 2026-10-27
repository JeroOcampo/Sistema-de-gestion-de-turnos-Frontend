import { Component, computed, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { BaseChartDirective } from 'ng2-charts';
import { EstadoVacio } from '../../../../shared/components/estado-vacio/estado-vacio';
import {
  altoGrafico,
  datosPorEstado,
  ESTADOS_GRAFICO,
  FilaPorEstado,
  OPCIONES_POR_ESTADO,
  SUPERFICIE_GRAFICO,
} from '../graficos';

/** Gráfico de barras apiladas por estado y, debajo, la tabla con los mismos valores. */
@Component({
  selector: 'app-tarjeta-por-estado',
  imports: [BaseChartDirective, MatCardModule, MatTableModule, EstadoVacio],
  templateUrl: './tarjeta-por-estado.html',
  styleUrl: './tarjeta-por-estado.scss',
})
export class TarjetaPorEstado {
  readonly titulo = input.required<string>();
  /** Encabezado de la primera columna de la tabla: "Especialidad", "Sede"... */
  readonly categoria = input.required<string>();
  readonly filas = input.required<FilaPorEstado[]>();
  readonly total = input.required<number>();

  protected readonly estados = ESTADOS_GRAFICO;
  protected readonly opciones = OPCIONES_POR_ESTADO;
  protected readonly superficie = SUPERFICIE_GRAFICO;
  protected readonly columnas = ['nombre', ...ESTADOS_GRAFICO.map((e) => e.clave), 'total'];

  protected readonly datos = computed(() => datosPorEstado(this.filas()));
  protected readonly alto = computed(() => altoGrafico(this.filas().length));
}
