import { SeveridadNovedad } from './linea-cuenta.model';

/**
 * Las líneas de una versión de la cuenta (BUS-21): la foto de cada línea tal como quedó al
 * finalizarse esa versión, leída del histórico de lo transmitido.
 *
 * ## No es una línea viva, y no se parece a una a propósito
 * No lleva `referencia`, ni `version` (el contador de bloqueo), ni `editable`: el identificador
 * de una línea del histórico no es el de la línea viva —medido en UAT el 2026-10-21: la viva
 * 37488517725, la misma línea en la versión 44093511586—, y si viajara con el nombre de la
 * viva acabaría en un `PATCH /lineas/{referencia}` que escribiría en la cuenta actual. La llave
 * es `numeroLinea`, que sí es la misma en todas las versiones y en la cuenta viva.
 *
 * ## Lo que falta llega en `null`
 * Ningún importe se inventa: un valor ausente se pinta como raya, nunca como cero.
 */

/**
 * Líneas por página de una versión: el tamaño por defecto y el máximo del servicio (contrato del
 * 2026-10-21), el mismo que el de la cuenta actual.
 */
export const LINEAS_POR_PAGINA_DE_VERSION = 25;

/**
 * Estado de la línea en esa versión. El servicio traduce el español del histórico
 * («Aprobado», «Negado»); lo que no sabe traducir llega tal cual.
 */
export type EstadoLineaDeVersion = 'APROBADA' | 'NEGADA' | (string & {});

/** Una glosa de la línea, tal como estaba en la versión. */
export interface GlosaDeVersionModel {
  secuencia:          number | null;
  /** El causal, p. ej. `223-1A`. */
  codigo:             string | null;
  valor:              number | null;
  codigoNotaCredito:  string | null;
  valorNotaCredito:   number | null;
  /** Clasificación genérica («Tarifas»). En UAT suele llegar vacía. */
  concepto:           string | null;
  conceptoEspecifico: string | null;
  /** La redacción que leyó el prestador. */
  texto:              string | null;
  /** «Manual», «Automática»… */
  tipo:               string | null;
}

/** Una fila de la grilla de la versión — GET /cuentas/{codigo}/versiones/{numero}/lineas */
export interface LineaDeVersionModel {
  numeroLinea:              number;
  /** `null` si el histórico no lo guardó. */
  estado:                   EstadoLineaDeVersion | null;
  fechaInicio:              string | null;
  fechaFin:                 string | null;
  codigoProcedimiento:      string | null;
  descripcionProcedimiento: string | null;
  catalogoProcedimiento:    string | null;
  codigoAfiliado:           string | null;
  /** OHI solo guarda el primer apellido. */
  nombreAfiliado:           string | null;
  codigoAutorizacion:       string | null;
  prestadorCodigo:          string | null;
  prestadorNombre:          string | null;
  /*
   * Mismo vocabulario que la línea viva (decisión del 2026-10-21): cargado = `claimed*`,
   * convenido = `allowed*`, autorizado = `covered*`. Así la foto y la cuenta se comparan
   * columna a columna con los mismos rótulos.
   */
  valorCargado:             number | null;
  unidadesCargadas:         number | null;
  valorConvenido:           number | null;
  unidadesConvenidas:       number | null;
  valorAutorizado:          number | null;
  unidadesAutorizadas:      number | null;
  valorGlosado:             number | null;
  valorIva:                 number | null;
  porcentajeIva:            number | null;
  /** Vacío si la línea no tenía glosas en esa versión. */
  glosas:                   GlosaDeVersionModel[];
}

/**
 * Una novedad de la línea en esa versión.
 *
 * El texto llega **ya resuelto y congelado** a la fecha de la foto: es el que se leyó entonces,
 * no el del catálogo de hoy. No hay autor ni fecha: el histórico los pierde (todas las de una
 * versión llevan la hora de la foto). Las repetidas se agrupan —medido: 223-1A doce veces en
 * una línea de CM-4146— y `repeticiones` dice cuántas eran.
 */
export interface NovedadDeVersionModel {
  codigo:       string | null;
  severidad:    SeveridadNovedad;
  texto:        string | null;
  /** La etapa del motor que la produjo, o `MANUAL`, tal cual. */
  origen:       string | null;
  anulada:      boolean;
  repeticiones: number;
}

export interface DiagnosticoDeVersionModel {
  secuencia:   number | null;
  codigo:      string | null;
  descripcion: string | null;
  tipo:        string | null;
}

/** Una cláusula de tarifa del convenio con que se valoró la línea. */
export interface ClausulaDeVersionModel {
  monto:       number | null;
  descripcion: string | null;
  regla:       string | null;
}

/**
 * El convenio con que se valoró la línea en esa versión.
 *
 * Sin número de contrato, al contrario que la línea viva: el histórico de producción no lo guarda
 * (la definición de `ctrclaimlines` de producción no trae `numeroContrato`; la de UAT sí), así que
 * llegaría en `null` en todas las líneas. El servicio dejó de publicarlo.
 */
export interface ConvenioDeVersionModel {
  tarifaIss2000:  string | null;
  tarifaIss2001:  string | null;
  tarifaSoat:     string | null;
  homologoCups:   string | null;
  clausulas:      ClausulaDeVersionModel[];
}

export interface AtencionDeVersionModel {
  tipoSala:  string | null;
  viaAcceso: string | null;
  uen:       string | null;
}

/** Una línea de la versión abierta — GET /cuentas/{codigo}/versiones/{numero}/lineas/{numeroLinea} */
export interface DetalleLineaDeVersionModel extends LineaDeVersionModel {
  novedades:    NovedadDeVersionModel[];
  diagnosticos: DiagnosticoDeVersionModel[];
  /** `null` solo si el servicio no lo mandó: lo normal es el objeto con sus campos en `null`. */
  convenio:     ConvenioDeVersionModel | null;
  atencion:     AtencionDeVersionModel | null;
}

/** El estado de la línea en palabras. Lo desconocido se enseña tal cual; sin estado, una raya. */
export function textoDeEstadoDeLinea(estado: EstadoLineaDeVersion | null | undefined): string {
  if (!estado?.trim()) return '—';
  switch (estado) {
    case 'APROBADA': return 'Aprobada';
    case 'NEGADA':   return 'Negada';
    default:         return estado;
  }
}
