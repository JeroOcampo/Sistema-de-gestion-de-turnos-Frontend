import { Routes } from '@angular/router';
import { InicioSeccion } from '../../shared/components/inicio-seccion/inicio-seccion';
import { Auditoria } from './auditoria/auditoria';
import {
  CATALOGO_COBERTURAS,
  CATALOGO_ESPECIALIDADES,
  CATALOGO_SEDES,
} from './catalogos/catalogos';
import { Catalogo } from './catalogos/catalogo/catalogo';
import { Reportes } from './reportes/reportes';
import { FormularioUsuario } from './usuarios/formulario-usuario/formulario-usuario';
import { ListaUsuarios } from './usuarios/lista-usuarios/lista-usuarios';

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
  { path: 'usuarios', component: ListaUsuarios, title: 'Usuarios' },
  { path: 'usuarios/nuevo', component: FormularioUsuario, title: 'Nuevo usuario' },
  { path: 'usuarios/:id', component: FormularioUsuario, title: 'Modificar usuario' },
  { path: 'sedes', component: Catalogo, data: { catalogo: CATALOGO_SEDES }, title: 'Sedes' },
  {
    path: 'especialidades',
    component: Catalogo,
    data: { catalogo: CATALOGO_ESPECIALIDADES },
    title: 'Especialidades',
  },
  {
    path: 'coberturas',
    component: Catalogo,
    data: { catalogo: CATALOGO_COBERTURAS },
    title: 'Coberturas',
  },
  { path: 'reportes', component: Reportes, title: 'Reportes' },
  { path: 'auditoria', component: Auditoria, title: 'Auditoría' },
];
