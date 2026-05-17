# BLOG_IMAGES.md — Guía de estilo y pipeline para miniaturas del blog

> Consulta esto **antes** de redactar el prompt de una miniatura nueva del blog, lanzar el script generador o subir un fichero a `public/images/blog/`. El objetivo es que TODAS las cabeceras del blog se vean como parte de la misma colección visual, y que esa colección sea coherente con la plataforma (`apps-educativas.com`) y con el resto de canales del autor.

Las imágenes generadas se guardan en [public/images/blog/](public/images/blog/) en formato `.webp` (1536×1024). El frontmatter del post las apunta con `hero: /images/blog/<slug>.webp`. Si el post no tiene `hero` pero sí `video_id`, la tarjeta cae a la miniatura de YouTube; si no tiene ninguno, a un fondo gradiente con el título. **Por defecto, todo post nuevo lleva `hero`** generado con este pipeline.

---

## 1. Estilo visual base (común a TODAS las miniaturas)

- **Aspect ratio**: 16:9 — se genera a `1536×1024` (la API rinde mejor que `1792×1024`) y la card lo recorta con `object-cover`.
- **Técnica**: **modern editorial illustration**, mezcla 3D suave + flat con depth (sombras blandas, gradientes radiales, glassmorphism). Nada de pixel art (eso lo reservamos para avatares), nada de fotografía stock, nada de IA-realista. Estética cercana a *Stripe*, *Vercel*, *Linear* en sus hero illustrations.
- **Paleta principal** (anclas de marca):
  - Indigo `#6366F1` · Violet `#7C3AED` · Fuchsia/Pink `#EC4899` · Amber `#F59E0B`
  - Acentos suaves: `#0EA5E9` (sky), `#10B981` (emerald), `#F43F5E` (rose).
  - Fondo: gradiente diagonal `#312E81 → #7C3AED → #DB2777` con bloom suave; o bien un gradient mesh moderno con los mismos hues.
- **Iluminación**: cinematográfica, dirección clara, glow violeta/rosa de fondo. Subtle volumetric lighting. Sin lens flare exagerado.
- **Composición**: elemento principal centrado o ligeramente off-center (regla de tercios). Espacio negativo en la mitad opuesta — luego el listado del blog superpone un pill de categoría arriba a la izquierda, así que esa zona conviene dejarla algo despejada.
- **Sin texto en la imagen**. El título lo pone la card (mejor SEO, mejor i18n, evita typos). NUNCA hagas la imagen con letras dentro: el modelo se inventa palabras feas.
- **Sin logos, marcas ni rostros reconocibles**. Sin Minecraft, sin Geometry Dash, sin Kahoot, sin Anthropic/OpenAI/Google logos. Inspiraciones genéricas sí; copias literales no.
- **Sin watermark, sin "AI generated", sin firmas**.
- **Sin children faces**. Si aparece una figura humana, que sea silueta abstracta o ilustrada al estilo *editorial illustration* (no foto). En general preferimos **iconos, dispositivos, objetos abstractos** sobre personas — encaja mejor con la estética minimalista del blog.

### Sello visual recurrente (la "firma" de la colección)

Los tres elementos que aparecen en todas:

1. **Gradient mesh background** violeta-rosa-índigo con bloom radial.
2. **Floating tech/education icons** alrededor del sujeto principal — pequeños, dispersos, con profundidad de campo (algunos desenfocados). Mezcla iconos de educación (libro, lápiz, mortarboard, fórmula, mapa) y de tech (chip, código, terminal, AI sparks).
3. **Soft glow / lens bokeh** dispersos para dar atmósfera.

Si una imagen no tiene los tres, no es de la colección.

---

## 2. Plantilla de prompt (copia, pega, rellena)

Todos los prompts van en **inglés** (los modelos rinden mejor). Sigue exactamente esta estructura:

```
Modern editorial illustration for an educational technology blog. 16:9 horizontal composition.

Subject: {ELEMENTO PRINCIPAL — UN OBJETO O ESCENA CONCEPTUAL, no personas reales}.

Style: clean modern editorial illustration, soft 3D depth with flat color blocks, glassmorphism, gentle volumetric lighting. Hero image style similar to Linear, Stripe or Vercel marketing pages.

Color palette: vibrant gradient background blending deep indigo (#312E81), violet (#7C3AED) and pink (#DB2777) with subtle amber accents (#F59E0B). Cyan and emerald highlights for tech elements. Bright, saturated, professional.

Background: gradient mesh with soft bokeh, radial bloom centered behind the subject. Some out-of-focus floating icons (book, pencil, chip, code bracket, mortarboard, formula symbols, sparks) creating depth.

Composition: subject centered with breathing room on the upper-left third (a label will be overlaid there later). Cinematic perspective. Soft shadows. No text, no letters, no logos, no real human faces, no brand names, no watermark.

Mood: {ADJETIVO 1, ADJETIVO 2, ADJETIVO 3 — ej. optimistic, energetic, inspiring}.

Avoid: text overlays, typography, watermarks, real photographs, trademarked characters or logos, children's faces, AI-generated artifacts, generic stock-photo aesthetics.
```

### Reglas al rellenar

- **Subject**: en una sola frase. Conceptual, no literal. Ejemplos buenos:
  - "a glowing tablet screen floating in mid-air, displaying abstract colorful educational app icons in a clean grid"
  - "an abstract network of glowing nodes and circuits transforming into educational icons (book, atom, gear)"
  - "a stylized neural network sphere radiating beams of light that materialize into small floating apps"
- **Mood**: 3 adjetivos como mucho. Curaduría > acumulación.
- **Avoid**: la lista negra es **constante** entre todas las miniaturas. No la edites por imagen, mantenla idéntica.
- **NO menciones colores específicos para el sujeto** salvo que sea esencial. Deja que el gradiente de fondo y la iluminación los unifiquen.

---

## 3. Casos especiales por categoría (matices, no estilos distintos)

La estética es la misma; lo que cambia es el sujeto sugerido.

| Categoría (slug) | Sujetos sugeridos |
|---|---|
| `plataforma-eduapps` | tablet/laptop con apps flotando, grids 3D de iconos educativos, dispositivos conectados con líneas de luz |
| `ia-en-educacion` | red neuronal abstracta, chip con halo de luz, "AI sparks" generando objetos educativos, código que se transforma en iconos |
| `gamificacion` | trofeos, medallas e insignias flotantes con glow, dados/joysticks/controllers abstractos, partículas tipo XP gauge |
| `flipped-classroom` | reloj/play button mezclado con libro, vídeo que sale de la pantalla y aterriza en un cuaderno, dos espacios (casa/aula) conectados |
| `abp` | engranajes engranados con objetos de proyecto (plano, regla, prototipo 3D), nodo central con ramificaciones |
| `innovacion-educativa` | bombilla con circuitos, semilla creciendo en forma de fórmula o icono, libro abriéndose en estructuras 3D |
| `atencion-diversidad` | cerebro abstracto con conexiones multicolores, piezas de puzzle encajando con luz, manos sosteniendo símbolos comunicativos |

Cuando estés generando, **mira primero las miniaturas existentes en [public/images/blog/](public/images/blog/)** y asegúrate de que la nueva encaje en el conjunto (paleta, luz, complejidad). Si las anteriores son sobrias, no metas una explosión visual.

---

## 4. Pipeline de generación (con la API)

### Paso 0 — credenciales

La API key vive **fuera del repo**:

```bash
# .env.local (gitignored)
OPENAI_API_KEY=sk-...
```

Nunca pegues la key en el script ni en el commit. Si por accidente queda en un log o output del chat, **revócala desde https://platform.openai.com/api-keys y crea una nueva**.

### Paso 1 — lanzar el generador

El script `tools/generate-blog-image.mjs` admite dos argumentos:

```bash
# Modo "preset": usa el prompt predefinido para un slug conocido (definido en el propio script).
node tools/generate-blog-image.mjs <slug>

# Modo "prompt libre": pasa cualquier prompt y un slug de salida.
node tools/generate-blog-image.mjs <slug-de-salida> "tu prompt completo en inglés"
```

Variables de entorno opcionales:
- `OPENAI_IMAGE_MODEL` — por defecto `gpt-image-1`.
- `OPENAI_IMAGE_SIZE` — por defecto `1536x1024` (16:9 aproximado).
- `OPENAI_IMAGE_QUALITY` — `low` / `medium` / `high` (default `high`).

Lo que hace el script:
1. Lee `OPENAI_API_KEY` del entorno.
2. Llama a `POST /v1/images/generations` con el modelo y prompt.
3. Recibe `b64_json` → guarda PNG temporal en `tools/blog-image-sources/`.
4. Con `sharp`: redimensiona a 1536×864 (16:9 exacto), optimiza calidad ~88 y guarda `.webp` en `public/images/blog/<slug>.webp`.
5. Mantiene el PNG original en `tools/blog-image-sources/` (fuera de `public/`, así que no se sube) por si quieres re-procesar luego.

### Paso 2 — añadir la imagen al post

En el frontmatter del `.md`:

```yaml
---
title: ...
slug: mi-post
hero: /images/blog/mi-post.webp
...
---
```

Esto basta: `PostCard` y `BlogPostPage` ya prefieren `hero` sobre la miniatura de YouTube cuando ambas existen.

### Paso 3 — verificar visualmente

`pnpm run dev` → `/blog` y `/blog/mi-post`. Comprueba que:
- La miniatura encaja en la grid con las anteriores.
- El pill de categoría arriba a la izquierda no choca con el sujeto principal.
- En el detalle del post, la imagen no compite con el bloque de YouTube debajo (si lo hay).

Si algo desentona, regenera ajustando el prompt — **no edites en Photoshop** salvo cropeos puntuales. El estilo se mantiene desde el prompt, no desde el postproceso.

---

## 5. Coste y consumo

- `gpt-image-1` en calidad `high` para 1536×1024 cuesta unos **0,17 USD por imagen** (tarifa abril 2026, comprobar siempre en https://openai.com/api/pricing).
- Generar las 4 miniaturas iniciales = ~0,70 USD.
- Si una sale regular, **regenera entera** (cuesta menos que pelearte editando).

---

## 6. Checklist rápido antes de subir una miniatura nueva

- [ ] Aspect ratio final 16:9 (1536×864 webp).
- [ ] Sin texto, sin logos, sin caras humanas reconocibles.
- [ ] Paleta dentro del rango violeta-rosa-índigo-ámbar (mira las anteriores).
- [ ] Sujeto centrado o ligeramente desplazado, esquina superior izquierda algo despejada.
- [ ] Glow / bokeh / floating icons presentes.
- [ ] Encaja en la grid del blog junto a las anteriores (compáralas lado a lado).
- [ ] Frontmatter del post actualizado con `hero: /images/blog/<slug>.webp`.
