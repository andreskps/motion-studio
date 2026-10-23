"""Masteriza el audio de un render al volumen de las plataformas (ADN §16: −14 LUFS), sin tocar el video.

Uso: python pipeline/masterizar.py studio/out/<video>.mp4 [--lufs -14] [--pico -1]
Salida: studio/out/<video>.master.mp4

loudnorm en dos pasadas: la primera mide, la segunda corrige con esas medidas (más preciso que una sola pasada).
"""

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

import tokens_estilo


def medir(video: Path, lufs: float, pico: float) -> dict:
    salida = subprocess.run(
        ["ffmpeg", "-hide_banner", "-i", str(video), "-af", f"loudnorm=I={lufs}:TP={pico}:LRA=11:print_format=json", "-f", "null", "-"],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    ).stderr
    bloque = re.search(r"\{[^{}]*\"input_i\"[^{}]*\}", salida, re.S)
    if not bloque:
        sys.exit("No pude medir el volumen (¿el video tiene audio?)")
    return json.loads(bloque.group(0))


def masterizar(video: Path, lufs: float, pico: float) -> Path:
    m = medir(video, lufs, pico)
    destino = video.with_name(video.stem + ".master" + video.suffix)
    filtro = (
        f"loudnorm=I={lufs}:TP={pico}:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
        f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true"
    )
    subprocess.run(
        ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(video), "-c:v", "copy", "-af", filtro, "-ar", "48000", "-c:a", "aac", "-b:a", "256k", str(destino)],
        check=True,
    )
    final = medir(destino, lufs, pico)
    print(f"{video.name}: {float(m['input_i']):.1f} LUFS → {float(final['input_i']):.1f} LUFS (pico {float(final['input_tp']):.1f} dBTP) → {destino.name}")
    return destino


if __name__ == "__main__":
    # En Windows la consola o una tubería en cp1252 no imprime "→" ni "±".
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    parser = argparse.ArgumentParser()
    parser.add_argument("video", type=Path)
    parser.add_argument("--lufs", type=float, default=tokens_estilo.LUFS_MASTER)
    parser.add_argument("--pico", type=float, default=-1.0)
    args = parser.parse_args()
    masterizar(args.video, args.lufs, args.pico)
