import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStep, MatStepper, MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, forkJoin, Observable, of, switchMap, tap } from 'rxjs';
import { ErrorApi } from '../../../core/models/error-api.model';
import { Especialidad } from '../../../core/models/especialidad.model';
import { Medico } from '../../../core/models/medico.model';
import { Paciente } from '../../../core/models/paciente.model';
import { Sede } from '../../../core/models/sede.model';
import { DatosNuevoTurno } from '../../../core/models/turno.model';
import { AuthService } from '../../../core/services/auth.service';
import { AvisoService } from '../../../core/services/aviso.service';
import { CoberturaService } from '../../../core/services/cobertura.service';
import { DisponibilidadService } from '../../../core/services/disponibilidad.service';
import { EspecialidadService } from '../../../core/services/especialidad.service';
import { MedicoService } from '../../../core/services/medico.service';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { PacienteService } from '../../../core/services/paciente.service';
import { SedeService } from '../../../core/services/sede.service';
import { TurnoService } from '../../../core/services/turno.service';
import { aIso, desdeIso } from '../../../core/utils/fechas';
import { AlertaError } from '../../../shared/components/alerta-error/alerta-error';
import { Cargando } from '../../../shared/components/cargando/cargando';
import { EncabezadoPagina } from '../../../shared/components/encabezado-pagina/encabezado-pagina';
import { EstadoVacio } from '../../../shared/components/estado-vacio/estado-vacio';

/** Paciente al que se le da el turno, con lo que se muestra en el resumen. */
interface PacienteDelTurno {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  cobertura: string | null;
}

const LARGO_MAXIMO_NOTA = 40;

/**
 * Solicitud de turno paso a paso: especialidad -> sede -> médico -> fecha -> horario ->
 * nota y confirmación. La usan el paciente (para sí mismo) y el operador, que antes
 * busca al paciente y siempre asigna en su propia sede.
 */
@Component({
  selector: 'app-nuevo-turno',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatChipsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatStepperModule,
    MatTableModule,
    AlertaError,
    Cargando,
    EncabezadoPagina,
    EstadoVacio,
  ],
  templateUrl: './nuevo-turno.html',
  styleUrl: './nuevo-turno.scss',
})
export class NuevoTurno {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly medicoService = inject(MedicoService);
  private readonly disponibilidad = inject(DisponibilidadService);
  private readonly pacienteService = inject(PacienteService);
  private readonly turnoService = inject(TurnoService);
  private readonly notificaciones = inject(NotificacionService);
  private readonly avisos = inject(AvisoService);

  private readonly stepper = viewChild.required(MatStepper);
  private readonly pasoHorarioRef = viewChild.required<MatStep>('pasoHorarioRef');

  protected readonly esOperador = this.auth.rol() === 'operador';
  private readonly idSedeOperador = this.auth.payload()?.id_sede ?? null;
  protected readonly largoMaximoNota = LARGO_MAXIMO_NOTA;

  // Un formulario por paso: el stepper lineal no deja avanzar si el paso no está completo.
  protected readonly busquedaPaciente = this.fb.nonNullable.group({
    texto: ['', [Validators.required, Validators.minLength(2)]],
  });
  protected readonly pasoPaciente = this.fb.group({
    id_paciente: this.fb.control<number | null>(null, Validators.required),
  });
  protected readonly pasoEspecialidad = this.fb.group({
    id_especialidad: this.fb.control<number | null>(null, Validators.required),
  });
  protected readonly pasoSede = this.fb.group({
    id_sede: this.fb.control<number | null>(this.idSedeOperador, Validators.required),
  });
  protected readonly pasoMedico = this.fb.group({
    id_medico: this.fb.control<number | null>(null, Validators.required),
  });
  protected readonly pasoFecha = this.fb.group({
    fecha: this.fb.control<string | null>(null, Validators.required),
  });
  protected readonly pasoHorario = this.fb.group({
    hora: this.fb.control<string | null>(null, Validators.required),
  });
  protected readonly pasoConfirmacion = this.fb.nonNullable.group({
    nota: ['', [Validators.required, Validators.maxLength(LARGO_MAXIMO_NOTA)]],
  });

  // Opciones de cada paso, cargadas desde la API.
  protected readonly especialidades = signal<Especialidad[]>([]);
  protected readonly sedes = signal<Sede[]>([]);
  protected readonly medicos = signal<Medico[]>([]);
  protected readonly fechas = signal<string[]>([]);
  protected readonly horarios = signal<string[]>([]);
  protected readonly pacientesEncontrados = signal<Paciente[] | null>(null);
  protected readonly paciente = signal<PacienteDelTurno | null>(null);

  protected readonly cargandoInicial = signal(true);
  protected readonly cargandoMedicos = signal(false);
  protected readonly cargandoFechas = signal(false);
  protected readonly cargandoHorarios = signal(false);
  protected readonly buscandoPacientes = signal(false);
  protected readonly enviando = signal(false);
  protected readonly errorServidor = signal<string | null>(null);
  /** Motivo por el que el backend rechazó el turno (por ejemplo, el horario se ocupó). */
  protected readonly errorTurno = signal<string | null>(null);
  private readonly recargaHorarios = signal(0);

  private readonly idEspecialidad = toSignal(
    this.pasoEspecialidad.controls.id_especialidad.valueChanges,
    { initialValue: null },
  );
  private readonly idSede = toSignal(this.pasoSede.controls.id_sede.valueChanges, {
    initialValue: this.pasoSede.controls.id_sede.value,
  });
  private readonly idMedico = toSignal(this.pasoMedico.controls.id_medico.valueChanges, {
    initialValue: null,
  });
  protected readonly fecha = toSignal(this.pasoFecha.controls.fecha.valueChanges, {
    initialValue: null,
  });
  protected readonly hora = toSignal(this.pasoHorario.controls.hora.valueChanges, {
    initialValue: null,
  });

  protected readonly especialidadElegida = computed(() =>
    this.especialidades().find((e) => e.id === this.idEspecialidad()),
  );
  protected readonly sedeElegida = computed(() => this.sedes().find((s) => s.id === this.idSede()));
  protected readonly medicoElegido = computed(() =>
    this.medicos().find((m) => m.id === this.idMedico()),
  );
  protected readonly fechaComoDate = computed(() => {
    const fecha = this.fecha();
    return fecha ? desdeIso(fecha) : null;
  });
  protected readonly primeraFecha = computed(() => {
    const fechas = this.fechas();
    return fechas.length ? desdeIso(fechas[0]) : null;
  });
  protected readonly ultimaFecha = computed(() => {
    const fechas = this.fechas();
    return fechas.length ? desdeIso(fechas[fechas.length - 1]) : null;
  });

  /** El calendario solo habilita los días en que el médico tiene horarios libres. */
  protected readonly filtroFechas = (fecha: Date | null): boolean =>
    !!fecha && this.fechas().includes(aIso(fecha));

  constructor() {
    this.cargarDatosIniciales();
    this.encadenarPasos();

    // Desde el alta de paciente, el operador llega con ?dni= para asignarle un turno.
    const dni = inject(ActivatedRoute).snapshot.queryParamMap.get('dni');
    if (this.esOperador && dni) {
      this.busquedaPaciente.setValue({ texto: dni });
      this.buscarPacientes(true);
    }
  }

  protected buscarPacientes(elegirSiHayUnoSolo = false): void {
    if (this.busquedaPaciente.invalid) {
      this.busquedaPaciente.markAllAsTouched();
      return;
    }
    this.buscandoPacientes.set(true);
    this.errorServidor.set(null);
    this.pacienteService.buscar(this.busquedaPaciente.getRawValue().texto.trim()).subscribe({
      next: (pacientes) => {
        this.pacientesEncontrados.set(pacientes);
        this.buscandoPacientes.set(false);
        if (elegirSiHayUnoSolo && pacientes.length === 1) this.elegirPaciente(pacientes[0]);
      },
      error: (error: ErrorApi) => {
        this.errorServidor.set(error.message);
        this.buscandoPacientes.set(false);
      },
    });
  }

  protected elegirPaciente(paciente: Paciente): void {
    this.paciente.set({
      id: paciente.id,
      nombre: paciente.nombre,
      apellido: paciente.apellido,
      dni: paciente.dni,
      cobertura: paciente.cobertura_nombre,
    });
    this.pasoPaciente.controls.id_paciente.setValue(paciente.id);
  }

  protected elegirFecha(fecha: Date | null): void {
    this.pasoFecha.controls.fecha.setValue(fecha ? aIso(fecha) : null);
  }

  protected confirmar(): void {
    if (this.pasoConfirmacion.invalid) {
      this.pasoConfirmacion.markAllAsTouched();
      return;
    }

    const datos: DatosNuevoTurno = {
      id_especialidad: this.pasoEspecialidad.controls.id_especialidad.value!,
      id_sede: this.pasoSede.controls.id_sede.value!,
      id_medico: this.pasoMedico.controls.id_medico.value!,
      fecha: this.pasoFecha.controls.fecha.value!,
      hora: this.pasoHorario.controls.hora.value!,
      nota: this.pasoConfirmacion.getRawValue().nota.trim(),
      id_paciente: this.esOperador ? this.paciente()!.id : undefined,
    };

    this.enviando.set(true);
    this.errorTurno.set(null);

    this.turnoService.crear(datos).subscribe({
      next: (turno) => {
        this.enviando.set(false);
        // El turno genera notificaciones: el contador de la campana se actualiza enseguida.
        this.notificaciones.actualizar();
        if (this.esOperador) {
          this.avisos.exito(`Turno asignado a ${turno.paciente_nombre}.`);
          this.reiniciar();
        } else {
          this.avisos.exito('Tu turno quedó confirmado.');
          this.router.navigate(['/paciente/turnos']);
        }
      },
      error: (error: ErrorApi) => {
        // Por ejemplo, el horario se ocupó mientras se completaba el formulario:
        // se muestra el motivo y se vuelve a elegir entre los horarios que siguen libres.
        this.enviando.set(false);
        this.errorTurno.set(error.message);
        this.recargaHorarios.update((n) => n + 1);
        this.stepper().selected = this.pasoHorarioRef();
      },
    });
  }

  /** El operador vuelve al principio para asignar otro turno. */
  private reiniciar(): void {
    this.stepper().reset();
    this.paciente.set(null);
    this.pacientesEncontrados.set(null);
    this.busquedaPaciente.reset();
    this.pasoSede.controls.id_sede.setValue(this.idSedeOperador);
  }

  private cargarDatosIniciales(): void {
    const coberturaService = inject(CoberturaService);
    forkJoin({
      especialidades: inject(EspecialidadService).listar(),
      sedes: inject(SedeService).listar(),
      // El paciente pide para sí mismo: su cobertura es la que tiene registrada.
      perfil: this.esOperador ? of(null) : this.auth.obtenerPerfil(),
      coberturas: this.esOperador ? of([]) : coberturaService.listar(),
    }).subscribe({
      next: ({ especialidades, sedes, perfil, coberturas }) => {
        this.especialidades.set(especialidades);
        this.sedes.set(sedes);
        if (perfil) {
          this.paciente.set({
            id: perfil.id,
            nombre: perfil.nombre,
            apellido: perfil.apellido,
            dni: perfil.dni,
            cobertura: coberturas.find((c) => c.id === perfil.id_cobertura)?.nombre ?? null,
          });
          this.pasoPaciente.controls.id_paciente.setValue(perfil.id);
        }
        this.cargandoInicial.set(false);
      },
      error: (error: ErrorApi) => {
        this.errorServidor.set(error.message);
        this.cargandoInicial.set(false);
      },
    });
  }

  /** Cada paso filtra las opciones del siguiente; cambiar una elección reinicia los pasos posteriores. */
  private encadenarPasos(): void {
    // Médicos de la especialidad y la sede elegidas que tienen agenda desde hoy.
    toObservable(computed(() => ({ especialidad: this.idEspecialidad(), sede: this.idSede() })))
      .pipe(
        tap(() => {
          this.pasoMedico.reset();
          this.medicos.set([]);
        }),
        switchMap(({ especialidad, sede }) => {
          if (!especialidad || !sede) return of<Medico[]>([]);
          this.cargandoMedicos.set(true);
          return this.conError(
            this.medicoService.listar({ id_especialidad: especialidad, id_sede: sede, con_agenda: true }),
            [],
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe((medicos) => {
        this.medicos.set(medicos);
        this.cargandoMedicos.set(false);
      });

    // Fechas en las que el médico elegido tiene horarios libres.
    toObservable(this.idMedico)
      .pipe(
        tap(() => {
          this.pasoFecha.reset();
          this.fechas.set([]);
        }),
        switchMap((idMedico) => {
          if (!idMedico) return of<string[]>([]);
          this.cargandoFechas.set(true);
          return this.conError(this.disponibilidad.fechas(this.consulta(idMedico)), []);
        }),
        takeUntilDestroyed(),
      )
      .subscribe((fechas) => {
        this.fechas.set(fechas);
        this.cargandoFechas.set(false);
      });

    // Horarios libres del día elegido (se recargan también si el backend rechaza el turno).
    toObservable(computed(() => ({ fecha: this.fecha(), recarga: this.recargaHorarios() })))
      .pipe(
        tap(() => {
          this.pasoHorario.reset();
          this.horarios.set([]);
        }),
        switchMap(({ fecha }) => {
          const idMedico = this.pasoMedico.controls.id_medico.value;
          if (!fecha || !idMedico) return of<string[]>([]);
          this.cargandoHorarios.set(true);
          return this.conError(
            this.disponibilidad.horarios({ ...this.consulta(idMedico), fecha }),
            [],
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe((horarios) => {
        this.horarios.set(horarios);
        this.cargandoHorarios.set(false);
      });
  }

  private consulta(idMedico: number) {
    return {
      id_medico: idMedico,
      id_especialidad: this.pasoEspecialidad.controls.id_especialidad.value!,
      id_sede: this.pasoSede.controls.id_sede.value!,
    };
  }

  /** Si un pedido falla, se muestra el motivo y el paso queda sin opciones. */
  private conError<T>(pedido: Observable<T>, siFalla: T): Observable<T> {
    return pedido.pipe(
      catchError((error: ErrorApi) => {
        this.errorServidor.set(error.message);
        return of(siFalla);
      }),
    );
  }
}
