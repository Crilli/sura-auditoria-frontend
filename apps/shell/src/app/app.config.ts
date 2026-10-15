import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withRouterConfig, withViewTransitions } from '@angular/router';
import { HttpErrorResponse, HttpInterceptorFn, provideHttpClient, withInterceptors } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { APP_ROUTES } from './app.routes';

// Puertos (tokens DI)
import { CuentaRepository }    from '../../../auditoria/src/app/auditoria/domain/ports/cuenta.repository';
import { LineaRepository }     from '../../../auditoria/src/app/auditoria/domain/ports/linea.repository';
import { CatalogoNovedadesRepository } from '../../../auditoria/src/app/auditoria/domain/ports/catalogo-novedades.repository';
import { PendienteRepository } from '../../../auditoria/src/app/auditoria/domain/ports/pendiente.repository';

// Adaptadores HTTP (implementaciones concretas)
import { CuentaHttpAdapter }    from '../../../auditoria/src/app/auditoria/infrastructure/adapters/cuenta-http.adapter';
import { LineaHttpAdapter }     from '../../../auditoria/src/app/auditoria/infrastructure/adapters/linea-http.adapter';
import { CatalogoNovedadesHttpAdapter } from '../../../auditoria/src/app/auditoria/infrastructure/adapters/catalogo-novedades-http.adapter';
import { PendienteHttpAdapter } from '../../../auditoria/src/app/auditoria/infrastructure/adapters/pendiente-http.adapter';

// Interceptor de autenticación (passthrough en desarrollo — reemplazar por el real)
const authInterceptor: HttpInterceptorFn = (req, next) => next(req);

/**
 * Traduce el error del API al mensaje que ve el auditor.
 *
 * El servicio responde `{ status, estado, codigo, mensaje, idTraza, instante }`.
 * Sin esto, las pantallas mostrarían el texto crudo de Angular
 * («Http failure response for http://…: 412 Precondition Failed»), que además
 * expone la URL interna. El error se sigue propagando: no se traga ninguno.
 */
const apiErrorInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const cuerpo = error.error as { mensaje?: string; codigo?: string } | null;

      const mensaje = cuerpo?.mensaje
        ?? (error.status === 0
              ? 'No fue posible contactar el servicio de auditoría de cuentas médicas'
              : `El servicio respondió con un error (${error.status})`);

      return throwError(() => Object.assign(new Error(mensaje), {
        status: error.status,
        codigo: cuerpo?.codigo ?? null
      }));
    })
  );

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      APP_ROUTES,
      withComponentInputBinding(),
      // Las pantallas hijas (líneas, pendientes, seguimiento) reciben el :codigo
      // de la ruta padre como @Input; sin esto no lo heredarían.
      withRouterConfig({ paramsInheritanceStrategy: 'always' }),
      withViewTransitions()
    ),
    provideHttpClient(withInterceptors([authInterceptor, apiErrorInterceptor])),
    provideAnimationsAsync(),

    // ── Binding puerto → adaptador (Hexagonal Architecture) ──────────
    { provide: CuentaRepository,    useExisting: CuentaHttpAdapter },
    { provide: LineaRepository,     useExisting: LineaHttpAdapter },
    { provide: CatalogoNovedadesRepository, useExisting: CatalogoNovedadesHttpAdapter },
    { provide: PendienteRepository, useExisting: PendienteHttpAdapter },
  ]
};
