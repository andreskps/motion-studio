import { Img, staticFile } from "remotion";
import { useAsset } from "../../lib/assetsProyecto";
import { useEn, type Momento } from "../../lib/lienzo";
import { useAnimacion } from "../../lib/presets";
import { MarcadorAsset, Tarjeta } from "./Tarjeta";

type Props = {
  // Nombre del asset en proyectos/<slug>/assets/ (con o sin extensión).
  archivo?: string;
  alto?: number;
  // Sobre una tarjeta (para logos oscuros o que necesitan fondo) o suelto (logos claros con transparencia).
  enmarcado?: boolean;
  titulo?: string;
  // Revelado con barrido de izquierda a derecha en ese momento (por defecto, ya visible).
  revelarEn?: Momento;
};

// Logo de la marca con sus colores reales (ADN §2): para que la gente la reconozca.
export const Logo: React.FC<Props> = ({ archivo = "logo", alto = 160, enmarcado = false, titulo, revelarEn }) => {
  const { src, archivo: info } = useAsset(archivo);
  const a = useAnimacion();
  const resolver = useEn();
  const p = revelarEn === undefined ? 1 : a.avance({ en: resolver(revelarEn), duracion: Math.round(a.perfil.entrada * 1.6) });
  const proporcion = info?.ancho && info?.alto ? info.ancho / info.alto : 2.6;
  const imagen = src ? (
    <Img src={staticFile(src)} style={{ height: alto, width: alto * proporcion, objectFit: "contain", display: "block" }} />
  ) : (
    <MarcadorAsset nombre={`${archivo}.png`} ancho={alto * proporcion} alto={alto} />
  );
  const revelado = { clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`, transform: `scale(${0.94 + 0.06 * p})` };
  return enmarcado ? (
    <div style={revelado}>
      <Tarjeta titulo={titulo}>{imagen}</Tarjeta>
    </div>
  ) : (
    <div style={revelado}>{imagen}</div>
  );
};
