import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { LineaFacade } from './linea.facade';
import { LineaRepository } from '../../domain/ports/linea.repository';
import { PendienteRepository } from '../../domain/ports/pendiente.repository';
import { DetalleLineaModel } from '../../domain/models/linea-cuenta.model';

/**
 * Tras un cambio de estado de la cuenta —pasar a Modificación, desfinalizar, enviar— se relee lo
 * que se ve de ella: la página de líneas y la línea abierta, sin vaciarla (EST-02.4). Los códigos
 * son de prueba; ningún dato identifica a una persona.
 */

const linea = (version: number) => ({ referencia: 1, codigoCuenta: 'CM-94421', version } as DetalleLineaModel);

describe('LineaFacade — releer tras un cambio de estado', () => {
  let facade: LineaFacade;
  let repo: Record<string, ReturnType<typeof vi.fn>>;

  const asentar = async () => {
    TestBed.tick();
    await new Promise(r => setTimeout(r));
    TestBed.tick();
  };

  beforeEach(async () => {
    repo = {
      listar: vi.fn(() => of({ elementos: [], desplazamiento: 0, tamanoPagina: 25, pagina: 0,
                               totalRegistros: 0, totalPaginas: 0, hayMas: false })),
      resumirFiltros: vi.fn(() => of({ afiliados: [], catalogos: [], totalLineas: 0 })),
      consultarDetalle: vi.fn(() => of(linea(7))),
    };
    TestBed.configureTestingModule({ providers: [
      { provide: LineaRepository, useValue: repo },
      { provide: PendienteRepository, useValue: { resumirMotivos: () => of([]) } },
    ] });
    facade = TestBed.inject(LineaFacade);
    facade.cargarLineas('CM-94421');
    await facade.consultarDetalle('CM-94421', 1);
    await asentar();
  });

  it('[EST-02.4] vuelve a pedir la página de líneas y la línea abierta, que cambia de versión sin vaciarse', async () => {
    const paginas = repo['listar'].mock.calls.length;
    repo['consultarDetalle'].mockReturnValue(of(linea(8)));
    // Cada valor que se le pone al detalle: vaciarlo cerraría la pantalla de la línea.
    const poner = vi.spyOn(facade.detalleLinea, 'set');

    await facade.recargarTrasCambioDeEstado('CM-94421');
    await asentar();

    expect(repo['listar'].mock.calls.length).toBe(paginas + 1);
    expect(repo['consultarDetalle']).toHaveBeenLastCalledWith('CM-94421', 1);
    expect(facade.detalleLinea()?.version).toBe(8);
    expect(poner).toHaveBeenCalledTimes(1);
    expect(poner).not.toHaveBeenCalledWith(null);
  });

  it('[EST-02.4] lo de otra cuenta no se toca: la fachada es de toda la aplicación', async () => {
    const paginas = repo['listar'].mock.calls.length;
    const detalles = repo['consultarDetalle'].mock.calls.length;

    await facade.recargarTrasCambioDeEstado('CM-57944');
    await asentar();

    expect(repo['listar'].mock.calls.length).toBe(paginas);
    expect(repo['consultarDetalle'].mock.calls.length).toBe(detalles);
    expect(facade.detalleLinea()?.version).toBe(7);
  });
});
