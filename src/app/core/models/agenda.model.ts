/** Rango horario de atención de un médico (GET /agenda). Fecha AAAA-MM-DD, horas HH:MM. */
export interface RangoAgenda {
  id: number;
  fecha: string;
  hora_entrada: string;
  hora_salida: string;
  id_medico: number;
  id_especialidad: number;
  id_sede: number;
  medico_nombre: string;
  medico_apellido: string;
  especialidad_descripcion: string;
  sede_nombre: string;
}

export interface DatosRangoAgenda {
  fecha: string;
  hora_entrada: string;
  hora_salida: string;
  id_especialidad: number;
  id_sede: number;
  /** Lo envía el operador; el médico siempre carga su propia agenda. */
  id_medico?: number;
}

export interface FiltrosAgenda {
  fecha?: string;
  id_sede?: number | null;
  id_medico?: number;
}
