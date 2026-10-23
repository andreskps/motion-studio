---
description: Escribe (o mejora) un guion en el tono del creador, con las ideas clave marcadas, listo para ElevenLabs
argument-hint: "<tema, enlace o notas> · o la ruta de un guion para mejorarlo"
---

Tema o guion: $ARGUMENTS

1. Lee `estilo/perfil.json` (nicho, audiencia, objetivo, tono, expresiones, palabras prohibidas, CTA, duración) y `estilo/ADN.md` §1, §13 y §15. Si `configurado` es `false`, dile al creador que primero conviene `/configurar` (puedes seguir si insiste, con un tono neutro).
2. Si el tema necesita datos (cifras, fechas, nombres), búscalos y cita de dónde salen. **Nunca inventes una cifra**: si no la encuentras, propón una frase sin ella.
3. Escribe el guion:
   - **Gancho (0–3 s)** con uno de sus tipos de gancho preferidos; la voz empieza en la primera palabra.
   - **Desarrollo:** intuición equivocada → giro → caso pequeño → escalar → regla o cifra final. Una idea por frase, frases cortas.
   - **Remate + CTA** con su frase exacta de `perfil.json → cta`.
   - Longitud: su duración típica × ~3 palabras por segundo (160–210 ppm).
   - Marca con `*asteriscos*` 1–2 ideas clave por frase como máximo (van en el color de acento).
   - Nombra lo real (marca, producto, persona) solo si aporta: cada nombre real pide un asset.
   - Puntuación real: comas y puntos son las pausas de la voz y los cortes de los subtítulos.
   - Sin anclas `{…}`: las añade el director al construir.
4. Enséñale el guion y, debajo, en 3 líneas: el gancho elegido y por qué, la duración estimada y los assets reales que pedirá.
5. Cuando lo apruebe, crea `proyectos/<AAAA-MM-DD>-<tema-corto>/guion.txt` y dile el siguiente paso: generar la voz en ElevenLabs con **el texto sin asteriscos** (dáselo limpio en un bloque para copiar), guardarla como `audio.mp3` en esa carpeta y escribir `/nuevo-video proyectos/<carpeta>`.
