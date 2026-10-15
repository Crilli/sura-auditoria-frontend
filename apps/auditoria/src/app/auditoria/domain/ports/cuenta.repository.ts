import { Observable } from 'rxjs';
import { AccionesDisponiblesModel, CuentaMedicaModel, EnviarCuentaRequest, TiqueteResponse, MotivoModel, EjecutarAccionRequest } from '../models/cuenta-medica.model';
import { CambioNovedadRequest } from '../models/linea-cuenta.model';
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

  /**
   * Agrega y quita novedades en la cabecera.
   *
   * Operación propia y no un «guardar cuenta»: en la cabecera la novedad es lo
   * único editable, y un guardado genérico prometería una edición que no
   * existe. Devuelve la cuenta releída, con sus novedades actualizadas.
   *
   * `versionEsperada` es la de la **cuenta**, y conviene saber que es la misma
   * que mueve una edición de línea: dos auditores, uno en una línea y otro en
   * la cabecera, chocan aquí.
   */
  abstract guardarNovedades(
    codigo: string,
    versionEsperada: number,
    novedades: CambioNovedadRequest[],
    auditor: string
  ): Observable<CuentaMedicaModel>;

  /**
   * Ejecuta una de las acciones que el sistema de registro habilita.
   *
   * `accion` es el nombre del dominio (`ANULAR`, `DEVOLVER_A_MODIFICACION`…).
   * Devuelve la cuenta releída: la acción la mueve de estado, y con él cambian
   * las acciones que quedan habilitadas.
   */
  abstract ejecutarAccion(
    codigo: string,
    accion: string,
    solicitud: EjecutarAccionRequest,
    auditor: string
  ): Observable<CuentaMedicaModel>;

  /** Los motivos de desfinalización y anulación, acotados al tipo de proceso. */
  abstract consultarMotivos(ambito?: string): Observable<MotivoModel[]>;

  abstract consultarProceso(codigo: string): Observable<EstadoProcesoModel>;

  /** Stream SSE — emite EstadoProcesoModel en tiempo real hasta que el proceso finaliza. */
  abstract transmitirProceso(codigo: string): Observable<EstadoProcesoModel>;
}
