"""Pausas del audio, ajuste de los inicios de frase y métrica de sincronía.

La "verdad" son los finales de pausa que detecta ffmpeg (silencedetect, -35 dB,
0,25 s): ahí arranca la voz de verdad. Es la misma métrica de video-editor-architect.
"""

import re
import statistics
import subprocess
from pathlib import Path

UMBRAL_DB = -35
PAUSA_MINIMA_S = 0.25
# Más allá de esto no se ajusta: es más probable que la palabra esté mal alineada que la pausa.
AJUSTE_MAXIMO_S = 0.35
TOLERANCIA_MS = 45
CORRECCION_MAXIMA_MS = 150


def detectar_pausas(audio: Path) -> list[tuple[float, float]]:
    salida = subprocess.run(
        ["ffmpeg", "-hide_banner", "-i", str(audio), "-af", f"silencedetect=n={UMBRAL_DB}dB:d={PAUSA_MINIMA_S}", "-f", "null", "-"],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    ).stderr
    pausas, inicio = [], None
    for tipo, valor in re.findall(r"silence_(start|end): ([0-9.]+)", salida):
        if tipo == "start":
            inicio = float(valor)
        elif inicio is not None:
            pausas.append((inicio, float(valor)))
            inicio = None
    return pausas


def primera_tras_pausa(palabras: list[dict], pausa: tuple[float, float]) -> int | None:
    mitad = (pausa[0] + pausa[1]) / 2
    return next((i for i, p in enumerate(palabras) if p["inicio"] > mitad), None)


def medir(palabras: list[dict], pausas: list[tuple[float, float]]) -> dict:
    """Error (ms) entre el inicio de la primera palabra tras cada pausa y el final de esa pausa."""
    errores = []
    for pausa in pausas:
        i = primera_tras_pausa(palabras, pausa)
        if i is not None:
            errores.append((palabras[i]["inicio"] - pausa[1]) * 1000)
    if not errores:
        return {"N": 0}
    absolutos = sorted(abs(e) for e in errores)
    return {
        "N": len(errores),
        "p50_ms": round(statistics.median(absolutos)),
        "p95_ms": round(absolutos[round(0.95 * (len(absolutos) - 1))]),
        "desvio_ms": round(statistics.median(errores)),
        "dentro_tolerancia": round(sum(a <= TOLERANCIA_MS for a in absolutos) / len(absolutos), 2),
    }


def corregir_desvio(palabras: list[dict], desvio_ms: int) -> int:
    """Corrige el retraso (o adelanto) sistemático del alineador en todas las palabras.

    El desvío se mide en los inicios de frase, pero el sesgo del alineador es el mismo en todas las palabras.
    Se limita a ±CORRECCION_MAXIMA_MS por si la medición sale rara.
    """
    k = max(-CORRECCION_MAXIMA_MS, min(CORRECCION_MAXIMA_MS, desvio_ms))
    for p in palabras:
        p["inicio"] = round(max(0.0, p["inicio"] - k / 1000), 3)
        p["fin"] = round(max(p["inicio"] + 0.02, p["fin"] - k / 1000), 3)
    return k


def ajustar_a_pausas(palabras: list[dict], pausas: list[tuple[float, float]]) -> list[dict]:
    """Lleva el inicio de cada frase al final real de su pausa y corta la palabra anterior donde empieza el silencio.

    Devuelve los ajustes hechos y los que se dejaron sin tocar por ser demasiado grandes.
    """
    ajustes = []
    for inicio_pausa, fin_pausa in pausas:
        i = primera_tras_pausa(palabras, (inicio_pausa, fin_pausa))
        if i is None:
            continue
        palabra = palabras[i]
        delta = fin_pausa - palabra["inicio"]
        if abs(delta) > AJUSTE_MAXIMO_S:
            ajustes.append({"palabra": palabra["texto"], "inicio": palabra["inicio"], "delta_ms": round(delta * 1000), "aplicado": False})
            continue
        palabra["inicio"] = round(fin_pausa, 3)
        palabra["fin"] = round(max(palabra["fin"], fin_pausa + 0.05), 3)
        if i > 0 and palabras[i - 1]["fin"] > inicio_pausa:
            palabras[i - 1]["fin"] = round(max(inicio_pausa, palabras[i - 1]["inicio"] + 0.05), 3)
        ajustes.append({"palabra": palabra["texto"], "inicio": palabra["inicio"], "delta_ms": round(delta * 1000), "aplicado": True})
    return ajustes
