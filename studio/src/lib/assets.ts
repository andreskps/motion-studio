import { staticFile } from "remotion";

// Los assets se pasan como ruta dentro de studio/public ("assets/demo/imagen-1.jpg") o como URL completa.
export const resolverAsset = (src: string) => (/^(https?:|data:)/.test(src) ? src : staticFile(src));

export const esVideo = (src: string) => /\.(mp4|mov|webm|mkv)$/i.test(src);
