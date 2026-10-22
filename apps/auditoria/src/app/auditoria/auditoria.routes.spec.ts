import { Route } from '@angular/router';
import { AUDITORIA_ROUTES } from './auditoria.routes';

/**
 * La forma de las rutas de una versión (BTN-12). La solo lectura de la foto no depende de un
 * `@if` en una plantilla: bajo `versiones/:numero` no existe ninguna pantalla que escriba.
 */

const cuenta = AUDITORIA_ROUTES.find(r => r.path === ':codigo')!;
const version = cuenta.children!.find(r => r.path === 'versiones/:numero')!;

/** Todas las rutas que cuelgan de una, a cualquier profundidad. */
const descendientes = (r: Route): Route[] =>
  (r.children ?? []).flatMap(h => [h, ...descendientes(h)]);

describe('rutas de la foto de una versión', () => {

  it('[BTN-12.3] cuelgan de la cuenta y solo llevan a sus líneas: nada de editar, pendientes ni seguimiento', () => {
    expect(version).toBeDefined();
    expect(version.component).toBeUndefined();
    expect(version.loadComponent).toBeUndefined();

    const caminos = descendientes(version).map(r => r.path);
    expect(caminos).toEqual(['', 'lineas', 'lineas/:numeroLinea']);
    expect(caminos.join(' ')).not.toMatch(/editar|pendientes|proceso/);
  });

  it('[BTN-12.4] la versión sola lleva a sus líneas, como la cuenta', () => {
    const vacia = version.children!.find(r => r.path === '')!;
    expect(vacia).toMatchObject({ pathMatch: 'full', redirectTo: 'lineas' });
  });

  it('[BUS-21] la grilla y la línea de la versión son pantallas propias, no las de la cuenta actual', async () => {
    const grilla = await version.children!.find(r => r.path === 'lineas')!.loadComponent!();
    const linea = await version.children!.find(r => r.path === 'lineas/:numeroLinea')!.loadComponent!();

    expect((grilla as { name: string }).name).toBe('LineasVersionComponent');
    expect((linea as { name: string }).name).toBe('LineaVersionComponent');
  });
});
