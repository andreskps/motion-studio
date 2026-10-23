import { createContext, useContext } from "react";

// Assets de marca del proyecto (pipeline/assets.py → studio/public/proyectos/<slug>/assets/assets.json).
// Si un asset no existe, los componentes muestran un marcador visible ("FALTA · logo.png"), nunca una imagen inventada.

export type ArchivoAsset = { nombre: string; tipo: "imagen" | "video"; ancho: number | null; alto: number | null };
export type AssetsProyecto = { proyecto: string; archivos: ArchivoAsset[] };

const ContextoAssets = createContext<AssetsProyecto | null>(null);

export const Assets: React.FC<{ valor: AssetsProyecto; children: React.ReactNode }> = ({ valor, children }) => (
  <ContextoAssets.Provider value={valor}>{children}</ContextoAssets.Provider>
);

/** Carga la lista de assets de un proyecto (para calculateMetadata). Sin lista, devuelve una vacía. */
export const cargarAssets = async (proyecto: string, staticFile: (ruta: string) => string): Promise<AssetsProyecto> => {
  try {
    const r = await fetch(staticFile(`proyectos/${proyecto}/assets/assets.json`));
    if (!r.ok) return { proyecto, archivos: [] };
    const datos = (await r.json()) as { archivos: ArchivoAsset[] };
    return { proyecto, archivos: datos.archivos };
  } catch {
    return { proyecto, archivos: [] };
  }
};

/** Ruta pública del asset si existe, o null. Acepta el nombre con o sin extensión ("logo" encuentra "logo.png"). */
export const useAsset = (nombre: string): { src: string | null; archivo: ArchivoAsset | null } => {
  const assets = useContext(ContextoAssets);
  if (!assets) return { src: null, archivo: null };
  const archivo =
    assets.archivos.find((a) => a.nombre === nombre) ?? assets.archivos.find((a) => a.nombre.replace(/\.[^.]+$/, "") === nombre) ?? null;
  return { src: archivo ? `proyectos/${assets.proyecto}/assets/${archivo.nombre}` : null, archivo };
};
