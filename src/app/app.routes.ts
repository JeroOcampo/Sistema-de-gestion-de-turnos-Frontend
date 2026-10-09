import { Routes } from '@angular/router';
import { invitadoGuard } from './core/guards/invitado.guard';
import { rolGuard } from './core/guards/rol.guard';
import { sesionGuard } from './core/guards/sesion.guard';
import { Login } from './features/auth/login/login';
import { Registro } from './features/auth/registro/registro';
import { AccesoDenegado } from './features/errors/acceso-denegado/acceso-denegado';
import { NoEncontrada } from './features/errors/no-encontrada/no-encontrada';
import { Home } from './features/home/home';
import { Perfil } from './features/perfil/perfil';

export const routes: Routes = [
  { path: '', component: Home, title: 'Clínica Virtual' },

  { path: 'login', component: Login, canActivate: [invitadoGuard], title: 'Iniciar sesión' },
  { path: 'registro', component: Registro, canActivate: [invitadoGuard], title: 'Registro de paciente' },

  { path: 'perfil', component: Perfil, canActivate: [sesionGuard], title: 'Mi perfil' },

  // Cada rol tiene su propia sección; el guard verifica el rol contra el token.
  {
    path: 'paciente',
    canActivate: [rolGuard],
    data: { roles: ['paciente'] },
    loadChildren: () => import('./features/paciente/paciente.routes').then((m) => m.PACIENTE_ROUTES),
  },
  {
    path: 'medico',
    canActivate: [rolGuard],
    data: { roles: ['medico'] },
    loadChildren: () => import('./features/medico/medico.routes').then((m) => m.MEDICO_ROUTES),
  },
  {
    path: 'operador',
    canActivate: [rolGuard],
    data: { roles: ['operador'] },
    loadChildren: () => import('./features/operador/operador.routes').then((m) => m.OPERADOR_ROUTES),
  },
  {
    path: 'admin',
    canActivate: [rolGuard],
    data: { roles: ['administrador'] },
    loadChildren: () => import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },

  { path: 'acceso-denegado', component: AccesoDenegado, title: 'Acceso denegado' },
  { path: '**', component: NoEncontrada, title: 'Página no encontrada' },
];
