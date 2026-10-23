import { AbsoluteFill, useCurrentFrame } from "remotion";
import { colores } from "../../lib/estilo";

type Props = {
  // liso: negro de marca · cuadricula: plano técnico muy tenue que deriva · puntos: trama tenue.
  variante?: "liso" | "cuadricula" | "puntos";
  velocidad?: number;
  // Desvanecer hacia los bordes. <Lienzo> lo desactiva y pone su propio viñeteado fijo a la pantalla.
  vineta?: boolean;
};

// Lienzo de la escena. Según el ADN, el fondo no compite: negro de marca con, como mucho, una textura técnica tenue.
// Cuadrícula tenue por defecto: decisión del usuario en el ADN (sección 12).
// Quieta por defecto (ADN 1.1 §10: nada de deriva constante). En el lienzo se mueve con la cámara, por paralaje.
export const FondoAnimado: React.FC<Props> = ({ variante = "cuadricula", velocidad = 0, vineta = true }) => {
  const t = (useCurrentFrame() / 30) * velocidad;
  const patron =
    variante === "cuadricula"
      ? {
          backgroundImage: `linear-gradient(${colores.divisor} 1.5px, transparent 1.5px), linear-gradient(90deg, ${colores.divisor} 1.5px, transparent 1.5px)`,
          backgroundSize: "90px 90px",
          backgroundPosition: `0 ${(t * 12) % 90}px`,
        }
      : variante === "puntos"
        ? {
            backgroundImage: `radial-gradient(${colores.borde} 2px, transparent 2px)`,
            backgroundSize: "48px 48px",
            backgroundPosition: `${(t * 8) % 48}px 0`,
          }
        : {};
  return (
    <AbsoluteFill style={{ background: colores.fondo }}>
      <AbsoluteFill style={{ ...patron, maskImage: vineta ? "radial-gradient(ellipse at 50% 45%, black 25%, transparent 75%)" : undefined }} />
    </AbsoluteFill>
  );
};
