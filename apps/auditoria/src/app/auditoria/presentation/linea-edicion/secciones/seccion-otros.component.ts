import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ReactiveFormsModule }  from '@angular/forms';
import { MatFormFieldModule }   from '@angular/material/form-field';
import { MatInputModule }       from '@angular/material/input';
import { DetalleLineaModel }    from '../../../domain/models/linea-cuenta.model';
import { CampoBloqueadoComponent } from '../../compartido/campo-bloqueado/campo-bloqueado.component';
import { MOTIVOS_BLOQUEO }      from '../../compartido/motivos-bloqueo';
import { LineaFormGroup }       from '../linea-form';

/** Datos de la atención y del siniestro. */
@Component({
  selector: 'sura-seccion-otros',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule, MatFormFieldModule, MatInputModule, CampoBloqueadoComponent
  ],
  templateUrl: './seccion-otros.component.html',
  styles: [':host { display: contents; }']
})
export class SeccionOtrosComponent {
  readonly detalle   = input.required<DetalleLineaModel>();
  /** Ver la nota del mismo `input` en `FichaIdentidadComponent`. */
  readonly form      = input.required<LineaFormGroup>();
  readonly esEdicion = input.required<boolean>();

  readonly motivos = MOTIVOS_BLOQUEO;
}
