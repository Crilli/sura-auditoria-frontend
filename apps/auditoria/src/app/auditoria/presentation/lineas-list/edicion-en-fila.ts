import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators }
  from '@angular/forms';
import { ResumenLineaModel } from '../../domain/models/linea-cuenta.model';
import { CampoEnFila, ModoRecalculo, valoresDeLaFila }
  from '../../domain/models/edicion-en-fila.model';

/**
 * El formulario de la edición en la fila (GRID-18). Las reglas de qué se guarda y cómo
 * vuelve la fila están en `domain/models/edicion-en-fila.model.ts`.
 */

export interface FormularioEnFila {
  valorCargado:        FormControl<number | null>;
  unidadesCargadas:    FormControl<number | null>;
  valorAutorizado:     FormControl<number | null>;
  unidadesAutorizadas: FormControl<number | null>;
  modoRecalculo:       FormControl<ModoRecalculo | null>;
}

/**
 * Un campo que tenía valor no se puede vaciar.
 *
 * El contrato es «lo ausente no se toca», así que vaciar no borraría nada: mandaría la
 * línea tal cual y el auditor creería haber quitado un valor. Y quitarlo de verdad tampoco
 * se puede: el sistema de registro exige las unidades no nulas.
 */
function noSeVacia(original: number | null): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null =>
    original !== null && (control.value === null || control.value === '')
      ? { obligatorio: true }
      : null;
}

/** El formulario de una fila, con sus valores de partida y sin modo de recálculo elegido. */
export function crearFormularioEnFila(fila: ResumenLineaModel): FormGroup<FormularioEnFila> {
  const v = valoresDeLaFila(fila);
  const control = (campo: CampoEnFila) => new FormControl<number | null>(
    v[campo], [Validators.min(0), noSeVacia(v[campo])]);
  return new FormGroup<FormularioEnFila>({
    valorCargado:        control('valorCargado'),
    unidadesCargadas:    control('unidadesCargadas'),
    valorAutorizado:     control('valorAutorizado'),
    unidadesAutorizadas: control('unidadesAutorizadas'),
    modoRecalculo:       new FormControl<ModoRecalculo | null>(null, [Validators.required]),
  });
}

