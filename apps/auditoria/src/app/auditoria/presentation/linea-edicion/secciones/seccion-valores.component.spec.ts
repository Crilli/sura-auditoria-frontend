import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MatTooltip } from '@angular/material/tooltip';
import { SeccionValoresComponent } from './seccion-valores.component';
import { SeccionConvenioComponent } from './seccion-convenio.component';
import { CampoBloqueadoComponent } from '../../compartido/campo-bloqueado/campo-bloqueado.component';
import { MOTIVOS_BLOQUEO } from '../../compartido/motivos-bloqueo';
import { DetalleLineaModel } from '../../../domain/models/linea-cuenta.model';
import { crearFormularioLinea, LineaFormGroup, valoresDeLaLinea } from '../linea-form';
import { resumenValores } from '../resumenes-seccion';

/**
 * Los importes del detalle de la línea con el vocabulario que fijó negocio el 2026-10-21:
 * cargado = claimed*, convenido = allowed* (se teclea), autorizado = covered* (con candado) y
 * glosado; y la cláusula de contrato aparte, como «Tarifa de contrato». Ningún dato identifica a
 * una persona.
 *
 * Cada concepto lleva una cifra distinta —cargado 1000 (3 und.), convenido 900 (2 und.),
 * autorizado 800 (1 und.), glosado 100, tarifa de contrato 950— para que un cruce no pase en verde.
 */

const detalle = (cambios: Partial<DetalleLineaModel> = {}): DetalleLineaModel => ({
  referencia: 1, codigoCuenta: 'CM-PRUEBA', numeroLinea: 1, fechaInicio: '2026-08-05', fechaFin: null,
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
});

const formularioDe = (d: DetalleLineaModel): LineaFormGroup => {
  const form = crearFormularioLinea(new FormBuilder());
  // patchValue y no setValue: una prueba quita campos del detalle a propósito.
  form.patchValue(valoresDeLaLinea(d));
  return form;
};

const texto = (e: Element | null | undefined) => e?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
const cifras = (t: string) => t.replace(/\D/g, '');

describe('SeccionValoresComponent — los importes de la línea', () => {
  let fixture: ComponentFixture<SeccionValoresComponent>;

  const montar = async (d: DetalleLineaModel, esEdicion: boolean) => {
    await TestBed.configureTestingModule({
      imports: [SeccionValoresComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();
    fixture = TestBed.createComponent(SeccionValoresComponent);
    fixture.componentRef.setInput('detalle', d);
    fixture.componentRef.setInput('form', formularioDe(d));
    fixture.componentRef.setInput('esEdicion', esEdicion);
    fixture.detectChanges();
    await fixture.whenStable();
  };

  const dom = (): HTMLElement => fixture.nativeElement;
  /** Cada fila de la tabla: concepto → [valor, cantidad], como se leen. */
  const porConcepto = () => Object.fromEntries([...dom().querySelectorAll('tbody tr')]
    .map(f => [texto(f.querySelector('td')),
               [texto(f.querySelectorAll('td')[1]), texto(f.querySelectorAll('td')[2])]]));
  const fila = (concepto: string) => [...dom().querySelectorAll('tbody tr')]
    .find(f => texto(f.querySelector('td')) === concepto)!;
  const campo = (rotulo: string) =>
    dom().querySelector<HTMLInputElement>(`input[aria-label="${rotulo}"]`);

  it('[LIN-07] [LIN-09] en consulta: cargado, convenido, autorizado y glosado, en ese orden', async () => {
    await montar(detalle(), false);

    expect(Object.keys(porConcepto())).toEqual(['Cargado', 'Convenido', 'Autorizado', 'Glosado']);
    // La fila «Cubierto» desapareció: ese dato es ahora el autorizado.
    expect(texto(dom())).not.toContain('Cubierto');
  });

  it('[LIN-07] [LIN-08] [LIN-09] [LIN-10] [LIN-15] cada concepto toma su campo, con su cantidad', async () => {
    await montar(detalle(), false);
    const filas = porConcepto();

    // La «Cantidad» del documento es una columna de esta tabla, no un dato suelto (LIN-15).
    expect([...dom().querySelectorAll('thead th')].map(texto)).toEqual(['Concepto', 'Valor', 'Cantidad']);
    expect([cifras(filas['Cargado'][0]), filas['Cargado'][1]]).toEqual(['1000', '3']);
    expect([cifras(filas['Convenido'][0]), filas['Convenido'][1]]).toEqual(['900', '2']);
    expect([cifras(filas['Autorizado'][0]), filas['Autorizado'][1]]).toEqual(['800', '1']);
    expect(cifras(filas['Glosado'][0])).toBe('100');
    // La tarifa de contrato no es el convenido: no está en esta tabla.
    expect(cifras(texto(dom().querySelector('table')))).not.toContain('950');
  });

  it('[LIN-07] [LIN-09] lo que OHI no trae es «—», no un cero', async () => {
    await montar(detalle({
      valorConvenido: null, unidadesConvenidas: null, valorAutorizado: null, unidadesAutorizadas: null,
      valorCargado: null, valorGlosado: null,
    }), false);
    const filas = porConcepto();

    expect(filas['Convenido']).toEqual(['—', '—']);
    expect(filas['Autorizado']).toEqual(['—', '—']);
    expect(filas['Cargado'][0]).toBe('—');
    expect(filas['Glosado'][0]).toBe('—');
  });

  it('[LIN-07] un campo que ni siquiera llega (otra versión del servicio) también es «—»', async () => {
    const sinConvenido: Partial<DetalleLineaModel> = detalle();
    delete sinConvenido.valorConvenido;
    delete sinConvenido.unidadesConvenidas;
    await montar(sinConvenido as DetalleLineaModel, false);

    expect(porConcepto()['Convenido']).toEqual(['—', '—']);
  });

  it('[LIN-07] [LIN-08] en edición se teclea el convenido, con su cantidad, y arranca con su dato', async () => {
    await montar(detalle(), true);

    expect(campo('Valor convenido')!.value).toBe('900');
    expect(campo('Cantidad convenida')!.value).toBe('2');
    expect(campo('Valor cargado')!.value).toBe('1000');
  });

  it('[LIN-09] [LIN-10] en edición el autorizado lleva candado: lo calcula el motor de coberturas', async () => {
    await montar(detalle(), true);

    expect(campo('Valor autorizado')).toBeNull();
    expect(campo('Cantidad autorizada')).toBeNull();
    const autorizado = fixture.debugElement.queryAll(By.css('tbody tr'))
      .find(f => texto(f.nativeElement.querySelector('td')) === 'Autorizado')!;
    const motivos = autorizado.queryAll(By.directive(CampoBloqueadoComponent))
      .map(c => c.query(By.directive(MatTooltip)).injector.get(MatTooltip).message);
    expect(motivos).toEqual([MOTIVOS_BLOQUEO.calculado, MOTIVOS_BLOQUEO.calculado]);
    expect(cifras(texto(fila('Autorizado').querySelectorAll('td')[1]))).toBe('800');
  });
});

describe('SeccionConvenioComponent — tarifa de contrato', () => {
  let fixture: ComponentFixture<SeccionConvenioComponent>;

  const montar = async (d: DetalleLineaModel, esEdicion = false) => {
    await TestBed.configureTestingModule({
      imports: [SeccionConvenioComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();
    fixture = TestBed.createComponent(SeccionConvenioComponent);
    fixture.componentRef.setInput('detalle', d);
    fixture.componentRef.setInput('form', formularioDe(d));
    fixture.componentRef.setInput('esEdicion', esEdicion);
    fixture.detectChanges();
    await fixture.whenStable();
  };

  const tarifa = () => (fixture.nativeElement as HTMLElement).querySelector('#tarifa-contrato')!;

  it('[LIN-07] el importe de la cláusula va como «Tarifa de contrato», con la cláusula al lado, nunca como convenido', async () => {
    await montar(detalle());

    expect(texto(tarifa().querySelector('dt'))).toBe('Tarifa de contrato');
    const dato = texto(tarifa().querySelector('dd'));
    expect(cifras(dato)).toBe('950');
    expect(dato).toContain('Cláusula de prueba');
    expect(texto(fixture.nativeElement)).not.toContain('Convenido');
  });

  it('[LIN-07] sin cláusula de contrato dice «—»', async () => {
    await montar(detalle({ convenio: { ...detalle().convenio, valorTarifaContrato: null, tarifaAplicada: null } }));

    expect(texto(tarifa().querySelector('dd'))).toBe('—');
  });

  it('[LIN-07] en edición no se teclea: sale de la tarifación', async () => {
    await montar(detalle(), true);

    const motivo = fixture.debugElement.query(By.css('#tarifa-contrato'))
      .query(By.directive(CampoBloqueadoComponent))
      .query(By.directive(MatTooltip)).injector.get(MatTooltip).message;
    expect(motivo).toBe(MOTIVOS_BLOQUEO.tarifacion);
  });
});

describe('resumenValores', () => {
  const n = (v: number) => v.toLocaleString('es-CO', { maximumFractionDigits: 0 });

  it('[LIN-07] [LIN-09] resume cargado, convenido, autorizado y glosado, cada uno con su cifra', () => {
    expect(resumenValores(detalle()))
      .toBe(`Cargado ${n(1_000)} · Convenido ${n(900)} · Autorizado ${n(800)} · Glosado ${n(100)}`);
  });

  it('[LIN-07] [LIN-09] lo que falta es «—» y sin glosa no se nombra el glosado', () => {
    expect(resumenValores(detalle({ valorConvenido: null, valorAutorizado: null, valorGlosado: null })))
      .toBe(`Cargado ${n(1_000)} · Convenido — · Autorizado —`);
  });
});
