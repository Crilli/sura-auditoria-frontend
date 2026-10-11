import {
  Component, Input, inject,
  signal, ChangeDetectionStrategy, DestroyRef
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule }       from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule }        from '@angular/material/icon';
import { MatListModule }        from '@angular/material/list';
import { MatButtonModule }      from '@angular/material/button';
import { ConsultarProcesoUseCase } from '../../application/use-cases/consultar-proceso.use-case';
import { EstadoProcesoModel }       from '../../domain/models/estado-proceso.model';
import { CuentaRepository }         from '../../domain/ports/cuenta.repository';

@Component({
  selector: 'sura-proceso-seguimiento',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatProgressBarModule, MatIconModule, MatListModule, MatButtonModule],
  templateUrl: './proceso-seguimiento.component.html',
  styleUrls: ['./proceso-seguimiento.component.scss']
})
export class ProcesoSeguimientoComponent {

  /** El parámetro de la ruta padre se llama `codigo`; el alias hace el enlace. */
  @Input({ required: true, alias: 'codigo' }) codigoCuenta!: string;

  private readonly consultarUC  = inject(ConsultarProcesoUseCase);
  private readonly cuentaRepo   = inject(CuentaRepository);
  private readonly destroyRef   = inject(DestroyRef);

  readonly estado    = signal<EstadoProcesoModel | null>(null);
  readonly loading   = signal<boolean>(false);
  readonly streaming = signal<boolean>(false);
  readonly error     = signal<string | null>(null);

  /** Consulta puntual una sola vez — async/await */
  async consultarUnaVez(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const { lastValueFrom } = await import('rxjs');
      const estado = await lastValueFrom(
        this.consultarUC.execute(this.codigoCuenta)
      );
      this.estado.set(estado);
    } catch (err: unknown) {
      this.error.set((err as Error).message);
    } finally {
      this.loading.set(false);
    }
  }

  /** Stream SSE en tiempo real — takeUntilDestroyed gestiona el ciclo de vida */
  iniciarStream(): void {
    this.streaming.set(true);
    this.cuentaRepo
      .transmitirProceso(this.codigoCuenta)
      .pipe(takeUntilDestroyed(this.destroyRef))  // Se cancela automáticamente al destruir
      .subscribe({
        next: ep => {
          this.estado.set(ep);
          if (ep.finalizado) this.streaming.set(false);
        },
        error: () => this.streaming.set(false)
      });
  }
}
