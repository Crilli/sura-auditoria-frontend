import {
  cambiosDeLaFila, filaConDetalle, solicitudDeLaFila, valoresDeLaFila
} from './edicion-en-fila.model';
import { DetalleLineaModel, ResumenLineaModel } from './linea-cuenta.model';

/** Las reglas de la edición en la fila. Ningún dato identifica a una persona. */

const fila = (cambios: Partial<ResumenLineaModel> = {}): ResumenLineaModel => ({
  referencia: 135280, numeroLinea: 4, codigoProcedimiento: '870603',
  descripcionProcedimiento: null, catalogoProcedimiento: 'CUPS', codigoAfiliado: 'X',
  nombreAfiliado: null, fechaInicio: '2023-06-09', fechaFin: null, codigoAutorizacion: null,
  valorAutorizado: 0, valorCargado: 196_800, unidadesCargadas: 1, unidadesAutorizadas: 1,
  valorIva: null, porcentajeIva: null, valorCubierto: 0, valorGlosado: 196_800,
  editable: true, cantidadPendientes: 1, pendientes: [], tieneNovedadBloqueante: true,
  novedades: [], version: 114, ...cambios,
});

describe('edición en la fila — reglas', () => {

  it('[GRID-18] los valores de partida son los cuatro que la grilla enseña', () => {
    expect(valoresDeLaFila(fila())).toEqual({
      valorCargado: 196_800, unidadesCargadas: 1, valorAutorizado: 0, unidadesAutorizadas: 1,
    });
  });

  it('[GRID-18] solo viaja lo que cambió', () => {
    expect(cambiosDeLaFila(fila(), { ...valoresDeLaFila(fila()), valorAutorizado: 1 }))
      .toEqual({ valorAutorizado: 1 });
  });

  it('[GRID-18] sin cambios no hay nada que guardar', () => {
    expect(cambiosDeLaFila(fila(), valoresDeLaFila(fila()))).toBeNull();
    expect(cambiosDeLaFila(fila(), {})).toBeNull();
  });

  it('[GRID-18] un campo vacío no viaja: lo ausente se conserva, no se borra', () => {
    expect(cambiosDeLaFila(fila({ valorCargado: null }),
                           { valorCargado: null, valorAutorizado: 5 }))
      .toEqual({ valorAutorizado: 5 });
  });

  it('[GRID-18] el cero es un valor, no un hueco', () => {
    expect(cambiosDeLaFila(fila({ valorAutorizado: 1 }), { valorAutorizado: 0 }))
      .toEqual({ valorAutorizado: 0 });
  });

  it('[GRID-18] la solicitud lleva la versión de la fila y el modo elegido', () => {
    expect(solicitudDeLaFila(fila(), { valorAutorizado: 1 }, 'AISLADO')).toEqual({
      versionEsperada: 114, modoRecalculo: 'AISLADO', valorAutorizado: 1,
    });
  });

  it('[GRID-18] la fila guardada enseña lo que devolvió el sistema de registro, no lo tecleado', () => {
    // El motor puede haber recalculado el cubierto aunque se tocara solo lo autorizado.
    const detalle = {
      valorCargado: 196_800, unidadesCargadas: 1, valorAutorizado: 1, unidadesAutorizadas: 1,
      valorCubierto: 1, valorGlosado: 196_799, editable: true, version: 115,
    } as DetalleLineaModel;

    const nueva = filaConDetalle(fila(), detalle);

    expect(nueva).toMatchObject({
      valorAutorizado: 1, valorCubierto: 1, valorGlosado: 196_799, version: 115,
    });
    // Lo que el detalle no trae se conserva hasta que llegue el refresco de la página.
    expect(nueva.valorIva).toBeNull();
    expect(nueva.tieneNovedadBloqueante).toBe(true);
    expect(nueva.numeroLinea).toBe(4);
  });
});
