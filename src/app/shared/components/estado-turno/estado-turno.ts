import { Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { EstadoTurno as Estado } from '../../../core/models/turno.model';

const PRESENTACION: Record<Estado, { etiqueta: string; icono: string }> = {
  confirmado: { etiqueta: 'Confirmado', icono: 'event_available' },
  atendido: { etiqueta: 'Atendido', icono: 'check_circle' },
  cancelado: { etiqueta: 'Cancelado', icono: 'cancel' },
};

/** Etiqueta de color con ícono que distingue el estado de un turno. */
@Component({
  selector: 'app-estado-turno',
  imports: [MatIconModule],
  template: `
    <span [class]="'estado-turno estado-' + estado()">
      <mat-icon aria-hidden="true">{{ presentacion().icono }}</mat-icon>
      {{ presentacion().etiqueta }}
    </span>
  `,
  styles: `
    .estado-turno {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 10px 2px 6px;
      border-radius: 16px;
      font: var(--mat-sys-label-medium);
      white-space: nowrap;
    }
    mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }
    .estado-confirmado {
      background: var(--mat-sys-primary-container);
      color: var(--mat-sys-on-primary-container);
    }
    .estado-atendido {
      background: #dcefdc;
      color: #1b5e20;
    }
    .estado-cancelado {
      background: var(--mat-sys-error-container);
      color: var(--mat-sys-on-error-container);
    }
  `,
})
export class EstadoTurno {
  readonly estado = input.required<Estado>();
  protected readonly presentacion = computed(() => PRESENTACION[this.estado()]);
}
