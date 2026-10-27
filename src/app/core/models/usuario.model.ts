import { Especialidad } from './especialidad.model';

export type Rol = 'administrador' | 'paciente' | 'medico' | 'operador';

export const ROLES: readonly Rol[] = ['administrador', 'paciente', 'medico', 'operador'];

export const ETIQUETA_ROL: Record<Rol, string> = {
  administrador: 'Administrador',
  paciente: 'Paciente',
  medico: 'Médico',
  operador: 'Operador',
};

/** Respuesta de GET /auth/perfil. */
export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  telefono: string;
  fecha_nacimiento: string;
  rol: Rol;
  id_sede: number | null;
  id_cobertura: number | null;
}

/** Usuario tal como lo devuelve /usuarios (gestión del administrador). */
export interface UsuarioGestion extends Usuario {
  sede_nombre?: string | null;
  /** Solo para médicos, en GET /usuarios/:id. */
  especialidades?: Especialidad[];
}

/** Alta y modificación de usuarios por el administrador. */
export interface DatosUsuario {
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  telefono: string;
  fecha_nacimiento: string;
  rol: Rol;
  id_sede: number | null;
  id_cobertura: number | null;
  /** Ids de las especialidades, solo para médicos. */
  especialidades?: number[];
  /** Obligatoria en el alta; en la modificación, solo si se quiere cambiar. */
  password?: string;
}

export interface FiltrosUsuarios {
  nombre?: string;
  apellido?: string;
  rol?: Rol | '';
  id_sede?: number | null;
}
