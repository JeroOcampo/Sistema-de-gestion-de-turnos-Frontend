import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { ApiRespuesta } from '../models/api-respuesta.model';
import { DatosHistorial } from '../models/historial.model';
import { DatosNuevoTurno, Turno } from '../models/turno.model';

@Injectable({ providedIn: 'root' })
export class TurnoService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_BASE_URL}/turnos`;

  crear(datos: DatosNuevoTurno): Observable<Turno> {
    return this.http.post<ApiRespuesta<Turno>>(this.url, datos).pipe(map((r) => r.datos));
  }

  /** Turnos del paciente logueado. */
  misTurnos(): Observable<Turno[]> {
    return this.http.get<ApiRespuesta<Turno[]>>(`${this.url}/mis-turnos`).pipe(map((r) => r.datos));
  }

  /** Turnos del médico logueado para una fecha, en todas sus sedes (sin los cancelados). */
  delMedico(fecha: string): Observable<Turno[]> {
    return this.http
      .get<ApiRespuesta<Turno[]>>(`${this.url}/medico`, { params: { fecha } })
      .pipe(map((r) => r.datos));
  }

  /** Turnos de la sede del operador para una fecha (sin los cancelados). */
  deMiSede(fecha: string): Observable<Turno[]> {
    return this.http
      .get<ApiRespuesta<Turno[]>>(`${this.url}/sede`, { params: { fecha } })
      .pipe(map((r) => r.datos));
  }

  cancelar(id: number): Observable<Turno> {
    return this.http
      .patch<ApiRespuesta<Turno>>(`${this.url}/${id}/cancelar`, {})
      .pipe(map((r) => r.datos));
  }

  /** Marca el turno como atendido y registra su historial clínico en la misma operación. */
  atender(id: number, historial: DatosHistorial): Observable<Turno> {
    return this.http
      .patch<ApiRespuesta<Turno>>(`${this.url}/${id}/atender`, historial)
      .pipe(map((r) => r.datos));
  }
}
