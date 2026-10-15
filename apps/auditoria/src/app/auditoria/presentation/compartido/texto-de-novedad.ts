/**
 * La plantilla de un mensaje y los datos que la completan.
 *
 * El sistema de registro guarda el texto de una novedad **en dos piezas**: la
 * plantilla, que vive en el catálogo y lleva huecos `{0}`…`{9}`, y hasta diez
 * datos sueltos en la propia novedad. **Él no las junta**, así que juntarlas es
 * cosa de quien lo pinta.
 *
 * El servicio ya devuelve resuelto el texto de las novedades guardadas. Esto
 * existe para lo otro: **la vista previa mientras se teclea**, que es de algo
 * que todavía no se ha guardado y por tanto no se le puede pedir al servicio.
 *
 * > La misma regla está implementada en el microservicio, en
 * > `TextoDeNovedad.java`. Si cambia una, hay que cambiar la otra: lo que se
 * > previsualiza aquí tiene que ser exactamente lo que se acabe guardando.
 */

/** Un hueco es una llave con **un solo dígito** dentro: el 10 no existe. */
const HUECO = /\{([0-9])\}/g;

/** Lo que admite cada dato. Pasarse lo rechaza el sistema de registro. */
export const LARGO_MAXIMO_DATO = 300;

/**
 * Qué huecos usa una plantilla, en orden y sin repetir.
 *
 * **Los índices son dispersos**, no van de cero en adelante: hay plantillas que
 * usan el 1 y el 2 sin usar el 0, y alguna que usa el 0, 1, 2, 4 y 6. Por eso
 * hay que preguntárselo al texto en vez de contarlos.
 */
export function huecosDe(plantilla: string | null | undefined): number[] {
  if (!plantilla) return [];
  const vistos: number[] = [];
  for (const casa of plantilla.matchAll(HUECO)) {
    const indice = Number(casa[1]);
    if (!vistos.includes(indice)) vistos.push(indice);
  }
  return vistos;
}

/**
 * Compone el texto final sustituyendo cada hueco por su dato.
 *
 * **Un hueco sin dato se deja tal cual, con sus llaves.** Es deliberado: dejarlo
 * en blanco produciría una frase que se lee entera y correcta a la que le falta
 * justo el dato, y nadie se daría cuenta. Con las llaves a la vista, el hueco se
 * ve.
 */
export function resolverTexto(
  plantilla: string | null | undefined,
  datos: Record<number, string> | null | undefined,
): string {
  if (!plantilla) return '';
  if (!datos) return plantilla;
  return plantilla.replace(HUECO, (llaves, digito) => {
    const dato = datos[Number(digito)];
    return dato && dato.trim() ? dato : llaves;
  });
}

/** Los huecos de la plantilla que siguen sin dato. */
export function huecosSinDato(
  plantilla: string | null | undefined,
  datos: Record<number, string> | null | undefined,
): number[] {
  return huecosDe(plantilla).filter(i => !datos?.[i]?.trim());
}

/**
 * Una pista de qué va en cada hueco, sacada del texto que lo precede.
 *
 * El sistema de registro no dice qué significa cada dato: los llama «Valor 0» …
 * «Valor 9», que al auditor no le dice nada. Pero la frase sí lo dice — en
 * «Autorización inicial: {1}», el {1} es la autorización inicial — así que se
 * toman las últimas palabras antes del hueco.
 *
 * Es una ayuda, no una verdad: si la frase empieza por el hueco no hay nada que
 * tomar y se cae al rótulo del sistema de registro.
 */
export function pistaDelHueco(
  plantilla: string | null | undefined,
  indice: number,
): string {
  if (!plantilla) return `Dato ${indice}`;

  const posicion = plantilla.indexOf(`{${indice}}`);
  if (posicion <= 0) return `Dato ${indice}`;

  // Se corta en el punto o el punto y coma anteriores para no arrastrar el
  // final de la frase de antes, que no habla de este hueco.
  //
  // **Los dos puntos no cortan**, a propósito: en «Fecha autorización: {4}» son
  // justo lo que introduce el valor, y partir por ahí tiraría la única palabra
  // que dice qué va en el hueco.
  const antes = plantilla.slice(0, posicion);
  const desdeLaPuntuacion = antes.split(/[.;]/).pop() ?? antes;

  const palabras = desdeLaPuntuacion
    .replace(/\{[0-9]\}/g, '')     // otro hueco por el medio no es una pista
    // Separadores sueltos que quedan al quitar un hueco contiguo: en
    // «Autorización {2}-{1}-{3}» el {1} viene precedido de «-», y arrastrarlo
    // produce rótulos como «Autorización -» y «Autorización --», que es peor
    // que no decir nada.
    .replace(/[-–—/|,:]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (palabras.length === 0) return `Valor ${indice}`;

  const pista = palabras.slice(-4).join(' ');
  return pista.charAt(0).toUpperCase() + pista.slice(1);
}

/**
 * Los rótulos de todos los huecos de una plantilla, ya desambiguados.
 *
 * Hace falta porque la heurística puede dar el mismo rótulo a dos huecos —en
 * «Autorización {2}-{1}-{3}» los tres van precedidos de lo mismo— y dos campos
 * con el mismo nombre no se pueden distinguir. Cuando pasa, se añade el índice
 * del sistema de registro, que es lo único que de verdad los separa.
 */
export function rotulosDeHuecos(
  plantilla: string | null | undefined,
): Map<number, string> {
  const huecos = huecosDe(plantilla);
  const crudos = new Map(huecos.map(i => [i, pistaDelHueco(plantilla, i)]));

  const repetidos = new Set<string>();
  const vistos = new Set<string>();
  for (const rotulo of crudos.values()) {
    if (vistos.has(rotulo)) repetidos.add(rotulo);
    vistos.add(rotulo);
  }

  return new Map(
    [...crudos].map(([i, rotulo]) =>
      [i, repetidos.has(rotulo) ? `${rotulo} (valor ${i})` : rotulo]),
  );
}

/**
 * El trozo de la plantilla alrededor del hueco, con el hueco señalado.
 *
 * Va debajo del campo como ayuda **porque no es una interpretación**: es el
 * texto del catálogo tal cual. El rótulo que da {@link pistaDelHueco} es una
 * heurística y alguna vez se equivocará; esto nunca, así que un rótulo malo
 * queda en feo y no en engañoso.
 */
export function fragmentoDelHueco(
  plantilla: string | null | undefined,
  indice: number,
  margen = 28,
): string {
  if (!plantilla) return '';
  const marca = `{${indice}}`;
  const posicion = plantilla.indexOf(marca);
  if (posicion < 0) return '';

  const desde = Math.max(0, posicion - margen);
  const hasta = Math.min(plantilla.length, posicion + marca.length + margen);

  return (desde > 0 ? '…' : '')
    + plantilla.slice(desde, posicion)
    + '⟨aquí⟩'
    + plantilla.slice(posicion + marca.length, hasta)
    + (hasta < plantilla.length ? '…' : '');
}
