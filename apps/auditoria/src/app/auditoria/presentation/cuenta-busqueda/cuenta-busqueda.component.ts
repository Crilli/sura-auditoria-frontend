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
 */
@Component({
  selector: 'sura-cuenta-busqueda',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatCardModule, MatTooltipModule, MatDialogModule,
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

  /** Las cuentas con las versiones desplegadas. Por código, para que sobreviva al repintar. */
  readonly desplegadas = signal<Set<string>>(new Set());

  /** Se intentó buscar sin criterio: se dice aquí, antes de salir, y no con un 400. */
  readonly faltaCriterio = signal(false);

  buscar(): void {
    const { factura, radicado } = this.formulario.getRawValue();
    if (!factura?.trim() && !radicado?.trim()) {
      this.faltaCriterio.set(true);
      return;
    }
    this.faltaCriterio.set(false);
    this.desplegadas.set(new Set());
    this.busqueda.buscar({ factura, radicado });
  }

  limpiar(): void {
    this.formulario.reset({ factura: '', radicado: '' });
    this.faltaCriterio.set(false);
    this.desplegadas.set(new Set());
    this.busqueda.limpiar();
  }

  abrir(cuenta: ResumenCuentaModel): void {
    void this.router.navigate(['/auditoria', cuenta.codigo]);
  }

  alternarVersiones(codigo: string, evento: Event): void {
    // Sin esto, desplegar las versiones también abriría la cuenta: el clic llega a la fila.
    evento.stopPropagation();
    this.desplegadas.update(actual => {
      const copia = new Set(actual);
      if (copia.has(codigo)) copia.delete(codigo); else copia.add(codigo);
      return copia;
    });
  }

  estaDesplegada(codigo: string): boolean {
    return this.desplegadas().has(codigo);
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
