import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

/** Título de pantalla con ícono y bajada opcional, común a todas las secciones. */
@Component({
  selector: 'app-encabezado-pagina',
  imports: [MatIconModule],
  template: `
    <header class="encabezado-pagina">
      @if (icono()) {
        <mat-icon class="icono">{{ icono() }}</mat-icon>
      }
      <div>
        <h1>{{ titulo() }}</h1>
        @if (subtitulo()) {
          <p>{{ subtitulo() }}</p>
        }
      </div>
    </header>
  `,
  styles: `
    .encabezado-pagina {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
    }
    .icono {
      font-size: 36px;
      width: 36px;
      height: 36px;
      color: var(--mat-sys-primary);
    }
    h1 {
      margin: 0;
      font: var(--mat-sys-headline-medium);
    }
    p {
      margin: 4px 0 0;
      color: var(--mat-sys-on-surface-variant);
    }
  `,
})
export class EncabezadoPagina {
  readonly titulo = input.required<string>();
  readonly subtitulo = input<string>();
  readonly icono = input<string>();
}
