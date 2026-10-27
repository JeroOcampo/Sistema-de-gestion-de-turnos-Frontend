import { Pipe, PipeTransform } from '@angular/core';
import { ETIQUETA_ROL, Rol } from '../../core/models/usuario.model';

/** Nombre para mostrar de un rol: "medico" -> "Médico". */
@Pipe({ name: 'etiquetaRol' })
export class EtiquetaRolPipe implements PipeTransform {
  transform(rol: Rol | null | undefined): string {
    return rol ? ETIQUETA_ROL[rol] : '';
  }
}
