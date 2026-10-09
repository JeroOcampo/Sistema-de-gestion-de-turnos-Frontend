import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

/** Cuadro de error en línea para mostrar los mensajes que devuelve el backend. */
@Component({
  selector: 'app-alerta-error',
  imports: [MatIconModule],
  template: `
    @if (mensaje()) {
      <div class="alerta" role="alert">
        <mat-icon>error</mat-icon>
        <span>{{ mensaje() }}</span>
      </div>
    }
  `,
  styles: `
    .alerta {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px 16px;
      margin-bottom: 16px;
      border-radius: 8px;
      background: var(--mat-sys-error-container);
      color: var(--mat-sys-on-error-container);
    }
  `,
})
export class AlertaError {
  readonly mensaje = input<string | null>(null);
}
