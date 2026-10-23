"""Genera los efectos de sonido sintetizados del estudio (100 % propios, sin licencias de terceros).

Uso: python pipeline/generar_sfx.py
Salida: studio/public/sfx/<id>-<n>.wav (48 kHz, 16 bits, estéreo, nivelados) y studio/public/sfx/catalogo.json

Síntesis v2: cada sonido se arma por capas (golpe + cuerpo + cola), en estéreo (paneos que barren y una reverb
decorrelada que da amplitud), con saturación suave y nivelado por volumen percibido. Semillas fijas: el resultado
es idéntico en cada corrida.

Las variantes importadas de bibliotecas (pipeline/importar_sfx.py) se conservan al regenerar.
"""

import sys
import json
import math
from pathlib import Path

import numpy as np

from audio_comun import TASA, a_estereo, estrechar, guardar_wav, nivelar, recortar_silencio, suavizar_bordes

RAIZ = Path(__file__).resolve().parent.parent
SALIDA = RAIZ / "studio" / "public" / "sfx"
CATALOGO = SALIDA / "catalogo.json"


# ───────────────────────── piezas básicas ─────────────────────────


def tiempo(duracion: float) -> np.ndarray:
    return np.arange(int(duracion * TASA)) / TASA


def ruido(n: int, rng: np.random.Generator) -> np.ndarray:
    return rng.uniform(-1, 1, n)


def ataque_caida(t: np.ndarray, ataque: float, caida: float) -> np.ndarray:
    return (1 - np.exp(-t / max(ataque, 1e-5))) * np.exp(-t / caida)


def oscilador(frecuencia: np.ndarray, forma: str = "seno") -> np.ndarray:
    fase = np.cumsum(frecuencia) / TASA
    if forma == "sierra":
        return 2 * (fase % 1) - 1
    if forma == "cuadrada":
        return np.sign(np.sin(2 * np.pi * fase))
    return np.sin(2 * np.pi * fase)


def caida_exponencial(t: np.ndarray, f_inicio: float, f_fin: float, constante: float) -> np.ndarray:
    return f_fin + (f_inicio - f_fin) * np.exp(-t / constante)


def pasabanda_variable(senal: np.ndarray, frecuencias, q: float) -> np.ndarray:
    """Filtro de estado variable (Chamberlin) con frecuencia que cambia en el tiempo."""
    frecuencias = np.broadcast_to(np.asarray(frecuencias, dtype=float), senal.shape)
    salida = np.zeros_like(senal)
    bajo = banda = 0.0
    amortiguacion = 1 / q
    for i, x in enumerate(senal):
        f = 2 * math.sin(math.pi * min(frecuencias[i], TASA / 6) / TASA)
        bajo += f * banda
        alto = x - bajo - amortiguacion * banda
        banda += f * alto
        salida[i] = banda
    return salida


def pasabajos(senal: np.ndarray, corte: float) -> np.ndarray:
    a = math.exp(-2 * math.pi * corte / TASA)
    salida = np.zeros_like(senal)
    y = 0.0
    for i, x in enumerate(senal):
        y = (1 - a) * x + a * y
        salida[i] = y
    return salida


def pasaaltos(senal: np.ndarray, corte: float) -> np.ndarray:
    return senal - pasabajos(senal, corte)


def campana(t: np.ndarray, centro: float, ancho: float) -> np.ndarray:
    return np.exp(-(((t - centro) / ancho) ** 2))


def saturar(senal: np.ndarray, empuje: float) -> np.ndarray:
    """Saturación suave: añade armónicos (se oyen mejor en parlantes de teléfono) sin recortar duro."""
    return np.tanh(empuje * senal) / np.tanh(empuje)


def panear(mono: np.ndarray, pan) -> np.ndarray:
    """Paneo de igual potencia; pan de -1 (izquierda) a 1 (derecha), fijo o variable en el tiempo."""
    angulo = (np.asarray(pan) + 1) * np.pi / 4
    return np.stack([mono * np.cos(angulo), mono * np.sin(angulo)], axis=1)


def reverb(senal: np.ndarray, rng: np.random.Generator, cola: float, mezcla: float, brillo: float = 6000) -> np.ndarray:
    """Reverb por convolución con ruido que decae (-60 dB en `cola` s), distinto en cada canal: da espacio y amplitud."""
    senal = a_estereo(senal)
    n = int(cola * TASA)
    t = np.arange(n) / TASA
    respuesta = np.stack([ruido(n, rng), ruido(n, rng)], axis=1) * np.exp(-t * 6.9 / cola)[:, None]
    respuesta[: int(0.006 * TASA)] = 0
    respuesta = np.stack([pasabajos(respuesta[:, c], brillo) for c in range(2)], axis=1)
    respuesta /= np.sqrt(np.sum(respuesta**2, axis=0)) + 1e-12
    largo = len(senal) + n - 1
    humeda = np.fft.irfft(np.fft.rfft(senal, largo, axis=0) * np.fft.rfft(respuesta, largo, axis=0), largo, axis=0)
    seca = np.pad(senal, ((0, n - 1), (0, 0)))
    return seca * (1 - mezcla) + humeda * mezcla


# ───────────────────────── recetas ─────────────────────────


def pop(rng):
    t = tiempo(0.18)
    cuerpo = oscilador(caida_exponencial(t, rng.uniform(900, 1500), rng.uniform(140, 190), 0.007)) * ataque_caida(t, 0.0005, rng.uniform(0.026, 0.036))
    armonico = oscilador(caida_exponencial(t, 2600, 380, 0.005)) * ataque_caida(t, 0.0003, 0.012) * 0.25
    chasquido = pasaaltos(ruido(len(t), rng), 3000) * np.exp(-t / 0.0015) * 0.3
    mono = saturar(cuerpo + armonico + chasquido, 1.6)
    return reverb(panear(mono, rng.uniform(-0.15, 0.15)), rng, 0.25, 0.12)


def click(rng):
    t = tiempo(0.08)
    golpe = pasaaltos(ruido(len(t), rng), 1200) * np.exp(-t / 0.002)
    resonancia = pasabanda_variable(ruido(len(t), rng), rng.uniform(2500, 4000), 12) * np.exp(-t / 0.008) * 0.6
    golpecito = oscilador(np.full(len(t), 180.0)) * ataque_caida(t, 0.0005, 0.008) * 0.4
    return reverb(panear(golpe + resonancia + golpecito, rng.uniform(-0.1, 0.1)), rng, 0.15, 0.08)


def tic(rng):
    t = tiempo(0.05)
    tono = oscilador(np.full(len(t), rng.uniform(1900, 2600))) * ataque_caida(t, 0.0003, 0.007)
    brillo = pasaaltos(ruido(len(t), rng), 5000) * np.exp(-t / 0.001) * 0.2
    return panear(tono + brillo, 0)


def blip(rng):
    t = tiempo(0.24)
    base = rng.uniform(650, 950)
    mitad = len(t) // 2
    frecuencia = np.where(np.arange(len(t)) < mitad, base, base * 1.5)
    tono = oscilador(frecuencia) + 0.3 * oscilador(frecuencia * 3)
    env = np.concatenate([ataque_caida(t[:mitad], 0.001, 0.05), ataque_caida(t[: len(t) - mitad], 0.001, 0.08)])
    pan = np.where(np.arange(len(t)) < mitad, -0.2, 0.2)
    return reverb(panear(saturar(tono * env * 0.7, 1.3), pan), rng, 0.35, 0.16)


def whoosh(rng):
    duracion = rng.uniform(0.45, 0.65)
    t = tiempo(duracion)
    centro = duracion * rng.uniform(0.45, 0.6)
    paso = campana(t, centro, duracion * 0.3)
    graves = pasabanda_variable(ruido(len(t), rng), 180 + 900 * paso, 1.2) * 0.8
    agudos = pasabanda_variable(ruido(len(t), rng), 900 + rng.uniform(3000, 4500) * paso, 2.2) * 0.6
    mono = (graves + agudos) * campana(t, centro, duracion * 0.27)
    sentido = rng.choice([-1, 1])
    pan = sentido * np.tanh((t - centro) / (duracion * 0.18)) * 0.8
    return reverb(panear(mono, pan), rng, 0.45, 0.2, 5000)


def swish(rng):
    duracion = rng.uniform(0.18, 0.25)
    t = tiempo(duracion)
    frecuencias = np.linspace(rng.uniform(1800, 2600), rng.uniform(6000, 8000), len(t))
    mono = pasabanda_variable(ruido(len(t), rng), frecuencias, 2.8) * np.sin(np.pi * t / duracion) ** 2
    pan = np.linspace(-0.7, 0.7, len(t)) * rng.choice([-1, 1])
    return reverb(panear(mono, pan), rng, 0.3, 0.14)


def riser(rng):
    duracion = rng.uniform(1.5, 1.9)
    t = tiempo(duracion)
    subida = (t / duracion) ** 2.2
    soplo = pasabanda_variable(ruido(len(t), rng), 300 + 7000 * subida, 3.0)
    tremolo = 0.75 + 0.25 * np.sin(2 * np.pi * np.cumsum(4 + 22 * subida) / TASA)
    base = 110 + 660 * subida
    # Sierras desafinadas distintas por canal: es lo que da el ancho estéreo.
    izquierda = sum(oscilador(base * d, "sierra") for d in (1.0, 1.007, 0.5)) / 3
    derecha = sum(oscilador(base * d, "sierra") for d in (1.0, 0.993, 0.5)) / 3
    tono = np.stack([pasabajos(izquierda, 2500), pasabajos(derecha, 2500)], axis=1) * 0.5
    senal = (panear(soplo * 0.8, 0) + tono) * (subida * tremolo)[:, None]
    senal *= np.clip((duracion - t) / 0.015, 0, 1)[:, None]
    return reverb(saturar(senal, 1.4), rng, 0.6, 0.18)


def impacto(rng):
    t = tiempo(1.4)
    sub = oscilador(caida_exponencial(t, 70, 38, 0.25)) * ataque_caida(t, 0.002, rng.uniform(0.35, 0.5))
    cuerpo = oscilador(caida_exponencial(t, rng.uniform(170, 220), 60, 0.04)) * ataque_caida(t, 0.001, 0.12)
    crujido = pasaaltos(pasabajos(ruido(len(t), rng), 4500), 250) * np.exp(-t / 0.025)
    mono = saturar(sub * 0.9 + cuerpo * 0.8 + crujido * 0.7, 2.5)
    return reverb(panear(mono, 0), rng, 1.3, 0.22, 3000)


def sub_drop(rng):
    t = tiempo(1.4)
    tono = oscilador(caida_exponencial(t, 120, 32, 0.4)) * ataque_caida(t, 0.004, 0.55)
    # Saturación fuerte: los armónicos hacen que la caída se oiga también en el altavoz de un teléfono.
    return reverb(panear(saturar(tono, 3.0), 0), rng, 0.8, 0.12, 2000)


def glitch(rng):
    duracion = rng.uniform(0.28, 0.42)
    n = int(duracion * TASA)
    senal = np.zeros((n, 2))
    i = 0
    while i < n:
        largo = min(int(rng.uniform(0.008, 0.04) * TASA), n - i)
        tt = np.arange(largo) / TASA
        tipo = rng.integers(0, 4)
        if tipo == 0:
            trozo = np.sign(np.sin(2 * np.pi * rng.uniform(80, 900) * tt))
        elif tipo == 1:
            trozo = np.round(ruido(largo, rng) * 3) / 3
        elif tipo == 2:
            trozo = oscilador(np.full(largo, rng.uniform(1500, 4000)), "cuadrada") * 0.6
        else:
            trozo = np.zeros(largo)
        senal[i : i + largo] = panear(trozo * rng.uniform(0.4, 1), rng.uniform(-0.8, 0.8))
        i += largo
    return np.stack([pasabajos(senal[:, c], 8000) for c in range(2)], axis=1) * 0.8


def ding(rng):
    t = tiempo(1.4)
    base = rng.choice([880.0, 1046.5, 1174.7])
    parciales = [(1, 1.0, 0.7), (2.76, 0.45, 0.3), (5.4, 0.22, 0.14), (8.93, 0.1, 0.06)]
    campanada = sum(a * oscilador(np.full(len(t), base * r)) * ataque_caida(t, 0.001, c) for r, a, c in parciales)
    golpe = pasaaltos(ruido(len(t), rng), 4000) * np.exp(-t / 0.002) * 0.2
    return reverb(panear(campanada + golpe, 0), rng, 1.1, 0.25)


def error(rng):
    t = tiempo(0.5)
    mitad = len(t) // 2
    frecuencia = np.where(np.arange(len(t)) < mitad, 230.0, 172.0)
    env = np.concatenate([ataque_caida(t[:mitad], 0.002, 0.12), ataque_caida(t[: len(t) - mitad], 0.002, 0.18)])
    # Base mono común + un poco de lado desafinado: ancho estéreo sin cancelarse al sumar a mono (altavoz del teléfono).
    centro = pasabajos(oscilador(frecuencia, "cuadrada") * env, 1800)
    lado = pasabajos(oscilador(frecuencia * 1.006, "cuadrada") * env, 1800) * 0.25
    return reverb(np.stack([centro + lado, centro - lado], axis=1) * 0.5, rng, 0.3, 0.1)


def tecla(rng):
    t = tiempo(0.09)
    golpe = pasaaltos(ruido(len(t), rng), 1500) * np.exp(-t / rng.uniform(0.003, 0.006))
    plastico = pasabanda_variable(ruido(len(t), rng), rng.uniform(2000, 3200), 8) * np.exp(-t / 0.01) * 0.5
    cuerpo = oscilador(np.full(len(t), rng.uniform(300, 480))) * np.exp(-t / 0.012) * 0.3
    return reverb(panear(golpe + plastico + cuerpo, rng.uniform(-0.3, 0.3)), rng, 0.12, 0.06)


def succion(rng):
    """Reverse swell: un golpe con mucha reverb, al revés. Crece y corta justo en el corte."""
    t = tiempo(0.12)
    golpe = pasabajos(ruido(len(t), rng), 5000) * np.exp(-t / 0.03) + oscilador(np.full(len(t), 160.0)) * np.exp(-t / 0.05)
    cola = reverb(panear(golpe, 0), rng, rng.uniform(0.6, 0.8), 0.85, 7000)
    return estrechar(cola[::-1], 0.35)


# id: (función, variantes, categoría, descripción, usos, volumen sugerido 0-1)
RECETAS = {
    "pop": (pop, 3, "aparicion", "Pop redondo con chasquido y algo de sala", ["aparece texto o ícono", "entra una palabra clave", "sticker"], 0.6),
    "click": (click, 3, "interfaz", "Clic de interfaz con cuerpo", ["selección", "check en una lista", "botón"], 0.55),
    "tic": (tic, 3, "interfaz", "Tic seco y agudo", ["contador que sube", "cada paso de un número"], 0.35),
    "blip": (blip, 2, "aparicion", "Dos tonos que suben, de izquierda a derecha", ["notificación", "dato nuevo", "etiqueta"], 0.45),
    "whoosh": (whoosh, 3, "transicion", "Paso de aire en dos capas que cruza el estéreo", ["transición entre escenas", "texto que cruza", "cambio de tema"], 0.55),
    "swish": (swish, 2, "transicion", "Barrido rápido y agudo que cruza el estéreo", ["entrada rápida", "deslizamiento corto"], 0.45),
    "riser": (riser, 2, "tension", "Subida con sierras desafinadas y trémolo, corta seco", ["antes de una revelación", "antes del gancho"], 0.5),
    "impacto": (impacto, 3, "enfasis", "Golpe grave con sub, crujido y sala grande", ["revelación", "número grande", "remate"], 0.7),
    "sub-drop": (sub_drop, 1, "enfasis", "Caída de bajo saturada (se oye en el teléfono)", ["momento dramático", "después de un riser"], 0.6),
    "glitch": (glitch, 3, "transicion", "Interferencia digital que salta de lado a lado", ["corte brusco", "error", "tema tecnológico"], 0.45),
    "ding": (ding, 2, "resultado", "Campana con armónicos y sala", ["acierto", "resultado positivo", "logro"], 0.45),
    "error": (error, 1, "resultado", "Zumbido de error desafinado", ["dato negativo", "mito desmentido", "lo que no hay que hacer"], 0.45),
    "tecla": (tecla, 3, "interfaz", "Tecla de teclado plástica", ["texto que se escribe letra a letra"], 0.4),
    "succion": (succion, 2, "transicion", "Golpe al revés que crece y corta", ["justo antes de un corte", "entrada en reversa"], 0.5),
}


def variantes_de_biblioteca(catalogo_previo: dict) -> dict[str, dict]:
    """Sonidos y variantes importados de bibliotecas, para no perderlos al regenerar."""
    resultado = {}
    for sonido in catalogo_previo.get("sonidos", []):
        importadas = [v for v in sonido["variantes"] if v.get("fuente") == "biblioteca"]
        if importadas:
            resultado[sonido["id"]] = {**sonido, "variantes": importadas}
    return resultado


def main() -> None:
    SALIDA.mkdir(parents=True, exist_ok=True)
    previo = json.loads(CATALOGO.read_text(encoding="utf-8")) if CATALOGO.exists() else {}
    biblioteca = variantes_de_biblioteca(previo)

    sonidos = []
    for numero, (id_, (funcion, variantes, categoria, descripcion, usos, volumen)) in enumerate(RECETAS.items()):
        archivos = []
        for v in range(1, variantes + 1):
            rng = np.random.default_rng(1000 * numero + v)
            senal = suavizar_bordes(nivelar(recortar_silencio(funcion(rng), -60), categoria))
            ruta = SALIDA / f"{id_}-{v}.wav"
            duracion = guardar_wav(ruta, senal)
            archivos.append({"archivo": f"sfx/{ruta.name}", "duracion": round(duracion, 3), "fuente": "sintesis"})
        importadas = biblioteca.pop(id_, {}).get("variantes", [])
        sonidos.append(
            {"id": id_, "categoria": categoria, "descripcion": descripcion, "usos": usos, "volumen": volumen, "variantes": archivos + importadas}
        )
        print(f"{id_:9s} {variantes} sintetizada(s) + {len(importadas)} de biblioteca")
    # Sonidos que solo existen en biblioteca (p. ej. orgánicos).
    for id_, sonido in biblioteca.items():
        sonidos.append(sonido)
        print(f"{id_:9s} {len(sonido['variantes'])} de biblioteca")

    CATALOGO.write_text(
        json.dumps({"origen": "pipeline/generar_sfx.py + pipeline/importar_sfx.py", "sonidos": sonidos}, ensure_ascii=False, indent=1),
        encoding="utf-8",
    )
    print(f"Catálogo: {CATALOGO}")


if __name__ == "__main__":
    # En Windows la consola o una tubería en cp1252 no imprime "→" ni "±".
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    main()
