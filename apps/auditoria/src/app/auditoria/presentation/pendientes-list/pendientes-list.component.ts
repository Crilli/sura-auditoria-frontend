import {
  Component, OnInit, Input, inject, signal,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { PendienteFacade } from '../../application/facades/pendiente.facade';
import { MotivoPendienteModel, AlcanceResolucion, ETIQUETA_NIVEL, NivelPendiente } from '../../domain/models/motivo-pendiente.model';

@Component({
  selector: 'sura-pendientes-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, ReactiveFormsModule, MatTableModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
    MatChipsModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatCardModule
  ],
  templateUrl: './pendientes-list.component.html',
  styleUrls: ['./pendientes-list.component.scss']
})
export class PendientesListComponent implements OnInit {

  /** El parámetro de la ruta padre se llama `codigo`; el alias hace el enlace. */
  @Input({ required: true, alias: 'codigo' }) codigoCuenta!: string;

  private readonly fb = inject(FormBuilder);
  readonly facade = inject(PendienteFacade);

  readonly displayedColumns = ['codigo', 'descripcion', 'nivel', 'estado', 'acciones'];
  
  readonly pendienteSeleccionado = signal<MotivoPendienteModel | null>(null);
  readonly resolving = signal<boolean>(false);
  
  // Auditor simulado
  private readonly auditor = 'auditor@sura.com.co';

  form: FormGroup = this.fb.group({
    justificacion: ['', [Validators.required, Validators.maxLength(2000)]],
    alcance:       ['CUENTA_Y_LINEAS', [Validators.required]]
  });

  ngOnInit(): void {
    this.facade.cargarPendientes(this.codigoCuenta);
  }

  seleccionarParaResolver(pendiente: MotivoPendienteModel): void {
    this.pendienteSeleccionado.set(pendiente);
    this.form.reset({ alcance: 'CUENTA_Y_LINEAS' });
  }

  cancelarResolucion(): void {
    this.pendienteSeleccionado.set(null);
  }

  async resolver(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const pendiente = this.pendienteSeleccionado();
    if (!pendiente) return;

    this.resolving.set(true);
    
    const { justificacion, alcance } = this.form.value;
    
    const ok = await this.facade.resolver(
      this.codigoCuenta, 
      pendiente.identificador, 
      { justificacion, alcance: alcance as AlcanceResolucion }, 
      this.auditor
    );

    this.resolving.set(false);
    if (ok) {
      this.pendienteSeleccionado.set(null);
    }
  }

  /**
   * Nombre legible del nivel. El servicio manda el enum del dominio
   * (`CABECERA` / `LINEA`); pintarlo tal cual deja al auditor leyendo
   * mayúsculas sueltas.
   */
  etiquetaNivel(nivel: NivelPendiente): string {
    return ETIQUETA_NIVEL[nivel] ?? nivel;
  }
}
