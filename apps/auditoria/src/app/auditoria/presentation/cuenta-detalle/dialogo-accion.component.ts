import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { EjecutarAccionRequest, MotivoModel } from '../../domain/models/cuenta-medica.model';

/** Lo que el diálogo necesita saber para pedir lo justo. */
export interface DatosDialogoAccion {
  accion: string;
  etiqueta: string;
  codigoCuenta: string;
  /** Si la acción no tiene vuelta atrás. Hoy solo anular. */
  irreversible: boolean;
  /** Si hay que elegir motivos del catálogo. */
  pideMotivos: boolean;
  /** Los que aplican a esta cuenta, ya acotados por tipo de proceso. */
  motivos: MotivoModel[];
  /**
   * Qué le pasa a la cuenta, cuando la etiqueta no lo dice sola. «Pasar a Modificación» sobre
   * una cuenta finalizada es desfinalizarla, y eso hay que leerlo antes de elegir el motivo.
   */
  explicacion?: string;
}

/**
 * Confirmación de una acción sobre la cuenta.
 *
 * <h3>Por qué no es el mismo diálogo para todas</h3>
 * Las nueve acciones no pesan igual. Seis son transiciones de estado que se
 * deshacen moviendo la cuenta otra vez; anular no se deshace nunca. Dar el
 * mismo cuadro a todas enseña al auditor a pulsar «aceptar» sin leer, que es
 * justo lo que no conviene en la única que importa.
 *
 * <p>De ahí que lo irreversible pida **escribir el código de la cuenta**: no es
 * ceremonia, es lo que separa un clic de un acto deliberado.
 */
@Component({
  selector: 'sura-dialogo-accion',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule, MatDialogModule, MatButtonModule, MatCheckboxModule,
    MatFormFieldModule, MatIconModule, MatInputModule
  ],
  templateUrl: './dialogo-accion.component.html',
  styleUrls: ['./dialogo-accion.component.scss']
})
export class DialogoAccionComponent {

  readonly datos = inject<DatosDialogoAccion>(MAT_DIALOG_DATA);
  private readonly ref = inject(MatDialogRef<DialogoAccionComponent>);

  readonly elegidos   = signal<Set<string>>(new Set());
  readonly referencia = signal('');
  readonly confirmacion = signal('');

  readonly motivosElegidos = computed(() =>
    this.datos.motivos.filter(m => this.elegidos().has(m.codigo)));

  /** Si alguno de los elegidos deja las líneas bloqueadas. */
  readonly bloquearaLineas = computed(() =>
    this.motivosElegidos().some(m => m.bloqueaLineas));

  /** Si alguno de los elegidos exige referencia de origen. */
  readonly exigeReferencia = computed(() =>
    this.motivosElegidos().some(m => m.exigeReferencia));

  readonly puedeConfirmar = computed(() => {
    if (this.datos.pideMotivos && this.motivosElegidos().length === 0) return false;
    if (this.exigeReferencia() && !this.referencia().trim()) return false;
    if (this.datos.irreversible
        && this.confirmacion().trim() !== this.datos.codigoCuenta) return false;
    return true;
  });

  alternar(codigo: string): void {
    this.elegidos.update(actuales => {
      const copia = new Set(actuales);
      if (copia.has(codigo)) copia.delete(codigo);
      else copia.add(codigo);
      return copia;
    });
  }

  estaElegido(codigo: string): boolean {
    return this.elegidos().has(codigo);
  }

  confirmar(): void {
    if (!this.puedeConfirmar()) return;
    const solicitud: EjecutarAccionRequest = {};
    if (this.datos.pideMotivos) {
      solicitud.motivos = [...this.elegidos()];
      const referencia = this.referencia().trim();
      if (referencia) solicitud.referencia = referencia;
    }
    this.ref.close(solicitud);
  }

  cancelar(): void {
    this.ref.close(null);
  }
}
