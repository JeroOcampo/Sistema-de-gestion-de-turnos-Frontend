import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { ApiRespuesta } from '../models/api-respuesta.model';
import { FiltrosAuditoria, RegistroAuditoria } from '../models/auditoria.model';
import { Pagina } from '../models/pagina.model';
import { aParams } from '../utils/http';

@Injectable({ providedIn: 'root' })
export class AuditoriaService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_BASE_URL}/auditoria`;

  /** Registros de auditoría, del más reciente al más antiguo. */
  listar(
    filtros: FiltrosAuditoria,
    limite: number,
    offset: number,
  ): Observable<Pagina<RegistroAuditoria>> {
    return this.http
      .get<ApiRespuesta<Pagina<RegistroAuditoria>>>(this.url, {
        params: aParams({ ...filtros, limite, offset }),
      })
      .pipe(map((r) => r.datos));
  }
}
