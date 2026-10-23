import { Img, interpolate, staticFile } from "remotion";
import { colores, estiloEtiqueta, tipografia } from "../../lib/estilo";
import { useEn, type Momento } from "../../lib/lienzo";
import { creador } from "../../lib/perfil";
import { PERFILES } from "../../lib/intensidad";
import { progreso, useAnimacion } from "../../lib/presets";
import { IconoTrazo } from "../vocabulario/IconoTrazo";
import { Tarjeta } from "./Tarjeta";

// Usuario, propuesta, foto, iniciales y pie salen de estilo/perfil.json si no se pasan.
type Props = {
  usuario?: string;
  // Propuesta bajo el usuario ("Cómo crecen de verdad las grandes marcas de e-commerce").
  bio?: string;
  // Foto del creador (ruta en studio/public, p. ej. "marca/creador.jpg"). Sin foto, iniciales.
  foto?: string;
  iniciales?: string;
  // Línea mono bajo el botón ("Nuevos videos cada semana").
  pie?: string;
  // Momento en que el cursor pulsa "Seguir".
  pulsaEn: Momento;
  // Hasta este momento solo se ve la foto (primer plano); el resto de la tarjeta se construye al llegar.
  detallesEn?: Momento;
  ancho?: number;
};

// Dimensiones fijas del diseño: la composición usa el centro de la foto para el primer plano de cámara.
export const PERFIL_AVATAR = 240;

/** CTA "Sígueme" (ADN §15): perfil con la foto del creador; un cursor entra y pulsa Seguir en su palabra. */
export const MockupPerfil: React.FC<Props> = ({ usuario = creador.usuario, bio = creador.bio, foto = creador.foto || undefined, iniciales = creador.iniciales, pie = creador.pie, pulsaEn, detallesEn, ancho = 760 }) => {
  const a = useAnimacion();
  const resolver = useEn();
  const f = resolver(pulsaEn);
  const impacto = PERFILES.impacto;
  const pulsado = a.frame >= f;
  // Construcción de la tarjeta alrededor de la foto: escalonada, mientras la cámara se aleja.
  const fd = detallesEn === undefined ? -999 : resolver(detallesEn);
  const detalle = (i: number) => a.entrar({ en: fd - 8 + i * a.perfil.escalonado * 2, direccion: "arriba", distancia: 24 });
  const marco = detallesEn === undefined ? 1 : progreso(a.frame, fd - 10, 12, impacto.curvaEntrada);

  // Cursor: llega desde abajo a la derecha y toca el botón justo en el momento.
  const llegada = progreso(a.frame, f - 20, 18, impacto.curvaCamara);
  const cursorSale = progreso(a.frame, f + 24, 10, impacto.curvaSalida);
  const presion = interpolate(a.frame, [f - 2, f, f + 4], [1, 0.94, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // Onda de la pulsación en el botón y latido del aro de la foto.
  const onda = progreso(a.frame, f, 16, impacto.curvaEntrada);
  const latido = progreso(a.frame, f + 2, 22, impacto.curvaEntrada);
  // +1 que sube desde el botón.
  const masUno = progreso(a.frame, f + 3, 26, impacto.curvaEntrada);

  return (
    <Tarjeta titulo="Perfil" foco={pulsado} ancho={ancho} relleno={40} opacidadCabecera={marco} estilo={{ borderColor: marco < 1 ? `color-mix(in srgb, ${colores.texto} ${marco * 100}%, transparent)` : undefined, boxShadow: marco < 1 ? "none" : undefined, background: marco < 1 ? "transparent" : undefined }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <div style={{ position: "relative", width: PERFIL_AVATAR, height: PERFIL_AVATAR }}>
          {pulsado ? (
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                border: `6px solid ${colores.acento}`,
                transform: `scale(${1 + latido * 0.35})`,
                opacity: 1 - latido,
              }}
            />
          ) : null}
          <div style={{ width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", border: `6px solid ${colores.acento}`, background: colores.superficie2, boxSizing: "border-box" }}>
            {foto ? (
              <Img src={staticFile(foto)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: tipografia.titulo, fontWeight: tipografia.tituloPeso, fontSize: 80, color: colores.acento }}>
                {iniciales}
              </div>
            )}
          </div>
        </div>
        <div style={{ fontFamily: tipografia.titulo, fontWeight: tipografia.tituloPeso, fontSize: 50, color: colores.texto, marginTop: 26, ...detalle(0) }}>@{usuario}</div>
        <div style={{ fontFamily: tipografia.cuerpo, fontWeight: tipografia.cuerpoPeso, fontSize: 32, color: colores.suave, marginTop: 10, lineHeight: 1.3, maxWidth: ancho - 140, ...detalle(1) }}>{bio}</div>

        <div style={{ position: "relative", width: "100%", marginTop: 34, ...detalle(2) }}>
          <div
            style={{
              height: 104,
              borderRadius: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 14,
              background: pulsado ? colores.superficie2 : colores.acento,
              border: `3px solid ${colores.acento}`,
              fontFamily: tipografia.titulo,
              fontWeight: tipografia.tituloPeso,
              fontSize: 48,
              color: pulsado ? colores.acento : colores.fondo,
              transform: `scale(${presion})`,
              overflow: "hidden",
              position: "relative",
            }}
          >
            {pulsado ? (
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  background: colores.acentoTenue,
                  transform: `translate(-50%, -50%) scale(${onda * 7})`,
                  opacity: 1 - onda,
                }}
              />
            ) : null}
            {pulsado ? <IconoTrazo nombre="check" tamano={46} foco dibujarEn={f} /> : null}
            {pulsado ? "Siguiendo" : "Seguir"}
          </div>
          {masUno > 0 && masUno < 1 ? (
            <div
              style={{
                position: "absolute",
                right: 40,
                top: -10,
                fontFamily: tipografia.titulo,
                fontWeight: tipografia.tituloPeso,
                fontSize: 64,
                color: colores.acento,
                transform: `translateY(${-masUno * 110}px)`,
                opacity: interpolate(masUno, [0, 0.15, 0.7, 1], [0, 1, 1, 0]),
              }}
            >
              +1
            </div>
          ) : null}
          {llegada > 0 && cursorSale < 1 ? (
            <svg
              width={70}
              height={70}
              viewBox="0 0 24 24"
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: `translate(${(1 - llegada) * 320 + 10}px, ${(1 - llegada) * 260 + 6}px) scale(${presion})`,
                opacity: (1 - cursorSale) * Math.min(1, llegada * 3),
                filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.6))",
              }}
            >
              <path d="M4 2l15 9-6.5 1.5L16 20l-3 1.5-3.5-7.5L4 19z" fill={colores.texto} stroke={colores.fondo} strokeWidth={1.4} strokeLinejoin="round" />
            </svg>
          ) : null}
        </div>
        <div style={{ ...estiloEtiqueta(22), marginTop: 22, ...detalle(3) }}>{pie}</div>
      </div>
    </Tarjeta>
  );
};
