import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { LineaRepository } from '../../domain/ports/linea.repository';
import { CursorPage, CursorRequest } from '../../../../../../../libs/data-access/http/src/lib/cursor-page.model';
import { ResumenLineaModel, FiltroLineasModel } from '../../domain/models/linea-cuenta.model';

@Injectable({ providedIn: 'root' })
export class ListarLineasUseCase {
  private readonly repository = inject(LineaRepository);

  execute(
    codigoCuenta: string,
    cursor: CursorRequest,
    filtro?: FiltroLineasModel
  ): Observable<CursorPage<ResumenLineaModel>> {
    return this.repository.listar(codigoCuenta, cursor, filtro);
  }
}
