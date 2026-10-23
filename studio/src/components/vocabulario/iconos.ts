// Iconos de trazo del ADN §7, en una cuadrícula de 48×48 y como un solo camino SVG cada uno, para que se puedan
// dibujar progresivamente (pathLength=1 + strokeDashoffset). Para añadir uno, compónlo con las ayudas de abajo.

const circulo = (cx: number, cy: number, r: number) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;
const rect = (x: number, y: number, w: number, h: number, r = 0) =>
  r === 0
    ? `M${x} ${y}h${w}v${h}h${-w}z`
    : `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1 ${-r} ${r}h${-(w - 2 * r)}a${r} ${r} 0 0 1 ${-r} ${-r}v${-(h - 2 * r)}a${r} ${r} 0 0 1 ${r} ${-r}z`;

export const ICONOS = {
  persona: `${circulo(24, 11, 6)}M24 17v15M24 21l-9 8M24 21l9 8M24 32l-7 12M24 32l7 12`,
  grupo: `${circulo(16, 13, 5)}${circulo(32, 13, 5)}M8 40v-8a8 8 0 0 1 16 0v8M24 40v-8a8 8 0 0 1 16 0v8`,
  tienda: "M7 20h34M10 20l3-10h22l3 10M10 20v20h28V20M20 40V30h8v10",
  movil: `${rect(14, 4, 20, 40, 4)}M21 9h6M22 39h4`,
  tarjeta: `${rect(6, 12, 36, 24, 3)}M6 19h36M11 29h8`,
  botella: "M20 4h8M21 4v8c-4 3-6 6-6 10v20h18V22c0-4-2-7-6-10V4",
  dinero: `${rect(6, 14, 36, 20, 2)}${circulo(24, 24, 5)}M11 19v10M37 19v10`,
  grafico: "M8 40h32M12 40V28M20 40V20M28 40V24M36 40V12",
  check: "M10 25l9 9 19-20",
  cruz: "M12 12l24 24M36 12L12 36",
  reloj: `${circulo(24, 24, 18)}M24 14v10l7 5`,
  regalo: `${rect(8, 20, 32, 20)}${rect(6, 14, 36, 6)}M24 14v26M24 14c-3-6-11-6-9 0M24 14c3-6 11-6 9 0`,
  estrella: "M24 6l5.5 11.5 12.5 1.5-9.3 8.7 2.5 12.3L24 34l-11.2 6 2.5-12.3L6 19l12.5-1.5z",
  mensaje: "M8 10h32v22H20l-8 7v-7H8z",
  carrito: `M6 8h6l5 22h20l4-14H14${circulo(19, 38, 3)}${circulo(35, 38, 3)}`,
  caja: "M8 16l16-8 16 8v18l-16 8-16-8zM8 16l16 8 16-8M24 24v18",
  rayo: "M27 4L12 27h11l-2 17 15-23H25z",
  corazon: "M24 40S8 30 8 18a8 8 0 0 1 16-3 8 8 0 0 1 16 3c0 12-16 22-16 22z",
  ojo: `M4 24s8-12 20-12 20 12 20 12-8 12-20 12S4 24 4 24z${circulo(24, 24, 5)}`,
  candado: `${rect(10, 22, 28, 20, 3)}M16 22v-6a8 8 0 0 1 16 0v6`,
  documento: "M12 4h16l8 8v32H12zM28 4v8h8M17 22h14M17 29h14M17 36h9",
  cafe: "M10 18h24v12a10 10 0 0 1-10 10h-4a10 10 0 0 1-10-10zM34 22h3a4 4 0 0 1 0 8h-3M18 8c-2 3 2 4 0 7M26 8c-2 3 2 4 0 7",
  flecha: "M8 24h30M28 14l10 10-10 10",
  tendencia: "M6 36l12-12 8 8 16-18M32 14h10v10",
  caida: "M6 12l12 12 8-8 16 18M32 34h10V24",
  bolsa: "M10 16h28l-3 26H13zM18 16v-4a6 6 0 0 1 12 0v4",
  embudo: "M6 8h36L28 26v14l-8-4V26z",
  objetivo: `${circulo(24, 24, 18)}${circulo(24, 24, 10)}${circulo(24, 24, 2)}`,
} as const;

export type NombreIcono = keyof typeof ICONOS;
