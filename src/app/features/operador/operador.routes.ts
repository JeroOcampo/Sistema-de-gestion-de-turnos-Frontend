import { Routes } from '@angular/router';
import { InicioSeccion } from '../../shared/components/inicio-seccion/inicio-seccion';
import { NuevoTurno } from '../turnos/nuevo-turno/nuevo-turno';
import { AgendaOperador } from './agenda/agenda-operador';
import { AltaPaciente } from './alta-paciente/alta-paciente';

export const OPERADOR_ROUTES: Routes = [
  {
    path: '',
    component: InicioSeccion,
    data: {
      titulo: 'Panel del operador',
      descripcion: 'Atención de pacientes y gestión de turnos de la sede.',
      icono: 'support_agent',
    },
  },
  { path: 'agenda', component: AgendaOperador, title: 'Agenda y turnos' },
  // Mismo flujo que "Sacar turno" del paciente, con la sede fija en la del operador.
  { path: 'turnos/nuevo', component: NuevoTurno, title: 'Asignar turno' },
  { path: 'pacientes/nuevo', component: AltaPaciente, title: 'Alta de paciente' },
];
