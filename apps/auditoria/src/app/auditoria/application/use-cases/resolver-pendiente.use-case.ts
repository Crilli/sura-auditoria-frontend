import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PendienteRepository } from '../../domain/ports/pendiente.repository';
import { ResolverPendienteRequest } from '../../domain/models/motivo-pendiente.model';

@Injectable({ providedIn: 'root' })
export class ResolverPendienteUseCase {
  private readonly repository = inject(PendienteRepository);

  execute(codigoCuenta: string, idMotivo: number, solicitud: ResolverPendienteRequest, auditor: string): Observable<void> {
    return this.repository.resolver(codigoCuenta, idMotivo, solicitud, auditor);
  }
}
