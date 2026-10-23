import { useCurrentFrame } from "remotion";
import { colores } from "../../lib/estilo";
import { useEn, type Momento } from "../../lib/lienzo";
import { progreso } from "../../lib/presets";
import { useIntensidad } from "../../lib/intensidad";
import { IconoTrazo } from "./IconoTrazo";
import type { NombreIcono } from "./iconos";

type Resalte = {
  en: Momento;
  // Cuántos (los primeros) o cuáles (índices) se resaltan en el acento.
  cantidad?: number;
  indices?: number[];
  // El resto se atenúa al resaltar (foco).
  atenuarResto?: boolean;
};

type Props = {
  cantidad: number;
  columnas: number;
  // punto (texturas grandes: 100–1.000) o un icono de trazo (cantidades pequeñas: hasta ~40).
  forma?: "punto" | NombreIcono;
  celda?: number;
  separacion?: number;
  en: Momento;
  // Frames que tarda en aparecer toda la rejilla (por defecto, según la cantidad).
  duracion?: number;
  resaltes?: Resalte[];
};

// Cantidades que se ven (ADN §7): N elementos en rejilla que aparecen en ola y se resaltan por grupos.
export const RejillaCantidad: React.FC<Props> = ({ cantidad, columnas, forma = "punto", celda, separacion, en, duracion, resaltes = [] }) => {
  const frame = useCurrentFrame();
  const perfil = useIntensidad();
  const resolver = useEn();
  const inicio = resolver(en);
  const lado = celda ?? (forma === "punto" ? Math.max(6, Math.min(36, 760 / columnas - 4)) : 64);
  const hueco = separacion ?? (forma === "punto" ? lado * 0.45 : lado * 0.3);
  const total = duracion ?? Math.min(45, Math.round(perfil.entrada + Math.sqrt(cantidad) * 2));
  const resueltos = resaltes.map((r) => ({ ...r, f: resolver(r.en) }));
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${columnas}, ${lado}px)`, gap: hueco }}>
      {Array.from({ length: cantidad }, (_, i) => {
        // Ola en diagonal: aparece primero la esquina superior izquierda.
        const orden = (i % columnas) + Math.floor(i / columnas);
        const maxOrden = columnas - 1 + Math.ceil(cantidad / columnas) - 1;
        const p = progreso(frame, inicio + (orden / Math.max(1, maxOrden)) * (total - perfil.entrada), perfil.entrada, perfil.curvaEntrada);
        let foco = 0;
        let atenuado = 0;
        for (const r of resueltos) {
          const pr = progreso(frame, r.f, perfil.atenuar, perfil.curvaEntrada);
          const dentro = r.indices ? r.indices.includes(i) : i < (r.cantidad ?? 0);
          if (dentro) foco = Math.max(foco, pr);
          else if (r.atenuarResto) atenuado = Math.max(atenuado, pr);
        }
        const opacidad = Math.min(1, p * 1.5) * (1 - atenuado * 0.75);
        const escala = 0.6 + 0.4 * p;
        if (forma === "punto") {
          return (
            <div
              key={i}
              style={{
                width: lado,
                height: lado,
                borderRadius: "50%",
                background: foco > 0.5 ? colores.acento : colores.texto,
                opacity: opacidad * (foco > 0.5 ? 1 : 0.85),
                // El punto en foco crece: entre cientos de puntos, el color solo no basta para encontrarlo.
                transform: `scale(${escala * (1 + foco * 1.6)})`,
                boxShadow: foco > 0.5 ? `0 0 ${lado * 1.5}px ${colores.acento}` : undefined,
                position: "relative",
                zIndex: foco > 0.5 ? 1 : 0,
              }}
            />
          );
        }
        return (
          <div key={i} style={{ opacity: opacidad, transform: `scale(${escala})` }}>
            <IconoTrazo nombre={forma} tamano={lado} foco={foco > 0.5} />
          </div>
        );
      })}
    </div>
  );
};
