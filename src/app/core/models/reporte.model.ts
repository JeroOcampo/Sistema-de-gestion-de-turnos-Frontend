/** Rango de fechas AAAA-MM-DD que comparten todos los reportes (ambos extremos opcionales). */
export interface RangoFechas {
  desde?: string;
  hasta?: string;
}

export interface TurnosPorEstado {
  cantidad_turnos: number;
  confirmados: number;
  atendidos: number;
  cancelados: number;
}

export interface TurnosPorEspecialidad extends TurnosPorEstado {
  id_especialidad: number;
  especialidad: string;
}

export interface TurnosPorSede extends TurnosPorEstado {
  id_sede: number;
  sede: string;
}

export interface ReporteAgrupado<T> {
  total_turnos: number;
  items: T[];
}

export interface PosicionRanking {
  posicion: number;
  id_medico: number;
  medico: string;
  sede: string | null;
  turnos_atendidos: number;
}

export interface ReporteRanking {
  total_turnos_atendidos: number;
  items: PosicionRanking[];
}

export interface TasaCancelacion {
  total_turnos: number;
  turnos_cancelados: number;
  turnos_atendidos: number;
  turnos_confirmados: number;
  tasa_cancelacion: number;
  porcentaje_cancelacion: number;
}
