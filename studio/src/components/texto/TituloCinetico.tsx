import { AbsoluteFill } from "remotion";
import { useEntrada, useSalida } from "../../lib/animacion";
import { colores, tipografia } from "../../lib/estilo";
import { useIntensidad } from "../../lib/intensidad";
import { ALTO, ZONA_SEGURA } from "../../lib/formato";

type Props = {
  texto: string;
  // subir: cada palabra sube y aparece · escala: crece desde pequeña · mascara: sale de detrás de una línea invisible.
  variante?: "subir" | "escala" | "mascara";
  // Palabras (tal cual aparecen en `texto`) que van en color de acento.
  resaltar?: string[];
  tamano?: number;
  centroY?: number;
  mayusculas?: boolean;
  escalonado?: number;
};

// Título que entra palabra por palabra. El componente base para ganchos y frases clave.
export const TituloCinetico: React.FC<Props> = ({
  texto,
  variante = "subir",
  resaltar = [],
  tamano = 120,
  centroY = ALTO * 0.45,
  mayusculas = true,
  escalonado,
}) => {
  const salida = useSalida();
  const perfil = useIntensidad();
  const palabras = texto.split(/\s+/).filter(Boolean);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: centroY,
          left: ZONA_SEGURA.derecha * 0.6,
          right: ZONA_SEGURA.derecha * 0.6,
          transform: "translateY(-50%)",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          columnGap: tamano * 0.25,
          rowGap: tamano * 0.02,
          opacity: salida,
        }}
      >
        {palabras.map((palabra, i) => (
          <Palabra
            key={`${palabra}-${i}`}
            texto={mayusculas ? palabra.toUpperCase() : palabra}
            retraso={i * (escalonado ?? perfil.escalonado)}
            variante={variante}
            tamano={tamano}
            color={resaltar.includes(palabra) ? colores.acento : colores.texto}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};

const Palabra: React.FC<{ texto: string; retraso: number; variante: Props["variante"]; tamano: number; color: string }> = ({
  texto,
  retraso,
  variante,
  tamano,
  color,
}) => {
  const p = useEntrada(retraso, variante === "escala" ? "pop" : "normal");
  const estiloTexto: React.CSSProperties = {
    display: "inline-block",
    fontFamily: tipografia.titulo,
    fontWeight: tipografia.tituloPeso,
    fontSize: tamano,
    lineHeight: 1.02,
    letterSpacing: "-0.02em",
    color,
  };
  if (variante === "mascara") {
    return (
      <span style={{ display: "inline-block", overflow: "hidden", paddingBottom: tamano * 0.08 }}>
        <span style={{ ...estiloTexto, transform: `translateY(${(1 - p) * 110}%)` }}>{texto}</span>
      </span>
    );
  }
  const transform = variante === "escala" ? `scale(${0.4 + p * 0.6})` : `translateY(${(1 - p) * tamano * 0.7}px)`;
  return <span style={{ ...estiloTexto, opacity: Math.min(1, p * 1.5), transform }}>{texto}</span>;
};
