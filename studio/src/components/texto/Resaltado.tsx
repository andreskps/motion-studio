import { AbsoluteFill } from "remotion";
import { useEntrada, useSalida } from "../../lib/animacion";
import { colores, tipografia } from "../../lib/estilo";
import { ALTO, ZONA_SEGURA } from "../../lib/formato";

type Props = {
  texto: string;
  // Palabras que reciben el marcador (tal cual aparecen en `texto`).
  clave: string[];
  tamano?: number;
  centroY?: number;
  colorMarcador?: string;
  // Frame (relativo a la secuencia) en que empieza a barrer el marcador.
  retrasoMarcador?: number;
};

// Frase con un marcador que barre por detrás de las palabras clave, como un subrayador.
export const Resaltado: React.FC<Props> = ({
  texto,
  clave,
  tamano = 96,
  centroY = ALTO * 0.45,
  colorMarcador = colores.acento,
  retrasoMarcador = 10,
}) => {
  const entrada = useEntrada(0, "suave");
  const marcador = useEntrada(retrasoMarcador, "suave");
  const salida = useSalida();
  const palabras = texto.split(/\s+/).filter(Boolean);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: centroY,
          left: ZONA_SEGURA.derecha * 0.6,
          right: ZONA_SEGURA.derecha * 0.6,
          transform: `translateY(calc(-50% + ${(1 - entrada) * 40}px))`,
          opacity: entrada * salida,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          columnGap: tamano * 0.25,
          rowGap: tamano * 0.12,
          fontFamily: tipografia.titulo,
          fontWeight: tipografia.tituloPeso,
          fontSize: tamano,
          lineHeight: 1.05,
          textTransform: "uppercase",
        }}
      >
        {palabras.map((palabra, i) => {
          const esClave = clave.includes(palabra);
          return (
            <span key={`${palabra}-${i}`} style={{ position: "relative", display: "inline-block", color: esClave ? colores.fondo : colores.texto }}>
              {esClave ? (
                <span
                  style={{
                    position: "absolute",
                    inset: `-${tamano * 0.04}px -${tamano * 0.12}px`,
                    background: colorMarcador,
                    borderRadius: tamano * 0.1,
                    transform: `scaleX(${marcador}) rotate(-1.5deg)`,
                    transformOrigin: "left center",
                    zIndex: 0,
                  }}
                />
              ) : null}
              <span style={{ position: "relative", zIndex: 1, color: esClave && marcador < 0.3 ? colores.texto : undefined }}>
                {palabra}
              </span>
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
