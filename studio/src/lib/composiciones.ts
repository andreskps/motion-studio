import { ANCHO } from "./formato";

// Composiciones del ADN §6: huecos de posición (coordenadas del mundo, con la cámara en reposo) sobre la estructura
// vertical común (HUD arriba, escenario al centro, subtítulo abajo). Dan variedad sin perder la identidad.

export type Punto = { x: number; y: number };

export const ZONAS = {
  hud: { y: 280 },
  cabecera: { y: 480 },
  escenario: { arriba: 620, centro: 955, abajo: 1290 },
  subtitulo: { y: 1382 },
} as const;

const CX = ANCHO / 2;
const MARGEN = 140;

/** Cifra protagonista: etiqueta, cifra enorme y contexto pequeño. */
export const cifra = () => ({
  etiqueta: { x: CX, y: 700 },
  cifra: { x: CX, y: 880 },
  contexto: { x: CX, y: 1080 },
});

/** Comparación de dos escenarios: en columnas (lado a lado) o en filas (arriba/abajo). */
export const comparacion = (orientacion: "columnas" | "filas" = "columnas") =>
  orientacion === "columnas"
    ? { a: { x: CX - 250, y: 930 }, b: { x: CX + 250, y: 930 }, eje: { x: CX, y: 930 }, etiquetaA: { x: CX - 250, y: 700 }, etiquetaB: { x: CX + 250, y: 700 } }
    : { a: { x: CX, y: 760 }, b: { x: CX, y: 1150 }, eje: { x: CX, y: 955 }, etiquetaA: { x: CX, y: 640 }, etiquetaB: { x: CX, y: 1030 } };

/** Diagrama progresivo: n nodos de arriba abajo o de izquierda a derecha, repartidos en el escenario. */
export const diagrama = (n: number, orientacion: "vertical" | "horizontal" = "vertical"): Punto[] =>
  Array.from({ length: n }, (_, i) => {
    const t = n === 1 ? 0.5 : i / (n - 1);
    return orientacion === "vertical"
      ? { x: CX, y: ZONAS.escenario.arriba + 40 + t * (ZONAS.escenario.abajo - ZONAS.escenario.arriba - 80) }
      : { x: MARGEN + 40 + t * (ANCHO - 2 * MARGEN - 80), y: ZONAS.escenario.centro };
  });

/** Objeto central con n satélites alrededor (en óvalo, más ancho que alto por el formato vertical). */
export const objetoCentral = (n: number, radio = 330, anguloInicial = -90) => ({
  objeto: { x: CX, y: ZONAS.escenario.centro },
  satelites: Array.from({ length: n }, (_, i): Punto => {
    const a = ((anguloInicial + (360 / n) * i) * Math.PI) / 180;
    return { x: CX + Math.cos(a) * radio, y: ZONAS.escenario.centro + Math.sin(a) * radio * 1.05 };
  }),
});

/** Secuencia de pasos: el paso actual grande al centro; el anterior y el siguiente asoman atenuados. */
export const pasos = () => ({
  anterior: { x: CX - 760, y: ZONAS.escenario.centro },
  actual: { x: CX, y: ZONAS.escenario.centro },
  siguiente: { x: CX + 760, y: ZONAS.escenario.centro },
});

/** Transformación: un mismo sitio para el antes y el después. */
export const transformacion = () => ({ centro: { x: CX, y: ZONAS.escenario.centro } });

/** De lo general al detalle: rejilla de celdas (vista general) y el centro de cada una (para el zoom-in). */
export const generalDetalle = (columnas: number, filas: number, separacion = 260): Punto[] =>
  Array.from({ length: columnas * filas }, (_, i) => ({
    x: CX + ((i % columnas) - (columnas - 1) / 2) * separacion,
    y: ZONAS.escenario.centro + (Math.floor(i / columnas) - (filas - 1) / 2) * separacion,
  }));

/** Posición desplazada por "pantallas" del mundo, para escenas que la cámara visita con un paneo. */
export const enPantalla = (p: Punto, columna: number, fila = 0): Punto => ({ x: p.x + columna * ANCHO, y: p.y + fila * 1920 });
