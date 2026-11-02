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
  `MUSCLES_DEEP` (exportado, lo usa también el modelo 3D) son los músculos
  profundos y las cabezas de los grupos (recto femoral, vastos, isquiotibiales,
  manguito rotador…), con `grp` = clave del grupo en el catálogo. Las láminas
  `mus-prof-a` / `mus-prof-p` quitan la capa superficial y, en un lado del
  cuerpo, también la intermedia (`oneSide`): así se ven el vasto intermedio, el
  glúteo menor o el tibial posterior. `esq-l` / `mus-l` son los perfiles
  (vista `lateral-i`, encuadre centrado en el cuerpo).
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
mira también que no se esté pintando dos veces (pieza + contexto, o una pieza que
el modelo trae repetida con el mismo nombre, como el hioides: `once()` en
plates.mjs). Dos mallas casi coincidentes de la misma clave (intercostales
externos e internos) dan bordes en dientes de sierra: mejor fundirlas en una.
El modelo solo trae los intercostales izquierdos (el derecho se refleja) y no
trae transverso del abdomen, oblicuo interno, cuadrado lumbar, masetero ni
temporal. Las láminas de músculo que se fabrican sobre la piel (`ctx.patch`)
se limitan a su mitad del cuerpo: la piel trae triángulos con el giro cambiado y,
de perfil, se colaban por el otro lado.

## Láminas dibujadas (SVG)

`plates-svg/<id>.svg`, con el contrato y la guía de estilo de
[plates-svg/README.md](plates-svg/README.md). La lista, el tamaño, las claves y
qué dibujar están en `hand-plates.mjs`. Comprobar una lámina:

```bash
node tools/anatomy/check-plate.mjs ojo /tmp/plates   # errores + capturas
```

## Modelo 3D (Anatomía 3D y modo 3D de las apps)

```bash
node --max-old-space-size=12000 tools/build-anatomy-3d.mjs           # todas las capas
node --max-old-space-size=12000 tools/build-anatomy-3d.mjs esqueleto # una capa
node --max-old-space-size=12000 tools/build-anatomy-3d.mjs --stats   # solo cuenta triángulos
```

Genera `public/models/anatomia/<capa>.<l|h>.glb` (ligero y detalle) y
`public/data/anatomia3d/index.json` (piezas con clave, lado, contenedores `up`,
centro y caja; puntos de referencia de las articulaciones).

- `model3d.mjs`: qué piezas forman cada capa (piel por regiones, músculos
  superficiales y profundos, órganos, vasos, nervios, esqueleto) con claves finas
  y su grupo (`up`: frontal ⊂ cráneo, yeyuno ⊂ intestino delgado). Reutiliza las
  listas de `plates.mjs` y las reconstrucciones de `body.mjs`. Las piezas se
  reclaman en el orden de `CLAIM` (el esqueleto primero: «radius» o «ethmoid»
  casan con la expresión de los músculos).
- Cada capa es un único primitivo (una llamada de dibujo) con `_PC` = (número de
  pieza, material) por vértice; el visor enciende, tiñe, oculta o mueve cada pieza
  desde una textura de datos (`src/apps/_shared/anatomia3d/material.js`).
- Niveles de detalle por presupuesto de triángulos por capa (`LODS`): se busca el
  error de simplificación (meshoptimizer) igual para toda la capa que lo cumple.
  Las mallas se sueldan y se compactan antes de simplificar (los vértices
  repetidos sin usar parecen costuras y bloquean la simplificación).
- `ao3d.mjs`: oclusión ambiental por vértice horneada (profundidad desde ~80
  direcciones); va en el alfa de `COLOR_0`.
- Compresión `EXT_meshopt_compression` + `KHR_mesh_quantization`: el navegador
  necesita `'wasm-unsafe-eval'` en la CSP (`public/.htaccess` e `index.html`).

## Catálogo y traducciones

- `src/apps/_shared/anatomia/data/structures.js`: claves, sistema, nivel, tipo,
  nombres en castellano, inglés y valenciano, función (`p`), dato (`f`), acción
  (`act`), grupo (`grp`), músculos de acción parecida (`sim`) y, en la tabla
  `ORIGEN_INSERCION`, origen (`ori`) e inserción (`ins`) de los músculos
  principales. Una clave nueva que aparezca en una lámina debe estar aquí.
- `src/apps/_shared/anatomia/i18n/{en,va}.js`: función, dato, acción, origen e
  inserción traducidos.
  `node tools/anatomy/check-i18n.mjs en|va` comprueba que no falte nada.
- `src/apps/_shared/anatomia/data/plates.js`: título, categoría y pareja de vista
  de cada lámina (también para las nuevas).
- Tests: `src/__tests__/cuerpo-humano.test.js`.
