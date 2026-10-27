import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { ApiRespuesta } from '../models/api-respuesta.model';
import { FiltrosMedicos, Medico } from '../models/medico.model';
import { aParams } from '../utils/http';

@Injectable({ providedIn: 'root' })
export class MedicoService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_BASE_URL}/medicos`;

  listar(filtros: FiltrosMedicos = {}): Observable<Medico[]> {
    return this.http
      .get<ApiRespuesta<Medico[]>>(this.url, { params: aParams(filtros) })
      .pipe(map((r) => r.datos));
  }

  obtener(id: number): Observable<Medico> {
    return this.http.get<ApiRespuesta<Medico>>(`${this.url}/${id}`).pipe(map((r) => r.datos));
  }
}
