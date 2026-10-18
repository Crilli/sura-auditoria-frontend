import { Injectable, inject, signal, computed, effect, untracked, WritableSignal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Subscription, catchError, exhaustMap, lastValueFrom, map, of, take, timer } from 'rxjs';
import { ListarPendientesUseCase }         from '../use-cases/listar-pendientes.use-case';
import { ResumirMotivosPendientesUseCase } from '../use-cases/resumir-motivos-pendientes.use-case';
import { ResolverPendienteUseCase }        from '../use-cases/resolver-pendiente.use-case';
import { ResolverPendientesEnMasaUseCase } from '../use-cases/resolver-pendientes-en-masa.use-case';
import { SeguirResolucionUseCase }         from '../use-cases/seguir-resolucion.use-case';
import {
  MotivoPendienteModel, ResumenMotivoModel, ResolverPendienteRequest, FiltroBloqueo,
  NivelResolucion, ResolucionMasivaModel, FalloResolucionModel
} from '../../domain/models/motivo-pendiente.model';
import { CursorPage, CursorRequest } from '../../../../../../../libs/data-access/http/src/lib/cursor-page.model';

@Injectable({ providedIn: 'root' })
export class PendienteFacade {

  private readonly listarUC   = inject(ListarPendientesUseCase);
  private readonly motivosUC  = inject(ResumirMotivosPendientesUseCase);
  private readonly resolverUC = inject(ResolverPendienteUseCase);
  private readonly masivoUC   = inject(ResolverPendientesEnMasaUseCase);
  private readonly seguirUC   = inject(SeguirResolucionUseCase);

  /** Tamaño de página fijo: es el máximo que acepta el servicio. */
  readonly TAMANO_PAGINA = 25;

  /**
   * Cuántas páginas se está dispuesto a encadenar para alcanzar un salto.
   *
   * El servicio es keyset: no sabe saltar a un desplazamiento, solo entrega el
   * cursor de la siguiente. Para numerar páginas hay que recorrer las de en
   * medio, y eso es una petición por página. En líneas se asume sin tope porque
   * la cuenta mayor tiene unas 60 páginas; aquí no vale: medido en producción,
   * CM-55181980659 tiene 3.507 pendientes, o sea **141 páginas**, y pulsar
   * «última» serían 140 peticiones en serie contra OHI. Más allá de este tope el
   * salto no se ofrece, y se llega con «siguiente».
   */
  readonly MAXIMO_PAGINAS_ENCADENADAS = 20;

  // ── Signals de parámetros — rxResource reacciona automáticamente ─
  readonly codigoCuenta  = signal<string | null>(null);
  readonly cursorRequest = signal<CursorRequest>({ tamano: 25 }); // Sin cursor = primera página

  /**
   * Motivo por el que se filtra, o `null` para verlo todo.
   *
   * Va al servicio, no a un `filter` de aquí: con la lista paginada, filtrar en
   * cliente solo filtraría la página a la vista.
   */
  readonly motivoFiltrado = signal<string | null>(null);

  /**
   * Si se quiere ver solo lo que frena el envío, solo lo que no, o todo.
   *
   * También va al servicio: bloquear no es una propiedad del motivo sino del par
   * motivo-estado de la cuenta, y la regla vive en el dominio. Si se decidiera
   * aquí habría dos copias de la misma regla, y la pantalla podría decir que algo
   * bloquea cuando la decisión de envío piensa lo contrario.
   */
  readonly filtroBloqueo = signal<FiltroBloqueo>('TODOS');

  /**
   * Si se miran también los ya resueltos.
   *
   * Por omisión no: una vez resuelto, el motivo desaparecía de la vista y así seguía viéndolo
   * el auditor. Lo que cambia es que ahora puede mirar atrás si lo pide.
   */
  readonly incluirResueltos = signal(false);

  // ── Paginación numerada sobre un servicio keyset ──────────────────
  // Mismo mecanismo que LineaFacade: `_cursores[i]` es el cursor con el que se
  // pide la página i+1, y se va llenando a medida que se visitan.
  private readonly _cursores       = signal<(string | undefined)[]>([undefined]);
  private readonly _totalRegistros = signal<number | null>(null);

  /**
   * Cuántas veces se ha reiniciado la paginación.
   *
   * `recorrerHasta` encadena peticiones fuera del `rxResource` y tarda segundos;
   * si mientras tanto se resuelve un pendiente o se cambia de filtro, al volver
   * escribiría los cursores y la página de un conjunto de datos que ya no existe.
   * Captura este número al empezar y no toca nada si ha cambiado.
   */
  private readonly _generacion = signal<number>(0);

  readonly paginaActual = signal<number>(1);
  /** Verdadero mientras se recorren páginas intermedias para alcanzar un salto. */
  readonly recorriendo  = signal<boolean>(false);
  readonly errorComando = signal<string | null>(null);

  readonly totalPaginas = computed(() => {
    const total = this._totalRegistros();
    return total === null ? null : Math.max(1, Math.ceil(total / this.TAMANO_PAGINA));
  });

  readonly hayPaginaAnterior = computed(() => this.paginaActual() > 1);
  // El total se lee una sola vez, en la página 1. Si entretanto otro auditor
  // resuelve un motivo, la lista encoge y el total sobra: por eso «siguiente»
  // exige además que haya un cursor con el que avanzar de verdad.
  readonly hayPaginaSiguiente = computed(() => {
    const total = this.totalPaginas();
    const hayCursor = this.cursorSig() !== null
                   || this._cursores()[this.paginaActual()] !== undefined;
    return total === null ? this.cursorSig() !== null
                          : this.paginaActual() < total && hayCursor;
  });

  /**
   * La página más lejana a la que se puede saltar ahora mismo sin pasarse del
   * tope de encadenado. Lo usa la vista para no ofrecer saltos que costarían
   * decenas de peticiones.
   */
  readonly ultimaPaginaAlcanzable = computed(() => {
    const conocidas = this._cursores().length;   // páginas con cursor ya en mano
    const tope = conocidas + this.MAXIMO_PAGINAS_ENCADENADAS;
    const total = this.totalPaginas();
    return total === null ? tope : Math.min(tope, total);
  });

  alcanzable(numero: number): boolean {
    return numero <= this.ultimaPaginaAlcanzable();
  }

  /** La última página solo se ofrece si se puede llegar sin encadenar de más. */
  readonly puedeIrAUltima = computed(() => {
    const total = this.totalPaginas();
    return total !== null && total > this.paginaActual() && this.alcanzable(total);
  });

  // ── QUERY KEYSET DECLARATIVA con rxResource() ─────────────────────
  // ✅ SIEMPRE envía tamano. Cursor ausente = primera página.
  // PROHIBIDO: cargar todos los pendientes sin cursor/tamano.
  private readonly _pendientesResource = rxResource({
    params: () => {
      const codigo = this.codigoCuenta();
      if (!codigo) return undefined;
      return {
        codigo,
        cursor:  this.cursorRequest(),
        motivo:  this.motivoFiltrado(),
        bloqueo: this.filtroBloqueo(),
        resueltos: this.incluirResueltos()
      };
    },
    stream: ({ params }) =>
      this.listarUC.execute(params.codigo, params.cursor, params.motivo, params.bloqueo,
                            params.resueltos)
  });

  /**
   * El agregado por motivo, en su propia consulta.
   *
   * Depende solo de la cuenta: no se recalcula al cambiar de página ni al
   * cambiar de filtro, que es justo por lo que va aparte de la página y no
   * colgando de ella.
   */
  private readonly _recargaMotivos = signal<number>(0);

  private readonly _motivosResource = rxResource({
    // `_recargaMotivos` entra en los parámetros a propósito: `reload()` es un
    // no-op que devuelve `false` si el recurso está en `idle` o `loading`, y
    // resolver un pendiente mientras el agregado aún viaja dejaba el selector
    // con los motivos de antes. Cambiar un parámetro sí relanza siempre.
    params: () => {
      const codigo = this.codigoCuenta();
      return codigo ? { codigo, intento: this._recargaMotivos() } : undefined;
    },
    stream: ({ params }) => this.motivosUC.execute(params.codigo)
  });

  // `value()` no devuelve undefined cuando el recurso está en error: LANZA
  // `ResourceValueError`. Sin el `hasValue()` delante, un GET caído no pinta el
  // banner de error sino que revienta la plantilla entera.
  private readonly _pagina = computed<CursorPage<MotivoPendienteModel> | null>(() =>
    this._pendientesResource.hasValue()
      ? (this._pendientesResource.value() as CursorPage<MotivoPendienteModel>)
      : null);

  readonly pendientes = computed(() => this._pagina()?.elementos ?? []);
  readonly cursorSig  = computed(() => this._pagina()?.cursorSiguiente ?? null);
  readonly loading    = computed(() => this._pendientesResource.isLoading());
  readonly listError  = computed(() => this._pendientesResource.error() as Error | null);

  readonly motivos = computed(() =>
    this._motivosResource.hasValue() ? (this._motivosResource.value() as ResumenMotivoModel[]) : []);
  readonly cargandoMotivos = computed(() => this._motivosResource.isLoading());
  readonly errorMotivos    = computed(() => this._motivosResource.error() as Error | null);

  /**
   * Cuántos pendientes sin resolver tiene la cuenta, con filtro o sin él.
   *
   * Con filtro es el total de la página 1 filtrada; sin filtro, la suma del
   * agregado, que es el único sitio donde está el número de la cuenta entera.
   */
  readonly totalFiltrado = computed(() => this._totalRegistros());
  readonly totalCuenta   = computed(() =>
    this.motivos().reduce((suma, m) => suma + m.sinResolver, 0));

  /**
   * Cuántos pendientes frenan el envío, y cuántos no.
   *
   * Cuentan sobre el motivo filtrado si lo hay, no sobre la cuenta entera: son
   * los rótulos de los botones que acotan la tabla, y decir «Bloquean (6)» con un
   * motivo activo que solo aporta 1 prometería cinco filas que no van a salir.
   */
  private readonly motivosDelFiltro = computed(() => {
    const codigo = this.motivoFiltrado();
    return codigo === null ? this.motivos() : this.motivos().filter(m => m.codigo === codigo);
  });

  readonly totalBloqueantes = computed(() =>
    this.motivosDelFiltro().filter(m => m.bloqueante).reduce((s, m) => s + m.sinResolver, 0));
  readonly totalNoBloqueantes = computed(() =>
    this.motivosDelFiltro().filter(m => !m.bloqueante).reduce((s, m) => s + m.sinResolver, 0));
  /** El total que acotan los botones: la cuenta entera, o el motivo filtrado. */
  readonly totalDelAmbito = computed(() =>
    this.motivosDelFiltro().reduce((s, m) => s + m.sinResolver, 0));

  /** El motivo activo ya agregado, para describir el filtro en la cabecera. */
  readonly motivoActivo = computed<ResumenMotivoModel | null>(() => {
    const codigo = this.motivoFiltrado();
    return codigo === null ? null : this.motivos().find(m => m.codigo === codigo) ?? null;
  });

  constructor() {
    // Cada página que llega aporta dos datos que hay que conservar: el total de
    // registros (el servicio solo lo envía en la primera página, porque el que
    // devuelve OHI a partir de la segunda es el de lo que queda, no el del
    // conjunto) y el cursor con el que se pedirá la siguiente.
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

  // ── Acciones ──────────────────────────────────────────────────────

  cargarPendientes(codigoCuenta: string): void {
    this.codigoCuenta.set(codigoCuenta);
    this.motivoFiltrado.set(null);
    this.filtroBloqueo.set('TODOS');
    this.incluirResueltos.set(false);
    // La selección sí se suelta al cambiar de cuenta: los códigos de motivo se
    // repiten entre cuentas, así que arrastrarlos marcaría en la cuenta nueva
    // motivos que nadie eligió ahí.
    this.desmarcarTodos();
    this.resultadoMasivo.set(null);
    this.reiniciarPaginacion();
  }

  /**
   * Cambia el filtro por motivo y vuelve al principio.
   *
   * El reinicio no es cosmético: un cursor del conjunto anterior no significa
   * nada en el nuevo, y la página 7 de un motivo con 961 filas no existe en uno
   * que tiene 3.
   */
  filtrarPor(codigo: string | null): void {
    if (codigo === this.motivoFiltrado()) return;
    this.motivoFiltrado.set(codigo);
    this.reiniciarPaginacion();
  }

  limpiarFiltro(): void {
    this.filtrarPor(null);
  }

  /**
   * Cambia el filtro por bloqueo. Reinicia por lo mismo que el de motivo: el
   * cursor de un conjunto no significa nada en otro.
   */
  /**
   * Mirar atrás, o dejar de hacerlo.
   *
   * Reinicia la paginación por lo mismo que los otros criterios: el conjunto es otro, y la
   * página 7 del anterior no significa nada en el nuevo.
   */
  alternarResueltos(incluir: boolean): void {
    if (incluir === this.incluirResueltos()) return;
    this.incluirResueltos.set(incluir);
    this.reiniciarPaginacion();
  }

  filtrarPorBloqueo(bloqueo: FiltroBloqueo): void {
    if (bloqueo === this.filtroBloqueo()) return;
    this.filtroBloqueo.set(bloqueo);
    this.reiniciarPaginacion();
  }

  /** Vuelve a verlo todo: sin motivo y sin filtro de bloqueo. */
  limpiarTodosLosFiltros(): void {
    if (this.motivoFiltrado() === null && this.filtroBloqueo() === 'TODOS') return;
    this.motivoFiltrado.set(null);
    this.filtroBloqueo.set('TODOS');
    this.reiniciarPaginacion();
  }

  readonly hayAlgunFiltro = computed(() =>
    this.motivoFiltrado() !== null || this.filtroBloqueo() !== 'TODOS');

  private reiniciarPaginacion(): void {
    this._generacion.update(n => n + 1);
    this._cursores.set([undefined]);
    this._totalRegistros.set(null);
    this.paginaActual.set(1);
    this.errorComando.set(null);
    this.cursorRequest.set({ tamano: this.TAMANO_PAGINA });
  }

  /**
   * Va a la página indicada (1 en adelante).
   *
   * Si su cursor ya se conoce el salto es inmediato. Si está más adelante, se
   * recorren las intermedias encadenando cursores — hasta el tope de
   * {@link MAXIMO_PAGINAS_ENCADENADAS}, pasado el cual no se intenta.
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
        `Avance con «siguiente» o acote con un motivo.`);
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
    const motivo     = this.motivoFiltrado();
    const bloqueo    = this.filtroBloqueo();

    this.recorriendo.set(true);
    try {
      const cursores = [...this._cursores()];
      let indice = cursores.length - 1;   // última página con cursor conocido
      let agotado = false;

      while (indice < destino - 1) {
        const cursor = cursores[indice];
        if (cursor === undefined && indice > 0) { agotado = true; break; }

        const pagina = await lastValueFrom(this.listarUC.execute(
          codigo, { cursor, tamano: this.TAMANO_PAGINA }, motivo, bloqueo));

        // Entre dos saltos pudo resolverse un pendiente o cambiar el filtro.
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
        // La lista era más corta de lo que decía el total: alguien resolvió un
        // motivo entretanto. Callarlo deja al auditor pulsando un número que no
        // hace nada.
        this.errorComando.set(
          `La página ${destino} ya no existe: la lista se ha acortado. Vuelva a cargarla.`);
      }
    } catch {
      this.errorComando.set('No fue posible avanzar hasta la página solicitada');
    } finally {
      this.recorriendo.set(false);
    }
  }

  // ── Selección múltiple ────────────────────────────────────────────
  //
  // La unidad de selección es el **motivo**, no la fila, porque es lo único que
  // el sistema de registro sabe resolver: marcar una fila resolvería igualmente
  // todas las de su motivo. Una selección por fila prometería una precisión que
  // no existe, y con 418 filas de un mismo motivo el error no es cosmético.
  //
  // Se guarda por código y no por identificador, y de ahí sale una propiedad
  // útil: **la selección no se invalida al filtrar ni al cambiar de página**.
  // El agregado es de la cuenta entera, así que un motivo marcado sigue marcado
  // aunque sus filas no estén a la vista. Es lo contrario de
  // `pendienteSeleccionado`, que es una fila y sí se suelta al filtrar.

  private readonly _marcados = signal<ReadonlySet<string>>(new Set<string>());

  /** Nivel al que se resolverá la selección. */
  readonly nivelResolucion = signal<NivelResolucion>('DONDE_APLIQUE');

  readonly resolviendoEnMasa = signal<boolean>(false);

  /**
   * El desenlace de la última resolución múltiple, mientras el auditor no lo
   * descarte.
   *
   * Persistente a propósito: un resultado parcial tiene que seguir en pantalla
   * hasta que se lea. Si desapareciera solo, un «se resolvieron 41 de 47» se
   * perdería y el auditor daría por hechas las seis que no se resolvieron.
   */
  readonly resultadoMasivo = signal<ResolucionMasivaModel | null>(null);

  /**
   * Los motivos marcados que **siguen existiendo** en la cuenta.
   *
   * El filtro contra el agregado no es defensivo de más: al resolver, el
   * agregado se recarga y los motivos resueltos desaparecen. Sin esta poda, un
   * código ya resuelto seguiría contando en el impacto y viajaría en la
   * siguiente petición, donde el servicio lo rechazaría por desconocido.
   */
  readonly motivosMarcados = computed<ResumenMotivoModel[]>(() => {
    const marcados = this._marcados();
    return this.motivos().filter(m => marcados.has(m.codigo));
  });

  readonly hayMarcados = computed(() => this.motivosMarcados().length > 0);

  estaMarcado(codigo: string): boolean {
    return this._marcados().has(codigo);
  }

  alternarMotivo(codigo: string): void {
    const siguiente = new Set(this._marcados());
    if (!siguiente.delete(codigo)) siguiente.add(codigo);
    this._marcados.set(siguiente);
  }

  /**
   * Marca todos los motivos de la cuenta — no los de la página.
   *
   * Aquí «todos» sí es una cantidad que se puede leer y comprobar: el agregado
   * tiene 24 motivos en la cuenta mayor medida. Sobre filas habría significado
   * «25 de 3.507», que es la clase de «todo» que engaña.
   */
  marcarTodos(): void {
    this._marcados.set(new Set(this.motivos().map(m => m.codigo)));
  }

  desmarcarTodos(): void {
    this._marcados.set(new Set<string>());
  }

  /** Todos los motivos de la cuenta están marcados. */
  readonly todosMarcados = computed(() =>
    this.motivos().length > 0 && this.motivosMarcados().length === this.motivos().length);

  /**
   * Qué va a pasar exactamente si se confirma, y qué va a quedar sin resolver.
   *
   * Lo segundo es la mitad que faltaba. Los dos niveles del sistema de registro
   * son disjuntos: a nivel cuenta las filas de línea se quedan, y a nivel línea
   * se queda la de cabecera. El aviso que había antes en la pantalla suponía lo
   * contrario —que «Cuenta y Líneas» alcanzaba las dos cosas— y por tanto
   * prometía de más.
   *
   * Que un motivo tenga como máximo una fila de cabecera está medido: cero
   * repetidos de (cuenta, motivo) en una muestra de 200 filas de cabecera sin
   * resolver de producción y en las cinco cuentas de referencia (12-oct-2026).
   */
  readonly impactoSeleccion = computed(() => {
    const nivel      = this.nivelResolucion();
    const marcados   = this.motivosMarcados();
    const enCabecera = marcados.filter(m => m.enCabecera);
    const conLineas  = marcados.filter(m => m.lineasAfectadas > 0);

    const filasCabecera = enCabecera.length;
    const filasLinea    = marcados.reduce(
      (suma, m) => suma + m.sinResolver - (m.enCabecera ? 1 : 0), 0);
    const lineas = conLineas.reduce((suma, m) => suma + m.lineasAfectadas, 0);

    const alcanzaCabecera = nivel === 'CUENTA' || nivel === 'DONDE_APLIQUE';
    const alcanzaLineas   = nivel === 'LINEAS' || nivel === 'DONDE_APLIQUE';

    return {
      motivos:     marcados.length,
      bloqueantes: marcados.filter(m => m.bloqueante).length,
      /** Pendientes que se van a resolver con el nivel elegido. */
      seResuelven: (alcanzaCabecera ? filasCabecera : 0) + (alcanzaLineas ? filasLinea : 0),
      /** Líneas distintas afectadas, si el nivel alcanza las líneas. */
      lineas:      alcanzaLineas ? lineas : 0,
      /** Pendientes de los motivos marcados que el nivel elegido NO toca. */
      seQuedan:    (alcanzaCabecera ? 0 : filasCabecera) + (alcanzaLineas ? 0 : filasLinea),
      /** Cuántas operaciones manda el servicio: dos si hay de los dos niveles. */
      operaciones: (alcanzaCabecera && filasCabecera > 0 ? 1 : 0)
                 + (alcanzaLineas && lineas > 0 ? 1 : 0),
    };
  });

  /** Nada que resolver con el nivel elegido, aunque haya motivos marcados. */
  readonly seleccionSinEfecto = computed(() =>
    this.hayMarcados() && this.impactoSeleccion().seResuelven === 0);

  descartarResultado(): void {
    this.resultadoMasivo.set(null);
  }

  /**
   * Resuelve los motivos marcados y recarga la cuenta.
   *
   * Devuelve el desenlace y no un booleano: `EN_CURSO` no es ni éxito ni
   * fracaso, y tratarlo como fracaso invitaría a reintentar una operación que no
   * es idempotente y que ya está en marcha.
   *
   * Se recarga igual con cualquier desenlace, incluido el fallido: lo único que
   * dice la verdad sobre lo que quedó es volver a preguntárselo al servicio.
   */
  async resolverMarcados(justificacion: string, auditor: string): Promise<ResolucionMasivaModel | null> {
    const codigo = this.codigoCuenta();
    const marcados = this.motivosMarcados();
    if (!codigo || marcados.length === 0) return null;

    this.errorComando.set(null);
    this.resultadoMasivo.set(null);
    this.resolviendoEnMasa.set(true);

    try {
      const resultado = await lastValueFrom(this.masivoUC.execute(
        codigo,
        {
          motivos: marcados.map(m => m.codigo),
          justificacion,
          nivel: this.nivelResolucion(),
        },
        auditor));

      this.resultadoMasivo.set(resultado);
      this.desmarcarTodos();
      // En curso no es el final: se sigue sin bloquear la pantalla (OPE-06).
      if (resultado.desenlace === 'EN_CURSO' && resultado.referencias.length > 0) {
        this.seguirResolucion(codigo, resultado.referencias, resultado.fallos);
      }

      // Si el motivo por el que se filtraba era uno de los resueltos, el filtro
      // se queda sin objeto y dejaría una tabla vacía con el selector apuntando
      // a algo que ya no está.
      const filtrado = this.motivoFiltrado();
      if (filtrado && marcados.some(m => m.codigo === filtrado)) {
        this.motivoFiltrado.set(null);
      }

      this._recargaMotivos.update(n => n + 1);
      this.reiniciarPaginacion();
      return resultado;
    } catch (err: unknown) {
      this.errorComando.set((err as Error).message ?? 'Error al resolver los pendientes');
      return null;
    } finally {
      this.resolviendoEnMasa.set(false);
    }
  }

  // ── Seguimiento de una resolución en curso (OPE-06) ──────────────────────
  //
  // La resolución responde en pocos segundos aunque el sistema de registro no haya
  // terminado. Desde aquí se pregunta cómo va, cada pocos segundos y sin bloquear nada: el
  // auditor puede seguir trabajando, incluso en otra pestaña de la cuenta. Vive en la raíz
  // para que el seguimiento sobreviva a la navegación.
  //
  // Se sigue **por cuenta**: el auditor puede lanzar una en una cuenta, abrir otra y lanzar
  // otra allí. Si hubiera un solo seguimiento, el segundo cortaría el primero y esa cuenta
  // se quedaría sin recargar y con el botón de resolver encendido sobre una operación viva.

  /** Cada cuánto se pregunta. Las de una cuenta pequeña acaban en unos 5 s. */
  readonly INTERVALO_SEGUIMIENTO_MS = 2000;
  /** Cuántas veces como mucho: cinco minutos. Pasado eso se dice y se ofrece reintentar. */
  readonly MAXIMO_CONSULTAS = 150;
  /** Fallos seguidos de la consulta antes de rendirse. Uno suelto no significa nada. */
  readonly MAXIMO_FALLOS_SEGUIDOS = 3;

  private readonly seguimientos = new Map<string, Subscription>();

  /** Las resoluciones que se están siguiendo, por cuenta. */
  private readonly _enCurso = signal<ReadonlyMap<string, SeguimientoResolucion>>(new Map());

  /**
   * La última que terminó en cada cuenta, con su desenlace. La observan las pantallas que
   * tienen que recargarse —la grilla de líneas, por ejemplo— sin depender de que esta esté
   * abierta.
   */
  private readonly _terminadas = signal<ReadonlyMap<string, ResolucionTerminada>>(new Map());

  /**
   * Las que se dejaron de seguir sin saber cómo acabaron: tope de tiempo o fallos seguidos.
   * Llevan las referencias para poder volver a preguntar. Nunca se ofrece relanzar: resolver
   * no es idempotente, y la operación ya está en el sistema de registro.
   */
  private readonly _sinConfirmar = signal<ReadonlyMap<string, SeguimientoSinConfirmar>>(new Map());

  /** La resolución que se está siguiendo en esa cuenta, si hay una. */
  resolucionEnCursoDe(codigoCuenta: string | null): SeguimientoResolucion | null {
    return codigoCuenta ? this._enCurso().get(codigoCuenta) ?? null : null;
  }

  /** La última que terminó en esa cuenta mientras se seguía. */
  resolucionTerminadaDe(codigoCuenta: string | null): ResolucionTerminada | null {
    return codigoCuenta ? this._terminadas().get(codigoCuenta) ?? null : null;
  }

  /** La que se dejó de seguir sin confirmar en esa cuenta. */
  seguimientoSinConfirmarDe(codigoCuenta: string | null): SeguimientoSinConfirmar | null {
    return codigoCuenta ? this._sinConfirmar().get(codigoCuenta) ?? null : null;
  }

  /** Si hay una resolución en curso en esa cuenta: no se deja lanzar otra encima. */
  hayResolucionEnCurso(codigoCuenta: string | null): boolean {
    return this.resolucionEnCursoDe(codigoCuenta) !== null;
  }

  /**
   * Empieza a seguir unas referencias. Si esa cuenta ya tenía otra, la sustituye; las de
   * otras cuentas siguen.
   *
   * `fallosDeLanzamiento` son los que ya trajo la respuesta del lanzamiento —un nivel que no
   * llegó a salir, líneas sin lanzar—: el seguimiento solo pregunta por las operaciones que
   * sí salieron, así que sin guardarlos aquí el desenlace final los perdería y diría
   * «completo» con un nivel sin resolver.
   */
  seguirResolucion(codigoCuenta: string, referencias: string[],
                   fallosDeLanzamiento: FalloResolucionModel[] = []): void {
    this.dejarDeSeguir(codigoCuenta);
    this.quitar(this._sinConfirmar, codigoCuenta);
    const seguimiento: SeguimientoResolucion = {
      codigoCuenta, referencias, consultas: 0, fallosDeLanzamiento };
    this.poner(this._enCurso, codigoCuenta, seguimiento);
    let fallosSeguidos = 0;

    const suscripcion = timer(this.INTERVALO_SEGUIMIENTO_MS, this.INTERVALO_SEGUIMIENTO_MS).pipe(
      take(this.MAXIMO_CONSULTAS),
      // exhaustMap: si una consulta tarda más que el intervalo, se salta el tic en vez de
      // amontonar peticiones.
      exhaustMap(() => this.seguirUC.execute(codigoCuenta, referencias).pipe(
        map(resultado => ({ resultado, error: null as Error | null })),
        catchError((error: Error) => of({ resultado: null, error })))),
    ).subscribe({
      next: ({ resultado, error }) => {
        const actual = this._enCurso().get(codigoCuenta);
        if (actual) this.poner(this._enCurso, codigoCuenta, { ...actual, consultas: actual.consultas + 1 });
        if (error || !resultado) {
          if (++fallosSeguidos >= this.MAXIMO_FALLOS_SEGUIDOS) {
            this.sinConfirmar(seguimiento,
              error?.message ?? 'No se pudo consultar el estado de la operación');
          }
          return;
        }
        fallosSeguidos = 0;
        if (resultado.desenlace !== 'EN_CURSO') {
          this.terminar(codigoCuenta, conFallosDeLanzamiento(resultado, fallosDeLanzamiento));
        }
      },
      complete: () => {
        if (this.seguimientos.get(codigoCuenta) === suscripcion) {
          this.sinConfirmar(seguimiento,
            'El sistema de registro sigue trabajando después de cinco minutos');
        }
      },
    });
    this.seguimientos.set(codigoCuenta, suscripcion);
  }

  /** Vuelve a preguntar por la resolución que se dejó sin confirmar en esa cuenta. */
  volverAConsultar(codigoCuenta: string | null = this.codigoCuenta()): void {
    const pendiente = this.seguimientoSinConfirmarDe(codigoCuenta);
    if (pendiente) {
      this.seguirResolucion(pendiente.codigoCuenta, pendiente.referencias, pendiente.fallosDeLanzamiento);
    }
  }

  private terminar(codigoCuenta: string, resultado: ResolucionMasivaModel): void {
    this.dejarDeSeguir(codigoCuenta);
    this.quitar(this._enCurso, codigoCuenta);
    this.poner(this._terminadas, codigoCuenta, { codigoCuenta, resultado, instante: Date.now() });
    // El aviso y la lista solo se tocan si el auditor sigue en esa cuenta.
    if (this.codigoCuenta() === codigoCuenta) {
      this.resultadoMasivo.set(resultado);
      this._recargaMotivos.update(n => n + 1);
      this.reiniciarPaginacion();
    }
  }

  private sinConfirmar(seguimiento: SeguimientoResolucion, motivo: string): void {
    const { codigoCuenta } = seguimiento;
    this.dejarDeSeguir(codigoCuenta);
    this.quitar(this._enCurso, codigoCuenta);
    this.poner(this._sinConfirmar, codigoCuenta, { ...seguimiento, consultas: 0, motivo });
  }

  private dejarDeSeguir(codigoCuenta: string): void {
    const suscripcion = this.seguimientos.get(codigoCuenta);
    this.seguimientos.delete(codigoCuenta);
    suscripcion?.unsubscribe();
  }

  private poner<T>(mapa: WritableSignal<ReadonlyMap<string, T>>, clave: string, valor: T): void {
    mapa.update(actual => new Map(actual).set(clave, valor));
  }

  private quitar<T>(mapa: WritableSignal<ReadonlyMap<string, T>>, clave: string): void {
    if (!mapa().has(clave)) return;
    mapa.update(actual => {
      const siguiente = new Map(actual);
      siguiente.delete(clave);
      return siguiente;
    });
  }

  /**
   * Resuelve un pendiente y vuelve a cargar desde el principio.
   *
   * Vuelve al principio a propósito: OHI resuelve el **motivo entero** de la
   * cuenta, no la fila (`/claims/{id}/resolvepend/{idMotivo}`), así que lo que
   * desaparece pueden ser cientos de filas y el cursor de la página en curso
   * deja de apuntar a nada. También se recarga el agregado, porque el motivo
   * resuelto debe salir del selector.
   */
  async resolver(
    codigoCuenta: string,
    idMotivo: number,
    solicitud: ResolverPendienteRequest,
    auditor: string,
    codigoMotivo?: string
  ): Promise<boolean> {
    this.errorComando.set(null);
    try {
      await lastValueFrom(
        this.resolverUC.execute(codigoCuenta, idMotivo, solicitud, auditor)
      );
      this._recargaMotivos.update(n => n + 1);
      // Si lo resuelto era justo el motivo del filtro, el filtro se queda sin
      // objeto: ese motivo ya no existe en la cuenta. Mantenerlo dejaría una
      // tabla vacía con un selector apuntando a algo que ya no está.
      if (codigoMotivo && codigoMotivo === this.motivoFiltrado()) {
        this.motivoFiltrado.set(null);
      }
      // `reiniciarPaginacion` repone `cursorRequest` con un objeto nuevo, y eso
      // ya dispara el rxResource: no hace falta un reload aparte.
      this.reiniciarPaginacion();
      return true;
    } catch (err: unknown) {
      this.errorComando.set((err as Error).message ?? 'Error al resolver pendiente');
      return false;
    }
  }
}

/** Una resolución que se está siguiendo. */
export interface SeguimientoResolucion {
  codigoCuenta: string;
  referencias:  string[];
  /** Cuántas veces se ha preguntado ya. */
  consultas:    number;
  /** Lo que ya falló al lanzar: entra en el desenlace final. */
  fallosDeLanzamiento: FalloResolucionModel[];
}

/** Una que se dejó de seguir sin saber cómo acabó. */
export type SeguimientoSinConfirmar = SeguimientoResolucion & { motivo: string };

/** Una resolución que terminó mientras se seguía. */
export interface ResolucionTerminada {
  codigoCuenta: string;
  resultado:    ResolucionMasivaModel;
  /** Para distinguir dos terminadas seguidas de la misma cuenta. */
  instante:     number;
}

/**
 * El desenlace de lo que se siguió, con lo que ya había fallado al lanzar.
 *
 * Un fallo de lanzamiento significa que algo pedido no se resolvió: lo completo pasa a
 * parcial. Lo fallido sigue fallido —no salió bien ni lo lanzado ni lo demás—.
 */
export function conFallosDeLanzamiento(resultado: ResolucionMasivaModel,
                                       fallos: FalloResolucionModel[]): ResolucionMasivaModel {
  if (fallos.length === 0) return resultado;
  return {
    ...resultado,
    desenlace:    resultado.desenlace === 'FALLIDO' ? 'FALLIDO' : 'PARCIAL',
    todoResuelto: false,
    fallos:       [...fallos, ...resultado.fallos],
  };
}
