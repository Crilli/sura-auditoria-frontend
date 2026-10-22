import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule }     from '@angular/material/input';
import { MatButtonModule }    from '@angular/material/button';
import { MatIconModule }      from '@angular/material/icon';
import { MatCardModule }      from '@angular/material/card';
import { MatTooltipModule }   from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { VersionCuentaDialogComponent }
  from '../version-cuenta-dialog/version-cuenta-dialog.component';
import { BusquedaFacade } from '../../application/facades/busqueda.facade';
import { ResumenCuentaModel } from '../../domain/models/cuenta-medica.model';
import {
  VersionEnCursoModel, estadoEnOhi, laUltimaEsLaVigente, rotuloDeLaUltimaVersion, versionEnCurso
} from '../../domain/models/estado-cuenta.model';
import { EstadoEnOhiPipe, TextoEstadoPipe } from '../compartido/estado-cuenta.pipe';

/**
 * El buscador de facturas: la pantalla principal.
 *
 * ## Lo que cambió, y por qué
 * Antes esta pantalla pedía el código exacto de la cuenta y **saltaba directamente al
 * detalle**. Servía a quien ya se sabía el radicado de memoria, que es justo quien menos lo
 * necesita. El documento pide lo contrario: buscar por lo que el auditor tiene en la mano —la
 * factura, o el principio del radicado— y **ver los resultados**, porque una misma factura
 * puede estar radicada varias veces y saltar a la primera escondería las demás.
 *
 * ## Las versiones van debajo de cada cuenta
 * Se despliegan en la misma fila porque es la pregunta normal —«¿en qué versión va esta
 * cuenta?»— y el servicio ya las manda en la misma respuesta: no cuesta ninguna llamada.
 *
 * ## La versión en curso, arriba
 * El histórico solo guarda una versión cuando la cuenta se finaliza. Una cuenta reabierta
 * —en adjudicación manual, por ejemplo— está trabajando una versión que todavía no está en
 * él, y la lista enseñaba arriba la última finalizada rotulada «vigente»: la cuenta decía
 * «adjudicación manual» y su versión «vigente» decía «finalizado». Ahora la abierta va
 * primero, con el estado de la cuenta, y la de debajo se llama por lo que es: la última que
 * se finalizó. Desde cuándo y por qué se reabrió salen de su historia, que se pide al
 * desplegar (ver `BusquedaFacade.cargarHistoria`).
 */
@Component({
  selector: 'sura-cuenta-busqueda',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatCardModule, MatTooltipModule, MatDialogModule,
    TextoEstadoPipe, EstadoEnOhiPipe,
  ],
  templateUrl: './cuenta-busqueda.component.html',
  styleUrls: ['./cuenta-busqueda.component.scss']
})
export class CuentaBusquedaComponent {

  private readonly router = inject(Router);
  private readonly dialogo = inject(MatDialog);
  readonly busqueda = inject(BusquedaFacade);

  /** Precargado con la búsqueda anterior: volver del detalle encuentra la lista donde estaba. */
  readonly formulario = new FormGroup({
    factura:  new FormControl<string>(this.busqueda.filtro().factura ?? ''),
    radicado: new FormControl<string>(this.busqueda.filtro().radicado ?? ''),
  });

  constructor() {
    // Cada vez que se enseña, y no solo la primera: al volver del detalle la cuenta puede
    // haberse enviado o devuelto, y la búsqueda que se conservó es de antes.
    this.busqueda.refrescar();
  }

  /** Se intentó buscar sin criterio: se dice aquí, antes de salir, y no con un 400. */
  readonly faltaCriterio = signal(false);

  /**
   * Sobre qué estado está el puntero, si está sobre alguno.
   *
   * El estado lleva su propia ayuda («En OHI: Pendiente») dentro de una fila que ya tiene
   * la suya («Abrir…»). Sin apagar la de la fila mientras tanto, salían las dos a la vez.
   */
  readonly ayudaInterior = signal<string | null>(null);

  /**
   * El puntero entra en un estado. Solo apaga la ayuda de la fila si el estado trae la suya:
   * uno sin ayuda («Inicial», un estado desconocido) dejaba la fila muda hasta volver a entrar.
   */
  entrarEnEstado(clave: string, estado: string | null): void {
    if (estadoEnOhi(estado)) this.ayudaInterior.set(clave);
  }

  /**
   * Si un Enter es de la fila y no de algo de dentro. Las filas escuchan `keydown.enter`:
   * con `keyup.enter`, el Enter del botón de desplegar subía hasta la fila y abría la cuenta en
   * vez de enseñar sus versiones, y el Enter que cierra la foto de una versión —el foco vuelve a
   * la fila al cerrarse— la volvía a abrir. Mantener Enter pulsado tampoco repite.
   */
  esEnterDeLaFila(evento: Event): boolean {
    const tecla = evento as KeyboardEvent;
    if (tecla.target !== tecla.currentTarget || tecla.repeat) return false;
    tecla.preventDefault();
    return true;
  }

  buscar(): void {
    const { factura, radicado } = this.formulario.getRawValue();
    if (!factura?.trim() && !radicado?.trim()) {
      this.faltaCriterio.set(true);
      return;
    }
    this.faltaCriterio.set(false);
    this.busqueda.buscar({ factura, radicado });
  }

  limpiar(): void {
    this.formulario.reset({ factura: '', radicado: '' });
    this.faltaCriterio.set(false);
    this.busqueda.limpiar();
  }

  abrir(cuenta: ResumenCuentaModel): void {
    void this.router.navigate(['/auditoria', cuenta.codigo]);
  }

  alternarVersiones(cuenta: ResumenCuentaModel, evento: Event): void {
    // Sin esto, desplegar las versiones también abriría la cuenta: el clic llega a la fila.
    evento.stopPropagation();
    this.busqueda.alternarVersiones(cuenta);
  }

  estaDesplegada(codigo: string): boolean {
    return this.busqueda.estaDesplegada(codigo);
  }

  /** La versión abierta de la cuenta, si la tiene: va encima de las del histórico. */
  enCurso(cuenta: ResumenCuentaModel): VersionEnCursoModel | null {
    return versionEnCurso(cuenta, this.busqueda.historiaDe(cuenta.codigo));
  }

  /** «vigente» o «última finalizada», según la cuenta siga cerrada o se haya reabierto. */
  rotuloDeLaUltima(cuenta: ResumenCuentaModel): string {
    return rotuloDeLaUltimaVersion(cuenta.estado);
  }

  /** El mismo criterio que el rótulo, para que el estilo no diga «vigente» donde el texto no. */
  laUltimaEsLaVigente(cuenta: ResumenCuentaModel): boolean {
    return laUltimaEsLaVigente(cuenta.estado);
  }

  /**
   * Abre una versión concreta: su foto, no la cuenta viva.
   *
   * Va en un diálogo y no navegando, porque la pregunta es «¿cómo estaba en la V2?» y la
   * respuesta se mira y se cierra; navegar sacaría al auditor de la lista que está revisando.
   */
  abrirVersion(codigo: string, numero: number, evento: Event): void {
    evento.stopPropagation();
    this.dialogo.open(VersionCuentaDialogComponent, {
      data: { codigoCuenta: codigo, numero },
      autoFocus: false, width: '40rem', maxWidth: '95vw',
    });
  }

  paginaAnterior(): void { this.busqueda.irAPagina(this.busqueda.pagina() - 1); }
  paginaSiguiente(): void { this.busqueda.irAPagina(this.busqueda.pagina() + 1); }
}
