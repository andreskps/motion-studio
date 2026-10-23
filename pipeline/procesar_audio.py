"""Pipeline de audio: guion + audio -> palabras con tiempos, listas para Remotion.

Uso: python pipeline/procesar_audio.py proyectos/<slug> [--rehacer] [--sin-verificar]
     [--modelo-alineacion medium] [--modelo-verificacion large-v3-turbo]

1. Alineación forzada del guion con stable-ts -> alineacion.json
2. Transcripción independiente con faster-whisper, solo para verificar -> transcripcion.json
3. Unión con el guion, ajuste a pausas, métrica y verificación -> palabras.json + sincronia.json
4. Copia del audio, palabras.json y los assets de marca (assets/) a studio/public/proyectos/<slug>/

Los pasos 1 y 2 se guardan en caché; --rehacer los repite.
"""

import argparse
import json
import os
import shutil
import sys
from pathlib import Path

os.environ.setdefault("HF_HUB_DISABLE_SYMLINKS_WARNING", "1")

from alinear import alinear  # noqa: E402
from alinear_forzado import alinear_forzado  # noqa: E402
from assets import sincronizar_assets  # noqa: E402
from transcribir import buscar_audio, transcribir  # noqa: E402

RAIZ = Path(__file__).resolve().parent.parent


def procesar(proyecto: Path, modelo_alineacion: str, modelo_verificacion: str, rehacer: bool, verificar: bool) -> None:
    proyecto = proyecto.resolve()
    if not (proyecto / "guion.txt").exists():
        sys.exit(f"Falta guion.txt en {proyecto}")

    if rehacer or not (proyecto / "alineacion.json").exists():
        alinear_forzado(proyecto, modelo_alineacion)
    else:
        print("Uso la alineación forzada guardada (--rehacer para repetirla).")
    if verificar:
        if rehacer or not (proyecto / "transcripcion.json").exists():
            transcribir(proyecto, modelo_verificacion)
        else:
            print("Uso la transcripción de verificación guardada.")
    palabras = alinear(proyecto)

    destino = RAIZ / "studio" / "public" / "proyectos" / proyecto.name
    destino.mkdir(parents=True, exist_ok=True)
    audio = buscar_audio(proyecto)
    shutil.copy2(audio, destino / f"audio{audio.suffix}")
    datos = json.loads(palabras.read_text(encoding="utf-8"))
    datos["audio"] = f"audio{audio.suffix}"
    (destino / "palabras.json").write_text(json.dumps(datos, ensure_ascii=False), encoding="utf-8")
    sincronizar_assets(proyecto)
    print(f"Listo para Remotion: {destino.relative_to(RAIZ)}")


if __name__ == "__main__":
    # En Windows la consola o una tubería en cp1252 no imprime "→" ni "±".
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    parser = argparse.ArgumentParser()
    parser.add_argument("proyecto", type=Path)
    parser.add_argument("--modelo-alineacion", default="medium")
    parser.add_argument("--modelo-verificacion", default="large-v3-turbo")
    parser.add_argument("--rehacer", action="store_true")
    parser.add_argument("--sin-verificar", action="store_true")
    args = parser.parse_args()
    procesar(args.proyecto, args.modelo_alineacion, args.modelo_verificacion, args.rehacer, not args.sin_verificar)
