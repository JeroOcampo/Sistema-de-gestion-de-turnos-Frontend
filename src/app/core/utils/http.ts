import { HttpParams } from '@angular/common/http';

/** Arma los query params de un pedido omitiendo los filtros vacíos. */
export function aParams(filtros: object): HttpParams {
  let params = new HttpParams();
  for (const [clave, valor] of Object.entries(filtros)) {
    if (valor !== undefined && valor !== null && valor !== '') {
      params = params.set(clave, String(valor));
    }
  }
  return params;
}
