import { Injectable, inject, signal, computed, effect, untracked } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { lastValueFrom } from 'rxjs';
import { ListarLineasUseCase }          from '../use-cases/listar-lineas.use-case';
import { ConsultarDetalleLineaUseCase } from '../use-cases/consultar-detalle-linea.use-case';
import { GuardarLineaUseCase }          from '../use-cases/guardar-linea.use-case';
import { ObtenerSiguienteLineaUseCase } from '../use-cases/obtener-siguiente-linea.use-case';
import { ResumenLineaModel, DetalleLineaModel, GuardarLineaRequest } from '../../domain/models/linea-cuenta.model';
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

  /** Tamaño de página fijo: es el máximo que acepta el servicio. */
  readonly TAMANO_PAGINA = 25;

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
        cursor: this.cursorRequest()
      };
    },
    stream: ({ params }) => this.listarUC.execute(params.codigo, params.cursor)
  });

  readonly lineas      = computed(() => (this._lineasResource.value() as CursorPage<ResumenLineaModel> | undefined)?.elementos     ?? []);
  readonly cursorSig   = computed(() => (this._lineasResource.value() as CursorPage<ResumenLineaModel> | undefined)?.cursorSiguiente ?? null);
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
      const pagina = this._lineasResource.value() as CursorPage<ResumenLineaModel> | undefined;
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
    this._cursores.set([undefined]);
    this._totalRegistros.set(null);
    this.paginaActual.set(1);
    this.cursorRequest.set({ tamano: this.TAMANO_PAGINA }); // Reinicia a primera página
  }

  /**
   * Va a la página indicada (1 en adelante).
   *
   * Si su cursor ya se conoce el salto es inmediato. Si está más adelante del
   * punto alcanzado, se recorren las páginas intermedias para ir encadenando
   * cursores: es el precio de numerar páginas sobre un servicio keyset, que no
   * sabe saltar a un desplazamiento arbitrario.
   */
  async irAPagina(numero: number): Promise<void> {
    const total = this.totalPaginas();
    if (numero < 1 || numero === this.paginaActual()) return;
    if (total !== null && numero > total) return;

    const cursores = this._cursores();
    if (numero === 1 || cursores[numero - 1] !== undefined) {
      this.paginaActual.set(numero);
      this.cursorRequest.set({ cursor: cursores[numero - 1], tamano: this.TAMANO_PAGINA });
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

    this.recorriendo.set(true);
    try {
      const cursores = [...this._cursores()];
      let indice = cursores.length - 1;   // última página con cursor conocido

      while (indice < destino - 1) {
        const cursor = cursores[indice];
        if (cursor === undefined && indice > 0) break;   // no hay más páginas

        const pagina = await lastValueFrom(
          this.listarUC.execute(codigo, { cursor, tamano: this.TAMANO_PAGINA })
        );
        cursores[indice + 1] = pagina.cursorSiguiente ?? undefined;
        if (!pagina.cursorSiguiente) break;
        indice++;
      }

      this._cursores.set(cursores);

      const cursorDestino = cursores[destino - 1];
      if (destino === 1 || cursorDestino !== undefined) {
        this.paginaActual.set(destino);
        this.cursorRequest.set({ cursor: cursorDestino, tamano: this.TAMANO_PAGINA });
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
