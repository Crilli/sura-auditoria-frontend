import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ReactiveFormsModule }  from '@angular/forms';
import { MatFormFieldModule }   from '@angular/material/form-field';
import { MatInputModule }       from '@angular/material/input';
import { DetalleLineaModel }    from '../../../domain/models/linea-cuenta.model';
import { CampoBloqueadoComponent } from '../../compartido/campo-bloqueado/campo-bloqueado.component';
import { MOTIVOS_BLOQUEO }      from '../../compartido/motivos-bloqueo';
import { LineaFormGroup }       from '../linea-form';

/** Qué se le prestó al afiliado en la línea. */
@Component({
  selector: 'sura-seccion-prestacion',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule, MatFormFieldModule, MatInputModule, CampoBloqueadoComponent
  ],
  templateUrl: './seccion-prestacion.component.html',
  // La rejilla es el patrón global `.sura-ficha-datos`: aquí solo hace falta
  // que el host salga del flujo.
  styles: [':host { display: contents; }']
})
export class SeccionPrestacionComponent {
  readonly detalle   = input.required<DetalleLineaModel>();
  /** Ver la nota del mismo `input` en `FichaIdentidadComponent`. */
  readonly form      = input.required<LineaFormGroup>();
  readonly esEdicion = input.required<boolean>();

  readonly motivos = MOTIVOS_BLOQUEO;
}
