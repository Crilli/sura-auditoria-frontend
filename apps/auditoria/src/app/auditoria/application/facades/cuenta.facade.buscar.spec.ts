import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CuentaFacade } from './cuenta.facade';
import { CuentaRepository } from '../../domain/ports/cuenta.repository';
import { CambioNovedadRequest } from '../../domain/models/linea-cuenta.model';

/**
 * Entrar a una cuenta con el facade, que es de toda la aplicación y sobrevive a la vista: lo de la
 * cuenta anterior no viaja a la siguiente, y volver a la misma la vuelve a pedir. Ningún dato
 * identifica a una persona.
 */

const ALTA: CambioNovedadRequest = { operacion: 'AGREGAR', codigoNovedad: 'CLA-FL-PRIC-004' };

describe('CuentaFacade — entrar a una cuenta', () => {
  let facade: CuentaFacade;
  let repo: Record<string, ReturnType<typeof vi.fn>>;
  let estado: string;

  const asentar = async () => {
    TestBed.tick();
    await new Promise(r => setTimeout(r));
    TestBed.tick();
  };

  beforeEach(async () => {
    estado = 'ADJUDICACION_MANUAL';
    repo = {
      consultar:         vi.fn((codigo: string) => of({ codigo, version: 7, estado })),
      consultarAcciones: vi.fn((codigo: string) => of({ codigo, accionesDisponibles: ['ENVIAR'] })),
      guardarNovedades:  vi.fn(() => of({})),
    };
    TestBed.configureTestingModule({ providers: [{ provide: CuentaRepository, useValue: repo }] });
    facade = TestBed.inject(CuentaFacade);
    facade.buscar('CM-94421');
    await asentar();
  });

  it('[VIS-06] lo anotado y sin guardar en la cabecera de una cuenta no aparece en la siguiente que se abre, ni se guarda en ella', async () => {
    facade.anotarCambioDeNovedad(ALTA);
    facade.errorComando.set('conflicto en la otra cuenta');

    facade.buscar('cm-57944 ');
    await asentar();

    expect(facade.codigoBuscado()).toBe('CM-57944');
    expect(facade.cuenta()?.codigo).toBe('CM-57944');
    expect(facade.cambiosDeNovedad()).toEqual([]);
    expect(facade.errorComando()).toBeNull();
    // Y «Guardar», si se pulsara, no tiene nada que mandar a la cuenta nueva.
    expect(await facade.guardarNovedades('CM-57944', 'auditor')).toBe(false);
    expect(repo['guardarNovedades']).not.toHaveBeenCalled();
  });

  it('[VIS-06] volver a la misma cuenta conserva lo anotado en ella', async () => {
    facade.anotarCambioDeNovedad(ALTA);

    facade.buscar('CM-94421');
    await asentar();

    expect(facade.cambiosDeNovedad()).toEqual([ALTA]);
  });

  it('[BTN-12.7] volver a la misma cuenta la pide otra vez con sus acciones: si se finalizó entretanto, se ve finalizada', async () => {
    expect(repo['consultar']).toHaveBeenCalledTimes(1);
    expect(repo['consultarAcciones']).toHaveBeenCalledTimes(1);
    estado = 'FINALIZADA';
    repo['consultarAcciones'].mockImplementation((codigo: string) => of({ codigo, accionesDisponibles: [] }));

    facade.buscar('CM-94421');
    await asentar();

    expect(repo['consultar']).toHaveBeenCalledTimes(2);
    expect(repo['consultarAcciones']).toHaveBeenCalledTimes(2);
    expect(facade.cuenta()?.estado).toBe('FINALIZADA');
    expect(facade.permite('ENVIAR')).toBe(false);
  });

  it('[EST-01.8] [EST-01.4] un cambio rechazado porque la cuenta salió de Modificación la vuelve a pedir; otro rechazo, no', async () => {
    const pedidas = repo['consultar'].mock.calls.length;

    facade.alRechazarUnCambio(Object.assign(new Error('Conflicto'), { status: 412, codigo: 'MODIFICACION_CONCURRENTE' }));
    await asentar();
    expect(repo['consultar'].mock.calls.length).toBe(pedidas);

    estado = 'MODIFICACION';
    facade.alRechazarUnCambio(Object.assign(new Error('No está en Modificación'), { status: 409, codigo: 'CUENTA_NO_MODIFICABLE' }));
    await asentar();
    expect(repo['consultar'].mock.calls.length).toBe(pedidas + 1);
    expect(repo['consultarAcciones'].mock.calls.length).toBeGreaterThan(1);
    expect(facade.cuenta()?.estado).toBe('MODIFICACION');
  });
});
