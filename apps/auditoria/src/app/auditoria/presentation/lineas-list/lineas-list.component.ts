import {
  Component, OnInit, Input, inject, computed,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule }           from '@angular/material/table';
import { MatButtonModule }          from '@angular/material/button';
import { MatIconModule }            from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule }           from '@angular/material/chips';
import { MatTooltipModule }         from '@angular/material/tooltip';
import { MatFormFieldModule }       from '@angular/material/form-field';
import { MatInputModule }           from '@angular/material/input';
import { MatSelectModule }          from '@angular/material/select';
import { MatButtonToggleModule }    from '@angular/material/button-toggle';
import { LineaFacade }              from '../../application/facades/linea.facade';
import {
  ResumenLineaModel, CatalogoPrestacion, FiltroLineasModel
} from '../../domain/models/linea-cuenta.model';

/**
 * Lista de líneas con paginación KEYSET (cursor-based).
 * ✅ SIEMPRE pide tamano=25 al servidor.
 * ✅ El botón "Siguiente" envía el cursor devuelto por el servidor.
 * PROHIBIDO: cargar todas las líneas de una vez.
 */
@Component({
  selector: 'sura-lineas-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, RouterModule, MatTableModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
    MatChipsModule, MatTooltipModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonToggleModule
  ],
  templateUrl: './lineas-list.component.html',
  styleUrls:   ['./lineas-list.component.scss']
})
export class LineasListComponent implements OnInit {

  /** El parámetro de la ruta padre se llama `codigo`; el alias hace el enlace. */
  @Input({ required: true, alias: 'codigo' }) codigoCuenta!: string;

  readonly facade = inject(LineaFacade);

  /**
   * Las columnas nuevas no son adorno: se filtra por ellas.
   *
   * Filtrar por una fecha, una autorización o un valor glosado que la grilla no
   * muestra deja al auditor sin poder comprobar por qué una fila salió, que es
   * justo lo que un filtro tiene que permitir.
   */
  readonly displayedColumns = [
    'numeroLinea', 'atencion', 'codigoProcedimiento', 'codigoAfiliado',
    'valorAutorizado', 'valorCubierto', 'valorGlosado',
    'pendientes', 'estado', 'acciones'
  ];

  // Signals del facade (rxResource — async declarativo)
  readonly lineas      = this.facade.lineas;
  readonly loading     = this.facade.loading;
  readonly listError   = this.facade.listError;
  readonly isEmpty     = this.facade.isEmpty;
  readonly hayMas      = this.facade.hayMas;
  readonly totalLineas = this.facade.totalLineas;

  // ── Paginación ───────────────────────────────────────────────────────────
  readonly paginaActual   = this.facade.paginaActual;
  readonly totalPaginas   = this.facade.totalPaginas;
  readonly recorriendo    = this.facade.recorriendo;
  readonly hayAnterior    = this.facade.hayPaginaAnterior;
  readonly haySiguiente   = this.facade.hayPaginaSiguiente;
  readonly ocupado        = computed(() => this.loading() || this.recorriendo());
  /** Solo hay «última» si se conoce el total y se puede llegar sin encadenar de más. */
  readonly puedeUltima    = this.facade.puedeIrAUltima;

  /** Un número de página al que no se puede saltar sin encadenar de más. */
  fueraDeAlcance(numero: number): boolean {
    return !this.facade.alcanzable(numero);
  }

  /**
   * Números a pintar en el paginador: siempre la primera y la última, más una
   * ventana alrededor de la actual. Los cortes se marcan con puntos suspensivos.
   */
  readonly paginasVisibles = computed<(number | '…')[]>(() => {
    const total  = this.totalPaginas();
    const actual = this.paginaActual();
    if (total === null || total <= 1) return [];
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    const ventana = new Set<number>([1, total, actual]);
    for (const alrededor of [actual - 1, actual + 1]) {
      if (alrededor > 1 && alrededor < total) ventana.add(alrededor);
    }

    const ordenadas = [...ventana].sort((a, b) => a - b);
    const resultado: (number | '…')[] = [];
    let anterior = 0;
    for (const numero of ordenadas) {
      if (anterior && numero - anterior > 1) resultado.push('…');
      resultado.push(numero);
      anterior = numero;
    }
    return resultado;
  });

  /** Rango de registros que se está mostrando, para el texto de apoyo. */
  readonly rangoVisible = computed(() => {
    const total = this.totalLineas();
    if (total === null) return null;
    const desde = (this.paginaActual() - 1) * this.facade.TAMANO_PAGINA + 1;
    const hasta = Math.min(desde + this.lineas().length - 1, total);
    return { desde, hasta, total };
  });

  esNumero(valor: number | '…'): valor is number {
    return valor !== '…';
  }

  ngOnInit(): void {
    // ✅ Primera página (sin cursor) — tamano=25
    this.facade.cargarLineas(this.codigoCuenta);
  }

  irAPagina(numero: number | '…'): void {
    if (this.esNumero(numero)) void this.facade.irAPagina(numero);
  }

  primera():  void { void this.facade.primeraPagina(); }
  anterior(): void { void this.facade.paginaAnterior(); }
  siguiente(): void { void this.facade.paginaSiguiente(); }
  ultima():   void { void this.facade.ultimaPagina(); }

  async verDetalle(linea: ResumenLineaModel): Promise<void> {
    await this.facade.consultarDetalle(this.codigoCuenta, linea.referencia);
  }

  /**
   * Motivos pendientes de la línea, uno por renglón, para el tooltip del
   * contador. Sin esto el auditor ve un número y tiene que abrir la línea
   * para saber qué la bloquea.
   */
  motivosDe(linea: ResumenLineaModel): string {
    return (linea.pendientes ?? [])
      .map(p => p.descripcion ? `${p.codigo} — ${p.descripcion}` : p.codigo)
      .join('\n');
  }

  // ── Filtros ───────────────────────────────────────────────────────────────

  readonly filtro           = this.facade.filtro;
  readonly encuadre         = this.facade.encuadre;
  readonly cargandoEncuadre = this.facade.cargandoEncuadre;
  readonly errorEncuadre    = this.facade.errorEncuadre;
  readonly hayAlgunFiltro   = this.facade.hayAlgunFiltro;
  readonly exigeRecorrido   = this.facade.exigeRecorrido;

  /**
   * El selector de afiliado solo se ofrece si la cuenta tiene más de uno.
   *
   * Con uno solo —lo normal: de 40 cuentas revisadas en producción ninguna tenía
   * más— un desplegable de una opción es ruido que además insinúa que hay algo
   * que elegir. Se enseña quién es y ya.
   */
  readonly esMultiafiliado = computed(() => (this.encuadre()?.afiliados.length ?? 0) > 1);

  readonly afiliadoUnico = computed(() => {
    const a = this.encuadre()?.afiliados ?? [];
    return a.length === 1 ? a[0] : null;
  });

  /** No hay ninguna línea glosada: filtrar por glosa solo daría vacío. */
  readonly sinGlosas = computed(() => (this.encuadre()?.lineasConGlosa ?? 0) === 0);

  readonly soloGlosadas = computed(() => (this.filtro().glosaDesde ?? 0) > 0);

  filtrarPorAfiliado(cedula: string | null): void {
    this.facade.aplicarFiltro({ cedula });
  }

  filtrarPorCatalogo(catalogo: CatalogoPrestacion | null): void {
    this.facade.aplicarFiltro({ catalogo });
  }

  /**
   * Abre el calendario del navegador sobre un campo de fecha.
   *
   * El `input type="date"` ya trae su propio selector, pero Chrome no dibuja
   * ningún icono que invite a pulsarlo: el campo se lee como un `dd/mm/aaaa`
   * que hay que teclear. `showPicker()` lo abre explícitamente desde un botón
   * que sí se ve.
   *
   * Está detrás de una comprobación porque no todos los navegadores lo tienen
   * —Firefox abre su calendario al pulsar el campo y no expone este método— y
   * porque lanza si se llama sin un gesto del usuario detrás. En cualquiera de
   * los dos casos se cae a enfocar el campo, que es lo que abre el selector en
   * los navegadores que no lo exponen.
   */
  abrirCalendario(campo: HTMLInputElement): void {
    try {
      if (typeof campo.showPicker === 'function') {
        campo.showPicker();
        return;
      }
    } catch {
      // Sin selector disponible: queda el foco, que ya sirve para elegir.
    }
    campo.focus();
  }

  filtrarPorFecha(campo: 'desde' | 'hasta', valor: string): void {
    this.facade.aplicarFiltro({ [campo]: valor || null } as Partial<FiltroLineasModel>);
  }

  filtrarPorTexto(campo: 'autorizacion' | 'prestacion', valor: string): void {
    this.facade.aplicarFiltro({ [campo]: valor.trim() || null } as Partial<FiltroLineasModel>);
  }

  /**
   * «Solo glosadas» en vez de pedirle al auditor que invente un rango: es la
   * pregunta que de verdad se hace. El rango fino sigue disponible aparte.
   */
  alternarSoloGlosadas(activar: boolean): void {
    this.facade.aplicarFiltro({ glosaDesde: activar ? 1 : null });
  }

  filtrarPorGlosa(campo: 'glosaDesde' | 'glosaHasta', valor: string): void {
    const numero = valor === '' ? null : Number(valor);
    this.facade.aplicarFiltro({
      [campo]: numero === null || Number.isNaN(numero) ? null : numero,
    } as Partial<FiltroLineasModel>);
  }

  quitarFiltro(campo: keyof FiltroLineasModel): void {
    this.facade.quitarFiltro(campo);
  }

  limpiarTodosLosFiltros(): void {
    this.facade.limpiarTodosLosFiltros();
  }

  /** Los criterios activos, ya redactados, para los chips. */
  readonly criteriosActivos = computed(() => {
    const f = this.filtro();
    const chips: { campo: keyof FiltroLineasModel; texto: string }[] = [];
    if (f.cedula)       chips.push({ campo: 'cedula',       texto: `Afiliado ${f.cedula}` });
    if (f.desde)        chips.push({ campo: 'desde',        texto: `Desde ${f.desde}` });
    if (f.hasta)        chips.push({ campo: 'hasta',        texto: `Hasta ${f.hasta}` });
    if (f.autorizacion) chips.push({ campo: 'autorizacion', texto: `Autorización ${f.autorizacion}…` });
    if (f.prestacion)   chips.push({ campo: 'prestacion',   texto: `Prestación ${f.prestacion}…` });
    if (f.catalogo) {
      const c = this.encuadre()?.catalogos.find(x => x.codigo === f.catalogo);
      chips.push({ campo: 'catalogo', texto: c?.etiqueta ?? f.catalogo });
    }
    if (f.glosaDesde != null) chips.push({ campo: 'glosaDesde', texto: `Glosa desde ${f.glosaDesde}` });
    if (f.glosaHasta != null) chips.push({ campo: 'glosaHasta', texto: `Glosa hasta ${f.glosaHasta}` });
    return chips;
  });
}
