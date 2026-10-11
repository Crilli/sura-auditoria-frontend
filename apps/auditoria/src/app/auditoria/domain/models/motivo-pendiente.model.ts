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

/** Respuesta de GET /api/v1/cuentas/{codigo}/pendientes */
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
  version:          number;
}

/** Cuerpo del POST /api/v1/cuentas/{codigo}/pendientes/{motivo}/resolver */
export interface ResolverPendienteRequest {
  justificacion: string;
  alcance:       AlcanceResolucion;
}
