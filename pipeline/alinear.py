"""Une el guion (texto exacto) con los tiempos de la alineación forzada, ajusta los inicios de frase a las pausas
reales del audio, mide la sincronía y verifica el guion contra una transcripción independiente.

El guion manda en el texto. Si alguna palabra quedó sin tiempo, se interpola entre sus vecinas.
Marcas del guion: *palabras clave* (van en verde) y {ancla} delante de una palabra (momento para sincronizar animaciones).

Uso: python pipeline/alinear.py proyectos/<slug>
Necesita: guion.txt, audio.*, alineacion.json (alinear_forzado.py); opcional transcripcion.json (transcribir.py).
Salida: proyectos/<slug>/palabras.json y proyectos/<slug>/sincronia.json
"""

import argparse
import json
import re
import subprocess
import sys
import unicodedata
from difflib import SequenceMatcher
from pathlib import Path


def normalizar(texto: str) -> str:
    sin_tildes = unicodedata.normalize("NFKD", texto.lower())
    sin_tildes = "".join(c for c in sin_tildes if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9]", "", sin_tildes)


def palabras_del_guion(guion: str) -> list[dict]:
    """Separa el guion en palabras, marca dónde termina cada frase y qué palabras son clave.

    Las palabras clave se marcan en el guion con asteriscos: *tarjetita de sellos* (puede abarcar varias).
    Los asteriscos no llegan al texto; las palabras quedan con "clave": true y van en verde en pantalla.
    """
    resultado = []
    en_clave = False
    ancla_pendiente = None
    for linea in guion.splitlines():
        tokens = linea.split()
        for i, token in enumerate(tokens):
            # Ancla {nombre}: pegada a la palabra ("{giro}diez") o suelta delante ("{giro} diez").
            ancla = re.match(r"^\{([\w-]+)\}(.*)$", token)
            if ancla:
                if not ancla.group(2):
                    ancla_pendiente = ancla.group(1)
                    continue
                ancla_pendiente, token = ancla.group(1), ancla.group(2)
            # "*palabra" abre · "palabra*" o "palabra*." cierra · "*palabra*" abre y cierra en la misma palabra.
            asteriscos = token.count("*")
            abre = token.startswith("*")
            cierra = asteriscos >= 2 or (asteriscos == 1 and not abre)
            texto = token.replace("*", "")
            if not texto:
                continue
            clave = en_clave or abre
            if abre and not cierra:
                en_clave = True
            if cierra:
                en_clave = False
            palabra = {
                "texto": texto,
                "finFrase": bool(re.search(r"[.!?…]$", texto)) or i == len(tokens) - 1,
                "pausa": bool(re.search(r"[,;:]$", texto)),
                "clave": clave,
            }
            if ancla_pendiente:
                palabra["ancla"] = ancla_pendiente
                ancla_pendiente = None
            resultado.append(palabra)
    return resultado


def texto_hablado(guion: str) -> str:
    """El guion sin marcas de diseño (*claves* y {anclas}): lo que de verdad dice la voz."""
    return re.sub(r"\{[\w-]+\}", "", guion).replace("*", "")


def duracion_audio(audio: Path) -> float:
    salida = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(audio)],
        capture_output=True,
        text=True,
    )
    return float(salida.stdout.strip())


def interpolar(huecos: list[dict], desde: float, hasta: float) -> None:
    """Reparte el intervalo entre las palabras sin tiempo, según su largo."""
    pesos = [max(len(normalizar(p["texto"])), 1) for p in huecos]
    total = sum(pesos)
    cursor = desde
    for palabra, peso in zip(huecos, pesos):
        duracion = (hasta - desde) * peso / total
        palabra["inicio"] = round(cursor, 3)
        palabra["fin"] = round(cursor + duracion, 3)
        palabra["origen"] = "interpolado"
        cursor += duracion


def asignar_tiempos(guion: list[dict], fuente: list[dict], duracion: float, origen: str) -> None:
    """Copia a cada palabra del guion el tiempo de su pareja en `fuente`; las que no tienen pareja se interpolan."""
    a = [normalizar(p["texto"]) for p in guion]
    b = [normalizar(p["texto"]) for p in fuente]
    for bloque in SequenceMatcher(a=a, b=b, autojunk=False).get_matching_blocks():
        for k in range(bloque.size):
            g, f = guion[bloque.a + k], fuente[bloque.b + k]
            g["inicio"], g["fin"], g["origen"] = f["inicio"], f["fin"], origen

    i = 0
    while i < len(guion):
        if "inicio" in guion[i]:
            i += 1
            continue
        j = i
        while j < len(guion) and "inicio" not in guion[j]:
            j += 1
        desde = guion[i - 1]["fin"] if i > 0 else 0.0
        hasta = guion[j]["inicio"] if j < len(guion) else min(desde + 0.4 * (j - i), duracion)
        interpolar(guion[i:j], desde, max(hasta, desde + 0.05))
        i = j


def alinear(proyecto: Path) -> Path:
    from sincronia import ajustar_a_pausas, corregir_desvio, detectar_pausas, medir
    from transcribir import buscar_audio
    from verificar import diferencias

    for nombre in ("guion.txt", "alineacion.json"):
        if not (proyecto / nombre).exists():
            sys.exit(f"Falta {proyecto / nombre}")
    audio = buscar_audio(proyecto)
    duracion = duracion_audio(audio)

    guion = palabras_del_guion((proyecto / "guion.txt").read_text(encoding="utf-8"))
    forzada = json.loads((proyecto / "alineacion.json").read_text(encoding="utf-8"))
    # Una palabra sin duración es una palabra que el alineador no encontró: mejor interpolarla.
    fuente = [p for p in forzada["palabras"] if normalizar(p["texto"]) and p["fin"] - p["inicio"] >= 0.02]
    asignar_tiempos(guion, fuente, duracion, "forzada")

    pausas = detectar_pausas(audio)
    antes = medir(guion, pausas)
    k_ms = corregir_desvio(guion, antes["desvio_ms"]) if antes.get("N", 0) >= 5 else 0
    corregido = medir(guion, pausas)
    ajustes = ajustar_a_pausas(guion, pausas)
    despues = medir(guion, pausas)

    verificacion = None
    if (proyecto / "transcripcion.json").exists():
        transcripcion = json.loads((proyecto / "transcripcion.json").read_text(encoding="utf-8"))
        verificacion = diferencias(guion, transcripcion["palabras"])

    alineadas = sum(p["origen"] == "forzada" for p in guion)
    salida = proyecto / "palabras.json"
    salida.write_text(
        json.dumps(
            {
                "duracion": round(duracion, 3),
                "cobertura": round(alineadas / len(guion), 3),
                "anclas": {p["ancla"]: {"indice": i, "inicio": p["inicio"], "fin": p["fin"]} for i, p in enumerate(guion) if "ancla" in p},
                "palabras": guion,
            },
            ensure_ascii=False,
            indent=1,
        ),
        encoding="utf-8",
    )
    (proyecto / "sincronia.json").write_text(
        json.dumps(
            {
                "motor": f"{forzada['motor']} {forzada['modelo']}",
                "pausas": len(pausas),
                "alineador": antes,
                "correccion_k_ms": k_ms,
                "trasCorreccion": corregido,
                "trasAjuste": despues,
                "ajustes": ajustes,
                "verificacion": verificacion,
            },
            ensure_ascii=False,
            indent=1,
        ),
        encoding="utf-8",
    )

    print(f"Alineadas {alineadas}/{len(guion)} palabras ({alineadas / len(guion):.0%}).")
    interpoladas = [p["texto"] for p in guion if p["origen"] == "interpolado"]
    if interpoladas:
        print("Con tiempo interpolado:", " ".join(interpoladas))
    if antes.get("N"):
        print(
            f"Sincronía del alineador en {antes['N']} inicios de frase: p50 {antes['p50_ms']} ms · "
            f"p95 {antes['p95_ms']} ms · desvío {antes['desvio_ms']:+d} ms"
        )
        print(
            f"Corrección del desvío en todas las palabras: {-k_ms:+d} ms -> "
            f"p50 {corregido['p50_ms']} ms · p95 {corregido['p95_ms']} ms · desvío {corregido['desvio_ms']:+d} ms"
        )
    aplicados = [a for a in ajustes if a["aplicado"]]
    sin_aplicar = [a for a in ajustes if not a["aplicado"]]
    print(f"Ajustados a la pausa real: {len(aplicados)} inicios de frase.", end=" ")
    print(f"Quedan {despues.get('dentro_tolerancia', 0):.0%} a ±45 ms.")
    for a in sin_aplicar:
        print(f"  REVISAR: '{a['palabra']}' ({a['inicio']:.2f} s) está a {a['delta_ms']:+d} ms de su pausa; no se ajustó.")
    if verificacion is None:
        print("Sin verificación (falta transcripcion.json).")
    elif verificacion:
        print(f"Verificación: {len(verificacion)} diferencias entre guion y audio (revísalas en sincronia.json):")
        for d in verificacion:
            print(f"  {d['tipo']}: guion «{d['guion']}» / audio «{d['audio']}»")
    else:
        print("Verificación: el audio dice exactamente el guion.")
    return salida


if __name__ == "__main__":
    # En Windows la consola o una tubería en cp1252 no imprime "→" ni "±".
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    parser = argparse.ArgumentParser()
    parser.add_argument("proyecto", type=Path)
    alinear(parser.parse_args().proyecto)
