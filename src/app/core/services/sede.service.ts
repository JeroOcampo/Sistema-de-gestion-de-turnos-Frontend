import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { ApiRespuesta } from '../models/api-respuesta.model';
import { DatosSede, Sede } from '../models/sede.model';

@Injectable({ providedIn: 'root' })
export class SedeService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_BASE_URL}/sedes`;

  listar(): Observable<Sede[]> {
    return this.http.get<ApiRespuesta<Sede[]>>(this.url).pipe(map((r) => r.datos));
  }

  crear(datos: DatosSede): Observable<Sede> {
    return this.http.post<ApiRespuesta<Sede>>(this.url, datos).pipe(map((r) => r.datos));
  }

  actualizar(id: number, datos: DatosSede): Observable<Sede> {
    return this.http.put<ApiRespuesta<Sede>>(`${this.url}/${id}`, datos).pipe(map((r) => r.datos));
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<ApiRespuesta<unknown>>(`${this.url}/${id}`).pipe(map(() => undefined));
  }
}
