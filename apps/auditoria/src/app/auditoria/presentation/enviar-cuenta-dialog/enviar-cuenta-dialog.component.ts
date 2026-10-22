import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { environment } from '@sura/environments';
import { EnviarCuentaRequest } from '../../domain/models/cuenta-medica.model';
import { CuentaFacade } from '../../application/facades/cuenta.facade';

export interface DialogData {
  codigoCuenta: string;
  /**
   * Cómo se llama el envío en el estado de la cuenta: «Aceptar» en adjudicación manual,
   * «Enviar» en el resto (BTN-13). Llega de la barra para que el diálogo diga lo mismo que el
   * botón que se pulsó; por debajo es el mismo POST.
   */
  rotulo: 'Aceptar' | 'Enviar';
}

/**
 * El envío de la cuenta, con su decisión.
 *
 * ## Avisa, no frena (decisión del 2026-10-21)
 * Hasta esa fecha el botón de la barra se apagaba con pendientes sin resolver, sin el envío
 * publicado por OHI o sin saber todavía qué publicaba. Ahora el botón está siempre disponible y
 * lo que lo apagaba se dice **aquí**, como aviso: el auditor decide con la información delante,
 * y si OHI no deja, el servicio lo rechaza y el motivo se lee en este mismo diálogo, que se
 * queda abierto (BTN-13.7).
 */
@Component({
  selector: 'sura-enviar-cuenta-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatButtonModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatProgressSpinnerModule, MatIconModule
  ],
  template: `
    <h2 mat-dialog-title id="titulo-envio">{{ data.rotulo }} la cuenta {{ data.codigoCuenta }}</h2>
    <mat-dialog-content>
      <p>Seleccione la decisión para enviar la cuenta al sistema principal.</p>

      @for (aviso of avisos(); track aviso) {
        <p class="sura-mensaje sura-mensaje--alerta aviso-envio" role="note">
          <mat-icon aria-hidden="true">info</mat-icon>
          <span>{{ aviso }}</span>
        </p>
      }

      @if (error()) {
        <div class="error-banner" role="alert" id="error-envio">
          {{ error() }}
        </div>
      }

      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="full-width mt-3">
          <mat-label>Decisión</mat-label>
          <mat-select formControlName="decision">
            <mat-option value="ACEPTAR">Aceptar (Aprobar)</mat-option>
            <mat-option value="DENEGAR">Denegar (Rechazar)</mat-option>
          </mat-select>
          @if (form.get('decision')?.hasError('required')) {
            <mat-error>La decisión es obligatoria</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Código de Novedad (Opcional)</mat-label>
          <input matInput formControlName="codigoNovedad" placeholder="Ej. NOV-001">
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close [disabled]="enviando()">Cancelar</button>
      <button mat-raised-button color="primary" id="btn-confirmar-envio" (click)="enviar()"
              [disabled]="form.invalid || enviando()">
        @if (enviando()) {
          <mat-spinner diameter="20"></mat-spinner>
        } @else {
          {{ data.rotulo }}
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width { width: 100%; }
    .mt-3 { margin-top: 1rem; }
    .error-banner {
      background-color: #ffebee;
      color: #c62828;
      padding: 0.75rem;
      border-radius: 4px;
      margin-bottom: 1rem;
    }
    .aviso-envio { margin: 0 0 0.5rem; font-size: 0.875rem; }
  `]
})
export class EnviarCuentaDialogComponent {

  readonly dialogRef = inject(MatDialogRef<EnviarCuentaDialogComponent>);
  readonly data = inject<DialogData>(MAT_DIALOG_DATA);
  readonly facade = inject(CuentaFacade);
  private readonly fb = inject(FormBuilder);

  /**
   * Quién firma el envío: el de la configuración, como en el resto de la aplicación. Aquí había
   * un `auditor@sura.com.co` a fuego, así que el envío quedaba firmado por otra identidad que
   * los guardados y las acciones de la misma pantalla.
   */
  private readonly auditor = environment.auditor;

  readonly enviando = signal<boolean>(false);

  /**
   * El rechazo de **este** diálogo (BTN-13.7), no el `errorComando()` de la fachada: esa señal es
   * de todos los comandos de la cuenta —pasar a Modificación, desbloquear, las novedades…— y
   * sobrevive al diálogo, así que leerla tal cual enseñaba al abrir, como alerta, el rechazo de
   * un intento anterior o el de otro comando.
   */
  readonly error = signal<string | null>(null);

  /**
   * Lo que antes apagaba el botón, dicho como aviso. Dos, y solo cuando se saben:
   * - pendientes sin resolver: si alguno frena la cuenta, el servicio rechazará el envío;
   * - el envío sin publicar por OHI, solo con la lista de acciones ya llegada y sin error.
   *   Mientras se consulta, o si la consulta falló, no se sabe, y no se afirma nada.
   */
  readonly avisos = computed<string[]>(() => {
    const avisos: string[] = [];
    const pendientes = this.facade.cuenta()?.pendientesSinResolver ?? 0;
    if (pendientes > 0) {
      avisos.push(pendientes === 1
        ? 'Queda 1 pendiente sin resolver: si frena la cuenta, el envío se rechazará.'
        : `Quedan ${pendientes} pendientes sin resolver: si alguno frena la cuenta, el envío se rechazará.`);
    }
    if (!this.facade.accionesCargando() && !this.facade.accionesError() && !this.facade.permite('ENVIAR')) {
      avisos.push('OHI no publica el envío en el estado actual; lo más probable es que lo rechace.');
    }
    return avisos;
  });

  form: FormGroup = this.fb.group({
    decision:      ['', [Validators.required]],
    codigoNovedad: ['']
  });

  async enviar(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.error.set(null);
    this.enviando.set(true);
    // Mientras viaja el envío, ni Escape ni un clic fuera cierran el diálogo: cerrado a medias,
    // el envío que acaba bien ya no tiene a quién avisar —ni el aviso de éxito ni la relectura
    // de las líneas— y la barra, que no se apaga nunca, dejaría lanzar un segundo envío con el
    // primero en vuelo. «Cancelar» ya se apaga; esto cierra las otras dos salidas.
    this.dialogRef.disableClose = true;
    const { decision, codigoNovedad } = this.form.value;

    const request: EnviarCuentaRequest = {
      decision,
      codigoNovedad: codigoNovedad || undefined
    };

    const ok = await this.facade.enviar(this.data.codigoCuenta, request, this.auditor);
    this.enviando.set(false);
    this.dialogRef.disableClose = false;

    if (ok) {
      this.dialogRef.close(true);
    } else {
      this.error.set(this.facade.errorComando() ?? 'No se pudo enviar la cuenta');
    }
  }
}
