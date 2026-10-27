import { Component, inject, signal, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { DatosRegistroPaciente, PacienteRegistrado } from '../../../core/models/auth.model';
import { ErrorApi } from '../../../core/models/error-api.model';
import { AvisoService } from '../../../core/services/aviso.service';
import { PacienteService } from '../../../core/services/paciente.service';
import { EncabezadoPagina } from '../../../shared/components/encabezado-pagina/encabezado-pagina';
import { FormularioPaciente } from '../../../shared/components/formulario-paciente/formulario-paciente';

/** El operador da de alta un paciente con el mismo formulario que el registro público. */
@Component({
  selector: 'app-alta-paciente',
  imports: [
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    EncabezadoPagina,
    FormularioPaciente,
  ],
  templateUrl: './alta-paciente.html',
  styles: `
    mat-card {
      max-width: 720px;
    }
    .creado {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
      padding: 12px 16px;
      border-radius: 8px;
      background: #dcefdc;
      color: #1b5e20;
    }
    .creado p {
      margin: 0;
      flex: 1 1 auto;
    }
  `,
})
export class AltaPaciente {
  private readonly pacienteService = inject(PacienteService);
  private readonly avisos = inject(AvisoService);
  private readonly formulario = viewChild.required(FormularioPaciente);

  protected readonly enviando = signal(false);
  protected readonly errorServidor = signal<string | null>(null);
  /** Último paciente dado de alta, para ofrecer asignarle un turno. */
  protected readonly creado = signal<PacienteRegistrado | null>(null);

  protected darDeAlta(datos: DatosRegistroPaciente): void {
    this.enviando.set(true);
    this.errorServidor.set(null);

    this.pacienteService.crear(datos).subscribe({
      next: (paciente) => {
        this.avisos.exito(`${paciente.nombre} ${paciente.apellido} quedó registrado como paciente.`);
        this.creado.set(paciente);
        this.formulario().reiniciar();
        this.enviando.set(false);
      },
      error: (error: ErrorApi) => {
        this.errorServidor.set(error.message);
        this.enviando.set(false);
      },
    });
  }
}
