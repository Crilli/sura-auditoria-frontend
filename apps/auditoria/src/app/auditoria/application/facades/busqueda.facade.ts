import { Injectable, inject, signal, computed } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { CuentaRepository } from '../../domain/ports/cuenta.repository';
import {
  FiltroCuentasModel, HitoModel, ResumenCuentaModel
} from '../../domain/models/cuenta-medica.model';
import { OffsetPage } from '../../../../../../../libs/data-access/http/src/lib/offset-page.model';

/**
 * El buscador de facturas.
 *
 * ## Sin criterio no se pregunta
 * El recurso no dispara mientras el filtro esté vacío. No es solo ahorro: el servicio
 * respondería 400 —buscar sin criterio devolvería todo el sistema paginado— y la pantalla
 * enseñaría un error al abrirse, antes de que el auditor haya escrito nada.
 *
 * ## En la raíz, a propósito
 * Volver del detalle de una cuenta a la lista tiene que encontrar la búsqueda donde se dejó.
 * Si la fachada muriera con la pantalla, el auditor tendría que reescribir la factura cada vez
 * que mira una de sus versiones.
 */
@Injectable({ providedIn: 'root' })
export class BusquedaFacade {

  private readonly repositorio = inject(CuentaRepository);

  readonly TAMANO_PAGINA = 25;

  private readonly _filtro = signal<FiltroCuentasModel>({});
  private readonly _pagina = signal(0);

  readonly filtro = this._filtro.asReadonly();
  readonly pagina = this._pagina.asReadonly();

  /** Si hay algo por lo que buscar. Sin esto no se sale al servicio. */
  readonly hayCriterio = computed(() => {
    const f = this._filtro();
    return !!(f.factura?.trim() || f.radicado?.trim());
  });

  private readonly _resultado = rxResource({
    params: () => this.hayCriterio()
      ? { filtro: this._filtro(), pagina: this._pagina() }
      : undefined,
    stream: ({ params }) =>
      this.repositorio.buscar(params.filtro, params.pagina, this.TAMANO_PAGINA),
  });

  // `hasValue()` antes de `value()`: en error, `value()` LANZA en vez de devolver nada, y una
  // búsqueda caída rompería la plantilla entera en vez de pintar el aviso.
  private readonly _pagina_ = computed<OffsetPage<ResumenCuentaModel> | null>(() =>
    this._resultado.hasValue() ? (this._resultado.value() ?? null) : null);

  readonly resultados  = computed(() => this._pagina_()?.elementos ?? []);
  readonly total       = computed(() => this._pagina_()?.totalRegistros ?? null);
  readonly totalPaginas = computed(() => this._pagina_()?.totalPaginas ?? null);
  readonly hayMas      = computed(() => this._pagina_()?.hayMas ?? false);
  readonly cargando    = computed(() => this._resultado.isLoading());
  // Sin fallo el recurso da `undefined`, no `null`: se normaliza para que el tipo diga la verdad.
  readonly error       = computed(() => (this._resultado.error() as Error | undefined) ?? null);

  /**
   * La historia de las cuentas abiertas cuyas versiones se desplegaron.
   *
   * De ahí sale la fila «en curso»: desde cuándo está la cuenta en su estado y por qué se
   * reabrió. Se pide al desplegar y no con la búsqueda, porque son dos consultas al sistema de
   * registro por cuenta y casi nadie despliega más de una o dos. Una entrada `null` es una
   * historia pedida que todavía no llegó.
   */
  private readonly _historias = signal<ReadonlyMap<string, HitoModel[] | null>>(new Map());

  /** La historia ya llegada de una cuenta, o `null` si no se ha pedido o no ha llegado. */
  historiaDe(codigo: string): HitoModel[] | null {
    return this._historias().get(codigo) ?? null;
  }

  /**
   * Pide la historia de una cuenta, una sola vez.
   *
   * Si falla no se enseña ningún error: la fila en curso sale igual, sin fecha ni motivo, que
   * son contexto y no lo que la define. Se olvida el intento para que volver a desplegar
   * reintente.
   */
  cargarHistoria(codigo: string): void {
    if (this._historias().has(codigo)) return;
    this.guardarHistoria(codigo, null);
    this.repositorio.consultarHistoria(codigo).subscribe({
      next: hitos => this.guardarHistoria(codigo, hitos),
      error: () => this._historias.update(actual => {
        const copia = new Map(actual);
        copia.delete(codigo);
        return copia;
      }),
    });
  }

  private guardarHistoria(codigo: string, hitos: HitoModel[] | null): void {
    this._historias.update(actual => new Map(actual).set(codigo, hitos));
  }

  /** Si ya se buscó y no salió nada: distinto de «todavía no se ha buscado». */
  readonly sinResultados = computed(() =>
    this.hayCriterio() && !this.cargando() && !this.error() && this.resultados().length === 0);

  buscar(filtro: FiltroCuentasModel): void {
    this._filtro.set({ factura: filtro.factura?.trim() || null,
                       radicado: filtro.radicado?.trim() || null });
    // Una búsqueda nueva empieza por la primera página: la séptima del criterio anterior
    // no significa nada en el nuevo.
    this._pagina.set(0);
    // Y vuelve a preguntar la historia: buscar otra vez es querer ver la cuenta como está ahora.
    this._historias.set(new Map());
  }

  irAPagina(pagina: number): void {
    this._pagina.set(Math.max(0, pagina));
  }

  limpiar(): void {
    this._filtro.set({});
    this._pagina.set(0);
    this._historias.set(new Map());
  }
}
