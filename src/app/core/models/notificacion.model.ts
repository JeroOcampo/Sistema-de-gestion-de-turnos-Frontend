export interface Notificacion {
  id: number;
  id_usuario: number;
  tipo: string;
  mensaje: string;
  /** Fecha y hora (ISO). */
  fecha: string;
  /** 0 = no leída, 1 = leída (TINYINT de MySQL). */
  leida: number;
}
