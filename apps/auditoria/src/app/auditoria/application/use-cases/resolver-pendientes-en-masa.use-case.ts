import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PendienteRepository } from '../../domain/ports/pendiente.repository';
import {
  ResolverEnMasaRequest, ResolucionMasivaModel
} from '../../domain/models/motivo-pendiente.model';

/**
 * Resolver varios motivos pendientes de una cuenta en una sola operación.
 *
 * No es un bucle sobre la resolución individual: el servicio usa el recurso del
 * sistema de registro que acepta la lista de motivos, que es **una** operación y
 * por tanto una sola readjudicación de la cuenta.
 */
@Injectable({ providedIn: 'root' })
export class ResolverPendientesEnMasaUseCase {
  private readonly repository = inject(PendienteRepository);

  execute(
    codigoCuenta: string,
    solicitud: ResolverEnMasaRequest,
    auditor: string
  ): Observable<ResolucionMasivaModel> {
    return this.repository.resolverEnMasa(codigoCuenta, solicitud, auditor);
  }
}
