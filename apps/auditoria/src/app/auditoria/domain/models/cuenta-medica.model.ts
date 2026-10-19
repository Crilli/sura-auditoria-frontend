import { NovedadModel } from './linea-cuenta.model';
export type EstadoCuenta =
  | 'INICIAL'
  | 'DIGITACION'
  | 'MODIFICACION'
  | 'TARIFACION_MANUAL'
  | 'BENEFICIOS_MANUALES'
  | 'ADJUDICACION_MANUAL'
  | 'TARIFACION_ADJUDICACION_MANUAL'
  | 'TARIFACION_COMPLETA'
  | 'BENEFICIOS_COMPLETOS'
  | 'ADJUDICACION_COMPLETA'
  | 'TARIFACION_ADJUDICACION_COMPLETA'
  | 'TARIFACION_FINALIZADA'
  | 'ENVIADA_A_PREPROCESO'
  | 'ENVIADA_A_TARIFACION'
  | 'EN_PROCESO'
  | 'FINALIZADA'
  | 'ANULADA'
  | 'DESCONOCIDO';

/**
 * Acciones que el sistema de registro habilita sobre la cuenta.
 * Son las que publica el servicio en `accionesDisponibles`; no confundir con
 * la decisión de envío (ACEPTAR / DENEGAR), que va en el cuerpo del POST.
 */
export type AccionCuenta =
  | 'ENVIAR'
  | 'SEGUIR_PROCESO'
  | 'RESOLVER_PENDIENTE'
  | 'RESOLVER_PENDIENTE_LINEA'
  | 'DEVOLVER_A_MODIFICACION'
  | 'DEVOLVER_A_BENEFICIOS_MANUALES'
  | 'DEVOLVER_A_TARIFACION_MANUAL'
  | 'REVERTIR_FINALIZACION'
  | 'DESBLOQUEAR_LINEAS'
  | 'DESHACER_REEMPLAZOS'
  | 'ANULAR';

/**
 * Ficha de radicación y facturación del prestador — parte de la cabecera.
 *
 * Cualquier campo puede llegar en `null`: el sistema de registro no siempre
 * tiene diligenciado el trámite completo, y `totalConvenido` en particular no
 * tiene fuente en OHI (no expone una tarifa convenida a nivel de cuenta).
 */
export interface InformacionFacturacionModel {
  prestadorFacturacionNit:  string | null;
  /**
   * Razón social del que factura. Puede ser `null`: el NIT viene de la cuenta y el nombre
   * del padrón de prestadores, que es otra consulta y puede no tenerlo. Que falte el nombre
   * no invalida nada — el NIT sigue estando.
   */
  prestadorFacturacionNombre: string | null;
  numeroFactura:            string | null;
  numeroRadicado:           string | null;
  fechaRadicacion:          string | null; // ISO 8601
  fechaEmision:             string | null;
  fechaVencimiento:         string | null;
  fechaIngreso:             string | null;
  fechaEgreso:              string | null;
  valorFactura:             number | null;
  valorTotalFactura:        number | null;
  totalCargado:             number | null;
  totalConvenido:           number | null;
  totalValorGlosado:        number | null;
  valorNotaCredito:         number | null;
  tipoServicio:             string | null;
  acuseRecibido:            string | null;
  marcaRadicadoAtep:        string | null;
  marcaMulticore:           string | null;
  marcaPendienteManual:     string | null;
  observacionesInternas:    string | null;
  observacionesExternas:    string | null;
  pagarAPrestadorNit:       string | null;
  /** Razón social del que cobra. Ver `prestadorFacturacionNombre`. */
  pagarAPrestadorNombre:    string | null;
}

/**
 * Respuesta de GET /api/v1/cuentas/{codigo}.
 *
 * No incluye las acciones disponibles: van en su propia petición porque el sistema
 * de registro solo las publica en una representación mucho más lenta. Ver
 * `AccionesDisponiblesModel`.
 */
export interface CuentaMedicaModel {
  codigo:                string;
  estado:                EstadoCuenta;
  fechaInicio:           string; // ISO 8601
  fechaFin:              string;
  totalAutorizado:       number;
  totalCubierto:         number;
  version:               number;
  pendientesSinResolver: number;
  informacionFacturacion: InformacionFacturacionModel;
  /**
   * Lo que el prestador respondió a las glosas, en orden de llegada. Solo lectura.
   *
   * Viaja en la cabecera porque viene en la misma consulta al sistema de registro: pedirla
   * aparte sería una llamada de más para un dato que ya está en la mano.
   */
  respuestasGlosa: RespuestaAGlosaModel[];
  /**
   * Novedades de la cabecera: la tabla que el sistema de registro enseña sobre
   * la cuenta. Son de la misma forma que las de una línea —mismo catálogo,
   * mismo vocabulario de orígenes— y por eso comparten modelo.
   */
  novedades: NovedadModel[];

}

/**
 * Respuesta de GET /api/v1/cuentas/{codigo}/acciones.
 *
 * Llega bastante después que la cabecera —el sistema de registro tarda segundos en
 * resolverla—, así que la interfaz pinta primero y habilita los botones al recibirla.
 */
export interface AccionesDisponiblesModel {
  codigo:              string;
  accionesDisponibles: AccionCuenta[];
}

/** Cuerpo del POST /api/v1/cuentas/{codigo}/enviar */
export interface EnviarCuentaRequest {
  decision:       'ACEPTAR' | 'DENEGAR';
  codigoNovedad?: string;
}

/** Respuesta del POST /api/v1/cuentas/{codigo}/enviar */
export interface TiqueteResponse {
  codigoCuenta:         string;
  referenciaSeguimiento: string;
}

/** Un motivo del catálogo de desfinalización y anulación. */
export interface MotivoModel {
  codigo:      string;
  descripcion: string;
  /**
   * Si al usarlo las líneas quedan bloqueadas y habrá que desbloquearlas
   * después. Son 5 de los 16: hay que avisarlo **antes** de elegirlo.
   */
  bloqueaLineas:   boolean;
  /** Si sin referencia de origen el sistema de registro lo rechaza. */
  exigeReferencia: boolean;
  /** `CUENTA_MEDICA`, `AUTORIZACION` o `AMBAS`. */
  ambito:  string;
  /** El permiso propio del motivo, cuando lo tiene. */
  permiso: string | null;
}

/** Lo que se manda al ejecutar una acción. Todo opcional: seis no llevan nada. */
export interface EjecutarAccionRequest {
  motivos?: string[];
  referencia?: string;
  lineas?: number[];
  codigoMensajeAnulacion?: string;
}

/**
 * Una respuesta del prestador a las glosas de la cuenta.
 *
 * `versionAbierta` es la versión que esta respuesta abrió, con la forma `CM-94421-V4`. Sale
 * de aquí y no del histórico de versiones: viene en la misma respuesta.
 *
 * `vencida` lo calcula el servidor y no la pantalla para que no haya dos relojes.
 */
export interface RespuestaAGlosaModel {
  secuencia:        string;
  versionAbierta:   string;
  valor:            number;
  fechaLlegada:     string;
  fechaVencimiento: string | null;
  vencida:          boolean;
}

/**
 * Un hito de la historia de la cuenta.
 *
 * No confundir con «Seguimiento», que es el estado del envío asíncrono. Esto es por dónde ha
 * pasado la cuenta desde que llegó.
 */
export interface HitoModel {
  tipo:             'CAMBIO_DE_ESTADO' | 'DESFINALIZACION';
  /** El estado, o el código del motivo de la desfinalización. */
  etiqueta:         string;
  /** El texto del motivo; `null` en un cambio de estado. */
  detalle:          string | null;
  autor:            string;
  /** Para separar lo que movió el motor de lo que movió una persona. */
  loHizoElSistema:  boolean;
  ocurridoEn:       string;
}

/**
 * Criterios del buscador. Al menos uno: sin ninguno, el servicio responde 400 —buscar sin
 * criterio devolvería las once mil cuentas del entorno, y eso no es una búsqueda—.
 */
export interface FiltroCuentasModel {
  /** Exacto. Una misma factura puede estar radicada varias veces, y se ven todas. */
  factura?:  string | null;
  /** Por prefijo: quien lo teclea suele tener solo el principio. */
  radicado?: string | null;
}

/**
 * Una versión de negocio de una cuenta.
 *
 * **No** es el contador de bloqueo optimista que la cabecera llamaba «Versión»: ésta es la del
 * documento transmitido, la que nace cada vez que la cuenta se desfinaliza y vuelve a cerrarse.
 *
 * Su `estado` llega con el **mismo nombre del dominio que el de la cuenta viva**
 * (`FINALIZADA`, `ADJUDICACION_MANUAL`…): el servicio traduce el español del histórico
 * («Finalizado», «Pendiente») para que las dos se pinten con una sola tabla
 * (`estado-cuenta.model.ts`). Lo que el servicio no sabe traducir llega tal cual.
 *
 * El histórico solo guarda una versión al finalizarse: la que la cuenta tenga abierta no está
 * aquí (ver `versionEnCurso`).
 */
export interface VersionCuentaModel {
  numero:       number;
  fechaEntrada: string | null;
  valor:        number | null;
  estado:       string | null;
  estadoDesde:  string | null;
}

/** Una cuenta en la lista de resultados del buscador, con sus versiones debajo. */
export interface ResumenCuentaModel {
  codigo:          string;
  numeroFactura:   string | null;
  fechaRadicacion: string | null;
  prestadorNit:    string | null;
  prestadorNombre: string | null;
  valorFactura:    number | null;
  /** Ya traducido, o el literal del sistema de registro si el diccionario no lo conoce. */
  estado:          string;
  /** Vacío cuando la cuenta todavía no se ha transmitido. */
  versiones:       VersionCuentaModel[];
}

/**
 * Una versión tal como quedó al transmitirse: una **foto**, no la cuenta viva. Sus importes son
 * los de esa versión y pueden no parecerse a los de hoy.
 */
export interface FotoVersionModel {
  codigo:            string;
  numero:            number;
  fechaEntrada:      string | null;
  numeroFactura:     string | null;
  prestador:         string | null;
  valorFactura:      number | null;
  totalCargado:      number | null;
  totalAutorizado:   number | null;
  totalCubierto:     number | null;
  totalGlosado:      number | null;
  totalNotasCredito: number | null;
  estadoActual:      string | null;
  historial:         { estado: string; desde: string }[];
}
