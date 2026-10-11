import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CurrencyPipe }      from '@angular/common';
import { MatIconModule }     from '@angular/material/icon';
import { DetalleLineaModel } from '../../../domain/models/linea-cuenta.model';
import { MOTIVOS_BLOQUEO }   from '../../compartido/motivos-bloqueo';

/**
 * Detalle de la glosa: clasificación e importe arriba, el texto normativo
 * debajo, que es lo que acaba viendo el prestador.
 *
 * Sin `FormGroup`: las glosas se añaden y se quitan por filas y eso todavía no
 * se edita desde aquí. El importe total sí, pero vive en «Valores y
 * cantidades».
 */
@Component({
  selector: 'sura-seccion-glosa',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, MatIconModule],
  templateUrl: './seccion-glosa.component.html',
  styleUrls:   ['./seccion-glosa.component.scss']
})
export class SeccionGlosaComponent {
  readonly detalle   = input.required<DetalleLineaModel>();
  readonly esEdicion = input.required<boolean>();

  readonly motivos = MOTIVOS_BLOQUEO;
}
