# Catálogo de componentes

Referencia para armar videos. Puedes ver todos en acción en la composición `Catalogo`.

**Convención:** cada componente anima desde el frame 0 de su `<Sequence>` (o `TransitionSeries.Sequence`) y sale solo en sus últimos 6–8 frames. Para que algo entre cuando la voz lo dice, coloca la `Sequence` en el frame de esa palabra (`Math.round(palabra.inicio * 30)`), sacado de `palabras.json`.

Todos toman colores, fuentes y forma de `estilo/tokens.json`. No pases colores a mano salvo que la escena lo pida.

**Distribución vertical:** el contenido va centrado hacia el 45 % de la altura y los subtítulos al 66 %, para que no choquen.

## Texto

| Componente | Para qué | Props clave | Sonido sugerido |
|---|---|---|---|
| `texto/TituloCinetico` | Gancho, frase clave, remate. Entra palabra por palabra | `texto`, `variante` (`subir` · `escala` · `mascara`), `resaltar` (palabras en acento), `tamano`, `centroY`, `escalonado` | `pop` en la primera palabra; `whoosh` si entra con transición |
| `texto/Resaltado` | Frase con un marcador que barre detrás de las palabras clave | `texto`, `clave`, `retrasoMarcador` | `swish` cuando barre el marcador |
| `texto/Etiqueta` | Píldora técnica en mono: "DATO", "PASO 1", "≈ 20% MENOS" | `texto`, `icono`, `tono` (`destacada` en el acento · `neutra` en gris), `centroY` | `blip` o `click` |

## Datos

| Componente | Para qué | Props clave | Sonido sugerido |
|---|---|---|---|
| `datos/Contador` | Cifra de impacto que cuenta y da un golpe al llegar | `hasta`, `prefijo`, `sufijo`, `decimales`, `duracion` (frames), `etiqueta` | `riser` al empezar e `impacto` en `en={duracion}` |
| `datos/Lista` | Pasos o consejos, ítem por ítem | `items`, `titulo`, `escalonado` (sincronízalo con la voz), `icono` (`check` · `numero` · `cruz`) | `click` en cada ítem |
| `datos/Comparacion` | A vs B, antes/después, mito/realidad | `arriba`, `abajo` (`{titulo, valor, detalle}`), `ganador` | `pop` en el VS, `ding` en el ganador (o `error` en el perdedor) |
| `datos/GraficoBarras` | Comparar 2 a 5 cifras | `datos` (`{etiqueta, valor}[]`), `titulo`, `prefijo`, `sufijo`, `destacar` | `tic` o `pop` por barra |
| `datos/BarraProgreso` | Barra de retención que avanza con el video | `color`, `posicion` | — (va fuera de toda `Sequence`) |

## Imagen y video

Las rutas son relativas a `studio/public` (`assets/<proyecto>/foto.jpg`). `.mp4`, `.mov` y `.webm` se tratan como video, en silencio.

| Componente | Para qué | Props clave | Sonido sugerido |
|---|---|---|---|
| `imagen/ImagenKenBurns` | Foto a pantalla completa con zoom y paneo lento | `src`, `zoomDesde`, `zoomHasta`, `moverX`, `moverY`, `oscurecer` | — |
| `imagen/ImagenTarjeta` | Foto en tarjeta que se revela y queda flotando inclinada | `src`, `ancho`, `alto`, `rotacion`, `pie` | `pop` o `swish` |
| `imagen/BrollConTexto` | B-roll de fondo con degradado y título | `src`, `texto`, `resaltar`, `posicion` | `whoosh` al entrar |
| `imagen/PantallaDividida` | Dos imágenes arriba/abajo que entran desde lados opuestos | `arriba`, `abajo`, `etiquetaArriba`, `etiquetaAbajo` | `whoosh` |
| `imagen/Medio` | Pieza base: imagen o video que llena su contenedor | `src`, `desdeSegundo` | — |

## Efectos

| Componente | Para qué | Props clave |
|---|---|---|
| `efectos/FondoAnimado` | Lienzo de la escena: negro de marca, como mucho con una textura técnica tenue | `variante` (`liso` · `cuadricula` · `puntos`), `velocidad` |
| `efectos/ZoomGolpe` | Envuelve una escena y le da un zoom de golpe en frames concretos | `en` (frames), `intensidad` |
| `efectos/Flash` | Destello en un corte o golpe | `en`, `color`, `duracion` |

## Transiciones (`lib/transiciones.ts`)

`transicion(nombre)` devuelve `presentation`, `timing` y un `sonido` sugerido para `TransitionSeries`.
**El ADN solo permite `corte`, `fundido` y `barrido`** (y transformaciones o "atenuar y construir" dentro de una escena). Las demás existen, pero no son de tu estilo.

| Nombre | Efecto | Sonido |
|---|---|---|
| `corte` | Corte seco | — |
| `golpe` | Empuje con flash blanco | `impacto` |
| `deslizar` / `subir` | Entra desde la derecha / desde abajo | `whoosh` / `swish` |
| `barrido` | Cortinilla desde la izquierda | `whoosh` |
| `fundido` | Fundido cruzado | — |
| `iris` | Círculo que se abre | `succion` |
| `reloj` | Barrido circular | `whoosh` |
| `voltear` | Giro 3D | `swish` |

## Sonido

| Componente | Para qué | Props clave |
|---|---|---|
| `sonido/Sfx` | Efecto del catálogo | `sonido` (id), `en` (frame), `variante`, `fuente` (`sintesis` · `biblioteca`), `volumen` (multiplica el sugerido) |
| `sonido/Musica` | Música con fundidos y ducking automático bajo la voz | `src`, `volumen` (0,25), `volumenConVoz` (0,08), `palabras`, `fundido` |

**Catálogo de SFX** (`public/sfx/catalogo.json`): `pop`, `click`, `tic`, `blip`, `whoosh`, `swish`, `riser`, `impacto`, `sub-drop`, `glitch`, `ding`, `error`, `tecla`, `succion`, y de biblioteca (Kenney, CC0): `interruptor`, `golpe`, `golpe-suave`, `metal`, `madera`, `vidrio`, `campana`. `click`, `tic`, `ding`, `error`, `glitch`, `pop` y `blip` mezclan variantes sintetizadas y de Kenney. Los orígenes y las licencias están en `public/sfx/biblioteca/LICENCIAS.md`. Cada uno trae sus usos y su volumen sugerido. Todas las variantes (sintetizadas y de biblioteca) están niveladas al mismo volumen percibido por categoría, así que se pueden alternar. Si no indicas `variante`, `<Sfx>` alterna para que no suene siempre igual.

**Reglas de sonido:** como máximo un SFX por segundo en promedio. Sonidos fuertes (`impacto`, `sub-drop`) solo en los 2 o 3 momentos clave del video. Nada encima de una palabra importante de la voz salvo que la refuerce.

## Subtítulos

`Subtitulos` (en `components/`) recibe `palabras` de `palabras.json`.
- `modo="frase"` (por defecto, ADN): la frase se construye palabra por palabra en la fuente del cuerpo, sentence case, con las palabras `clave` (marcadas con `*` en el guion) en el acento. `posicion` es `arriba` (alineada a la izquierda bajo el HUD) o `abajo` (tercio inferior, centrada).
- `modo="pagina"`: estilo reel clásico, con páginas de hasta 3 palabras grandes. No es del ADN: úsalo solo si se pide.

---

# ADN 1.1: construir sobre el lienzo

**Los videos se construyen con `<Lienzo>`, no con escenas que entran y salen** (ADN §4–§5). La referencia viva es la composición `CatalogoLienzo`.

```tsx
<Voz datos={datos}>                       {/* sincronía: momentos por palabra */}
  <Intensidad modo="dinamico">            {/* editorial · dinamico · impacto, anidable */}
    <Lienzo camara={[{ en: "giro", objetivo: "cifra", escala: 1.3 }]} fija={<><HUD …/><Subtitulos …/></>}>
      <Elemento id="cifra" x={540} y={880} entra={{ en: "cifra", direccion: "escala" }}
                estados={[{ en: "ratio", y: 700, escala: 0.6 }, { en: "cta", atenuado: true }]}>
        …
      </Elemento>
    </Lienzo>
  </Intensidad>
</Voz>
```

- **Momentos (`en`):** frames o referencias de la voz: `"cifra"`, `"cifra@fin"`, `"cifra-120ms"`, `"texto:diez#2"`. Las anclas se marcan en el guion con `{nombre}`.
- **`<Elemento>`:** `entra` / `sale` (dirección semántica o `corte`), `estados` (mover, escalar, `atenuado`, nuevo `contenido` con cruce = transformar o reemplazar). Debe ser hijo directo del lienzo para que la cámara lo encuadre por `id`.
- **Cámara (`camara`):** tomas `{ en, x, y, escala }` u `{ en, objetivo }`. La toma llega a su destino en el momento indicado. Admite `modo` y `corte`.
- **Capa `fija`:** HUD, rastreador, subtítulos y SFX. No se mueve con la cámara.
- **Presets (`useAnimacion()`):** entrar, salir, escalonado, enfasis, escalaEnfasis, atenuar, dibujar, contar (`llegaEn`), reemplazar, avance. Todos toman duración y curva de la intensidad.
- **Composiciones (`lib/composiciones.ts`):** `cifra`, `comparacion`, `diagrama`, `objetoCentral`, `pasos`, `transformacion`, `generalDetalle`, `enPantalla` (para escenas que la cámara visita con un paneo).

## Vocabulario visual (`components/vocabulario/`)

| Componente | Para qué | Props clave |
|---|---|---|
| `IconoTrazo` | iconos de línea que se dibujan (26 en `iconos.ts`) | `nombre`, `tamano`, `foco`, `dibujarEn` |
| `LineaConectora` | conectar A → B (hija del lienzo) | `desde`, `hasta`, `en`, `curva`, `flecha`, `tono`, `atenuarEn` |
| `Tachar` | mito → realidad | `texto`, `reemplazo`, `en`, `posicion` (`encima` · `debajo`) |
| `RejillaCantidad` | cantidades que se ven (puntos hasta ~1.000, iconos hasta ~40) | `cantidad`, `columnas`, `forma`, `en`, `resaltes[{en, cantidad o indices, atenuarResto}]` |
| `HUD` | contadores fijos arriba que cambian en vivo | `izquierda` / `derecha`: `{etiqueta, valores[{en, valor}], destacado}` |
| `RastreadorPasos` | "PASO 1 2 3…" persistente | `pasos[{nombre, en}]` |
| `MockupMovil` / `MockupComentario` | interfaz simplificada / CTA que se escribe solo | `children` / `palabra`, `en`, `usuario` |
| `EtiquetaGuia` | rótulo técnico con línea guía (hija del lienzo) | `x`, `y`, `dx`, `dy`, `texto`, `en`, `foco` |

Los componentes de la Fase 2 (`texto/`, `datos/`, `imagen/`) ocupan toda la pantalla y animan desde el inicio de su `<Sequence>`. Úsalos dentro de una `<Sequence from={…}>` en la capa fija, o como referencia visual. Para el lienzo, prefiere el vocabulario nuevo.

## Marca y sistema de tarjetas (`components/marca/`)

Los assets de marca van en `proyectos/<slug>/assets/` (`logo.png`, `producto.png`, `fundador.jpg`, capturas…; sin b-roll). `procesar_audio.py` (o `pipeline/assets.py`) los copia al estudio y genera `assets.json`. La composición los recibe con `cargarAssets()` en `calculateMetadata` y `<Assets valor>`. **Si un asset falta, se muestra un marcador "FALTA · nombre".**

| Componente | Para qué | Props clave |
|---|---|---|
| `Tarjeta` | contenedor saasyass en oscuro: contorno, cabecera mono, sombra dura | `titulo`, `foco`, `ancho`, `relleno` |
| `Logo` | logo con colores reales, revelado con barrido | `archivo` ("logo"), `alto`, `enmarcado`, `revelarEn` |
| `Foto` | foto en tarjeta, revelado y Ken Burns sutil; sin foto, dibuja un pictograma | `archivo`, `ancho`, `alto`, `titulo`, `pie`, `foco`, `revelarEn`, `pictograma` |
| `Ilustracion` | asset IA de trazo con fondo transparente, sin marco, revelado de abajo arriba; sin archivo, pictograma | `archivo`, `tamano`, `revelarEn`, `pictograma` |
| `Sello` | resultado que se estampa (impacto) | `texto`, `en`, `tamano`, `rotacion`, `tono` |
| `TextoMarcado` | resaltador del acento detrás de las `*claves*` | `texto`, `en` (uno o uno por clave), `tamano`, `fuente` |
| `BrollPantalla` | **no es del ADN (sin b-roll)**: queda solo por si algún día se decide lo contrario | `archivo`, `desde`, `hasta`, `etiqueta` |
