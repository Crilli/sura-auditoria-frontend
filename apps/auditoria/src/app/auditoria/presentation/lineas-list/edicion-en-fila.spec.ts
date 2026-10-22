import { crearFormularioEnFila } from './edicion-en-fila';
import { ResumenLineaModel } from '../../domain/models/linea-cuenta.model';

/**
 * El formulario de la fila. Ningún dato identifica a una persona. Cifras distintas por concepto
 * (cargado 1000, convenido 900, autorizado 800) para que un cruce se note.
 */

const fila = (cambios: Partial<ResumenLineaModel> = {}) => ({
  referencia: 1, numeroLinea: 1, valorCargado: 1_000, unidadesCargadas: 3,
  valorConvenido: 900, unidadesConvenidas: 2, valorAutorizado: 800, unidadesAutorizadas: 1,
  version: 3, editable: true, ...cambios,
} as ResumenLineaModel);

describe('crearFormularioEnFila', () => {

  it('[GRID-18] arranca con cargado y convenido de la fila; el autorizado no tiene control', () => {
    expect(crearFormularioEnFila(fila()).getRawValue()).toEqual({
      valorCargado: 1_000, unidadesCargadas: 3, valorConvenido: 900, unidadesConvenidas: 2,
      modoRecalculo: null,
    });
  });

  it('[GRID-18] el modo de recálculo no tiene valor por defecto y es obligatorio', () => {
    const f = crearFormularioEnFila(fila());
    expect(f.controls.modoRecalculo.value).toBeNull();
    expect(f.valid).toBe(false);

    f.controls.modoRecalculo.setValue('AISLADO');
    expect(f.valid).toBe(true);
  });

  it('[GRID-18] vaciar un campo que tenía valor no se acepta', () => {
    const f = crearFormularioEnFila(fila());
    f.controls.modoRecalculo.setValue('AISLADO');

    f.controls.unidadesCargadas.setValue(null);

    expect(f.controls.unidadesCargadas.errors).toEqual({ obligatorio: true });
    expect(f.valid).toBe(false);
  });

  it('[GRID-18] un campo que venía vacío puede seguir vacío', () => {
    const f = crearFormularioEnFila(fila({ valorCargado: null }));
    f.controls.modoRecalculo.setValue('EN_CASCADA');

    expect(f.controls.valorCargado.errors).toBeNull();
    expect(f.valid).toBe(true);
  });

  it('[GRID-18] los negativos no se aceptan', () => {
    const f = crearFormularioEnFila(fila());
    f.controls.valorConvenido.setValue(-1);
    expect(f.controls.valorConvenido.errors?.['min']).toBeTruthy();
  });
});
