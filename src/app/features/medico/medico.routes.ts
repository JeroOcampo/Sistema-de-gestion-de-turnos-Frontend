import { Routes } from '@angular/router';
import { InicioSeccion } from '../../shared/components/inicio-seccion/inicio-seccion';
import { EnConstruccion } from '../errors/en-construccion/en-construccion';

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
  { path: 'agenda', component: EnConstruccion, data: { titulo: 'Mi agenda' } },
  { path: 'turnos', component: EnConstruccion, data: { titulo: 'Turnos del día' } },
  { path: 'historial', component: EnConstruccion, data: { titulo: 'Historial clínico' } },
];
