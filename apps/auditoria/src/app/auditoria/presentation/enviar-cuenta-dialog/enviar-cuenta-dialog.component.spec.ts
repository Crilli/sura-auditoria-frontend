import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NEVER, Observable, of, throwError } from 'rxjs';
import { environment } from '@sura/environments';
import { EnviarCuentaDialogComponent, DialogData } from './enviar-cuenta-dialog.component';
import { CuentaRepository } from '../../domain/ports/cuenta.repository';
import { CuentaFacade } from '../../application/facades/cuenta.facade';
import { AccionesDisponiblesModel, CuentaMedicaModel } from '../../domain/models/cuenta-medica.model';

/**
 * El diálogo de envío con las reglas del 2026-10-21 (BTN-13): dice «Aceptar» o «Enviar» como el
 * botón que lo abrió, manda el mismo POST con las dos palabras, avisa —sin frenar— de lo que
 * antes apagaba el botón y, si el servicio rechaza, se queda abierto con el motivo. Los códigos
 * son de prueba; ningún dato identifica a una persona.
 */

describe('EnviarCuentaDialogComponent — el envío y sus avisos', () => {
  let datos: DialogData;
  let repo: Record<string, ReturnType<typeof vi.fn>>;
  let cerrar: ReturnType<typeof vi.fn>;

  const preparar = async (opciones: {
    pendientes?: number;
    acciones?: () => Observable<AccionesDisponiblesModel>;
  } = {}) => {
    datos = { codigoCuenta: 'CM-94421', rotulo: 'Aceptar' };
    cerrar = vi.fn();
    repo = {
      consultar: vi.fn(() => of({
        codigo: 'CM-94421', estado: 'ADJUDICACION_MANUAL', admiteCambios: false, version: 7,
        pendientesSinResolver: opciones.pendientes ?? 0, novedades: [], respuestasGlosa: [],
      } as unknown as CuentaMedicaModel)),
      consultarAcciones: vi.fn(opciones.acciones
        ?? (() => of({ codigo: 'CM-94421', accionesDisponibles: ['ENVIAR'] }))),
      enviar: vi.fn(() => of({ codigoCuenta: 'CM-94421', referenciaSeguimiento: 'T-1' })),
    };
    await TestBed.configureTestingModule({
      imports: [EnviarCuentaDialogComponent],
      providers: [
        provideNoopAnimations(),
        { provide: CuentaRepository, useValue: repo },
        { provide: MAT_DIALOG_DATA, useValue: datos },
        { provide: MatDialogRef, useValue: { close: cerrar } },
      ],
    }).compileComponents();
    TestBed.inject(CuentaFacade).buscar('CM-94421');
    TestBed.tick();
    await new Promise(r => setTimeout(r));
  };

  /** `esperar: false` con una consulta que nunca responde: la espera de estabilidad no acabaría. */
  const montar = async (esperar = true): Promise<ComponentFixture<EnviarCuentaDialogComponent>> => {
    const fixture = TestBed.createComponent(EnviarCuentaDialogComponent);
    fixture.detectChanges();
    if (esperar) await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  };

  const texto = (e: Element | null | undefined) => e?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
  const avisos = (f: ComponentFixture<EnviarCuentaDialogComponent>) =>
    [...(f.nativeElement as HTMLElement).querySelectorAll('.aviso-envio span')].map(texto);

  /** Elige la decisión y pulsa el botón de confirmar, como el auditor. */
  const confirmar = async (f: ComponentFixture<EnviarCuentaDialogComponent>) => {
    f.componentInstance.form.setValue({ decision: 'ACEPTAR', codigoNovedad: '' });
    f.detectChanges();
    (f.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('#btn-confirmar-envio')!.click();
    await f.whenStable();
    await new Promise(r => setTimeout(r));
    f.detectChanges();
  };

  it('[BTN-13.1] [BTN-13.2] [BTN-13.3] con «Aceptar» y con «Enviar» el título y el botón cambian, pero el POST es el mismo', async () => {
    await preparar();

    const aceptar = await montar();
    expect(texto(aceptar.nativeElement.querySelector('#titulo-envio'))).toBe('Aceptar la cuenta CM-94421');
    expect(texto(aceptar.nativeElement.querySelector('#btn-confirmar-envio'))).toBe('Aceptar');
    await confirmar(aceptar);

    datos.rotulo = 'Enviar';
    const enviar = await montar();
    expect(texto(enviar.nativeElement.querySelector('#titulo-envio'))).toBe('Enviar la cuenta CM-94421');
    expect(texto(enviar.nativeElement.querySelector('#btn-confirmar-envio'))).toBe('Enviar');
    await confirmar(enviar);

    expect(repo['enviar']).toHaveBeenCalledTimes(2);
    expect(repo['enviar'].mock.calls[0]).toEqual(repo['enviar'].mock.calls[1]);
    // El de la configuración, no el literal que había a fuego.
    expect(repo['enviar']).toHaveBeenCalledWith(
      'CM-94421', { decision: 'ACEPTAR', codigoNovedad: undefined }, environment.auditor);
    expect(cerrar).toHaveBeenCalledWith(true);
  });

  it('[BTN-13.4] con pendientes se avisa, sin frenar: el envío se puede confirmar igual', async () => {
    await preparar({ pendientes: 2 });
    const f = await montar();

    expect(avisos(f)).toEqual(
      ['Quedan 2 pendientes sin resolver: si alguno frena la cuenta, el envío se rechazará.']);
    await confirmar(f);
    expect(repo['enviar']).toHaveBeenCalledTimes(1);
  });

  it('[BTN-13.4] sin ENVIAR publicado se avisa de que OHI lo rechazará probablemente, y se deja intentar', async () => {
    await preparar({ pendientes: 1, acciones: () => of({ codigo: 'CM-94421', accionesDisponibles: ['ANULAR'] }) });
    const f = await montar();

    expect(avisos(f)).toEqual([
      'Queda 1 pendiente sin resolver: si frena la cuenta, el envío se rechazará.',
      'OHI no publica el envío en el estado actual; lo más probable es que lo rechace.',
    ]);
    await confirmar(f);
    expect(repo['enviar']).toHaveBeenCalledTimes(1);
  });

  it('[BTN-13.4] mientras se consultan las acciones no se afirma que OHI no publique el envío', async () => {
    await preparar({ acciones: () => NEVER });
    expect(avisos(await montar(false))).toEqual([]);
  });

  it('[BTN-13.4] si la consulta de acciones falló tampoco se afirma nada', async () => {
    await preparar({ acciones: () => throwError(() => new Error('El servicio respondió con un error (503)')) });
    expect(avisos(await montar())).toEqual([]);
  });

  it('[BTN-13.4] con ENVIAR publicado y sin pendientes no hay nada que avisar', async () => {
    await preparar();
    expect(avisos(await montar())).toEqual([]);
  });

  it('[BTN-13.7] si el servicio rechaza el envío, el diálogo se queda abierto con el motivo', async () => {
    await preparar();
    repo['enviar'].mockReturnValue(throwError(() => Object.assign(
      new Error('OHI no admite el envío de la cuenta CM-94421 en su estado actual.'),
      { status: 409, codigo: 'ACCION_NO_DISPONIBLE' })));
    const f = await montar();

    await confirmar(f);

    expect(cerrar).not.toHaveBeenCalled();
    expect(texto(f.nativeElement.querySelector('#error-envio'))).toBe(
      'OHI no admite el envío de la cuenta CM-94421 en su estado actual.');
    // Y se puede volver a intentar: el botón no se queda girando, y el diálogo vuelve a cerrarse
    // con Escape o con un clic fuera.
    expect(f.componentInstance.enviando()).toBe(false);
    expect(f.componentInstance.dialogRef.disableClose).toBe(false);
  });

  it('[BTN-13.7] el diálogo abre sin el error de un intento anterior ni de otro comando', async () => {
    await preparar();
    // Lo que dejó en la fachada, compartida por todos los comandos, un rechazo de antes.
    TestBed.inject(CuentaFacade).errorComando.set('OHI no admite esa acción en el estado actual.');

    const f = await montar();

    expect(f.nativeElement.querySelector('#error-envio')).toBeNull();
  });
});
