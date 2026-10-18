export type AlcanceResolucion = 'CUENTA_Y_LINEAS' | 'SOLO_LINEAS';

/**
 * Nivel al que aplica el motivo, tal como lo publica el servicio.
 *
 * Son los nombres del enum del dominio (`NivelPendiente`): el de cabecera se
 * llama `CABECERA`, no `CUENTA`. Con el valor equivocado la comparación del chip
 * no se cumplía nunca y la columna mostraba el enum en crudo.
 */
export type NivelPendiente = 'CABECERA' | 'LINEA';

/** Etiqueta legible del nivel, para no pintar el enum tal cual. */
export const ETIQUETA_NIVEL: Record<NivelPendiente, string> = {
  CABECERA: 'Cuenta',
  LINEA:    'Línea',
};

/** Elemento de GET /api/v1/cuentas/{codigo}/pendientes (una página) */
export interface MotivoPendienteModel {
  identificador:    number;
  codigo:           string;
  /** Texto del motivo. `null` si el catálogo de OHI no lo tiene diligenciado. */
  descripcion:      string | null;
  resuelto:         boolean;
  soloAdjudicacion: boolean;
  nivel:            NivelPendiente;
  /** Identificador interno de la línea en OHI; no se le enseña al auditor. */
  referenciaLinea:  number | null;
  /** Número de línea tal como sale en la grilla. `null` en los de cabecera. */
  numeroLinea:      number | null;
  /**
   * Si impide enviar la cuenta en el estado en que está hoy.
   *
   * `null` significa «no evaluado aquí», no «no bloquea»: el detalle de una
   * línea usa este mismo modelo y ahí el servicio no conoce el estado de la
   * cuenta, que es lo que decide qué bloquea.
   */
  bloqueante:       boolean | null;
  version:          number;
}

/** Qué pendientes se quieren ver, según bloqueen o no el envío. */
export type FiltroBloqueo = 'TODOS' | 'BLOQUEANTES' | 'NO_BLOQUEANTES';

/** Cuerpo del POST /api/v1/cuentas/{codigo}/pendientes/{motivo}/resolver */
export interface ResolverPendienteRequest {
  justificacion: string;
  alcance:       AlcanceResolucion;
}

/**
 * Elemento de GET /api/v1/cuentas/{codigo}/pendientes/motivos
 *
 * Los motivos distintos que tiene la cuenta, ya agregados por el servicio. Va
 * en su propia llamada porque el listado se pagina: con 3.507 pendientes en la
 * cuenta mayor medida, el cliente ya no ve la lista entera y no puede agrupar
 * por su cuenta.
 */
export interface ResumenMotivoModel {
  codigo:          string;
  /** Texto del motivo. `null` si el catálogo de OHI no lo tiene diligenciado. */
  descripcion:     string | null;
  sinResolver:     number;
  /** Líneas distintas afectadas. `0` si el motivo es solo de cabecera. */
  lineasAfectadas: number;
  enCabecera:      boolean;
  /** El `adjudicationOnly` del catálogo de OHI: el porqué del siguiente. */
  soloAdjudicacion: boolean;
  /** Si los pendientes de este motivo impiden enviar la cuenta hoy. */
  bloqueante:      boolean;
}

// ── Resolución de varios motivos a la vez ─────────────────────────────────

/**
 * A qué nivel resolver. Los dos niveles del sistema de registro son
 * **disjuntos**: resolver en la cuenta no toca las líneas y al revés. Por eso
 * existe `DONDE_APLIQUE`, que es lo que se quiere casi siempre —que el motivo
 * deje de estar puesto, esté donde esté— y que el servicio traduce a una o dos
 * operaciones según dónde viva cada motivo.
 */
export type NivelResolucion = 'CUENTA' | 'LINEAS' | 'DONDE_APLIQUE';

/** Cuerpo del POST /api/v1/cuentas/{codigo}/pendientes/resolver */
export interface ResolverEnMasaRequest {
  /** Códigos de motivo. No identificadores de fila: se resuelve el motivo. */
  motivos:       string[];
  justificacion: string;
  nivel:         NivelResolucion;
  /**
   * A qué líneas acotar la resolución. **Ausente o vacía = todas las aplicables**, que es
   * el contrato del sistema de registro.
   *
   * Por eso la pantalla no puede ofrecer el botón con la selección vacía: acabaría
   * resolviendo el motivo en toda la cuenta, que es lo contrario de lo que se pidió.
   */
  lineas?:       number[];
}

/** Qué no se pudo resolver, tal como lo reportó el sistema de registro. */
export interface FalloResolucionModel {
  /** Código de mensaje del sistema de registro; estable, sirve para agrupar. */
  codigo:   string;
  /** El elemento al que se refiere, si el mensaje lo trae. */
  elemento: string;
  detalle:  string;
}

/** Cómo acabó una resolución múltiple. */
export type DesenlaceResolucion = 'COMPLETO' | 'PARCIAL' | 'FALLIDO' | 'EN_CURSO';

/**
 * Respuesta de la resolución múltiple.
 *
 * No es un 204 como la individual: la operación del sistema de registro es de
 * larga duración y puede salir a medias, así que hace falta un cuerpo donde
 * quepa decirlo. `EN_CURSO` llega con un 202 y significa que todavía no se sabe
 * —no que haya fallado—, así que no se debe reintentar: resolver no es
 * idempotente.
 */
export interface ResolucionMasivaModel {
  desenlace:    DesenlaceResolucion;
  todoResuelto: boolean;
  /** Identificadores de las operaciones en el sistema de registro. */
  referencias:  string[];
  fallos:       FalloResolucionModel[];
}

/**
 * Un motivo del **catálogo** de pendientes: los que existen, no los que una cuenta tiene.
 *
 * Tres catálogos que el documento del MVP llama todos «motivos» y no son el mismo: este, el
 * de desfinalización (`/catalogos/motivos`) y el de mensajes (`/catalogos/novedades`).
 * Ofrecer el que no es daría una lista que el servicio rechazaría entera.
 */
export interface MotivoPendienteCatalogoModel {
  codigo:           string;
  descripcion:      string;
  /**
   * El indicador del sistema de registro. **No** es «bloqueante»: bloquear depende del par
   * motivo-estado y el catálogo no conoce ninguna cuenta.
   */
  soloAdjudicacion: boolean;
}

/** Cuerpo del POST /api/v1/cuentas/{codigo}/pendientes/agregar */
export interface AgregarPendienteRequest {
  motivo: string;
  /** Ausente o vacía = la cabecera de la cuenta, **no** «todas las líneas». */
  lineas?: number[];
}
