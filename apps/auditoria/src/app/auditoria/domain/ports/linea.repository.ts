import { Observable } from 'rxjs';
import { CursorPage, CursorRequest } from '../../../../../../../libs/data-access/http/src/lib/cursor-page.model';
import {
  ResumenLineaModel, DetalleLineaModel, GuardarLineaRequest,
  FiltroLineasModel, ResumenFiltrosLineasModel
} from '../models/linea-cuenta.model';

/** Puerto del dominio para operaciones sobre las líneas de la cuenta médica. */
export abstract class LineaRepository {
  /**
   * ✅ Paginación Keyset — SIEMPRE con cursor y tamano.
   */
  abstract listar(
    codigoCuenta: string,
    cursor: CursorRequest,
    filtro?: FiltroLineasModel
  ): Observable<CursorPage<ResumenLineaModel>>;

  /**
   * Con qué se puede acotar esta cuenta: afiliados, catálogos presentes y
   * extremos de fecha y de glosa.
   *
   * Va en su propia llamada porque recorre la cuenta entera —unos segundos en
   * las grandes— y no cambia al pasar de página: se pide una vez, en paralelo
   * con la primera página, para que la tabla pinte sin esperarlo.
   */
  abstract resumirFiltros(codigoCuenta: string): Observable<ResumenFiltrosLineasModel>;

  abstract consultarDetalle(codigoCuenta: string, referencia: number): Observable<DetalleLineaModel>;

  abstract guardar(
    codigoCuenta: string,
    referencia: number,
    solicitud: GuardarLineaRequest,
    auditor: string
  ): Observable<DetalleLineaModel>;
}
