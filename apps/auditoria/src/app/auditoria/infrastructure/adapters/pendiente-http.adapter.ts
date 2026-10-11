import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PendienteRepository } from '../../domain/ports/pendiente.repository';
import { MotivoPendienteModel, ResolverPendienteRequest } from '../../domain/models/motivo-pendiente.model';
import { environment } from '@sura/environments';

@Injectable({ providedIn: 'root' })
export class PendienteHttpAdapter extends PendienteRepository {

  private readonly http    = inject(HttpClient);
  private readonly baseUrl = `${environment.apiGatewayUrl}/api/v1/cuentas`;

  override listarSinResolver(codigoCuenta: string): Observable<MotivoPendienteModel[]> {
    return this.http.get<MotivoPendienteModel[]>(
      `${this.baseUrl}/${codigoCuenta}/pendientes`
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
}
