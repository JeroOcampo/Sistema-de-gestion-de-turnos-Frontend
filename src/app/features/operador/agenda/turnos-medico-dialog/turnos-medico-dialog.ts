import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { filter, switchMap } from 'rxjs';
import { ErrorApi } from '../../../../core/models/error-api.model';
import { Turno } from '../../../../core/models/turno.model';
import { AvisoService } from '../../../../core/services/aviso.service';
import { NotificacionService } from '../../../../core/services/notificacion.service';
import { TurnoService } from '../../../../core/services/turno.service';
import { AlertaError } from '../../../../shared/components/alerta-error/alerta-error';
import { Cargando } from '../../../../shared/components/cargando/cargando';
import { ConfirmacionService } from '../../../../shared/components/confirmacion-dialog/confirmacion-dialog';
import { EstadoVacio } from '../../../../shared/components/estado-vacio/estado-vacio';

export interface DatosTurnosMedico {
  idMedico: number;
  nombreMedico: string;
  fecha: string;
}

/** Turnos confirmados de un médico en la sede del operador para un día, con la opción de cancelarlos. */
@Component({
  selector: 'app-turnos-medico-dialog',
  imports: [
    DatePipe,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatTableModule,
    AlertaError,
    Cargando,
    EstadoVacio,
  ],
  templateUrl: './turnos-medico-dialog.html',
})
export class TurnosMedicoDialog {
  private readonly turnoService = inject(TurnoService);
  private readonly notificaciones = inject(NotificacionService);
  private readonly confirmacion = inject(ConfirmacionService);
  private readonly avisos = inject(AvisoService);
  protected readonly datos = inject<DatosTurnosMedico>(MAT_DIALOG_DATA);

  protected readonly columnas = ['hora', 'paciente', 'nota', 'acciones'];
  protected readonly turnos = signal<Turno[]>([]);
  protected readonly cargando = signal(true);
  protected readonly errorServidor = signal<string | null>(null);

  constructor() {
    this.cargar();
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
          this.avisos.exito('El turno se canceló y se avisó al paciente y al médico.');
          this.notificaciones.actualizar();
          this.cargar();
        },
        error: (error: ErrorApi) => this.errorServidor.set(error.message),
      });
  }

  private cargar(): void {
    this.cargando.set(true);
    // El backend devuelve los turnos de la sede del operador; acá se dejan los confirmados del médico.
    this.turnoService.deMiSede(this.datos.fecha).subscribe({
      next: (turnos) => {
        this.turnos.set(
          turnos.filter((t) => t.id_medico === this.datos.idMedico && t.estado === 'confirmado'),
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
