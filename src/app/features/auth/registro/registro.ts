import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { DatosRegistroPaciente } from '../../../core/models/auth.model';
import { ErrorApi } from '../../../core/models/error-api.model';
import { AuthService } from '../../../core/services/auth.service';
import { AvisoService } from '../../../core/services/aviso.service';
import { FormularioPaciente } from '../../../shared/components/formulario-paciente/formulario-paciente';

@Component({
  selector: 'app-registro',
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule, FormularioPaciente],
  templateUrl: './registro.html',
  styleUrl: './registro.scss',
})
export class Registro {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly avisos = inject(AvisoService);

  protected readonly enviando = signal(false);
  protected readonly errorServidor = signal<string | null>(null);

  protected registrar(datos: DatosRegistroPaciente): void {
    this.enviando.set(true);
    this.errorServidor.set(null);

    this.auth.registrarPaciente(datos).subscribe({
      next: () => {
        this.avisos.exito('Tu registro se completó correctamente. Ya podés iniciar sesión.');
        this.router.navigate(['/login']);
      },
      error: (error: ErrorApi) => {
        this.errorServidor.set(error.message);
        this.enviando.set(false);
      },
    });
  }
}
