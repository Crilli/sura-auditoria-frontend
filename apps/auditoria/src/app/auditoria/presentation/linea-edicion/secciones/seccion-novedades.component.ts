import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DetalleLineaModel } from '../../../domain/models/linea-cuenta.model';

/**
 * Novedades que levantó el motor de reglas sobre la línea. Son de solo lectura
 * en cualquier modo: las produce OHI, no el auditor.
 */
@Component({
  selector: 'sura-seccion-novedades',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './seccion-novedades.component.html',
  styleUrls:   ['./seccion-novedades.component.scss']
})
export class SeccionNovedadesComponent {
  readonly detalle = input.required<DetalleLineaModel>();
}
