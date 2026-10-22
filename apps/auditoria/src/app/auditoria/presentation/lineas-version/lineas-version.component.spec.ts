import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NavigationEnd, Router, Routes, provideRouter, withComponentInputBinding, withRouterConfig } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Observable, Subject, filter, firstValueFrom, of, switchMap, take, throwError } from 'rxjs';
import { LineasVersionComponent } from './lineas-version.component';
import { CuentaRepository } from '../../domain/ports/cuenta.repository';
import { LineaDeVersionModel } from '../../domain/models/linea-de-version.model';
import { OffsetPage } from '../../../../../../../libs/data-access/http/src/lib/offset-page.model';

/**
 * La grilla de las líneas de una versión (BUS-21): en solo lectura y sin tocar el estado de la
 * cuenta actual. Las líneas imitan lo medido en UAT el 2026-10-21 (CM-28143, glosa 223-1A);
 * ningún dato identifica a una persona.
 *
 * Con el router de verdad y la ruta real de la grilla, colgada de `:codigo/versiones/:numero`: el
 * ojo de cada fila va relativo a ella, y la página viaja en la URL.
 */

@Component({ selector: 'sura-detalle-de-prueba', standalone: true, template: '<p>detalle</p>' })
class DetalleDePrueba {}

/** Las mismas rutas que `auditoria.routes.ts` bajo la versión; el detalle, de mentira. */
const RUTAS: Routes = [{
  path: ':codigo',
  children: [{
    path: 'versiones/:numero',
    children: [
      { path: 'lineas', component: LineasVersionComponent },
      { path: 'lineas/:numeroLinea', component: DetalleDePrueba },
    ],
  }],
}];

const linea = (numeroLinea: number, cambios: Partial<LineaDeVersionModel> = {}): LineaDeVersionModel => ({
  numeroLinea, estado: 'APROBADA', fechaInicio: '2025-03-04', fechaFin: '2025-03-04',
  codigoProcedimiento: '890201', descripcionProcedimiento: 'Consulta de primera vez',
  catalogoProcedimiento: 'CUPS', codigoAfiliado: 'CC000000001', nombreAfiliado: 'Prueba',
  codigoAutorizacion: 'AUT-1', prestadorCodigo: 'NI-1', prestadorNombre: 'Prestador de prueba',
  valorCargado: 77_958.5, unidadesCargadas: 1, valorConvenido: 70_959.5, unidadesConvenidas: 1,
  valorAutorizado: 70_960, unidadesAutorizadas: 1, valorGlosado: 6_999, valorIva: null, porcentajeIva: null,
  glosas: [{
    secuencia: 1, codigo: '223-1A', valor: 6_999, codigoNotaCredito: null, valorNotaCredito: null,
    concepto: null, conceptoEspecifico: null, texto: null, tipo: 'Manual',
  }],
  ...cambios,
});

const pagina = (elementos: LineaDeVersionModel[], cambios: Partial<OffsetPage<LineaDeVersionModel>> = {})
  : OffsetPage<LineaDeVersionModel> => ({
  elementos, desplazamiento: 0, tamanoPagina: 25, pagina: 0,
  totalRegistros: elementos.length, totalPaginas: elementos.length ? 1 : 0, hayMas: false, ...cambios,
});

/** Una versión de 60 líneas servida como el servicio: de 25 en 25, la tercera página con 10. */
const SESENTA = (_c: string, _n: number, p: number): Observable<OffsetPage<LineaDeVersionModel>> => {
  const desde = p * 25;
  const hasta = Math.min(desde + 25, 60);
  return of(pagina(Array.from({ length: Math.max(hasta - desde, 0) }, (_, i) => linea(desde + i + 1)),
    { desplazamiento: desde, pagina: p, totalRegistros: 60, totalPaginas: 3, hayMas: hasta < 60 }));
};

describe('LineasVersionComponent', () => {
  let harness: RouterTestingHarness;
  let listar: ReturnType<typeof vi.fn>;

  const montar = async (respuesta: (codigo: string, numero: number, pagina: number, tamano: number)
                          => Observable<OffsetPage<LineaDeVersionModel>>,
                        url = '/CM-28143/versiones/8/lineas') => {
    listar = vi.fn(respuesta);
    TestBed.configureTestingModule({
      providers: [
        provideRouter(RUTAS, withComponentInputBinding(),
          withRouterConfig({ paramsInheritanceStrategy: 'always' })),
        provideNoopAnimations(),
        // Solo lo de leer una versión: si la grilla pidiera algo de la cuenta actual —sus
        // líneas, guardar, aplicar en lote—, la prueba fallaría por no encontrarlo.
        { provide: CuentaRepository, useValue: { listarLineasDeVersion: listar } },
      ],
    });
    harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(url, LineasVersionComponent);
    await estabilizar();
  };

  const estabilizar = async () => {
    harness.detectChanges();
    await harness.fixture.whenStable();
    harness.detectChanges();
  };

  /** Pulsa y espera a que termine la navegación, pero no a la respuesta: puede estar retenida. */
  const pulsarYNavegar = async (boton: HTMLElement) => {
    const navego = firstValueFrom(TestBed.inject(Router).events.pipe(filter(e => e instanceof NavigationEnd)));
    boton.click();
    await navego;
    harness.detectChanges();
  };

  const dom = (): HTMLElement => harness.routeNativeElement!;
  const url = () => TestBed.inject(Router).url;
  const texto = (e: Element | null | undefined) => e?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
  const celda = (fila: number, columna: string) =>
    dom().querySelectorAll('tr.mat-mdc-row')[fila]?.querySelector(`.mat-column-${columna}`);
  const cifras = (fila: number, columna: string) => texto(celda(fila, columna)).replace(/\D/g, '');

  it('[BUS-21.1] pide las líneas de esa versión, de 25 en 25, y pinta su estado, prestación, afiliado, fechas, valores y glosa', async () => {
    // Importes distintos entre sí y que no se confunden al redondear: si una columna pintara el
    // valor de otra, o se cruzaran, se notaría.
    await montar(() => of(pagina([
      linea(3, { valorCargado: 77_958, unidadesCargadas: 3, valorConvenido: 70_000, unidadesConvenidas: 2,
                 valorAutorizado: 65_000, unidadesAutorizadas: 1, valorIva: 1_900, porcentajeIva: 19 }),
      linea(127, { estado: 'NEGADA' }),
    ])));

    expect(listar).toHaveBeenCalledWith('CM-28143', 8, 0, 25);
    expect(dom().querySelectorAll('tr.mat-mdc-row')).toHaveLength(2);
    expect(texto(dom().querySelector('h2'))).toBe('Líneas de la V8');

    expect(texto(celda(0, 'numeroLinea'))).toBe('3');
    expect(texto(celda(0, 'estado'))).toBe('Aprobada');
    expect(texto(celda(1, 'estado'))).toBe('Negada');
    expect(texto(celda(0, 'atencion'))).toContain('04/03/2025');
    expect(texto(celda(0, 'atencion'))).toContain('Aut. AUT-1');
    expect(texto(celda(0, 'procedimiento'))).toContain('890201');
    expect(texto(celda(0, 'procedimiento'))).toContain('Consulta de primera vez');
    expect(texto(celda(0, 'afiliado'))).toContain('CC000000001');
    // Sin depender del formato regional: solo las cifras, el valor y debajo su cantidad o su %.
    // Convenido = allowed* y autorizado = covered* (decisión del 2026-10-21).
    expect(cifras(0, 'valorCargado')).toBe('779583');
    expect(cifras(0, 'valorConvenido')).toBe('700002');
    expect(cifras(0, 'iva')).toBe('190019');
    expect(cifras(0, 'valorAutorizado')).toBe('650001');
    // El valor glosado y, debajo, el causal de su desglose.
    expect(texto(celda(0, 'valorGlosado'))).toContain('223-1A');
    expect(cifras(0, 'valorGlosado')).toContain('6999');
  });

  it('[BUS-21] [GRID-10] [GRID-12] mismas columnas y rótulos que la grilla de la cuenta actual', async () => {
    await montar(() => of(pagina([linea(3)])));

    const cabeceras = [...dom().querySelectorAll('th.mat-mdc-header-cell')].map(th => texto(th))
      .filter(t => /^(V\.|IVA)/.test(t));
    expect(cabeceras).toEqual(['V. Cargado', 'V. Convenido', 'V. Autorizado', 'IVA', 'V. Glosado']);
    expect(texto(dom())).not.toContain('Cubierto');
  });

  it('[BUS-21.3] un importe que no vino se pinta como raya, no como cero; un cero es un cero', async () => {
    await montar(() => of(pagina([linea(1, {
      valorConvenido: null, unidadesConvenidas: null, valorIva: null, valorGlosado: null, glosas: [],
      valorAutorizado: 0,
    })])));

    expect(texto(celda(0, 'valorConvenido'))).toBe('—');
    expect(texto(celda(0, 'iva'))).toBe('—');
    expect(texto(celda(0, 'valorGlosado'))).toBe('—');
    expect(cifras(0, 'valorAutorizado')).toBe('01');
  });

  it('[BTN-12.3] es de solo lectura: ni casillas, ni lápiz, ni edición en la fila; solo el ojo que abre la línea en la versión', async () => {
    await montar(() => of(pagina([linea(3), linea(127)], { desplazamiento: 25, pagina: 1, totalRegistros: 27, totalPaginas: 2 })),
                 '/CM-28143/versiones/8/lineas?pagina=2');

    expect(dom().querySelector('mat-checkbox, input, textarea, select, [contenteditable]')).toBeNull();
    expect([...dom().querySelectorAll('mat-icon')].map(i => i.textContent?.trim()))
      .not.toContain('edit');
    expect(texto(dom().querySelector('.lineas-version__modo'))).toContain('solo lectura');

    // El ojo lleva a la línea dentro de la versión, con su sitio en el orden para anterior y siguiente.
    expect(dom().querySelector('#btn-ver-linea-version-127')?.getAttribute('href'))
      .toBe('/CM-28143/versiones/8/lineas/127?posicion=26');
  });

  it('[BUS-21.4] pagina por la URL: la página 2 pide el desplazamiento 25 y dice el rango y el total', async () => {
    await montar(SESENTA, '/CM-28143/versiones/8/lineas?pagina=2');

    expect(listar).toHaveBeenCalledWith('CM-28143', 8, 1, 25);
    expect(texto(dom().querySelector('.paginador__rango'))).toBe('26–50 de 60 líneas');
    expect(dom().querySelector('#btn-version-pagina-2')?.getAttribute('aria-current')).toBe('page');

    await pulsarYNavegar(dom().querySelector<HTMLButtonElement>('#btn-version-pagina-siguiente')!);
    expect(url()).toBe('/CM-28143/versiones/8/lineas?pagina=3');

    // A la primera, sin `?pagina=`: la URL de la versión queda limpia.
    await estabilizar();
    await pulsarYNavegar(dom().querySelector<HTMLButtonElement>('#btn-version-pagina-1')!);
    expect(url()).toBe('/CM-28143/versiones/8/lineas');
  });

  it('[BUS-21.4] se llega a la última: 51–60 de 60, y «siguiente» apagado no lleva a ninguna parte', async () => {
    await montar(SESENTA, '/CM-28143/versiones/8/lineas?pagina=3');

    expect(listar).toHaveBeenCalledWith('CM-28143', 8, 2, 25);
    expect(dom().querySelectorAll('tr.mat-mdc-row')).toHaveLength(10);
    expect(texto(dom().querySelector('.paginador__rango'))).toBe('51–60 de 60 líneas');
    const siguiente = dom().querySelector<HTMLButtonElement>('#btn-version-pagina-siguiente')!;
    expect(siguiente.getAttribute('aria-disabled')).toBe('true');
    expect(dom().querySelector('#btn-version-pagina-anterior')?.hasAttribute('aria-disabled')).toBe(false);

    siguiente.click();
    await estabilizar();
    expect(url()).toBe('/CM-28143/versiones/8/lineas?pagina=3');
    expect(listar).toHaveBeenCalledTimes(1);
  });

  it('[BUS-21.4] al cambiar de página la tabla se queda, atenuada, y el botón pulsado conserva el foco hasta que llega la nueva', async () => {
    let retenida: Subject<void> | null = null;
    await montar((c, n, p, t) => retenida ? retenida.pipe(take(1), switchMap(() => SESENTA(c, n, p))) : SESENTA(c, n, p),
                 '/CM-28143/versiones/8/lineas?pagina=2');
    const siguiente = dom().querySelector<HTMLButtonElement>('#btn-version-pagina-siguiente')!;
    siguiente.focus();

    retenida = new Subject<void>();
    await pulsarYNavegar(siguiente);

    // La página 2 sigue a la vista, atenuada, y el botón es el mismo, con el foco, apagado.
    expect(dom().querySelector('.lineas-version__cargando')).toBeNull();
    expect(dom().querySelector('.lineas-version__tabla')!.classList).toContain('lineas-version__tabla--cargando');
    expect(dom().querySelector('.lineas-version__tabla')!.getAttribute('aria-busy')).toBe('true');
    expect(texto(celda(0, 'numeroLinea'))).toBe('26');
    expect(dom().querySelector('#btn-version-pagina-siguiente')).toBe(siguiente);
    expect(document.activeElement).toBe(siguiente);
    expect(siguiente.getAttribute('aria-disabled')).toBe('true');

    retenida.next();
    retenida.complete();
    await estabilizar();

    expect(texto(celda(0, 'numeroLinea'))).toBe('51');
    expect(dom().querySelector('.lineas-version__tabla')!.classList).not.toContain('lineas-version__tabla--cargando');
    expect(dom().querySelector('#btn-version-pagina-siguiente')).toBe(siguiente);
    expect(document.activeElement).toBe(siguiente);
  });

  it('[BUS-21.4] una página después de la última lo dice, sin confundirla con una versión sin líneas, y lleva a la primera', async () => {
    await montar(SESENTA, '/CM-28143/versiones/8/lineas?pagina=6');

    expect(texto(dom().querySelector('.lineas-version__vacia'))).toContain('Esta página ya no tiene líneas');
    expect(dom().querySelector('#sin-lineas-version')).toBeNull();

    await pulsarYNavegar(dom().querySelector<HTMLButtonElement>('#btn-version-primera-pagina')!);
    // Mientras llega la primera sigue la vacía, y no por eso la versión «no tiene líneas».
    expect(dom().querySelector('#sin-lineas-version')).toBeNull();
    await estabilizar();

    expect(url()).toBe('/CM-28143/versiones/8/lineas');
    expect(texto(dom().querySelector('.paginador__rango'))).toBe('1–25 de 60 líneas');
  });

  it('[BUS-21.6] una versión que existe sin líneas lo dice, y no como un error', async () => {
    await montar(() => of(pagina([])));

    expect(texto(dom().querySelector('#sin-lineas-version'))).toContain('La V8 no tiene líneas');
    expect(dom().querySelector('[role="alert"]')).toBeNull();
    expect(dom().querySelector('table')).toBeNull();
  });

  it('[BUS-21.6] una versión que no existe es un error que la nombra, no una lista vacía', async () => {
    await montar(() => throwError(() => Object.assign(
      new Error('La cuenta CM-28143 no tiene versión 8 en el histórico de lo transmitido'), { status: 400 })));

    expect(texto(dom().querySelector('[role="alert"]'))).toContain('no tiene versión 8');
    expect(dom().querySelector('#sin-lineas-version')).toBeNull();
  });

  it('[BUS-21] si el servicio falla, lo dice y deja reintentar; mientras reintenta, el aviso y su botón se quedan', async () => {
    let intento = 0;
    let retenida: Subject<void> | null = null;
    await montar(() => {
      if (++intento === 1) {
        return throwError(() => Object.assign(new Error('El servicio respondió con un error (503)'), { status: 503 }));
      }
      return retenida!.pipe(take(1), switchMap(() => of(pagina([linea(3)]))));
    });

    expect(texto(dom().querySelector('#error-lineas-version'))).toContain('503');
    const reintentar = dom().querySelector<HTMLButtonElement>('#btn-reintentar-lineas-version')!;
    reintentar.focus();
    retenida = new Subject<void>();
    reintentar.click();
    harness.detectChanges();

    expect(dom().querySelector('#btn-reintentar-lineas-version')).toBe(reintentar);
    expect(document.activeElement).toBe(reintentar);
    expect(reintentar.getAttribute('aria-disabled')).toBe('true');
    expect(texto(reintentar)).toBe('Reintentando…');

    retenida.next();
    retenida.complete();
    await estabilizar();

    expect(listar).toHaveBeenCalledTimes(2);
    expect(dom().querySelectorAll('tr.mat-mdc-row')).toHaveLength(1);
  });
});
