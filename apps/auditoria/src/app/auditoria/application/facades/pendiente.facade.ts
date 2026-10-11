import { Injectable, inject, signal, computed, Signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { lastValueFrom } from 'rxjs';
import { ListarPendientesUseCase }  from '../use-cases/listar-pendientes.use-case';
import { ResolverPendienteUseCase } from '../use-cases/resolver-pendiente.use-case';
import { MotivoPendienteModel, ResolverPendienteRequest } from '../../domain/models/motivo-pendiente.model';

@Injectable({ providedIn: 'root' })
export class PendienteFacade {

  private readonly listarUC  = inject(ListarPendientesUseCase);
  private readonly resolverUC = inject(ResolverPendienteUseCase);

  readonly codigoCuenta = signal<string | null>(null);
  readonly errorComando = signal<string | null>(null);

  // ── QUERY DECLARATIVA — lista completa (sin paginación, el MS la devuelve entera) ──
  private readonly _pendientesResource = rxResource({
    params: () => this.codigoCuenta() || undefined,
    stream: ({ params: codigo }) => this.listarUC.execute(codigo)
  });

  readonly pendientes: Signal<MotivoPendienteModel[]>  = computed(() => (this._pendientesResource.value() as MotivoPendienteModel[]) ?? []);
  readonly loading     = computed(() => this._pendientesResource.isLoading());
  readonly listError   = computed(() => this._pendientesResource.error() as Error | null);
  readonly sinResolver = computed(() => this.pendientes().filter(p => !p.resuelto));

  cargarPendientes(codigoCuenta: string): void {
    this.codigoCuenta.set(codigoCuenta);
  }

  async resolver(
    codigoCuenta: string,
    idMotivo: number,
    solicitud: ResolverPendienteRequest,
    auditor: string
  ): Promise<boolean> {
    this.errorComando.set(null);
    try {
      await lastValueFrom(
        this.resolverUC.execute(codigoCuenta, idMotivo, solicitud, auditor)
      );
      this._pendientesResource.reload();
      return true;
    } catch (err: unknown) {
      this.errorComando.set((err as Error).message ?? 'Error al resolver pendiente');
      return false;
    }
  }
}
