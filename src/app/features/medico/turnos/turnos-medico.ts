import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { catchError, filter, of, switchMap, tap } from 'rxjs';
import { ErrorApi } from '../../../core/models/error-api.model';
import { Turno } from '../../../core/models/turno.model';
import { AvisoService } from '../../../core/services/aviso.service';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { SedeService } from '../../../core/services/sede.service';
import { TurnoService } from '../../../core/services/turno.service';
import { hoyIso } from '../../../core/utils/fechas';
import { AlertaError } from '../../../shared/components/alerta-error/alerta-error';
import { Cargando } from '../../../shared/components/cargando/cargando';
import { ConfirmacionService } from '../../../shared/components/confirmacion-dialog/confirmacion-dialog';
import { EncabezadoPagina } from '../../../shared/components/encabezado-pagina/encabezado-pagina';
import { EstadoTurno } from '../../../shared/components/estado-turno/estado-turno';
import { EstadoVacio } from '../../../shared/components/estado-vacio/estado-vacio';
import { SelectorFecha } from '../../../shared/components/selector-fecha/selector-fecha';
import { EdadPipe } from '../../../shared/pipes/edad.pipe';
import { AtenderDialog } from './atender-dialog/atender-dialog';

/** Turnos del médico logueado para un día, en todas las sedes donde atiende. */
@Component({
  selector: 'app-turnos-medico',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
    MatTableModule,
    MatTooltipModule,
    AlertaError,
    Cargando,
    EncabezadoPagina,
    EstadoTurno,
    EstadoVacio,
    SelectorFecha,
    EdadPipe,
  ],
  templateUrl: './turnos-medico.html',
  styleUrl: './turnos-medico.scss',
})
export class TurnosMedico {
  private readonly turnoService = inject(TurnoService);
  private readonly notificaciones = inject(NotificacionService);
  private readonly dialog = inject(MatDialog);
  private readonly confirmacion = inject(ConfirmacionService);
  private readonly avisos = inject(AvisoService);

  protected readonly columnas = ['expandir', 'hora', 'paciente', 'edad', 'sede', 'estado', 'acciones'];
  protected readonly sedes = toSignal(
    inject(SedeService)
      .listar()
      .pipe(catchError(() => of([]))),
    { initialValue: [] },
  );

  protected readonly fecha = signal(hoyIso());
  /** 0 = todas las sedes (un valor null dejaría el select en blanco). */
  protected readonly idSede = signal(0);
  protected readonly expandido = signal<number | null>(null);

  protected readonly turnos = signal<Turno[]>([]);
  protected readonly cargando = signal(true);
  protected readonly errorServidor = signal<string | null>(null);
  private readonly recarga = signal(0);

  /** Ordenados por hora (los más próximos primero) y filtrados por sede. */
  protected readonly filtrados = computed(() => {
    const idSede = this.idSede();
    return this.turnos()
      .filter((turno) => !idSede || turno.id_sede === idSede)
      .sort((a, b) => a.hora.localeCompare(b.hora));
  });

  constructor() {
    toObservable(computed(() => ({ fecha: this.fecha(), recarga: this.recarga() })))
      .pipe(
        tap(() => this.cargando.set(true)),
        switchMap(({ fecha }) =>
          this.turnoService.delMedico(fecha).pipe(
            catchError((error: ErrorApi) => {
              this.errorServidor.set(error.message);
              return of([]);
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((turnos) => {
        this.turnos.set(turnos);
        this.cargando.set(false);
      });
  }

  /** Al hacer click en un turno se despliega (o se oculta) la nota del paciente. */
  protected alternar(turno: Turno): void {
    this.expandido.update((actual) => (actual === turno.id ? null : turno.id));
  }

  protected atender(turno: Turno): void {
    this.errorServidor.set(null);
    this.dialog
      .open(AtenderDialog, { data: turno, width: '560px' })
      .afterClosed()
      .subscribe((atendido?: Turno) => {
        if (!atendido) return;
        this.avisos.exito(`El turno de ${turno.paciente_nombre} quedó atendido.`);
        this.despuesDeOperar();
      });
  }

  protected cancelar(turno: Turno): void {
    this.errorServidor.set(null);
    this.confirmacion
      .preguntar({
        titulo: 'Cancelar turno',
        mensaje: `¿Está seguro de cancelar el turno de ${turno.paciente_nombre} de las ${turno.hora}?`,
        textoConfirmar: 'Cancelar turno',
      })
      .pipe(
        filter(Boolean),
        switchMap(() => this.turnoService.cancelar(turno.id)),
      )
      .subscribe({
        next: () => {
          this.avisos.exito('El turno se canceló y se avisó al paciente.');
          this.despuesDeOperar();
        },
        error: (error: ErrorApi) => this.errorServidor.set(error.message),
      });
  }

  /** Recarga la lista y el contador de la campana (la operación genera notificaciones). */
  private despuesDeOperar(): void {
    this.recarga.update((n) => n + 1);
    this.notificaciones.actualizar();
  }
}
