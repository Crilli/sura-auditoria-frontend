import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { LineaRepository } from '../../domain/ports/linea.repository';
import { OffsetPage, OffsetRequest } from '../../../../../../../libs/data-access/http/src/lib/offset-page.model';
import { ResumenLineaModel, FiltroLineasModel } from '../../domain/models/linea-cuenta.model';

@Injectable({ providedIn: 'root' })
export class ListarLineasUseCase {
  private readonly repository = inject(LineaRepository);

  execute(
    codigoCuenta: string,
    pagina: OffsetRequest,
    filtro?: FiltroLineasModel
  ): Observable<OffsetPage<ResumenLineaModel>> {
    return this.repository.listar(codigoCuenta, pagina, filtro);
  }
}
