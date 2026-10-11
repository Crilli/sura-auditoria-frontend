import { Observable } from 'rxjs';
import { AccionesDisponiblesModel, CuentaMedicaModel, EnviarCuentaRequest, TiqueteResponse } from '../models/cuenta-medica.model';
import { EstadoProcesoModel } from '../models/estado-proceso.model';

/** Puerto del dominio para operaciones sobre la cuenta médica (cabecera). */
export abstract class CuentaRepository {
  abstract consultar(codigo: string): Observable<CuentaMedicaModel>;

  /** Qué puede hacer el auditor sobre la cuenta. Petición aparte de `consultar`. */
  abstract consultarAcciones(codigo: string): Observable<AccionesDisponiblesModel>;

  abstract enviar(
    codigo: string,
    solicitud: EnviarCuentaRequest,
    auditor: string
  ): Observable<TiqueteResponse>;

  abstract consultarProceso(codigo: string): Observable<EstadoProcesoModel>;

  /** Stream SSE — emite EstadoProcesoModel en tiempo real hasta que el proceso finaliza. */
  abstract transmitirProceso(codigo: string): Observable<EstadoProcesoModel>;
}
