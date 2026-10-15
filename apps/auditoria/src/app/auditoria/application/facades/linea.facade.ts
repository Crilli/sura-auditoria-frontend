import { Injectable, inject, signal, computed, effect, untracked } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { lastValueFrom } from 'rxjs';
import { ListarLineasUseCase }          from '../use-cases/listar-lineas.use-case';
import { ConsultarDetalleLineaUseCase } from '../use-cases/consultar-detalle-linea.use-case';
import { GuardarLineaUseCase }          from '../use-cases/guardar-linea.use-case';
import { ObtenerSiguienteLineaUseCase } from '../use-cases/obtener-siguiente-linea.use-case';
import { ResumirFiltrosLineasUseCase }  from '../use-cases/resumir-filtros-lineas.use-case';
import {
  ResumenLineaModel, DetalleLineaModel, GuardarLineaRequest,
  FiltroLineasModel, ResumenFiltrosLineasModel,
  FILTRO_LINEAS_VACIO, exigeRecorrido, hayAlgunCriterio
} from '../../domain/models/linea-cuenta.model';
import { CursorPage, CursorRequest } from '../../../../../../../libs/data-access/http/src/lib/cursor-page.model';

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

  /** Tamaño de página fijo: es el máximo que acepta el servicio. */
  readonly TAMANO_PAGINA = 25;

  /**
   * Cuántas páginas se está dispuesto a encadenar para alcanzar un salto.
   *
   * El servicio es keyset: no sabe saltar a un desplazamiento, solo entrega el
   * cursor de la siguiente, así que numerar páginas cuesta una petición por
   * página intermedia. La cuenta mayor medida tiene 4.063 líneas, o sea **163
   * páginas**: pulsar «última» serían 162 peticiones en serie contra el sistema
   * de registro. Más allá de este tope el salto no se ofrece y se llega con
   * «siguiente». Mismo criterio que la pantalla de pendientes.
   */
  readonly MAXIMO_PAGINAS_ENCADENADAS = 20;

  /**
   * Criterios de búsqueda, en un solo signal.
   *
   * Uno y no siete a propósito: con siete signals en los parámetros del recurso
   * habría siete caminos de reinicio que mantener en sincronía, y lo que importa
   * —que cualquier cambio vuelva a la página 1— es una sola regla.
   */
  private readonly _filtro = signal<FiltroLineasModel>(FILTRO_LINEAS_VACIO);
  readonly filtro = this._filtro.asReadonly();

  /**
   * Cuántas veces se ha reiniciado la paginación.
   *
   * `recorrerHasta` encadena peticiones fuera del recurso y tarda segundos; si
   * mientras tanto cambia el filtro, al volver escribiría los cursores y la
   * página de un conjunto que ya no existe. Captura este número al empezar y no
   * toca nada si ha cambiado. Sin filtros el hueco existía pero no se notaba;
   * con ellos es un fallo real.
   */
  private readonly _generacion = signal<number>(0);

  // ── Signals de parámetros — rxResource reacciona automáticamente ─
  readonly codigoCuenta  = signal<string | null>(null);
  readonly cursorRequest = signal<CursorRequest>({ tamano: 25 }); // Sin cursor = primera página

  // ── Paginación numerada sobre un servicio keyset ──────────────────
  // El servicio no admite saltar a un desplazamiento arbitrario: solo entrega
  // el cursor de la página siguiente. Para poder numerar las páginas se guarda
  // el cursor de cada una a medida que se visita; `_cursores[i]` es el cursor
  // con el que se pide la página i+1 (el de la página 1 es siempre undefined).
  private readonly _cursores       = signal<(string | undefined)[]>([undefined]);
  private readonly _totalRegistros = signal<number | null>(null);

  readonly paginaActual = signal<number>(1);
  /** Verdadero mientras se recorren páginas intermedias para alcanzar un salto. */
  readonly recorriendo  = signal<boolean>(false);

  readonly totalPaginas = computed(() => {
    const total = this._totalRegistros();
    return total === null ? null : Math.max(1, Math.ceil(total / this.TAMANO_PAGINA));
  });

  readonly hayPaginaAnterior = computed(() => this.paginaActual() > 1);
  readonly hayPaginaSiguiente = computed(() => {
    const total = this.totalPaginas();
    return total === null ? this.cursorSig() !== null : this.paginaActual() < total;
  });

  // ── QUERY KEYSET DECLARATIVA con rxResource() ─────────────────────
  // ✅ SIEMPRE envía tamano. Cursor ausente = primera página.
  // PROHIBIDO: cargar todas las líneas sin cursor/tamano.
  private readonly _lineasResource = rxResource({
    params: () => {
      const codigo = this.codigoCuenta();
      if (!codigo) return undefined;
      return {
        codigo,
        cursor: this.cursorRequest(),
        filtro: this._filtro()
      };
    },
    stream: ({ params }) => this.listarUC.execute(params.codigo, params.cursor, params.filtro)
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

  // `value()` no devuelve undefined cuando el recurso está en error: LANZA
  // `ResourceValueError`. Sin el `hasValue()` delante, un GET caído no pinta el
  // banner de error sino que revienta la plantilla entera. Con filtros ese
  // camino se recorre mucho más, porque cada criterio es una consulta nueva.
  private readonly _pagina = computed<CursorPage<ResumenLineaModel> | null>(() =>
    this._lineasResource.hasValue()
      ? (this._lineasResource.value() as CursorPage<ResumenLineaModel>)
      : null);

  readonly lineas      = computed(() => this._pagina()?.elementos      ?? []);
  readonly cursorSig   = computed(() => this._pagina()?.cursorSiguiente ?? null);
  readonly totalLineas = computed(() => this._totalRegistros());
  readonly loading     = computed(() => this._lineasResource.isLoading());
  readonly listError   = computed(() => this._lineasResource.error() as Error | null);
  readonly isEmpty     = computed(() => !this.loading() && this.lineas().length === 0);
  readonly hayMas      = computed(() => this.cursorSig() !== null);

  constructor() {
    // Cada página que llega aporta dos datos que hay que conservar: el total de
    // registros (el servicio solo lo envía en la primera página) y el cursor con
    // el que se pedirá la página siguiente.
    effect(() => {
      const pagina = this._pagina();
      if (!pagina) return;

      untracked(() => {
        if (pagina.totalRegistros !== null && pagina.totalRegistros !== undefined) {
          this._totalRegistros.set(pagina.totalRegistros);
        }
        const cursores = [...this._cursores()];
        cursores[this.paginaActual()] = pagina.cursorSiguiente ?? undefined;
        this._cursores.set(cursores);
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
   * El reinicio no es cosmético: un cursor del conjunto anterior no significa
   * nada en el nuevo, y la página 7 de un filtro con tres filas no existe.
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

  private reiniciarPaginacion(): void {
    this._generacion.update(n => n + 1);
    this._cursores.set([undefined]);
    this._totalRegistros.set(null);
    this.paginaActual.set(1);
    this.errorComando.set(null);
    this.cursorRequest.set({ tamano: this.TAMANO_PAGINA });
  }

  /**
   * La página más lejana a la que se puede saltar sin pasarse del tope de
   * encadenado. La vista la usa para no ofrecer saltos que costarían decenas de
   * peticiones.
   */
  readonly ultimaPaginaAlcanzable = computed(() => {
    const tope  = this._cursores().length + this.MAXIMO_PAGINAS_ENCADENADAS;
    const total = this.totalPaginas();
    return total === null ? tope : Math.min(tope, total);
  });

  alcanzable(numero: number): boolean {
    return numero <= this.ultimaPaginaAlcanzable();
  }

  readonly puedeIrAUltima = computed(() => {
    const total = this.totalPaginas();
    return total !== null && total > this.paginaActual() && this.alcanzable(total);
  });

  /**
   * Va a la página indicada (1 en adelante).
   *
   * Si su cursor ya se conoce el salto es inmediato. Si está más adelante del
   * punto alcanzado, se recorren las páginas intermedias para ir encadenando
   * cursores: es el precio de numerar páginas sobre un servicio keyset, que no
   * sabe saltar a un desplazamiento arbitrario.
   */
  async irAPagina(numero: number): Promise<void> {
    // Un error de navegación anterior no debe sobrevivir a una que sí funciona.
    this.errorComando.set(null);
    const total = this.totalPaginas();
    if (numero < 1 || numero === this.paginaActual()) return;
    if (total !== null && numero > total) return;

    const cursores = this._cursores();
    if (numero === 1 || cursores[numero - 1] !== undefined) {
      this.paginaActual.set(numero);
      this.cursorRequest.set({ cursor: cursores[numero - 1], tamano: this.TAMANO_PAGINA });
      return;
    }
    if (!this.alcanzable(numero)) {
      this.errorComando.set(
        `Para llegar a la página ${numero} hay que recorrer las anteriores. ` +
        `Avance con «siguiente» o acote la búsqueda.`);
      return;
    }
    await this.recorrerHasta(numero);
  }

  paginaSiguiente(): Promise<void> { return this.irAPagina(this.paginaActual() + 1); }
  paginaAnterior():  Promise<void> { return this.irAPagina(this.paginaActual() - 1); }
  primeraPagina():   Promise<void> { return this.irAPagina(1); }
  ultimaPagina():    Promise<void> {
    const total = this.totalPaginas();
    return total === null ? Promise.resolve() : this.irAPagina(total);
  }

  /** Encadena cursores hasta la página destino sin pintar las intermedias. */
  private async recorrerHasta(destino: number): Promise<void> {
    const codigo = this.codigoCuenta();
    if (!codigo) return;

    // Se fijan al empezar: si cambian por el camino, lo recorrido ya no vale.
    const generacion = this._generacion();
    const filtro     = this._filtro();

    this.recorriendo.set(true);
    try {
      const cursores = [...this._cursores()];
      let indice = cursores.length - 1;   // última página con cursor conocido
      let agotado = false;

      while (indice < destino - 1) {
        const cursor = cursores[indice];
        if (cursor === undefined && indice > 0) { agotado = true; break; }

        const pagina = await lastValueFrom(
          this.listarUC.execute(codigo, { cursor, tamano: this.TAMANO_PAGINA }, filtro)
        );

        // Entre dos saltos pudo cambiar el filtro o recargarse la cuenta.
        if (generacion !== this._generacion()) return;

        cursores[indice + 1] = pagina.cursorSiguiente ?? undefined;
        if (!pagina.cursorSiguiente) { agotado = true; break; }
        indice++;
      }

      if (generacion !== this._generacion()) return;
      this._cursores.set(cursores);

      const cursorDestino = cursores[destino - 1];
      if (destino === 1 || cursorDestino !== undefined) {
        this.paginaActual.set(destino);
        this.cursorRequest.set({ cursor: cursorDestino, tamano: this.TAMANO_PAGINA });
      } else if (agotado) {
        this.errorComando.set(
          `La página ${destino} ya no existe: la lista se ha acortado. Vuelva a cargarla.`);
      }
    } catch {
      this.errorComando.set('No fue posible avanzar hasta la página solicitada');
    } finally {
      this.recorriendo.set(false);
    }
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
      this.errorComando.set((err as Error).message ?? 'Error al guardar la línea');
      return false;
    } finally {
      this.guardando.set(false);
    }
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
