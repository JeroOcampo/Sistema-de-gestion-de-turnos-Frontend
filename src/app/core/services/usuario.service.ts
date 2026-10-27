import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { ApiRespuesta } from '../models/api-respuesta.model';
import { Pagina } from '../models/pagina.model';
import { DatosUsuario, FiltrosUsuarios, UsuarioGestion } from '../models/usuario.model';
import { aParams } from '../utils/http';

/** Gestión de usuarios del administrador. */
@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_BASE_URL}/usuarios`;

  listar(filtros: FiltrosUsuarios, limite: number, offset: number): Observable<Pagina<UsuarioGestion>> {
    return this.http
      .get<ApiRespuesta<Pagina<UsuarioGestion>>>(this.url, {
        params: aParams({ ...filtros, limite, offset }),
      })
      .pipe(map((r) => r.datos));
  }

  obtener(id: number): Observable<UsuarioGestion> {
    return this.http
      .get<ApiRespuesta<UsuarioGestion>>(`${this.url}/${id}`)
      .pipe(map((r) => r.datos));
  }

  crear(datos: DatosUsuario): Observable<UsuarioGestion> {
    return this.http
      .post<ApiRespuesta<UsuarioGestion>>(this.url, datos)
      .pipe(map((r) => r.datos));
  }

  actualizar(id: number, datos: DatosUsuario): Observable<UsuarioGestion> {
    return this.http
      .put<ApiRespuesta<UsuarioGestion>>(`${this.url}/${id}`, datos)
      .pipe(map((r) => r.datos));
  }
}
