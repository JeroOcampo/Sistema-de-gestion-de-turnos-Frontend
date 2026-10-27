import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterLink } from '@angular/router';

/** Pantalla provisoria de las funciones que se incorporan en semanas siguientes. */
@Component({
  selector: 'app-en-construccion',
  imports: [MatButtonModule, MatIconModule, RouterLink],
  template: `
    <section class="estado">
      <mat-icon>construction</mat-icon>
      <h1>{{ titulo }}</h1>
      <p>Esta función está en construcción y estará disponible próximamente.</p>
      <a mat-stroked-button routerLink="/">Volver al inicio</a>
    </section>
  `,
  styleUrl: '../pantalla-estado.scss',
})
export class EnConstruccion {
  protected readonly titulo: string =
    inject(ActivatedRoute).snapshot.data['titulo'] ?? 'En construcción';
}
