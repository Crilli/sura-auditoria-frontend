import { EstadoEnOhiPipe, TextoEstadoPipe } from './estado-cuenta.pipe';

/** Los dos pipes con que toda la aplicación dice el estado de una cuenta o de una versión. */
describe('pipes de estado', () => {

  it('[BUS-19] textoEstado pone en palabras el nombre del dominio y deja tal cual lo desconocido', () => {
    const pipe = new TextoEstadoPipe();
    expect(pipe.transform('ADJUDICACION_MANUAL')).toBe('Adjudicación manual');
    expect(pipe.transform('FINALIZADA')).toBe('Finalizada');
    expect(pipe.transform('ESTADO NUEVO')).toBe('ESTADO NUEVO');
    expect(pipe.transform(null)).toBe('—');
  });

  it('[BUS-19] estadoEnOhi da la ayuda con la palabra de OHI, y nada si no aporta', () => {
    const pipe = new EstadoEnOhiPipe();
    expect(pipe.transform('ADJUDICACION_MANUAL')).toBe('En OHI: Pendiente');
    expect(pipe.transform('FINALIZADA')).toBe('En OHI: Finalizado');
    for (const sinAyuda of ['INICIAL', 'ESTADO NUEVO', 'EN_PROCESO', null, undefined]) {
      expect(pipe.transform(sinAyuda)).toBe('');
    }
  });
});
