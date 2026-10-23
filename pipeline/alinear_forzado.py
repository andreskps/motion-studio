"""Alineación forzada del guion contra el audio con stable-ts (Whisper en CPU).

A diferencia de transcribir, aquí el modelo no adivina el texto: recibe el guion
exacto y solo busca dónde se dice cada palabra. Así los números y nombres propios
también reciben tiempos reales.

Uso: python pipeline/alinear_forzado.py proyectos/<slug> [--modelo medium]
Salida: proyectos/<slug>/alineacion.json
"""

import sys
import argparse
import json
import time
from pathlib import Path

import stable_whisper
import torch

from alinear import texto_hablado
from transcribir import buscar_audio


def alinear_forzado(proyecto: Path, modelo: str) -> Path:
    audio = buscar_audio(proyecto)
    # Las marcas de diseño (*claves* y {anclas}) no se pronuncian: el alineador solo recibe el texto hablado.
    guion = texto_hablado((proyecto / "guion.txt").read_text(encoding="utf-8")).strip()

    torch.set_num_threads(8)
    print(f"Alineación forzada con Whisper {modelo} (stable-ts, CPU)...")
    inicio = time.time()
    whisper = stable_whisper.load_model(modelo, device="cpu")
    # Parámetros probados en videos reales: dan inicios de frase a ±45 ms tras la corrección.
    resultado = whisper.align(
        str(audio),
        guion,
        language="es",
        original_split=True,
        token_step=200,
        verbose=None,
        regroup=False,
        suppress_silence=False,
        gap_padding="",
    )
    if resultado is None:
        raise RuntimeError("stable-ts no devolvió alineación")

    palabras = [
        {
            "texto": p.word.strip(),
            "inicio": round(p.start, 3),
            "fin": round(p.end, 3),
            "prob": round(p.probability, 3),
        }
        for segmento in resultado.segments
        for p in segmento.words
        if p.word.strip()
    ]
    salida = proyecto / "alineacion.json"
    salida.write_text(
        json.dumps({"motor": "stable-ts", "modelo": modelo, "palabras": palabras}, ensure_ascii=False, indent=1),
        encoding="utf-8",
    )
    print(f"{len(palabras)} palabras alineadas en {time.time() - inicio:.0f} s -> {salida}")
    return salida


if __name__ == "__main__":
    # En Windows la consola o una tubería en cp1252 no imprime "→" ni "±".
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    parser = argparse.ArgumentParser()
    parser.add_argument("proyecto", type=Path)
    parser.add_argument("--modelo", default="medium")
    args = parser.parse_args()
    alinear_forzado(args.proyecto, args.modelo)
