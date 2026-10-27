import { AbstractControl, FormGroupDirective, NgForm } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

/**
 * Muestra en rojo un campo cuando el formulario que lo contiene tiene un error que
 * compara dos campos (por ejemplo, la hora de salida contra la de entrada).
 */
export class ErrorDeGrupoMatcher implements ErrorStateMatcher {
  constructor(private readonly errorDelGrupo: string) {}

  isErrorState(control: AbstractControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const conError =
      !!control && (control.invalid || !!control.parent?.hasError(this.errorDelGrupo));
    return conError && (!!control?.touched || !!form?.submitted);
  }
}
