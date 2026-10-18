import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { LineaRepository } from '../../domain/ports/linea.repository';
import { CambiosEnLoteRequest, ResultadoEnLoteModel }
  from '../../domain/models/linea-cuenta.model';

/** Aplica el mismo cambio —glosa o novedad— a las líneas marcadas en la grilla. */
@Injectable({ providedIn: 'root' })
export class AplicarCambiosEnLoteUseCase {
  private readonly repository = inject(LineaRepository);

  execute(
    codigoCuenta: string,
    solicitud: CambiosEnLoteRequest,
    auditor: string
  ): Observable<ResultadoEnLoteModel> {
    return this.repository.aplicarEnLote(codigoCuenta, solicitud, auditor);
  }
}
