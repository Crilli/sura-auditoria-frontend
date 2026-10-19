import {
  estaAbierta, estadoEnOhi, rotuloDeLaUltimaVersion, textoDeEstado, versionEnCurso
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
