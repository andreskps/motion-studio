import { Children, isValidElement } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import tokens from "../../../estilo/tokens.json";
import { FondoAnimado } from "../components/efectos/FondoAnimado";
import { colores } from "./estilo";
import { ALTO, ANCHO } from "./formato";
import { PERFILES, useIntensidad, type Modo, type Perfil } from "./intensidad";
import { progreso, type Direccion } from "./presets";
import { resolverMomento, useVozOpcional } from "./sincronia";

// Lienzo persistente (ADN §4–§5, §10): un mundo con línea de tiempo absoluta donde los elementos entran, se quedan,
// se transforman, se atenúan y salen, y por el que se mueve la cámara. El video deja de ser una serie de diapositivas.
//
// Coordenadas del mundo: con la cámara en reposo (x 540, y 960, escala 1) coinciden con las del cuadro 1080×1920.
// Un elemento puede vivir fuera del cuadro (x 1800) y la cámara ir a buscarlo.
// Los momentos (`en`) aceptan frames o referencias de la voz ("cifra", "cifra@fin", "texto:diez#2", "cifra+200ms").

export type Momento = number | string;

const OPACIDAD_ATENUADA = tokens.ritmo.opacidadAtenuada;
const ANTICIPACION = tokens.ritmo.anticipacionFrames;

export type EstadoElemento = {
  en: Momento;
  x?: number;
  y?: number;
  escala?: number;
  rotacion?: number;
  opacidad?: number;
  // Atajos de foco: atenuado baja a ~25 %, false lo devuelve a 1.
  atenuado?: boolean;
  // Contenido nuevo: se cruza con el anterior en el mismo sitio (reemplazar / transformar).
  contenido?: React.ReactNode;
  modo?: Modo;
  duracion?: number;
  // Cambio instantáneo (corte duro).
  corte?: boolean;
};

type Aparicion = { en: Momento; direccion?: Direccion; modo?: Modo; corte?: boolean };

export type ElementoProps = {
  id: string;
  x: number;
  y: number;
  ancho?: number;
  alto?: number;
  escala?: number;
  rotacion?: number;
  entra?: Aparicion;
  sale?: Aparicion;
  estados?: EstadoElemento[];
  // Orden de capa (mayor = encima).
  capa?: number;
  children?: React.ReactNode;
};

export type Toma = {
  en: Momento;
  x?: number;
  y?: number;
  escala?: number;
  // Encuadra el elemento con este id, donde esté en ese momento.
  objetivo?: string;
  modo?: Modo;
  duracion?: number;
  corte?: boolean;
};

type Resolver = (m: Momento) => number;

// La voz es opcional: un lienzo también funciona solo con frames.
const useResolver = (): Resolver => {
  const { fps } = useVideoConfig();
  const voz = useVozOpcional();
  return (m) => {
    if (typeof m === "number") return m;
    if (!voz) throw new Error(`El momento "${m}" es de la voz, pero no hay <Voz> alrededor del lienzo`);
    return resolverMomento(m, voz, fps);
  };
};

type Estado = { x: number; y: number; escala: number; rotacion: number; opacidad: number };

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Estado geométrico de un elemento en un frame, aplicando sus cambios de estado en orden. */
export const estadoEn = (props: ElementoProps, frame: number, resolver: Resolver, modoBase: Modo) => {
  let estado: Estado = { x: props.x, y: props.y, escala: props.escala ?? 1, rotacion: props.rotacion ?? 0, opacidad: 1 };
  let contenido: React.ReactNode = props.children;
  let contenidoAnterior: React.ReactNode = null;
  let cruce = 1;
  const cambios = [...(props.estados ?? [])].map((e) => ({ ...e, f: resolver(e.en) })).sort((a, b) => a.f - b.f);
  for (const cambio of cambios) {
    const perfil = PERFILES[cambio.modo ?? modoBase];
    const duracion = cambio.corte ? 0 : (cambio.duracion ?? Math.round(perfil.entrada * 1.6));
    const inicio = cambio.f - (cambio.corte ? 0 : ANTICIPACION);
    const p = duracion === 0 ? (frame >= inicio ? 1 : 0) : progreso(frame, inicio, duracion, perfil.curvaCamara);
    const destino: Estado = {
      x: cambio.x ?? estado.x,
      y: cambio.y ?? estado.y,
      escala: cambio.escala ?? estado.escala,
      rotacion: cambio.rotacion ?? estado.rotacion,
      opacidad: cambio.opacidad ?? (cambio.atenuado === true ? OPACIDAD_ATENUADA : cambio.atenuado === false ? 1 : estado.opacidad),
    };
    estado = {
      x: lerp(estado.x, destino.x, p),
      y: lerp(estado.y, destino.y, p),
      escala: lerp(estado.escala, destino.escala, p),
      rotacion: lerp(estado.rotacion, destino.rotacion, p),
      opacidad: lerp(estado.opacidad, destino.opacidad, p),
    };
    if (cambio.contenido !== undefined && frame >= inicio) {
      contenidoAnterior = p < 1 ? contenido : null;
      contenido = cambio.contenido;
      cruce = p;
    }
  }
  return { estado, contenido, contenidoAnterior, cruce };
};

const transformarAparicion = (direccion: Direccion | undefined, p: number, perfil: Perfil, saliendo: boolean) => {
  const d = perfil.desplazamiento * (saliendo ? 0.5 : 1);
  const resto = 1 - p;
  switch (direccion ?? "arriba") {
    case "arriba":
      return `translateY(${(saliendo ? -1 : 1) * resto * d}px)`;
    case "abajo":
      return `translateY(${(saliendo ? 1 : -1) * resto * d}px)`;
    case "izquierda":
      return `translateX(${(saliendo ? -1 : 1) * resto * d}px)`;
    case "derecha":
      return `translateX(${(saliendo ? 1 : -1) * resto * d}px)`;
    case "escala":
      return `scale(${perfil.escalaInicial + (1 - perfil.escalaInicial) * p})`;
    default:
      return "";
  }
};

/** Elemento persistente del lienzo. Debe ser hijo directo de <Lienzo> para que la cámara pueda encuadrarlo. */
export const Elemento: React.FC<ElementoProps> = (props) => {
  const frame = useCurrentFrame();
  const resolver = useResolver();
  const { modo } = useIntensidad();
  const { estado, contenido, contenidoAnterior, cruce } = estadoEn(props, frame, resolver, modo);

  // Entrada y salida.
  let visible = 1;
  let transformAparicion = "";
  if (props.entra) {
    const perfil = PERFILES[props.entra.modo ?? modo];
    const f = resolver(props.entra.en);
    const p = props.entra.corte ? (frame >= f ? 1 : 0) : progreso(frame, f - ANTICIPACION, perfil.entrada, perfil.curvaEntrada);
    if (p <= 0) return null;
    visible *= Math.min(1, p * 1.4);
    transformAparicion = transformarAparicion(props.entra.direccion, p, perfil, false);
  }
  if (props.sale) {
    const perfil = PERFILES[props.sale.modo ?? modo];
    const f = resolver(props.sale.en);
    const p = props.sale.corte ? (frame >= f ? 1 : 0) : progreso(frame, f, perfil.salida, perfil.curvaSalida);
    if (p >= 1) return null;
    if (p > 0) {
      visible *= 1 - p;
      transformAparicion += " " + transformarAparicion(props.sale.direccion ?? "abajo", 1 - p, perfil, true);
    }
  }

  const capa: React.CSSProperties = { position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" };
  return (
    <div
      style={{
        position: "absolute",
        left: estado.x,
        top: estado.y,
        // Sin ancho fijo, el del contenido: un elemento lejos del primer cuadro (x 2700) tendría 0 px disponibles
        // y el navegador partiría su texto palabra por palabra.
        width: props.ancho ?? "max-content",
        height: props.alto,
        zIndex: props.capa,
        opacity: estado.opacidad * visible,
        transform: `translate(-50%, -50%) ${transformAparicion} scale(${estado.escala}) rotate(${estado.rotacion}deg)`,
      }}
    >
      {contenidoAnterior !== null ? (
        <div style={{ ...capa, position: props.ancho ? "absolute" : "relative", opacity: 1 - cruce }}>{contenidoAnterior}</div>
      ) : null}
      <div
        style={{
          ...(props.ancho ? capa : { position: "relative" }),
          opacity: contenidoAnterior !== null ? cruce : 1,
          ...(contenidoAnterior !== null && !props.ancho ? { position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)" } : {}),
        }}
      >
        {contenido}
      </div>
    </div>
  );
};

type EstadoCamara = { x: number; y: number; escala: number };

const camaraEn = (tomas: Toma[], frame: number, resolver: Resolver, elementos: Map<string, ElementoProps>, modoBase: Modo): EstadoCamara => {
  let camara: EstadoCamara = { x: ANCHO / 2, y: ALTO / 2, escala: 1 };
  const ordenadas = tomas.map((t) => ({ ...t, f: resolver(t.en) })).sort((a, b) => a.f - b.f);
  for (const toma of ordenadas) {
    const perfil = PERFILES[toma.modo ?? modoBase];
    const duracion = toma.corte ? 0 : (toma.duracion ?? perfil.camara);
    // La cámara llega a su destino en la palabra (ADN §13): empieza `duracion` frames antes.
    const inicio = toma.f - duracion;
    let destino: EstadoCamara = { x: toma.x ?? camara.x, y: toma.y ?? camara.y, escala: toma.escala ?? camara.escala };
    if (toma.objetivo) {
      const el = elementos.get(toma.objetivo);
      if (!el) throw new Error(`La cámara busca el elemento "${toma.objetivo}", que no está en el lienzo`);
      const { estado } = estadoEn(el, toma.f, resolver, modoBase);
      const escalaAjustada = el.ancho ? Math.min(2.5, Math.max(0.6, (ANCHO * 0.78) / (el.ancho * estado.escala))) : 1.6;
      destino = { x: toma.x ?? estado.x, y: toma.y ?? estado.y, escala: toma.escala ?? escalaAjustada };
    }
    const p = duracion === 0 ? (frame >= inicio ? 1 : 0) : progreso(frame, inicio, duracion, perfil.curvaCamara);
    camara = { x: lerp(camara.x, destino.x, p), y: lerp(camara.y, destino.y, p), escala: lerp(camara.escala, destino.escala, p) };
  }
  return camara;
};

type LienzoProps = {
  children: React.ReactNode;
  camara?: Toma[];
  // Fondo del mundo (ADN §17: cuadrícula tenue). Se mueve con la cámara a media velocidad (paralaje).
  fondo?: "cuadricula" | "puntos" | "liso";
  // Capa fija encima del mundo: HUD, subtítulos. No se mueve con la cámara.
  fija?: React.ReactNode;
};

const transformarMundo = (c: EstadoCamara) => `translate(${ANCHO / 2}px, ${ALTO / 2}px) scale(${c.escala}) translate(${-c.x}px, ${-c.y}px)`;

export const Lienzo: React.FC<LienzoProps> = ({ children, camara = [], fondo = "cuadricula", fija }) => {
  const frame = useCurrentFrame();
  const resolver = useResolver();
  const { modo } = useIntensidad();
  const elementos = new Map<string, ElementoProps>();
  Children.forEach(children, (hijo) => {
    if (isValidElement<ElementoProps>(hijo) && hijo.type === Elemento) elementos.set(hijo.props.id, hijo.props);
  });
  const c = camaraEn(camara, frame, resolver, elementos, modo);
  // Paralaje: el fondo recorre la mitad del camino de la cámara, para dar profundidad sin marear.
  const cFondo = { x: ANCHO / 2 + (c.x - ANCHO / 2) * 0.5, y: ALTO / 2 + (c.y - ALTO / 2) * 0.5, escala: 1 + (c.escala - 1) * 0.5 };
  const capaMundo: React.CSSProperties = { position: "absolute", left: 0, top: 0, width: ANCHO, height: ALTO, transformOrigin: "0 0" };
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: colores.fondo }}>
      {fondo !== "liso" ? (
        <div style={{ ...capaMundo, transform: transformarMundo(cFondo) }}>
          {/* El fondo cubre el triple del cuadro para que la cámara nunca le vea el borde. */}
          <div style={{ position: "absolute", left: -ANCHO, top: -ALTO, width: ANCHO * 3, height: ALTO * 3 }}>
            <FondoAnimado variante={fondo} vineta={false} />
          </div>
        </div>
      ) : null}
      {/* Viñeteado fijo a la pantalla: la cuadrícula se desvanece hacia los bordes del cuadro, no del mundo. */}
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, transparent 30%, ${colores.fondo} 78%)` }} />
      <div style={{ ...capaMundo, transform: transformarMundo(c) }}>{children}</div>
      {fija}
    </AbsoluteFill>
  );
};

/** Momento de la voz o frame → frame (para usar dentro de elementos del lienzo). */
export const useEn = () => useResolver();
