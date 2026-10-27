import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { catchError, debounceTime, of, switchMap, tap } from 'rxjs';
import {
  AccionAuditoria,
  ACCIONES_AUDITORIA,
  ENTIDADES_AUDITADAS,
  RegistroAuditoria,
} from '../../../core/models/auditoria.model';
import { ErrorApi } from '../../../core/models/error-api.model';
import { AuditoriaService } from '../../../core/services/auditoria.service';
import { aIso } from '../../../core/utils/fechas';
import { AlertaError } from '../../../shared/components/alerta-error/alerta-error';
import { Cargando } from '../../../shared/components/cargando/cargando';
import { EncabezadoPagina } from '../../../shared/components/encabezado-pagina/encabezado-pagina';
import { EstadoVacio } from '../../../shared/components/estado-vacio/estado-vacio';
import { EtiquetaRolPipe } from '../../../shared/pipes/etiqueta-rol.pipe';

/** Registro de acciones sensibles (solo lectura), del más reciente al más antiguo. */
@Component({
  selector: 'app-auditoria',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatSelectModule,
    MatTableModule,
    AlertaError,
    Cargando,
    EncabezadoPagina,
    EstadoVacio,
    EtiquetaRolPipe,
  ],
  templateUrl: './auditoria.html',
  styleUrl: './auditoria.scss',
})
export class Auditoria {
  private readonly auditoriaService = inject(AuditoriaService);

  protected readonly entidades = ENTIDADES_AUDITADAS;
  protected readonly acciones = ACCIONES_AUDITORIA;
  protected readonly columnas = ['fecha', 'usuario', 'accion', 'entidad', 'detalle'];
  protected readonly opcionesTamanio = [10, 25, 50];

  protected readonly usuario = signal('');
  protected readonly entidad = signal('');
  protected readonly accion = signal<AccionAuditoria | ''>('');
  protected readonly rango = new FormGroup({
    desde: new FormControl<Date | null>(null),
    hasta: new FormControl<Date | null>(null),
  });
  private readonly valorRango = toSignal(this.rango.valueChanges, {
    initialValue: this.rango.value,
  });
  protected readonly pagina = signal(0);
  protected readonly tamanio = signal(10);

  protected readonly registros = signal<RegistroAuditoria[]>([]);
  protected readonly total = signal(0);
  protected readonly cargando = signal(true);
  protected readonly errorServidor = signal<string | null>(null);

  private readonly consulta = computed(() => {
    const { desde, hasta } = this.valorRango();
    return {
      filtros: {
        usuario: this.usuario().trim(),
        entidad: this.entidad(),
        accion: this.accion(),
        desde: desde ? aIso(desde) : undefined,
        hasta: hasta ? aIso(hasta) : undefined,
      },
      pagina: this.pagina(),
      tamanio: this.tamanio(),
    };
  });

  constructor() {
    // Cambiar el rango de fechas también vuelve a la primera página.
    this.rango.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.pagina.set(0));

    toObservable(this.consulta)
      .pipe(
        debounceTime(300),
        tap(() => {
          this.cargando.set(true);
          this.errorServidor.set(null);
        }),
        switchMap(({ filtros, pagina, tamanio }) =>
          this.auditoriaService.listar(filtros, tamanio, pagina * tamanio).pipe(
            catchError((error: ErrorApi) => {
              this.errorServidor.set(error.message);
              return of(null);
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((resultado) => {
        this.registros.set(resultado?.items ?? []);
        this.total.set(resultado?.total ?? 0);
        this.cargando.set(false);
      });
  }

  protected limpiarFiltros(): void {
    this.usuario.set('');
    this.entidad.set('');
    this.accion.set('');
    this.rango.reset();
    this.pagina.set(0);
  }

  protected cambiarPagina(evento: PageEvent): void {
    this.pagina.set(evento.pageIndex);
    this.tamanio.set(evento.pageSize);
  }

  /** El detalle tiene la forma "ALTA sobre sede #3 | {datos enviados}". */
  protected resumen(detalle: string | null): string {
    return detalle?.split(' | ')[0] ?? '—';
  }

  protected datosEnviados(detalle: string | null): string {
    return detalle?.split(' | ').slice(1).join(' | ') ?? '';
  }
}
