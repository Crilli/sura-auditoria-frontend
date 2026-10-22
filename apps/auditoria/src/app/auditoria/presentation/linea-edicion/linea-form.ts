import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DetalleLineaModel, GuardarLineaRequest } from '../../domain/models/linea-cuenta.model';
import { ModoLinea } from './modo-linea';

/**
 * Un control por cada campo que OHI acepta escribir en una línea, más los dos
 * que no son de la línea sino del guardado (versión esperada y modo de
 * recálculo).
 *
 * Aquí NO entra nada que no se vaya a enviar. `construirSolicitud()` lee el
 * formulario con `getRawValue()`, que devuelve también los controles
 * deshabilitados, así que `disable()` no sirve para retener un campo: si un
 * dato no debe viajar, no se le pone control.
 */
export interface LineaFormControls {
  valorCargado:        FormControl<number | null>;
  unidadesCargadas:    FormControl<number | null>;
  /**
   * El convenido (`allowedAmount`). El autorizado (`coveredAmount`) no tiene control: lo calcula
   * el motor de coberturas y no se envía nunca (ver la nota de arriba sobre `getRawValue()`).
   */
  valorConvenido:      FormControl<number | null>;
  unidadesConvenidas:  FormControl<number | null>;
  valorGlosado:        FormControl<number | null>;
  conservarBeneficios: FormControl<boolean | null>;
  conservarTarifacion: FormControl<boolean | null>;
  observacionesGlosa:  FormControl<string | null>;

  codigoAutorizacion:  FormControl<string | null>;
  fechaInicio:         FormControl<string | null>;
  fechaFin:            FormControl<string | null>;

  codigoNoDefinido:    FormControl<string | null>;
  codigoNoDefinidoDef: FormControl<string | null>;
  descripcionRips:     FormControl<string | null>;

  numeroContrato:           FormControl<string | null>;
  homologoCups:             FormControl<string | null>;
  codigoUnicoContratoSiifa: FormControl<string | null>;

  codigoSiniestro:     FormControl<string | null>;

  modoRecalculo:       FormControl<'EN_CASCADA' | 'AISLADO' | null>;
  versionEsperada:     FormControl<number | null>;
}

/**
 * El formulario de la línea. Se nombra porque los hijos de presentación lo
 * reciben por `input()` y necesitan tiparlo igual que el contenedor.
 */
export type LineaFormGroup = FormGroup<LineaFormControls>;

/** Lo que devuelve `getRawValue()` sobre ese formulario. */
export type LineaFormValores = {
  [K in keyof LineaFormControls]:
    LineaFormControls[K] extends FormControl<infer V> ? V : never;
};

/**
 * Arma el formulario de la línea.
 *
 * Las longitudes son las del contrato de escritura de OHI (`claimline` en
 * `GET /claimsupdate/definition`). Se repiten como `maxlength` en la plantilla
 * para que el campo no deje teclear de más; el validador queda como red por
 * si el valor llega por otra vía que no sea el teclado.
 *
 * Ninguno lleva `Validators.required`, ni los que OHI exige no nulos
 * (unidades cargadas, fecha de inicio): OHI omite esas unidades en parte de
 * las líneas, y un `required` dejaría el formulario inválido al abrirlo y
 * bloquearía el guardado de la línea entera. Un campo vacío simplemente no
 * se envía y OHI conserva el que ya tiene.
 */
export function crearFormularioLinea(fb: FormBuilder): LineaFormGroup {
  return fb.group<LineaFormControls>({
    valorCargado:        new FormControl<number | null>(null, [Validators.min(0)]),
    unidadesCargadas:    new FormControl<number | null>(null, [Validators.min(0)]),
    valorConvenido:      new FormControl<number | null>(null, [Validators.min(0)]),
    unidadesConvenidas:  new FormControl<number | null>(null, [Validators.min(0)]),
    valorGlosado:        new FormControl<number | null>(null, [Validators.min(0)]),
    conservarBeneficios: new FormControl<boolean | null>(false),
    conservarTarifacion: new FormControl<boolean | null>(false),
    observacionesGlosa:  new FormControl<string | null>(null, [Validators.maxLength(1000)]),

    codigoAutorizacion:  new FormControl<string | null>(null, [Validators.maxLength(30)]),
    fechaInicio:         new FormControl<string | null>(null),
    fechaFin:            new FormControl<string | null>(null),

    codigoNoDefinido:    new FormControl<string | null>(null, [Validators.maxLength(30)]),
    codigoNoDefinidoDef: new FormControl<string | null>(null, [Validators.maxLength(30)]),
    descripcionRips:     new FormControl<string | null>(null, [Validators.maxLength(100)]),

    numeroContrato:           new FormControl<string | null>(null, [Validators.maxLength(30)]),
    homologoCups:             new FormControl<string | null>(null, [Validators.maxLength(30)]),
    codigoUnicoContratoSiifa: new FormControl<string | null>(null, [Validators.maxLength(300)]),

    codigoSiniestro:     new FormControl<string | null>(null, [Validators.maxLength(20)]),

    modoRecalculo:       new FormControl<'EN_CASCADA' | 'AISLADO' | null>(
                           null, [Validators.required]
                         ),
    versionEsperada:     new FormControl<number | null>(null, [Validators.required])
  });
}

/**
 * Normaliza una fecha de OHI al formato que acepta `<input type="date">`.
 *
 * El control del navegador solo entiende `yyyy-MM-dd`: con cualquier otra
 * forma —un ISO con hora, por ejemplo— se queda en blanco sin avisar, y el
 * auditor vería vacía una fecha que sí existe.
 */
export function aFechaIso(valor: string | null): string | null {
  if (!valor) return null;
  return valor.length > 10 ? valor.slice(0, 10) : valor;
}

/** Los valores con los que se refleja en el formulario la línea que llegó. */
export function valoresDeLaLinea(detalle: DetalleLineaModel): LineaFormValores {
  return {
    valorCargado:        detalle.valorCargado,
    unidadesCargadas:    detalle.unidadesCargadas,
    valorConvenido:      detalle.valorConvenido,
    unidadesConvenidas:  detalle.unidadesConvenidas,
    valorGlosado:        detalle.valorGlosado,
    conservarBeneficios: detalle.conservarBeneficios,
    conservarTarifacion: detalle.conservarTarifacion,
    observacionesGlosa:  detalle.observacionesGlosa,

    codigoAutorizacion:  detalle.codigoAutorizacion,
    fechaInicio:         aFechaIso(detalle.fechaInicio),
    fechaFin:            aFechaIso(detalle.fechaFin),

    codigoNoDefinido:    detalle.prestacion.codigoNoDefinido,
    codigoNoDefinidoDef: detalle.prestacion.codigoNoDefinidoDef,
    descripcionRips:     detalle.prestacion.descripcionRips,

    numeroContrato:           detalle.convenio.numeroContrato,
    homologoCups:             detalle.convenio.homologoCups,
    codigoUnicoContratoSiifa: detalle.convenio.codigoUnicoContratoSiifa,

    codigoSiniestro:     detalle.otrosDatos.codigoSiniestro,

    // Sin valor por defecto a propósito: el modo de recálculo tiene impacto
    // financiero y se decide de nuevo en cada línea.
    modoRecalculo:       null,
    versionEsperada:     detalle.version
  };
}

/**
 * Una fecha en blanco no se envía.
 *
 * El contrato solo admite `yyyy-MM-dd`, así que no hay forma de pedir «déjala
 * vacía»: un campo de fecha sin rellenar significa «no tocar». Los de texto
 * sí distinguen los dos casos —vaciarlos borra el dato en OHI—, por eso ahí
 * basta con `?? undefined`.
 */
function fechaOpcional(valor: string | null): string | undefined {
  return valor ? valor : undefined;
}

/** Cuerpo del PATCH a partir de lo que hay en el formulario. */
export function construirSolicitud(raw: LineaFormValores): GuardarLineaRequest {
  return {
    versionEsperada:     raw.versionEsperada!,
    modoRecalculo:       raw.modoRecalculo!,

    valorCargado:        raw.valorCargado ?? undefined,
    unidadesCargadas:    raw.unidadesCargadas ?? undefined,
    valorConvenido:      raw.valorConvenido ?? undefined,
    unidadesConvenidas:  raw.unidadesConvenidas ?? undefined,
    valorGlosado:        raw.valorGlosado ?? undefined,
    conservarBeneficios: raw.conservarBeneficios ?? undefined,
    conservarTarifacion: raw.conservarTarifacion ?? undefined,
    observacionesGlosa:  raw.observacionesGlosa ?? undefined,

    codigoAutorizacion:  raw.codigoAutorizacion ?? undefined,
    fechaInicio:         fechaOpcional(raw.fechaInicio),
    fechaFin:            fechaOpcional(raw.fechaFin),

    codigoNoDefinido:    raw.codigoNoDefinido ?? undefined,
    codigoNoDefinidoDef: raw.codigoNoDefinidoDef ?? undefined,
    descripcionRips:     raw.descripcionRips ?? undefined,

    numeroContrato:           raw.numeroContrato ?? undefined,
    homologoCups:             raw.homologoCups ?? undefined,
    codigoUnicoContratoSiifa: raw.codigoUnicoContratoSiifa ?? undefined,

    codigoSiniestro:     raw.codigoSiniestro ?? undefined
  };
}

/**
 * Modo que de verdad se aplica. La URL pide, pero la última palabra la tiene
 * el sistema de registro: una línea bloqueada o reemplazada se abre en
 * consulta aunque se escriba `/editar` a mano, y degrada sola si deja de ser
 * editable con la pantalla ya abierta.
 */
export function modoEfectivo(pedido: ModoLinea, editable: boolean): ModoLinea {
  return pedido === 'edicion' && editable ? 'edicion' : 'lectura';
}
