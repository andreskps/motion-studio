import catalogo from "../../public/sfx/catalogo.json";

// Catálogo generado por pipeline/generar_sfx.py (síntesis) y pipeline/importar_sfx.py (bibliotecas).
// Sintetizados: pop, click, tic, blip, whoosh, swish, riser, impacto, sub-drop, glitch, ding, error, tecla, succion.
// De biblioteca (Kenney, CC0): interruptor, golpe, golpe-suave, metal, madera, vidrio, campana.
// Los importados pueden añadir ids nuevos, por eso el id es un string.
export type IdSonido = string;
export type Fuente = "sintesis" | "biblioteca";

type Variante = { archivo: string; duracion: number; fuente: string };
export type SonidoCatalogo = {
  id: string;
  categoria: string;
  descripcion: string;
  usos: string[];
  volumen: number;
  variantes: Variante[];
};

const sonidos = catalogo.sonidos as SonidoCatalogo[];

export const buscarSonido = (id: IdSonido): SonidoCatalogo => {
  const sonido = sonidos.find((s) => s.id === id);
  if (!sonido) {
    throw new Error(`No existe el sonido "${id}". Disponibles: ${sonidos.map((s) => s.id).join(", ")}`);
  }
  return sonido;
};

// Variantes del sonido, opcionalmente solo de una fuente (si no hay de esa fuente, devuelve todas).
export const variantesDe = (sonido: SonidoCatalogo, fuente?: Fuente) => {
  const filtradas = fuente ? sonido.variantes.filter((v) => v.fuente === fuente) : sonido.variantes;
  return filtradas.length > 0 ? filtradas : sonido.variantes;
};
