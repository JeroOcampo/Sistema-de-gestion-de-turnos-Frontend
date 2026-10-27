import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Bloquea las rutas protegidas para quien no inició sesión. */
export const sesionGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.haySesion() ? true : inject(Router).createUrlTree(['/login']);
};
