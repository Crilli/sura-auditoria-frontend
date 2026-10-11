import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CuentaRepository } from '../../domain/ports/cuenta.repository';
import { AccionesDisponiblesModel } from '../../domain/models/cuenta-medica.model';

/**
 * Consulta las acciones disponibles de una cuenta.
 *
 * Va separado de `ConsultarCuentaUseCase` porque el backend las expone en otro
 * endpoint: resolverlas cuesta segundos y no debe retrasar el pintado de la cabecera.
 */
@Injectable({ providedIn: 'root' })
export class ConsultarAccionesUseCase {
  private readonly repository = inject(CuentaRepository);

  execute(codigo: string): Observable<AccionesDisponiblesModel> {
    return this.repository.consultarAcciones(codigo);
  }
}
