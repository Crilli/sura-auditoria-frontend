import { Component, Input, inject, effect, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CuentaFacade } from '../../application/facades/cuenta.facade';
import { DialogoAccionComponent, DatosDialogoAccion } from './dialogo-accion.component';
import { firstValueFrom } from 'rxjs';
import { SeccionNovedadesComponent } from '../linea-edicion/secciones/seccion-novedades.component';
import { resumenNovedades } from '../linea-edicion/resumenes-seccion';
import { environment } from '@sura/environments';
import { EnviarCuentaDialogComponent } from '../enviar-cuenta-dialog/enviar-cuenta-dialog.component';
import { CuentaMedicaModel, InformacionFacturacionModel } from '../../domain/models/cuenta-medica.model';

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
    SeccionNovedadesComponent
  ],
  templateUrl: './cuenta-detalle.component.html',
  styleUrls: ['./cuenta-detalle.component.scss']
})
export class CuentaDetalleComponent implements OnInit {
  
  @Input({ required: true }) codigo!: string;
  
  readonly facade = inject(CuentaFacade);
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
  }

  ngOnInit(): void {
    this.facade.buscar(this.codigo);
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
      case 'ENVIAR':                   return 'Se envía desde el menú de la cuenta';
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

  /**
   * La autoridad sobre qué se puede hacer es el sistema de registro: si publicó
   * ENVIAR, la cuenta admite el envío. El conteo de pendientes se usa solo para
   * anticipar el rechazo y explicar por qué no conviene enviar todavía.
   *
   * <p>Las acciones llegan en su propia petición, más lenta que la cabecera:
   * mientras `facade.accionesCargando()` sea true no se sabe todavía, y el menú
   * mantiene el botón deshabilitado.
   */
  puedeEnviar(cuenta: CuentaMedicaModel): boolean {
    return this.facade.permite('ENVIAR')
        && cuenta.pendientesSinResolver === 0;
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
