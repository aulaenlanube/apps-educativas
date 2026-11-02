# Láminas dibujadas del cuerpo humano — contrato y estilo

Cada lámina es un SVG `tools/anatomy/plates-svg/<id>.svg`. La lista de láminas,
su tamaño (`viewBox`), las estructuras que deben poder tocarse (`keys`) y qué
dibujar (`brief`) está en [`../hand-plates.mjs`](../hand-plates.mjs). Los nombres
y la función de cada clave, en `src/apps/_shared/anatomia/data/structures.js`.

`node tools/build-anatomy.mjs --hand-only <id>` las convierte en
`public/images/anatomia/<id>.webp` (ilustración) + `public/data/anatomia/<id>.json`
(zonas de toque). En la app se ven sobre un fondo oscuro de escáner
(`#0b1626` con retícula cian) y se pueden ampliar hasta ×6.

## Contrato (lo comprueba `node tools/anatomy/check-plate.mjs <id>`)

1. `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 W H">` con el tamaño exacto del manifiesto. Sin `width`/`height` fijos.
2. Fondo **transparente** (nada de rectángulo de fondo). La lámina flota sobre el escáner.
3. **Sin texto, rótulos, líneas guía, números ni flechas con letras**: el juego pregunta los nombres. Las flechas de sentido (circulación, impulso nervioso) sí, sin texto.
4. Prohibido: `<text>`, `<filter>`, `<image>`, `<foreignObject>`, `<script>`, `<style>`, `<animate>`, `filter:` y enlaces externos. Sombras y brillos con degradados (`linearGradient`/`radialGradient`), no con filtros.
5. Peso máximo 160 KB. Coordenadas con 1 decimal como mucho.
6. Las zonas de toque van al final, en `<g id="hits">` con **solo** `<path data-key="clave" d="…"/>`:
   - Coordenadas absolutas del viewBox: **sin `transform`** ni en las rutas ni en el grupo.
   - Una zona por clave (si la estructura está repetida, p. ej. dos ovarios, puedes poner varias rutas con la misma clave o una ruta con varios subtrazos).
   - El orden importa: **la última zona queda encima**. Pon primero las zonas grandes que contienen a otras (contorno de un órgano, un panel, el plasma) y después las pequeñas.
   - Las zonas siguen el contorno de lo dibujado; en estructuras finas (nervios, membranas, capas finas) hazlas algo más anchas que el dibujo (mín. ~18 unidades) para poder tocarlas con el dedo.
   - El grupo `hits` puede llevar `fill="none"` (no se pinta en la ilustración: el build lo quita).
   - Todas las `keys` del manifiesto deben estar y ninguna más.
7. Los `id` de degradados deben llevar el prefijo de la lámina (`ojo-iris`, `ojo-cornea`…), para que no choquen.

## Estilo (coherente con las láminas renderizadas de BodyParts3D)

Ilustración médica con volumen, legible a tamaño de móvil y elegante ampliada.
Referencia: las láminas renderizadas (`public/images/anatomia/esq-a.webp`,
`org-a.webp`, `mus-a.webp`): formas limpias, luz suave, colores naturales algo
saturados, contorno fino del tono oscuro del propio material.

- **Luz** desde arriba a la izquierda. Cada volumen: degradado del material
  (claro arriba-izquierda → base → oscuro abajo-derecha), una sombra propia en el
  lado contrario y un brillo especular discreto en las superficies húmedas.
- **Contornos**: trazo de 1,5–3 unidades del tono oscuro del material, nunca negro.
  Separación entre piezas por valor y color.
- **Paleta por material** (base · claro · oscuro):
  - hueso `#e9dcc0` · `#fbf3e1` · `#8a6f4e`; cartílago `#cfe2e6` · `#eef7f9` · `#6f8f99`; diente/esmalte `#f6f2e6` · `#ffffff` · `#9b8f72`
  - músculo `#b9352f` · `#e0685a` · `#5c1214` (fibras sugeridas con líneas finas más oscuras)
  - arteria/sangre con oxígeno `#d42a2a` · `#f06a5f` · `#6b0d12`; vena/sin oxígeno `#2f5fc4` · `#6f95e6` · `#0f2253`
  - nervio `#f2cf3b` · `#fff0a6` · `#8a6a06`; encéfalo `#e7b3ac` · `#f6d6d0` · `#8e4f52`
  - órgano genérico `#d9897e` · `#f2b5aa` · `#6e2a2a`; piel `#e8b796` · `#f7d8c2` · `#8a5a44`; grasa `#f3d77a` · `#fff1b8` · `#a8862a`
  - linfático `#4ade80` · `#a7f3c0` · `#15803d`; glándulas endocrinas `#c084fc` · `#e3c8ff` · `#7e22ce`
  - líquidos (humor vítreo, líquido sinovial, amniótico): azul muy claro translúcido `#bfe3f5` con opacidad 0,35–0,6
- Siluetas humanas de contexto (endocrino, linfático): holograma cian
  translúcido (`#67e8f9` borde, relleno `#155e75` al 35 %), sin rasgos sexuales.
- Nada de estética infantil exagerada (salvo la cara, que es amable), ni emojis,
  ni sombras negras. Debe verse bien sobre `#0b1626`.
- Detalle con intención: lo que se pregunta debe distinguirse claramente de lo
  que lo rodea (color, contorno, tamaño suficiente).

## Comprobar

```bash
node tools/anatomy/check-plate.mjs ojo /tmp/plates
```

Imprime los errores de contrato y deja dos PNG: `ojo-art.png` (la ilustración
sobre el fondo de la app) y `ojo-hits.png` (las zonas coloreadas con su
leyenda). Míralas y corrige hasta que: no haya errores, se entienda la anatomía,
cada zona cubra exactamente su estructura y nada importante quede tapado.
