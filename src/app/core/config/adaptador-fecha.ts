import { Injectable } from '@angular/core';
import { NativeDateAdapter } from '@angular/material/core';

const FECHA_ESCRITA = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/;

/**
 * El adaptador nativo interpreta lo que se escribe a mano en formato estadounidense
 * (mes/día): "05/03/1998" sería 3 de mayo. Este lo lee como día/mes/año.
 */
@Injectable()
export class AdaptadorFechaArgentino extends NativeDateAdapter {
  override parse(valor: unknown, formato?: unknown): Date | null {
    if (typeof valor === 'string') {
      const partes = valor.trim().match(FECHA_ESCRITA);
      if (partes) {
        const [dia, mes, anio] = partes.slice(1).map(Number);
        const fecha = new Date(anio, mes - 1, dia);
        // Descarta fechas que no existen, como el 31/02.
        return fecha.getMonth() === mes - 1 && fecha.getDate() === dia ? fecha : this.invalid();
      }
    }
    return super.parse(valor, formato);
  }
}
