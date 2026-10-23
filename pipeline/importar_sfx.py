"""Importa efectos de sonido de bibliotecas gratuitas al catálogo del estudio.

Uso:
  python pipeline/importar_sfx.py <archivos o carpetas...> --id whoosh --licencia "CC0" --origen "Kenney · Impact Sounds"
  python pipeline/importar_sfx.py descargas/papel/ --id papel --categoria organico --licencia "Pixabay" \
      --origen "https://pixabay.com/..." --descripcion "Hoja de papel" --usos "pasar página,nota" --volumen 0.5

Qué hace con cada archivo (wav, mp3, ogg, flac, aiff):
1. Lo decodifica con ffmpeg a 48 kHz estéreo.
2. Recorta el silencio del principio y del final.
3. Si al sumarlo a mono pierde más de 1,5 dB (fases opuestas entre canales), estrecha su estéreo.
4. Lo nivela al mismo volumen percibido que los sonidos sintetizados de su categoría.
5. Lo guarda en studio/public/sfx/biblioteca/<id>-b<n>.wav y lo añade al catálogo con su licencia y su origen.

Solo se aceptan licencias que permitan uso comercial sin atribución obligatoria (ver LICENCIAS_OK).
Un archivo que ya se importó (mismo contenido) se salta.
"""

import argparse
import hashlib
import json
import sys
from pathlib import Path

from audio_comun import (
    OBJETIVO_DB,
    compatible_con_mono,
    guardar_wav,
    leer_con_ffmpeg,
    nivelar,
    recortar_silencio,
    suavizar_bordes,
)

RAIZ = Path(__file__).resolve().parent.parent
SFX = RAIZ / "studio" / "public" / "sfx"
CATALOGO = SFX / "catalogo.json"
EXTENSIONES = {".wav", ".mp3", ".ogg", ".flac", ".aif", ".aiff", ".m4a"}
LICENCIAS_OK = ("cc0", "dominio público", "pixabay", "sonniss", "mixkit", "propia")
DURACION_MAXIMA_S = 8.0


def archivos_de(entradas: list[Path]) -> list[Path]:
    resultado = []
    for entrada in entradas:
        if entrada.is_dir():
            resultado += sorted(p for p in entrada.rglob("*") if p.suffix.lower() in EXTENSIONES)
        elif entrada.suffix.lower() in EXTENSIONES:
            resultado.append(entrada)
        else:
            print(f"Salto {entrada}: no es un audio conocido")
    return resultado


def main() -> None:
    parser = argparse.ArgumentParser(description="Importa SFX de biblioteca al catálogo del estudio.")
    parser.add_argument("entradas", nargs="+", type=Path)
    parser.add_argument("--id", required=True, help="Sonido al que se añaden como variantes (existente o nuevo)")
    parser.add_argument("--licencia", required=True)
    parser.add_argument("--origen", required=True, help="Pack o URL de donde salió")
    parser.add_argument("--categoria", help="Obligatoria si el id es nuevo: " + ", ".join(OBJETIVO_DB))
    parser.add_argument("--descripcion")
    parser.add_argument("--usos", help="Separados por comas")
    parser.add_argument("--volumen", type=float, default=0.5)
    args = parser.parse_args()

    if not any(ok in args.licencia.lower() for ok in LICENCIAS_OK):
        sys.exit(
            f"Licencia «{args.licencia}» no aceptada. Solo uso comercial sin atribución obligatoria: "
            + ", ".join(LICENCIAS_OK)
            + ". Si exige atribución (CC-BY) o es no comercial (NC), no la importes."
        )

    catalogo = json.loads(CATALOGO.read_text(encoding="utf-8"))
    sonido = next((s for s in catalogo["sonidos"] if s["id"] == args.id), None)
    if sonido is None:
        if not args.categoria or args.categoria not in OBJETIVO_DB:
            sys.exit(f"«{args.id}» es un sonido nuevo: indica --categoria ({', '.join(OBJETIVO_DB)})")
        sonido = {
            "id": args.id,
            "categoria": args.categoria,
            "descripcion": args.descripcion or args.id,
            "usos": [u.strip() for u in (args.usos or "").split(",") if u.strip()],
            "volumen": args.volumen,
            "variantes": [],
        }
        catalogo["sonidos"].append(sonido)

    ya_importados = {v.get("sha1") for s in catalogo["sonidos"] for v in s["variantes"]}
    existentes = [v["archivo"] for v in sonido["variantes"] if v.get("fuente") == "biblioteca"]
    siguiente = len(existentes) + 1
    importados = 0
    for archivo in archivos_de(args.entradas):
        sha1 = hashlib.sha1(archivo.read_bytes()).hexdigest()
        if sha1 in ya_importados:
            print(f"Ya estaba importado: {archivo.name}")
            continue
        senal = recortar_silencio(leer_con_ffmpeg(archivo))
        if len(senal) / 48000 > DURACION_MAXIMA_S:
            print(f"Salto {archivo.name}: dura más de {DURACION_MAXIMA_S:.0f} s (¿es música o un ambiente?)")
            continue
        senal = suavizar_bordes(nivelar(compatible_con_mono(senal), sonido["categoria"]), ms=3)
        destino = SFX / "biblioteca" / f"{args.id}-b{siguiente}.wav"
        while destino.exists():
            siguiente += 1
            destino = SFX / "biblioteca" / f"{args.id}-b{siguiente}.wav"
        duracion = guardar_wav(destino, senal)
        sonido["variantes"].append(
            {
                "archivo": f"sfx/biblioteca/{destino.name}",
                "duracion": round(duracion, 3),
                "fuente": "biblioteca",
                "licencia": args.licencia,
                "origen": args.origen,
                "original": archivo.name,
                "sha1": sha1,
            }
        )
        ya_importados.add(sha1)
        importados += 1
        siguiente += 1
        print(f"{archivo.name} -> {destino.relative_to(RAIZ)} ({duracion:.2f} s)")

    CATALOGO.write_text(json.dumps(catalogo, ensure_ascii=False, indent=1), encoding="utf-8")
    total = len(sonido["variantes"])
    print(f"Importados {importados}. «{args.id}» tiene ahora {total} variantes.")
    if importados and args.id not in RAIZ.joinpath("studio/src/lib/sfx.ts").read_text(encoding="utf-8"):
        print(f"Nota: «{args.id}» es nuevo; úsalo con <Sfx sonido=\"{args.id}\" />.")


if __name__ == "__main__":
    # En Windows la consola o una tubería en cp1252 no imprime "→" ni "±".
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    main()
