export interface Cobertura {
  id: number;
  nombre: string;
}

export type DatosCobertura = Omit<Cobertura, 'id'>;
