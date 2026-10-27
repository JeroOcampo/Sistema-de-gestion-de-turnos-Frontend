import { Routes } from '@angular/router';
import { InicioSeccion } from '../../shared/components/inicio-seccion/inicio-seccion';
import { NuevoTurno } from '../turnos/nuevo-turno/nuevo-turno';
import { HistorialPaciente } from './historial/historial-paciente';
import { MisTurnos } from './mis-turnos/mis-turnos';

export const PACIENTE_ROUTES: Routes = [
  {
    path: '',
    component: InicioSeccion,
    data: {
      titulo: 'Panel del paciente',
      descripcion: 'Tus turnos y tu historial clínico en un solo lugar.',
      icono: 'personal_injury',
    },
  },
  { path: 'turnos/nuevo', component: NuevoTurno, title: 'Sacar turno' },
  { path: 'turnos', component: MisTurnos, title: 'Mis turnos' },
  { path: 'historial', component: HistorialPaciente, title: 'Historial clínico' },
];
