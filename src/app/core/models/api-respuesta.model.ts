/** Envoltorio estándar con el que responde el backend: { codigo, estado, datos }. */
export interface ApiRespuesta<T> {
  codigo: number;
  estado: string;
  datos: T;
}
