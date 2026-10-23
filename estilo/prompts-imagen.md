# Preparar assets reales con ChatGPT

El estudio **no genera ilustraciones con IA**: lo genérico se cuenta con pictogramas de trazo. ChatGPT (o cualquier editor) solo sirve para **preparar un asset real** que ya tienes: una foto de producto, un logo, la foto de una persona. Nunca para inventar una cara, un logo o un producto.

## Especificaciones (para todos)

- **Logos y productos:** PNG con fondo transparente (o SVG para logos), lado mínimo 900 px.
- **Personas:** JPG o PNG, cara bien iluminada, encuadre de medio cuerpo o primer plano, lado mínimo 800 px.
- **Sin texto añadido ni marcas de agua.**
- `pipeline/assets.py` comprueba formato, tamaño y transparencia.

## Prompts listos para pegar (adjuntando la imagen)

**Quitar el fondo**
> Quita el fondo de esta imagen y entrégala como PNG con fondo transparente. No cambies nada del objeto: ni la forma, ni los colores, ni el texto de la etiqueta. Deja un margen de aire de ~10 % alrededor.

**Ampliar o limpiar una foto pequeña**
> Mejora la nitidez y la resolución de esta foto hasta al menos 1500 px de lado, sin cambiar el contenido ni los rasgos de la persona ni del producto. Sin filtros ni retoques de estilo.

**Recortar a una persona**
> Recorta esta foto en un encuadre cuadrado centrado en la cara y los hombros de la persona, con algo de aire sobre la cabeza. No modifiques sus rasgos.

**Logo en versión clara o oscura** (si el original no se lee sobre el fondo del video)
> Convierte este logo a una versión monocromática en blanco puro (#FFFFFF) sobre fondo transparente, sin cambiar su forma ni sus proporciones. PNG de al menos 1200 px de ancho.

## Si ChatGPT altera el asset

Si cambia letras de la etiqueta, rasgos de una cara o la forma del logo, **descártalo**: un asset real alterado es peor que un pictograma. Usa una herramienta de quitar fondos que no regenere la imagen, o pide al director que use el pictograma.
