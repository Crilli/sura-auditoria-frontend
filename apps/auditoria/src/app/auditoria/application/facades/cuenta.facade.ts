import { Injectable, inject, signal, computed, Signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { lastValueFrom } from 'rxjs';
import { ConsultarAccionesUseCase } from '../use-cases/consultar-acciones.use-case';
import { ConsultarCuentaUseCase } from '../use-cases/consultar-cuenta.use-case';
import { EnviarCuentaUseCase }    from '../use-cases/enviar-cuenta.use-case';
import { GuardarNovedadesCuentaUseCase } from '../use-cases/guardar-novedades-cuenta.use-case';
import { EjecutarAccionUseCase } from '../use-cases/ejecutar-accion.use-case';
import { AccionCuenta, CuentaMedicaModel, EnviarCuentaRequest, TiqueteResponse } from '../../domain/models/cuenta-medica.model';
import { CambioNovedadRequest } from '../../domain/models/linea-cuenta.model';
import { EjecutarAccionRequest } from '../../domain/models/cuenta-medica.model';

@Injectable({ providedIn: 'root' })
export class CuentaFacade {

  private readonly consultarUC  = inject(ConsultarCuentaUseCase);
  private readonly accionesUC   = inject(ConsultarAccionesUseCase);
  private readonly enviarUC     = inject(EnviarCuentaUseCase);
  private readonly novedadesUC  = inject(GuardarNovedadesCuentaUseCase);
  private readonly accionesUC_  = inject(EjecutarAccionUseCase);

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

  // ── Novedades de la cabecera ─────────────────────────────────────────────
  //
  // Marcar una novedad no la aplica: se acumula aquí y viaja al pulsar guardar,
  // igual que en el detalle de línea. La diferencia es que en la cabecera la
  // novedad es lo único editable, así que el guardado es suyo y no de un
  // formulario mayor.

  readonly cambiosDeNovedad = signal<CambioNovedadRequest[]>([]);
  readonly guardandoNovedades = signal(false);

  anotarCambioDeNovedad(cambio: CambioNovedadRequest): void {
    this.cambiosDeNovedad.update(actuales => [...actuales, cambio]);
  }

  deshacerCambioDeNovedad(cambio: CambioNovedadRequest): void {
    this.cambiosDeNovedad.update(actuales =>
      actuales.filter(c => !sonElMismo(c, cambio)));
  }

  /**
   * Guarda las novedades marcadas.
   *
   * La versión que viaja es la de la cuenta tal como se pintó. Si otro auditor
   * tocó algo —incluida una línea, que también sube la versión de la cuenta—
   * el servicio responde 412 y aquí se recarga para que el auditor vea con qué
   * está chocando.
   */
  async guardarNovedades(codigo: string, auditor: string): Promise<boolean> {
    const cambios = this.cambiosDeNovedad();
    const cuenta = this.cuenta();
    if (cambios.length === 0 || !cuenta) return false;

    this.errorComando.set(null);
    this.guardandoNovedades.set(true);
    try {
      await lastValueFrom(
        this.novedadesUC.execute(codigo, cuenta.version, cambios, auditor)
      );
      // Aplicados: si siguieran aquí, el siguiente guardado los repetiría.
      this.cambiosDeNovedad.set([]);
      this._cuentaResource.reload();
      // Y también las acciones: una novedad de severidad fatal en la cabecera
      // frena la cuenta, así que lo que el auditor puede hacer con ella cambia.
      // El PATCH va sin recálculo —la novedad no mueve importes— de modo que
      // es OHI quien decide, y hay que volver a preguntárselo.
      this._accionesResource.reload();
      return true;
    } catch (err: unknown) {
      this.errorComando.set((err as Error).message ?? 'Error al guardar las novedades');
      this._cuentaResource.reload();
      return false;
    } finally {
      this.guardandoNovedades.set(false);
    }
  }

  // ── Acciones habilitadas ─────────────────────────────────────────────────

  readonly ejecutandoAccion = signal<string | null>(null);

  /**
   * Ejecuta una de las acciones que el sistema de registro habilita.
   *
   * Al volver se recargan **la cuenta y las acciones**: la operación la mueve
   * de estado, y con él cambia lo que se puede hacer a continuación. Anular,
   * además, la deja sin ninguna.
   */
  async ejecutarAccion(
    codigo: string,
    accion: string,
    solicitud: EjecutarAccionRequest,
    auditor: string
  ): Promise<boolean> {
    this.errorComando.set(null);
    this.ejecutandoAccion.set(accion);
    try {
      await lastValueFrom(this.accionesUC_.execute(codigo, accion, solicitud, auditor));
      this._cuentaResource.reload();
      this._accionesResource.reload();
      return true;
    } catch (err: unknown) {
      this.errorComando.set((err as Error).message ?? 'No se pudo ejecutar la acción');
      // También al fallar: el estado pudo cambiarlo otro, y es lo que explica
      // un conflicto.
      this._accionesResource.reload();
      return false;
    } finally {
      this.ejecutandoAccion.set(null);
    }
  }

  /** Los motivos que aplican a este tipo de proceso. */
  motivos(ambito?: string) {
    return this.accionesUC_.motivos(ambito);
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

/**
 * Si dos cambios son el mismo.
 *
 * Las bajas se comparan por identificador; las altas, por su contenido, porque
 * todavía no tienen identificador —lo asigna el sistema de registro al crearlas—.
 */
function sonElMismo(a: CambioNovedadRequest, b: CambioNovedadRequest): boolean {
  if (a.operacion !== b.operacion) return false;
  if (a.operacion === 'ELIMINAR' && b.operacion === 'ELIMINAR') {
    return a.identificador === b.identificador;
  }
  return JSON.stringify(a) === JSON.stringify(b);
}
