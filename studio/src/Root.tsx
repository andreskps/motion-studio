import { Composition } from "remotion";
import { Catalogo, duracionCatalogo } from "./compositions/Catalogo";
import { CatalogoLienzo } from "./compositions/CatalogoLienzo";
import { Demo, calcularDemo } from "./compositions/Demo";
import { Prueba } from "./compositions/Prueba";
import { PruebaLienzo } from "./compositions/PruebaLienzo";
import { PruebaSincronia } from "./compositions/PruebaSincronia";
import { VideoSubtitulado, calcularVideoSubtitulado } from "./compositions/VideoSubtitulado";
import { ALTO, ANCHO, FPS, segundos } from "./lib/formato";

// Cada video nuevo añade aquí su composición (ver /nuevo-video). Demo es el ejemplo que trae la plantilla.
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Demo" component={Demo} calculateMetadata={calcularDemo} durationInFrames={segundos(20)} fps={FPS} width={ANCHO} height={ALTO} defaultProps={{ proyecto: "demo" }} />
    <Composition
      id="Prueba"
      component={Prueba}
      durationInFrames={segundos(5)}
      fps={FPS}
      width={ANCHO}
      height={ALTO}
      defaultProps={{ mostrarZonas: false }}
    />
    <Composition
      id="VideoSubtitulado"
      component={VideoSubtitulado}
      calculateMetadata={calcularVideoSubtitulado}
      durationInFrames={segundos(10)}
      fps={FPS}
      width={ANCHO}
      height={ALTO}
      defaultProps={{ proyecto: "demo", mostrarZonas: false }}
    />
    <Composition
      id="PruebaSincronia"
      component={PruebaSincronia}
      calculateMetadata={calcularVideoSubtitulado}
      durationInFrames={segundos(10)}
      fps={FPS}
      width={ANCHO}
      height={ALTO}
      defaultProps={{ proyecto: "demo", mostrarZonas: false }}
    />
    <Composition id="CatalogoLienzo" component={CatalogoLienzo} durationInFrames={segundos(20)} fps={FPS} width={ANCHO} height={ALTO} />
    <Composition id="PruebaLienzo" component={PruebaLienzo} durationInFrames={segundos(10)} fps={FPS} width={ANCHO} height={ALTO} />
    <Composition id="Catalogo" component={Catalogo} durationInFrames={duracionCatalogo} fps={FPS} width={ANCHO} height={ALTO} defaultProps={{ modo: "dinamico" as const }} />
  </>
);
