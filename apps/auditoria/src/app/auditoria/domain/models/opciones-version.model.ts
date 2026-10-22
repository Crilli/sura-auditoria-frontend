import { VersionCuentaModel } from './cuenta-medica.model';
import { estaAbierta, laUltimaEsLaVigente, versionEnCurso } from './estado-cuenta.model';

/**
 * Las versiones entre las que se navega desde la barra de la cuenta (BTN-12).
 *
 * ## Dos clases de destino
 * - **la cuenta actual**: la viva, la que se audita y se edita. Es la de siempre, la de
 *   `/auditoria/{codigo}/lineas`;
 * - **la foto de una versión**: cómo quedó la cuenta al finalizarse esa versión, leída del
 *   histórico de lo transmitido y en solo lectura (`/auditoria/{codigo}/versiones/{n}`).
 *
 * ## Qué número lleva la cuenta actual
 * El histórico solo guarda una versión al finalizarse, así que la cuenta actual nunca es una
 * foto, pero sí puede tener número:
 * - abierta con histórico: trabaja la **siguiente** a la última finalizada, que todavía no tiene
 *   foto («V9 · en curso»; medido en CM-29939061906, histórico hasta la V8 y reabierta el
 *   21-sep-2026). Todas las del histórico se ofrecen como fotos;
 * - finalizada: la última del histórico **es** la cuenta actual («V8 · vigente», BUS-13.5). No se
 *   ofrece dos veces: como foto sería la misma cuenta con otra pantalla;
 * - anulada o en un estado que no se conoce: no se sabe qué número trabaja, y decirlo sería
 *   inventar. Va sin número y todas las del histórico como fotos.
 *
 * Una cuenta sin versiones no tiene nada que navegar: no hay selector (BTN-12.6).
 */
export interface OpcionDeVersion {
  /** `actual` lleva a la cuenta viva; `foto`, a la foto de esa versión del histórico. */
  readonly destino: 'actual' | 'foto';
  /** `null` solo en la cuenta actual de una cuenta anulada o de estado desconocido. */
  readonly numero: number | null;
  /** «en curso» o «vigente» en la cuenta actual; `null` en las fotos. */
  readonly rotulo: 'en curso' | 'vigente' | null;
  /** El de la cuenta viva en la actual; el de la versión en las fotos. */
  readonly estado: string | null;
  /** Cuándo entró la versión en su estado (la finalización). `null` si no se sabe. */
  readonly desde: string | null;
  /** Su fecha de entrada, por si falta `desde`. */
  readonly fechaEntrada: string | null;
  /** Si es la que se está viendo: el selector la marca con `aria-current`. */
  readonly enPantalla: boolean;
}

/**
 * Las opciones del selector, la cuenta actual primero y luego las fotos de la más reciente a la
 * más antigua, sin fiarse del orden en que lleguen.
 *
 * @param numeroEnPantalla el número de la foto que se está viendo, o `null` en la cuenta actual.
 */
export function opcionesDeVersion(
    estadoDeLaCuenta: string | null | undefined,
    versiones: readonly VersionCuentaModel[],
    numeroEnPantalla: number | null): OpcionDeVersion[] {
  if (versiones.length === 0) return [];

  const ordenadas = [...versiones].sort((a, b) => b.numero - a.numero);
  const ultima = ordenadas[0];
  const vigente = laUltimaEsLaVigente(estadoDeLaCuenta);
  const enCurso = versionEnCurso({ estado: estadoDeLaCuenta ?? '', versiones: ordenadas }, null);

  const actual: OpcionDeVersion = {
    destino: 'actual',
    numero: enCurso?.numero ?? (vigente ? ultima.numero : null),
    rotulo: enCurso ? 'en curso' : (vigente ? 'vigente' : null),
    estado: estadoDeLaCuenta ?? null,
    desde: vigente ? ultima.estadoDesde : null,
    fechaEntrada: vigente ? ultima.fechaEntrada : null,
    enPantalla: numeroEnPantalla === null,
  };

  const fotos = (vigente ? ordenadas.slice(1) : ordenadas).map((v): OpcionDeVersion => ({
    destino: 'foto',
    numero: v.numero,
    rotulo: null,
    estado: v.estado,
    desde: v.estadoDesde,
    fechaEntrada: v.fechaEntrada,
    enPantalla: v.numero === numeroEnPantalla,
  }));

  return [actual, ...fotos];
}

/**
 * Por qué una versión pedida por la URL no tiene foto.
 *
 * - `EN_CURSO`: es la que la cuenta está trabajando —la siguiente a la última del histórico, en
 *   una cuenta abierta—. Existe, pero es la cuenta actual: todavía no se ha finalizado.
 * - `NO_EXISTE`: no está en el histórico, ni es la que se trabaja.
 *
 * Mientras no se sepa el estado de la cuenta o sus versiones, `NO_EXISTE`: es lo único seguro.
 */
export function porQueNoTieneFoto(
    numero: number,
    estadoDeLaCuenta: string | null | undefined,
    versiones: readonly VersionCuentaModel[]): 'EN_CURSO' | 'NO_EXISTE' {
  if (!estaAbierta(estadoDeLaCuenta)) return 'NO_EXISTE';
  const enCurso = versionEnCurso({ estado: estadoDeLaCuenta ?? '', versiones: [...versiones] }, null);
  return enCurso?.numero === numero ? 'EN_CURSO' : 'NO_EXISTE';
}
