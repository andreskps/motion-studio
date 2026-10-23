import { createContext, useContext } from "react";
import { Easing } from "remotion";
import tokens from "../../../estilo/tokens.json";

// Intensidades de movimiento del ADN §8. Se combinan dentro de un video: cada escena o momento envuelve
// su contenido en <Intensidad modo="impacto">…</Intensidad>. Sin envoltorio, rige "dinamico".
export type Modo = "editorial" | "dinamico" | "impacto";

type Curva = [number, number, number, number];
type PerfilTokens = Omit<(typeof tokens.movimiento)["dinamico"], "curvaEntrada" | "curvaSalida" | "curvaCamara"> & {
  curvaEntrada: number[];
  curvaSalida: number[];
  curvaCamara: number[];
};

export type Perfil = Omit<PerfilTokens, "curvaEntrada" | "curvaSalida" | "curvaCamara"> & {
  modo: Modo;
  curvaEntrada: (t: number) => number;
  curvaSalida: (t: number) => number;
  curvaCamara: (t: number) => number;
};

const aCurva = (c: number[]) => Easing.bezier(...(c as Curva));

const crearPerfil = (modo: Modo): Perfil => {
  const p = tokens.movimiento[modo] as PerfilTokens;
  return { ...p, modo, curvaEntrada: aCurva(p.curvaEntrada), curvaSalida: aCurva(p.curvaSalida), curvaCamara: aCurva(p.curvaCamara) };
};

export const PERFILES: Record<Modo, Perfil> = {
  editorial: crearPerfil("editorial"),
  dinamico: crearPerfil("dinamico"),
  impacto: crearPerfil("impacto"),
};

const ContextoIntensidad = createContext<Modo>("dinamico");

export const Intensidad: React.FC<{ modo: Modo; children: React.ReactNode }> = ({ modo, children }) => (
  <ContextoIntensidad.Provider value={modo}>{children}</ContextoIntensidad.Provider>
);

export const useIntensidad = (forzar?: Modo): Perfil => {
  const modo = useContext(ContextoIntensidad);
  return PERFILES[forzar ?? modo];
};
