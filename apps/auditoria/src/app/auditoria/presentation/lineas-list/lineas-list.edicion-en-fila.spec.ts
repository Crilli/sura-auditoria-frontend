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

/**
 * La edición en la fila, vista en la grilla (GRID-18). Ningún dato identifica a una persona.
 */

const fila = (referencia: number, cambios: Partial<ResumenLineaModel> = {}): ResumenLineaModel => ({
  referencia, numeroLinea: referencia, codigoProcedimiento: '870603',
  descripcionProcedimiento: null, catalogoProcedimiento: 'CUPS', codigoAfiliado: 'X',
  nombreAfiliado: null, fechaInicio: '2023-06-09', fechaFin: null, codigoAutorizacion: null,
  valorAutorizado: 0, valorCargado: 196_800, unidadesCargadas: 1, unidadesAutorizadas: 1,
  valorIva: null, porcentajeIva: null, valorCubierto: 0, valorGlosado: 196_800,
  editable: true, cantidadPendientes: 0, pendientes: [], tieneNovedadBloqueante: false,
  novedades: [], version: 114, ...cambios,
});

describe('LineasListComponent — edición en la fila', () => {
  let fixture: ComponentFixture<LineasListComponent>;
  let guardar: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    const filas = [fila(1), fila(2, { editable: false })];
    guardar = vi.fn().mockImplementation((_c: string, _r: number, s: { valorAutorizado?: number }) =>
      of({ ...filas[0], valorAutorizado: s.valorAutorizado ?? 0, version: 115 } as unknown as DetalleLineaModel));

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
        { provide: CuentaRepository, useValue: {} },
      ],
    }).compileComponents();

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

  it('[GRID-18] una línea bloqueada o reemplazada no ofrece edición en la fila', () => {
    expect(boton('btn-editar-fila-1')).not.toBeNull();
    expect(boton('btn-editar-fila-2')).toBeNull();
  });

  it('[GRID-18] editar en la fila abre los cuatro campos sin navegar', async () => {
    await abrirFila1();

    for (const rotulo of ['Valor cargado', 'Unidades cargado', 'Valor autorizado', 'Unidades autorizado']) {
      expect(campo(rotulo)).not.toBeNull();
    }
    expect(campo('Valor autorizado')!.value).toBe('0');
    // Mientras una fila está abierta no se abre otra.
    expect(boton('btn-editar-fila-1')).toBeNull();
  });

  it('[GRID-18] glosado, cubierto e IVA llevan candado con su motivo y no se teclean', async () => {
    await abrirFila1();
    const filaEnEdicion = fixture.debugElement.query(By.css('tr.fila-en-edicion'));
    const motivos = filaEnEdicion.queryAll(By.directive(CampoBloqueadoComponent))
      .map(c => c.query(By.directive(MatTooltip)).injector.get(MatTooltip).message);

    // Cubierto e IVA los calcula el motor; el glosado es la suma del desglose.
    expect(motivos.sort()).toEqual(
      [MOTIVOS_BLOQUEO.calculado, MOTIVOS_BLOQUEO.calculado, MOTIVOS_BLOQUEO.desglose].sort());
    // Solo los cuatro campos editables son de teclear.
    expect(filaEnEdicion.queryAll(By.css('input[type="number"]'))).toHaveLength(4);
  });

  it('[GRID-18] sin modo de recálculo elegido no se puede guardar', async () => {
    await abrirFila1();
    const input = campo('Valor autorizado')!;
    input.value = '1';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(boton('btn-guardar-fila-1')!.disabled).toBe(true);
    expect(fixture.componentInstance.motivoParaNoGuardar()).toBe('Elija el modo de recálculo');
  });

  it('[GRID-18] con el modo elegido guarda solo lo cambiado y cierra la edición', async () => {
    await abrirFila1();
    const input = campo('Valor autorizado')!;
    input.value = '1';
    input.dispatchEvent(new Event('input'));
    fixture.componentInstance.formularioFila!.controls.modoRecalculo.setValue('AISLADO');
    fixture.detectChanges();
    expect(boton('btn-guardar-fila-1')!.disabled).toBe(false);

    boton('btn-guardar-fila-1')!.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(guardar).toHaveBeenCalledWith('CM-94421', 1,
      { versionEsperada: 114, modoRecalculo: 'AISLADO', valorAutorizado: 1 }, expect.anything());
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
});
