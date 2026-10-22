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

  // `value()` no devuelve undefined cuando el recurso está en error: LANZA `ResourceValueError`.
  // Sin el `hasValue()` delante, la plantilla que lea la cuenta antes que el error —la barra
  // fija (BTN-11) va la primera— corta ahí, y ni el aviso de error ni el fin de la carga llegan
  // a pintarse. `hasValue()` conserva el valor anterior durante una recarga.
  readonly cuenta: Signal<CuentaMedicaModel | null> = computed(
    () => this._cuentaResource.hasValue() ? this._cuentaResource.value() as CuentaMedicaModel : null);
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

  // Con la misma guarda que `cuenta`: si la consulta falló, `value()` lanzaría.
  readonly acciones: Signal<AccionCuenta[]> = computed(() => this._accionesResource.hasValue()
    ? this._accionesResource.value()?.accionesDisponibles ?? [] : []);
  readonly accionesCargando = computed(() => this._accionesResource.isLoading());
  readonly accionesError = computed(() => this._accionesResource.error() as Error | null ?? null);

  /** Si el sistema de registro habilita esa acción sobre la cuenta ahora mismo. */
  permite(accion: AccionCuenta): boolean {
    return this.acciones().includes(accion);
  }

  /**
   * Si se pueden cambiar los datos de la cuenta (EST-01): la línea, la fila de la grilla, el
   * lote, las novedades de cabecera y los pendientes que se añaden. **El único sitio** de la
   * pantalla donde vive la regla; todas las superficies la leen de aquí.
   *
   * Sale de lo que publica el servicio y no del estado: el servicio es la autoridad y la hace
   * cumplir. `=== true` a propósito: sin cuenta todavía, o con un servicio que no lo mande,
   * da `false` —ante la duda no se edita— y se enciende sola cuando llega la cuenta.
   */
  readonly admiteCambios = computed(() => this.cuenta()?.admiteCambios === true);

  /**
   * Vuelve a pedir la cuenta y sus acciones. Para lo que cambia la cuenta por otro camino que
   * los comandos de aquí —una resolución de pendientes, que puede moverla de estado (EST-03.4)—:
   * la barra y la regla de cambios derivan de la cuenta y la siguen solas. Y para un comando de
   * aquí que el servicio rechaza: el rechazo puede deberse a que la cuenta cambió por detrás.
   */
  recargar(): void {
    this._cuentaResource.reload();
    this._accionesResource.reload();
  }

  /**
   * Para los comandos de datos de otras fachadas y pantallas (línea, fila, lote, pendiente que
   * se añade). Si el servicio los rechazó con 409 `CUENTA_NO_MODIFICABLE`, la cuenta salió de
   * Modificación por detrás —en OHI o en otra pestaña— y lo que pinta la pantalla es viejo. Se
   * relee: la edición abierta se cierra sola (EST-01.8) y aparece «Pasar a Modificación»
   * (EST-01.4). Cualquier otro rechazo no dice nada del estado y no se relee por él.
   */
  alRechazarUnCambio(error: unknown): void {
    if (esCuentaNoModificable(error)) this.recargar();
  }

  // ── Signals de comando ────────────────────────────────────────────
  readonly tiquete     = signal<TiqueteResponse | null>(null);
  readonly errorComando = signal<string | null>(null);

  /**
   * Abre una cuenta por su código. Lo llama la vista de la cuenta cada vez que nace.
   *
   * El facade es de toda la aplicación y sobrevive a la vista, así que entrar a una cuenta no
   * es lo mismo según cuál se viera antes:
   *
   * - **Otra cuenta.** Los recursos la piden solos al cambiar la señal. Lo anotado y sin guardar
   *   de la anterior se descarta aquí: si siguiera, la cabecera de la nueva lo enseñaría como
   *   suyo y «Guardar» lo escribiría en ella con su versión, sin que el bloqueo optimista lo
   *   frenara —un alta de novedad no lleva nada que la ate a su cuenta—. Lo mismo el error del
   *   último comando, que era de la otra.
   * - **La misma cuenta otra vez** (volver desde el buscador, o desde la foto de una versión
   *   por «Abrir esta versión»). La señal no cambia —compara con `Object.is`—, los recursos no
   *   se enteran y servirían la cuenta y las acciones de la visita anterior, que pueden haber
   *   cambiado entretanto (finalizada, por ejemplo). Mezcladas con el histórico, que la vista sí
   *   vuelve a pedir, el selector ofrecería una versión «en curso» que no existe y «Enviar» se
   *   habilitaría con acciones caducadas (BTN-12.7). Se recargan; mientras, `hasValue()` deja a
   *   la vista con lo anterior y `loading()` en true. Lo anotado sí se conserva: es de esta cuenta.
   */
  buscar(codigo: string): void {
    const normalizado = codigo.trim().toUpperCase();
    if (normalizado === this.codigoBuscado()) {
      this._cuentaResource.reload();
      this._accionesResource.reload();
      return;
    }
    this.cambiosDeNovedad.set([]);
    this.errorComando.set(null);
    this.codigoBuscado.set(normalizado);
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
    // Fuera de Modificación no hay nada que mandar: el servicio lo rechazaría con 409 (EST-01).
    if (cambios.length === 0 || !cuenta || !this.admiteCambios()) return false;

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
      if (esAplicadoSinRelectura(err)) {
        // Se aplicaron aunque no se pudieran releer (OPE-11): se tratan como guardadas. Si
        // siguieran marcadas, el siguiente guardado las repetiría.
        this.cambiosDeNovedad.set([]);
        this._cuentaResource.reload();
        this._accionesResource.reload();
        return true;
      }
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
      if (esAplicadoSinRelectura(err)) {
        // La acción se ejecutó aunque no se pudiera releer (OPE-11): ofrecer repetirla
        // fallaría o, peor, la aplicaría dos veces.
        this._cuentaResource.reload();
        this._accionesResource.reload();
        return true;
      }
      this.errorComando.set((err as Error).message ?? 'No se pudo ejecutar la acción');
      // También al fallar: el estado pudo cambiarlo otro, y es lo que explica un conflicto. La
      // cuenta y las acciones, no solo estas: el estado vive en la cuenta, y releer solo lo
      // publicado lo mezclaba con el estado viejo —«Pasar a Modificación» apagado con un motivo
      // falso, y sin poder editar una cuenta que otro ya había pasado a Modificación—. Las
      // líneas no: la acción no se aplicó.
      this.recargar();
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
      // Por lo mismo que al fallar una acción: el rechazo puede deberse a que otro la movió, y
      // la barra debe seguir al estado real (BTN-13.8). Si no cambió, se relee la misma.
      this.recargar();
      return false;
    }
  }
}

/**
 * Si el servicio dice que el cambio se aplicó pero no pudo releerlo (OPE-11): `codigo`
 * `APLICADO_SIN_RELEER`. Se trata como hecho y se recarga; nunca se ofrece repetirlo.
 */
function esAplicadoSinRelectura(error: unknown): boolean {
  return (error as { codigo?: string | null } | null)?.codigo === 'APLICADO_SIN_RELEER';
}

/** Si el servicio rechazó un cambio de datos porque la cuenta no está en Modificación (EST-01.6). */
function esCuentaNoModificable(error: unknown): boolean {
  return (error as { codigo?: string | null } | null)?.codigo === 'CUENTA_NO_MODIFICABLE';
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

/*
Cambios que faltaba de version
*/
