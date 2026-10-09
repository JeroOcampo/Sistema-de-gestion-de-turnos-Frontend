import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-acceso-denegado',
  imports: [MatButtonModule, MatIconModule, RouterLink],
  template: `
    <section class="estado">
      <mat-icon>block</mat-icon>
      <h1>Acceso denegado</h1>
      <p>Tu tipo de usuario no tiene permiso para ver esta sección de la clínica.</p>
      <a mat-flat-button routerLink="/">Volver al inicio</a>
    </section>
  `,
  styleUrl: '../pantalla-estado.scss',
})
export class AccesoDenegado {}
