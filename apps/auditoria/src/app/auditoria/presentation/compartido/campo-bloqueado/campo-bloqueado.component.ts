import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule }    from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

/**
 * Candado del dato que no se edita, con el motivo en el tooltip.
 *
 * A propósito NO se pinta como un campo deshabilitado —input apagado, fondo
 * gris—: eso se lee como un fallo de la pantalla o como un permiso que falta,
 * y aquí no falta nada; es que ese dato no se escribe nunca desde ahí.
 *
 * Se saca a componente porque el patrón aparece una docena de veces en el
 * detalle de una línea —y ahora repartido entre varios hijos—: en cuanto el
 * icono, la etiqueta accesible o la posición del tooltip se escriben a mano en
 * cada sitio, dejan de coincidir.
 *
 * Sin estilos propios: `.sura-candado` es global (`_utilidades.scss`), igual
 * que antes de extraer el componente, así que esta pieza no suma nada al
 * presupuesto `anyComponentStyle`.
 */
@Component({
  selector: 'sura-campo-bloqueado',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, MatTooltipModule],
  template: `
    <mat-icon class="sura-candado" aria-label="No editable"
              [matTooltip]="motivo()"
              matTooltipPosition="above" tabindex="0">lock</mat-icon>
  `
})
export class CampoBloqueadoComponent {
  /**
   * Por qué no se edita. Obligatorio: un candado sin motivo es exactamente el
   * campo apagado y sin explicación que este patrón viene a evitar.
   */
  readonly motivo = input.required<string>();
}
