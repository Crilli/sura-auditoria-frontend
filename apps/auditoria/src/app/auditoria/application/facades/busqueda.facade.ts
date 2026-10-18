import { Injectable, inject, signal, computed } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { CuentaRepository } from '../../domain/ports/cuenta.repository';
import { FiltroCuentasModel, ResumenCuentaModel } from '../../domain/models/cuenta-medica.model';
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

  /** Si ya se buscó y no salió nada: distinto de «todavía no se ha buscado». */
  readonly sinResultados = computed(() =>
    this.hayCriterio() && !this.cargando() && !this.error() && this.resultados().length === 0);

  buscar(filtro: FiltroCuentasModel): void {
    this._filtro.set({ factura: filtro.factura?.trim() || null,
                       radicado: filtro.radicado?.trim() || null });
    // Una búsqueda nueva empieza por la primera página: la séptima del criterio anterior
    // no significa nada en el nuevo.
    this._pagina.set(0);
  }

  irAPagina(pagina: number): void {
    this._pagina.set(Math.max(0, pagina));
  }

  limpiar(): void {
    this._filtro.set({});
    this._pagina.set(0);
  }
}
