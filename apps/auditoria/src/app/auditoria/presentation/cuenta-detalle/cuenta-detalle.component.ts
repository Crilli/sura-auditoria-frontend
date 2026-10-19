import {
  Component, Input, inject, effect, signal, OnInit, ChangeDetectionStrategy, computed, ElementRef, viewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule, MatExpansionPanelHeader } from '@angular/material/expansion';
import { HistoriaCuentaDialogComponent }
  from '../historia-cuenta-dialog/historia-cuenta-dialog.component';
import { VersionCuentaDialogComponent }
  from '../version-cuenta-dialog/version-cuenta-dialog.component';
import { CuentaRepository } from '../../domain/ports/cuenta.repository';
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
import { CuentaMedicaModel, InformacionFacturacionModel } from '../../domain/models/cuenta-medica.model';
import { EstadoEnOhiPipe, TextoEstadoPipe } from '../compartido/estado-cuenta.pipe';

/** Clave en localStorage para recordar qué bloques de la cabecera deja abiertos el auditor. */
const CLAVE_PANELES = 'auditoria.cuenta-detalle.paneles';

@Component({
  selector: 'sura-cuenta-detalle',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, RouterModule, MatTabsModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
    MatMenuModule, MatDialogModule, MatSnackBarModule, MatTooltipModule,
    MatExpansionModule,
    SeccionNovedadesComponent, TextoEstadoPipe, EstadoEnOhiPipe,
  ],
  templateUrl: './cuenta-detalle.component.html',
  styleUrls: ['./cuenta-detalle.component.scss']
})
export class CuentaDetalleComponent implements OnInit {
  
  @Input({ required: true }) codigo!: string;

  /**
   * Abre la historia de la cuenta en un diálogo.
   *
   * El diálogo consulta al nacer, así que la petición se hace exactamente cuando el auditor
   * la pide. Antes esto era un panel plegado en la cabecera: ocupaba sitio permanente sobre
   * lo que sí se usa a diario para algo que casi nunca se abre.
   */
  // ── Versión vigente (BTN-04) ─────────────────────────────────────────────
  //
  // En su propia petición, en paralelo con la cabecera —igual que las acciones—: el histórico
  // de lo transmitido no debe retrasar que se pinte la cuenta.

  private readonly cuentasRepo = inject(CuentaRepository);
  readonly versiones = signal<VersionCuentaModel[]>([]);
  private versionesDe: string | null = null;

  /** La de mayor número sin reversión: el servicio ya las manda de la más reciente a la más antigua. */
  readonly versionVigente = computed(() => this.versiones()[0] ?? null);

  private cargarVersiones(codigo: string): void {
    if (this.versionesDe === codigo) return;
    this.versionesDe = codigo;
    this.versiones.set([]);
    // Sin versiones no es un error —la cuenta aún no se transmitió— y un fallo aquí no debe
    // tumbar la cabecera: el dato es accesorio y la pantalla sigue siendo útil sin él.
    this.cuentasRepo.consultarVersiones(codigo).subscribe({
      next: v => this.versiones.set(v),
      error: () => this.versiones.set([]),
    });
  }

  abrirVersionVigente(cuenta: CuentaMedicaModel): void {
    const vigente = this.versionVigente();
    if (!vigente) return;
    this.dialog.open(VersionCuentaDialogComponent, {
      data: { codigoCuenta: cuenta.codigo, numero: vigente.numero },
      autoFocus: false, width: '40rem', maxWidth: '95vw',
    });
  }

  abrirHistoria(cuenta: CuentaMedicaModel): void {
    this.dialog.open(HistoriaCuentaDialogComponent, {
      data: { codigoCuenta: cuenta.codigo },
      autoFocus: false,
      width: '48rem',
      maxWidth: '95vw',
    });
  }

  
  readonly facade = inject(CuentaFacade);

  /**
   * Solo para el contador del rótulo. El total lo conoce quien pagina las líneas, y llega
   * en `null` cuando el filtro obliga a descartar en el servicio: en ese caso el rótulo va
   * sin paréntesis, que es preferible a enseñar un número que no corresponde a lo que el
   * auditor va a poder ver.
   */
  private readonly lineas = inject(LineaFacade);
  readonly totalLineas = this.lineas.totalLineas;
  private readonly router = inject(Router);
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
   * el no reconocido: arriba del todo sería repetir lo que está justo debajo.
   *
   * Sin `IntersectionObserver` se queda en `false`: la barra sigue fija y operativa, y lo único
   * que se pierde es ese resumen, que es un añadido.
   */
  readonly resumenFueraDeVista = signal(false);

  /**
   * Por qué no se puede enviar, o `null` si se puede. El mismo texto va junto al botón y dentro
   * del menú: un botón apagado sin explicación invita a buscar el fallo donde no está.
   *
   * La autoridad sobre qué se puede hacer es el sistema de registro: si publicó ENVIAR, la
   * cuenta admite el envío. El conteo de pendientes se usa solo para anticipar el rechazo y
   * explicar por qué no conviene enviar todavía. Las acciones llegan en su propia petición, más
   * lenta que la cabecera: mientras se consultan todavía no se sabe.
   */
  motivoParaNoEnviar(cuenta: CuentaMedicaModel): string | null {
    if (this.facade.accionesCargando()) return 'Consultando qué acciones están habilitadas…';
    if (cuenta.pendientesSinResolver > 0) return 'Resuelva todos los pendientes para enviar.';
    // Después de la carga: durante una recarga tras el fallo, `error()` sigue con valor.
    if (this.facade.accionesError()) {
      return 'No se pudo consultar si el sistema de registro habilita el envío.';
    }
    if (!this.facade.permite('ENVIAR')) {
      return 'El sistema de registro no habilita el envío en el estado actual de la cuenta.';
    }
    return null;
  }

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
   * Ofrecerlas aquí como un botón más llevaría a una pantalla a medias.
   */
  private static readonly TIENEN_SU_PROPIO_CAMINO = new Set([
    'ENVIAR', 'SEGUIR_PROCESO', 'RESOLVER_PENDIENTE', 'RESOLVER_PENDIENTE_LINEA',
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

  /** A dónde lleva una acción que no se ejecuta desde aquí. */
  aDondeLleva(accion: string): string {
    switch (accion) {
      case 'ENVIAR':                   return 'Se envía con el botón «Enviar» de la barra superior';
      case 'SEGUIR_PROCESO':           return 'Se consulta en la pestaña Seguimiento';
      case 'RESOLVER_PENDIENTE':
      case 'RESOLVER_PENDIENTE_LINEA': return 'Se resuelven en la pestaña Pendientes';
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
   */
  async ejecutar(cuenta: CuentaMedicaModel, accion: string): Promise<void> {
    const pideMotivos = CuentaDetalleComponent.PIDEN_MOTIVOS.has(accion);

    // Solo los que aplican a este tipo de proceso: hay seis que son de cuenta
    // médica y cuatro de autorización, y ofrecerlos todos invita a un rechazo.
    const motivos = pideMotivos
      ? await firstValueFrom(this.facade.motivos(this.ambitoDe(cuenta))).catch(() => [])
      : [];

    const solicitud = await firstValueFrom(
      this.dialog.open(DialogoAccionComponent, {
        width: '560px',
        data: {
          accion,
          etiqueta: this.etiquetaAccion(accion),
          codigoCuenta: cuenta.codigo,
          irreversible: this.esIrreversible(accion),
          pideMotivos,
          motivos,
        } satisfies DatosDialogoAccion,
      }).afterClosed()
    );
    if (!solicitud) return;

    const ok = await this.facade.ejecutarAccion(
      cuenta.codigo, accion, solicitud, this.auditor);

    this.snackBar.open(
      ok ? `${this.etiquetaAccion(accion)}: hecho`
         : (this.facade.errorComando() ?? 'No se pudo ejecutar la acción'),
      'Cerrar',
      { duration: ok ? 3000 : 8000 });
  }

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

  /** Etiqueta legible para cada acción publicada por el sistema de registro. */
  etiquetaAccion(accion: string): string {
    const etiquetas: Record<string, string> = {
      ENVIAR:                         'Enviar',
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

  /** Diferencia entre lo autorizado y lo cubierto: lo que la cuenta no reconoce. */
  diferencia(cuenta: CuentaMedicaModel): number {
    return cuenta.totalAutorizado - cuenta.totalCubierto;
  }

  abrirDialogoEnviar(cuenta: CuentaMedicaModel): void {
    // El botón apagado sigue recibiendo clics (`disabledInteractive`, para que el teclado y el
    // lector de pantalla lleguen a su motivo): la puerta está aquí.
    if (this.motivoParaNoEnviar(cuenta)) return;
    const dialogRef = this.dialog.open(EnviarCuentaDialogComponent, {
      width: '400px',
      data: { codigoCuenta: cuenta.codigo }
    });

    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado) {
        this.snackBar.open('Cuenta enviada correctamente', 'Cerrar', { duration: 3000 });
        // rxResource (cuenta) se recarga automáticamente desde el facade al enviar.
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
