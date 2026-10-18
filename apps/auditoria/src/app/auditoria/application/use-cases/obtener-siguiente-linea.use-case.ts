import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { LineaRepository } from '../../domain/ports/linea.repository';
import { ResumenLineaModel } from '../../domain/models/linea-cuenta.model';

/**
 * Obtiene la línea que sigue a una dada dentro de la cuenta.
 *
 * Lo resuelve el servicio, en el orden en que se revisan las líneas: la de
 * número inmediatamente mayor. Antes se deducía aquí aprovechando la
 * paginación por clave —una página de una fila con la referencia actual como
 * cursor— y eso daba la siguiente **por identificador**, que no es la que el
 * auditor tiene delante: en la cuenta mayor, las primeras líneas por
 * identificador son las de número 2.106, 2.477 y 2.805.
 *
 * `null` significa que la línea actual era la última de la cuenta.
 */
@Injectable({ providedIn: 'root' })
export class ObtenerSiguienteLineaUseCase {
  private readonly repository = inject(LineaRepository);

  execute(codigoCuenta: string, referenciaActual: number): Observable<ResumenLineaModel | null> {
    return this.repository.consultarSiguiente(codigoCuenta, referenciaActual);
  }
}
