import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, Observable, tap } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { ApiRespuesta } from '../models/api-respuesta.model';
import { Notificacion } from '../models/notificacion.model';
import { AuthService } from './auth.service';

/**
 * Notificaciones del usuario logueado (campana del header).
 * Se actualizan al navegar, así cada usuario ve sin recargar los avisos que le generaron
 * otros; las pantallas llaman a actualizar() después de confirmar, cancelar o atender un turno.
 */
@Injectable({ providedIn: 'root' })
export class NotificacionService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly url = `${API_BASE_URL}/notificaciones`;

  private readonly _notificaciones = signal<Notificacion[]>([]);

  /** De la más reciente a la más antigua (el backend ya las devuelve así). */
  readonly notificaciones = this._notificaciones.asReadonly();
  readonly noLeidas = computed(() => this._notificaciones().filter((n) => !n.leida).length);

  constructor() {
    this.actualizar();
    inject(Router)
      .events.pipe(
        filter((evento) => evento instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.actualizar());
  }

  actualizar(): void {
    if (!this.auth.haySesion()) {
      this._notificaciones.set([]);
      return;
    }
    this.http
      .get<ApiRespuesta<Notificacion[]>>(this.url)
      .pipe(map((r) => r.datos))
      .subscribe({
        next: (notificaciones) => this._notificaciones.set(notificaciones),
        // Si falla se conserva lo último que se cargó: no vale la pena interrumpir al usuario.
        error: () => undefined,
      });
  }

  marcarLeida(id: number): Observable<void> {
    return this.http.patch<ApiRespuesta<Notificacion>>(`${this.url}/${id}/leida`, {}).pipe(
      tap((r) =>
        this._notificaciones.update((lista) => lista.map((n) => (n.id === id ? r.datos : n))),
      ),
      map(() => undefined),
    );
  }
}
