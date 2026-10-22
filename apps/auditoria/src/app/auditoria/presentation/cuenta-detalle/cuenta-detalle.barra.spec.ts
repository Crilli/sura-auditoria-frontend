import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltip } from '@angular/material/tooltip';
import { NEVER, Observable, of, throwError } from 'rxjs';
import { CuentaDetalleComponent } from './cuenta-detalle.component';
import { EnviarCuentaDialogComponent } from '../enviar-cuenta-dialog/enviar-cuenta-dialog.component';
import { CuentaRepository } from '../../domain/ports/cuenta.repository';
import { LineaRepository } from '../../domain/ports/linea.repository';
import { PendienteRepository } from '../../domain/ports/pendiente.repository';
import { CatalogoNovedadesRepository } from '../../domain/ports/catalogo-novedades.repository';
import {
  AccionesDisponiblesModel, CuentaMedicaModel, InformacionFacturacionModel
} from '../../domain/models/cuenta-medica.model';

/**
 * La barra fija de la vista de cuenta (BTN-11). Lo que es de pintado —que se pegue arriba, que
 * no tape la grilla, que no se parta en pantalla angosta— se comprobó en el navegador; aquí va lo
 * que decide el componente. Ningún dato identifica a una persona.
 */

/**
 * Cifras distintas por concepto —cargado 1.000.000, convenido 900.000, autorizado 800.000,
 * glosado 100.000— para que un cruce entre convenido (`totalAllowedAmount`) y autorizado
 * (`totalCoveredAmount`) no pase en verde.
 */
const factura = { totalCargado: 1_000_000, totalValorGlosado: 100_000 } as InformacionFacturacionModel;

const cuenta = (cambios: Partial<CuentaMedicaModel> = {}): CuentaMedicaModel => ({
  codigo: 'CM-94421', estado: 'ADJUDICACION_MANUAL', fechaInicio: '2023-06-09', fechaFin: '2023-06-09',
  totalConvenido: 900_000, totalAutorizado: 800_000, version: 499, pendientesSinResolver: 0,
  informacionFacturacion: factura, respuestasGlosa: [], novedades: [], ...cambios,
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
  /** Ni apagado ni apagado-pero-alcanzable: `disabledInteractive` usaría aria-disabled. */
  const habilitado = () => !enviar().hasAttribute('disabled') && enviar().getAttribute('aria-disabled') === null;
  const abrirMenu = async (esperar = true) => {
    dom().querySelector<HTMLButtonElement>('#btn-menu-cuenta')!.click();
    fixture.detectChanges();
    if (esperar) await fixture.whenStable();
  };
  /** Pulsa el botón de envío con el diálogo interceptado; devuelve el espía. */
  const pulsarEnviar = () => {
    const abrir = vi.spyOn(fixture.debugElement.injector.get(MatDialog), 'open')
      .mockReturnValue({ afterClosed: () => of(false) } as never);
    enviar().click();
    return abrir;
  };

  it('[BTN-11.1] la barra lleva Inicio, el selector de versión, el envío con su rótulo, «Pasar a Modificación» y un menú con lo secundario; ya no hay tres puntos', async () => {
    await montar();

    const barra = dom().querySelector('.barra-cuenta')!;
    expect(barra.getAttribute('aria-label')).toBe('Barra de la cuenta');
    expect(barra.querySelector('#btn-inicio')).not.toBeNull();
    // En adjudicación manual el envío se lee «Aceptar», y fuera de Modificación está el paso a ella.
    expect(barra.querySelector('#btn-enviar')?.textContent).toContain('Aceptar');
    expect(barra.querySelector('#btn-pasar-a-modificacion')?.getAttribute('aria-label')).toBe('Pasar a Modificación');
    expect(barra.querySelector('#btn-menu-cuenta')?.getAttribute('aria-label')).toBe('Más opciones de la cuenta');
    // Las versiones ya no van en el menú: las ofrece el selector (BTN-12), lo primero de la
    // botonera, que es lo que nunca se recorta.
    const acciones = barra.querySelector('.barra-cuenta__acciones')!;
    expect(acciones.firstElementChild?.id).toBe('btn-version');
    expect(acciones.querySelector('#btn-version')?.textContent).toContain('V6');
    // Una sola botonera: la franja de resumen ya no tiene menú propio.
    expect(dom().querySelector('.header-resumen [mat-icon-button], .header-resumen mat-menu')).toBeNull();
    expect([...dom().querySelectorAll('mat-icon')].map(i => i.textContent?.trim())).not.toContain('more_vert');

    await abrirMenu();
    expect(enLaCapa('#menu-historia')?.textContent).toContain('Historia de la cuenta');
    expect(enLaCapa('#menu-version')).toBeNull();
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
    // El glosado ocupa el sitio del «No reconocido», que la tabla del 2026-10-21 no define.
    expect(resumen.textContent).toContain('Glosado');
    expect(resumen.textContent).not.toContain('No reconocido');
    // El total glosado, sin depender del formato regional; ni el convenido ni el autorizado.
    expect(resumen.querySelector('.valor--glosado')!.textContent!.replace(/\D/g, '')).toBe('100000');

    observador.avisar([{ isIntersecting: true }]);
    fixture.detectChanges();
    expect(dom().querySelector('#barra-resumen')).toBeNull();
  });

  it('[BTN-11.2] sin total glosado el resumen compacto dice «—», no un cero', async () => {
    await montar({ cuenta: cuenta({ informacionFacturacion: null as unknown as InformacionFacturacionModel }) });
    ObservadorSimulado.ultimos.at(-1)!.avisar([{ isIntersecting: false }]);
    fixture.detectChanges();

    expect(dom().querySelector('#barra-resumen .valor--glosado')!.textContent!.trim()).toBe('—');
  });

  // ── La franja de resumen (ENC-12, ENC-13) ──────────────────────────────

  const franja = () => Object.fromEntries([...dom().querySelectorAll('#resumen-financiero .dato')]
    .map(d => [d.querySelector('label')!.textContent!.trim(), d.querySelector('.valor')!.textContent!.trim()]));

  it('[ENC-12] [ENC-13] la franja enseña total cargado, convenido, autorizado y glosado, cada uno de su campo', async () => {
    await montar();

    const totales = franja();
    expect(Object.keys(totales)).toEqual(
      ['Total cargado', 'Total convenido', 'Total autorizado', 'Total glosado']);
    const cifras = (t: string) => t.replace(/\D/g, '');
    expect(cifras(totales['Total cargado'])).toBe('1000000');
    expect(cifras(totales['Total convenido'])).toBe('900000');
    expect(cifras(totales['Total autorizado'])).toBe('800000');
    expect(cifras(totales['Total glosado'])).toBe('100000');
    // Ni el «No reconocido» ni el «Total Cubierto» de antes.
    expect(dom().querySelector('#resumen-financiero')!.textContent).not.toContain('No reconocido');
    expect(dom().querySelector('#resumen-financiero')!.textContent).not.toContain('Cubierto');
  });

  it('[ENC-12] [ENC-13] un total que OHI no trae es «—», no un cero', async () => {
    await montar({ cuenta: cuenta({
      totalConvenido: null, totalAutorizado: null,
      informacionFacturacion: null as unknown as InformacionFacturacionModel }) });

    expect(franja()).toEqual({
      'Total cargado': '—', 'Total convenido': '—', 'Total autorizado': '—', 'Total glosado': '—',
    });
  });

  it('[ENC-12] el total convenido se pinta una sola vez: la ficha de valores no lo repite', async () => {
    await montar();

    const veces = (dom().textContent!.match(/Total convenido/g) ?? []).length;
    expect(veces).toBe(1);
  });

  it('[BUS-19] la vista 360 dice el estado en palabras, como el buscador, con la palabra de OHI en la ayuda', async () => {
    await montar();
    const estados = fixture.debugElement.queryAll(By.css('.estado-badge'))
      .filter(e => (e.nativeElement as HTMLElement).textContent!.includes('Adjudicación manual'));

    expect(estados.length).toBeGreaterThan(0);
    expect(dom().textContent).not.toContain('ADJUDICACION_MANUAL');
    expect(estados[0].injector.get(MatTooltip).message).toBe('En OHI: Pendiente');
  });

  // ── El envío no se apaga nunca (BTN-11.3, reescrito el 2026-10-21) ─────
  //
  // Hasta esa fecha estas cuatro pruebas fijaban el botón apagado con su motivo. Ahora fijan lo
  // contrario: habilitado y abriendo su diálogo, que es donde se avisa (ver el diálogo).

  it('[BTN-11.3] [BTN-13.4] con pendientes sin resolver el envío está habilitado y abre su diálogo', async () => {
    await montar({ cuenta: cuenta({ pendientesSinResolver: 1 }) });

    expect(habilitado()).toBe(true);
    const abrir = pulsarEnviar();
    expect(abrir).toHaveBeenCalledWith(EnviarCuentaDialogComponent, expect.objectContaining({
      data: { codigoCuenta: 'CM-94421', rotulo: 'Aceptar' } }));
  });

  it('[BTN-11.3] [BTN-13.4] si el sistema de registro no publica ENVIAR, el envío sigue habilitado y abre su diálogo', async () => {
    await montar({ acciones: of({ codigo: 'CM-94421', accionesDisponibles: ['ANULAR'] }) });

    expect(habilitado()).toBe(true);
    expect(pulsarEnviar()).toHaveBeenCalledTimes(1);
  });

  it('[BTN-11.3] [BTN-13.4] si la consulta de acciones falla, el envío sigue habilitado y abre su diálogo', async () => {
    await montar({ acciones: throwError(() => new Error('El servicio respondió con un error (503)')) });

    expect(habilitado()).toBe(true);
    expect(pulsarEnviar()).toHaveBeenCalledTimes(1);
  });

  it('[BTN-11.3] [BTN-13.4] mientras se consultan las acciones el envío no espera: está habilitado y abre su diálogo', async () => {
    await montar({ acciones: NEVER, esperar: false });

    expect(fixture.componentInstance.facade.accionesCargando()).toBe(true);
    expect(habilitado()).toBe(true);
    expect(pulsarEnviar()).toHaveBeenCalledTimes(1);
  });

  it('[BTN-11.3] el envío ya no tiene motivo que leer: ni ayuda junto al botón ni texto en el menú', async () => {
    await montar({ cuenta: cuenta({ pendientesSinResolver: 3 }),
                   acciones: of({ codigo: 'CM-94421', accionesDisponibles: ['DEVOLVER_A_MODIFICACION'] }) });

    // Sin tooltip propio: el botón no tiene nada que explicar.
    expect(fixture.debugElement.query(By.css('#btn-enviar')).injector.get(MatTooltip, null)).toBeNull();
    await abrirMenu();
    expect(enLaCapa('#motivo-no-enviar')).toBeNull();
    expect(enLaCapa('.mat-mdc-menu-panel')?.getAttribute('aria-describedby') ?? null).toBeNull();
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
