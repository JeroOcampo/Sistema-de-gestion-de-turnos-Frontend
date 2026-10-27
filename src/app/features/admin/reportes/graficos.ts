import { ChartConfiguration, ChartData } from 'chart.js';
import { TurnosPorEstado } from '../../../core/models/reporte.model';

/**
 * Estilo de los gráficos de Reportes. Los colores de las series salen de una paleta
 * validada para daltonismo (separación entre vecinos y frente a la superficie); el
 * verde agua queda por debajo de 3:1, por eso cada gráfico va acompañado de su tabla.
 */
export const SUPERFICIE_GRAFICO = '#ffffff';
const TINTA_SECUNDARIA = '#52514e';
const TINTA_TENUE = '#898781';
const LINEA_GRILLA = '#e1e0d9';
const LINEA_BASE = '#c3c2b7';

/** Una barra del gráfico: la categoría (especialidad o sede) con sus turnos por estado. */
export interface FilaPorEstado extends TurnosPorEstado {
  nombre: string;
}

/** Cada estado conserva siempre su color, en el mismo orden, en todos los gráficos. */
export const ESTADOS_GRAFICO = [
  { clave: 'confirmados', etiqueta: 'Confirmados', color: '#2a78d6' },
  { clave: 'cancelados', etiqueta: 'Cancelados', color: '#eb6834' },
  { clave: 'atendidos', etiqueta: 'Atendidos', color: '#1baf7a' },
] as const;

/** Barras horizontales apiladas: una barra por categoría, un segmento por estado. */
export function datosPorEstado(filas: FilaPorEstado[]): ChartData<'bar'> {
  return {
    labels: filas.map((fila) => fila.nombre),
    datasets: ESTADOS_GRAFICO.map((estado) => ({
      label: estado.etiqueta,
      data: filas.map((fila) => fila[estado.clave]),
      backgroundColor: estado.color,
      // 2px del color de la superficie separan los segmentos sin dibujarles un borde.
      borderColor: SUPERFICIE_GRAFICO,
      borderWidth: { right: 2 },
      // Con un número, Chart.js redondea solo el extremo exterior de cada pila.
      borderRadius: 4,
      maxBarThickness: 24,
    })),
  };
}

export const OPCIONES_POR_ESTADO: ChartConfiguration<'bar'>['options'] = {
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  // El tooltip se activa con el puntero en cualquier parte de la franja de la categoría.
  interaction: { mode: 'index', axis: 'y', intersect: false },
  scales: {
    x: {
      stacked: true,
      beginAtZero: true,
      ticks: { precision: 0, color: TINTA_TENUE },
      grid: { color: LINEA_GRILLA },
      border: { color: LINEA_BASE },
    },
    y: {
      stacked: true,
      ticks: { color: TINTA_SECUNDARIA },
      grid: { display: false },
      border: { color: LINEA_BASE },
    },
  },
  plugins: {
    legend: {
      position: 'top',
      align: 'start',
      labels: {
        color: TINTA_SECUNDARIA,
        usePointStyle: true,
        pointStyle: 'rectRounded',
        boxWidth: 10,
        boxHeight: 10,
      },
    },
    tooltip: {
      callbacks: {
        footer: (items) =>
          `Total: ${items.reduce((total, item) => total + (item.parsed.x ?? 0), 0)}`,
      },
    },
  },
};

/** Alto del gráfico según la cantidad de barras, incluidas la leyenda y la franja del eje. */
export function altoGrafico(cantidadBarras: number): number {
  return Math.max(cantidadBarras, 1) * 40 + 90;
}
