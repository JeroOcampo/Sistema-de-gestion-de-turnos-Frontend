import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { ApiRespuesta } from '../models/api-respuesta.model';
import { Cobertura } from '../models/cobertura.model';

@Injectable({ providedIn: 'root' })
export class CoberturaService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_BASE_URL}/coberturas`;

  listar(): Observable<Cobertura[]> {
    return this.http.get<ApiRespuesta<Cobertura[]>>(this.url).pipe(map((r) => r.datos));
  }
}
