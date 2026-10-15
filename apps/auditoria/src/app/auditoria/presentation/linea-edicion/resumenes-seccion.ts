import { DetalleLineaModel, NovedadModel } from '../../domain/models/linea-cuenta.model';

/**
 * Los resúmenes que van en la cabecera de cada sección plegable, para poder
 * recorrer la cuenta línea a línea sin abrir ningún panel.
 *
 * Son funciones puras y viven fuera del componente: las consume la plantilla
 * del contenedor —que es quien pinta las cabeceras— y así se pueden probar sin
 * levantar la pantalla.
 */

/** Resumen de importes para la cabecera del panel, sin tener que abrirlo. */
export function resumenValores(l: DetalleLineaModel): string {
  const m = (v: number | null) =>
    v == null ? '—' : v.toLocaleString('es-CO', { maximumFractionDigits: 0 });
  const partes = [`Cargado ${m(l.valorCargado)}`, `Autorizado ${m(l.valorAutorizado)}`];
  if (l.valorGlosado) partes.push(`Glosado ${m(l.valorGlosado)}`);
  return partes.join(' · ');
}

/** El diagnóstico principal, que es el que se mira primero. */
export function resumenDiagnosticos(l: DetalleLineaModel): string {
  const principal = l.diagnosticos.find(d => d.tipo === 'PRINCIPAL') ?? l.diagnosticos[0];
  if (!principal) return '';
  const resto = l.diagnosticos.length - 1;
  const texto = `${principal.codigo} ${principal.descripcion ?? ''}`.trim();
  return resto > 0 ? `${texto} · y ${resto} más` : texto;
}

/**
 * Resumen de las novedades para la cabecera del panel.
 *
 * Dice **cuántas puso una persona y cuántas el motor**, porque es lo que decide
 * qué se puede tocar, y cuántas frenan la cuenta. Antes solo contaba las de
 * severidad `BLOQUEANTE`, y además nunca llegaba a contar ninguna: el servicio
 * mandaba la severidad de un carácter y la traducción esperaba palabras, así que
 * todas llegaban como desconocidas.
 *
 * <p>Recibe la lista y no el detalle de la línea: la cabecera de la cuenta tiene
 * las suyas y el resumen es el mismo.
 */
export function resumenNovedades(novedades: NovedadModel[]): string {
  if (novedades.length === 0) return 'ninguna';

  const aMano  = novedades.filter(n => n.laPusoUnaPersona).length;
  const motor  = novedades.length - aMano;
  const frenan = novedades.filter(
    n => n.severidad === 'BLOQUEANTE' || n.severidad === 'NEGACION').length;

  const partes: string[] = [];
  if (aMano)  partes.push(`${aMano} a mano`);
  if (motor)  partes.push(`${motor} del motor`);
  if (frenan) partes.push(`${frenan} que ${frenan === 1 ? 'frena' : 'frenan'} la cuenta`);
  return partes.join(' · ');
}

export function resumenPendientes(l: DetalleLineaModel): string {
  const sinResolver = l.pendientes.filter(p => !p.resuelto);
  if (sinResolver.length === 0) return 'todos resueltos';
  const primero = sinResolver[0];
  return sinResolver.length > 1
    ? `${primero.codigo} · y ${sinResolver.length - 1} más`
    : primero.codigo;
}

/** Cuántos de los campos del bloque traen dato, para no abrirlo en balde. */
function conDato(...valores: (string | number | null | undefined)[]): number {
  return valores.filter(v => v !== null && v !== undefined && v !== '').length;
}

export function resumenPrestacion(l: DetalleLineaModel): string {
  const p = l.prestacion;
  return p.descripcion ?? p.descripcionRips ?? `${conDato(
    p.especialidad, p.codigoNoDefinido, p.descripcionRips)} datos`;
}

export function resumenConvenio(l: DetalleLineaModel): string {
  const c = l.convenio;
  if (c.numeroContrato) return `Contrato ${c.numeroContrato}`;
  const n = conDato(c.codigoTarifarioIss2001, c.codigoTarifarioIss2000,
                    c.codigoTarifarioSoat, c.homologoCups,
                    c.multiplesCupsHomologos, c.codigoUnicoContratoSiifa);
  return n > 0 ? `${n} datos` : 'sin datos';
}

export function resumenOtros(l: DetalleLineaModel): string {
  const o = l.otrosDatos;
  const partes: string[] = [];
  if (o.unidadEstrategicaNegocio) partes.push(`UEN ${o.unidadEstrategicaNegocio}`);
  if (o.codigoSiniestro)          partes.push(o.codigoSiniestro);
  if (o.tipoSala)                 partes.push(o.tipoSala);
  return partes.length ? partes.join(' · ') : 'sin datos';
}
