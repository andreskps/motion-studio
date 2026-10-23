import { colores, estiloEtiqueta, forma, tipografia } from "../lib/estilo";
import { Intensidad } from "../lib/intensidad";
import { Elemento, Lienzo } from "../lib/lienzo";

// Banco de pruebas del lienzo persistente (sin voz, con frames): transformación, atenuado, cámara, corte y paneo.

const Tarjeta: React.FC<{ titulo: string; llenos: number }> = ({ titulo, llenos }) => (
  <div style={{ width: 560, padding: 40, borderRadius: forma.radio, background: colores.superficie, border: `3px solid ${colores.borde}` }}>
    <div style={{ ...estiloEtiqueta(28), marginBottom: 24 }}>{titulo}</div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 18 }}>
      {Array.from({ length: 10 }, (_, i) => (
        <div
          key={i}
          style={{ aspectRatio: "1", borderRadius: "50%", border: `3px solid ${i < llenos ? colores.acento : colores.borde}`, background: i < llenos ? colores.acento : "transparent" }}
        />
      ))}
    </div>
  </div>
);

const Movil: React.FC = () => (
  <div style={{ width: 300, height: 600, borderRadius: 48, border: `4px solid ${colores.texto}`, background: colores.superficie, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24 }}>
    <div style={{ ...estiloEtiqueta(24, colores.acento) }}>Raspa y gana</div>
    <div style={{ fontFamily: tipografia.titulo, fontWeight: tipografia.tituloPeso, fontSize: 64, color: colores.acento, textAlign: "center", lineHeight: 1 }}>Café gratis</div>
  </div>
);

const Persona: React.FC<{ etiqueta: string }> = ({ etiqueta }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
    <svg width={160} height={260} viewBox="0 0 80 130" fill="none" stroke={colores.texto} strokeWidth={4} strokeLinecap="round">
      <circle cx={40} cy={18} r={14} />
      <path d="M40 34 V82 M40 46 L16 66 M40 46 L64 66 M40 82 L22 124 M40 82 L58 124" />
    </svg>
    <div style={estiloEtiqueta(26)}>{etiqueta}</div>
  </div>
);

const Cifra: React.FC<{ texto: string; etiqueta: string }> = ({ texto, etiqueta }) => (
  <div style={{ textAlign: "center" }}>
    <div style={{ ...estiloEtiqueta(30), marginBottom: 12 }}>{etiqueta}</div>
    <div style={{ fontFamily: tipografia.titulo, fontWeight: tipografia.tituloPeso, fontSize: 220, color: colores.acento, lineHeight: 1 }}>{texto}</div>
  </div>
);

export const PruebaLienzo: React.FC = () => (
  <Intensidad modo="dinamico">
    <Lienzo
      camara={[
        { en: 70, escala: 0.85, y: 900 },
        { en: 120, objetivo: "cliente", escala: 1.5 },
        { en: 150, corte: true, x: 540, y: 960, escala: 1 },
        { en: 240, x: 1900, y: 960, escala: 1 },
      ]}
    >
      <Elemento
        id="tarjeta"
        x={540}
        y={900}
        entra={{ en: 6, direccion: "escala" }}
        estados={[
          { en: 30, contenido: <Tarjeta titulo="Tarjeta de sellos" llenos={7} /> },
          { en: 55, y: 760, contenido: <Movil /> },
          { en: 95, atenuado: true },
        ]}
        sale={{ en: 150, corte: true }}
      >
        <Tarjeta titulo="Tarjeta de sellos" llenos={2} />
      </Elemento>
      <Elemento id="cliente" x={900} y={1000} ancho={260} alto={320} entra={{ en: 72, direccion: "izquierda" }} sale={{ en: 150, corte: true }}>
        <Persona etiqueta="Cliente" />
      </Elemento>
      <Elemento id="cifra" x={540} y={900} entra={{ en: 150, corte: true }} estados={[{ en: 200, escala: 0.6, y: 700, modo: "editorial" }]}>
        <Cifra texto="3×" etiqueta="Vuelven" />
      </Elemento>
      <Elemento id="detalle" x={1900} y={960} entra={{ en: 225, direccion: "escala" }}>
        <Cifra texto="+42%" etiqueta="Retención" />
      </Elemento>
    </Lienzo>
  </Intensidad>
);
