import { Routes } from '@angular/router';
import { InicioSeccion } from '../../shared/components/inicio-seccion/inicio-seccion';
import { EnConstruccion } from '../errors/en-construccion/en-construccion';

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
  { path: 'turnos', component: EnConstruccion, data: { titulo: 'Turnos de la sede' } },
  { path: 'pacientes', component: EnConstruccion, data: { titulo: 'Pacientes' } },
];
