import { TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';
import { BusquedaFacade } from './busqueda.facade';
import { CuentaRepository } from '../../domain/ports/cuenta.repository';
import {
  FiltroCuentasModel, HitoModel, ResumenCuentaModel
} from '../../domain/models/cuenta-medica.model';
import { OffsetPage } from '../../../../../../../libs/data-access/http/src/lib/offset-page.model';

/**
 * El buscador contra un repositorio simulado. Los códigos y facturas son de prueba; ninguno
 * identifica a una persona.
 */

interface Peticion { filtro: FiltroCuentasModel; pagina: number; tamano: number }

class RepositorioSimulado {
  readonly peticiones: Peticion[] = [];
  filas: ResumenCuentaModel[] = [];
  total: number | null = null;
  fallo: Error | null = null;
  readonly historiasPedidas: string[] = [];
  falloDeHistoria: Error | null = null;
  hitos: HitoModel[] = [];

  consultarHistoria(codigo: string): Observable<HitoModel[]> {
    this.historiasPedidas.push(codigo);
    return this.falloDeHistoria ? throwError(() => this.falloDeHistoria) : of(this.hitos);
  }

  buscar(filtro: FiltroCuentasModel, pagina: number, tamano: number)
      : Observable<OffsetPage<ResumenCuentaModel>> {
    this.peticiones.push({ filtro, pagina, tamano });
    if (this.fallo) return throwError(() => this.fallo);
    return of({
      elementos: this.filas, desplazamiento: pagina * tamano, tamanoPagina: tamano, pagina,
      totalRegistros: this.total ?? this.filas.length,
      totalPaginas: Math.ceil((this.total ?? this.filas.length) / tamano),
      hayMas: (pagina + 1) * tamano < (this.total ?? this.filas.length),
    });
  }
}

const cuenta = (codigo: string): ResumenCuentaModel => ({
  codigo, numeroFactura: 'JONATHAN201', fechaRadicacion: '2026-10-01',
  prestadorNit: '800000000', prestadorNombre: 'Prestador de prueba', valorFactura: 8_800_000,
  estado: 'FINALIZADA', versiones: [],
});

describe('BusquedaFacade', () => {
  let facade: BusquedaFacade;
  let repo: RepositorioSimulado;

  beforeEach(() => {
    repo = new RepositorioSimulado();
    TestBed.configureTestingModule({
      providers: [{ provide: CuentaRepository, useValue: repo }],
    });
    facade = TestBed.inject(BusquedaFacade);
  });

  const asentar = async () => { TestBed.tick(); await Promise.resolve(); TestBed.tick(); };

  it('[BUS-01] sin criterio no sale al servicio', async () => {
    await asentar();
    facade.buscar({ factura: '   ', radicado: '' });
    await asentar();

    expect(facade.hayCriterio()).toBe(false);
    expect(repo.peticiones).toHaveLength(0);
    // Sin búsqueda no hay «no hay resultados»: todavía no se ha preguntado nada.
    expect(facade.sinResultados()).toBe(false);
  });

  it('[BUS-03] una factura radicada tres veces trae las tres cuentas', async () => {
    repo.filas = [cuenta('CM-1'), cuenta('CM-2'), cuenta('CM-3')];

    facade.buscar({ factura: ' JONATHAN201 ' });
    await asentar();

    expect(repo.peticiones.at(-1)!.filtro).toEqual({ factura: 'JONATHAN201', radicado: null });
    expect(facade.resultados().map(c => c.codigo)).toEqual(['CM-1', 'CM-2', 'CM-3']);
    expect(facade.total()).toBe(3);
  });

  it('[BUS-03] una factura que no existe deja la lista vacía y lo dice, sin error', async () => {
    facade.buscar({ factura: 'NO-EXISTE' });
    await asentar();

    expect(facade.resultados()).toEqual([]);
    expect(facade.error()).toBeNull();
    expect(facade.sinResultados()).toBe(true);
  });

  it('[BUS-05] busca por el principio del radicado', async () => {
    facade.buscar({ radicado: 'CM-9442' });
    await asentar();

    expect(repo.peticiones.at(-1)!.filtro).toEqual({ factura: null, radicado: 'CM-9442' });
  });

  it('[BUS-01] una búsqueda nueva vuelve a la primera página', async () => {
    repo.filas = [cuenta('CM-1')];
    repo.total = 60;
    facade.buscar({ factura: 'JONATHAN201' });
    await asentar();
    facade.irAPagina(2);
    await asentar();
    expect(repo.peticiones.at(-1)!.pagina).toBe(2);
    expect(facade.hayMas()).toBe(false);

    facade.buscar({ radicado: 'CM-9442' });
    await asentar();

    expect(facade.pagina()).toBe(0);
    expect(repo.peticiones.at(-1)!.pagina).toBe(0);
    expect(facade.totalPaginas()).toBe(3);
  });

  it('[BUS-01] no se puede ir a una página negativa', () => {
    facade.irAPagina(-4);
    expect(facade.pagina()).toBe(0);
  });

  it('[BUS-01] una búsqueda caída se publica como error, sin romper la lista', async () => {
    repo.fallo = new Error('El sistema de registro no responde');
    facade.buscar({ factura: 'JONATHAN201' });
    await asentar();

    expect(facade.error()?.message).toBe('El sistema de registro no responde');
    expect(facade.resultados()).toEqual([]);
    expect(facade.sinResultados()).toBe(false);
  });

  it('[BUS-01] limpiar deja el buscador como al entrar', async () => {
    facade.buscar({ factura: 'JONATHAN201' });
    await asentar();
    facade.limpiar();
    await asentar();

    expect(facade.hayCriterio()).toBe(false);
    expect(facade.filtro()).toEqual({});
    expect(facade.pagina()).toBe(0);
  });

  describe('la historia que alimenta la versión en curso', () => {
    const HITO: HitoModel = {
      tipo: 'CAMBIO_DE_ESTADO', etiqueta: 'ADJUDICACION_MANUAL', detalle: null,
      autor: 'Internal System User', loHizoElSistema: true, ocurridoEn: '2026-09-21T16:45:48Z',
    };

    it('[BUS-13] se pide una sola vez por cuenta, aunque se despliegue dos veces', () => {
      repo.hitos = [HITO];
      facade.cargarHistoria('CM-1');
      facade.cargarHistoria('CM-1');

      expect(repo.historiasPedidas).toEqual(['CM-1']);
      expect(facade.historiaDe('CM-1')).toEqual([HITO]);
      expect(facade.historiaDe('CM-2')).toBeNull();
    });

    it('[BUS-13] si falla no deja error y se puede reintentar', () => {
      repo.falloDeHistoria = new Error('sin red');
      facade.cargarHistoria('CM-1');
      expect(facade.historiaDe('CM-1')).toBeNull();
      expect(facade.error()).toBeNull();

      repo.falloDeHistoria = null;
      repo.hitos = [HITO];
      facade.cargarHistoria('CM-1');
      expect(repo.historiasPedidas).toEqual(['CM-1', 'CM-1']);
      expect(facade.historiaDe('CM-1')).toEqual([HITO]);
    });

    it('[BUS-13] buscar otra vez la vuelve a pedir: es querer ver la cuenta como está ahora', () => {
      repo.hitos = [HITO];
      facade.cargarHistoria('CM-1');
      facade.buscar({ radicado: 'CM-1' });
      expect(facade.historiaDe('CM-1')).toBeNull();

      facade.cargarHistoria('CM-1');
      expect(repo.historiasPedidas).toEqual(['CM-1', 'CM-1']);
    });
  });
});
