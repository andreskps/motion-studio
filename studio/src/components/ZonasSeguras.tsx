import { AbsoluteFill } from "remotion";
import { ZONA_SEGURA } from "../lib/formato";

const franja = "rgba(255, 0, 80, 0.28)";

// Superpone las zonas que tapa la interfaz de las apps. Solo para revisar,
// nunca debe quedar activa en el render final.
export const ZonasSeguras: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: ZONA_SEGURA.arriba, background: franja }} />
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: ZONA_SEGURA.abajo, background: franja }} />
    <div style={{ position: "absolute", top: ZONA_SEGURA.arriba, bottom: ZONA_SEGURA.abajo, left: 0, width: ZONA_SEGURA.izquierda, background: franja }} />
    <div style={{ position: "absolute", top: ZONA_SEGURA.arriba, bottom: ZONA_SEGURA.abajo, right: 0, width: ZONA_SEGURA.derecha, background: franja }} />
  </AbsoluteFill>
);
