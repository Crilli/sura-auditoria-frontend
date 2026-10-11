import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CuentaRepository } from '../../domain/ports/cuenta.repository';
import { CuentaMedicaModel } from '../../domain/models/cuenta-medica.model';

@Injectable({ providedIn: 'root' })
export class ConsultarCuentaUseCase {
  private readonly repository = inject(CuentaRepository);

  execute(codigo: string): Observable<CuentaMedicaModel> {
    return this.repository.consultar(codigo);
  }
}
