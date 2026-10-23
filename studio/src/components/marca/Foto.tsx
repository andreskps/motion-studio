import { interpolate } from "remotion";
import { useAsset } from "../../lib/assetsProyecto";
import { colores, estiloEtiqueta } from "../../lib/estilo";
import { IconoTrazo } from "../vocabulario/IconoTrazo";
import type { NombreIcono } from "../vocabulario/iconos";
import { useEn, type Momento } from "../../lib/lienzo";
import { useAnimacion } from "../../lib/presets";
import { Medio } from "../imagen/Medio";
import { MarcadorAsset, Tarjeta } from "./Tarjeta";

type Props = {
  // Nombre del asset (imagen o video corto de b-roll).
  archivo: string;
  ancho?: number;
  alto?: number;
  // Cabecera de la tarjeta ("FUNDADOR · GRÜNS").
  titulo?: string;
  pie?: string;
  foco?: boolean;
  // La imagen se revela de abajo arriba en ese momento.
  revelarEn?: Momento;
  // Acercamiento lento durante `duracionLenta` frames desde que se revela (Ken Burns sutil).
  duracionLenta?: number;
  // Si el asset todavía no existe, se dibuja este pictograma de trazo en su lugar (en vez del marcador "FALTA").
  pictograma?: NombreIcono;
};

// Foto o b-roll enmarcado en una tarjeta (ADN §7): fundador, producto, packaging, tienda, captura.
export const Foto: React.FC<Props> = ({ archivo, ancho = 520, alto = 600, titulo, pie, foco, revelarEn, duracionLenta = 150, pictograma }) => {
  const { src } = useAsset(archivo);
  const a = useAnimacion();
  const resolver = useEn();
  const inicio = revelarEn === undefined ? 0 : resolver(revelarEn);
  const p = revelarEn === undefined ? 1 : a.avance({ en: inicio, duracion: Math.round(a.perfil.entrada * 1.8) });
  const zoom = interpolate(a.frame, [inicio, inicio + duracionLenta], [1.08, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <Tarjeta titulo={titulo} foco={foco} relleno={0} ancho={ancho}>
      <div style={{ width: ancho, height: alto, overflow: "hidden", clipPath: `inset(${(1 - p) * 100}% 0 0 0)` }}>
        {src ? (
          <div style={{ width: "100%", height: "100%", transform: `scale(${zoom})` }}>
            <Medio src={src} />
          </div>
        ) : pictograma ? (
          // Respaldo mientras no llega la foto real: el pictograma se dibuja al revelarse la tarjeta.
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: colores.superficie2 }}>
            <IconoTrazo nombre={pictograma} tamano={Math.min(ancho, alto) * 0.55} dibujarEn={revelarEn ?? 0} foco={foco} grosor={4} />
          </div>
        ) : (
          <MarcadorAsset nombre={archivo.includes(".") ? archivo : `${archivo}.jpg`} ancho={ancho} alto={alto} />
        )}
      </div>
      {pie ? <div style={{ padding: "14px 20px", ...estiloEtiqueta(24) }}>{pie}</div> : null}
    </Tarjeta>
  );
};
