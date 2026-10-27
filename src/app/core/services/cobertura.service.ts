import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { ApiRespuesta } from '../models/api-respuesta.model';
import { Cobertura, DatosCobertura } from '../models/cobertura.model';

@Injectable({ providedIn: 'root' })
export class CoberturaService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_BASE_URL}/coberturas`;

  listar(): Observable<Cobertura[]> {
    return this.http.get<ApiRespuesta<Cobertura[]>>(this.url).pipe(map((r) => r.datos));
  }

  crear(datos: DatosCobertura): Observable<Cobertura> {
    return this.http.post<ApiRespuesta<Cobertura>>(this.url, datos).pipe(map((r) => r.datos));
  }

  actualizar(id: number, datos: DatosCobertura): Observable<Cobertura> {
    return this.http
      .put<ApiRespuesta<Cobertura>>(`${this.url}/${id}`, datos)
      .pipe(map((r) => r.datos));
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<ApiRespuesta<unknown>>(`${this.url}/${id}`).pipe(map(() => undefined));
  }
}
