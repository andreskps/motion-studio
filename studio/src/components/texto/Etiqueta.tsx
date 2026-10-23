import { AbsoluteFill } from "remotion";
import { useEntrada, useSalida } from "../../lib/animacion";
import { colores, estiloEtiqueta } from "../../lib/estilo";
import { ALTO } from "../../lib/formato";

type Props = {
  texto: string;
  icono?: string;
  // destacada: borde y texto del acento sobre acento tenue (la idea clave) · neutra: gris sobre superficie.
  tono?: "destacada" | "neutra";
  centroY?: number;
  tamano?: number;
};

// Píldora técnica en monoespaciada para el contexto de una escena: "DATO", "PASO 2", "≈ 20% MENOS".
export const Etiqueta: React.FC<Props> = ({ texto, icono, tono = "destacada", centroY = ALTO * 0.3, tamano = 30 }) => {
  const p = useEntrada(0);
  const salida = useSalida(6);
  const destacada = tono === "destacada";
  return (
    <AbsoluteFill style={{ alignItems: "center", pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: centroY,
          transform: `translateY(calc(-50% + ${(1 - p) * 16}px))`,
          opacity: p * salida,
          display: "flex",
          alignItems: "center",
          gap: tamano * 0.4,
          padding: `${tamano * 0.45}px ${tamano * 0.8}px`,
          borderRadius: 999,
          background: destacada ? colores.acentoTenue : colores.superficie2,
          border: `2px solid ${destacada ? colores.acento : colores.borde}`,
          ...estiloEtiqueta(tamano, destacada ? colores.acento : colores.suave),
        }}
      >
        {icono ? <span>{icono}</span> : null}
        <span>{texto}</span>
      </div>
    </AbsoluteFill>
  );
};
