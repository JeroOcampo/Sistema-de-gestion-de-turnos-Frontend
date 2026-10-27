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
