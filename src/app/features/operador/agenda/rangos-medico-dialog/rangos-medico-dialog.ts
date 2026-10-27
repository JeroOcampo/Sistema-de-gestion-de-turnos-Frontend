import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { filter, switchMap } from 'rxjs';
import { RangoAgenda } from '../../../../core/models/agenda.model';
import { ErrorApi } from '../../../../core/models/error-api.model';
import { Medico } from '../../../../core/models/medico.model';
import { Sede } from '../../../../core/models/sede.model';
import { AgendaService } from '../../../../core/services/agenda.service';
import { hoyIso } from '../../../../core/utils/fechas';
import { AlertaError } from '../../../../shared/components/alerta-error/alerta-error';
import { ConfirmacionService } from '../../../../shared/components/confirmacion-dialog/confirmacion-dialog';
import { EstadoVacio } from '../../../../shared/components/estado-vacio/estado-vacio';
import {
  DatosRangoDialog,
  RangoAgendaDialog,
} from '../../../../shared/components/rango-agenda-dialog/rango-agenda-dialog';

export interface DatosRangosMedico {
  medico: Medico;
  fecha: string;
  sede: Sede;
  rangos: RangoAgenda[];
}

/**
 * Edición de la agenda de un médico en la sede del operador para un día: agregar,
 * modificar o eliminar sus rangos horarios.
 */
@Component({
  selector: 'app-rangos-medico-dialog',
  imports: [
    DatePipe,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatTooltipModule,
    AlertaError,
    EstadoVacio,
  ],
  templateUrl: './rangos-medico-dialog.html',
  styles: `
    .fila-rango {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid var(--mat-sys-outline-variant);
    }
  `,
})
export class RangosMedicoDialog {
  private readonly agendaService = inject(AgendaService);
  private readonly dialog = inject(MatDialog);
  private readonly confirmacion = inject(ConfirmacionService);
  protected readonly datos = inject<DatosRangosMedico>(MAT_DIALOG_DATA);

  protected readonly rangos = signal(this.datos.rangos);
  /** Los rangos de días pasados quedan como registro: no se modifican ni se eliminan. */
  protected readonly esPasada = this.datos.fecha < hoyIso();
  protected readonly errorServidor = signal<string | null>(null);

  protected abrirFormulario(rango?: RangoAgenda): void {
    this.errorServidor.set(null);
    const datos: DatosRangoDialog = {
      rango,
      fecha: this.datos.fecha,
      medicos: [this.datos.medico],
      sedes: [this.datos.sede],
      idSede: this.datos.sede.id,
      sedeFija: true,
    };
    this.dialog
      .open(RangoAgendaDialog, { data: datos, width: '520px' })
      .afterClosed()
      .subscribe((guardado?: RangoAgenda) => {
        if (guardado) this.recargar();
      });
  }

  protected eliminar(rango: RangoAgenda): void {
    this.errorServidor.set(null);
    this.confirmacion
      .preguntar({
        titulo: 'Eliminar rango horario',
        mensaje: `¿Está seguro de eliminar el rango de ${rango.hora_entrada} a ${rango.hora_salida}?`,
        textoConfirmar: 'Eliminar',
      })
      .pipe(
        filter(Boolean),
        switchMap(() => this.agendaService.eliminar(rango.id)),
      )
      .subscribe({
        next: () => this.recargar(),
        // Por ejemplo, si el rango tiene turnos confirmados.
        error: (error: ErrorApi) => this.errorServidor.set(error.message),
      });
  }

  private recargar(): void {
    this.agendaService
      .listar({
        fecha: this.datos.fecha,
        id_sede: this.datos.sede.id,
        id_medico: this.datos.medico.id,
      })
      .subscribe({
        next: (rangos) => this.rangos.set(rangos),
        error: (error: ErrorApi) => this.errorServidor.set(error.message),
      });
  }
}
