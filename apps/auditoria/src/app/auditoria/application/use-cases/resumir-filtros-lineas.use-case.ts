import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { LineaRepository } from '../../domain/ports/linea.repository';
import { ResumenFiltrosLineasModel } from '../../domain/models/linea-cuenta.model';

/**
 * Con qué se puede acotar el listado de líneas de una cuenta.
 *
 * Alimenta los controles de búsqueda con lo que la cuenta tiene de verdad —sus
 * afiliados, los catálogos que aparecen, los extremos de fecha y de glosa— en
 * vez de con una lista fija. Así el filtro no ofrece opciones que no devolverían
 * ninguna fila, y sigue siendo correcto si mañana aparece un catálogo nuevo.
 */
@Injectable({ providedIn: 'root' })
export class ResumirFiltrosLineasUseCase {
  private readonly repository = inject(LineaRepository);

  execute(codigoCuenta: string): Observable<ResumenFiltrosLineasModel> {
    return this.repository.resumirFiltros(codigoCuenta);
  }
}
