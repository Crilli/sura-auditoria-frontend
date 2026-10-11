import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DetalleLineaModel } from '../../../domain/models/linea-cuenta.model';

/**
 * Motivos pendientes de la línea. Los resueltos se siguen viendo, apagados:
 * saber qué ya se atendió es parte de la auditoría.
 */
@Component({
  selector: 'sura-seccion-pendientes',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './seccion-pendientes.component.html',
  styleUrls:   ['./seccion-pendientes.component.scss']
})
export class SeccionPendientesComponent {
  readonly detalle = input.required<DetalleLineaModel>();
}
