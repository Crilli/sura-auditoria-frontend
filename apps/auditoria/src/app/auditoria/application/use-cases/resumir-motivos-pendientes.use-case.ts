import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PendienteRepository } from '../../domain/ports/pendiente.repository';
import { ResumenMotivoModel } from '../../domain/models/motivo-pendiente.model';

@Injectable({ providedIn: 'root' })
export class ResumirMotivosPendientesUseCase {
  private readonly repository = inject(PendienteRepository);

  execute(codigoCuenta: string): Observable<ResumenMotivoModel[]> {
    return this.repository.resumirMotivos(codigoCuenta);
  }
}
