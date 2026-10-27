import { Component, computed, inject, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { ETIQUETA_ROL } from '../../core/models/usuario.model';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, MatTooltipModule, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  protected readonly auth = inject(AuthService);

  readonly alternarMenu = output<void>();

  protected readonly nombreCompleto = computed(() => {
    const usuario = this.auth.usuario();
    return usuario ? `${usuario.nombre} ${usuario.apellido}` : '';
  });

  protected readonly tipoUsuario = computed(() => {
    const rol = this.auth.rol();
    return rol ? ETIQUETA_ROL[rol] : '';
  });
}
