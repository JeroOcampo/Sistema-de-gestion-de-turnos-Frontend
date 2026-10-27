import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { catchError, debounceTime, of, switchMap, tap } from 'rxjs';
import { ErrorApi } from '../../../../core/models/error-api.model';
import { ETIQUETA_ROL, Rol, ROLES, UsuarioGestion } from '../../../../core/models/usuario.model';
import { SedeService } from '../../../../core/services/sede.service';
import { UsuarioService } from '../../../../core/services/usuario.service';
import { AlertaError } from '../../../../shared/components/alerta-error/alerta-error';
import { Cargando } from '../../../../shared/components/cargando/cargando';
import { EncabezadoPagina } from '../../../../shared/components/encabezado-pagina/encabezado-pagina';
import { EstadoVacio } from '../../../../shared/components/estado-vacio/estado-vacio';
import { EtiquetaRolPipe } from '../../../../shared/pipes/etiqueta-rol.pipe';

@Component({
  selector: 'app-lista-usuarios',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatSelectModule,
    MatTableModule,
    MatTooltipModule,
    RouterLink,
    AlertaError,
    Cargando,
    EncabezadoPagina,
    EstadoVacio,
    EtiquetaRolPipe,
  ],
  templateUrl: './lista-usuarios.html',
})
export class ListaUsuarios {
  private readonly usuarioService = inject(UsuarioService);

  protected readonly etiquetaRol = ETIQUETA_ROL;
  protected readonly roles = ROLES;
  protected readonly columnas = ['nombre', 'dni', 'email', 'rol', 'sede', 'acciones'];
  protected readonly opcionesTamanio = [10, 25, 50];

  protected readonly sedes = toSignal(
    inject(SedeService)
      .listar()
      .pipe(catchError(() => of([]))),
    { initialValue: [] },
  );

  protected readonly nombre = signal('');
  protected readonly apellido = signal('');
  protected readonly rol = signal<Rol | ''>('');
  /** 0 = todas las sedes (un valor null dejaría el select en blanco). */
  protected readonly idSede = signal(0);
  protected readonly pagina = signal(0);
  protected readonly tamanio = signal(10);

  protected readonly usuarios = signal<UsuarioGestion[]>([]);
  protected readonly total = signal(0);
  protected readonly cargando = signal(true);
  protected readonly errorServidor = signal<string | null>(null);

  private readonly consulta = computed(() => ({
    filtros: {
      nombre: this.nombre().trim(),
      apellido: this.apellido().trim(),
      rol: this.rol(),
      id_sede: this.idSede() || null,
    },
    pagina: this.pagina(),
    tamanio: this.tamanio(),
  }));

  constructor() {
    // Cada cambio de filtro o de página vuelve a consultar al backend, que es quien pagina.
    toObservable(this.consulta)
      .pipe(
        debounceTime(300),
        tap(() => {
          this.cargando.set(true);
          this.errorServidor.set(null);
        }),
        switchMap(({ filtros, pagina, tamanio }) =>
          this.usuarioService.listar(filtros, tamanio, pagina * tamanio).pipe(
            catchError((error: ErrorApi) => {
              this.errorServidor.set(error.message);
              return of(null);
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((resultado) => {
        this.usuarios.set(resultado?.items ?? []);
        this.total.set(resultado?.total ?? 0);
        this.cargando.set(false);
      });
  }

  protected limpiarFiltros(): void {
    this.nombre.set('');
    this.apellido.set('');
    this.rol.set('');
    this.idSede.set(0);
    this.pagina.set(0);
  }

  protected cambiarPagina(evento: PageEvent): void {
    this.pagina.set(evento.pageIndex);
    this.tamanio.set(evento.pageSize);
  }
}
