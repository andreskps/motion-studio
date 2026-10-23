// Tipos y agrupación de subtítulos a partir de palabras.json (salida de pipeline/alinear.py).

export type Palabra = {
  texto: string;
  inicio: number;
  fin: number;
  origen: "forzada" | "interpolado";
  finFrase: boolean;
  pausa: boolean;
  // Marcada en el guion con *asteriscos*: va en el acento.
  clave?: boolean;
  // Marcada en el guion con {nombre} delante: momento para sincronizar animaciones (lib/sincronia.ts).
  ancla?: string;
};

export type DatosAudio = {
  duracion: number;
  cobertura: number;
  audio: string;
  anclas?: Record<string, { indice: number; inicio: number; fin: number }>;
  palabras: Palabra[];
};

export type Pagina = {
  palabras: Palabra[];
  inicio: number;
  fin: number;
};

export type OpcionesPaginas = {
  maxPalabras: number;
  maxCaracteres: number;
  // Un silencio más largo que esto (s) corta la página aunque no haya puntuación.
  silencioCorte: number;
};

export const opcionesPorDefecto: OpcionesPaginas = {
  maxPalabras: 3,
  maxCaracteres: 18,
  silencioCorte: 0.35,
};

// Frases para el modo "frase en construcción" (ADN): una frase del guion por bloque, partida en una pausa
// (o, si no hay, al llegar al límite) cuando no cabe en dos líneas.
export const agruparEnFrases = (palabras: Palabra[], maxCaracteres = 62): Pagina[] => {
  const bloques: Palabra[][] = [];
  let actual: Palabra[] = [];
  const largo = (ps: Palabra[]) => ps.reduce((n, p) => n + p.texto.length + 1, 0);
  palabras.forEach((palabra) => {
    if (actual.length > 0 && largo(actual) + palabra.texto.length > maxCaracteres) {
      // Cortar en la última pausa del bloque si la hay, para no partir una idea por la mitad.
      const ultimaPausa = actual.map((p) => p.pausa).lastIndexOf(true);
      if (ultimaPausa > 0 && ultimaPausa < actual.length - 1) {
        bloques.push(actual.slice(0, ultimaPausa + 1));
        actual = actual.slice(ultimaPausa + 1);
      } else {
        bloques.push(actual);
        actual = [];
      }
    }
    actual.push(palabra);
    if (palabra.finFrase) {
      bloques.push(actual);
      actual = [];
    }
  });
  if (actual.length) bloques.push(actual);

  return bloques.map((ps, i) => {
    const siguiente = bloques[i + 1];
    const fin = ps[ps.length - 1].fin;
    return { palabras: ps, inicio: ps[0].inicio, fin: siguiente && siguiente[0].inicio - fin < 0.8 ? siguiente[0].inicio : fin + 0.4 };
  });
};

// Quita la puntuación de cierre que estorba en pantalla, pero conserva ¿? y ¡!.
export const limpiarTexto = (texto: string) => texto.replace(/[.,;:…]+$/u, "");

export const agruparEnPaginas = (palabras: Palabra[], opciones: OpcionesPaginas = opcionesPorDefecto): Pagina[] => {
  const paginas: Pagina[] = [];
  let actual: Palabra[] = [];

  const cerrar = () => {
    if (actual.length === 0) return;
    paginas.push({ palabras: actual, inicio: actual[0].inicio, fin: actual[actual.length - 1].fin });
    actual = [];
  };

  palabras.forEach((palabra, i) => {
    const caracteres = actual.reduce((n, p) => n + p.texto.length + 1, 0) + palabra.texto.length;
    if (actual.length >= opciones.maxPalabras || (actual.length > 0 && caracteres > opciones.maxCaracteres)) {
      cerrar();
    }
    actual.push(palabra);
    const siguiente = palabras[i + 1];
    const silencio = siguiente ? siguiente.inicio - palabra.fin : Infinity;
    if (palabra.finFrase || palabra.pausa || silencio > opciones.silencioCorte) {
      cerrar();
    }
  });
  cerrar();

  // Cada página se queda en pantalla hasta que empieza la siguiente, salvo en silencios largos.
  return paginas.map((pagina, i) => {
    const siguiente = paginas[i + 1];
    const fin = siguiente && siguiente.inicio - pagina.fin < 0.6 ? siguiente.inicio : pagina.fin + 0.25;
    return { ...pagina, fin };
  });
};
