import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { Cobertura } from '../../../../core/models/cobertura.model';
import { ErrorApi } from '../../../../core/models/error-api.model';
import { Especialidad } from '../../../../core/models/especialidad.model';
import { Sede } from '../../../../core/models/sede.model';
import { DatosUsuario, ETIQUETA_ROL, Rol, ROLES } from '../../../../core/models/usuario.model';
import { AvisoService } from '../../../../core/services/aviso.service';
import { CoberturaService } from '../../../../core/services/cobertura.service';
import { EspecialidadService } from '../../../../core/services/especialidad.service';
import { SedeService } from '../../../../core/services/sede.service';
import { UsuarioService } from '../../../../core/services/usuario.service';
import { aIso, desdeIso } from '../../../../core/utils/fechas';
import { AlertaError } from '../../../../shared/components/alerta-error/alerta-error';
import { Cargando } from '../../../../shared/components/cargando/cargando';
import { EncabezadoPagina } from '../../../../shared/components/encabezado-pagina/encabezado-pagina';

/** El administrador da de alta operadores, médicos y otros administradores; los pacientes se registran solos. */
const ROLES_ALTA: Rol[] = ['operador', 'medico', 'administrador'];

const tieneSede = (rol: Rol | null) => rol === 'operador' || rol === 'medico';

/** Alta (/admin/usuarios/nuevo) y modificación (/admin/usuarios/:id) de usuarios. */
@Component({
  selector: 'app-formulario-usuario',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    AlertaError,
    Cargando,
    EncabezadoPagina,
  ],
  templateUrl: './formulario-usuario.html',
  styleUrl: './formulario-usuario.scss',
})
export class FormularioUsuario {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly usuarioService = inject(UsuarioService);
  private readonly avisos = inject(AvisoService);

  private readonly id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id')) || null;
  protected readonly esEdicion = this.id !== null;
  protected readonly etiquetaRol = ETIQUETA_ROL;
  protected readonly rolesDisponibles = this.esEdicion ? ROLES : ROLES_ALTA;
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
    fecha_nacimiento: this.fb.control<Date | null>(null, Validators.required),
    rol: this.fb.control<Rol | null>(null, Validators.required),
    id_sede: this.fb.control<number | null>(null),
    especialidades: this.fb.nonNullable.control<number[]>([]),
    id_cobertura: this.fb.control<number | null>(null),
    // En la modificación es opcional: vacía conserva la contraseña actual.
    password: this.fb.nonNullable.control(
      '',
      this.esEdicion ? Validators.minLength(6) : [Validators.required, Validators.minLength(6)],
    ),
  });

  protected readonly rol = toSignal(this.formulario.controls.rol.valueChanges, {
    initialValue: null,
  });
  protected readonly pideSede = computed(() => tieneSede(this.rol()));
  protected readonly esMedico = computed(() => this.rol() === 'medico');
  protected readonly esPaciente = computed(() => this.rol() === 'paciente');

  protected readonly sedes = signal<Sede[]>([]);
  protected readonly especialidades = signal<Especialidad[]>([]);
  protected readonly coberturas = signal<Cobertura[]>([]);
  protected readonly cargando = signal(true);
  protected readonly guardando = signal(false);
  protected readonly errorServidor = signal<string | null>(null);

  constructor() {
    // Cada tipo de usuario exige datos distintos: sede, especialidades o cobertura.
    this.formulario.controls.rol.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((rol) => this.actualizarValidadores(rol));

    forkJoin({
      sedes: inject(SedeService).listar(),
      especialidades: inject(EspecialidadService).listar(),
      coberturas: inject(CoberturaService).listar(),
      usuario: this.id ? this.usuarioService.obtener(this.id) : of(null),
    }).subscribe({
      next: ({ sedes, especialidades, coberturas, usuario }) => {
        this.sedes.set(sedes);
        this.especialidades.set(especialidades);
        this.coberturas.set(coberturas);
        if (usuario) {
          this.formulario.patchValue({
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            dni: usuario.dni,
            email: usuario.email,
            telefono: usuario.telefono,
            fecha_nacimiento: desdeIso(usuario.fecha_nacimiento),
            rol: usuario.rol,
            id_sede: usuario.id_sede,
            id_cobertura: usuario.id_cobertura,
            especialidades: usuario.especialidades?.map((e) => e.id) ?? [],
          });
          // El tipo de usuario no se cambia: define vínculos (agenda, turnos, sede) que dependen de él.
          this.formulario.controls.rol.disable();
        }
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

    const valor = this.formulario.getRawValue();
    const rol = valor.rol!;
    const datos: DatosUsuario = {
      nombre: valor.nombre.trim(),
      apellido: valor.apellido.trim(),
      dni: valor.dni,
      email: valor.email.trim(),
      telefono: valor.telefono,
      fecha_nacimiento: aIso(valor.fecha_nacimiento!),
      rol,
      id_sede: tieneSede(rol) ? valor.id_sede : null,
      id_cobertura: rol === 'paciente' ? valor.id_cobertura : null,
      especialidades: rol === 'medico' ? valor.especialidades : undefined,
      password: valor.password || undefined,
    };

    this.guardando.set(true);
    this.errorServidor.set(null);

    const pedido = this.id
      ? this.usuarioService.actualizar(this.id, datos)
      : this.usuarioService.crear(datos);

    pedido.subscribe({
      next: (usuario) => {
        this.avisos.exito(
          `El usuario ${usuario.nombre} ${usuario.apellido} se ${this.id ? 'modificó' : 'creó'} correctamente.`,
        );
        this.router.navigate(['/admin/usuarios']);
      },
      error: (error: ErrorApi) => {
        this.errorServidor.set(error.message);
        this.guardando.set(false);
      },
    });
  }

  private actualizarValidadores(rol: Rol | null): void {
    const { id_sede, especialidades, id_cobertura } = this.formulario.controls;
    const requerido = (aplica: boolean): ValidatorFn | null => (aplica ? Validators.required : null);

    id_sede.setValidators(requerido(tieneSede(rol)));
    especialidades.setValidators(requerido(rol === 'medico'));
    id_cobertura.setValidators(requerido(rol === 'paciente'));

    for (const control of [id_sede, especialidades, id_cobertura]) {
      control.updateValueAndValidity();
    }
  }
}
