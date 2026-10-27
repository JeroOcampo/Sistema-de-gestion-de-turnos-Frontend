import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { ApiRespuesta } from '../models/api-respuesta.model';
import {
  RangoFechas,
  ReporteAgrupado,
  ReporteRanking,
  TasaCancelacion,
  TurnosPorEspecialidad,
  TurnosPorSede,
} from '../models/reporte.model';
import { aParams } from '../utils/http';

@Injectable({ providedIn: 'root' })
export class ReporteService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_BASE_URL}/reportes`;

  turnosPorEspecialidad(rango: RangoFechas): Observable<ReporteAgrupado<TurnosPorEspecialidad>> {
    return this.obtener('turnos-por-especialidad', rango);
  }

  turnosPorSede(rango: RangoFechas): Observable<ReporteAgrupado<TurnosPorSede>> {
    return this.obtener('turnos-por-sede', rango);
  }

  rankingMedicos(rango: RangoFechas): Observable<ReporteRanking> {
    return this.obtener('ranking-medicos', rango);
  }

  tasaCancelacion(rango: RangoFechas): Observable<TasaCancelacion> {
    return this.obtener('tasa-cancelacion', rango);
  }

  private obtener<T>(reporte: string, rango: RangoFechas): Observable<T> {
    return this.http
      .get<ApiRespuesta<T>>(`${this.url}/${reporte}`, { params: aParams(rango) })
      .pipe(map((r) => r.datos));
  }
}
