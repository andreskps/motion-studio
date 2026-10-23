# MOTION-STUDIO

Un estudio de videos verticales con motion graphics que trabaja contigo dentro de Claude Code. Tú pones el guion y la voz; el estudio anima, sincroniza cada palabra, revisa el ritmo y exporta el MP4 listo para TikTok, Reels o Shorts. Antes de empezar te entrevista para aprender quién eres, de qué hablas, tu tono y tu estilo visual, y mejora con cada video.

## Qué consigues

- Videos 9:16 (1080×1920, 30 fps) animados sobre un lienzo continuo: cámara que viaja, cifras que cuentan, diagramas que se dibujan, tarjetas con tus fotos reales.
- Subtítulos que se construyen palabra por palabra, con tus ideas clave en tu color.
- Cada animación llega justo cuando la voz dice su palabra.
- Cierre con tu perfil: tu foto, tu @usuario y un cursor que pulsa Seguir.
- Sonido masterizado a −14 LUFS y una QA automática de ritmo.

---

## 1. Instalar (una vez)

Necesitas Windows, [Node.js](https://nodejs.org) (LTS), [Python 3.11](https://python.org), ffmpeg (`winget install Gyan.FFmpeg`) y [Claude Code](https://claude.com/claude-code). No hace falta tarjeta gráfica.

En una terminal, dentro de esta carpeta:

```powershell
powershell -ExecutionPolicy Bypass -File instalar.ps1
```

Tarda unos minutos (descarga Remotion y Whisper). Al terminar, el video de demostración ya funciona.

## 2. Configurar tu estudio (una vez, ~15 minutos)

Abre Claude Code en esta carpeta y escribe:

```
/configurar
```

Claude te hace seis bloques cortos de preguntas, siempre con una opción recomendada:

| Bloque | Qué te pregunta |
|---|---|
| **Tú** | nombre, @usuario, redes, personalidad y tu foto para el cierre |
| **Contenido** | de qué hablas, para quién, qué buscas con los videos, formatos y duración |
| **Tono y voz** | cómo hablas, expresiones tuyas, palabras que nunca usas, ganchos favoritos y tu CTA |
| **Identidad visual** | tus colores y fuentes (o eliges una paleta y un acento), intensidad del movimiento, subtítulos |
| **Referencias** | 2–5 videos o imágenes de creadores que admiras: los analiza y extrae patrones |
| **Sonido** | efectos y música |

Al final te enseña una muestra de tu estilo aplicada al video demo. Cuando te guste, queda guardada en `estilo/`: tu perfil, tus colores y fuentes, y tu **ADN** (las reglas de estilo que se aplican en cada video).

¿Quieres cambiar algo después? `/configurar visual`, `/configurar voz`… o empezar de cero con `/configurar rehacer`.

## 3. Hacer un video

### Paso 1 · El guion

Escríbelo tú o pídeselo a Claude:

```
/guion por qué Gymshark creció sin tiendas físicas
```

Reglas para que salga bien:

- **Marca las ideas clave con asteriscos:** `facturó *1.200 millones* en un año`. Una o dos por frase.
- **Frases cortas** y **cifras concretas** (las cifras se animan como contadores).
- **Nombra lo real** solo si aporta: si dices una marca, un producto o una persona, el video pedirá su foto. Todo lo demás se dibuja con pictogramas.
- Gancho en los 3 primeros segundos, desarrollo, remate y tu CTA.

### Paso 2 · La voz

Genera la voz en ElevenLabs con el guion **exacto, sin los asteriscos**. Crea una carpeta en `proyectos/` (`proyectos/2026-11-02-gymshark/`) y deja dentro:

- `guion.txt`, con los asteriscos;
- `audio.mp3`, la voz.

### Paso 3 · Pedir el video

```
/nuevo-video proyectos/2026-11-02-gymshark
```

Claude va paso a paso y **se para cuando tiene que preguntarte**:

1. Saca el tiempo de cada palabra y comprueba que la voz dice exactamente el guion.
2. **Te propone el storyboard** (qué se ve en cada momento) y la lista de fotos reales que hacen falta. Lo apruebas o pides cambios.
3. **Le pasas las fotos** (logo, producto, persona) adjuntándolas en el chat. Lo que no tengas se dibuja con un pictograma.
4. Construye el video, lo revisa cuadro a cuadro y pasa la QA de ritmo.
5. **Lo revisas** en Remotion Studio: `cd studio` y `npm run studio`, abre http://localhost:3000 y elige la composición que te diga.
6. Pides cambios concretos: *"en el segundo 12, cuando dice 'beneficio', el contador llega tarde"*.
7. Cuando esté bien: **"Validado, expórtalo."** El MP4 queda en `exportados/`.
8. Le cuentas qué te gustó y qué no (`/retro`): lo anota y el siguiente video sale mejor.

## 4. Frases útiles

| Quieres… | Dile a Claude |
|---|---|
| Un guion | `/guion <tema>` |
| Empezar un video | `/nuevo-video proyectos/<carpeta>` |
| Ver la previa | "Abre el Studio" |
| Ver un momento sin abrir Studio | "Enséñame el cuadro del segundo 15" |
| Más energía o más calma | "Esta parte con más impacto" / "más editorial" |
| Añadir música | "Ponle música de fondo" (te propone pistas con licencia y pide permiso) |
| Exportar | "Validado, expórtalo" |
| Enseñarle un estilo nuevo | `/referencia` y adjunta el video o la imagen |
| Cambiar tu estilo para siempre | "A partir de ahora, los números siempre con contador" |

## 5. Si algo falla

| Pasa esto | Qué hacer |
|---|---|
| Avisa de una palabra omitida o añadida | La voz no dice el guion: regenera el audio o ajusta el guion |
| Un nombre propio sale raro en la verificación | Normal: los subtítulos usan tu guion |
| Sale un pictograma donde esperabas una foto | Falta ese asset: adjúntalo y pide que lo ponga |
| El puerto 3000 está ocupado | Ya tienes un Studio abierto: usa esa pestaña |
| Un subtítulo en tres líneas | No debería pasar: dile el segundo exacto |
| Una parte se siente parada | "Más movimiento de X a Y segundos" |

## Dónde vive cada cosa

- `estilo/`: **todo lo tuyo**. `perfil.json` (quién eres, tono, CTA), `tokens.json` (colores y fuentes), `ADN.md` (tus reglas de estilo), `aprendizajes.md` (lo aprendido), `referencias/`.
- `proyectos/`: una carpeta por video. `demo/` es el ejemplo.
- `exportados/`: tus videos finales.
- `studio/`: el motor de animación (Remotion). No necesitas tocarlo.
- `pipeline/`: los scripts de audio, QA y exportación.

## Licencias y reglas

- El código del estudio tiene licencia [MIT](LICENSE): puedes usarlo, modificarlo y compartirlo, también con fines comerciales, manteniendo el aviso de copyright.
- Remotion tiene su propia licencia: es gratis para personas y equipos pequeños, pero algunas empresas necesitan una licencia de pago (ver [remotion.dev/license](https://www.remotion.dev/license)).
- Los efectos de sonido incluidos son sintetizados por el estudio o CC0 (Kenney). La música debe tener licencia comercial sin atribución.
- El estudio nunca genera con IA caras, logos ni productos reales, y nunca descarga nada sin tu permiso.
- La voz del `demo` es una voz sintética de Windows, solo para probar.
