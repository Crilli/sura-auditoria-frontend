import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule }     from '@angular/material/icon';
import { DetalleLineaModel } from '../../../domain/models/linea-cuenta.model';
import { MOTIVOS_BLOQUEO }   from '../../compartido/motivos-bloqueo';

/**
 * Diagnósticos CIE-10 de la línea.
 *
 * Sin `FormGroup`: es una lista y añadir o quitar filas necesita un editor que
 * todavía no existe; la nota del modo edición lo dice en lugar de dejar la
 * sección muda.
 */
@Component({
  selector: 'sura-seccion-diagnosticos',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  templateUrl: './seccion-diagnosticos.component.html',
  // Solo necesita salir del flujo: la tabla es el patrón global
  // `.sura-tabla-detalle` y los segundos renglones, `.sura-dato-secundario`.
  styles: [`
    :host { display: contents; }
    .sura-nota { margin: 0 0 var(--sura-espacio-3); }
  `]
})
export class SeccionDiagnosticosComponent {
  readonly detalle   = input.required<DetalleLineaModel>();
  readonly esEdicion = input.required<boolean>();

  readonly motivos = MOTIVOS_BLOQUEO;
}
