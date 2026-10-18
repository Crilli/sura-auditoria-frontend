import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CuentaRepository } from '../../domain/ports/cuenta.repository';
import { FotoVersionModel } from '../../domain/models/cuenta-medica.model';

export interface VersionCuentaDialogData {
  codigoCuenta: string;
  numero: number;
}

/**
 * Una versión de la cuenta, tal como quedó al transmitirse.
 *
 * ## Una foto, y se dice
 * Lo que enseña este diálogo **no es la cuenta viva**: son los importes de cuando se transmitió
 * esa versión, y pueden no parecerse a los de hoy —medido: la factura de CM-57944424433 pasó de
 * 4,0 a 8,8 millones entre la V1 y la V3—. Por eso el aviso va arriba y no en letra pequeña:
 * tomar por actual un importe de hace semanas es el error que este diálogo tiene que impedir.
 */
@Component({
  selector: 'sura-version-cuenta-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule,
            MatProgressSpinnerModule],
  templateUrl: './version-cuenta-dialog.component.html',
  styleUrls: ['./version-cuenta-dialog.component.scss'],
})
export class VersionCuentaDialogComponent {

  readonly datos = inject<VersionCuentaDialogData>(MAT_DIALOG_DATA);
  private readonly cuentas = inject(CuentaRepository);

  readonly foto = signal<FotoVersionModel | null>(null);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);

  constructor() {
    this.consultar();
  }

  consultar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.cuentas.consultarVersion(this.datos.codigoCuenta, this.datos.numero).subscribe({
      next: f => { this.foto.set(f); this.cargando.set(false); },
      error: (e: Error) => {
        this.error.set(e.message ?? 'No se pudo consultar la versión.');
        this.cargando.set(false);
      },
    });
  }
}
