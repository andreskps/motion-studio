import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { ZonasSeguras } from "../components/ZonasSeguras";
import { ZONA_SEGURA, segundos } from "../lib/formato";
import { colores, tipografia } from "../lib/estilo";
import { curvas, resorte, resortes } from "../lib/motion";

export type PruebaProps = {
  mostrarZonas: boolean;
};

const PALABRAS = ["ESTUDIO", "MOTION", "FASE 0"];

// Composición de humo: comprueba que formato, tokens, curvas y render funcionan.
export const Prueba: React.FC<PruebaProps> = ({ mostrarZonas }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const progreso = interpolate(frame, [segundos(0.6), durationInFrames - segundos(0.8)], [0, 1], {
    easing: curvas.suave,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const salida = interpolate(frame, [durationInFrames - segundos(0.5), durationInFrames], [1, 0], {
    easing: curvas.entrada,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: colores.fondo }}>
      <AbsoluteFill
        style={{
          paddingTop: ZONA_SEGURA.arriba,
          paddingBottom: ZONA_SEGURA.abajo,
          paddingLeft: ZONA_SEGURA.izquierda,
          paddingRight: ZONA_SEGURA.derecha,
          justifyContent: "center",
          opacity: salida,
        }}
      >
        {PALABRAS.map((palabra, i) => {
          const p = resorte(frame, fps, i === 2 ? resortes.rebote : resortes.rapido, i * 6);
          return (
            <div
              key={palabra}
              style={{
                fontFamily: tipografia.titulo,
                fontWeight: tipografia.tituloPeso,
                fontSize: i === 2 ? 150 : 132,
                lineHeight: 1,
                color: i === 2 ? colores.acento : colores.texto,
                transform: `translateY(${(1 - p) * 120}px) scale(${0.85 + p * 0.15})`,
                opacity: p,
              }}
            >
              {palabra}
            </div>
          );
        })}

        <div style={{ marginTop: 60, height: 14, width: "100%", background: colores.superficie2, borderRadius: 7, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${progreso * 100}%`, background: colores.acento, borderRadius: 7 }} />
        </div>
        <div style={{ marginTop: 20, fontFamily: tipografia.cuerpo, fontSize: 44, fontWeight: tipografia.cuerpoPeso, color: colores.suave }}>
          {Math.round(progreso * 100)}% listo
        </div>
      </AbsoluteFill>

      {mostrarZonas ? <ZonasSeguras /> : null}
    </AbsoluteFill>
  );
};
