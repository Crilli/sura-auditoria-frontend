import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { CatalogoNovedadesRepository } from '../../domain/ports/catalogo-novedades.repository';
import { MensajeCatalogoModel } from '../../domain/models/catalogo-novedad.model';
import { environment } from '@sura/environments';

@Injectable({ providedIn: 'root' })
export class CatalogoNovedadesHttpAdapter extends CatalogoNovedadesRepository {

  private readonly http = inject(HttpClient);

  /**
   * Una sola petición para toda la sesión.
   *
   * `shareReplay` y no una llamada por apertura del panel: el catálogo es el
   * mismo para todas las líneas y todas las cuentas, y el auditor abre el
   * detalle de muchas líneas seguidas. El servicio ya lo tiene en memoria —la
   * segunda llamada baja de 5,4 s a 0,04 s—, pero aun así son 200 kB que no hay
   * por qué volver a bajar.
   *
   * `refCount: false` para que no se descarte al cerrar el último panel.
   */
  private readonly catalogo$ = this.http
    .get<MensajeCatalogoModel[]>(`${environment.apiGatewayUrl}/api/v1/catalogos/novedades`)
    .pipe(shareReplay({ bufferSize: 1, refCount: false }));

  override listar(): Observable<MensajeCatalogoModel[]> {
    return this.catalogo$;
  }
}
