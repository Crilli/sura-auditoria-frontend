import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CuentaRepository } from '../../domain/ports/cuenta.repository';
import { EstadoEnOhiPipe, TextoEstadoPipe } from '../compartido/estado-cuenta.pipe';
import { HitoModel } from '../../domain/models/cuenta-medica.model';

/** Lo que hay que saber para abrir el diálogo. */
export interface HistoriaCuentaDialogData {
  codigoCuenta: string;
}

/**
 * Por dónde ha pasado la cuenta, en un diálogo.
 *
 * **No es la pestaña «Seguimiento»**, que está en la misma pantalla y responde otra pregunta:
 * aquélla dice si el envío asíncrono terminó, ésta por dónde ha pasado la cuenta desde que
 * llegó.
 *
 * ## Por qué un diálogo y no un panel en la página
 * Porque es una consulta puntual, no algo que se mire mientras se trabaja: el auditor la abre
 * para responder «¿quién la desfinalizó y cuándo?» y la cierra. Un panel plegado en la
 * cabecera ocupaba sitio permanente sobre lo que sí se usa a diario —las pestañas de líneas y
 * pendientes— para algo que casi nunca se abre.
 *
 * ## La consulta se hace aquí y no en la pantalla
 * El diálogo nace al pulsarlo, así que preguntar al abrirse es exactamente «solo si se pide».
 * No hay que acordarse de no cargarlo con la pantalla.
 */
@Component({
  selector: 'sura-historia-cuenta-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, MatDialogModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatTooltipModule, TextoEstadoPipe, EstadoEnOhiPipe,
  ],
  templateUrl: './historia-cuenta-dialog.component.html',
  styleUrls: ['./historia-cuenta-dialog.component.scss'],
})
export class HistoriaCuentaDialogComponent {

  readonly dialogRef = inject(MatDialogRef<HistoriaCuentaDialogComponent>);
  readonly datos = inject<HistoriaCuentaDialogData>(MAT_DIALOG_DATA);

  private readonly cuentas = inject(CuentaRepository);

  readonly hitos = signal<HitoModel[]>([]);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);

  constructor() {
    this.consultar();
  }

  /** Se expone para poder reintentar: un fallo de red no debe dejar el diálogo mudo. */
  consultar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.cuentas.consultarHistoria(this.datos.codigoCuenta).subscribe({
      next: h => { this.hitos.set(h); this.cargando.set(false); },
      error: (e: Error) => {
        this.error.set(e.message ?? 'No se pudo consultar la historia de la cuenta.');
        this.cargando.set(false);
      },
    });
  }
}
