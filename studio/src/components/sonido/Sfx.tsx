import { Audio, Sequence, random, staticFile } from "remotion";
import { buscarSonido, variantesDe, type Fuente, type IdSonido } from "../../lib/sfx";

type Props = {
  sonido: IdSonido;
  // Frame (relativo a la secuencia que lo contiene) en que suena.
  en?: number;
  // 1, 2, 3... dentro de las variantes elegibles. Si no se indica, se elige una fija según `en`
  // para que el mismo sonido no se repita igual.
  variante?: number;
  // Solo variantes sintetizadas o solo de biblioteca. Sin indicar, alterna entre todas.
  fuente?: Fuente;
  // Multiplica el volumen sugerido del catálogo.
  volumen?: number;
};

// Efecto de sonido del catálogo (public/sfx). Ponlo junto a la animación que acompaña.
export const Sfx: React.FC<Props> = ({ sonido, en = 0, variante, fuente, volumen = 1 }) => {
  const entrada = buscarSonido(sonido);
  const elegibles = variantesDe(entrada, fuente);
  const indice = variante ? (variante - 1) % elegibles.length : Math.floor(random(`${sonido}-${en}`) * elegibles.length);
  const archivo = elegibles[indice];
  return (
    <Sequence from={en} durationInFrames={Math.ceil(archivo.duracion * 30) + 1} layout="none" name={`sfx ${sonido}`}>
      <Audio src={staticFile(archivo.archivo)} volume={entrada.volumen * volumen} />
    </Sequence>
  );
};
