import { Routes } from '@angular/router';
import { InicioSeccion } from '../../shared/components/inicio-seccion/inicio-seccion';
import { EnConstruccion } from '../errors/en-construccion/en-construccion';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: InicioSeccion,
    data: {
      titulo: 'Panel de administración',
      descripcion: 'Configuración general de la clínica.',
      icono: 'admin_panel_settings',
    },
  },
  { path: 'usuarios', component: EnConstruccion, data: { titulo: 'Usuarios' } },
  { path: 'sedes', component: EnConstruccion, data: { titulo: 'Sedes' } },
  { path: 'especialidades', component: EnConstruccion, data: { titulo: 'Especialidades' } },
  { path: 'coberturas', component: EnConstruccion, data: { titulo: 'Coberturas' } },
  { path: 'reportes', component: EnConstruccion, data: { titulo: 'Reportes' } },
  { path: 'auditoria', component: EnConstruccion, data: { titulo: 'Auditoría' } },
];
