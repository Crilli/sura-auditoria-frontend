import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { LineaRepository } from '../../domain/ports/linea.repository';
import { DetalleLineaModel, GuardarLineaRequest } from '../../domain/models/linea-cuenta.model';

@Injectable({ providedIn: 'root' })
export class GuardarLineaUseCase {
  private readonly repository = inject(LineaRepository);

  execute(codigoCuenta: string, referencia: number, solicitud: GuardarLineaRequest, auditor: string): Observable<DetalleLineaModel> {
    return this.repository.guardar(codigoCuenta, referencia, solicitud, auditor);
  }
}
