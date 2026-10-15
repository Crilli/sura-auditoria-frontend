import { ClasificacionModel, SeveridadNovedad } from './linea-cuenta.model';

/**
 * Un mensaje del catálogo, de los que el auditor puede poner como novedad.
 *
 * Viene de `GET /api/v1/catalogos/novedades`, que devuelve el catálogo
 * **completo** —631 mensajes, unos 24 kB comprimidos— en una sola llamada. Eso
 * es deliberado: lo que el auditor hace es teclear tres letras y esperar ver al
 * instante los códigos que encajan, y una búsqueda contra el servidor por tecla
 * añadiría una ida y vuelta para filtrar algo que ya cabe en memoria.
 *
 * **No lleva el identificador interno del sistema de registro**: es distinto en
 * cada entorno, así que el alta viaja por código.
 */
export interface MensajeCatalogoModel {
  codigo:    string;
  /** La redacción que acabará leyendo el prestador. */
  texto:     string;
  /** La asigna el catálogo al código; el auditor no la elige. */
  severidad: SeveridadNovedad;
  /**
   * Si al ponerla la cuenta deja de poder avanzar.
   *
   * Lo deriva el servicio de la severidad y se publica aparte para que la
   * pantalla no tenga que saberse el vocabulario. De los 631 mensajes, 203
   * frenan la cuenta: es lo que hay que avisar **antes** de confirmar.
   */
  frenaLaCuenta: boolean;
  /**
   * Lo que el sistema de registro rotula «Específico de Sistema?».
   *
   * Siempre falso en lo que se ofrece —ese es justamente el filtro— pero se
   * publica porque es una de las columnas que el auditor reconoce de la pantalla
   * del sistema de registro.
   */
  esDelSistema: boolean;
  /**
   * Los huecos del texto que hay que rellenar para poder usar este mensaje.
   *
   * **No son correlativos**: hay plantillas que usan el 1 y el 2 sin usar el 0.
   * Vacío en 631 de los 696 mensajes; los otros 65 piden datos.
   */
  datosQuePide: number[];
  generico:   ClasificacionModel | null;
  especifico: ClasificacionModel | null;
}
