import { loadFont as anton } from "@remotion/google-fonts/Anton";
import { loadFont as archivoBlack } from "@remotion/google-fonts/ArchivoBlack";
import { loadFont as bebasNeue } from "@remotion/google-fonts/BebasNeue";
import { loadFont as courierPrime } from "@remotion/google-fonts/CourierPrime";
import { loadFont as dmSans } from "@remotion/google-fonts/DMSans";
import { loadFont as fraunces } from "@remotion/google-fonts/Fraunces";
import { loadFont as ibmPlexMono } from "@remotion/google-fonts/IBMPlexMono";
import { loadFont as inter } from "@remotion/google-fonts/Inter";
import { loadFont as jetBrainsMono } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as lato } from "@remotion/google-fonts/Lato";
import { loadFont as lora } from "@remotion/google-fonts/Lora";
import { loadFont as manrope } from "@remotion/google-fonts/Manrope";
import { loadFont as montserrat } from "@remotion/google-fonts/Montserrat";
import { loadFont as openSans } from "@remotion/google-fonts/OpenSans";
import { loadFont as oswald } from "@remotion/google-fonts/Oswald";
import { loadFont as outfit } from "@remotion/google-fonts/Outfit";
import { loadFont as playfairDisplay } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as plusJakartaSans } from "@remotion/google-fonts/PlusJakartaSans";
import { loadFont as poppins } from "@remotion/google-fonts/Poppins";
import { loadFont as raleway } from "@remotion/google-fonts/Raleway";
import { loadFont as roboto } from "@remotion/google-fonts/Roboto";
import { loadFont as sora } from "@remotion/google-fonts/Sora";
import { loadFont as spaceGrotesk } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as spaceMono } from "@remotion/google-fonts/SpaceMono";
import { loadFont as syne } from "@remotion/google-fonts/Syne";
import { loadFont as unbounded } from "@remotion/google-fonts/Unbounded";
import { loadFont as urbanist } from "@remotion/google-fonts/Urbanist";

// Fuentes de Google que el estudio sabe cargar. Para añadir una, importa su loadFont de @remotion/google-fonts.
type Cargador = (estilo: "normal", opciones: { weights: string[]; subsets: string[] }) => { fontFamily: string };

const cargadores: Record<string, Cargador> = {
  Anton: anton as unknown as Cargador,
  "Archivo Black": archivoBlack as unknown as Cargador,
  "Bebas Neue": bebasNeue as unknown as Cargador,
  "Courier Prime": courierPrime as unknown as Cargador,
  "DM Sans": dmSans as unknown as Cargador,
  Fraunces: fraunces as unknown as Cargador,
  "IBM Plex Mono": ibmPlexMono as unknown as Cargador,
  Inter: inter as unknown as Cargador,
  "JetBrains Mono": jetBrainsMono as unknown as Cargador,
  Lato: lato as unknown as Cargador,
  Lora: lora as unknown as Cargador,
  Manrope: manrope as unknown as Cargador,
  Montserrat: montserrat as unknown as Cargador,
  "Open Sans": openSans as unknown as Cargador,
  Oswald: oswald as unknown as Cargador,
  Outfit: outfit as unknown as Cargador,
  "Playfair Display": playfairDisplay as unknown as Cargador,
  "Plus Jakarta Sans": plusJakartaSans as unknown as Cargador,
  Poppins: poppins as unknown as Cargador,
  Raleway: raleway as unknown as Cargador,
  Roboto: roboto as unknown as Cargador,
  Sora: sora as unknown as Cargador,
  "Space Grotesk": spaceGrotesk as unknown as Cargador,
  "Space Mono": spaceMono as unknown as Cargador,
  Syne: syne as unknown as Cargador,
  Unbounded: unbounded as unknown as Cargador,
  Urbanist: urbanist as unknown as Cargador,
};

// Devuelve el font-family listo para CSS. Una familia que no es de Google (p. ej. Courier New, del sistema)
// se usa por su nombre, seguida de su respaldo de Google si lo tiene.
export const cargarFuente = (familia: string, pesos: string[], respaldo?: string, generica = "sans-serif"): string => {
  const cargar = cargadores[familia];
  if (cargar) return `${cargar("normal", { weights: pesos, subsets: ["latin"] }).fontFamily}, ${generica}`;
  const pila = respaldo && cargadores[respaldo] ? `, ${cargadores[respaldo]("normal", { weights: pesos, subsets: ["latin"] }).fontFamily}` : "";
  return `'${familia}'${pila}, ${generica}`;
};
