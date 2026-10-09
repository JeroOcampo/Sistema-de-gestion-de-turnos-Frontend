import { Component, computed, inject, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { MENU_POR_ROL } from './menu-items';

@Component({
  selector: 'app-menu',
  imports: [MatListModule, MatIconModule, RouterLink, RouterLinkActive],
  templateUrl: './menu.html',
  styleUrl: './menu.scss',
})
export class Menu {
  private readonly auth = inject(AuthService);

  /** Se emite al elegir una opción para que el contenedor pueda cerrar el panel en pantallas chicas. */
  readonly opcionElegida = output<void>();

  protected readonly opciones = computed(() => {
    const rol = this.auth.rol();
    return rol ? MENU_POR_ROL[rol] : [];
  });
}
