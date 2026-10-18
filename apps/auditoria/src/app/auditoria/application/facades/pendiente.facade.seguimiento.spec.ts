import { TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';
import { PendienteFacade, conFallosDeLanzamiento } from './pendiente.facade';
import { PendienteRepository } from '../../domain/ports/pendiente.repository';
import { ResolucionMasivaModel } from '../../domain/models/motivo-pendiente.model';

/**
 * El seguimiento de una resolución masiva en curso (OPE-06), con el reloj simulado. Ningún
 * dato identifica a una persona.
 */

const resultado = (desenlace: ResolucionMasivaModel['desenlace'],
                   fallos: ResolucionMasivaModel['fallos'] = []): ResolucionMasivaModel => ({
  desenlace, todoResuelto: desenlace === 'COMPLETO', referencias: ['2214360298', '2218360565'], fallos,
});

class RepositorioSimulado {
  /** Lo que irá contestando el seguimiento, en orden. El último se repite. */
  respuestas: Array<() => Observable<ResolucionMasivaModel>> = [];
  consultas = 0;
  resolverEnMasa = vi.fn((): Observable<ResolucionMasivaModel> => of(resultado('EN_CURSO')));
  resumirMotivos = vi.fn(() => of([]));
  listarSinResolver = vi.fn(() => of({ elementos: [], cursorSiguiente: null, hayMas: false }));
  catalogoDeMotivos = vi.fn(() => of([]));

  /** Si una cuenta tiene sus propias respuestas, se usan esas (también la última se repite). */
  porCuenta: Record<string, Array<() => Observable<ResolucionMasivaModel>>> = {};

  seguirResolucion(codigo: string): Observable<ResolucionMasivaModel> {
    const propias = this.porCuenta[codigo];
    if (propias) return propias.length > 1 ? propias.shift()!() : propias[0]();
    const i = Math.min(this.consultas, this.respuestas.length - 1);
    this.consultas++;
    return this.respuestas[i]();
  }
}

describe('PendienteFacade — seguimiento de la resolución', () => {
  let facade: PendienteFacade;
  let repo: RepositorioSimulado;

  beforeEach(() => {
    vi.useFakeTimers();
    repo = new RepositorioSimulado();
    TestBed.configureTestingModule({ providers: [{ provide: PendienteRepository, useValue: repo }] });
    facade = TestBed.inject(PendienteFacade);
  });

  afterEach(() => vi.useRealTimers());

  const pasar = (ms: number) => vi.advanceTimersByTime(ms);

  it('[OPE-06] sigue cada pocos segundos y, al terminar, publica el desenlace y deja de preguntar', () => {
    repo.respuestas = [() => of(resultado('EN_CURSO')), () => of(resultado('COMPLETO'))];
    facade.seguirResolucion('CM-94421', ['2214360298', '2218360565']);

    expect(facade.hayResolucionEnCurso('CM-94421')).toBe(true);
    expect(facade.hayResolucionEnCurso('CM-OTRA')).toBe(false);

    pasar(facade.INTERVALO_SEGUIMIENTO_MS);
    expect(facade.resolucionEnCursoDe('CM-94421')?.consultas).toBe(1);
    pasar(facade.INTERVALO_SEGUIMIENTO_MS);

    expect(facade.resolucionEnCursoDe('CM-94421')).toBeNull();
    expect(facade.resolucionTerminadaDe('CM-94421')?.resultado.desenlace).toBe('COMPLETO');
    pasar(facade.INTERVALO_SEGUIMIENTO_MS * 5);
    expect(repo.consultas).toBe(2);
  });

  it('[OPE-06] lanzar una resolución que vuelve en curso empieza el seguimiento sin bloquear', async () => {
    repo.respuestas = [() => of(resultado('PARCIAL', [{ codigo: 'CLA-IP-RPND-004', elemento: 'X', detalle: 'ya resuelto' }]))];
    facade.cargarPendientes('CM-94421');
    // Hace falta algún motivo marcado para poder resolver.
    (facade as unknown as { _marcados: { set(v: Set<string>): void } })._marcados.set(new Set(['MP_A']));
    vi.spyOn(facade, 'motivosMarcados').mockReturnValue([{ codigo: 'MP_A' } as never]);

    const respuesta = await facade.resolverMarcados('justificación', 'auditor');

    expect(respuesta?.desenlace).toBe('EN_CURSO');
    expect(facade.resolviendoEnMasa()).toBe(false);
    expect(facade.hayResolucionEnCurso('CM-94421')).toBe(true);

    pasar(facade.INTERVALO_SEGUIMIENTO_MS);
    expect(facade.resultadoMasivo()?.desenlace).toBe('PARCIAL');
    expect(facade.resultadoMasivo()?.fallos[0].codigo).toBe('CLA-IP-RPND-004');
  });

  it('[OPE-06] tres fallos seguidos de la consulta dejan de seguir y piden volver a consultar, nunca relanzar', () => {
    repo.respuestas = [() => throwError(() => new Error('El sistema de cuentas no está disponible'))];
    facade.seguirResolucion('CM-94421', ['2214360298']);

    pasar(facade.INTERVALO_SEGUIMIENTO_MS * facade.MAXIMO_FALLOS_SEGUIDOS);

    expect(facade.resolucionEnCursoDe('CM-94421')).toBeNull();
    expect(facade.seguimientoSinConfirmarDe('CM-94421')).toMatchObject({
      codigoCuenta: 'CM-94421', referencias: ['2214360298'],
      motivo: 'El sistema de cuentas no está disponible',
    });
    expect(repo.resolverEnMasa).not.toHaveBeenCalled();
  });

  it('[OPE-06] un fallo suelto no corta el seguimiento', () => {
    repo.respuestas = [
      () => throwError(() => new Error('blip')),
      () => of(resultado('EN_CURSO')),
      () => of(resultado('COMPLETO')),
    ];
    facade.seguirResolucion('CM-94421', ['2214360298']);

    pasar(facade.INTERVALO_SEGUIMIENTO_MS * 3);

    expect(facade.seguimientoSinConfirmarDe('CM-94421')).toBeNull();
    expect(facade.resolucionTerminadaDe('CM-94421')?.resultado.desenlace).toBe('COMPLETO');
  });

  it('[OPE-06] pasado el tope de tiempo se dice que no se pudo confirmar, y se puede volver a consultar', () => {
    repo.respuestas = [() => of(resultado('EN_CURSO'))];
    facade.seguirResolucion('CM-94421', ['2214360298']);

    pasar(facade.INTERVALO_SEGUIMIENTO_MS * facade.MAXIMO_CONSULTAS);

    expect(facade.seguimientoSinConfirmarDe('CM-94421')?.motivo).toContain('cinco minutos');
    expect(repo.consultas).toBe(facade.MAXIMO_CONSULTAS);

    repo.respuestas = [() => of(resultado('COMPLETO'))];
    repo.consultas = 0;
    facade.volverAConsultar('CM-94421');
    expect(facade.hayResolucionEnCurso('CM-94421')).toBe(true);
    pasar(facade.INTERVALO_SEGUIMIENTO_MS);
    expect(facade.resolucionTerminadaDe('CM-94421')?.resultado.desenlace).toBe('COMPLETO');
  });

  it('[OPE-06] volver a consultar sin nada pendiente no hace nada', () => {
    facade.volverAConsultar('CM-94421');
    expect(facade.resolucionEnCursoDe('CM-94421')).toBeNull();
  });

  // ── Revisión de las Fases 1 y 2 ──────────────────────────────────────────

  const fallo = (codigo: string) => ({ codigo, elemento: 'MP_A', detalle: 'no salió' });

  it('[OPE-06] dos cuentas se siguen a la vez: lanzar en una no corta la otra', () => {
    repo.porCuenta = {
      'CM-A': [() => of(resultado('EN_CURSO')), () => of(resultado('COMPLETO'))],
      'CM-B': [() => of(resultado('EN_CURSO')), () => of(resultado('EN_CURSO')), () => of(resultado('PARCIAL'))],
    };
    facade.seguirResolucion('CM-A', ['1']);
    facade.seguirResolucion('CM-B', ['2']);
    expect(facade.hayResolucionEnCurso('CM-A')).toBe(true);
    expect(facade.hayResolucionEnCurso('CM-B')).toBe(true);

    pasar(facade.INTERVALO_SEGUIMIENTO_MS * 2);
    expect(facade.resolucionTerminadaDe('CM-A')?.resultado.desenlace).toBe('COMPLETO');
    expect(facade.hayResolucionEnCurso('CM-B')).toBe(true);

    pasar(facade.INTERVALO_SEGUIMIENTO_MS);
    expect(facade.resolucionTerminadaDe('CM-B')?.resultado.desenlace).toBe('PARCIAL');
    // La de A sigue siendo la suya: no la pisó la de B.
    expect(facade.resolucionTerminadaDe('CM-A')?.resultado.desenlace).toBe('COMPLETO');
  });

  it('[OPE-06] lanzar en otra cuenta no borra el «sin confirmar» de la primera', () => {
    repo.porCuenta = { 'CM-A': [() => throwError(() => new Error('caído'))],
                       'CM-B': [() => of(resultado('EN_CURSO'))] };
    facade.seguirResolucion('CM-A', ['1']);
    pasar(facade.INTERVALO_SEGUIMIENTO_MS * facade.MAXIMO_FALLOS_SEGUIDOS);
    expect(facade.seguimientoSinConfirmarDe('CM-A')?.motivo).toBe('caído');

    facade.seguirResolucion('CM-B', ['2']);

    expect(facade.seguimientoSinConfirmarDe('CM-A')?.referencias).toEqual(['1']);
    expect(facade.seguimientoSinConfirmarDe('CM-B')).toBeNull();
  });

  it('[OPE-06] lo que falló al lanzar entra en el desenlace final: lo completo pasa a parcial', () => {
    repo.respuestas = [() => of(resultado('COMPLETO'))];
    facade.seguirResolucion('CM-94421', ['2214360298'], [fallo('NIVEL_LINEA')]);

    pasar(facade.INTERVALO_SEGUIMIENTO_MS);

    const final = facade.resolucionTerminadaDe('CM-94421')!.resultado;
    expect(final.desenlace).toBe('PARCIAL');
    expect(final.todoResuelto).toBe(false);
    expect(final.fallos.map(f => f.codigo)).toEqual(['NIVEL_LINEA']);
  });

  it('[OPE-06] el lanzamiento que vuelve en curso con un nivel caído lo conserva hasta el final', async () => {
    repo.resolverEnMasa.mockReturnValue(of({ ...resultado('EN_CURSO'), fallos: [fallo('LINEAS_SIN_LANZAR')] }));
    repo.respuestas = [() => of(resultado('COMPLETO'))];
    facade.cargarPendientes('CM-94421');
    vi.spyOn(facade, 'motivosMarcados').mockReturnValue([{ codigo: 'MP_A' } as never]);

    await facade.resolverMarcados('justificación', 'auditor');
    pasar(facade.INTERVALO_SEGUIMIENTO_MS);

    expect(facade.resultadoMasivo()?.desenlace).toBe('PARCIAL');
    expect(facade.resultadoMasivo()?.fallos[0].codigo).toBe('LINEAS_SIN_LANZAR');
  });

  it('[OPE-06] volver a consultar conserva los fallos de lanzamiento', () => {
    repo.respuestas = [() => throwError(() => new Error('caído'))];
    facade.seguirResolucion('CM-94421', ['1'], [fallo('NIVEL_CABECERA')]);
    pasar(facade.INTERVALO_SEGUIMIENTO_MS * facade.MAXIMO_FALLOS_SEGUIDOS);

    repo.respuestas = [() => of(resultado('COMPLETO'))];
    repo.consultas = 0;
    facade.volverAConsultar('CM-94421');
    pasar(facade.INTERVALO_SEGUIMIENTO_MS);

    expect(facade.resolucionTerminadaDe('CM-94421')?.resultado.desenlace).toBe('PARCIAL');
  });

  it('[OPE-06] lo fallido sigue fallido, y sin fallos de lanzamiento el desenlace no se toca', () => {
    const fallido = resultado('FALLIDO', [fallo('CLA-IP-RPND-004')]);
    expect(conFallosDeLanzamiento(fallido, [fallo('NIVEL_LINEA')]).desenlace).toBe('FALLIDO');
    expect(conFallosDeLanzamiento(fallido, [fallo('NIVEL_LINEA')]).fallos).toHaveLength(2);
    const completo = resultado('COMPLETO');
    expect(conFallosDeLanzamiento(completo, [])).toBe(completo);
  });
});
