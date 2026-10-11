/**
 * Modelo de paginación KEYSET (cursor-based) del ms-auditoria-cuenta-medica.
 *
 * ✅ SIEMPRE se envía 'tamano' al servidor.
 * ✅ El 'cursor' proviene del campo 'cursorSiguiente' de la respuesta anterior.
 * PROHIBIDO: GET /lineas sin 'tamano' (equivalente a cargar todo en cliente).
 */
export interface CursorPage<T> {
  elementos:       T[];
  cursorSiguiente: string | null; // null = es la última página
  totalRegistros:  number | null; // el MS puede no calcularlo
  tamanoPagina:    number;
}

export interface CursorRequest {
  cursor?: string; // undefined = primera página (no se envía el query param)
  tamano:  number; // registros por página — obligatorio
}
