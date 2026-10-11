import { Routes } from '@angular/router';

export const APP_ROUTES: Routes = [
  {
    // El micro-frontend de auditoría se publica bajo /auditoria: es la ruta a la
    // que ya navega la búsqueda de cuentas y la que espera el gateway.
    path: 'auditoria',
    loadChildren: () =>
      import('../../../auditoria/src/app/auditoria/auditoria.routes').then(m => m.AUDITORIA_ROUTES)
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'auditoria'
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '**',
    loadComponent: () =>
      import('./not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];
