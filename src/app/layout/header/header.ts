import { DatePipe } from '@angular/common';
import { Component, computed, inject, output } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { ErrorApi } from '../../core/models/error-api.model';
import { ETIQUETA_ROL } from '../../core/models/usuario.model';
import { AuthService } from '../../core/services/auth.service';
import { AvisoService } from '../../core/services/aviso.service';
import { NotificacionService } from '../../core/services/notificacion.service';

const ICONO_POR_TIPO: Record<string, string> = {
  turno_confirmado: 'event_available',
  turno_cancelado: 'event_busy',
  turno_atendido: 'task_alt',
};

@Component({
  selector: 'app-header',
  imports: [
    DatePipe,
    MatBadgeModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatToolbarModule,
    MatTooltipModule,
    RouterLink,
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  protected readonly auth = inject(AuthService);
  protected readonly notificaciones = inject(NotificacionService);
  private readonly avisos = inject(AvisoService);

  readonly alternarMenu = output<void>();

  protected readonly nombreCompleto = computed(() => {
    const usuario = this.auth.usuario();
    return usuario ? `${usuario.nombre} ${usuario.apellido}` : '';
  });

  protected readonly tipoUsuario = computed(() => {
    const rol = this.auth.rol();
    return rol ? ETIQUETA_ROL[rol] : '';
  });

  protected readonly etiquetaCampana = computed(() => {
    const noLeidas = this.notificaciones.noLeidas();
    return noLeidas > 0 ? `Notificaciones (${noLeidas} sin leer)` : 'Notificaciones';
  });

  protected icono(tipo: string): string {
    return ICONO_POR_TIPO[tipo] ?? 'notifications';
  }

  protected marcarLeida(id: number): void {
    this.notificaciones
      .marcarLeida(id)
      .subscribe({ error: (error: ErrorApi) => this.avisos.error(error.message) });
  }
}
