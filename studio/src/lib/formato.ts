// Formato único del estudio: vertical 9:16 para TikTok, Reels y Shorts.
export const ANCHO = 1080;
export const ALTO = 1920;
export const FPS = 30;

// Márgenes (px) que tapa la interfaz de las apps. Valores conservadores
// para que sirvan a la vez en TikTok, Reels y Shorts.
export const ZONA_SEGURA = {
  arriba: 220,
  abajo: 420,
  izquierda: 60,
  derecha: 180,
} as const;

export const segundos = (s: number) => Math.round(s * FPS);
