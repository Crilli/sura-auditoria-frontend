import { MotivoPendienteModel } from './motivo-pendiente.model';

/** Una clasificación normativa: el código y cómo se lee. */
export interface ClasificacionModel {
  codigo:      string;
  descripcion: string;
}

/**
 * Severidad de una novedad, tal como la publica el servicio.
 *
 * `NEGACION` es la que OHI llama «Negar» y es la más grave: no frena la cuenta,
 * la niega. `DESCONOCIDA` aparece cuando la novedad quedó huérfana de mensaje en
 * el catálogo, y `ADVERTENCIA` solo la produce el perfil local: el sistema de
 * registro no tiene ese nivel.
 */
export type SeveridadNovedad =
  | 'BLOQUEANTE' | 'NEGACION' | 'ADVERTENCIA' | 'INFORMATIVA' | 'DESCONOCIDA';

export interface NovedadModel {
  id:          number;
  /** `null` si la novedad quedó sin mensaje en el catálogo. */
  codigo:      string | null;
  /**
   * El texto **ya resuelto**: la plantilla con sus huecos rellenos. Es lo que se
   * lee y lo que acaba leyendo el prestador. Lo compone el servicio, porque el
   * sistema de registro no lo hace.
   */
  descripcion: string;
  /**
   * El texto del catálogo tal cual, con los huecos `{0}`…`{9}` sin rellenar.
   * Va aparte del resuelto para poder enseñar qué hueco completa cada dato.
   */
  plantilla:   string;
  /** Los datos que rellenan los huecos, por índice. Vacío en la mayoría. */
  valores:     Record<number, string>;
  severidad:   SeveridadNovedad;
  /** La etapa que la produjo, o `MANUAL`. Ver `ORIGEN_NOVEDAD`. */
  origen:      string;
  /**
   * Si la puso un auditor y no el motor de reglas.
   *
   * Lo decide el servicio y **no se deduce aquí del origen**: de esto depende
   * que se ofrezca quitarla, y el criterio tiene que ser el mismo que aplica el
   * servicio al rechazar la baja.
   */
  laPusoUnaPersona: boolean;
  /**
   * Lo que el sistema de registro rotula «Específico de Sistema?»: si el mensaje
   * es de los que levanta su motor por cuestiones técnicas. Es del catálogo, no
   * de esta novedad.
   */
  esDelSistema: boolean;
  /** Clasificación normativa de primer nivel. Falta a menudo. */
  generico:    ClasificacionModel | null;
  especifico:  ClasificacionModel | null;
  autor:       string | null;
  /** ISO-8601. `null` en las que no lo publican. */
  fecha:       string | null;
}

/** Ítem de la grilla de líneas — GET /api/v1/cuentas/{codigo}/lineas */
export interface ResumenLineaModel {
  referencia:               number;
  numeroLinea:              number;
  codigoProcedimiento:      string;
  /** Texto de la prestación. `null` si OHI no lo publica para ese código. */
  descripcionProcedimiento: string | null;
  /** Catálogo del código: CUPS, CUM, SURACUPS o el propio del prestador. */
  catalogoProcedimiento:    string | null;
  /** Documento del afiliado, p. ej. `CC30359313`. */
  codigoAfiliado:           string;
  /** Nombre del afiliado. `null` si no se pudo resolver contra el padrón de OHI. */
  nombreAfiliado:           string | null;
  /**
   * Fechas de atención. Ya venían del servicio de registro y las tenía el
   * dominio, pero el DTO las descartaba: se perdían en la frontera. Suben
   * porque son criterio de búsqueda, y filtrar por una fecha que no se puede
   * ver deja al auditor sin saber por qué una fila salió.
   */
  fechaInicio:              string | null;
  fechaFin:                 string | null;
  /** Código de autorización; `null` si la línea no lo trae. */
  codigoAutorizacion:       string | null;
  valorAutorizado:          number;
  /** Lo que el prestador cobró, con sus unidades. Puede faltar. */
  valorCargado:             number | null;
  unidadesCargadas:         number | null;
  /** OHI omite las unidades autorizadas en el 7,5 % de las líneas. */
  unidadesAutorizadas:      number | null;
  /** IVA calculado por el motor. Casi siempre nulo: pocas prestaciones lo llevan. */
  valorIva:                 number | null;
  porcentajeIva:            number | null;
  valorCubierto:            number;
  /** Valor glosado; `null` si la línea no tiene glosa. */
  valorGlosado:             number | null;
  editable:                 boolean;
  cantidadPendientes:       number;
  /** Motivos sin resolver, con su texto: explican el contador sin abrir la línea. */
  pendientes:               MotivoPendienteModel[];
  tieneNovedadBloqueante:   boolean;
  /**
   * Las novedades de la línea, con su texto. Explican el chip de estado sin abrir la línea.
   *
   * El dato ya viajaba en la misma petición y el servicio lo descartaba: la grilla solo
   * recibía el booleano y pintaba «⚠ Bloqueada» con un tooltip fijo que no decía qué campo
   * ni por qué.
   */
  novedades:                NovedadModel[];
  version:                  number;
}

/** Qué se le prestó al afiliado en la línea. */
export interface PrestacionModel {
  codigo:              string | null;
  descripcion:         string | null;
  /** CUPS, CUM, SURACUPS o el catálogo propio del prestador. */
  catalogo:            string | null;
  codigoNoDefinido:    string | null;
  codigoNoDefinidoDef: string | null;
  /** Texto literal del RIPS; única descripción cuando el código no está en catálogo. */
  descripcionRips:     string | null;
  claseServicio:       string | null;
  especialidad:        string | null;
}

/** Tarifas y contrato que aplican a la línea. */
export interface DatosConvenioModel {
  codigoTarifarioIss2001:   string | null;
  codigoTarifarioIss2000:   string | null;
  codigoTarifarioSoat:      string | null;
  numeroContrato:           string | null;
  homologoCups:             string | null;
  multiplesCupsHomologos:   string | null;
  codigoUnicoContratoSiifa: string | null;
  /** Tarifa pactada con el prestador, antes de los ajustes de regla. */
  valorConvenido:           number | null;
  /** Cláusula aplicada: prestador, propuesta y manual tarifario. */
  tarifaAplicada:           string | null;
}

/** Datos de la atención y del siniestro. */
export interface OtrosDatosLineaModel {
  tipoSala:                 string | null;
  viaDeAcceso:              string | null;
  unidadEstrategicaNegocio: string | null;
  codigoSiniestro:          string | null;
}

/** Diagnóstico CIE-10 de la línea. */
export interface DiagnosticoLineaModel {
  secuencia:       number;
  tipo:            string | null;
  descripcionTipo: string | null;
  codigo:          string | null;
  descripcion:     string | null;
}

/** Una glosa concreta de la línea; la suma de sus valores es el valor glosado. */
export interface DetalleGlosaModel {
  identificador:     number;
  /**
   * El causal que se eligió al glosar, p. ej. `308-1` o `AU0202`.
   *
   * Antes no llegaba: el auditor escribía un causal y al guardar dejaba de verlo, porque solo
   * se recibían las descripciones genérica y específica, que no identifican cuál fue.
   */
  codigoGlosa:       string | null;
  valor:             number | null;
  codigoNotaCredito: string | null;
  /** Importe de la nota crédito. `null` si esta glosa no lleva, que no es lo mismo que cero. */
  valorNotaCredito:  number | null;
  /** Clasificación normativa, p. ej. «Tarifas». */
  generico:          string | null;
  /** Clasificación específica, p. ej. «Procedimiento o actividad». */
  especifico:        string | null;
  /** Redacción completa que ve el prestador. */
  texto:             string | null;
}

/** Detalle completo — GET /api/v1/cuentas/{codigo}/lineas/{referencia} */
export interface DetalleLineaModel {
  referencia:           number;
  codigoCuenta:         string;
  numeroLinea:          number;
  fechaInicio:          string;
  /** Las prestaciones de un solo día llegan sin ella; no asumir que viene. */
  fechaFin:             string | null;
  /** Documento del afiliado, p. ej. `CC30359313`. */
  codigoAfiliado:       string;
  /** Nombre del afiliado. `null` si no se pudo resolver contra el padrón de OHI. */
  nombreAfiliado:       string | null;
  codigoProcedimiento:  string;
  /** Texto de la prestación. `null` si OHI no lo publica para ese código. */
  descripcionProcedimiento: string | null;
  /** Catálogo del código: CUPS, CUM, SURACUPS o el propio del prestador. */
  catalogoProcedimiento:    string | null;
  prestacion:           PrestacionModel;
  /** Autorización con la que se prestó el servicio. */
  codigoAutorizacion:   string | null;
  /** Quien atendió, que puede no ser quien factura. */
  prestadorAtencionCodigo: string | null;
  prestadorAtencionNombre: string | null;
  valorCargado:         number | null;
  unidadesCargadas:     number | null;
  valorAutorizado:      number;
  /** OHI la omite en el 7,5% de las líneas; no asumir que viene. */
  unidadesAutorizadas:  number | null;
  valorCubierto:        number;
  /** OHI la omite en el 4,3% de las líneas. */
  unidadesCubiertas:    number | null;
  valorGlosado:         number | null;
  observacionesGlosa:   string | null;
  convenio:             DatosConvenioModel;
  otrosDatos:           OtrosDatosLineaModel;
  diagnosticos:         DiagnosticoLineaModel[];
  glosas:               DetalleGlosaModel[];
  conservarBeneficios:  boolean;
  conservarTarifacion:  boolean;
  beneficiosManuales:   boolean;
  tarifacionManual:     boolean;
  bloqueada:            boolean;
  reemplazada:          boolean;
  editable:             boolean;
  novedades:            NovedadModel[];
  pendientes:           MotivoPendienteModel[];
  version:              number;
}

/**
 * Cuerpo del PATCH /api/v1/cuentas/{codigo}/lineas/{referencia}
 *
 * Todo lo opcional se interpreta como «no tocar» cuando viene ausente: el
 * servicio solo envía a OHI los campos que llegan. Por eso ningún campo se
 * rellena con el valor actual «por si acaso»; se omite y OHI lo conserva.
 *
 * Los límites de longitud no son de este front: son los que publica
 * `GET /claimsupdate/definition` para la definición `claimline`, que es el
 * contrato de escritura de OHI. Pasarse de ahí lo rechaza OHI, no el ms.
 *
 * Lo que NO está en esta lista es porque OHI no lo acepta escribir (valor y
 * unidades cubiertas, que las calcula el motor de coberturas) o porque es una
 * decisión de negocio (los datos del afiliado).
 */
export interface GuardarLineaRequest {
  versionEsperada:      number;
  modoRecalculo:        'EN_CASCADA' | 'AISLADO';

  valorCargado?:        number;
  /** OHI la exige no nula; omitirla conserva la que ya tiene la línea. */
  unidadesCargadas?:    number;
  valorAutorizado?:     number;
  unidadesAutorizadas?: number;
  valorGlosado?:        number;
  conservarBeneficios?: boolean;
  conservarTarifacion?: boolean;
  /** Máximo 1000 caracteres: es el límite del contrato de OHI. */
  observacionesGlosa?:  string;

  /** Máximo 30 caracteres. */
  codigoAutorizacion?:  string;
  /** ISO `yyyy-MM-dd`. OHI la exige no nula; omitirla conserva la actual. */
  fechaInicio?:         string;
  /** ISO `yyyy-MM-dd`. */
  fechaFin?:            string;

  /** Máximo 30 caracteres. */
  codigoNoDefinido?:    string;
  /** Máximo 30 caracteres. */
  codigoNoDefinidoDef?: string;
  /** Texto literal del RIPS. Máximo 100 caracteres. */
  descripcionRips?:     string;

  /** Máximo 30 caracteres. */
  numeroContrato?:      string;
  /** Máximo 30 caracteres. */
  homologoCups?:        string;
  /** Máximo 300 caracteres. */
  codigoUnicoContratoSiifa?: string;

  /** Máximo 20 caracteres. */
  codigoSiniestro?:     string;
  /**
   * Altas y bajas del desglose de glosa. Ausente = no tocarlo.
   *
   * Si se envían, **no se puede enviar además `valorGlosado`**: el total de la
   * línea es la suma de su desglose y lo calcula el servicio.
   */
  glosas?:              CambioGlosaRequest[];
  novedades?:           CambioNovedadRequest[];
}

// ── Filtros del listado de líneas ────────────────────────────────────────────

/**
 * De qué catálogo sale el código de la prestación.
 *
 * `PROPIO` agrupa a todos los catálogos propios de prestador —en producción hay
 * diecisiete códigos distintos, uno por NIT— porque es lo que se puede ofrecer
 * como una sola opción. Las opciones reales de cada cuenta salen del agregado,
 * no de este tipo: así el filtro sigue siendo correcto si aparece un catálogo
 * que hoy no existe.
 */
export type CatalogoPrestacion = 'CUPS' | 'CUM' | 'SURACUPS' | 'PROPIO' | 'OTRO';

/**
 * Criterios de búsqueda del listado de líneas. Todos opcionales y acumulativos.
 *
 * **No son equivalentes entre sí**, y conviene saberlo para leer la pantalla:
 * cédula, fechas, autorización y código de prestación los resuelve el sistema de
 * registro, así que la respuesta trae total y el paginador numera. El catálogo y
 * el valor glosado no sabe filtrarlos —medido: responde error—, así que el
 * servicio recorre la cuenta descartando, la respuesta llega **sin total** y la
 * navegación pasa a «siguiente/anterior».
 */
export interface FiltroLineasModel {
  /** Número de línea exacto. */
  numeroLinea?: number | null;
  cedula?:      string | null;
  /** Fecha de atención desde, inclusive, en `aaaa-mm-dd`. */
  desde?:       string | null;
  hasta?:       string | null;
  /** Código de autorización; busca por prefijo, sin distinguir mayúsculas. */
  autorizacion?: string | null;
  /** Código de la prestación; busca por prefijo. */
  prestacion?:  string | null;
  catalogo?:    CatalogoPrestacion | null;
  glosaDesde?:  number | null;
  glosaHasta?:  number | null;
  /**
   * Solo las líneas que tienen alguna novedad.
   *
   * Se empuja al sistema de registro, así que **no** cuesta el total: ver `exigeRecorrido`.
   */
  conNovedad?:  boolean | null;
  /** Solo las líneas con este motivo de pendiente sin resolver. */
  motivoPendiente?: string | null;
  /**
   * Si se quieren solo las líneas con un pendiente que frena la cuenta, solo las que no, o
   * todas. Mismo vocabulario que la pantalla de pendientes, porque la regla es una sola:
   * bloquear depende del par motivo-estado, no del motivo.
   */
  bloqueo?:     FiltroBloqueo | null;
}

/** Ver `bloqueo` en `FiltroLineasModel`. */
export type FiltroBloqueo = 'TODOS' | 'BLOQUEANTES' | 'NO_BLOQUEANTES';

export const FILTRO_LINEAS_VACIO: FiltroLineasModel = {};

/** Si alguno de los criterios obliga al servicio a recorrer la cuenta. */
/**
 * Si el filtro obliga al servicio a recorrer la cuenta, y por tanto la página llega sin total.
 *
 * Desde el 2026-10-17 son dos criterios y no tres: el **catálogo**, que el sistema de registro
 * no sabe filtrar, y el **techo de glosa**, que sí sabría pero dejaría fuera las líneas que no
 * traen el campo —medido: 63 de cada 200— y una línea sin glosa está por debajo de cualquier
 * techo. El **suelo** de glosa ya se empuja, así que «glosadas por más de X» vuelve a traer su
 * contador de resultados.
 */
export function exigeRecorrido(filtro: FiltroLineasModel): boolean {
  return !!filtro.catalogo
      || filtro.glosaHasta !== null && filtro.glosaHasta !== undefined;
}

export function hayAlgunCriterio(filtro: FiltroLineasModel): boolean {
  return Object.values(filtro).some(v => v !== null && v !== undefined && v !== '');
}

/** Con qué se puede acotar esta cuenta: GET /lineas/filtros */
export interface ResumenFiltrosLineasModel {
  afiliados:       { cedula: string; nombre: string | null; lineas: number }[];
  catalogos:       { codigo: CatalogoPrestacion; etiqueta: string; lineas: number }[];
  primeraAtencion: string | null;
  ultimaAtencion:  string | null;
  glosaMaxima:     number | null;
  lineasConGlosa:  number;
  totalLineas:     number;
}

// ── Glosas manuales ──────────────────────────────────────────────────────────

/**
 * Un alta o una baja en el desglose de glosa de la línea.
 *
 * Es una lista de **cambios**, no el desglose deseado: el sistema de registro
 * modifica su colección elemento a elemento, y una lista vacía sería ambigua
 * —«bórralo todo» o «no toques nada»— sobre un dato con valor económico.
 *
 * Una glosa no se edita: se quita y se pone otra. Así queda rastro de lo que se
 * había objetado antes.
 */
export type CambioGlosaRequest =
  | {
      operacion: 'AGREGAR';
      /** El causal, p. ej. `208-1`. */
      codigoGlosa: string;
      generico?: string;
      especifico?: string;
      valor: number;
      texto?: string;
    }
  | { operacion: 'ELIMINAR'; identificador: number };

/**
 * Un alta o una baja de novedad, pendiente de guardar.
 *
 * **Solo el código**, al contrario que la glosa: aquí hay catálogo y de él salen
 * el texto, la severidad y la clasificación. El origen tampoco viaja: lo pone el
 * servicio como `MANUAL`.
 */
export type CambioNovedadRequest =
  | {
      operacion: 'AGREGAR';
      /** El código del mensaje del catálogo, p. ej. `TA0401`. */
      codigoNovedad: string;
      /**
       * Los datos que completan los huecos del texto, por índice.
       *
       * Solo los que el mensaje pide: mandar uno de más se rechaza, porque el
       * sistema de registro lo guardaría sin que se vea en ninguna parte. Y
       * dejarse uno también, porque el prestador leería la llave.
       */
      valores?: Record<number, string>;
    }
  | { operacion: 'ELIMINAR'; identificador: number };

/**
 * El mismo cambio sobre varias líneas.
 *
 * Solo lo que tiene sentido idéntico en todas: el desglose de glosa y las novedades. Los
 * importes propios de cada línea no viajan aquí a propósito —aplicar el mismo valor
 * autorizado a veinte líneas distintas no es una operación masiva sino veinte errores— y el
 * valor glosado tampoco, porque es la suma del desglose de cada una y lo calcula el servicio.
 */
export interface CambiosEnLoteRequest {
  /** Referencias marcadas. Obligatoria y **no vacía**: aquí vacía no significa «todas». */
  lineas:        number[];
  modoRecalculo: 'EN_CASCADA' | 'AISLADO';
  glosas?:       CambioGlosaRequest[];
  novedades?:    CambioNovedadRequest[];
}

/** Una línea que no se pudo cambiar, con el número que ve el auditor. */
export interface FalloDeLinea {
  referencia:  number | null;
  numeroLinea: number | null;
  motivo:      string;
}

/**
 * Cómo acabó el lote.
 *
 * `PARCIAL` es el desenlace normal, no una excepción: una línea bloqueada o una que otro
 * auditor acaba de tocar no son errores de la petición sino filas que no se pudieron aplicar.
 */
export interface ResultadoEnLoteModel {
  desenlace:            'COMPLETO' | 'PARCIAL' | 'FALLIDO';
  aplicadas:            number;
  referenciasAplicadas: number[];
  fallos:               FalloDeLinea[];
  /**
   * Las que ya tenían lo pedido y no se tocaron (OPE-12): repetir un lote no duplica nada.
   * Ni aplicadas ni fallidas.
   */
  yaEstaban:            number;
  referenciasYaEstaban: number[];
}
