import { Injectable, inject, signal, computed, effect, untracked } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { lastValueFrom } from 'rxjs';
import { ListarLineasUseCase }          from '../use-cases/listar-lineas.use-case';
import { ConsultarDetalleLineaUseCase } from '../use-cases/consultar-detalle-linea.use-case';
import { GuardarLineaUseCase }          from '../use-cases/guardar-linea.use-case';
import { ObtenerSiguienteLineaUseCase } from '../use-cases/obtener-siguiente-linea.use-case';
import { ResumirFiltrosLineasUseCase }  from '../use-cases/resumir-filtros-lineas.use-case';
import { ResumirMotivosPendientesUseCase } from '../use-cases/resumir-motivos-pendientes.use-case';
import {
  ResumenLineaModel, DetalleLineaModel, GuardarLineaRequest,
  FiltroLineasModel, ResumenFiltrosLineasModel,
  FILTRO_LINEAS_VACIO, exigeRecorrido, hayAlgunCriterio
} from '../../domain/models/linea-cuenta.model';
import { OffsetPage, OffsetRequest } from '../../../../../../../libs/data-access/http/src/lib/offset-page.model';
import {
  DesenlaceEnFila, ModoRecalculo, ValoresEnFila,
  cambiosDeLaFila, filaConDetalle, solicitudDeLaFila
} from '../../domain/models/edicion-en-fila.model';

/**
 * Si un error del servicio es un conflicto de versión: 412 `MODIFICACION_CONCURRENTE`, que
 * el interceptor deja en `codigo` y `status`.
 */
function esConflictoDeVersion(error: unknown): boolean {
  const e = error as { codigo?: string | null; status?: number } | null;
  return e?.codigo === 'MODIFICACION_CONCURRENTE' || e?.status === 412;
}

/**
 * Si el servicio dice que el cambio se aplicó pero no pudo releerlo (OPE-11): `codigo`
 * `APLICADO_SIN_RELEER`. Hay que tratarlo como guardado y recargar, nunca ofrecer repetirlo.
 */
function esAplicadoSinRelectura(error: unknown): boolean {
  return (error as { codigo?: string | null } | null)?.codigo === 'APLICADO_SIN_RELEER';
}

/** Desenlace de «guardar y pasar a la siguiente línea». */
export interface ResultadoAvance {
  /** `false` si el guardado falló: no se debe navegar ni cargar otra línea. */
  guardado: boolean;
  /** Línea a la que se debe avanzar; `null` si la actual era la última. */
  siguiente: ResumenLineaModel | null;
}

@Injectable({ providedIn: 'root' })
export class LineaFacade {

  private readonly listarUC  = inject(ListarLineasUseCase);
  private readonly detalleUC = inject(ConsultarDetalleLineaUseCase);
  private readonly guardarUC = inject(GuardarLineaUseCase);
  private readonly siguienteUC = inject(ObtenerSiguienteLineaUseCase);
  private readonly filtrosUC   = inject(ResumirFiltrosLineasUseCase);
  private readonly motivosUC = inject(ResumirMotivosPendientesUseCase);

  /** Tamaño de página fijo: es el máximo que acepta el servicio. */
  readonly TAMANO_PAGINA = 25;

  /**
   * Criterios de búsqueda, en un solo signal.
   *
   * Uno y no siete a propósito: con siete signals en los parámetros del recurso
   * habría siete caminos de reinicio que mantener en sincronía, y lo que importa
   * —que cualquier cambio vuelva a la página 1— es una sola regla.
   */
  private readonly _filtro = signal<FiltroLineasModel>(FILTRO_LINEAS_VACIO);
  readonly filtro = this._filtro.asReadonly();

  // ── Signals de parámetros — rxResource reacciona automáticamente ─
  readonly codigoCuenta = signal<string | null>(null);

  /**
   * Qué página se pide. Cuenta desde cero, como el servicio.
   *
   * Antes aquí había un cursor opaco y, al lado, la lista de los cursores ya
   * visitados para poder numerar las páginas: el servicio solo sabía dar «la
   * siguiente», así que saltar a la página 50 costaba 49 peticiones en serie y
   * la última de una cuenta grande era inalcanzable —el botón estaba apagado a
   * propósito, con un tope de veinte páginas encadenadas—. Ahora la página es
   * una posición y cualquier salto es una petición.
   */
  readonly peticionPagina = signal<OffsetRequest>({ pagina: 0, tamano: 25 });

  /** Por qué columna se está ordenando, para pintar la flecha en la cabecera. */
  readonly orden = computed(() => ({
    campo: this.peticionPagina().orden ?? 'numero_linea',
    sentido: this.peticionPagina().sentido ?? 'asc'
  }));

  /** La página que se está viendo, contando desde **uno**: es lo que se pinta. */
  readonly paginaActual = computed(() => this.peticionPagina().pagina + 1);

  // ── QUERY POR DESPLAZAMIENTO DECLARATIVA con rxResource() ─────────
  // ✅ SIEMPRE envía pagina y tamano.
  // PROHIBIDO: cargar todas las líneas sin paginar.
  private readonly _lineasResource = rxResource({
    params: () => {
      const codigo = this.codigoCuenta();
      if (!codigo) return undefined;
      return {
        codigo,
        pagina: this.peticionPagina(),
        filtro: this._filtro()
      };
    },
    stream: ({ params }) => this.listarUC.execute(params.codigo, params.pagina, params.filtro)
  });

  /**
   * Con qué se puede acotar la cuenta. En su propia consulta porque recorre la
   * cuenta entera —17 s en la mayor medida— y no cambia al paginar ni al
   * filtrar: la tabla pinta sin esperarlo.
   *
   * El `intento` en los parámetros no es decorativo: `reload()` es un no-op que
   * devuelve `false` si el recurso está `idle` o `loading`, así que cambiar un
   * parámetro es la única forma fiable de relanzarlo.
   */
  private readonly _recargaFiltros = signal<number>(0);

  private readonly _filtrosResource = rxResource({
    params: () => {
      const codigo = this.codigoCuenta();
      return codigo ? { codigo, intento: this._recargaFiltros() } : undefined;
    },
    stream: ({ params }) => this.filtrosUC.execute(params.codigo)
  });

  readonly encuadre = computed<ResumenFiltrosLineasModel | null>(() =>
    this._filtrosResource.hasValue()
      ? (this._filtrosResource.value() as ResumenFiltrosLineasModel)
      : null);
  readonly cargandoEncuadre = computed(() => this._filtrosResource.isLoading());
  readonly errorEncuadre    = computed(() => this._filtrosResource.error() as Error | null);

  /**
   * Los motivos de pendiente de la cuenta, para poder filtrar las líneas por uno.
   *
   * Se consume el mismo caso de uso que la pestaña de pendientes en vez de copiar la
   * consulta: el agregado ya recorre la cuenta entera y trae cuántas líneas afecta cada
   * motivo, que es justo lo que hay que enseñar junto a cada opción. Duplicarlo abriría la
   * puerta a que las dos pantallas discrepasen sobre cuántas líneas tiene un motivo.
   *
   * Los de cabecera no se ofrecen: no afectan a ninguna línea, así que filtrar por ellos
   * devolvería siempre la página vacía.
   */
  private readonly _motivosResource = rxResource({
    params: () => {
      const codigo = this.codigoCuenta();
      return codigo ? { codigo } : undefined;
    },
    stream: ({ params }) => this.motivosUC.execute(params.codigo)
  });

  readonly motivosDeLaCuenta = computed(() =>
    (this._motivosResource.hasValue() ? this._motivosResource.value() ?? [] : [])
      .filter(m => m.lineasAfectadas > 0));

  // `value()` no devuelve undefined cuando el recurso está en error: LANZA
  // `ResourceValueError`. Sin el `hasValue()` delante, un GET caído no pinta el
  // banner de error sino que revienta la plantilla entera. Con filtros ese
  // camino se recorre mucho más, porque cada criterio es una consulta nueva.
  private readonly _pagina = computed<OffsetPage<ResumenLineaModel> | null>(() =>
    this._lineasResource.hasValue()
      ? (this._lineasResource.value() as OffsetPage<ResumenLineaModel>)
      : null);

  readonly lineas    = computed(() => this._pagina()?.elementos ?? []);
  readonly loading   = computed(() => this._lineasResource.isLoading());
  readonly listError = computed(() => this._lineasResource.error() as Error | null);
  readonly isEmpty   = computed(() => !this.loading() && this.lineas().length === 0);

  /**
   * Si la página se está refrescando **con la tabla ya pintada**.
   *
   * Es el refresco que sigue a un guardado en la fila: la misma petición otra vez, para
   * recoger lo que el motor recalculó. Mientras llega, el recurso conserva la página
   * anterior —`reloading`, no `loading`—, así que no hay por qué esconder la grilla detrás
   * de un spinner: esconderla sería «recargar la pantalla», que es justo lo que la edición en
   * la fila tiene que evitar.
   */
  readonly refrescando = computed(() =>
    this._lineasResource.status() === 'reloading' && this.lineas().length > 0);

  /**
   * Si queda algo después de esta página. Lo dice el servicio, y es de fiar
   * incluso cuando no hay total.
   */
  readonly hayMas = computed(() => this._pagina()?.hayMas ?? false);

  /**
   * El total y el número de páginas, conservados de la última respuesta que los
   * trajo.
   *
   * Hace falta conservarlos porque mientras llega la página siguiente el
   * recurso no tiene valor, y sin esto el paginador se quedaría sin números en
   * cada salto. Lo que no se conserva es un total **ausente**: cuando el filtro
   * obliga a descartar en el servicio, no hay total y hay que propagarlo, no
   * reutilizar el de antes de filtrar.
   */
  private readonly _total        = signal<number | null>(null);
  private readonly _totalPaginas = signal<number | null>(null);

  readonly totalLineas  = this._total.asReadonly();
  readonly totalPaginas = this._totalPaginas.asReadonly();

  readonly hayPaginaAnterior  = computed(() => this.paginaActual() > 1);
  readonly hayPaginaSiguiente = computed(() => this.hayMas());

  /**
   * Si hay una «última» conocida a la que ir.
   *
   * Sin total no la hay: con un filtro que el servicio no sabe empujar no se
   * sabe cuántas páginas existen, y un botón que al pulsarlo no hace nada es
   * peor que uno apagado. Lo que ya no la limita es la distancia: llegar a la
   * página 163 cuesta lo mismo que llegar a la 2.
   */
  readonly puedeIrAUltima = computed(() => {
    const total = this.totalPaginas();
    return total !== null && total > this.paginaActual();
  });

  constructor() {
    // El total viene en cada página, no solo en la primera: el servicio lo pide
    // junto con las filas y comprobar que era el verdadero a cualquier
    // profundidad fue lo que permitió este cambio. Solo se guarda cuando viene:
    // un nulo significa «con este filtro no se sabe», y eso también es dato.
    effect(() => {
      const pagina = this._pagina();
      if (!pagina) return;

      untracked(() => {
        this._total.set(pagina.totalRegistros ?? null);
        this._totalPaginas.set(pagina.totalPaginas ?? null);
      });
    });
  }

  // ── Signals detalle ───────────────────────────────────────────────
  readonly detalleLinea     = signal<DetalleLineaModel | null>(null);
  readonly errorComando     = signal<string | null>(null);
  readonly cargandoDetalle  = signal<boolean>(false);
  /** En curso un guardado; mientras esté activo no se debe cargar otra línea. */
  readonly guardando        = signal<boolean>(false);

  // ── Acciones ──────────────────────────────────────────────────────

  cargarLineas(codigoCuenta: string): void {
    this.codigoCuenta.set(codigoCuenta);
    this._filtro.set(FILTRO_LINEAS_VACIO);
    this.reiniciarPaginacion();
  }

  /**
   * Cambia uno o varios criterios y vuelve al principio.
   *
   * El reinicio no es cosmético: la página 7 de un filtro con tres filas no
   * existe, y el total del conjunto anterior no dice nada del nuevo.
   */
  aplicarFiltro(cambios: Partial<FiltroLineasModel>): void {
    const siguiente = { ...this._filtro(), ...cambios };
    // Quitar las claves vacías mantiene `hayAlgunFiltro` honesto y evita
    // relanzar la consulta por un cambio que no cambia nada.
    for (const [clave, valor] of Object.entries(siguiente)) {
      if (valor === null || valor === undefined || valor === '') {
        delete (siguiente as Record<string, unknown>)[clave];
      }
    }
    if (JSON.stringify(siguiente) === JSON.stringify(this._filtro())) return;
    this._filtro.set(siguiente);
    this.reiniciarPaginacion();
  }

  quitarFiltro(campo: keyof FiltroLineasModel): void {
    this.aplicarFiltro({ [campo]: null } as Partial<FiltroLineasModel>);
  }

  limpiarTodosLosFiltros(): void {
    if (!this.hayAlgunFiltro()) return;
    this._filtro.set(FILTRO_LINEAS_VACIO);
    this.reiniciarPaginacion();
  }

  readonly hayAlgunFiltro = computed(() => hayAlgunCriterio(this._filtro()));

  /**
   * Si el filtro activo obliga al servicio a recorrer la cuenta.
   *
   * De aquí sale lo que la pantalla tiene que avisar: con catálogo o con valor
   * glosado no hay total ni número de páginas —el sistema de registro no sabe
   * filtrar por esos campos, así que su total contaría filas que después se
   * descartan— y la navegación pasa a «siguiente/anterior».
   */
  readonly exigeRecorrido = computed(() => exigeRecorrido(this._filtro()));

  recargarEncuadre(): void {
    this._recargaFiltros.update(n => n + 1);
  }

  /**
   * Vuelve a pedir los motivos de pendiente de la cuenta: tras resolver, los que se fueron
   * no pueden seguir en el filtro ni con su número de líneas de antes.
   */
  recargarMotivos(): void {
    this._motivosResource.reload();
  }

  /**
   * Ordena por una columna. Pulsar la que ya ordena invierte el sentido, que es lo que
   * espera cualquiera que haya usado una tabla.
   *
   * Vuelve a la primera página a propósito: la página 7 de un orden no tiene nada que ver
   * con la página 7 del otro, y quedarse donde estaba daría la sensación de haber saltado.
   */
  ordenarPor(campo: string): void {
    const actual = this.orden();
    const sentido: 'asc' | 'desc' =
      actual.campo === campo && actual.sentido === 'asc' ? 'desc' : 'asc';

    this.errorComando.set(null);
    this._total.set(null);
    this._totalPaginas.set(null);
    this.peticionPagina.set({ pagina: 0, tamano: this.TAMANO_PAGINA, orden: campo, sentido });
  }

  private reiniciarPaginacion(): void {
    this._total.set(null);
    this._totalPaginas.set(null);
    this.errorComando.set(null);
    this.peticionPagina.set({ pagina: 0, tamano: this.TAMANO_PAGINA });
    // El conjunto de resultados es otro: conservar la selección haría operar sobre líneas
    // que ya no se ven. Es el único sitio donde hace falta, porque este método es el
    // embudo de «cambió el conjunto»: lo llaman cargarLineas, aplicarFiltro y limpiar.
    this._seleccion.set(new Set<number>());
    this._seleccionTodoElFiltro.set(false);
  }

  // ── Selección de líneas ───────────────────────────────────────────────────
  //
  // Por REFERENCIA y no por posición ni por objeto de fila: cada página trae objetos
  // nuevos (rxResource rehace el array en cada petición), así que una selección guardada
  // por identidad se perdería al pasar de página y volver, y una guardada por índice
  // señalaría a otra línea.

  private readonly _seleccion = signal<Set<number>>(new Set<number>());

  /**
   * Si lo marcado es «todo lo que cumple el filtro» y no una lista.
   *
   * Son dos cosas distintas y el documento lo subraya: con 25 filas a la vista de 4.063,
   * marcar la casilla de la cabecera NO puede significar «las 4.063». Esta bandera es la
   * que expresa la otra intención, y solo se puede activar cuando se conoce el total:
   * sin total no hay número que enseñar ni conjunto que prometer.
   */
  private readonly _seleccionTodoElFiltro = signal(false);

  readonly seleccion = this._seleccion.asReadonly();
  readonly seleccionTodoElFiltro = this._seleccionTodoElFiltro.asReadonly();

  /** Cuántas líneas hay marcadas: las del filtro entero, o las elegidas una a una. */
  readonly cuantasSeleccionadas = computed(() =>
    this._seleccionTodoElFiltro() ? (this.totalLineas() ?? 0) : this._seleccion().size);

  readonly haySeleccion = computed(() => this.cuantasSeleccionadas() > 0);

  /**
   * Si se puede ofrecer «todas las que cumplen el filtro».
   *
   * Solo con total. En el régimen sin total —catálogo o techo de glosa— no se sabe cuántas
   * son, y ofrecer un botón que dice «seleccionar todas» sin poder decir cuántas, sobre una
   * operación de escritura irreversible, es peor que no ofrecerlo.
   */
  readonly puedeSeleccionarTodoElFiltro = computed(() => this.totalLineas() != null);

  estaSeleccionada(referencia: number): boolean {
    return this._seleccionTodoElFiltro() || this._seleccion().has(referencia);
  }

  alternarSeleccion(referencia: number): void {
    // Marcar una fila suelta sale del modo «todo el filtro»: son intenciones distintas y
    // mezclarlas dejaría una selección que nadie sabe leer.
    this._seleccionTodoElFiltro.set(false);
    this._seleccion.update(actual => {
      const copia = new Set(actual);
      if (copia.has(referencia)) copia.delete(referencia); else copia.add(referencia);
      return copia;
    });
  }

  /** La casilla de la cabecera: marca o desmarca **las de la página**, no la cuenta entera. */
  alternarSeleccionDeLaPagina(marcar: boolean): void {
    this._seleccionTodoElFiltro.set(false);
    const deLaPagina = this.lineas().map(l => l.referencia);
    this._seleccion.update(actual => {
      const copia = new Set(actual);
      deLaPagina.forEach(r => marcar ? copia.add(r) : copia.delete(r));
      return copia;
    });
  }

  seleccionarTodoElFiltro(): void {
    if (!this.puedeSeleccionarTodoElFiltro()) return;
    this._seleccion.set(new Set<number>());
    this._seleccionTodoElFiltro.set(true);
  }

  /**
   * Vuelve a pedir la página a la vista.
   *
   * Hace falta tras una acción masiva: desbloquear o resolver cambia lo que la grilla
   * pinta en las columnas de estado y pendientes, y dejar la página de antes enseñaría
   * un estado que ya no es.
   */
  recargar(): void {
    this._lineasResource.reload();
  }

  limpiarSeleccion(): void {
    this._seleccion.set(new Set<number>());
    this._seleccionTodoElFiltro.set(false);
  }

  /**
   * Las referencias marcadas para mandar al servicio.
   *
   * Vacío cuando lo marcado es «todo el filtro»: en ese caso el alcance no es una lista
   * —podrían ser miles— sino los criterios, y quien llame debe mandar el filtro.
   */
  referenciasSeleccionadas(): number[] {
    return this._seleccionTodoElFiltro() ? [] : [...this._seleccion()];
  }

  /**
   * Va a la página indicada (1 en adelante).
   *
   * Una petición, esté donde esté: el servicio sabe situarse en cualquier
   * posición. Aquí ya no hay nada que encadenar ni cursores que recordar, y por
   * eso dejó de ser asíncrona en la práctica —se conserva la promesa para no
   * tocar a quien la llama.
   */
  async irAPagina(numero: number): Promise<void> {
    // Un error de navegación anterior no debe sobrevivir a una que sí funciona.
    this.errorComando.set(null);
    const total = this.totalPaginas();
    if (numero < 1 || numero === this.paginaActual()) return;
    if (total !== null && numero > total) return;

    const orden = this.orden();
    this.peticionPagina.set({
      pagina: numero - 1, tamano: this.TAMANO_PAGINA,
      orden: orden.campo, sentido: orden.sentido
    });
  }

  paginaSiguiente(): Promise<void> { return this.irAPagina(this.paginaActual() + 1); }
  paginaAnterior():  Promise<void> { return this.irAPagina(this.paginaActual() - 1); }
  primeraPagina():   Promise<void> { return this.irAPagina(1); }
  ultimaPagina():    Promise<void> {
    const total = this.totalPaginas();
    return total === null ? Promise.resolve() : this.irAPagina(total);
  }

  async consultarDetalle(codigoCuenta: string, referencia: number): Promise<void> {
    this.errorComando.set(null);
    // Se descarta el detalle anterior para que la pantalla no muestre los datos
    // de la línea previa mientras llega la nueva.
    this.detalleLinea.set(null);
    this.cargandoDetalle.set(true);
    try {
      const detalle = await lastValueFrom(
        this.detalleUC.execute(codigoCuenta, referencia)
      );
      this.detalleLinea.set(detalle);
    } catch (err: unknown) {
      this.errorComando.set((err as Error).message ?? 'Error al consultar línea');
    } finally {
      this.cargandoDetalle.set(false);
    }
  }

  /** Línea siguiente a la dada, o `null` si es la última de la cuenta. */
  async siguienteLinea(
    codigoCuenta: string,
    referenciaActual: number
  ): Promise<ResumenLineaModel | null> {
    try {
      return await lastValueFrom(this.siguienteUC.execute(codigoCuenta, referenciaActual));
    } catch {
      // No poder resolver la siguiente no es un error del guardado: se informa como
      // «no hay siguiente» y el usuario decide desde la cuenta.
      return null;
    }
  }

  async guardar(
    codigoCuenta: string,
    referencia: number,
    solicitud: GuardarLineaRequest,
    auditor: string
  ): Promise<boolean> {
    this.errorComando.set(null);
    this.guardando.set(true);
    try {
      const actualizada = await lastValueFrom(
        this.guardarUC.execute(codigoCuenta, referencia, solicitud, auditor)
      );
      this.detalleLinea.set(actualizada);
      this._lineasResource.reload(); // Recarga la página actual tras guardar
      return true;
    } catch (err: unknown) {
      if (esAplicadoSinRelectura(err)) {
        // Se guardó: se relee la línea en vez de decir que falló (OPE-11).
        this._lineasResource.reload();
        await this.consultarDetalle(codigoCuenta, referencia);
        return true;
      }
      this.errorComando.set((err as Error).message ?? 'Error al guardar la línea');
      return false;
    } finally {
      this.guardando.set(false);
    }
  }

  /**
   * Guarda una línea desde la grilla, sin abrirla (GRID-18).
   *
   * Tres desenlaces que no son error:
   * - **sin cambios**: no se sale al servicio;
   * - **guardado**: la fila pasa a enseñar lo que devolvió el sistema de registro y la página
   *   se refresca en segundo plano, porque el motor puede haber recalculado algo que el
   *   detalle no trae —el IVA, las novedades— o, en cascada, otras líneas;
   * - **conflicto**: otro guardó antes. Se relee la línea y la fila pasa a tener sus valores y
   *   su versión nuevos; lo tecleado sigue en el formulario de quien llama, así que puede
   *   revisarlo y volver a guardar sin perder nada.
   */
  async guardarEnFila(
    codigoCuenta: string,
    fila: ResumenLineaModel,
    valores: Partial<ValoresEnFila>,
    modo: ModoRecalculo,
    auditor: string
  ): Promise<DesenlaceEnFila> {
    const cambios = cambiosDeLaFila(fila, valores);
    if (!cambios) return { tipo: 'SIN_CAMBIOS' };

    try {
      const detalle = await lastValueFrom(this.guardarUC.execute(
        codigoCuenta, fila.referencia, solicitudDeLaFila(fila, cambios, modo), auditor));
      const guardada = filaConDetalle(fila, detalle);
      this.reemplazarFila(guardada);
      this._lineasResource.reload();
      return { tipo: 'GUARDADO', fila: guardada };
    } catch (err: unknown) {
      if (esAplicadoSinRelectura(err)) {
        this._lineasResource.reload();
        return { tipo: 'APLICADO_SIN_RELEER', mensaje: (err as Error).message };
      }
      if (!esConflictoDeVersion(err)) {
        return { tipo: 'ERROR', mensaje: (err as Error).message ?? 'No se pudo guardar la línea.' };
      }
      try {
        const detalle = await lastValueFrom(this.detalleUC.execute(codigoCuenta, fila.referencia));
        const actual = filaConDetalle(fila, detalle);
        this.reemplazarFila(actual);
        return { tipo: 'CONFLICTO', actual };
      } catch (relectura: unknown) {
        return { tipo: 'ERROR', mensaje: 'Otro usuario modificó la línea y no se pudo releer: '
                 + ((relectura as Error).message ?? 'error desconocido') };
      }
    }
  }

  /** Cambia una fila de la página a la vista sin pedir la página otra vez. */
  private reemplazarFila(fila: ResumenLineaModel): void {
    if (!this._lineasResource.hasValue()) return;
    this._lineasResource.value.update(pagina => pagina && {
      ...pagina,
      elementos: pagina.elementos.map(e => e.referencia === fila.referencia ? fila : e),
    });
  }

  /**
   * Guarda la línea y solo entonces resuelve cuál es la siguiente.
   *
   * El orden es la regla del caso de uso: si el guardado falla se devuelve
   * `guardado: false` y **no** se resuelve ni se carga ninguna otra línea,
   * de modo que la pantalla se queda donde está con el error a la vista.
   */
  async guardarYAvanzar(
    codigoCuenta: string,
    referencia: number,
    solicitud: GuardarLineaRequest,
    auditor: string
  ): Promise<ResultadoAvance> {
    const guardado = await this.guardar(codigoCuenta, referencia, solicitud, auditor);
    if (!guardado) return { guardado: false, siguiente: null };

    return { guardado: true, siguiente: await this.siguienteLinea(codigoCuenta, referencia) };
  }
}
