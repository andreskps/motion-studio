"""Utilidades de audio compartidas por generar_sfx.py e importar_sfx.py: lectura, escritura y nivelado.

Todo el audio del estudio se guarda igual: WAV 48 kHz, 16 bits, estéreo, nivelado por volumen percibido.
"""

import os
import subprocess
import time
import wave
from pathlib import Path

import numpy as np

TASA = 48000
PICO_MAXIMO_DB = -1.0
VENTANA_S = 0.05

# Volumen percibido objetivo por categoría (dB del tramo de 50 ms más fuerte). Así un whoosh de biblioteca y uno
# sintetizado suenan igual de fuertes, y el volumen final se decide en la mezcla (volumen sugerido del catálogo).
OBJETIVO_DB = {
    "aparicion": -16.0,
    "interfaz": -18.0,
    "transicion": -16.0,
    "tension": -16.0,
    "enfasis": -12.0,
    "resultado": -16.0,
    "organico": -16.0,
}


def a_estereo(senal: np.ndarray) -> np.ndarray:
    return np.stack([senal, senal], axis=1) if senal.ndim == 1 else senal


def nivel_percibido_db(senal: np.ndarray) -> float:
    """RMS del tramo de 50 ms más fuerte de la mezcla mono. Para sonidos cortos sirve mejor que el LUFS integrado."""
    mono = a_estereo(senal).mean(axis=1)
    n = max(1, int(VENTANA_S * TASA))
    if len(mono) < n:
        return 20 * np.log10(np.sqrt(np.mean(mono**2)) + 1e-12)
    potencia = np.convolve(mono**2, np.ones(n) / n, mode="valid")
    return 10 * np.log10(np.max(potencia) + 1e-12)


LIMITACION_MAXIMA_DB = 6.0


def nivelar(senal: np.ndarray, categoria: str) -> np.ndarray:
    senal = a_estereo(senal)
    senal = senal - senal.mean(axis=0)
    objetivo = OBJETIVO_DB.get(categoria, -16.0)
    senal = senal * 10 ** ((objetivo - nivel_percibido_db(senal)) / 20)
    techo = 10 ** (PICO_MAXIMO_DB / 20)
    # Golpes muy picudos (clics de 10 ms): hasta 6 dB del pico se redondean con un limitador suave, así llegan al
    # volumen objetivo; si hace falta más, se baja todo (mejor un poco menos fuerte que distorsionado).
    pico = np.max(np.abs(senal)) + 1e-12
    margen = techo * 10 ** (LIMITACION_MAXIMA_DB / 20)
    if pico > margen:
        senal = senal * margen / pico
    if np.max(np.abs(senal)) > techo * 0.7:
        rodilla = techo * 0.7
        exceso = np.abs(senal) > rodilla
        senal = np.where(
            exceso,
            np.sign(senal) * (rodilla + (techo - rodilla) * np.tanh((np.abs(senal) - rodilla) / (techo - rodilla))),
            senal,
        )
    return senal


def estrechar(senal: np.ndarray, ancho: float) -> np.ndarray:
    """Reduce el ancho estéreo (mid/side) para que el sonido no pierda volumen en un altavoz mono."""
    senal = a_estereo(senal)
    medio = (senal[:, 0] + senal[:, 1]) / 2
    lado = (senal[:, 0] - senal[:, 1]) / 2 * ancho
    return np.stack([medio + lado, medio - lado], axis=1)


def perdida_en_mono_db(senal: np.ndarray) -> float:
    senal = a_estereo(senal)
    return 10 * np.log10(np.mean(senal**2) + 1e-12) - 10 * np.log10(np.mean(senal.mean(axis=1) ** 2) + 1e-12)


def compatible_con_mono(senal: np.ndarray, maxima_db: float = 1.5) -> np.ndarray:
    """Estrecha el estéreo lo justo para que al sumar a mono (altavoz del teléfono) no pierda más de `maxima_db`."""
    ancho = 1.0
    while perdida_en_mono_db(estrechar(senal, ancho)) > maxima_db and ancho > 0:
        ancho = round(ancho - 0.1, 2)
    return estrechar(senal, max(ancho, 0.0))


def suavizar_bordes(senal: np.ndarray, ms: float = 2.0) -> np.ndarray:
    senal = a_estereo(senal).copy()
    n = min(int(ms / 1000 * TASA), len(senal) // 4)
    if n > 0:
        senal[:n] *= np.linspace(0, 1, n)[:, None]
        senal[-n:] *= np.linspace(1, 0, n)[:, None]
    return senal


def guardar_wav(ruta: Path, senal: np.ndarray) -> float:
    senal = np.clip(a_estereo(senal), -1, 1)
    ruta.parent.mkdir(parents=True, exist_ok=True)
    temporal = ruta.with_suffix(".tmp")
    with wave.open(str(temporal), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(TASA)
        w.writeframes((senal * 32767).astype("<i2").tobytes())
    # En Windows un reproductor o el antivirus pueden tener el archivo abierto un instante: se reintenta.
    for intento in range(5):
        try:
            os.replace(temporal, ruta)
            break
        except OSError:
            if intento == 4:
                raise OSError(f"No pude escribir {ruta}: ciérralo si lo tienes abierto en un reproductor")
            time.sleep(0.5)
    return len(senal) / TASA


def leer_con_ffmpeg(ruta: Path) -> np.ndarray:
    """Lee cualquier formato que entienda ffmpeg y lo devuelve como float32 estéreo a 48 kHz."""
    salida = subprocess.run(
        ["ffmpeg", "-hide_banner", "-loglevel", "error", "-i", str(ruta), "-f", "f32le", "-ac", "2", "-ar", str(TASA), "-"],
        capture_output=True,
        check=True,
    ).stdout
    return np.frombuffer(salida, dtype="<f4").reshape(-1, 2).astype(np.float64)


def recortar_silencio(senal: np.ndarray, umbral_db: float = -50.0, margen_ms: float = 5.0) -> np.ndarray:
    """Quita el silencio del principio y del final (relativo al pico del sonido)."""
    mono = np.abs(a_estereo(senal)).max(axis=1)
    umbral = np.max(mono) * 10 ** (umbral_db / 20)
    sobre = np.nonzero(mono > umbral)[0]
    if len(sobre) == 0:
        return senal
    margen = int(margen_ms / 1000 * TASA)
    return senal[max(0, sobre[0] - margen) : min(len(senal), sobre[-1] + margen)]
