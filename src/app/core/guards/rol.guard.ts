import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Rol } from '../models/usuario.model';
import { AuthService } from '../services/auth.service';

/**
 * Restringe una sección a los roles indicados en `data.roles` de la ruta.
 * Sin sesión redirige al login; con un rol no permitido, a "Acceso denegado".
 */
export const rolGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const permitidos = (route.data['roles'] ?? []) as Rol[];

  if (!auth.haySesion()) return router.createUrlTree(['/login']);

  const rol = auth.rol();
  return rol && permitidos.includes(rol) ? true : router.createUrlTree(['/acceso-denegado']);
};
