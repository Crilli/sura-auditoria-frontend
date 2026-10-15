import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CuentaRepository } from '../../domain/ports/cuenta.repository';
import { CuentaMedicaModel } from '../../domain/models/cuenta-medica.model';
import { CambioNovedadRequest } from '../../domain/models/linea-cuenta.model';

@Injectable({ providedIn: 'root' })
export class GuardarNovedadesCuentaUseCase {
  private readonly repository = inject(CuentaRepository);

  execute(
    codigo: string,
    versionEsperada: number,
    novedades: CambioNovedadRequest[],
    auditor: string
  ): Observable<CuentaMedicaModel> {
    return this.repository.guardarNovedades(codigo, versionEsperada, novedades, auditor);
  }
}
