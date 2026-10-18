import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { LineasListComponent } from './lineas-list.component';
import { LineaRepository } from '../../domain/ports/linea.repository';
import { PendienteRepository } from '../../domain/ports/pendiente.repository';
import { CuentaRepository } from '../../domain/ports/cuenta.repository';
import { CatalogoNovedadesRepository } from '../../domain/ports/catalogo-novedades.repository';
import { NovedadModel, ResumenLineaModel } from '../../domain/models/linea-cuenta.model';
import { PendienteFacade, ResolucionTerminada } from '../../application/facades/pendiente.facade';

/**
 * Lo que encontró la revisión de las Fases 1 y 2 en la grilla: qué mensajes se ofrece quitar
 * (OPE-12) y qué pasa cuando termina una resolución (OPE-06). Ningún dato identifica a una persona.
 */

const novedad = (id: number, codigo: string, laPusoUnaPersona: boolean): NovedadModel => ({
  id, codigo, descripcion: codigo, plantilla: codigo, valores: {}, severidad: 'INFORMATIVA',
  origen: laPusoUnaPersona ? 'MANUAL' : 'SISTEMA', laPusoUnaPersona, esDelSistema: false,
  generico: null, especifico: null, autor: null, fecha: null,
} as unknown as NovedadModel);

const fila = (referencia: number, novedades: NovedadModel[]): ResumenLineaModel => ({
  referencia, numeroLinea: referencia, codigoProcedimiento: '870603',
  descripcionProcedimiento: null, catalogoProcedimiento: 'CUPS', codigoAfiliado: 'X',
  nombreAfiliado: null, fechaInicio: '2023-06-09', fechaFin: null, codigoAutorizacion: null,
  valorAutorizado: 0, valorCargado: 1, unidadesCargadas: 1, unidadesAutorizadas: 1,
  valorIva: null, porcentajeIva: null, valorCubierto: 0, valorGlosado: 0,
  editable: true, cantidadPendientes: 0, pendientes: [], tieneNovedadBloqueante: false,
  novedades, version: 7,
});

const terminada = (instante: number): ResolucionTerminada => ({
  codigoCuenta: 'CM-94421', instante,
  resultado: { desenlace: 'COMPLETO', todoResuelto: true, referencias: ['2214360298'], fallos: [] },
});

describe('LineasListComponent — revisión de las Fases 1 y 2', () => {
  let fixture: ComponentFixture<LineasListComponent>;
  let resumirMotivos: ReturnType<typeof vi.fn>;
  let listar: ReturnType<typeof vi.fn>;
  let pendientes: PendienteFacade;

  /** Pone una resolución terminada en la fachada raíz, como la dejaría el seguimiento. */
  const terminar = (t: ResolucionTerminada) =>
    (pendientes as unknown as { _terminadas: { set(v: Map<string, ResolucionTerminada>): void } })
      ._terminadas.set(new Map([[t.codigoCuenta, t]]));

  const montar = async () => {
    fixture = TestBed.createComponent(LineasListComponent);
    fixture.componentRef.setInput('codigo', 'CM-94421');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };

  beforeEach(async () => {
    const filas = [
      fila(1, [novedad(11, 'CLA-FL-PRIC-004', false)]),
      fila(2, [novedad(21, 'MSG-MANUAL', true), novedad(22, 'CLA-FL-PRIC-004', false)]),
    ];
    resumirMotivos = vi.fn(() => of([]));
    listar = vi.fn(() => of({ elementos: filas, desplazamiento: 0, tamanoPagina: 25, pagina: 0,
                              totalRegistros: 2, totalPaginas: 1, hayMas: false }));

    await TestBed.configureTestingModule({
      imports: [LineasListComponent],
      providers: [
        provideRouter([]), provideNoopAnimations(),
        { provide: LineaRepository, useValue: {
            listar,
            resumirFiltros: () => of({ afiliados: [], catalogos: [], totalLineas: 2 }),
            consultarDetalle: () => of({}),
        } },
        { provide: PendienteRepository, useValue: { resumirMotivos, catalogoDeMotivos: () => of([]) } },
        { provide: CatalogoNovedadesRepository, useValue: { listar: () => of([]) } },
        { provide: CuentaRepository, useValue: {} },
      ],
    }).compileComponents();
    pendientes = TestBed.inject(PendienteFacade);
  });

  const dom = (): HTMLElement => fixture.nativeElement;

  it('[OPE-12] solo se ofrece quitar lo que puso una persona, aunque el mensaje no sea «del sistema»', async () => {
    await montar();
    fixture.componentInstance.facade.alternarSeleccion(1);
    fixture.componentInstance.facade.alternarSeleccion(2);

    expect(fixture.componentInstance.mensajesQuitables()).toEqual([{ codigo: 'MSG-MANUAL', enCuantas: 1 }]);
  });

  it('[OPE-06] el aviso sigue a la vista aunque la operación haya desmarcado las líneas', async () => {
    await montar();
    fixture.componentInstance.avisoSeleccion.set('Se aplicó la glosa a 2 línea(s).');
    fixture.detectChanges();

    expect(fixture.componentInstance.haySeleccion()).toBe(false);
    expect(dom().querySelector('#aviso-seleccion')?.textContent).toContain('Se aplicó la glosa');
  });

  it('[OPE-06] una resolución que ya había terminado al abrir la grilla no se anuncia ni recarga', async () => {
    terminar(terminada(1));
    await montar();
    const listadas = listar.mock.calls.length;

    terminar(terminada(1));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance.avisoSeleccion()).toBeNull();
    expect(listar.mock.calls.length).toBe(listadas);
  });

  it('[OPE-06] al terminar una resolución de esta cuenta se recargan la grilla y sus motivos', async () => {
    await montar();
    const listadas = listar.mock.calls.length;
    const motivosPedidos = resumirMotivos.mock.calls.length;

    terminar(terminada(2));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance.avisoSeleccion()).toContain('terminó');
    expect(listar.mock.calls.length).toBeGreaterThan(listadas);
    expect(resumirMotivos.mock.calls.length).toBeGreaterThan(motivosPedidos);
  });
});
