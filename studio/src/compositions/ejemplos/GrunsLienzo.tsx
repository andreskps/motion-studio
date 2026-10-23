import { AbsoluteFill, Audio, staticFile, type CalculateMetadataFunction } from "remotion";
import { Subtitulos } from "../../components/Subtitulos";
import { Foto } from "../../components/marca/Foto";
import { Logo } from "../../components/marca/Logo";
import { Sello } from "../../components/marca/Sello";
import { Tarjeta } from "../../components/marca/Tarjeta";
import { TextoMarcado } from "../../components/marca/TextoMarcado";
import { Ilustracion } from "../../components/marca/Ilustracion";
import { MockupPerfil } from "../../components/marca/MockupPerfil";
import { RastreadorPasos } from "../../components/vocabulario/RastreadorPasos";
import { Assets, cargarAssets, useAsset, type AssetsProyecto } from "../../lib/assetsProyecto";
import { Sfx } from "../../components/sonido/Sfx";
import { HUD } from "../../components/vocabulario/HUD";
import { IconoTrazo } from "../../components/vocabulario/IconoTrazo";
import { LineaConectora } from "../../components/vocabulario/LineaConectora";
import { RejillaCantidad } from "../../components/vocabulario/RejillaCantidad";
import { Tachar } from "../../components/vocabulario/Tachar";
import type { NombreIcono } from "../../components/vocabulario/iconos";
import { formatoNumero } from "../../lib/animacion";
import { colores, estiloEtiqueta, tipografia } from "../../lib/estilo";
import { ANCHO, FPS } from "../../lib/formato";
import { Intensidad } from "../../lib/intensidad";
import { Elemento, Lienzo } from "../../lib/lienzo";
import { combinar, useAnimacion } from "../../lib/presets";
import { useMomentos, Voz } from "../../lib/sincronia";
import type { DatosAudio } from "../../lib/subtitulos";

// Prueba real del ADN 1.1: los primeros ~28 s de Grüns sobre un solo lienzo, sincronizado palabra por palabra
// con las anclas {…} del guion. Es el modelo de lo que el director (Fase 4) generará desde un storyboard.

export type GrunsLienzoProps = { proyecto: string; hastaS: number; datos?: DatosAudio; assets?: AssetsProyecto };

export const calcularGrunsLienzo: CalculateMetadataFunction<GrunsLienzoProps> = async ({ props }) => {
  const respuesta = await fetch(staticFile(`proyectos/${props.proyecto}/palabras.json`));
  const datos = (await respuesta.json()) as DatosAudio;
  const assets = await cargarAssets(props.proyecto, staticFile);
  // Medio segundo de aire tras la última palabra para que el CTA respire.
  return { durationInFrames: Math.ceil(Math.min(datos.duracion + 0.5, props.hastaS) * FPS), props: { ...props, datos, assets } };
};

const COL = (n: number) => n * ANCHO;

// ── piezas de contenido ──

/** Número grande que cuenta y llega a su valor en la palabra `llegaEn` (con golpe de énfasis al llegar). */
const CifraViva: React.FC<{ desde?: number; hasta: number; llegaEn: string; prefijo?: string; sufijo?: string; etiqueta?: string; tamano?: number; foco?: boolean }> = ({
  desde = 0,
  hasta,
  llegaEn,
  prefijo = "",
  sufijo = "",
  etiqueta,
  tamano = 200,
  foco = true,
}) => {
  const a = useAnimacion();
  const m = useMomentos();
  const f = m(llegaEn);
  const valor = a.contar({ desde, hasta, llegaEn: f });
  const golpe = a.enfasis({ en: f, anticipar: false });
  return (
    <div style={{ textAlign: "center" }}>
      {etiqueta ? <div style={{ ...estiloEtiqueta(30), marginBottom: 14 }}>{etiqueta}</div> : null}
      <div
        style={{
          fontFamily: tipografia.titulo,
          fontWeight: tipografia.tituloPeso,
          fontSize: tamano,
          lineHeight: 1,
          letterSpacing: "-0.03em",
          color: foco ? colores.acento : colores.texto,
          fontVariantNumeric: "tabular-nums",
          whiteSpace: "nowrap",
          display: "inline-block",
          ...combinar(golpe),
        }}
      >
        {prefijo}
        {formatoNumero(valor)}
        {sufijo}
      </div>
    </div>
  );
};

const Pildora: React.FC<{ texto: string; icono?: NombreIcono; tono?: "acento" | "neutro" }> = ({ texto, icono, tono = "neutro" }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 16,
      padding: "18px 30px",
      borderRadius: 999,
      background: tono === "acento" ? colores.acentoTenue : colores.superficie2,
      border: `2px solid ${tono === "acento" ? colores.acento : colores.borde}`,
      ...estiloEtiqueta(30, tono === "acento" ? colores.acento : colores.texto),
    }}
  >
    {icono ? <IconoTrazo nombre={icono} tamano={36} color={tono === "acento" ? colores.acento : colores.suave} /> : null}
    {texto}
  </div>
);

const TarjetaMetrica: React.FC<{ revelada?: boolean }> = ({ revelada }) => (
  <Tarjeta titulo="Métrica clave" foco ancho={330}>
    <div style={{ fontFamily: tipografia.titulo, fontWeight: tipografia.tituloPeso, fontSize: 150, lineHeight: 1.1, color: colores.acento, textAlign: "center" }}>
      {revelada ? "↗" : "?"}
    </div>
  </Tarjeta>
);

/** "…a lo largo del tiempo": la ilustración del plan (cliente-recurrente.png) si existe; si no, persona + billetes. */
const ClienteEnElTiempo: React.FC = () => {
  const { src } = useAsset("cliente-recurrente");
  // Con ilustración, ocupa el hueco entre la pregunta y el valor; la propia ilustración ya cuenta la línea de tiempo.
  if (src) {
    return (
      <Elemento id="cliente-recurrente" x={540 + COL(3)} y={930}>
        <Ilustracion archivo="cliente-recurrente" tamano={330} revelarEn="texto:largo" />
      </Elemento>
    );
  }
  return (
    <>
      <LineaConectora desde={{ x: 540 + COL(3) - 380, y: 1010 }} hasta={{ x: 540 + COL(3) + 380, y: 1010 }} en="texto:largo" tono="neutro" grosor={3} saleEn="imagina" />
      <Elemento id="cliente" x={540 + COL(3) - 380} y={930} entra={{ en: "texto:genera", direccion: "escala" }} sale={{ en: "imagina", direccion: "izquierda" }}>
        <IconoTrazo nombre="persona" tamano={110} dibujarEn="texto:genera" />
      </Elemento>
      <Elemento id="dinero" x={540 + COL(3) + 60} y={940} entra={{ en: "texto:largo", direccion: "ninguna" }} sale={{ en: "imagina", direccion: "izquierda" }}>
        <RejillaCantidad cantidad={5} columnas={5} forma="dinero" celda={84} separacion={34} en="texto:largo" duracion={36} resaltes={[{ en: "tiempo", cantidad: 5 }]} />
      </Elemento>
    </>
  );
};

/** Tarjeta de una de las dos marcas del ejemplo: un comprador y sus compras. */
const TarjetaMarca: React.FC<{ nombre: string; compras: number; comprasEn: string; foco?: boolean }> = ({ nombre, compras, comprasEn, foco }) => (
  <Tarjeta titulo={nombre} foco={foco} ancho={400}>
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
      <IconoTrazo nombre="persona" tamano={130} dibujarEn="imagina" />
      <div style={estiloEtiqueta(22)}>1 comprador</div>
      <div style={{ height: 230, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <RejillaCantidad cantidad={compras} columnas={Math.min(4, compras)} forma="bolsa" celda={compras > 1 ? 58 : 96} en={comprasEn} duracion={compras > 1 ? 60 : undefined} />
      </div>
    </div>
  </Tarjeta>
);

/** Proporción 3 a 1: tres bloques de valor del cliente frente a uno de costo de adquisición, que crecen en su momento. */
const BarrasRatio: React.FC<{ en: string }> = ({ en }) => {
  const a = useAnimacion();
  const m = useMomentos();
  const f = m(en);
  const columna = (bloques: number, etiqueta: string, foco: boolean, retraso: number) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <div style={{ display: "flex", flexDirection: "column-reverse", gap: 8 }}>
        {Array.from({ length: bloques }, (_, i) => {
          const p = a.entrar({ en: f + retraso + i * a.perfil.escalonado * 2, direccion: "abajo", distancia: 30 });
          return <div key={i} style={{ width: 110, height: 54, borderRadius: 8, background: foco ? colores.acento : colores.superficieDestacada, border: `2px solid ${foco ? colores.acento : colores.texto}`, ...p }} />;
        })}
      </div>
      <div style={estiloEtiqueta(24, foco ? colores.acento : colores.suave)}>{etiqueta}</div>
    </div>
  );
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 50 }}>
      {columna(3, "LTV", true, 0)}
      {columna(1, "CAC", false, 8)}
    </div>
  );
};

/** Un paso de la lista "aplícalo a tu e-commerce": número, pictograma y texto. */
const Paso: React.FC<{ n: number; icono: NombreIcono; texto: string; en: string }> = ({ n, icono, texto, en }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 28, width: 760 }}>
    <div style={{ ...estiloEtiqueta(34, colores.acento), width: 60 }}>{String(n).padStart(2, "0")}</div>
    <IconoTrazo nombre={icono} tamano={84} dibujarEn={en} />
    <div style={{ fontFamily: tipografia.cuerpo, fontWeight: tipografia.cuerpoPesoFuerte, fontSize: 52, color: colores.texto }}>{texto}</div>
  </div>
);

// ── video ──

const Video: React.FC<{ proyecto: string; datos: DatosAudio }> = ({ proyecto, datos }) => (
  <Lienzo
    camara={[
      // Gancho: golpe de cámara justo en "1.200" y vuelta.
      { en: "cifra", escala: 1.1, y: 900, modo: "impacto" },
      { en: "anos", escala: 1, y: 960, modo: "editorial" },
      // El fundador está a la derecha: paneo que llega en "fundador".
      { en: "fundador", x: 540 + COL(1) },
      // "…detrás de su estrategia": la cámara se acerca a la métrica (zoom semántico, llena el hueco que marcó la QA).
      { en: "texto:estrategia", objetivo: "metrica", escala: 1.3, y: 960 },
      // La mayoría de tiendas: paneo + zoom-out para ver el conjunto.
      { en: "mayoria", x: 540 + COL(2), y: 960, escala: 0.92 },
      { en: "baratos", y: 1010, escala: 1.05 },
      // "Pero": corte duro de contraste.
      { en: "pero", x: 540 + COL(3), y: 960, escala: 1, corte: true },
      // A lo largo del tiempo: se abre para revelar la línea de tiempo completa.
      { en: "tiempo", escala: 0.94, y: 990, modo: "editorial" },
      // 6–10 · Dos marcas: paneo a la comparación, pausa abierta en la pregunta y golpe sobre la ganadora.
      { en: "imagina", x: 540 + COL(4), y: 930, escala: 1 },
      { en: "primera", objetivo: "marcaA", escala: 1.08, y: 860 },
      { en: "segunda", objetivo: "marcaB", escala: 1.08, y: 860 },
      { en: "invertir", x: 540 + COL(4), escala: 0.9, y: 900, modo: "editorial" },
      { en: "texto:exactamente", escala: 0.97, y: 890, modo: "impacto" },
      { en: "respuesta", objetivo: "marcaB", escala: 1.12, y: 900, modo: "impacto" },
      // 11–12 · LTV:CAC y el 3 a 1 del fundador: zoom a la cifra en "tres a uno" y vuelta para leer el resto.
      { en: "texto:presta", x: 540 + COL(5), y: 960, escala: 1 },
      { en: "ratio", objetivo: "ratio", escala: 1.15, modo: "impacto" },
      { en: "bruto", x: 540 + COL(5), y: 960, escala: 1, modo: "editorial" },
      { en: "texto:costos", objetivo: "barras", escala: 1.2, y: 1080, modo: "editorial" },
      // 13–14 · Capítulo "tu e-commerce": segundo y último corte duro.
      { en: "texto:aplicar", x: 540 + COL(6), y: 960, escala: 1, corte: true },
      // 15–16 · Las que dominan su mercado.
      { en: "texto:porque", x: 540 + COL(7), y: 960 },
      // 17 · CTA y alejamiento final.
      // CTA: corte a un primer plano de la foto del creador en "Sígueme" y zoom-out que revela su perfil.
      { en: "cta", x: 540 + COL(8), y: 722, escala: 2.6, corte: true },
      { en: "texto:entender", x: 540 + COL(8), y: 880, escala: 1, duracion: 14 },
      { en: "texto:e-commerce#2", escala: 0.86, modo: "editorial" },
    ]}
    fija={
      <>
        {/* A la derecha: la izquierda del HUD la usa el rastreador de pasos del capítulo "tu e-commerce". */}
        <HUD entra="cifra@fin" derecha={{ etiqueta: "Grüns · valoración", prefijo: "$", sufijo: " M", valores: [{ en: "cifra@fin", valor: 1200 }] }} />
        <RastreadorPasos
          hasta="texto:porque"
          pasos={[
            { nombre: "Conversión", en: "conversion" },
            { nombre: "Ticket", en: "ticket" },
            { nombre: "Volver", en: "motivos" },
            { nombre: "Retención", en: "retencion" },
          ]}
        />
        <Subtitulos palabras={datos.palabras} />
        <Audio src={staticFile(`proyectos/${proyecto}/${datos.audio}`)} />
        <Efectos />
      </>
    }
  >
    {/* ── 1 · Gancho (impacto) ── */}
    {/* La marca primero: logo y producto reales para que se reconozca (ADN §7, marca y apoyos visuales). */}
    <Elemento id="logo" x={540} y={560} entra={{ en: 0, direccion: "ninguna" }} estados={[{ en: "cifra-500ms", y: 470, escala: 0.6 }]}>
      <Logo revelarEn="s:0" alto={130} />
    </Elemento>
    <Elemento id="producto" x={540} y={930} entra={{ en: "gomitas-200ms", direccion: "arriba", modo: "impacto" }} estados={[{ en: "cifra-700ms", atenuado: true, escala: 0.8, y: 980 }]} sale={{ en: "cifra-300ms" }}>
      <Foto archivo="producto" titulo="Grüns · gomitas" ancho={460} alto={460} revelarEn="gomitas-200ms" pictograma="caja" />
    </Elemento>
    <Elemento id="cifra" x={540} y={880} entra={{ en: "cifra-700ms", direccion: "escala", modo: "impacto" }}>
      <Intensidad modo="impacto">
        <CifraViva hasta={1200} llegaEn="cifra" prefijo="$" sufijo=" M" etiqueta="Valoración" tamano={210} />
      </Intensidad>
    </Elemento>
    <Elemento id="anos" x={540} y={1120}>
      <Sello texto="En ~3 años" en="anos" tamano={58} />
    </Elemento>

    {/* ── 2 · El fundador y la métrica (dinámico) ── */}
    <Elemento
      id="fundador"
      x={540 + COL(1) - 200}
      y={900}
      entra={{ en: "fundador-200ms", direccion: "arriba" }}
      // Continuidad: la misma tarjeta vuelve cuando la voz vuelve a nombrarlo (beat 12), viajando por el lienzo.
      estados={[
        { en: "texto:importantes", atenuado: true },
        { en: "texto:fundador#2", x: 540 + COL(5) - 250, y: 900, atenuado: false, escala: 0.9, duracion: 20 },
      ]}
    >
      <Foto archivo="fundador" titulo="Fundador" ancho={330} alto={420} revelarEn="fundador-200ms" pictograma="persona" />
    </Elemento>
    <LineaConectora desde={{ x: 540 + COL(1) - 20, y: 860 }} hasta={{ x: 540 + COL(1) + 50, y: 860 }} en="metrica-150ms" curva={-30} />
    <Elemento
      id="metrica"
      x={540 + COL(1) + 230}
      y={900}
      entra={{ en: "metrica", direccion: "izquierda" }}
      estados={[
        { en: "texto:importantes", escala: 1.12 },
        { en: "crecimiento", contenido: <TarjetaMetrica revelada /> },
      ]}
    >
      <TarjetaMetrica />
    </Elemento>
    <Elemento id="crecimiento" x={540 + COL(1) + 230} y={1170} entra={{ en: "crecimiento" }}>
      <Pildora texto="Crecimiento" icono="tendencia" />
    </Elemento>

    {/* ── 3 · El error de la mayoría (dinámico) ── */}
    <Elemento id="rotulo-tiendas" x={540 + COL(2)} y={560} entra={{ en: "mayoria" }} sale={{ en: "texto:obsesionarse", direccion: "arriba" }}>
      <div style={estiloEtiqueta(30)}>La mayoría de tiendas online</div>
    </Elemento>
    {/* Las tiendas pasan a contexto: suben, se achican y se atenúan cuando entra la consecuencia (el coste). */}
    <Elemento
      id="tiendas"
      x={540 + COL(2)}
      y={790}
      entra={{ en: "mayoria", direccion: "ninguna" }}
      estados={[{ en: "texto:obsesionarse", y: 590, escala: 0.55, atenuado: true }]}
    >
      <RejillaCantidad cantidad={12} columnas={4} forma="tienda" celda={110} en="mayoria" />
    </Elemento>
    <Elemento id="error" x={540 + COL(2)} y={1060} entra={{ en: "texto:mismo" }} estados={[{ en: "texto:obsesionarse", y: 800, escala: 0.8 }]}>
      <TextoMarcado texto="Cometen *el mismo error*" en="error" fuente="cuerpo" tamano={64} />
    </Elemento>
    <Elemento id="coste" x={540 + COL(2)} y={1030} entra={{ en: "texto:obsesionarse" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <CifraViva desde={50} hasta={12} llegaEn="baratos@fin" prefijo="$" etiqueta="Coste por cliente" tamano={170} foco={false} />
        <Ilustracion archivo="cliente-barato" tamano={240} revelarEn="baratos" pictograma="caida" />
      </div>
    </Elemento>

    {/* ── 4 · Pero Grüns piensa diferente (impacto, corte) ── */}
    {/* La marca protagonista en el giro: el logo real, grande, y luego sube a cabecera para el resto del argumento. */}
    <Elemento
      id="gruns"
      x={540 + COL(3)}
      y={880}
      entra={{ en: "gruns", direccion: "escala", modo: "impacto" }}
      estados={[{ en: "texto:lugar", y: 470, escala: 0.45 }]}
      sale={{ en: "imagina", direccion: "izquierda" }}
    >
      <Logo alto={260} />
    </Elemento>

    {/* ── 5 · La pregunta correcta (dinámico) ── */}
    <Elemento id="pregunta" x={540 + COL(3)} y={700} entra={{ en: "cuesta-400ms" }} sale={{ en: "imagina", direccion: "izquierda" }}>
      <Tachar texto="¿Cuánto cuesta?" reemplazo="¿Cuánto genera?" en="sepregunta" reemplazoEn="beneficio" tamano={96} />
    </Elemento>
    <ClienteEnElTiempo />
    <Elemento id="valor" x={540 + COL(3)} y={1160} entra={{ en: "texto:largo" }} sale={{ en: "imagina", direccion: "izquierda" }}>
      <CifraViva desde={50} hasta={600} llegaEn="tiempo@fin" prefijo="$" etiqueta="Valor del cliente" tamano={150} />
    </Elemento>

    {/* ── 6–10 · Dos marcas, mismo CAC (dinámico → impacto en la respuesta) ── */}
    <Elemento id="marcaA" x={540 + COL(4) - 235} y={820} entra={{ en: "imagina", direccion: "izquierda" }}
      estados={[{ en: "texto:comprador", escala: 1.05 }, { en: "texto:comprador+350ms", escala: 1 }, { en: "segunda", atenuado: true }, { en: "invertir", atenuado: false }, { en: "respuesta", atenuado: true, escala: 0.92 }]}>
      <TarjetaMarca nombre="Marca A" compras={1} comprasEn="sola" />
    </Elemento>
    <Elemento id="marcaB" x={540 + COL(4) + 235} y={820} entra={{ en: "imagina+200ms", direccion: "derecha" }}
      estados={[{ en: "texto:comprador", escala: 1.05 }, { en: "texto:comprador+350ms", escala: 1 }, { en: "primera", atenuado: true }, { en: "segunda", atenuado: false }, { en: "respuesta", escala: 1.06, contenido: <TarjetaMarca nombre="Marca B" compras={12} comprasEn="segunda" foco /> }]}>
      <TarjetaMarca nombre="Marca B" compras={12} comprasEn="segunda" />
    </Elemento>
    <Elemento id="cacA" x={540 + COL(4) - 150} y={520}>
      <Sello texto="CAC $50" en="cac" tamano={40} tono="neutro" />
    </Elemento>
    <Elemento id="cacB" x={540 + COL(4) + 320} y={520}>
      <Sello texto="CAC $50" en="cac+150ms" tamano={40} tono="neutro" rotacion={6} />
    </Elemento>
    <Elemento id="comprasA" x={540 + COL(4) - 235} y={1160} entra={{ en: "sola" }} estados={[{ en: "segunda", atenuado: true }]}>
      <CifraViva desde={0} hasta={1} llegaEn="sola" etiqueta="Compras" tamano={56} foco={false} />
    </Elemento>
    <Elemento id="comprasB" x={540 + COL(4) + 235} y={1160} entra={{ en: "segunda" }}>
      <CifraViva desde={1} hasta={12} llegaEn="meses@fin" etiqueta="Compras / año" tamano={56} />
    </Elemento>
    <Elemento id="quien" x={540 + COL(4)} y={440} entra={{ en: "invertir", direccion: "escala" }} estados={[{ en: "texto:exactamente", escala: 1.35, modo: "impacto" }]} sale={{ en: "respuesta", direccion: "escala" }}>
      <div style={{ fontFamily: tipografia.titulo, fontWeight: tipografia.tituloPeso, fontSize: 150, color: colores.acento, lineHeight: 1 }}>?</div>
    </Elemento>
    <Elemento id="gana" x={540 + COL(4) + 340} y={1050}>
      <Sello texto="Gana" en="respuesta" tamano={56} rotacion={8} />
    </Elemento>

    {/* ── 11 · La relación que mira Grüns: LTV frente a CAC ── */}
    <Elemento id="logo-ltv" x={540 + COL(5)} y={470} entra={{ en: "texto:presta", direccion: "ninguna" }} sale={{ en: "texto:fundador#2", direccion: "arriba" }}>
      <Logo alto={90} revelarEn="texto:presta" />
    </Elemento>
    <Elemento id="ltv" x={540 + COL(5) - 230} y={860} entra={{ en: "ltv", direccion: "arriba" }}
      estados={[{ en: "texto:fundador#2", x: 540 + COL(5) - 200, y: 520, escala: 0.55, atenuado: true }]}>
      <Tarjeta titulo="Valor del cliente" foco ancho={380}>
        <div style={{ fontFamily: tipografia.titulo, fontWeight: tipografia.tituloPeso, fontSize: 120, color: colores.acento, textAlign: "center", lineHeight: 1.1 }}>LTV</div>
      </Tarjeta>
    </Elemento>
    <LineaConectora desde={{ x: 540 + COL(5) - 30, y: 860 }} hasta={{ x: 540 + COL(5) + 30, y: 860 }} en="cac2" flecha={false} atenuarEn="texto:fundador#2" />
    <Elemento id="cac" x={540 + COL(5) + 230} y={860} entra={{ en: "cac2", direccion: "arriba" }}
      estados={[{ en: "texto:fundador#2", x: 540 + COL(5) + 200, y: 520, escala: 0.55, atenuado: true }]}>
      <Tarjeta titulo="Costo de adquisición" ancho={380}>
        <div style={{ fontFamily: tipografia.titulo, fontWeight: tipografia.tituloPeso, fontSize: 120, color: colores.texto, textAlign: "center", lineHeight: 1.1 }}>CAC</div>
      </Tarjeta>
    </Elemento>

    {/* ── 12 · El 3 a 1 del fundador: la misma tarjeta del beat 2 viaja hasta aquí (continuidad) ── */}
    <Elemento id="ratio" x={540 + COL(5) + 180} y={900} entra={{ en: "ratio-400ms", direccion: "escala", modo: "impacto" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ ...estiloEtiqueta(28), marginBottom: 10 }}>Mínimo</div>
        <div style={{ fontFamily: tipografia.titulo, fontWeight: tipografia.tituloPeso, fontSize: 170, color: colores.acento, lineHeight: 1, whiteSpace: "nowrap" }}>3 : 1</div>
      </div>
    </Elemento>
    <Elemento id="barras" x={540 + COL(5) + 180} y={1130} entra={{ en: "ratio@fin", direccion: "ninguna" }}>
      <BarrasRatio en="ratio@fin" />
    </Elemento>
    <Elemento id="bruto" x={540 + COL(5) - 230} y={1200}>
      <Sello texto="Sobre beneficio bruto" en="bruto" tamano={34} tono="neutro" rotacion={-4} />
    </Elemento>

    {/* ── 13–14 · Tu e-commerce: capítulo con 4 pasos, uno por palabra ── */}
    <Elemento id="tu" x={540 + COL(6)} y={760} entra={{ en: "texto:aplicar", corte: true }} estados={[{ en: "conversion-300ms", y: 470, escala: 0.62 }]}>
      <TextoMarcado texto="Aplícalo a *tu e-commerce*" en="tu" tamano={80} ancho={820} />
    </Elemento>
    {([
      ["conversion", "tendencia", "Sube la conversión"],
      ["ticket", "carrito", "Aumenta el ticket"],
      ["motivos", "regalo", "Dales motivos para volver"],
      ["retencion", "objetivo", "Trabaja la retención"],
    ] as const).map(([ancla, icono, texto], i, todos) => (
      <Elemento
        key={ancla}
        id={`paso-${ancla}`}
        x={540 + COL(6)}
        y={650 + i * 150}
        entra={{ en: `${ancla}-200ms`, direccion: "izquierda" }}
        estados={i < todos.length - 1 ? [{ en: todos[i + 1][0], atenuado: true }] : []}
      >
        <Paso n={i + 1} icono={icono} texto={texto} en={`${ancla}-200ms`} />
      </Elemento>
    ))}

    {/* ── 15–16 · Las que dominan su mercado: el cliente barato se tacha y queda invertir de forma rentable ── */}
    <Elemento id="dominan" x={540 + COL(7)} y={600} entra={{ en: "texto:porque" }} sale={{ en: "texto:adquirirlos-300ms", direccion: "arriba" }}>
      <TextoMarcado texto="Las marcas que *dominan* su mercado" en="dominan" fuente="cuerpo" tamano={60} ancho={760} />
    </Elemento>
    <Elemento id="tachado" x={540 + COL(7)} y={880} entra={{ en: "texto:necesariamente" }}>
      <Tachar texto="Clientes más baratos" reemplazo="Invertir más" en="baratos2" reemplazoEn="invertir2" tamano={84} />
    </Elemento>
    <Elemento id="rentable" x={540 + COL(7)} y={1060} entra={{ en: "texto:manera" }}>
      <TextoMarcado texto="de forma *rentable*" en="rentable" fuente="cuerpo" tamano={64} />
    </Elemento>
    <Elemento id="logo-cierre" x={540 + COL(7)} y={600} entra={{ en: "texto:adquirirlos", direccion: "escala", modo: "impacto" }}>
      <Logo alto={120} />
    </Elemento>

    {/* ── 17 · CTA: Sígueme ── */}
    <Elemento id="cta" x={540 + COL(8)} y={880} entra={{ en: "cta", corte: true }}>
      <MockupPerfil detallesEn="texto:entender" pulsaEn="texto:realmente" />
    </Elemento>
  </Lienzo>
);

// Efectos en cambios de estado (ADN §16): pocos y con motivo.
const Efectos: React.FC = () => {
  const m = useMomentos();
  return (
    <>
      <Sfx sonido="pop" en={m("gomitas")} volumen={0.7} />
      <Sfx sonido="riser" en={m("cifra") - 46} volumen={0.45} />
      <Sfx sonido="impacto" en={m("cifra")} volumen={0.8} />
      <Sfx sonido="whoosh" en={m("fundador") - 22} volumen={0.5} />
      <Sfx sonido="tic" en={m("metrica")} />
      <Sfx sonido="whoosh" en={m("mayoria") - 22} volumen={0.5} />
      <Sfx sonido="click" en={m("error")} />
      <Sfx sonido="golpe" en={m("pero")} volumen={0.8} />
      <Sfx sonido="swish" en={m("sepregunta")} />
      <Sfx sonido="ding" en={m("beneficio")} volumen={0.7} />
      <Sfx sonido="pop" en={m("tiempo@fin")} volumen={0.6} />
      <Sfx sonido="whoosh" en={m("imagina") - 22} volumen={0.5} />
      <Sfx sonido="click" en={m("cac")} />
      <Sfx sonido="pop" en={m("sola")} volumen={0.6} />
      <Sfx sonido="tic" en={m("meses")} />
      <Sfx sonido="impacto" en={m("respuesta")} volumen={0.7} />
      <Sfx sonido="whoosh" en={m("texto:presta") - 22} volumen={0.5} />
      <Sfx sonido="pop" en={m("ltv")} volumen={0.5} />
      <Sfx sonido="pop" en={m("cac2")} volumen={0.5} />
      <Sfx sonido="swish" en={m("texto:fundador#2") - 8} />
      <Sfx sonido="riser" en={m("ratio") - 46} volumen={0.4} />
      <Sfx sonido="impacto" en={m("ratio")} volumen={0.75} />
      <Sfx sonido="golpe" en={m("texto:aplicar")} volumen={0.8} />
      <Sfx sonido="click" en={m("conversion")} />
      <Sfx sonido="click" en={m("ticket")} />
      <Sfx sonido="click" en={m("motivos")} />
      <Sfx sonido="click" en={m("retencion")} />
      <Sfx sonido="whoosh" en={m("texto:porque") - 22} volumen={0.5} />
      <Sfx sonido="swish" en={m("baratos2")} />
      <Sfx sonido="ding" en={m("rentable")} volumen={0.7} />
      <Sfx sonido="golpe" en={m("cta")} volumen={0.7} />
      <Sfx sonido="whoosh" en={m("texto:entender") - 14} volumen={0.55} />
      <Sfx sonido="click" en={m("texto:realmente")} volumen={0.9} />
      <Sfx sonido="pop" en={m("texto:realmente") + 4} volumen={0.6} />
    </>
  );
};

export const GrunsLienzo: React.FC<GrunsLienzoProps> = ({ proyecto, datos, assets }) => {
  if (!datos) return null;
  return (
    <Voz datos={datos}>
      <Assets valor={assets ?? { proyecto, archivos: [] }}>
        <Intensidad modo="dinamico">
          <AbsoluteFill style={{ background: colores.fondo }}>
            <Video proyecto={proyecto} datos={datos} />
          </AbsoluteFill>
        </Intensidad>
      </Assets>
    </Voz>
  );
};
