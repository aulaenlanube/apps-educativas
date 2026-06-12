# Laboratorio de Física 3D — Planteamiento

> Simulador 3D interactivo de fuerzas y dinámica de fluidos para **Física y Química (ESO 1º-4º)**, **Física y Química (1º Bach)** y **Física (2º Bach)**. Documento de diseño previo a la implementación. Incluye también el plan del **sistema de calidad gráfica global** de la plataforma (requisito previo, reutilizando el de La Fortaleza). Verificado contra el repo y contra el currículo estatal LOMLOE (RD 217/2022 y RD 243/2022).

---

## 1. Visión

Una única app (`laboratorio-fisica`) con un **catálogo de simulaciones 3D** configurables e interactivas. La misma app se sirve a todos los cursos: el catálogo visible **crece con el curso** (acumulativo — un alumno de 1º Bach ve las simulaciones de ESO más las suyas, y cada curso estrena alguna). Cada simulación es una escena three.js con:

- **Panel de parámetros** (sliders/toggles): masa, ángulo, μ, densidad, gravedad del planeta, k del muelle…
- **Visualización didáctica activable**: vectores de fuerza con magnitud, trayectoria trazada, gráficas x-t / v-t en vivo, barras de energía, rejilla métrica.
- **Fórmula viva**: la ecuación de la simulación con los valores actuales sustituidos (p. ej. `F_r = μ·N = 0,3 · 19,6 = 5,88 N`), actualizada de forma throttled (~10 Hz), no a 60 fps.
- Controles **play / pausa / paso a paso / cámara lenta / reset** y cámara orbital (OrbitControls; ver estrategia táctil en §7).

**Principio innegociable**: la física es **determinista y con paso fijo** (acumulador a 1/120 s, dt de frame capado a 0,25 s para evitar la espiral de la muerte tras throttling de rAF; el reloj de simulación se pausa con `visibilitychange`). La calidad gráfica afecta SOLO a lo visual (partículas, sombras, resolución), **nunca al resultado físico**: toda magnitud medible sale del motor o de la fórmula analítica, jamás de la estadística de partículas visuales. El "mismo resultado" se garantiza a efectos didácticos (3 cifras significativas — `Math.sin/cos/pow` no son bit-exactas entre motores JS); cualquier comparación (examen, futuro duelo) redondea a 3 cifras antes de comparar.

### Stack (ya instalado, sin dependencias nuevas)

| Pieza | Estado |
|---|---|
| `three@0.182` + `@react-three/fiber@8.18` + `@react-three/drei@9.122` | Ya en uso (sistema-solar, excavación-selectiva, mesa-crafteo, visualizador-figuras-3d). r3f v8 es la línea correcta para React 18 (v9 exige React 19) |
| Chunk `three` separado en `vite.config.js` (manualChunks + filtro de modulePreload) | Ya configurado — la app no engorda el bundle inicial |
| Motor físico | **Propio** en `engine/` (Euler semi-implícito —simpléctico, estable en energía—, paso fijo, RNG con semilla mulberry32 como en `la-fortaleza/engine.js`). No se usa matter-js: es 2D y no garantiza los valores exactos que exige la didáctica. Donde hay solución analítica (hidrostática, Stokes, órbitas keplerianas, gas ideal) se usa la analítica y la simulación solo anima |

---

## 2. Registro en la plataforma

- **Carpeta**: `src/apps/laboratorio-fisica/`
- **Definición** (`commonApps.js`): `appLaboratorioFisica = { id: 'laboratorio-fisica', name: '🧲 Laboratorio de Física 3D', description: 'Simulador 3D de fuerzas y fluidos: experimenta, supera retos y examínate.', component: LaboratorioFisica }` (lazy, como el resto).
- **esoApps.js**: añadir a `esoApps['1'..'4']['fisica']`.
- **bachilleratoApps.js**: añadir a `appsCiencias` (esa lista solo la consumen `fisica` de 1º y de 2º — Química de 2º usa `appsQuimica`, así que no se filtra a Química).
- La app recibe `level`, `grade` (string — parsear con `parseInt`), `subjectId`, `onGameComplete` como props desde `AppRunnerPage` y filtra el catálogo por `(level, grade)`.
- **Sin duelo en v1** (candidato a v2: reto contrarreloj con la misma semilla, ver §8).
- **No es `single_mode`**: tiene los tres modos estándar; solo el examen cuenta para tareas.

---

## 3. Catálogo de simulaciones por curso

Mapeo verificado contra el currículo estatal LOMLOE (RD 217/2022 ESO y RD 243/2022 Bachillerato). Catálogo **acumulativo**: cada curso hereda lo anterior y estrena simulaciones nuevas.

> **Nota curricular**: a nivel estatal FyQ se imparte de facto en 2º-3º ESO (en 1º ESO va Biología y Geología) y los saberes van por ciclo 1º-3º. Como la plataforma ofrece `fisica` también en 1º ESO, el bloque del ciclo se reparte entre 1º y 2º por diseño de progresión (no por mandato curricular), de modo que **todos los cursos estrenan algo**.

### 1º ESO — el punto de partida

| # | Simulación | Qué se aprende | Configurable |
|---|---|---|---|
| 1 | **Caída libre y gravedad** | La gravedad como fuerza; caída con/sin resistencia del aire; gráficas x-t, v-t | masa, altura, planeta (g de Luna/Tierra/Marte/Júpiter), forma del objeto (con aire) |
| 2 | **Empuja la caja (rozamiento)** | Fuerzas como agentes de cambio; rozamiento estático vs dinámico; 1ª y 2ª ley de Newton cualitativas | F aplicada, masa, superficie (hielo/madera/goma → μ) |

### + 2º ESO

| # | Simulación | Qué se aprende | Configurable |
|---|---|---|---|
| 3 | **Muelles y ley de Hooke** | Deformaciones elásticas, F = −k·x | k, masa colgada, estiramiento inicial |
| 4 | **Gas de partículas** | Teoría cinético-molecular: presión y temperatura como agitación de partículas | nº de partículas, temperatura, volumen del recipiente |

### + 3º ESO

| # | Simulación | Qué se aprende | Configurable |
|---|---|---|---|
| 5 | **Plano inclinado** | Comportamiento de un cuerpo en pendiente (cualitativo en 3º; en 4º el panel muestra la descomposición vectorial numérica) | ángulo, masa, μ |
| 6 | **¿Flota o se hunde?** | Flotación cualitativa por densidades (antesala de Arquímedes) | material del objeto, líquido (agua/aceite/mercurio) |

### + 4º ESO (el curso central: cinemática + fuerzas vectoriales + fluidos)

| # | Simulación | Qué se aprende | Configurable |
|---|---|---|---|
| 7 | **Carrera MRU/MRUA** | Cinemática cuantitativa: ecuaciones del movimiento, encuentros, gráficas x-t y v-t en vivo | v₀ y a de cada móvil, distancia, salida con retardo |
| 8 | **Cuerpos enlazados y polea** | Tensión (fuerza nombrada literalmente en el RD de 4º): máquina de Atwood, arrastre con cuerda | masas, μ de la mesa, polea ideal |
| 9 | **Presión bajo el agua** | Hidrostática: p = p₀ + ρ·g·h, sensor sumergible con lectura en vivo | profundidad, densidad del líquido, g |
| 10 | **Prensa hidráulica (Pascal)** | Principio de Pascal: F₁/S₁ = F₂/S₂ — levanta un coche con una mano | áreas de los émbolos, fuerza aplicada |
| 11 | **Empuje de Arquímedes** | E = ρ_f·g·V_sumergido; peso aparente; línea de flotación | densidad y volumen del objeto, líquido |
| 12 | **Presión atmosférica (Torricelli)** | El barómetro: la atmósfera empuja; p₀ en distintos planetas/altitudes | líquido del tubo (mercurio/agua), altitud, planeta |
| 13 | **Gravitación universal** | F = G·m₁·m₂/r²; concepto de peso; comparar básculas en planetas | masas, distancia, cuerpo celeste |
| 14 | **Montaña rusa de la energía** | Conservación de la energía mecánica, Ep↔Ec, pérdidas por rozamiento | altura inicial, μ del tramo, masa, loop sí/no |
| 15 | **Movimiento circular** | MCU, fuerza centrípeta (bola en cuerda, peralte) | radio, ω o v, masa |

### + 1º Bachillerato

| # | Simulación | Qué se aprende | Configurable |
|---|---|---|---|
| 16 | **Tiro parabólico** | Composición de movimientos; alcance, altura máxima; con/sin rozamiento del aire | v₀, ángulo, altura de lanzamiento, g, aire on/off |
| 17 | **Choques y momento lineal** | Conservación de p; choque elástico/inelástico; impulso | masas, velocidades, coeficiente de restitución, 1D/2D |
| 18 | **Estática y momento de fuerzas** | Equilibrio del sólido rígido, par de fuerzas (balancín, grúa) | posiciones y pesos de las cargas, longitud del brazo |

> En 1º Bach la sim 20 (MAS) ya es **visible con etiqueta "Ampliación"**: estatalmente el MAS es de 2º, pero casi todos los libros de texto de 1º lo adelantan (unidad "cinemática circular y armónica") y muchos docentes lo buscarán ahí. No entra en el examen de 1º.

### + 2º Bachillerato

| # | Simulación | Qué se aprende | Configurable | Etiqueta |
|---|---|---|---|---|
| 19 | **Órbitas y satélites** | Campo gravitatorio, leyes de Kepler, velocidad de escape, energía orbital | masa central, v y altura de inserción, lanzar varios satélites | estatal |
| 20 | **Oscilaciones (MAS)** | Péndulo y muelle oscilante; energía en el oscilador | longitud/k, masa, amplitud, g | estatal |
| 21 | **Cargas y campos (Coulomb y Lorentz)** | Fuerza eléctrica entre cargas; partícula cargada en campos E⃗ y B⃗ uniformes (desviación, hélice, espectrómetro de masas) | cargas, masas, E, B, v inicial | estatal |
| 22 | **Túnel de viento (Bernoulli)** | Líneas de corriente, tubo de Venturi, sustentación de un ala | velocidad del flujo, ángulo de ataque, forma del perfil | **ampliación** |
| 23 | **Viscosidad (ley de Stokes)** | Caída en fluido viscoso, velocidad terminal | radio y densidad de la bola, fluido (agua/aceite/miel/glicerina) | **ampliación** |

> Bernoulli **no aparece en ningún curso del currículo estatal** — las simulaciones 22 y 23 se marcan visualmente como "Ampliación" en el catálogo y **no entran en el examen** (sí en Explora y Retos). Cumplen el objetivo de la app de mostrar dinámica de fluidos espectacular sin contaminar la nota con contenido no evaluable.

---

## 4. Modos de juego (estándar de la plataforma)

Pantalla de **selección previa** (nunca tabs durante la partida), tres modos:

| Modo | Valor interno | Experiencia |
|---|---|---|
| 🔬 **Explora** | `easy` → `mode: 'practice'` | Sandbox libre: cualquier simulación del curso, todos los parámetros, todas las ayudas visuales activas. Sin nota. |
| 🎯 **Retos** | `medium` → `mode: 'practice'` | 3-5 retos guiados por simulación ("consigue que la caja llegue a la meta ajustando solo μ", "haz flotar el cofre cargándolo al máximo", "pon el satélite en órbita estable"). Pistas limitadas, puntos por reto + bonus sin pistas. |
| 📝 **Examen** | `exam` → `mode: 'test'` | **10 preguntas POE (Predice-Observa-Explica)** sobre las simulaciones del curso: el alumno predice el resultado, la simulación se ejecuta, se comprueba en pantalla y se justifica. Sin ayudas visuales. Genera nota. |

### Examen
- **Pool de preguntas**: el catálogo **acumulado** visible en el curso (sin ampliaciones), con **~60 % de las preguntas sobre las simulaciones estrenadas en el curso actual** y el resto de repaso de cursos anteriores.
- Preguntas generadas desde **plantillas parametrizadas con semilla** (mulberry32, valores en rangos validados para excluir sorteos degenerados —p. ej. μ que impide el movimiento cuando la pregunta lo asume— y con dificultad equivalente entre semillas).
- Estructura POE completa: **Predice** (numérica o test) → **Observa** (la simulación se ejecuta) → **Explica** (opción múltiple sobre la justificación física: "¿por qué ha flotado? A) su densidad es menor que la del líquido…", con peso propio en la pregunta).
- Predicción numérica con **tolerancia mixta**: `max(5 % relativo, ε absoluto por magnitud)` (el relativo puro falla cuando el valor esperado es ~0, p. ej. equilibrio). El input acepta **coma y punto decimal**, muestra la unidad junto al campo y la g utilizada en pantalla.
- `nota = Math.round((correctAnswers / totalQuestions) * 100) / 10`, con el código de colores y mensajes estándar (§3.1 de CLAUDE.md).
- **Puntos paralelos sin tope**: rapidez de respuesta + racha de aciertos + bonus por clavar la predicción numérica (error < 1 %).
- `onGameComplete` una sola vez (guardado por `useRef`), payload estándar. **Si el alumno abandona a mitad de examen, dispara en el cleanup con la nota parcial** (patrón Anagramas de CLAUDE.md). Ranking automático vía `AppRunnerPage`.

### Material de estudio
Botón **"Formulario"** (patrón del botón "Ver material de estudio"): modal con las fórmulas del curso agrupadas por simulación, cada una con leyenda de variables y unidades SI. `InstructionsModal` + `InstructionsButton` de `_shared` para las instrucciones.

---

## 5. Sistema de calidad gráfica GLOBAL (requisito previo — Fase 0)

Hoy el selector vive dentro de La Fortaleza y ya está muy desacoplado: [src/apps/la-fortaleza/quality.js](src/apps/la-fortaleza/quality.js) define niveles, parámetros, autodetección (`detectGPUTier`), persistencia y un governor de FPS; [render3d.js](src/apps/la-fortaleza/render3d.js) solo lo consume. Plan de extracción:

### 5.1. Servicio global — `src/services/graphicsQuality.js`
Mover `quality.js` casi tal cual:
- **Tres niveles visuales**: `low` 🔋 / `medium` ⚖️ / `high` ✨ (los de `QUALITY_LEVELS`), más la **preferencia** `auto` (default), que no es un cuarto nivel sino un valor que se **resuelve** a uno de los tres vía `detectGPUTier()` — igual que hoy en Fortaleza.
- **Persistencia**: nueva clave `localStorage['eduapps-graphics-quality']`, con **migración**: si no existe, leer `'fortaleza-quality'` y adoptarla (y a partir de ahí escribir solo la global). Por dispositivo, no por usuario — la capacidad es de la máquina.
- **Autodetección** (`detectGPUTier`, ya implementada): renderer WebGL desenmascarado (SwiftShader/llvmpipe → `low`), `navigator.deviceMemory` ≤ 4 GB o `hardwareConcurrency` ≤ 4 o móvil → `medium`, resto → `high`.
- **`QUALITY_PARAMS` genéricos por tier** (lo que toda app 3D necesita): `pixelRatio` (1 / 1.5 / 2 — el dpr efectivo es siempre `Math.min(window.devicePixelRatio, tier.pixelRatio)`, que es lo que espera la prop `dpr` de r3f), `antialias`, `shadows` + `shadowMapSize` (0 / 1024 / 2048), `envMap`, `bloom` (solo high), y **`particleBudget`** (multiplicador 0.3 / 0.6 / 1 para sistemas de partículas — extensión natural del patrón `decorDensity` de Fortaleza).
- **`createFpsGovernor`** generalizado: si los FPS se sostienen bajos, baja un tier en caliente (ya existe en Fortaleza, es genérico).
- Cada app puede **extender** con sus knobs propios por tier (Fortaleza conserva `rounded`, `decorDensity`, `keepLights`… en su fichero, indexados por el tier global).

### 5.2. Hook — `src/hooks/useGraphicsQuality.js`
`{ pref, tier, setPref }` con sincronización entre componentes/pestañas (evento custom + `storage`). `tier` es el resuelto (auto → low/medium/high).

### 5.3. Selector compartido — `src/components/ui/GraphicsQualitySelector.jsx`
UI extraída de la de Fortaleza (fila de botones Auto/🔋/⚖️/✨), dos variantes: `compact` (panel in-app) y `full` (fila de ajustes con descripción).

### 5.4. Dónde aparece
1. **Perfil/ajustes** del alumno (`StudentProfileEditor`) y del docente → variante `full`. Al entrar por primera vez no hace falta wizard: el default `auto` ya se ajusta solo a los recursos del sistema.
2. **Pantalla de selección de modo** de cada app 3D (Fortaleza ya lo hace; el Laboratorio lo tendrá igual).
3. **Panel in-game** de las apps 3D (variante `compact`).
4. **Usuarios free/admin** (sin editor de perfil de alumno): les basta el selector de las pantallas 2 y 3 — la preferencia es por dispositivo, así que se conserva igualmente.

### 5.5. Refactor de La Fortaleza
Sustituir su `loadQualityPref/saveQualityPref` por el servicio global (con la migración de clave). Comportamiento idéntico para el usuario; cero cambios en `engine.js`.

> Candidatos a adoptar el tier global más adelante: sistema-solar, excavación-selectiva, mesa-crafteo (hoy renderizan sin selector).

---

## 6. Render de fluidos por tier (cómo se consigue "la mayor calidad posible" sin matar móviles)

La física de fluidos del currículo es **analítica** (hidrostática, Pascal, Arquímedes, Stokes, Bernoulli en régimen ideal) — no hace falta Navier-Stokes. La estrategia: **física exacta analítica + visuales escalables por tier**.

| Simulación | `low` 🔋 | `medium` ⚖️ | `high` ✨ |
|---|---|---|---|
| Agua (tanque, flotación, prensa) | plano translúcido estático | superficie con oleaje suave (shader de vértices) | + fresnel, refracción, cáusticas fake, burbujas instanced |
| Gas de partículas | ~150 partículas instanced | ~400 | ~1000 + motion blur sutil |
| Túnel de viento | ~300 trazadores, líneas de corriente estáticas | ~1000 trazadores advectados | ~3000 + estelas (trails) + mapa de color de presión sobre el perfil |
| Ley de Stokes | fluido como volumen tintado | + partículas en suspensión | + estela de la bola, distorsión |

Reglas que protegen la física de la calidad gráfica:

- **Gas de partículas**: todas las magnitudes medibles (p, V, T del manómetro/termómetro) salen de la **ley de los gases ideales analítica**; las partículas son visualización pura agitada en consecuencia (rebotes solo contra paredes — nada de colisiones partícula-partícula O(n²)). Así el tier cambia cuántas partículas se VEN, nunca lo que se MIDE.
- **Túnel de viento**: flujo potencial **con circulación fijada por la condición de Kutta** (perfil de Joukowski por transformación conforme, o vórtice ligado + Kutta-Joukowski `L' = ρ·V·Γ`). El flujo potencial puro daría sustentación CERO (paradoja de d'Alembert) — sin circulación la sim enseñaría física incorrecta. El modelo no reproduce la entrada en pérdida: el ángulo de ataque se capa (~12°) con aviso en pantalla. Sigue siendo analítico y barato; las partículas solo se advectan por ese campo con instancing.
- Todos los conteos de partículas se multiplican por el `particleBudget` del tier; sombras, `pixelRatio`, antialias, bloom y envMap salen directos de `QUALITY_PARAMS`.

---

## 7. Arquitectura de la app

```
src/apps/laboratorio-fisica/
  LaboratorioFisica.jsx        # shell: selección de modo → catálogo → simulación activa
  LaboratorioFisica.css
  registry.js                  # catálogo: { id, nombre, icono, minGrade/minLevel, ampliacion,
                               #   component, formulas, retos[], examTemplates[] }
  engine/
    integrator.js              # paso fijo 1/120 s con acumulador, clamp de dt (0,25 s), determinista
    forces.js                  # gravedad, rozamiento, muelle, drag cuadrático, empuje, tensión, Lorentz
    rng.js                     # mulberry32 con semilla (patrón de la-fortaleza/engine.js)
  scenes/                      # una carpeta por simulación (escena r3f + panel de parámetros)
    caida-libre/  rozamiento/  muelles/  gases/  ...
  components/
    SimViewport.jsx            # <Canvas> con calidad aplicada (dpr, shadows, AA del tier)
    ParamPanel.jsx             # sliders/toggles + fórmula viva
    VectorArrow.jsx            # flecha 3D de fuerza con etiqueta de magnitud
    GraphPanel.jsx             # gráficas x-t / v-t en vivo (canvas 2D imperativo)
    EnergyBars.jsx             # barras Ep/Ec/E_total
    ExamScreen.jsx             # flujo POE: pregunta → predicción → simulación → veredicto → explica
```

Decisiones de arquitectura que la verificación técnica fijó:

- **Un solo `<Canvas>` con `key={tier}`**: las escenas se intercambian dentro del mismo Canvas (evita recrear el contexto WebGL entre las 10 preguntas POE), pero un **cambio de tier remonta el Canvas** — `antialias` es un atributo de creación del contexto y `shadows` exige `needsUpdate` en materiales; no se pueden cambiar en vivo (`dpr` sí). El **estado físico vive en el engine, fuera de React**, así la simulación o el examen en curso sobreviven al remount (mismo mecanismo que usa Fortaleza al reconstruir escena).
- **Pérdida de contexto WebGL**: `SimViewport` escucha `webglcontextlost`/`webglcontextrestored` y remonta el Canvas reconstruyendo desde el estado del engine (frecuente en Android de gama baja e iOS con presión de memoria; sin esto, pantalla negra a mitad de examen). Testeable con `WEBGL_lose_context` (ya usado en `detectGPUTier`).
- **Memoria de assets**: materiales y geometrías procedurales (sin texturas pesadas), un único envMap compartido por tier, y limpieza de assets exclusivos al salir de cada escena (r3f auto-dispone los objetos desmontados; no retener refs de escena). iOS Safari mata la pestaña sin aviso si se acumula memoria.
- **Gráficas y lecturas sin tormenta de re-renders**: `GraphPanel` dibuja en `<canvas>` 2D imperativamente vía ref (cero estado React por frame); la fórmula viva y las lecturas numéricas se actualizan throttled a ~10 Hz.
- **Táctil**: en móvil el viewport ocupa ~45vh arriba con panel abajo; OrbitControls configurado con un dedo = rotar solo dentro del canvas y dos dedos = zoom/pan, con `touch-action` correcto en el resto de la página para no secuestrar el scroll.
- **Catálogo filtrado** por `(level, grade)`: `registry.js` declara dónde aparece cada simulación; el shell calcula el set acumulado.
- **Diseño**: gradiente propio azul-cian (laboratorio), `framer-motion` en UI, `canvas-confetti` al superar retos/aprobar, `lucide-react`, responsive ≤720px. Nada de `window.confirm/alert/prompt` — modales propios.

---

## 8. Fases de implementación propuestas

| Fase | Contenido | Entregable |
|---|---|---|
| **0** | Sistema de calidad global: servicio + hook + selector compartido + refactor de La Fortaleza + entrada en perfil | Independiente y desplegable por sí solo |
| **1** | Shell del laboratorio + motor + registro en configs + modos completos (Explora/Retos/Examen) + sims 1-4 (1º-2º ESO) | App funcional para 1º-3º ESO |
| **2** | Sims de 3º-4º ESO (5-15): plano inclinado, flotación, MRU/MRUA, polea/tensión, hidrostática completa, Torricelli, gravitación, energía, circular | Curso central completo |
| **3** | Bachillerato: tiro parabólico, choques, estática (1º) + órbitas, MAS, cargas y campos (2º) | Todos los cursos cubiertos |
| **4** | Ampliaciones de fluidodinámica: túnel de viento (Bernoulli con Kutta) y Stokes + pulido high-end (agua con shader, estelas) | El "wow" visual |
| v2 | Duelo 1 vs 1 (reto contrarreloj con la misma semilla, `mode: 'duel'` + `DuelChatBar`), más sims (Venturi cuantitativo, ondas, ciclotrón) | — |

---

## 9. Decisiones tomadas (revisables)

1. **Examen por curso, no por simulación**: las 10 preguntas POE salen del catálogo acumulado del curso (sin ampliaciones), con ~60 % de peso en las sims estrenadas ese año → una sola tarea evaluable por curso, más variedad. Alternativa descartada: examen por simulación (fragmentaría las tareas y el ranking).
2. **1º ESO recibe las dos primeras sims del ciclo** aunque curricularmente FyQ empiece en 2º (la asignatura existe en la plataforma en 1º; mejor contenido del ciclo que vacío), y el bloque del ciclo se reparte 1º/2º para que **cada curso estrene simulaciones**.
3. **Bernoulli y Stokes como "Ampliación"** visible pero fuera del examen (no son currículo estatal en ningún curso). El MAS aparece además en 1º Bach como "Ampliación" (los libros de texto lo adelantan; el examen de MAS solo en 2º).
4. **Motor físico propio** en lugar de matter-js (precisión didáctica y determinismo) — matter-js sigue disponible si alguna escena futura lo pide.
5. **Calidad por dispositivo (localStorage)**, no por usuario en BD: la capacidad gráfica es de la máquina, no de la cuenta.
6. **Retos y plantillas de examen en código (`registry.js`)**, no en BD vía `getAppContent`: están fuertemente acoplados a los parámetros de cada escena 3D (rangos válidos, callbacks de validación), y servirlos como JSON libre no evitaría tocar código al cambiarlos. Si más adelante se quiere edición desde el panel de admin, se puede migrar la parte declarativa (enunciados, rangos) a `getAppContent('laboratorio-fisica', level, grade)`.
7. **Fuerzas eléctrica y magnética incluidas en 2º Bach** (sim 21, Coulomb + Lorentz): son bloques centrales del RD 243/2022 y "las principales fuerzas" las exigen. Variantes avanzadas (espectrómetro completo, ciclotrón) quedan para v2.
