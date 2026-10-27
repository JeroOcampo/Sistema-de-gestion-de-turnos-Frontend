import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { DatosRangoAgenda, FiltrosAgenda, RangoAgenda } from '../models/agenda.model';
import { ApiRespuesta } from '../models/api-respuesta.model';
import { aParams } from '../utils/http';

@Injectable({ providedIn: 'root' })
export class AgendaService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_BASE_URL}/agenda`;

  /** Para el médico, el backend devuelve siempre su propia agenda. */
  listar(filtros: FiltrosAgenda = {}): Observable<RangoAgenda[]> {
    return this.http
      .get<ApiRespuesta<RangoAgenda[]>>(this.url, { params: aParams(filtros) })
      .pipe(map((r) => r.datos));
  }

  crear(datos: DatosRangoAgenda): Observable<RangoAgenda> {
    return this.http.post<ApiRespuesta<RangoAgenda>>(this.url, datos).pipe(map((r) => r.datos));
  }

  actualizar(id: number, datos: DatosRangoAgenda): Observable<RangoAgenda> {
    return this.http
      .put<ApiRespuesta<RangoAgenda>>(`${this.url}/${id}`, datos)
      .pipe(map((r) => r.datos));
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<ApiRespuesta<unknown>>(`${this.url}/${id}`).pipe(map(() => undefined));
  }
}
