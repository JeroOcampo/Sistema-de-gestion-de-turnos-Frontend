export type EstadoTurno = 'confirmado' | 'cancelado' | 'atendido';

/** Turno con los nombres resueltos por el backend. Fecha AAAA-MM-DD, hora HH:MM. */
export interface Turno {
  id: number;
  id_paciente: number;
  id_medico: number;
  id_especialidad: number;
  id_sede: number;
  fecha: string;
  hora: string;
  nota: string;
  id_cobertura: number;
  estado: EstadoTurno;
  paciente_nombre: string;
  paciente_dni: string;
  paciente_fecha_nacimiento: string;
  medico_nombre: string;
  especialidad_descripcion: string;
  sede_nombre: string;
  cobertura_nombre: string | null;
}

export interface DatosNuevoTurno {
  id_especialidad: number;
  id_sede: number;
  id_medico: number;
  fecha: string;
  hora: string;
  nota: string;
  /** Lo envía el operador al asignar un turno; el paciente lo toma de su sesión. */
  id_paciente?: number;
}
