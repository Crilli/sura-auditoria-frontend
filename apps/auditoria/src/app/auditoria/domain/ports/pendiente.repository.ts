import { Observable } from 'rxjs';
import { CursorPage, CursorRequest } from '../../../../../../../libs/data-access/http/src/lib/cursor-page.model';
import {
  MotivoPendienteModel, ResumenMotivoModel, ResolverPendienteRequest, FiltroBloqueo,
  ResolverEnMasaRequest, ResolucionMasivaModel,
  MotivoPendienteCatalogoModel, AgregarPendienteRequest
} from '../models/motivo-pendiente.model';

/** Puerto del dominio para operaciones sobre los pendientes de la cuenta médica. */
export abstract class PendienteRepository {
  /**
   * ✅ Paginación Keyset — SIEMPRE con cursor y tamano, igual que las líneas.
   *
   * Los pendientes de cabecera llegan como prefijo de la primera página; de la
   * segunda en adelante son todos de línea. `motivo` filtra por el código del
   * pendiente en los dos niveles y `bloqueo` por si frenan el envío o no — eso
   * último lo resuelve el servicio contra el estado de la cuenta, porque el
   * mismo motivo bloquea o no según ese estado.
   */
  abstract listarSinResolver(
    codigoCuenta: string,
    cursor: CursorRequest,
    motivo?: string | null,
    bloqueo?: FiltroBloqueo,
    /** Trae también los ya resueltos. Por omisión no: es lo que el auditor ya veía. */
    incluirResueltos?: boolean
  ): Observable<CursorPage<MotivoPendienteModel>>;

  /** Los motivos distintos de la cuenta, para poblar el filtro. */
  abstract resumirMotivos(codigoCuenta: string): Observable<ResumenMotivoModel[]>;

  abstract resolver(
    codigoCuenta: string,
    idMotivo: number,
    solicitud: ResolverPendienteRequest,
    auditor: string
  ): Observable<void>;

  /**
   * Resuelve varios motivos de una vez.
   *
   * Devuelve el desenlace y no `void`: el servicio delega en una operación de
   * larga duración del sistema de registro que puede acabar parcial, y eso no
   * cabe en un código de éxito.
   */
  abstract resolverEnMasa(
    codigoCuenta: string,
    solicitud: ResolverEnMasaRequest,
    auditor: string
  ): Observable<ResolucionMasivaModel>;

  /**
   * Cómo van las resoluciones que `resolverEnMasa` devolvió en curso (OPE-06).
   *
   * Una consulta sin efectos: el servicio pregunta al sistema de registro por cada
   * referencia y responde el desenlace conjunto, `EN_CURSO` mientras alguna siga.
   */
  abstract seguirResolucion(
    codigoCuenta: string,
    referencias: string[]
  ): Observable<ResolucionMasivaModel>;

  /** El catálogo de motivos que se pueden poner. Son 237; el servicio los recorre. */
  abstract catalogoDeMotivos(): Observable<MotivoPendienteCatalogoModel[]>;

  /** Pone un motivo sobre unas líneas, o sobre la cabecera si no se indican. */
  abstract agregarMotivo(
    codigoCuenta: string,
    solicitud: AgregarPendienteRequest,
    auditor: string
  ): Observable<void>;
}
