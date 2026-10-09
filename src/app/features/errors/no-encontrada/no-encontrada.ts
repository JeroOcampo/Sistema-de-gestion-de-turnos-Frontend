import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-no-encontrada',
  imports: [MatButtonModule, MatIconModule, RouterLink],
  template: `
    <section class="estado">
      <mat-icon>search_off</mat-icon>
      <h1>Página no encontrada</h1>
      <p>La dirección que ingresaste no existe o fue movida.</p>
      <a mat-flat-button routerLink="/">Volver al inicio</a>
    </section>
  `,
  styleUrl: '../pantalla-estado.scss',
})
export class NoEncontrada {}
