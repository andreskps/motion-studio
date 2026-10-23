"""Transcribe el audio de un proyecto con faster-whisper (CPU) y guarda los tiempos palabra por palabra.

Uso: python pipeline/transcribir.py proyectos/<slug> [--modelo large-v3-turbo]
Salida: proyectos/<slug>/transcripcion.json
"""

import argparse
import json
import os
import re
import sys
import time
from pathlib import Path

# Windows sin modo desarrollador no permite symlinks en la caché de Hugging Face; el aviso es ruido.
os.environ.setdefault("HF_HUB_DISABLE_SYMLINKS_WARNING", "1")

from faster_whisper import WhisperModel  # noqa: E402

EXTENSIONES_AUDIO = (".mp3", ".wav", ".m4a", ".ogg", ".flac")


def buscar_audio(proyecto: Path) -> Path:
    for ext in EXTENSIONES_AUDIO:
        candidato = proyecto / f"audio{ext}"
        if candidato.exists():
            return candidato
    sys.exit(f"No encontré audio.(mp3|wav|m4a|ogg|flac) en {proyecto}")


def transcribir(proyecto: Path, modelo: str) -> Path:
    audio = buscar_audio(proyecto)
    guion = proyecto / "guion.txt"
    # El guion como prompt inicial ayuda a Whisper con nombres propios y términos raros.
    # Sin las marcas de diseño (*claves* y {anclas}), que la voz no pronuncia.
    prompt = re.sub(r"\{[\w-]+\}", "", guion.read_text(encoding="utf-8")).replace("*", "")[:800] if guion.exists() else None

    print(f"Cargando modelo {modelo} (CPU, int8)...")
    inicio = time.time()
    whisper = WhisperModel(modelo, device="cpu", compute_type="int8")
    segmentos, info = whisper.transcribe(
        str(audio),
        language="es",
        word_timestamps=True,
        initial_prompt=prompt,
        beam_size=5,
        condition_on_previous_text=False,
    )

    palabras = []
    for segmento in segmentos:
        for p in segmento.words or []:
            palabras.append(
                {
                    "texto": p.word.strip(),
                    "inicio": round(p.start, 3),
                    "fin": round(p.end, 3),
                    "prob": round(p.probability, 3),
                }
            )

    salida = proyecto / "transcripcion.json"
    salida.write_text(
        json.dumps(
            {"modelo": modelo, "duracion": round(info.duration, 3), "palabras": palabras},
            ensure_ascii=False,
            indent=1,
        ),
        encoding="utf-8",
    )
    print(f"{len(palabras)} palabras en {time.time() - inicio:.0f} s -> {salida}")
    return salida


if __name__ == "__main__":
    # En Windows la consola o una tubería en cp1252 no imprime "→" ni "±".
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    parser = argparse.ArgumentParser()
    parser.add_argument("proyecto", type=Path)
    parser.add_argument("--modelo", default="large-v3-turbo")
    args = parser.parse_args()
    transcribir(args.proyecto, args.modelo)
