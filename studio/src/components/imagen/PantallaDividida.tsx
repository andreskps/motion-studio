import { AbsoluteFill } from "remotion";
import { useEntrada, useSalida } from "../../lib/animacion";
import { colores } from "../../lib/estilo";
import { ALTO } from "../../lib/formato";
import { Etiqueta } from "../texto/Etiqueta";
import { ImagenKenBurns } from "./ImagenKenBurns";

type Props = {
  arriba: string;
  abajo: string;
  etiquetaArriba?: string;
  etiquetaAbajo?: string;
};

// Dos imágenes o clips, uno arriba y otro abajo, que entran desde lados opuestos. Para comparar visualmente.
export const PantallaDividida: React.FC<Props> = ({ arriba, abajo, etiquetaArriba, etiquetaAbajo }) => {
  const pArriba = useEntrada(0);
  const pAbajo = useEntrada(5);
  const linea = useEntrada(10, "suave");
  const salida = useSalida();
  const mitad: React.CSSProperties = { position: "absolute", left: 0, right: 0, height: "50%", overflow: "hidden" };
  return (
    <AbsoluteFill style={{ opacity: salida }}>
      <div style={{ ...mitad, top: 0, transform: `translateX(${(1 - pArriba) * -100}%)` }}>
        <ImagenKenBurns src={arriba} moverY={0} />
      </div>
      <div style={{ ...mitad, bottom: 0, transform: `translateX(${(1 - pAbajo) * 100}%)` }}>
        <ImagenKenBurns src={abajo} moverY={0} />
      </div>
      <div style={{ position: "absolute", top: "50%", left: 0, height: 10, width: `${linea * 100}%`, background: colores.acento, transform: "translateY(-50%)" }} />
      {etiquetaArriba ? <Etiqueta texto={etiquetaArriba} centroY={ALTO * 0.42} /> : null}
      {etiquetaAbajo ? <Etiqueta texto={etiquetaAbajo} centroY={ALTO * 0.58} tono="neutra" /> : null}
    </AbsoluteFill>
  );
};
