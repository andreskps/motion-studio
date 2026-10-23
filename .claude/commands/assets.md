---
description: Planifica los assets reales de un video (qué hace falta y para qué momento) o verifica los que cargó el creador
argument-hint: "proyectos/<slug> [verificar]"
---

Proyecto: $ARGUMENTS

Regla del estudio (ADN §7): **pictogramas por defecto**. Solo se piden assets de lo **real que la voz nombra**: logo de una marca, su producto conocido, la foto de una persona con nombre, capturas de su web o app. Nunca se generan con IA caras, logos ni productos.

## Si se pide verificar (o el creador acaba de cargar archivos)

1. Si los adjuntó en el chat, cópialos a `proyectos/<slug>/assets/` con el nombre exacto del plan.
2. Corre `.venv/Scripts/python pipeline/assets.py proyectos/<slug>` (comprueba formato, tamaño y transparencia, y convierte WebP/AVIF a PNG).
3. Mira cada asset con Read: ¿es el real, se ve nítido, el logo tiene fondo transparente, la persona está bien encuadrada? Si algo falla, dile qué hacer; si hace falta prepararlo (quitar fondo, recortar, ampliar), dale el prompt de `estilo/prompts-imagen.md` listo para pegar en ChatGPT.
4. Vuelve a renderizar la previa. **Exporta solo cuando el creador lo valide.**

## Si se pide planificar

1. Lee `proyectos/<slug>/guion.txt` (con sus anclas), el storyboard si existe y `estilo/ADN.md` §7.
2. Lista solo los assets reales que la voz nombra, en el momento en que los nombra. Lo demás se cuenta con pictogramas: no lo pongas en el plan.
3. Escribe `proyectos/<slug>/assets/plan.json`:
   ```json
   {
     "video": "Título del video",
     "assets": [
       { "archivo": "logo.svg", "origen": "real", "descripcion": "Logo de la marca", "momento": "{gancho} y {giro}", "transparente": true, "fuente": "web oficial o kit de prensa" },
       { "archivo": "producto.png", "origen": "real", "descripcion": "Su producto más conocido", "momento": "{producto}", "transparente": true, "fuente": "web oficial", "prompt": "(solo si hay que prepararlo) Quita el fondo de esta foto…" },
       { "archivo": "fundador.jpg", "origen": "real", "descripcion": "Foto del fundador; si no hay, pictograma 'persona'", "momento": "{fundador}" }
     ]
   }
   ```
4. Corre `pipeline/assets.py`, que genera `plan.md`, y enséñale la tabla. Puedes ofrecerte a buscar el logo oficial en la web de la marca, pero **pide permiso antes de descargar cada archivo** (nombre, origen y tamaño).
