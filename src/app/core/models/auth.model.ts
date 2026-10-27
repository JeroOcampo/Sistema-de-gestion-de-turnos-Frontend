import { Rol } from './usuario.model';

export interface CredencialesLogin {
  dni: string;
  password: string;
}

export interface RespuestaLogin {
  token: string;
}

export interface DatosRegistroPaciente {
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  password: string;
  /** Formato AAAA-MM-DD, como lo espera la columna DATE de MySQL. */
  fecha_nacimiento: string;
  id_cobertura: number;
}

export interface PacienteRegistrado {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  rol: Rol;
  id_cobertura: number;
}

/** Contenido del JWT emitido por el backend. */
export interface PayloadToken {
  id: number;
  rol: Rol;
  id_sede: number | null;
  exp?: number;
}
