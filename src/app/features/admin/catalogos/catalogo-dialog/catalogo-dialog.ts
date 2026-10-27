import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ErrorApi } from '../../../../core/models/error-api.model';
import { AlertaError } from '../../../../shared/components/alerta-error/alerta-error';
import { CampoCatalogo, ConfigCatalogo, ItemCatalogo, valorCampo } from '../catalogos';

export interface DatosCatalogoDialog {
  config: ConfigCatalogo;
  /** Registro a modificar; si no viene, es un alta. */
  item?: ItemCatalogo;
}

/** Un texto con solo espacios no cuenta como completado. */
function textoObligatorio(control: AbstractControl): ValidationErrors | null {
  return String(control.value ?? '').trim() ? null : { required: true };
}

function validadores(campo: CampoCatalogo): ValidatorFn[] {
  const lista = [textoObligatorio, Validators.maxLength(campo.largoMaximo)];
  return campo.patron ? [...lista, Validators.pattern(campo.patron.regex)] : lista;
}

/** Formulario de alta y modificación de un registro de catálogo. */
@Component({
  selector: 'app-catalogo-dialog',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    AlertaError,
  ],
  templateUrl: './catalogo-dialog.html',
})
export class CatalogoDialog {
  protected readonly datos = inject<DatosCatalogoDialog>(MAT_DIALOG_DATA);
  private readonly servicio = inject(this.datos.config.servicio);
  private readonly dialogRef = inject<MatDialogRef<CatalogoDialog, ItemCatalogo>>(MatDialogRef);

  protected readonly config = this.datos.config;
  protected readonly formulario = new FormGroup(
    Object.fromEntries(
      this.config.campos.map((campo) => [
        campo.clave,
        new FormControl(this.datos.item ? valorCampo(this.datos.item, campo.clave) : '', {
          nonNullable: true,
          validators: validadores(campo),
        }),
      ]),
    ),
  );

  protected readonly guardando = signal(false);
  protected readonly errorServidor = signal<string | null>(null);

  protected guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const valores = Object.fromEntries(
      Object.entries(this.formulario.getRawValue()).map(([clave, valor]) => [clave, valor.trim()]),
    );

    this.guardando.set(true);
    this.errorServidor.set(null);

    const item = this.datos.item;
    const pedido = item ? this.servicio.actualizar(item.id, valores) : this.servicio.crear(valores);

    pedido.subscribe({
      next: (guardado) => this.dialogRef.close(guardado),
      error: (error: ErrorApi) => {
        this.errorServidor.set(error.message);
        this.guardando.set(false);
      },
    });
  }
}
