import { SeveridadNovedad } from '../../domain/models/linea-cuenta.model';

/**
 * Cómo se lee cada origen de novedad.
 *
 * Son los quince valores del vocabulario del sistema de registro. Catorce son
 * etapas de su propio motor de reglas; **`MANUAL` es el único que significa que
 * lo puso una persona**, y es la distinción que la pantalla tiene que dejar
 * clara: lo que objetó el motor no se quita a mano, se resuelve la causa.
 *
 * Medido contra el entorno de pruebas, el reparto real sobre 753.483 novedades
 * es `COVERAGE` 183.905 · `BENEFITS` 155.246 · `PRICING` 88.866 ·
 * `RESERVATION` 8.637 · `MANUAL` 1.962; los demás no aparecen. Se traducen
 * todos igualmente para que ninguno salga en inglés el día que aparezca.
 */
export const ORIGEN_NOVEDAD: Record<string, string> = {
  MANUAL:                        'A mano',
  EXTERNAL:                      'Externo',
  CANCEL:                        'Anulación',
  'SANITY CHECKS':               'Comprobaciones',
  'PRE PRICING':                 'Pretarifación',
  ENROLLMENT:                    'Afiliación',
  RESERVATION:                   'Reserva',
  PRICING:                       'Tarifación',
  'PRICING LIMIT':               'Límite de tarifación',
  'PRICING NO RECALCULATION':    'Tarifación sin recálculo',
  'PAYMENT STATUS':              'Estado de pago',
  'PRE BENEFITS':                'Prebeneficios',
  BENEFITS:                      'Beneficios',
  COVERAGE:                      'Coberturas',
  ADJUDICATION:                  'Adjudicación',
};

/** El origen en castellano, o el valor crudo si aparece uno que no conocemos. */
export function textoDeOrigen(origen: string | null | undefined): string {
  if (!origen) return 'Sin origen';
  return ORIGEN_NOVEDAD[origen.toUpperCase()] ?? origen;
}

/**
 * Cómo se lee cada severidad, y qué consecuencia tiene.
 *
 * Se enseña **con texto y no solo con color**: la diferencia entre que una
 * novedad frene la cuenta o solo informe es la que decide si el auditor puede
 * cerrarla, y un matiz de color no la comunica.
 */
export const SEVERIDAD_NOVEDAD: Record<SeveridadNovedad, string> = {
  INFORMATIVA: 'Informativa',
  ADVERTENCIA: 'Advertencia',
  BLOQUEANTE:  'Bloqueante',
  NEGACION:    'Negación',
  DESCONOCIDA: 'Sin severidad',
};

/** Qué pasa con la cuenta si se pone una novedad de esta severidad. */
export const CONSECUENCIA_SEVERIDAD: Record<SeveridadNovedad, string> = {
  INFORMATIVA: 'Queda registrada y la cuenta sigue su curso.',
  ADVERTENCIA: 'Queda registrada como aviso.',
  BLOQUEANTE:  'La cuenta no podrá avanzar mientras no se resuelva.',
  NEGACION:    'Niega lo facturado, no solo lo frena. Es la más grave.',
  DESCONOCIDA: 'El catálogo no publica su severidad.',
};
