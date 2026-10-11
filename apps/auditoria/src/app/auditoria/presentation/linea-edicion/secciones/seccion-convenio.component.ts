import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ReactiveFormsModule }  from '@angular/forms';
import { MatFormFieldModule }   from '@angular/material/form-field';
import { MatInputModule }       from '@angular/material/input';
import { DetalleLineaModel }    from '../../../domain/models/linea-cuenta.model';
import { CampoBloqueadoComponent } from '../../compartido/campo-bloqueado/campo-bloqueado.component';
import { MOTIVOS_BLOQUEO }      from '../../compartido/motivos-bloqueo';
import { LineaFormGroup }       from '../linea-form';

/**
 * Tarifas y contrato que aplican a la línea. Los códigos de tarifario no se
 * editan: son de catálogo y un texto libre dejaría escribir uno que no existe.
 */
@Component({
  selector: 'sura-seccion-convenio',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule, MatFormFieldModule, MatInputModule, CampoBloqueadoComponent
  ],
  templateUrl: './seccion-convenio.component.html',
  styles: [':host { display: contents; }']
})
export class SeccionConvenioComponent {
  readonly detalle   = input.required<DetalleLineaModel>();
  /** Ver la nota del mismo `input` en `FichaIdentidadComponent`. */
  readonly form      = input.required<LineaFormGroup>();
  readonly esEdicion = input.required<boolean>();

  readonly motivos = MOTIVOS_BLOQUEO;
}
