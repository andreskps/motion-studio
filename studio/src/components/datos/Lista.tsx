import { AbsoluteFill } from "remotion";
import { useEntrada, useSalida } from "../../lib/animacion";
import { colores, forma, tipografia } from "../../lib/estilo";
import { ALTO, ZONA_SEGURA } from "../../lib/formato";

type Props = {
  items: string[];
  titulo?: string;
  // Frames entre un ítem y el siguiente. Ajústalo para que cada ítem entre cuando la voz lo dice.
  escalonado?: number;
  centroY?: number;
  tamano?: number;
  icono?: "check" | "numero" | "cruz";
};

// Lista que entra ítem por ítem con su marca. Para pasos, consejos o "lo que hay que hacer".
export const Lista: React.FC<Props> = ({ items, titulo, escalonado = 12, centroY = ALTO * 0.47, tamano = 62, icono = "check" }) => {
  const entradaTitulo = useEntrada(0, "suave");
  const salida = useSalida();
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: salida }}>
      <div
        style={{
          position: "absolute",
          top: centroY,
          left: ZONA_SEGURA.izquierda + 40,
          right: ZONA_SEGURA.derecha,
          transform: "translateY(-50%)",
          display: "flex",
          flexDirection: "column",
          gap: tamano * 0.45,
        }}
      >
        {titulo ? (
          <div
            style={{
              fontFamily: tipografia.titulo,
              fontWeight: tipografia.tituloPeso,
              fontSize: tamano * 1.15,
              color: colores.acento,
              textTransform: "uppercase",
              opacity: entradaTitulo,
              transform: `translateY(${(1 - entradaTitulo) * 30}px)`,
              marginBottom: tamano * 0.2,
            }}
          >
            {titulo}
          </div>
        ) : null}
        {items.map((item, i) => (
          <Item key={item} texto={item} indice={i} retraso={(titulo ? 8 : 0) + i * escalonado} tamano={tamano} icono={icono} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

const Item: React.FC<{ texto: string; indice: number; retraso: number; tamano: number; icono: Props["icono"] }> = ({
  texto,
  indice,
  retraso,
  tamano,
  icono,
}) => {
  const p = useEntrada(retraso);
  const marca = useEntrada(retraso + 4, "pop");
  const lado = tamano * 1.1;
  // ✓ en el acento; ✗ en gris tenue (lo negativo se marca por forma, no por un color nuevo).
  const colorMarca = icono === "cruz" ? colores.tenue : colores.acento;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: tamano * 0.4, opacity: p, transform: `translateX(${(1 - p) * -80}px)` }}>
      <div
        style={{
          width: lado,
          height: lado,
          flexShrink: 0,
          borderRadius: forma.radio * 0.5,
          background: colorMarca,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${marca})`,
          fontFamily: tipografia.titulo,
          fontWeight: tipografia.tituloPeso,
          fontSize: tamano * 0.6,
          color: colores.fondo,
        }}
      >
        {icono === "numero" ? (
          indice + 1
        ) : (
          <svg width={lado * 0.55} height={lado * 0.55} viewBox="0 0 24 24" fill="none" stroke={colores.fondo} strokeWidth={4} strokeLinecap="round">
            {icono === "cruz" ? (
              <path d="M6 6 L18 18 M18 6 L6 18" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - marca} />
            ) : (
              <path d="M4 12.5 L9.5 18 L20 6.5" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - marca} />
            )}
          </svg>
        )}
      </div>
      <div style={{ fontFamily: tipografia.cuerpo, fontWeight: tipografia.cuerpoPesoFuerte, fontSize: tamano, lineHeight: 1.1, color: colores.texto }}>{texto}</div>
    </div>
  );
};
