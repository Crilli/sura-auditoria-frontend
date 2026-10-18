/**
 * Paginación por DESPLAZAMIENTO del ms-auditoria-cuenta-medica.
 *
 * Es la que usa el listado de líneas. Sustituye al cursor —ver
 * `cursor-page.model.ts`, que sigue sirviendo a los pendientes— porque con
 * cursor no se podía saltar a una página cualquiera: en la cuenta mayor medida,
 * de 4.063 líneas, llegar a la última exigía encadenar 162 peticiones, así que
 * el botón estaba apagado. El sistema de registro sí admite desplazamiento, y
 * en profundidad.
 *
 * ✅ SIEMPRE se envían `pagina` y `tamano`.
 */
export interface OffsetPage<T> {
  elementos: T[];
  /** Cuántos elementos se saltaron para llegar aquí. */
  desplazamiento: number;
  tamanoPagina: number;
  /** En qué página estamos, **contando desde cero**, como lo publica el servicio. */
  pagina: number;
  /**
   * Cuántos hay en total, o `null` cuando no es de fiar.
   *
   * Es `null` —a propósito, no por un fallo— si el filtro incluye el catálogo de
   * la prestación o un extremo de valor glosado: el sistema de registro no sabe
   * filtrar por esos campos, así que su cuenta sería de las filas de antes de
   * descartar y el paginador ofrecería páginas vacías. Sin total no hay números
   * de página, solo «siguiente» y «anterior».
   */
  totalRegistros: number | null;
  /** Cuántas páginas hay, o `null` si no hay total. */
  totalPaginas: number | null;
  /**
   * Si queda algo después de esta página.
   *
   * Siempre fiable, también cuando el total no lo es: es con esto con lo que se
   * habilita «siguiente».
   */
  hayMas: boolean;
}

export interface OffsetRequest {
  /** Página a pedir, **contando desde cero**. */
  pagina: number;
  /** Registros por página — obligatorio. */
  tamano: number;
  /**
   * Por qué columna ordenar. El servicio solo acepta una lista cerrada y rechaza con 400 lo
   * que no esté en ella: un nombre inventado se convertiría en un orden inventado.
   */
  orden?: string;
  sentido?: 'asc' | 'desc';
}
