import { AbsoluteFill, Audio, staticFile, type CalculateMetadataFunction } from "remotion";
import { Subtitulos } from "../components/Subtitulos";
import { MockupPerfil } from "../components/marca/MockupPerfil";
import { Tarjeta } from "../components/marca/Tarjeta";
import { TextoMarcado } from "../components/marca/TextoMarcado";
import { Sfx } from "../components/sonido/Sfx";
import { IconoTrazo } from "../components/vocabulario/IconoTrazo";
import { LineaConectora } from "../components/vocabulario/LineaConectora";
import type { NombreIcono } from "../components/vocabulario/iconos";
import { formatoNumero } from "../lib/animacion";
import { colores, estiloEtiqueta, tipografia } from "../lib/estilo";
import { ANCHO, FPS } from "../lib/formato";
import { Intensidad } from "../lib/intensidad";
import { Elemento, Lienzo } from "../lib/lienzo";
import { combinar, useAnimacion } from "../lib/presets";
import { useMomentos, Voz } from "../lib/sincronia";
import type { DatosAudio } from "../lib/subtitulos";

// Video de demostración de la plantilla (proyectos/demo, voz de prueba de Windows). Es corto a propósito:
// muestra el lienzo, la cámara por tomas, un conector, un contador que llega en su palabra y el CTA de perfil,
// que toma el usuario y la foto de estilo/perfil.json. El modelo completo de un video real está en ejemplos/GrunsLienzo.tsx.

export type DemoProps = { proyecto: string; datos?: DatosAudio };

export const calcularDemo: CalculateMetadataFunction<DemoProps> = async ({ props }) => {
  const respuesta = await fetch(staticFile(`proyectos/${props.proyecto}/palabras.json`));
  const datos = (await respuesta.json()) as DatosAudio;
  // Un segundo de aire tras la última palabra: el CTA termina de pulsar Seguir.
  return { durationInFrames: Math.ceil((datos.duracion + 1) * FPS), props: { ...props, datos } };
};

const COL = (n: number) => n * ANCHO;

/** Un paso del flujo: pictograma de trazo con su rótulo mono. */
const Nodo: React.FC<{ icono: NombreIcono; rotulo: string; en: string; foco?: boolean }> = ({ icono, rotulo, en, foco }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
    <IconoTrazo nombre={icono} tamano={150} dibujarEn={en} foco={foco} />
    <div style={estiloEtiqueta(28, foco ? colores.acento : colores.texto)}>{rotulo}</div>
  </div>
);

/** Cifra que cuenta y llega a su valor justo en la palabra `llegaEn`. */
const Cifra: React.FC<{ hasta: number; llegaEn: string }> = ({ hasta, llegaEn }) => {
  const a = useAnimacion();
  const m = useMomentos();
  const f = m(llegaEn);
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ ...estiloEtiqueta(30), marginBottom: 14 }}>Contador</div>
      <div
        style={{
          fontFamily: tipografia.titulo,
          fontWeight: tipografia.tituloPeso,
          fontSize: 300,
          lineHeight: 1,
          color: colores.acento,
          fontVariantNumeric: "tabular-nums",
          display: "inline-block",
          ...combinar(a.enfasis({ en: f, anticipar: false })),
        }}
      >
        {formatoNumero(a.contar({ desde: 0, hasta, llegaEn: f }))}
      </div>
    </div>
  );
};

const Video: React.FC<{ proyecto: string; datos: DatosAudio }> = ({ proyecto, datos }) => (
  <Lienzo
    camara={[
      // El flujo se arma abajo: la cámara se abre para ver guion → voz → video.
      { en: "guion", y: 1000, escala: 0.92 },
      // Empujones suaves en "voz" y en "listo": el flujo avanza hacia el video terminado.
      { en: "voz", x: 620, y: 1000, escala: 1 },
      { en: "listo", x: 600, y: 1010, escala: 1.05, modo: "impacto" },
      // Sincronía: paneo a la siguiente estación.
      { en: "justo", x: 540 + COL(1), y: 960, escala: 1 },
      // La cifra: corte duro, es la revelación.
      { en: "texto:ejemplo", x: 540 + COL(2), y: 960, escala: 1, corte: true },
      // CTA: primer plano de la foto y alejamiento que revela el perfil.
      { en: "perfil", x: 540 + COL(3), y: 722, escala: 2.6, corte: true },
      { en: "texto:para#2", x: 540 + COL(3), y: 880, escala: 1, duracion: 14 },
    ]}
    fija={
      <>
        <Subtitulos palabras={datos.palabras} />
        <Audio src={staticFile(`proyectos/${proyecto}/${datos.audio}`)} />
        <Efectos />
      </>
    }
  >
    {/* ── Gancho: el título se marca en "estudio" ── */}
    <Elemento id="titulo" x={540} y={560} entra={{ en: "estudio-300ms", modo: "impacto" }} estados={[{ en: "guion", atenuado: true }]} sale={{ en: "justo", direccion: "arriba" }}>
      <TextoMarcado texto="Tu *estudio* de motion" en="estudio" tamano={84} ancho={900} />
    </Elemento>

    {/* ── El flujo: guion → voz → video, unidos por conectores que se dibujan en su palabra ── */}
    <Elemento id="guion" x={220} y={1000} entra={{ en: "guion-200ms", direccion: "escala" }} sale={{ en: "justo" }}>
      <Nodo icono="documento" rotulo="Guion" en="guion" />
    </Elemento>
    <Elemento id="voz" x={540} y={1000} entra={{ en: "voz-200ms", direccion: "escala" }} sale={{ en: "justo" }}>
      <Nodo icono="mensaje" rotulo="Voz" en="voz" />
    </Elemento>
    <LineaConectora desde={{ x: 310, y: 960 }} hasta={{ x: 450, y: 960 }} en="voz" saleEn="justo" />
    <Elemento id="video" x={860} y={1000} entra={{ en: "texto:convierte", direccion: "escala" }} estados={[{ en: "listo", contenido: <Nodo icono="movil" rotulo="Listo" en="texto:convierte" foco /> }]} sale={{ en: "justo" }}>
      <Nodo icono="movil" rotulo="Video" en="texto:convierte" />
    </Elemento>
    <LineaConectora desde={{ x: 630, y: 960 }} hasta={{ x: 770, y: 960 }} en="texto:convierte" saleEn="justo" />

    {/* ── Sincronía: la palabra aparece cuando se dice ── */}
    <Elemento id="sincronia" x={540 + COL(1)} y={760} entra={{ en: "justo-200ms" }}>
      <div style={estiloEtiqueta(30)}>Sincronía por palabra</div>
    </Elemento>
    <Elemento id="palabra" x={540 + COL(1)} y={960} entra={{ en: "palabra-200ms", direccion: "escala", modo: "impacto" }}>
      <Tarjeta titulo="En su palabra" foco>
        <div style={{ fontFamily: tipografia.titulo, fontWeight: tipografia.tituloPeso, fontSize: 120, color: colores.texto, padding: "10px 30px" }}>palabra</div>
      </Tarjeta>
    </Elemento>

    {/* ── La cifra llega a 100 justo en "cien" ── */}
    <Elemento id="cifra" x={540 + COL(2)} y={940} entra={{ en: "texto:ejemplo", corte: true }}>
      <Cifra hasta={100} llegaEn="cien" />
    </Elemento>

    {/* ── CTA de perfil (usuario y foto de estilo/perfil.json) ── */}
    <Elemento id="cta" x={540 + COL(3)} y={880} entra={{ en: "perfil", corte: true }}>
      <MockupPerfil detallesEn="texto:para#2" pulsaEn="seguir" />
    </Elemento>
  </Lienzo>
);

const Efectos: React.FC = () => {
  const m = useMomentos();
  return (
    <>
      <Sfx sonido="pop" en={m("estudio")} volumen={0.7} />
      <Sfx sonido="click" en={m("guion")} />
      <Sfx sonido="click" en={m("voz")} />
      <Sfx sonido="ding" en={m("listo")} volumen={0.7} />
      <Sfx sonido="whoosh" en={m("justo") - 22} volumen={0.5} />
      <Sfx sonido="pop" en={m("palabra")} volumen={0.6} />
      <Sfx sonido="riser" en={m("cien") - 46} volumen={0.4} />
      <Sfx sonido="impacto" en={m("cien")} volumen={0.8} />
      <Sfx sonido="golpe" en={m("perfil")} volumen={0.7} />
      <Sfx sonido="whoosh" en={m("texto:para#2") - 14} volumen={0.55} />
      <Sfx sonido="click" en={m("seguir")} volumen={0.9} />
    </>
  );
};

export const Demo: React.FC<DemoProps> = ({ proyecto, datos }) => {
  if (!datos) return null;
  return (
    <Voz datos={datos}>
      <Intensidad modo="dinamico">
        <AbsoluteFill style={{ background: colores.fondo }}>
          <Video proyecto={proyecto} datos={datos} />
        </AbsoluteFill>
      </Intensidad>
    </Voz>
  );
};
