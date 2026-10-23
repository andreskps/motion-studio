import { linearTiming, springTiming, type TransitionPresentation } from "@remotion/transitions";
import { clockWipe } from "@remotion/transitions/clock-wipe";
import { fade } from "@remotion/transitions/fade";
import { flip } from "@remotion/transitions/flip";
import { iris } from "@remotion/transitions/iris";
import { none } from "@remotion/transitions/none";
import { pushCut } from "@remotion/transitions/push-cut";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { ALTO, ANCHO } from "./formato";
import type { IdSonido } from "./sfx";

// Transiciones del estudio para <TransitionSeries>. Solo las de CSS: las de shader no son fiables en render por CPU.
export type NombreTransicion = "corte" | "golpe" | "deslizar" | "subir" | "barrido" | "fundido" | "iris" | "reloj" | "voltear";

type Transicion = {
  presentation: TransitionPresentation<Record<string, unknown>>;
  timing: ReturnType<typeof linearTiming>;
  // Sonido que le va bien, para ponerlo al inicio de la escena entrante.
  sonido?: IdSonido;
};

const rapido = (frames: number) => springTiming({ config: { damping: 200 }, durationInFrames: frames });

export const transicion = (nombre: NombreTransicion): Transicion => {
  const t = (presentation: unknown, timing: ReturnType<typeof linearTiming>, sonido?: IdSonido): Transicion => ({
    presentation: presentation as TransitionPresentation<Record<string, unknown>>,
    timing,
    sonido,
  });
  switch (nombre) {
    case "corte":
      return t(none(), linearTiming({ durationInFrames: 1 }));
    case "golpe":
      return t(pushCut({ flashColor: "#FFFFFF", flashOpacity: 0.7 }), linearTiming({ durationInFrames: 10 }), "impacto");
    case "deslizar":
      return t(slide({ direction: "from-right" }), rapido(14), "whoosh");
    case "subir":
      return t(slide({ direction: "from-bottom" }), rapido(14), "swish");
    case "barrido":
      return t(wipe({ direction: "from-left" }), rapido(16), "whoosh");
    case "fundido":
      return t(fade(), linearTiming({ durationInFrames: 12 }));
    case "iris":
      return t(iris({ width: ANCHO, height: ALTO }), rapido(18), "succion");
    case "reloj":
      return t(clockWipe({ width: ANCHO, height: ALTO }), rapido(18), "whoosh");
    case "voltear":
      return t(flip({ direction: "from-right" }), rapido(18), "swish");
  }
};
