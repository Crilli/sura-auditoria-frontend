import {
  accionParaPasarAModificacion, estaAbierta, estadoEnOhi, motivoParaNoCambiarDatos, rotuloDeLaUltimaVersion,
  rotuloDelEnvio, seMuestraElEnvio, textoDeEstado, versionEnCurso
} from './estado-cuenta.model';
import { HitoModel, ResumenCuentaModel } from './cuenta-medica.model';

/**
 * El estado de la cuenta y de sus versiones en un solo vocabulario. Los códigos y facturas
 * son de prueba; ninguno identifica a una persona.
 */

/** Una cuenta reabierta: ocho versiones finalizadas y hoy en adjudicación manual. */
const cuenta = (cambios: Partial<ResumenCuentaModel> = {}): ResumenCuentaModel => ({
  codigo: 'CM-29939061906', numeroFactura: 'FE445731', fechaRadicacion: '2025-02-14',
  prestadorNit: '800000000', prestadorNombre: 'Prestador de prueba', valorFactura: 288_446_017,
  estado: 'ADJUDICACION_MANUAL',
  versiones: [
    { numero: 8, fechaEntrada: '2025-07-22', valor: 288_446_017, estado: 'FINALIZADA',
      estadoDesde: '2025-07-28T18:58:10Z' },
    { numero: 7, fechaEntrada: '2025-07-22', valor: 288_446_017, estado: 'FINALIZADA',
      estadoDesde: '2025-07-24T20:45:39Z' },
  ],
  ...cambios,
});

const hito = (tipo: HitoModel['tipo'], etiqueta: string, ocurridoEn: string,
              detalle: string | null = null): HitoModel => ({
  tipo, etiqueta, detalle, ocurridoEn, autor: 'Internal System User', loHizoElSistema: true,
});

/** Lo que pasó de verdad en UAT: finalizada el 28-jul-2025, reabierta el 21-sep-2026. */
const HISTORIA: HitoModel[] = [
  hito('CAMBIO_DE_ESTADO', 'FINALIZADA', '2025-07-28T18:58:10Z'),
  hito('CAMBIO_DE_ESTADO', 'MODIFICACION', '2026-09-21T15:50:08Z'),
  hito('DESFINALIZACION', 'RESPUESTA_GLOSA_BLOQUEO', '2026-09-21T15:50:08Z',
       'Respuesta a glosa con bloqueo'),
  hito('CAMBIO_DE_ESTADO', 'ADJUDICACION_MANUAL', '2026-09-21T16:45:48Z'),
];

describe('estado de la cuenta — un solo vocabulario', () => {

  it('[BUS-19] la adjudicación manual se lee en palabras, no con el nombre del dominio', () => {
    expect(textoDeEstado('ADJUDICACION_MANUAL')).toBe('Adjudicación manual');
    expect(textoDeEstado('FINALIZADA')).toBe('Finalizada');
    expect(textoDeEstado('EN_PROCESO')).toBe('En proceso');
    expect(textoDeEstado('ANULADA')).toBe('Anulada');
  });

  it('[BUS-19] lo que la tabla no conoce se enseña tal cual, y sin estado una raya', () => {
    expect(textoDeEstado('ESTADO NUEVO')).toBe('ESTADO NUEVO');
    expect(textoDeEstado(null)).toBe('—');
    expect(textoDeEstado('  ')).toBe('—');
    // Una clave del prototipo no es un estado.
    expect(textoDeEstado('toString')).toBe('toString');
  });

  it('[BUS-19] la ayuda da la palabra de OHI: «Pendiente» es la adjudicación manual', () => {
    expect(estadoEnOhi('ADJUDICACION_MANUAL')).toBe('Pendiente');
    expect(estadoEnOhi('ADJUDICACION_COMPLETA')).toBe('Aprobación Hecha');
    expect(estadoEnOhi('FINALIZADA')).toBe('Finalizado');
  });

  it('[BUS-19] sin ayuda cuando no aporta: palabra igual, desconocida o no medida', () => {
    expect(estadoEnOhi('INICIAL')).toBeNull();
    expect(estadoEnOhi('ESTADO NUEVO')).toBeNull();
    expect(estadoEnOhi('EN_PROCESO')).toBeNull();
    expect(estadoEnOhi(undefined)).toBeNull();
  });

  it('[BUS-13] abierta es un estado conocido que no la cierra; lo desconocido no cuenta', () => {
    expect(estaAbierta('ADJUDICACION_MANUAL')).toBe(true);
    expect(estaAbierta('MODIFICACION')).toBe(true);
    expect(estaAbierta('FINALIZADA')).toBe(false);
    expect(estaAbierta('ANULADA')).toBe(false);
    expect(estaAbierta('DESCONOCIDO')).toBe(false);
    expect(estaAbierta('ESTADO NUEVO')).toBe(false);
    expect(estaAbierta(null)).toBe(false);
  });

  it('[BUS-13] la última del histórico solo es la vigente si la cuenta sigue finalizada', () => {
    expect(rotuloDeLaUltimaVersion('FINALIZADA')).toBe('vigente');
    expect(rotuloDeLaUltimaVersion('ADJUDICACION_MANUAL')).toBe('última finalizada');
    expect(rotuloDeLaUltimaVersion('ANULADA')).toBe('última finalizada');
    expect(rotuloDeLaUltimaVersion('ESTADO NUEVO')).toBe('última finalizada');
  });
});

describe('la versión en curso', () => {

  it('[BUS-13] una cuenta reabierta trabaja la versión siguiente, con el estado de la cuenta', () => {
    expect(versionEnCurso(cuenta(), HISTORIA)).toEqual({
      numero: 9, estado: 'ADJUDICACION_MANUAL',
      desde: '2026-09-21T16:45:48Z', motivoReapertura: 'Respuesta a glosa con bloqueo',
    });
  });

  it('[BUS-13] sin la historia todavía, se da igual pero sin fecha ni motivo', () => {
    expect(versionEnCurso(cuenta(), null)).toEqual({
      numero: 9, estado: 'ADJUDICACION_MANUAL', desde: null, motivoReapertura: null,
    });
  });

  it('[BUS-13] no la tiene una finalizada, una anulada, una de estado desconocido ni una sin histórico', () => {
    expect(versionEnCurso(cuenta({ estado: 'FINALIZADA' }), HISTORIA)).toBeNull();
    expect(versionEnCurso(cuenta({ estado: 'ANULADA' }), HISTORIA)).toBeNull();
    expect(versionEnCurso(cuenta({ estado: 'ESTADO NUEVO' }), HISTORIA)).toBeNull();
    expect(versionEnCurso(cuenta({ versiones: [] }), HISTORIA)).toBeNull();
  });

  it('[BUS-13] el número sale de la mayor, aunque lleguen desordenadas', () => {
    const desordenadas = cuenta({ versiones: [...cuenta().versiones].reverse() });
    expect(versionEnCurso(desordenadas, null)?.numero).toBe(9);
  });

  it('[BUS-13] la fecha solo si el último cambio es al estado de hoy: una historia corta no la inventa', () => {
    // Si la historia llegó cortada, su último cambio es de otra vuelta y no vale.
    const cortada = HISTORIA.slice(0, 2);
    expect(versionEnCurso(cuenta(), cortada)?.desde).toBeNull();
  });

  it('[BUS-13] la fecha y el motivo solo si son posteriores a la última finalización', () => {
    // OHI guarda un solo motivo por cuenta, que puede ser de una reapertura anterior.
    const vieja: HitoModel[] = [
      hito('DESFINALIZACION', 'CORRECCION', '2025-07-24T20:00:00Z', 'Corrección'),
      hito('CAMBIO_DE_ESTADO', 'ADJUDICACION_MANUAL', '2025-07-24T21:00:00Z'),
    ];
    expect(versionEnCurso(cuenta(), vieja)).toMatchObject({ desde: null, motivoReapertura: null });
  });

  it('[BUS-13] no se fía del orden en que llega la historia', () => {
    const alReves = [...HISTORIA].reverse();
    expect(versionEnCurso(cuenta(), alReves)).toMatchObject({
      desde: '2026-09-21T16:45:48Z', motivoReapertura: 'Respuesta a glosa con bloqueo',
    });
  });

  it('[BUS-13] sin fecha de finalización en la última versión no se da ni fecha ni motivo', () => {
    const sinFecha = cuenta({
      versiones: [{ numero: 8, fechaEntrada: null, valor: null, estado: 'FINALIZADA', estadoDesde: null }],
    });
    expect(versionEnCurso(sinFecha, HISTORIA)).toMatchObject({
      numero: 9, desde: null, motivoReapertura: null,
    });
  });

  it('[BUS-13] si la reapertura no trae texto, se da su código', () => {
    const sinTexto = HISTORIA.map(h => h.tipo === 'DESFINALIZACION' ? { ...h, detalle: null } : h);
    expect(versionEnCurso(cuenta(), sinTexto)?.motivoReapertura).toBe('RESPUESTA_GLOSA_BLOQUEO');
  });
});

describe('el envío y el paso a Modificación (reglas del 2026-10-21)', () => {

  /** Los estados en que el botón está y no es la adjudicación manual: todos leen «Enviar». */
  const OTROS = ['MODIFICACION', 'DIGITACION', 'TARIFACION_MANUAL', 'BENEFICIOS_MANUALES', 'EN_PROCESO',
                 'ANULADA', 'DESCONOCIDO', 'ESTADO NUEVO'];

  it('[BTN-13.1] en adjudicación manual el envío se llama «Aceptar»', () => {
    expect(rotuloDelEnvio('ADJUDICACION_MANUAL')).toBe('Aceptar');
  });

  it('[BTN-08] [BTN-13.2] [BTN-13.10] en Modificación y en cualquier otro estado se llama «Enviar»', () => {
    for (const estado of OTROS) expect(rotuloDelEnvio(estado)).toBe('Enviar');
    expect(rotuloDelEnvio(null)).toBe('Enviar');
  });

  it('[BTN-13.5] [BTN-13.6] el botón solo desaparece con la cuenta finalizada; anulada, en proceso o desconocida lo tienen', () => {
    expect(seMuestraElEnvio('FINALIZADA')).toBe(false);
    for (const estado of ['ADJUDICACION_MANUAL', ...OTROS]) expect(seMuestraElEnvio(estado)).toBe(true);
    // Sin estado no hay cuenta que enviar; una clave del prototipo es un estado más, no un truco.
    expect(seMuestraElEnvio(null)).toBe(false);
    expect(seMuestraElEnvio('toString')).toBe(true);
  });

  it('[EST-02.1] [EST-02.3] fuera de Modificación se pasa devolviendo; una finalizada, desfinalizando', () => {
    expect(accionParaPasarAModificacion('ADJUDICACION_MANUAL')).toBe('DEVOLVER_A_MODIFICACION');
    expect(accionParaPasarAModificacion('TARIFACION_MANUAL')).toBe('DEVOLVER_A_MODIFICACION');
    expect(accionParaPasarAModificacion('DESCONOCIDO')).toBe('DEVOLVER_A_MODIFICACION');
    expect(accionParaPasarAModificacion('ANULADA')).toBe('DEVOLVER_A_MODIFICACION');
    expect(accionParaPasarAModificacion('FINALIZADA')).toBe('REVERTIR_FINALIZACION');
  });

  it('[EST-02.6] en Modificación, o sin estado, no hay a dónde pasar', () => {
    expect(accionParaPasarAModificacion('MODIFICACION')).toBeNull();
    expect(accionParaPasarAModificacion(null)).toBeNull();
    expect(accionParaPasarAModificacion('')).toBeNull();
  });

  it('[EST-01.4] el aviso dice el estado en palabras y remite a «Pasar a Modificación» de la barra', () => {
    expect(motivoParaNoCambiarDatos('ADJUDICACION_MANUAL')).toBe(
      'La cuenta está en Adjudicación manual: sus datos solo se cambian en Modificación. '
      + 'Use «Pasar a Modificación» en la barra.');
    expect(motivoParaNoCambiarDatos('FINALIZADA')).toContain('está en Finalizada:');
    // Un estado que no se reconoce no se nombra con la etiqueta de la tabla.
    expect(motivoParaNoCambiarDatos('DESCONOCIDO')).toContain('está en un estado que la aplicación no reconoce:');
    expect(motivoParaNoCambiarDatos(null)).toContain('un estado que la aplicación no reconoce');
  });
});
