import { Component, inject, ChangeDetectionStrategy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule }     from '@angular/material/input';
import { MatButtonModule }    from '@angular/material/button';
import { MatIconModule }      from '@angular/material/icon';
import { MatCardModule }      from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CuentaFacade } from '../../application/facades/cuenta.facade';

@Component({
  selector: 'sura-cuenta-busqueda',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatProgressSpinnerModule, MatCardModule
  ],
  templateUrl: './cuenta-busqueda.component.html',
  styleUrls: ['./cuenta-busqueda.component.scss']
})
export class CuentaBusquedaComponent {

  private readonly router = inject(Router);
  readonly facade = inject(CuentaFacade);

  constructor() {
    // Descarta la cuenta de la visita anterior antes de que el efecto de abajo
    // pueda reaccionar a ella: sin esto, entrar aquí desde el detalle de una
    // cuenta rebotaba de inmediato de vuelta a esa misma cuenta.
    this.facade.limpiar();

    effect(() => {
      const cuenta = this.facade.cuenta();
      if (cuenta) {
        this.router.navigate(['/auditoria', cuenta.codigo]);
      }
    });
  }

  readonly codigoCtrl = new FormControl<string>('', [Validators.required]);

  buscar(): void {
    if (this.codigoCtrl.invalid) { this.codigoCtrl.markAsTouched(); return; }
    this.facade.buscar(this.codigoCtrl.value!);
  }
}
