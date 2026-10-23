import { Easing, spring, type SpringConfig } from "remotion";

// Curvas de easing del estudio. Cuando salga el ADN visual (Fase 3),
// estas curvas se ajustan a cómo se mueven tus referencias.
export const curvas = {
  salida: Easing.bezier(0.16, 1, 0.3, 1),
  entrada: Easing.bezier(0.7, 0, 0.84, 0),
  suave: Easing.bezier(0.45, 0, 0.55, 1),
};

export const resortes = {
  rapido: { damping: 14, stiffness: 180, mass: 0.6 },
  rebote: { damping: 9, stiffness: 160, mass: 0.7 },
  firme: { damping: 200, stiffness: 120, mass: 1 },
} satisfies Record<string, Partial<SpringConfig>>;

export const resorte = (
  frame: number,
  fps: number,
  config: Partial<SpringConfig> = resortes.rapido,
  retraso = 0,
) => spring({ frame: frame - retraso, fps, config });
