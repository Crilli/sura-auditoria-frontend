import {
  CAMPOS_EN_FILA, cambiosDeLaFila, filaConDetalle, solicitudDeLaFila, valoresDeLaFila
} from './edicion-en-fila.model';
import { DetalleLineaModel, ResumenLineaModel } from './linea-cuenta.model';

/**
 * Las reglas de la edición en la fila. Ningún dato identifica a una persona.
 *
 * Cada concepto lleva una cifra distinta —cargado 1000, convenido 900, autorizado 800, glosado
 * 100; cantidades 3, 2 y 1— para que un cruce entre convenido y autorizado no pase en verde: el
 * 2026-10-21 el nombre `valorAutorizado` pasó de `allowedAmount` a `coveredAmount`.
 */

const fila = (cambios: Partial<ResumenLineaModel> = {}): ResumenLineaModel => ({
  referencia: 135280, numeroLinea: 4, codigoProcedimiento: '870603',
  descripcionProcedimiento: null, catalogoProcedimiento: 'CUPS', codigoAfiliado: 'X',
  nombreAfiliado: null, fechaInicio: '2023-06-09', fechaFin: null, codigoAutorizacion: null,
  valorCargado: 1_000, unidadesCargadas: 3,
  valorConvenido: 900, unidadesConvenidas: 2,
  valorAutorizado: 800, unidadesAutorizadas: 1,
  valorIva: null, porcentajeIva: null, valorGlosado: 100,
  editable: true, cantidadPendientes: 1, pendientes: [], tieneNovedadBloqueante: true,
  novedades: [], version: 114, ...cambios,
});

describe('edición en la fila — reglas', () => {

  it('[GRID-18] los valores de partida son cargado y convenido, con sus cantidades', () => {
    expect(valoresDeLaFila(fila())).toEqual({
      valorCargado: 1_000, unidadesCargadas: 3, valorConvenido: 900, unidadesConvenidas: 2,
    });
  });

  it('[GRID-18] el autorizado no se teclea: lo calcula el motor de coberturas', () => {
    expect(CAMPOS_EN_FILA).toEqual(
      ['valorCargado', 'unidadesCargadas', 'valorConvenido', 'unidadesConvenidas']);
    expect(CAMPOS_EN_FILA as readonly string[]).not.toContain('valorAutorizado');
    expect(CAMPOS_EN_FILA as readonly string[]).not.toContain('unidadesAutorizadas');
  });

  it('[GRID-18] solo viaja lo que cambió', () => {
    expect(cambiosDeLaFila(fila(), { ...valoresDeLaFila(fila()), valorConvenido: 850 }))
      .toEqual({ valorConvenido: 850 });
  });

  it('[GRID-18] sin cambios no hay nada que guardar', () => {
    expect(cambiosDeLaFila(fila(), valoresDeLaFila(fila()))).toBeNull();
    expect(cambiosDeLaFila(fila(), {})).toBeNull();
  });

  it('[GRID-18] un campo vacío no viaja: lo ausente se conserva, no se borra', () => {
    expect(cambiosDeLaFila(fila({ valorCargado: null }),
                           { valorCargado: null, valorConvenido: 5 }))
      .toEqual({ valorConvenido: 5 });
  });

  it('[GRID-18] el cero es un valor, no un hueco', () => {
    expect(cambiosDeLaFila(fila(), { valorConvenido: 0 }))
      .toEqual({ valorConvenido: 0 });
  });

  it('[GRID-18] la solicitud lleva la versión de la fila, el modo elegido y el convenido', () => {
    const solicitud = solicitudDeLaFila(fila(), { valorConvenido: 850 }, 'AISLADO');
    expect(solicitud).toEqual({
      versionEsperada: 114, modoRecalculo: 'AISLADO', valorConvenido: 850,
    });
    // Un `valorAutorizado` en el PATCH lo rechaza el servicio con 400: nunca se manda.
    expect(solicitud).not.toHaveProperty('valorAutorizado');
  });

  it('[GRID-18] la fila guardada enseña lo que devolvió el sistema de registro, no lo tecleado', () => {
    // El motor puede haber recalculado el autorizado aunque se tocara solo lo convenido.
    const detalle = {
      valorCargado: 1_000, unidadesCargadas: 3, valorConvenido: 850, unidadesConvenidas: 2,
      valorAutorizado: 750, unidadesAutorizadas: 1, valorGlosado: 150, editable: true,
      version: 115,
    } as DetalleLineaModel;

    const nueva = filaConDetalle(fila(), detalle);

    expect(nueva).toMatchObject({
      valorConvenido: 850, valorAutorizado: 750, valorGlosado: 150, version: 115,
    });
    // Lo que el detalle no trae se conserva hasta que llegue el refresco de la página.
    expect(nueva.valorIva).toBeNull();
    expect(nueva.tieneNovedadBloqueante).toBe(true);
    expect(nueva.numeroLinea).toBe(4);
  });

  it('[GRID-13] la fila guardada toma cada concepto de su campo, también la cantidad autorizada', () => {
    const detalle = {
      valorCargado: 1_001, unidadesCargadas: 33, valorConvenido: 901, unidadesConvenidas: 22,
      valorAutorizado: 801, unidadesAutorizadas: 11, valorGlosado: 101, editable: true,
      version: 116,
    } as DetalleLineaModel;

    const nueva = filaConDetalle(fila(), detalle);

    expect({
      cargado:    [nueva.valorCargado, nueva.unidadesCargadas],
      convenido:  [nueva.valorConvenido, nueva.unidadesConvenidas],
      autorizado: [nueva.valorAutorizado, nueva.unidadesAutorizadas],
      glosado:    nueva.valorGlosado,
    }).toEqual({
      cargado:    [1_001, 33],
      convenido:  [901, 22],
      autorizado: [801, 11],
      glosado:    101,
    });
  });
});
