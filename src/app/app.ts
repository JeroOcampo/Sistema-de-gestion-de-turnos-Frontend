import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterOutlet } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from './core/services/auth.service';
import { Footer } from './layout/footer/footer';
import { Header } from './layout/header/header';
import { Menu } from './layout/menu/menu';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatSidenavModule, Header, Menu, Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly auth = inject(AuthService);

  protected readonly esPantallaChica = toSignal(
    inject(BreakpointObserver)
      .observe('(max-width: 959px)')
      .pipe(map((estado) => estado.matches)),
    { initialValue: false },
  );

  /** null = comportamiento por defecto: abierto en pantallas grandes, cerrado en chicas. */
  private readonly preferenciaMenu = signal<boolean | null>(null);

  protected readonly menuAbierto = computed(
    () => this.auth.haySesion() && (this.preferenciaMenu() ?? !this.esPantallaChica()),
  );

  protected alternarMenu(): void {
    this.preferenciaMenu.set(!this.menuAbierto());
  }

  /** Cierre iniciado por el panel (ej. clic en el fondo oscuro); el logout no cuenta como preferencia. */
  protected registrarCierreMenu(): void {
    if (this.auth.haySesion()) this.preferenciaMenu.set(false);
  }

  protected cerrarMenuSiEsChico(): void {
    if (this.esPantallaChica()) this.preferenciaMenu.set(false);
  }
}
