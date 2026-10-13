import { Observable } from 'rxjs';
import { CursorPage, CursorRequest } from '../../../../../../../libs/data-access/http/src/lib/cursor-page.model';
import {
  MotivoPendienteModel, ResumenMotivoModel, ResolverPendienteRequest, FiltroBloqueo,
  ResolverEnMasaRequest, ResolucionMasivaModel
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
    bloqueo?: FiltroBloqueo
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
}
