import { colores, estiloEtiqueta } from "../../lib/estilo";
import { useEn, type Momento } from "../../lib/lienzo";
import { useAnimacion } from "../../lib/presets";

type Props = {
  // Punto del objeto que se rotula (coordenadas del mundo).
  x: number;
  y: number;
  // Desplazamiento del rótulo respecto al punto.
  dx: number;
  dy: number;
  texto: string;
  en: Momento;
  foco?: boolean;
};

// Rótulo técnico unido al objeto por una línea guía (ADN §7, de resultaaquee). Hija directa de <Lienzo>.
// La línea se dibuja desde el objeto y el rótulo aparece al llegar.
export const EtiquetaGuia: React.FC<Props> = ({ x, y, dx, dy, texto, en, foco = false }) => {
  const a = useAnimacion();
  const resolver = useEn();
  const f = resolver(en);
  const linea = a.dibujar({ en: f, duracion: Math.round(a.perfil.dibujo * 0.8) });
  const rotulo = a.entrar({ en: f + Math.round(a.perfil.dibujo * 0.6), direccion: "ninguna" });
  if (linea <= 0) return null;
  // Codo: primero en diagonal hacia el rótulo y luego horizontal bajo el texto.
  const codoX = x + dx * 0.6;
  const izquierda = dx < 0;
  return (
    <>
      <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" }} width={1} height={1}>
        <circle cx={x} cy={y} r={7} fill={foco ? colores.acento : colores.texto} opacity={Math.min(1, linea * 3)} />
        <path
          d={`M${x} ${y}L${codoX} ${y + dy}L${x + dx} ${y + dy}`}
          fill="none"
          stroke={foco ? colores.acento : colores.suave}
          strokeWidth={2}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - linea}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          left: x + dx,
          top: y + dy - 42,
          transform: izquierda ? "translateX(-100%)" : "none",
          whiteSpace: "nowrap",
          ...estiloEtiqueta(28, foco ? colores.acento : colores.texto),
          opacity: rotulo.opacity,
        }}
      >
        {texto}
      </div>
    </>
  );
};
