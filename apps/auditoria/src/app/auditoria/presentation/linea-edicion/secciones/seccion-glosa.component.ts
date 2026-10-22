import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { CurrencyPipe }       from '@angular/common';
import { FormsModule }        from '@angular/forms';
import { MatIconModule }      from '@angular/material/icon';
import { MatButtonModule }    from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule }     from '@angular/material/input';
import { MatSelectModule }    from '@angular/material/select';
import { MatTooltipModule }   from '@angular/material/tooltip';
import { DetalleLineaModel, CambioGlosaRequest } from '../../../domain/models/linea-cuenta.model';
import { CATALOGO_GLOSAS }    from '../../compartido/catalogo-glosas';

/**
 * Detalle de la glosa: clasificación e importe arriba, el texto normativo
 * debajo, que es lo que acaba viendo el prestador.
 *
 * <p>En edición permite agregar y quitar glosas. Lo que se marca aquí **no se
 * aplica al momento**: se acumula como cambios pendientes y viaja en el guardado
 * de la línea, de modo que agregar una glosa y corregir el valor convenido son
 * una sola operación, con una sola versión y un solo recálculo.
 *
 * <p>Una glosa no se edita: se quita y se pone otra. El sistema de registro
 * admitiría modificarla, pero cambiar el importe o el causal de una glosa ya
 * aplicada borra el rastro de lo que se había objetado antes.
 */
@Component({
  selector: 'sura-seccion-glosa',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CurrencyPipe, FormsModule, MatIconModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatTooltipModule
  ],
  templateUrl: './seccion-glosa.component.html',
  styleUrls:   ['./seccion-glosa.component.scss']
})
export class SeccionGlosaComponent {
  readonly detalle   = input.required<DetalleLineaModel>();
  readonly esEdicion = input.required<boolean>();
  /** Lo que se ha marcado y todavía no se ha guardado. */
  readonly cambios   = input<CambioGlosaRequest[]>([]);

  readonly agregar  = output<CambioGlosaRequest>();
  readonly deshacer = output<CambioGlosaRequest>();

  readonly catalogo = CATALOGO_GLOSAS;

  // ── Formulario de alta, con ngModel: son cuatro campos y no hay validación
  // cruzada; un FormGroup aquí sería ceremonia sin provecho.
  readonly causal = signal<string>('');
  readonly valor  = signal<number | null>(null);
  readonly texto  = signal<string>('');

  /** Identificadores marcados para eliminar; la fila se tacha, no desaparece. */
  readonly marcadasParaEliminar = computed(() =>
    new Set(this.cambios()
      .filter((c): c is Extract<CambioGlosaRequest, { operacion: 'ELIMINAR' }> =>
        c.operacion === 'ELIMINAR')
      .map(c => c.identificador)));

  readonly altasPendientes = computed(() =>
    this.cambios().filter((c): c is Extract<CambioGlosaRequest, { operacion: 'AGREGAR' }> =>
      c.operacion === 'AGREGAR'));

  readonly puedeAgregar = computed(() =>
    this.causal().trim().length > 0 && (this.valor() ?? 0) > 0);

  /**
   * Lo que va a quedar glosado si se guarda.
   *
   * Se enseña porque el total de la línea lo deriva el servicio de la suma del
   * desglose: sin este número, el auditor marca cambios y no sabe en qué va a
   * quedar el importe hasta después de guardar.
   */
  readonly totalResultante = computed(() => {
    const quitadas = this.marcadasParaEliminar();
    const quedan = (this.detalle().glosas ?? [])
      .filter(g => !quitadas.has(g.identificador))
      .reduce((s, g) => s + (g.valor ?? 0), 0);
    const entran = this.altasPendientes().reduce((s, a) => s + a.valor, 0);
    return quedan + entran;
  });

  estaMarcada(identificador: number): boolean {
    return this.marcadasParaEliminar().has(identificador);
  }

  alternarEliminar(identificador: number): void {
    const cambio: CambioGlosaRequest = { operacion: 'ELIMINAR', identificador };
    if (this.estaMarcada(identificador)) this.deshacer.emit(cambio);
    else this.agregar.emit(cambio);
  }

  confirmarAlta(): void {
    if (!this.puedeAgregar()) return;
    const causal = this.catalogo.find(c => c.codigo === this.causal());
    this.agregar.emit({
      operacion:   'AGREGAR',
      codigoGlosa: this.causal().trim(),
      generico:    causal?.generico,
      especifico:  causal?.especifico,
      valor:       this.valor()!,
      texto:       this.texto().trim() || undefined,
    });
    this.causal.set(''); this.valor.set(null); this.texto.set('');
  }

  quitarAlta(alta: CambioGlosaRequest): void {
    this.deshacer.emit(alta);
  }
}
