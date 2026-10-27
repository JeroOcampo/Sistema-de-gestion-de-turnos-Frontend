import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { RegistroHistorial } from '../../../core/models/historial.model';
import { EstadoVacio } from '../estado-vacio/estado-vacio';

/** Registros de historial clínico. La usan el médico (sus pacientes) y el paciente (el propio). */
@Component({
  selector: 'app-tabla-historial',
  imports: [DatePipe, MatTableModule, EstadoVacio],
  template: `
    @if (registros().length === 0) {
      <app-estado-vacio icono="history_edu" [mensaje]="mensajeVacio()" />
    } @else {
      <div class="tabla-contenedor">
        <table mat-table [dataSource]="registros()">
          <ng-container matColumnDef="turno">
            <th mat-header-cell *matHeaderCellDef>Turno</th>
            <td mat-cell *matCellDef="let registro" class="sin-corte">
              {{ registro.turno_fecha | date: 'dd/MM/yyyy' }}
              <div class="texto-secundario">{{ registro.turno_hora }} h</div>
            </td>
          </ng-container>

          <ng-container matColumnDef="atencion">
            <th mat-header-cell *matHeaderCellDef>
              {{ mostrarMedico() ? 'Médico' : 'Especialidad' }}
            </th>
            <td mat-cell *matCellDef="let registro">
              {{ mostrarMedico() ? registro.medico_nombre : registro.especialidad_descripcion }}
              <div class="texto-secundario">
                @if (mostrarMedico()) {
                  {{ registro.especialidad_descripcion }} ·
                }
                {{ registro.sede_nombre }}
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="diagnostico">
            <th mat-header-cell *matHeaderCellDef>Diagnóstico</th>
            <td mat-cell *matCellDef="let registro">{{ registro.diagnostico }}</td>
          </ng-container>

          <ng-container matColumnDef="tratamiento">
            <th mat-header-cell *matHeaderCellDef>Tratamiento</th>
            <td mat-cell *matCellDef="let registro">{{ registro.tratamiento || '—' }}</td>
          </ng-container>

          <ng-container matColumnDef="observaciones">
            <th mat-header-cell *matHeaderCellDef>Observaciones</th>
            <td mat-cell *matCellDef="let registro">{{ registro.observaciones || '—' }}</td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columnas"></tr>
          <tr mat-row *matRowDef="let fila; columns: columnas"></tr>
        </table>
      </div>
    }
  `,
})
export class TablaHistorial {
  readonly registros = input.required<RegistroHistorial[]>();
  /** El médico ve sus propios registros: para él la columna muestra la especialidad. */
  readonly mostrarMedico = input(true);
  readonly mensajeVacio = input('No hay registros de historial clínico.');

  protected readonly columnas = ['turno', 'atencion', 'diagnostico', 'tratamiento', 'observaciones'];
}
