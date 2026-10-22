import {
  ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal, numberAttribute
} from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { Observable, forkJoin, map, of, switchMap } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CuentaRepository } from '../../domain/ports/cuenta.repository';
import {
  LINEAS_POR_PAGINA_DE_VERSION, textoDeEstadoDeLinea
} from '../../domain/models/linea-de-version.model';
import { SeveridadNovedad } from '../../domain/models/linea-cuenta.model';
import { SEVERIDAD_NOVEDAD, textoDeOrigen } from '../compartido/origenes-novedad';

/** Las vecinas de la línea en el orden de la versión, para «anterior» y «siguiente». */
interface Vecinas {
  anterior: number | null;
  siguiente: number | null;
  /** Dónde está la línea abierta, contando desde cero. `null` si no se encontró. */
  posicion: number | null;
}

const SIN_VECINAS: Vecinas = { anterior: null, siguiente: null, posicion: null };

/**
 * Cuántas páginas se recorren, como mucho, para situar una línea abierta desde un enlace pegado
 * (sin `?posicion=`). Mil líneas: la mayor versión medida en UAT el 2026-10-21 tenía 518.
 */
const PAGINAS_PARA_SITUARLA = 40;

/**
 * Una línea de una versión, tal como quedó al finalizarse (BUS-21.5), en solo lectura.
 *
 * ## No es el detalle de la línea viva
 * `LineaEdicionComponent` lee y escribe la línea actual a través de `LineaFacade`, que es de toda
 * la aplicación, y sus secciones esperan un formulario. Aquí no hay nada que escribir: se pinta
 * lo que guardó el histórico —valores, glosas, novedades con el texto de entonces, diagnósticos,
 * convenio y atención— sin un solo control de formulario.
 *
 * ## Anterior y siguiente
 * Los números de línea no son correlativos (medido en CM-29939061906: 1, 127, 128…), así que la
 * vecina no se deduce sumando uno: se pregunta al servicio por la que va antes y después en el
 * orden de la versión. La grilla pasa la posición en `?posicion=`, pero no se da por buena sin
 * confirmarla: la fila que hay en ella tiene que ser esta misma línea. Si no lo es —un enlace
 * editado, o la posición de otra versión pegada a mano— o falta —un enlace pegado—, se busca la
 * línea página a página. La versión es una foto y no cambia, así que una posición confirmada no
 * caduca.
 */
@Component({
  selector: 'sura-linea-version',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CurrencyPipe, DatePipe, RouterLink, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatTooltipModule,
  ],
  // Sin hoja de estilos propia: lo común del detalle ya es global (`_ficha-detalle.scss`) y lo
  // de la versión vive en `_version-cuenta.scss`, por el presupuesto de 4 kB por componente.
  templateUrl: './linea-version.component.html',
})
export class LineaVersionComponent {

  /** Heredados de la ruta (`paramsInheritanceStrategy: 'always'`). */
  readonly codigo = input.required<string>();
  readonly numero = input.required<number, unknown>({ transform: numberAttribute });
  readonly numeroLinea = input.required<number, unknown>({ transform: numberAttribute });
  /** `?posicion=` que pone la grilla: el lugar de la línea en la versión, desde cero. */
  readonly posicion = input<number | null, unknown>(null, {
    transform: (v: unknown) => {
      const n = numberAttribute(v, Number.NaN);
      return Number.isInteger(n) && n >= 0 ? n : null;
    },
  });

  private readonly cuentas = inject(CuentaRepository);
  /** La de `versiones/:numero`: las líneas de la versión y las vecinas se enlazan desde ahí. */
  readonly rutaDeLaVersion = inject(ActivatedRoute).parent;

  private readonly clave = computed(() => {
    const numero = this.numero();
    const numeroLinea = this.numeroLinea();
    return Number.isInteger(numero) && numero >= 1 && Number.isInteger(numeroLinea)
      ? { codigo: this.codigo(), numero, numeroLinea } : undefined;
  });

  private readonly _linea = rxResource({
    params: () => this.clave(),
    stream: ({ params }) =>
      this.cuentas.consultarLineaDeVersion(params.codigo, params.numero, params.numeroLinea),
  });

  readonly linea = computed(() => this._linea.hasValue() ? this._linea.value() : null);
  readonly cargando = computed(() => this._linea.isLoading());
  readonly error = computed(() => {
    const e = this._linea.error() as Error | undefined;
    return e ? (e.message || 'No se pudo consultar la línea de la versión.') : null;
  });
  /** 400: la versión no existe o no tiene esa línea. No tiene sentido reintentar. */
  readonly noExiste = computed(() => {
    const e = this._linea.error() as (Error & { status?: number }) | undefined;
    return e?.status === 400 || e?.status === 404;
  });

  /** Las vecinas, en su propia petición: la línea se pinta sin esperarlas. */
  private readonly _vecinas = rxResource({
    params: () => {
      const clave = this.clave();
      return clave ? { ...clave, posicion: this.posicion() } : undefined;
    },
    stream: ({ params }) =>
      this.vecinas(params.codigo, params.numero, params.numeroLinea, params.posicion),
  });

  readonly vecinasCargando = computed(() => this._vecinas.isLoading());

  /**
   * Las vecinas que se pintan.
   *
   * Al pasar a la anterior o a la siguiente el componente se reutiliza y el recurso se vacía
   * mientras pide las de la línea nueva. Si los enlaces se fueran con él, se destruiría justo el
   * que tiene el foco —el que se acaba de pulsar— y quien recorre la versión con el teclado
   * volvería a empezar desde arriba de la página en cada línea. Se quedan los de antes hasta que
   * llegan las nuevas, apagados (`vecinasCargando`): ya no son las vecinas de esta línea.
   */
  readonly vecinasDeLinea = linkedSignal<Vecinas | undefined, Vecinas>({
    source: () => this._vecinas.hasValue() ? this._vecinas.value() : undefined,
    computation: (nuevas, previas) =>
      nuevas ?? (this._vecinas.isLoading() && previas ? previas.value : SIN_VECINAS),
  });

  /**
   * La página de la grilla donde está la línea, para volver a ella.
   *
   * Con la posición confirmada en cuanto se tiene. La de la URL solo vale mientras se confirma:
   * si al final no era la de esta línea y no se encontró, la vuelta es a la primera página, que
   * existe siempre, y no a la que diría una posición inventada (`?posicion=500` → página 21, vacía).
   */
  readonly paginaDeVuelta = computed(() => {
    const posicion = this._vecinas.hasValue() ? this._vecinas.value().posicion
      : this._vecinas.isLoading() ? this.posicion() : null;
    if (posicion === null) return null;
    const pagina = Math.floor(posicion / LINEAS_POR_PAGINA_DE_VERSION) + 1;
    return pagina > 1 ? pagina : null;
  });

  reintentar(): void {
    this._linea.reload();
  }

  /**
   * Dónde está la línea y cuáles son sus vecinas.
   *
   * Con posición, se pide también la fila que hay en ella: la posición vale si es esta misma
   * línea. Comprobarlo por el orden de las vecinas no basta: una posición fuera de la versión da
   * dos vecinas vacías, que es exactamente lo que da una versión de una sola línea, y la línea
   * —que sí tiene vecinas— salía sin «anterior» ni «siguiente».
   */
  private vecinas(codigo: string, numero: number, numeroLinea: number,
                  posicion: number | null): Observable<Vecinas> {
    const la = (p: number) => p < 0
      ? of(null)
      : this.cuentas.listarLineasDeVersion(codigo, numero, p, 1)
          .pipe(map(r => r.elementos[0]?.numeroLinea ?? null));
    const alrededorDe = (p: number): Observable<Vecinas> =>
      forkJoin({ anterior: la(p - 1), siguiente: la(p + 1) }).pipe(map(v => ({ ...v, posicion: p })));
    // La posición que da la búsqueda ya es la de esta línea: no hace falta volver a confirmarla.
    const buscandola = () => this.situar(codigo, numero, numeroLinea, 0).pipe(
      switchMap(encontrada => encontrada === null ? of(SIN_VECINAS) : alrededorDe(encontrada)));

    if (posicion === null) return buscandola();
    return forkJoin({ propia: la(posicion), vecinas: alrededorDe(posicion) }).pipe(
      switchMap(({ propia, vecinas }) => propia === numeroLinea ? of(vecinas) : buscandola()));
  }

  /** Busca en qué posición está la línea, página a página. `null` si no aparece. */
  private situar(codigo: string, numero: number, numeroLinea: number,
                 pagina: number): Observable<number | null> {
    if (pagina >= PAGINAS_PARA_SITUARLA) return of(null);
    return this.cuentas.listarLineasDeVersion(codigo, numero, pagina, LINEAS_POR_PAGINA_DE_VERSION).pipe(
      switchMap(respuesta => {
        const indice = respuesta.elementos.findIndex(l => l.numeroLinea === numeroLinea);
        if (indice >= 0) return of(respuesta.desplazamiento + indice);
        const ultima = respuesta.elementos[respuesta.elementos.length - 1];
        // En orden: si la última de la página ya pasa de ella, no está en la versión.
        if (!respuesta.hayMas || !ultima || ultima.numeroLinea > numeroLinea) return of(null);
        return this.situar(codigo, numero, numeroLinea, pagina + 1);
      }));
  }

  readonly textoDeEstado = textoDeEstadoDeLinea;
  readonly textoDeOrigen = textoDeOrigen;

  /** La severidad en palabras, con las mismas que el detalle de la cuenta actual. */
  textoDeSeveridad(severidad: string): string {
    return SEVERIDAD_NOVEDAD[severidad as SeveridadNovedad] ?? severidad;
  }

  claseDeEstado(estado: string | null): string {
    switch (estado) {
      case 'APROBADA': return 'sura-distintivo--exito';
      case 'NEGADA':   return 'sura-distintivo--error';
      default:         return 'sura-distintivo--neutro';
    }
  }

  /** La severidad con su color, como en el resto de la aplicación: con palabra, no solo color. */
  claseDeSeveridad(severidad: string): string {
    switch (severidad) {
      case 'BLOQUEANTE': return 'sura-distintivo--alerta';
      case 'NEGACION':   return 'sura-distintivo--error';
      case 'INFORMATIVA': return 'sura-distintivo--info';
      default:           return 'sura-distintivo--neutro';
    }
  }
}
