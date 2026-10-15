import { Observable } from 'rxjs';
import { MensajeCatalogoModel } from '../models/catalogo-novedad.model';

/**
 * Puerto del dominio para el catálogo de mensajes que se pueden poner como
 * novedad.
 *
 * Va aparte de `LineaRepository` porque el catálogo **no pertenece a ninguna
 * cuenta**: es global y lo comparten todas.
 */
export abstract class CatalogoNovedadesRepository {
  /** Trae el catálogo completo de lo ofrecible. */
  abstract listar(): Observable<MensajeCatalogoModel[]>;
}
