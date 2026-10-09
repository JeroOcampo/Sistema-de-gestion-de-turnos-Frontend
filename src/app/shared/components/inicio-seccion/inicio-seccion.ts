import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { EncabezadoPagina } from '../encabezado-pagina/encabezado-pagina';

/**
 * Portada de cada sección por rol (/paciente, /medico, /operador, /admin).
 * El texto lo define cada archivo de rutas mediante `data`.
 */
@Component({
  selector: 'app-inicio-seccion',
  imports: [MatCardModule, MatIconModule, EncabezadoPagina],
  template: `
    <app-encabezado-pagina [titulo]="datos.titulo" [subtitulo]="datos.descripcion" [icono]="datos.icono" />
    <mat-card appearance="outlined">
      <mat-card-content>
        <p>Elegí una función del menú lateral para comenzar.</p>
      </mat-card-content>
    </mat-card>
  `,
})
export class InicioSeccion {
  protected readonly datos = inject(ActivatedRoute).snapshot.data as {
    titulo: string;
    descripcion: string;
    icono: string;
  };
}
