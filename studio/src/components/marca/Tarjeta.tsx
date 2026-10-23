import { colores, estiloEtiqueta, forma } from "../../lib/estilo";

type Props = {
  // Cabecera tipo ventana con rótulo mono ("FUNDADOR", "INBOX", "@GRÜNS").
  titulo?: string;
  // En foco: contorno y sombra en el acento (la idea clave).
  foco?: boolean;
  ancho?: number | string;
  relleno?: number;
  children?: React.ReactNode;
  estilo?: React.CSSProperties;
  // Opacidad de la cabecera (0 la oculta sin cambiar el tamaño de la tarjeta).
  opacidadCabecera?: number;
};

// Tarjeta del sistema visual (ADN §7, de saasyass adaptado a oscuro): contorno claro grueso y sombra sólida
// desplazada, sin desenfoque. Es el "marco" de fotos, logos, mockups y datos.
export const Tarjeta: React.FC<Props> = ({ titulo, foco = false, ancho, relleno = 28, children, estilo, opacidadCabecera = 1 }) => (
  <div
    style={{
      width: ancho,
      background: colores.superficie,
      border: `3px solid ${foco ? colores.acento : colores.texto}`,
      borderRadius: forma.radio * 0.6,
      boxShadow: `10px 10px 0 0 ${foco ? colores.acentoAlt : colores.superficieDestacada}`,
      overflow: "hidden",
      ...estilo,
    }}
  >
    {titulo ? (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "14px 20px",
          opacity: opacidadCabecera,
          borderBottom: `3px solid ${foco ? colores.acento : colores.texto}`,
          ...estiloEtiqueta(24, foco ? colores.acento : colores.texto),
        }}
      >
        <span style={{ width: 12, height: 12, borderRadius: "50%", background: foco ? colores.acento : colores.texto }} />
        {titulo}
      </div>
    ) : null}
    <div style={{ padding: relleno }}>{children}</div>
  </div>
);

/** Marcador de un asset que todavía no existe: visible a propósito, para saber qué falta añadir. */
export const MarcadorAsset: React.FC<{ nombre: string; ancho: number; alto: number }> = ({ nombre, ancho, alto }) => (
  <div
    style={{
      width: ancho,
      height: alto,
      border: `3px dashed ${colores.tenue}`,
      borderRadius: 12,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      background: colores.superficie2,
      textAlign: "center",
    }}
  >
    <div style={estiloEtiqueta(22, colores.tenue)}>Falta</div>
    <div style={estiloEtiqueta(26, colores.suave)}>{nombre}</div>
  </div>
);
