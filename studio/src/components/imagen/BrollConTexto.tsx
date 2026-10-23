import { AbsoluteFill } from "remotion";
import { colores } from "../../lib/estilo";
import { ALTO } from "../../lib/formato";
import { TituloCinetico } from "../texto/TituloCinetico";
import { ImagenKenBurns } from "./ImagenKenBurns";

type Props = {
  src: string;
  texto: string;
  resaltar?: string[];
  // Dónde va el texto; el degradado oscurece ese lado para que se lea.
  posicion?: "arriba" | "centro" | "abajo";
  tamano?: number;
};

// Imagen o clip de fondo con un degradado y un título encima. La escena típica de b-roll.
export const BrollConTexto: React.FC<Props> = ({ src, texto, resaltar, posicion = "abajo", tamano = 110 }) => {
  const centroY = { arriba: ALTO * 0.25, centro: ALTO * 0.5, abajo: ALTO * 0.62 }[posicion];
  const degradado = {
    arriba: `linear-gradient(to bottom, ${colores.fondo}EE 0%, transparent 55%)`,
    centro: `radial-gradient(circle at 50% 50%, ${colores.fondo}CC 0%, transparent 70%)`,
    abajo: `linear-gradient(to top, ${colores.fondo}F2 10%, transparent 65%)`,
  }[posicion];
  return (
    <AbsoluteFill>
      <ImagenKenBurns src={src} zoomDesde={1.1} zoomHasta={1.0} moverY={0} />
      <AbsoluteFill style={{ background: degradado }} />
      <TituloCinetico texto={texto} resaltar={resaltar} centroY={centroY} tamano={tamano} variante="mascara" />
    </AbsoluteFill>
  );
};
