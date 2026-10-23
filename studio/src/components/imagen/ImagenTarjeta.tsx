import { AbsoluteFill, interpolate } from "remotion";
import { useEntrada, useProgreso, useSalida } from "../../lib/animacion";
import { colores, estiloEtiqueta, forma } from "../../lib/estilo";
import { ALTO, ANCHO } from "../../lib/formato";
import { Medio } from "./Medio";

type Props = {
  src: string;
  ancho?: number;
  alto?: number;
  centroY?: number;
  // Rotación final en grados (un poco de inclinación la hace sentir "pegada").
  rotacion?: number;
  pie?: string;
  borde?: string;
};

// Foto o clip en una tarjeta redondeada que se revela con una máscara y queda flotando.
export const ImagenTarjeta: React.FC<Props> = ({
  src,
  ancho = 820,
  alto = 1000,
  centroY = ALTO * 0.45,
  rotacion = -3,
  pie,
  borde = colores.borde,
}) => {
  const entrada = useEntrada(0);
  const revelado = useEntrada(0, "suave");
  const salida = useSalida();
  const deriva = interpolate(useProgreso(), [0, 1], [1.08, 1]);
  const pieEntrada = useEntrada(12, "suave");
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: salida }}>
      <div
        style={{
          position: "absolute",
          left: (ANCHO - ancho) / 2,
          top: centroY - alto / 2,
          width: ancho,
          height: alto,
          transform: `scale(${0.8 + entrada * 0.2}) rotate(${rotacion * entrada + (1 - entrada) * 8}deg)`,
          borderRadius: forma.radio,
          border: `4px solid ${borde}`,
          boxShadow: forma.sombra,
          overflow: "hidden",
          clipPath: `inset(${(1 - revelado) * 50}% 0 ${(1 - revelado) * 50}% 0 round ${forma.radio}px)`,
          background: colores.superficie,
        }}
      >
        <div style={{ width: "100%", height: "100%", transform: `scale(${deriva})` }}>
          <Medio src={src} />
        </div>
      </div>
      {pie ? (
        <div
          style={{
            position: "absolute",
            top: centroY + alto / 2 + 50,
            left: 0,
            right: 0,
            textAlign: "center",
            ...estiloEtiqueta(30),
            opacity: pieEntrada,
            transform: `translateY(${(1 - pieEntrada) * 20}px)`,
          }}
        >
          {pie}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
