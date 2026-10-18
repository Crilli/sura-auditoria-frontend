import { Observable } from 'rxjs';
import { OffsetPage, OffsetRequest } from '../../../../../../../libs/data-access/http/src/lib/offset-page.model';
import {
  ResumenLineaModel, DetalleLineaModel, GuardarLineaRequest,
  FiltroLineasModel, ResumenFiltrosLineasModel, CambiosEnLoteRequest, ResultadoEnLoteModel
} from '../models/linea-cuenta.model';

/** Puerto del dominio para operaciones sobre las líneas de la cuenta médica. */
export abstract class LineaRepository {
  /**
   * ✅ Paginación por desplazamiento — SIEMPRE con pagina y tamano.
   *
   * Con desplazamiento y no con cursor porque el auditor tiene que poder ir a
   * una página cualquiera, y a la última: con cursor la única navegación
   * posible era «siguiente».
   */
  abstract listar(
    codigoCuenta: string,
    pagina: OffsetRequest,
    filtro?: FiltroLineasModel
  ): Observable<OffsetPage<ResumenLineaModel>>;

  /**
   * Con qué se puede acotar esta cuenta: afiliados, catálogos presentes y
   * extremos de fecha y de glosa.
   *
   * Va en su propia llamada porque recorre la cuenta entera —unos segundos en
   * las grandes— y no cambia al pasar de página: se pide una vez, en paralelo
   * con la primera página, para que la tabla pinte sin esperarlo.
   */
  abstract resumirFiltros(codigoCuenta: string): Observable<ResumenFiltrosLineasModel>;

  /**
   * La línea que sigue a esta en el orden en que se revisan (número de línea).
   *
   * `null` cuando era la última. Lo resuelve el servicio: antes se deducía aquí
   * pidiendo una página de una fila con la referencia como cursor, lo que daba
   * la siguiente **por identificador** y hacía que el avance saltara a una
   * línea cualquiera.
   */
  abstract consultarSiguiente(
    codigoCuenta: string,
    referencia: number
  ): Observable<ResumenLineaModel | null>;

  abstract consultarDetalle(codigoCuenta: string, referencia: number): Observable<DetalleLineaModel>;

  abstract guardar(
    codigoCuenta: string,
    referencia: number,
    solicitud: GuardarLineaRequest,
    auditor: string
  ): Observable<DetalleLineaModel>;

  /**
   * Aplica el mismo cambio a varias líneas.
   *
   * Devuelve el desenlace y no `void`: el resultado normal de una operación sobre veinte
   * líneas no es «bien» o «mal» sino «dieciocho sí y dos no, y estas son».
   */
  abstract aplicarEnLote(
    codigoCuenta: string,
    solicitud: CambiosEnLoteRequest,
    auditor: string
  ): Observable<ResultadoEnLoteModel>;
}
