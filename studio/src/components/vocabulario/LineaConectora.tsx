import { colores, forma } from "../../lib/estilo";
import { useEn, type Momento } from "../../lib/lienzo";
import { useAnimacion } from "../../lib/presets";
import type { Punto } from "../../lib/composiciones";

type Props = {
  desde: Punto;
  hasta: Punto;
  en: Momento;
  // 0 = recta; positivo o negativo = curva hacia un lado (en px de flecha de la curva).
  curva?: number;
  flecha?: boolean;
  // El conector es una idea clave (ADN): acento por defecto; neutro en `borde`.
  tono?: "acento" | "neutro";
  punteada?: boolean;
  grosor?: number;
  // Momento en que se atenúa (deja de ser foco).
  atenuarEn?: Momento;
  // Momento en que desaparece (su escena terminó).
  saleEn?: Momento;
};

// Conectar (ADN §9): una línea o flecha que se dibuja de A a B en coordenadas del mundo. Hija directa de <Lienzo>.
export const LineaConectora: React.FC<Props> = ({ desde, hasta, en, curva = 0, flecha = true, tono = "acento", punteada = false, grosor = forma.trazo, atenuarEn, saleEn }) => {
  const a = useAnimacion();
  const resolver = useEn();
  const p = a.dibujar({ en: resolver(en) });
  if (p <= 0) return null;
  const salida = saleEn === undefined ? 1 : a.salir({ en: resolver(saleEn), direccion: "ninguna" }).opacity;
  if (salida <= 0) return null;
  const opacidad = (atenuarEn === undefined ? 1 : a.atenuar({ en: resolver(atenuarEn) })) * salida;

  // Punto de control perpendicular al centro del segmento.
  const mx = (desde.x + hasta.x) / 2;
  const my = (desde.y + hasta.y) / 2;
  const dx = hasta.x - desde.x;
  const dy = hasta.y - desde.y;
  const largo = Math.hypot(dx, dy) || 1;
  const cx = mx + (-dy / largo) * curva;
  const cy = my + (dx / largo) * curva;
  const d = `M${desde.x} ${desde.y}Q${cx} ${cy} ${hasta.x} ${hasta.y}`;

  // Dirección final de la curva para orientar la punta.
  const angulo = Math.atan2(hasta.y - cy, hasta.x - cx);
  const punta = 18 + grosor * 2;
  const p1 = { x: hasta.x - punta * Math.cos(angulo - 0.45), y: hasta.y - punta * Math.sin(angulo - 0.45) };
  const p2 = { x: hasta.x - punta * Math.cos(angulo + 0.45), y: hasta.y - punta * Math.sin(angulo + 0.45) };
  const color = tono === "acento" ? colores.acento : colores.borde;

  return (
    <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none", opacity: opacidad }} width={1} height={1}>
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={grosor}
        strokeLinecap="round"
        pathLength={1}
        // La punteada no puede "dibujarse" con el truco del dash (ya lo usa para los puntos): aparece con opacidad.
        strokeDasharray={punteada ? "0.012 0.012" : 1}
        strokeDashoffset={punteada ? 0 : 1 - p}
        opacity={punteada ? p : 1}
      />
      {flecha && p > 0.92 ? (
        <path d={`M${p1.x} ${p1.y}L${hasta.x} ${hasta.y}L${p2.x} ${p2.y}`} fill="none" stroke={color} strokeWidth={grosor} strokeLinecap="round" strokeLinejoin="round" opacity={(p - 0.92) / 0.08} />
      ) : null}
    </svg>
  );
};
