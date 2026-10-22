import { TestBed } from '@angular/core/testing';
import { Observable, Subject, of, throwError } from 'rxjs';
import { LineaFacade } from './linea.facade';
import { CuentaFacade } from './cuenta.facade';
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
 *
 * Cifras distintas por concepto —cargado 1000, convenido 900, autorizado 800, glosado 100— para
 * que un cruce entre convenido (`allowedAmount`) y autorizado (`coveredAmount`) se note.
 */

const fila = (referencia: number, cambios: Partial<ResumenLineaModel> = {}): ResumenLineaModel => ({
  referencia, numeroLinea: referencia, codigoProcedimiento: '870603',
  descripcionProcedimiento: null, catalogoProcedimiento: 'CUPS', codigoAfiliado: 'X',
  nombreAfiliado: null, fechaInicio: null, fechaFin: null, codigoAutorizacion: null,
  valorCargado: 1000, unidadesCargadas: 3, valorConvenido: 900, unidadesConvenidas: 2,
  valorAutorizado: 800, unidadesAutorizadas: 1,
  valorIva: null, porcentajeIva: null, valorGlosado: 100,
  editable: true, cantidadPendientes: 0, pendientes: [], tieneNovedadBloqueante: false,
  novedades: [], version: 10, ...cambios,
});

const detalleDe = (f: ResumenLineaModel): DetalleLineaModel => ({
  valorCargado: f.valorCargado, unidadesCargadas: f.unidadesCargadas,
  valorConvenido: f.valorConvenido, unidadesConvenidas: f.unidadesConvenidas,
  valorAutorizado: f.valorAutorizado, unidadesAutorizadas: f.unidadesAutorizadas,
  valorGlosado: f.valorGlosado,
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
    // El motor recalcula el autorizado a partir del convenido: aquí, 100 menos de cobertura.
    const convenido = solicitud.valorConvenido ?? this.filas[i].valorConvenido;
    this.filas[i] = { ...this.filas[i], ...solicitud,
                      valorAutorizado: convenido === null ? null : convenido - 100,
                      version: this.filas[i].version + 1 };
    return of(detalleDe(this.filas[i]));
  }
  override aplicarEnLote(): never { throw new Error('no se usa aquí'); }
}

describe('LineaFacade — guardar en la fila', () => {
  let facade: LineaFacade;
  let repo: RepositorioSimulado;
  let cuentas: { alRechazarUnCambio: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    repo = new RepositorioSimulado();
    cuentas = { alRechazarUnCambio: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        { provide: LineaRepository, useValue: repo },
        { provide: CuentaFacade, useValue: cuentas },
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
      { valorCargado: 1000, valorConvenido: 900 }, 'AISLADO', 'auditor');

    expect(r.tipo).toBe('SIN_CAMBIOS');
    expect(repo.guardados).toHaveLength(0);
  });

  it('[GRID-18] manda solo lo cambiado, con la versión de la fila y el modo elegido', async () => {
    await abrir();

    await facade.guardarEnFila('CM-94421', facade.lineas()[0],
      { valorCargado: 1000, valorConvenido: 700 }, 'EN_CASCADA', 'auditor');

    expect(repo.guardados).toEqual([{ referencia: 1, solicitud: {
      versionEsperada: 10, modoRecalculo: 'EN_CASCADA', valorConvenido: 700 } }]);
    // El autorizado no viaja nunca: lo calcula el motor y el servicio lo rechazaría con 400.
    expect(repo.guardados[0].solicitud).not.toHaveProperty('valorAutorizado');
    expect(repo.guardados[0].solicitud).not.toHaveProperty('unidadesAutorizadas');
  });

  it('[GRID-18] la fila pasa a enseñar lo devuelto y la página se refresca sin ocultar la grilla',
     async () => {
    await abrir();
    repo.refrescoEnVuelo = true;

    const r = await facade.guardarEnFila('CM-94421', facade.lineas()[0],
      { valorConvenido: 700 }, 'AISLADO', 'auditor');
    await asentar();

    expect(r.tipo).toBe('GUARDADO');
    // Mientras llega el refresco, la tabla sigue con sus filas y la guardada ya actualizada.
    expect(facade.refrescando()).toBe(true);
    expect(facade.lineas()).toHaveLength(2);
    // El convenido es lo tecleado y el autorizado, lo que recalculó el motor: cada uno en su campo.
    expect(facade.lineas()[0]).toMatchObject({
      valorConvenido: 700, valorAutorizado: 600, unidadesAutorizadas: 1, version: 11 });
    expect(repo.listados).toBe(2);

    repo.soltar();
    await asentar();
    expect(facade.refrescando()).toBe(false);
    expect(facade.lineas()[0].version).toBe(11);
  });

  it('[GRID-18] un conflicto trae la línea releída, con su versión nueva, sin recargar la página',
     async () => {
    await abrir();
    // Otro usuario la guardó: en el servidor ya va por la versión 12 y convenido 300.
    repo.filas[0] = { ...repo.filas[0], valorConvenido: 300, version: 12 };
    repo.conflicto = true;

    const r = await facade.guardarEnFila('CM-94421', facade.lineas()[0],
      { valorConvenido: 700 }, 'AISLADO', 'auditor');
    await asentar();

    expect(r.tipo).toBe('CONFLICTO');
    expect(r.tipo === 'CONFLICTO' && r.actual).toMatchObject({ valorConvenido: 300, version: 12 });
    expect(facade.lineas()[0]).toMatchObject({ valorConvenido: 300, version: 12 });
    expect(repo.listados).toBe(1);

    // Y el segundo intento sale con la versión nueva.
    repo.conflicto = false;
    await facade.guardarEnFila('CM-94421', facade.lineas()[0],
      { valorConvenido: 700 }, 'AISLADO', 'auditor');
    expect(repo.guardados.at(-1)!.solicitud.versionEsperada).toBe(12);
  });

  it('[GRID-18] cualquier otro fallo se devuelve con su mensaje y no toca la fila', async () => {
    await abrir();
    repo.fallo = new Error('La línea no es editable');

    const r = await facade.guardarEnFila('CM-94421', facade.lineas()[0],
      { valorConvenido: 700 }, 'AISLADO', 'auditor');

    expect(r).toEqual({ tipo: 'ERROR', mensaje: 'La línea no es editable' });
    expect(facade.lineas()[0]).toMatchObject({ valorConvenido: 900, valorAutorizado: 800 });
  });

  it('[EST-01.6] si la cuenta salió de Modificación por detrás, el 409 se lee con el texto del servicio', async () => {
    await abrir();
    // Así lo deja el interceptor: el `mensaje` del cuerpo como texto del error, y el código aparte.
    // No es un conflicto de versión: releer la línea no lo arregla, hay que pasar la cuenta.
    const mensaje = 'La cuenta CM-94421 está en Adjudicación manual: sus datos solo se cambian en '
                  + 'Modificación. Pásela a Modificación y vuelva a intentarlo.';
    repo.fallo = Object.assign(new Error(mensaje), { status: 409, codigo: 'CUENTA_NO_MODIFICABLE' });

    const r = await facade.guardarEnFila('CM-94421', facade.lineas()[0],
      { valorConvenido: 700 }, 'AISLADO', 'auditor');

    expect(r).toEqual({ tipo: 'ERROR', mensaje });
    expect(facade.lineas()[0]).toMatchObject({ valorConvenido: 900, version: 10 });
  });

  it('[EST-01.8] [EST-01.4] ese 409 hace releer la cuenta: la fila se cierra sola y aparece «Pasar a Modificación»', async () => {
    await abrir();
    const rechazo = Object.assign(new Error('La cuenta no está en Modificación.'),
      { status: 409, codigo: 'CUENTA_NO_MODIFICABLE' });
    repo.fallo = rechazo;

    await facade.guardarEnFila('CM-94421', facade.lineas()[0], { valorConvenido: 700 }, 'AISLADO', 'auditor');

    // Es la fachada de la cuenta la que decide por el código; aquí solo se le pasa el rechazo.
    expect(cuentas.alRechazarUnCambio).toHaveBeenCalledWith(rechazo);
  });

  it('[OPE-11] si se aplicó pero no se pudo releer, es un guardado: se recarga la página y no se ofrece repetir', async () => {
    await abrir();
    repo.sinReleer = true;

    const r = await facade.guardarEnFila('CM-94421', facade.lineas()[0],
      { valorConvenido: 700 }, 'AISLADO', 'auditor');
    await asentar();

    expect(r.tipo).toBe('APLICADO_SIN_RELEER');
    expect(r.tipo === 'APLICADO_SIN_RELEER' && r.mensaje).toContain('se aplicó');
    expect(repo.listados).toBe(2);
    expect(repo.guardados).toHaveLength(1);
  });
});
