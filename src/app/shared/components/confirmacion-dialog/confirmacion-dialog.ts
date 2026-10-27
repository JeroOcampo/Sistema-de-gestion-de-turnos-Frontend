import { Component, inject, Injectable } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { map, Observable } from 'rxjs';

export interface DatosConfirmacion {
  titulo: string;
  mensaje: string;
  /** Texto del botón que confirma la acción (por defecto "Confirmar"). */
  textoConfirmar?: string;
}

/** Diálogo que pide confirmación antes de una acción que no se puede deshacer. */
@Component({
  selector: 'app-confirmacion-dialog',
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ datos.titulo }}</h2>
    <mat-dialog-content>
      <p>{{ datos.mensaje }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button type="button" [mat-dialog-close]="false">Volver</button>
      <button mat-flat-button type="button" class="boton-peligro" [mat-dialog-close]="true">
        {{ datos.textoConfirmar ?? 'Confirmar' }}
      </button>
    </mat-dialog-actions>
  `,
})
export class ConfirmacionDialog {
  protected readonly datos = inject<DatosConfirmacion>(MAT_DIALOG_DATA);
}

@Injectable({ providedIn: 'root' })
export class ConfirmacionService {
  private readonly dialog = inject(MatDialog);

  /** Emite true solo si el usuario confirma. */
  preguntar(datos: DatosConfirmacion): Observable<boolean> {
    return this.dialog
      .open(ConfirmacionDialog, { data: datos, width: '440px' })
      .afterClosed()
      .pipe(map((respuesta) => respuesta === true));
  }
}
