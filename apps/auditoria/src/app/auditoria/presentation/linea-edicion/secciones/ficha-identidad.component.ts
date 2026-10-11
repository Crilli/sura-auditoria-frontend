import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ReactiveFormsModule }  from '@angular/forms';
import { MatFormFieldModule }   from '@angular/material/form-field';
import { MatInputModule }       from '@angular/material/input';
import { DetalleLineaModel }    from '../../../domain/models/linea-cuenta.model';
import { CampoBloqueadoComponent } from '../../compartido/campo-bloqueado/campo-bloqueado.component';
import { MOTIVOS_BLOQUEO }      from '../../compartido/motivos-bloqueo';
import { LineaFormGroup }       from '../linea-form';

/**
 * Ficha de identidad de la línea: lo que la identifica y no debe poder
 * ocultarse, así que se queda fuera del acordeón.
 *
 * `display: contents` en el host para que la rejilla quede exactamente donde
 * estaba cuando la pintaba el contenedor: el elemento del componente
 * desaparece del flujo y no se interpone entre el `<form>` y la `<dl>`.
 */
@Component({
  selector: 'sura-ficha-identidad',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, CampoBloqueadoComponent
  ],
  templateUrl: './ficha-identidad.component.html',
  styles: [':host { display: contents; }']
})
export class FichaIdentidadComponent {
  readonly detalle   = input.required<DetalleLineaModel>();
  /**
   * El formulario del contenedor. Hace falta repetir aquí el `[formGroup]`:
   * `formControlName` resuelve su contenedor por inyección con `@Host()`, que
   * se detiene en el elemento anfitrión de este componente, así que no ve el
   * `[formGroup]` del `<form>` del padre por mucho que esté por encima en el
   * DOM.
   */
  readonly form      = input.required<LineaFormGroup>();
  readonly esEdicion = input.required<boolean>();

  readonly motivos = MOTIVOS_BLOQUEO;
}
