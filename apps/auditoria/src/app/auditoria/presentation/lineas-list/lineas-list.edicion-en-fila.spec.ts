import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { LineasListComponent } from './lineas-list.component';
import { LineaRepository } from '../../domain/ports/linea.repository';
import { PendienteRepository } from '../../domain/ports/pendiente.repository';
import { CuentaRepository } from '../../domain/ports/cuenta.repository';
import { CatalogoNovedadesRepository } from '../../domain/ports/catalogo-novedades.repository';
import { DetalleLineaModel, ResumenLineaModel } from '../../domain/models/linea-cuenta.model';
import { MOTIVOS_BLOQUEO } from '../compartido/motivos-bloqueo';
import { CampoBloqueadoComponent } from '../compartido/campo-bloqueado/campo-bloqueado.component';
import { By } from '@angular/platform-browser';
import { MatTooltip } from '@angular/material/tooltip';
import { CuentaFacade } from '../../application/facades/cuenta.facade';

/**
 * La edición en la fila, vista en la grilla (GRID-18), y los importes de la grilla con el
 * vocabulario del 2026-10-21 (GRID-10 a GRID-13). Ningún dato identifica a una persona.
 *
 * La cuenta está en Modificación: desde el 2026-10-21 es el único estado en que se cambian datos
 * (EST-01), así que sin ella no habría nada que editar. Fuera de Modificación, ver
 * `lineas-list.estados.spec.ts`.
 *
 * Cifras distintas por concepto —cargado 1000 (3 und.), convenido 900 (2 und.), autorizado 800
 * (1 und.), glosado 100— para que un cruce de columnas no pase en verde.
 */

const fila = (referencia: number, cambios: Partial<ResumenLineaModel> = {}): ResumenLineaModel => ({
  referencia, numeroLinea: referencia, codigoProcedimiento: '870603',
  descripcionProcedimiento: null, catalogoProcedimiento: 'CUPS', codigoAfiliado: 'X',
  nombreAfiliado: null, fechaInicio: '2023-06-09', fechaFin: null, codigoAutorizacion: null,
  valorCargado: 1_000, unidadesCargadas: 3, valorConvenido: 900, unidadesConvenidas: 2,
  valorAutorizado: 800, unidadesAutorizadas: 1,
  valorIva: null, porcentajeIva: null, valorGlosado: 100,
  editable: true, cantidadPendientes: 0, pendientes: [], tieneNovedadBloqueante: false,
  novedades: [], version: 114, ...cambios,
});

describe('LineasListComponent — edición en la fila', () => {
  let fixture: ComponentFixture<LineasListComponent>;
  let guardar: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    // La 2 es una línea negada: OHI no trae convenido ni autorizado, que no es lo mismo que 0.
    const filas = [fila(1), fila(2, {
      editable: false, valorConvenido: null, unidadesConvenidas: null,
      valorAutorizado: null, unidadesAutorizadas: null, valorGlosado: null })];
    guardar = vi.fn().mockImplementation((_c: string, _r: number, s: { valorConvenido?: number }) =>
      of({ ...filas[0], valorConvenido: s.valorConvenido ?? 0, version: 115 } as unknown as DetalleLineaModel));

    await TestBed.configureTestingModule({
      imports: [LineasListComponent],
      providers: [
        provideRouter([]), provideNoopAnimations(),
        { provide: LineaRepository, useValue: {
            listar: () => of({ elementos: filas, desplazamiento: 0, tamanoPagina: 25, pagina: 0,
                               totalRegistros: 2, totalPaginas: 1, hayMas: false }),
            resumirFiltros: () => of({ afiliados: [], catalogos: [], totalLineas: 2 }),
            consultarDetalle: () => of({}),
            guardar,
        } },
        { provide: PendienteRepository, useValue: {
            resumirMotivos: () => of([]), catalogoDeMotivos: () => of([]) } },
        { provide: CatalogoNovedadesRepository, useValue: { listar: () => of([]) } },
        { provide: CuentaRepository, useValue: {
            consultar: () => of({ codigo: 'CM-94421', estado: 'MODIFICACION', admiteCambios: true,
                                  version: 7, novedades: [] }),
            consultarAcciones: () => of({ codigo: 'CM-94421', accionesDisponibles: [] }),
        } },
      ],
    }).compileComponents();
    // La cuenta la carga la vista que contiene la grilla; aquí no está, así que se carga a mano.
    TestBed.inject(CuentaFacade).buscar('CM-94421');

    fixture = TestBed.createComponent(LineasListComponent);
    fixture.componentRef.setInput('codigo', 'CM-94421');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  const dom = (): HTMLElement => fixture.nativeElement;
  const boton = (id: string) => dom().querySelector<HTMLButtonElement>(`#${id}`);
  const campo = (rotulo: string) =>
    dom().querySelector<HTMLInputElement>(`input[aria-label="${rotulo}"]`);
  const abrirFila1 = async () => {
    boton('btn-editar-fila-1')!.click();
    fixture.detectChanges();
    await fixture.whenStable();
  };

  it('[GRID-18] [EST-01.7] en Modificación, una línea bloqueada o reemplazada sigue sin ofrecer edición en la fila', () => {
    expect(boton('btn-editar-fila-1')).not.toBeNull();
    expect(boton('btn-editar-fila-2')).toBeNull();
  });

  it('[GRID-18] editar en la fila abre cargado y convenido, con sus cantidades, sin navegar', async () => {
    await abrirFila1();

    for (const rotulo of ['Valor cargado', 'Cantidad cargada', 'Valor convenido', 'Cantidad convenida']) {
      expect(campo(rotulo)).not.toBeNull();
    }
    // Cada campo arranca con su propio dato, no con el de la columna de al lado.
    expect(campo('Valor cargado')!.value).toBe('1000');
    expect(campo('Valor convenido')!.value).toBe('900');
    expect(campo('Cantidad convenida')!.value).toBe('2');
    // El autorizado no tiene campo: lo calcula el motor.
    expect(campo('Valor autorizado')).toBeNull();
    // Mientras una fila está abierta no se abre otra.
    expect(boton('btn-editar-fila-1')).toBeNull();
  });

  it('[GRID-18] glosado, autorizado e IVA llevan candado con su motivo y no se teclean', async () => {
    await abrirFila1();
    const filaEnEdicion = fixture.debugElement.query(By.css('tr.fila-en-edicion'));
    const motivos = filaEnEdicion.queryAll(By.directive(CampoBloqueadoComponent))
      .map(c => c.query(By.directive(MatTooltip)).injector.get(MatTooltip).message);

    // Autorizado e IVA los calcula el motor; el glosado es la suma del desglose.
    expect(motivos.sort()).toEqual(
      [MOTIVOS_BLOQUEO.calculado, MOTIVOS_BLOQUEO.calculado, MOTIVOS_BLOQUEO.desglose].sort());
    // Y el candado del motor está en la columna del autorizado, no en la del convenido.
    const enColumna = (columna: string) => filaEnEdicion
      .query(By.css(`.mat-column-${columna}`)).queryAll(By.directive(CampoBloqueadoComponent));
    expect(enColumna('valorAutorizado')).toHaveLength(1);
    expect(enColumna('valorConvenido')).toHaveLength(0);
    // Solo los cuatro campos editables son de teclear.
    expect(filaEnEdicion.queryAll(By.css('input[type="number"]'))).toHaveLength(4);
  });

  it('[GRID-18] sin modo de recálculo elegido no se puede guardar', async () => {
    await abrirFila1();
    const input = campo('Valor convenido')!;
    input.value = '1';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(boton('btn-guardar-fila-1')!.disabled).toBe(true);
    expect(fixture.componentInstance.motivoParaNoGuardar()).toBe('Elija el modo de recálculo');
  });

  it('[GRID-18] con el modo elegido guarda solo lo cambiado —el convenido— y cierra la edición', async () => {
    await abrirFila1();
    const input = campo('Valor convenido')!;
    input.value = '850';
    input.dispatchEvent(new Event('input'));
    fixture.componentInstance.formularioFila!.controls.modoRecalculo.setValue('AISLADO');
    fixture.detectChanges();
    expect(boton('btn-guardar-fila-1')!.disabled).toBe(false);

    boton('btn-guardar-fila-1')!.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(guardar).toHaveBeenCalledWith('CM-94421', 1,
      { versionEsperada: 114, modoRecalculo: 'AISLADO', valorConvenido: 850 }, expect.anything());
    expect(dom().querySelector('tr.fila-en-edicion')).toBeNull();
  });

  it('[GRID-18] Escape cancela sin guardar', async () => {
    await abrirFila1();
    dom().querySelector('tr.fila-en-edicion')!
      .dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();

    expect(dom().querySelector('tr.fila-en-edicion')).toBeNull();
    expect(guardar).not.toHaveBeenCalled();
  });

  it('[GRID-18] la ayuda del botón dice que se editan cargado y convenido', () => {
    const tooltip = fixture.debugElement.query(By.css('#btn-editar-fila-1'))
      .injector.get(MatTooltip).message;
    expect(tooltip).toBe('Editar cargado y convenido aquí, sin abrir la línea');
  });

  // ── Los importes de la grilla ────────────────────────────────────────────

  const filaDom = (i: number) => dom().querySelectorAll<HTMLElement>('tr.mat-mdc-row')[i];
  const principal = (i: number, columna: string) => filaDom(i)
    .querySelector(`.mat-column-${columna} .celda-doble__principal`)!.textContent!.trim();
  const secundario = (i: number, columna: string) => filaDom(i)
    .querySelector(`.mat-column-${columna} .celda-doble__secundario`)?.textContent?.trim() ?? null;
  const cifras = (texto: string) => texto.replace(/\D/g, '');

  it('[GRID-10] [GRID-12] las columnas van en orden: cargado, convenido, autorizado, IVA, glosado', () => {
    const cabeceras = [...dom().querySelectorAll('th.mat-mdc-header-cell')]
      .map(th => th.textContent!.replace(/[↑↓]/g, '').replace(/\s+/g, ' ').trim())
      .filter(t => /^(V\.|IVA)/.test(t));
    expect(cabeceras).toEqual(['V. Cargado', 'V. Convenido', 'V. Autorizado', 'IVA', 'V. Glosado']);
    // Los rótulos viejos no quedan en ninguna parte.
    expect(dom().textContent).not.toContain('V. Cubierto');
  });

  it('[GRID-10] [GRID-11] el convenido es el allowedAmount, con su cantidad debajo', () => {
    expect(cifras(principal(0, 'valorConvenido'))).toBe('900');
    expect(secundario(0, 'valorConvenido')).toBe('2 und.');
  });

  it('[GRID-12] [GRID-13] el autorizado es el coveredAmount, con su cantidad debajo', () => {
    expect(cifras(principal(0, 'valorAutorizado'))).toBe('800');
    expect(secundario(0, 'valorAutorizado')).toBe('1 und.');
    // Y el cargado sigue en su sitio.
    expect(cifras(principal(0, 'valorCargado'))).toBe('1000');
    expect(secundario(0, 'valorCargado')).toBe('3 und.');
  });

  it('[GRID-10] [GRID-12] lo que OHI no trae es «—», no un cero, y sin cantidad debajo', () => {
    expect(principal(1, 'valorConvenido')).toBe('—');
    expect(principal(1, 'valorAutorizado')).toBe('—');
    expect(secundario(1, 'valorConvenido')).toBeNull();
    expect(secundario(1, 'valorAutorizado')).toBeNull();
    expect(filaDom(1).querySelector('.mat-column-valorGlosado')!.textContent!.trim()).toBe('—');
  });
});
