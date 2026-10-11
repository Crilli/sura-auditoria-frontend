import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PendienteRepository } from '../../domain/ports/pendiente.repository';
import { MotivoPendienteModel } from '../../domain/models/motivo-pendiente.model';

@Injectable({ providedIn: 'root' })
export class ListarPendientesUseCase {
  private readonly repository = inject(PendienteRepository);

  execute(codigoCuenta: string): Observable<MotivoPendienteModel[]> {
    return this.repository.listarSinResolver(codigoCuenta);
  }
}
