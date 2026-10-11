import { Observable } from 'rxjs';
import { MotivoPendienteModel, ResolverPendienteRequest } from '../models/motivo-pendiente.model';

/** Puerto del dominio para operaciones sobre los pendientes de la cuenta médica. */
export abstract class PendienteRepository {
  abstract listarSinResolver(codigoCuenta: string): Observable<MotivoPendienteModel[]>;

  abstract resolver(
    codigoCuenta: string,
    idMotivo: number,
    solicitud: ResolverPendienteRequest,
    auditor: string
  ): Observable<void>;
}
