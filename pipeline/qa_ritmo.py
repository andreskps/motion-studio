"""QA de ritmo (ADN 1.1 §12): mide un render con las mismas métricas que las referencias y comprueba las reglas de ritmo.

Uso: python pipeline/qa_ritmo.py studio/out/<video>.mp4 [--palabras proyectos/<slug>/palabras.json]
Salida: imprime el informe y lo guarda junto al video como <video>.ritmo.json

Comprueba:
  - cambios de escena por minuto y movimiento, frente a la banda de tus referencias (estilo/referencias/fichas)
  - cortes duros: separación mínima (tokens.ritmo.minEntreCortesS)
  - huecos sin evento visual de más de tokens.ritmo.maxSinEventoS mientras habla la voz (si se pasa palabras.json)
  - volumen del master frente a −14 LUFS
"""

import argparse
import json
import statistics
import sys
from pathlib import Path

import numpy as np

from analizar_referencia import ALTO_M, ANCHO_M, audio, cambios_de_escena, cuadros, detectar_cortes, sondear

RAIZ = Path(__file__).resolve().parent.parent
TOKENS = json.loads((RAIZ / "estilo" / "tokens.json").read_text(encoding="utf-8"))
# Diferencia media entre cuadros (0–255, a 72×128) a partir de la cual hay "algo que se mueve" en pantalla.
UMBRAL_EVENTO = 0.35


def banda_referencias() -> dict:
    metricas = [json.loads(p.read_text(encoding="utf-8")) for p in (RAIZ / "estilo" / "referencias" / "fichas").glob("*/metricas.json")]
    if not metricas:
        return {}
    cambios = [m["cambiosDeEscena"]["porMinuto"] for m in metricas]
    movimiento = [m["movimiento"]["mediana"] for m in metricas]
    return {
        "n": len(metricas),
        "cambiosPorMinuto": (min(cambios), statistics.median(cambios), max(cambios)),
        "movimiento": (min(movimiento), statistics.median(movimiento), max(movimiento)),
    }


def huecos_sin_evento(video: Path, fps: float, maximo_s: float, tramos_voz: list[tuple[float, float]] | None) -> list[dict]:
    g = cuadros(video, ANCHO_M, ALTO_M, fps, gris=True)[..., 0]
    # Solo el escenario y el HUD: los subtítulos (desde ~67 % de la altura) cambian con cada palabra y no son
    # "eventos visuales" en el sentido del ADN.
    g = g[:, : int(ALTO_M * 0.67), :]
    actividad = np.abs(np.diff(g, axis=0)).mean(axis=(1, 2))
    eventos = np.nonzero(actividad > UMBRAL_EVENTO)[0] / fps
    limites = np.concatenate([[0.0], eventos, [len(g) / fps]])
    huecos = []
    for a, b in zip(limites, limites[1:]):
        if b - a <= maximo_s:
            continue
        # Solo cuenta si la voz habla durante el hueco (una pausa visual con la voz callada es intencional).
        if tramos_voz is not None:
            hablado = sum(max(0.0, min(b, fin) - max(a, ini)) for ini, fin in tramos_voz)
            if hablado < maximo_s * 0.8:
                continue
        huecos.append({"desde": round(float(a), 2), "hasta": round(float(b), 2), "duracion": round(float(b - a), 2)})
    return huecos


def tramos_de_voz(palabras: Path) -> list[tuple[float, float]]:
    datos = json.loads(palabras.read_text(encoding="utf-8"))
    tramos: list[list[float]] = []
    for p in datos["palabras"]:
        if tramos and p["inicio"] - tramos[-1][1] < 0.5:
            tramos[-1][1] = p["fin"]
        else:
            tramos.append([p["inicio"], p["fin"]])
    return [(a, b) for a, b in tramos]


def marca(ok: bool | None) -> str:
    return "—" if ok is None else ("OK " if ok else "REVISAR")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("video", type=Path)
    parser.add_argument("--palabras", type=Path)
    args = parser.parse_args()
    if not args.video.exists():
        sys.exit(f"No existe {args.video}")

    info = sondear(args.video)
    duracion, fps = info["duracion"], info["fps"]
    ritmo = TOKENS["ritmo"]
    banda = banda_referencias()

    cambios = cambios_de_escena(args.video)
    cambios_min = len(cambios) / duracion * 60
    g = cuadros(args.video, ANCHO_M, ALTO_M, fps, gris=True)[..., 0]
    movimiento = float(np.median(np.abs(np.diff(g, axis=0)).mean(axis=(1, 2))))
    cortes = detectar_cortes(args.video)
    separacion_min = min((b - a for a, b in zip(cortes, cortes[1:])), default=None)
    huecos = huecos_sin_evento(args.video, fps, ritmo["maxSinEventoS"], tramos_de_voz(args.palabras) if args.palabras else None)
    lufs = audio(args.video)["lufs"]

    # El modo dinámico (por defecto) apunta a 6–14 cambios por minuto (ADN §12).
    resultados = {
        "cambiosPorMinuto": {"valor": round(cambios_min, 1), "objetivo": "6–14 (dinámico)", "ok": 6 <= cambios_min <= 14},
        "movimientoMediana": {
            "valor": round(movimiento, 2),
            "objetivo": f"banda de referencias {banda['movimiento'][0]}–{banda['movimiento'][2]}" if banda else "—",
            "ok": (banda["movimiento"][0] <= movimiento <= banda["movimiento"][2] * 1.5) if banda else None,
        },
        "cortes": {
            "valor": len(cortes),
            "separacionMinimaS": round(separacion_min, 2) if separacion_min is not None else None,
            "objetivo": f"≥ {ritmo['minEntreCortesS']} s entre cortes",
            "ok": separacion_min is None or separacion_min >= ritmo["minEntreCortesS"],
        },
        "huecosSinEvento": {
            "valor": len(huecos),
            "objetivo": f"ninguno > {ritmo['maxSinEventoS']} s" + (" con la voz hablando" if args.palabras else ""),
            "ok": len(huecos) == 0,
            "detalle": huecos,
        },
        "lufs": {"valor": lufs, "objetivo": "−14 ± 1", "ok": None if lufs is None or lufs < -60 else abs(lufs + 14) <= 1},
    }
    informe = {"video": str(args.video), "duracion": round(duracion, 2), "bandaReferencias": banda, "resultados": resultados}
    args.video.with_suffix(".ritmo.json").write_text(json.dumps(informe, ensure_ascii=False, indent=1), encoding="utf-8")

    print(f"QA de ritmo · {args.video.name} · {duracion:.1f} s")
    if banda:
        print(f"Banda de tus {banda['n']} referencias: {banda['cambiosPorMinuto'][0]}–{banda['cambiosPorMinuto'][2]} cambios/min, movimiento {banda['movimiento'][0]}–{banda['movimiento'][2]}")
    for nombre, r in resultados.items():
        extra = f" (mín. {r['separacionMinimaS']} s)" if nombre == "cortes" and r.get("separacionMinimaS") is not None else ""
        print(f"  {marca(r['ok']):8s} {nombre:18s} {r['valor']}{extra}   objetivo: {r['objetivo']}")
    for h in huecos:
        print(f"           hueco sin evento: {h['desde']}–{h['hasta']} s ({h['duracion']} s)")


if __name__ == "__main__":
    # En Windows la consola o una tubería en cp1252 no imprime "→" ni "±".
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    main()
