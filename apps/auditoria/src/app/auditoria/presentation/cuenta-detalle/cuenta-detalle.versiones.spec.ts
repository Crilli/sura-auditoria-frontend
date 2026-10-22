import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, Routes, provideRouter, withComponentInputBinding, withRouterConfig } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Observable, Subject, of, throwError } from 'rxjs';
import { CuentaDetalleComponent } from './cuenta-detalle.component';
import { CuentaRepository } from '../../domain/ports/cuenta.repository';
import { LineaRepository } from '../../domain/ports/linea.repository';
import { PendienteRepository } from '../../domain/ports/pendiente.repository';
import { CatalogoNovedadesRepository } from '../../domain/ports/catalogo-novedades.repository';
import {
  CuentaMedicaModel, FotoVersionModel, VersionCuentaModel
} from '../../domain/models/cuenta-medica.model';

/**
 * Navegar entre las versiones de la cuenta desde la barra (BTN-12): el selector, la foto de una
 * versión en lugar de la cuenta viva y lo que pasa con una versión que no tiene foto.
 *
 * Con el router de verdad y las rutas de la cuenta, pero con hijas de mentira: lo que se prueba
 * aquí es la vista de la cuenta, no las grillas (tienen sus propias pruebas). Ningún dato
 * identifica a una persona.
 */

@Component({ selector: 'sura-hija-de-prueba', standalone: true, template: '<p class="hija">hija</p>' })
class HijaDePrueba {}

/** Las mismas rutas que `auditoria.routes.ts`, con hijas de mentira. */
const RUTAS: Routes = [{
  path: ':codigo',
  component: CuentaDetalleComponent,
  children: [
    { path: '', pathMatch: 'full', redirectTo: 'lineas' },
    { path: 'lineas', component: HijaDePrueba },
    { path: 'pendientes', component: HijaDePrueba },
    { path: 'proceso', component: HijaDePrueba },
    {
      path: 'versiones/:numero',
      children: [
        { path: '', pathMatch: 'full', redirectTo: 'lineas' },
        { path: 'lineas', component: HijaDePrueba },
        { path: 'lineas/:numeroLinea', component: HijaDePrueba },
      ],
    },
  ],
}];

const cuenta = (cambios: Partial<CuentaMedicaModel> = {}): CuentaMedicaModel => ({
  codigo: 'CM-94421', estado: 'ADJUDICACION_MANUAL', fechaInicio: '2023-06-09', fechaFin: '2023-06-09',
  totalConvenido: 2_050_112, totalAutorizado: 129_390, version: 499, pendientesSinResolver: 0,
  informacionFacturacion: null, respuestasGlosa: [], novedades: [], ...cambios,
} as unknown as CuentaMedicaModel);

const version = (numero: number, estadoDesde: string): VersionCuentaModel => ({
  numero, fechaEntrada: '2023-06-09', valor: 2_050_112, estado: 'FINALIZADA', estadoDesde,
});

/** V1 a V4 en el histórico, de la más reciente a la más antigua, como las manda el servicio. */
const CUATRO = [
  version(4, '2026-09-20T15:00:00Z'), version(3, '2026-08-11T15:00:00Z'),
  version(2, '2026-07-02T15:00:00Z'), version(1, '2026-06-01T15:00:00Z'),
];

/** La foto de la V3: importes que no son los de la cuenta viva. */
const FOTO_V3: FotoVersionModel = {
  codigo: 'CM-94421', numero: 3, fechaEntrada: '2023-06-09', numeroFactura: 'FE-PRUEBA-3',
  prestador: 'Prestador de prueba', valorFactura: 3_333_000, totalCargado: 3_333_000,
  totalConvenido: 3_000_000, totalAutorizado: 2_900_000, totalGlosado: 333_000,
  totalNotasCredito: null, estadoActual: 'FINALIZADA',
  historial: [{ estado: 'FINALIZADA', desde: '2026-08-11T15:00:00Z' }],
};

/** Como lo deja el interceptor del API: un `Error` con el estado HTTP pegado. */
const errorHttp = (status: number, mensaje: string) =>
  throwError(() => Object.assign(new Error(mensaje), { status, codigo: status === 400 ? 'DECISION_INVALIDA' : null }));

describe('CuentaDetalleComponent — navegar entre versiones', () => {
  let harness: RouterTestingHarness;
  let consultarVersion: ReturnType<typeof vi.fn>;

  const montar = async (url: string, opciones: {
    cuenta?: CuentaMedicaModel;
    versiones?: VersionCuentaModel[];
    foto?: () => Observable<FotoVersionModel>;
    /** Para retener la cuenta viva o el histórico y ver la pantalla mientras llegan. */
    consultar?: () => Observable<CuentaMedicaModel>;
    consultarVersiones?: () => Observable<VersionCuentaModel[]>;
    /** `false` con algo retenido: la espera de estabilidad no acabaría nunca. */
    esperar?: boolean;
  } = {}) => {
    consultarVersion = vi.fn(opciones.foto ?? (() => of(FOTO_V3)));
    TestBed.configureTestingModule({
      providers: [
        provideRouter(RUTAS, withComponentInputBinding(),
          withRouterConfig({ paramsInheritanceStrategy: 'always' })),
        provideNoopAnimations(),
        { provide: CuentaRepository, useValue: {
            consultar: opciones.consultar ?? (() => of(opciones.cuenta ?? cuenta())),
            consultarAcciones: () => of({ codigo: 'CM-94421', accionesDisponibles: ['ENVIAR'] }),
            consultarVersiones: opciones.consultarVersiones ?? (() => of(opciones.versiones ?? CUATRO)),
            consultarVersion,
            consultarHistoria: () => of([]),
        } },
        { provide: LineaRepository, useValue: {} },
        { provide: PendienteRepository, useValue: { resumirMotivos: () => of([]) } },
        { provide: CatalogoNovedadesRepository, useValue: { listar: () => of([]) } },
      ],
    });
    harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(url, CuentaDetalleComponent);
    if (opciones.esperar === false) harness.detectChanges();
    else await estabilizar();
  };

  const estabilizar = async () => {
    harness.detectChanges();
    await harness.fixture.whenStable();
    harness.detectChanges();
  };

  const dom = (): HTMLElement => harness.routeNativeElement!;
  const enLaCapa = (selector: string) => document.querySelector<HTMLElement>(`.cdk-overlay-container ${selector}`);
  const todosEnLaCapa = (selector: string) =>
    [...document.querySelectorAll<HTMLElement>(`.cdk-overlay-container ${selector}`)];
  const url = () => TestBed.inject(Router).url;
  const texto = (e: Element | null | undefined) => e?.textContent?.replace(/\s+/g, ' ').trim() ?? '';

  const abrirSelector = async () => {
    dom().querySelector<HTMLButtonElement>('#btn-version')!.click();
    await estabilizar();
  };
  const abrirMenu = async () => {
    dom().querySelector<HTMLButtonElement>('#btn-menu-cuenta')!.click();
    await estabilizar();
  };

  afterEach(() => {
    // El menú abierto se queda en la capa superpuesta, que es del documento.
    document.querySelectorAll('.cdk-overlay-container').forEach(c => c.remove());
  });

  it('[BTN-12.1] en una cuenta reabierta el selector ofrece «V5 en curso · cuenta actual» y debajo V4…V1 con su estado y su fecha; la que se ve va marcada', async () => {
    await montar('/CM-94421/lineas');

    expect(texto(dom().querySelector('#btn-version'))).toContain('V5');
    expect(texto(dom().querySelector('#btn-version'))).toContain('en curso');
    // El nombre accesible empieza por lo que se lee en el botón.
    expect(dom().querySelector('#btn-version')?.getAttribute('aria-label'))
      .toBe('Versión V5 en curso: la cuenta actual. Cambiar de versión');
    await abrirSelector();

    const opciones = todosEnLaCapa('.menu-versiones [mat-menu-item]');
    expect(opciones.map(o => o.id)).toEqual([
      'menu-version-actual', 'menu-version-4', 'menu-version-3', 'menu-version-2', 'menu-version-1',
    ]);
    expect(texto(opciones[0])).toContain('V5 · en curso · cuenta actual');
    expect(texto(opciones[0])).toContain('Adjudicación manual');
    expect(opciones[0].getAttribute('aria-current')).toBe('page');
    expect(opciones[0].getAttribute('href')).toBe('/CM-94421/lineas');
    expect(texto(opciones[2])).toContain('Finalizada el 11/08/2026');
    expect(opciones[2].getAttribute('href')).toBe('/CM-94421/versiones/3');
    expect(opciones.slice(1).every(o => !o.hasAttribute('aria-current'))).toBe(true);
  });

  it('[BTN-12.2] al elegir la V3 la URL lleva la versión y se ve su foto, no la cuenta viva', async () => {
    await montar('/CM-94421/lineas');
    expect(dom().querySelector('.header-resumen')).not.toBeNull();

    await abrirSelector();
    enLaCapa('#menu-version-3')!.click();
    await estabilizar();

    expect(url()).toBe('/CM-94421/versiones/3/lineas');
    expect(consultarVersion).toHaveBeenCalledWith('CM-94421', 3);
    // La cabecera es la de la V3: sus importes, no los de la cuenta viva.
    const foto = dom().querySelector('sura-foto-version')!;
    expect(foto.textContent!.replace(/\D/g, '')).toContain('3333000');
    expect(dom().querySelector('.header-resumen')).toBeNull();
    expect(dom().textContent!.replace(/\D/g, '')).not.toContain('2050112');
    expect(texto(dom().querySelector('#btn-version'))).toContain('V3');
    expect(texto(dom().querySelector('#btn-version'))).toContain('foto');
    expect(dom().querySelector('#btn-version')?.getAttribute('aria-label'))
      .toBe('Versión V3 foto: cómo quedó al finalizarse. Cambiar de versión');

    // Y el selector marca ahora la V3.
    await abrirSelector();
    expect(enLaCapa('#menu-version-3')?.getAttribute('aria-current')).toBe('page');
    expect(enLaCapa('#menu-version-actual')?.hasAttribute('aria-current')).toBe(false);
  });

  it('[BTN-12.3] en la foto no hay Enviar, ni atajo a acciones, ni Pendientes ni Seguimiento, ni nada editable; un aviso dice qué versión es y ofrece volver', async () => {
    await montar('/CM-94421/versiones/3');

    expect(url()).toBe('/CM-94421/versiones/3/lineas');
    // Enviar desaparece —no se apaga— y en su sitio está la vuelta a la cuenta actual.
    expect(dom().querySelector('#btn-enviar')).toBeNull();
    expect(dom().querySelector('#btn-ir-a-actual')?.getAttribute('href')).toBe('/CM-94421/lineas');
    expect(dom().querySelector('.barra-cuenta')!.classList).toContain('barra-cuenta--foto');

    const aviso = dom().querySelector('[role="note"]')!;
    expect(texto(aviso)).toContain('Estás viendo la V3 tal como quedó al finalizarse');
    expect(texto(aviso)).toContain('no se puede editar');
    expect(aviso.querySelector('a')?.getAttribute('href')).toBe('/CM-94421/lineas');

    // Una sola pestaña, la de las líneas de la versión, y un solo outlet.
    const pestanas = [...dom().querySelectorAll('.pestanas-cuenta [mat-tab-link]')];
    expect(pestanas.map(p => texto(p))).toEqual(['Líneas · V3']);
    expect(pestanas[0].getAttribute('href')).toBe('/CM-94421/versiones/3/lineas');
    expect(dom().querySelectorAll('router-outlet')).toHaveLength(1);
    expect(dom().querySelector('.hija')).not.toBeNull();

    // Nada de la cabecera viva que se pueda tocar: ni acciones, ni novedades editables.
    expect(dom().querySelector('#panel-datos-cuenta')).toBeNull();
    expect(dom().querySelector('sura-seccion-novedades')).toBeNull();
    expect(dom().querySelector('.acciones-disponibles')).toBeNull();
    expect(dom().querySelector('input, textarea, select, mat-checkbox')).toBeNull();

    await abrirMenu();
    expect(enLaCapa('#menu-historia')).not.toBeNull();
    expect(enLaCapa('#menu-acciones')).toBeNull();
    expect(enLaCapa('#menu-version')).toBeNull();
  });

  it('[BTN-13.9] [EST-02.6] en la foto de una versión no hay botón de envío ni «Pasar a Modificación», tampoco en el menú', async () => {
    // Una cuenta viva que sí los tendría: en adjudicación manual, con las dos acciones publicadas.
    await montar('/CM-94421/versiones/3', { cuenta: cuenta({ estado: 'ADJUDICACION_MANUAL' }) });

    expect(dom().querySelector('#btn-enviar')).toBeNull();
    expect(dom().querySelector('#btn-pasar-a-modificacion')).toBeNull();
    await abrirMenu();
    expect(enLaCapa('#menu-pasar-a-modificacion')).toBeNull();
  });

  it('[BTN-12.3] volver a la cuenta actual deja la foto y trae de nuevo la cabecera viva y sus tres pestañas', async () => {
    await montar('/CM-94421/versiones/3');

    dom().querySelector<HTMLAnchorElement>('#btn-ir-a-actual')!.click();
    await estabilizar();

    expect(url()).toBe('/CM-94421/lineas');
    expect(dom().querySelector('#btn-enviar')).not.toBeNull();
    expect(dom().querySelector('.header-resumen')).not.toBeNull();
    expect(dom().querySelector('[role="note"]')).toBeNull();
    expect([...dom().querySelectorAll('.pestanas-cuenta [mat-tab-link]')].map(p => texto(p).split(' ')[0]))
      .toEqual(['Líneas', 'Pendientes', 'Seguimiento']);
  });

  it('[BTN-12.4] el enlace de una línea de la versión, abierto directamente, enseña la misma foto sin pasar por el buscador', async () => {
    await montar('/CM-94421/versiones/3/lineas/127');

    expect(consultarVersion).toHaveBeenCalledWith('CM-94421', 3);
    expect(dom().querySelector('sura-foto-version')).not.toBeNull();
    expect(dom().querySelector('.hija')).not.toBeNull();
    expect(texto(dom().querySelector('#btn-version'))).toContain('V3');
  });

  it('[BTN-12.5] una versión que no está en el histórico dice que no tiene foto y ofrece volver; no pinta una foto en blanco ni la cuenta viva', async () => {
    await montar('/CM-94421/versiones/9', {
      foto: () => errorHttp(400, 'La cuenta CM-94421 no tiene versión 9 en el histórico de lo transmitido'),
    });

    const sinFoto = dom().querySelector('#sin-foto')!;
    expect(texto(sinFoto)).toContain('La V9 no tiene foto');
    expect(texto(sinFoto)).toContain('de la V1 a la V4');
    expect(sinFoto.querySelector('#btn-volver-sin-foto')?.getAttribute('href')).toBe('/CM-94421/lineas');
    expect(dom().querySelector('sura-foto-version')).toBeNull();
    expect(dom().querySelector('[role="note"]')).toBeNull();
    expect(dom().querySelector('.header-resumen')).toBeNull();
    expect(dom().querySelector('router-outlet')).toBeNull();
    expect(dom().querySelector('#btn-enviar')).toBeNull();
  });

  it('[BTN-12.5] la que se está trabajando existe pero no tiene foto: se dice que es la cuenta actual', async () => {
    await montar('/CM-94421/versiones/5', {
      foto: () => errorHttp(400, 'La cuenta CM-94421 no tiene versión 5 en el histórico de lo transmitido'),
    });

    expect(texto(dom().querySelector('#sin-foto'))).toContain('La V5 se está trabajando: es la cuenta actual');
    expect(dom().querySelector('#btn-volver-sin-foto')?.getAttribute('href')).toBe('/CM-94421/lineas');
  });

  it('[BTN-12.5] mientras llega la foto no dice «Estás viendo la V3»: dice, sin alarma, que la está comprobando', async () => {
    const foto$ = new Subject<FotoVersionModel>();
    await montar('/CM-94421/versiones/3', { foto: () => foto$, esperar: false });

    const comprobando = dom().querySelector('#comprobando-version')!;
    expect(comprobando.getAttribute('role')).toBe('status');
    expect(texto(comprobando)).toBe('Comprobando la V3…');
    expect(dom().querySelector('[role="note"]')).toBeNull();
    expect(dom().querySelector('[role="alert"]')).toBeNull();
    expect(dom().textContent).not.toContain('Estás viendo');
    expect(dom().textContent).not.toContain('no tiene foto');

    foto$.next(FOTO_V3);
    foto$.complete();
    await estabilizar();

    expect(dom().querySelector('#comprobando-version')).toBeNull();
    expect(texto(dom().querySelector('[role="note"]'))).toContain('Estás viendo la V3 tal como quedó al finalizarse');
    expect(dom().querySelector('.hija')).not.toBeNull();
  });

  it('[BTN-12.5] la versión en curso pegada por URL no se da por inexistente mientras llegan la cuenta y su histórico', async () => {
    const cuenta$ = new Subject<CuentaMedicaModel>();
    const versiones$ = new Subject<VersionCuentaModel[]>();
    await montar('/CM-94421/versiones/5', {
      foto: () => errorHttp(400, 'La cuenta CM-94421 no tiene versión 5 en el histórico de lo transmitido'),
      consultar: () => cuenta$, consultarVersiones: () => versiones$, esperar: false,
    });

    // El 400 ya llegó, pero sin la cuenta ni el histórico no se sabe si la V5 es la que se trabaja.
    expect(texto(dom().querySelector('#comprobando-version'))).toBe('Comprobando la V5…');
    expect(dom().querySelector('#sin-foto')).toBeNull();
    expect(dom().querySelector('[role="alert"]')).toBeNull();
    expect(dom().textContent).not.toContain('no tiene versiones finalizadas');

    versiones$.next(CUATRO);
    versiones$.complete();
    harness.detectChanges();
    expect(dom().querySelector('#comprobando-version')).not.toBeNull();
    expect(dom().querySelector('#sin-foto')).toBeNull();

    cuenta$.next(cuenta());
    cuenta$.complete();
    await estabilizar();

    expect(dom().querySelector('#comprobando-version')).toBeNull();
    expect(texto(dom().querySelector('#sin-foto'))).toContain('La V5 se está trabajando: es la cuenta actual');
  });

  it('[BTN-12.5] si el histórico no se pudo consultar no dice que la cuenta no tiene versiones: solo que esa no tiene foto', async () => {
    await montar('/CM-94421/versiones/9', {
      foto: () => errorHttp(400, 'La cuenta CM-94421 no tiene versión 9 en el histórico de lo transmitido'),
      consultarVersiones: () => errorHttp(503, 'El servicio respondió con un error (503)'),
    });

    const sinFoto = texto(dom().querySelector('#sin-foto'));
    expect(sinFoto).toContain('La V9 no tiene foto');
    expect(sinFoto).not.toContain('no tiene versiones finalizadas');
    expect(sinFoto).toContain('No se pudo consultar de qué versiones hay foto');
  });

  it('[BTN-12.5] «todavía no tiene versiones finalizadas» solo con el histórico cargado y vacío', async () => {
    await montar('/CM-94421/versiones/1', {
      versiones: [],
      foto: () => errorHttp(400, 'La cuenta CM-94421 no tiene versión 1 en el histórico de lo transmitido'),
    });

    expect(texto(dom().querySelector('#sin-foto'))).toContain('Esta cuenta todavía no tiene versiones finalizadas');
  });

  it('[BTN-12.5] una dirección que no lleva un número de versión no consulta nada y lo dice', async () => {
    await montar('/CM-94421/versiones/tres');

    expect(consultarVersion).not.toHaveBeenCalled();
    expect(texto(dom().querySelector('#sin-foto'))).toContain('no tiene foto');
  });

  it('[BTN-12] si la foto no llega por un fallo del servicio, lo dice y deja reintentar sin perder las líneas', async () => {
    let intento = 0;
    await montar('/CM-94421/versiones/3', {
      foto: () => ++intento === 1 ? errorHttp(503, 'El servicio respondió con un error (503)') : of(FOTO_V3),
    });

    expect(texto(dom().querySelector('#error-foto'))).toContain('503');
    expect(dom().querySelector('#sin-foto')).toBeNull();
    // Sin foto no se afirma que se esté viendo esa versión.
    expect(dom().querySelector('[role="note"]')).toBeNull();
    expect(dom().querySelector('.hija')).not.toBeNull();

    dom().querySelector<HTMLButtonElement>('#btn-reintentar-foto')!.click();
    await estabilizar();

    expect(consultarVersion).toHaveBeenCalledTimes(2);
    expect(dom().querySelector('sura-foto-version')).not.toBeNull();
  });

  it('[BTN-12.6] una cuenta sin transmitir no tiene selector de versión y no aparece ningún error', async () => {
    await montar('/CM-94421/lineas', { versiones: [] });

    expect(dom().querySelector('#btn-version')).toBeNull();
    expect(dom().querySelector('#btn-enviar')).not.toBeNull();
    expect(dom().querySelector('.error-banner, [role="alert"]')).toBeNull();
  });

  it('[BTN-12.7] en una cuenta finalizada no hay versión en curso: la V4 es la vigente y lleva a la cuenta actual', async () => {
    await montar('/CM-94421/lineas', { cuenta: cuenta({ estado: 'FINALIZADA' }) });

    // Finalizada, el botón de envío desaparece (BTN-13.5) y en la barra queda el paso a Modificación.
    expect(dom().querySelector('#btn-enviar')).toBeNull();
    expect(dom().querySelector('#btn-pasar-a-modificacion')).not.toBeNull();

    await abrirSelector();
    const opciones = todosEnLaCapa('.menu-versiones [mat-menu-item]');
    expect(opciones.map(o => o.id)).toEqual(['menu-version-actual', 'menu-version-3', 'menu-version-2', 'menu-version-1']);
    expect(texto(opciones[0])).toContain('V4 · vigente · cuenta actual');
    expect(opciones[0].getAttribute('href')).toBe('/CM-94421/lineas');
    expect(opciones.map(o => texto(o)).join(' ')).not.toContain('en curso');
  });

  it('[BTN-04] «Última versión transmitida» de la cabecera lleva a la foto de esa versión', async () => {
    await montar('/CM-94421/lineas');

    const enlace = dom().querySelector<HTMLAnchorElement>('.enlace-version')!;
    expect(enlace.getAttribute('href')).toBe('/CM-94421/versiones/4');
    enlace.click();
    await estabilizar();

    expect(url()).toBe('/CM-94421/versiones/4/lineas');
    expect(consultarVersion).toHaveBeenCalledWith('CM-94421', 4);
  });
});
