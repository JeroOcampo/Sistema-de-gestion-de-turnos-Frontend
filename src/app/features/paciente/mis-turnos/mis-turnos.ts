import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { filter, forkJoin, switchMap } from 'rxjs';
import { ErrorApi } from '../../../core/models/error-api.model';
import { RegistroHistorial } from '../../../core/models/historial.model';
import { Turno } from '../../../core/models/turno.model';
import { AuthService } from '../../../core/services/auth.service';
import { AvisoService } from '../../../core/services/aviso.service';
import { HistorialService } from '../../../core/services/historial.service';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { TurnoService } from '../../../core/services/turno.service';
import { aFechaHora } from '../../../core/utils/fechas';
import { AlertaError } from '../../../shared/components/alerta-error/alerta-error';
import { Cargando } from '../../../shared/components/cargando/cargando';
import { ConfirmacionService } from '../../../shared/components/confirmacion-dialog/confirmacion-dialog';
import { EncabezadoPagina } from '../../../shared/components/encabezado-pagina/encabezado-pagina';
import { EstadoTurno } from '../../../shared/components/estado-turno/estado-turno';
import { EstadoVacio } from '../../../shared/components/estado-vacio/estado-vacio';

/** Turno del paciente con el historial clínico que cargó el médico, si ya fue atendido. */
interface TurnoDelPaciente extends Turno {
  momento: Date;
  historial?: RegistroHistorial;
}

@Component({
  selector: 'app-mis-turnos',
  imports: [
    DatePipe,
    NgTemplateOutlet,
    RouterLink,
    MatButtonModule,
    MatExpansionModule,
    MatIconModule,
    AlertaError,
    Cargando,
    EncabezadoPagina,
    EstadoTurno,
    EstadoVacio,
  ],
  templateUrl: './mis-turnos.html',
  styleUrl: './mis-turnos.scss',
})
export class MisTurnos {
  private readonly turnoService = inject(TurnoService);
  private readonly historialService = inject(HistorialService);
  private readonly notificaciones = inject(NotificacionService);
  private readonly confirmacion = inject(ConfirmacionService);
  private readonly avisos = inject(AvisoService);
  private readonly idPaciente = inject(AuthService).payload()!.id;

  /** Del más próximo al menos próximo. */
  protected readonly proximos = signal<TurnoDelPaciente[]>([]);
  /** Del más reciente al más antiguo. */
  protected readonly anteriores = signal<TurnoDelPaciente[]>([]);
  protected readonly cargando = signal(true);
  protected readonly errorServidor = signal<string | null>(null);

  constructor() {
    this.cargar();
  }

  protected cancelar(turno: TurnoDelPaciente): void {
    this.errorServidor.set(null);
    this.confirmacion
      .preguntar({
        titulo: 'Cancelar turno',
        mensaje: `¿Está seguro de cancelar el turno de ${turno.especialidad_descripcion} con ${turno.medico_nombre}?`,
        textoConfirmar: 'Cancelar turno',
      })
      .pipe(
        filter(Boolean),
        switchMap(() => this.turnoService.cancelar(turno.id)),
      )
      .subscribe({
        next: () => {
          this.avisos.exito('Tu turno se canceló.');
          this.notificaciones.actualizar();
          this.cargar();
        },
        error: (error: ErrorApi) => this.errorServidor.set(error.message),
      });
  }

  private cargar(): void {
    this.cargando.set(true);
    forkJoin({
      turnos: this.turnoService.misTurnos(),
      historial: this.historialService.dePaciente(this.idPaciente),
    }).subscribe({
      next: ({ turnos, historial }) => {
        const ahora = new Date();
        const conHistorial = turnos.map((turno) => ({
          ...turno,
          momento: aFechaHora(turno.fecha, turno.hora),
          historial: historial.find((registro) => registro.id_turno === turno.id),
        }));
        this.proximos.set(
          conHistorial
            .filter((t) => t.momento >= ahora)
            .sort((a, b) => a.momento.getTime() - b.momento.getTime()),
        );
        this.anteriores.set(
          conHistorial
            .filter((t) => t.momento < ahora)
            .sort((a, b) => b.momento.getTime() - a.momento.getTime()),
        );
        this.cargando.set(false);
      },
      error: (error: ErrorApi) => {
        this.errorServidor.set(error.message);
        this.cargando.set(false);
      },
    });
  }
}
