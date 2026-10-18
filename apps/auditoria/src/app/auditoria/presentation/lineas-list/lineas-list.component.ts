import {
  Component, OnInit, Input, inject, computed, signal, effect, untracked,
  ChangeDetectionStrategy
} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
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
import { MatCheckboxModule }        from '@angular/material/checkbox';
import { MatMenuModule }            from '@angular/material/menu';
import { MatProgressBarModule }     from '@angular/material/progress-bar';
import { CampoBloqueadoComponent }  from '../compartido/campo-bloqueado/campo-bloqueado.component';
import { MOTIVOS_BLOQUEO }          from '../compartido/motivos-bloqueo';
import { FormularioEnFila, crearFormularioEnFila } from './edicion-en-fila';
import { CAMPOS_EN_FILA, CampoEnFila, ModoRecalculo }
  from '../../domain/models/edicion-en-fila.model';
import { LineaFacade }              from '../../application/facades/linea.facade';
import { CuentaFacade }             from '../../application/facades/cuenta.facade';
import { PendienteFacade }          from '../../application/facades/pendiente.facade';
import { ResolverPendientesEnMasaUseCase }
  from '../../application/use-cases/resolver-pendientes-en-masa.use-case';
import { environment }              from '@sura/environments';
import { lastValueFrom, merge, Subscription } from 'rxjs';
import { AplicarCambiosEnLoteUseCase }
  from '../../application/use-cases/aplicar-cambios-en-lote.use-case';
import { CatalogoNovedadesRepository }
  from '../../domain/ports/catalogo-novedades.repository';
import { PendienteRepository }      from '../../domain/ports/pendiente.repository';
import { MotivoPendienteCatalogoModel }
  from '../../domain/models/motivo-pendiente.model';
import { CATALOGO_GLOSAS }          from '../compartido/catalogo-glosas';
import { MensajeCatalogoModel }     from '../../domain/models/catalogo-novedad.model';
import { CambiosEnLoteRequest }     from '../../domain/models/linea-cuenta.model';
import {
  ResumenLineaModel, CatalogoPrestacion, FiltroLineasModel, FiltroBloqueo, NovedadModel
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
    MatInputModule, MatSelectModule, MatButtonToggleModule,
    MatCheckboxModule, MatMenuModule, MatProgressBarModule,
    ReactiveFormsModule, CampoBloqueadoComponent
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
  /**
   * Las columnas, decididas en cada pintada y no fijas.
   *
   * La de afiliado se cae cuando la cuenta es mono usuario —todas las líneas con el mismo
   * afiliado—, que es el caso normal: de 40 cuentas de producción revisadas, ninguna tenía
   * más de uno. Repetir 212 veces el mismo documento no informa de nada y ocupa el ancho
   * que necesitan las columnas que sí cambian de fila en fila.
   */
  readonly displayedColumns = computed(() => {
    const base = ['seleccion', 'numeroLinea', 'atencion', 'codigoProcedimiento', 'codigoAfiliado',
                  'valorCargado', 'valorAutorizado', 'iva', 'valorCubierto', 'valorGlosado',
                  'pendientes', 'estado', 'acciones'];
    return this.afiliadoUnico() ? base.filter(c => c !== 'codigoAfiliado') : base;
  });

  /** Ordena por una columna; pulsar la activa invierte el sentido. */
  ordenarPor(campo: string): void {
    this.facade.ordenarPor(campo);
  }

  /** La flecha de la cabecera: solo la columna activa la lleva. */
  flechaDe(campo: string): string {
    const o = this.facade.orden();
    if (o.campo !== campo) return '';
    return o.sentido === 'asc' ? '↑' : '↓';
  }

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
  readonly hayAnterior    = this.facade.hayPaginaAnterior;
  readonly haySiguiente   = this.facade.hayPaginaSiguiente;
  readonly ocupado        = computed(() => this.loading());
  /**
   * Solo hay «última» si se conoce el total.
   *
   * Ya no depende de la distancia: cualquier página cuesta una petición. Antes
   * sí, y por eso en la cuenta mayor —163 páginas— el botón estaba apagado.
   */
  readonly puedeUltima    = this.facade.puedeIrAUltima;

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

  /**
   * Qué objetó el motor en esta línea, para el tooltip del chip de estado.
   *
   * Antes el chip decía «⚠ Bloqueada» con un tooltip fijo que no nombraba ni el campo ni el
   * motivo, y el detalle solo se veía abriendo la línea. El dato ya viajaba en la misma
   * petición: lo que faltaba era enseñarlo.
   *
   * Las bloqueantes van primero: es el orden en que se leen cuando hay varias.
   */
  novedadesDe(linea: ResumenLineaModel): string {
    const novedades = [...(linea.novedades ?? [])].sort(
      (a, b) => Number(b.severidad === 'BLOQUEANTE') - Number(a.severidad === 'BLOQUEANTE'));
    if (novedades.length === 0) return 'Sin novedades';
    return novedades
      .map(n => {
        const marca = n.severidad === 'BLOQUEANTE' ? '⚠ ' : '';
        return `${marca}${n.codigo ?? 'sin código'} — ${n.descripcion}`;
      })
      .join('\n');
  }

  // ── Selección ─────────────────────────────────────────────────────────────

  readonly cuantasSeleccionadas       = this.facade.cuantasSeleccionadas;
  readonly haySeleccion               = this.facade.haySeleccion;
  readonly seleccionTodoElFiltro      = this.facade.seleccionTodoElFiltro;
  readonly puedeSeleccionarTodoElFiltro = this.facade.puedeSeleccionarTodoElFiltro;

  estaSeleccionada(referencia: number): boolean {
    return this.facade.estaSeleccionada(referencia);
  }

  alternarSeleccion(referencia: number): void {
    this.facade.alternarSeleccion(referencia);
  }

  /**
   * Si la casilla de la cabecera está marcada.
   *
   * Mira **la página**, no la cuenta: marcarla significa «las 25 que veo», y decir otra
   * cosa con la misma casilla sería prometer un alcance que no tiene.
   */
  paginaEnteraMarcada(): boolean {
    const filas = this.lineas();
    return filas.length > 0 && filas.every(l => this.estaSeleccionada(l.referencia));
  }

  /** Marcada a medias: alguna sí y alguna no. Es lo que evita la casilla que miente. */
  paginaMarcadaAMedias(): boolean {
    const filas = this.lineas();
    const marcadas = filas.filter(l => this.estaSeleccionada(l.referencia)).length;
    return marcadas > 0 && marcadas < filas.length;
  }

  alternarPagina(marcar: boolean): void {
    this.facade.alternarSeleccionDeLaPagina(marcar);
  }

  seleccionarTodoElFiltro(): void {
    this.facade.seleccionarTodoElFiltro();
  }

  /**
   * El total del filtro, o `null` si no se conoce.
   *
   * No se ofrece «seleccionar todas las que cumplen» sin total: en el régimen de recorrido
   * —catálogo o techo de glosa— no se sabe cuántas son, y un botón que promete un conjunto
   * cuyo tamaño no se puede decir, delante de una escritura irreversible, es peor que
   * ningún botón.
   */
  totalDelFiltro(): number | null {
    return this.puedeSeleccionarTodoElFiltro() ? this.totalLineas() : null;
  }

  // ── Acciones sobre la selección ───────────────────────────────────────────

  private readonly cuentas  = inject(CuentaFacade);
  private readonly motivosUC = inject(ResolverPendientesEnMasaUseCase);
  private readonly auditor  = environment.auditor;

  readonly ejecutando     = signal(false);
  readonly errorSeleccion = signal<string | null>(null);
  readonly avisoSeleccion = signal<string | null>(null);

  /**
   * Desbloquea solo las líneas marcadas.
   *
   * El servicio ya lo admitía de punta a punta —el cuerpo lleva una lista de líneas desde
   * siempre— y nadie lo usaba: la pantalla solo sabía desbloquear la cuenta entera.
   *
   * El freno que justifica que este botón no exista sin selección: con la lista **vacía**,
   * el sistema de registro desbloquea TODAS las líneas de la cuenta.
   */
  async desbloquearSeleccion(): Promise<void> {
    const lineas = this.facade.referenciasSeleccionadas();
    if (!this.guardar(lineas, 'desbloquear')) return;

    this.ejecutando.set(true);
    try {
      const hecho = await this.cuentas.ejecutarAccion(
        this.codigoCuenta, 'DESBLOQUEAR_LINEAS', { lineas }, this.auditor);
      if (hecho) {
        this.avisoSeleccion.set(`Se desbloquearon ${lineas.length} línea(s).`);
        this.facade.limpiarSeleccion();
        this.facade.recargar();
      } else {
        this.errorSeleccion.set(this.cuentas.errorComando() ?? 'No se pudo desbloquear.');
      }
    } finally {
      this.ejecutando.set(false);
    }
  }

  /**
   * Resuelve el motivo por el que se está filtrando, solo en las líneas marcadas.
   *
   * Es el circuito que el documento pide: identificar en qué líneas se presenta un motivo
   * y resolverlo **donde el auditor decidió**, no en toda la cuenta.
   */
  /** El seguimiento de las resoluciones vive en la fachada de pendientes, que es raíz. */
  private readonly pendientes = inject(PendienteFacade);

  /** Si esta cuenta tiene una resolución en curso: no se deja lanzar otra encima. */
  readonly resolucionEnCursoAqui = computed(() => this.pendientes.hayResolucionEnCurso(this.codigoCuenta));

  /**
   * La última terminada que ya se atendió, para no recargar dos veces por la misma. Empieza
   * sin saberse: la primera vez se toma la que hubiera como ya atendida, porque la grilla
   * acaba de cargarse y ya la incluye; anunciarla otra vez sería un aviso viejo.
   */
  private ultimaTerminadaAtendida: number | null = null;

  /**
   * Cuando termina una resolución de esta cuenta —lanzada desde aquí o desde la pestaña de
   * pendientes—, la grilla y sus motivos se recargan y se dice cómo acabó.
   */
  private readonly _alTerminarUnaResolucion = effect(() => {
    const terminada = this.pendientes.resolucionTerminadaDe(this.codigoCuenta);
    if (this.ultimaTerminadaAtendida === null) {
      this.ultimaTerminadaAtendida = terminada?.instante ?? 0;
      return;
    }
    if (!terminada || terminada.instante <= this.ultimaTerminadaAtendida) return;
    this.ultimaTerminadaAtendida = terminada.instante;
    untracked(() => {
      this.facade.recargar();
      this.facade.recargarMotivos();
      this.avisoSeleccion.set(terminada.resultado.desenlace === 'COMPLETO'
        ? 'La resolución terminó: los pendientes quedaron resueltos.'
        : `La resolución terminó ${terminada.resultado.desenlace.toLowerCase()}: `
          + 'revise la pestaña de pendientes.');
    });
  });

  async resolverMotivoEnSeleccion(codigoMotivo: string): Promise<void> {
    const lineas = this.facade.referenciasSeleccionadas();
    if (!this.guardar(lineas, 'resolver')) return;

    this.ejecutando.set(true);
    try {
      const resultado = await lastValueFrom(this.motivosUC.execute(
        this.codigoCuenta,
        { motivos: [codigoMotivo], justificacion:
            `Resuelto desde la grilla de líneas sobre ${lineas.length} línea(s) marcadas`,
          nivel: 'LINEAS', lineas },
        this.auditor));
      if (resultado.desenlace === 'EN_CURSO' && resultado.referencias.length > 0) {
        // No se espera aquí: se sigue sola y la grilla se recarga al terminar (OPE-06).
        this.pendientes.seguirResolucion(this.codigoCuenta, resultado.referencias, resultado.fallos);
        this.avisoSeleccion.set(`Resolviendo ${codigoMotivo} en ${lineas.length} línea(s). `
          + 'Puede seguir trabajando: la grilla se actualizará sola al terminar.');
      } else {
        this.avisoSeleccion.set(resultado.desenlace === 'COMPLETO'
          ? `Se resolvió ${codigoMotivo} en ${lineas.length} línea(s).`
          : `La resolución acabó ${resultado.desenlace.toLowerCase()}: revise la pestaña de pendientes.`);
        this.facade.recargarMotivos();
      }
      this.facade.limpiarSeleccion();
      this.facade.recargar();
    } catch (err: unknown) {
      this.errorSeleccion.set((err as Error).message ?? 'No se pudo resolver el motivo.');
    } finally {
      this.ejecutando.set(false);
    }
  }

  // ── Glosa y mensaje sobre la selección ────────────────────────────────────

  private readonly loteUC = inject(AplicarCambiosEnLoteUseCase);
  private readonly catalogoDeNovedades = inject(CatalogoNovedadesRepository);
  private readonly pendientesRepo = inject(PendienteRepository);

  readonly catalogoGlosas    = CATALOGO_GLOSAS;
  readonly catalogoNovedades = signal<MensajeCatalogoModel[]>([]);

  /** Qué formulario está abierto, si alguno. */
  readonly formularioAbierto =
    signal<'glosa' | 'mensaje' | 'quitarMensaje' | 'pendiente' | null>(null);

  readonly causalGlosa = signal('');
  readonly valorGlosa  = signal<number | null>(null);
  readonly textoGlosa  = signal('');
  readonly codigoMensaje = signal('');
  readonly codigoMotivoPendiente = signal('');
  readonly catalogoPendientes = signal<MotivoPendienteCatalogoModel[]>([]);

  /**
   * Los mensajes que de verdad se pueden quitar de la selección.
   *
   * Sale de las filas, no del catálogo: quitar exige el identificador de la novedad, y ese
   * es distinto en cada línea aunque el código sea el mismo. Las filas ya lo traen desde que
   * el resumen publica sus novedades, así que no hace falta ninguna consulta más.
   *
   * **Solo los puestos a mano.** Borrar una novedad del motor no se rehace y el sistema de
   * registro no lo impide: ofrecerlo sería poner una trampa a un clic de distancia. Se mira
   * `laPusoUnaPersona` —quién la puso—, que es lo mismo que mira el servicio para rechazar la
   * baja, y no `esDelSistema`, que es una propiedad del mensaje en el catálogo: un mensaje
   * ofrecible puede haberlo levantado el motor.
   */
  readonly mensajesQuitables = computed(() => {
    const marcadas = new Set(this.facade.referenciasSeleccionadas());
    const porCodigo = new Map<string, number>();
    for (const fila of this.lineas()) {
      if (!marcadas.has(fila.referencia)) continue;
      for (const n of fila.novedades ?? []) {
        if (!n.codigo || !n.laPusoUnaPersona) continue;
        porCodigo.set(n.codigo, (porCodigo.get(n.codigo) ?? 0) + 1);
      }
    }
    return [...porCodigo.entries()]
      .map(([codigo, enCuantas]) => ({ codigo, enCuantas }))
      .sort((a, b) => b.enCuantas - a.enCuantas);
  });

  readonly puedeAplicarGlosa = computed(() =>
    this.causalGlosa().trim().length > 0 && (this.valorGlosa() ?? 0) > 0);

  abrirFormulario(cual: 'glosa' | 'mensaje' | 'quitarMensaje' | 'pendiente'): void {
    this.errorSeleccion.set(null);
    this.avisoSeleccion.set(null);
    this.formularioAbierto.set(this.formularioAbierto() === cual ? null : cual);
    if (cual === 'mensaje' && this.catalogoNovedades().length === 0) {
      // Mismo repositorio que la sección de novedades de la línea: el catálogo es uno.
      this.catalogoDeNovedades.listar().subscribe(c => this.catalogoNovedades.set(c));
    }
    if (cual === 'pendiente' && this.catalogoPendientes().length === 0) {
      // Otro catálogo distinto, y por eso otra llamada: los 237 motivos de PENDIENTE, que
      // no son los de desfinalización ni los mensajes.
      this.pendientesRepo.catalogoDeMotivos().subscribe(c => this.catalogoPendientes.set(c));
    }
  }

  /**
   * Pone un motivo de pendiente sobre las líneas marcadas.
   *
   * Es lo contrario de resolver: frenar la cuenta a propósito. Por eso exige firma igual que
   * la resolución, aunque sea más barato de deshacer.
   */
  async agregarPendienteALaSeleccion(): Promise<void> {
    const lineas = this.facade.referenciasSeleccionadas();
    if (!this.guardar(lineas, 'agregar el pendiente')) return;

    this.ejecutando.set(true);
    try {
      await lastValueFrom(this.pendientesRepo.agregarMotivo(
        this.codigoCuenta,
        { motivo: this.codigoMotivoPendiente(), lineas },
        this.auditor));
      this.avisoSeleccion.set(
        `Se puso ${this.codigoMotivoPendiente()} en ${lineas.length} línea(s).`);
      this.formularioAbierto.set(null);
      this.facade.limpiarSeleccion();
      this.facade.recargar();
    } catch (err: unknown) {
      this.errorSeleccion.set((err as Error).message ?? 'No se pudo agregar el pendiente.');
    } finally {
      this.ejecutando.set(false);
    }
  }

  /**
   * Quita un mensaje de las líneas marcadas que lo tengan.
   *
   * Cada línea aporta **su** identificador: el código es el mismo pero la fila de novedad no,
   * así que no hay un «quitar por código» que mandar. Las líneas que no lo tienen no entran
   * en la operación; no son un fallo, simplemente no tenían nada que quitar.
   */
  async quitarMensajeDeLaSeleccion(): Promise<void> {
    const marcadas = new Set(this.facade.referenciasSeleccionadas());
    if (!this.guardar([...marcadas], 'quitar el mensaje')) return;

    const codigo = this.codigoMensaje();
    const porLinea = this.lineas()
      .filter(f => marcadas.has(f.referencia))
      .map(f => ({
        referencia: f.referencia,
        novedad: (f.novedades ?? []).find(n => n.codigo === codigo && n.laPusoUnaPersona),
      }))
      .filter((x): x is { referencia: number; novedad: NovedadModel } => !!x.novedad);

    if (porLinea.length === 0) {
      this.errorSeleccion.set(
        `Ninguna de las líneas marcadas tiene el mensaje ${codigo} puesto a mano.`);
      return;
    }

    this.ejecutando.set(true);
    try {
      // Una llamada por línea: el cuerpo del lote lleva los mismos cambios para todas, y
      // aquí el identificador cambia en cada una. Es la excepción que confirma por qué el
      // lote solo admite lo que es idéntico.
      let aplicadas = 0;
      for (const { referencia, novedad } of porLinea) {
        try {
          await lastValueFrom(this.loteUC.execute(
            this.codigoCuenta,
            { lineas: [referencia], modoRecalculo: 'AISLADO',
              novedades: [{ operacion: 'ELIMINAR', identificador: novedad.id }] },
            this.auditor));
        } catch (err: unknown) {
          // Se aplicó aunque no se pudiera releer (OPE-11): repetirla fallaría, y la recarga
          // del final enseña cómo quedó.
          if ((err as { codigo?: string | null } | null)?.codigo !== 'APLICADO_SIN_RELEER') throw err;
        }
        aplicadas++;
      }
      this.avisoSeleccion.set(`Se quitó ${codigo} de ${aplicadas} línea(s).`);
      this.formularioAbierto.set(null);
      this.facade.limpiarSeleccion();
      this.facade.recargar();
    } catch (err: unknown) {
      this.errorSeleccion.set((err as Error).message ?? 'No se pudo quitar el mensaje.');
    } finally {
      this.ejecutando.set(false);
    }
  }

  /**
   * Aplica la misma glosa a las líneas marcadas.
   *
   * El valor glosado de cada línea NO viaja: es la suma de su desglose y lo calcula el
   * servicio contra el desglose que esa línea tenga. Mandarlo aquí permitiría guardar
   * líneas cuyo total no cuadra con lo que lo compone.
   */
  async aplicarGlosaALaSeleccion(): Promise<void> {
    const causal = this.catalogoGlosas.find(c => c.codigo === this.causalGlosa().trim());
    await this.aplicarLote({
      glosas: [{
        operacion:   'AGREGAR',
        codigoGlosa: this.causalGlosa().trim(),
        generico:    causal?.generico,
        especifico:  causal?.especifico,
        valor:       this.valorGlosa() ?? 0,
        texto:       this.textoGlosa().trim() || undefined,
      }],
    }, codigo => `Se aplicó la glosa ${this.causalGlosa()} a ${codigo} línea(s).`);
  }

  /** Añade el mismo mensaje a las líneas marcadas. */
  async aplicarMensajeALaSeleccion(): Promise<void> {
    await this.aplicarLote({
      novedades: [{ operacion: 'AGREGAR', codigoNovedad: this.codigoMensaje().trim() }],
    }, codigo => `Se añadió el mensaje ${this.codigoMensaje()} a ${codigo} línea(s).`);
  }

  /**
   * El camino común de los dos formularios.
   *
   * El modo de recálculo es AISLADO a propósito: en cascada el motor reprocesa la cuenta
   * entera, y multiplicado por una selección grande es la parte lenta de la operación. El
   * auditor que quiera recálculo lo tiene al guardar la línea una a una, donde la decisión
   * es sobre una sola.
   */
  private async aplicarLote(
    cambios: Pick<CambiosEnLoteRequest, 'glosas' | 'novedades'>,
    exito: (aplicadas: number) => string
  ): Promise<void> {
    const lineas = this.facade.referenciasSeleccionadas();
    if (!this.guardar(lineas, 'aplicar el cambio')) return;

    this.ejecutando.set(true);
    try {
      const r = await lastValueFrom(this.loteUC.execute(
        this.codigoCuenta, { lineas, modoRecalculo: 'AISLADO', ...cambios }, this.auditor));

      // Las que ya lo tenían no se tocaron: repetir un lote no duplica nada (OPE-12).
      const yaEstaban = r.yaEstaban > 0 ? ` ${r.yaEstaban} ya lo tenían y no se tocaron.` : '';
      if (r.desenlace === 'COMPLETO') {
        this.avisoSeleccion.set(exito(r.aplicadas) + yaEstaban);
      } else {
        // Un parcial no es un error: nombrar las que no se pudieron es justo lo que el
        // auditor necesita para arreglarlas, y esconderlas sería peor que no aplicar nada.
        this.errorSeleccion.set(
          `${r.aplicadas} aplicada(s).${yaEstaban} No se pudo en ${r.fallos.length}: `
          + r.fallos.map(f => `línea ${f.numeroLinea ?? f.referencia} (${f.motivo})`).join('; '));
      }
      this.formularioAbierto.set(null);
      this.facade.limpiarSeleccion();
      this.facade.recargar();
    } catch (err: unknown) {
      this.errorSeleccion.set((err as Error).message ?? 'No se pudo aplicar el cambio.');
    } finally {
      this.ejecutando.set(false);
    }
  }

  /**
   * Las dos guardas que comparten las acciones de la barra.
   *
   * La de la selección vacía no es defensiva de más: tanto el desbloqueo como la resolución
   * entienden la lista vacía como «toda la cuenta», así que dejar pasar una selección vacía
   * haría lo contrario de lo pedido, sin error y sin vuelta atrás.
   */
  private guardar(lineas: number[], que: string): boolean {
    this.errorSeleccion.set(null);
    this.avisoSeleccion.set(null);
    if (!this.auditor?.trim()) {
      this.errorSeleccion.set('Falta configurar quién audita: la operación tiene que quedar firmada.');
      return false;
    }
    if (lineas.length === 0) {
      this.errorSeleccion.set(this.seleccionTodoElFiltro()
        ? `Para ${que} hay que marcar las líneas una a una: «todas las que cumplen el filtro» `
          + `no viaja como lista, y mandarla vacía alcanzaría la cuenta entera.`
        : `No hay líneas marcadas.`);
      return false;
    }
    return true;
  }

  limpiarSeleccion(): void {
    this.facade.limpiarSeleccion();
  }

  // ── Filtros ───────────────────────────────────────────────────────────────

  readonly filtro           = this.facade.filtro;
  readonly encuadre         = this.facade.encuadre;
  readonly cargandoEncuadre = this.facade.cargandoEncuadre;
  readonly errorEncuadre    = this.facade.errorEncuadre;
  readonly hayAlgunFiltro   = this.facade.hayAlgunFiltro;
  readonly exigeRecorrido   = this.facade.exigeRecorrido;
  readonly motivosDeLaCuenta = this.facade.motivosDeLaCuenta;

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
   * Filtra por número de línea exacto. Es el filtro que usa el auditor cuando alguien le
   * dicta una línea por teléfono, y el más barato de todos: una comparación en el servidor.
   */
  filtrarPorNumeroLinea(valor: string): void {
    const n = Number.parseInt(valor, 10);
    this.facade.aplicarFiltro({ numeroLinea: Number.isNaN(n) || n <= 0 ? null : n });
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
  alternarConNovedad(activar: boolean): void {
    // `null` y no `false`: así el criterio desaparece del filtro en vez de viajar
    // diciendo «no filtres», y el chip de criterio activo no aparece.
    this.facade.aplicarFiltro({ conNovedad: activar ? true : null });
  }

  filtrarPorMotivo(codigo: string): void {
    this.facade.aplicarFiltro({ motivoPendiente: codigo === '' ? null : codigo });
  }

  filtrarPorBloqueo(valor: FiltroBloqueo): void {
    this.facade.aplicarFiltro({ bloqueo: valor === 'TODOS' ? null : valor });
  }

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
    if (f.conNovedad) chips.push({ campo: 'conNovedad', texto: 'Con novedad' });
    if (f.motivoPendiente) {
      // El texto del motivo si se conoce; el código a secas si el agregado aún no llegó
      // —o si se entró con el criterio puesto desde la pestaña de pendientes—.
      const m = this.motivosDeLaCuenta().find(x => x.codigo === f.motivoPendiente);
      chips.push({ campo: 'motivoPendiente',
                   texto: `Motivo ${m?.descripcion || f.motivoPendiente}` });
    }
    if (f.bloqueo && f.bloqueo !== 'TODOS') {
      chips.push({ campo: 'bloqueo',
                   texto: f.bloqueo === 'BLOQUEANTES' ? 'Solo bloqueantes' : 'No bloqueantes' });
    }
    return chips;
  });

  // ── Edición en la fila (GRID-18) ─────────────────────────────────────────
  //
  // Una fila a la vez. Dos filas abiertas a la vez obligarían a decidir qué pasa si se
  // guarda una en cascada —el motor reprocesa la cuenta y la otra queda con una versión
  // vieja— y la respuesta honesta sería «conflicto» en la que no se tocó.

  readonly motivos = MOTIVOS_BLOQUEO;
  readonly camposEnFila = CAMPOS_EN_FILA;

  /** La referencia de la fila que se está editando, o `null`. */
  readonly filaEnEdicion = signal<number | null>(null);
  /** Su formulario. Vive en el componente y no en la fila: sobrevive al refresco de la página. */
  formularioFila: FormGroup<FormularioEnFila> | null = null;
  readonly guardandoFila = signal(false);
  /**
   * Late cada vez que el formulario de la fila cambia de valor o de validez.
   *
   * Hace falta porque la grilla es OnPush y el formulario no es una señal: el modo de
   * recálculo se elige en un `mat-button-toggle`, cuyo clic nace dentro de ese componente
   * hijo y no marca esta vista. Sin este latido el botón de guardar seguía apagado con el
   * modo ya elegido.
   */
  private readonly latidoFormulario = signal(0);
  private suscripcionFormulario: Subscription | null = null;
  /** Qué le pasó al último guardado de la fila en edición, dicho en la propia fila. */
  readonly avisoFila = signal<{ tipo: 'error' | 'conflicto'; texto: string } | null>(null);
  /** Tras un conflicto, la fila tal como la dejó el otro: se enseña junto a lo tecleado. */
  readonly filaActual = signal<ResumenLineaModel | null>(null);

  /**
   * Si la fila editada deja de estar a la vista —otra página, otro filtro, otro orden—, la
   * edición se cierra. Si no, al volver a esa página aparecería abierta con valores viejos.
   */
  private readonly _cierraEdicionHuerfana = effect(() => {
    const referencia = this.filaEnEdicion();
    const visibles = this.lineas();
    if (referencia === null || this.loading()) return;
    if (!visibles.some(f => f.referencia === referencia)) {
      untracked(() => this.cancelarEdicionEnFila());
    }
  });

  /** El número de la línea en edición, para nombrarla en el aviso. */
  readonly numeroDeLaFilaEnEdicion = computed(() =>
    this.lineas().find(l => l.referencia === this.filaEnEdicion())?.numeroLinea ?? '');

  enEdicion(row: ResumenLineaModel): boolean {
    return this.filaEnEdicion() === row.referencia;
  }

  editarEnFila(row: ResumenLineaModel): void {
    if (!row.editable) return;
    this.suscripcionFormulario?.unsubscribe();
    this.formularioFila = crearFormularioEnFila(row);
    this.suscripcionFormulario = merge(
      this.formularioFila.valueChanges, this.formularioFila.statusChanges
    ).subscribe(() => this.latidoFormulario.update(n => n + 1));
    this.latidoFormulario.update(n => n + 1);
    this.avisoFila.set(null);
    this.filaActual.set(null);
    this.filaEnEdicion.set(row.referencia);
  }

  cancelarEdicionEnFila(): void {
    this.suscripcionFormulario?.unsubscribe();
    this.suscripcionFormulario = null;
    this.filaEnEdicion.set(null);
    this.formularioFila = null;
    this.avisoFila.set(null);
    this.filaActual.set(null);
  }

  /** Lo que la línea tiene ahora en un campo, tras un conflicto. */
  valorActual(campo: CampoEnFila): number | null {
    return this.filaActual()?.[campo] ?? null;
  }

  /** El error de un campo, en palabras; `null` si está bien. */
  errorDeCampo(campo: CampoEnFila): string | null {
    const control = this.formularioFila?.controls[campo];
    if (!control || !control.errors) return null;
    if (control.errors['obligatorio']) return 'No se puede dejar vacío';
    if (control.errors['min'])         return 'No puede ser negativo';
    return 'Valor no válido';
  }

  /** Por qué no se puede guardar todavía; `null` si se puede. */
  readonly motivoParaNoGuardar = computed((): string | null => {
    this.latidoFormulario();
    this.filaEnEdicion();
    const f = this.formularioFila;
    if (!f) return 'No hay ninguna fila en edición';
    if (this.guardandoFila()) return 'Guardando…';
    if (f.controls.modoRecalculo.invalid) return 'Elija el modo de recálculo';
    if (f.invalid) return 'Corrija los valores marcados';
    return null;
  });

  async guardarFila(row: ResumenLineaModel): Promise<void> {
    const f = this.formularioFila;
    if (!f || this.motivoParaNoGuardar() !== null) {
      f?.markAllAsTouched();
      return;
    }
    // La fila de la tabla y no la del momento de abrir: tras un conflicto ya trae la
    // versión nueva, y es con esa con la que hay que volver a intentarlo.
    const actual = this.lineas().find(l => l.referencia === row.referencia) ?? row;
    const { modoRecalculo, ...valores } = f.getRawValue();

    this.guardandoFila.set(true);
    this.avisoFila.set(null);
    try {
      const r = await this.facade.guardarEnFila(
        this.codigoCuenta, actual, valores, modoRecalculo as ModoRecalculo, this.auditor);
      switch (r.tipo) {
        case 'SIN_CAMBIOS':
        case 'GUARDADO':
          this.cancelarEdicionEnFila();
          break;
        case 'CONFLICTO':
          this.filaActual.set(r.actual);
          this.avisoFila.set({ tipo: 'conflicto', texto:
            'Otro usuario guardó esta línea mientras la editaba. Debajo de cada campo está lo '
            + 'que tiene ahora; revise y vuelva a guardar.' });
          break;
        case 'ERROR':
          this.avisoFila.set({ tipo: 'error', texto: r.mensaje });
          break;
        case 'APLICADO_SIN_RELEER':
          // Se guardó: se cierra la edición y la página se refresca sola (OPE-11).
          this.cancelarEdicionEnFila();
          this.avisoSeleccion.set('La línea se guardó; la grilla se está actualizando con lo que '
            + 'quedó en el sistema de registro.');
          break;
      }
    } finally {
      this.guardandoFila.set(false);
    }
  }

  /** Teclado: Enter guarda y Escape cancela, sin tener que ir a los botones. */
  teclaEnFila(evento: KeyboardEvent, row: ResumenLineaModel): void {
    if (evento.key === 'Escape') {
      evento.preventDefault();
      this.cancelarEdicionEnFila();
    } else if (evento.key === 'Enter') {
      evento.preventDefault();
      void this.guardarFila(row);
    }
  }
}
