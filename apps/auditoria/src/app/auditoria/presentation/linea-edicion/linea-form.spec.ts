import { DetalleLineaModel } from '../../domain/models/linea-cuenta.model';
import {
  aFechaIso, construirSolicitud, LineaFormValores, modoEfectivo, valoresDeLaLinea
} from './linea-form';

/** Lo mínimo para armar la solicitud: todo lo demás se rellena por campo. */
const valoresVacios: LineaFormValores = {
  valorCargado:        null,
  unidadesCargadas:    null,
  valorAutorizado:     null,
  unidadesAutorizadas: null,
  valorGlosado:        null,
  conservarBeneficios: null,
  conservarTarifacion: null,
  observacionesGlosa:  null,
  codigoAutorizacion:  null,
  fechaInicio:         null,
  fechaFin:            null,
  codigoNoDefinido:    null,
  codigoNoDefinidoDef: null,
  descripcionRips:     null,
  numeroContrato:      null,
  homologoCups:        null,
  codigoUnicoContratoSiifa: null,
  codigoSiniestro:     null,
  modoRecalculo:       'EN_CASCADA',
  versionEsperada:     7
};

describe('modoEfectivo', () => {
  it('abre en edición lo que se pidió editar y el registro deja editar', () => {
    expect(modoEfectivo('edicion', true)).toBe('edicion');
  });

  // La URL pide, pero la última palabra la tiene el sistema de registro: una
  // línea bloqueada o reemplazada se abre en consulta aunque se escriba
  // `/editar` a mano.
  it('degrada a consulta cuando la línea no es editable', () => {
    expect(modoEfectivo('edicion', false)).toBe('lectura');
  });

  it('no asciende a edición lo que se pidió consultar', () => {
    expect(modoEfectivo('lectura', true)).toBe('lectura');
    expect(modoEfectivo('lectura', false)).toBe('lectura');
  });
});

describe('construirSolicitud', () => {
  it('siempre lleva la versión esperada y el modo de recálculo', () => {
    const solicitud = construirSolicitud(valoresVacios);
    expect(solicitud.versionEsperada).toBe(7);
    expect(solicitud.modoRecalculo).toBe('EN_CASCADA');
  });

  // Un campo vacío no se envía y OHI conserva el que ya tiene: por eso el nulo
  // se convierte en ausencia y no en `null`, que OHI interpretaría como borrado.
  it('omite los campos que no traen valor', () => {
    const solicitud = construirSolicitud(valoresVacios);

    expect(solicitud.valorCargado).toBeUndefined();
    expect(solicitud.unidadesCargadas).toBeUndefined();
    expect(solicitud.observacionesGlosa).toBeUndefined();
    expect(solicitud.codigoAutorizacion).toBeUndefined();
    expect('valorCargado' in solicitud).toBe(true);     // la clave existe…
    expect(solicitud.valorCargado).toBeUndefined();     // …pero sin valor
  });

  it('traslada los valores que sí vienen', () => {
    const solicitud = construirSolicitud({
      ...valoresVacios,
      valorCargado:        120_000,
      unidadesCargadas:    2,
      valorAutorizado:     100_000,
      unidadesAutorizadas: 1,
      valorGlosado:        20_000,
      conservarBeneficios: true,
      conservarTarifacion: false,
      observacionesGlosa:  'Se glosa por tarifa',
      codigoAutorizacion:  'AUT-1',
      codigoNoDefinido:    'XX1',
      codigoNoDefinidoDef: 'Definición',
      descripcionRips:     'Consulta',
      numeroContrato:      'CW1',
      homologoCups:        '890264',
      codigoUnicoContratoSiifa: 'SIIFA-1',
      codigoSiniestro:     'ARL-1'
    });

    expect(solicitud).toMatchObject({
      valorCargado:        120_000,
      unidadesCargadas:    2,
      valorAutorizado:     100_000,
      unidadesAutorizadas: 1,
      valorGlosado:        20_000,
      conservarBeneficios: true,
      conservarTarifacion: false,
      observacionesGlosa:  'Se glosa por tarifa',
      codigoAutorizacion:  'AUT-1',
      codigoNoDefinido:    'XX1',
      codigoNoDefinidoDef: 'Definición',
      descripcionRips:     'Consulta',
      numeroContrato:      'CW1',
      homologoCups:        '890264',
      codigoUnicoContratoSiifa: 'SIIFA-1',
      codigoSiniestro:     'ARL-1'
    });
  });

  // Vaciar un texto sí se envía: en OHI borra el dato. Es la diferencia con las
  // fechas, que no saben decir «déjala vacía».
  it('envía la cadena vacía de un texto, que en OHI borra el dato', () => {
    const solicitud = construirSolicitud({ ...valoresVacios, descripcionRips: '' });
    expect(solicitud.descripcionRips).toBe('');
  });

  it('no envía una fecha en blanco: significa «no tocar»', () => {
    const solicitud = construirSolicitud({
      ...valoresVacios, fechaInicio: '', fechaFin: null
    });
    expect(solicitud.fechaInicio).toBeUndefined();
    expect(solicitud.fechaFin).toBeUndefined();
  });

  it('envía las fechas que sí se rellenaron', () => {
    const solicitud = construirSolicitud({
      ...valoresVacios, fechaInicio: '2026-08-05', fechaFin: '2026-08-06'
    });
    expect(solicitud.fechaInicio).toBe('2026-08-05');
    expect(solicitud.fechaFin).toBe('2026-08-06');
  });

  // El cero es un importe legítimo —glosar todo deja el autorizado en 0— y no
  // puede confundirse con «sin valor».
  it('no confunde el cero con la ausencia de valor', () => {
    const solicitud = construirSolicitud({
      ...valoresVacios, valorAutorizado: 0, unidadesAutorizadas: 0
    });
    expect(solicitud.valorAutorizado).toBe(0);
    expect(solicitud.unidadesAutorizadas).toBe(0);
  });

  // `false` tampoco: desmarcar «conservar beneficios» es una decisión, no un
  // campo sin rellenar.
  it('no confunde el falso de un «conservar» con la ausencia de valor', () => {
    const solicitud = construirSolicitud({
      ...valoresVacios, conservarBeneficios: false, conservarTarifacion: false
    });
    expect(solicitud.conservarBeneficios).toBe(false);
    expect(solicitud.conservarTarifacion).toBe(false);
  });
});

describe('aFechaIso', () => {
  // `<input type="date">` solo entiende `yyyy-MM-dd`: con un ISO con hora se
  // queda en blanco sin avisar y el auditor vería vacía una fecha que sí existe.
  it('recorta la hora de un ISO largo', () => {
    expect(aFechaIso('2026-08-05T00:00:00Z')).toBe('2026-08-05');
  });

  it('deja intacta la fecha que ya viene corta', () => {
    expect(aFechaIso('2026-08-05')).toBe('2026-08-05');
  });

  it('propaga el nulo', () => {
    expect(aFechaIso(null)).toBeNull();
    expect(aFechaIso('')).toBeNull();
  });
});

describe('valoresDeLaLinea', () => {
  const detalle = {
    valorCargado: 1000, unidadesCargadas: 1,
    valorAutorizado: 900, unidadesAutorizadas: 1,
    valorGlosado: 100,
    conservarBeneficios: true, conservarTarifacion: false,
    observacionesGlosa: 'nota',
    codigoAutorizacion: 'AUT-9',
    fechaInicio: '2026-08-05T00:00:00Z',
    fechaFin: null,
    prestacion: {
      codigoNoDefinido: 'ND', codigoNoDefinidoDef: 'NDD', descripcionRips: 'RIPS'
    },
    convenio: {
      numeroContrato: 'CW9', homologoCups: 'H9', codigoUnicoContratoSiifa: 'S9'
    },
    otrosDatos: { codigoSiniestro: 'ARL-9' },
    version: 42
  } as DetalleLineaModel;

  it('aplana el detalle sobre los campos del formulario', () => {
    expect(valoresDeLaLinea(detalle)).toMatchObject({
      valorCargado: 1000,
      observacionesGlosa: 'nota',
      codigoNoDefinido: 'ND',
      numeroContrato: 'CW9',
      codigoSiniestro: 'ARL-9'
    });
  });

  it('normaliza las fechas al formato del control del navegador', () => {
    const valores = valoresDeLaLinea(detalle);
    expect(valores.fechaInicio).toBe('2026-08-05');
    expect(valores.fechaFin).toBeNull();
  });

  // El modo de recálculo tiene impacto financiero y se decide de nuevo en cada
  // línea: no se arrastra ni se precarga.
  it('deja el modo de recálculo sin elegir', () => {
    expect(valoresDeLaLinea(detalle).modoRecalculo).toBeNull();
  });

  // Es el control de concurrencia optimista del guardado.
  it('toma la versión esperada de la línea que llegó', () => {
    expect(valoresDeLaLinea(detalle).versionEsperada).toBe(42);
  });
});
