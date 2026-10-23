import { colores, tipografia } from "../../lib/estilo";
import { useEn, type Momento } from "../../lib/lienzo";
import { combinar, useAnimacion } from "../../lib/presets";

type Props = {
  texto: string;
  // Texto correcto que sustituye al tachado (mito → realidad). Sin él, solo se tacha.
  reemplazo?: string;
  // Momento del tachado: la palabra de la voz que corrige.
  en: Momento;
  // Momento en que aparece el reemplazo (por defecto, poco después del tachado).
  reemplazoEn?: Momento;
  // encima: el reemplazo ocupa el mismo sitio · debajo: aparece debajo y el tachado queda atenuado.
  posicion?: "encima" | "debajo";
  tamano?: number;
  fuente?: "titulo" | "cuerpo";
};

// Tachar y reemplazar (ADN §9): una línea tacha lo viejo y lo correcto toma su lugar.
export const Tachar: React.FC<Props> = ({ texto, reemplazo, en, reemplazoEn, posicion = "encima", tamano = 110, fuente = "titulo" }) => {
  const a = useAnimacion();
  const resolver = useEn();
  const fTachado = resolver(en);
  const linea = a.dibujar({ en: fTachado, duracion: Math.round(a.perfil.dibujo * 0.7) });
  const fReemplazo = reemplazoEn === undefined ? fTachado + Math.round(a.perfil.dibujo * 0.8) : resolver(reemplazoEn);
  const estiloTexto: React.CSSProperties = {
    fontFamily: fuente === "titulo" ? tipografia.titulo : tipografia.cuerpo,
    fontWeight: fuente === "titulo" ? tipografia.tituloPeso : tipografia.cuerpoPesoFuerte,
    fontSize: tamano,
    lineHeight: 1.05,
    whiteSpace: "nowrap",
    textTransform: fuente === "titulo" ? "uppercase" : "none",
  };
  const viejo = (
    <span style={{ position: "relative", display: "inline-block", color: linea > 0.5 ? colores.tenue : colores.texto }}>
      {texto}
      <span
        style={{
          position: "absolute",
          left: -tamano * 0.06,
          right: -tamano * 0.06,
          top: "54%",
          height: Math.max(4, tamano * 0.07),
          background: colores.texto,
          borderRadius: 4,
          transform: `scaleX(${linea})`,
          transformOrigin: "left center",
        }}
      />
    </span>
  );
  if (!reemplazo) return <span style={estiloTexto}>{viejo}</span>;

  if (posicion === "debajo") {
    const entra = a.entrar({ en: fReemplazo });
    return (
      <div style={{ ...estiloTexto, display: "flex", flexDirection: "column", alignItems: "center", gap: tamano * 0.15 }}>
        {viejo}
        <span style={{ display: "inline-block", color: colores.acento, ...entra }}>{reemplazo}</span>
      </div>
    );
  }
  const { saliente, entrante } = a.reemplazar({ en: fReemplazo });
  return (
    <div style={{ ...estiloTexto, display: "grid", placeItems: "center" }}>
      <span style={{ gridArea: "1 / 1", ...combinar(saliente) }}>{viejo}</span>
      <span style={{ gridArea: "1 / 1", color: colores.acento, ...combinar(entrante) }}>{reemplazo}</span>
    </div>
  );
};
