import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CuentaRepository } from '../../domain/ports/cuenta.repository';
import { AccionesDisponiblesModel, CuentaMedicaModel, EnviarCuentaRequest, TiqueteResponse } from '../../domain/models/cuenta-medica.model';
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
}
