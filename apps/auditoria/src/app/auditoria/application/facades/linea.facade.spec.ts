import { TestBed } from '@angular/core/testing';
import { Observable, Subject, of } from 'rxjs';
import { LineaFacade } from './linea.facade';
import { LineaRepository } from '../../domain/ports/linea.repository';
import { PendienteRepository } from '../../domain/ports/pendiente.repository';
import {
  ResumenLineaModel, DetalleLineaModel, GuardarLineaRequest,
  FiltroLineasModel, ResumenFiltrosLineasModel
} from '../../domain/models/linea-cuenta.model';
import { OffsetPage, OffsetRequest }
  from '../../../../../../../libs/data-access/http/src/lib/offset-page.model';

/**
 * La paginación del listado de líneas, contra un repositorio simulado.
 *
 * Lo que se prueba aquí es lo que el cambio a desplazamiento tenía que arreglar:
 * que se pueda ir a cualquier página —y a la última— con **una** petición, y que
 * un filtro sin total no deje la pantalla sin forma de avanzar.
 */

/** Qué se pidió, en orden: es la mitad de lo que hay que comprobar. */
interface Peticion { codigo: string; pagina: OffsetRequest; filtro?: FiltroLineasModel }

class RepositorioSimulado extends LineaRepository {

  readonly peticiones: Peticion[] = [];
  /** Cuántas líneas tiene la cuenta simulada. La medida en el entorno de pruebas. */
  total: number | null = 212;
  /**
   * Si las respuestas quedan en vuelo hasta que la prueba las suelte.
   *
   * Hace falta para comprobar qué se ve **mientras** llega una página: con
   * respuestas inmediatas ese instante no existe, y es justo el que el
   * paginador tiene que sobrevivir.
   */
  enVuelo = false;
  private pendiente: Subject<OffsetPage<ResumenLineaModel>> | null = null;

  soltar(): void {
    const s = this.pendiente;
    this.pendiente = null;
    if (s) { s.next(this.armar(this.peticiones.at(-1)!.pagina)); s.complete(); }
  }

  override listar(
    codigoCuenta: string,
    pagina: OffsetRequest,
    filtro?: FiltroLineasModel
  ): Observable<OffsetPage<ResumenLineaModel>> {
    this.peticiones.push({ codigo: codigoCuenta, pagina, filtro });

    if (this.enVuelo) {
      this.pendiente = new Subject<OffsetPage<ResumenLineaModel>>();
      return this.pendiente.asObservable();
    }
    return of(this.armar(pagina));
  }

  private armar(pagina: OffsetRequest): OffsetPage<ResumenLineaModel> {
    const desplazamiento = pagina.pagina * pagina.tamano;
    const cuantas = this.total === null
      ? pagina.tamano
      : Math.max(0, Math.min(pagina.tamano, this.total - desplazamiento));

    return {
      elementos: Array.from({ length: cuantas }, (_, i) =>
        ({ referencia: 46_000_000_000 + desplazamiento + i,
           numeroLinea: desplazamiento + i + 1 } as ResumenLineaModel)),
      desplazamiento,
      tamanoPagina: pagina.tamano,
      pagina: pagina.pagina,
      totalRegistros: this.total,
      totalPaginas: this.total === null ? null : Math.ceil(this.total / pagina.tamano),
      hayMas: this.total === null ? true : desplazamiento + cuantas < this.total
    };
  }

  override consultarSiguiente(): Observable<ResumenLineaModel | null> { return of(null); }
  override resumirFiltros(): Observable<ResumenFiltrosLineasModel> {
    return of({ afiliados: [], catalogos: [], totalLineas: this.total ?? 0 } as unknown as
               ResumenFiltrosLineasModel);
  }
  override consultarDetalle(): Observable<DetalleLineaModel> {
    return of({} as DetalleLineaModel);
  }
  override guardar(
    _codigoCuenta: string, _referencia: number,
    _solicitud: GuardarLineaRequest, _auditor: string
  ): Observable<DetalleLineaModel> {
    return of({} as DetalleLineaModel);
  }
}

describe('LineaFacade — paginación por desplazamiento', () => {

  let facade: LineaFacade;
  let repo: RepositorioSimulado;

  beforeEach(() => {
    repo = new RepositorioSimulado();
    TestBed.configureTestingModule({
      providers: [
        { provide: LineaRepository, useValue: repo },
        // La grilla ofrece filtrar por motivo de pendiente, así que la fachada consume
        // el mismo agregado que la pestaña de pendientes. Aquí solo hace falta que no
        // reviente: lo que se prueba en este fichero es la paginación y los filtros.
        { provide: PendienteRepository, useValue: {
            resumirMotivos: () => of([]),
            catalogoDeMotivos: () => of([]),
        } },
      ]
    });
    facade = TestBed.inject(LineaFacade);
  });

  /** rxResource resuelve en un microtick: hay que dejarlo correr. */
  const asentar = async () => { TestBed.tick(); await Promise.resolve(); TestBed.tick(); };

  it('arranca en la página 1 pidiendo la posición cero', async () => {
    facade.cargarLineas('CM-35343660784');
    await asentar();

    expect(repo.peticiones[0].pagina).toEqual({ pagina: 0, tamano: 25 });
    expect(facade.paginaActual()).toBe(1);
    expect(facade.lineas().length).toBe(25);
  });

  it('[F3-CNT-01] publica el total y cuántas páginas hay', async () => {
    facade.cargarLineas('CM-35343660784');
    await asentar();

    expect(facade.totalLineas()).toBe(212);
    // 212 entre 25 son 8,48: la novena existe aunque vaya a medias.
    expect(facade.totalPaginas()).toBe(9);
  });

  it('va a la última página con una sola petición', async () => {
    // Es el fallo que se reportó: con cursor, «última» exigía recorrer todas las
    // intermedias, así que por encima del tope el botón quedaba apagado.
    facade.cargarLineas('CM-35343660784');
    await asentar();
    const antes = repo.peticiones.length;

    await facade.ultimaPagina();
    await asentar();

    expect(repo.peticiones.length).toBe(antes + 1);
    // Se comprueban los campos que importan y no el objeto entero: la petición lleva
    // además el orden vigente, y fijar su forma completa rompería por cada campo nuevo.
    expect(repo.peticiones.at(-1)?.pagina).toMatchObject({ pagina: 8, tamano: 25 });
    expect(facade.paginaActual()).toBe(9);
  });

  it('en la última página no ofrece seguir avanzando', async () => {
    facade.cargarLineas('CM-35343660784');
    await asentar();
    await facade.ultimaPagina();
    await asentar();

    expect(facade.lineas().length).toBe(12);      // 212 − 200
    expect(facade.hayPaginaSiguiente()).toBe(false);
    expect(facade.puedeIrAUltima()).toBe(false);
    expect(facade.hayPaginaAnterior()).toBe(true);
  });

  it('salta a una página del medio sin pasar por las anteriores', async () => {
    facade.cargarLineas('CM-35343660784');
    await asentar();
    const antes = repo.peticiones.length;

    await facade.irAPagina(5);
    await asentar();

    expect(repo.peticiones.length).toBe(antes + 1);
    expect(repo.peticiones.at(-1)?.pagina.pagina).toBe(4);
    expect(facade.lineas()[0].numeroLinea).toBe(101);
  });

  it('no pide nada si se pide la página en la que ya se está', async () => {
    facade.cargarLineas('CM-35343660784');
    await asentar();
    const antes = repo.peticiones.length;

    await facade.irAPagina(1);
    await asentar();

    expect(repo.peticiones.length).toBe(antes);
  });

  it('no pide nada por una página que no existe', async () => {
    facade.cargarLineas('CM-35343660784');
    await asentar();
    const antes = repo.peticiones.length;

    await facade.irAPagina(0);
    await facade.irAPagina(-3);
    await facade.irAPagina(999);
    await asentar();

    expect(repo.peticiones.length).toBe(antes);
  });

  it('[F3-CNT-03] sin total no hay números de página, pero sí «siguiente»', async () => {
    // Es el régimen del filtro que el servicio no sabe empujar: su total contaría
    // filas que después descarta, así que no lo manda.
    repo.total = null;
    facade.cargarLineas('CM-35343660784');
    await asentar();

    expect(facade.totalPaginas()).toBeNull();
    expect(facade.puedeIrAUltima()).toBe(false);
    expect(facade.hayPaginaSiguiente()).toBe(true);

    await facade.paginaSiguiente();
    await asentar();

    expect(facade.paginaActual()).toBe(2);
  });

  it('[F3-ORD-00] ordenar por una columna manda el orden al servicio y vuelve a la página 1', async () => {
    facade.cargarLineas('CM-35343660784');
    await asentar();
    await facade.irAPagina(5);
    await asentar();

    facade.ordenarPor('valor_glosado');
    await asentar();

    expect(repo.peticiones.at(-1)?.pagina).toMatchObject({
      pagina: 0, orden: 'valor_glosado', sentido: 'asc'
    });
    expect(facade.paginaActual()).toBe(1);
  });

  it('[F3-ORD-00] pulsar la columna que ya ordena invierte el sentido', async () => {
    facade.cargarLineas('CM-35343660784');
    await asentar();

    facade.ordenarPor('valor_glosado');
    await asentar();
    facade.ordenarPor('valor_glosado');
    await asentar();

    expect(repo.peticiones.at(-1)?.pagina.sentido).toBe('desc');
  });

  it('[F3-ORD-08] al cambiar de página se conserva el orden: no se reordena por página', async () => {
    facade.cargarLineas('CM-35343660784');
    await asentar();
    facade.ordenarPor('fecha_atencion');
    await asentar();

    await facade.paginaSiguiente();
    await asentar();

    expect(repo.peticiones.at(-1)?.pagina).toMatchObject({
      pagina: 1, orden: 'fecha_atencion', sentido: 'asc'
    });
  });

  it('cambiar el filtro vuelve a la página 1', async () => {
    facade.cargarLineas('CM-35343660784');
    await asentar();
    await facade.irAPagina(5);
    await asentar();

    facade.aplicarFiltro({ cedulaAfiliado: 'CC1' });
    await asentar();

    expect(facade.paginaActual()).toBe(1);
    expect(repo.peticiones.at(-1)?.pagina.pagina).toBe(0);
    expect(repo.peticiones.at(-1)?.filtro?.cedulaAfiliado).toBe('CC1');
  });

  it('[F3-CNT-03] el total se conserva mientras llega la página siguiente', async () => {
    // Si se leyera del recurso, que no tiene valor mientras carga, el paginador
    // se quedaría sin números en cada salto y la tabla parpadearía.
    facade.cargarLineas('CM-35343660784');
    await asentar();
    expect(facade.totalPaginas()).toBe(9);

    repo.enVuelo = true;
    await facade.irAPagina(5);
    await asentar();

    expect(facade.loading()).toBe(true);
    expect(facade.totalLineas()).toBe(212);
    expect(facade.totalPaginas()).toBe(9);

    repo.soltar();
    await asentar();
    expect(facade.lineas()[0].numeroLinea).toBe(101);
  });

  it('cambiar el filtro borra el total anterior antes de que llegue el nuevo', async () => {
    // Conservarlo ofrecería las nueve páginas de antes de filtrar sobre un
    // resultado que ya no las tiene.
    facade.cargarLineas('CM-35343660784');
    await asentar();
    expect(facade.totalPaginas()).toBe(9);

    repo.enVuelo = true;
    facade.aplicarFiltro({ cedulaAfiliado: 'CC1' });
    await asentar();

    expect(facade.totalLineas()).toBeNull();
    expect(facade.totalPaginas()).toBeNull();
  });

  // ── los criterios que viven en una colección hija de la línea ──────────────
  //
  // Lo que importa aquí es que NO degradan la paginación. El catálogo y el techo de glosa
  // obligan al servicio a recorrer la cuenta y la página llega sin total; estos tres se
  // empujan al sistema de registro —medido el 17-oct-2026— así que el paginador sigue
  // numerando. Si alguien los añadiera a `exigeRecorrido`, la pantalla perdería los
  // números de página sin que nada fallara en voz alta.

  it('[F3-NOV-01] «con novedad» viaja al servicio y no obliga a recorrer la cuenta',
     async () => {
    facade.cargarLineas('CM-35343660784');
    await asentar();

    facade.aplicarFiltro({ conNovedad: true });
    await asentar();

    expect(repo.peticiones.at(-1)!.filtro?.conNovedad).toBe(true);
    expect(facade.exigeRecorrido()).toBe(false);
  });

  it('[F2-06] el motivo de pendiente viaja al servicio', async () => {
    facade.cargarLineas('CM-35343660784');
    await asentar();

    facade.aplicarFiltro({ motivoPendiente: 'MP_EVALUAR_UEN' });
    await asentar();

    expect(repo.peticiones.at(-1)!.filtro?.motivoPendiente).toBe('MP_EVALUAR_UEN');
    expect(facade.exigeRecorrido()).toBe(false);
  });

  it('[F2-06] el filtro de bloqueo viaja con el mismo vocabulario que pendientes',
     async () => {
    facade.cargarLineas('CM-35343660784');
    await asentar();

    facade.aplicarFiltro({ bloqueo: 'BLOQUEANTES' });
    await asentar();

    expect(repo.peticiones.at(-1)!.filtro?.bloqueo).toBe('BLOQUEANTES');
    expect(facade.exigeRecorrido()).toBe(false);
  });

  it('[F2-05] al llegar desde un motivo, el filtro queda puesto y se pide la página 1',
     async () => {
    // Es el circuito «veo el motivo → corrijo la línea»: la pestaña de pendientes deja
    // el criterio en la fachada antes de navegar, y la grilla abre ya filtrada.
    facade.cargarLineas('CM-35343660784');
    await asentar();
    facade.irAPagina(5);
    await asentar();

    facade.limpiarTodosLosFiltros();
    facade.aplicarFiltro({ motivoPendiente: 'MP_LINEA_SIN_ESPECIALIDAD' });
    await asentar();

    const ultima = repo.peticiones.at(-1)!;
    expect(ultima.filtro?.motivoPendiente).toBe('MP_LINEA_SIN_ESPECIALIDAD');
    // Vuelve al principio: con otro filtro, la página 6 de antes no significa nada.
    expect(ultima.pagina.pagina).toBe(0);
  });

  // ── selección de líneas ───────────────────────────────────────────────────
  //
  // Lo que se fija aquí es que la selección signifique siempre lo mismo. Los dos fallos
  // que persigue son silenciosos: una selección que sobrevive a un cambio de filtro opera
  // sobre líneas que ya no se ven, y una que se guarda por posición señala a otra línea al
  // volver de página, porque cada petición rehace los objetos de fila.

  it('[DBG-01] marcar una fila la cuenta, y volver a marcarla la quita', async () => {
    facade.cargarLineas('CM-35343660784');
    await asentar();

    facade.alternarSeleccion(46_000_000_001);
    expect(facade.cuantasSeleccionadas()).toBe(1);
    expect(facade.estaSeleccionada(46_000_000_001)).toBe(true);

    facade.alternarSeleccion(46_000_000_001);
    expect(facade.cuantasSeleccionadas()).toBe(0);
    expect(facade.haySeleccion()).toBe(false);
  });

  it('[DBG-01] la selección sobrevive a un cambio de página: se guarda por referencia',
     async () => {
    facade.cargarLineas('CM-35343660784');
    await asentar();
    facade.alternarSeleccion(46_000_000_001);

    facade.irAPagina(2);
    await asentar();
    facade.irAPagina(1);
    await asentar();

    // Si se guardara por objeto de fila o por índice, aquí ya no estaría: rxResource
    // devuelve objetos nuevos en cada petición.
    expect(facade.estaSeleccionada(46_000_000_001)).toBe(true);
  });

  it('[DBG-01] cambiar el filtro vacía la selección', async () => {
    facade.cargarLineas('CM-35343660784');
    await asentar();
    facade.alternarSeleccion(46_000_000_001);

    facade.aplicarFiltro({ conNovedad: true });
    await asentar();

    expect(facade.cuantasSeleccionadas()).toBe(0);
  });

  it('[DBG-01] la casilla de la cabecera marca la página, no la cuenta entera', async () => {
    // 212 líneas en la cuenta, 25 en la página. Marcar la cabecera son 25, no 212.
    facade.cargarLineas('CM-35343660784');
    await asentar();

    facade.alternarSeleccionDeLaPagina(true);

    expect(facade.cuantasSeleccionadas()).toBe(25);
    expect(facade.seleccionTodoElFiltro()).toBe(false);
  });

  it('[F3-CNT-02] «todas las que cumplen el filtro» cuenta el total, no la página',
     async () => {
    facade.cargarLineas('CM-35343660784');
    await asentar();

    facade.seleccionarTodoElFiltro();

    expect(facade.cuantasSeleccionadas()).toBe(212);
    expect(facade.seleccionTodoElFiltro()).toBe(true);
  });

  it('[F3-CNT-02] sin total no se puede ofrecer «todas las que cumplen el filtro»',
     async () => {
    // En el régimen de recorrido no se sabe cuántas son. Prometer un conjunto cuyo
    // tamaño no se puede decir, delante de una escritura irreversible, no vale.
    repo.total = null;
    facade.cargarLineas('CM-35343660784');
    await asentar();

    expect(facade.puedeSeleccionarTodoElFiltro()).toBe(false);
    facade.seleccionarTodoElFiltro();
    expect(facade.seleccionTodoElFiltro()).toBe(false);
  });

  it('[DBG-04] «todo el filtro» no viaja como lista de referencias', async () => {
    // Es el freno que impide el peor desenlace: una lista vacía la entiende el sistema
    // de registro como «toda la cuenta», así que quien llame tiene que ver el vacío y
    // negarse, no mandarlo.
    facade.cargarLineas('CM-35343660784');
    await asentar();

    facade.seleccionarTodoElFiltro();

    expect(facade.referenciasSeleccionadas()).toEqual([]);
  });

  it('[DBG-01] marcar una fila suelta sale del modo «todo el filtro»', async () => {
    facade.cargarLineas('CM-35343660784');
    await asentar();
    facade.seleccionarTodoElFiltro();

    facade.alternarSeleccion(46_000_000_001);

    expect(facade.seleccionTodoElFiltro()).toBe(false);
    expect(facade.cuantasSeleccionadas()).toBe(1);
  });
});
