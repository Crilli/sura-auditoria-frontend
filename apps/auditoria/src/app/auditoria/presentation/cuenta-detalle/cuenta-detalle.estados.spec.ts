import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltip } from '@angular/material/tooltip';
import { NEVER, Observable, Subject, of, throwError } from 'rxjs';
import { environment } from '@sura/environments';
import { CuentaDetalleComponent } from './cuenta-detalle.component';
import { EnviarCuentaDialogComponent } from '../enviar-cuenta-dialog/enviar-cuenta-dialog.component';
import { CuentaRepository } from '../../domain/ports/cuenta.repository';
import { LineaRepository } from '../../domain/ports/linea.repository';
import { PendienteRepository } from '../../domain/ports/pendiente.repository';
import { CatalogoNovedadesRepository } from '../../domain/ports/catalogo-novedades.repository';
import { LineaFacade } from '../../application/facades/linea.facade';
import { PendienteFacade } from '../../application/facades/pendiente.facade';
import {
  AccionCuenta, AccionesDisponiblesModel, CuentaMedicaModel, MotivoModel
} from '../../domain/models/cuenta-medica.model';
import { DatosDialogoAccion } from './dialogo-accion.component';

/**
 * Las reglas de estado del 2026-10-21 en la vista de la cuenta: el botón de envío con su rótulo
 * por estado (BTN-13), «Pasar a Modificación» (EST-02), las novedades de cabecera que solo se
 * cambian en Modificación (EST-01) y la cuenta que sigue a una resolución de pendientes (EST-03.4).
 *
 * La cuenta del repositorio de mentira es una variable: lo que cambia una acción se ve en la
 * siguiente consulta, como en el servicio. Los códigos de cuenta y de motivo son de prueba;
 * ningún dato identifica a una persona.
 */

const cuentaEn = (estado: string, cambios: Partial<CuentaMedicaModel> = {}): CuentaMedicaModel => ({
  codigo: 'CM-94421', estado, fechaInicio: '2023-06-09', fechaFin: '2023-06-09',
  totalConvenido: 900_000, totalAutorizado: 800_000, version: 499, pendientesSinResolver: 0,
  // Lo que publica el servicio: solo en Modificación.
  admiteCambios: estado === 'MODIFICACION',
  informacionFacturacion: null, respuestasGlosa: [], novedades: [], ...cambios,
} as unknown as CuentaMedicaModel);

const MOTIVO: MotivoModel = {
  codigo: 'MOTIVO_PRUEBA', descripcion: 'Motivo de prueba', bloqueaLineas: false,
  exigeReferencia: false, ambito: 'CUENTA_MEDICA', permiso: null,
};

/** Como lo deja el interceptor del API: un `Error` con el estado y el código pegados. */
const rechazo = (mensaje: string, codigo = 'ACCION_NO_DISPONIBLE') =>
  throwError(() => Object.assign(new Error(mensaje), { status: 409, codigo }));

describe('CuentaDetalleComponent — reglas de estado (envío, paso a Modificación, cambios)', () => {
  let fixture: ComponentFixture<CuentaDetalleComponent>;
  let actual: CuentaMedicaModel;
  let acciones: AccionCuenta[];
  let repo: Record<string, ReturnType<typeof vi.fn>>;

  const montar = async (opciones: {
    cuenta: CuentaMedicaModel;
    acciones?: AccionCuenta[];
    consultaDeAcciones?: () => Observable<AccionesDisponiblesModel>;
    esperar?: boolean;
  }) => {
    actual = opciones.cuenta;
    acciones = opciones.acciones ?? [];
    repo = {
      consultar:         vi.fn(() => of(actual)),
      consultarAcciones: vi.fn(opciones.consultaDeAcciones
        ?? (() => of({ codigo: 'CM-94421', accionesDisponibles: acciones }))),
      consultarVersiones: vi.fn(() => of([])),
      consultarHistoria:  vi.fn(() => of([])),
      consultarMotivos:   vi.fn(() => of([MOTIVO])),
      ejecutarAccion:     vi.fn(() => of(actual)),
      enviar:             vi.fn(() => of({ codigoCuenta: 'CM-94421', referenciaSeguimiento: 'T-1' })),
      guardarNovedades:   vi.fn(() => of(actual)),
    };
    await TestBed.configureTestingModule({
      imports: [CuentaDetalleComponent],
      providers: [
        provideRouter([]), provideNoopAnimations(),
        { provide: CuentaRepository, useValue: repo },
        { provide: LineaRepository, useValue: {} },
        { provide: PendienteRepository, useValue: { resumirMotivos: () => of([]) } },
        { provide: CatalogoNovedadesRepository, useValue: { listar: () => of([]) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CuentaDetalleComponent);
    fixture.componentRef.setInput('codigo', 'CM-94421');
    fixture.detectChanges();
    if (opciones.esperar === false) await new Promise(r => setTimeout(r));
    else await fixture.whenStable();
    fixture.detectChanges();
  };

  /**
   * Deja que acabe lo que dispara un clic. Las acciones encadenan promesas —el catálogo de
   * motivos, el diálogo, la orden, la recarga— que la espera de estabilidad no ve: se le dan unas
   * vueltas al reloj antes de esperarla.
   */
  const estabilizar = async () => {
    for (let vuelta = 0; vuelta < 3; vuelta++) {
      fixture.detectChanges();
      await new Promise(r => setTimeout(r));
      await fixture.whenStable();
    }
    fixture.detectChanges();
  };

  afterEach(() => TestBed.inject(MatDialog).closeAll());

  const dom = (): HTMLElement => fixture.nativeElement;
  const enLaCapa = (selector: string) => document.querySelector<HTMLElement>(`.cdk-overlay-container ${selector}`);
  const texto = (e: Element | null | undefined) => e?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
  const enviar = () => dom().querySelector<HTMLButtonElement>('#btn-enviar');
  const pasar = () => dom().querySelector<HTMLButtonElement>('#btn-pasar-a-modificacion');
  const apagado = (b: HTMLElement | null) =>
    !!b && (b.hasAttribute('disabled') || b.getAttribute('aria-disabled') === 'true');
  const ayudaDe = (selector: string) =>
    fixture.debugElement.query(By.css(selector)).injector.get(MatTooltip).message;
  const abrirMenu = async () => {
    dom().querySelector<HTMLButtonElement>('#btn-menu-cuenta')!.click();
    await estabilizar();
  };
  /** Intercepta los diálogos: el que se abra devuelve `resultado` al cerrarse. */
  const dialogosQueDevuelven = (resultado: unknown) =>
    vi.spyOn(fixture.debugElement.injector.get(MatDialog), 'open')
      .mockReturnValue({ afterClosed: () => of(resultado) } as never);
  const datosDelDialogo = (abrir: ReturnType<typeof dialogosQueDevuelven>) =>
    (abrir.mock.calls[0][1] as { data: DatosDialogoAccion }).data;

  // ── El botón de envío (BTN-13) ─────────────────────────────────────────

  it('[BTN-13.1] en adjudicación manual el botón dice «Aceptar», y la tira de acciones remite a ese nombre', async () => {
    await montar({ cuenta: cuentaEn('ADJUDICACION_MANUAL'), acciones: ['ENVIAR'] });

    expect(texto(enviar())).toContain('Aceptar');
    expect(texto(enviar())).not.toContain('Enviar');
    const distintivo = fixture.debugElement.queryAll(By.css('.accion-en-otro-sitio'))
      .find(d => texto(d.nativeElement) === 'Aceptar')!;
    expect(distintivo.injector.get(MatTooltip).message)
      .toBe('Se envía con el botón «Aceptar» de la barra superior');
  });

  it('[BTN-13.2] [EST-02.6] en Modificación el botón dice «Enviar» y no se ofrece pasar a Modificación, ni en la barra ni en el menú', async () => {
    await montar({ cuenta: cuentaEn('MODIFICACION'), acciones: ['ENVIAR', 'DEVOLVER_A_MODIFICACION'] });

    expect(texto(enviar())).toContain('Enviar');
    expect(pasar()).toBeNull();
    await abrirMenu();
    expect(enLaCapa('#menu-pasar-a-modificacion')).toBeNull();
  });

  for (const estado of ['ANULADA', 'EN_PROCESO', 'DESCONOCIDO', 'TARIFACION_MANUAL']) {
    it(`[BTN-13.6] [BTN-13.10] en ${estado} el botón está, dice «Enviar», está habilitado y abre su diálogo`, async () => {
      // Sin ENVIAR publicado a propósito: tampoco eso lo apaga.
      await montar({ cuenta: cuentaEn(estado) });
      const abrir = dialogosQueDevuelven(false);

      expect(texto(enviar())).toContain('Enviar');
      expect(apagado(enviar())).toBe(false);
      enviar()!.click();
      expect(abrir).toHaveBeenCalledWith(EnviarCuentaDialogComponent, expect.objectContaining({
        data: { codigoCuenta: 'CM-94421', rotulo: 'Enviar' } }));
    });
  }

  it('[BTN-13.3] [BTN-13.7] si OHI rechaza el envío, se lee por qué en el diálogo, que sigue abierto; la cuenta no cambia y el botón sigue', async () => {
    await montar({ cuenta: cuentaEn('ADJUDICACION_MANUAL', { pendientesSinResolver: 2 }), acciones: ['ENVIAR'] });
    repo['enviar'].mockReturnValue(rechazo('La cuenta CM-94421 tiene pendientes que frenan el envío.',
                                           'PENDIENTES_SIN_RESOLVER'));
    const consultasAntes = repo['consultar'].mock.calls.length;

    enviar()!.click();
    await estabilizar();
    expect(texto(enLaCapa('#titulo-envio'))).toBe('Aceptar la cuenta CM-94421');
    const dialogo = TestBed.inject(MatDialog).openDialogs[0].componentInstance as EnviarCuentaDialogComponent;
    dialogo.form.setValue({ decision: 'ACEPTAR', codigoNovedad: '' });
    await estabilizar();
    enLaCapa('#btn-confirmar-envio')!.click();
    await estabilizar();

    // El mismo POST de siempre, firmado por el auditor de la configuración.
    expect(repo['enviar']).toHaveBeenCalledWith('CM-94421', { decision: 'ACEPTAR', codigoNovedad: undefined },
                                                environment.auditor);
    expect(texto(enLaCapa('#error-envio'))).toContain('pendientes que frenan el envío');
    expect(TestBed.inject(MatDialog).openDialogs).toHaveLength(1);
    // Se relee por si el rechazo se debe a que otro la movió; aquí no cambió, y el botón sigue
    // ahí con su rótulo.
    expect(repo['consultar'].mock.calls.length).toBeGreaterThan(consultasAntes);
    expect(texto(enviar())).toContain('Aceptar');
    expect(apagado(enviar())).toBe(false);
  });

  it('[BTN-13.7] el diálogo de envío solo enseña el rechazo de su propio intento: ni el de uno anterior ni el de otro comando', async () => {
    await montar({ cuenta: cuentaEn('ADJUDICACION_MANUAL', { pendientesSinResolver: 2 }),
                   acciones: ['ENVIAR', 'DEVOLVER_A_MODIFICACION'] });
    repo['enviar'].mockReturnValue(rechazo('La cuenta CM-94421 tiene pendientes que frenan el envío.',
                                           'PENDIENTES_SIN_RESOLVER'));
    const dialogos = TestBed.inject(MatDialog);
    enviar()!.click();
    await estabilizar();
    (dialogos.openDialogs[0].componentInstance as EnviarCuentaDialogComponent)
      .form.setValue({ decision: 'ACEPTAR', codigoNovedad: '' });
    await estabilizar();
    enLaCapa('#btn-confirmar-envio')!.click();
    await estabilizar();
    expect(texto(enLaCapa('#error-envio'))).toContain('frenan el envío');

    // Cancela, resuelve sus pendientes —la cuenta se relee sin ellos— y vuelve a abrir.
    dialogos.closeAll();
    actual = cuentaEn('ADJUDICACION_MANUAL');
    fixture.componentInstance.facade.recargar();
    await estabilizar();
    enviar()!.click();
    await estabilizar();
    expect(enLaCapa('#error-envio')).toBeNull();

    // Y el rechazo de «Pasar a Modificación» no es del envío.
    dialogos.closeAll();
    repo['ejecutarAccion'].mockReturnValue(rechazo('OHI no admite esa acción en el estado actual.'));
    const abrir = vi.spyOn(dialogos, 'open');
    abrir.mockReturnValueOnce({ afterClosed: () => of({}) } as never);
    pasar()!.click();
    await estabilizar();
    abrir.mockRestore();
    enviar()!.click();
    await estabilizar();
    expect(texto(enLaCapa('#titulo-envio'))).toBe('Aceptar la cuenta CM-94421');
    expect(enLaCapa('#error-envio')).toBeNull();
    expect(repo['enviar']).toHaveBeenCalledTimes(1);
  });

  it('[BTN-13.4] mientras envía, ni Escape ni un clic fuera cierran el diálogo: no sale un segundo envío y el que acaba bien relee las líneas', async () => {
    await montar({ cuenta: cuentaEn('MODIFICACION'), acciones: ['ENVIAR'] });
    const releerLineas = vi.spyOn(TestBed.inject(LineaFacade), 'recargarTrasCambioDeEstado').mockResolvedValue();
    const respuesta = new Subject<{ codigoCuenta: string; referenciaSeguimiento: string }>();
    repo['enviar'].mockReturnValue(respuesta);
    const dialogos = TestBed.inject(MatDialog);
    enviar()!.click();
    await estabilizar();
    const dialogo = dialogos.openDialogs[0].componentInstance as EnviarCuentaDialogComponent;
    dialogo.form.setValue({ decision: 'ACEPTAR', codigoNovedad: '' });
    await estabilizar();
    enLaCapa('#btn-confirmar-envio')!.click();
    await estabilizar();
    expect(dialogo.enviando()).toBe(true);

    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, bubbles: true } as KeyboardEventInit));
    document.querySelector<HTMLElement>('.cdk-overlay-backdrop')?.click();
    await estabilizar();
    expect(dialogos.openDialogs).toHaveLength(1);

    respuesta.next({ codigoCuenta: 'CM-94421', referenciaSeguimiento: 'T-1' });
    respuesta.complete();
    await estabilizar();
    expect(dialogos.openDialogs).toHaveLength(0);
    expect(repo['enviar']).toHaveBeenCalledTimes(1);
    expect(releerLineas).toHaveBeenCalledTimes(1);
  });

  it('[BTN-13.5] [BTN-13.8] el botón sigue al estado nuevo sin recargar la página: aceptada y finalizada, desaparece y queda «Pasar a Modificación»', async () => {
    await montar({ cuenta: cuentaEn('ADJUDICACION_MANUAL'), acciones: ['ENVIAR'] });
    const releerLineas = vi.spyOn(TestBed.inject(LineaFacade), 'recargarTrasCambioDeEstado').mockResolvedValue();
    const vista = fixture.componentInstance;

    enviar()!.click();
    await estabilizar();
    const dialogo = TestBed.inject(MatDialog).openDialogs[0].componentInstance as EnviarCuentaDialogComponent;
    dialogo.form.setValue({ decision: 'ACEPTAR', codigoNovedad: '' });
    // Lo que el servicio dirá en la próxima consulta.
    actual = cuentaEn('FINALIZADA');
    acciones = ['REVERTIR_FINALIZACION'];
    await dialogo.enviar();
    await estabilizar();

    expect(TestBed.inject(MatDialog).openDialogs).toHaveLength(0);
    expect(fixture.componentInstance).toBe(vista);
    expect(enviar()).toBeNull();
    expect(pasar()).not.toBeNull();
    expect(releerLineas).toHaveBeenCalledWith('CM-94421');
  });

  // ── «Pasar a Modificación» (EST-02) ────────────────────────────────────

  it('[EST-02.1] [EST-02.2] [BTN-13.8] fuera de Modificación devuelve la cuenta con una confirmación simple; queda en Modificación, el botón pasa a «Enviar» y las novedades se editan, sin recargar', async () => {
    await montar({ cuenta: cuentaEn('ADJUDICACION_MANUAL'), acciones: ['ENVIAR', 'DEVOLVER_A_MODIFICACION'] });
    const releerLineas = vi.spyOn(TestBed.inject(LineaFacade), 'recargarTrasCambioDeEstado').mockResolvedValue();
    const abrir = dialogosQueDevuelven({});
    expect(dom().querySelector('#aviso-novedades-sin-cambios')).not.toBeNull();
    expect(dom().querySelector('.novedades__agregar')).toBeNull();

    actual = cuentaEn('MODIFICACION');
    pasar()!.click();
    await estabilizar();

    const datos = datosDelDialogo(abrir);
    expect(datos).toMatchObject({ accion: 'DEVOLVER_A_MODIFICACION', etiqueta: 'Pasar a Modificación',
                                  pideMotivos: false, irreversible: false });
    expect(datos.explicacion).toContain('de Adjudicación manual a Modificación');
    expect(repo['consultarMotivos']).not.toHaveBeenCalled();
    expect(repo['ejecutarAccion']).toHaveBeenCalledWith('CM-94421', 'DEVOLVER_A_MODIFICACION', {}, environment.auditor);

    expect(texto(enviar())).toContain('Enviar');
    expect(pasar()).toBeNull();
    expect(dom().querySelector('#aviso-novedades-sin-cambios')).toBeNull();
    expect(dom().querySelector('.novedades__agregar')).not.toBeNull();
    expect(releerLineas).toHaveBeenCalledWith('CM-94421');
  });

  it('[EST-02.3] [EST-02.4] [BTN-13.5] en una finalizada no hay envío, y pasar a Modificación desfinaliza con motivos: queda directamente en Modificación y se releen las líneas', async () => {
    await montar({ cuenta: cuentaEn('FINALIZADA'), acciones: ['REVERTIR_FINALIZACION'] });
    const releerLineas = vi.spyOn(TestBed.inject(LineaFacade), 'recargarTrasCambioDeEstado').mockResolvedValue();
    const abrir = dialogosQueDevuelven({ motivos: ['MOTIVO_PRUEBA'] });
    expect(enviar()).toBeNull();

    // Lo medido: desfinalizar deja la cuenta en Modificación en la misma operación.
    actual = cuentaEn('MODIFICACION', { version: 500 });
    pasar()!.click();
    await estabilizar();

    expect(repo['consultarMotivos']).toHaveBeenCalledWith('CUENTA_MEDICA');
    const datos = datosDelDialogo(abrir);
    expect(datos).toMatchObject({ accion: 'REVERTIR_FINALIZACION', etiqueta: 'Pasar a Modificación',
                                  pideMotivos: true, motivos: [MOTIVO] });
    expect(datos.explicacion).toContain('se desfinaliza');
    expect(datos.explicacion).toContain('directamente en Modificación');
    expect(repo['ejecutarAccion']).toHaveBeenCalledWith(
      'CM-94421', 'REVERTIR_FINALIZACION', { motivos: ['MOTIVO_PRUEBA'] }, environment.auditor);

    expect(texto(enviar())).toContain('Enviar');
    expect(pasar()).toBeNull();
    expect(releerLineas).toHaveBeenCalledWith('CM-94421');
  });

  it('[EST-02.5] si OHI rechaza el paso, se lee por qué, la cuenta no cambia y el botón sigue', async () => {
    await montar({ cuenta: cuentaEn('ADJUDICACION_MANUAL'), acciones: ['DEVOLVER_A_MODIFICACION'] });
    dialogosQueDevuelven({});
    const avisar = vi.spyOn(fixture.debugElement.injector.get(MatSnackBar), 'open');
    const releerLineas = vi.spyOn(TestBed.inject(LineaFacade), 'recargarTrasCambioDeEstado');
    repo['ejecutarAccion'].mockReturnValue(rechazo('OHI no admite esa acción en el estado actual.'));
    const consultasAntes = repo['consultar'].mock.calls.length;

    pasar()!.click();
    await estabilizar();

    expect(avisar).toHaveBeenCalledWith('OHI no admite esa acción en el estado actual.', 'Cerrar', expect.anything());
    // Se relee por si otro la movió; aquí no cambió: el mismo estado, el mismo camino publicado.
    expect(repo['consultar'].mock.calls.length).toBeGreaterThan(consultasAntes);
    expect(texto(enviar())).toContain('Aceptar');
    expect(apagado(pasar())).toBe(false);
    expect(releerLineas).not.toHaveBeenCalled();
  });

  it('[EST-02.5] [EST-02.6] [BTN-13.8] si el rechazo se debe a que otro ya la pasó a Modificación, la barra sigue al estado real sin recargar la página', async () => {
    await montar({ cuenta: cuentaEn('ADJUDICACION_MANUAL'), acciones: ['ENVIAR', 'DEVOLVER_A_MODIFICACION'] });
    dialogosQueDevuelven({});
    // Otro auditor la pasó a Modificación: OHI ya no publica tochange y el servicio rechaza.
    actual = cuentaEn('MODIFICACION');
    acciones = ['ENVIAR'];
    repo['ejecutarAccion'].mockReturnValue(rechazo('La cuenta no permite la acción DEVOLVER_A_MODIFICACION en su estado actual'));

    pasar()!.click();
    await estabilizar();

    // Ni «Aceptar» ni «Pasar a Modificación» apagado con un motivo falso: lo que es la cuenta ahora.
    expect(texto(enviar())).toContain('Enviar');
    expect(pasar()).toBeNull();
    expect(fixture.componentInstance.facade.admiteCambios()).toBe(true);
    expect(dom().querySelector('.novedades__agregar')).not.toBeNull();
  });

  it('[EST-02.3] un doble clic en «Pasar a Modificación» de una finalizada pide los motivos una vez y abre un solo diálogo de desfinalizar', async () => {
    await montar({ cuenta: cuentaEn('FINALIZADA'), acciones: ['REVERTIR_FINALIZACION'] });
    // El catálogo tarda: entre el clic y el diálogo no hay modal que tape el botón.
    const motivos = new Subject<MotivoModel[]>();
    repo['consultarMotivos'].mockReturnValue(motivos);

    pasar()!.click();
    pasar()!.click();
    motivos.next([MOTIVO]);
    motivos.complete();
    await estabilizar();

    expect(repo['consultarMotivos']).toHaveBeenCalledTimes(1);
    expect(TestBed.inject(MatDialog).openDialogs).toHaveLength(1);
  });

  it('[EST-02.3] si falla el catálogo de motivos, se dice por qué y no queda un diálogo sin motivos ni salida', async () => {
    await montar({ cuenta: cuentaEn('FINALIZADA'), acciones: ['REVERTIR_FINALIZACION'] });
    repo['consultarMotivos'].mockReturnValue(throwError(() => new Error('El servicio respondió con un error (503)')));
    const abrir = vi.spyOn(fixture.debugElement.injector.get(MatDialog), 'open');
    const avisar = vi.spyOn(fixture.debugElement.injector.get(MatSnackBar), 'open');

    pasar()!.click();
    await estabilizar();

    expect(abrir).not.toHaveBeenCalled();
    expect(avisar).toHaveBeenCalledWith(
      'No se pudo consultar el catálogo de motivos, y «Pasar a Modificación» pide al menos uno. Vuelva a intentarlo.',
      'Cerrar', expect.anything());
    expect(repo['ejecutarAccion']).not.toHaveBeenCalled();
    // Y se puede volver a intentar: la puerta del doble clic no se queda cerrada.
    repo['consultarMotivos'].mockReturnValue(of([MOTIVO]));
    abrir.mockReturnValue({ afterClosed: () => of(null) } as never);
    pasar()!.click();
    await estabilizar();
    expect(abrir).toHaveBeenCalledTimes(1);
  });

  // ── El foco no se pierde cuando el botón se va (EST-02, BTN-13.5) ──────

  /** Pulsa un botón del diálogo abierto por su texto, como el auditor. */
  const pulsarEnElDialogo = (rotulo: string) =>
    [...document.querySelectorAll<HTMLButtonElement>('.cdk-overlay-container mat-dialog-actions button')]
      .find(b => texto(b) === rotulo)!.click();
  /** El diálogo devuelve el foco al cerrarse, después de su animación. */
  const esperarAlFoco = async () => {
    await estabilizar();
    await new Promise(r => setTimeout(r, 50));
    await estabilizar();
  };

  it('[EST-02.2] tras pasar a Modificación con el teclado, el botón se va y el foco queda en «Enviar»', async () => {
    await montar({ cuenta: cuentaEn('ADJUDICACION_MANUAL'), acciones: ['ENVIAR', 'DEVOLVER_A_MODIFICACION'] });
    vi.spyOn(TestBed.inject(LineaFacade), 'recargarTrasCambioDeEstado').mockResolvedValue();
    pasar()!.focus();
    pasar()!.click();
    await estabilizar();

    actual = cuentaEn('MODIFICACION');
    acciones = ['ENVIAR'];
    pulsarEnElDialogo('Pasar a Modificación');
    await esperarAlFoco();

    expect(pasar()).toBeNull();
    expect(document.activeElement).not.toBe(document.body);
    expect(document.activeElement).toBe(enviar());
  });

  it('[BTN-13.5] si la cuenta queda finalizada tras «Aceptar», el foco pasa a «Pasar a Modificación»', async () => {
    await montar({ cuenta: cuentaEn('ADJUDICACION_MANUAL'), acciones: ['ENVIAR'] });
    vi.spyOn(TestBed.inject(LineaFacade), 'recargarTrasCambioDeEstado').mockResolvedValue();
    enviar()!.focus();
    enviar()!.click();
    await estabilizar();
    (TestBed.inject(MatDialog).openDialogs[0].componentInstance as EnviarCuentaDialogComponent)
      .form.setValue({ decision: 'ACEPTAR', codigoNovedad: '' });
    await estabilizar();

    actual = cuentaEn('FINALIZADA');
    acciones = ['REVERTIR_FINALIZACION'];
    enLaCapa('#btn-confirmar-envio')!.click();
    await esperarAlFoco();

    expect(enviar()).toBeNull();
    expect(document.activeElement).not.toBe(document.body);
    expect(document.activeElement).toBe(pasar());
  });

  it('[EST-02.1] cancelar «Pasar a Modificación» abierto desde el menú devuelve el foco al botón del menú', async () => {
    await montar({ cuenta: cuentaEn('ADJUDICACION_MANUAL'), acciones: ['ENVIAR', 'DEVOLVER_A_MODIFICACION'] });
    const botonMenu = dom().querySelector<HTMLButtonElement>('#btn-menu-cuenta')!;
    botonMenu.focus();
    await abrirMenu();
    const opcion = enLaCapa('#menu-pasar-a-modificacion')!;
    opcion.focus();
    opcion.click();
    await estabilizar();

    pulsarEnElDialogo('Cancelar');
    await esperarAlFoco();

    expect(TestBed.inject(MatDialog).openDialogs).toHaveLength(0);
    expect(document.activeElement).not.toBe(document.body);
    expect(document.activeElement).toBe(botonMenu);
  });

  it('[EST-02.7] si OHI no publica el camino, se ve apagado con su motivo junto al botón y en el menú, y el clic no hace nada', async () => {
    await montar({ cuenta: cuentaEn('ADJUDICACION_MANUAL'), acciones: ['ENVIAR'] });
    const abrir = dialogosQueDevuelven({});
    const motivo = 'OHI no permite pasar a Modificación una cuenta en Adjudicación manual';

    // Apagado pero alcanzable: así se lee el motivo con el teclado.
    expect(pasar()!.getAttribute('aria-disabled')).toBe('true');
    expect(pasar()!.hasAttribute('disabled')).toBe(false);
    expect(ayudaDe('#btn-pasar-a-modificacion')).toBe(motivo);
    pasar()!.click();
    expect(abrir).not.toHaveBeenCalled();

    await abrirMenu();
    expect(apagado(enLaCapa('#menu-pasar-a-modificacion'))).toBe(true);
    expect(texto(enLaCapa('#motivo-no-pasar-a-modificacion'))).toBe(motivo);
    expect(enLaCapa('.mat-mdc-menu-panel')?.getAttribute('aria-describedby')).toBe('motivo-no-pasar-a-modificacion');
  });

  it('[EST-02.7] una finalizada que OHI no deja desfinalizar lo dice con sus palabras', async () => {
    await montar({ cuenta: cuentaEn('FINALIZADA') });

    expect(pasar()!.getAttribute('aria-disabled')).toBe('true');
    expect(ayudaDe('#btn-pasar-a-modificacion')).toBe('OHI no permite desfinalizar esta cuenta');
  });

  it('[EST-02.7] mientras se consultan las acciones, «Pasar a Modificación» espera apagado y lo dice', async () => {
    await montar({ cuenta: cuentaEn('ADJUDICACION_MANUAL'), consultaDeAcciones: () => NEVER, esperar: false });

    expect(pasar()!.getAttribute('aria-disabled')).toBe('true');
    expect(ayudaDe('#btn-pasar-a-modificacion')).toBe('Consultando…');
  });

  it('[EST-02.7] si la consulta de acciones falla, «Pasar a Modificación» se deja pulsar: que decida el servicio', async () => {
    await montar({ cuenta: cuentaEn('ADJUDICACION_MANUAL'),
                   consultaDeAcciones: () => throwError(() => new Error('El servicio respondió con un error (503)')) });
    const abrir = dialogosQueDevuelven(null);

    expect(apagado(pasar())).toBe(false);
    pasar()!.click();
    await estabilizar();
    expect(abrir).toHaveBeenCalledTimes(1);
  });

  it('[EST-02.1] en la tira de acciones, devolver y desfinalizar remiten a «Pasar a Modificación» de la barra en vez de ser otro botón', async () => {
    await montar({ cuenta: cuentaEn('ADJUDICACION_MANUAL'),
                   acciones: ['ENVIAR', 'DEVOLVER_A_MODIFICACION', 'ANULAR'] });

    const botones = [...dom().querySelectorAll('.acciones-disponibles .accion-boton')].map(texto);
    expect(botones).toEqual(['warning Anular']);
    const distintivo = fixture.debugElement.queryAll(By.css('.accion-en-otro-sitio'))
      .find(d => texto(d.nativeElement) === 'Devolver a modificación')!;
    expect(distintivo.injector.get(MatTooltip).message).toBe('Con «Pasar a Modificación» de la barra superior');
  });

  // ── Novedades de cabecera: solo en Modificación (EST-01) ───────────────

  it('[EST-01.2] [EST-01.4] en adjudicación manual las novedades de cabecera se ven sin poder tocarlas, y se dice por qué una vez', async () => {
    await montar({ cuenta: cuentaEn('ADJUDICACION_MANUAL') });

    expect(dom().querySelector('.novedades__agregar')).toBeNull();
    expect(dom().querySelectorAll('[id$="-sin-cambios"]')).toHaveLength(1);
    expect(texto(dom().querySelector('#aviso-novedades-sin-cambios span'))).toBe(
      'La cuenta está en Adjudicación manual: sus datos solo se cambian en Modificación. '
      + 'Use «Pasar a Modificación» en la barra.');
  });

  it('[EST-01.1] en Modificación se ofrece agregar novedades de cabecera, sin aviso', async () => {
    await montar({ cuenta: cuentaEn('MODIFICACION') });

    expect(dom().querySelector('.novedades__agregar')).not.toBeNull();
    expect(dom().querySelector('#aviso-novedades-sin-cambios')).toBeNull();
  });

  for (const estado of ['FINALIZADA', 'ANULADA', 'EN_PROCESO', 'DESCONOCIDO']) {
    it(`[EST-01.3] en ${estado} las novedades de cabecera tampoco se tocan`, async () => {
      await montar({ cuenta: cuentaEn(estado) });

      expect(dom().querySelector('.novedades__agregar')).toBeNull();
      expect(dom().querySelector('#aviso-novedades-sin-cambios')).not.toBeNull();
    });
  }

  it('[EST-01.3] un servicio que no publica si la cuenta admite cambios no deja editar, ni siquiera en Modificación', async () => {
    const sinElDato = cuentaEn('MODIFICACION') as unknown as Record<string, unknown>;
    delete sinElDato['admiteCambios'];
    await montar({ cuenta: sinElDato as unknown as CuentaMedicaModel });

    expect(fixture.componentInstance.facade.admiteCambios()).toBe(false);
    expect(dom().querySelector('.novedades__agregar')).toBeNull();
  });

  it('[EST-01.8] lo anotado en las novedades de cabecera y sin guardar se descarta si la cuenta sale de Modificación', async () => {
    await montar({ cuenta: cuentaEn('MODIFICACION') });
    const facade = fixture.componentInstance.facade;
    facade.anotarCambioDeNovedad({ operacion: 'AGREGAR', codigoNovedad: 'CLA-FL-PRIC-004' });
    await estabilizar();
    expect(texto(dom().querySelector('.novedades-cuenta__acciones'))).toContain('Guardar 1 cambio');

    // Otro la envió, o se resolvió algo: la siguiente consulta la trae en otro estado.
    actual = cuentaEn('ADJUDICACION_MANUAL');
    facade.recargar();
    await estabilizar();

    expect(facade.cambiosDeNovedad()).toEqual([]);
    expect(dom().querySelector('.novedades-cuenta__acciones')).toBeNull();
    expect(repo['guardarNovedades']).not.toHaveBeenCalled();
  });

  // ── Una resolución que mueve la cuenta (EST-03.4) ──────────────────────

  it('[EST-03.4] al acabar una resolución de pendientes la cuenta se vuelve a pedir, y la barra y la regla siguen al estado nuevo', async () => {
    await montar({ cuenta: cuentaEn('ADJUDICACION_MANUAL'), acciones: ['DEVOLVER_A_MODIFICACION'] });
    const pendientes = TestBed.inject(PendienteFacade);
    const consultasAntes = repo['consultar'].mock.calls.length;

    // Una de otra cuenta no la toca.
    pendientes.avisarDeResolucion('CM-57944');
    await estabilizar();
    expect(repo['consultar'].mock.calls.length).toBe(consultasAntes);

    actual = cuentaEn('MODIFICACION');
    pendientes.avisarDeResolucion('CM-94421');
    await estabilizar();

    expect(repo['consultar'].mock.calls.length).toBe(consultasAntes + 1);
    expect(texto(enviar())).toContain('Enviar');
    expect(pasar()).toBeNull();
    expect(dom().querySelector('.novedades__agregar')).not.toBeNull();
  });
});
