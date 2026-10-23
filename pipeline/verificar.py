"""Verificación: ¿el audio dice lo que dice el guion?

La alineación forzada asume que sí, así que una transcripción independiente
(faster-whisper) sirve para detectar palabras que la voz se saltó, cambió o añadió.
Las diferencias que solo son de escritura ("3" frente a "tres") se ignoran cuando
coinciden letra por letra tras normalizar.
"""

from difflib import SequenceMatcher

from alinear import normalizar

# Números escritos a letras: suficiente para no marcar "tres" frente a "3".
NUMEROS = {
    "0": "cero", "1": "uno", "2": "dos", "3": "tres", "4": "cuatro", "5": "cinco",
    "6": "seis", "7": "siete", "8": "ocho", "9": "nueve", "10": "diez",
}


def _clave(texto: str) -> str:
    n = normalizar(texto)
    return NUMEROS.get(n, n)


def es_confiable(palabra: dict) -> bool:
    """Descarta las alucinaciones típicas de Whisper: palabras sin duración o casi sin probabilidad."""
    return bool(normalizar(palabra["texto"])) and palabra["fin"] - palabra["inicio"] >= 0.02 and palabra["prob"] >= 0.05


def diferencias(guion: list[dict], transcripcion: list[dict]) -> list[dict]:
    transcripcion = [p for p in transcripcion if es_confiable(p)]
    a = [_clave(p["texto"]) for p in guion]
    b = [_clave(p["texto"]) for p in transcripcion]
    textos_a = [p["texto"] for p in guion]
    textos_b = [p["texto"] for p in transcripcion]
    resultado = []
    for tipo, i1, i2, j1, j2 in SequenceMatcher(a=a, b=b, autojunk=False).get_opcodes():
        if tipo == "equal" or "".join(a[i1:i2]) == "".join(b[j1:j2]):
            continue
        # "1.200" frente a "1 .200": la misma cifra partida de otra forma.
        if normalizar("".join(textos_a[i1:i2])) == normalizar("".join(textos_b[j1:j2])):
            continue
        resultado.append(
            {
                "tipo": {"replace": "cambiada", "delete": "omitida", "insert": "añadida"}[tipo],
                "guion": " ".join(p["texto"] for p in guion[i1:i2]),
                "audio": " ".join(textos_b[j1:j2]),
                "segundo": guion[i1]["inicio"] if i1 < len(guion) else None,
            }
        )
    return resultado
