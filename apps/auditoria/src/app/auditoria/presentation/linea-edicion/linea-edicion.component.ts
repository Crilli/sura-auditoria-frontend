import {
  Component, inject, input, signal, computed,
  effect, untracked, ChangeDetectionStrategy
} from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatFormFieldModule }       from '@angular/material/form-field';
import { MatSelectModule }          from '@angular/material/select';
import { MatButtonModule }          from '@angular/material/button';
import { MatIconModule }            from '@angular/material/icon';
import { MatTooltipModule }         from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatExpansionModule }       from '@angular/material/expansion';
import { ActivatedRoute, Router }   from '@angular/router';
import { CambioGlosaRequest, CambioNovedadRequest } from '../../domain/models/linea-cuenta.model';
import { environment } from '@sura/environments';
import { LineaFacade }              from '../../application/facades/linea.facade';
import { CuentaFacade }             from '../../application/facades/cuenta.facade';
import { motivoParaNoCambiarDatos } from '../../domain/models/estado-cuenta.model';
import { ResumenLineaModel }        from '../../domain/models/linea-cuenta.model';
import { ModoLinea }                from './modo-linea';
import {
  construirSolicitud, crearFormularioLinea, modoEfectivo, valoresDeLaLinea
} from './linea-form';
import {
  resumenConvenio, resumenDiagnosticos, resumenNovedades, resumenOtros,
  resumenPendientes, resumenPrestacion, resumenValores
} from './resumenes-seccion';
import { FichaIdentidadComponent }      from './secciones/ficha-identidad.component';
import { SeccionValoresComponent }      from './secciones/seccion-valores.component';
import { SeccionGlosaComponent }        from './secciones/seccion-glosa.component';
import { SeccionDiagnosticosComponent } from './secciones/seccion-diagnosticos.component';
import { SeccionNovedadesComponent }    from './secciones/seccion-novedades.component';
import { SeccionPendientesComponent }   from './secciones/seccion-pendientes.component';
import { SeccionPrestacionComponent }   from './secciones/seccion-prestacion.component';
import { SeccionConvenioComponent }     from './secciones/seccion-convenio.component';
import { SeccionOtrosComponent }        from './secciones/seccion-otros.component';

/**
 * Detalle y edición de una línea, pensado para auditar la cuenta línea por línea.
 *
 * Este componente es el contenedor: la ruta, el modo, el formulario, el
 * guardado y la navegación. Lo que se pinta lo reparten los hijos de
 * `secciones/`, que no saben nada de rutas ni de guardado.
 *
 * El acordeón —los `<mat-expansion-panel>` con su cabecera y su resumen— se
 * queda aquí a propósito, y no dentro de cada hijo: `MatAccordion` localiza sus
 * paneles con `@ContentChildren`, y un panel declarado en la plantilla de un
 * hijo deja de ser contenido del acordeón y se descuelga de él. Los hijos
 * pintan el cuerpo del panel; la estructura plegable es del contenedor.
 *
 * Reglas de la pantalla:
 * - «Guardar y siguiente» guarda primero y solo navega si el servicio confirmó
 *   el cambio. Ante cualquier error se queda en la línea actual.
 * - La línea siguiente no se pide ni se pinta hasta tener esa confirmación.
 * - «Volver a la cuenta» está disponible siempre, incluso con un guardado en curso.
 */
@Component({
  selector: 'sura-linea-edicion',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CurrencyPipe, ReactiveFormsModule,
    MatFormFieldModule, MatSelectModule, MatButtonModule, MatIconModule,
    MatTooltipModule, MatProgressSpinnerModule, MatSnackBarModule,
    MatExpansionModule,
    FichaIdentidadComponent, SeccionValoresComponent, SeccionGlosaComponent,
    SeccionDiagnosticosComponent, SeccionNovedadesComponent,
    SeccionPendientesComponent, SeccionPrestacionComponent,
    SeccionConvenioComponent, SeccionOtrosComponent
  ],
  templateUrl: './linea-edicion.component.html',
  styleUrls:   ['./linea-edicion.component.scss']
})
export class LineaEdicionComponent {

  /** Código de la cuenta — llega del parámetro `:codigo` de la ruta padre. */
  readonly codigo = input.required<string>();
  /** Referencia de la línea — parámetro `:referencia` de esta ruta. */
  readonly referencia = input.required<string>();
  /**
   * Modo con el que se abrió la pantalla. Llega del `data` de la ruta:
   * `lineas/:ref` es consulta y `lineas/:ref/editar` es edición.
   */
  readonly modo = input<ModoLinea>('lectura');

  private readonly fb       = inject(FormBuilder);
  private readonly router   = inject(Router);
  private readonly route    = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);
  readonly facade = inject(LineaFacade);

  /**
   * Quién firma lo que se guarda.
   *
   * Sale de la configuración del entorno y no escrito aquí: había un
   * `auditor@sura.com.co` a fuego que el entorno ya daba por retirado, y con él
   * la traza firmaba con un auditor distinto según desde qué pantalla se
   * guardara. Sigue siendo una identidad de desarrollo, no una autenticación.
   */
  private readonly auditor = environment.auditor;

  // ── Secciones plegables ──────────────────────────────────────────────────
  //
  // El detalle pasó de seis campos a una treintena, y en plano se leía como un
  // muro. Se reparte en paneles y la preferencia de cada uno se conserva al
  // saltar de línea en línea, que es como se audita: abriendo siempre los
  // mismos bloques.
  //
  // Abiertos de entrada van los que explican por qué la línea está como está
  // (valores, glosa, novedades, pendientes, diagnósticos). Los de referencia
  // —prestación, convenio, otros datos— arrancan cerrados y su resumen se lee
  // en la propia cabecera, sin abrirlos.
  //
  // Las preferencias se quedan en el contenedor y NO bajan a cada hijo: los
  // hijos se destruyen en cada salto de línea (el detalle se pone en nulo
  // mientras llega el siguiente), así que un signal dentro del hijo volvería
  // al valor de partida justo en el momento en el que hay que conservarlo.
  readonly panelValores      = signal(true);
  readonly panelGlosa        = signal(true);
  readonly panelDiagnosticos = signal(true);
  readonly panelNovedades    = signal(true);
  readonly panelPendientes   = signal(true);
  readonly panelPrestacion   = signal(false);
  readonly panelConvenio     = signal(false);
  readonly panelOtros        = signal(false);

  // Los resúmenes de las cabeceras son funciones puras; se exponen para que la
  // plantilla pueda llamarlas.
  readonly resumenValores      = resumenValores;
  readonly resumenDiagnosticos = resumenDiagnosticos;
  readonly resumenNovedades    = resumenNovedades;
  readonly resumenPendientes   = resumenPendientes;
  readonly resumenPrestacion   = resumenPrestacion;
  readonly resumenConvenio     = resumenConvenio;
  readonly resumenOtros        = resumenOtros;

  /** Línea a la que se avanzaría; `null` si la actual es la última de la cuenta. */
  readonly siguiente = signal<ResumenLineaModel | null>(null);
  /** Verdadero mientras se guarda o se resuelve la línea siguiente. */
  readonly avanzando = signal<boolean>(false);

  readonly detalle      = this.facade.detalleLinea;
  readonly cargando     = this.facade.cargandoDetalle;
  readonly errorComando = this.facade.errorComando;

  /**
   * La cuenta, que es de toda la aplicación y ya la carga la vista que contiene esta pantalla.
   * De ella sale si se pueden cambiar datos (EST-01): solo en Modificación, y lo publica el servicio.
   */
  private readonly cuentas = inject(CuentaFacade);

  /**
   * Si la línea se puede editar: que la línea lo admita —no bloqueada ni reemplazada— **y** que
   * la cuenta admita cambios. Todo lo demás cuelga de aquí —el modo efectivo, el formulario, el
   * guardado—, así que una cuenta fuera de Modificación no se edita aunque se abra `…/editar` a
   * mano (EST-01.5), y una edición abierta se cierra sola si la cuenta sale de Modificación
   * (EST-01.8): el modo pasa a consulta y el formulario vuelve a lo que trae la línea.
   */
  readonly editable   = computed(() => (this.detalle()?.editable ?? false) && this.cuentas.admiteCambios());

  /** La regla de la cuenta, para la plantilla. */
  readonly cuentaAdmiteCambios = this.cuentas.admiteCambios;

  /**
   * Por qué no se edita, cuando es por la cuenta: el aviso de la pantalla, que remite a «Pasar a
   * Modificación» de la barra. No es «esta línea no es editable», que es de la línea. Sin la
   * cuenta todavía no se dice nada: no se sabe en qué estado está.
   */
  readonly motivoDeLaCuenta = computed(() => {
    const cuenta = this.cuentas.cuenta();
    return cuenta && !this.cuentas.admiteCambios() ? motivoParaNoCambiarDatos(cuenta.estado) : null;
  });

  /** Ver `modoEfectivo()` en `linea-form.ts`: la URL pide, el registro decide. */
  readonly modoEfectivo = computed<ModoLinea>(() =>
    modoEfectivo(this.modo(), this.editable()));
  readonly esEdicion = computed(() => this.modoEfectivo() === 'edicion');
  /** Se pidió editar pero no se puede: hay que explicarlo, no callarlo. */
  readonly edicionDenegada = computed(() =>
    this.modo() === 'edicion' && !!this.detalle() && !this.editable());
  readonly esUltima   = computed(() => this.siguiente() === null);
  /** Cualquier operación en vuelo bloquea el formulario y el avance. */
  readonly ocupado    = computed(() => this.avanzando() || this.cargando());

  readonly iconoAvance = computed(() => this.esUltima() ? 'done_all' : 'arrow_forward');

  readonly etiquetaAvance = computed(() => {
    if (this.avanzando()) return 'Guardando…';
    if (this.esUltima())  return 'Guardar y finalizar';
    return `Guardar y siguiente (#${this.siguiente()?.numeroLinea})`;
  });

  readonly etiquetaSinGuardar = computed(() =>
    this.esUltima() ? 'Volver a la cuenta' : `Siguiente (#${this.siguiente()?.numeroLinea})`);

  /**
   * El formulario vive en el contenedor, que es quien guarda. Los hijos lo
   * reciben por `input()` y repiten el `[formGroup]` dentro de su plantilla:
   * `formControlName` resuelve su contenedor por inyección con `@Host()`, que
   * no sube más allá del elemento anfitrión del componente en el que está
   * escrito, así que el `[formGroup]` de este `<form>` no le alcanza.
   */
  readonly form = crearFormularioLinea(this.fb);

  constructor() {
    // Carga la línea cada vez que cambia la referencia de la ruta. El router
    // reutiliza la instancia del componente al navegar entre líneas, así que
    // no basta con ngOnInit.
    effect(() => {
      const codigo     = this.codigo();
      const referencia = Number(this.referencia());
      untracked(() => void this.cargarLinea(codigo, referencia));
    });

    // Refleja en el formulario la línea que devolvió el servicio.
    effect(() => {
      const detalle = this.detalle();
      // El modo se lee FUERA de untracked: si la línea degrada a consulta, el
      // efecto tiene que volver a correr para apagar el formulario.
      this.modoEfectivo();
      if (!detalle) return;

      untracked(() => {
        // Una acción sobre la cuenta cambió la línea que se está editando (EST-02.4): lo tecleado
        // era sobre la versión vieja y chocaría con un 412, así que se descarta, pero no en
        // silencio. La respuesta del propio guardado también llega por aquí, y esa no avisa.
        const descartaLoTecleado = detalle === this.facade.relecturaTrasCambioDeEstado
          && this.esEdicion() && this.form.dirty;

        this.form.reset(valoresDeLaLinea(detalle));

        // Se decide por el modo efectivo, no por `editable` a secas: en consulta
        // el formulario ni siquiera se pinta, pero se deja deshabilitado por si
        // algo lo alcanzara.
        if (this.esEdicion()) this.form.enable();
        else                  this.form.disable();

        if (descartaLoTecleado) {
          this.snackBar.open('La línea cambió con la acción sobre la cuenta y se volvió a cargar: '
            + 'lo tecleado sin guardar se descartó.', 'Cerrar', { duration: 8000 });
        }
      });
    });

    // Al salir de la edición —por la cuenta, que dejó Modificación (EST-01.8), por la línea o por
    // la navegación— las glosas y novedades marcadas sin guardar se descartan, igual que lo
    // tecleado: si siguieran, el siguiente guardado las mandaría sin que nadie las viera.
    effect(() => {
      if (this.esEdicion()) return;
      untracked(() => {
        if (this.cambiosDeGlosa().length > 0) this.cambiosDeGlosa.set([]);
        if (this.cambiosDeNovedad().length > 0) this.cambiosDeNovedad.set([]);
      });
    });
  }

  // ── Carga ────────────────────────────────────────────────────────────────

  private async cargarLinea(codigo: string, referencia: number): Promise<void> {
    this.siguiente.set(null);
    await this.facade.consultarDetalle(codigo, referencia);
    // Se resuelve por adelantado para poder rotular el botón de avance y saber
    // si esta es la última línea de la cuenta.
    this.siguiente.set(await this.facade.siguienteLinea(codigo, referencia));
  }

  // ── Glosas pendientes de guardar ─────────────────────────────────────────
  //
  // Marcar una glosa no la aplica: se acumula aquí y viaja en el guardado de la
  // línea, para que agregar una glosa y corregir un importe sean una sola
  // operación con una sola versión y un solo recálculo.

  readonly cambiosDeGlosa = signal<CambioGlosaRequest[]>([]);

  anotarCambioDeGlosa(cambio: CambioGlosaRequest): void {
    this.cambiosDeGlosa.update(actuales => [...actuales, cambio]);
  }

  deshacerCambioDeGlosa(cambio: CambioGlosaRequest): void {
    this.cambiosDeGlosa.update(actuales => actuales.filter(c => !sonElMismo(c, cambio)));
  }

  // ── Novedades pendientes de guardar ──────────────────────────────────────
  //
  // Mismo criterio que las glosas, y por el mismo motivo. La diferencia está en
  // el cuerpo: la novedad solo lleva el código, porque el texto y la severidad
  // son del mensaje del catálogo.

  readonly cambiosDeNovedad = signal<CambioNovedadRequest[]>([]);

  anotarCambioDeNovedad(cambio: CambioNovedadRequest): void {
    this.cambiosDeNovedad.update(actuales => [...actuales, cambio]);
  }

  deshacerCambioDeNovedad(cambio: CambioNovedadRequest): void {
    this.cambiosDeNovedad.update(actuales => actuales.filter(c => !sonElMismo(c, cambio)));
  }

  // ── Acciones ─────────────────────────────────────────────────────────────

  /** Guarda y se queda en la línea. */
  async guardar(): Promise<void> {
    if (!this.puedeGuardar()) return;

    this.avanzando.set(true);
    const ok = await this.facade.guardar(
      this.codigo(), Number(this.referencia()), this.solicitudActual(), this.auditor
    );
    this.avanzando.set(false);

    if (ok) {
      // Los cambios ya están aplicados: si siguieran aquí, el siguiente guardado
      // volvería a mandarlos y crearía las glosas y las novedades por
      // segunda vez.
      this.cambiosDeGlosa.set([]);
      this.cambiosDeNovedad.set([]);
      this.snackBar.open('Línea guardada', 'Cerrar', { duration: 2500 });
    }
  }

  /**
   * Guarda la línea y solo si el servicio confirma pasa a la siguiente.
   * Si el guardado falla no se navega: el error queda visible sobre la misma línea.
   */
  async guardarYSiguiente(): Promise<void> {
    if (!this.puedeGuardar()) return;

    this.avanzando.set(true);
    const resultado = await this.facade.guardarYAvanzar(
      this.codigo(), Number(this.referencia()), this.solicitudActual(), this.auditor
    );
    this.avanzando.set(false);

    if (!resultado.guardado) return;   // el error ya está en errorComando()

    // Igual que en `guardar`: aplicados y fuera, para no repetirlos en la
    // siguiente línea.
    this.cambiosDeGlosa.set([]);
    this.cambiosDeNovedad.set([]);

    if (!resultado.siguiente) {
      this.snackBar.open('Era la última línea de la cuenta', 'Cerrar', { duration: 3000 });
      this.volverACuenta();
      return;
    }
    this.irALinea(resultado.siguiente.referencia);
  }

  /** Avance sin guardar, para líneas que el sistema de registro no deja editar. */
  siguienteSinGuardar(): void {
    const siguiente = this.siguiente();
    if (!siguiente) { this.volverACuenta(); return; }
    this.irALinea(siguiente.referencia);
  }

  /** Disponible en todo momento, incluso con un guardado en curso. */
  volverACuenta(): void {
    void this.router.navigate(['lineas'], { relativeTo: this.rutaDeLaCuenta() });
  }

  // ── Apoyo ────────────────────────────────────────────────────────────────

  private puedeGuardar(): boolean {
    if (!this.esEdicion()) return false;
    if (this.ocupado() || !this.editable()) return false;
    if (this.form.invalid) { this.form.markAllAsTouched(); return false; }
    return true;
  }

  /**
   * Cuerpo del PATCH con lo que hay ahora mismo en el formulario.
   *
   * Los cambios de glosa van aparte del formulario reactivo: no son campos sino
   * altas y bajas de una colección, y mezclarlos obligaría a reconstruir el
   * `FormArray` en cada guardado para nada.
   */
  private solicitudActual() {
    let cuerpo = construirSolicitud(this.form.getRawValue());

    if (this.cambiosDeGlosa().length > 0) {
      cuerpo = {
        ...cuerpo,
        glosas: this.cambiosDeGlosa(),
        // El servicio deriva el total de la suma del desglose y rechaza que
        // lleguen los dos: si el formulario traía uno, se cae aquí.
        valorGlosado: undefined,
      };
    }

    // Las novedades no tienen con qué contradecirse: no llevan importe, así que
    // no hay ningún campo del formulario que haya que anular al mandarlas.
    if (this.cambiosDeNovedad().length > 0) {
      cuerpo = { ...cuerpo, novedades: this.cambiosDeNovedad() };
    }

    return cuerpo;
  }

  /** Avanza a otra línea conservando el modo en el que se está trabajando. */
  private irALinea(referencia: number): void {
    const destino = this.modo() === 'edicion'
      ? ['lineas', referencia, 'editar']
      : ['lineas', referencia];
    void this.router.navigate(destino, { relativeTo: this.rutaDeLaCuenta() });
  }

  /** Pasa de consulta a edición sobre la misma línea. */
  irAEdicion(): void {
    void this.router.navigate(['lineas', Number(this.referencia()), 'editar'],
                              { relativeTo: this.rutaDeLaCuenta() });
  }

  /** Vuelve a consulta; descarta lo tecleado sin guardar. */
  volverALectura(): void {
    void this.router.navigate(['lineas', Number(this.referencia())],
                              { relativeTo: this.rutaDeLaCuenta() });
  }

  /**
   * Ruta de la cuenta (`:codigo`), padre de esta pantalla. Navegar relativo a ella
   * mantiene los enlaces correctos sin importar dónde se monte el micro-frontend.
   */
  private rutaDeLaCuenta(): ActivatedRoute {
    return this.route.parent ?? this.route;
  }
}

/**
 * Si dos cambios de glosa son el mismo, para poder deshacer uno marcado.
 *
 * Las bajas se comparan por identificador; las altas, por su contenido, porque
 * todavía no tienen identificador —lo asigna el sistema de registro al crearlas—.
 */
function sonElMismo<T extends CambioGlosaRequest | CambioNovedadRequest>(a: T, b: T): boolean {
  if (a.operacion !== b.operacion) return false;
  if (a.operacion === 'ELIMINAR' && b.operacion === 'ELIMINAR') {
    return a.identificador === b.identificador;
  }
  return JSON.stringify(a) === JSON.stringify(b);
}
