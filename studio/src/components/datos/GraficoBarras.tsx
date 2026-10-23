import { AbsoluteFill } from "remotion";
import { formatoNumero, useEntrada, useSalida } from "../../lib/animacion";
import { colores, estiloEtiqueta, tipografia } from "../../lib/estilo";
import { ALTO, ZONA_SEGURA } from "../../lib/formato";

type Dato = { etiqueta: string; valor: number };

type Props = {
  datos: Dato[];
  titulo?: string;
  prefijo?: string;
  sufijo?: string;
  // Índice de la barra que va en color de acento (por defecto, la mayor).
  destacar?: number;
  escalonado?: number;
  centroY?: number;
  alto?: number;
};

// Barras verticales que crecen una tras otra, con su valor contando. Para comparar 2 a 5 cifras.
export const GraficoBarras: React.FC<Props> = ({
  datos,
  titulo,
  prefijo = "",
  sufijo = "",
  destacar,
  escalonado = 6,
  centroY = ALTO * 0.48,
  alto = 720,
}) => {
  const entradaTitulo = useEntrada(0, "suave");
  const salida = useSalida();
  const maximo = Math.max(...datos.map((d) => d.valor));
  const indiceDestacado = destacar ?? datos.findIndex((d) => d.valor === maximo);
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: salida }}>
      <div
        style={{
          position: "absolute",
          top: centroY,
          left: ZONA_SEGURA.derecha * 0.6,
          right: ZONA_SEGURA.derecha * 0.6,
          transform: "translateY(-50%)",
        }}
      >
        {titulo ? (
          <div
            style={{
              fontFamily: tipografia.titulo,
              fontWeight: tipografia.tituloPeso,
              fontSize: 70,
              textAlign: "center",
              color: colores.texto,
              textTransform: "uppercase",
              marginBottom: 50,
              opacity: entradaTitulo,
            }}
          >
            {titulo}
          </div>
        ) : null}
        <div style={{ height: alto, display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 36 }}>
          {datos.map((dato, i) => (
            <Barra
              key={dato.etiqueta}
              dato={dato}
              proporcion={dato.valor / maximo}
              alto={alto - 150}
              retraso={6 + i * escalonado}
              destacada={i === indiceDestacado}
              prefijo={prefijo}
              sufijo={sufijo}
            />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Barra: React.FC<{ dato: Dato; proporcion: number; alto: number; retraso: number; destacada: boolean; prefijo: string; sufijo: string }> = ({
  dato,
  proporcion,
  alto,
  retraso,
  destacada,
  prefijo,
  sufijo,
}) => {
  const p = useEntrada(retraso, "suave");
  // Solo la barra destacada lleva el acento; el resto es superficie con borde (ADN: acento solo en la idea clave).
  const color = destacada ? colores.acento : colores.superficieDestacada;
  return (
    <div style={{ flex: 1, maxWidth: 200, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
      <div style={{ fontFamily: tipografia.titulo, fontWeight: tipografia.tituloPeso, fontSize: 52, color: destacada ? colores.acento : colores.texto, opacity: p }}>
        {prefijo}
        {formatoNumero(dato.valor * p)}
        {sufijo}
      </div>
      <div
        style={{
          width: "100%",
          height: alto * proporcion * p,
          background: color,
          border: destacada ? "none" : `2px solid ${colores.borde}`,
          borderRadius: "14px 14px 4px 4px",
        }}
      />
      <div style={{ ...estiloEtiqueta(28), textAlign: "center" }}>{dato.etiqueta}</div>
    </div>
  );
};
