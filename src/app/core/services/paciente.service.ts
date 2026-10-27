import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { ApiRespuesta } from '../models/api-respuesta.model';
import { DatosRegistroPaciente, PacienteRegistrado } from '../models/auth.model';
import { DatosMisDatos, Paciente } from '../models/paciente.model';
import { Usuario } from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class PacienteService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_BASE_URL}/pacientes`;

  /** Búsqueda por DNI o apellido (operador, médico y administrador). */
  buscar(busqueda: string): Observable<Paciente[]> {
    return this.http
      .get<ApiRespuesta<Paciente[]>>(this.url, { params: { busqueda } })
      .pipe(map((r) => r.datos));
  }

  /** Alta de paciente hecha por el operador (mismos datos que el registro). */
  crear(datos: DatosRegistroPaciente): Observable<PacienteRegistrado> {
    return this.http
      .post<ApiRespuesta<PacienteRegistrado>>(this.url, datos)
      .pipe(map((r) => r.datos));
  }

  /** El paciente actualiza su email, contraseña, teléfono y cobertura. */
  actualizarMisDatos(datos: DatosMisDatos): Observable<Usuario> {
    return this.http
      .put<ApiRespuesta<Usuario>>(`${this.url}/mis-datos`, datos)
      .pipe(map((r) => r.datos));
  }
}
