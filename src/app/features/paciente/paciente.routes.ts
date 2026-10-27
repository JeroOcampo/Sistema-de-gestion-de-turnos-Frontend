import { Routes } from '@angular/router';
import { InicioSeccion } from '../../shared/components/inicio-seccion/inicio-seccion';
import { EnConstruccion } from '../errors/en-construccion/en-construccion';

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
  { path: 'turnos/nuevo', component: EnConstruccion, data: { titulo: 'Sacar turno' } },
  { path: 'turnos', component: EnConstruccion, data: { titulo: 'Mis turnos' } },
  { path: 'historial', component: EnConstruccion, data: { titulo: 'Historial clínico' } },
];
