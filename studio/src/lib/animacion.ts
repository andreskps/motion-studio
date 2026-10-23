import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { PERFILES, useIntensidad } from "./intensidad";
import { progreso } from "./presets";

// Convención de los componentes: animan desde el frame 0 de su <Sequence> (o desde `retraso`) y salen en sus
// últimos frames. Duraciones y curvas salen de la intensidad activa (<Intensidad>, ADN §8).

// Tipo de entrada: normal (curva de la intensidad) · suave (más lenta, para fondos y grandes bloques)
// · pop (para elementos pequeños como ✓ o píldoras: llega un poco más rápido y con el leve rebote de impacto).
export type TipoEntrada = "normal" | "suave" | "pop";

// 0 → 1 empezando `retraso` frames después del inicio de la secuencia.
export const useEntrada = (retraso = 0, tipo: TipoEntrada = "normal") => {
  const frame = useCurrentFrame();
  const perfil = useIntensidad();
  if (tipo === "suave") return progreso(frame, retraso, Math.round(perfil.entrada * 1.6), perfil.curvaEntrada);
  if (tipo === "pop") return progreso(frame, retraso, Math.max(5, Math.round(perfil.entrada * 0.8)), PERFILES.impacto.curvaEntrada);
  return progreso(frame, retraso, perfil.entrada, perfil.curvaEntrada);
};

// 1 → 0 en los últimos frames de la secuencia (por defecto, la duración de salida de la intensidad).
export const useSalida = (frames?: number) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const perfil = useIntensidad();
  const n = frames ?? perfil.salida;
  return interpolate(frame, [durationInFrames - n, durationInFrames], [1, 0], {
    easing: perfil.curvaSalida,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
};

// Progreso lineal 0 → 1 de toda la secuencia (para movimientos lentos como Ken Burns).
export const useProgreso = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return Math.min(1, Math.max(0, frame / Math.max(1, durationInFrames - 1)));
};

// Formato español: 1.200 y 3,5. Se hace a mano porque es-ES no agrupa los números de 4 cifras.
export const formatoNumero = (valor: number, decimales = 0) => {
  const [entero, fraccion] = Math.abs(valor).toFixed(decimales).split(".");
  const agrupado = entero.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${valor < 0 ? "-" : ""}${agrupado}${fraccion ? `,${fraccion}` : ""}`;
};
