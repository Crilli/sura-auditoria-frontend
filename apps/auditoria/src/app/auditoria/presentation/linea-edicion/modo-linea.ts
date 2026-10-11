/**
 * Modo con el que se abre una línea.
 *
 * Viaja en el `data` de la ruta y llega al componente como `input()`, porque
 * `withComponentInputBinding()` está activo en la configuración de la app.
 */
export type ModoLinea = 'lectura' | 'edicion';
