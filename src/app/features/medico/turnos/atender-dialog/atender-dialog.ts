import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ErrorApi } from '../../../../core/models/error-api.model';
import { Turno } from '../../../../core/models/turno.model';
import { TurnoService } from '../../../../core/services/turno.service';
import { AlertaError } from '../../../../shared/components/alerta-error/alerta-error';

const LARGO_MAXIMO = 255;

/** Marca el turno como atendido y carga su historial clínico en la misma operación. */
@Component({
  selector: 'app-atender-dialog',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    AlertaError,
  ],
  templateUrl: './atender-dialog.html',
})
export class AtenderDialog {
  private readonly fb = inject(FormBuilder);
  private readonly turnoService = inject(TurnoService);
  private readonly dialogRef = inject<MatDialogRef<AtenderDialog, Turno>>(MatDialogRef);
  protected readonly turno = inject<Turno>(MAT_DIALOG_DATA);

  protected readonly largoMaximo = LARGO_MAXIMO;
  protected readonly formulario = this.fb.nonNullable.group({
    diagnostico: ['', [Validators.required, Validators.maxLength(LARGO_MAXIMO)]],
    tratamiento: ['', [Validators.required, Validators.maxLength(LARGO_MAXIMO)]],
    observaciones: ['', [Validators.required, Validators.maxLength(LARGO_MAXIMO)]],
  });

  protected readonly guardando = signal(false);
  protected readonly errorServidor = signal<string | null>(null);

  protected guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const { diagnostico, tratamiento, observaciones } = this.formulario.getRawValue();
    this.guardando.set(true);
    this.errorServidor.set(null);

    this.turnoService
      .atender(this.turno.id, {
        diagnostico: diagnostico.trim(),
        tratamiento: tratamiento.trim(),
        observaciones: observaciones.trim(),
      })
      .subscribe({
        next: (turno) => this.dialogRef.close(turno),
        error: (error: ErrorApi) => {
          this.errorServidor.set(error.message);
          this.guardando.set(false);
        },
      });
  }
}
