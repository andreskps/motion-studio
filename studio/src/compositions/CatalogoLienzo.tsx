import { ANCHO } from "../lib/formato";
import { colores, estiloEtiqueta, tipografia } from "../lib/estilo";
import { comparacion, diagrama, objetoCentral } from "../lib/composiciones";
import { Intensidad } from "../lib/intensidad";
import { Elemento, Lienzo } from "../lib/lienzo";
import { EtiquetaGuia } from "../components/vocabulario/EtiquetaGuia";
import { HUD } from "../components/vocabulario/HUD";
import { IconoTrazo } from "../components/vocabulario/IconoTrazo";
import { LineaConectora } from "../components/vocabulario/LineaConectora";
import { MockupComentario, MockupMovil } from "../components/vocabulario/Mockups";
import { RastreadorPasos } from "../components/vocabulario/RastreadorPasos";
import { RejillaCantidad } from "../components/vocabulario/RejillaCantidad";
import { Tachar } from "../components/vocabulario/Tachar";
import { Sfx } from "../components/sonido/Sfx";

// Catálogo v2 (ADN 1.1): el vocabulario visual nuevo en UN solo lienzo que la cámara recorre, con HUD y rastreador
// fijos. Sirve de referencia para el director: así se construye un video sin diapositivas.

const COL = (n: number) => n * ANCHO;
const icono = diagrama(4, "horizontal");
const central = objetoCentral(4, 360, -60);

// Comparación en columnas, en la pantalla `columna` del mundo.
const composicionEn = (columna: number) => {
  const c = comparacion("columnas");
  return [
    { x: c.a.x + COL(columna), y: c.a.y, cantidad: 1, etiqueta: "Marca A", foco: false },
    { x: c.b.x + COL(columna), y: c.b.y, cantidad: 12, etiqueta: "Marca B", foco: true },
  ];
};

const Rotulo: React.FC<{ texto: string }> = ({ texto }) => <div style={{ ...estiloEtiqueta(30, colores.suave), textAlign: "center" }}>{texto}</div>;

export const CatalogoLienzo: React.FC = () => (
  <Intensidad modo="dinamico">
    <Lienzo
      camara={[
        { en: 100, x: 540 + COL(1) },
        { en: 190, x: 540 + COL(2), modo: "impacto" },
        { en: 280, x: 540 + COL(3) },
        { en: 320, objetivo: "movil", escala: 1.15 },
        { en: 370, x: 540 + COL(3), y: 960, escala: 1 },
        { en: 400, x: 540 + COL(4), corte: true },
        { en: 490, x: 540 + COL(5), escala: 1 },
      ]}
      fija={
        <>
          <RastreadorPasos
            pasos={[
              { nombre: "Cantidad", en: 4 },
              { nombre: "Conectar", en: 92 },
              { nombre: "Corregir", en: 182 },
              { nombre: "Rotular", en: 272 },
              { nombre: "Comparar", en: 400 },
              { nombre: "CTA", en: 482 },
            ]}
          />
          <HUD
            entra={8}
            derecha={{ etiqueta: "Botellas", destacado: true, valores: [{ en: 8, valor: 0 }, { en: 60, valor: 1000 }] }}
          />
          <Sfx sonido="whoosh" en={88} volumen={0.6} />
          <Sfx sonido="swish" en={178} />
          <Sfx sonido="tic" en={205} />
          <Sfx sonido="whoosh" en={268} volumen={0.6} />
          <Sfx sonido="golpe" en={400} />
          <Sfx sonido="whoosh" en={478} volumen={0.6} />
          <Sfx sonido="pop" en={540} />
        </>
      }
    >
      {/* 1 · Cantidad que se ve: 1.000 puntos y uno resaltado (foco por atenuación del resto). */}
      <Elemento id="botellas" x={540} y={900} entra={{ en: 6, direccion: "ninguna" }}>
        <RejillaCantidad cantidad={1000} columnas={40} en={6} resaltes={[{ en: 70, indices: [517], atenuarResto: true }]} />
      </Elemento>
      <Elemento id="rotulo1" x={540} y={1240} entra={{ en: 74 }}>
        <Rotulo texto="Una está envenenada" />
      </Elemento>

      {/* 2 · Iconos que se dibujan y conectores entre ideas. */}
      {icono.map((p, i) => (
        <Elemento key={i} id={`icono-${i}`} x={p.x + COL(1)} y={p.y} entra={{ en: 104 + i * 14, direccion: "escala" }}>
          <IconoTrazo nombre={(["tienda", "movil", "persona", "cafe"] as const)[i]} tamano={150} dibujarEn={104 + i * 14} foco={i === 3} />
        </Elemento>
      ))}
      {icono.slice(0, 3).map((p, i) => (
        <LineaConectora key={i} desde={{ x: p.x + COL(1) + 95, y: p.y }} hasta={{ x: icono[i + 1].x + COL(1) - 95, y: p.y }} en={118 + i * 14} curva={-40} />
      ))}

      {/* 3 · Tachar y reemplazar en la palabra que corrige. */}
      <Elemento id="tachar" x={540 + COL(2)} y={900} entra={{ en: 186, modo: "impacto" }}>
        <Tachar texto="Trámite" reemplazo="Juego" en={205} tamano={150} />
      </Elemento>

      {/* 4 · Objeto central rotulado con líneas guía, y zoom-in de la cámara. */}
      <Elemento id="movil" x={central.objeto.x + COL(3)} y={central.objeto.y} ancho={360} alto={740} entra={{ en: 276, direccion: "arriba" }}>
        <MockupMovil>
          <div style={{ ...estiloEtiqueta(24, colores.acento), marginBottom: 16 }}>Raspa y gana</div>
          <div style={{ fontFamily: tipografia.titulo, fontWeight: tipografia.tituloPeso, fontSize: 60, color: colores.acento, textAlign: "center", lineHeight: 1 }}>Café gratis</div>
        </MockupMovil>
      </Elemento>
      {["Escanea QR", "Juega", "Premio", "Reseña"].map((texto, i) => (
        <EtiquetaGuia
          key={texto}
          x={central.objeto.x + COL(3) + (i % 2 === 0 ? -150 : 150)}
          y={central.objeto.y - 230 + i * 150}
          dx={i % 2 === 0 ? -40 : 40}
          dy={-50}
          texto={texto}
          en={296 + i * 12}
          foco={i === 1}
        />
      ))}

      {/* 5 · Corte duro a una comparación: 1 compra frente a 12. */}
      {composicionEn(4).map(({ x, y, cantidad, etiqueta, foco }) => (
        <Elemento key={etiqueta} id={`comp-${etiqueta}`} x={x} y={y} entra={{ en: 400, corte: true }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>
            <div style={estiloEtiqueta(28, foco ? colores.acento : colores.suave)}>{etiqueta}</div>
            <RejillaCantidad cantidad={cantidad} columnas={3} forma="caja" celda={70} en={404} resaltes={foco ? [{ en: 440, cantidad: 12 }] : []} />
          </div>
        </Elemento>
      ))}

      {/* 6 · CTA con el comentario que se escribe solo. */}
      <Elemento id="cta" x={540 + COL(5)} y={880} entra={{ en: 486 }}>
        <MockupComentario palabra="CARTA" en={505} />
      </Elemento>
    </Lienzo>
  </Intensidad>
);
