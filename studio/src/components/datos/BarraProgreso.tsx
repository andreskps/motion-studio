import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { colores } from "../../lib/estilo";

type Props = {
  color?: string;
  alto?: number;
  posicion?: "arriba" | "abajo";
};

// Barra fina que avanza con el video. Ponla fuera de cualquier <Sequence> para que mida el video completo.
export const BarraProgreso: React.FC<Props> = ({ color = colores.acento, alto = 12, posicion = "arriba" }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          [posicion === "arriba" ? "top" : "bottom"]: 0,
          height: alto,
          width: `${(frame / Math.max(1, durationInFrames - 1)) * 100}%`,
          background: color,
          boxShadow: `0 0 20px ${color}`,
        }}
      />
    </AbsoluteFill>
  );
};
