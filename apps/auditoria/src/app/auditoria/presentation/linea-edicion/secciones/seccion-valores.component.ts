import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ReactiveFormsModule }  from '@angular/forms';
import { MatFormFieldModule }   from '@angular/material/form-field';
import { MatInputModule }       from '@angular/material/input';
import { MatCheckboxModule }    from '@angular/material/checkbox';
import { DetalleLineaModel }    from '../../../domain/models/linea-cuenta.model';
import { CampoBloqueadoComponent } from '../../compartido/campo-bloqueado/campo-bloqueado.component';
import { MOTIVOS_BLOQUEO }      from '../../compartido/motivos-bloqueo';
import { LineaFormGroup }       from '../linea-form';

/**
 * Valores y cantidades de la línea.
 *
 * La misma tabla sirve para leer y para editar: el auditor compara el cargado
 * con el autorizado en la fila en la que los está mirando, y sacar esos cinco
 * campos a un formulario aparte obligaba a recordar de memoria lo que acababa
 * de leer.
 */
@Component({
  selector: 'sura-seccion-valores',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CurrencyPipe, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatCheckboxModule, CampoBloqueadoComponent
  ],
  templateUrl: './seccion-valores.component.html',
  styleUrls:   ['./seccion-valores.component.scss']
})
export class SeccionValoresComponent {
  readonly detalle   = input.required<DetalleLineaModel>();
  /** Ver la nota del mismo `input` en `FichaIdentidadComponent`. */
  readonly form      = input.required<LineaFormGroup>();
  readonly esEdicion = input.required<boolean>();

  readonly motivos = MOTIVOS_BLOQUEO;
}
