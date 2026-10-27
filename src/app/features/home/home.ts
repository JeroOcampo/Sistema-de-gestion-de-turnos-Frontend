import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { ETIQUETA_ROL } from '../../core/models/usuario.model';
import { AuthService } from '../../core/services/auth.service';

interface Funcionalidad {
  icono: string;
  titulo: string;
  descripcion: string;
}

@Component({
  selector: 'app-home',
  imports: [MatCardModule, MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  protected readonly auth = inject(AuthService);

  protected readonly saludo = computed(() => this.auth.usuario()?.nombre ?? '');
  protected readonly tipoUsuario = computed(() => {
    const rol = this.auth.rol();
    return rol ? ETIQUETA_ROL[rol] : '';
  });

  protected readonly funcionalidades: Funcionalidad[] = [
    {
      icono: 'event_available',
      titulo: 'Sacar turnos',
      descripcion: 'Elegí especialidad, médico, sede y horario disponible desde tu casa.',
    },
    {
      icono: 'event_note',
      titulo: 'Gestionar tus turnos',
      descripcion: 'Consultá tus próximos turnos y cancelá o reprogramá los que necesites.',
    },
    {
      icono: 'history_edu',
      titulo: 'Historial clínico',
      descripcion: 'Accedé al registro de tus consultas y a las indicaciones de tus médicos.',
    },
    {
      icono: 'notifications_active',
      titulo: 'Notificaciones',
      descripcion: 'Recibí avisos sobre confirmaciones y cambios en tus turnos.',
    },
  ];
}
