import { colores, estiloEtiqueta, forma, tipografia } from "../../lib/estilo";
import { useEn, type Momento } from "../../lib/lienzo";
import { useAnimacion } from "../../lib/presets";
import { IconoTrazo } from "./IconoTrazo";

// Mockups de interfaz simplificados (ADN §7): solo líneas y bloques, nunca capturas reales.

/** Marco de móvil; el contenido de la pantalla va como children. */
export const MockupMovil: React.FC<{ ancho?: number; children?: React.ReactNode; foco?: boolean }> = ({ ancho = 360, children, foco = false }) => (
  <div
    style={{
      width: ancho,
      height: ancho * 2.05,
      borderRadius: ancho * 0.15,
      border: `4px solid ${foco ? colores.acento : colores.texto}`,
      background: colores.superficie,
      position: "relative",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: ancho * 0.1,
      boxSizing: "border-box",
    }}
  >
    <div style={{ position: "absolute", top: ancho * 0.05, width: ancho * 0.28, height: ancho * 0.045, borderRadius: 99, background: colores.borde }} />
    {children}
  </div>
);

type ComentarioProps = {
  // Palabra que se escribe en el comentario (la del CTA).
  palabra: string;
  // Momento en que empieza a escribirse.
  en: Momento;
  usuario?: string;
  // Momento en que se publica (sale el ✓ y el corazón). Por defecto, al terminar de escribir.
  publicaEn?: Momento;
  ancho?: number;
};

/** Comentario que se escribe letra a letra y se publica: el CTA "Comenta PALABRA" (ADN §15). */
export const MockupComentario: React.FC<ComentarioProps> = ({ palabra, en, usuario = "tu_cuenta", publicaEn, ancho = 760 }) => {
  const a = useAnimacion();
  const resolver = useEn();
  const inicio = resolver(en);
  // 2 frames por letra: se lee como escritura real sin hacerse lento.
  const letras = Math.max(0, Math.min(palabra.length, Math.floor((a.frame - inicio) / 2)));
  const fPublica = publicaEn === undefined ? inicio + palabra.length * 2 + 8 : resolver(publicaEn);
  const publicado = a.entrar({ en: fPublica, direccion: "escala" });
  const corazon = a.enfasis({ en: fPublica + 6, anticipar: false });
  const cursor = a.frame >= inicio && a.frame < fPublica && Math.floor(a.frame / 8) % 2 === 0;
  return (
    <div style={{ width: ancho, borderRadius: forma.radio, background: colores.superficie, border: `2px solid ${colores.borde}`, padding: 32, boxSizing: "border-box" }}>
      <div style={{ ...estiloEtiqueta(24), marginBottom: 20 }}>Comentarios</div>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: colores.superficieDestacada, border: `2px solid ${colores.borde}`, flexShrink: 0 }} />
        <div
          style={{
            flex: 1,
            height: 76,
            borderRadius: 999,
            border: `2px solid ${letras > 0 ? colores.acento : colores.borde}`,
            display: "flex",
            alignItems: "center",
            padding: "0 28px",
            fontFamily: tipografia.cuerpo,
            fontWeight: tipografia.cuerpoPesoFuerte,
            fontSize: 40,
            color: letras > 0 ? colores.acento : colores.tenue,
          }}
        >
          {letras > 0 ? palabra.slice(0, letras) : "Añade un comentario…"}
          {cursor ? <span style={{ color: colores.texto, marginLeft: 2 }}>|</span> : null}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 24, ...publicado }}>
        <span style={estiloEtiqueta(24, colores.suave)}>@{usuario} · ahora</span>
        <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={estiloEtiqueta(24, colores.acento)}>Publicado</span>
          <span style={{ display: "inline-block", ...corazon }}>
            <IconoTrazo nombre="corazon" tamano={44} foco />
          </span>
        </span>
      </div>
    </div>
  );
};
