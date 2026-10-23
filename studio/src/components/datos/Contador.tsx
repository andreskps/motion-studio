import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { formatoNumero, useEntrada, useSalida } from "../../lib/animacion";
import { colores, tipografia } from "../../lib/estilo";
import { ALTO, ANCHO, ZONA_SEGURA } from "../../lib/formato";
import { useIntensidad } from "../../lib/intensidad";
import { CURVA_CONTEO } from "../../lib/presets";

type Props = {
  hasta: number;
  desde?: number;
  prefijo?: string;
  sufijo?: string;
  decimales?: number;
  // Frames que tarda en llegar al valor final.
  duracion?: number;
  etiqueta?: string;
  tamano?: number;
  centroY?: number;
  color?: string;
};

// Número grande que cuenta hasta su valor y da un pequeño golpe al llegar. Para cifras de impacto.
export const Contador: React.FC<Props> = ({
  hasta,
  desde = 0,
  prefijo = "",
  sufijo = "",
  decimales = 0,
  duracion: duracionProp,
  etiqueta,
  tamano = 230,
  centroY = ALTO * 0.44,
  color = colores.acento,
}) => {
  const frame = useCurrentFrame();
  const perfil = useIntensidad();
  // Sin duración explícita, cuenta al ritmo de la intensidad activa (impacto cuenta más rápido que editorial).
  const duracion = duracionProp ?? perfil.contador;
  const entrada = useEntrada(0);
  const golpe = useEntrada(duracion, "pop");
  const etiquetaEntrada = useEntrada(Math.round(duracion * 0.5), "suave");
  const salida = useSalida();
  // Curva de conteo sin rebote: llega al valor final exactamente al terminar.
  const avance = interpolate(frame, [0, duracion], [0, 1], { easing: CURVA_CONTEO, extrapolateRight: "clamp" });
  const valor = desde + (hasta - desde) * avance;
  // El tamaño se reduce si el número final no cabe en el ancho seguro (~0,68 em por carácter en una fuente gruesa).
  const caracteres = `${prefijo}${formatoNumero(hasta, decimales)}${sufijo}`.length;
  const tamanoNumero = Math.min(tamano, (ANCHO - 2 * ZONA_SEGURA.derecha * 0.6) / (caracteres * 0.68));
  const escala = 0.85 + entrada * 0.15 + (frame >= duracion ? Math.sin(golpe * Math.PI) * (perfil.enfasis - 1) : 0);
  return (
    <AbsoluteFill style={{ alignItems: "center", pointerEvents: "none", opacity: salida }}>
      <div style={{ position: "absolute", top: centroY, transform: "translateY(-50%)", textAlign: "center" }}>
        <div
          style={{
            fontFamily: tipografia.titulo,
            fontWeight: tipografia.tituloPeso,
            fontSize: tamanoNumero,
            lineHeight: 1,
            letterSpacing: "-0.03em",
            color,
            transform: `scale(${escala})`,
            opacity: entrada,
            fontVariantNumeric: "tabular-nums",
            whiteSpace: "nowrap",
          }}
        >
          {prefijo}
          {formatoNumero(valor, decimales)}
          {sufijo}
        </div>
        {etiqueta ? (
          <div
            style={{
              marginTop: tamano * 0.12,
              fontFamily: tipografia.cuerpo,
              fontWeight: tipografia.cuerpoPeso,
              fontSize: tamano * 0.24,
              color: colores.texto,
              opacity: etiquetaEntrada,
              transform: `translateY(${(1 - etiquetaEntrada) * 30}px)`,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            {etiqueta}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
