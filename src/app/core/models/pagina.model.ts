/** Respuesta paginada de la API (usuarios y auditoría). */
export interface Pagina<T> {
  total: number;
  limite: number;
  offset: number;
  items: T[];
}
