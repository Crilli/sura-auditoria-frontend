import {
  ChangeDetectionStrategy, Component, computed, inject, input, output, signal
} from '@angular/core';
import { DatePipe }           from '@angular/common';
import { FormsModule }        from '@angular/forms';
import { MatIconModule }      from '@angular/material/icon';
import { MatButtonModule }    from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule }     from '@angular/material/input';
import { MatTooltipModule }   from '@angular/material/tooltip';
import { rxResource }         from '@angular/core/rxjs-interop';
import {
  CambioNovedadRequest, NovedadModel, SeveridadNovedad
} from '../../../domain/models/linea-cuenta.model';
import { MensajeCatalogoModel } from '../../../domain/models/catalogo-novedad.model';
import { CatalogoNovedadesRepository } from '../../../domain/ports/catalogo-novedades.repository';
import {
  textoDeOrigen, SEVERIDAD_NOVEDAD, CONSECUENCIA_SEVERIDAD
} from '../../compartido/origenes-novedad';
import {
  huecosDe, huecosSinDato, resolverTexto, rotulosDeHuecos, fragmentoDelHueco,
  LARGO_MAXIMO_DATO
} from '../../compartido/texto-de-novedad';

/**
 * Novedades de la línea: las que puso una persona y las que levantó el motor de
 * reglas, separadas.
 *
 * <h3>Por qué separadas y no en una sola tabla</h3>
 * La interfaz del sistema de registro las mezcla y deja el origen en la última
 * columna. Eso importa porque **el motor y la persona no se tratan igual**: se
 * comprobó contra el entorno de pruebas que el sistema de registro acepta que se
 * le borre una novedad que levantó él, y que un recálculo posterior no la vuelve
 * a levantar. O sea que un clic de más en la fila equivocada hace desaparecer
 * para siempre lo que el motor objetó. Aquí el botón de baja solo existe en las
 * de origen manual, y en las demás se explica por qué no.
 *
 * <h3>Se marca, no se aplica</h3>
 * Igual que la glosa: lo que se marca aquí se acumula y viaja en el guardado de
 * la línea, de modo que poner una novedad y corregir el valor autorizado son una
 * sola operación, con una sola versión y un solo recálculo.
 *
 * <h3>Se elige del catálogo, no se escribe</h3>
 * Al contrario que la glosa —donde el sistema de registro no publica catálogo y
 * se admite teclear el causal— aquí hay 631 mensajes publicados, y de ellos
 * salen el texto, la severidad y la clasificación normativa. Un código
 * inventado se rechaza con un 422, así que no se ofrece escribirlo.
 */
@Component({
  selector: 'sura-seccion-novedades',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe, FormsModule, MatIconModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatTooltipModule
  ],
  templateUrl: './seccion-novedades.component.html',
  styleUrls:   ['./seccion-novedades.component.scss']
})
export class SeccionNovedadesComponent {

  private readonly repositorio = inject(CatalogoNovedadesRepository);

  /**
   * Las novedades de quien sea: una línea o la cabecera de la cuenta.
   *
   * Recibe la lista y no el detalle de la línea a propósito. Lo de dentro es
   * exactamente lo mismo en los dos niveles —mismo catálogo, mismo vocabulario
   * de orígenes, misma forma— y atarlo a `DetalleLineaModel` obligaba a
   * duplicar el componente para la cabecera.
   */
  readonly novedades = input.required<NovedadModel[]>();
  readonly esEdicion = input.required<boolean>();
  /** Lo que se ha marcado y todavía no se ha guardado. */
  readonly cambios   = input<CambioNovedadRequest[]>([]);

  readonly agregar  = output<CambioNovedadRequest>();
  readonly deshacer = output<CambioNovedadRequest>();

  // ── Catálogo ───────────────────────────────────────────────────────────────
  //
  // Entero y en memoria. Son 631 mensajes y el adaptador los pide una sola vez
  // por sesión; a cambio, buscar es instantáneo y no hay una ida y vuelta por
  // cada tecla.
  private readonly catalogoRecurso = rxResource({
    stream: () => this.repositorio.listar(),
    defaultValue: [] as MensajeCatalogoModel[],
  });

  readonly cargandoCatalogo = computed(() => this.catalogoRecurso.isLoading());
  readonly falloCatalogo    = computed(() => this.catalogoRecurso.status() === 'error');

  private readonly catalogo = computed<MensajeCatalogoModel[]>(() =>
    this.catalogoRecurso.hasValue() ? this.catalogoRecurso.value() : []);

  // ── Buscador ───────────────────────────────────────────────────────────────
  readonly busqueda = signal('');
  readonly elegido  = signal<MensajeCatalogoModel | null>(null);

  /**
   * Lo que el auditor va escribiendo para completar el texto, por índice de
   * hueco. Se vacía al elegir otro mensaje: los datos son de ese texto.
   */
  readonly datos = signal<Record<number, string>>({});

  readonly largoMaximoDato = LARGO_MAXIMO_DATO;
  /** El panel de alta solo aparece cuando se pide: no estorba al leer. */
  readonly agregando = signal(false);

  /** Cuántos resultados se pintan de una vez. */
  private static readonly MAXIMO_RESULTADOS = 40;

  readonly resultados = computed<MensajeCatalogoModel[]>(() => {
    const aguja = normalizar(this.busqueda());
    if (aguja.length < 2) return [];
    return this.catalogo()
      .filter(m => casa(m, aguja))
      .slice(0, SeccionNovedadesComponent.MAXIMO_RESULTADOS);
  });

  /** Cuántos quedaron fuera del recorte: se dice, no se esconde. */
  readonly resultadosOcultos = computed(() => {
    const aguja = normalizar(this.busqueda());
    if (aguja.length < 2) return 0;
    const total = this.catalogo().filter(m => casa(m, aguja)).length;
    return Math.max(0, total - SeccionNovedadesComponent.MAXIMO_RESULTADOS);
  });

  // ── Las dos listas ─────────────────────────────────────────────────────────
  readonly puestasAMano = computed(() =>
    this.novedades().filter(n => n.laPusoUnaPersona));

  readonly delMotor = computed(() =>
    this.novedades().filter(n => !n.laPusoUnaPersona));

  /** Las del motor se repliegan: en la cuenta medida hay más de ellas que de las otras. */
  readonly motorDesplegado = signal(false);
  private static readonly MOTOR_VISIBLES_SIN_DESPLEGAR = 3;

  readonly delMotorVisibles = computed(() =>
    this.motorDesplegado()
      ? this.delMotor()
      : this.delMotor().slice(0, SeccionNovedadesComponent.MOTOR_VISIBLES_SIN_DESPLEGAR));

  readonly motorOcultas = computed(() =>
    Math.max(0, this.delMotor().length - this.delMotorVisibles().length));

  // ── Cambios pendientes ─────────────────────────────────────────────────────
  /** Identificadores marcados para eliminar; la fila se tacha, no desaparece. */
  readonly marcadasParaEliminar = computed(() =>
    new Set(this.cambios()
      .filter((c): c is Extract<CambioNovedadRequest, { operacion: 'ELIMINAR' }> =>
        c.operacion === 'ELIMINAR')
      .map(c => c.identificador)));

  readonly altasPendientes = computed(() =>
    this.cambios().filter((c): c is Extract<CambioNovedadRequest, { operacion: 'AGREGAR' }> =>
      c.operacion === 'AGREGAR'));

  /**
   * Las altas con su mensaje del catálogo resuelto, para poder pintar el texto y
   * la severidad de lo que se va a crear y no solo el código.
   */
  readonly altasConMensaje = computed(() =>
    this.altasPendientes().map(a => {
      const mensaje = this.catalogo().find(m => m.codigo === a.codigoNovedad) ?? null;
      return {
        cambio:  a,
        mensaje,
        // Con sus datos ya puestos: es lo que se va a guardar, y enseñar la
        // plantilla con llaves aquí sería enseñar otra cosa.
        texto: mensaje ? resolverTexto(mensaje.texto, a.valores ?? {}) : null,
      };
    }));

  /**
   * Si el código elegido ya está en la línea.
   *
   * Se avisa y **no se impide**: el sistema de registro no deduplica —en el
   * entorno de pruebas hay una línea con el mismo código dos veces, puesto por
   * la misma persona con minuto y medio de diferencia, que tiene toda la pinta
   * de un doble clic— pero repetir podría ser deliberado, y bloquearlo sería
   * decidir por el auditor.
   */
  readonly yaEstaEnLaLinea = computed(() => {
    const codigo = this.elegido()?.codigo;
    if (!codigo) return false;
    return this.novedades().some(n => n.codigo === codigo)
        || this.altasPendientes().some(a => a.codigoNovedad === codigo);
  });

  /**
   * No basta con haber elegido: si el mensaje pide datos hay que rellenarlos
   * todos. El sistema de registro aceptaría la novedad a medias —se comprobó— y
   * el prestador acabaría leyendo un `{2}` en mitad de la frase.
   */
  readonly puedeConfirmar = computed(() =>
    this.elegido() !== null && this.huecosPendientes().length === 0);

  // ── Acciones ───────────────────────────────────────────────────────────────
  estaMarcada(identificador: number): boolean {
    return this.marcadasParaEliminar().has(identificador);
  }

  alternarEliminar(novedad: NovedadModel): void {
    // La comprobación se repite aquí aunque el botón no exista en las del motor:
    // el servicio la impone igualmente, y así nunca se emite un cambio que
    // sabemos que va a ser rechazado.
    if (!novedad.laPusoUnaPersona) return;
    const cambio: CambioNovedadRequest =
      { operacion: 'ELIMINAR', identificador: novedad.id };
    if (this.estaMarcada(novedad.id)) this.deshacer.emit(cambio);
    else this.agregar.emit(cambio);
  }

  elegir(mensaje: MensajeCatalogoModel): void {
    this.elegido.set(mensaje);
    this.datos.set({});
  }

  /** Apunta el dato de un hueco. */
  anotarDato(indice: number, valor: string): void {
    this.datos.update(actuales => ({ ...actuales, [indice]: valor }));
  }

  /** Los huecos que pide el mensaje elegido, con su pista. */
  readonly huecosAPedir = computed(() => {
    const m = this.elegido();
    if (!m) return [];
    const rotulos = rotulosDeHuecos(m.texto);
    return huecosDe(m.texto).map(indice => ({
      indice,
      // El rótulo es una heurística sobre la frase; el fragmento, el texto tal
      // cual. Van los dos para que un rótulo mal adivinado no engañe.
      pista: rotulos.get(indice) ?? `Valor ${indice}`,
      fragmento: fragmentoDelHueco(m.texto, indice),
    }));
  });

  /**
   * El texto tal como quedará. Es lo que de verdad hace falta ver antes de
   * confirmar: el código no dice nada y la plantilla con llaves tampoco.
   */
  readonly textoPrevisto = computed(() => {
    const m = this.elegido();
    return m ? resolverTexto(m.texto, this.datos()) : '';
  });

  /** Los huecos que siguen vacíos. Mientras quede uno no se puede confirmar. */
  readonly huecosPendientes = computed(() => {
    const m = this.elegido();
    return m ? huecosSinDato(m.texto, this.datos()) : [];
  });

  confirmarAlta(): void {
    const mensaje = this.elegido();
    if (!mensaje || !this.puedeConfirmar()) return;

    // Solo viajan los huecos que el mensaje pide: uno de más se rechaza en el
    // servicio, porque se guardaría sin verse en ninguna parte.
    const datos = this.datos();
    const valores: Record<number, string> = {};
    for (const { indice } of this.huecosAPedir()) {
      valores[indice] = datos[indice].trim();
    }

    this.agregar.emit(Object.keys(valores).length > 0
      ? { operacion: 'AGREGAR', codigoNovedad: mensaje.codigo, valores }
      : { operacion: 'AGREGAR', codigoNovedad: mensaje.codigo });
    this.cancelarAlta();
  }

  quitarAlta(alta: CambioNovedadRequest): void {
    this.deshacer.emit(alta);
  }

  abrirAlta(): void {
    this.agregando.set(true);
  }

  cancelarAlta(): void {
    this.agregando.set(false);
    this.busqueda.set('');
    this.elegido.set(null);
    this.datos.set({});
  }

  // ── Textos ─────────────────────────────────────────────────────────────────
  origen(valor: string | null): string {
    return textoDeOrigen(valor);
  }

  severidad(valor: SeveridadNovedad): string {
    return SEVERIDAD_NOVEDAD[valor] ?? valor;
  }

  consecuencia(valor: SeveridadNovedad): string {
    return CONSECUENCIA_SEVERIDAD[valor] ?? '';
  }

  /** Por qué no se puede quitar una del motor. Se explica, no se calla. */
  razonNoBorrable(novedad: NovedadModel): string {
    return `La levantó el motor (${this.origen(novedad.origen)}): `
         + 'se quita resolviendo la causa, no a mano.';
  }

  /** Clase del distintivo de severidad. */
  claseSeveridad(valor: SeveridadNovedad): string {
    return `novedad-severidad--${valor.toLowerCase()}`;
  }
}

/**
 * Quita tildes y mayúsculas antes de comparar.
 *
 * Los textos del catálogo están acentuados —«Número de autorización»— y nadie
 * teclea las tildes al buscar: sin esto, «autorizacion» no encuentra nada.
 */
function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
}

/** Busca a la vez en el código, el texto y las dos clasificaciones. */
function casa(mensaje: MensajeCatalogoModel, aguja: string): boolean {
  return normalizar(mensaje.codigo).includes(aguja)
      || normalizar(mensaje.texto).includes(aguja)
      || (!!mensaje.generico   && normalizar(mensaje.generico.descripcion).includes(aguja))
      || (!!mensaje.especifico && normalizar(mensaje.especifico.descripcion).includes(aguja));
}
