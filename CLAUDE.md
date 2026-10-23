# MOTION-STUDIO

Plantilla de estudio para crear videos verticales con motion graphics en Remotion, a partir del guion y la voz (ElevenLabs) del creador. Se adapta a cada creador con una entrevista (`/configurar`) y aprende de cada video (`/retro`).

## Primero: ¿está configurado?

- Lee `estilo/perfil.json`. Si `"configurado": false`, **antes de cualquier otra cosa** saluda, explica en 2 líneas qué es el estudio y propón `/configurar` (la entrevista inicial: tú, contenido, tono, identidad visual, referencias y sonido). Si el creador quiere probar antes, enséñale el `Demo`.
- Si está configurado, trata al creador por su nombre y usa su perfil, su tono y su ADN en todo.

## Reglas fijas

- **Idioma:** siempre español, tanto al hablar con el creador como en código, comentarios, nombres y archivos.
- **Formato:** solo vertical 9:16, 1080×1920 a 30 fps. Todo texto e imagen importante va dentro de la zona segura (`studio/src/lib/formato.ts`).
- **El guion manda:** el texto de los subtítulos sale del guion. Whisper solo aporta los tiempos.
- **El estilo manda:** antes de diseñar, lee `estilo/ADN.md`, `estilo/tokens.json` y `estilo/perfil.json`. Nunca escribas colores, fuentes ni curvas a mano en una composición: usa `lib/estilo.ts` (incluye `estiloEtiqueta()`), `lib/motion.ts`, `lib/presets.ts` y `lib/perfil.ts`.
- **Palabras clave:** en el guion se marcan con `*asteriscos*`. Llegan a `palabras.json` como `clave: true` y van en el color de acento.
- **Subtítulos:** jamás más de 2 líneas.
- **Pictogramas por defecto:** assets solo de lo real que la voz nombra (logo, producto, persona). Nunca se generan con IA caras, logos ni productos.
- **Aprobaciones:** el creador aprueba el storyboard antes de construir y valida la previa antes de exportar. Nunca exportes un final sin su "validado".
- **Descargas:** nunca descargues sonidos, música, fuentes ni imágenes sin su aprobación explícita para cada archivo o pack (nombre, origen, tamaño y licencia).

## Comandos del estudio

| Comando | Para qué |
|---|---|
| `/configurar` | Entrevista inicial o de ajuste (`/configurar visual`, `/configurar rehacer`). Escribe `perfil.json`, `tokens.json` y `ADN.md`. |
| `/guion <tema>` | Escribe un guion en el tono del creador, con claves marcadas. |
| `/nuevo-video proyectos/<carpeta>` | Flujo completo: audio → storyboard + assets → construir → previa → exportar → retro. |
| `/assets proyectos/<carpeta> [verificar]` | Plan de assets reales o verificación de los cargados. |
| `/referencia [ruta]` | Analiza referencias nuevas (subagente `analista-referencias`) y propone cambios al ADN. |
| `/retro [comentarios]` | Registra lo aprendido en `estilo/aprendizajes.md` y sube al ADN lo que se repite. |

## Flujo de un video

1. El creador escribe el guion (o lo pide con `/guion`) y genera la voz en ElevenLabs con el texto limpio.
2. Deja `guion.txt` y `audio.mp3` en `proyectos/<AAAA-MM-DD-tema>/`.
3. `/nuevo-video proyectos/<carpeta>` y sigue los pasos, parando en cada aprobación.

## Audio → subtítulos (desde la raíz)

- `.venv/Scripts/python pipeline/procesar_audio.py proyectos/<slug>` hace todo y copia audio + `palabras.json` a `studio/public/proyectos/<slug>/`:
  1. **Alineación forzada** del guion con stable-ts (Whisper `medium`, CPU) → `alineacion.json`.
  2. **Corrección del desvío** del alineador y **ajuste a pausas** (ffmpeg silencedetect, −35 dB, 0,25 s).
  3. **Verificación** con faster-whisper (`large-v3-turbo`) → `transcripcion.json`, comparada con el guion.
  4. **Métrica de sincronía** en `sincronia.json` (p50 y p95 de los inicios de frase frente a las pausas).
- Los pasos 1 y 3 se guardan en caché (`--rehacer` los repite; `--sin-verificar` salta el 3).
- Revisa las líneas `REVISAR` (inicios de frase a más de 350 ms de su pausa) y las diferencias de la verificación. Un nombre propio mal escrito por Whisper es normal; una palabra omitida o añadida significa que el audio no coincide con el guion.
- Referencia: en un video real de 83 s, inicios de frase 100 % a ±45 ms tras la corrección. Tarda ~50 s + ~65 s de verificación.
- Puertos fijos en `remotion.config.ts`: Studio en el 3000 y los renders en el 3123. Si un render dice que el 3123 está ocupado, añade `--port=<otro>`.

## Construir un video

- **Sobre `<Lienzo>`, nunca como diapositivas:** `<Voz>` → `<Intensidad>` → `<Lienzo camara fija>` → `<Elemento id x y entra estados sale>`. El ejemplo corto es `studio/src/compositions/Demo.tsx`; el modelo completo de un video real (83 s) es `studio/src/compositions/ejemplos/GrunsLienzo.tsx` con su guion y storyboard en `ejemplos/gruns/`. El vocabulario y la API están en `studio/src/components/CATALOGO.md`.
- **Anclas en el guion:** `{nombre}` delante de una palabra. Todo `en` acepta `"cifra"`, `"cifra@fin"`, `"cifra-120ms"`, `"texto:palabra#n"` (la n-ésima vez que se dice; ojo con palabras repetidas como "para") o frames.
- **Intensidades:** `editorial` · `dinamico` · `impacto`, por elemento (`modo`), por toma de cámara o envolviendo con `<Intensidad>`. La de por defecto está en `perfil.json → preferencias.intensidad`.
- **CTA:** `MockupPerfil` toma usuario, foto, propuesta y pie de `perfil.json`. Patrón: corte a primer plano de la foto (`escala: 2.6`, `y: 722`) y alejamiento que construye la tarjeta (`detallesEn`), cursor que pulsa Seguir (`pulsaEn`).
- **Exportar (un solo comando):** `.venv/Scripts/python pipeline/exportar.py <Composicion> --proyecto <slug>` → render + masterizado a −14 LUFS + QA de ritmo; el final queda en `exportados/`.
- **Después de renderizar a mano:** `pipeline/masterizar.py studio/out/<video>.mp4` y `pipeline/qa_ritmo.py studio/out/<video>.master.mp4 --palabras proyectos/<slug>/palabras.json`; corrige los `REVISAR`, sobre todo los huecos de más de 3 s sin evento con la voz hablando.

## Componentes y sonido

- **Antes de construir una escena, lee `studio/src/components/CATALOGO.md`.** La composición `Catalogo` los muestra todos en acción.
- Fuentes: `tokens.json` (`tipografia.titulo/cuerpo`: `familia` + `pesos`) con `@remotion/google-fonts`. Las familias registradas están en `lib/fuentes.ts`; para otra de Google Fonts, añade su import. Paletas y combinaciones de partida en `estilo/plantilla/paletas.json`.
- SFX sintetizados: `.venv/Scripts/python pipeline/generar_sfx.py` regenera `studio/public/sfx/*.wav` y `catalogo.json`. Para un sonido nuevo, añade una receta en `RECETAS`.
- SFX de bibliotecas: `.venv/Scripts/python pipeline/importar_sfx.py <archivos|carpetas> --id <id> --licencia <CC0|Pixabay|...> --origen <pack/URL>`. Rechaza licencias con atribución o no comerciales. Los de `studio/public/sfx/biblioteca/` son CC0 (Kenney).
- La música va en `studio/public/music/`, siempre con licencia comercial sin atribución (ver `music/LEEME.md`).

## Comandos (desde `studio/`)

- `npm run studio`: preview en el navegador (http://localhost:3000).
- `npx remotion still src/index.ts <Id> out/<archivo>.png --frame=<n>`: un cuadro suelto para revisar.
- `npx remotion render src/index.ts <Id> out/<archivo>.mp4`: render.
- `npm run typecheck`

## Estructura

- `estilo/`: todo lo del creador. `perfil.json` (quién es, de qué habla, tono, CTA), `tokens.json` (colores, fuentes, movimiento), `ADN.md` (reglas de estilo), `aprendizajes.md` (registro), `referencias/` (videos, imágenes y fichas), `plantilla/` (ADN base y paletas para `/configurar`).
- `studio/`: proyecto Remotion. `src/lib/`, `src/components/`, `src/compositions/` (`Demo`, `ejemplos/`), `public/` (sfx, música, `marca/` con la foto del creador).
- `pipeline/`: scripts Python (audio, assets, QA, exportar).
- `proyectos/`: un directorio por video (`demo/` incluido).
- `ejemplos/`: guion y storyboard de un video real completo.

## Entorno

Windows, sin GPU (todo en CPU). Node 20+, Python 3.11 en `.venv`, ffmpeg. Remotion 4.0.538 con versiones exactas. Instalación: `instalar.ps1`.
