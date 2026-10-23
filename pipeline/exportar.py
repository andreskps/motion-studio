"""Exporta un video terminado en un solo paso: render de Remotion → masterizado a −14 LUFS → QA de ritmo.

Uso (desde la raíz):
  .venv/Scripts/python pipeline/exportar.py Demo --proyecto demo
  .venv/Scripts/python pipeline/exportar.py CatalogoLienzo

Salida: exportados/<Composicion>[-<proyecto>].mp4 (ya masterizado), y el informe de QA junto a él.
Funciona con Remotion Studio abierto: el render usa su propio puerto (remotion.config.ts).
"""

import argparse
import shutil
import subprocess
import sys
from pathlib import Path

import tokens_estilo
from masterizar import masterizar

RAIZ = Path(__file__).resolve().parent.parent
STUDIO = RAIZ / "studio"
EXPORTADOS = RAIZ / "exportados"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("composicion")
    parser.add_argument("--proyecto", help="Carpeta de proyectos/ (para la QA con la voz y el nombre del archivo)")
    args = parser.parse_args()

    nombre = f"{args.composicion}-{args.proyecto}" if args.proyecto else args.composicion
    crudo = STUDIO / "out" / f"{nombre}.mp4"
    print(f"1/3 · Render de {args.composicion}…")
    # npx en Windows es un .cmd: hace falta shell=True para encontrarlo.
    render = subprocess.run(f'npx remotion render src/index.ts {args.composicion} "{crudo}"', cwd=STUDIO, shell=True)
    if render.returncode != 0 or not crudo.exists():
        sys.exit("El render falló (mira el error de Remotion arriba).")

    print("2/3 · Masterizado…")
    master = masterizar(crudo, lufs=tokens_estilo.LUFS_MASTER, pico=-1.0)
    EXPORTADOS.mkdir(exist_ok=True)
    final = EXPORTADOS / f"{nombre}.mp4"
    shutil.move(master, final)

    print("3/3 · QA de ritmo…")
    qa = [sys.executable, str(RAIZ / "pipeline" / "qa_ritmo.py"), str(final)]
    palabras = RAIZ / "proyectos" / (args.proyecto or "") / "palabras.json"
    if args.proyecto and palabras.exists():
        qa += ["--palabras", str(palabras)]
    subprocess.run(qa)
    print(f"\nListo: {final}")


if __name__ == "__main__":
    # En Windows la consola o una tubería en cp1252 no imprime "→" ni "±".
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    main()
