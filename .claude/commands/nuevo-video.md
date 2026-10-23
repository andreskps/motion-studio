---
description: Lleva un video de guion + audio a MP4 final, parando en cada aprobación del creador
argument-hint: "proyectos/<carpeta>"
---

Proyecto: $ARGUMENTS

Sigue el flujo completo. **Para y espera al creador** en los puntos marcados con ⏸. Usa la lista de tareas para que vea en qué paso vas.

## 0. Comprobar

- Si `estilo/perfil.json → configurado` es `false`, avisa de que el video saldrá con el estilo de fábrica y ofrece `/configurar` antes. Sigue si lo prefiere.
- Deben existir `guion.txt` y `audio.mp3` en la carpeta. Si falta el audio, dale el texto limpio (sin `*` ni `{}`) para ElevenLabs y para.

## 1. Audio → tiempos

- `.venv/Scripts/python pipeline/procesar_audio.py <proyecto>` (unos 2 minutos).
- Revisa la salida: líneas `REVISAR` y diferencias de la verificación. Una palabra omitida o añadida significa que la voz no dice el guion: díselo y propón corregir el guion o regenerar la voz. Un nombre propio mal escrito por Whisper es normal.

## 2. Storyboard + plan de assets ⏸

- Lee `estilo/ADN.md` completo, `estilo/aprendizajes.md` (lo que le gustó y lo que no en videos anteriores: aplícalo), `studio/src/components/CATALOGO.md` y, como modelo de construcción, `studio/src/compositions/ejemplos/GrunsLienzo.tsx` con su `ejemplos/gruns/storyboard.md`.
- Añade anclas `{nombre}` al guion delante de las palabras donde pasa algo (`alcanzó {cifra}*1.200 millones*`) y vuelve a correr el paso 1 si las añadiste (usa la caché: es rápido).
- Escribe `proyectos/<slug>/storyboard.md`: tabla por beats (tiempo, lo que dice la voz, lo que se ve, composición, intensidad, cámara, sonido) + estaciones del lienzo + cortes (máx. uno cada 8–10 s).
- Plan de assets con `/assets <proyecto>`: solo lo real que se nombra.
- Enséñale el storyboard resumido y la tabla de assets. ⏸ **No construyas hasta que lo apruebe.**

## 3. Assets ⏸

- Cuando adjunte los archivos: `/assets <proyecto> verificar`. Lo que falte se dibuja con su pictograma; no bloquea.

## 4. Construir

- Crea `studio/src/compositions/<NombrePascal>.tsx` sobre `<Lienzo>` (nunca diapositivas) y regístralo en `studio/src/Root.tsx` con `calculateMetadata` como `Demo`.
- CTA final: `MockupPerfil` (toma usuario y foto de `perfil.json`) con el primer plano de la foto y el alejamiento, salvo que su CTA sea otro.
- `npm run typecheck` (desde `studio/`).
- Revisión cuadro a cuadro: renderiza un cuadro por beat (`npx remotion still … --frame=<n>`), júntalos en hojas con ffmpeg y míralos. Busca: textos cortados o fuera de la zona segura, subtítulos en 3 líneas, elementos de otra estación colándose por el borde, palabras resaltadas partidas, contraste.
- Render de prueba + `pipeline/qa_ritmo.py`: corrige los huecos de más de 3 s sin evento con la voz hablando, con eventos que la voz justifique.

## 5. Previa ⏸

- Abre o recuerda Remotion Studio (`npm run studio` en `studio/`, http://localhost:3000) y dile qué composición elegir.
- Itera con sus cambios. ⏸ **Nunca exportes sin su "validado".**

## 6. Exportar

- `.venv/Scripts/python pipeline/exportar.py <Composicion> --proyecto <slug>` → `exportados/`. Dile la ruta, la duración y que ya está a −14 LUFS.

## 7. Retro

- Pregúntale qué le gustó y qué cambiaría, y ejecuta `/retro` con su respuesta.
