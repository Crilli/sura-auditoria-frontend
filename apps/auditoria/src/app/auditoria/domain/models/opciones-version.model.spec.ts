import { opcionesDeVersion, porQueNoTieneFoto } from './opciones-version.model';
import { VersionCuentaModel } from './cuenta-medica.model';

/**
 * Las versiones que ofrece el selector de la barra (BTN-12). Los códigos son de prueba; ninguno
 * identifica a una persona.
 */

const version = (numero: number, estadoDesde: string | null = null): VersionCuentaModel => ({
  numero, fechaEntrada: '2025-07-22', valor: 288_446_017, estado: 'FINALIZADA', estadoDesde,
});

/** V1 a V4 en el histórico, como las manda el servicio: de la más reciente a la más antigua. */
const CUATRO = [
  version(4, '2025-07-28T18:58:10Z'), version(3, '2025-07-24T20:45:39Z'),
  version(2, '2025-07-23T10:00:00Z'), version(1, '2025-07-22T12:00:00Z'),
];

const resumen = (opciones: ReturnType<typeof opcionesDeVersion>) =>
  opciones.map(o => `${o.destino}:${o.numero ?? '-'}:${o.rotulo ?? ''}${o.enPantalla ? ':*' : ''}`);

describe('opciones del selector de versión', () => {

  it('[BTN-12.1] una cuenta reabierta ofrece la que trabaja, en curso, y debajo sus cuatro fotos de la más reciente a la más antigua', () => {
    const opciones = opcionesDeVersion('ADJUDICACION_MANUAL', CUATRO, null);

    expect(resumen(opciones)).toEqual([
      'actual:5:en curso:*', 'foto:4:', 'foto:3:', 'foto:2:', 'foto:1:',
    ]);
    // La actual lleva el estado de la cuenta viva; las fotos, el suyo y cuándo entraron en él.
    expect(opciones[0].estado).toBe('ADJUDICACION_MANUAL');
    expect(opciones[2]).toMatchObject({ estado: 'FINALIZADA', desde: '2025-07-24T20:45:39Z' });
  });

  it('[BTN-12.1] la que se está viendo va marcada, y solo ella', () => {
    expect(resumen(opcionesDeVersion('ADJUDICACION_MANUAL', CUATRO, 3))).toEqual([
      'actual:5:en curso', 'foto:4:', 'foto:3::*', 'foto:2:', 'foto:1:',
    ]);
  });

  it('[BTN-12.1] no se fía del orden en que llegan', () => {
    const desordenadas = [CUATRO[2], CUATRO[0], CUATRO[3], CUATRO[1]];
    expect(opcionesDeVersion('MODIFICACION', desordenadas, null).map(o => o.numero))
      .toEqual([5, 4, 3, 2, 1]);
  });

  it('[BTN-12.7] una cuenta finalizada no tiene versión en curso: la última es la vigente y es la cuenta actual', () => {
    const opciones = opcionesDeVersion('FINALIZADA', CUATRO, null);

    expect(resumen(opciones)).toEqual(['actual:4:vigente:*', 'foto:3:', 'foto:2:', 'foto:1:']);
    // No se ofrece dos veces: como foto sería la misma cuenta con otra pantalla.
    expect(opciones.filter(o => o.numero === 4)).toHaveLength(1);
    expect(opciones[0].desde).toBe('2025-07-28T18:58:10Z');
  });

  it('[BTN-12.1] anulada o en un estado que no se conoce: la cuenta actual va sin número y todas las del histórico son fotos', () => {
    for (const estado of ['ANULADA', 'DESCONOCIDO', 'ESTADO NUEVO', null]) {
      expect(resumen(opcionesDeVersion(estado, CUATRO, null)))
        .toEqual(['actual:-::*', 'foto:4:', 'foto:3:', 'foto:2:', 'foto:1:']);
    }
  });

  it('[BTN-12.6] una cuenta sin transmitir no tiene nada que navegar', () => {
    expect(opcionesDeVersion('ADJUDICACION_MANUAL', [], null)).toEqual([]);
    expect(opcionesDeVersion('FINALIZADA', [], null)).toEqual([]);
  });

  it('[BTN-12.5] la siguiente a la última, en una cuenta abierta, es la que se trabaja: no tiene foto porque no se ha finalizado', () => {
    expect(porQueNoTieneFoto(5, 'ADJUDICACION_MANUAL', CUATRO)).toBe('EN_CURSO');
    expect(porQueNoTieneFoto(9, 'ADJUDICACION_MANUAL', CUATRO)).toBe('NO_EXISTE');
    // Finalizada no trabaja ninguna: la siguiente tampoco existe.
    expect(porQueNoTieneFoto(5, 'FINALIZADA', CUATRO)).toBe('NO_EXISTE');
    // Sin el estado o sin el histórico todavía, lo único seguro es que no está.
    expect(porQueNoTieneFoto(5, null, CUATRO)).toBe('NO_EXISTE');
    expect(porQueNoTieneFoto(1, 'ADJUDICACION_MANUAL', [])).toBe('NO_EXISTE');
  });
});
