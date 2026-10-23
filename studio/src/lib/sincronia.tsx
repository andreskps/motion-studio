import { createContext, useContext } from "react";
import { useVideoConfig } from "remotion";
import type { DatosAudio, Palabra } from "./subtitulos";

// Sincronía con la voz (ADN §13): las animaciones se colocan en palabras, no en segundos a mano.
//
// Referencias aceptadas:
//   "cifra"          el ancla {cifra} del guion (inicio de la palabra)
//   "cifra@fin"      el final de esa palabra
//   "cifra-120ms"    con desfase: anticipa 120 ms (también +300ms, -4f, +0.5s)
//   "texto:diez#2"   la 2.ª vez que la voz dice "diez" (sin #n, la 1.ª); admite @fin y desfase
//   "s:3.5"          un segundo concreto (último recurso)
//
// Devuelve frames de la línea de tiempo de la composición. Úsalo dentro de <Lienzo> (tiempo absoluto); dentro de
// una <Sequence> réstale el `from` de la secuencia.

const ContextoVoz = createContext<DatosAudio | null>(null);

export const Voz: React.FC<{ datos: DatosAudio; children: React.ReactNode }> = ({ datos, children }) => (
  <ContextoVoz.Provider value={datos}>{children}</ContextoVoz.Provider>
);

/** La voz si hay <Voz> alrededor, o null (para componentes que también funcionan con frames). */
export const useVozOpcional = (): DatosAudio | null => useContext(ContextoVoz);

export const useVoz = (): DatosAudio => {
  const datos = useContext(ContextoVoz);
  if (!datos) throw new Error("useVoz/useMomento necesitan estar dentro de <Voz datos={…}>");
  return datos;
};

const normalizar = (texto: string) =>
  texto
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");

const UNIDADES: Record<string, number> = { ms: 0.001, s: 1 };

// Segundo exacto de una referencia (sin pasar a frames).
export const resolverSegundo = (referencia: string, datos: DatosAudio, fps: number): number => {
  let ref = referencia.trim();
  let desfase = 0;
  const conDesfase = ref.match(/^(.*?)([+-]\d+(?:\.\d+)?)(ms|f|s)?$/);
  if (conDesfase && conDesfase[1]) {
    ref = conDesfase[1];
    const valor = Number(conDesfase[2]);
    const unidad = conDesfase[3] ?? "ms";
    desfase = unidad === "f" ? valor / fps : valor * UNIDADES[unidad];
  }
  let alFinal = false;
  if (ref.endsWith("@fin")) {
    alFinal = true;
    ref = ref.slice(0, -4);
  } else if (ref.endsWith("@inicio")) {
    ref = ref.slice(0, -7);
  }
  ref = ref.replace(/^\{|\}$/g, "");

  const deUnaPalabra = (p: Palabra) => (alFinal ? p.fin : p.inicio) + desfase;

  if (ref.startsWith("s:")) return Number(ref.slice(2)) + desfase;

  if (ref.startsWith("texto:")) {
    const [texto, n] = ref.slice(6).split("#");
    const objetivo = normalizar(texto);
    const coincidencias = datos.palabras.filter((p) => normalizar(p.texto) === objetivo);
    const palabra = coincidencias[(Number(n) || 1) - 1];
    if (!palabra) throw new Error(`La voz no dice "${texto}"${n ? ` ${n} veces` : ""} (aparece ${coincidencias.length})`);
    return deUnaPalabra(palabra);
  }

  const ancla = datos.anclas?.[ref];
  const palabra = ancla ? datos.palabras[ancla.indice] : datos.palabras.find((p) => p.ancla === ref);
  if (!palabra) {
    const disponibles = Object.keys(datos.anclas ?? {}).join(", ") || "ninguna";
    throw new Error(`No existe el ancla {${ref}} en el guion. Anclas disponibles: ${disponibles}`);
  }
  return deUnaPalabra(palabra);
};

export const resolverMomento = (referencia: string, datos: DatosAudio, fps: number): number =>
  Math.round(resolverSegundo(referencia, datos, fps) * fps);

/** Frame de una referencia de la voz. */
export const useMomento = (referencia: string): number => {
  const datos = useVoz();
  const { fps } = useVideoConfig();
  return resolverMomento(referencia, datos, fps);
};

/** Resolver de momentos para usar varias referencias en un mismo componente: const m = useMomentos(); m("cifra"). */
export const useMomentos = () => {
  const datos = useVoz();
  const { fps } = useVideoConfig();
  return (referencia: string) => resolverMomento(referencia, datos, fps);
};
