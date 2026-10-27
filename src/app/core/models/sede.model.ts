export interface Sede {
  id: number;
  nombre: string;
  direccion: string;
  telefono: string;
}

export type DatosSede = Omit<Sede, 'id'>;
