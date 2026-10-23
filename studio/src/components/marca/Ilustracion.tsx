import { Img, staticFile } from "remotion";
import { useAsset } from "../../lib/assetsProyecto";
import { useEn, type Momento } from "../../lib/lienzo";
import { useAnimacion } from "../../lib/presets";
import { IconoTrazo } from "../vocabulario/IconoTrazo";
import type { NombreIcono } from "../vocabulario/iconos";

type Props = {
  // Asset de proyectos/<slug>/assets/ (normalmente generado con IA según estilo/prompts-imagen.md).
  archivo: string;
  tamano?: number;
  revelarEn: Momento;
  // Si el asset todavía no existe, se dibuja este pictograma (o nada, si no se indica).
  pictograma?: NombreIcono;
};

// Ilustración de trazo con fondo transparente, sin marco: se funde con el lienzo y se revela de abajo arriba,
// como si se dibujara. Para los assets IA del plan (estilo/prompts-imagen.md).
export const Ilustracion: React.FC<Props> = ({ archivo, tamano = 420, revelarEn, pictograma }) => {
  const { src, archivo: info } = useAsset(archivo);
  const a = useAnimacion();
  const resolver = useEn();
  const f = resolver(revelarEn);
  if (!src) return pictograma ? <IconoTrazo nombre={pictograma} tamano={tamano * 0.5} dibujarEn={f} /> : null;
  const p = a.dibujar({ en: f, duracion: Math.round(a.perfil.dibujo * 1.5) });
  const proporcion = info?.ancho && info?.alto ? info.ancho / info.alto : 1;
  const ancho = proporcion >= 1 ? tamano : tamano * proporcion;
  const alto = proporcion >= 1 ? tamano / proporcion : tamano;
  return (
    <Img
      src={staticFile(src)}
      style={{ width: ancho, height: alto, objectFit: "contain", display: "block", clipPath: `inset(${(1 - p) * 100}% 0 0 0)`, opacity: Math.min(1, p * 2) }}
    />
  );
};
