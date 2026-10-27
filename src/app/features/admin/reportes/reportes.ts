import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { catchError, debounceTime, forkJoin, of, switchMap, tap } from 'rxjs';
import { ErrorApi } from '../../../core/models/error-api.model';
import {
  RangoFechas,
  ReporteAgrupado,
  ReporteRanking,
  TasaCancelacion,
  TurnosPorEspecialidad,
  TurnosPorSede,
} from '../../../core/models/reporte.model';
import { ReporteService } from '../../../core/services/reporte.service';
import { aIso } from '../../../core/utils/fechas';
import { AlertaError } from '../../../shared/components/alerta-error/alerta-error';
import { Cargando } from '../../../shared/components/cargando/cargando';
import { EncabezadoPagina } from '../../../shared/components/encabezado-pagina/encabezado-pagina';
import { EstadoVacio } from '../../../shared/components/estado-vacio/estado-vacio';
import { TarjetaPorEstado } from './tarjeta-por-estado/tarjeta-por-estado';

interface Indicadores {
  especialidades: ReporteAgrupado<TurnosPorEspecialidad>;
  sedes: ReporteAgrupado<TurnosPorSede>;
  ranking: ReporteRanking;
  tasa: TasaCancelacion;
}

/** Dashboard con los cuatro indicadores del backend, filtrados por el mismo rango de fechas. */
@Component({
  selector: 'app-reportes',
  imports: [
    DatePipe,
    DecimalPipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    MatTableModule,
    AlertaError,
    Cargando,
    EncabezadoPagina,
    EstadoVacio,
    TarjetaPorEstado,
  ],
  // Chart.js se registra acá y no en app.config: así solo se descarga al entrar a Reportes.
  providers: [
    provideCharts(withDefaultRegisterables(), {
      defaults: { font: { family: 'Roboto, "Helvetica Neue", sans-serif' } },
    }),
  ],
  templateUrl: './reportes.html',
  styleUrl: './reportes.scss',
})
export class Reportes {
  private readonly reporteService = inject(ReporteService);

  protected readonly columnasRanking = ['posicion', 'medico', 'sede', 'atendidos'];

  protected readonly rango = new FormGroup({
    desde: new FormControl<Date | null>(null),
    hasta: new FormControl<Date | null>(null),
  });
  private readonly valorRango = toSignal(this.rango.valueChanges, {
    initialValue: this.rango.value,
  });
  protected readonly rangoAplicado = computed<RangoFechas>(() => {
    const { desde, hasta } = this.valorRango();
    return { desde: desde ? aIso(desde) : undefined, hasta: hasta ? aIso(hasta) : undefined };
  });

  protected readonly indicadores = signal<Indicadores | null>(null);
  protected readonly cargando = signal(true);
  protected readonly errorServidor = signal<string | null>(null);

  protected readonly filasEspecialidades = computed(
    () =>
      this.indicadores()?.especialidades.items.map((item) => ({
        ...item,
        nombre: item.especialidad,
      })) ?? [],
  );
  protected readonly filasSedes = computed(
    () => this.indicadores()?.sedes.items.map((item) => ({ ...item, nombre: item.sede })) ?? [],
  );

  constructor() {
    // Un cambio de rango vuelve a pedir los cuatro indicadores juntos: se actualizan a la vez.
    toObservable(this.rangoAplicado)
      .pipe(
        debounceTime(300),
        tap(() => {
          this.cargando.set(true);
          this.errorServidor.set(null);
        }),
        switchMap((rango) =>
          forkJoin({
            especialidades: this.reporteService.turnosPorEspecialidad(rango),
            sedes: this.reporteService.turnosPorSede(rango),
            ranking: this.reporteService.rankingMedicos(rango),
            tasa: this.reporteService.tasaCancelacion(rango),
          }).pipe(
            catchError((error: ErrorApi) => {
              this.errorServidor.set(error.message);
              return of(null);
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((indicadores) => {
        // Si falla, se conserva lo último que se mostró en lugar de vaciar la pantalla.
        if (indicadores) this.indicadores.set(indicadores);
        this.cargando.set(false);
      });
  }

  protected limpiarRango(): void {
    this.rango.reset();
  }
}
