import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { forkJoin } from 'rxjs';
import { Cobertura } from '../../core/models/cobertura.model';
import { ErrorApi } from '../../core/models/error-api.model';
import { ETIQUETA_ROL, Usuario } from '../../core/models/usuario.model';
import { AuthService } from '../../core/services/auth.service';
import { AvisoService } from '../../core/services/aviso.service';
import { CoberturaService } from '../../core/services/cobertura.service';
import { PacienteService } from '../../core/services/paciente.service';
import { AlertaError } from '../../shared/components/alerta-error/alerta-error';
import { Cargando } from '../../shared/components/cargando/cargando';
import { EncabezadoPagina } from '../../shared/components/encabezado-pagina/encabezado-pagina';
import { ErrorDeGrupoMatcher } from '../../shared/utils/error-de-grupo-matcher';

/** La nueva contraseña es opcional, pero si se escribe hay que repetirla igual. */
function contrasenasCoinciden(grupo: AbstractControl): ValidationErrors | null {
  const password = grupo.get('password')?.value as string;
  const repetida = grupo.get('repetirPassword')?.value as string;
  return password && password !== repetida ? { contrasenasDistintas: true } : null;
}

/**
 * Datos de la cuenta. El paciente además puede modificar su email, contraseña,
 * teléfono y cobertura ("Mis datos personales"); el resto queda en solo lectura.
 */
@Component({
  selector: 'app-perfil',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    AlertaError,
    Cargando,
    EncabezadoPagina,
  ],
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss',
})
export class Perfil implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly coberturaService = inject(CoberturaService);
  private readonly pacienteService = inject(PacienteService);
  private readonly avisos = inject(AvisoService);

  protected readonly etiquetaRol = ETIQUETA_ROL;
  protected readonly usuario = signal<Usuario | null>(null);
  protected readonly coberturas = signal<Cobertura[]>([]);
  protected readonly esPaciente = computed(() => this.usuario()?.rol === 'paciente');
  protected readonly cargando = signal(true);
  protected readonly guardando = signal(false);
  protected readonly errorServidor = signal<string | null>(null);
  protected readonly errorGuardado = signal<string | null>(null);
  protected readonly ocultarPassword = signal(true);
  protected readonly matcherRepetida = new ErrorDeGrupoMatcher('contrasenasDistintas');

  protected readonly formulario = this.fb.nonNullable.group(
    {
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      telefono: ['', Validators.pattern(/^\d{6,20}$/)],
      id_cobertura: this.fb.control<number | null>(null, Validators.required),
      password: ['', Validators.minLength(6)],
      repetirPassword: [''],
    },
    { validators: contrasenasCoinciden },
  );

  ngOnInit(): void {
    forkJoin({
      usuario: this.auth.obtenerPerfil(),
      coberturas: this.coberturaService.listar(),
    }).subscribe({
      next: ({ usuario, coberturas }) => {
        this.coberturas.set(coberturas);
        this.mostrar(usuario);
        this.cargando.set(false);
      },
      error: (error: ErrorApi) => {
        this.errorServidor.set(error.message);
        this.cargando.set(false);
      },
    });
  }

  protected guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const { email, telefono, id_cobertura, password } = this.formulario.getRawValue();
    this.guardando.set(true);
    this.errorGuardado.set(null);

    this.pacienteService
      .actualizarMisDatos({
        email: email.trim(),
        telefono,
        id_cobertura: id_cobertura!,
        password: password || undefined,
      })
      .subscribe({
        next: (usuario) => {
          this.avisos.exito('Tus datos se actualizaron correctamente.');
          this.mostrar(usuario);
          this.guardando.set(false);
          // También se actualiza el usuario de la sesión (lo usa el header).
          this.auth.refrescarPerfil().subscribe({ error: () => undefined });
        },
        error: (error: ErrorApi) => {
          this.errorGuardado.set(error.message);
          this.guardando.set(false);
        },
      });
  }

  private mostrar(usuario: Usuario): void {
    this.usuario.set(usuario);
    this.formulario.reset({
      email: usuario.email,
      telefono: usuario.telefono,
      id_cobertura: usuario.id_cobertura,
      password: '',
      repetirPassword: '',
    });
  }
}
