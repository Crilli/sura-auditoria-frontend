import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PendienteRepository } from '../../domain/ports/pendiente.repository';
import {
  MotivoPendienteModel, ResumenMotivoModel, ResolverPendienteRequest, FiltroBloqueo,
  ResolverEnMasaRequest, ResolucionMasivaModel,
  MotivoPendienteCatalogoModel, AgregarPendienteRequest
} from '../../domain/models/motivo-pendiente.model';
import { CursorPage, CursorRequest } from '../../../../../../../libs/data-access/http/src/lib/cursor-page.model';
import { environment } from '@sura/environments';

@Injectable({ providedIn: 'root' })
export class PendienteHttpAdapter extends PendienteRepository {

  private readonly http    = inject(HttpClient);
  private readonly baseUrl = `${environment.apiGatewayUrl}/api/v1/cuentas`;

  /**
   * ✅ Paginación KEYSET — SIEMPRE envía tamano.
   * Cursor undefined = primera página (no se envía el param).
   * PROHIBIDO: GET /pendientes sin tamano.
   */
  override listarSinResolver(
    codigoCuenta: string,
    cursorReq: CursorRequest,
    motivo?: string | null,
    bloqueo?: FiltroBloqueo,
    incluirResueltos?: boolean
  ): Observable<CursorPage<MotivoPendienteModel>> {
    let params = new HttpParams().set('tamano', cursorReq.tamano.toString());
    if (cursorReq.cursor) params = params.set('cursor', cursorReq.cursor);
    if (motivo)           params = params.set('motivo', motivo);
    // 'TODOS' es el valor por omisión del servicio: no se manda, para que la URL
    // de la vista sin filtrar sea la misma de siempre.
    if (bloqueo && bloqueo !== 'TODOS') params = params.set('bloqueo', bloqueo);
    // Mirar atrás es explícito, y por lo mismo: sin el parámetro, la URL de siempre.
    if (incluirResueltos) params = params.set('incluirResueltos', 'true');

    return this.http.get<CursorPage<MotivoPendienteModel>>(
      `${this.baseUrl}/${codigoCuenta}/pendientes`,
      { params }
    );
  }

  override resumirMotivos(codigoCuenta: string): Observable<ResumenMotivoModel[]> {
    return this.http.get<ResumenMotivoModel[]>(
      `${this.baseUrl}/${codigoCuenta}/pendientes/motivos`
    );
  }

  /**
   * Una sola petición, sin sondeo: el servicio espera a que la operación del
   * sistema de registro termine y contesta con el desenlace. Si se cansa de
   * esperar responde 202 con `desenlace: 'EN_CURSO'`, que Angular entrega por el
   * mismo canal de éxito — hay que mirar el desenlace, no el código.
   */
  override resolverEnMasa(
    codigoCuenta: string,
    solicitud: ResolverEnMasaRequest,
    auditor: string
  ): Observable<ResolucionMasivaModel> {
    const headers = new HttpHeaders({ 'X-Auditor': auditor });
    return this.http.post<ResolucionMasivaModel>(
      `${this.baseUrl}/${codigoCuenta}/pendientes/resolver`,
      solicitud,
      { headers }
    );
  }

  override seguirResolucion(
    codigoCuenta: string,
    referencias: string[]
  ): Observable<ResolucionMasivaModel> {
    // 202 mientras siga en curso y 200 al terminar: los dos son éxito para HttpClient,
    // y el desenlace va en el cuerpo.
    return this.http.get<ResolucionMasivaModel>(
      `${this.baseUrl}/${codigoCuenta}/pendientes/resoluciones`,
      { params: { referencias: referencias.join(',') } }
    );
  }

  override resolver(
    codigoCuenta: string,
    idMotivo: number,
    solicitud: ResolverPendienteRequest,
    auditor: string
  ): Observable<void> {
    const headers = new HttpHeaders({ 'X-Auditor': auditor });
    return this.http.post<void>(
      `${this.baseUrl}/${codigoCuenta}/pendientes/${idMotivo}/resolver`,
      solicitud,
      { headers }
    );
  }

  /**
   * GET /api/v1/catalogos/motivos-pendiente
   *
   * Ruta de catálogo, no de cuenta: el catálogo es el mismo para todas. Y es distinta de
   * `/catalogos/motivos`, que es el de desfinalización.
   */
  override catalogoDeMotivos(): Observable<MotivoPendienteCatalogoModel[]> {
    return this.http.get<MotivoPendienteCatalogoModel[]>(
      `${environment.apiGatewayUrl}/api/v1/catalogos/motivos-pendiente`);
  }

  /** POST /api/v1/cuentas/{codigo}/pendientes/agregar — responde 204, sin cuerpo. */
  override agregarMotivo(
    codigoCuenta: string,
    solicitud: AgregarPendienteRequest,
    auditor: string
  ): Observable<void> {
    return this.http.post<void>(
      `${this.baseUrl}/${codigoCuenta}/pendientes/agregar`,
      solicitud,
      { headers: new HttpHeaders({ 'X-Auditor': auditor }) }
    );
  }
}
