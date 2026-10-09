import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Login y registro solo tienen sentido sin sesión iniciada. */
export const invitadoGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.haySesion() ? inject(Router).createUrlTree(['/']) : true;
};
