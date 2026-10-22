import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { MatTooltip } from '@angular/material/tooltip';
import { NEVER, Observable, of } from 'rxjs';
import { LineasListComponent } from './lineas-list.component';
import { LineaRepository } from '../../domain/ports/linea.repository';
import { PendienteRepository } from '../../domain/ports/pendiente.repository';
import { CuentaRepository } from '../../domain/ports/cuenta.repository';
import { CatalogoNovedadesRepository } from '../../domain/ports/catalogo-novedades.repository';
import { CuentaFacade } from '../../application/facades/cuenta.facade';
import { PendienteFacade } from '../../application/facades/pendiente.facade';
import { CuentaMedicaModel } from '../../domain/models/cuenta-medica.model';
import { ResumenLineaModel } from '../../domain/models/linea-cuenta.model';

/**
 * La grilla con las reglas de estado del 2026-10-21: solo se cambian datos con la cuenta en
 * Modificación (EST-01), y resolver pendientes queda libre en cualquier estado (EST-03). La cuenta
 * del repositorio de mentira es una variable, para cambiarla de estado con la grilla abierta. Los
 * códigos son de prueba; ningún dato identifica a una persona.
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

const cuentaEn = (estado: string): CuentaMedicaModel => ({
  codigo: 'CM-94421', estado, admiteCambios: estado === 'MODIFICACION', version: 7, novedades: [],
} as unknown as CuentaMedicaModel);

const MOTIVO_DE_LA_ADJUDICACION =
  'La cuenta está en Adjudicación manual: sus datos solo se cambian en Modificación. '
  + 'Use «Pasar a Modificación» en la barra.';

describe('LineasListComponent — solo se cambian datos en Modificación', () => {
  let fixture: ComponentFixture<LineasListComponent>;
  let actual: CuentaMedicaModel;
  let lineaRepo: Record<string, ReturnType<typeof vi.fn>>;
  let pendienteRepo: Record<string, ReturnType<typeof vi.fn>>;

  const montar = async (opciones: { cuenta?: CuentaMedicaModel; consulta?: () => Observable<CuentaMedicaModel> }) => {
    actual = opciones.cuenta ?? cuentaEn('ADJUDICACION_MANUAL');
    lineaRepo = {
      listar: vi.fn(() => of({ elementos: [fila(1), fila(2, { editable: false })], desplazamiento: 0,
                               tamanoPagina: 25, pagina: 0, totalRegistros: 2, totalPaginas: 1, hayMas: false })),
      resumirFiltros: vi.fn(() => of({ afiliados: [], catalogos: [], totalLineas: 2 })),
      consultarDetalle: vi.fn(() => of({})),
      guardar: vi.fn(() => of({})),
      aplicarEnLote: vi.fn(() => of({ desenlace: 'COMPLETO', aplicadas: 1, yaEstaban: 0, fallos: [] })),
    };
    pendienteRepo = {
      resumirMotivos: vi.fn(() => of([])),
      catalogoDeMotivos: vi.fn(() => of([])),
      agregarMotivo: vi.fn(() => of({})),
      resolverEnMasa: vi.fn(() => of({ desenlace: 'COMPLETO', todoResuelto: true, referencias: [], fallos: [] })),
    };
    await TestBed.configureTestingModule({
      imports: [LineasListComponent],
      providers: [
        provideRouter([]), provideNoopAnimations(),
        { provide: LineaRepository, useValue: lineaRepo },
        { provide: PendienteRepository, useValue: pendienteRepo },
        { provide: CatalogoNovedadesRepository, useValue: { listar: () => of([]) } },
        { provide: CuentaRepository, useValue: {
            consultar: opciones.consulta ?? (() => of(actual)),
            consultarAcciones: () => of({ codigo: 'CM-94421', accionesDisponibles: [] }),
        } },
      ],
    }).compileComponents();
    // La cuenta la carga la vista que contiene la grilla; aquí no está, así que se carga a mano.
    TestBed.inject(CuentaFacade).buscar('CM-94421');

    fixture = TestBed.createComponent(LineasListComponent);
    fixture.componentRef.setInput('codigo', 'CM-94421');
    await estabilizar(!opciones.consulta);
  };

  const estabilizar = async (esperar = true) => {
    fixture.detectChanges();
    await new Promise(r => setTimeout(r));
    if (esperar) await fixture.whenStable();
    fixture.detectChanges();
  };

  /** Lo que el servicio dirá en la próxima consulta, y la consulta. */
  const pasarA = async (estado: string) => {
    actual = cuentaEn(estado);
    TestBed.inject(CuentaFacade).recargar();
    await estabilizar();
  };

  const dom = (): HTMLElement => fixture.nativeElement;
  const boton = (id: string) => dom().querySelector<HTMLButtonElement>(`#${id}`);
  const texto = (e: Element | null | undefined) => e?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
  const apagado = (b: HTMLElement | null) =>
    !!b && (b.hasAttribute('disabled') || b.getAttribute('aria-disabled') === 'true');
  const ayudaDe = (id: string) =>
    fixture.debugElement.query(By.css(`#${id}`)).injector.get(MatTooltip).message;
  const chipDe = (i: number) => fixture.debugElement.queryAll(By.css('tr.mat-mdc-row'))[i]
    .query(By.css('.mat-column-estado mat-chip'));

  /** Los que cambian datos en la barra de la selección. */
  const CAMBIAN_DATOS = ['btn-desbloquear-seleccion', 'btn-aplicar-glosa', 'btn-anadir-mensaje',
                         'btn-quitar-mensaje', 'btn-anadir-pendiente'];

  /** Marca la línea 1 y filtra por un motivo, para que la barra ofrezca también «Resolver». */
  const marcarConMotivo = async () => {
    fixture.componentInstance.facade.aplicarFiltro({ motivoPendiente: 'MOT-PRUEBA' });
    await estabilizar();
    fixture.componentInstance.facade.alternarSeleccion(1);
    await estabilizar();
  };

  it('[EST-01.2] [EST-01.4] en adjudicación manual la grilla es de consulta: sin lápiz ni «Editar aquí», y se dice por qué una vez', async () => {
    await montar({ cuenta: cuentaEn('ADJUDICACION_MANUAL') });

    expect(boton('btn-detalle-1')).not.toBeNull();
    expect(boton('btn-editar-1')).toBeNull();
    expect(boton('btn-editar-fila-1')).toBeNull();
    // Ni llamándolo a mano: la regla está también en el método.
    fixture.componentInstance.editarEnFila(fila(1));
    await estabilizar();
    expect(fixture.componentInstance.filaEnEdicion()).toBeNull();

    expect(dom().querySelectorAll('[id$="-sin-cambios"]')).toHaveLength(1);
    expect(texto(dom().querySelector('#aviso-cuenta-sin-cambios span'))).toBe(MOTIVO_DE_LA_ADJUDICACION);
  });

  it('[EST-01.2] el distintivo de la fila dice «No editable» con el porqué de la cuenta, aunque la línea lo sea', async () => {
    await montar({ cuenta: cuentaEn('ADJUDICACION_MANUAL') });

    expect(texto(chipDe(0).nativeElement)).toBe('No editable');
    expect(chipDe(0).injector.get(MatTooltip).message).toBe(MOTIVO_DE_LA_ADJUDICACION);
    // La que no es editable por sí misma no culpa a la cuenta.
    expect(chipDe(1).injector.get(MatTooltip).message).toBe('');
  });

  it('[EST-01.2] [EST-03.2] en la barra de la selección lo que cambia datos se apaga con su motivo y «Resolver» sigue', async () => {
    await montar({ cuenta: cuentaEn('ADJUDICACION_MANUAL') });
    await marcarConMotivo();

    for (const id of CAMBIAN_DATOS) {
      expect(boton(id)?.getAttribute('aria-disabled')).toBe('true');
      expect(ayudaDe(id)).toBe(MOTIVO_DE_LA_ADJUDICACION);
    }
    expect(apagado(boton('btn-resolver-seleccion'))).toBe(false);

    // Apagado pero alcanzable: el clic llega y no abre nada ni sale al servicio.
    boton('btn-aplicar-glosa')!.click();
    boton('btn-desbloquear-seleccion')!.click();
    await estabilizar();
    expect(fixture.componentInstance.formularioAbierto()).toBeNull();
    expect(lineaRepo['aplicarEnLote']).not.toHaveBeenCalled();
    expect(texto(dom().querySelector('#error-seleccion'))).toBe(MOTIVO_DE_LA_ADJUDICACION);
  });

  it('[EST-03.2] [EST-03.4] «Resolver {motivo} en N» resuelve fuera de Modificación, y al acabar avisa a la cuenta', async () => {
    await montar({ cuenta: cuentaEn('ADJUDICACION_MANUAL') });
    await marcarConMotivo();

    boton('btn-resolver-seleccion')!.click();
    await estabilizar();

    expect(pendienteRepo['resolverEnMasa']).toHaveBeenCalledWith('CM-94421',
      expect.objectContaining({ motivos: ['MOT-PRUEBA'], nivel: 'LINEAS', lineas: [1] }), expect.anything());
    // Acabó: la vista de la cuenta la volverá a pedir, porque pudo cambiar de estado.
    expect(TestBed.inject(PendienteFacade).ultimaResolucionDe('CM-94421')).not.toBeNull();
  });

  it('[EST-01.1] en Modificación se ofrecen los cambios de siempre, sin aviso', async () => {
    await montar({ cuenta: cuentaEn('MODIFICACION') });
    await marcarConMotivo();

    expect(boton('btn-editar-1')).not.toBeNull();
    expect(boton('btn-editar-fila-1')).not.toBeNull();
    expect(texto(chipDe(0).nativeElement)).toBe('Editable');
    expect(dom().querySelector('#aviso-cuenta-sin-cambios')).toBeNull();
    for (const id of CAMBIAN_DATOS) expect(apagado(boton(id))).toBe(false);

    boton('btn-aplicar-glosa')!.click();
    await estabilizar();
    expect(fixture.componentInstance.formularioAbierto()).toBe('glosa');
  });

  for (const estado of ['FINALIZADA', 'ANULADA', 'EN_PROCESO', 'DESCONOCIDO']) {
    it(`[EST-01.3] en ${estado} tampoco se edita, y se dice por qué`, async () => {
      await montar({ cuenta: cuentaEn(estado) });

      expect(boton('btn-editar-1')).toBeNull();
      expect(boton('btn-editar-fila-1')).toBeNull();
      expect(dom().querySelector('#aviso-cuenta-sin-cambios')).not.toBeNull();
    });
  }

  it('[EST-01.3] con la cuenta todavía sin cargar no se edita, y no se afirma en qué estado está', async () => {
    await montar({ consulta: () => NEVER });

    expect(boton('btn-detalle-1')).not.toBeNull();
    expect(boton('btn-editar-1')).toBeNull();
    expect(boton('btn-editar-fila-1')).toBeNull();
    expect(dom().querySelector('#aviso-cuenta-sin-cambios')).toBeNull();
  });

  it('[EST-01.8] una fila en edición y un formulario de la selección se cierran sin guardar si la cuenta sale de Modificación', async () => {
    await montar({ cuenta: cuentaEn('MODIFICACION') });
    boton('btn-editar-fila-1')!.click();
    await estabilizar();
    const valor = dom().querySelector<HTMLInputElement>('input[aria-label="Valor convenido"]')!;
    valor.value = '850';
    valor.dispatchEvent(new Event('input'));
    await marcarConMotivo();
    boton('btn-anadir-pendiente')!.click();
    await estabilizar();
    expect(dom().querySelector('tr.fila-en-edicion')).not.toBeNull();
    expect(fixture.componentInstance.formularioAbierto()).toBe('pendiente');

    await pasarA('ADJUDICACION_MANUAL');

    expect(dom().querySelector('tr.fila-en-edicion')).toBeNull();
    expect(fixture.componentInstance.formularioAbierto()).toBeNull();
    expect(lineaRepo['guardar']).not.toHaveBeenCalled();
    expect(pendienteRepo['agregarMotivo']).not.toHaveBeenCalled();
    expect(dom().querySelector('#aviso-cuenta-sin-cambios')).not.toBeNull();
  });

  it('[EST-01.1] [EST-02.2] al pasar a Modificación la edición se habilita sin recargar la grilla', async () => {
    await montar({ cuenta: cuentaEn('ADJUDICACION_MANUAL') });
    const consultas = lineaRepo['listar'].mock.calls.length;
    expect(boton('btn-editar-fila-1')).toBeNull();

    await pasarA('MODIFICACION');

    expect(boton('btn-editar-fila-1')).not.toBeNull();
    expect(dom().querySelector('#aviso-cuenta-sin-cambios')).toBeNull();
    expect(lineaRepo['listar'].mock.calls.length).toBe(consultas);
  });
});
