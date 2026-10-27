import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { ApiRespuesta } from '../models/api-respuesta.model';
import { DatosEspecialidad, Especialidad } from '../models/especialidad.model';

@Injectable({ providedIn: 'root' })
export class EspecialidadService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_BASE_URL}/especialidades`;

  listar(): Observable<Especialidad[]> {
    return this.http.get<ApiRespuesta<Especialidad[]>>(this.url).pipe(map((r) => r.datos));
  }

  crear(datos: DatosEspecialidad): Observable<Especialidad> {
    return this.http.post<ApiRespuesta<Especialidad>>(this.url, datos).pipe(map((r) => r.datos));
  }

  actualizar(id: number, datos: DatosEspecialidad): Observable<Especialidad> {
    return this.http
      .put<ApiRespuesta<Especialidad>>(`${this.url}/${id}`, datos)
      .pipe(map((r) => r.datos));
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<ApiRespuesta<unknown>>(`${this.url}/${id}`).pipe(map(() => undefined));
  }
}
