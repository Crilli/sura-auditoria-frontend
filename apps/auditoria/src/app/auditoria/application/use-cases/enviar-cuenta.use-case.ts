import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CuentaRepository } from '../../domain/ports/cuenta.repository';
import { EnviarCuentaRequest, TiqueteResponse } from '../../domain/models/cuenta-medica.model';

@Injectable({ providedIn: 'root' })
export class EnviarCuentaUseCase {
  private readonly repository = inject(CuentaRepository);

  execute(codigo: string, solicitud: EnviarCuentaRequest, auditor: string): Observable<TiqueteResponse> {
    return this.repository.enviar(codigo, solicitud, auditor);
  }
}
