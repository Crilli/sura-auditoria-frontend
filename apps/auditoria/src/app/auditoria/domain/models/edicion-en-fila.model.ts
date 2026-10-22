import {
  DetalleLineaModel, GuardarLineaRequest, ResumenLineaModel
} from './linea-cuenta.model';

/**
 * La edición de una línea **sin salir de la grilla** (GRID-18).
 *
 * ## Qué se teclea en la fila, y qué no
 * Solo los cuatro campos que el sistema de registro acepta escribir y que la grilla ya enseña:
 * valor y unidades cargadas (`claimed*`), valor y unidades **convenidas** (`allowed*`). Lo demás
 * de la fila se ve pero no se toca, cada cosa por su motivo:
 *
 * - **el valor glosado** es la suma del desglose de glosa y OHI **no** lo recalcula: teclearlo
 *   suelto dejaría una línea cuyo total no cuadra con lo que lo compone. Se edita abriendo la
 *   línea, donde está el desglose;
 * - **el autorizado** (`coveredAmount`) **y el IVA** los calcula el motor de coberturas:
 *   `/claimsupdate` ni los acepta. Por eso, desde la decisión del 2026-10-21 que fijó qué es cada
 *   importe, lo que se teclea es el convenido y el autorizado lleva candado.
 *   Antes el convenido se rotulaba «autorizado»: el campo escrito es el mismo, cambió su nombre.
 *
 * ## El modo de recálculo no tiene valor por defecto
 * Igual que en la pantalla de la línea. Decide si el motor reprocesa la cuenta entera o solo
 * aplica lo enviado, y eso tiene efecto financiero: se elige en cada guardado.
 *
 * Son reglas sin Angular: las usa la fachada para guardar y el componente para pintar. El
 * formulario de la fila vive en `presentation/lineas-list/edicion-en-fila.ts`.
 */

export type ModoRecalculo = GuardarLineaRequest['modoRecalculo'];

/** Los campos que se teclean en la fila, en el orden en que se pintan. */
export const CAMPOS_EN_FILA = [
  'valorCargado', 'unidadesCargadas', 'valorConvenido', 'unidadesConvenidas',
] as const;

export type CampoEnFila = typeof CAMPOS_EN_FILA[number];
export type ValoresEnFila = Record<CampoEnFila, number | null>;
export type CambiosEnFila = Partial<Pick<GuardarLineaRequest, CampoEnFila>>;

/** Lo que la fila trae hoy en los campos editables. */
export function valoresDeLaFila(fila: ResumenLineaModel): ValoresEnFila {
  return {
    valorCargado:        fila.valorCargado,
    unidadesCargadas:    fila.unidadesCargadas,
    valorConvenido:      fila.valorConvenido,
    unidadesConvenidas:  fila.unidadesConvenidas,
  };
}

/**
 * Solo lo que cambió respecto de la fila.
 *
 * Mandar los cuatro campos «por si acaso» pisaría con el valor de la fila lo que otro
 * hubiera escrito en un campo que este auditor ni miró; con la versión esperada el
 * sistema de registro lo rechazaría, pero el conflicto sería falso.
 *
 * @return `null` si no cambió nada: entonces no hay nada que guardar
 */
export function cambiosDeLaFila(fila: ResumenLineaModel,
                                valores: Partial<ValoresEnFila>): CambiosEnFila | null {
  const antes = valoresDeLaFila(fila);
  const cambios: CambiosEnFila = {};
  for (const campo of CAMPOS_EN_FILA) {
    const ahora = valores[campo];
    if (ahora === undefined || ahora === null) continue;
    if (ahora !== antes[campo]) cambios[campo] = ahora;
  }
  return Object.keys(cambios).length > 0 ? cambios : null;
}

/**
 * La solicitud del PATCH de línea que ya existe.
 *
 * La versión esperada es la que trae **la fila**, no una pedida aparte: es la que el
 * auditor tenía a la vista cuando decidió el cambio.
 */
export function solicitudDeLaFila(fila: ResumenLineaModel, cambios: CambiosEnFila,
                                  modo: ModoRecalculo): GuardarLineaRequest {
  return { versionEsperada: fila.version, modoRecalculo: modo, ...cambios };
}

/**
 * La fila con lo que devolvió el sistema de registro tras guardar.
 *
 * Se toma del detalle releído y no de lo tecleado: el motor puede haber recalculado el
 * autorizado o reajustado lo convenido, y la fila tiene que enseñar lo que quedó, no lo que
 * se pidió. Lo que el detalle no trae —el IVA, el estado de las novedades— lo pone el
 * refresco de la página que sigue al guardado.
 */
export function filaConDetalle(fila: ResumenLineaModel,
                               detalle: DetalleLineaModel): ResumenLineaModel {
  return {
    ...fila,
    valorCargado:        detalle.valorCargado,
    unidadesCargadas:    detalle.unidadesCargadas,
    valorConvenido:      detalle.valorConvenido,
    unidadesConvenidas:  detalle.unidadesConvenidas,
    valorAutorizado:     detalle.valorAutorizado,
    // La cantidad autorizada también cambia con el recálculo y la grilla la enseña (GRID-13).
    unidadesAutorizadas: detalle.unidadesAutorizadas,
    valorGlosado:        detalle.valorGlosado,
    editable:            detalle.editable,
    version:             detalle.version,
  };
}

/** Desenlace de un guardado en la fila. */
export type DesenlaceEnFila =
  | { tipo: 'SIN_CAMBIOS' }
  | { tipo: 'GUARDADO'; fila: ResumenLineaModel }
  /** Otro guardó antes: `actual` es la fila releída, con su versión nueva. */
  | { tipo: 'CONFLICTO'; actual: ResumenLineaModel }
  | { tipo: 'ERROR'; mensaje: string }
  /**
   * El sistema de registro aplicó el cambio pero no se pudo releer (OPE-11): es un guardado,
   * no un error. La fila se actualiza con el refresco de la página, no con lo tecleado.
   */
  | { tipo: 'APLICADO_SIN_RELEER'; mensaje: string };

