import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { catchError, forkJoin, of, switchMap, tap } from 'rxjs';
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
import { EncabezadoPagina } from '../../../shared/components/encabezado-pagina/encabezado-pagina';
import { EstadoVacio } from '../../../shared/components/estado-vacio/estado-vacio';
import {
  DatosRangoDialog,
  RangoAgendaDialog,
} from '../../../shared/components/rango-agenda-dialog/rango-agenda-dialog';
import { SelectorFecha } from '../../../shared/components/selector-fecha/selector-fecha';
import {
  DatosRangosMedico,
  RangosMedicoDialog,
} from './rangos-medico-dialog/rangos-medico-dialog';
import {
  DatosTurnosMedico,
  TurnosMedicoDialog,
} from './turnos-medico-dialog/turnos-medico-dialog';

/** Una fila de la tabla: un médico con todos sus rangos de ese día en la sede elegida. */
interface AgendaDelMedico {
  idMedico: number;
  nombre: string;
  especialidades: string;
  rangos: RangoAgenda[];
}

/**
 * Agenda de la sede para un día. Se pueden consultar todas las sedes, pero solo la
 * propia se puede modificar: nueva agenda, editar rangos y ver/cancelar turnos.
 */
@Component({
  selector: 'app-agenda-operador',
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
    EstadoVacio,
    SelectorFecha,
  ],
  templateUrl: './agenda-operador.html',
})
export class AgendaOperador {
  private readonly agendaService = inject(AgendaService);
  private readonly dialog = inject(MatDialog);
  private readonly avisos = inject(AvisoService);

  protected readonly idSedePropia = inject(AuthService).payload()?.id_sede ?? null;
  protected readonly columnas = ['medico', 'especialidad', 'horario', 'acciones'];

  protected readonly fecha = signal(hoyIso());
  protected readonly idSede = signal<number | null>(this.idSedePropia);
  protected readonly esMiSede = computed(() => this.idSede() === this.idSedePropia);

  protected readonly sedes = signal<Sede[]>([]);
  /** Todos los médicos (con sus especialidades): se puede cargar agenda aunque no tengan ninguna. */
  private readonly medicos = signal<Medico[]>([]);
  protected readonly listoParaEditar = signal(false);

  protected readonly rangos = signal<RangoAgenda[]>([]);
  protected readonly cargando = signal(true);
  protected readonly errorServidor = signal<string | null>(null);
  private readonly recarga = signal(0);

  protected readonly agendaPorMedico = computed(() => {
    const filas = new Map<number, AgendaDelMedico>();
    for (const rango of this.rangos()) {
      const fila = filas.get(rango.id_medico) ?? {
        idMedico: rango.id_medico,
        nombre: `${rango.medico_apellido}, ${rango.medico_nombre}`,
        especialidades: '',
        rangos: [],
      };
      fila.rangos.push(rango);
      filas.set(rango.id_medico, fila);
    }
    return [...filas.values()].map((fila) => ({
      ...fila,
      especialidades: [...new Set(fila.rangos.map((r) => r.especialidad_descripcion))].join(', '),
    }));
  });

  constructor() {
    forkJoin({
      sedes: inject(SedeService).listar(),
      medicos: inject(MedicoService).listar(),
    }).subscribe({
      next: ({ sedes, medicos }) => {
        this.sedes.set(sedes);
        this.medicos.set(medicos);
        this.listoParaEditar.set(true);
      },
      error: (error: ErrorApi) => this.errorServidor.set(error.message),
    });

    // Cambiar la fecha o la sede actualiza la tabla.
    toObservable(
      computed(() => ({ fecha: this.fecha(), idSede: this.idSede(), recarga: this.recarga() })),
    )
      .pipe(
        tap(() => this.cargando.set(true)),
        switchMap(({ fecha, idSede }) =>
          this.agendaService.listar({ fecha, id_sede: idSede }).pipe(
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

  protected nuevaAgenda(): void {
    const datos: DatosRangoDialog = {
      fecha: this.fecha() < hoyIso() ? hoyIso() : this.fecha(),
      medicos: this.medicos(),
      sedes: this.sedes(),
      idSede: this.idSedePropia,
      sedeFija: true,
    };
    this.dialog
      .open(RangoAgendaDialog, { data: datos, width: '520px' })
      .afterClosed()
      .subscribe((guardado?: RangoAgenda) => {
        if (!guardado) return;
        this.avisos.exito(
          `Se cargó la agenda de ${guardado.medico_nombre} ${guardado.medico_apellido}.`,
        );
        this.fecha.set(guardado.fecha);
        this.recargar();
      });
  }

  protected editarAgenda(fila: AgendaDelMedico): void {
    const medico = this.medicos().find((m) => m.id === fila.idMedico);
    const sede = this.sedes().find((s) => s.id === this.idSedePropia);
    if (!medico || !sede) return;

    const datos: DatosRangosMedico = { medico, sede, fecha: this.fecha(), rangos: fila.rangos };
    this.dialog
      .open(RangosMedicoDialog, { data: datos, width: '560px' })
      .afterClosed()
      .subscribe(() => this.recargar());
  }

  protected verTurnos(fila: AgendaDelMedico): void {
    const datos: DatosTurnosMedico = {
      idMedico: fila.idMedico,
      nombreMedico: fila.nombre,
      fecha: this.fecha(),
    };
    this.dialog.open(TurnosMedicoDialog, { data: datos, width: '760px' });
  }

  private recargar(): void {
    this.recarga.update((n) => n + 1);
  }
}
