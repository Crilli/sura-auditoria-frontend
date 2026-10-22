import {
  Component, Input, inject, effect, signal, OnInit, ChangeDetectionStrategy, computed, ElementRef, viewChild,
  untracked, afterRenderEffect
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule, MatExpansionPanelHeader } from '@angular/material/expansion';
import { HistoriaCuentaDialogComponent }
  from '../historia-cuenta-dialog/historia-cuenta-dialog.component';
import { FotoVersionComponent } from '../compartido/foto-version/foto-version.component';
import { CuentaRepository } from '../../domain/ports/cuenta.repository';
import { opcionesDeVersion, porQueNoTieneFoto } from '../../domain/models/opciones-version.model';
import { VersionCuentaModel } from '../../domain/models/cuenta-medica.model';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CuentaFacade } from '../../application/facades/cuenta.facade';
import { LineaFacade } from '../../application/facades/linea.facade';
import { DialogoAccionComponent, DatosDialogoAccion } from './dialogo-accion.component';
import { firstValueFrom } from 'rxjs';
import { SeccionNovedadesComponent } from '../linea-edicion/secciones/seccion-novedades.component';
import { resumenNovedades } from '../linea-edicion/resumenes-seccion';
import { environment } from '@sura/environments';
import { EnviarCuentaDialogComponent } from '../enviar-cuenta-dialog/enviar-cuenta-dialog.component';
import { CuentaMedicaModel, InformacionFacturacionModel, MotivoModel } from '../../domain/models/cuenta-medica.model';
import { EstadoEnOhiPipe, TextoEstadoPipe } from '../compartido/estado-cuenta.pipe';
import {
  accionParaPasarAModificacion, motivoParaNoCambiarDatos, rotuloDelEnvio, seMuestraElEnvio, textoDeEstado
} from '../../domain/models/estado-cuenta.model';
import { PendienteFacade } from '../../application/facades/pendiente.facade';

/** Clave en localStorage para recordar qué bloques de la cabecera deja abiertos el auditor. */
const CLAVE_PANELES = 'auditoria.cuenta-detalle.paneles';

/** Los totales de la franja de resumen. `null` = OHI no lo trae. */
export interface TotalesCuenta {
  /** `totalClaimedAmount`. */
  cargado:    number | null;
  /** `totalAllowedAmount` (ENC-12). */
  convenido:  number | null;
  /** `totalCoveredAmount` (ENC-13). */
  autorizado: number | null;
  /** `totalValorGlosado`. */
  glosado:    number | null;
}

@Component({
  selector: 'sura-cuenta-detalle',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, RouterModule, MatTabsModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
    MatMenuModule, MatDialogModule, MatSnackBarModule, MatTooltipModule,
    MatExpansionModule,
    SeccionNovedadesComponent, TextoEstadoPipe, EstadoEnOhiPipe, FotoVersionComponent,
  ],
  templateUrl: './cuenta-detalle.component.html',
  styleUrls: ['./cuenta-detalle.component.scss']
})
export class CuentaDetalleComponent implements OnInit {

  /**
   * El código de la ruta. Por dentro es una señal para que la foto de la versión (BTN-12) se
   * vuelva a pedir sola si cambia; por fuera sigue siendo el `@Input` de siempre.
   */
  @Input({ required: true })
  set codigo(valor: string) { this.codigoCuenta.set(valor); }
  get codigo(): string { return this.codigoCuenta(); }
  private readonly codigoCuenta = signal('');

  // ── Versión vigente (BTN-04) ─────────────────────────────────────────────
  //
  // En su propia petición, en paralelo con la cabecera —igual que las acciones—: el histórico
  // de lo transmitido no debe retrasar que se pinte la cuenta.

  private readonly cuentasRepo = inject(CuentaRepository);
  readonly versiones = signal<VersionCuentaModel[]>([]);
  /**
   * Si el histórico ya llegó. Va aparte del valor porque `[]` dice tres cosas —«no tiene
   * versiones», «todavía no se sabe» y «no se pudo consultar»— y la pantalla solo puede afirmar
   * la primera cuando es la primera (BTN-12.5).
   */
  readonly estadoVersiones = signal<'cargando' | 'ok' | 'error'>('cargando');
  private versionesDe: string | null = null;

  /** La de mayor número sin reversión: el servicio ya las manda de la más reciente a la más antigua. */
  readonly versionVigente = computed(() => this.versiones()[0] ?? null);

  private cargarVersiones(codigo: string): void {
    if (this.versionesDe === codigo) return;
    this.versionesDe = codigo;
    this.versiones.set([]);
    this.estadoVersiones.set('cargando');
    // Sin versiones no es un error —la cuenta aún no se transmitió— y un fallo aquí no debe
    // tumbar la cabecera: el dato es accesorio y la pantalla sigue siendo útil sin él.
    this.cuentasRepo.consultarVersiones(codigo).subscribe({
      next: v => {
        this.versiones.set(v);
        this.estadoVersiones.set('ok');
      },
      error: () => {
        this.versiones.set([]);
        this.estadoVersiones.set('error');
      },
    });
  }

  /**
   * Abre la historia de la cuenta en un diálogo.
   *
   * El diálogo consulta al nacer, así que la petición se hace exactamente cuando el auditor
   * la pide. Antes esto era un panel plegado en la cabecera: ocupaba sitio permanente sobre
   * lo que sí se usa a diario para algo que casi nunca se abre.
   *
   * Con el código de la ruta si la cuenta viva no ha llegado: en la foto de una versión la
   * historia se ofrece igual.
   */
  abrirHistoria(): void {
    this.dialog.open(HistoriaCuentaDialogComponent, {
      data: { codigoCuenta: this.facade.cuenta()?.codigo ?? this.codigo },
      autoFocus: false,
      restoreFocus: this.focoAlCerrarElDialogo(),
      width: '48rem',
      maxWidth: '95vw',
    });
  }

  // ── Navegar entre versiones (BTN-12) ─────────────────────────────────────
  //
  // La foto de una versión es una ruta hija de la cuenta (`versiones/:numero`), así que esta
  // vista —y su barra— sigue siendo la misma al cambiar de versión. Lo que cambia es lo de
  // debajo de la barra: en la foto no se pinta nada de la cuenta viva que se pueda tocar.
  //
  // Nada de esto escribe en `CuentaFacade` ni en `LineaFacade`: son de toda la aplicación y
  // guardan la cuenta viva. La foto se pide aquí y sus líneas, en sus propios componentes.

  private readonly ruta = inject(ActivatedRoute);
  private readonly router = inject(Router);

  /**
   * El número de la versión que se ve, o `null` en la cuenta actual. `NaN` si la URL trae algo
   * que no es un número de versión.
   *
   * Sale de la URL y no de un `input()`: los parámetros bajan del padre a los hijos y nunca
   * suben, y `:numero` es de la ruta hija. Se relee al terminar cada navegación; al nacer la
   * vista, la instantánea de la ruta ya es la de la navegación que la creó.
   */
  readonly numeroEnVista = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(() => this.numeroDeLaUrl())),
    { initialValue: this.numeroDeLaUrl() });

  /** Si se está viendo la foto de una versión y no la cuenta actual. */
  readonly enFoto = computed(() => this.numeroEnVista() !== null);

  private numeroDeLaUrl(): number | null {
    const crudo = this.ruta.snapshot?.firstChild?.paramMap.get('numero');
    if (crudo === null || crudo === undefined) return null;
    return /^\d+$/.test(crudo) ? Number(crudo) : Number.NaN;
  }

  /** Las opciones del selector de la barra. Vacío sin versiones: entonces no hay selector. */
  readonly opcionesDeVersion = computed(() =>
    opcionesDeVersion(this.facade.cuenta()?.estado, this.versiones(), this.numeroEnVista()));

  /**
   * Lo que dice el botón del selector: la versión que hay en pantalla. Si la URL lleva a una
   * foto que el selector no ofrece —la vigente de una cuenta finalizada, que el selector da
   * como la cuenta actual—, se dice igual cuál es.
   */
  readonly versionEnPantalla = computed<{ numero: number | null; rotulo: string | null }>(() => {
    const marcada = this.opcionesDeVersion().find(o => o.enPantalla);
    if (marcada) {
      return { numero: marcada.numero, rotulo: marcada.destino === 'foto' ? 'foto' : marcada.rotulo };
    }
    const n = this.numeroEnVista();
    if (n === null) return { numero: null, rotulo: null };
    // Sin rótulo mientras no se sepa: «foto» de una versión que puede no tenerla sería mentir.
    const estado = this.estadoDeLaVersion();
    return {
      numero: this.esNumeroDeVersion(n) ? n : null,
      rotulo: this.sinFoto() ? 'sin foto' : estado === 'FOTO' ? 'foto' : null,
    };
  });

  /**
   * Para el lector de pantalla: qué se ve y que el botón sirve para cambiarlo. Empieza por lo
   * mismo que se lee en el botón («Versión V9 en curso»), para que quien lo nombra en voz alta
   * lo encuentre (WCAG 2.5.3).
   */
  readonly etiquetaDelSelector = computed(() => {
    const { numero, rotulo } = this.versionEnPantalla();
    const visible = ['Versión', numero !== null ? `V${numero}` : (this.enFoto() ? null : 'actual'), rotulo]
      .filter(Boolean).join(' ');
    const que = rotulo === 'foto' ? ': cómo quedó al finalizarse'
      : rotulo === 'en curso' || rotulo === 'vigente' || (!this.enFoto() && numero === null) ? ': la cuenta actual'
      : '';
    return `${visible}${que}. Cambiar de versión`;
  });

  /** Si la URL trae un número de versión de verdad, y no «abc» ni «0». */
  esNumeroDeVersion(n: number | null): n is number {
    return n !== null && Number.isInteger(n) && n >= 1;
  }

  /**
   * La foto de la versión que se ve. En su propio recurso, en paralelo con la cuenta viva —que
   * se sigue pidiendo: el selector necesita su estado y la vuelta a la actual es inmediata—.
   */
  private readonly _foto = rxResource({
    params: () => {
      const n = this.numeroEnVista();
      return this.esNumeroDeVersion(n) && this.codigoCuenta()
        ? { codigo: this.codigoCuenta(), numero: n } : undefined;
    },
    stream: ({ params }) => this.cuentasRepo.consultarVersion(params.codigo, params.numero),
  });

  /** `hasValue()` delante: con el recurso en error, `value()` lanza (lo mismo que en `CuentaFacade`). */
  readonly foto = computed(() => this._foto.hasValue() ? this._foto.value() : null);

  /**
   * Lo que se sabe de la versión de la URL, o `null` en la cuenta actual (BTN-12.5). La pantalla
   * solo afirma lo que ya se sabe:
   *
   * - `FOTO`: llegó su foto. Solo entonces se dice «Estás viendo la Vn tal como quedó».
   * - `COMPROBANDO`: todavía no se sabe. Mientras se pide la foto, porque la versión puede no
   *   existir. Y cuando el servicio ya respondió que no está en el histórico (400, «La cuenta …
   *   no tiene versión N en el histórico de lo transmitido»), mientras no hayan llegado la cuenta
   *   viva y su histórico: decir por qué no tiene foto depende de ellos —en una cuenta reabierta
   *   la siguiente a la última es la que se trabaja—, y llegan por su lado, sin orden garantizado.
   *   Sin esperarlos, una V5 en curso se anunciaba como inexistente en «una cuenta sin versiones
   *   finalizadas», dentro de una alerta que el lector de pantalla lee en el acto, para cambiar
   *   de texto un momento después. Una cuenta que se está volviendo a pedir tampoco vale: su
   *   estado puede ser el de la visita anterior.
   * - `EN_CURSO` / `NO_EXISTE`: no tiene foto, y por qué. Nunca una foto en blanco ni la cuenta
   *   viva haciéndose pasar por esa versión. Si el histórico no se pudo consultar, `NO_EXISTE`
   *   sin más: lo único que se sabe es lo que dijo el servicio de la foto.
   * - `ERROR`: no se pudo consultar (la red, o el sistema de registro caído). Sigue siéndolo
   *   mientras se reintenta, para que el botón no se vaya con el foco.
   */
  readonly estadoDeLaVersion = computed<'COMPROBANDO' | 'FOTO' | 'EN_CURSO' | 'NO_EXISTE' | 'ERROR' | null>(() => {
    const n = this.numeroEnVista();
    if (n === null) return null;
    if (!this.esNumeroDeVersion(n)) return 'NO_EXISTE';
    if (this._foto.hasValue()) return 'FOTO';
    const error = this._foto.error() as (Error & { status?: number }) | undefined;
    if (!error) return 'COMPROBANDO';
    if (error.status !== 400 && error.status !== 404) return 'ERROR';
    if (this.estadoVersiones() === 'cargando' || this.facade.loading()) return 'COMPROBANDO';
    return porQueNoTieneFoto(n, this.facade.cuenta()?.estado, this.versiones());
  });

  /** Por qué la versión de la URL no tiene foto, o `null` si la tiene o todavía no se sabe. */
  readonly sinFoto = computed<'EN_CURSO' | 'NO_EXISTE' | null>(() => {
    const estado = this.estadoDeLaVersion();
    return estado === 'EN_CURSO' || estado === 'NO_EXISTE' ? estado : null;
  });

  /** Un fallo de la consulta que no es «no existe»: la red, o el sistema de registro caído. */
  readonly errorDeFoto = computed(() => {
    if (this.estadoDeLaVersion() !== 'ERROR') return null;
    const error = this._foto.error() as Error | undefined;
    return error?.message || 'No se pudo consultar la versión.';
  });

  /** Mientras se reintenta: el botón se apaga sin irse (`disabledInteractive`). */
  readonly reintentandoFoto = computed(() => this._foto.isLoading());

  reintentarFoto(): void {
    // El botón apagado sigue recibiendo clics; `reload()` ya no hace nada con una carga en curso.
    this._foto.reload();
  }

  /** La mayor del histórico, para decir de qué versiones sí hay foto. */
  readonly ultimaDelHistorico = computed(() =>
    this.versiones().reduce((mayor, v) => Math.max(mayor, v.numero), 0) || null);

  
  readonly facade = inject(CuentaFacade);

  /**
   * Para el contador del rótulo y para releer las líneas tras un cambio de estado. El total lo
   * conoce quien pagina las líneas, y llega en `null` cuando el filtro obliga a descartar en el
   * servicio: en ese caso el rótulo va sin paréntesis, que es preferible a enseñar un número que
   * no corresponde a lo que el auditor va a poder ver.
   */
  private readonly lineas = inject(LineaFacade);
  readonly totalLineas = this.lineas.totalLineas;
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  /**
   * Estado de los acordeones de la cabecera. Arrancan con el prestador abierto
   * —es el bloque que el auditor consulta— y el resto plegado, para que las
   * pestañas de trabajo queden visibles sin desplazar la página.
   *
   * La preferencia se guarda por navegador: al pasar de una cuenta a otra el
   * componente se recrea, y sin esto el auditor tendría que replegar en cada una.
   */
  readonly panelCuentaAbierto    = signal(this.preferencia('cuenta', false));
  readonly panelPrestadorAbierto = signal(this.preferencia('prestador', true));
  /**
   * Las novedades arrancan plegadas: son el bloque más largo de la cabecera y
   * la mayoría de las cuentas traen alguna del motor que el auditor no va a
   * tocar. Quien las necesite las abre, y la preferencia se recuerda.
   */
  readonly panelNovedadesAbierto = signal(this.preferencia('novedades', false));

  /**
   * Quién firma los cambios de novedad.
   *
   * Sale de la configuración del entorno, igual que en el detalle de línea: es
   * una identidad de desarrollo, no una autenticación.
   */
  private readonly auditor = environment.auditor;

  /** El mismo resumen que la cabecera del panel de la línea. */
  readonly resumenNovedades = resumenNovedades;

  /** Para enterarse de que acabó una resolución de pendientes (EST-03.4); ver el constructor. */
  private readonly pendientes = inject(PendienteFacade);
  private ultimaResolucionAtendida: number | null = null;

  constructor() {
    effect(() => this.guardarPreferencias({
      cuenta:    this.panelCuentaAbierto(),
      prestador: this.panelPrestadorAbierto(),
      novedades: this.panelNovedadesAbierto()
    }));

    // La franja aparece con la cuenta y desaparece al cambiar de cuenta o fallar la carga: el
    // observador se monta y se desmonta con ella.
    effect(onCleanup => {
      const franja = this.resumen()?.nativeElement;
      if (!franja || typeof IntersectionObserver === 'undefined') {
        this.resumenFueraDeVista.set(false);
        return;
      }
      // El margen negativo descuenta la barra: la franja que pasa por debajo de ella ya no se
      // lee, aunque técnicamente siga dentro de la ventana.
      const observador = new IntersectionObserver(
        entradas => {
          const ultima = entradas[entradas.length - 1];
          if (ultima) this.resumenFueraDeVista.set(!ultima.isIntersecting);
        },
        { rootMargin: `-${this.ALTO_BARRA_PX}px 0px 0px 0px` });
      observador.observe(franja);
      onCleanup(() => observador.disconnect());
    });

    // Lo anotado en las novedades de cabecera y sin guardar se descarta si la cuenta deja de
    // admitir cambios (EST-01.8): guardarlo ya no se puede, y enseñarlo como pendiente de
    // guardar invitaría a pulsar un botón que el servicio rechazaría. Con la cuenta todavía sin
    // llegar no se toca nada: no se sabe nada de ella.
    effect(() => {
      if (!this.facade.cuenta() || this.facade.admiteCambios()) return;
      untracked(() => {
        if (this.facade.cambiosDeNovedad().length > 0) this.facade.cambiosDeNovedad.set([]);
      });
    });

    // Una resolución de pendientes que acaba puede mover la cuenta de estado, y con él el botón
    // de envío, «Pasar a Modificación» y la regla de cambios (EST-03.4). Se vuelve a pedir la
    // cuenta, la lanzara quien la lanzara. La primera vez se toma la que hubiera como atendida:
    // la cuenta se acaba de pedir y ya la incluye.
    effect(() => {
      const instante = this.pendientes.ultimaResolucionDe(this.codigoCuenta());
      if (this.ultimaResolucionAtendida === null) {
        this.ultimaResolucionAtendida = instante ?? 0;
        return;
      }
      if (instante === null || instante <= this.ultimaResolucionAtendida) return;
      this.ultimaResolucionAtendida = instante;
      untracked(() => this.facade.recargar());
    });

    // Ver `seguirElFoco()`. Se mira con la cuenta releída ya pintada: sin carga en curso y después
    // del render, cuando el botón que se iba ya no está en el documento.
    afterRenderEffect(() => {
      const pendiente = this.focoPorSeguir();
      if (!pendiente || this.facade.loading()) return;
      untracked(() => this.focoPorSeguir.set(null));
      const { origen } = pendiente;
      // Si el botón sigue, el foco sigue con él; si el auditor ya está en otro sitio, no se le mueve.
      if (!origen || origen.isConnected) return;
      const activo = document.activeElement;
      if (activo && activo !== document.body) return;
      const vista = this.anfitrion.nativeElement as HTMLElement;
      (vista.querySelector<HTMLElement>('#btn-enviar')
        ?? vista.querySelector<HTMLElement>('#btn-pasar-a-modificacion')
        ?? vista.querySelector<HTMLElement>('#btn-menu-cuenta'))?.focus();
    });
  }

  private readonly anfitrion = inject(ElementRef);

  /** El elemento que tenía el foco al lanzar un cambio de estado desde la barra; ver `seguirElFoco()`. */
  private readonly focoPorSeguir = signal<{ origen: Element | null } | null>(null);

  /**
   * Que el foco no se pierda cuando el botón de la barra desaparece por su propio éxito. Al
   * cerrarse, el diálogo devuelve el foco a quien lo abrió, pero ese botón deja de existir en
   * cuanto llega la cuenta releída —«Pasar a Modificación» al quedar en Modificación, el envío al
   * quedar finalizada (BTN-13.5, EST-02.6)— y el foco caía en `<body>`: el lector de pantalla
   * perdía el sitio y no quedaba indicador visible. Se lleva al botón que ocupa su lugar: «Enviar»
   * si está —en Modificación es el siguiente paso—, si no «Pasar a Modificación» y, si tampoco,
   * el menú. Hasta el 2026-10-21 el envío se apagaba en vez de irse y el diálogo podía devolverle
   * el foco; desde que desaparece, hace falta esto.
   *
   * Se llama al acabar, con éxito o sin él: si no hubo relectura no hay carga en curso, el botón
   * sigue en su sitio y no se toca nada.
   */
  private seguirElFoco(origen: Element | null): void {
    this.focoPorSeguir.set({ origen });
  }

  /** El botón del menú de la barra: a él vuelve el foco de lo que se abre desde el menú. */
  private readonly botonMenu = viewChild('botonMenu', { read: ElementRef });

  /**
   * A dónde vuelve el foco al cerrar un diálogo. Por omisión, al elemento que lo abrió. Pero una
   * opción del menú ya no existe al cerrarse el diálogo —el menú la destruye al cerrarse él— y el
   * foco caía en `<body>`, tanto al confirmar como al cancelar: vuelve al botón del menú.
   */
  private focoAlCerrarElDialogo(): true | HTMLElement {
    const boton = this.botonMenu()?.nativeElement as HTMLElement | undefined;
    return boton && document.activeElement?.closest('[role="menu"]') ? boton : true;
  }

  // ── Barra fija (BTN-11) ──────────────────────────────────────────────────

  /**
   * Alto de la barra, en un solo sitio: la plantilla lo publica como variable CSS para que las
   * pestañas se peguen justo debajo, y el observador lo descuenta de la ventana.
   */
  readonly ALTO_BARRA_PX = 56;

  private readonly resumen = viewChild<ElementRef<HTMLElement>>('resumen');
  private readonly panelCuenta = viewChild('panelCuenta', { read: ElementRef });
  private readonly cabeceraPanelCuenta = viewChild('cabeceraPanelCuenta', { read: MatExpansionPanelHeader });

  /**
   * Si la franja de resumen ya no se ve. Solo entonces la barra enseña el código, el estado y
   * el total glosado: arriba del todo sería repetir lo que está justo debajo.
   *
   * Sin `IntersectionObserver` se queda en `false`: la barra sigue fija y operativa, y lo único
   * que se pierde es ese resumen, que es un añadido.
   */
  readonly resumenFueraDeVista = signal(false);

  // ── Envío y paso a Modificación (BTN-13, EST-02) ─────────────────────────
  //
  // Hasta el 2026-10-21 «Enviar» se apagaba con pendientes, sin el envío publicado o mientras se
  // consultaban las acciones. Ya no: el botón de envío no se apaga nunca —lo que lo apagaba se
  // avisa dentro de su diálogo— y solo desaparece con la cuenta finalizada. El servicio sigue
  // negando lo que OHI no deja, y el auditor lee por qué.

  /** Las reglas puras de la barra, para la plantilla. */
  readonly rotuloDelEnvio = rotuloDelEnvio;
  readonly seMuestraElEnvio = seMuestraElEnvio;
  readonly accionParaPasarAModificacion = accionParaPasarAModificacion;

  /**
   * Por qué «Pasar a Modificación» está apagado, o `null` si se puede pulsar. El mismo texto va
   * junto al botón y dentro del menú: un botón apagado sin explicación invita a buscar el
   * fallo donde no está.
   *
   * La autoridad es OHI: habilitado si publica la acción. Mientras se consulta todavía no se
   * sabe; si la consulta falla, habilitado, y que decida el servicio —apagarlo por un fallo de
   * red dejaría al auditor sin el único camino a Modificación—.
   */
  motivoParaNoPasarAModificacion(cuenta: CuentaMedicaModel): string | null {
    const accion = accionParaPasarAModificacion(cuenta.estado);
    if (!accion) return null;
    if (this.facade.ejecutandoAccion() !== null) return 'Hay una acción en curso sobre la cuenta…';
    if (this.facade.accionesCargando()) return 'Consultando…';
    // Después de la carga: durante una recarga tras el fallo, `error()` sigue con valor.
    if (this.facade.accionesError() || this.facade.permite(accion)) return null;
    return accion === 'REVERTIR_FINALIZACION'
      ? 'OHI no permite desfinalizar esta cuenta'
      : `OHI no permite pasar a Modificación una cuenta en ${textoDeEstado(cuenta.estado)}`;
  }

  /**
   * Pasa la cuenta a Modificación con la acción que toca a su estado. Reutiliza el camino de
   * cualquier acción —confirmación, motivos si los pide, recarga—, con su propia etiqueta y una
   * explicación de lo que va a pasar: desfinalizar no es lo mismo que devolver.
   */
  async pasarAModificacion(cuenta: CuentaMedicaModel): Promise<void> {
    const accion = accionParaPasarAModificacion(cuenta.estado);
    // El botón apagado sigue recibiendo clics (`disabledInteractive`): la puerta está aquí.
    if (!accion || this.motivoParaNoPasarAModificacion(cuenta)) return;
    const origen = document.activeElement;
    await this.ejecutar(cuenta, accion, {
      etiqueta: 'Pasar a Modificación',
      explicacion: accion === 'REVERTIR_FINALIZACION'
        ? 'La cuenta está finalizada: para cambiar sus datos se desfinaliza. Queda directamente '
          + 'en Modificación, con una versión nueva en curso.'
        : `La cuenta pasa de ${textoDeEstado(cuenta.estado)} a Modificación, donde se pueden `
          + 'cambiar sus datos. Para que siga su curso, envíela después.',
    });
    this.seguirElFoco(origen);
  }

  /** El aviso de las novedades de cabecera fuera de Modificación (EST-01.4), o `null`. */
  readonly motivoSinCambios = computed(() => {
    const cuenta = this.facade.cuenta();
    return cuenta && !this.facade.admiteCambios() ? motivoParaNoCambiarDatos(cuenta.estado) : null;
  });

  /** El atajo se cumple al cerrarse el menú: si no, el menú devolvería el foco a su botón. */
  private irAAccionesAlCerrar = false;

  /**
   * Atajo del menú a las acciones habilitadas: abre «Datos de la cuenta» y lo trae a la vista.
   * Las acciones no cambian de sitio (decisión del 2026-10-17 sobre BTN-01 y BTN-09).
   */
  irALasAcciones(): void {
    this.panelCuentaAbierto.set(true);
    this.irAAccionesAlCerrar = true;
  }

  alCerrarMenu(): void {
    if (!this.irAAccionesAlCerrar) return;
    this.irAAccionesAlCerrar = false;
    // Después de que el menú restaure el foco en su botón, para quedarse con la última palabra.
    setTimeout(() => {
      // Sin que el foco desplace por su cuenta: el desplazamiento lo hace `scrollIntoView`, una vez.
      this.cabeceraPanelCuenta()?.focus('program', { preventScroll: true });
      const panel = this.panelCuenta()?.nativeElement as HTMLElement | undefined;
      panel?.scrollIntoView?.({ behavior: this.desplazamiento(), block: 'start' });
    });
  }

  /** Suave, salvo que el sistema pida menos movimiento. */
  private desplazamiento(): ScrollBehavior {
    return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'auto' : 'smooth';
  }

  private readonly pestanas = viewChild('pestanas', { read: ElementRef });
  private readonly panelPestanas = viewChild('tabPanel', { read: ElementRef });

  /**
   * Con las pestañas pegadas, la pestaña nueva empezaría a la altura por la que iba la anterior
   * —el router no toca el desplazamiento— y su principio quedaría por encima de la pantalla. Se
   * lleva ese principio justo debajo de las pestañas. Si no están pegadas, no se mueve nada.
   *
   * Vale hacerlo en el click, antes de que cambie el contenido: lo que hay encima del panel no
   * depende de la pestaña, así que su posición en el documento es la misma.
   */
  alCambiarDePestana(): void {
    const nav = this.pestanas()?.nativeElement as HTMLElement | undefined;
    const panel = this.panelPestanas()?.nativeElement as HTMLElement | undefined;
    if (!nav || !panel || nav.getBoundingClientRect().top > this.ALTO_BARRA_PX) return;
    window.scrollTo({ top: window.scrollY + panel.getBoundingClientRect().top - this.ALTO_BARRA_PX - nav.offsetHeight });
  }

  ngOnInit(): void {
    this.facade.buscar(this.codigo);
    // En paralelo, no después: la cabecera no espera al histórico.
    this.cargarVersiones(this.codigo);
  }

  /**
   * Guarda las novedades marcadas en la cabecera.
   *
   * Tiene botón propio, al contrario que en el detalle de línea: allí la
   * novedad viaja con el formulario de la línea, y aquí no hay más formulario
   * —la novedad es lo único editable de la cabecera—.
   */
  async guardarNovedades(): Promise<void> {
    if (!this.facade.admiteCambios()) return;
    const ok = await this.facade.guardarNovedades(this.codigo, this.auditor);
    this.snackBar.open(
      ok ? 'Novedades guardadas' : (this.facade.errorComando() ?? 'No se pudieron guardar'),
      'Cerrar',
      { duration: ok ? 2500 : 6000 });
  }

  // ── Acciones habilitadas ─────────────────────────────────────────────────

  /**
   * Las que no se ejecutan por aquí.
   *
   * <p>No es que estén deshabilitadas: es que tienen su propio camino.
   * *Enviar* abre su diálogo, *seguir proceso* es la pestaña de seguimiento y
   * las dos de pendientes se resuelven en su pestaña, donde se ve cuál es cuál.
   * Devolver a modificación y revertir la finalización son «Pasar a Modificación»
   * de la barra (EST-02): dos botones para lo mismo harían dudar de cuál usar.
   * Ofrecerlas aquí como un botón más llevaría a una pantalla a medias.
   */
  private static readonly TIENEN_SU_PROPIO_CAMINO = new Set([
    'ENVIAR', 'SEGUIR_PROCESO', 'RESOLVER_PENDIENTE', 'RESOLVER_PENDIENTE_LINEA',
    'DEVOLVER_A_MODIFICACION', 'REVERTIR_FINALIZACION',
  ]);

  /** Las dos que piden motivos del catálogo. Lo exige su contrato, no nosotros. */
  private static readonly PIDEN_MOTIVOS = new Set(['ANULAR', 'REVERTIR_FINALIZACION']);

  esEjecutable(accion: string): boolean {
    return !CuentaDetalleComponent.TIENEN_SU_PROPIO_CAMINO.has(accion);
  }

  /** Hoy solo anular: deja la cuenta en un estado del que no se sale. */
  esIrreversible(accion: string): boolean {
    return accion === 'ANULAR';
  }

  /**
   * A dónde lleva una acción que no se ejecuta desde aquí. El envío nombra el rótulo que tiene
   * el botón en este estado —«Aceptar» o «Enviar»—: con otra palabra no se encontraría.
   */
  aDondeLleva(accion: string): string {
    switch (accion) {
      case 'ENVIAR':
        return `Se envía con el botón «${rotuloDelEnvio(this.facade.cuenta()?.estado)}» de la barra superior`;
      case 'SEGUIR_PROCESO':           return 'Se consulta en la pestaña Seguimiento';
      case 'RESOLVER_PENDIENTE':
      case 'RESOLVER_PENDIENTE_LINEA': return 'Se resuelven en la pestaña Pendientes';
      case 'DEVOLVER_A_MODIFICACION':
      case 'REVERTIR_FINALIZACION':    return 'Con «Pasar a Modificación» de la barra superior';
      default:                         return '';
    }
  }

  /**
   * Pide confirmación y ejecuta.
   *
   * <p>Confirma **siempre**, también las reversibles: mueven el estado de una
   * cuenta médica, y la tira de botones no distingue a simple vista la que se
   * deshace de la que no. Lo que cambia según el peso es lo que se pide dentro
   * del diálogo, no si lo hay.
   *
   * <p>Con éxito se relee además lo que se ve de la cuenta —la página de líneas y la línea
   * abierta—: la cuenta y sus acciones ya las recarga la fachada, pero la versión de las líneas
   * también puede cambiar con el estado (EST-02.4).
   *
   * @param presentacion otra etiqueta y una explicación, para cuando la acción llega con otro
   *        nombre: «Pasar a Modificación» es devolver o desfinalizar según el estado.
   */
  async ejecutar(cuenta: CuentaMedicaModel, accion: string,
                 presentacion: { etiqueta: string; explicacion?: string } | null = null): Promise<void> {
    if (this.accionEnMarcha) return;
    this.accionEnMarcha = true;
    try {
      const pideMotivos = CuentaDetalleComponent.PIDEN_MOTIVOS.has(accion);
      const etiqueta = presentacion?.etiqueta ?? this.etiquetaAccion(accion);

      // Solo los que aplican a este tipo de proceso: hay seis que son de cuenta
      // médica y cuatro de autorización, y ofrecerlos todos invita a un rechazo.
      let motivos: MotivoModel[] = [];
      if (pideMotivos) {
        const consultados = await firstValueFrom(this.facade.motivos(this.ambitoDe(cuenta)))
          .catch(() => null);
        // Sin motivos no hay diálogo: pediría «Elija al menos un motivo» sin ofrecer ninguno,
        // con el confirmar apagado y sin decir por qué. Es el único camino de una finalizada a
        // Modificación (EST-02.3): el auditor tiene que saber que falló el catálogo.
        if (!consultados?.length) {
          this.snackBar.open(consultados
              ? `El catálogo no ofrece ningún motivo para esta cuenta, y «${etiqueta}» pide al menos uno.`
              : `No se pudo consultar el catálogo de motivos, y «${etiqueta}» pide al menos uno. `
                + 'Vuelva a intentarlo.',
            'Cerrar', { duration: 8000 });
          return;
        }
        motivos = consultados;
      }

      const solicitud = await firstValueFrom(
        this.dialog.open(DialogoAccionComponent, {
          width: '560px',
          restoreFocus: this.focoAlCerrarElDialogo(),
          data: {
            accion,
            etiqueta,
            codigoCuenta: cuenta.codigo,
            irreversible: this.esIrreversible(accion),
            pideMotivos,
            motivos,
            explicacion: presentacion?.explicacion,
          } satisfies DatosDialogoAccion,
        }).afterClosed()
      );
      if (!solicitud) return;

      const ok = await this.facade.ejecutarAccion(
        cuenta.codigo, accion, solicitud, this.auditor);
      if (ok) void this.lineas.recargarTrasCambioDeEstado(cuenta.codigo);

      this.snackBar.open(
        ok ? `${etiqueta}: hecho`
           : (this.facade.errorComando() ?? 'No se pudo ejecutar la acción'),
        'Cerrar',
        { duration: ok ? 3000 : 8000 });
    } finally {
      this.accionEnMarcha = false;
    }
  }

  /**
   * Si hay un `ejecutar()` en marcha. Entre el clic y el diálogo se esperan los motivos del
   * catálogo por HTTP, y en ese rato el modal todavía no protege del segundo clic: un doble clic
   * en «Pasar a Modificación» de una finalizada pedía los motivos dos veces y apilaba dos
   * diálogos de desfinalizar, y el de debajo lanzaba otra orden que OHI ya no admitía. Vale
   * también para lo que se lanza desde la tira (anular pide motivos igual).
   */
  private accionEnMarcha = false;

  /**
   * Qué es la cuenta, para acotar los motivos.
   *
   * <p>Se deduce del código: las cuentas médicas llevan el prefijo y las
   * reservas y autorizaciones no. Es una heurística, y por eso ante la duda no
   * se filtra: ofrecer de más es recuperable —el sistema de registro rechaza—
   * y ofrecer de menos esconde el motivo que hacía falta.
   */
  private ambitoDe(cuenta: CuentaMedicaModel): string | undefined {
    return cuenta.codigo.startsWith('CM-') ? 'CUENTA_MEDICA' : undefined;
  }

  /** Vuelve al buscador de cuentas (índice de auditoría). */
  irAlInicio(): void {
    void this.router.navigate(['/auditoria']);
  }

  /**
   * Etiqueta legible para cada acción publicada por el sistema de registro. La del envío es la
   * del botón en el estado de la cuenta (BTN-13).
   */
  etiquetaAccion(accion: string): string {
    const etiquetas: Record<string, string> = {
      ENVIAR:                         rotuloDelEnvio(this.facade.cuenta()?.estado),
      SEGUIR_PROCESO:                 'Seguir proceso',
      RESOLVER_PENDIENTE:             'Resolver pendientes',
      RESOLVER_PENDIENTE_LINEA:       'Resolver pendientes de línea',
      DEVOLVER_A_MODIFICACION:        'Devolver a modificación',
      DEVOLVER_A_BENEFICIOS_MANUALES: 'Devolver a beneficios manuales',
      DEVOLVER_A_TARIFACION_MANUAL:   'Devolver a tarifación manual',
      REVERTIR_FINALIZACION:          'Revertir finalización',
      DESBLOQUEAR_LINEAS:             'Desbloquear líneas',
      DESHACER_REEMPLAZOS:            'Deshacer reemplazos',
      ANULAR:                         'Anular'
    };
    return etiquetas[accion] ?? accion;

  }

  /**
   * Lo mínimo para identificar la factura sin abrir el acordeón: NIT y número.
   * Se muestra en la cabecera del panel.
   */
  resumenPrestador(factura: InformacionFacturacionModel): string {
    const partes = [
      factura.prestadorFacturacionNit ? `NIT ${factura.prestadorFacturacionNit}` : null,
      factura.numeroFactura           ? `Factura ${factura.numeroFactura}`       : null,
      factura.numeroRadicado          ? `Radicado ${factura.numeroRadicado}`     : null
    ].filter(Boolean);

    return partes.length > 0 ? partes.join(' · ') : 'Sin datos de facturación';
  }

  /**
   * Los cuatro totales de la franja de resumen y de la barra, de su única fuente cada uno: el
   * convenido y el autorizado van en la raíz de la cabecera; el cargado y el glosado, en la ficha
   * de facturación, que puede no venir. `null` es «OHI no lo trae» y se pinta «—», no un cero.
   */
  totalesDe(cuenta: CuentaMedicaModel): TotalesCuenta {
    const factura: InformacionFacturacionModel | null = cuenta.informacionFacturacion ?? null;
    return {
      cargado:    factura?.totalCargado ?? null,
      convenido:  cuenta.totalConvenido ?? null,
      autorizado: cuenta.totalAutorizado ?? null,
      glosado:    factura?.totalValorGlosado ?? null,
    };
  }

  /**
   * Abre el diálogo de envío. Sin puerta (BTN-13.4): nada lo frena aquí. Lo que antes apagaba
   * el botón se avisa dentro del diálogo, y lo que OHI no deja lo rechaza el servicio. El
   * diálogo es modal: mientras está abierto no hay segundo clic.
   */
  abrirDialogoEnviar(cuenta: CuentaMedicaModel): void {
    const rotulo = rotuloDelEnvio(cuenta.estado);
    const origen = document.activeElement;
    const dialogRef = this.dialog.open(EnviarCuentaDialogComponent, {
      width: '400px',
      data: { codigoCuenta: cuenta.codigo, rotulo }
    });

    dialogRef.afterClosed().subscribe(resultado => {
      // Con éxito y finalizada, el botón se va (BTN-13.5); también si un rechazo trajo, releída,
      // una cuenta que otro finalizó mientras el diálogo seguía abierto.
      this.seguirElFoco(origen);
      if (resultado) {
        this.snackBar.open(rotulo === 'Aceptar' ? 'Cuenta aceptada correctamente' : 'Cuenta enviada correctamente',
                           'Cerrar', { duration: 3000 });
        // La cuenta y sus acciones las recarga la fachada al enviar; las líneas, aquí: el envío
        // mueve la cuenta de estado y con él su versión.
        void this.lineas.recargarTrasCambioDeEstado(cuenta.codigo);
      }
    });
  }

  // ── Preferencia de los acordeones ─────────────────────────────────────────
  // localStorage puede no estar disponible (modo privado, políticas del
  // navegador): si falla, se cae al valor por omisión y la vista sigue igual.

  private preferencia(panel: 'cuenta' | 'prestador' | 'novedades', porOmision: boolean): boolean {
    try {
      const guardado = localStorage.getItem(CLAVE_PANELES);
      if (!guardado) return porOmision;
      const estado = JSON.parse(guardado) as Partial<Record<string, boolean>>;
      return typeof estado[panel] === 'boolean' ? estado[panel] : porOmision;
    } catch {
      return porOmision;
    }
  }

  private guardarPreferencias(
      estado: { cuenta: boolean; prestador: boolean; novedades: boolean }): void {
    try {
      localStorage.setItem(CLAVE_PANELES, JSON.stringify(estado));
    } catch {
      // Sin persistencia: no es crítico, la vista funciona igual.
    }
  }
}
