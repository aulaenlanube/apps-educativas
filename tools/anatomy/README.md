# Láminas del cuerpo humano

Las tres apps del cuerpo humano (Explorador del Cuerpo Humano, Huesos y
Músculos, Viaje por el Cuerpo) juegan sobre **láminas**: una imagen
(`public/images/anatomia/<id>.webp`) y sus zonas tocables
(`public/data/anatomia/<id>.json`: ruta SVG de la parte visible de cada
estructura, punto para la etiqueta, área y, en órganos, silueta completa).
`public/data/anatomia/index.json` las lista con las claves que contiene cada una.

```bash
node tools/build-anatomy.mjs                 # todo (renderizadas + dibujadas + índice)
node tools/build-anatomy.mjs esq-a org-a     # solo esas láminas
node tools/build-anatomy.mjs --no-hand       # solo las renderizadas
node tools/build-anatomy.mjs --hand-only ojo # solo una dibujada
node tools/build-anatomy.mjs --index-only    # rehace el índice desde los JSON
```

## Láminas renderizadas (BodyParts3D)

Salen de las mallas 3D de **BodyParts3D 4.0** (© The Database Center for Life
Science, **CC BY 4.0** desde el 27-02-2025; hay que citarlo). La primera vez
hay que descargar el archivo IS-A (143 MB, trae las 2.234 piezas):

```bash
mkdir -p tools/.cache/bodyparts3d && cd tools/.cache/bodyparts3d
B=https://dbarchive.biosciencedbc.jp/data/bodyparts3d/LATEST
for f in isa_parts_list_e.txt partof_parts_list_e.txt isa_element_parts.txt partof_element_parts.txt; do curl -sSfLO $B/$f; done
curl -sSfLO $B/isa_BP3D_4.0_obj_99.zip && unzip -q isa_BP3D_4.0_obj_99.zip -d obj && mv obj/isa_BP3D_4.0_obj_99 obj/isa
```

(`tools/.cache/` está en `.gitignore`.) Coordenadas del modelo: mm, x+ izquierda
del sujeto, y+ posterior, z+ arriba.

- `plates.mjs`: qué piezas forman cada estructura del catálogo (por expresiones
  sobre el nombre en inglés de cada pieza), material, encuadre y contexto.
- `raster.mjs`: rasterizador por software ortográfico (z-buffer, normales, caras
  traseras para los cortes como el sagital del encéfalo, `near`).
- `shade.mjs`: acabado de ilustración médica (luz, relleno, especular, borde de
  luz, oclusión ambiental, contorno, fibras musculares, poro óseo, holograma).
- `vectorize.mjs`: contorno de la parte visible de cada estructura (d3-contour),
  simplificación y punto de anclaje.
- `body.mjs`: puntos de referencia calculados sobre los huesos y lo que el modelo
  **no trae** y se reconstruye o se genera: pulmones (cavidad torácica repartida
  por lóbulos según su árbol bronquial, *surface nets*), hígado (volumen alrededor
  de sus vasos), médula espinal (tubo por el conducto vertebral), tiroides,
  paratiroides, cóccix, colon sigmoide, ano, nervios periféricos (tubos por
  puntos de referencia), músculos que faltan (láminas sobre la piel: dorsal ancho,
  masetero, temporal, frontal, orbiculares) y piel de maniquí (genitales
  suavizados).

Las mallas del modelo a veces vienen con las caras al revés (se detecta por el
volumen con signo) o con giros mezclados; si una pieza sale oscura y granulada,
mira también que no se esté pintando dos veces (pieza + contexto).

## Láminas dibujadas (SVG)

`plates-svg/<id>.svg`, con el contrato y la guía de estilo de
[plates-svg/README.md](plates-svg/README.md). La lista, el tamaño, las claves y
qué dibujar están en `hand-plates.mjs`. Comprobar una lámina:

```bash
node tools/anatomy/check-plate.mjs ojo /tmp/plates   # errores + capturas
```

## Catálogo y traducciones

- `src/apps/_shared/anatomia/data/structures.js`: claves, sistema, nivel, tipo,
  nombres en castellano, inglés y valenciano, función (`p`), dato (`f`), acción
  (`act`). Una clave nueva que aparezca en una lámina debe estar aquí.
- `src/apps/_shared/anatomia/i18n/{en,va}.js`: función, dato y acción traducidos.
  `node tools/anatomy/check-i18n.mjs en|va` comprueba que no falte nada.
- `src/apps/_shared/anatomia/data/plates.js`: título, categoría y pareja de vista
  de cada lámina (también para las nuevas).
- Tests: `src/__tests__/cuerpo-humano.test.js`.
