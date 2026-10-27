import { Routes } from '@angular/router';
import { InicioSeccion } from '../../shared/components/inicio-seccion/inicio-seccion';
import { AgendaMedico } from './agenda/agenda-medico';
import { HistorialMedico } from './historial/historial-medico';
import { TurnosMedico } from './turnos/turnos-medico';

export const MEDICO_ROUTES: Routes = [
  {
    path: '',
    component: InicioSeccion,
    data: {
      titulo: 'Panel del médico',
      descripcion: 'Tu agenda de atención y los turnos de tus pacientes.',
      icono: 'stethoscope',
    },
  },
  { path: 'agenda', component: AgendaMedico, title: 'Mi agenda' },
  { path: 'turnos', component: TurnosMedico, title: 'Turnos programados' },
  { path: 'historial', component: HistorialMedico, title: 'Historial clínico' },
];
