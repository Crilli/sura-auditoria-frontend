/** Respuesta de GET /api/v1/cuentas/{codigo}/proceso */
export interface EstadoProcesoModel {
  avance:     string;
  finalizado: boolean;
  errores:    string[];
}
