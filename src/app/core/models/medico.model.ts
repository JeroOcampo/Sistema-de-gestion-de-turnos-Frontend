import { Especialidad } from './especialidad.model';

/** Médico tal como lo expone GET /medicos: sin datos personales. */
export interface Medico {
  id: number;
  nombre: string;
  apellido: string;
  especialidades: Especialidad[];
}

export interface FiltrosMedicos {
  id_especialidad?: number;
  id_sede?: number;
  /** Solo los médicos con agenda desde hoy en adelante (para pedir turnos). */
  con_agenda?: boolean;
}
