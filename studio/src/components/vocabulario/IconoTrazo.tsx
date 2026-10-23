import { colores, forma } from "../../lib/estilo";
import { useEn, type Momento } from "../../lib/lienzo";
import { useAnimacion } from "../../lib/presets";
import { ICONOS, type NombreIcono } from "./iconos";

type Props = {
  nombre: NombreIcono;
  tamano?: number;
  // En foco el trazo va en el acento (ADN: el acento solo en lo que importa).
  foco?: boolean;
  color?: string;
  // Si se indica, el icono se dibuja progresivamente a partir de ese momento.
  dibujarEn?: Momento;
  grosor?: number;
};

// Icono de trazo de la biblioteca, que opcionalmente se dibuja al nombrarse.
export const IconoTrazo: React.FC<Props> = ({ nombre, tamano = 120, foco = false, color, dibujarEn, grosor = forma.trazo }) => {
  const a = useAnimacion();
  const en = useEn();
  const trazado = dibujarEn === undefined ? 1 : a.dibujar({ en: en(dibujarEn) });
  return (
    <svg width={tamano} height={tamano} viewBox="0 0 48 48" fill="none" style={{ overflow: "visible", display: "block" }}>
      <path
        d={ICONOS[nombre]}
        stroke={color ?? (foco ? colores.acento : colores.texto)}
        // Grosor en unidades del viewBox (48) para que mida `grosor` px en pantalla. No se usa non-scaling-stroke:
        // en Chrome rompe el cálculo de pathLength y el dibujo progresivo queda incompleto.
        strokeWidth={(grosor * 48) / tamano}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - trazado}
      />
    </svg>
  );
};
