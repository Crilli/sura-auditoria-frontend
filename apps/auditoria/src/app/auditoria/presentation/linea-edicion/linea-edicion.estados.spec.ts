import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { LineaEdicionComponent } from './linea-edicion.component';
import { LineaRepository } from '../../domain/ports/linea.repository';
import { CuentaRepository } from '../../domain/ports/cuenta.repository';
import { PendienteRepository } from '../../domain/ports/pendiente.repository';
import { CatalogoNovedadesRepository } from '../../domain/ports/catalogo-novedades.repository';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CuentaFacade } from '../../application/facades/cuenta.facade';
import { LineaFacade } from '../../application/facades/linea.facade';
import { CuentaMedicaModel } from '../../domain/models/cuenta-medica.model';
import { DetalleLineaModel } from '../../domain/models/linea-cuenta.model';
import { ModoLinea } from './modo-linea';

/**
 * La pantalla de la línea con las reglas de estado del 2026-10-21: solo se edita con la cuenta en
 * Modificación (EST-01), también si se abre `…/editar` a mano, y una edición abierta se cierra sin
 * guardar si la cuenta sale de Modificación. Los códigos son de prueba; ningún dato identifica a
 * una persona.
 */

const detalle = (cambios: Partial<DetalleLineaModel> = {}): DetalleLineaModel => ({
  referencia: 1, codigoCuenta: 'CM-94421', numeroLinea: 1, fechaInicio: '2026-08-05', fechaFin: null,
  codigoAfiliado: 'X', nombreAfiliado: null, codigoProcedimiento: '890201',
  descripcionProcedimiento: null, catalogoProcedimiento: 'CUPS',
  prestacion: { codigo: '890201', descripcion: null, catalogo: 'CUPS', codigoNoDefinido: null,
                codigoNoDefinidoDef: null, descripcionRips: null, claseServicio: null, especialidad: null },
  codigoAutorizacion: null, prestadorAtencionCodigo: null, prestadorAtencionNombre: null,
  valorCargado: 1_000, unidadesCargadas: 3,
  valorConvenido: 900, unidadesConvenidas: 2,
  valorAutorizado: 800, unidadesAutorizadas: 1,
  valorGlosado: 100, observacionesGlosa: null,
  convenio: {
    codigoTarifarioIss2001: null, codigoTarifarioIss2000: null, codigoTarifarioSoat: null,
    numeroContrato: null, homologoCups: null, multiplesCupsHomologos: null,
    codigoUnicoContratoSiifa: null, valorTarifaContrato: 950, tarifaAplicada: 'Cláusula de prueba',
  },
  otrosDatos: { tipoSala: null, viaDeAcceso: null, unidadEstrategicaNegocio: null, codigoSiniestro: null },
  diagnosticos: [], glosas: [],
  conservarBeneficios: false, conservarTarifacion: false, beneficiosManuales: false,
  tarifacionManual: false, bloqueada: false, reemplazada: false, editable: true,
  novedades: [], pendientes: [], version: 7, ...cambios,
} as DetalleLineaModel);

const cuentaEn = (estado: string): CuentaMedicaModel => ({
  codigo: 'CM-94421', estado, admiteCambios: estado === 'MODIFICACION', version: 7, novedades: [],
} as unknown as CuentaMedicaModel);

describe('LineaEdicionComponent — solo se edita en Modificación', () => {
  let fixture: ComponentFixture<LineaEdicionComponent>;
  let actual: CuentaMedicaModel;
  let guardar: ReturnType<typeof vi.fn>;
  let consultarDetalle: ReturnType<typeof vi.fn>;

  const montar = async (opciones: { cuenta: CuentaMedicaModel; modo: ModoLinea; linea?: DetalleLineaModel }) => {
    actual = opciones.cuenta;
    guardar = vi.fn(() => of(opciones.linea ?? detalle()));
    consultarDetalle = vi.fn(() => of(opciones.linea ?? detalle()));
    await TestBed.configureTestingModule({
      imports: [LineaEdicionComponent],
      providers: [
        provideRouter([]), provideNoopAnimations(),
        { provide: LineaRepository, useValue: {
            consultarDetalle,
            consultarSiguiente: () => of(null),
            guardar,
        } },
        { provide: CuentaRepository, useValue: {
            consultar: () => of(actual),
            consultarAcciones: () => of({ codigo: 'CM-94421', accionesDisponibles: [] }),
        } },
        { provide: PendienteRepository, useValue: {} },
        { provide: CatalogoNovedadesRepository, useValue: { listar: () => of([]) } },
      ],
    }).compileComponents();
    // La cuenta la carga la vista que contiene la línea; aquí no está, así que se carga a mano.
    TestBed.inject(CuentaFacade).buscar('CM-94421');

    fixture = TestBed.createComponent(LineaEdicionComponent);
    fixture.componentRef.setInput('codigo', 'CM-94421');
    fixture.componentRef.setInput('referencia', '1');
    fixture.componentRef.setInput('modo', opciones.modo);
    await estabilizar();
  };

  const estabilizar = async () => {
    for (let vuelta = 0; vuelta < 2; vuelta++) {
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));
      await fixture.whenStable();
    }
    fixture.detectChanges();
  };

  const dom = (): HTMLElement => fixture.nativeElement;
  const texto = (e: Element | null | undefined) => e?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
  const modo = () => texto(dom().querySelector('.modo'));

  it('[EST-01.5] [EST-01.4] la ruta …/editar abierta a mano con la cuenta en adjudicación manual abre en consulta, con el aviso de la cuenta', async () => {
    await montar({ cuenta: cuentaEn('ADJUDICACION_MANUAL'), modo: 'edicion' });

    expect(modo()).toContain('Consulta');
    expect(fixture.componentInstance.esEdicion()).toBe(false);
    expect(fixture.componentInstance.form.disabled).toBe(true);
    expect(dom().querySelector('#btn-guardar, #btn-guardar-siguiente, #btn-entrar-edicion')).toBeNull();
    const aviso = texto(dom().querySelector('#aviso-linea-sin-cambios span'));
    expect(aviso).toContain('La cuenta está en Adjudicación manual: sus datos solo se cambian en Modificación.');
    expect(aviso).toContain('Use «Pasar a Modificación» en la barra.');
    expect(aviso).toContain('Se pidió abrirla en edición y se abrió en consulta.');
    // El motivo es de la cuenta, no de la línea: el aviso de la línea no sale.
    expect(dom().querySelector('#aviso-linea-no-editable')).toBeNull();
    expect(dom().textContent).not.toContain('Esta línea no es editable');
  });

  it('[EST-01.2] en consulta, con la cuenta fuera de Modificación, no se ofrece «Editar línea» y se dice por qué', async () => {
    await montar({ cuenta: cuentaEn('FINALIZADA'), modo: 'lectura' });

    expect(dom().querySelector('#btn-entrar-edicion')).toBeNull();
    const aviso = texto(dom().querySelector('#aviso-linea-sin-cambios span'));
    expect(aviso).toContain('La cuenta está en Finalizada');
    expect(aviso).not.toContain('Se pidió abrirla en edición');
  });

  it('[EST-01.1] en Modificación la línea editable se abre en edición, sin aviso', async () => {
    await montar({ cuenta: cuentaEn('MODIFICACION'), modo: 'edicion' });

    expect(modo()).toContain('Edición');
    expect(fixture.componentInstance.form.enabled).toBe(true);
    expect(dom().querySelector('#btn-guardar')).not.toBeNull();
    expect(dom().querySelector('#aviso-linea-sin-cambios')).toBeNull();
  });

  it('[EST-01.7] en Modificación, una línea bloqueada sigue sin editarse y lo dice la línea, no la cuenta', async () => {
    await montar({ cuenta: cuentaEn('MODIFICACION'), modo: 'edicion',
                   linea: detalle({ editable: false, bloqueada: true }) });

    expect(fixture.componentInstance.esEdicion()).toBe(false);
    expect(texto(dom().querySelector('#aviso-linea-no-editable'))).toContain('Esta línea está bloqueada');
    expect(dom().querySelector('#aviso-linea-sin-cambios')).toBeNull();
  });

  it('[EST-01.8] una edición abierta se cierra sin guardar si la cuenta sale de Modificación: lo tecleado y lo marcado se descartan', async () => {
    await montar({ cuenta: cuentaEn('MODIFICACION'), modo: 'edicion' });
    const vista = fixture.componentInstance;
    vista.form.controls.valorConvenido.setValue(850);
    vista.anotarCambioDeGlosa({ operacion: 'AGREGAR', codigoGlosa: 'GLOSA-PRUEBA', valor: 10 } as never);
    vista.anotarCambioDeNovedad({ operacion: 'AGREGAR', codigoNovedad: 'CLA-FL-PRIC-004' });
    await estabilizar();

    // Otro la envió: la siguiente consulta la trae en adjudicación manual.
    actual = cuentaEn('ADJUDICACION_MANUAL');
    TestBed.inject(CuentaFacade).recargar();
    await estabilizar();

    expect(vista.esEdicion()).toBe(false);
    expect(modo()).toContain('Consulta');
    expect(vista.form.disabled).toBe(true);
    expect(vista.form.controls.valorConvenido.value).toBe(900);
    expect(vista.cambiosDeGlosa()).toEqual([]);
    expect(vista.cambiosDeNovedad()).toEqual([]);
    expect(dom().querySelector('#aviso-linea-sin-cambios')).not.toBeNull();

    await vista.guardar();
    expect(guardar).not.toHaveBeenCalled();
  });

  /** Lo que hace la vista de la cuenta tras una acción de la tira con éxito (EST-02.4). */
  const releerTrasLaAccion = async () => {
    await TestBed.inject(LineaFacade).recargarTrasCambioDeEstado('CM-94421');
    await estabilizar();
  };

  it('[EST-02.4] releer la línea tras una acción sobre la cuenta que no la tocó conserva lo tecleado', async () => {
    await montar({ cuenta: cuentaEn('MODIFICACION'), modo: 'edicion' });
    const vista = fixture.componentInstance;
    vista.form.controls.valorConvenido.setValue(850);
    vista.form.controls.valorConvenido.markAsDirty();
    await estabilizar();

    // «Desbloquear líneas» desde la tira: la cuenta sigue en Modificación y esta línea, en su versión.
    await releerTrasLaAccion();

    expect(consultarDetalle).toHaveBeenCalledTimes(2);
    expect(vista.esEdicion()).toBe(true);
    expect(vista.form.controls.valorConvenido.value).toBe(850);
    expect(vista.form.dirty).toBe(true);
  });

  it('[EST-02.4] si la acción cambió la línea, se recarga con su versión nueva y se avisa de que lo tecleado se descartó; el propio guardado no avisa', async () => {
    await montar({ cuenta: cuentaEn('MODIFICACION'), modo: 'edicion' });
    const vista = fixture.componentInstance;
    const avisar = vi.spyOn(fixture.debugElement.injector.get(MatSnackBar), 'open');
    vista.form.controls.valorConvenido.setValue(850);
    vista.form.controls.valorConvenido.markAsDirty();
    await estabilizar();

    consultarDetalle.mockReturnValue(of(detalle({ version: 8 })));
    await releerTrasLaAccion();

    // Lo tecleado era sobre la versión 7: guardarlo chocaría con un 412.
    expect(vista.form.controls.valorConvenido.value).toBe(900);
    expect(avisar).toHaveBeenCalledWith(
      'La línea cambió con la acción sobre la cuenta y se volvió a cargar: lo tecleado sin guardar se descartó.',
      'Cerrar', expect.anything());

    avisar.mockClear();
    vista.form.controls.valorConvenido.setValue(870);
    vista.form.controls.valorConvenido.markAsDirty();
    vista.form.controls.modoRecalculo.setValue('AISLADO');
    await vista.guardar();
    await estabilizar();
    expect(guardar).toHaveBeenCalledTimes(1);
    expect(avisar.mock.calls.map(c => c[0])).toEqual(['Línea guardada']);
  });
});
