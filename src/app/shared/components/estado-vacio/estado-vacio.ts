import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

/** Mensaje que reemplaza a una tabla o lista sin resultados. */
@Component({
  selector: 'app-estado-vacio',
  imports: [MatIconModule],
  template: `
    <div class="vacio">
      <mat-icon>{{ icono() }}</mat-icon>
      <p>{{ mensaje() }}</p>
      <ng-content />
    </div>
  `,
  styles: `
    .vacio {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 32px 16px;
      text-align: center;
      color: var(--mat-sys-on-surface-variant);
    }
    mat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
    }
    p {
      margin: 0;
    }
  `,
})
export class EstadoVacio {
  readonly mensaje = input.required<string>();
  readonly icono = input('inbox');
}
