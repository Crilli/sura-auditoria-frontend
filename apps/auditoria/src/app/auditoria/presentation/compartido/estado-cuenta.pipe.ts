import { Pipe, PipeTransform } from '@angular/core';
import { estadoEnOhi, textoDeEstado } from '../../domain/models/estado-cuenta.model';

/**
 * El estado de una cuenta o de una versión, en palabras.
 *
 * Es un pipe y no un método de cada componente porque el estado sale en cinco sitios —el
 * buscador, sus versiones, la cabecera de la cuenta, su historia y la foto de una versión— y
 * todos tienen que decirlo igual: esa era justo la queja, dos estados que no se hablaban.
 */
@Pipe({ name: 'textoEstado', standalone: true })
export class TextoEstadoPipe implements PipeTransform {
  transform(estado: string | null | undefined): string {
    return textoDeEstado(estado);
  }
}

/**
 * La ayuda con la palabra de OHI («En OHI: Pendiente»), para un `matTooltip`.
 * Vacía cuando no aporta nada, y una ayuda vacía no se enseña.
 */
@Pipe({ name: 'estadoEnOhi', standalone: true })
export class EstadoEnOhiPipe implements PipeTransform {
  transform(estado: string | null | undefined): string {
    const palabra = estadoEnOhi(estado);
    return palabra ? `En OHI: ${palabra}` : '';
  }
}
