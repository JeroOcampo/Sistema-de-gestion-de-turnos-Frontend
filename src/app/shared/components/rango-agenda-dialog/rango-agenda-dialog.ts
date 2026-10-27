import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { DatosRangoAgenda, RangoAgenda } from '../../../core/models/agenda.model';
import { ErrorApi } from '../../../core/models/error-api.model';
import { Medico } from '../../../core/models/medico.model';
import { Sede } from '../../../core/models/sede.model';
import { AgendaService } from '../../../core/services/agenda.service';
import { aIso, desdeIso, hoyIso, HORARIOS } from '../../../core/utils/fechas';
import { ErrorDeGrupoMatcher } from '../../utils/error-de-grupo-matcher';
import { AlertaError } from '../alerta-error/alerta-error';

export interface DatosRangoDialog {
  /** Rango a modificar; si no viene, el diálogo da de alta uno nuevo. */
  rango?: RangoAgenda;
  /** Fecha propuesta para el alta (AAAA-MM-DD). */
  fecha: string;
  /** Médicos entre los que se elige, con sus especialidades. Con uno solo, queda fijo. */
  medicos: Medico[];
  sedes: Sede[];
  /** Sede preseleccionada: la del médico o la del operador. */
  idSede: number | null;
  /** El operador solo puede cargar agenda en su propia sede. */
  sedeFija: boolean;
}

function salidaPosteriorAEntrada(grupo: AbstractControl): ValidationErrors | null {
  const entrada = grupo.get('hora_entrada')?.value as string | null;
  const salida = grupo.get('hora_salida')?.value as string | null;
  return entrada && salida && salida <= entrada ? { salidaAnterior: true } : null;
}

/** Alta y modificación de un rango horario. La usan el médico (su agenda) y el operador. */
@Component({
  selector: 'app-rango-agenda-dialog',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDatepickerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    AlertaError,
  ],
  templateUrl: './rango-agenda-dialog.html',
})
export class RangoAgendaDialog {
  private readonly fb = inject(FormBuilder);
  private readonly agendaService = inject(AgendaService);
  private readonly dialogRef = inject<MatDialogRef<RangoAgendaDialog, RangoAgenda>>(MatDialogRef);
  protected readonly datos = inject<DatosRangoDialog>(MAT_DIALOG_DATA);

  protected readonly horarios = HORARIOS;
  protected readonly hoy = desdeIso(hoyIso());
  protected readonly esEdicion = !!this.datos.rango;
  protected readonly puedeElegirMedico = !this.esEdicion && this.datos.medicos.length > 1;
  /** La hora de salida se marca en rojo si no es posterior a la de entrada. */
  protected readonly matcherSalida = new ErrorDeGrupoMatcher('salidaAnterior');

  protected readonly formulario = this.fb.group(
    {
      id_medico: this.fb.control<number | null>(
        this.datos.rango?.id_medico ??
          (this.datos.medicos.length === 1 ? this.datos.medicos[0].id : null),
        Validators.required,
      ),
      fecha: this.fb.control<Date | null>(
        desdeIso(this.datos.rango?.fecha ?? this.datos.fecha),
        Validators.required,
      ),
      hora_entrada: this.fb.control<string | null>(
        this.datos.rango?.hora_entrada ?? null,
        Validators.required,
      ),
      hora_salida: this.fb.control<string | null>(
        this.datos.rango?.hora_salida ?? null,
        Validators.required,
      ),
      id_especialidad: this.fb.control<number | null>(
        this.datos.rango?.id_especialidad ?? null,
        Validators.required,
      ),
      id_sede: this.fb.control<number | null>(
        { value: this.datos.rango?.id_sede ?? this.datos.idSede, disabled: this.datos.sedeFija },
        Validators.required,
      ),
    },
    { validators: salidaPosteriorAEntrada },
  );

  private readonly idMedico = toSignal(this.formulario.controls.id_medico.valueChanges, {
    initialValue: this.formulario.controls.id_medico.value,
  });
  /** La especialidad se elige entre las del médico. */
  protected readonly especialidades = computed(() => this.especialidadesDe(this.idMedico()));
  protected readonly nombreMedico = computed(() => {
    const medico = this.datos.medicos.find((m) => m.id === this.idMedico());
    return medico ? `${medico.nombre} ${medico.apellido}` : '';
  });

  protected readonly guardando = signal(false);
  protected readonly errorServidor = signal<string | null>(null);

  constructor() {
    if (!this.esEdicion) this.elegirEspecialidadUnica(this.idMedico());

    // La especialidad depende del médico: al cambiarlo se vuelve a elegir.
    this.formulario.controls.id_medico.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((idMedico) => this.elegirEspecialidadUnica(idMedico));
  }

  protected guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const valor = this.formulario.getRawValue();
    const datos: DatosRangoAgenda = {
      fecha: aIso(valor.fecha!),
      hora_entrada: valor.hora_entrada!,
      hora_salida: valor.hora_salida!,
      id_especialidad: valor.id_especialidad!,
      id_sede: valor.id_sede!,
      id_medico: valor.id_medico!,
    };

    this.guardando.set(true);
    this.errorServidor.set(null);

    const pedido = this.datos.rango
      ? this.agendaService.actualizar(this.datos.rango.id, datos)
      : this.agendaService.crear(datos);

    pedido.subscribe({
      next: (rango) => this.dialogRef.close(rango),
      error: (error: ErrorApi) => {
        this.errorServidor.set(error.message);
        this.guardando.set(false);
      },
    });
  }

  private especialidadesDe(idMedico: number | null) {
    return this.datos.medicos.find((m) => m.id === idMedico)?.especialidades ?? [];
  }

  /** Si el médico tiene una sola especialidad se elige sola; si no, se deja para elegir. */
  private elegirEspecialidadUnica(idMedico: number | null): void {
    const especialidades = this.especialidadesDe(idMedico);
    this.formulario.controls.id_especialidad.setValue(
      especialidades.length === 1 ? especialidades[0].id : null,
    );
  }
}
