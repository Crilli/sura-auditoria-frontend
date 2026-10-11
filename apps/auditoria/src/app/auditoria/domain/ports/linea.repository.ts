import { Observable } from 'rxjs';
import { CursorPage, CursorRequest } from '../../../../../../../libs/data-access/http/src/lib/cursor-page.model';
import { ResumenLineaModel, DetalleLineaModel, GuardarLineaRequest } from '../models/linea-cuenta.model';

/** Puerto del dominio para operaciones sobre las líneas de la cuenta médica. */
export abstract class LineaRepository {
  /**
   * ✅ Paginación Keyset — SIEMPRE con cursor y tamano.
   */
  abstract listar(
    codigoCuenta: string,
    cursor: CursorRequest
  ): Observable<CursorPage<ResumenLineaModel>>;

  abstract consultarDetalle(codigoCuenta: string, referencia: number): Observable<DetalleLineaModel>;

  abstract guardar(
    codigoCuenta: string,
    referencia: number,
    solicitud: GuardarLineaRequest,
    auditor: string
  ): Observable<DetalleLineaModel>;
}
