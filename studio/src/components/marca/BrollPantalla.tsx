import { AbsoluteFill, interpolate } from "remotion";
import { useAsset } from "../../lib/assetsProyecto";
import { colores, estiloEtiqueta } from "../../lib/estilo";
import { useEn, type Momento } from "../../lib/lienzo";
import { progreso, useAnimacion } from "../../lib/presets";
import { Medio } from "../imagen/Medio";
import { MarcadorAsset } from "./Tarjeta";

type Props = {
  archivo: string;
  desde: Momento;
  hasta: Momento;
  etiqueta?: string;
};

// B-roll a pantalla completa en la capa fija, para un momento puntual (ADN §4: es un corte de contraste o revelación,
// no el lenguaje habitual del video). Entra y sale con barrido vertical; un degradado protege los subtítulos.
export const BrollPantalla: React.FC<Props> = ({ archivo, desde, hasta, etiqueta }) => {
  const { src } = useAsset(archivo);
  const a = useAnimacion();
  const resolver = useEn();
  const f0 = resolver(desde);
  const f1 = resolver(hasta);
  if (a.frame < f0 - 2 || a.frame > f1 + a.perfil.salida) return null;
  const entra = progreso(a.frame, f0 - 2, a.perfil.entrada, a.perfil.curvaEntrada);
  const sale = progreso(a.frame, f1, a.perfil.salida, a.perfil.curvaSalida);
  const zoom = interpolate(a.frame, [f0, f1], [1.1, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ clipPath: `inset(${(1 - entra) * 100}% 0 ${sale * 100}% 0)`, background: colores.fondo }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        {src ? <Medio src={src} /> : <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}><MarcadorAsset nombre={archivo} ancho={700} alto={900} /></AbsoluteFill>}
      </AbsoluteFill>
      <AbsoluteFill style={{ background: `linear-gradient(to top, ${colores.fondo} 12%, transparent 45%)` }} />
      {etiqueta ? <div style={{ position: "absolute", top: 300, left: 72, ...estiloEtiqueta(28, colores.texto) }}>{etiqueta}</div> : null}
    </AbsoluteFill>
  );
};
