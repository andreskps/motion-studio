import { interpolate } from "remotion";
import { colores, estiloEtiqueta } from "../../lib/estilo";
import { ZONAS } from "../../lib/composiciones";
import { useEn, type Momento } from "../../lib/lienzo";
import { combinar, progreso, useAnimacion } from "../../lib/presets";

type Paso = { nombre: string; en: Momento };

type Props = {
  pasos: Paso[];
  etiqueta?: string;
  // Momento en que el rastreador se va (cuando termina el marco de pasos). Sin él, queda hasta el final.
  hasta?: Momento;
};

// Rastreador de capítulos (ADN §15, de saasyass): "PASO [1][2][3]…" persistente en el HUD; el actual en el acento,
// los ya vistos rellenos en gris, y el nombre del paso actual que se reemplaza al avanzar.
export const RastreadorPasos: React.FC<Props> = ({ pasos, etiqueta = "Paso", hasta }) => {
  const a = useAnimacion();
  const resolver = useEn();
  const momentos = pasos.map((p) => resolver(p.en));
  const entrada = a.entrar({ en: momentos[0], direccion: "abajo", distancia: 20 });
  const aparicion = hasta === undefined ? entrada : combinar(entrada, a.salir({ en: resolver(hasta), direccion: "arriba" }));
  if (aparicion.opacity <= 0) return null;
  const actual = momentos.reduce((idx, m, i) => (a.frame >= m - 3 ? i : idx), 0);
  const cambio = progreso(a.frame, momentos[actual] - 3, a.perfil.entrada, a.perfil.curvaEntrada);
  const lado = 44;
  return (
    <div style={{ position: "absolute", top: ZONAS.hud.y - 50, left: 72, display: "flex", alignItems: "center", gap: 14, ...aparicion }}>
      <span style={estiloEtiqueta(24)}>{etiqueta}</span>
      {pasos.map((_, i) => {
        const esActual = i === actual;
        const visto = i < actual;
        return (
          <div
            key={i}
            style={{
              width: lado,
              height: lado,
              borderRadius: 8,
              border: `2px solid ${esActual ? colores.acento : visto ? colores.tenue : colores.borde}`,
              background: esActual ? colores.acento : visto ? colores.superficieDestacada : "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              ...estiloEtiqueta(24, esActual ? colores.fondo : visto ? colores.suave : colores.tenue),
              letterSpacing: 0,
              transform: esActual ? `scale(${interpolate(cambio, [0, 0.5, 1], [1, 1.15, 1])})` : "none",
            }}
          >
            {i + 1}
          </div>
        );
      })}
      <span
        style={{
          ...estiloEtiqueta(26, colores.texto),
          marginLeft: 10,
          display: "inline-block",
          opacity: cambio,
          transform: `translateY(${(1 - cambio) * 14}px)`,
        }}
      >
        {pasos[actual].nombre}
      </span>
    </div>
  );
};
