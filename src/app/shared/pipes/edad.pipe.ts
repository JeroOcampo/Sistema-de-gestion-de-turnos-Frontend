import { Pipe, PipeTransform } from '@angular/core';
import { calcularEdad } from '../../core/utils/fechas';

/** Edad en años a partir de la fecha de nacimiento (AAAA-MM-DD). */
@Pipe({ name: 'edad' })
export class EdadPipe implements PipeTransform {
  transform(fechaNacimiento: string | null | undefined): string {
    if (!fechaNacimiento) return '—';
    const edad = calcularEdad(fechaNacimiento);
    return `${edad} ${edad === 1 ? 'año' : 'años'}`;
  }
}
