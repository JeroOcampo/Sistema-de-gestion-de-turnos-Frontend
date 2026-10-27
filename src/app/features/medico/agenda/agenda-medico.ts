import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { catchError, filter, forkJoin, of, switchMap, tap } from 'rxjs';
import { RangoAgenda } from '../../../core/models/agenda.model';
import { ErrorApi } from '../../../core/models/error-api.model';
import { Medico } from '../../../core/models/medico.model';
import { Sede } from '../../../core/models/sede.model';
import { AgendaService } from '../../../core/services/agenda.service';
import { AuthService } from '../../../core/services/auth.service';
import { AvisoService } from '../../../core/services/aviso.service';
import { MedicoService } from '../../../core/services/medico.service';
import { SedeService } from '../../../core/services/sede.service';
import { hoyIso } from '../../../core/utils/fechas';
import { AlertaError } from '../../../shared/components/alerta-error/alerta-error';
import { Cargando } from '../../../shared/components/cargando/cargando';
import { ConfirmacionService } from '../../../shared/components/confirmacion-dialog/confirmacion-dialog';
import { EncabezadoPagina } from '../../../shared/components/encabezado-pagina/encabezado-pagina';
import { EstadoVacio } from '../../../shared/components/estado-vacio/estado-vacio';
import {
  DatosRangoDialog,
  RangoAgendaDialog,
} from '../../../shared/components/rango-agenda-dialog/rango-agenda-dialog';
import { SelectorFecha } from '../../../shared/components/selector-fecha/selector-fecha';

/** Agenda del médico logueado: sus rangos horarios de un día, en todas las sedes donde atiende. */
@Component({
  selector: 'app-agenda-medico',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatTooltipModule,
    AlertaError,
    Cargando,
    EncabezadoPagina,
    EstadoVacio,
    SelectorFecha,
  ],
  templateUrl: './agenda-medico.html',
})
export class AgendaMedico {
  private readonly agendaService = inject(AgendaService);
  private readonly dialog = inject(MatDialog);
  private readonly confirmacion = inject(ConfirmacionService);
  private readonly avisos = inject(AvisoService);
  private readonly sesion = inject(AuthService).payload();

  protected readonly columnas = ['horario', 'especialidad', 'sede', 'acciones'];
  protected readonly fecha = signal(hoyIso());
  /** Los rangos de días pasados quedan como registro: no se modifican ni se eliminan. */
  protected readonly esPasada = computed(() => this.fecha() < hoyIso());

  protected readonly rangos = signal<RangoAgenda[]>([]);
  protected readonly cargando = signal(true);
  protected readonly errorServidor = signal<string | null>(null);
  private readonly recarga = signal(0);

  // Para el formulario: las especialidades del propio médico y las sedes donde puede atender.
  private medico: Medico | null = null;
  private sedes: Sede[] = [];
  protected readonly listoParaCargar = signal(false);

  constructor() {
    forkJoin({
      medico: inject(MedicoService).obtener(this.sesion!.id),
      sedes: inject(SedeService).listar(),
    }).subscribe({
      next: ({ medico, sedes }) => {
        this.medico = medico;
        this.sedes = sedes;
        this.listoParaCargar.set(true);
      },
      error: (error: ErrorApi) => this.errorServidor.set(error.message),
    });

    toObservable(computed(() => ({ fecha: this.fecha(), recarga: this.recarga() })))
      .pipe(
        tap(() => this.cargando.set(true)),
        switchMap(({ fecha }) =>
          this.agendaService.listar({ fecha }).pipe(
            catchError((error: ErrorApi) => {
              this.errorServidor.set(error.message);
              return of([]);
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((rangos) => {
        this.rangos.set(rangos);
        this.cargando.set(false);
      });
  }

  protected abrirFormulario(rango?: RangoAgenda): void {
    if (!this.medico) return;
    this.errorServidor.set(null);
    const datos: DatosRangoDialog = {
      rango,
      fecha: this.esPasada() ? hoyIso() : this.fecha(),
      medicos: [this.medico],
      sedes: this.sedes,
      // Puede atender en más de una sede: se propone la suya, pero puede elegir otra.
      idSede: this.sesion?.id_sede ?? null,
      sedeFija: false,
    };
    this.dialog
      .open(RangoAgendaDialog, { data: datos, width: '520px' })
      .afterClosed()
      .subscribe((guardado?: RangoAgenda) => {
        if (!guardado) return;
        this.avisos.exito(rango ? 'El rango horario se modificó.' : 'El rango horario se agregó.');
        this.fecha.set(guardado.fecha);
        this.recarga.update((n) => n + 1);
      });
  }

  protected eliminar(rango: RangoAgenda): void {
    this.errorServidor.set(null);
    this.confirmacion
      .preguntar({
        titulo: 'Eliminar rango horario',
        mensaje: `¿Está seguro de eliminar el rango de ${rango.hora_entrada} a ${rango.hora_salida} en ${rango.sede_nombre}?`,
        textoConfirmar: 'Eliminar',
      })
      .pipe(
        filter(Boolean),
        switchMap(() => this.agendaService.eliminar(rango.id)),
      )
      .subscribe({
        next: () => {
          this.avisos.exito('El rango horario se eliminó.');
          this.recarga.update((n) => n + 1);
        },
        // Por ejemplo, si el rango tiene turnos confirmados.
        error: (error: ErrorApi) => this.errorServidor.set(error.message),
      });
  }
}
