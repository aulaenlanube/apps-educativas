# BLOG_SEO_GEO.md — Reglas de SEO y GEO para los posts del blog

> Documento de obligada consulta **antes de redactar** o **revisar** un post del blog. Cubre dos optimizaciones distintas pero complementarias:
>
> - **SEO** (Search Engine Optimization): que Google nos encuentre, indexe y posicione.
> - **GEO** (Generative Engine Optimization): que ChatGPT, Claude, Perplexity, Gemini y Google AI Overviews **nos citen** cuando alguien pregunta por nuestros temas.
>
> Las dos vías traen tráfico, pero las técnicas que funcionan en cada una **divergen**: SEO premia entidades, enlaces y keywords; GEO premia respuestas auto-contenidas, listas, tablas y datos verificables. Este documento integra ambas en un único checklist.

---

## 1. Anatomía de un post bien optimizado (estructura obligatoria)

Todo post debe llevar, en este orden:

1. **Frontmatter completo** (ver sección 3).
2. **Bloque de hero**: miniatura (`hero`) o vídeo (`video_id`). Aporta thumb, OG image y atención.
3. **Apertura conversacional con anécdota** (estilo de [estilo_edu.md](docs/estilo_edu.md) — no se toca). 1-2 párrafos cortos antes del primer dato.
4. **Datos clave en los primeros 300 palabras** (lista de bullets o párrafo con cifras). GEO premia las respuestas concretas extraídas pronto.
5. **H2 con sub-H3** semánticos y autosuficientes. Cada H2 debe poder leerse de forma aislada y aún tener sentido (los LLMs extraen secciones, no posts enteros).
6. **Tablas o listas** cada vez que haya datos comparables. Tablas > párrafos para extracción.
7. **FAQ al final** (3-5 preguntas). Cada Q&A debe ser breve, factual y citable. Esto es **el cambio que más mueve la aguja en GEO**.
8. **Cierre motivador o pregunta directa al lector** (estilo Edu) — sin "en este post hemos visto".

---

## 2. Reglas SEO clásicas (Google, Bing)

### Title (`title` en frontmatter)
- **50-60 caracteres** visibles (Google trunca alrededor de los 580 px).
- **Keyword principal a la izquierda** (lo más a la izquierda posible).
- **Sin clickbait engañoso**: el título debe describir el contenido. Si engañas y la gente cierra rápido, Google penaliza.
- Tono editorial OK ("La plataforma educativa que odiarán las editoriales"), pero el sustantivo debe quedar.

### Slug (`slug` en frontmatter)
- **3-6 palabras**, todo minúsculas, separadas por guiones, sin acentos ni ñ.
- Contiene la **keyword principal** (no obligatoriamente igual al title).
- **NO incluir fecha ni año en el slug** (los slugs son permanentes; los años envejecen).
- Una vez publicado, **no se cambia** salvo emergencia (rompería enlaces). Si hay que renombrar, añadir redirección.

### Meta description (`excerpt` en frontmatter)
- **140-160 caracteres** (target 155 — Google muestra ~160 en desktop, menos en móvil).
- Debe **convencer al clic**, no resumir. Mencionar el beneficio para el lector + un dato concreto si cabe.
- Contiene la **keyword principal una vez** (sin forzar).
- **Sin emojis ni signos raros** (los recorta o los muestra mal).
- Si excede 160 chars y no se puede acortar sin perder fuerza, mejor 170-180 que un texto torpe.

### Encabezados (H1, H2, H3)
- **Un único H1** por página. En BlogPostPage ya lo emite la propia plantilla con `<h1>{post.title}</h1>`. **El markdown del post NUNCA debe llevar `#` (H1)** — empezar por `##` (H2).
- Cada H2 debe contener una **palabra clave secundaria** o tema diferenciado. Evita H2 vacíos del tipo "Conclusión" o "Introducción" — usa títulos con sustancia.
- H3 solo si hay sub-tema real. No fragmentar por fragmentar.

### Enlaces internos
- **Mínimo 2 enlaces internos por post** a otras páginas del dominio (otros posts, categorías del blog, secciones de la web — `/curso/primaria/5`, `/curso/eso/2`, etc.).
- Texto del enlace **descriptivo**: nunca "haz clic aquí". Usar el título o la entidad referenciada.
- Cuando enlaces a un post propio, hazlo con la URL relativa: `[texto](/blog/slug-del-post)`.

### Enlaces externos
- A fuentes autorizadas cuando citas un dato. Refuerza credibilidad (E-E-A-T: Experience, Expertise, Authoritativeness, Trustworthiness).
- Enlaces externos en pestaña nueva — esto lo gestiona automáticamente [BlogProse](src/components/blog/BlogProse.jsx) (cualquier URL absoluta fuera de `apps-educativas.com` se abre con `target="_blank"`).

### Imágenes (`hero` y dentro del cuerpo)
- **`alt` text obligatorio** y descriptivo (lo gestiona `PostCard` y `BlogPostPage` con `post.title` por defecto; en imágenes inline del markdown, **siempre** rellena el alt).
- Formato **webp** o **avif**, no PNG/JPG. El pipeline de [tools/generate-blog-image.mjs](tools/generate-blog-image.mjs) ya genera webp optimizado a 88% de calidad.
- Tamaño de hero: 1536×864 (ya estandarizado).
- Nombre de archivo descriptivo coincidiendo con el slug: `/images/blog/slug-del-post.webp`.

### Datos estructurados (schema.org)
- **`BlogPosting`** ya emitido por [BlogPostPage](src/pages/BlogPostPage.jsx) — incluye `headline`, `datePublished`, `author`, `publisher`, `image`, `articleSection`.
- **`FAQPage`** se emite automáticamente cuando el post tiene `faq:` en el frontmatter.
- **`BreadcrumbList`** se emite siempre (Home → Blog → Categoría → Post).
- Si añades **`VideoObject`** (cuando metas un vídeo de YouTube), ya se hace en la plantilla.
- **No mezclar** `BlogPosting` y `Article`; usar `BlogPosting`.

### Velocidad / Core Web Vitals
- Las imágenes hero ya son webp ~100 KB.
- El embed de YouTube usa lazy thumbnail + iframe diferido (no carga el player hasta el click). **No usar `<iframe>` directo** dentro del markdown.
- No metas GIFs grandes (pasa a webp animado si hace falta).

### Canonical
- Una sola URL canónica por post: `https://apps-educativas.com/blog/<slug>`. Ya emitida por la plantilla. **No publicar el mismo post en otra ruta**.

---

## 3. Reglas GEO (ChatGPT, Claude, Perplexity, Gemini, Google AI Overviews)

GEO es nuevo. Las prácticas evolucionan, pero hay un consenso claro a fecha 2026: **los LLMs citan respuestas auto-contenidas, no posts enteros**. Optimiza para ser citado, no para ser leído de seguido.

### Principio número 1: cada sección debe responder a una pregunta concreta

- Pregúntate, al escribir un H2: **¿qué pregunta de Google contesta esta sección si la lees aislada?**
- Si no contesta nada extractable, no es un buen H2.
- Ejemplo malo: `## Mi historia`. Ejemplo bueno: `## Por qué creé apps-educativas.com (sin publicidad ni login)`.

### Principio número 2: cita cifras concretas y entidades nombradas

Los LLMs prefieren citar afirmaciones verificables:

- **Mal**: "ahorra mucho tiempo al docente".
- **Bien**: "ahorra a un docente de Primaria entre 2 y 5 horas semanales preparando ejercicios".

Cuando incluyas un dato:
- Pon la **cifra concreta** (no "varios", "muchos", "cientos").
- Si es una estimación tuya, dilo explícitamente ("según mi experiencia con 4 grupos de Primaria").
- Nombra **herramientas, leyes, métricas y autores** con su forma canónica (DSM-5, LOMLOE, art. 71, Real Decreto 157/2022, gpt-image-1, Vite, React Router v7…).

### Principio número 3: bloque TL;DR al principio

Cada post lleva en el frontmatter un campo `tldr:` con 3-5 viñetas. La plantilla lo renderiza al inicio del artículo como **"Resumen rápido"**. Esto es lo primero que extrae cualquier LLM y lo que probablemente verá Google en una AI Overview.

Reglas para el TL;DR:
- 3-5 bullets, máximo.
- Cada bullet ≤ 20 palabras.
- **Una afirmación factual por bullet**, no opiniones.
- Sin "hablaremos de", "veremos cómo": frases directas. Mal: "Hablamos del lanzamiento de la web". Bien: "apps-educativas.com es una plataforma gratuita con 50+ apps para 1.º Primaria a 4.º ESO".

### Principio número 4: FAQ al final

Cada post lleva un array `faq:` en el frontmatter con 3-5 preguntas. Se renderiza como sección "Preguntas frecuentes" + schema `FAQPage`. Esto es **el formato que más ranquean los LLMs**.

Reglas para el FAQ:
- **Preguntas literales** que un docente escribiría en Google (no parafraseo elegante).
- **Respuesta de 1-3 frases**, factual.
- Cubrir las preguntas que el post no contesta de forma destacada en el cuerpo.
- Mezclar tipos de pregunta:
  - Definicional ("¿Qué es X?")
  - Operativa ("¿Cómo se hace Y?")
  - Comparativa ("¿En qué se diferencia X de Y?")
  - De objeción ("¿Cuál es el truco si es gratis?")

### Principio número 5: usa listas y tablas

Si tienes 3+ ítems comparables → **tabla**. Si son enumerables pero no comparables → **lista**.

Los LLMs extraen tablas verbatim. Una tabla bien hecha vale por cinco párrafos.

### Principio número 6: hablar como una persona con autoridad sobre el tema

Esto es la marca de la casa de Edu Torregrosa (ver [estilo_edu.md](docs/estilo_edu.md)) y **coincide con lo que premia GEO**:
- Primera persona con experiencia concreta ("llevo 15 años dando informática en un instituto público").
- Anécdotas reales ("mi mujer detectó la dislexia de Vega en el primer trimestre…").
- Honestidad ("la plataforma está empezando, faltan apps").

La autoridad personal-comprobable es lo que el modelo entiende como E-E-A-T y lo que decide a quién citar.

### Principio número 7: keywords entidades, no keywords basura

Olvida el "keyword stuffing" antiguo. Los LLMs entienden entidades. Lista en `keywords:` del frontmatter:
- **3-7 entidades** principales del post (no más).
- **Nombres propios completos** (LOMLOE, DSM-5, gpt-image-1, ESO 3.º, Geometry Dash…).
- **No** keywords de búsqueda (no metas "apps gratis para profesores"); sí entidades.

### Principio número 8: AVOIDS — qué NO hacer

- **No** uses lenguaje vago ("muy bueno", "increíble", "revolucionario"). Los LLMs ignoran o lo penalizan.
- **No** rellenes con párrafos de introducción genéricos al estilo "En el mundo actual…". Va directo al borrador.
- **No** repitas la misma idea en distintos H2 para "alargar". Mejor un post corto y denso.
- **No** uses Markdown anidado de más de 2 niveles (H2 > H3 basta; H4+ confunde la extracción).

---

## 4. Frontmatter completo (esquema actualizado)

Este es el frontmatter que **TODOS** los posts deben llevar. Los campos marcados con ⚠️ son obligatorios; el resto son recomendados.

```yaml
---
# Identidad
title: "Título visible (50-60 chars, keyword a la izquierda)"   # ⚠️
slug: slug-en-kebab-case-sin-acentos                            # ⚠️
date: 2026-MM-DD                                                # ⚠️
category: plataforma-eduapps                                    # ⚠️ — uno de BLOG_CATEGORIES
hero: /images/blog/<slug>.webp                                  # generado con tools/generate-blog-image.mjs
video_id: XXXXXXXXXXX                                           # opcional, ID de YouTube
duration_min: 11                                                # opcional

# SEO
excerpt: "Meta description de 140-160 chars que convence al clic e incluye la keyword principal una vez." # ⚠️
seo_title: "Título alternativo si difiere del visible (opcional, también 50-60 chars)"
keywords: [entidad1, entidad2, entidad3]                        # 3-7 entidades

# GEO
tldr:                                                           # 3-5 bullets, factuales
  - "Frase factual concreta 1 (≤20 palabras)."
  - "Frase factual concreta 2 con cifra o entidad nombrada."
  - "Frase factual concreta 3."

faq:                                                            # 3-5 Q&A factuales
  - q: "¿Pregunta literal que un docente escribiría en Google?"
    a: "Respuesta factual de 1-3 frases."
  - q: "¿Otra pregunta?"
    a: "Otra respuesta."

# Opcionales narrativos
tags: [array, de, tags, libres]
---
```

---

## 5. Checklist final — antes de publicar (10 puntos)

Marca uno a uno. Si fallas en más de 2, **no publiques** — revisa.

- [ ] **Title** ≤ 60 chars con keyword a la izquierda.
- [ ] **Slug** ≤ 6 palabras, sin acentos ni año.
- [ ] **Excerpt** 140-160 chars y vende el clic.
- [ ] **Hero** generado con [tools/generate-blog-image.mjs](tools/generate-blog-image.mjs) siguiendo [BLOG_IMAGES.md](BLOG_IMAGES.md).
- [ ] **`tldr`** con 3-5 bullets factuales.
- [ ] **`faq`** con 3-5 Q&A factuales (al menos 1 definicional, 1 operativa, 1 de objeción).
- [ ] **`keywords`** con 3-7 entidades nombradas (no keywords de búsqueda).
- [ ] Al menos **2 enlaces internos** a otras páginas del dominio.
- [ ] Datos del cuerpo: **cifras concretas**, entidades canónicas, sin "muchos/varios/algunos" vacíos.
- [ ] Cuerpo respeta [estilo_edu.md](docs/estilo_edu.md): saludo directo, primera persona, anécdota, cierre que motiva (no "en este post hemos visto").

---

## 6. Cómo iterar un post existente para optimizarlo

Si un post viejo no rinde:

1. **Mira Google Search Console**: qué queries generan impresiones pero no clics → reescribe el `excerpt` y/o el `title`.
2. **Mira las AI Overviews** que aparecen para tus keywords → comprueba si te citan; si no, **añade FAQ que respondan exactamente esas queries**.
3. **Comprueba el TL;DR**: si no resume claramente el valor del post, lo reescribes.
4. **Añade tablas** donde haya enumeraciones largas en párrafo.
5. **Internal linking**: cada vez que publiques un post nuevo, repasa los 2-3 posts más relevantes y añade un enlace al nuevo desde el viejo (señal de relevancia).

---

## 7. Sitemap.xml

Se genera en `pnpm run build` por [tools/generate-llms.js](tools/generate-llms.js) (extiende `public/sitemap.xml` añadiendo el índice del blog, las categorías y cada post). **No edites `public/sitemap.xml` a mano** para los posts; el script lo regenera. Si tienes que añadir una URL nueva del resto de la web, edita la plantilla en el script.

---

## 8. Recursos vivos (revisar cuando dudes)

- Google Search Central — actualizaciones del algoritmo: <https://developers.google.com/search/blog>
- Google Search Quality Rater Guidelines (PDF actualizado anualmente).
- OpenAI / Anthropic notas sobre indexación de sus bots.
- Schema.org documentación de tipos: <https://schema.org/docs/full.html>

Para auditar el estado SEO de la web a fecha de hoy, usa <https://search.google.com/test/rich-results> con cualquier URL del blog.
