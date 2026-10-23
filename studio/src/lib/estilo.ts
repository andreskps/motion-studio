import tokens from "../../../estilo/tokens.json";
import { cargarFuente } from "./fuentes";

// Paleta de marca (nombres oficiales en tokens.json) con nombres semánticos para los componentes.
// Reglas de uso en estilo/ADN.md: ~75 % fondo, ~15 % grises, ~10 % acento, y el acento solo en la idea clave.
const c = tokens.colores;
export const colores = {
  fondo: c.background,
  superficie: c.surface,
  superficie2: c.surface2,
  superficieDestacada: c.surfaceOffset,
  borde: c.border,
  divisor: c.divider,
  texto: c.text,
  suave: c.muted,
  tenue: c.faint,
  acento: c.primary,
  acentoAlt: c.primaryHover,
  acentoTenue: c.primaryDim,
  // Solo como excepción semántica puntual (una pérdida); nunca como color de marca.
  negativo: c.negativoExcepcion,
};

export const forma = tokens.forma;
export const ritmo = tokens.ritmo;

const t = tokens.tipografia;
// Pesos según lo que declara tokens.json: el titular usa el más grueso; el cuerpo, 500 si existe, y la clave, el más grueso.
const pesos = (lista: string[]) => lista.map(Number).sort((a, b) => a - b);
const pesoCuerpo = (lista: number[]) => (lista.includes(500) ? 500 : lista[0]);
export const tipografia = {
  titulo: cargarFuente(t.titulo.familia, t.titulo.pesos),
  tituloPeso: pesos(t.titulo.pesos).at(-1) ?? 800,
  cuerpo: cargarFuente(t.cuerpo.familia, t.cuerpo.pesos),
  cuerpoPeso: pesoCuerpo(pesos(t.cuerpo.pesos)),
  cuerpoPesoFuerte: pesos(t.cuerpo.pesos).at(-1) ?? 600,
  etiqueta: cargarFuente(t.etiqueta.familia, t.etiqueta.pesos, t.etiqueta.respaldo, "monospace"),
  etiquetaTracking: t.etiqueta.tracking,
};

// Estilo base de una etiqueta técnica: versalitas espaciadas en monoespaciada.
export const estiloEtiqueta = (tamano = 28, color: string = colores.suave): React.CSSProperties => ({
  fontFamily: tipografia.etiqueta,
  fontWeight: 400,
  fontSize: tamano,
  letterSpacing: tipografia.etiquetaTracking,
  textTransform: "uppercase",
  color,
});
