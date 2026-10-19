import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltip } from '@angular/material/tooltip';
import { NEVER, Observable, of, throwError } from 'rxjs';
import { CuentaDetalleComponent } from './cuenta-detalle.component';
import { CuentaRepository } from '../../domain/ports/cuenta.repository';
import { LineaRepository } from '../../domain/ports/linea.repository';
import { PendienteRepository } from '../../domain/ports/pendiente.repository';
import { CatalogoNovedadesRepository } from '../../domain/ports/catalogo-novedades.repository';
import { AccionesDisponiblesModel, CuentaMedicaModel } from '../../domain/models/cuenta-medica.model';

/**
 * La barra fija de la vista de cuenta (BTN-11). Lo que es de pintado —que se pegue arriba, que
 * no tape la grilla, que no se parta en pantalla angosta— se comprobó en el navegador; aquí va lo
 * que decide el componente. Ningún dato identifica a una persona.
 */

const cuenta = (cambios: Partial<CuentaMedicaModel> = {}): CuentaMedicaModel => ({
  codigo: 'CM-94421', estado: 'ADJUDICACION_MANUAL', fechaInicio: '2023-06-09', fechaFin: '2023-06-09',
  totalAutorizado: 2_050_112, totalCubierto: 129_390, version: 499, pendientesSinResolver: 0,
  informacionFacturacion: null, respuestasGlosa: [], novedades: [], ...cambios,
} as unknown as CuentaMedicaModel);

/** Un IntersectionObserver de mentira: guarda el aviso para dispararlo a mano. */
class ObservadorSimulado {
  static ultimos: ObservadorSimulado[] = [];
  readonly observe = vi.fn();
  readonly disconnect = vi.fn();
  constructor(readonly avisar: (e: Array<{ isIntersecting: boolean }>) => void,
              readonly opciones: { rootMargin?: string }) {
    ObservadorSimulado.ultimos.push(this);
  }
}

describe('CuentaDetalleComponent — barra fija', () => {
  let fixture: ComponentFixture<CuentaDetalleComponent>;
  const global = globalThis as { IntersectionObserver?: unknown };
  const observadorOriginal = global.IntersectionObserver;
  const desplazarOriginal = Element.prototype.scrollIntoView;
  const scrollToOriginal = window.scrollTo;

  const montar = async (opciones: {
    cuenta?: CuentaMedicaModel;
    consulta?: Observable<CuentaMedicaModel>;
    acciones?: Observable<AccionesDisponiblesModel>;
    conObservador?: boolean;
    /** Con un recurso que nunca responde, `whenStable` no vuelve. */
    esperar?: boolean;
  } = {}) => {
    ObservadorSimulado.ultimos = [];
    global.IntersectionObserver = opciones.conObservador === false ? undefined : ObservadorSimulado;

    await TestBed.configureTestingModule({
      imports: [CuentaDetalleComponent],
      providers: [
        provideRouter([]), provideNoopAnimations(),
        { provide: CuentaRepository, useValue: {
            consultar: () => opciones.consulta ?? of(opciones.cuenta ?? cuenta()),
            consultarAcciones: () => opciones.acciones
              ?? of({ codigo: 'CM-94421', accionesDisponibles: ['ENVIAR'] }),
            consultarVersiones: () => of([
              { numero: 5, fechaEntrada: null, valor: null, estado: null, estadoDesde: null }]),
            consultarHistoria: () => of([]),
        } },
        { provide: LineaRepository, useValue: {} },
        { provide: PendienteRepository, useValue: { resumirMotivos: () => of([]) } },
        { provide: CatalogoNovedadesRepository, useValue: { listar: () => of([]) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CuentaDetalleComponent);
    fixture.componentRef.setInput('codigo', 'CM-94421');
    fixture.detectChanges();
    if (opciones.esperar !== false) await fixture.whenStable();
    else await new Promise(r => setTimeout(r));
    fixture.detectChanges();
  };

  afterEach(() => {
    global.IntersectionObserver = observadorOriginal;
    Element.prototype.scrollIntoView = desplazarOriginal;
    window.scrollTo = scrollToOriginal;
  });

  const dom = (): HTMLElement => fixture.nativeElement;
  const enLaCapa = (selector: string) => document.querySelector<HTMLElement>(`.cdk-overlay-container ${selector}`);
  const enviar = () => dom().querySelector<HTMLButtonElement>('#btn-enviar')!;
  /** Apagado pero alcanzable: `disabledInteractive` lo marca con aria-disabled, no con disabled. */
  const apagado = () => enviar().getAttribute('aria-disabled') === 'true';
  const tooltipDeEnviar = () => fixture.debugElement.query(By.css('#btn-enviar')).injector.get(MatTooltip);
  const abrirMenu = async (esperar = true) => {
    dom().querySelector<HTMLButtonElement>('#btn-menu-cuenta')!.click();
    fixture.detectChanges();
    if (esperar) await fixture.whenStable();
  };
  /** El motivo, tal como se lee junto al botón y dentro del menú. */
  const motivoEnPantalla = async (esperar = true) => {
    const junto = tooltipDeEnviar();
    await abrirMenu(esperar);
    return {
      juntoAlBoton: junto.disabled ? null : junto.message,
      enElMenu: enLaCapa('#motivo-no-enviar')?.textContent?.trim() ?? null,
      descritoPor: enLaCapa('.mat-mdc-menu-panel')?.getAttribute('aria-describedby') ?? null,
    };
  };

  it('[BTN-11.1] la barra lleva Inicio, Enviar a la vista y un menú con lo secundario; ya no hay tres puntos', async () => {
    await montar();

    const barra = dom().querySelector('.barra-cuenta')!;
    expect(barra.getAttribute('aria-label')).toBe('Barra de la cuenta');
    expect(barra.querySelector('#btn-inicio')).not.toBeNull();
    expect(barra.querySelector('#btn-enviar')).not.toBeNull();
    expect(barra.querySelector('#btn-menu-cuenta')?.getAttribute('aria-label')).toBe('Más opciones de la cuenta');
    // Una sola botonera: la franja de resumen ya no tiene menú propio.
    expect(dom().querySelector('.header-resumen [mat-icon-button], .header-resumen mat-menu')).toBeNull();
    expect([...dom().querySelectorAll('mat-icon')].map(i => i.textContent?.trim())).not.toContain('more_vert');

    await abrirMenu();
    expect(enLaCapa('#menu-historia')?.textContent).toContain('Historia de la cuenta');
    expect(enLaCapa('#menu-version')?.textContent).toContain('Versión transmitida V5');
    expect(enLaCapa('#menu-acciones')?.textContent).toContain('Acciones habilitadas');
  });

  it('[BTN-11.1] si la cuenta no carga, la barra deja ver el error y la pantalla no se queda cargando', async () => {
    await montar({ consulta: throwError(() => new Error('El servicio respondió con un error (404)')) });

    expect(dom().querySelector('.error-banner')?.textContent).toContain('404');
    expect(dom().querySelector('.loading-overlay')).toBeNull();
    expect(dom().querySelector('#btn-inicio')).not.toBeNull();
    expect(dom().querySelector('#btn-enviar')).toBeNull();
  });

  it('[BTN-11.2] el resumen compacto aparece cuando la franja deja de verse y se va cuando vuelve', async () => {
    await montar();
    const observador = ObservadorSimulado.ultimos.at(-1)!;
    // La barra se descuenta de la ventana: la franja que pasa por debajo ya no se lee.
    expect(observador.opciones.rootMargin).toBe('-56px 0px 0px 0px');
    expect(observador.observe).toHaveBeenCalledWith(dom().querySelector('.header-resumen'));
    expect(dom().querySelector('#barra-resumen')).toBeNull();

    observador.avisar([{ isIntersecting: false }]);
    fixture.detectChanges();
    const resumen = dom().querySelector('#barra-resumen')!;
    expect(resumen.textContent).toContain('CM-94421');
    expect(resumen.textContent).toContain('Adjudicación manual');
    expect(resumen.textContent).toContain('No reconocido');
    // 2.050.112 − 129.390, sin depender del formato regional.
    expect(resumen.querySelector('.valor--diferencia')!.textContent!.replace(/\D/g, '')).toBe('1920722');

    observador.avisar([{ isIntersecting: true }]);
    fixture.detectChanges();
    expect(dom().querySelector('#barra-resumen')).toBeNull();
  });

  it('[BUS-19] la vista 360 dice el estado en palabras, como el buscador, con la palabra de OHI en la ayuda', async () => {
    await montar();
    const estados = fixture.debugElement.queryAll(By.css('.estado-badge'))
      .filter(e => (e.nativeElement as HTMLElement).textContent!.includes('Adjudicación manual'));

    expect(estados.length).toBeGreaterThan(0);
    expect(dom().textContent).not.toContain('ADJUDICACION_MANUAL');
    expect(estados[0].injector.get(MatTooltip).message).toBe('En OHI: Pendiente');
  });

  it('[BTN-11.3] con pendientes, Enviar se apaga, el motivo se lee junto a él y en el menú, y el clic no abre nada', async () => {
    await montar({ cuenta: cuenta({ pendientesSinResolver: 1 }) });
    const abrir = vi.spyOn(fixture.debugElement.injector.get(MatDialog), 'open');

    expect(apagado()).toBe(true);
    // Apagado pero en el orden de tabulación: es lo que deja leer el motivo con el teclado.
    expect(enviar().hasAttribute('disabled')).toBe(false);
    enviar().click();
    expect(abrir).not.toHaveBeenCalled();

    const motivo = 'Resuelva todos los pendientes para enviar.';
    expect(await motivoEnPantalla()).toEqual({ juntoAlBoton: motivo, enElMenu: motivo, descritoPor: 'motivo-no-enviar' });
  });

  it('[BTN-11.3] si el sistema de registro no publica ENVIAR, Enviar se apaga y se dice por qué', async () => {
    await montar({ acciones: of({ codigo: 'CM-94421', accionesDisponibles: ['ANULAR'] }) });

    expect(apagado()).toBe(true);
    const motivo = 'El sistema de registro no habilita el envío en el estado actual de la cuenta.';
    expect(await motivoEnPantalla()).toEqual({ juntoAlBoton: motivo, enElMenu: motivo, descritoPor: 'motivo-no-enviar' });
  });

  it('[BTN-11.3] si la consulta de acciones falla, Enviar se apaga y lo dice en vez de quedarse esperando', async () => {
    await montar({ acciones: throwError(() => new Error('El servicio respondió con un error (503)')) });

    expect(apagado()).toBe(true);
    const motivo = 'No se pudo consultar si el sistema de registro habilita el envío.';
    expect(await motivoEnPantalla()).toEqual({ juntoAlBoton: motivo, enElMenu: motivo, descritoPor: 'motivo-no-enviar' });
  });

  it('[BTN-11.3] mientras se consultan las acciones, Enviar espera y lo dice', async () => {
    await montar({ acciones: NEVER, esperar: false });

    expect(apagado()).toBe(true);
    const enPantalla = await motivoEnPantalla(false);
    expect(enPantalla.juntoAlBoton).toContain('Consultando');
    expect(enPantalla.enElMenu).toContain('Consultando');
  });

  it('[BTN-11.3] con ENVIAR publicado y sin pendientes, Enviar abre su diálogo y no hay motivo que leer', async () => {
    await montar();
    const abrir = vi.spyOn(fixture.debugElement.injector.get(MatDialog), 'open')
      .mockReturnValue({ afterClosed: () => of(false) } as never);

    expect(enviar().getAttribute('aria-disabled')).toBeNull();
    enviar().click();
    expect(abrir).toHaveBeenCalledTimes(1);

    expect(await motivoEnPantalla()).toEqual({ juntoAlBoton: null, enElMenu: null, descritoPor: null });
  });

  it('[BTN-11.4] el atajo abre «Datos de la cuenta», lo trae a la vista y le da el foco, sin mover las acciones', async () => {
    await montar();
    const desplazar = vi.fn();
    Element.prototype.scrollIntoView = desplazar;
    fixture.componentInstance.panelCuentaAbierto.set(false);
    fixture.detectChanges();

    await abrirMenu();
    enLaCapa('#menu-acciones')!.click();
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise(r => setTimeout(r));
    fixture.detectChanges();

    expect(fixture.componentInstance.panelCuentaAbierto()).toBe(true);
    expect(desplazar).toHaveBeenCalledTimes(1);
    expect(desplazar.mock.contexts[0]).toBe(dom().querySelector('#panel-datos-cuenta'));
    expect(document.activeElement?.getAttribute('aria-label')).toBe('Datos de la cuenta');
    // Las acciones siguen donde estaban: dentro del bloque, no en el menú.
    expect(dom().querySelector('#panel-datos-cuenta .acciones-disponibles')).not.toBeNull();
  });

  it('[BTN-11.4] usado el atajo una vez, cerrar el menú por otra opción ya no mueve nada', async () => {
    await montar();
    const desplazar = vi.fn();
    Element.prototype.scrollIntoView = desplazar;
    vi.spyOn(fixture.debugElement.injector.get(MatDialog), 'open')
      .mockReturnValue({ afterClosed: () => of(undefined) } as never);

    await abrirMenu();
    enLaCapa('#menu-acciones')!.click();
    fixture.detectChanges();
    await new Promise(r => setTimeout(r));
    desplazar.mockClear();

    // Otra vez el menú, ahora para la historia: el atajo ya se cumplió y no debe repetirse.
    await abrirMenu();
    enLaCapa('#menu-historia')!.click();
    fixture.detectChanges();
    await new Promise(r => setTimeout(r));

    expect(desplazar).not.toHaveBeenCalled();
  });

  it('[BTN-11.5] al cambiar de pestaña con las pestañas pegadas, la nueva empieza justo debajo de ellas', async () => {
    await montar();
    const scrollTo = vi.fn();
    window.scrollTo = scrollTo as typeof window.scrollTo;
    const nav = dom().querySelector<HTMLElement>('.pestanas-cuenta')!;
    const panel = dom().querySelector<HTMLElement>('mat-tab-nav-panel')!;
    Object.defineProperty(nav, 'offsetHeight', { configurable: true, value: 50 });
    vi.spyOn(panel, 'getBoundingClientRect').mockReturnValue({ top: -300 } as DOMRect);
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 2000 });

    // Pegadas: justo debajo de la barra.
    vi.spyOn(nav, 'getBoundingClientRect').mockReturnValue({ top: 56 } as DOMRect);
    fixture.componentInstance.alCambiarDePestana();
    expect(scrollTo).toHaveBeenCalledWith({ top: 2000 - 300 - 56 - 50 });

    // Sin pegar todavía: no se mueve nada.
    scrollTo.mockClear();
    vi.spyOn(nav, 'getBoundingClientRect').mockReturnValue({ top: 400 } as DOMRect);
    fixture.componentInstance.alCambiarDePestana();
    expect(scrollTo).not.toHaveBeenCalled();
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 });
  });

  it('[BTN-11.7] sin IntersectionObserver la barra sigue operativa y solo falta el resumen compacto', async () => {
    await montar({ conObservador: false });

    expect(fixture.componentInstance.resumenFueraDeVista()).toBe(false);
    expect(dom().querySelector('#barra-resumen')).toBeNull();
    expect(enviar().getAttribute('aria-disabled')).toBeNull();
    await abrirMenu();
    expect(enLaCapa('#menu-historia')).not.toBeNull();
  });
});
