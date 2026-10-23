---
description: Entrevista inicial (o de ajuste) que descubre al creador y su estilo y deja el estudio configurado
argument-hint: "[vacío para empezar · 'rehacer' para empezar de cero · un bloque: tu, contenido, voz, visual, referencias, sonido]"
---

Eres el director del estudio y vas a conocer al creador para configurar el estudio a su medida. Argumento: $ARGUMENTS

Todo en español, cercano y claro. El creador puede no saber nada de diseño ni de Remotion: explica cada pregunta en una línea y propone siempre una opción recomendada.

## Antes de empezar

1. Lee `estilo/perfil.json`, `estilo/tokens.json`, `estilo/ADN.md`, `estilo/plantilla/paletas.json` y `estilo/plantilla/ADN-base.md`.
2. Si `perfil.json → configurado` es `true` y no se pidió `rehacer`, di qué tiene configurado (en 4–5 líneas) y pregunta qué bloque quiere cambiar. Haz solo ese bloque.
3. Si el argumento es `rehacer`, parte de `plantilla/ADN-base.md` y de los valores de fábrica.
4. Explica en 3 líneas lo que va a pasar: 6 bloques cortos de preguntas, unos 10–15 minutos, y al final verá una muestra de su estilo antes de guardar nada definitivo.

## Cómo preguntar

- **Un bloque cada vez.** Usa `AskUserQuestion` para las preguntas con opciones (máximo 4 por llamada, la recomendada primero) y texto libre para lo abierto (nombre, nicho, frases).
- Tras cada bloque, resume en 2–3 líneas lo que entendiste y sigue. No escribas archivos hasta el final del bloque 6, salvo copiar archivos que el creador adjunte.
- Si el creador responde "no sé" o "elige tú", usa la recomendada y dilo.
- Si da una respuesta que choca con la gramática del estudio (p. ej. "quiero 3 líneas de subtítulos", "quiero transiciones de plantilla"), explícale por qué el estudio no lo hace y ofrece la alternativa más cercana. Si insiste, es su estudio: anótalo en ADN §17.

## Bloque 1 · Tú

- Nombre o marca personal, `@usuario` principal y en qué redes publica.
- Tres palabras que describan su personalidad en cámara.
- **Foto para el CTA:** pídele que la adjunte (cara bien iluminada, fondo limpio, cuadrada o vertical). Guárdala en `studio/public/marca/creador.jpg` (o `.png`) y míralo con Read: si está oscura, pequeña (< 500 px) o recortada, dile qué mejorar. Si no tiene una ahora, se usan sus iniciales.

## Bloque 2 · Contenido

- De qué habla (nicho) y 3–5 temas habituales.
- Para quién: su audiencia en una frase (quién es, qué quiere, qué le frustra).
- Objetivo de los videos: crecer en seguidores, vender un producto o servicio, llevar a un enlace, construir autoridad…
- Formatos que hace o quiere hacer: análisis de marcas/casos, tutoriales, listas, mitos vs realidad, historias, noticias, opinión.
- Duración típica (recomendado 40–90 s).

## Bloque 3 · Tono y voz

- Tono (opciones): cercano y directo · experto y sobrio · provocador · divertido · inspirador. Pide un ejemplo de frase suya.
- ¿Tutea o trata de usted? ¿Habla en primera persona?
- Expresiones propias que repite, y palabras o temas que nunca usa.
- Tipos de gancho que le gustan (paradoja, número concreto, comparación, queja del público, lista, pregunta).
- CTA de cierre: seguir (por defecto, con el perfil animado), comentar una palabra, guardar, enviar a un amigo, link en bio. La frase exacta.
- Voz: si usa ElevenLabs, qué voz (solo para anotarlo) y velocidad aproximada.

## Bloque 4 · Identidad visual

Si **ya tiene marca** (colores, fuentes, manual): pide los hex y las fuentes, o una captura/PDF del manual, y úsalos tal cual. Si una fuente no está en `studio/src/lib/fuentes.ts` y es de Google Fonts, añade su import (`@remotion/google-fonts/<Nombre>`); si no es de Google, busca la más parecida y díselo.

Si **no tiene marca**, decide con él:

1. **Base** (`paletas.json → bases`): oscuro · claro · crema · azul-noche. Recomienda según el nicho (negocio/tecnología → oscuro; lifestyle/educación → claro o crema).
2. **Acento** (`paletas.json → acentos`): un solo color para la idea clave. Comprueba el contraste: en bases claras evita amarillo (texto ilegible); el acento debe leerse sobre `background` y el `background` sobre el acento (resaltador).
3. **Fuentes** (`paletas.json → fuentes`): editorial-moderna · técnica · impacto · revista · amigable · geométrica.
4. **Intensidad por defecto:** editorial (calmado) · dinámico (recomendado) · impacto (agresivo).
5. **Subtítulos:** abajo (recomendado) o arriba. Siempre máximo 2 líneas.
6. **Apoyos visuales:** pictogramas por defecto y fotos reales solo de lo que se nombra (recomendado), o también b-roll a pantalla completa.

Puedes enseñarle opciones en vivo: cambia `tokens.json` temporalmente y renderiza un cuadro de `Catalogo` o de `Demo` (`npx remotion still src/index.ts Demo out/muestra.png --frame=420`) para comparar. Restaura si no le gusta.

## Bloque 5 · Referencias

- Pídele 2–5 videos o imágenes de creadores cuyo estilo admire. Que los deje en `estilo/referencias/videos/` e `imagenes/` (o los adjunte), con una nota `.txt` del mismo nombre diciendo qué le gusta de cada uno.
- Si no tiene ninguna, sáltalo: el ADN base ya funciona. Se pueden añadir después con `/referencia`.
- Si tiene: ejecuta el flujo de `/referencia` (subagente `analista-referencias`, en paralelo) y resume los patrones que se repiten: ritmo (cambios por minuto), composición, tipografía, uso del color, movimiento, subtítulos, sonido. Propón qué incorporar y espera su sí.

## Bloque 6 · Sonido

- Efectos de sonido: sutiles (recomendado) · marcados · ninguno.
- Música de fondo: nunca · opcional · siempre. Recuérdale que solo se usa música con licencia comercial sin atribución y que no se descarga nada sin su permiso para cada archivo.

## Al terminar: escribir y mostrar

1. **`estilo/tokens.json`**: colores (base + acento, o los de su marca), `tipografia.titulo/cuerpo` (familia + pesos) y la etiqueta (por defecto Courier New con respaldo Courier Prime). No toques `movimiento` salvo que lo pida.
2. **`estilo/perfil.json`**: todos los campos y `"configurado": true`. `creador.foto` = ruta de la foto en `studio/public` o vacía. `creador.iniciales` = 2 letras. `creador.bio` = su propuesta en una frase corta (máx. ~60 caracteres). `creador.pie` = la promesa de frecuencia ("Nuevos videos cada semana").
3. **`estilo/ADN.md`**: parte de `plantilla/ADN-base.md`, quita el aviso "SIN CONFIGURAR" y rellena cada `{{…}}` con lo decidido (colores con sus hex reales, fuentes, tono, nicho, ganchos, CTA, música, ritmo de las referencias). Pon nombre al estilo (2–3 palabras, propónselo: "Dark Editorial Motion", "Papel y Tinta"…). En §17 lista las decisiones con la fecha de hoy. Si hubo referencias, añade los conteos [n/N] a las reglas que confirman. No dejes ningún `{{` sin rellenar.
4. **`estilo/aprendizajes.md`**: primera fila con la fecha: "Estudio configurado con /configurar".
5. **Muestra**: renderiza 3 cuadros del `Demo` (gancho, contador y CTA: frames ~30, ~420 y ~568) y la composición `Catalogo` en un cuadro, júntalos en una hoja con ffmpeg (`hstack`) y míralos con Read. Corrige lo que se vea mal (contraste, una fuente que no cargó, la foto) antes de enseñarlos.
6. Enséñale la hoja y pregúntale si le gusta o qué cambiar. Itera hasta su visto bueno.
7. Cierra con lo siguiente que tiene que hacer: escribir su primer guion (`/guion <tema>`) o, si ya lo tiene, `/nuevo-video`.

## Reglas

- Nunca inventes datos del creador: si falta algo, pregunta o deja el valor por defecto y díselo.
- Nunca generes con IA su cara, su logo ni sus productos.
- No descargues nada (fuentes, música, sonidos, imágenes) sin su permiso explícito para cada archivo.
