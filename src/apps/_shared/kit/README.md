# Kit de interfaz de juego (`_shared/kit`) — contrato del rediseño de apps (2026)

Lenguaje visual común para todas las apps. App de referencia: **Ahorcado**
(`src/apps/ahorcado/Ahorcado.jsx` + `Ahorcado.css`). Galería de piezas: `/__kit`
(solo desarrollo; `?section=modes|play|results|states`, `&theme=dark`).

## Piezas

```jsx
import {
  GameShell, GameHeader, Hud, HudStat, Lives, ProgressDots, ProgressBar, Panel, Chip,
  KeyTile, AnswerOption, GameButton, Segmented, ModeSelect, RoundBanner,
  ResultsScreen, FeedbackItem, GameLoading, GameEmpty, ConfirmDialog, ModeChip, useAppMeta, cleanAppName,
} from '../_shared/kit';
```

| Pieza | Para qué |
|---|---|
| `GameShell accent accent2 theme wide scene` | Escenario de la app (sustituye a la "tarjeta blanca"). `accent`/`accent2` = colores del icono de la app. `theme="dark"` para apps de ambiente nocturno; por defecto sigue el tema. `scene` = decorado propio de la app (se pinta en la capa de fondo; no uses z-index negativos dentro del escenario). |
| `GameHeader mode modeLabel onHelp onStudy right` | Icono + nombre + curso (de `useAppMeta`, no hay que pasarlos), chip del modo y marcador a la derecha. |
| `Hud` + `HudStat icon tone value label` | Marcador. `tone`: score, streak, lives, time, progress, good, bad, accent. |
| `Lives total left` · `ProgressDots total current results` · `ProgressBar value max tone` | Vidas, progreso del examen (results = array de true/false), tiempo. |
| `ModeSelect modes onSelect onHelp onStudy extra` | **Pantalla previa** de modos: `modes=[{id, tone:'easy'|'medium'|'exam', title, desc, features[], icon?}]`. |
| `Panel variant="surface|screen|inset"` | Superficies interiores: cristal claro, pantalla oscura con brillo (para palabras/números protagonistas), hundida (tableros). |
| `KeyTile state` · `AnswerOption letter state` | Teclas y opciones de respuesta táctiles. `state`: idle, correct, wrong, selected, hint (+ `is-dim` en className). |
| `GameButton variant size icon iconRight` | Botón con canto 3D. variant: primary, success, danger, warning, soft, ghost. |
| `Segmented options value onChange` | Selector segmentado (Palabra/Frase, operación…). |
| `RoundBanner show status title subtitle action actionLabel` | Aviso al terminar una ronda (won/lost/info). |
| `ResultsScreen nota points stats actions` + `FeedbackItem` | Resumen del examen: anillo con la nota /10 (lo más prominente, CLAUDE.md §3.1), mensaje, puntos paralelos, stats y retroalimentación. |
| `ResultsScreen mode="practice"` | El mismo resumen para práctica (chip y título cambian). |
| `ConfirmDialog open title onConfirm onCancel tone` | Confirmación propia (salir del examen, entregar…). Nunca `window.confirm`. |
| `GameLoading` · `GameEmpty` | Carga y sin contenido. |

Clases sueltas: `gk-anim-shake` (fallo), `gk-anim-pop` (aparición), tonos `gk-tone-easy|medium|exam`,
variables `--gk-ink`, `--gk-ink-2`, `--gk-ink-3`, `--gk-line`, `--gk-surface`, `--gk-surface-2`,
`--gk-inset`, `--gk-key-edge`, `--gk-accent`, `--gk-accent-2` (ya cambian con el tema).

## Reglas del rediseño de una app (OBLIGATORIAS)

1. **Solo presentación.** No cambies puntuación, cálculo de nota, número de preguntas,
   tiempos de juego, carga de datos, `onGameComplete` (payload, momento, refs/flags de
   una-sola-vez), `useGameTracker`, ni la lógica de duelo (`useDuel`, mensajes del canal).
   Si tocas JSX alrededor de un efecto de tracking, deja el efecto idéntico.
2. **Modo en pantalla previa** (CLAUDE.md §3). Si la app cambia de modo con pestañas
   DURANTE la partida, pásalo a `ModeSelect` como en Ahorcado: estado inicial `null`,
   protege los efectos que arrancan partida (`if (!gameMode) return;`) y los manejadores
   de teclado (`if (!gameMode) return;`). Los valores de modo y lo que se envía a
   `onGameComplete` no cambian. En examen no ofrezcas "cambiar de modo" a mitad.
   Apps sin modos (CLAUDE.md: Isla de la Calma, Banco de Recursos, Generador de
   Personajes, Laboratorio de Robótica; `single_mode`) no llevan ModeSelect.
3. **Usa el kit** para el armazón (escenario, cabecera, marcador, modos, avisos,
   resultados, botones, teclas, opciones) y **rediseña a fondo lo propio de cada
   juego** (tableros, fichas, cartas, ilustraciones, animaciones de acierto/fallo):
   materiales con volumen y luz (degradado, canto/sombra, brillo), coherentes con los
   iconos de la plataforma (`src/components/art/README.md` §3). Nada de emojis como
   "ilustración" principal si se puede dibujar algo mejor (los emojis de contenido,
   p. ej. en preguntas, sí se quedan).
4. **Resumen de examen** con `ResultsScreen`: `nota` la calcula la app como ya hacía
   (`Math.round(correct/total*100)/10` si no la mostraba); `points` = los puntos
   paralelos que la app ya calcula. Mantén la retroalimentación por pregunta si existía.
5. **CSS**: reescribe el CSS de la app con un prefijo propio y borra lo que quede
   muerto. Tema oscuro con `html.dark` (las variables `--gk-*` ya cambian solas).
   Responsive en `@media (max-width: 720px)`. Sin `window.confirm/alert/prompt`.
6. **Rendimiento** (ver `src/styles/fx.css` y `src/services/uiFx.js`): anima solo
   `transform`/`opacity`; nada de `backdrop-filter` ni `filter` en piezas que se
   repiten (teclas, fichas, celdas); sin bucles infinitos decorativos salvo bajo
   `html[data-fx="high"]`; nada de filtros SVG. El juego en sí (canvas, física,
   bucles de juego) no se toca.
7. **Duelos** (`*Duel.jsx`): misma lógica; restyle con el kit si es razonable y
   siempre con `<DuelChatBar … />` montado (CLAUDE.md §7).
8. **Apps 3D/inmersivas**: solo el "chrome" (menús, HUD, paneles, resultados) con el
   kit (`theme="dark"`); no toques escenas, física ni el bucle 3D.
9. No edites el kit (`_shared/kit/*`) ni ficheros fuera de tu lote. Si el kit no
   cubre algo, crea el componente dentro de tu app o pide el cambio en tu informe.
10. **framer-motion 10.18 + `AnimatePresence mode="wait"`**: si dentro de una pantalla
    que ya está saliendo aparece un elemento animado NUEVO, la siguiente pantalla no
    llega a montarse (escenario vacío, pasó en Quiz Battle al pulsar "Siguiente"
    rápido). Monta los elementos animados desde el primer render de la pantalla
    (cambia sus valores, no los añadas después) y usa salidas cortas (fundido).

## Comprobar

Servidor de desarrollo en `http://localhost:5199`. Capturas con pasos:

```bash
node tools/app-shots.mjs --path=/curso/primaria/3/lengua/app/ahorcado --out=<dir> \
  --steps="shot:modos; click:text=Palabras; wait:900; shot:juego; press:A; shot:tecla"
# --theme=dark · --width=390 --height=844 (móvil) · --full (página entera)
```

Busca una URL válida para cada app en `src/apps/config/{primaria,eso,bachillerato}Apps.js`
(ruta `/curso/:level/:grade/:subjectId/app/:appId`). Captura como mínimo: pantalla de
modos, partida en curso, fin de ronda, resultados de examen (juega con pasos hasta
llegar; si es inviable, dilo), tema oscuro y móvil. Lee las capturas y corrige.
`pnpm exec eslint --max-warnings 0 <ficheros>` (si un fichero ya tenía avisos o errores
antes de tocarlo, no añadas nuevos). `pnpm run test` al final.
