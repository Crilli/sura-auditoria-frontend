import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NavigationEnd, Router, Routes, provideRouter, withComponentInputBinding, withRouterConfig } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Observable, Subject, filter, firstValueFrom, of, switchMap, take, throwError } from 'rxjs';
import { LineaVersionComponent } from './linea-version.component';
import { CuentaRepository } from '../../domain/ports/cuenta.repository';
import {
  DetalleLineaDeVersionModel, LineaDeVersionModel
} from '../../domain/models/linea-de-version.model';
import { OffsetPage } from '../../../../../../../libs/data-access/http/src/lib/offset-page.model';

/**
 * Una línea de una versión, abierta (BUS-21.5): lo que guardó el histórico, en solo lectura, y
 * cómo se pasa a la anterior y a la siguiente dentro de la versión. Los datos imitan lo medido en
 * UAT el 2026-10-21 (CM-4146: 223-1A doce veces en una línea; números de línea no correlativos);
 * ningún dato identifica a una persona.
 *
 * Con el router de verdad y la ruta real del detalle, colgada de `:codigo/versiones/:numero`:
 * los enlaces van relativos a la versión, y solo ahí se ve si un `relativeTo` equivocado los
 * manda a una ruta que no existe.
 */

@Component({ selector: 'sura-hija-de-prueba', standalone: true, template: '<p>grilla</p>' })
class GrillaDePrueba {}

/** Las mismas rutas que `auditoria.routes.ts` bajo la versión; la grilla, de mentira. */
const RUTAS: Routes = [{
  path: ':codigo',
  children: [{
    path: 'versiones/:numero',
    children: [
      { path: 'lineas', component: GrillaDePrueba },
      { path: 'lineas/:numeroLinea', component: LineaVersionComponent },
    ],
  }],
}];

const DETALLE: DetalleLineaDeVersionModel = {
  numeroLinea: 127, estado: 'NEGADA', fechaInicio: '2025-03-04', fechaFin: '2025-03-06',
  codigoProcedimiento: '890201', descripcionProcedimiento: 'Consulta de primera vez',
  catalogoProcedimiento: 'CUPS', codigoAfiliado: 'CC000000001', nombreAfiliado: 'Prueba',
  codigoAutorizacion: 'AUT-1', prestadorCodigo: 'NI-1', prestadorNombre: 'Prestador de prueba',
  valorCargado: 133_069, unidadesCargadas: 1, valorConvenido: null, unidadesConvenidas: null,
  valorAutorizado: 0, unidadesAutorizadas: 0, valorGlosado: 133_069, valorIva: null, porcentajeIva: null,
  glosas: [{
    secuencia: 1, codigo: '423-1', valor: 133_069, codigoNotaCredito: 'NC-1', valorNotaCredito: 1_000,
    concepto: 'Autorizaciones', conceptoEspecifico: 'Servicio sin autorización',
    texto: 'Se glosa por falta de autorización', tipo: 'Manual',
  }],
  novedades: [
    { codigo: '223-1A', severidad: 'BLOQUEANTE', texto: 'Valor glosado por tarifa', origen: 'MANUAL',
      anulada: false, repeticiones: 12 },
    { codigo: 'CLA-FL-PPRI-003', severidad: 'INFORMATIVA',
      texto: 'La edad 26 del beneficiario atendido excede los límites de edad 29, 59',
      origen: 'BENEFITS', anulada: true, repeticiones: 1 },
  ],
  diagnosticos: [{ secuencia: 1, codigo: 'S525', descripcion: 'Fractura de la diáfisis', tipo: 'Principal' }],
  convenio: {
    tarifaIss2000: null, tarifaIss2001: '39145', tarifaSoat: null,
    homologoCups: '890201', clausulas: [{ monto: 70_959.5, descripcion: 'Tarifa pactada', regla: 'R-1' }],
  },
  atencion: { tipoSala: null, viaAcceso: 'Urgencias', uen: 'UEN-PRUEBA' },
};

type Listar = (codigo: string, numero: number, pagina: number, tamano: number)
  => Observable<OffsetPage<LineaDeVersionModel>>;

/**
 * Una versión con esos números de línea, en ese orden, servida como el servicio: `pagina × tamano`
 * de desplazamiento, y vacía al pasarse del final. El detalle pide de una en una (`tamano` 1) para
 * saber qué hay en una posición, y de 25 en 25 para buscar la línea.
 */
const versionCon = (numeros: number[]): Listar => (_c, _n, pagina, tamano) => {
  const desde = pagina * tamano;
  return of({
    elementos: numeros.slice(desde, desde + tamano).map(n => ({ numeroLinea: n } as LineaDeVersionModel)),
    desplazamiento: desde, tamanoPagina: tamano, pagina, totalRegistros: numeros.length,
    totalPaginas: Math.ceil(numeros.length / tamano), hayMas: desde + tamano < numeros.length,
  });
};

/** 1, 3, 5… 51 y luego 127, 130, 133…: en orden, pero no correlativos. La 127 es la 27.ª (posición 26). */
const SESENTA = Array.from({ length: 60 }, (_, i) => i < 26 ? i * 2 + 1 : 127 + (i - 26) * 3);

describe('LineaVersionComponent', () => {
  let harness: RouterTestingHarness;
  let consultar: ReturnType<typeof vi.fn>;
  let listar: ReturnType<typeof vi.fn>;

  const montar = async (url: string, opciones: {
    detalle?: (codigo: string, numero: number, numeroLinea: number) => Observable<DetalleLineaDeVersionModel>;
    listar?: Listar;
  } = {}) => {
    consultar = vi.fn(opciones.detalle ?? ((_c: string, _n: number, l: number) => of({ ...DETALLE, numeroLinea: l })));
    // Por omisión, la 127 va entre la 1 y la 128, en la posición 1.
    listar = vi.fn(opciones.listar ?? versionCon([1, 127, 128, 130]));
    TestBed.configureTestingModule({
      providers: [
        provideRouter(RUTAS, withComponentInputBinding(),
          withRouterConfig({ paramsInheritanceStrategy: 'always' })),
        provideNoopAnimations(),
        { provide: CuentaRepository, useValue: { consultarLineaDeVersion: consultar, listarLineasDeVersion: listar } },
      ],
    });
    harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(url, LineaVersionComponent);
    await estabilizar();
  };

  const estabilizar = async () => {
    harness.detectChanges();
    await harness.fixture.whenStable();
    harness.detectChanges();
  };

  const dom = (): HTMLElement => harness.routeNativeElement!;
  const texto = (e: Element | null | undefined) => e?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
  const filas = (tabla: string) => [...dom().querySelectorAll(`#${tabla} tbody tr`)].map(f => texto(f));
  const href = (selector: string) => dom().querySelector(selector)?.getAttribute('href');

  it('[BUS-21.5] enseña sus valores, su desglose de glosa, sus novedades con el texto de entonces, sus diagnósticos y su convenio', async () => {
    await montar('/CM-4146/versiones/7/lineas/127?posicion=1');

    expect(consultar).toHaveBeenCalledWith('CM-4146', 7, 127);
    expect(texto(dom().querySelector('h2'))).toContain('Línea #127 · V7 — 890201');
    expect(texto(dom().querySelector('.sura-ficha-datos'))).toContain('Negada');
    expect(texto(dom().querySelector('.sura-ficha-datos'))).toContain('04/03/2025 al 06/03/2025');

    const glosa = filas('tabla-glosas-version')[0];
    expect(glosa).toContain('423-1');
    expect(glosa).toContain('Autorizaciones');
    expect(glosa).toContain('Se glosa por falta de autorización');
    expect(glosa).toContain('NC-1');

    // Las repetidas, una vez y con cuántas eran; la anulada, dicha.
    const novedades = filas('tabla-novedades-version');
    expect(novedades[0]).toContain('223-1A ×12');
    expect(novedades[0]).toContain('Bloqueante');
    expect(novedades[0]).toContain('A mano');
    expect(novedades[1]).toContain('La edad 26 del beneficiario atendido excede los límites de edad 29, 59');
    expect(novedades[1]).toContain('Anulada');
    expect(novedades[1]).toContain('Beneficios');

    expect(filas('tabla-diagnosticos-version')[0]).toContain('S525');
    expect(filas('tabla-clausulas-version')[0]).toContain('Tarifa pactada');
    const convenio = texto(dom().querySelector('[aria-labelledby="convenio-linea-version"]'));
    expect(convenio).toContain('39145');
    // El histórico de producción no guarda el contrato: no se ofrece como un dato vacío.
    expect(convenio).not.toContain('Contrato');
    expect(texto(dom().querySelector('[aria-labelledby="atencion-linea-version"]'))).toContain('UEN-PRUEBA');
  });

  it('[BUS-21.5] nada es editable: ni un solo control de formulario', async () => {
    await montar('/CM-4146/versiones/7/lineas/127?posicion=1');

    expect(dom().querySelector('form, input, textarea, select, mat-checkbox, mat-select, [contenteditable]')).toBeNull();
    expect(texto(dom().querySelector('.linea-version__modo'))).toContain('solo lectura');
  });

  it('[BUS-21.3] un importe que no vino se pinta como raya, no como cero; un cero es un cero', async () => {
    await montar('/CM-4146/versiones/7/lineas/127?posicion=1');

    const porConcepto = Object.fromEntries([...dom().querySelectorAll('.sura-tabla-detalle--importes tbody tr')]
      .map(f => [texto(f.querySelector('td')), texto(f.querySelectorAll('td')[1])]));
    // La línea negada no trae convenido (allowedAmount): raya. Su autorizado (coveredAmount) es 0.
    expect(porConcepto['Convenido']).toBe('—');
    expect(porConcepto['IVA']).toBe('—');
    expect(porConcepto['Autorizado'].replace(/\D/g, '')).toBe('0');
    expect(porConcepto['Cargado'].replace(/\D/g, '')).toBe('133069');
  });

  it('[BUS-21] [LIN-07] [LIN-09] cada concepto en su fila, con su cantidad: cargado, convenido, autorizado, glosado', async () => {
    // Cifras distintas por concepto, para que un cruce entre convenido y autorizado se note.
    const conImportes: DetalleLineaDeVersionModel = {
      ...DETALLE, estado: 'APROBADA',
      valorCargado: 1_000, unidadesCargadas: 3, valorConvenido: 900, unidadesConvenidas: 2,
      valorAutorizado: 800, unidadesAutorizadas: 1, valorGlosado: 100,
    };
    await montar('/CM-4146/versiones/7/lineas/127?posicion=1',
      { detalle: (_c, _n, l) => of({ ...conImportes, numeroLinea: l }) });

    const porConcepto = Object.fromEntries([...dom().querySelectorAll('.sura-tabla-detalle--importes tbody tr')]
      .map(f => [texto(f.querySelector('td')),
                 [texto(f.querySelectorAll('td')[1]).replace(/\D/g, ''), texto(f.querySelectorAll('td')[2])]]));
    expect(Object.keys(porConcepto).slice(0, 4)).toEqual(['Cargado', 'Convenido', 'Autorizado', 'Glosado']);
    expect(porConcepto['Cargado']).toEqual(['1000', '3']);
    expect(porConcepto['Convenido']).toEqual(['900', '2']);
    expect(porConcepto['Autorizado']).toEqual(['800', '1']);
    expect(porConcepto['Glosado'][0]).toBe('100');
    // El rótulo viejo ya no está.
    expect(porConcepto['Cubierto']).toBeUndefined();
  });

  it('[BUS-21.5] anterior y siguiente son las vecinas en el orden de la versión, dentro de la versión; la vuelta, a sus líneas', async () => {
    await montar('/CM-4146/versiones/7/lineas/127?posicion=1');

    // La fila de su posición, para confirmarla, y una antes y una después, de una en una.
    expect(listar).toHaveBeenCalledWith('CM-4146', 7, 1, 1);
    expect(listar).toHaveBeenCalledWith('CM-4146', 7, 0, 1);
    expect(listar).toHaveBeenCalledWith('CM-4146', 7, 2, 1);
    expect(texto(dom().querySelector('#btn-linea-version-anterior'))).toContain('Línea 1');
    expect(href('#btn-linea-version-anterior')).toBe('/CM-4146/versiones/7/lineas/1?posicion=0');
    expect(texto(dom().querySelector('#btn-linea-version-siguiente'))).toContain('Línea 128');
    expect(href('#btn-linea-version-siguiente')).toBe('/CM-4146/versiones/7/lineas/128?posicion=2');
    expect(href('#btn-volver-lineas-version')).toBe('/CM-4146/versiones/7/lineas');
  });

  it('[BUS-21.5] abierta desde un enlace pegado, sin posición, la busca en la versión y ofrece igual sus vecinas y la vuelta a su página', async () => {
    await montar('/CM-4146/versiones/7/lineas/127', { listar: versionCon(SESENTA) });

    expect(listar).toHaveBeenCalledWith('CM-4146', 7, 0, 25);
    expect(listar).toHaveBeenCalledWith('CM-4146', 7, 1, 25);
    expect(texto(dom().querySelector('#btn-linea-version-anterior'))).toContain(`Línea ${SESENTA[25]}`);
    expect(texto(dom().querySelector('#btn-linea-version-siguiente'))).toContain(`Línea ${SESENTA[27]}`);
    expect(href('#btn-volver-lineas-version')).toBe('/CM-4146/versiones/7/lineas?pagina=2');
  });

  it('[BUS-21.5] con una posición fuera de la versión no se queda sin vecinas ni vuelve a una página vacía: la sitúa en la suya', async () => {
    // Un enlace editado o la posición de otra versión: en la 500 de una versión de 60 no hay nada,
    // y las dos «vecinas» vacías parecerían las de una versión de una sola línea.
    await montar('/CM-4146/versiones/7/lineas/127?posicion=500', { listar: versionCon(SESENTA) });

    expect(listar).toHaveBeenCalledWith('CM-4146', 7, 500, 1);
    expect(href('#btn-linea-version-anterior')).toBe(`/CM-4146/versiones/7/lineas/${SESENTA[25]}?posicion=25`);
    expect(href('#btn-linea-version-siguiente')).toBe(`/CM-4146/versiones/7/lineas/${SESENTA[27]}?posicion=27`);
    expect(href('#btn-volver-lineas-version')).toBe('/CM-4146/versiones/7/lineas?pagina=2');
  });

  it('[BUS-21.5] la primera de la versión no tiene anterior', async () => {
    await montar('/CM-4146/versiones/7/lineas/1?posicion=0');

    expect(dom().querySelector('#btn-linea-version-anterior')).toBeNull();
    expect(texto(dom().querySelector('#btn-linea-version-siguiente'))).toContain('Línea 127');
  });

  it('[BUS-21.5] al pulsar «siguiente» el enlace no desaparece ni pierde el foco: se apaga hasta que llegan las vecinas de la nueva', async () => {
    let retenidas: Subject<void> | null = null;
    const servir = versionCon([1, 127, 128, 130]);
    await montar('/CM-4146/versiones/7/lineas/127?posicion=1', {
      listar: (c, n, p, t) => retenidas ? retenidas.pipe(take(1), switchMap(() => servir(c, n, p, t))) : servir(c, n, p, t),
    });
    const siguiente = dom().querySelector<HTMLAnchorElement>('#btn-linea-version-siguiente')!;
    siguiente.focus();
    expect(document.activeElement).toBe(siguiente);

    retenidas = new Subject<void>();
    const navego = firstValueFrom(TestBed.inject(Router).events.pipe(filter(e => e instanceof NavigationEnd)));
    siguiente.click();
    await navego;
    harness.detectChanges();

    // El mismo elemento, con el foco, pero apagado y sin destino: ya no es la vecina de la 128.
    expect(TestBed.inject(Router).url).toBe('/CM-4146/versiones/7/lineas/128?posicion=2');
    expect(dom().querySelector('#btn-linea-version-siguiente')).toBe(siguiente);
    expect(document.activeElement).toBe(siguiente);
    expect(siguiente.getAttribute('aria-disabled')).toBe('true');
    expect(siguiente.getAttribute('role')).toBe('link');
    expect(siguiente.getAttribute('tabindex')).toBe('0');
    expect(siguiente.hasAttribute('href')).toBe(false);
    expect(dom().querySelector('#btn-linea-version-anterior')?.getAttribute('aria-disabled')).toBe('true');

    retenidas.next();
    retenidas.complete();
    await estabilizar();

    expect(dom().querySelector('#btn-linea-version-siguiente')).toBe(siguiente);
    expect(document.activeElement).toBe(siguiente);
    expect(texto(siguiente)).toContain('Línea 130');
    expect(siguiente.getAttribute('href')).toBe('/CM-4146/versiones/7/lineas/130?posicion=3');
    expect(siguiente.hasAttribute('aria-disabled')).toBe(false);
    expect(href('#btn-linea-version-anterior')).toBe('/CM-4146/versiones/7/lineas/127?posicion=1');
  });

  it('[BUS-21.6] si la versión no tiene esa línea, lo dice y no ofrece reintentar ni vecinas', async () => {
    await montar('/CM-4146/versiones/7/lineas/2?posicion=1', {
      detalle: () => throwError(() => Object.assign(
        new Error('La versión 7 de la cuenta CM-4146 no tiene la línea 2'), { status: 400 })),
    });

    const aviso = dom().querySelector('#error-linea-version')!;
    expect(texto(aviso)).toContain('no tiene la línea 2');
    expect(aviso.querySelector('button')).toBeNull();
    expect(href('#btn-volver-lineas-version')).toBe('/CM-4146/versiones/7/lineas');
    // En la posición 1 está la 127, no la 2: no se ofrecen vecinas de una línea que no está.
    expect(dom().querySelector('#btn-linea-version-anterior, #btn-linea-version-siguiente')).toBeNull();
  });

  it('[BUS-21] si el servicio falla, lo dice y deja reintentar', async () => {
    let intento = 0;
    await montar('/CM-4146/versiones/7/lineas/127?posicion=1', {
      detalle: () => ++intento === 1
        ? throwError(() => Object.assign(new Error('El servicio respondió con un error (503)'), { status: 503 }))
        : of(DETALLE),
    });

    dom().querySelector<HTMLButtonElement>('#error-linea-version button')!.click();
    await estabilizar();

    expect(consultar).toHaveBeenCalledTimes(2);
    expect(texto(dom().querySelector('h2'))).toContain('Línea #127');
  });
});
