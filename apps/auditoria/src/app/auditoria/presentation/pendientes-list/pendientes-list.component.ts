import {
  Component, OnInit, Input, inject, signal, computed,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { environment } from '@sura/environments';
import { PendienteFacade } from '../../application/facades/pendiente.facade';
import { CuentaFacade } from '../../application/facades/cuenta.facade';
import {
  MotivoPendienteModel, ResumenMotivoModel, AlcanceResolucion,
  ETIQUETA_NIVEL, NivelPendiente, FiltroBloqueo, NivelResolucion
} from '../../domain/models/motivo-pendiente.model';
import { RouterModule, Router } from '@angular/router';
import { LineaFacade } from '../../application/facades/linea.facade';

@Component({
  selector: 'sura-pendientes-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, ReactiveFormsModule, MatTableModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
    MatChipsModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatCardModule, MatTooltipModule, MatButtonToggleModule,
    MatCheckboxModule, RouterModule
  ],
  templateUrl: './pendientes-list.component.html',
  styleUrls: ['./pendientes-list.component.scss']
})
export class PendientesListComponent implements OnInit {

  /** El parámetro de la ruta padre se llama `codigo`; el alias hace el enlace. */
  @Input({ required: true, alias: 'codigo' }) codigoCuenta!: string;

  private readonly router = inject(Router);
  /**
   * La fachada de líneas, para dejar el filtro puesto antes de cambiar de pestaña.
   *
   * Está en la raíz, así que es la misma instancia que lee la grilla. Se elige esto en
   * vez de pasar el criterio por la URL porque la grilla ya guarda su filtro en la
   * fachada: meterlo además en los parámetros de la ruta daría dos sitios donde vive el
   * mismo estado, y tarde o temprano discreparían.
   */
  private readonly lineas = inject(LineaFacade);

  /**
   * Del motivo a las líneas que afecta, ya filtradas.
   *
   * Es el circuito que el auditor no tenía: leía «Línea #37» en un chip de texto y
   * tenía que cambiar de pestaña y paginar a ojo hasta encontrarla. Y con un motivo
   * grande no podía ni enumerarlas: la pestaña de pendientes corta en 20 páginas
   * encadenadas. Ahora el filtro va al servicio, así que alcanza a toda la cuenta.
   */
  verLineasDelMotivo(codigoMotivo: string): void {
    this.lineas.limpiarTodosLosFiltros();
    this.lineas.aplicarFiltro({ motivoPendiente: codigoMotivo });
    // El micro-frontend se publica bajo /auditoria, no bajo /cuentas: con el prefijo
    // equivocado la navegación cae en el 404 del shell.
    void this.router.navigate(['/auditoria', this.codigoCuenta, 'lineas']);
  }

  private readonly fb = inject(FormBuilder);
  readonly facade = inject(PendienteFacade);
  /**
   * La cuenta ya está cargada por la pantalla que contiene estas pestañas: de
   * ella sale el estado, que es lo único que explica por qué un motivo bloquea.
   * El dato que se pinta por fila viene del servicio; esto solo sirve para
   * redactar el porqué.
   */
  private readonly cuentaFacade = inject(CuentaFacade);

  /**
   * En adjudicación manual bloquea <b>todo</b> pendiente sin resolver, incluidos
   * los de sola adjudicación. Entonces el filtro degenera —«no bloqueantes» no
   * puede dar nada— y hay que decirlo en vez de enseñar una tabla vacía. Medido
   * el 12-oct-2026: 53 de 120 cuentas grandes revisadas estaban así.
   */
  readonly todoBloquea = computed(() =>
    this.cuentaFacade.cuenta()?.estado === 'ADJUDICACION_MANUAL');

  /**
   * El veredicto de bloqueo descansa en un estado que el sistema no sabe traducir.
   *
   * `DESCONOCIDO` es lo que devuelve el diccionario para un estado de OHI que no
   * tiene equivalente en el dominio, y hoy le pasa a `IN PROCESS` —38 cuentas en
   * producción el 12-oct-2026, y el estado al que va a parar una cuenta justo
   * después de resolver un pendiente—. Ahí `bloqueaPendiente` toma la rama de
   * cualquier estado corriente, así que los de sola adjudicación salen como «no
   * bloquea» sin que nadie lo haya decidido. Se avisa en vez de callarlo: la
   * marca sigue siendo útil, pero no es una afirmación firme.
   */
  readonly veredictoIncierto = computed(() =>
    this.cuentaFacade.cuenta()?.estado === 'DESCONOCIDO');

  readonly displayedColumns =
    ['seleccion', 'codigo', 'descripcion', 'nivel', 'estado', 'acciones'];

  // ── Paginación: todo sale del facade, que es quien encadena los cursores ──
  readonly paginaActual = this.facade.paginaActual;
  readonly totalPaginas = this.facade.totalPaginas;
  readonly recorriendo  = this.facade.recorriendo;
  readonly hayAnterior  = this.facade.hayPaginaAnterior;
  readonly haySiguiente = this.facade.hayPaginaSiguiente;
  readonly puedeUltima  = this.facade.puedeIrAUltima;
  readonly ocupado      = computed(() => this.facade.loading() || this.recorriendo());

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
    const total = this.facade.totalFiltrado();
    if (total === null) return null;
    const desde = (this.paginaActual() - 1) * this.facade.TAMANO_PAGINA + 1;
    const hasta = Math.min(desde + this.facade.pendientes().length - 1, total);
    return { desde, hasta, total };
  });

  readonly pendienteSeleccionado = signal<MotivoPendienteModel | null>(null);
  readonly resolving = signal<boolean>(false);

  /**
   * Quién firma la resolución. Sale de la configuración, no de un literal.
   *
   * Mientras esté vacío no se resuelve nada: ver {@link sinAuditor}. Resolver es
   * irreversible y arrastra todas las filas del motivo, así que dejarlo pasar sin
   * identidad convierte la traza en inútil justo donde más falta hace.
   */
  private readonly auditor = environment.auditor;

  /**
   * No hay nadie a quien atribuir la operación, así que no se ofrece.
   *
   * Se bloquea en el cliente y además lo rechaza el servicio: la pantalla puede
   * estar mal configurada, pero la cuenta no se toca sin firma en ninguno de los
   * dos sitios.
   */
  readonly sinAuditor = !environment.auditor?.trim();

  form: FormGroup = this.fb.group({
    justificacion: ['', [Validators.required, Validators.maxLength(2000)]],
    alcance:       ['CUENTA_Y_LINEAS', [Validators.required]]
  });

  ngOnInit(): void {
    this.facade.cargarPendientes(this.codigoCuenta);
  }

  // ── Filtro por motivo ─────────────────────────────────────────────

  /**
   * Cambia el filtro. Se cierra el formulario de resolución porque la fila que
   * estaba seleccionada puede desaparecer de la tabla, y dejar abierto un
   * formulario sobre una fila que ya no se ve despista.
   */
  filtrarPor(codigo: string | null): void {
    this.facade.filtrarPor(codigo);
    this.pendienteSeleccionado.set(null);
  }

  limpiarFiltro(): void {
    this.filtrarPor(null);
  }

  filtrarPorBloqueo(bloqueo: FiltroBloqueo): void {
    this.facade.filtrarPorBloqueo(bloqueo);
    this.pendienteSeleccionado.set(null);
  }

  limpiarTodosLosFiltros(): void {
    this.facade.limpiarTodosLosFiltros();
    this.pendienteSeleccionado.set(null);
  }

  /** Qué alcanza el motivo: las líneas concretas, o la cabecera. */
  alcanceDe(motivo: ResumenMotivoModel): string {
    if (motivo.lineasAfectadas > 0) {
      return motivo.lineasAfectadas === 1 ? '1 línea' : `${motivo.lineasAfectadas} líneas`;
    }
    return motivo.enCabecera ? 'de cabecera' : '—';
  }

  // ── Paginación ────────────────────────────────────────────────────

  irAPagina(numero: number): void { void this.facade.irAPagina(numero); }
  primera():   void { void this.facade.primeraPagina(); }
  anterior():  void { void this.facade.paginaAnterior(); }
  siguiente(): void { void this.facade.paginaSiguiente(); }
  ultima():    void { void this.facade.ultimaPagina(); }

  esNumero(valor: number | '…'): valor is number {
    return valor !== '…';
  }

  /** Un número de página al que no se puede saltar sin encadenar de más. */
  fueraDeAlcance(numero: number): boolean {
    return !this.facade.alcanzable(numero);
  }

  // ── Resolución ────────────────────────────────────────────────────

  seleccionarParaResolver(pendiente: MotivoPendienteModel): void {
    if (this.sinAuditor) return;
    this.pendienteSeleccionado.set(pendiente);
    this.form.reset({ alcance: 'CUENTA_Y_LINEAS' });
  }

  /**
   * Cuántas filas se lleva por delante la resolución individual, y cuáles no.
   *
   * <b>La premisa de antes estaba al revés.</b> Decía que «Cuenta y Líneas»
   * alcanzaba los dos niveles y que «Solo Líneas» dejaba la cabecera, así que
   * descontaba una fila en el segundo caso. El contrato real es lo contrario:
   * los dos niveles son disjuntos y el recurso de `CUENTA_Y_LINEAS`
   * (`resolvepend`) está descrito por el propio sistema de registro como
   * «Resolves a pend reason <i>at claim level</i>» — no toca ninguna línea. Con
   * el texto anterior, un auditor que resolviera un motivo con 418 filas de
   * línea leía «afecta a 418 pendientes» y en realidad se resolvía una.
   *
   * Devuelve `null` cuando no hay nada que advertir.
   */
  alcanceReal(pendiente: MotivoPendienteModel):
      { seResuelven: number; seQuedan: number; detalle: string } | null {
    const motivo = this.facade.motivos().find(m => m.codigo === pendiente.codigo);
    if (!motivo) return null;

    const filasCabecera = motivo.enCabecera ? 1 : 0;
    const filasLinea    = motivo.sinResolver - filasCabecera;
    const soloLineas    = this.form.get('alcance')?.value === 'SOLO_LINEAS';

    const seResuelven = soloLineas ? filasLinea : filasCabecera;
    const seQuedan    = soloLineas ? filasCabecera : filasLinea;

    if (seResuelven <= 1 && seQuedan === 0) return null;
    return { seResuelven, seQuedan, detalle: this.alcanceDe(motivo) };
  }

  /**
   * Para un motivo que está en los dos niveles, ninguno de los dos alcances de
   * la resolución individual lo resuelve del todo. La resolución múltiple sí,
   * con `DONDE_APLIQUE`: se ofrece como salida en vez de dejar al auditor
   * resolviendo dos veces sin saber que hacen falta dos.
   */
  estaEnLosDosNiveles(pendiente: MotivoPendienteModel): boolean {
    const motivo = this.facade.motivos().find(m => m.codigo === pendiente.codigo);
    return !!motivo && motivo.enCabecera && motivo.lineasAfectadas > 0;
  }

  cancelarResolucion(): void {
    this.pendienteSeleccionado.set(null);
  }

  async resolver(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const pendiente = this.pendienteSeleccionado();
    if (!pendiente) return;

    this.resolving.set(true);

    const { justificacion, alcance } = this.form.value;

    const ok = await this.facade.resolver(
      this.codigoCuenta,
      pendiente.identificador,
      { justificacion, alcance: alcance as AlcanceResolucion },
      this.auditor,
      // El código va para que el facade pueda soltar el filtro si lo resuelto
      // era justo el motivo por el que se estaba filtrando.
      pendiente.codigo
    );

    this.resolving.set(false);
    if (ok) {
      this.pendienteSeleccionado.set(null);
    }
  }

  // ── Selección múltiple ────────────────────────────────────────────

  readonly impacto         = this.facade.impactoSeleccion;
  readonly hayMarcados     = this.facade.hayMarcados;
  readonly todosMarcados   = this.facade.todosMarcados;
  readonly motivosMarcados = this.facade.motivosMarcados;
  readonly resolviendoEnMasa = this.facade.resolviendoEnMasa;

  /** Si esta cuenta tiene una resolución en curso: se sigue sola y no se deja lanzar otra. */
  readonly enCursoAqui = computed(() => this.facade.hayResolucionEnCurso(this.codigoCuenta));

  /** La que se dejó de seguir sin confirmar, si es de esta cuenta. */
  readonly sinConfirmarAqui = computed(() => this.facade.seguimientoSinConfirmarDe(this.codigoCuenta));
  readonly resultadoMasivo   = this.facade.resultadoMasivo;
  readonly sinEfecto         = this.facade.seleccionSinEfecto;

  /** Si el panel de confirmación de la resolución múltiple está abierto. */
  readonly confirmandoMasivo = signal<boolean>(false);

  formMasivo: FormGroup = this.fb.group({
    justificacion: ['', [Validators.required, Validators.maxLength(2000)]],
  });

  estaMarcado(codigo: string): boolean {
    return this.facade.estaMarcado(codigo);
  }

  /**
   * Marcar una fila marca **su motivo**, y con él todas sus filas.
   *
   * No es un atajo: es lo único que el sistema de registro sabe hacer. Para que
   * el auditor lo vea en vez de leerlo, las demás filas del mismo motivo se
   * marcan a la vez —también las de otras páginas, que es lo que cuenta la barra
   * de selección—. Si la casilla fuera por fila, marcar una de un motivo con 418
   * resolvería las 418 sin avisar.
   */
  alternarMotivo(codigo: string): void {
    this.facade.alternarMotivo(codigo);
    // Un panel de resolución individual abierto sobre una fila que ahora entra
    // en la selección múltiple deja dos caminos abiertos sobre lo mismo.
    this.pendienteSeleccionado.set(null);
  }

  marcarTodos(): void   { this.facade.marcarTodos(); this.pendienteSeleccionado.set(null); }
  desmarcarTodos(): void {
    this.facade.desmarcarTodos();
    this.confirmandoMasivo.set(false);
  }

  cambiarNivel(nivel: NivelResolucion): void {
    this.facade.nivelResolucion.set(nivel);
  }

  abrirConfirmacionMasiva(): void {
    if (this.sinAuditor) return;
    this.formMasivo.reset({ justificacion: '' });
    this.confirmandoMasivo.set(true);
    this.pendienteSeleccionado.set(null);
  }

  cancelarMasiva(): void {
    this.confirmandoMasivo.set(false);
  }

  descartarResultado(): void {
    this.facade.descartarResultado();
  }

  async resolverMarcados(): Promise<void> {
    if (this.formMasivo.invalid) {
      this.formMasivo.markAllAsTouched();
      return;
    }
    const { justificacion } = this.formMasivo.value;
    const resultado = await this.facade.resolverMarcados(justificacion, this.auditor);
    // El panel se cierra en cuanto el servicio contesta, incluido el fallo: el
    // resultado se cuenta en su propio aviso, que no desaparece solo.
    if (resultado) this.confirmandoMasivo.set(false);
  }

  /** Rótulo del desenlace, para no pintar el enum del servicio. */
  readonly ETIQUETA_DESENLACE: Record<string, string> = {
    COMPLETO:  'Resuelto',
    PARCIAL:   'Resuelto en parte',
    FALLIDO:   'No se resolvió',
    EN_CURSO:  'Sigue en curso',
  };

  /**
   * Nombre legible del nivel. El servicio manda el enum del dominio
   * (`CABECERA` / `LINEA`); pintarlo tal cual deja al auditor leyendo
   * mayúsculas sueltas.
   */
  etiquetaNivel(nivel: NivelPendiente): string {
    return ETIQUETA_NIVEL[nivel] ?? nivel;
  }
}
