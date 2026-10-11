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
      }
    ]
  }
];
