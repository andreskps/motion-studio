# ADN — {{NOMBRE_DEL_ESTILO}} ({{CREADOR}})

> **Estado: SIN CONFIGURAR.** Ejecuta `/configurar` para la entrevista inicial. Hasta entonces el estudio usa los valores de fábrica: base oscura, acento azul, Plus Jakarta Sans / Inter / Courier New.

**Versión {{VERSION}}** · {{FECHA}}. Sale de la entrevista con el creador y del análisis de sus referencias (`referencias/fichas/`).
Las reglas marcadas **[n/N]** indican en cuántas referencias aparece el patrón. **[creador]** es una decisión del creador, y manda sobre las referencias.
El director lee este archivo antes de cada guion y cada storyboard. `aprendizajes.md` lo corrige con cada video.

Las secciones 1, 2, 3, 7 (marca), 14 (subtítulos), 15 y 17 son **del creador** y las rellena `/configurar`. Las demás son la **gramática del estudio**: valen para cualquier estilo y solo cambian si el creador lo pide.

---

## 1. Identidad [creador]

- **Quién:** {{CREADOR}} (@{{USUARIO}}). {{DESCRIPCION_CORTA}}
- **De qué habla:** {{NICHO_Y_TEMAS}}
- **Para quién:** {{AUDIENCIA}}
- **Objetivo de los videos:** {{OBJETIVO}}
- **Estilo:** {{ESTILO}} (p. ej. dynamic business storytelling + animated explainer + motion infographics).
- **Personalidad:** {{PERSONALIDAD}}
- **Tono de voz:** {{TONO}}. Habla de {{PERSONA_GRAMATICAL}} al espectador. Expresiones propias: {{EXPRESIONES}}. Nunca dice: {{PALABRAS_PROHIBIDAS}}.
- **Arco emocional:** {{ARCO}} (p. ej. descubrimiento → tensión → demostración → claridad → acción).
- **Regla editorial (el filtro de todo):** ninguna animación existe solo para decorar. Cada movimiento, corte o zoom **revela, compara, enfatiza o conecta** una idea. Si no hace una de esas cuatro cosas, se quita.
- **Lo que no somos:** plantillas de presentación animadas, un dashboard en movimiento, transiciones sin relación con la idea, collage caótico, **diapositivas que entran y salen**. {{LO_QUE_NO_SOMOS_EXTRA}}

## 2. Color [creador]

Los valores viven en `tokens.json → colores` (nombres de token a la izquierda). Bases y acentos de partida en `plantilla/paletas.json`.

| Token | Valor | Uso |
|---|---|---|
| background | `{{background}}` | lienzo |
| surface / surface2 / surfaceOffset | `{{surface}}` / `{{surface2}}` / `{{surfaceOffset}}` | capas, tarjetas, sombra sólida de las tarjetas |
| border / divider | `{{border}}` / `{{divider}}` | contornos, líneas, separadores |
| text / muted / faint | `{{text}}` / `{{muted}}` / `{{faint}}` | primario / secundario / metadatos y elementos atenuados |
| primary (**el acento**) | `{{primary}}` | **la idea más importante**: palabra clave, cifra clave, conector, elemento en foco |
| primaryHover | `{{primaryHover}}` | acento alternativo (rellenos, segundo nivel) |
| primaryDim | `{{primaryDim}}` | fondo suave de un resaltado |

- **Proporción por cuadro:** ~75 % fondo, ~15 % texto y grises, ~10 % acento. Es una guía, no una regla matemática.
- **Un solo acento por video.**
- **El acento nunca va** en superficies grandes ni en todo el subtítulo. Va solo en la palabra o cifra que importa.
- **Lo negativo** se distingue por forma, texto, posición o icono (✗, tachado, gris). `negativoExcepcion` solo como excepción semántica puntual (una pérdida); nunca es color de marca.
- **Marcas de terceros** de las que se habla: su logo, packaging o foto conserva sus colores reales. El lienzo y la interfaz narrativa siguen siendo del creador.

## 3. Tipografía [creador]

Los valores viven en `tokens.json → tipografia`. Las familias disponibles están en `studio/src/lib/fuentes.ts`.

| Rol | Fuente | Peso | Cómo se usa en video |
|---|---|---|---|
| Titular / cifra | {{FUENTE_TITULO}} | el más grueso declarado | cabeceras de escena, números grandes, el gancho |
| Explicación / subtítulo | {{FUENTE_CUERPO}} | 500 el texto, el más grueso la palabra clave | subtítulos y textos de apoyo, en sentence case |
| Etiqueta técnica | {{FUENTE_ETIQUETA}} | 400 | **versalitas espaciadas (tracking ~0,14 em), pequeñas (26–32 px)**: rótulos de objetos, contadores HUD, unidades, fuentes de datos |

- **Jerarquía por escena:** etiqueta mono (contexto) → titular o cifra (la idea) → elemento visual → subtítulo.
- **Nada de muros de mayúsculas.** Las mayúsculas quedan para etiquetas y titulares cortos.

## 4. Lienzo, continuidad y cortes

- **El video es una sola pieza animada.** Los elementos viven en un lienzo persistente: entran, se quedan, se atenúan, se transforman, se reemplazan. La cámara se mueve por ese lienzo. No hay "escenas" que entran y salen como diapositivas.
- **Continuidad por defecto; el corte es un recurso.** Un **corte duro** está permitido cuando:
  - genera **contraste** (antes / después, mito / realidad);
  - **acelera el ritmo** después de una construcción lenta;
  - introduce una **revelación** (la cifra, el giro).

  Como máximo **un corte cada 8–10 s**, para que conserve su fuerza. Va siempre en una palabra de la voz.
- **Transiciones por relación entre elementos** (en orden de preferencia):
  1. **Transformación:** un elemento se convierte en el siguiente (la tarjeta de sellos se vuelve un móvil).
  2. **Continuidad espacial:** la cámara se desplaza a la zona del lienzo donde está la idea siguiente.
  3. **Reemplazo:** lo nuevo ocupa la posición de lo anterior (sale y entra en el mismo sitio).
  4. **Cambio de escala:** zoom-in a un detalle o zoom-out al contexto.
  5. **Desplazamiento semántico:** el elemento se mueve en la dirección del significado (lo que crece sube, el tiempo avanza a la derecha, lo que se descarta baja y se atenúa).
  6. **Barrido del fondo:** solo para un cambio de capítulo.
- **No son del ADN:** voltear (flip), iris, reloj, glitch decorativo, deslizamientos sin motivo.

## 5. Reglas de continuidad

| Un elemento… | Cuándo |
|---|---|
| **Permanece** | La idea siguiente lo menciona, lo usa como contexto o lo compara. Si pasa a segundo plano, se **atenúa** (no se va). |
| **Se transforma** | La idea siguiente es una evolución, una parte o una consecuencia suya (tarjeta → móvil, 1 persona → 10 personas, número → barra). |
| **Desaparece** | Ya no tiene relación con lo que viene. Sale en la dirección semántica, o se atenúa a 0. Al cambiar de estación de cámara, lo de la anterior sale (que no se cuele por el borde). |
| **Reutiliza la posición** | Una idea nueva que reemplaza a otra ocupa su lugar, para que el ojo no tenga que buscar. |
| **Conecta dos ideas** | Con una **línea que se dibuja** de una a otra, una **cámara que viaja** de una a otra, o un **elemento que viaja** (el número sale de la tarjeta y aterriza en el gráfico). |

- **Ancla visual persistente:** los videos de más de ~30 s tienen al menos un elemento que dura casi todo el video (HUD de contador, rastreador de pasos, el objeto protagonista) y que da unidad.

## 6. Composición

**Estructura vertical base (1080×1920):**

| Zona | Altura | Qué va |
|---|---|---|
| HUD | 220–340 px | etiqueta de capítulo o rastreador de pasos, contadores (mono) |
| Cabecera | 340–620 px | titular o cifra de la escena |
| Escenario | 620–1290 px | ilustración, diagrama, dato: la demostración |
| Subtítulo | 1300–1460 px (centro en el 72 %) | la frase hablada, centrada, máximo 2 líneas |
| Seguridad | 1500–1920 px | nada importante (interfaz de la app) |

**Siete composiciones** (`studio/src/lib/composiciones.ts`): ninguna escena tiene que verse igual a la anterior, pero todas comparten la estructura.

| Composición | Cuándo | Organización |
|---|---|---|
| **Cifra protagonista** | un número que importa | cifra enorme al centro del escenario, etiqueta mono arriba, contexto pequeño debajo |
| **Comparación** | dos escenarios, antes y después, A vs B | dos columnas o dos filas del escenario, con un eje o un "vs" al centro |
| **Diagrama progresivo** | un proceso o sistema que se arma | nodos que aparecen y se conectan de arriba abajo o de izquierda a derecha |
| **Objeto central** | un producto, una herramienta, un concepto | objeto grande al centro, satélites (rótulos, datos, iconos) alrededor con líneas guía |
| **Secuencia de pasos** | marco de N pasos | rastreador en el HUD, el paso actual grande, los demás atenuados |
| **Transformación** | algo que cambia de estado | el mismo elemento en el mismo sitio, cambiando (morph, reemplazo, relleno) |
| **De lo general al detalle** | sistema → parte | vista general con muchos elementos y luego zoom-in a uno (o al revés para revelar el contexto) |

## 7. Ilustración, iconografía y marca

- **Pictogramas por defecto:** todo lo genérico (personas sin nombre, tiendas, dinero, carritos, conceptos, metáforas) se cuenta con los pictogramas de trazo del estudio (`IconoTrazo`, `RejillaCantidad`…): línea de 3–4 px en `text`, sin rellenos salvo el del foco, que va en el acento. No se generan ilustraciones con IA.
- **Diagramas que explican:** comparación de dos caminos, embudo o etapas, árbol que conecta, matriz que se rellena, flujo con flechas.
- **Cantidades visibles:** 1.000 es una textura de 1.000 mini iconos; 10 personas son 10 pictogramas; un crecimiento es una barra que sube.
- **Mockups de interfaz simplificados:** móvil, post, comentario, DM, inbox. Solo líneas y bloques.
- **Líneas guía para rotular:** etiqueta mono unida al objeto con una línea fina en `border`.

### Assets reales [creador]

La gente tiene que **reconocer lo real que se nombra**. Cada video usa solo los assets reales que la voz nombra, guardados en `proyectos/<slug>/assets/`:

| Asset | Cómo entra | Cuándo |
|---|---|---|
| `logo.svg` / `logo.png` (fondo transparente) | suelto, con barrido, con sus colores reales | en el gancho y en el giro, en grande; después queda pequeño como cabecera |
| `producto.png` | en `Foto` (tarjeta) o recortado | cuando se nombra el producto |
| `persona.jpg` (fundador, invitado…) | en `Foto` con cabecera ("FUNDADOR") | cuando se nombra a la persona |
| capturas, packaging, tienda | en `Foto` | como prueba de lo que dice la voz |

- **B-roll:** {{BROLL}} (por defecto, **no**: todo asset vive dentro del lienzo, en `Foto`, `Logo` o una tarjeta, y se mueve con la cámara).
- **Si un asset falta**, se dibuja su pictograma de respaldo, nunca una imagen inventada ni una genérica.
- **Siempre reales, nunca generados:** ni caras, ni logos, ni productos hechos con IA.
- **ChatGPT solo para preparar** esos assets reales (`estilo/prompts-imagen.md`): quitar el fondo, recortar, limpiar o ampliar.
- **Cada plan de video incluye su plan de assets** (`proyectos/<slug>/assets/plan.json` → `plan.md`).

### Sistema de tarjetas

- **`Tarjeta`:** contorno de 3 px en `text`, cabecera tipo ventana con rótulo mono, **sombra sólida desplazada** (10 px, sin desenfoque) en `surfaceOffset`. En foco, contorno y sombra en el acento.
- **Resaltador (`TextoMarcado`):** caja del acento que barre detrás de la palabra clave, con el texto en el color del fondo.
- **Sello (`Sello`):** un resultado que se estampa girado y cae con un golpe ("EN ~3 AÑOS", "PAGADO"). Siempre en intensidad de impacto.
- **Mockups de UI con cabecera** (post, comentario, inbox) dentro de tarjetas.

## 8. Intensidades de movimiento

Tres modos que **se combinan dentro del mismo video**: cada escena, o cada momento, declara el suyo. El modo por defecto del creador es **{{INTENSIDAD}}**.

| | Editorial | Dinámico | Impacto |
|---|---|---|---|
| Para | explicaciones complejas, datos, pausas para comprender | storytelling, marketing | ganchos, cifras, giros, revelaciones |
| Entrada | 14 frames | 10 frames | 6 frames |
| Desplazamiento de entrada | 24 px | 40 px | 72 px, o escala 0,85→1 |
| Escalonado | 4 frames | 3 frames | 2 frames |
| Cámara | 36 frames, reencuadres suaves | 24 frames, zooms semánticos | 10 frames, golpes de escala |
| Énfasis (escala) | 1,04 | 1,08 | 1,15 |
| Cortes duros | no | puntuales | sí, para revelar |

Los valores viven en `tokens.json → movimiento`. **Ningún componente escribe duraciones a mano**: las toma de la intensidad activa.

## 9. Vocabulario de animación (presets)

Todo movimiento sale de este vocabulario (`studio/src/lib/presets.ts`). Cada preset lee la intensidad activa.

| Preset | Qué hace | Uso narrativo |
|---|---|---|
| **Entrar / Salir** | aparece con desplazamiento semántico y sale igual | se nombra algo nuevo / deja de tener relación |
| **Revelado escalonado** | un grupo entra elemento a elemento | listas, rejillas, nodos |
| **Énfasis** | pulso de escala breve y vuelta, con el acento si es la clave | "esto es lo importante" en la palabra exacta |
| **Énfasis de escala** | crece y se queda grande (el resto se atenúa) | pasa a ser el protagonista |
| **Transformar (morph)** | cambia posición, tamaño, forma y contenido de un estado a otro | evolución, consecuencia, parte de |
| **Reemplazar** | sale y entra en el mismo sitio, con cruce | mito → realidad, viejo → nuevo |
| **Conectar** | una línea o flecha que se dibuja de A a B | causa → efecto |
| **Dibujo progresivo** | trazos que se dibujan | iconos, diagramas, gráficos |
| **Contador animado** | número que cuenta hasta su valor | cifras que evolucionan |
| **Resaltar / Atenuar** | sube a primer plano / baja a ~25 % | dirigir la mirada sin mover nada |
| **Foco de cámara** | la cámara encuadra un elemento | "mira aquí" |
| **Zoom in / Zoom out** | acercarse a un detalle / alejarse al contexto | de lo general al detalle, o revelar el todo |
| **Paneo / Reencuadre** | la cámara viaja por el lienzo | conectar conceptos que están en lugares distintos |

**Prohibido:** rebotes exagerados, sacudidas, rotaciones decorativas, blur gratuito, efectos genéricos de plantilla.

## 10. Cámara narrativa

- **La cámara se mueve para** **destacar** (zoom-in), **revelar el contexto** (zoom-out), **conectar** (pan) o **reencuadrar** entre elementos.
- **Cada movimiento tiene un motivo en la voz** y empieza o llega en una palabra.
- **Nada aleatorio:** no hay deriva constante, ni zoom "porque sí", ni movimientos sin destino.
- **Escala:** entre 0,6× (vista general) y 2,6× (detalle).
- **El HUD y los subtítulos no se mueven con la cámara.** Viven fuera del lienzo.

## 11. Foco y simultaneidad

- **Un único foco principal por momento.** Es lo que la voz está diciendo.
- **Varios elementos pueden animarse a la vez si forman una misma acción** (un grupo escalonado, la cámara junto con lo que revela, un número que cuenta mientras su barra crece). El foco es más grande, más brillante o el único en el acento.
- **Lo que no es foco** se atenúa (a ~25 %) o se queda quieto. Nunca compiten dos movimientos independientes.

## 12. Ritmo y timing

- **Microacontecimientos constantes:** un cambio visual significativo cada **1–3 s**. **El ritmo responde a la voz.**
- **Alternar cuatro tiempos:** rápido · construcción progresiva · pausa visual (1–2 s tras una cifra o idea clave) · ruptura (corte, zoom o revelación).
- **Nunca más de 3 s sin evento mientras habla la voz**, salvo en una pausa visual intencional. `pipeline/qa_ritmo.py` lo comprueba.
- **Nunca más de un foco nuevo a la vez.**
- **Banda de referencia:** el modo dinámico apunta a 6–14 cambios de escena por minuto. {{RITMO_REFERENCIAS}}

## 13. Sincronía con la voz

- **Lo visual ocurre cuando la voz lo dice,** a nivel de palabra, no por escenas completas.
- **Anclas en el guion:** `{nombre}` delante de una palabra marca ese instante (`Pero bastan {giro}*diez*.`). Las añade el director al construir.
- **Desfases:** `{giro}-120ms` para anticipar y `{giro}+300ms` para continuar después.
- **La animación llega en la palabra:** su entrada termina cerca del inicio de la palabra. Lo visual nunca va detrás de la voz.
- **Las cifras llegan a su valor final cuando se dice el número.** Los tachados ocurren en la palabra que corrige. Las cámaras llegan a su destino en el sustantivo que nombran.

## 14. Subtítulos [creador + estudio]

- **Una frase en construcción:** se escribe palabra por palabra mientras se dice.
- **Jamás más de 2 líneas** (regla del estudio). Si la frase cabe, va en una línea; si no, se corta en el punto que deja dos líneas parejas; si una línea no cabe, se reduce la letra antes que abrir una tercera.
- **Solo las palabras clave en el acento,** marcadas en el guion con `*asteriscos*`.
- **Posición:** {{SUBTITULOS}} (por defecto abajo y centrado), en la fuente del cuerpo, 48–56 px, sentence case.

## 15. Narrativa [creador]

- **La voz empieza en el segundo 0,0.** Sin intro, sin logo, sin silencio.
- **Ritmo de voz:** {{PPM}} palabras por minuto. Duración típica: {{DURACION}} s.
- **Formatos habituales:** {{FORMATOS}}
- **Tipos de gancho preferidos:** {{GANCHOS}} (paradoja · número concreto · comparación de dos · queja del público · lista · pregunta). **El gancho va en modo impacto.**
- **Desarrollo:** la intuición equivocada → el giro → **demostrar con un caso pequeño** → escalar → la cifra o la regla final.
- **Marco numerado con rastreador:** si la idea tiene pasos, un "PASO 1 2 3" persistente en el HUD.
- **Cierre y CTA:** {{CTA}}. Por defecto, el CTA de perfil (`MockupPerfil`): primer plano de la foto del creador → la tarjeta se construye al alejarse → el cursor pulsa Seguir (+1, latido). Usa `estilo/perfil.json`.

## 16. Sonido

- **Volumen final del master: −14 LUFS.**
- **Los efectos acompañan cambios de estado, no decoran:** `click`/`tic` al marcar o rellenar; `pop` suave al aparecer un elemento clave; `whoosh` suave en movimientos de cámara grandes y cortes; `impacto` solo en la cifra o revelación principal (1–2 por video); nada de `glitch`.
- **Música:** {{MUSICA}}. Siempre baja, con ducking bajo la voz, y con licencia comercial sin atribución. La voz siempre manda.

## 17. Decisiones del creador

{{DECISIONES}}

## 18. Estado del catálogo frente a este ADN

- **Base de movimiento:** `tokens.json → movimiento`, `lib/presets.ts`, `<Intensidad>`.
- **Sincronía:** anclas `{nombre}` en `alinear.py` y `useMomento()`.
- **Continuidad y cámara:** `<Lienzo>`, `<Elemento>` con estados, cámara por tomas.
- **Composiciones:** `lib/composiciones.ts`.
- **Vocabulario visual:** `HUD`, `RastreadorPasos`, `Tachar`, `LineaConectora`, `RejillaCantidad`, `IconoTrazo`, `MockupMovil`, `MockupComentario`, `EtiquetaGuia`, `Tarjeta`, `Foto`, `Logo`, `Sello`, `TextoMarcado`, `MockupPerfil`.
- **QA de ritmo:** `pipeline/qa_ritmo.py`.
