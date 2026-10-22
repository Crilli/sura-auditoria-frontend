import { AccionCuenta, HitoModel, ResumenCuentaModel } from './cuenta-medica.model';

/**
 * Cómo se llama cada estado de la cuenta en pantalla, y cómo lo llama OHI.
 *
 * ## Un solo vocabulario
 * La cuenta viva y sus versiones hablaban dos lenguas: la cuenta el nombre del dominio
 * (`ADJUDICACION_MANUAL`) y el histórico el español de OHI («Finalizado»). Puestas una
 * encima de la otra parecían dos sistemas de estados que no se entendían. Ahora el servicio
 * publica las dos con el nombre del dominio, y esta tabla es la **única** que lo pone en
 * palabras: las del resto de la aplicación («la cuenta está en adjudicación manual»).
 *
 * ## `enOhi`: cómo lo verá el auditor en OHI
 * La palabra con que la pantalla de OHI en español escribe ese estado. Va en la ayuda al
 * pasar el ratón, para quien compare con OHI. Medida el 2026-10-19 en UAT casando al
 * milisegundo cada sello del histórico de versiones con su cambio de estado (la tabla
 * gemela, la que lee, está en `DiccionarioOhi` del servicio). Ojo con «Pendiente»: en OHI
 * es la adjudicación manual, no un motivo de pendiente. `null` donde OHI no la escribió
 * nunca en lo medido: mejor sin ayuda que con una inventada.
 */
interface NombreDeEstado {
  readonly texto: string;
  readonly enOhi: string | null;
}

const NOMBRES: Readonly<Record<string, NombreDeEstado>> = {
  INICIAL:                          { texto: 'Inicial',                          enOhi: 'Inicial' },
  DIGITACION:                       { texto: 'Digitación',                       enOhi: 'Entrada' },
  MODIFICACION:                     { texto: 'Modificación',                     enOhi: 'Cambiar' },
  TARIFACION_MANUAL:                { texto: 'Tarifación manual',                enOhi: 'Valorización Manual' },
  BENEFICIOS_MANUALES:              { texto: 'Beneficios manuales',              enOhi: 'Beneficios Manual' },
  ADJUDICACION_MANUAL:              { texto: 'Adjudicación manual',              enOhi: 'Pendiente' },
  TARIFACION_ADJUDICACION_MANUAL:   { texto: 'Tarifación y adjudicación manual', enOhi: 'Adjud. Valorización Manual' },
  TARIFACION_COMPLETA:              { texto: 'Tarifación hecha',                 enOhi: 'Valorización Hecha' },
  BENEFICIOS_COMPLETOS:             { texto: 'Beneficios hechos',                enOhi: 'Beneficios Hecho' },
  ADJUDICACION_COMPLETA:            { texto: 'Adjudicación hecha',               enOhi: 'Aprobación Hecha' },
  TARIFACION_ADJUDICACION_COMPLETA: { texto: 'Tarifación y adjudicación hechas', enOhi: 'Adjud. Valorización Hecha' },
  TARIFACION_FINALIZADA:            { texto: 'Tarifación finalizada',            enOhi: null },
  ENVIADA_A_PREPROCESO:             { texto: 'Enviada a preproceso',             enOhi: null },
  ENVIADA_A_TARIFACION:             { texto: 'Enviada a tarifación',             enOhi: null },
  EN_PROCESO:                       { texto: 'En proceso',                       enOhi: null },
  FINALIZADA:                       { texto: 'Finalizada',                       enOhi: 'Finalizado' },
  ANULADA:                          { texto: 'Anulada',                          enOhi: null },
  DESCONOCIDO:                      { texto: 'Estado no reconocido',             enOhi: null },
};

/** Los que cierran la cuenta: después de ellos no queda nada en curso. */
const CERRADOS: ReadonlySet<string> = new Set(['FINALIZADA', 'ANULADA']);

const nombreDe = (estado: string | null | undefined): NombreDeEstado | undefined =>
  estado && Object.prototype.hasOwnProperty.call(NOMBRES, estado) ? NOMBRES[estado] : undefined;

/**
 * El estado en palabras. Lo que la tabla no conoce se enseña tal cual —el servicio ya manda
 * el literal de OHI cuando su diccionario no lo traduce, y un nombre feo informa donde un
 * hueco engañaría—; sin estado, una raya.
 */
export function textoDeEstado(estado: string | null | undefined): string {
  if (!estado?.trim()) return '—';
  return nombreDe(estado)?.texto ?? estado;
}

/**
 * La palabra de OHI, para la ayuda. `null` cuando no aporta: si no se conoce, o si es la
 * misma que ya se lee («Inicial»).
 */
export function estadoEnOhi(estado: string | null | undefined): string | null {
  const nombre = nombreDe(estado);
  if (!nombre?.enOhi) return null;
  return nombre.enOhi.toLocaleLowerCase('es') === nombre.texto.toLocaleLowerCase('es')
    ? null : nombre.enOhi;
}

/**
 * Si la cuenta tiene una versión abierta: un estado conocido que no la cierra.
 *
 * Un estado que la tabla no conoce **no** cuenta como abierto. No se sabe qué es, y decir
 * «en curso» de una cuenta que quizá esté anulada sería inventar; sin la fila en curso la
 * lista sigue siendo cierta.
 */
export function estaAbierta(estado: string | null | undefined): boolean {
  return !!nombreDe(estado) && estado !== 'DESCONOCIDO' && !CERRADOS.has(estado!);
}

/**
 * El rótulo de la versión más reciente del histórico.
 *
 * El histórico solo guarda una versión cuando la cuenta se finaliza, así que la última que
 * tiene es siempre una versión **cerrada**. Solo es la vigente si la cuenta sigue
 * finalizada; si se reabrió, la vigente es la que está en curso y aquélla es la última que se
 * finalizó. Llamarla «vigente» junto a una cuenta en adjudicación manual era lo que hacía
 * parecer que los dos estados se contradecían.
 */
export function rotuloDeLaUltimaVersion(estadoDeLaCuenta: string | null | undefined): string {
  return laUltimaEsLaVigente(estadoDeLaCuenta) ? 'vigente' : 'última finalizada';
}

/** Si la última versión del histórico es la vigente: solo mientras la cuenta siga finalizada. */
export function laUltimaEsLaVigente(estadoDeLaCuenta: string | null | undefined): boolean {
  return estadoDeLaCuenta === 'FINALIZADA';
}

// ── El envío y el paso a Modificación (reglas del 2026-10-21) ────────────────
//
// Lo que la barra ofrece según el estado. Son funciones puras y no un `computed` de la vista
// para que la regla se lea y se pruebe en un sitio, sin montar nada. Lo que **no** está aquí es
// si la cuenta admite cambios de datos: eso lo publica el servicio (`admiteCambios` de la
// cabecera) y la pantalla lo obedece, no lo deduce del estado.

/**
 * El rótulo del botón de envío (BTN-13). En adjudicación manual —«Pendiente» en OHI— lo que el
 * auditor hace es aceptar la cuenta; en el resto de estados, enviarla. Por debajo es el mismo
 * envío (`claim:submit`), con el mismo cuerpo: solo cambia la palabra.
 */
export function rotuloDelEnvio(estado: string | null | undefined): 'Aceptar' | 'Enviar' {
  return estado === 'ADJUDICACION_MANUAL' ? 'Aceptar' : 'Enviar';
}

/**
 * Si la barra lleva el botón de envío. Solo desaparece con la cuenta finalizada; en cualquier
 * otro estado —anulada, en proceso o uno que la aplicación no reconoce incluidos— está, y si
 * OHI no deja enviar, lo dice el servicio al pulsarlo (BTN-13.6, BTN-13.7). Una anulada es
 * FINALIZED en OHI, así que también se queda sin él. Sin estado no hay cuenta que enviar.
 */
export function seMuestraElEnvio(estado: string | null | undefined): boolean {
  return !!estado && estado !== 'FINALIZADA';
}

/**
 * Con qué acción se pasa la cuenta a Modificación (EST-02), o `null` si ya está en ella o no
 * hay estado. Una finalizada se desfinaliza (`claim:unfinalize`), que en OHI la deja
 * directamente en Modificación —medido: 117 de 117 en PROD, 423 de 423 en UAT—; cualquier
 * otra se devuelve (`claim:tochange`). Si OHI publica o no esa acción ahora mismo es otra
 * pregunta, y la contesta la lista de acciones.
 */
export function accionParaPasarAModificacion(estado: string | null | undefined): AccionCuenta | null {
  if (!estado || estado === 'MODIFICACION') return null;
  return estado === 'FINALIZADA' ? 'REVERTIR_FINALIZACION' : 'DEVOLVER_A_MODIFICACION';
}

/**
 * Por qué no se pueden cambiar los datos de la cuenta, para el aviso que lo dice una vez por
 * pantalla (EST-01.4). Remite al botón de la barra, que es el único camino. Un estado que la
 * aplicación no reconoce no se nombra con la etiqueta de la tabla —«está en Estado no
 * reconocido» no se lee—, sino diciendo que no se reconoce.
 */
export function motivoParaNoCambiarDatos(estado: string | null | undefined): string {
  const donde = !estado?.trim() || estado === 'DESCONOCIDO'
    ? 'un estado que la aplicación no reconoce'
    : textoDeEstado(estado);
  return `La cuenta está en ${donde}: sus datos solo se cambian en Modificación. `
    + 'Use «Pasar a Modificación» en la barra.';
}

/** La versión que la cuenta tiene abierta y que todavía no está en el histórico. */
export interface VersionEnCursoModel {
  /** El número que tendrá cuando se finalice: el siguiente al de la última del histórico. */
  numero: number;
  /** El de la cuenta viva, que es el de esta versión. */
  estado: string;
  /** Cuándo entró en ese estado. `null` si la historia no lo dice sin lugar a dudas. */
  desde: string | null;
  /** Por qué se reabrió, solo si la reapertura es posterior a la última finalización. */
  motivoReapertura: string | null;
}

const instante = (fecha: string | null | undefined): number =>
  fecha ? Date.parse(fecha) : Number.NaN;

/** El último hito de un tipo, por fecha: no se confía en el orden en que lleguen. */
function ultimoDe(hitos: readonly HitoModel[], tipo: HitoModel['tipo']): HitoModel | null {
  let ultimo: HitoModel | null = null;
  for (const h of hitos) {
    if (h.tipo !== tipo || Number.isNaN(instante(h.ocurridoEn))) continue;
    if (!ultimo || instante(h.ocurridoEn) >= instante(ultimo.ocurridoEn)) ultimo = h;
  }
  return ultimo;
}

/**
 * La versión en curso de una cuenta, o `null` si no tiene ninguna abierta.
 *
 * Solo la tienen las cuentas **abiertas con histórico**: una que nunca se finalizó no tiene
 * versiones que comparar, y una finalizada no tiene nada en curso.
 *
 * @param hitos la historia de la cuenta, si ya llegó. Sin ella la versión en curso se da
 *              igual, sin fecha ni motivo: son contexto, no lo que la define.
 *
 * Las dos guardas, porque la historia puede no ser de esta vuelta:
 * - **desde**: el último cambio de estado tiene que ser al estado que la cuenta tiene hoy
 *   y posterior a la última finalización. Si no, la historia llegó corta o vieja y la fecha
 *   sería de otra cosa.
 * - **motivo**: el sistema de registro guarda como mucho un motivo de reapertura por cuenta,
 *   que puede ser de una vuelta anterior. Solo se da si es posterior a la última finalización.
 *
 * Pide solo el estado y las versiones, no el resumen entero del buscador: la barra de la cuenta
 * (BTN-12) la usa con la cuenta viva, que no es un resumen.
 */
export function versionEnCurso(cuenta: Pick<ResumenCuentaModel, 'estado' | 'versiones'>,
                               hitos: readonly HitoModel[] | null): VersionEnCursoModel | null {
  if (!estaAbierta(cuenta.estado) || cuenta.versiones.length === 0) return null;

  const ultima = cuenta.versiones.reduce((a, v) => (v.numero > a.numero ? v : a));
  const finalizadaEn = instante(ultima.estadoDesde);
  const despuesDeFinalizar = (h: HitoModel) =>
    !Number.isNaN(finalizadaEn) && instante(h.ocurridoEn) >= finalizadaEn;

  const cambio = ultimoDe(hitos ?? [], 'CAMBIO_DE_ESTADO');
  const reapertura = ultimoDe(hitos ?? [], 'DESFINALIZACION');

  return {
    numero: ultima.numero + 1,
    estado: cuenta.estado,
    desde: cambio && cambio.etiqueta === cuenta.estado && despuesDeFinalizar(cambio)
      ? cambio.ocurridoEn : null,
    motivoReapertura: reapertura && despuesDeFinalizar(reapertura)
      ? (reapertura.detalle || reapertura.etiqueta || null) : null,
  };
}
