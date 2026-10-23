import { Intensidad, type Modo } from "../lib/intensidad";
import { Fragment } from "react";
import { AbsoluteFill } from "remotion";
import { TransitionSeries } from "@remotion/transitions";
import { Comparacion } from "../components/datos/Comparacion";
import { Contador } from "../components/datos/Contador";
import { BarraProgreso } from "../components/datos/BarraProgreso";
import { GraficoBarras } from "../components/datos/GraficoBarras";
import { Lista } from "../components/datos/Lista";
import { Flash } from "../components/efectos/Flash";
import { FondoAnimado } from "../components/efectos/FondoAnimado";
import { ZoomGolpe } from "../components/efectos/ZoomGolpe";
import { BrollConTexto } from "../components/imagen/BrollConTexto";
import { ImagenKenBurns } from "../components/imagen/ImagenKenBurns";
import { ImagenTarjeta } from "../components/imagen/ImagenTarjeta";
import { PantallaDividida } from "../components/imagen/PantallaDividida";
import { Sfx } from "../components/sonido/Sfx";
import { Etiqueta } from "../components/texto/Etiqueta";
import { Resaltado } from "../components/texto/Resaltado";
import { TituloCinetico } from "../components/texto/TituloCinetico";
import { colores, tipografia } from "../lib/estilo";
import { ZONA_SEGURA } from "../lib/formato";
import { transicion, type NombreTransicion } from "../lib/transiciones";

type Escena = {
  nombre: string;
  duracion: number;
  // Transición con la que ENTRA esta escena (la primera no tiene).
  entrada?: NombreTransicion;
  fondo?: "liso" | "cuadricula" | "puntos";
  contenido: React.ReactNode;
};

const ESCENAS: Escena[] = [
  {
    nombre: "TituloCinetico · subir",
    duracion: 75,
    fondo: "liso",
    contenido: (
      <>
        <TituloCinetico texto="Esta marca vale 1.200 millones" resaltar={["1.200", "millones"]} />
        <Sfx sonido="pop" en={0} />
        <Sfx sonido="pop" en={12} />
      </>
    ),
  },
  {
    nombre: "TituloCinetico · máscara",
    duracion: 70,
    entrada: "fundido",
    fondo: "cuadricula",
    contenido: <TituloCinetico texto="Y nadie te lo cuenta" variante="mascara" resaltar={["nadie"]} tamano={130} />,
  },
  {
    nombre: "TituloCinetico · escala",
    duracion: 70,
    entrada: "corte",
    fondo: "puntos",
    contenido: <TituloCinetico texto="El error más caro" variante="escala" resaltar={["caro"]} tamano={140} />,
  },
  {
    nombre: "Resaltado",
    duracion: 80,
    entrada: "fundido",
    contenido: (
      <>
        <Resaltado texto="No busques clientes baratos busca clientes rentables" clave={["rentables"]} retrasoMarcador={18} />
        <Sfx sonido="swish" en={18} />
      </>
    ),
  },
  {
    nombre: "Etiqueta",
    duracion: 70,
    entrada: "barrido",
    fondo: "cuadricula",
    contenido: (
      <>
        <Etiqueta texto="Dato clave" icono="⚡" />
        <TituloCinetico texto="Relación 3 a 1" resaltar={["3", "1"]} centroY={1920 * 0.47} tamano={150} />
        <Sfx sonido="blip" en={0} />
      </>
    ),
  },
  {
    nombre: "Contador",
    duracion: 90,
    entrada: "barrido",
    contenido: (
      <>
        <Contador hasta={1200} prefijo="$" sufijo=" M" etiqueta="de valoración en 3 años" />
        <Sfx sonido="riser" en={0} volumen={0.6} />
        <Sfx sonido="impacto" en={40} />
      </>
    ),
  },
  {
    nombre: "Lista",
    duracion: 95,
    entrada: "fundido",
    fondo: "puntos",
    contenido: (
      <>
        <Lista titulo="Haz esto" items={["Sube la conversión", "Aumenta el ticket", "Trabaja la retención"]} escalonado={16} />
        <Sfx sonido="click" en={12} />
        <Sfx sonido="click" en={28} />
        <Sfx sonido="click" en={44} />
      </>
    ),
  },
  {
    nombre: "Comparacion",
    duracion: 95,
    entrada: "fundido",
    contenido: (
      <>
        <Comparacion
          arriba={{ titulo: "Marca A", valor: "1 compra", detalle: "y se va" }}
          abajo={{ titulo: "Marca B", valor: "12 compras", detalle: "al año" }}
          ganador="abajo"
        />
        <Sfx sonido="pop" en={10} />
        <Sfx sonido="ding" en={26} />
      </>
    ),
  },
  {
    nombre: "GraficoBarras",
    duracion: 95,
    entrada: "barrido",
    fondo: "cuadricula",
    contenido: (
      <GraficoBarras
        titulo="Valor por cliente"
        prefijo="$"
        datos={[
          { etiqueta: "Mes 1", valor: 50 },
          { etiqueta: "Mes 6", valor: 300 },
          { etiqueta: "Año 1", valor: 600 },
        ]}
      />
    ),
  },
  {
    nombre: "ImagenKenBurns",
    duracion: 80,
    entrada: "fundido",
    contenido: (
      <>
        <ImagenKenBurns src="assets/demo/imagen-1.jpg" oscurecer={0.35} />
        <TituloCinetico texto="Una foto que respira" variante="mascara" tamano={110} />
      </>
    ),
  },
  {
    nombre: "ImagenTarjeta",
    duracion: 80,
    entrada: "fundido",
    fondo: "puntos",
    contenido: (
      <>
        <ImagenTarjeta src="assets/demo/imagen-2.jpg" pie="La persona de la que se habla" alto={900} />
        <Sfx sonido="pop" en={2} />
      </>
    ),
  },
  {
    nombre: "BrollConTexto",
    duracion: 90,
    entrada: "barrido",
    contenido: <BrollConTexto src="assets/demo/broll.webm" texto="Así crecen las grandes marcas" resaltar={["grandes"]} />,
  },
  {
    nombre: "PantallaDividida",
    duracion: 80,
    entrada: "corte",
    contenido: (
      <PantallaDividida arriba="assets/demo/imagen-1.jpg" abajo="assets/demo/imagen-2.jpg" etiquetaArriba="Antes" etiquetaAbajo="Después" />
    ),
  },
  {
    nombre: "ZoomGolpe + Flash",
    duracion: 85,
    entrada: "fundido",
    fondo: "liso",
    contenido: (
      <>
        <ZoomGolpe en={[20, 45]}>
          <TituloCinetico texto="Sígueme para más" resaltar={["Sígueme"]} tamano={140} />
        </ZoomGolpe>
        <Flash en={20} />
        <Sfx sonido="impacto" en={20} volumen={0.7} />
        <Sfx sonido="pop" en={45} volumen={0.6} />
      </>
    ),
  },
];

const Rotulo: React.FC<{ texto: string; numero: number }> = ({ texto, numero }) => (
  <div
    style={{
      position: "absolute",
      top: ZONA_SEGURA.arriba - 90,
      left: 0,
      right: 0,
      textAlign: "center",
      fontFamily: tipografia.cuerpo,
      fontWeight: 700,
      fontSize: 34,
      color: colores.suave,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
    }}
  >
    {String(numero).padStart(2, "0")} · {texto}
  </div>
);

// Reel que muestra cada componente del estudio con su transición y sus sonidos. Para revisar y como referencia del director.
export const Catalogo: React.FC<{ modo: Modo }> = ({ modo }) => (
  <Intensidad modo={modo}>
    <AbsoluteFill style={{ background: colores.fondo }}>
      <TransitionSeries>
        {ESCENAS.map((escena, i) => {
          const t = escena.entrada ? transicion(escena.entrada) : null;
          return (
            <Fragment key={escena.nombre}>
              {t ? <TransitionSeries.Transition presentation={t.presentation} timing={t.timing} /> : null}
              <TransitionSeries.Sequence durationInFrames={escena.duracion} name={escena.nombre}>
                <FondoAnimado variante={escena.fondo ?? "liso"} />
                {escena.contenido}
                <Rotulo texto={escena.nombre} numero={i + 1} />
                {t?.sonido ? <Sfx sonido={t.sonido} en={0} /> : null}
              </TransitionSeries.Sequence>
            </Fragment>
          );
        })}
      </TransitionSeries>
      <BarraProgreso />
    </AbsoluteFill>
  </Intensidad>
);

export const duracionCatalogo = ESCENAS.reduce(
  (total, escena) => total + escena.duracion - (escena.entrada ? transicion(escena.entrada).timing.getDurationInFrames({ fps: 30 }) : 0),
  0,
);
