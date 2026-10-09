import { Component, inject, OnInit, signal } from '@angular/core';
import { provideNativeDateAdapter } from '@angular/material/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { Router, RouterLink } from '@angular/router';
import { Cobertura } from '../../../core/models/cobertura.model';
import { ErrorApi } from '../../../core/models/error-api.model';
import { AuthService } from '../../../core/services/auth.service';
import { CoberturaService } from '../../../core/services/cobertura.service';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { AlertaError } from '../../../shared/components/alerta-error/alerta-error';

@Component({
  selector: 'app-registro',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    AlertaError,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './registro.html',
  styleUrl: './registro.scss',
})
export class Registro implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly coberturaService = inject(CoberturaService);
  private readonly router = inject(Router);
  private readonly avisos = inject(NotificacionService);

  protected readonly hoy = new Date();

  protected readonly formulario = this.fb.group({
    nombre: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(50)]),
    apellido: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(50)]),
    dni: this.fb.nonNullable.control('', [Validators.required, Validators.pattern(/^\d{7,8}$/)]),
    email: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.email,
      Validators.maxLength(100),
    ]),
    password: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(6)]),
    fecha_nacimiento: this.fb.control<Date | null>(null, Validators.required),
    id_cobertura: this.fb.control<number | null>(null, Validators.required),
  });

  protected readonly coberturas = signal<Cobertura[]>([]);
  protected readonly cargandoCoberturas = signal(true);
  protected readonly enviando = signal(false);
  protected readonly errorServidor = signal<string | null>(null);
  protected readonly ocultarPassword = signal(true);

  ngOnInit(): void {
    this.coberturaService.listar().subscribe({
      next: (coberturas) => {
        this.coberturas.set(coberturas);
        this.cargandoCoberturas.set(false);
      },
      error: (error: ErrorApi) => {
        this.errorServidor.set(`No se pudo cargar el listado de coberturas. ${error.message}`);
        this.cargandoCoberturas.set(false);
      },
    });
  }

  protected registrar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const { fecha_nacimiento, id_cobertura, ...resto } = this.formulario.getRawValue();

    this.enviando.set(true);
    this.errorServidor.set(null);

    this.auth
      .registrarPaciente({
        ...resto,
        fecha_nacimiento: this.formatearFecha(fecha_nacimiento!),
        id_cobertura: id_cobertura!,
      })
      .subscribe({
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

  /** AAAA-MM-DD en hora local, sin desfasajes por zona horaria. */
  private formatearFecha(fecha: Date): string {
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${fecha.getFullYear()}-${mes}-${dia}`;
  }
}
