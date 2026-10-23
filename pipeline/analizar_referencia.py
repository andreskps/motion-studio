"""Analiza un video de referencia y deja sus métricas y hojas de contactos para que el agente estudie el estilo.

Uso: python pipeline/analizar_referencia.py estilo/referencias/videos/<video> [--sin-transcribir]
Salida: estilo/referencias/fichas/<slug>/
  metricas.json   cortes, ritmo, movimiento, color, audio y transcripción
  hoja-NN.jpg     hojas de contactos: 1 cuadro por segundo, 8×3 por hoja, con el segundo marcado
  cortes.jpg      el cuadro justo después de cada corte (hasta 48)

Lo que las métricas no ven (tipografía, tipo de animación, composición) lo lee el agente en las hojas.
"""

import argparse
import json
import os
import re
import subprocess
import sys
import unicodedata
from pathlib import Path

import numpy as np

os.environ.setdefault("HF_HUB_DISABLE_SYMLINKS_WARNING", "1")

RAIZ = Path(__file__).resolve().parent.parent
FICHAS = RAIZ / "estilo" / "referencias" / "fichas"
ANCHO_M, ALTO_M = 72, 128  # resolución para medir movimiento
UMBRAL_CORTE = 0.32
# En Windows ffmpeg no tiene fuente por defecto para drawtext (se cae sin avisar): se le indica una.
FUENTE_ROTULO = "fontfile='C\\:/Windows/Fonts/arial.ttf':" if os.name == "nt" else ""


def slug(nombre: str) -> str:
    base = unicodedata.normalize("NFKD", nombre.split("_")[0]).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", base.lower()).strip("-")[:40] or "referencia"


def sondear(video: Path) -> dict:
    datos = json.loads(
        subprocess.run(
            ["ffprobe", "-v", "error", "-show_entries", "format=duration:stream=codec_type,width,height,r_frame_rate", "-of", "json", str(video)],
            capture_output=True,
            text=True,
        ).stdout
    )
    v = next(s for s in datos["streams"] if s["codec_type"] == "video")
    num, den = v["r_frame_rate"].split("/")
    return {"duracion": float(datos["format"]["duration"]), "ancho": v["width"], "alto": v["height"], "fps": float(num) / float(den)}


def cuadros(video: Path, ancho: int, alto: int, fps: float, gris: bool) -> np.ndarray:
    canales = 1 if gris else 3
    salida = subprocess.run(
        ["ffmpeg", "-hide_banner", "-loglevel", "error", "-i", str(video), "-vf", f"fps={fps},scale={ancho}:{alto}",
         "-f", "rawvideo", "-pix_fmt", "gray" if gris else "rgb24", "-"],
        capture_output=True,
        check=True,
    ).stdout
    return np.frombuffer(salida, dtype=np.uint8).reshape(-1, alto, ancho, canales).astype(np.float32)


def detectar_cortes(video: Path) -> list[float]:
    salida = subprocess.run(
        ["ffmpeg", "-hide_banner", "-i", str(video), "-vf", f"select='gt(scene,{UMBRAL_CORTE})',showinfo", "-an", "-f", "null", "-"],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    ).stderr
    return [round(float(t), 2) for t in re.findall(r"pts_time:([0-9.]+)", salida)]


def ritmo(cortes: list[float], duracion: float) -> dict:
    limites = [0.0] + cortes + [duracion]
    planos = np.diff(limites)
    planos = planos[planos > 0.05]
    return {
        "cortes": len(cortes),
        "cortesPorMinuto": round(len(cortes) / duracion * 60, 1),
        "planoMedianoS": round(float(np.median(planos)), 2),
        "planoP10S": round(float(np.percentile(planos, 10)), 2),
        "planoP90S": round(float(np.percentile(planos, 90)), 2),
        "planoMasLargoS": round(float(planos.max()), 2),
        "cortesPrimeros3s": sum(1 for c in cortes if c < 3),
    }


def cambios_de_escena(video: Path) -> list[float]:
    """Cambios graduales (transiciones animadas, fondos que cambian) que el detector de cortes no ve:
    picos de diferencia entre cuadros separados 0,5 s, con al menos 1 s entre uno y otro."""
    g = cuadros(video, ANCHO_M, ALTO_M, 2, gris=True)[..., 0]
    d = np.abs(np.diff(g, axis=0)).mean(axis=(1, 2))
    umbral = max(10.0, float(np.median(d)) * 4)
    cambios: list[float] = []
    for i in range(1, len(d) - 1):
        if d[i] >= umbral and d[i] >= d[i - 1] and d[i] >= d[i + 1] and (not cambios or (i + 1) / 2 - cambios[-1] >= 1):
            cambios.append((i + 1) / 2)
    return cambios


def movimiento(video: Path, fps: float) -> dict:
    """Cambio medio entre cuadros consecutivos (0–255) en baja resolución: cuánto se mueve la imagen."""
    g = cuadros(video, ANCHO_M, ALTO_M, fps, gris=True)[..., 0]
    diferencia = np.abs(np.diff(g, axis=0)).mean(axis=(1, 2))
    por_segundo = [round(float(diferencia[int(s * fps) : int((s + 1) * fps)].mean()), 2) for s in range(int(len(diferencia) / fps))]
    return {
        "mediana": round(float(np.median(diferencia)), 2),
        "p90": round(float(np.percentile(diferencia, 90)), 2),
        "cuadrosQuietos": round(float(np.mean(diferencia < 0.5)), 2),
        "porSegundo": por_segundo,
    }


def color(video: Path) -> dict:
    rgb = cuadros(video, 45, 80, 2, gris=False) / 255
    pixeles = rgb.reshape(-1, 3)
    maximo, minimo = pixeles.max(axis=1), pixeles.min(axis=1)
    luminancia = 0.2126 * pixeles[:, 0] + 0.7152 * pixeles[:, 1] + 0.0722 * pixeles[:, 2]
    saturacion = np.where(maximo > 0, (maximo - minimo) / np.maximum(maximo, 1e-6), 0)
    # Colores dominantes: cuantizar a 8 niveles por canal y contar.
    cuantizado = np.round(pixeles * 7).astype(int)
    claves, cuentas = np.unique(cuantizado, axis=0, return_counts=True)
    orden = np.argsort(-cuentas)[:10]
    dominantes = [
        {"hex": "#{:02X}{:02X}{:02X}".format(*(np.round(claves[i] / 7 * 255).astype(int))), "proporcion": round(float(cuentas[i] / len(pixeles)), 3)}
        for i in orden
    ]
    # Acentos: píxeles saturados y no oscuros.
    acentos = pixeles[(saturacion > 0.45) & (maximo > 0.35)]
    acento_dominante = None
    if len(acentos):
        claves_a, cuentas_a = np.unique(np.round(acentos * 7).astype(int), axis=0, return_counts=True)
        top = np.argsort(-cuentas_a)[:5]
        acento_dominante = [
            {"hex": "#{:02X}{:02X}{:02X}".format(*(np.round(claves_a[i] / 7 * 255).astype(int))), "proporcion": round(float(cuentas_a[i] / len(pixeles)), 3)}
            for i in top
        ]
    return {
        "oscuro": round(float(np.mean(luminancia < 0.15)), 2),
        "claro": round(float(np.mean(luminancia > 0.75)), 2),
        "luminanciaMedia": round(float(luminancia.mean()), 3),
        "saturados": round(float(np.mean((saturacion > 0.45) & (maximo > 0.35))), 3),
        "dominantes": dominantes,
        "acentos": acento_dominante,
    }


def audio(video: Path) -> dict:
    salida = subprocess.run(
        ["ffmpeg", "-hide_banner", "-i", str(video), "-af", "ebur128", "-f", "null", "-"],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    ).stderr
    integrado = re.findall(r"I:\s+(-?[0-9.]+) LUFS", salida)
    rango = re.findall(r"LRA:\s+([0-9.]+) LU", salida)
    return {"lufs": float(integrado[-1]) if integrado else None, "rangoLU": float(rango[-1]) if rango else None}


def transcribir(video: Path) -> dict:
    from faster_whisper import WhisperModel

    modelo = WhisperModel("large-v3-turbo", device="cpu", compute_type="int8")
    segmentos, info = modelo.transcribe(str(video), word_timestamps=True, vad_filter=True)
    segmentos = list(segmentos)
    palabras = [p for s in segmentos for p in (s.words or [])]
    hablado = sum(p.end - p.start for p in palabras)
    return {
        "idioma": info.language,
        "texto": " ".join(s.text.strip() for s in segmentos),
        "gancho3s": " ".join(p.word.strip() for p in palabras if p.start < 3),
        "palabrasPorMinuto": round(len(palabras) / (info.duration / 60), 1) if palabras else 0,
        "primeraPalabraS": round(palabras[0].start, 2) if palabras else None,
        "proporcionConVoz": round(hablado / info.duration, 2),
        "frases": [{"inicio": round(s.start, 2), "fin": round(s.end, 2), "texto": s.text.strip()} for s in segmentos],
    }


def hojas(video: Path, destino: Path, duracion: float) -> int:
    for viejo in destino.glob("hoja-*.jpg"):
        viejo.unlink()
    por_hoja = 24
    total = int(duracion)
    n = 0
    for inicio in range(0, total, por_hoja):
        n += 1
        subprocess.run(
            ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-ss", str(inicio), "-t", str(por_hoja), "-i", str(video),
             "-vf", "fps=1,scale=180:320,drawtext=" + FUENTE_ROTULO + "text='%{eif\\:t+" + str(inicio) + "\\:d}s':x=6:y=6:fontsize=22:fontcolor=white:box=1:boxcolor=black@0.6,tile=8x3",
             "-frames:v", "1", "-q:v", "4", str(destino / f"hoja-{n:02d}.jpg")],
            check=True,
        )
    return n


def hoja_cortes(video: Path, destino: Path, cortes: list[float]) -> None:
    if not cortes:
        return
    tiempos = cortes[:48]
    seleccion = "+".join(f"between(t\\,{t + 0.1:.2f}\\,{t + 0.14:.2f})" for t in tiempos)
    subprocess.run(
        ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(video),
         "-vf", f"select='{seleccion}',scale=180:320,tile=8x6", "-frames:v", "1", "-vsync", "vfr", "-q:v", "4", str(destino / "cortes.jpg")],
        check=True,
    )


def analizar(video: Path, con_transcripcion: bool) -> Path:
    destino = FICHAS / slug(video.stem)
    destino.mkdir(parents=True, exist_ok=True)
    info = sondear(video)
    print(f"[{destino.name}] {info['duracion']:.1f} s · {info['ancho']}x{info['alto']}")
    cortes = detectar_cortes(video)
    cambios = cambios_de_escena(video)
    metricas = {
        "archivo": video.name,
        **info,
        "ritmo": ritmo(cortes, info["duracion"]),
        "cortesS": cortes,
        "cambiosDeEscena": {"total": len(cambios), "porMinuto": round(len(cambios) / info["duracion"] * 60, 1), "s": cambios},
        "movimiento": movimiento(video, info["fps"]),
        "color": color(video),
        "audio": audio(video),
    }
    if con_transcripcion:
        metricas["voz"] = transcribir(video)
    metricas["hojas"] = hojas(video, destino, info["duracion"])
    hoja_cortes(video, destino, cortes)
    (destino / "metricas.json").write_text(json.dumps(metricas, ensure_ascii=False, indent=1), encoding="utf-8")
    r = metricas["ritmo"]
    print(f"  {r['cortes']} cortes ({r['cortesPorMinuto']}/min, plano mediano {r['planoMedianoS']} s) · "
          f"{metricas['cambiosDeEscena']['total']} cambios de escena ({metricas['cambiosDeEscena']['porMinuto']}/min) · "
          f"movimiento {metricas['movimiento']['mediana']} · oscuro {metricas['color']['oscuro']:.0%} · {metricas['audio']['lufs']} LUFS")
    if "voz" in metricas:
        print(f"  {metricas['voz']['palabrasPorMinuto']} palabras/min · gancho: {metricas['voz']['gancho3s']}")
    return destino


if __name__ == "__main__":
    # En Windows la consola o una tubería en cp1252 no imprime "→" ni "±".
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    parser = argparse.ArgumentParser()
    parser.add_argument("videos", nargs="+", type=Path)
    parser.add_argument("--sin-transcribir", action="store_true")
    args = parser.parse_args()
    for v in args.videos:
        if not v.exists():
            sys.exit(f"No existe {v}")
        analizar(v, not args.sin_transcribir)
