import { Injectable, inject, signal, computed, Signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { lastValueFrom } from 'rxjs';
import { ConsultarAccionesUseCase } from '../use-cases/consultar-acciones.use-case';
import { ConsultarCuentaUseCase } from '../use-cases/consultar-cuenta.use-case';
import { EnviarCuentaUseCase }    from '../use-cases/enviar-cuenta.use-case';
import { AccionCuenta, CuentaMedicaModel, EnviarCuentaRequest, TiqueteResponse } from '../../domain/models/cuenta-medica.model';

@Injectable({ providedIn: 'root' })
export class CuentaFacade {

  private readonly consultarUC  = inject(ConsultarCuentaUseCase);
  private readonly accionesUC   = inject(ConsultarAccionesUseCase);
  private readonly enviarUC     = inject(EnviarCuentaUseCase);

  // ── Signal de búsqueda — rxResource reacciona al cambio ──────────
  readonly codigoBuscado = signal<string | null>(null);

  // ── QUERY DECLARATIVA con rxResource() ───────────────────────────
  private readonly _cuentaResource = rxResource({
    params: () => this.codigoBuscado() || undefined,
    stream: ({ params: codigo }) => this.consultarUC.execute(codigo)
  });

  readonly cuenta: Signal<CuentaMedicaModel | null> = computed(() => this._cuentaResource.value() as CuentaMedicaModel ?? null);
  readonly loading    = computed(() => this._cuentaResource.isLoading());
  readonly cuentaError = computed(() => this._cuentaResource.error() as Error | null);

  // ── Acciones disponibles — recurso propio ────────────────────────
  // Se resuelve en su propio endpoint y tarda bastante más que la cabecera, así que
  // se pide en paralelo: la vista se pinta con `cuenta()` y habilita los botones
  // cuando `accionesCargando()` baja a false.
  private readonly _accionesResource = rxResource({
    params: () => this.codigoBuscado() || undefined,
    stream: ({ params: codigo }) => this.accionesUC.execute(codigo)
  });

  readonly acciones: Signal<AccionCuenta[]> = computed(
    () => this._accionesResource.value()?.accionesDisponibles ?? []);
  readonly accionesCargando = computed(() => this._accionesResource.isLoading());

  /** Si el sistema de registro habilita esa acción sobre la cuenta ahora mismo. */
  permite(accion: AccionCuenta): boolean {
    return this.acciones().includes(accion);
  }

  // ── Signals de comando ────────────────────────────────────────────
  readonly tiquete     = signal<TiqueteResponse | null>(null);
  readonly errorComando = signal<string | null>(null);

  /**
   * Busca una cuenta por código. rxResource recarga automáticamente.
   */
  buscar(codigo: string): void {
    this.codigoBuscado.set(codigo.trim().toUpperCase());
  }

  /**
   * Descarta la última cuenta consultada.
   *
   * Como el facade es un singleton de toda la app, `cuenta()` sigue devolviendo
   * la última cuenta vista incluso después de navegar a otra pantalla. Sin
   * limpiar este estado, volver al buscador reabre de inmediato esa misma
   * cuenta: el efecto de `CuentaBusquedaComponent` que navega "cuando aparece
   * una cuenta" ve el valor heredado y redirige antes de que el usuario pueda
   * escribir un código nuevo. Se llama al entrar al buscador.
   */
  limpiar(): void {
    this.codigoBuscado.set(null);
    this.errorComando.set(null);
  }

  /**
   * Envía la cuenta a OHI — async/await con lastValueFrom().
   */
  async enviar(
    codigo: string,
    solicitud: EnviarCuentaRequest,
    auditor: string
  ): Promise<boolean> {
    this.errorComando.set(null);
    try {
      const tiquete = await lastValueFrom(
        this.enviarUC.execute(codigo, solicitud, auditor)
      );
      this.tiquete.set(tiquete);
      // Tras el envío cambian tanto el estado de la cuenta como lo que se puede
      // hacer con ella: hay que recargar los dos recursos.
      this._cuentaResource.reload();
      this._accionesResource.reload();
      return true;
    } catch (err: unknown) {
      this.errorComando.set((err as Error).message ?? 'Error al enviar la cuenta');
      return false;
    }
  }
}
