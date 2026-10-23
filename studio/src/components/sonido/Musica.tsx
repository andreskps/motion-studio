import { useMemo } from "react";
import { Audio, interpolate, useVideoConfig } from "remotion";
import { resolverAsset } from "../../lib/assets";
import type { Palabra } from "../../lib/subtitulos";

type Props = {
  src: string;
  // Volumen cuando no habla nadie.
  volumen?: number;
  // Volumen mientras habla la voz (ducking).
  volumenConVoz?: number;
  // Palabras con tiempos (palabras.json): la música baja mientras se habla.
  palabras?: Palabra[];
  // Segundos de fundido de entrada y salida del tema.
  fundido?: number;
};

// Tramos donde habla la voz: une palabras separadas por menos de 0,5 s.
const tramosDeVoz = (palabras: Palabra[]) => {
  const tramos: [number, number][] = [];
  for (const p of palabras) {
    const ultimo = tramos[tramos.length - 1];
    if (ultimo && p.inicio - ultimo[1] < 0.5) ultimo[1] = p.fin;
    else tramos.push([p.inicio, p.fin]);
  }
  return tramos;
};

// Música de fondo con fundidos y ducking automático bajo la voz.
export const Musica: React.FC<Props> = ({ src, volumen = 0.25, volumenConVoz = 0.08, palabras = [], fundido = 1 }) => {
  const { fps, durationInFrames } = useVideoConfig();
  const tramos = useMemo(() => tramosDeVoz(palabras), [palabras]);
  const rampa = 0.25;
  return (
    <Audio
      src={resolverAsset(src)}
      loop
      volume={(f) => {
        const t = f / fps;
        // Distancia (s) al tramo de voz más cercano: 0 dentro de un tramo.
        const distancia = tramos.reduce((min, [a, b]) => Math.min(min, t < a ? a - t : t > b ? t - b : 0), Infinity);
        const nivel = interpolate(distancia, [0, rampa], [volumenConVoz, volumen], { extrapolateRight: "clamp" });
        const fundidos = interpolate(f, [0, fundido * fps, durationInFrames - fundido * fps, durationInFrames], [0, 1, 1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return nivel * fundidos;
      }}
    />
  );
};
