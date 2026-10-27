export interface Especialidad {
  id: number;
  descripcion: string;
}

export type DatosEspecialidad = Omit<Especialidad, 'id'>;
