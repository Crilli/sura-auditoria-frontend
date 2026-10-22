import {
  ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal, numberAttribute
} from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CuentaRepository } from '../../domain/ports/cuenta.repository';
import {
  GlosaDeVersionModel, LINEAS_POR_PAGINA_DE_VERSION, LineaDeVersionModel, textoDeEstadoDeLinea
} from '../../domain/models/linea-de-version.model';
import { paginasVisibles } from '../compartido/paginas-visibles';
import { OffsetPage } from '../../../../../../../libs/data-access/http/src/lib/offset-page.model';

/**
 * Las líneas de una versión, en solo lectura (BUS-21).
 *
 * ## No es la grilla de la cuenta actual, a propósito
 * `LineasListComponent` guarda su página, sus filtros y su selección en `LineaFacade`, que es de
 * toda la aplicación, y lleva dentro todo lo que escribe —selección, lote, edición en la fila,
 * el lápiz—. Usada para una versión, pisaría el estado de la cuenta actual y ofrecería escribir
 * en ella desde una pantalla que enseña otra cosa: todas sus órdenes van a /cuentas/{codigo}.
 * Esta pide lo suyo y lo guarda en sí misma; muere con la ruta.
 *
 * ## Sin filtros
 * En el histórico casi ningún campo se puede filtrar en el sistema de registro (los dinámicos,
 * como el valor glosado, dan error), y una versión tiene pocas líneas: medido en UAT el
 * 2026-10-21, mediana 2, p99 117, máximo 518. Se pagina de 25 en 25, en orden de número de línea.
 *
 * ## La página va en la URL
 * `?pagina=` (desde uno). Así el enlace se comparte tal cual y «Volver a las líneas» desde una
 * línea abierta regresa a la página donde estaba.
 */
@Component({
  selector: 'sura-lineas-version',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CurrencyPipe, DatePipe, RouterLink, MatTableModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatTooltipModule,
  ],
  // Sin hoja de estilos propia: la grilla de la versión vive en la capa global
  // (apps/shell/src/styles/_version-cuenta.scss) por el presupuesto de 4 kB por componente.
  templateUrl: './lineas-version.component.html',
})
export class LineasVersionComponent {

  /** Heredados de la ruta (`paramsInheritanceStrategy: 'always'`). */
  readonly codigo = input.required<string>();
  readonly numero = input.required<number, unknown>({ transform: numberAttribute });
  /** `?pagina=` de la URL, contando desde uno. */
  readonly pagina = input<number, unknown>(1, { transform: (v: unknown) => numberAttribute(v, 1) });

  private readonly cuentas = inject(CuentaRepository);
  private readonly router = inject(Router);
  private readonly ruta = inject(ActivatedRoute);

  readonly columnas = [
    'numeroLinea', 'estado', 'atencion', 'procedimiento', 'afiliado',
    // Mismo orden que la grilla de la cuenta actual: cargado, convenido, autorizado, IVA, glosado.
    'valorCargado', 'valorConvenido', 'valorAutorizado', 'iva', 'valorGlosado', 'ver',
  ];

  readonly numeroValido = computed(() => Number.isInteger(this.numero()) && this.numero() >= 1);
  readonly paginaActual = computed(() => {
    const p = this.pagina();
    return Number.isInteger(p) && p >= 1 ? p : 1;
  });

  private readonly _lineas = rxResource({
    params: () => this.numeroValido()
      ? { codigo: this.codigo(), numero: this.numero(), pagina: this.paginaActual() - 1 } : undefined,
    stream: ({ params }) => this.cuentas.listarLineasDeVersion(
      params.codigo, params.numero, params.pagina, LINEAS_POR_PAGINA_DE_VERSION),
  });

  /**
   * La página que se pinta: la que llegó o, mientras llega la siguiente, la anterior. `null` en la
   * primera carga y si falló.
   *
   * Al cambiar de página el componente se reutiliza y el recurso se vacía mientras pide la nueva.
   * Si la tabla y el paginador se fueran con él, el botón pulsado se destruiría con el foco
   * dentro —quien pagina con el teclado volvería a empezar desde arriba en cada página— y la
   * pantalla saltaría. Se queda la anterior, atenuada, hasta que llega la nueva; la espera grande
   * es solo para la primera. Un error la retira: no se deja una tabla que ya no corresponde.
   */
  readonly respuesta = linkedSignal<OffsetPage<LineaDeVersionModel> | undefined, OffsetPage<LineaDeVersionModel> | null>({
    source: () => this._lineas.hasValue() ? this._lineas.value() : undefined,
    computation: (nueva, anterior) =>
      nueva ?? (this._lineas.isLoading() && !this._lineas.error() ? anterior?.value ?? null : null),
  });
  readonly lineas = computed<LineaDeVersionModel[]>(() => this.respuesta()?.elementos ?? []);
  readonly cargando = computed(() => this._lineas.isLoading());
  /**
   * El fallo de la última consulta. Sigue mientras se reintenta —el recurso lo conserva hasta la
   * respuesta—, y así el aviso se queda con su botón, apagado, en vez de cambiarse por la espera
   * y llevarse el foco.
   */
  readonly error = computed(() => {
    const e = this._lineas.error() as Error | undefined;
    return e ? (e.message || 'No se pudieron consultar las líneas de la versión.') : null;
  });

  /**
   * La versión existe y no tiene ninguna línea: lo normal en la madre de un large claim. Por la
   * página que llegó y no por la de la URL: mientras se pide la primera desde una página vacía,
   * la que sigue en pantalla es la vacía, y no por eso la versión deja de tener líneas.
   */
  readonly sinLineas = computed(() => {
    const p = this.respuesta();
    return !!p && p.elementos.length === 0 && (p.totalRegistros === 0 || p.desplazamiento === 0);
  });
  /** Se pidió una página después de la última (un enlace viejo o tecleado). */
  readonly paginaVacia = computed(() => {
    const p = this.respuesta();
    return !!p && p.elementos.length === 0 && !this.sinLineas();
  });

  readonly totalPaginas = computed(() => this.respuesta()?.totalPaginas ?? null);
  readonly paginas = computed(() => paginasVisibles(this.totalPaginas(), this.paginaActual()));
  readonly hayAnterior = computed(() => this.paginaActual() > 1);
  readonly haySiguiente = computed(() => this.respuesta()?.hayMas ?? false);

  /** «26–50 de 501 líneas». */
  readonly rango = computed(() => {
    const p = this.respuesta();
    if (!p || p.elementos.length === 0) return null;
    const desde = p.desplazamiento + 1;
    return { desde, hasta: p.desplazamiento + p.elementos.length, total: p.totalRegistros };
  });

  /** Dónde está la fila en el orden de la versión: la línea abierta lo usa para anterior y siguiente. */
  posicionDe(indice: number): number {
    return (this.respuesta()?.desplazamiento ?? 0) + indice;
  }

  esNumero(valor: number | '…'): valor is number {
    return valor !== '…';
  }

  // Los botones apagados del paginador siguen recibiendo clics (`disabledInteractive`, para no
  // perder el foco): las puertas están aquí, no en el `[disabled]`.

  paginaAnterior(): void {
    if (this.hayAnterior()) this.irAPagina(this.paginaActual() - 1);
  }

  paginaSiguiente(): void {
    if (this.haySiguiente()) this.irAPagina(this.paginaActual() + 1);
  }

  irAPagina(numero: number): void {
    if (this.cargando() || numero < 1 || numero === this.paginaActual()) return;
    void this.router.navigate([], {
      relativeTo: this.ruta,
      queryParams: { pagina: numero > 1 ? numero : null },
      queryParamsHandling: 'merge',
    });
  }

  reintentar(): void {
    this._lineas.reload();
  }

  readonly textoDeEstado = textoDeEstadoDeLinea;

  /** El color del estado, además de su palabra: verde aprobada, rojo negada, gris lo demás. */
  claseDeEstado(estado: string | null): string {
    switch (estado) {
      case 'APROBADA': return 'sura-distintivo--exito';
      case 'NEGADA':   return 'sura-distintivo--error';
      default:         return 'sura-distintivo--neutro';
    }
  }

  /** Los causales de la línea en un renglón: «223-1A · 423-1». */
  causales(glosas: GlosaDeVersionModel[]): string {
    return glosas.map(g => g.codigo ?? 'sin causal').join(' · ');
  }

  /** Una glosa por renglón, para el tooltip: causal, valor y concepto. */
  desgloseDeGlosa(glosas: GlosaDeVersionModel[]): string {
    const pesos = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
    return glosas.map(g => [
      g.codigo ?? 'sin causal',
      g.valor === null ? '—' : pesos.format(g.valor),
      g.conceptoEspecifico ?? g.concepto ?? g.texto,
    ].filter(Boolean).join(' — ')).join('\n');
  }
}
