import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PendienteRepository } from '../../domain/ports/pendiente.repository';
import { ResolucionMasivaModel } from '../../domain/models/motivo-pendiente.model';

/**
 * Preguntar cómo va una resolución masiva lanzada antes (OPE-06).
 *
 * No relanza nada: solo lee. Por eso se puede repetir cuantas veces haga falta, al contrario
 * que la resolución, que no es idempotente.
 */
@Injectable({ providedIn: 'root' })
export class SeguirResolucionUseCase {
  private readonly repository = inject(PendienteRepository);

  execute(codigoCuenta: string, referencias: string[]): Observable<ResolucionMasivaModel> {
    return this.repository.seguirResolucion(codigoCuenta, referencias);
  }
}
