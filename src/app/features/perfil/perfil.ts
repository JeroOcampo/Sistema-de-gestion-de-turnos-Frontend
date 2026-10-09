import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin } from 'rxjs';
import { ErrorApi } from '../../core/models/error-api.model';
import { ETIQUETA_ROL, Usuario } from '../../core/models/usuario.model';
import { AuthService } from '../../core/services/auth.service';
import { CoberturaService } from '../../core/services/cobertura.service';
import { AlertaError } from '../../shared/components/alerta-error/alerta-error';
import { EncabezadoPagina } from '../../shared/components/encabezado-pagina/encabezado-pagina';

@Component({
  selector: 'app-perfil',
  imports: [
    DatePipe,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    AlertaError,
    EncabezadoPagina,
  ],
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss',
})
export class Perfil implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly coberturaService = inject(CoberturaService);

  protected readonly etiquetaRol = ETIQUETA_ROL;
  protected readonly usuario = signal<Usuario | null>(null);
  protected readonly cobertura = signal<string | null>(null);
  protected readonly cargando = signal(true);
  protected readonly errorServidor = signal<string | null>(null);

  ngOnInit(): void {
    forkJoin({
      usuario: this.auth.obtenerPerfil(),
      coberturas: this.coberturaService.listar(),
    }).subscribe({
      next: ({ usuario, coberturas }) => {
        this.usuario.set(usuario);
        this.cobertura.set(coberturas.find((c) => c.id === usuario.id_cobertura)?.nombre ?? null);
        this.cargando.set(false);
      },
      error: (error: ErrorApi) => {
        this.errorServidor.set(error.message);
        this.cargando.set(false);
      },
    });
  }
}
