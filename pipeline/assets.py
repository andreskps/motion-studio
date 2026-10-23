"""Assets de un proyecto: plan, verificación de lo que carga el usuario y sincronización con el estudio.

Uso: python pipeline/assets.py proyectos/<slug>
     (procesar_audio.py también lo hace al terminar)

1. Si existe proyectos/<slug>/assets/plan.json (lo escribe el director al planificar), verifica cada asset del plan:
   si falta, si necesita transparencia y no la tiene, si es demasiado pequeño. Si llega en otro formato
   (webp, avif, jpg…) y el plan pide PNG, lo convierte. Escribe plan.md, legible, con los prompts y el estado.
2. Copia proyectos/<slug>/assets/* a studio/public/proyectos/<slug>/assets/ y escribe assets.json con lo que hay
   (nombre, tipo, tamaño), para que la composición use el asset real si existe y su respaldo si falta.

Reglas de origen (estilo/prompts-imagen.md): logos, productos y personas reales nunca se generan con IA;
metáforas, objetos genéricos y escenas explicativas, sí, con los bloques de estilo de esa guía.
Sin b-roll: el ADN no usa clips de video; todo va integrado en el lienzo.
"""

import sys
import argparse
import json
import re
import shutil
import subprocess
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
IMAGEN = {".png", ".jpg", ".jpeg", ".webp", ".svg", ".avif"}
VIDEO = {".mp4", ".mov", ".webm"}
CONVERTIBLES = {".webp", ".avif", ".jpg", ".jpeg", ".heic", ".bmp", ".tif", ".tiff"}
FORMATOS_CON_ALFA = {"rgba", "argb", "bgra", "abgr", "ya8", "ya16be", "ya16le", "rgba64be", "rgba64le", "yuva420p", "yuva444p", "pal8"}


def dimensiones_svg(archivo: Path) -> tuple[int | None, int | None]:
    """Tamaño de un SVG por su viewBox (o width/height): ffprobe no lo lee."""
    cabecera = archivo.read_text(encoding="utf-8", errors="replace")[:2000]
    caja = re.search(r'viewBox="\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)\s*"', cabecera)
    if caja:
        return round(float(caja.group(1))), round(float(caja.group(2)))
    ancho = re.search(r'\swidth="([\d.]+)', cabecera)
    alto = re.search(r'\sheight="([\d.]+)', cabecera)
    return (round(float(ancho.group(1))), round(float(alto.group(1)))) if ancho and alto else (None, None)


def sondear(archivo: Path) -> dict:
    if archivo.suffix.lower() == ".svg":
        ancho, alto = dimensiones_svg(archivo)
        return {"ancho": ancho, "alto": alto, "alfa": True}
    salida = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height,pix_fmt", "-of", "json", str(archivo)],
        capture_output=True,
        text=True,
    ).stdout
    try:
        s = json.loads(salida)["streams"][0]
        return {"ancho": s.get("width"), "alto": s.get("height"), "alfa": s.get("pix_fmt") in FORMATOS_CON_ALFA}
    except (KeyError, IndexError, json.JSONDecodeError):
        return {"ancho": None, "alto": None, "alfa": False}


def dimensiones(archivo: Path) -> tuple[int | None, int | None]:
    info = sondear(archivo)
    return info["ancho"], info["alto"]


def convertir_a_png(origen: Path, destino: Path) -> None:
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(origen), "-frames:v", "1", str(destino)], check=True)


def buscar_cargado(carpeta: Path, archivo: str) -> Path | None:
    """El archivo con el nombre exacto del plan o, si no, cualquiera con el mismo nombre y otra extensión."""
    exacto = carpeta / archivo
    if exacto.exists():
        return exacto
    base = Path(archivo).stem
    return next((p for p in sorted(carpeta.glob(f"{base}.*")) if p.suffix.lower() in IMAGEN | CONVERTIBLES), None)


def verificar_plan(carpeta: Path) -> list[dict] | None:
    ruta_plan = carpeta / "plan.json"
    if not ruta_plan.exists():
        return None
    plan = json.loads(ruta_plan.read_text(encoding="utf-8"))
    resultados = []
    for asset in plan["assets"]:
        archivo = asset["archivo"]
        estado, avisos = "ok", []
        cargado = buscar_cargado(carpeta, archivo)
        if cargado is None:
            estado = "falta"
            avisos.append({"pictograma": "se usa el pictograma de respaldo", "real": "hace falta el archivo real"}.get(asset.get("origen", ""), "genéralo con el prompt"))
        else:
            if cargado.name != archivo and Path(archivo).suffix.lower() == ".png" and cargado.suffix.lower() in CONVERTIBLES:
                destino = carpeta / archivo
                convertir_a_png(cargado, destino)
                cargado.unlink()
                avisos.append(f"convertido de {cargado.suffix} a PNG")
                cargado = destino
            info = sondear(cargado)
            if asset.get("transparente") and not info["alfa"]:
                estado = "revisar"
                avisos.append("no tiene fondo transparente (pídelo de nuevo a ChatGPT con fondo transparente)")
            minimo = asset.get("minLado", 800)
            lados = [v for v in (info["ancho"], info["alto"]) if v]
            if lados and min(lados) < minimo and cargado.suffix.lower() != ".svg":
                estado = "revisar"
                avisos.append(f"pequeño: {info['ancho']}×{info['alto']} (mínimo {minimo} px por lado)")
        resultados.append({**asset, "estado": estado, "detalle": "; ".join(avisos)})
    escribir_plan_md(carpeta, plan, resultados)
    return resultados


ICONO_ESTADO = {"ok": "✅ cargado", "falta": "⏳ falta", "revisar": "⚠️ revisar"}
ORIGEN = {"ia": "Generar con ChatGPT", "real": "Real (marca o persona)", "pictograma": "Pictograma (opcional real)"}


def escribir_plan_md(carpeta: Path, plan: dict, resultados: list[dict]) -> None:
    lineas = [
        f"# Assets de «{plan.get('video', carpeta.parent.name)}»",
        "",
        "Plan escrito por el director al planificar el video. Este archivo se regenera con `pipeline/assets.py`: no lo edites a mano (edita `plan.json`).",
        "Guía de estilo de los prompts: `estilo/prompts-imagen.md`. Deja cada archivo en esta carpeta con el **nombre exacto** (o adjúntalo en el chat).",
        "",
        "| Archivo | Origen | Para qué / cuándo | Estado |",
        "|---|---|---|---|",
    ]
    for r in resultados:
        estado = ICONO_ESTADO[r["estado"]] + (f" · {r['detalle']}" if r["detalle"] else "")
        lineas.append(f"| `{r['archivo']}` | {ORIGEN.get(r.get('origen', 'ia'), r.get('origen'))} | {r.get('descripcion', '')} · {r.get('momento', '')} | {estado} |")
    lineas.append("")
    for r in resultados:
        lineas += [f"## `{r['archivo']}`", "", r.get("descripcion", ""), ""]
        if r.get("origen") == "ia" and r.get("prompt"):
            lineas += ["**Prompt para ChatGPT (cópialo entero):**", "", "```", r["prompt"].strip(), "```", ""]
        elif r.get("fuente"):
            lineas += [f"**Fuente:** {r['fuente']}", ""]
        if r.get("notas"):
            lineas += [r["notas"], ""]
    (carpeta / "plan.md").write_text("\n".join(lineas), encoding="utf-8")


def sincronizar_assets(proyecto: Path) -> Path | None:
    origen = proyecto.resolve() / "assets"
    destino = RAIZ / "studio" / "public" / "proyectos" / proyecto.resolve().name / "assets"
    destino.mkdir(parents=True, exist_ok=True)
    resultados = verificar_plan(origen) if origen.exists() else None
    archivos = []
    if origen.exists():
        for archivo in sorted(origen.rglob("*")):
            tipo = "imagen" if archivo.suffix.lower() in IMAGEN else "video" if archivo.suffix.lower() in VIDEO else None
            if not tipo:
                continue
            relativo = archivo.relative_to(origen).as_posix()
            copia = destino / relativo
            copia.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(archivo, copia)
            ancho, alto = dimensiones(archivo)
            archivos.append({"nombre": relativo, "tipo": tipo, "ancho": ancho, "alto": alto})
    manifiesto = destino / "assets.json"
    manifiesto.write_text(json.dumps({"archivos": archivos}, ensure_ascii=False, indent=1), encoding="utf-8")
    nombres = ", ".join(a["nombre"] for a in archivos) or "ninguno"
    print(f"Assets en el estudio: {nombres}")
    if resultados is not None:
        print("Plan de assets:")
        for r in resultados:
            print(f"  {ICONO_ESTADO[r['estado']]:12s} {r['archivo']:22s} {r['detalle']}")
        print(f"  (detalle y prompts en {(origen / 'plan.md').relative_to(RAIZ)})")
    return manifiesto


if __name__ == "__main__":
    # En Windows la consola o una tubería en cp1252 no imprime "→" ni "±".
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    parser = argparse.ArgumentParser()
    parser.add_argument("proyecto", type=Path)
    sincronizar_assets(parser.parse_args().proyecto)
