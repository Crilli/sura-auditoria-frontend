import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LineaRepository } from '../../domain/ports/linea.repository';
import {
  ResumenLineaModel, DetalleLineaModel, GuardarLineaRequest,
  FiltroLineasModel, ResumenFiltrosLineasModel
} from '../../domain/models/linea-cuenta.model';
import { CursorPage, CursorRequest } from '../../../../../../../libs/data-access/http/src/lib/cursor-page.model';
import { environment } from '@sura/environments';

@Injectable({ providedIn: 'root' })
export class LineaHttpAdapter extends LineaRepository {

  private readonly http    = inject(HttpClient);
  private readonly baseUrl = `${environment.apiGatewayUrl}/api/v1/cuentas`;

  /**
   * ✅ Paginación KEYSET — SIEMPRE envía tamano.
   * Cursor undefined = primera página (no se envía el param).
   * PROHIBIDO: GET /lineas sin tamano.
   */
  override listar(
    codigoCuenta: string,
    cursorReq: CursorRequest,
    filtro?: FiltroLineasModel
  ): Observable<CursorPage<ResumenLineaModel>> {
    let params = new HttpParams().set('tamano', cursorReq.tamano.toString());
    if (cursorReq.cursor) {
      params = params.set('cursor', cursorReq.cursor);
    }
    // Cada criterio solo si tiene valor: así la URL del listado sin filtrar
    // sigue siendo la de siempre y no se mandan parámetros vacíos que el
    // servicio tendría que interpretar.
    for (const [clave, valor] of Object.entries(filtro ?? {})) {
      if (valor !== null && valor !== undefined && valor !== '') {
        params = params.set(clave, String(valor));
      }
    }
    return this.http.get<CursorPage<ResumenLineaModel>>(
      `${this.baseUrl}/${codigoCuenta}/lineas`,
      { params }
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
}
