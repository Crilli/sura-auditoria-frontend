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
    MatExpansionModule
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

  constructor() {
    effect(() => this.guardarPreferencias({
      cuenta:    this.panelCuentaAbierto(),
      prestador: this.panelPrestadorAbierto()
    }));
  }

  ngOnInit(): void {
    this.facade.buscar(this.codigo);
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

  private preferencia(panel: 'cuenta' | 'prestador', porOmision: boolean): boolean {
    try {
      const guardado = localStorage.getItem(CLAVE_PANELES);
      if (!guardado) return porOmision;
      const estado = JSON.parse(guardado) as Partial<Record<string, boolean>>;
      return typeof estado[panel] === 'boolean' ? estado[panel] : porOmision;
    } catch {
      return porOmision;
    }
  }

  private guardarPreferencias(estado: { cuenta: boolean; prestador: boolean }): void {
    try {
      localStorage.setItem(CLAVE_PANELES, JSON.stringify(estado));
    } catch {
      // Sin persistencia: no es crítico, la vista funciona igual.
    }
  }
}
