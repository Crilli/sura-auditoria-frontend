import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EnviarCuentaRequest } from '../../domain/models/cuenta-medica.model';
import { CuentaFacade } from '../../application/facades/cuenta.facade';

export interface DialogData {
  codigoCuenta: string;
}

@Component({
  selector: 'sura-enviar-cuenta-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatButtonModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatProgressSpinnerModule
  ],
  template: `
    <h2 mat-dialog-title>Enviar Cuenta {{ data.codigoCuenta }}</h2>
    <mat-dialog-content>
      <p>Seleccione la decisión para enviar la cuenta al sistema principal.</p>

      @if (facade.errorComando()) {
        <div class="error-banner">
          {{ facade.errorComando() }}
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
      <button mat-raised-button color="primary" (click)="enviar()" 
              [disabled]="form.invalid || enviando()">
        @if (enviando()) {
          <mat-spinner diameter="20"></mat-spinner>
        } @else {
          Enviar
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
  `]
})
export class EnviarCuentaDialogComponent {

  readonly dialogRef = inject(MatDialogRef<EnviarCuentaDialogComponent>);
  readonly data = inject<DialogData>(MAT_DIALOG_DATA);
  readonly facade = inject(CuentaFacade);
  private readonly fb = inject(FormBuilder);

  // Auditor simulado
  private readonly auditor = 'auditor@sura.com.co';

  readonly enviando = signal<boolean>(false);

  form: FormGroup = this.fb.group({
    decision:      ['', [Validators.required]],
    codigoNovedad: ['']
  });

  async enviar(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    const { decision, codigoNovedad } = this.form.value;
    
    const request: EnviarCuentaRequest = {
      decision,
      codigoNovedad: codigoNovedad || undefined
    };

    const ok = await this.facade.enviar(this.data.codigoCuenta, request, this.auditor);
    this.enviando.set(false);
    
    if (ok) {
      this.dialogRef.close(true);
    }
  }
}
