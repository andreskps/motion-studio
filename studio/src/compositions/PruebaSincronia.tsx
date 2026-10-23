import { AbsoluteFill, Audio, staticFile } from "remotion";
import { Subtitulos } from "../components/Subtitulos";
import { FondoAnimado } from "../components/efectos/FondoAnimado";
import { formatoNumero } from "../lib/animacion";
import { colores, estiloEtiqueta, tipografia } from "../lib/estilo";
import { ALTO } from "../lib/formato";
import { Intensidad } from "../lib/intensidad";
import { combinar, useAnimacion } from "../lib/presets";
import { useMomentos, Voz } from "../lib/sincronia";
import type { VideoSubtituladoProps } from "./VideoSubtitulado";

// Banco de pruebas de la sincronía por palabra: el contador llega a 1.200 justo cuando la voz dice "1.200" ({cifra}).
const Cifra: React.FC = () => {
  const m = useMomentos();
  const a = useAnimacion();
  const cifra = m("cifra");
  const valor = a.contar({ hasta: 1200, llegaEn: cifra });
  const entrada = a.entrar({ en: cifra - a.perfil.contador, direccion: "escala" });
  const golpe = a.enfasis({ en: cifra, anticipar: false });
  const etiqueta = a.entrar({ en: m("cifra@fin") });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", top: -ALTO * 0.08 }}>
      <div style={{ ...estiloEtiqueta(30), ...etiqueta, marginBottom: 20 }}>Valoración</div>
      <div
        style={{
          fontFamily: tipografia.titulo,
          fontWeight: tipografia.tituloPeso,
          fontSize: 210,
          color: colores.acento,
          fontVariantNumeric: "tabular-nums",
          ...combinar(entrada, golpe),
        }}
      >
        ${formatoNumero(valor)} M
      </div>
    </AbsoluteFill>
  );
};

export const PruebaSincronia: React.FC<VideoSubtituladoProps> = ({ proyecto, datos }) => {
  if (!datos) return null;
  return (
    <Voz datos={datos}>
      <Intensidad modo="impacto">
        <AbsoluteFill style={{ background: colores.fondo }}>
          <FondoAnimado />
          <Audio src={staticFile(`proyectos/${proyecto}/${datos.audio}`)} />
          <Cifra />
          <Subtitulos palabras={datos.palabras} />
        </AbsoluteFill>
      </Intensidad>
    </Voz>
  );
};
