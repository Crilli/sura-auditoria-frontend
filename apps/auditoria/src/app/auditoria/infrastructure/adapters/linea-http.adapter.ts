import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LineaRepository } from '../../domain/ports/linea.repository';
import {
  ResumenLineaModel, DetalleLineaModel, GuardarLineaRequest,
  FiltroLineasModel, ResumenFiltrosLineasModel,
  CambiosEnLoteRequest, ResultadoEnLoteModel
} from '../../domain/models/linea-cuenta.model';
import { OffsetPage, OffsetRequest } from '../../../../../../../libs/data-access/http/src/lib/offset-page.model';
import { environment } from '@sura/environments';

@Injectable({ providedIn: 'root' })
export class LineaHttpAdapter extends LineaRepository {

  private readonly http    = inject(HttpClient);
  private readonly baseUrl = `${environment.apiGatewayUrl}/api/v1/cuentas`;

  /**
   * ✅ Paginación por DESPLAZAMIENTO — SIEMPRE envía pagina y tamano.
   *
   * `pagina` cuenta desde cero y el servicio la traduce a desplazamiento
   * multiplicando por el tamaño. PROHIBIDO: GET /lineas sin tamano.
   */
  override listar(
    codigoCuenta: string,
    peticion: OffsetRequest,
    filtro?: FiltroLineasModel
  ): Observable<OffsetPage<ResumenLineaModel>> {
    let params = new HttpParams()
      .set('tamano', peticion.tamano.toString())
      .set('pagina', Math.max(0, peticion.pagina).toString());
    if (peticion.orden) {
      params = params.set('orden', peticion.orden)
                     .set('sentido', peticion.sentido ?? 'asc');
    }
    // Cada criterio solo si tiene valor: así la URL del listado sin filtrar
    // sigue siendo la de siempre y no se mandan parámetros vacíos que el
    // servicio tendría que interpretar.
    // El servicio llama «secuencia» a lo que el modelo llama numeroLinea: es el único
    // criterio cuyo nombre no coincide, y traducirlo aquí evita renombrar el modelo.
    const nombreEnElServicio: Record<string, string> = { numeroLinea: 'secuencia' };
    for (const [clave, valor] of Object.entries(filtro ?? {})) {
      if (valor !== null && valor !== undefined && valor !== '') {
        params = params.set(nombreEnElServicio[clave] ?? clave, String(valor));
      }
    }
    return this.http.get<OffsetPage<ResumenLineaModel>>(
      `${this.baseUrl}/${codigoCuenta}/lineas`,
      { params }
    );
  }

  /** 204 ⇒ no hay siguiente: Angular lo entrega como `null`. */
  override consultarSiguiente(
    codigoCuenta: string,
    referencia: number
  ): Observable<ResumenLineaModel | null> {
    return this.http.get<ResumenLineaModel | null>(
      `${this.baseUrl}/${codigoCuenta}/lineas/${referencia}/siguiente`
    );
  }

  override resumirFiltros(codigoCuenta: string): Observable<ResumenFiltrosLineasModel> {
    return this.http.get<ResumenFiltrosLineasModel>(
      `${this.baseUrl}/${codigoCuenta}/lineas/filtros`
    );
  }

  override consultarDetalle(codigoCuenta: string, referencia: number): Observable<DetalleLineaModel> {
    return this.http.get<DetalleLineaModel>(
      `${this.baseUrl}/${codigoCuenta}/lineas/${referencia}`
    );
  }

  override guardar(
    codigoCuenta: string,
    referencia: number,
    solicitud: GuardarLineaRequest,
    auditor: string
  ): Observable<DetalleLineaModel> {
    const headers = new HttpHeaders({ 'X-Auditor': auditor });
    return this.http.patch<DetalleLineaModel>(
      `${this.baseUrl}/${codigoCuenta}/lineas/${referencia}`,
      solicitud,
      { headers }
    );
  }

  /**
   * POST /api/v1/cuentas/{codigo}/lineas/lote
   *
   * Responde **200 también cuando es parcial**: la petición fue correcta y algo se aplicó
   * —y es irreversible—, así que un código de error haría que la pantalla diera por no hecho
   * lo que sí ocurrió. El desenlace y los fallos por línea vienen en el cuerpo.
   */
  override aplicarEnLote(
    codigoCuenta: string,
    solicitud: CambiosEnLoteRequest,
    auditor: string
  ): Observable<ResultadoEnLoteModel> {
    return this.http.post<ResultadoEnLoteModel>(
      `${this.baseUrl}/${codigoCuenta}/lineas/lote`,
      solicitud,
      { headers: new HttpHeaders({ 'X-Auditor': auditor }) }
    );
  }
}
