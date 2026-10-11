import { MotivoPendienteModel } from './motivo-pendiente.model';

export interface NovedadModel {
  id:          number;
  codigo:      string;
  descripcion: string;
  severidad:   'BLOQUEANTE' | 'ADVERTENCIA' | 'INFORMATIVA';
  origen:      string;
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
  valorAutorizado:          number;
  valorCubierto:            number;
  editable:                 boolean;
  cantidadPendientes:       number;
  /** Motivos sin resolver, con su texto: explican el contador sin abrir la línea. */
  pendientes:               MotivoPendienteModel[];
  tieneNovedadBloqueante:   boolean;
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
  valor:             number | null;
  codigoNotaCredito: string | null;
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
}
