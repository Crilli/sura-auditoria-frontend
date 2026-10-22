import { Observable } from 'rxjs';
import {
  AccionesDisponiblesModel, CuentaMedicaModel, EnviarCuentaRequest, TiqueteResponse,
  MotivoModel, EjecutarAccionRequest, HitoModel, FiltroCuentasModel, ResumenCuentaModel, VersionCuentaModel, FotoVersionModel
} from '../models/cuenta-medica.model';
import { OffsetPage } from '../../../../../../../libs/data-access/http/src/lib/offset-page.model';
import { CambioNovedadRequest } from '../models/linea-cuenta.model';
import { EstadoProcesoModel } from '../models/estado-proceso.model';
import { DetalleLineaDeVersionModel, LineaDeVersionModel } from '../models/linea-de-version.model';

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

  /**
   * Por dónde ha pasado la cuenta: sus cambios de estado y sus desfinalizaciones con el motivo.
   *
   * No es `consultarProceso`, que es el estado del envío asíncrono.
   */
  abstract consultarHistoria(codigoCuenta: string): Observable<HitoModel[]>;

  /** Busca cuentas por factura o radicado. Cada resultado trae sus versiones. */
  abstract buscar(
    filtro: FiltroCuentasModel,
    pagina: number,
    tamano: number
  ): Observable<OffsetPage<ResumenCuentaModel>>;

  /** Las versiones de negocio de la cuenta, de la más reciente a la más antigua. */
  abstract consultarVersiones(codigoCuenta: string): Observable<VersionCuentaModel[]>;

  /** La foto de una versión concreta. */
  abstract consultarVersion(codigoCuenta: string, numero: number): Observable<FotoVersionModel>;

  /**
   * Las líneas de una versión del histórico, en orden de número de línea (BUS-21).
   *
   * Una versión que existe sin líneas —la madre de un large claim— es una página vacía con
   * `totalRegistros` 0; una que no está en el histórico es un error que la nombra (400).
   *
   * @param pagina contando desde cero, como `LineaRepository.listar`.
   * @param tamano el servicio no da más de 25.
   */
  abstract listarLineasDeVersion(
    codigoCuenta: string,
    numero: number,
    pagina: number,
    tamano: number
  ): Observable<OffsetPage<LineaDeVersionModel>>;

  /** Una línea de esa versión, con sus novedades, diagnósticos, convenio y atención de entonces. */
  abstract consultarLineaDeVersion(
    codigoCuenta: string,
    numero: number,
    numeroLinea: number
  ): Observable<DetalleLineaDeVersionModel>;
}
