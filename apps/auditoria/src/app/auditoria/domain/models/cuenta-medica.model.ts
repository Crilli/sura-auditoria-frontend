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
  | 'FINALIZADA'
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
