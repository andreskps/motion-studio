import { formatoNumero } from "../../lib/animacion";
import { colores, estiloEtiqueta, tipografia } from "../../lib/estilo";
import { ZONAS } from "../../lib/composiciones";
import { ZONA_SEGURA } from "../../lib/formato";
import { useEn, type Momento } from "../../lib/lienzo";
import { useAnimacion } from "../../lib/presets";

type Valor = { en: Momento; valor: number };

export type Contador = {
  etiqueta: string;
  // Cada cambio de valor cuenta desde el anterior y llega al nuevo en su momento de la voz.
  valores: Valor[];
  prefijo?: string;
  sufijo?: string;
  decimales?: number;
  // El que importa va en el acento (ADN: un solo foco).
  destacado?: boolean;
};

type Props = {
  izquierda?: Contador;
  derecha?: Contador;
  entra?: Momento;
};

const Lado: React.FC<{ contador: Contador; alineacion: "left" | "right"; entra: number }> = ({ contador, alineacion, entra }) => {
  const a = useAnimacion();
  const resolver = useEn();
  const aparicion = a.entrar({ en: entra, direccion: "abajo", distancia: 20 });
  const valores = contador.valores.map((v) => ({ ...v, f: resolver(v.en) })).sort((x, y) => x.f - y.f);
  // Valor actual: encadena los conteos entre valores sucesivos.
  let valor = valores[0]?.valor ?? 0;
  let golpe = { opacity: 1, transform: "none" };
  for (let i = 1; i < valores.length; i++) {
    if (a.frame >= valores[i].f - a.perfil.contador) {
      valor = a.contar({ desde: valores[i - 1].valor, hasta: valores[i].valor, llegaEn: valores[i].f });
      if (a.frame >= valores[i].f) golpe = a.enfasis({ en: valores[i].f, anticipar: false });
    }
  }
  return (
    <div style={{ textAlign: alineacion, ...aparicion }}>
      <div style={estiloEtiqueta(24)}>{contador.etiqueta}</div>
      <div
        style={{
          fontFamily: tipografia.etiqueta,
          fontSize: 58,
          color: contador.destacado ? colores.acento : colores.texto,
          fontVariantNumeric: "tabular-nums",
          display: "inline-block",
          transformOrigin: alineacion === "left" ? "left center" : "right center",
          ...golpe,
        }}
      >
        {contador.prefijo}
        {formatoNumero(valor, contador.decimales)}
        {contador.sufijo}
      </div>
    </div>
  );
};

// HUD de contadores (ADN §7, de "500 botellas"): etiqueta mono + número que cambia en vivo. Va en la capa fija.
export const HUD: React.FC<Props> = ({ izquierda, derecha, entra = 0 }) => {
  const resolver = useEn();
  const f = resolver(entra);
  return (
    <div style={{ position: "absolute", top: ZONAS.hud.y - 60, left: 72, right: ZONA_SEGURA.derecha, display: "flex", justifyContent: "space-between" }}>
      <div>{izquierda ? <Lado contador={izquierda} alineacion="left" entra={f} /> : null}</div>
      <div>{derecha ? <Lado contador={derecha} alineacion="right" entra={f} /> : null}</div>
    </div>
  );
};
