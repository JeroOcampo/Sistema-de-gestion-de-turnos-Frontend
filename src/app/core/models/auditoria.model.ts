import { Rol } from './usuario.model';

export type AccionAuditoria = 'ALTA' | 'BAJA' | 'MODIFICACION';

export const ACCIONES_AUDITORIA: readonly AccionAuditoria[] = ['ALTA', 'BAJA', 'MODIFICACION'];

/** Entidades cuyas altas, bajas y modificaciones registra el backend. */
export const ENTIDADES_AUDITADAS: readonly string[] = ['usuario', 'sede', 'especialidad', 'cobertura'];

export interface RegistroAuditoria {
  id: number;
  id_usuario: number;
  usuario_nombre: string | null;
  usuario_rol: Rol | null;
  accion: AccionAuditoria;
  entidad: string;
  id_entidad: number | null;
  detalle: string | null;
  /** Fecha y hora (ISO). */
  fecha: string;
}

export interface FiltrosAuditoria {
  /** Nombre o apellido de quien hizo la acción. */
  usuario?: string;
  entidad?: string;
  accion?: AccionAuditoria | '';
  desde?: string;
  hasta?: string;
}
