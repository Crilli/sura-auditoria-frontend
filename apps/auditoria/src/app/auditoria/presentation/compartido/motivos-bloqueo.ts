/**
 * Por qué un campo que se ve en pantalla no se puede editar. El candado del
 * modo edición lleva uno de estos textos en el tooltip: un campo apagado sin
 * explicación se lee como un fallo de la pantalla, no como una regla.
 *
 * Vive fuera del componente porque los campos bloqueados están repartidos por
 * todas las secciones del detalle, y cada sección es ya un componente propio:
 * si cada uno escribiera su texto, el mismo candado acabaría explicándose de
 * dos maneras distintas y dejaría de leerse como una convención.
 */
export const MOTIVOS_BLOQUEO = {
  /** Salida del motor de coberturas: `/claimsupdate` no lo acepta siquiera. */
  calculado:  'Lo calcula el motor de coberturas de OHI.',
  /** OHI lo aceptaría; es el ms el que lo prohíbe, por negocio. */
  afiliado:   'La cuenta es de un lesionado: cambiarlo sería readjudicar la '
            + 'línea bajo otra póliza.',
  /** Un campo de texto libre dejaría escribir un código que no existe. */
  catalogo:   'Requiere selector de catálogo, pendiente.',
  lista:      'Requiere editor de filas, pendiente.',
  tarifacion: 'Resultado de la tarifación: sale de las cláusulas del convenio.',
  derivado:   'Se deriva del código de la prestación.'
} as const;
