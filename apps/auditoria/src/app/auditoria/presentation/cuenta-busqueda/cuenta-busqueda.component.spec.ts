import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltip } from '@angular/material/tooltip';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import { CuentaBusquedaComponent } from './cuenta-busqueda.component';
import { CuentaRepository } from '../../domain/ports/cuenta.repository';
import { BusquedaFacade } from '../../application/facades/busqueda.facade';
import { HitoModel, ResumenCuentaModel } from '../../domain/models/cuenta-medica.model';
import { VersionCuentaDialogComponent } from '../version-cuenta-dialog/version-cuenta-dialog.component';

/**
 * La pantalla del buscador. Los códigos, facturas y NIT son de prueba; ninguno identifica a
 * una persona.
 */

const RESULTADOS: ResumenCuentaModel[] = [
  {
    codigo: 'CM-57944424433', numeroFactura: 'JONATHAN201', fechaRadicacion: '2026-10-01',
    prestadorNit: '800000000', prestadorNombre: 'Prestador de prueba', valorFactura: 8_800_000,
    // Reabierta: el histórico tiene tres versiones finalizadas y la cuenta trabaja la cuarta.
    // Los estados de las versiones llegan como los publica el servicio: con el nombre del dominio.
    estado: 'ADJUDICACION_MANUAL',
    versiones: [
      { numero: 3, fechaEntrada: '2026-09-09', valor: 8_800_000, estado: 'FINALIZADA',
        estadoDesde: '2026-09-09T15:00:00Z' },
      { numero: 2, fechaEntrada: '2026-09-05', valor: 6_000_000, estado: 'FINALIZADA', estadoDesde: null },
      { numero: 1, fechaEntrada: '2026-09-01', valor: 4_000_001, estado: 'FINALIZADA', estadoDesde: null },
    ],
  },
  {
    codigo: 'CM-2', numeroFactura: 'JONATHAN201', fechaRadicacion: '2026-10-02',
    prestadorNit: '800000000', prestadorNombre: 'Prestador de prueba', valorFactura: 100,
    estado: 'ESTADO NUEVO', versiones: [],
  },
  {
    codigo: 'CM-3', numeroFactura: 'JONATHAN201', fechaRadicacion: '2026-10-03',
    prestadorNit: '800000000', prestadorNombre: 'Prestador de prueba', valorFactura: 200,
    estado: 'FINALIZADA',
    versiones: [
      { numero: 2, fechaEntrada: '2026-09-05', valor: 200, estado: 'FINALIZADA', estadoDesde: null },
      { numero: 1, fechaEntrada: '2026-09-01', valor: 100, estado: 'FINALIZADA', estadoDesde: null },
    ],
  },
];

/** La historia de CM-57944424433: se reabrió por una respuesta a glosa y quedó en adjudicación manual. */
const HISTORIA: HitoModel[] = [
  { tipo: 'DESFINALIZACION', etiqueta: 'RESPUESTA_GLOSA_BLOQUEO', detalle: 'Respuesta a glosa con bloqueo',
    autor: 'auditor', loHizoElSistema: false, ocurridoEn: '2026-09-21T15:50:08Z' },
  { tipo: 'CAMBIO_DE_ESTADO', etiqueta: 'ADJUDICACION_MANUAL', detalle: null,
    autor: 'Internal System User', loHizoElSistema: true, ocurridoEn: '2026-09-21T16:45:48Z' },
];

const respuesta = (elementos: ResumenCuentaModel[]) => of({
  elementos, desplazamiento: 0, tamanoPagina: 25, pagina: 0,
  totalRegistros: elementos.length, totalPaginas: 1, hayMas: false,
});

describe('CuentaBusquedaComponent', () => {
  let fixture: ComponentFixture<CuentaBusquedaComponent>;
  let repo: { buscar: ReturnType<typeof vi.fn>; consultarHistoria: ReturnType<typeof vi.fn> };
  let router: Router;

  beforeEach(async () => {
    repo = {
      buscar: vi.fn().mockReturnValue(of({
        elementos: RESULTADOS, desplazamiento: 0, tamanoPagina: 25, pagina: 0,
        totalRegistros: 3, totalPaginas: 1, hayMas: false,
      })),
      consultarHistoria: vi.fn().mockReturnValue(of(HISTORIA)),
    };
    await TestBed.configureTestingModule({
      imports: [CuentaBusquedaComponent],
      providers: [
        provideRouter([]), provideNoopAnimations(),
        { provide: CuentaRepository, useValue: repo },
      ],
    }).compileComponents();

    // La fachada vive en la raíz: se limpia para que una prueba no herede la búsqueda de otra.
    TestBed.inject(BusquedaFacade).limpiar();
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(CuentaBusquedaComponent);
    await fixture.whenStable();
  });

  const dom = (): HTMLElement => fixture.nativeElement;
  const escribir = (id: string, valor: string) => {
    const input = dom().querySelector<HTMLInputElement>(`#${id}`)!;
    input.value = valor;
    input.dispatchEvent(new Event('input'));
  };
  const buscar = async (factura: string) => {
    escribir('input-factura', factura);
    dom().querySelector<HTMLButtonElement>('#btn-buscar')!.click();
    await fixture.whenStable();
    fixture.detectChanges();
  };
  const filas = () => Array.from(dom().querySelectorAll<HTMLTableRowElement>('tr.resultado'));
  const versiones = () => Array.from(dom().querySelectorAll<HTMLTableRowElement>('tr.version'));
  const texto = (el: Element) => el.textContent!.replace(/\s+/g, ' ').trim();
  const desplegar = async (fila: number) => {
    filas()[fila].querySelector<HTMLButtonElement>('button')!.click();
    await fixture.whenStable();
    fixture.detectChanges();
  };
  /** Abrir una cuenta y volver: la pantalla muere y se crea otra; la fachada sigue viva. */
  const volverDelDetalle = async () => {
    fixture.destroy();
    fixture = TestBed.createComponent(CuentaBusquedaComponent);
    await fixture.whenStable();
    fixture.detectChanges();
  };

  it('[BUS-01] la pantalla de inicio es el buscador de facturas', () => {
    expect(dom().textContent).toContain('Buscar facturas');
    expect(dom().querySelector('#input-factura')).not.toBeNull();
    expect(dom().querySelector('#input-radicado')).not.toBeNull();
  });

  it('[BUS-01] sin criterio lo dice aquí y no sale al servicio', async () => {
    dom().querySelector<HTMLButtonElement>('#btn-buscar')!.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(dom().querySelector('[role="alert"]')?.textContent).toContain('Escriba un número de factura');
    expect(repo.buscar).not.toHaveBeenCalled();
  });

  it('[BUS-12] con varios resultados enseña la lista y no salta al detalle', async () => {
    const navegar = vi.spyOn(router, 'navigate');
    await buscar('JONATHAN201');

    expect(filas()).toHaveLength(3);
    expect(navegar).not.toHaveBeenCalled();
  });

  it('[BUS-12] enseñarse otra vez sin búsqueda no sale al servicio', async () => {
    await volverDelDetalle();

    expect(repo.buscar).not.toHaveBeenCalled();
    expect(filas()).toHaveLength(0);
  });

  it('[BUS-12] [BUS-13] al volver del detalle trae la cuenta como está ahora, con la búsqueda y las desplegadas de antes', async () => {
    await buscar('JONATHAN201');
    await desplegar(0);
    expect(versiones().map(v => texto(v.querySelector('td')!)))
      .toEqual(['V4 en curso', 'V3 última finalizada', 'V2', 'V1']);

    // En el detalle, el auditor la envió: se finalizó y la V4 ya está en el histórico.
    const enviada: ResumenCuentaModel = {
      ...RESULTADOS[0], estado: 'FINALIZADA',
      versiones: [
        { numero: 4, fechaEntrada: '2026-10-19', valor: 8_800_000, estado: 'FINALIZADA',
          estadoDesde: '2026-10-19T15:00:00Z' },
        ...RESULTADOS[0].versiones,
      ],
    };
    repo.buscar.mockReturnValue(respuesta([enviada, RESULTADOS[1], RESULTADOS[2]]));
    await volverDelDetalle();

    expect(repo.buscar).toHaveBeenCalledTimes(2);
    expect(repo.buscar).toHaveBeenLastCalledWith({ factura: 'JONATHAN201', radicado: null }, 0, 25);
    expect(dom().querySelector<HTMLInputElement>('#input-factura')!.value).toBe('JONATHAN201');
    expect(texto(filas()[0].querySelector('.estado')!)).toBe('Finalizada');
    expect(texto(filas()[0].querySelectorAll('td')[6])).toBe('Finalizada 4 versiones');
    // Sigue desplegada, y sin versión en curso: la V4 es ahora la vigente.
    expect(versiones().map(v => texto(v.querySelector('td')!))).toEqual(['V4 vigente', 'V3', 'V2', 'V1']);
    expect(dom().querySelector('tr.version--en-curso')).toBeNull();
    // Cerrada ya no usa la historia: solo se pidió al desplegarla la primera vez.
    expect(repo.consultarHistoria).toHaveBeenCalledTimes(1);
  });

  it('[BUS-13] al volver, una cuenta devuelta a modificación vuelve a pedir su historia y la fila en curso lo dice', async () => {
    await buscar('JONATHAN201');
    await desplegar(0);

    repo.buscar.mockReturnValue(respuesta([{ ...RESULTADOS[0], estado: 'MODIFICACION' }, ...RESULTADOS.slice(1)]));
    repo.consultarHistoria.mockReturnValue(of([...HISTORIA,
      { tipo: 'CAMBIO_DE_ESTADO', etiqueta: 'MODIFICACION', detalle: null,
        autor: 'auditor', loHizoElSistema: false, ocurridoEn: '2026-10-19T14:00:00Z' }]));
    await volverDelDetalle();

    expect(repo.consultarHistoria).toHaveBeenCalledTimes(2);
    expect(texto(filas()[0].querySelectorAll('td')[6])).toBe('Modificación 3 versiones · V4 en curso');
    const enCurso = dom().querySelector('tr.version--en-curso')!;
    expect(texto(enCurso.querySelector('td')!)).toBe('V4 en curso');
    expect(texto(enCurso.querySelectorAll('td')[3])).toContain('Modificación');
    expect(texto(enCurso.querySelectorAll('td')[3])).toContain('desde 19/10/2026');
  });

  it('[BUS-14] [BUS-15] [BUS-16] [BUS-17] [BUS-18] cada fila trae radicado, llegada, factura, prestador y valor', async () => {
    await buscar('JONATHAN201');
    const celdas = Array.from(filas()[0].querySelectorAll('td')).map(td => td.textContent!.trim());

    expect(celdas[1]).toBe('CM-57944424433');
    expect(celdas[2]).toBe('01/10/2026');
    expect(celdas[3]).toBe('JONATHAN201');
    // La razón social, con el NIT al lado y no en su lugar.
    expect(celdas[4]).toContain('Prestador de prueba');
    expect(celdas[4]).toContain('NIT 800000000');
    expect(celdas[5]).toContain('8,800,000');
  });

  it('[BUS-19] el estado se enseña en palabras, o el literal si no lo conoce', async () => {
    await buscar('JONATHAN201');

    const estado = filas()[0].querySelector('.estado')!;
    expect(texto(estado)).toBe('Adjudicación manual');
    expect(filas()[0].textContent).not.toContain('ADJUDICACION_MANUAL');
    expect(filas()[0].textContent).not.toContain('MANUAL ADJUDICATION');
    expect(texto(filas()[1].querySelector('.estado')!)).toBe('ESTADO NUEVO');
  });

  it('[BUS-19] la cuenta y sus versiones hablan el mismo vocabulario', async () => {
    await buscar('JONATHAN201');
    await desplegar(2);

    expect(texto(filas()[2].querySelector('.estado')!)).toBe('Finalizada');
    expect(versiones().map(v => texto(v.querySelectorAll('td')[3]))).toEqual(['Finalizada', 'Finalizada']);
  });

  it('[BUS-19] la ayuda del estado dice la palabra de OHI, y no hay ayuda si no aporta', async () => {
    await buscar('JONATHAN201');
    const ayudas = fixture.debugElement.queryAll(By.css('tr.resultado .estado'))
      .map(e => e.injector.get(MatTooltip).message);

    expect(ayudas[0]).toBe('En OHI: Pendiente');
    expect(ayudas[1]).toBe('');
  });

  it('[BUS-19] la ayuda de la fila solo se apaga sobre un estado que trae la suya', async () => {
    await buscar('JONATHAN201');
    const ayudaDeFila = (i: number) =>
      fixture.debugElement.queryAll(By.css('tr.resultado'))[i].injector.get(MatTooltip);
    const estado = (i: number) => filas()[i].querySelector('.estado')!;

    // Un estado sin palabra de OHI no tiene ayuda propia: la fila conserva «Abrir…».
    estado(1).dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();
    expect(ayudaDeFila(1).disabled).toBe(false);

    estado(0).dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();
    expect(ayudaDeFila(0).disabled).toBe(true);
    estado(0).dispatchEvent(new MouseEvent('mouseleave'));
    fixture.detectChanges();
    expect(ayudaDeFila(0).disabled).toBe(false);
  });

  it('[BUS-02] abrir un resultado lleva a la vista 360 de esa cuenta', async () => {
    const navegar = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    await buscar('JONATHAN201');

    filas()[0].click();

    expect(navegar).toHaveBeenCalledWith(['/auditoria', 'CM-57944424433']);
  });

  it('[BUS-13] una cuenta finalizada despliega sus versiones con la vigente arriba, sin abrir la cuenta', async () => {
    const navegar = vi.spyOn(router, 'navigate');
    await buscar('JONATHAN201');
    expect(texto(filas()[2].querySelectorAll('td')[6])).toBe('Finalizada 2 versiones');

    await desplegar(2);

    expect(versiones().map(v => texto(v.querySelector('td')!))).toEqual(['V2 vigente', 'V1']);
    expect(dom().querySelector('tr.version--en-curso')).toBeNull();
    expect(navegar).not.toHaveBeenCalled();
    // Una cuenta cerrada no necesita su historia: no hay nada en curso que fechar.
    expect(repo.consultarHistoria).not.toHaveBeenCalled();
  });

  it('[BUS-13] una cuenta reabierta pone arriba la versión en curso, con el estado de la cuenta', async () => {
    await buscar('JONATHAN201');
    // Ya en la fila, sin desplegar: el histórico tiene tres y trabaja una cuarta.
    expect(texto(filas()[0].querySelectorAll('td')[6]))
      .toBe('Adjudicación manual 3 versiones · V4 en curso');

    await desplegar(0);

    expect(versiones().map(v => texto(v.querySelector('td')!)))
      .toEqual(['V4 en curso', 'V3 última finalizada', 'V2', 'V1']);
    const enCurso = dom().querySelector('tr.version--en-curso')!;
    expect(texto(enCurso.querySelectorAll('td')[3].querySelector('.estado')!)).toBe('Adjudicación manual');
    // El mismo estado que la cuenta, que es lo que antes no cuadraba.
    expect(texto(enCurso.querySelectorAll('td')[3].querySelector('.estado')!))
      .toBe(texto(filas()[0].querySelector('.estado')!));
  });

  it('[BUS-13] la versión en curso dice desde cuándo y por qué se reabrió, de la historia de la cuenta', async () => {
    await buscar('JONATHAN201');
    await desplegar(0);

    expect(repo.consultarHistoria).toHaveBeenCalledWith('CM-57944424433');
    const estado = texto(dom().querySelector('tr.version--en-curso')!.querySelectorAll('td')[3]);
    expect(estado).toContain('desde 21/09/2026');
    expect(estado).toContain('Reabierta: Respuesta a glosa con bloqueo');
  });

  it('[BUS-13] sin historia la versión en curso sale igual, sin fecha ni motivo', async () => {
    repo.consultarHistoria.mockReturnValue(throwError(() => new Error('sin red')));
    await buscar('JONATHAN201');
    await desplegar(0);

    const enCurso = dom().querySelector('tr.version--en-curso')!;
    expect(texto(enCurso.querySelector('td')!)).toBe('V4 en curso');
    expect(enCurso.textContent).not.toContain('desde');
    expect(dom().querySelector('[role="alert"]')).toBeNull();
  });

  it('[BUS-13] abrir la versión en curso abre la cuenta, que no tiene foto', async () => {
    const navegar = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const dialogo = fixture.debugElement.injector.get(MatDialog);
    const abrirFoto = vi.spyOn(dialogo, 'open').mockReturnValue(undefined as never);
    await buscar('JONATHAN201');
    await desplegar(0);

    dom().querySelector<HTMLTableRowElement>('tr.version--en-curso')!.click();

    expect(navegar).toHaveBeenCalledWith(['/auditoria', 'CM-57944424433']);
    expect(abrirFoto).not.toHaveBeenCalled();
  });

  it('[BUS-13] Enter en el botón de desplegar no abre la cuenta; Enter en la fila sí', async () => {
    const navegar = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    await buscar('JONATHAN201');
    const enter = (el: Element, repetido = false) =>
      el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, repeat: repetido }));

    enter(filas()[0].querySelector('button')!);
    expect(navegar).not.toHaveBeenCalled();

    enter(filas()[0], true);
    expect(navegar).not.toHaveBeenCalled();

    enter(filas()[0]);
    expect(navegar).toHaveBeenCalledWith(['/auditoria', 'CM-57944424433']);
  });

  it('[BUS-13] una cuenta anulada no tiene versión en curso ni su última es la vigente', async () => {
    const anulada: ResumenCuentaModel = { ...RESULTADOS[2], codigo: 'CM-4', estado: 'ANULADA' };
    repo.buscar.mockReturnValue(of({
      elementos: [anulada], desplazamiento: 0, tamanoPagina: 25, pagina: 0,
      totalRegistros: 1, totalPaginas: 1, hayMas: false,
    }));
    await buscar('JONATHAN201');
    await desplegar(0);

    expect(versiones().map(v => texto(v.querySelector('td')!))).toEqual(['V2 última finalizada', 'V1']);
    expect(dom().querySelector('tr.version--en-curso')).toBeNull();
    expect(dom().querySelector('.versiones--vigente')).toBeNull();
    expect(texto(filas()[0].querySelector('.estado')!)).toBe('Anulada');
    expect(repo.consultarHistoria).not.toHaveBeenCalled();
  });

  it('[BUS-13] una cuenta sin transmitir no ofrece versiones', async () => {
    await buscar('JONATHAN201');

    expect(filas()[1].querySelector('button')).toBeNull();
    expect(filas()[1].textContent).not.toContain('versi');
  });

  it('[BUS-20] elegir una versión abre su foto en un diálogo', async () => {
    // El del componente, no el de la raíz: al importar MatDialogModule trae su propia instancia.
    const dialogo = fixture.debugElement.injector.get(MatDialog);
    const abrir = vi.spyOn(dialogo, 'open').mockReturnValue(undefined as never);
    await buscar('JONATHAN201');
    await desplegar(0);

    versiones().find(v => texto(v.querySelector('td')!) === 'V2')!.click();
    // Con el teclado, igual; y el Enter que llega al soltar —p. ej. tras cerrar la foto, con el
    // foco de vuelta en la fila— no la vuelve a abrir.
    const v2 = versiones().find(v => texto(v.querySelector('td')!) === 'V2')!;
    v2.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    v2.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', bubbles: true }));
    expect(abrir).toHaveBeenCalledTimes(2);

    expect(abrir).toHaveBeenCalledWith(VersionCuentaDialogComponent, expect.objectContaining({
      data: { codigoCuenta: 'CM-57944424433', numero: 2 },
    }));
  });
});
