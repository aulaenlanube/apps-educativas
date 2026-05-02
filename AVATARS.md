# AVATARS.md — Guía de estilo y pipeline para crear avatares nuevos

> Documento de referencia para mantener la coherencia visual y narrativa de la colección de avatares de la plataforma. Consulta esto **antes** de redactar prompts de imagen, generar PNGs nuevos o editar `public/data/avatars.json`.

La colección actual está en [public/data/avatars.json](public/data/avatars.json) (catálogo) y las imágenes en [public/images/avatar/](public/images/avatar/) en tres tamaños (512 / 256 / 128, formato `.webp`). Los PNGs originales se guardan en [public/images/avatar/_originals/](public/images/avatar/_originals/).

---

## 1. Estilo visual base (común a TODA la colección)

- **Técnica**: pixel art 8-bit detallado (no sprites planos: con pixel shading y sombreado por capas).
- **Formato**: cuadrado 1:1, composición tipo **bust portrait** (busto, mirando al frente o en ¾), centrado.
- **Contorno**: línea limpia oscura para definir silueta (ni demasiado fino ni grueso desigual).
- **Paleta**: limitada pero rica — 4-6 colores principales por personaje + tonos de sombra/luz.
- **Iluminación**: cinematográfica, con dirección clara coherente con el fondo (cálida diurna, fría nocturna, neón arcade, antorcha, fluorescente de laboratorio…).
- **Resolución de píxel**: detallado pero reconocible (no pretende ser NES puro: estilo "neo-retro" estilo SNES + indie moderno).
- **Fondo**: temático, con elementos narrativos que refuercen la personalidad/profesión/contexto del personaje. Nunca fondo plano.
- **Halo simbólico** detrás de la cabeza: un círculo difuso de iconos pequeños relacionados con el personaje (objetos, símbolos, herramientas). Es el sello visual recurrente de toda la colección.

---

## 2. Plantilla de prompt (copia, pega y rellena)

Este es el formato exacto que mejor funciona con generadores de imagen. Todos los prompts deben seguir esta estructura en **inglés** (los modelos rinden mejor en inglés):

```
Pixel art avatar, 8-bit retro style, square 1:1 aspect ratio.

An original {arquetipo del personaje} with {rasgos físicos clave: pelo, ojos, expresión}.

{Descripción de la ropa y elementos de vestuario}.

Pose: centered bust portrait, facing forward, {acción concreta — qué sostiene o hace con las manos}.

Accessories: {3-6 objetos pequeños relacionados con el rol del personaje}.

Background: {escenario temático con 4-7 elementos narrativos visibles}.

Add a faint symbolic element behind the head: a circular {tema} halo made of {3-5 iconos relacionados}.

Style: clean outline, limited color palette, detailed pixel shading, {tipo de iluminación}, retro {género de videojuego/película} aesthetic.

Create an original avatar character. Avoid copying any existing {tipo de IP a evitar: TV character, video game mascot, actor likeness, costume, logo, title}, or trademarked visual identity.
```

### Reglas al rellenar la plantilla

- **Arquetipo en una línea**: no más de 6-8 palabras (ej. "brave plumber hero", "silent psychic teen girl", "underground laboratory scientist").
- **Rasgos físicos**: 3 elementos memorables (pelo, ojos/expresión, detalle distintivo). Nada más.
- **Vestuario**: una sola frase, identificable a primera vista (la ropa es el principal vehículo de identidad visual).
- **Pose**: siempre `centered bust portrait, facing forward`. La acción debe ser estática (sosteniendo algo, gesto, no movimiento ambiguo).
- **Accessories**: 3-6 objetos. Mezcla utilitarios (lo que usa) + narrativos (lo que insinúa la historia).
- **Background**: 4-7 elementos. Da una "habitación" o "lugar" reconocible, no un decorado abstracto.
- **Halo simbólico**: siempre presente. Refuerza el rol del personaje con iconos repetidos en círculo.
- **Estilo**: especifica iluminación y subgénero retro concreto ("retro teen mystery video game aesthetic", "retro 80s arcade aesthetic", "retro fantasy adventure video game aesthetic").
- **Disclaimer final**: siempre incluido. Cita explícitamente el tipo de IP que se está evitando para que el modelo entienda el límite.

### Ejemplo de prompt completo (avatar_098 — periodista, ya en la colección)

```
Pixel art avatar, 8-bit retro style, square 1:1 aspect ratio.

An original clever school journalist with short wavy hair, bright investigative eyes, and a determined expression.

She wears a vintage blouse, light jacket, and carries a shoulder bag full of notes.

Pose: centered bust portrait, facing forward, holding a small tape recorder and a notebook.

Accessories: press badge with fictional text, pencil, newspaper clipping, cassette recorder, and sticky notes.

Background: school newspaper room with typewriters, bulletin boards, stacks of paper, coffee cups, and a headline board reading "STRANGE SIGNALS".

Add a faint symbolic element behind the head: a circular investigation halo made of headlines, tape reels, arrows, question marks, and clue strings.

Style: clean outline, limited color palette, detailed pixel shading, consistent newsroom lamp lighting, retro teen mystery video game aesthetic.

Create an original avatar character. Avoid copying any existing TV character, actor likeness, exact costume, newspaper name, logo, title, or trademarked visual identity.
```

---

## 3. Rarezas y bonificaciones

Cada avatar tiene una rareza fija que determina:
- El **bonus de puntos** que aporta al desbloquearse (suma a `bonus_avatares`, capado a +0,5 en total).
- Lo **difícil que debe ser** su requisito de desbloqueo.
- Su **prominencia visual** en la galería (borde y glow más intensos en rarezas altas).

| Rareza | `points_bonus` | Cuántos hay (~) | Filosofía del desbloqueo |
|---|---|---|---|
| `common` | 0,1 | ~15-20 | Primeros pasos: 1-12 partidas, racha 3-5 días, nivel 3, 2-3 sesiones de una app |
| `rare` | 0,2 | ~25-30 | Constancia media: 5-10 sesiones de app, nivel 5-10, 3-7 batallas/duelos, 5 días racha |
| `epic` | 0,3 | ~20-25 | Logro notable: 10-15 sesiones modo examen con nota, nivel 15-20, 10-15 duelos, 10 exámenes nota ≥ 8 |
| `legendary` | 0,4 | ~12-16 | Alto rendimiento: nivel 25-35, 15-30 duelos, 20 exámenes nota ≥ 9, 15 sesiones de asignatura nota alta |
| `mythic` | 0,5 | ~8-10 | Élite — los más codiciados: nivel 45-50, top 1 de clase, 50+ exámenes perfectos, 80+ insignias, 50+ batallas/duelos |

**Mantén la pirámide**: la base (commons + rares) debe ser amplia para que cualquier alumno tenga algo que desbloquear pronto; los míticos son escasos para que conserven valor.

---

## 4. Tipos de personaje sugeridos por rareza

Esto es orientativo, no estricto. Sirve para no saturar siempre el mismo arquetipo en una rareza.

- **Common**: principiantes, hobbies inocentes, animalitos, oficios cotidianos (origamista, ratoncito de biblioteca, aprendiz carpintero, ranita exploradora…).
- **Rare**: estudiantes con vocación, deportistas amateurs, exploradores curiosos, científicos en ciernes (cadete espacial, ninja del estudio, atleta del mar, naturalista de campo…).
- **Epic**: figuras con poder/maestría especializada, guerreros con identidad, profesionales avanzados (gladiador imperial, druida del bosque, guerrera solar, físico excéntrico…).
- **Legendary**: leyendas históricas, héroes consagrados, personajes pop muy reconocibles (Tesla, Galileo, Newton, Hawking, Picasso, Naruto, Thor…).
- **Mythic**: las cumbres absolutas — figuras universalmente reconocidas, antagonistas finales, dioses, genios irrepetibles (Einstein, Curie, Da Vinci, Cleopatra, Goku, Messi, Jordan, el Demogorgon…).

**Lista negra de duplicados** (ya en la colección, no repetir): Marie Curie, Einstein, Newton, Tesla, Hawking, Galileo, Da Vinci, Cleopatra, Hipatia, Picasso, Ada Lovelace, Grace Hopper, Turing, Steve Jobs, Goku, Naruto, Bulma, Sheldon, Terminator, Mr. Anderson (Matrix), Thor, Messi, Jordan, Kobe, "Ronaldo del 7".

---

## 5. Tipos de desbloqueo disponibles (`unlock.type`)

La función `_avatar_progress(student, jsonb)` en BD interpreta estos tipos. Si añades un `type` nuevo, hay que actualizarla.

| `type` | Campos extra | Significado |
|---|---|---|
| `first_session` | — | Completar la primera partida |
| `total_sessions` | `count`, `mode?` | Total de partidas (opcional: solo modo examen) |
| `unique_apps` | `count` | Apps distintas jugadas |
| `app_sessions` | `app_id`, `count`, `mode?`, `min_nota?` | Sesiones de una app concreta (opcional: modo y nota mínima) |
| `subject_exams` | `subject_id`, `count`, `min_nota?` | Exámenes de una asignatura |
| `perfect_exams` | `count` | Exámenes con nota 10 |
| `high_score_exams` | `count`, `min_nota` | Exámenes con nota ≥ X |
| `badges_count` | `count` | Insignias desbloqueadas |
| `level` | `value` | Nivel de XP alcanzado |
| `xp` | `value` | XP acumulado |
| `duels_won` | `count` | Duelos 1vs1 ganados |
| `battles_won` | `count` | Batallas (Quiz Battle) ganadas |
| `top_class` | `position` | Quedar en posición ≤ X del ranking de clase |
| `top_global` | `position` | Quedar en posición ≤ X del ranking global |
| `streak_days` | `count` | Días seguidos jugando |

---

## 6. Pipeline de procesamiento (PNG → webp → JSON)

Cuando recibas las imágenes generadas (PNG cuadradas, mínimo 512×512), sigue exactamente este flujo. Asume que estás en la raíz del repo.

### Paso 1 — colocar los PNGs

Dejar los PNGs en `public/images/avatar/` (sueltos, con cualquier nombre temporal). Decidir el rango de numeración (siguiente disponible: mira el `sort_order` más alto en `avatars.json` y suma 1).

### Paso 2 — convertir y mover a `_originals/`

Usa ImageMagick 7 (`magick`). Plantilla para cada imagen:

```bash
cd public/images/avatar/
N="101"   # número de avatar
SRC="archivo-original.png"
magick "$SRC" -resize 512x512 -quality 90 "512/avatar-$N.webp"
magick "$SRC" -resize 256x256 -quality 90 "256/avatar-$N.webp"
magick "$SRC" -resize 128x128 -quality 90 "128/avatar-$N.webp"
cp "$SRC" "_originals/avatar-$N.png"
rm "$SRC"
```

Si son varias imágenes, usa un bucle con un mapa N → archivo (ver commits recientes en `git log` para ejemplos de batch).

### Paso 3 — añadir entrada en `avatars.json`

Cada entrada sigue este esquema. Inserta antes del `]` final, manteniendo orden por `sort_order`.

```json
{
  "code": "avatar_101",
  "title": "Título visible (≤ 30 chars)",
  "description": "1-2 frases narrativas que destilan la personalidad. Tono cálido, evocador, no descriptivo del dibujo. Empezar siempre por una imagen o gesto, no por 'Es...'.",
  "rarity": "epic",
  "points_bonus": 0.3,
  "image_lg": "/images/avatar/512/avatar-101.webp",
  "image_md": "/images/avatar/256/avatar-101.webp",
  "image_sm": "/images/avatar/128/avatar-101.webp",
  "unlock_label": "Texto que ve el alumno (verbo en imperativo: 'Aprueba 5 exámenes…', 'Alcanza el nivel X', 'Gana N duelos')",
  "unlock": { "type": "...", ... },
  "sort_order": 101
}
```

### Paso 4 — sincronizar con la BD

`avatars.json` es **catálogo público + seed**, pero la fuente de verdad para producción es la tabla `avatar_definitions`. Si quieres que los alumnos vean ya los avatares nuevos:

- Desde el panel admin: `avatar_admin_upsert` (un por un).
- Por SQL: `INSERT INTO avatar_definitions (...) VALUES (...)` con los mismos campos que el JSON.

Tras sincronizar, llamar a `invalidateAvatarCatalog()` en frontend (o esperar al siguiente login) para que el cliente refresque el catálogo.

---

## 7. Tono y narrativa de las descripciones

La `description` la lee el alumno en la galería. **No** describir el dibujo (es redundante con la imagen). Sí transmitir personalidad, gesto, valor implícito.

**Sí**:
- *"Walkie-talkie en mano, mapa de la ciudad sobre la mesa y un cuaderno lleno de pistas. Cuando algo raro pasa, convoca al equipo y se asegura de que nadie se quede atrás."*
- *"Se cae diez veces y aterriza el truco a la once. El parking del instituto es su pista; las hojas de otoño, su público."*

**No**:
- *"Una chica con pelo rojizo y chaqueta vaquera. Lleva un monopatín."* (eso ya lo veo).
- *"Es una persona muy valiente y trabajadora."* (genérico).

Longitud: 1-3 frases, ~150-250 caracteres. Tono: cálido, ligeramente literario, sin moraleja explícita.

---

## 8. Coherencia con la colección actual

Antes de proponer un avatar nuevo:

1. **Mira la lista negra** (sección 4) para no repetir personajes pop o históricos ya cubiertos.
2. **Comprueba el reparto de rarezas** en `avatars.json` para no inflar una rareza concreta.
3. **Asegúrate de que el desbloqueo no choca**: si ya hay un avatar `legendary` con `level: 25`, evita poner otro al mismo nivel — distribuye los hitos.
4. **Mantén variedad de género, etnia y arquetipo**. La colección debe sentirse representativa para alumnado mixto de Primaria-Bachillerato.
5. **Evita arquetipos militares hostiles, sexualización o estereotipos negativos**. Es una plataforma educativa.

---

## 9. Atajo: prompt de meta-instrucción para una sesión nueva

Si abres una sesión Claude desde cero y quieres prompts coherentes, pégale esto al inicio:

> *"Voy a generar avatares para mi plataforma educativa. Lee `AVATARS.md` antes de proponer nada. Quiero N personajes nuevos del tema X. Para cada uno, devuélveme: arquetipo, rareza propuesta con justificación, requisito de desbloqueo coherente con la rareza, y el prompt completo en formato copy-paste de la sección 2 de AVATARS.md."*
