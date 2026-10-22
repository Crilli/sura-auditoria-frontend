import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FotoVersionModel } from '../../../domain/models/cuenta-medica.model';
import { EstadoEnOhiPipe, TextoEstadoPipe } from '../estado-cuenta.pipe';

/**
 * La foto de una versión: su cabecera, sus seis importes y por dónde pasó en esa vuelta.
 *
 * ## Por qué es un componente aparte
 * Se pinta en dos sitios que tienen que decir lo mismo: el diálogo de vista rápida del buscador
 * (BUS-20) y la vista de la cuenta cuando se navega a una versión (BTN-12). Si cada uno la
 * escribiera a su manera, el día que un importe se rotulara distinto en uno de los dos el
 * auditor no sabría cuál creer.
 *
 * Solo pinta lo que recibe: no consulta, no tiene estado y no sabe dónde está. El aviso de que
 * es una foto y no la cuenta actual lo pone quien la enseña, porque cada sitio lo dice con sus
 * palabras —en el diálogo es una nota; en la vista de la cuenta, además, la vuelta a la actual—.
 *
 * Un importe que no viene es una raya, nunca un cero: en una foto, cero es un dato.
 */
@Component({
  selector: 'sura-foto-version',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, DatePipe, MatTooltipModule, TextoEstadoPipe, EstadoEnOhiPipe],
  templateUrl: './foto-version.component.html',
  styleUrls: ['./foto-version.component.scss'],
})
export class FotoVersionComponent {
  readonly foto = input.required<FotoVersionModel>();
}
