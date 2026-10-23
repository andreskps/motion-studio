import { colores, tipografia } from "../../lib/estilo";
import { useEn, type Momento } from "../../lib/lienzo";
import { PERFILES } from "../../lib/intensidad";
import { progreso, useAnimacion } from "../../lib/presets";

type Props = {
  texto: string;
  en: Momento;
  tamano?: number;
  rotacion?: number;
  // acento: resultado positivo · neutro: dato frío.
  tono?: "acento" | "neutro";
};

// Sello que se estampa sobre algo (ADN §9 énfasis, de saasyass "PAID"): cae de grande a su tamaño con un golpe.
// Siempre en intensidad de impacto: es un momento de revelación.
export const Sello: React.FC<Props> = ({ texto, en, tamano = 64, rotacion = -8, tono = "acento" }) => {
  const a = useAnimacion();
  const resolver = useEn();
  const f = resolver(en);
  const impacto = PERFILES.impacto;
  const p = progreso(a.frame, f - 2, impacto.entrada, impacto.curvaEntrada);
  if (p <= 0) return null;
  const color = tono === "acento" ? colores.acento : colores.texto;
  return (
    <div
      style={{
        display: "inline-block",
        padding: `${tamano * 0.18}px ${tamano * 0.4}px`,
        border: `${Math.max(4, tamano * 0.08)}px solid ${color}`,
        borderRadius: tamano * 0.18,
        color,
        background: colores.fondo,
        fontFamily: tipografia.titulo,
        fontWeight: tipografia.tituloPeso,
        fontSize: tamano,
        lineHeight: 1,
        letterSpacing: "0.02em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        opacity: Math.min(1, p * 2),
        transform: `rotate(${rotacion}deg) scale(${1.6 - 0.6 * Math.min(1, p)})`,
        boxShadow: `6px 6px 0 0 ${tono === "acento" ? colores.acentoAlt : colores.superficieDestacada}`,
      }}
    >
      {texto}
    </div>
  );
};
