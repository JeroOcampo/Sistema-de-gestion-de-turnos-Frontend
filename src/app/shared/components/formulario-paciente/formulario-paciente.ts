import { Component, computed, inject, input, OnInit, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { DatosRegistroPaciente } from '../../../core/models/auth.model';
import { Cobertura } from '../../../core/models/cobertura.model';
import { ErrorApi } from '../../../core/models/error-api.model';
import { CoberturaService } from '../../../core/services/cobertura.service';
import { aIso } from '../../../core/utils/fechas';
import { AlertaError } from '../alerta-error/alerta-error';

/**
 * Formulario de alta de paciente. Lo usan el registro público y el alta que hace el
 * operador: mismos datos y mismas validaciones; cada pantalla decide a qué endpoint enviar.
 */
@Component({
  selector: 'app-formulario-paciente',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    AlertaError,
  ],
  templateUrl: './formulario-paciente.html',
  styleUrl: './formulario-paciente.scss',
})
export class FormularioPaciente implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly coberturaService = inject(CoberturaService);

  readonly textoBoton = input('Guardar');
  readonly enviando = input(false);
  readonly errorServidor = input<string | null>(null);
  readonly enviar = output<DatosRegistroPaciente>();

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
    telefono: this.fb.nonNullable.control('', Validators.pattern(/^\d{6,20}$/)),
    password: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(6)]),
    fecha_nacimiento: this.fb.control<Date | null>(null, Validators.required),
    id_cobertura: this.fb.control<number | null>(null, Validators.required),
  });

  protected readonly coberturas = signal<Cobertura[]>([]);
  protected readonly cargandoCoberturas = signal(true);
  protected readonly ocultarPassword = signal(true);
  private readonly errorCoberturas = signal<string | null>(null);
  protected readonly mensajeError = computed(() => this.errorServidor() ?? this.errorCoberturas());

  ngOnInit(): void {
    this.coberturaService.listar().subscribe({
      next: (coberturas) => {
        this.coberturas.set(coberturas);
        this.cargandoCoberturas.set(false);
      },
      error: (error: ErrorApi) => {
        this.errorCoberturas.set(`No se pudo cargar el listado de coberturas. ${error.message}`);
        this.cargandoCoberturas.set(false);
      },
    });
  }

  /** Deja el formulario vacío para cargar otro paciente. */
  reiniciar(): void {
    this.formulario.reset();
  }

  protected confirmar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const { fecha_nacimiento, id_cobertura, ...resto } = this.formulario.getRawValue();
    this.enviar.emit({
      ...resto,
      fecha_nacimiento: aIso(fecha_nacimiento!),
      id_cobertura: id_cobertura!,
    });
  }
}
