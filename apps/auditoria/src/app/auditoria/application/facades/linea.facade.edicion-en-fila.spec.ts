import { TestBed } from '@angular/core/testing';
import { Observable, Subject, of, throwError } from 'rxjs';
import { LineaFacade } from './linea.facade';
import { LineaRepository } from '../../domain/ports/linea.repository';
import { PendienteRepository } from '../../domain/ports/pendiente.repository';
import {
  DetalleLineaModel, GuardarLineaRequest, ResumenLineaModel
} from '../../domain/models/linea-cuenta.model';
import { OffsetPage, OffsetRequest }
  from '../../../../../../../libs/data-access/http/src/lib/offset-page.model';

/**
 * El guardado desde la grilla contra un repositorio simulado (GRID-18). Ningún dato
 * identifica a una persona.
 */

const fila = (referencia: number, cambios: Partial<ResumenLineaModel> = {}): ResumenLineaModel => ({
  referencia, numeroLinea: referencia, codigoProcedimiento: '870603',
  descripcionProcedimiento: null, catalogoProcedimiento: 'CUPS', codigoAfiliado: 'X',
  nombreAfiliado: null, fechaInicio: null, fechaFin: null, codigoAutorizacion: null,
  valorAutorizado: 0, valorCargado: 1000, unidadesCargadas: 1, unidadesAutorizadas: 1,
  valorIva: null, porcentajeIva: null, valorCubierto: 0, valorGlosado: null,
  editable: true, cantidadPendientes: 0, pendientes: [], tieneNovedadBloqueante: false,
  novedades: [], version: 10, ...cambios,
});

const detalleDe = (f: ResumenLineaModel): DetalleLineaModel => ({
  valorCargado: f.valorCargado, unidadesCargadas: f.unidadesCargadas,
  valorAutorizado: f.valorAutorizado, unidadesAutorizadas: f.unidadesAutorizadas,
  valorCubierto: f.valorCubierto, valorGlosado: f.valorGlosado,
  editable: f.editable, version: f.version,
} as DetalleLineaModel);

class RepositorioSimulado extends LineaRepository {
  filas = [fila(1), fila(2)];
  listados = 0;
  guardados: { referencia: number; solicitud: GuardarLineaRequest }[] = [];
  /** Si el próximo guardado choca con otro usuario. */
  conflicto = false;
  /** Si el próximo guardado se aplica pero el servicio no puede releerlo (OPE-11). */
  sinReleer = false;
  fallo: Error | null = null;
  /** El refresco que sigue al guardado queda en vuelo hasta que la prueba lo suelte. */
  refrescoEnVuelo = false;
  private pendiente: Subject<OffsetPage<ResumenLineaModel>> | null = null;

  soltar(): void {
    const s = this.pendiente; this.pendiente = null;
    s?.next(this.pagina()); s?.complete();
  }

  private pagina(): OffsetPage<ResumenLineaModel> {
    return { elementos: [...this.filas], desplazamiento: 0, tamanoPagina: 25, pagina: 0,
             totalRegistros: this.filas.length, totalPaginas: 1, hayMas: false };
  }

  override listar(_c: string, _p: OffsetRequest): Observable<OffsetPage<ResumenLineaModel>> {
    this.listados++;
    if (this.refrescoEnVuelo && this.listados > 1) {
      this.pendiente = new Subject();
      return this.pendiente.asObservable();
    }
    return of(this.pagina());
  }
  override consultarSiguiente(): Observable<ResumenLineaModel | null> { return of(null); }
  override resumirFiltros() { return of({ afiliados: [], catalogos: [], totalLineas: 2 } as never); }
  override consultarDetalle(_c: string, referencia: number): Observable<DetalleLineaModel> {
    return of(detalleDe(this.filas.find(f => f.referencia === referencia)!));
  }
  override guardar(_c: string, referencia: number, solicitud: GuardarLineaRequest, _a: string)
      : Observable<DetalleLineaModel> {
    this.guardados.push({ referencia, solicitud });
    if (this.fallo) return throwError(() => this.fallo);
    if (this.sinReleer) {
      return throwError(() => Object.assign(
        new Error('El cambio se aplicó en el sistema de registro, pero no se pudo releer el resultado.'),
        { status: 503, codigo: 'APLICADO_SIN_RELEER' }));
    }
    if (this.conflicto) {
      return throwError(() => Object.assign(new Error('Otro usuario modificó la información.'),
                                            { status: 412, codigo: 'MODIFICACION_CONCURRENTE' }));
    }
    const i = this.filas.findIndex(f => f.referencia === referencia);
    // El motor recalcula: el cubierto sigue a lo autorizado.
    this.filas[i] = { ...this.filas[i], ...solicitud, valorCubierto: solicitud.valorAutorizado ?? 0,
                      version: this.filas[i].version + 1 };
    return of(detalleDe(this.filas[i]));
  }
  override aplicarEnLote(): never { throw new Error('no se usa aquí'); }
}

describe('LineaFacade — guardar en la fila', () => {
  let facade: LineaFacade;
  let repo: RepositorioSimulado;

  beforeEach(() => {
    repo = new RepositorioSimulado();
    TestBed.configureTestingModule({
      providers: [
        { provide: LineaRepository, useValue: repo },
        { provide: PendienteRepository, useValue: {
            resumirMotivos: () => of([]), catalogoDeMotivos: () => of([]) } },
      ],
    });
    facade = TestBed.inject(LineaFacade);
  });

  const asentar = async () => { TestBed.tick(); await Promise.resolve(); TestBed.tick(); };
  const abrir = async () => { facade.cargarLineas('CM-94421'); await asentar(); };

  it('[GRID-18] sin cambios no sale al servicio', async () => {
    await abrir();

    const r = await facade.guardarEnFila('CM-94421', facade.lineas()[0],
      { valorCargado: 1000, valorAutorizado: 0 }, 'AISLADO', 'auditor');

    expect(r.tipo).toBe('SIN_CAMBIOS');
    expect(repo.guardados).toHaveLength(0);
  });

  it('[GRID-18] manda solo lo cambiado, con la versión de la fila y el modo elegido', async () => {
    await abrir();

    await facade.guardarEnFila('CM-94421', facade.lineas()[0],
      { valorCargado: 1000, valorAutorizado: 700 }, 'EN_CASCADA', 'auditor');

    expect(repo.guardados).toEqual([{ referencia: 1, solicitud: {
      versionEsperada: 10, modoRecalculo: 'EN_CASCADA', valorAutorizado: 700 } }]);
  });

  it('[GRID-18] la fila pasa a enseñar lo devuelto y la página se refresca sin ocultar la grilla',
     async () => {
    await abrir();
    repo.refrescoEnVuelo = true;

    const r = await facade.guardarEnFila('CM-94421', facade.lineas()[0],
      { valorAutorizado: 700 }, 'AISLADO', 'auditor');
    await asentar();

    expect(r.tipo).toBe('GUARDADO');
    // Mientras llega el refresco, la tabla sigue con sus filas y la guardada ya actualizada.
    expect(facade.refrescando()).toBe(true);
    expect(facade.lineas()).toHaveLength(2);
    expect(facade.lineas()[0]).toMatchObject({ valorAutorizado: 700, valorCubierto: 700, version: 11 });
    expect(repo.listados).toBe(2);

    repo.soltar();
    await asentar();
    expect(facade.refrescando()).toBe(false);
    expect(facade.lineas()[0].version).toBe(11);
  });

  it('[GRID-18] un conflicto trae la línea releída, con su versión nueva, sin recargar la página',
     async () => {
    await abrir();
    // Otro usuario la guardó: en el servidor ya va por la versión 12 y autorizado 300.
    repo.filas[0] = { ...repo.filas[0], valorAutorizado: 300, version: 12 };
    repo.conflicto = true;

    const r = await facade.guardarEnFila('CM-94421', facade.lineas()[0],
      { valorAutorizado: 700 }, 'AISLADO', 'auditor');
    await asentar();

    expect(r.tipo).toBe('CONFLICTO');
    expect(r.tipo === 'CONFLICTO' && r.actual).toMatchObject({ valorAutorizado: 300, version: 12 });
    expect(facade.lineas()[0]).toMatchObject({ valorAutorizado: 300, version: 12 });
    expect(repo.listados).toBe(1);

    // Y el segundo intento sale con la versión nueva.
    repo.conflicto = false;
    await facade.guardarEnFila('CM-94421', facade.lineas()[0],
      { valorAutorizado: 700 }, 'AISLADO', 'auditor');
    expect(repo.guardados.at(-1)!.solicitud.versionEsperada).toBe(12);
  });

  it('[GRID-18] cualquier otro fallo se devuelve con su mensaje y no toca la fila', async () => {
    await abrir();
    repo.fallo = new Error('La línea no es editable');

    const r = await facade.guardarEnFila('CM-94421', facade.lineas()[0],
      { valorAutorizado: 700 }, 'AISLADO', 'auditor');

    expect(r).toEqual({ tipo: 'ERROR', mensaje: 'La línea no es editable' });
    expect(facade.lineas()[0].valorAutorizado).toBe(0);
  });

  it('[OPE-11] si se aplicó pero no se pudo releer, es un guardado: se recarga la página y no se ofrece repetir', async () => {
    await abrir();
    repo.sinReleer = true;

    const r = await facade.guardarEnFila('CM-94421', facade.lineas()[0],
      { valorAutorizado: 700 }, 'AISLADO', 'auditor');
    await asentar();

    expect(r.tipo).toBe('APLICADO_SIN_RELEER');
    expect(r.tipo === 'APLICADO_SIN_RELEER' && r.mensaje).toContain('se aplicó');
    expect(repo.listados).toBe(2);
    expect(repo.guardados).toHaveLength(1);
  });
});
