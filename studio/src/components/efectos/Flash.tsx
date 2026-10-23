import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

type Props = {
  en: number;
  color?: string;
  duracion?: number;
  intensidad?: number;
};

// Destello de un instante para marcar un corte o un golpe.
export const Flash: React.FC<Props> = ({ en, color = "#FFFFFF", duracion = 6, intensidad = 0.85 }) => {
  const frame = useCurrentFrame();
  const opacidad = interpolate(frame, [en, en + 1, en + duracion], [0, intensidad, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (opacidad <= 0) return null;
  return <AbsoluteFill style={{ background: color, opacity: opacidad, pointerEvents: "none" }} />;
};
