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
import { LineaFacade }              from '../../application/facades/linea.facade';
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

  // Auditor desde el contexto de autenticación (simplificado)
  private readonly auditor = 'auditor@sura.com.co';

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

  readonly editable   = computed(() => this.detalle()?.editable ?? false);

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
        this.form.reset(valoresDeLaLinea(detalle));

        // Se decide por el modo efectivo, no por `editable` a secas: en consulta
        // el formulario ni siquiera se pinta, pero se deja deshabilitado por si
        // algo lo alcanzara.
        if (this.esEdicion()) this.form.enable();
        else                  this.form.disable();
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

  // ── Acciones ─────────────────────────────────────────────────────────────

  /** Guarda y se queda en la línea. */
  async guardar(): Promise<void> {
    if (!this.puedeGuardar()) return;

    this.avanzando.set(true);
    const ok = await this.facade.guardar(
      this.codigo(), Number(this.referencia()), this.solicitudActual(), this.auditor
    );
    this.avanzando.set(false);

    if (ok) this.snackBar.open('Línea guardada', 'Cerrar', { duration: 2500 });
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

  /** Cuerpo del PATCH con lo que hay ahora mismo en el formulario. */
  private solicitudActual() {
    return construirSolicitud(this.form.getRawValue());
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
