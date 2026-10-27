import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { ApiRespuesta } from '../models/api-respuesta.model';
import { RegistroHistorial } from '../models/historial.model';

@Injectable({ providedIn: 'root' })
export class HistorialService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_BASE_URL}/historial-clinico`;

  /**
   * Historial clínico de un paciente. El paciente solo puede pedir el propio y el
   * médico recibe únicamente los registros de los turnos que atendió él.
   */
  dePaciente(idPaciente: number): Observable<RegistroHistorial[]> {
    return this.http
      .get<ApiRespuesta<RegistroHistorial[]>>(`${this.url}/paciente/${idPaciente}`)
      .pipe(map((r) => r.datos));
  }
}
