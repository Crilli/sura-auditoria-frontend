import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { LineaRepository } from '../../domain/ports/linea.repository';
import { ResumenLineaModel } from '../../domain/models/linea-cuenta.model';

/**
 * Obtiene la línea que sigue a una dada dentro de la cuenta.
 *
 * Se apoya en la paginación keyset del servicio: pedir una página de tamaño 1
 * usando la referencia actual como cursor devuelve exactamente la línea siguiente.
 * Así el avance no depende de qué página tenga cargada la grilla ni obliga a
 * traer líneas de más — sirve igual si se entró directo por URL al detalle.
 *
 * Una página vacía significa que la línea actual es la última de la cuenta.
 */
@Injectable({ providedIn: 'root' })
export class ObtenerSiguienteLineaUseCase {
  private readonly repository = inject(LineaRepository);

  execute(codigoCuenta: string, referenciaActual: number): Observable<ResumenLineaModel | null> {
    return this.repository
      .listar(codigoCuenta, { cursor: String(referenciaActual), tamano: 1 })
      .pipe(map(pagina => pagina.elementos[0] ?? null));
  }
}
