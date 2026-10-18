import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CuentaRepository } from '../../domain/ports/cuenta.repository';
import {
  AccionesDisponiblesModel, CuentaMedicaModel, EnviarCuentaRequest, TiqueteResponse,
  MotivoModel, EjecutarAccionRequest, HitoModel, FiltroCuentasModel, ResumenCuentaModel, VersionCuentaModel, FotoVersionModel
} from '../../domain/models/cuenta-medica.model';
import { OffsetPage } from '../../../../../../../libs/data-access/http/src/lib/offset-page.model';
import { CambioNovedadRequest } from '../../domain/models/linea-cuenta.model';
import { EstadoProcesoModel } from '../../domain/models/estado-proceso.model';
import { environment } from '@sura/environments';

@Injectable({ providedIn: 'root' })
export class CuentaHttpAdapter extends CuentaRepository {

  private readonly http    = inject(HttpClient);
  private readonly baseUrl = `${environment.apiGatewayUrl}/api/v1/cuentas`;

  override consultar(codigo: string): Observable<CuentaMedicaModel> {
    return this.http.get<CuentaMedicaModel>(`${this.baseUrl}/${codigo}`);
  }

  override consultarAcciones(codigo: string): Observable<AccionesDisponiblesModel> {
    return this.http.get<AccionesDisponiblesModel>(`${this.baseUrl}/${codigo}/acciones`);
  }

  override enviar(
    codigo: string,
    solicitud: EnviarCuentaRequest,
    auditor: string
  ): Observable<TiqueteResponse> {
    const headers = new HttpHeaders({ 'X-Auditor': auditor });
    return this.http.post<TiqueteResponse>(
      `${this.baseUrl}/${codigo}/enviar`,
      solicitud,
      { headers }
    );
  }

  override guardarNovedades(
    codigo: string,
    versionEsperada: number,
    novedades: CambioNovedadRequest[],
    auditor: string
  ): Observable<CuentaMedicaModel> {
    const headers = new HttpHeaders({ 'X-Auditor': auditor });
    return this.http.patch<CuentaMedicaModel>(
      `${this.baseUrl}/${codigo}/novedades`,
      { versionEsperada, novedades },
      { headers }
    );
  }

  override ejecutarAccion(
    codigo: string,
    accion: string,
    solicitud: EjecutarAccionRequest,
    auditor: string
  ): Observable<CuentaMedicaModel> {
    const headers = new HttpHeaders({ 'X-Auditor': auditor });
    return this.http.post<CuentaMedicaModel>(
      `${this.baseUrl}/${codigo}/acciones/${accion}`,
      solicitud,
      { headers }
    );
  }

  override consultarMotivos(ambito?: string): Observable<MotivoModel[]> {
    const url = `${environment.apiGatewayUrl}/api/v1/catalogos/motivos`;
    return this.http.get<MotivoModel[]>(ambito ? `${url}?ambito=${ambito}` : url);
  }

  override consultarProceso(codigo: string): Observable<EstadoProcesoModel> {
    return this.http.get<EstadoProcesoModel>(`${this.baseUrl}/${codigo}/proceso`);
  }

  // SSE: Server-Sent Events — flujo de progreso en tiempo real
  override transmitirProceso(codigo: string): Observable<EstadoProcesoModel> {
    return new Observable(observer => {
      const url = `${this.baseUrl}/${codigo}/proceso/flujo`;
      const es   = new EventSource(url);
      es.onmessage = e => observer.next(JSON.parse(e.data) as EstadoProcesoModel);
      es.onerror   = e => { observer.error(e); es.close(); };
      return () => es.close();
    });
  }

  /**
   * GET /api/v1/cuentas/{codigo}/historia
   *
   * Lista vacía si la cuenta no se ha movido: eso es una respuesta, no un error.
   */
  override consultarHistoria(codigoCuenta: string): Observable<HitoModel[]> {
    return this.http.get<HitoModel[]>(`${this.baseUrl}/${codigoCuenta}/historia`);
  }

  /**
   * GET /api/v1/cuentas?factura=&radicado=&pagina=&tamano=
   *
   * Cada criterio solo si trae valor: un parámetro vacío el servicio lo trataría como «sin
   * criterio» y respondería 400.
   */
  override buscar(
    filtro: FiltroCuentasModel,
    pagina: number,
    tamano: number
  ): Observable<OffsetPage<ResumenCuentaModel>> {
    let params = new HttpParams()
      .set('pagina', Math.max(0, pagina).toString())
      .set('tamano', tamano.toString());
    if (filtro.factura?.trim())  params = params.set('factura', filtro.factura.trim());
    if (filtro.radicado?.trim()) params = params.set('radicado', filtro.radicado.trim());
    return this.http.get<OffsetPage<ResumenCuentaModel>>(this.baseUrl, { params });
  }

  override consultarVersiones(codigoCuenta: string): Observable<VersionCuentaModel[]> {
    return this.http.get<VersionCuentaModel[]>(`${this.baseUrl}/${codigoCuenta}/versiones`);
  }

  override consultarVersion(codigoCuenta: string, numero: number): Observable<FotoVersionModel> {
    return this.http.get<FotoVersionModel>(`${this.baseUrl}/${codigoCuenta}/versiones/${numero}`);
  }
}
