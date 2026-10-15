import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CuentaRepository } from '../../domain/ports/cuenta.repository';
import {
  CuentaMedicaModel, EjecutarAccionRequest, MotivoModel
} from '../../domain/models/cuenta-medica.model';

@Injectable({ providedIn: 'root' })
export class EjecutarAccionUseCase {
  private readonly repository = inject(CuentaRepository);

  execute(
    codigo: string,
    accion: string,
    solicitud: EjecutarAccionRequest,
    auditor: string
  ): Observable<CuentaMedicaModel> {
    return this.repository.ejecutarAccion(codigo, accion, solicitud, auditor);
  }

  motivos(ambito?: string): Observable<MotivoModel[]> {
    return this.repository.consultarMotivos(ambito);
  }
}
