import { Routes } from '@angular/router';

export const AUDITORIA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./presentation/cuenta-busqueda/cuenta-busqueda.component')
        .then(m => m.CuentaBusquedaComponent)
  },
  {
    path: ':codigo',
    loadComponent: () =>
      import('./presentation/cuenta-detalle/cuenta-detalle.component')
        .then(m => m.CuentaDetalleComponent),
    children: [
      {
        // Al abrir la cuenta se muestran sus líneas: sin esto el área bajo las
        // pestañas queda vacía.
        path: '',
        pathMatch: 'full',
        redirectTo: 'lineas'
      },
      {
        path: 'lineas',
        loadComponent: () =>
          import('./presentation/lineas-list/lineas-list.component')
            .then(m => m.LineasListComponent)
      },
      {
        // Consulta de la línea: la misma pantalla, sin formulario. El modo
        // viaja en `data` y llega al componente como `input()`, porque
        // `withComponentInputBinding()` está activo (app.config.ts).
        path: 'lineas/:referencia',
        data: { modo: 'lectura' },
        loadComponent: () =>
          import('./presentation/linea-edicion/linea-edicion.component')
            .then(m => m.LineaEdicionComponent)
      },
      {
        path: 'lineas/:referencia/editar',
        data: { modo: 'edicion' },
        loadComponent: () =>
          import('./presentation/linea-edicion/linea-edicion.component')
            .then(m => m.LineaEdicionComponent)
      },
      {
        path: 'pendientes',
        loadComponent: () =>
          import('./presentation/pendientes-list/pendientes-list.component')
            .then(m => m.PendientesListComponent)
      },
      {
        path: 'proceso',
        loadComponent: () =>
          import('./presentation/proceso-seguimiento/proceso-seguimiento.component')
            .then(m => m.ProcesoSeguimientoComponent)
      },
      {
        // La foto de una versión del histórico (BTN-12, BUS-21), en solo lectura. Hija de la
        // cuenta para que la barra fija (BTN-11) sea la misma y cambiar de versión no recargue
        // la cuenta viva. Sin componente propio: la cabecera de la foto la pinta la vista de la
        // cuenta, que sabe qué versión se ve leyendo este `:numero` de la URL.
        //
        // Aquí no hay `editar`, ni pendientes, ni seguimiento, y a propósito: lo que se
        // reutilizara de la cuenta viva escribiría en ella —todas sus órdenes van a
        // /cuentas/{codigo}—, con la barra diciendo que se está en otra versión. La solo
        // lectura queda garantizada por la forma de las rutas, no por un `@if`.
        path: 'versiones/:numero',
        children: [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'lineas'
          },
          {
            path: 'lineas',
            loadComponent: () =>
              import('./presentation/lineas-version/lineas-version.component')
                .then(m => m.LineasVersionComponent)
          },
          {
            path: 'lineas/:numeroLinea',
            loadComponent: () =>
              import('./presentation/linea-version/linea-version.component')
                .then(m => m.LineaVersionComponent)
          }
        ]
      }
    ]
  }
];
