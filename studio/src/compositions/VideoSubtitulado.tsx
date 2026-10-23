import { AbsoluteFill, Audio, staticFile, type CalculateMetadataFunction } from "remotion";
import { Subtitulos } from "../components/Subtitulos";
import { FondoAnimado } from "../components/efectos/FondoAnimado";
import { Musica } from "../components/sonido/Musica";
import { ZonasSeguras } from "../components/ZonasSeguras";
import { FPS } from "../lib/formato";
import { colores } from "../lib/estilo";
import type { DatosAudio } from "../lib/subtitulos";

export type VideoSubtituladoProps = {
  // Nombre de la carpeta en proyectos/ (y en studio/public/proyectos/).
  proyecto: string;
  mostrarZonas: boolean;
  // Música de fondo opcional (ruta en public/ o URL), con ducking bajo la voz.
  musica?: string;
  // Solo para revisar el ducking: silencia la voz y deja la música.
  silenciarVoz?: boolean;
  datos?: DatosAudio;
};

// Lee palabras.json del proyecto y ajusta la duración del video al audio.
export const calcularVideoSubtitulado: CalculateMetadataFunction<VideoSubtituladoProps> = async ({ props }) => {
  const respuesta = await fetch(staticFile(`proyectos/${props.proyecto}/palabras.json`));
  if (!respuesta.ok) {
    throw new Error(`No encontré palabras.json de "${props.proyecto}". Corre pipeline/procesar_audio.py primero.`);
  }
  const datos = (await respuesta.json()) as DatosAudio;
  return {
    durationInFrames: Math.ceil((datos.duracion + 0.5) * FPS),
    props: { ...props, datos },
  };
};

// Fase 1: voz + subtítulos dinámicos sobre un fondo neutro.
export const VideoSubtitulado: React.FC<VideoSubtituladoProps> = ({ proyecto, mostrarZonas, musica, silenciarVoz, datos }) => {
  if (!datos) return null;
  return (
    <AbsoluteFill style={{ background: colores.fondo }}>
      <FondoAnimado />
      <Audio src={staticFile(`proyectos/${proyecto}/${datos.audio}`)} volume={silenciarVoz ? 0 : 1} />
      {musica ? <Musica src={musica} palabras={datos.palabras} /> : null}
      <Subtitulos palabras={datos.palabras} />
      {mostrarZonas ? <ZonasSeguras /> : null}
    </AbsoluteFill>
  );
};
