import { Img, OffthreadVideo } from "remotion";
import { esVideo, resolverAsset } from "../../lib/assets";

type Props = {
  src: string;
  style?: React.CSSProperties;
  // Para videos: segundo del clip desde el que empieza.
  desdeSegundo?: number;
};

// Imagen o video (según la extensión) que llena su contenedor recortando lo que sobra.
export const Medio: React.FC<Props> = ({ src, style, desdeSegundo = 0 }) => {
  const estilo: React.CSSProperties = { width: "100%", height: "100%", objectFit: "cover", ...style };
  if (esVideo(src)) {
    return <OffthreadVideo src={resolverAsset(src)} muted trimBefore={Math.round(desdeSegundo * 30)} style={estilo} />;
  }
  return <Img src={resolverAsset(src)} style={estilo} />;
};
