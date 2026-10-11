import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { LineaRepository } from '../../domain/ports/linea.repository';
import { DetalleLineaModel } from '../../domain/models/linea-cuenta.model';

@Injectable({ providedIn: 'root' })
export class ConsultarDetalleLineaUseCase {
  private readonly repository = inject(LineaRepository);

  execute(codigoCuenta: string, referencia: number): Observable<DetalleLineaModel> {
    return this.repository.consultarDetalle(codigoCuenta, referencia);
  }
}
