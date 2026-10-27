/** Registro del historial clínico de un turno atendido. */
export interface RegistroHistorial {
  id: number;
  id_turno: number;
  id_medico: number;
  id_paciente: number;
  diagnostico: string;
  tratamiento: string | null;
  observaciones: string | null;
  /** Fecha y hora de carga (ISO). */
  fecha: string;
  turno_fecha: string;
  turno_hora: string;
  medico_nombre: string;
  especialidad_descripcion: string | null;
  sede_nombre: string | null;
}

export interface DatosHistorial {
  diagnostico: string;
  tratamiento: string;
  observaciones: string;
}
