import { colores, tipografia } from "../../lib/estilo";
import { useEn, type Momento } from "../../lib/lienzo";
import { useAnimacion } from "../../lib/presets";

type Props = {
  // Texto con las palabras clave entre *asteriscos*: "Posting *no es* un funnel".
  texto: string;
  // Momento(s) en que barre el resaltador: uno para todas las claves o uno por cada clave, en orden.
  en: Momento | Momento[];
  tamano?: number;
  // titulo: Plus Jakarta 800 en mayúsculas (titulares) · cuerpo: Inter (frases de apoyo).
  fuente?: "titulo" | "cuerpo";
  ancho?: number;
  alineacion?: "center" | "left";
};

// Resaltador sobre las palabras clave (ADN §9, el gesto de saasyass en el acento): una caja del acento barre por detrás y la
// palabra pasa al color del fondo sobre el acento.
export const TextoMarcado: React.FC<Props> = ({ texto, en, tamano = 90, fuente = "titulo", ancho, alineacion = "center" }) => {
  const a = useAnimacion();
  const resolver = useEn();
  const momentos = (Array.isArray(en) ? en : [en]).map(resolver);
  const partes = texto.split(/(\*[^*]+\*)/).filter(Boolean);
  let indiceClave = 0;
  return (
    <div
      style={{
        width: ancho,
        textAlign: alineacion,
        fontFamily: fuente === "titulo" ? tipografia.titulo : tipografia.cuerpo,
        fontWeight: fuente === "titulo" ? tipografia.tituloPeso : tipografia.cuerpoPesoFuerte,
        fontSize: tamano,
        lineHeight: 1.18,
        color: colores.texto,
        textTransform: fuente === "titulo" ? "uppercase" : "none",
      }}
    >
      {partes.map((parte, i) => {
        if (!parte.startsWith("*")) return <span key={i}>{parte}</span>;
        const f = momentos[Math.min(indiceClave++, momentos.length - 1)];
        const p = a.dibujar({ en: f, duracion: Math.round(a.perfil.dibujo * 0.8) });
        return (
          <span key={i} style={{ position: "relative", display: "inline-block", whiteSpace: "nowrap", padding: `0 ${tamano * 0.12}px` }}>
            <span
              style={{
                position: "absolute",
                inset: `${tamano * 0.04}px 0`,
                background: colores.acento,
                borderRadius: tamano * 0.08,
                transform: `scaleX(${p})`,
                transformOrigin: "left center",
              }}
            />
            <span style={{ position: "relative", color: p > 0.5 ? colores.fondo : colores.texto }}>{parte.slice(1, -1)}</span>
          </span>
        );
      })}
    </div>
  );
};
