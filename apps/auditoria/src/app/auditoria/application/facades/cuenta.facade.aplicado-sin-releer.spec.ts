import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { CuentaFacade } from './cuenta.facade';
import { CuentaRepository } from '../../domain/ports/cuenta.repository';

/**
 * Un comando de cabecera que se aplicó pero no se pudo releer (OPE-11): se trata como hecho,
 * se recarga y no se ofrece repetirlo. Ningún dato identifica a una persona.
 */

const aplicadoSinReleer = () => Object.assign(
  new Error('El cambio se aplicó en el sistema de registro, pero no se pudo releer el resultado.'),
  { codigo: 'APLICADO_SIN_RELEER', status: 503 });

describe('CuentaFacade — aplicado sin releer', () => {
  let facade: CuentaFacade;
  let repo: Record<string, ReturnType<typeof vi.fn>>;

  beforeEach(async () => {
    repo = {
      // En Modificación: fuera de ella las novedades de cabecera no se guardan (EST-01).
      consultar:         vi.fn(() => of({ codigo: 'CM-94421', version: 491,
                                          estado: 'MODIFICACION', admiteCambios: true })),
      consultarAcciones: vi.fn(() => of({ accionesDisponibles: [] })),
      guardarNovedades:  vi.fn(() => throwError(aplicadoSinReleer)),
      ejecutarAccion:    vi.fn(() => throwError(aplicadoSinReleer)),
    };
    TestBed.configureTestingModule({ providers: [{ provide: CuentaRepository, useValue: repo }] });
    facade = TestBed.inject(CuentaFacade);
    facade.buscar('CM-94421');
    TestBed.tick();
    await new Promise(r => setTimeout(r));
  });

  it('[OPE-11] las novedades de cabecera se dan por guardadas: se limpian y se recarga', async () => {
    facade.anotarCambioDeNovedad({ operacion: 'AGREGAR', codigoMensaje: 'CLA-FL-PRIC-004' } as never);
    const consultasAntes = repo['consultar'].mock.calls.length;

    const hecho = await facade.guardarNovedades('CM-94421', 'auditor');
    TestBed.tick();

    expect(hecho).toBe(true);
    expect(facade.cambiosDeNovedad()).toEqual([]);
    expect(facade.errorComando()).toBeNull();
    expect(repo['consultar'].mock.calls.length).toBeGreaterThan(consultasAntes);
  });

  it('[OPE-11] una acción aplicada sin relectura se da por hecha y recarga cuenta y acciones', async () => {
    const accionesAntes = repo['consultarAcciones'].mock.calls.length;

    const hecho = await facade.ejecutarAccion('CM-94421', 'DEVOLVER_A_MODIFICACION', {} as never, 'auditor');
    TestBed.tick();

    expect(hecho).toBe(true);
    expect(facade.errorComando()).toBeNull();
    expect(repo['consultarAcciones'].mock.calls.length).toBeGreaterThan(accionesAntes);
  });

  it('[OPE-11] cualquier otro error sigue siendo un error', async () => {
    repo['ejecutarAccion'].mockReturnValue(throwError(() => Object.assign(new Error('conflicto'),
      { codigo: 'MODIFICACION_CONCURRENTE', status: 412 })));

    const hecho = await facade.ejecutarAccion('CM-94421', 'DEVOLVER_A_MODIFICACION', {} as never, 'auditor');

    expect(hecho).toBe(false);
    expect(facade.errorComando()).toBe('conflicto');
  });
});
