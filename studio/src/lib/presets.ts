import { Easing, interpolate, useCurrentFrame } from "remotion";
import tokens from "../../../estilo/tokens.json";
import { useIntensidad, type Modo, type Perfil } from "./intensidad";

// Vocabulario de animación del ADN §9. Cada preset toma duración y curva de la intensidad activa.
// Los momentos (`en`) son frames relativos a la secuencia o al lienzo que contiene el componente,
// normalmente sacados de la voz con useMomento() (lib/sincronia.ts).

export type Direccion = "arriba" | "abajo" | "izquierda" | "derecha" | "escala" | "ninguna";
export type Estilo = { opacity: number; transform: string };

const ANTICIPACION = tokens.ritmo.anticipacionFrames;
export const CURVA_CONTEO = Easing.out(Easing.cubic);

// 0 → 1 entre `inicio` y `inicio + duracion`, con la curva indicada.
export const progreso = (frame: number, inicio: number, duracion: number, curva: (t: number) => number) =>
  interpolate(frame, [inicio, inicio + Math.max(1, duracion)], [0, 1], { easing: curva, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

const desplazar = (direccion: Direccion, cantidad: number, perfil: Perfil, p: number): string => {
  const resto = 1 - p;
  switch (direccion) {
    case "arriba":
      return `translateY(${resto * cantidad}px)`;
    case "abajo":
      return `translateY(${-resto * cantidad}px)`;
    case "izquierda":
      return `translateX(${resto * cantidad}px)`;
    case "derecha":
      return `translateX(${-resto * cantidad}px)`;
    case "escala":
      return `scale(${perfil.escalaInicial + (1 - perfil.escalaInicial) * p})`;
    default:
      return "";
  }
};

// Une estilos: multiplica opacidades y encadena transformaciones.
export const combinar = (...estilos: Partial<Estilo>[]): Estilo => ({
  opacity: estilos.reduce((o, e) => o * (e.opacity ?? 1), 1),
  transform: estilos.map((e) => e.transform ?? "").filter(Boolean).join(" ") || "none",
});

type OpcionesMomento = {
  en: number;
  // Por defecto la animación "llega" en el momento: empieza unos frames antes (ADN §13). false = empieza justo en `en`.
  anticipar?: boolean;
  modo?: Modo;
};

const inicioDe = ({ en, anticipar = true }: OpcionesMomento) => en - (anticipar ? ANTICIPACION : 0);

export const useAnimacion = (modo?: Modo) => {
  const frame = useCurrentFrame();
  const perfil = useIntensidad(modo);

  return {
    frame,
    perfil,

    /** Entrar: aparece con desplazamiento semántico (sube por defecto). */
    entrar: (o: OpcionesMomento & { direccion?: Direccion; distancia?: number }): Estilo => {
      const p = progreso(frame, inicioDe(o), perfil.entrada, perfil.curvaEntrada);
      return { opacity: Math.min(1, p * 1.4), transform: desplazar(o.direccion ?? "arriba", o.distancia ?? perfil.desplazamiento, perfil, p) || "none" };
    },

    /** Salir: se va en la dirección indicada (por defecto baja un poco y se desvanece). */
    salir: (o: OpcionesMomento & { direccion?: Direccion; distancia?: number }): Estilo => {
      const p = progreso(frame, o.en, perfil.salida, perfil.curvaSalida);
      const d = o.distancia ?? perfil.desplazamiento * 0.5;
      const t =
        o.direccion === "escala"
          ? `scale(${1 - (1 - perfil.escalaInicial) * p})`
          : o.direccion === "izquierda"
            ? `translateX(${-p * d}px)`
            : o.direccion === "derecha"
              ? `translateX(${p * d}px)`
              : o.direccion === "arriba"
                ? `translateY(${-p * d}px)`
                : o.direccion === "ninguna"
                  ? ""
                  : `translateY(${p * d}px)`;
      return { opacity: 1 - p, transform: t || "none" };
    },

    /** Retraso del elemento i de un grupo (revelado escalonado). */
    escalonado: (i: number, cada?: number) => i * (cada ?? perfil.escalonado),

    /** Énfasis: pulso de escala breve que vuelve a 1. */
    enfasis: (o: OpcionesMomento): Estilo => {
      const p = progreso(frame, inicioDe(o), perfil.entrada * 2, (t) => t);
      return { opacity: 1, transform: `scale(${1 + (perfil.enfasis - 1) * Math.sin(Math.PI * p)})` };
    },

    /** Énfasis de escala: crece y se queda grande (pasa a ser protagonista). */
    escalaEnfasis: (o: OpcionesMomento & { escala?: number }): Estilo => {
      const p = progreso(frame, inicioDe(o), perfil.entrada, perfil.curvaEntrada);
      return { opacity: 1, transform: `scale(${1 + ((o.escala ?? perfil.enfasis) - 1) * p})` };
    },

    /** Atenuar desde `en` (y opcionalmente volver a resaltar en `hasta`). Devuelve la opacidad. */
    atenuar: (o: OpcionesMomento & { hasta?: number; nivel?: number }): number => {
      const nivel = o.nivel ?? tokens.ritmo.opacidadAtenuada;
      const baja = progreso(frame, o.en, perfil.atenuar, perfil.curvaEntrada);
      const sube = o.hasta === undefined ? 0 : progreso(frame, o.hasta, perfil.atenuar, perfil.curvaEntrada);
      return 1 - (1 - nivel) * (baja - sube);
    },

    /** Dibujo progresivo: 0 → 1 para strokeDashoffset (usa pathLength={1} y strokeDasharray={1}). */
    dibujar: (o: OpcionesMomento & { duracion?: number }): number => progreso(frame, inicioDe(o), o.duracion ?? perfil.dibujo, perfil.curvaEntrada),

    /** Contador: valor entre `desde` y `hasta`. Con `llegaEn`, termina justo cuando se dice el número. */
    contar: (o: { desde?: number; hasta: number; en?: number; llegaEn?: number; duracion?: number }): number => {
      const duracion = o.duracion ?? perfil.contador;
      const inicio = o.llegaEn !== undefined ? o.llegaEn - duracion : (o.en ?? 0);
      const desde = o.desde ?? 0;
      // Curva propia sin rebote: el número llega a su valor exactamente al final, ni antes ni pasándose.
      return desde + (o.hasta - desde) * progreso(frame, inicio, duracion, CURVA_CONTEO);
    },

    /** Reemplazar: el saliente se va y el entrante ocupa su sitio, cruzados. */
    reemplazar: (o: OpcionesMomento & { direccion?: "arriba" | "abajo" }): { saliente: Estilo; entrante: Estilo } => {
      const inicio = inicioDe(o);
      const pSale = progreso(frame, inicio, perfil.salida, perfil.curvaSalida);
      const pEntra = progreso(frame, inicio + Math.round(perfil.salida * 0.5), perfil.entrada, perfil.curvaEntrada);
      const signo = o.direccion === "abajo" ? -1 : 1;
      const d = perfil.desplazamiento * 0.6;
      return {
        saliente: { opacity: 1 - pSale, transform: `translateY(${-signo * pSale * d}px)` },
        entrante: { opacity: pEntra, transform: `translateY(${signo * (1 - pEntra) * d}px)` },
      };
    },

    /** Progreso genérico con la curva de entrada de la intensidad (para animaciones a medida). */
    avance: (o: OpcionesMomento & { duracion?: number }): number => progreso(frame, inicioDe(o), o.duracion ?? perfil.entrada, perfil.curvaEntrada),
  };
};
