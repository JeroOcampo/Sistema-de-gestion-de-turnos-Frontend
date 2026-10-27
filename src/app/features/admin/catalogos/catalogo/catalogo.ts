import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute } from '@angular/router';
import { filter, switchMap } from 'rxjs';
import { ErrorApi } from '../../../../core/models/error-api.model';
import { AvisoService } from '../../../../core/services/aviso.service';
import { AlertaError } from '../../../../shared/components/alerta-error/alerta-error';
import { Cargando } from '../../../../shared/components/cargando/cargando';
import { ConfirmacionService } from '../../../../shared/components/confirmacion-dialog/confirmacion-dialog';
import { EncabezadoPagina } from '../../../../shared/components/encabezado-pagina/encabezado-pagina';
import { EstadoVacio } from '../../../../shared/components/estado-vacio/estado-vacio';
import { CatalogoDialog, DatosCatalogoDialog } from '../catalogo-dialog/catalogo-dialog';
import { ConfigCatalogo, ItemCatalogo, valorCampo } from '../catalogos';

/** Sin mayúsculas ni tildes, para que el filtro encuentre "Clinica" escribiendo "clínica". */
function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

/** Pantalla de ABM de un catálogo (sedes, especialidades o coberturas). */
@Component({
  selector: 'app-catalogo',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatTableModule,
    MatTooltipModule,
    AlertaError,
    Cargando,
    EncabezadoPagina,
    EstadoVacio,
  ],
  templateUrl: './catalogo.html',
})
export class Catalogo {
  protected readonly config = inject(ActivatedRoute).snapshot.data['catalogo'] as ConfigCatalogo;
  private readonly servicio = inject(this.config.servicio);
  private readonly dialog = inject(MatDialog);
  private readonly confirmacion = inject(ConfirmacionService);
  private readonly avisos = inject(AvisoService);

  protected readonly valorCampo = valorCampo;
  protected readonly columnas = [...this.config.campos.map((campo) => campo.clave), 'acciones'];

  protected readonly items = signal<ItemCatalogo[]>([]);
  protected readonly cargando = signal(true);
  protected readonly errorServidor = signal<string | null>(null);
  protected readonly filtro = signal('');

  protected readonly filtrados = computed(() => {
    const texto = normalizar(this.filtro());
    if (!texto) return this.items();
    return this.items().filter((item) =>
      this.config.campos.some((campo) =>
        normalizar(valorCampo(item, campo.clave)).includes(texto),
      ),
    );
  });

  constructor() {
    this.cargar();
  }

  protected abrirFormulario(item?: ItemCatalogo): void {
    this.errorServidor.set(null);
    const datos: DatosCatalogoDialog = { config: this.config, item };
    this.dialog
      .open(CatalogoDialog, { data: datos, width: '480px' })
      .afterClosed()
      .subscribe((guardado?: ItemCatalogo) => {
        if (!guardado) return;
        this.avisos.exito(
          `La ${this.config.singular} se ${item ? 'modificó' : 'creó'} correctamente.`,
        );
        this.cargar();
      });
  }

  protected eliminar(item: ItemCatalogo): void {
    this.errorServidor.set(null);
    const nombre = valorCampo(item, this.config.campos[0].clave);
    this.confirmacion
      .preguntar({
        titulo: `Eliminar ${this.config.singular}`,
        mensaje: `¿Está seguro de eliminar la ${this.config.singular} "${nombre}"?`,
        textoConfirmar: 'Eliminar',
      })
      .pipe(
        filter(Boolean),
        switchMap(() => this.servicio.eliminar(item.id)),
      )
      .subscribe({
        next: () => {
          this.avisos.exito(`La ${this.config.singular} "${nombre}" se eliminó correctamente.`);
          this.cargar();
        },
        // Si el backend la rechaza (por ejemplo, por dependencias) el listado queda como estaba.
        error: (error: ErrorApi) => this.errorServidor.set(error.message),
      });
  }

  private cargar(): void {
    this.cargando.set(true);
    this.servicio.listar().subscribe({
      next: (items) => {
        this.items.set(items);
        this.cargando.set(false);
      },
      error: (error: ErrorApi) => {
        this.errorServidor.set(error.message);
        this.cargando.set(false);
      },
    });
  }
}
