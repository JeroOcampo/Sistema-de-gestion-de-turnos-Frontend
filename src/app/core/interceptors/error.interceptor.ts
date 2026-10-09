import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ErrorApi } from '../models/error-api.model';
import { AuthService } from '../services/auth.service';
import { NotificacionService } from '../services/notificacion.service';

/**
 * Traduce cualquier falla HTTP a un ErrorApi con un mensaje apto para el usuario.
 * El backend informa el motivo en el campo `estado` de su respuesta.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const avisos = inject(NotificacionService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const mensaje = extraerMensaje(error);

      // Token vencido o inválido con sesión activa (un login fallido es un 401 sin sesión).
      if (error.status === 401 && auth.haySesion()) {
        auth.expirarSesion();
        avisos.error('Tu sesión expiró. Iniciá sesión nuevamente.');
      }
      return throwError(() => new ErrorApi(mensaje, error.status));
    }),
  );
};

function extraerMensaje(error: HttpErrorResponse): string {
  if (error.status === 0) {
    return 'No se pudo conectar con el servidor de la clínica. Verificá que el backend esté en ejecución.';
  }
  const estado = error.error?.estado;
  if (typeof estado === 'string' && estado !== 'ok') {
    return estado;
  }
  return error.status >= 500
    ? 'Ocurrió un error en el servidor. Intentá nuevamente en unos minutos.'
    : 'No pudimos completar la operación. Intentá nuevamente.';
}
