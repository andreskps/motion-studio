---
description: Analiza referencias nuevas (videos o imágenes) y propone cómo actualizar el ADN
argument-hint: "[ruta del video o imagen, o vacío para las que no tengan ficha]"
---

Analiza las referencias indicadas: $ARGUMENTS

Si no se indica ninguna, busca en `estilo/referencias/videos/` e `imagenes/` las que todavía no tienen carpeta en `estilo/referencias/fichas/`.

1. Para cada referencia, lanza el subagente `analista-referencias`. Puede ir en paralelo si son varias.
2. Junta lo que devuelvan:
   - reglas del ADN confirmadas (sube su conteo [n/N]);
   - patrones nuevos;
   - contradicciones.
3. Muéstraselo al usuario en una tabla corta y propón los cambios concretos a `estilo/ADN.md` y, si aplica, a `estilo/tokens.json`.
4. Aplica solo lo que el usuario apruebe. Anota el cambio en `estilo/aprendizajes.md` con la fecha.
