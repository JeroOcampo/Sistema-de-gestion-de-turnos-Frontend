/** Resultado de la búsqueda de pacientes (GET /pacientes). */
export interface Paciente {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  telefono: string;
  fecha_nacimiento: string;
  id_cobertura: number;
  cobertura_nombre: string | null;
}

/** Datos de su cuenta que el paciente puede modificar. */
export interface DatosMisDatos {
  email: string;
  telefono: string;
  id_cobertura: number;
  /** Solo si quiere cambiarla. */
  password?: string;
}
