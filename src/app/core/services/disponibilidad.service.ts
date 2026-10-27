import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { ApiRespuesta } from '../models/api-respuesta.model';
import { aParams } from '../utils/http';

export interface ConsultaDisponibilidad {
  id_medico: number;
  id_especialidad: number;
  id_sede: number;
}

/** Fechas y horarios libres para pedir turno (solo horas, sin datos de otros pacientes). */
@Injectable({ providedIn: 'root' })
export class DisponibilidadService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_BASE_URL}/disponibilidad`;

  /** Fechas (AAAA-MM-DD) desde hoy con al menos un horario libre. */
  fechas(consulta: ConsultaDisponibilidad): Observable<string[]> {
    return this.http
      .get<ApiRespuesta<string[]>>(`${this.url}/fechas`, { params: aParams(consulta) })
      .pipe(map((r) => r.datos));
  }

  /** Horarios (HH:MM) libres de un día. */
  horarios(consulta: ConsultaDisponibilidad & { fecha: string }): Observable<string[]> {
    return this.http
      .get<ApiRespuesta<string[]>>(`${this.url}/horarios`, { params: aParams(consulta) })
      .pipe(map((r) => r.datos));
  }
}
