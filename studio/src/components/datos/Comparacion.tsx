import { AbsoluteFill } from "remotion";
import { useEntrada, useSalida } from "../../lib/animacion";
import { colores, estiloEtiqueta, forma, tipografia } from "../../lib/estilo";
import { ALTO, ZONA_SEGURA } from "../../lib/formato";

type Lado = { titulo: string; valor: string; detalle?: string };

type Props = {
  arriba: Lado;
  abajo: Lado;
  // Qué lado gana: se resalta con el acento y crece un poco.
  ganador?: "arriba" | "abajo";
  centroY?: number;
};

// Dos tarjetas enfrentadas con un "VS" en medio. Para "antes / después", "marca A / marca B", "mito / realidad".
export const Comparacion: React.FC<Props> = ({ arriba, abajo, ganador, centroY = ALTO * 0.47 }) => {
  const vs = useEntrada(10, "pop");
  const resalte = useEntrada(26, "suave");
  const salida = useSalida();
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: salida }}>
      <div
        style={{
          position: "absolute",
          top: centroY,
          left: ZONA_SEGURA.derecha * 0.6,
          right: ZONA_SEGURA.derecha * 0.6,
          transform: "translateY(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          gap: 70,
        }}
      >
        <Tarjeta lado={arriba} retraso={0} desdeX={-1} destacada={ganador === "arriba"} resalte={resalte} />
        <Tarjeta lado={abajo} retraso={6} desdeX={1} destacada={ganador === "abajo"} resalte={resalte} />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: `translate(-50%, -50%) scale(${vs}) rotate(${(1 - vs) * 90}deg)`,
            width: 130,
            height: 130,
            borderRadius: "50%",
            background: colores.superficie2,
            border: `2px solid ${colores.borde}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: tipografia.titulo,
            fontWeight: tipografia.tituloPeso,
            fontSize: 54,
            color: colores.texto,
            boxShadow: forma.sombra,
          }}
        >
          VS
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Tarjeta: React.FC<{ lado: Lado; retraso: number; desdeX: number; destacada: boolean; resalte: number }> = ({
  lado,
  retraso,
  desdeX,
  destacada,
  resalte,
}) => {
  const p = useEntrada(retraso);
  const r = destacada ? resalte : 0;
  return (
    <div
      style={{
        padding: "44px 48px",
        borderRadius: forma.radio,
        background: colores.superficie,
        border: `${destacada && r > 0.05 ? 4 : 2}px solid ${destacada && r > 0.05 ? colores.acento : colores.borde}`,
        boxShadow: forma.sombra,
        opacity: p,
        transform: `translateX(${(1 - p) * desdeX * 200}px) scale(${1 + r * 0.05})`,
        textAlign: "center",
      }}
    >
      <div style={estiloEtiqueta(32)}>{lado.titulo}</div>
      <div
        style={{
          fontFamily: tipografia.titulo,
          fontWeight: tipografia.tituloPeso,
          fontSize: 120,
          lineHeight: 1.05,
          color: destacada && r > 0.05 ? colores.acento : colores.texto,
        }}
      >
        {lado.valor}
      </div>
      {lado.detalle ? (
        <div style={{ fontFamily: tipografia.cuerpo, fontWeight: tipografia.cuerpoPeso, fontSize: 40, color: colores.texto, opacity: 0.8 }}>{lado.detalle}</div>
      ) : null}
    </div>
  );
};
