import { AbsoluteFill, interpolate } from "remotion";
import { useProgreso } from "../../lib/animacion";
import { curvas } from "../../lib/motion";
import { Medio } from "./Medio";

type Props = {
  src: string;
  zoomDesde?: number;
  zoomHasta?: number;
  // Desplazamiento total en % del cuadro durante la secuencia (x positivo = hacia la derecha).
  moverX?: number;
  moverY?: number;
  // 0–1: capa oscura encima para que el texto se lea.
  oscurecer?: number;
};

// Imagen a pantalla completa con zoom y paneo lento: da vida a una foto fija.
export const ImagenKenBurns: React.FC<Props> = ({ src, zoomDesde = 1.05, zoomHasta = 1.2, moverX = 0, moverY = -3, oscurecer = 0 }) => {
  const p = curvas.suave(useProgreso());
  const zoom = interpolate(p, [0, 1], [zoomDesde, zoomHasta]);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${zoom}) translate(${moverX * p}%, ${moverY * p}%)` }}>
        <Medio src={src} />
      </AbsoluteFill>
      {oscurecer > 0 ? <AbsoluteFill style={{ background: `rgba(0,0,0,${oscurecer})` }} /> : null}
    </AbsoluteFill>
  );
};
