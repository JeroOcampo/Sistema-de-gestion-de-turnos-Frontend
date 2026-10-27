import { Component, inject, signal } from '@angular/core';
import { ErrorApi } from '../../../core/models/error-api.model';
import { RegistroHistorial } from '../../../core/models/historial.model';
import { AuthService } from '../../../core/services/auth.service';
import { HistorialService } from '../../../core/services/historial.service';
import { AlertaError } from '../../../shared/components/alerta-error/alerta-error';
import { Cargando } from '../../../shared/components/cargando/cargando';
import { EncabezadoPagina } from '../../../shared/components/encabezado-pagina/encabezado-pagina';
import { TablaHistorial } from '../../../shared/components/tabla-historial/tabla-historial';

/** Historial clínico completo del paciente logueado. */
@Component({
  selector: 'app-historial-paciente',
  imports: [AlertaError, Cargando, EncabezadoPagina, TablaHistorial],
  template: `
    <app-encabezado-pagina
      titulo="Historial clínico"
      subtitulo="Lo que registraron tus médicos en cada turno atendido."
      icono="history_edu"
    />
    <app-alerta-error [mensaje]="errorServidor()" />
    @if (cargando()) {
      <app-cargando texto="Cargando tu historial…" />
    } @else {
      <app-tabla-historial
        [registros]="registros()"
        mensajeVacio="Todavía no tenés registros: aparecen cuando un médico atiende uno de tus turnos."
      />
    }
  `,
})
export class HistorialPaciente {
  protected readonly registros = signal<RegistroHistorial[]>([]);
  protected readonly cargando = signal(true);
  protected readonly errorServidor = signal<string | null>(null);

  constructor() {
    inject(HistorialService)
      .dePaciente(inject(AuthService).payload()!.id)
      .subscribe({
        next: (registros) => {
          this.registros.set(registros);
          this.cargando.set(false);
        },
        error: (error: ErrorApi) => {
          this.errorServidor.set(error.message);
          this.cargando.set(false);
        },
      });
  }
}
