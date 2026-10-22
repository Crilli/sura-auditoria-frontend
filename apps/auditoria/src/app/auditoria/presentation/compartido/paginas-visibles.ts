/**
 * Los números que pinta un paginador numerado: siempre la primera y la última, más una ventana
 * alrededor de la actual, con `…` en los cortes. Hasta siete páginas, todas.
 *
 * Es el mismo criterio que el de la grilla de la cuenta actual (`LineasListComponent`), sacado a
 * una función para que la grilla de una versión (BUS-21) pagine igual sin depender de
 * `LineaFacade`, que guarda la página de la cuenta actual.
 *
 * @param total páginas que hay, o `null` si no se sabe (entonces no hay números).
 * @param actual la que se ve, contando desde uno.
 */
export function paginasVisibles(total: number | null, actual: number): (number | '…')[] {
  if (total === null || total <= 1) return [];
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const ventana = new Set<number>([1, total, actual]);
  for (const alrededor of [actual - 1, actual + 1]) {
    if (alrededor > 1 && alrededor < total) ventana.add(alrededor);
  }

  const ordenadas = [...ventana].sort((a, b) => a - b);
  const resultado: (number | '…')[] = [];
  let anterior = 0;
  for (const numero of ordenadas) {
    if (anterior && numero - anterior > 1) resultado.push('…');
    resultado.push(numero);
    anterior = numero;
  }
  return resultado;
}
