import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { ErrorApi } from '../../../core/models/error-api.model';
import { RegistroHistorial } from '../../../core/models/historial.model';
import { Paciente } from '../../../core/models/paciente.model';
import { HistorialService } from '../../../core/services/historial.service';
import { PacienteService } from '../../../core/services/paciente.service';
import { AlertaError } from '../../../shared/components/alerta-error/alerta-error';
import { Cargando } from '../../../shared/components/cargando/cargando';
import { EncabezadoPagina } from '../../../shared/components/encabezado-pagina/encabezado-pagina';
import { EstadoVacio } from '../../../shared/components/estado-vacio/estado-vacio';
import { TablaHistorial } from '../../../shared/components/tabla-historial/tabla-historial';
import { EdadPipe } from '../../../shared/pipes/edad.pipe';

/**
 * El médico busca un paciente y consulta su historial clínico. El backend devuelve
 * solo los registros de los turnos que atendió el médico logueado.
 */
@Component({
  selector: 'app-historial-medico',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatTableModule,
    AlertaError,
    Cargando,
    EncabezadoPagina,
    EstadoVacio,
    TablaHistorial,
    EdadPipe,
  ],
  templateUrl: './historial-medico.html',
})
export class HistorialMedico {
  private readonly pacienteService = inject(PacienteService);
  private readonly historialService = inject(HistorialService);

  protected readonly formulario = new FormGroup({
    busqueda: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
  });
  protected readonly columnas = ['paciente', 'dni', 'nacimiento', 'cobertura', 'acciones'];

  protected readonly pacientes = signal<Paciente[] | null>(null);
  protected readonly buscando = signal(false);
  protected readonly seleccionado = signal<Paciente | null>(null);
  protected readonly historial = signal<RegistroHistorial[]>([]);
  protected readonly cargandoHistorial = signal(false);
  protected readonly errorServidor = signal<string | null>(null);

  protected buscar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.buscando.set(true);
    this.errorServidor.set(null);
    this.seleccionado.set(null);
    this.pacienteService.buscar(this.formulario.getRawValue().busqueda.trim()).subscribe({
      next: (pacientes) => {
        this.pacientes.set(pacientes);
        this.buscando.set(false);
      },
      error: (error: ErrorApi) => {
        this.errorServidor.set(error.message);
        this.buscando.set(false);
      },
    });
  }

  protected verHistorial(paciente: Paciente): void {
    this.seleccionado.set(paciente);
    this.cargandoHistorial.set(true);
    this.errorServidor.set(null);
    this.historialService.dePaciente(paciente.id).subscribe({
      next: (registros) => {
        this.historial.set(registros);
        this.cargandoHistorial.set(false);
      },
      error: (error: ErrorApi) => {
        this.errorServidor.set(error.message);
        this.historial.set([]);
        this.cargandoHistorial.set(false);
      },
    });
  }

  protected volverALaBusqueda(): void {
    this.seleccionado.set(null);
  }
}
