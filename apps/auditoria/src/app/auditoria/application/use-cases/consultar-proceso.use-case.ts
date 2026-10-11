import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CuentaRepository } from '../../domain/ports/cuenta.repository';
import { EstadoProcesoModel } from '../../domain/models/estado-proceso.model';

@Injectable({ providedIn: 'root' })
export class ConsultarProcesoUseCase {
  private readonly repository = inject(CuentaRepository);

  execute(codigo: string): Observable<EstadoProcesoModel> {
    return this.repository.consultarProceso(codigo);
  }
}
