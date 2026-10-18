import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PendienteRepository } from '../../domain/ports/pendiente.repository';
import { MotivoPendienteModel, FiltroBloqueo } from '../../domain/models/motivo-pendiente.model';
import { CursorPage, CursorRequest } from '../../../../../../../libs/data-access/http/src/lib/cursor-page.model';

@Injectable({ providedIn: 'root' })
export class ListarPendientesUseCase {
  private readonly repository = inject(PendienteRepository);

  execute(
    codigoCuenta: string,
    cursor: CursorRequest,
    motivo?: string | null,
    bloqueo?: FiltroBloqueo,
    incluirResueltos?: boolean
  ): Observable<CursorPage<MotivoPendienteModel>> {
    return this.repository.listarSinResolver(codigoCuenta, cursor, motivo, bloqueo,
                                             incluirResueltos);
  }
}
