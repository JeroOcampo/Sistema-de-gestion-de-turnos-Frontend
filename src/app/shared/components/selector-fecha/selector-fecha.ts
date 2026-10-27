import { Component, computed, input, model } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { aIso, desdeIso, hoyIso, sumarDias } from '../../../core/utils/fechas';

/** Selector de un día (AAAA-MM-DD) con botones para ir al anterior, al siguiente o a hoy. */
@Component({
  selector: 'app-selector-fecha',
  imports: [
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatTooltipModule,
  ],
  template: `
    <div class="selector-fecha">
      <button
        mat-icon-button
        type="button"
        matTooltip="Día anterior"
        aria-label="Día anterior"
        (click)="mover(-1)"
      >
        <mat-icon>chevron_left</mat-icon>
      </button>
      <mat-form-field appearance="outline" subscriptSizing="dynamic">
        <mat-label>{{ etiqueta() }}</mat-label>
        <input
          matInput
          [matDatepicker]="selector"
          [value]="fechaComoDate()"
          (dateChange)="elegir($event.value)"
        />
        <mat-datepicker-toggle matIconSuffix [for]="selector" />
        <mat-datepicker #selector />
      </mat-form-field>
      <button
        mat-icon-button
        type="button"
        matTooltip="Día siguiente"
        aria-label="Día siguiente"
        (click)="mover(1)"
      >
        <mat-icon>chevron_right</mat-icon>
      </button>
      <button mat-stroked-button type="button" [disabled]="fecha() === hoy" (click)="fecha.set(hoy)">
        Hoy
      </button>
    </div>
  `,
  styles: `
    .selector-fecha {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    mat-form-field {
      width: 190px;
    }
  `,
})
export class SelectorFecha {
  readonly fecha = model.required<string>();
  readonly etiqueta = input('Fecha');

  protected readonly hoy = hoyIso();
  protected readonly fechaComoDate = computed(() => desdeIso(this.fecha()));

  protected mover(dias: number): void {
    this.fecha.set(sumarDias(this.fecha(), dias));
  }

  protected elegir(valor: Date | null): void {
    if (valor) this.fecha.set(aIso(valor));
  }
}
