import { useMemo } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { colores, tipografia } from "../lib/estilo";
import { ALTO, ANCHO, ZONA_SEGURA } from "../lib/formato";
import { curvas, resorte, resortes } from "../lib/motion";
import {
  agruparEnFrases,
  agruparEnPaginas,
  limpiarTexto,
  opcionesPorDefecto,
  type OpcionesPaginas,
  type Palabra,
} from "../lib/subtitulos";

type Props = {
  palabras: Palabra[];
  // frase: la frase se construye palabra por palabra, en sentence case, con las claves en el acento (ADN).
  // pagina: bloques de hasta 3 palabras grandes con la palabra activa resaltada (estilo reel clásico).
  modo?: "frase" | "pagina";
  // Solo modo frase: arriba (bajo la zona del HUD, alineada a la izquierda) o abajo (tercio inferior, centrada).
  posicion?: "arriba" | "abajo";
  tamano?: number;
  opciones?: OpcionesPaginas;
  centroY?: number;
  mayusculas?: boolean;
};

export const Subtitulos: React.FC<Props> = ({ modo = "frase", ...props }) =>
  modo === "frase" ? <SubtitulosFrase {...props} /> : <SubtitulosPagina {...props} />;

const largoTexto = (ps: Palabra[]) => ps.reduce((n, p) => n + p.texto.length, 0) + Math.max(0, ps.length - 1);

// NUNCA más de 2 líneas (decisión del usuario): si la frase cabe, una línea; si no, el único corte que deja las dos
// líneas lo más parejas posible. Es imposible que salga una tercera línea por construcción.
const partirEnLineas = (palabras: Palabra[], maxPorLinea: number): Palabra[][] => {
  if (palabras.length < 2 || largoTexto(palabras) <= maxPorLinea) return [palabras];
  let mejor = 1;
  let mejorLargo = Infinity;
  for (let corte = 1; corte < palabras.length; corte++) {
    const largo = Math.max(largoTexto(palabras.slice(0, corte)), largoTexto(palabras.slice(corte)));
    if (largo < mejorLargo) {
      mejorLargo = largo;
      mejor = corte;
    }
  }
  return [palabras.slice(0, mejor), palabras.slice(mejor)];
};

// Ancho medio de un carácter de Inter en em (con espacios): para reducir la letra si una línea no cabe.
const EM_POR_CARACTER = 0.53;

// Abajo por defecto: decisión del usuario en el ADN (sección 12).
const SubtitulosFrase: React.FC<Omit<Props, "modo">> = ({ palabras, posicion = "abajo", tamano = 50 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  // Abajo el ancho útil es menor (márgenes simétricos de la zona segura): frases más cortas para no pasar de 2 líneas.
  const maxCaracteres = posicion === "abajo" ? 48 : 62;
  const bloques = useMemo(() => agruparEnFrases(palabras, maxCaracteres), [palabras, maxCaracteres]);
  const bloque = bloques.find((b) => t >= b.inicio && t < b.fin);
  if (!bloque) return null;

  const arriba = posicion === "arriba";
  // La frase sale suave al terminar su tiempo (salvo que la siguiente empiece enseguida).
  const salida = interpolate(t, [bloque.fin - 0.2, bloque.fin], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const maxPorLinea = Math.ceil(maxCaracteres / 1.85);
  const lineas = partirEnLineas(bloque.palabras, maxPorLinea);
  // Si la línea más larga no cabe en el ancho seguro, se reduce la letra (nunca se parte en una tercera línea).
  const anchoUtil = arriba ? ANCHO - 72 - ZONA_SEGURA.derecha : ANCHO - 2 * ZONA_SEGURA.derecha;
  const masLarga = Math.max(...lineas.map(largoTexto));
  const tamanoFinal = Math.min(tamano, anchoUtil / (masLarga * EM_POR_CARACTER));
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          ...(arriba ? { top: ZONA_SEGURA.arriba + 10 } : { top: ALTO * 0.72, transform: "translateY(-50%)" }),
          // Abajo: márgenes simétricos para quedar centrado en el cuadro y lejos de los botones de la derecha.
          left: arriba ? 72 : ZONA_SEGURA.derecha,
          right: ZONA_SEGURA.derecha,
          textAlign: arriba ? "left" : "center",
          fontFamily: tipografia.cuerpo,
          fontWeight: tipografia.cuerpoPeso,
          fontSize: tamanoFinal,
          lineHeight: 1.25,
          color: colores.texto,
          opacity: salida,
        }}
      >
        {/* Cada línea es un bloque del ancho de su texto completo, centrado (o a la izquierda arriba), con las
            palabras alineadas a la izquierda dentro: la frase crece sin saltos y el conjunto queda centrado. */}
        {lineas.map((linea, l) => (
          <div key={l}>
            <span style={{ display: "inline-block", textAlign: "left", whiteSpace: "nowrap" }}>
              {linea.map((palabra, i) => {
                // Las palabras que aún no se dicen ocupan su sitio (invisibles) para que la línea no salte al crecer.
                const entrada = interpolate(t, [palabra.inicio - 0.04, palabra.inicio + 0.12], [0, 1], {
                  easing: curvas.salida,
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                });
                return (
                  <span
                    key={`${palabra.inicio}-${i}`}
                    style={{
                      display: "inline-block",
                      marginRight: i < linea.length - 1 ? "0.26em" : 0,
                      opacity: entrada,
                      transform: `translateY(${(1 - entrada) * 8}px)`,
                      color: palabra.clave ? colores.acento : colores.texto,
                      fontWeight: palabra.clave ? tipografia.cuerpoPesoFuerte : undefined,
                    }}
                  >
                    {palabra.texto}
                  </span>
                );
              })}
            </span>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const SubtitulosPagina: React.FC<Omit<Props, "modo">> = ({
  palabras,
  opciones = opcionesPorDefecto,
  centroY = ALTO * 0.66,
  tamano = 92,
  mayusculas = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const paginas = useMemo(() => agruparEnPaginas(palabras, opciones), [palabras, opciones]);
  const pagina = paginas.find((p) => t >= p.inicio && t < p.fin);
  if (!pagina) return null;

  const entradaPagina = resorte(frame, fps, resortes.rapido, Math.round(pagina.inicio * fps));

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: centroY,
          // Márgenes simétricos: centrado en el cuadro y lejos de los botones de la derecha.
          left: ZONA_SEGURA.derecha,
          right: ZONA_SEGURA.derecha,
          transform: `translateY(-50%) scale(${0.92 + entradaPagina * 0.08})`,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          columnGap: tamano * 0.28,
          rowGap: tamano * 0.05,
          fontFamily: tipografia.titulo,
          fontWeight: tipografia.tituloPeso,
          fontSize: tamano,
          lineHeight: 1.05,
          textAlign: "center",
          textTransform: mayusculas ? "uppercase" : "none",
        }}
      >
        {pagina.palabras.map((palabra, i) => {
          const siguiente = pagina.palabras[i + 1];
          const activa = t >= palabra.inicio && (siguiente ? t < siguiente.inicio : t < pagina.fin);
          const pop = resorte(frame, fps, resortes.rebote, Math.round(palabra.inicio * fps));
          return (
            <span
              key={`${palabra.inicio}-${i}`}
              style={{
                display: "inline-block",
                color: activa || palabra.clave ? colores.acento : colores.texto,
                transform: `scale(${activa ? 1 + pop * 0.08 : 1})`,
                WebkitTextStroke: `${tamano * 0.14}px ${colores.fondo}`,
                paintOrder: "stroke fill",
              }}
            >
              {limpiarTexto(palabra.texto)}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
