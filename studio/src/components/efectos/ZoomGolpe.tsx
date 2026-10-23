import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { resorte, resortes } from "../../lib/motion";

type Props = {
  children: React.ReactNode;
  // Frames (relativos a la secuencia) donde golpea el zoom. Ponlos en las palabras de énfasis.
  en: number[];
  intensidad?: number;
};

// Envuelve una escena y le da un zoom de golpe en momentos concretos, como un corte de cámara.
export const ZoomGolpe: React.FC<Props> = ({ children, en, intensidad = 0.08 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Cada golpe deja la escena un poco más cerca, como un "punch in" acumulado.
  const zoom = en.reduce((total, momento) => total + resorte(frame, fps, resortes.rapido, momento) * intensidad, 1);
  return <AbsoluteFill style={{ transform: `scale(${zoom})` }}>{children}</AbsoluteFill>;
};
