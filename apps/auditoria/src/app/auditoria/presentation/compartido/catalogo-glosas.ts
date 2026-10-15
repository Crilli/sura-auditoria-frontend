/**
 * Causales de glosa para elegir al crear una manual.
 *
 * **Es una ayuda, no una autoridad.** El sistema de registro no publica ningún
 * catálogo de códigos de glosa —se comprobó: no hay recurso que los liste— y en
 * sus datos conviven dos convenciones distintas, la numérica de la tabla
 * nacional (`208-1`) y una con prefijo de letras (`TA0201`), además de
 * descripciones escritas con mayúsculas inconsistentes. Por eso el servicio
 * acepta cualquier código y esta lista solo sirve para no teclear a ciegas.
 *
 * **De dónde sale:** de los códigos que de verdad existen en el entorno, leídos
 * el 14-oct-2026 sobre una muestra de mil líneas glosadas. Son los que hay, no
 * los que debería haber: la tabla oficial tiene bastantes más.
 *
 * **Cómo completarla:** añadiendo filas aquí. Si tienen la tabla oficial, este
 * es el sitio donde ponerla; nada en el código depende de que esté completa,
 * porque el campo admite escribir un código que no figure.
 */
export interface CausalGlosa {
  codigo:     string;
  generico:   string;
  especifico: string;
}

export const CATALOGO_GLOSAS: readonly CausalGlosa[] = [
  { codigo: '102-3',  generico: 'Facturación',    especifico: 'Consultas, interconsultas y visitas médicas' },
  { codigo: '102-5',  generico: 'Facturación',    especifico: 'Consultas, interconsultas y visitas médicas' },
  { codigo: '108-2',  generico: 'Facturación',    especifico: 'Ayudas diagnósticas' },
  { codigo: '123-1',  generico: 'Facturación',    especifico: 'Procedimiento o actividad' },
  { codigo: '201-1',  generico: 'Tarifas',        especifico: 'Estancia' },
  { codigo: '202-1',  generico: 'Tarifas',        especifico: 'Consultas, interconsultas y visitas médicas' },
  { codigo: '205-1',  generico: 'Tarifas',        especifico: 'Derechos de sala' },
  { codigo: '206-1',  generico: 'Tarifas',        especifico: 'Materiales' },
  { codigo: '207-1',  generico: 'Tarifas',        especifico: 'Medicamentos' },
  { codigo: '208-1',  generico: 'Tarifas',        especifico: 'Ayudas diagnósticas' },
  { codigo: '223-1A', generico: 'Tarifas',        especifico: 'Procedimiento o actividad' },
  { codigo: '223-1B', generico: 'Tarifas',        especifico: 'Procedimiento o actividad' },
  { codigo: '308-1',  generico: 'Soportes',       especifico: 'Ayudas diagnósticas' },
  { codigo: '401-2',  generico: 'Autorizaciones', especifico: 'Estancia' },
  { codigo: '402-1A', generico: 'Autorizaciones', especifico: 'Consultas, interconsultas y visitas médicas' },
  { codigo: '406-1',  generico: 'Autorizaciones', especifico: 'Materiales' },
  { codigo: '408-1',  generico: 'Autorizaciones', especifico: 'Ayudas diagnósticas' },
  { codigo: '423-1',  generico: 'Autorizaciones', especifico: 'Procedimiento o actividad' },
  { codigo: '602-1A', generico: 'Pertinencia',    especifico: 'Consultas, interconsultas y visitas médicas' },
  { codigo: '607-1B', generico: 'Pertinencia',    especifico: 'Medicamentos' },
  { codigo: '608-1A', generico: 'Pertinencia',    especifico: 'Ayudas diagnósticas' },
  { codigo: '623-1A', generico: 'Pertinencia',    especifico: 'Procedimiento o actividad' },
  { codigo: 'AU0202', generico: 'Autorizaciones', especifico: 'Consultas, interconsultas y atenciones (visita) domiciliaria' },
  { codigo: 'SO2101', generico: 'Soportes',       especifico: 'Número de autorización' },
  { codigo: 'TA0101', generico: 'Tarifas',        especifico: 'Estancia' },
  { codigo: 'TA0201', generico: 'Tarifas',        especifico: 'Consultas, interconsultas y atenciones (visita) domiciliaria' },
  { codigo: 'TA0801', generico: 'Tarifas',        especifico: 'Apoyo diagnóstico' },
];
