import { DetalleLineaModel } from '../../domain/models/linea-cuenta.model';

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

export function resumenNovedades(l: DetalleLineaModel): string {
  const bloqueantes = l.novedades.filter(n => n.severidad === 'BLOQUEANTE').length;
  return bloqueantes > 0
    ? `${l.novedades.length} · ${bloqueantes} bloqueante${bloqueantes > 1 ? 's' : ''}`
    : `${l.novedades.length}`;
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
