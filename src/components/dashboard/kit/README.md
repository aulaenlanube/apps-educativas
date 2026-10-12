# Kit de paneles (`components/dashboard/kit`) — contrato del rediseño (2026)

Rediseño completo de los paneles de **alumno** (`/mi-panel`), **docente**
(`/dashboard`) y **usuario libre** (`/mi-zona`): más complejo, divertido y
espectacular, coherente con la plataforma (home, iconos, mascota, kit de juego).
Galería de piezas: `/__dash-kit` (solo dev; `?role=student|teacher|free&theme=dark`).

## Piezas

```jsx
import {
  DashPage, DashHero, LevelShield, XPBar, DashDock, DashCard, StatTile, ProgressRing,
  MiniBars, MeterRow, QuestCard, Pill, DashButton, DashEmpty, SectionGrid,
} from '@/components/dashboard/kit';
```

| Pieza | Para qué |
|---|---|
| `DashPage role` | Fondo temático por rol (student vibrante, teacher sereno, free cálido), claro/oscuro. Envuelve todo el contenido bajo el `<Header>`. |
| `DashHero avatar title subtitle chips level xp xpNext stats actions mascot` | Cabecera-héroe: avatar con escudo de nivel, barra de XP, indicadores en cristal, botones y (alumno) la mascota con su repertorio. |
| `DashDock tabs value onChange` | Pestañas en dock con píldora animada y avisos (`badge`). Sustituye a las Tabs genéricas (mantén la misma lógica de `activeTab`/query `?tab=`). |
| `DashCard icon title subtitle tone actions` | Tarjeta de sección con filo de color. |
| `StatTile icon value label sub tone format progress` | Indicador con número que cuenta. |
| `ProgressRing value max size tone` | Anillo (nota /10 colorea solo: ≥8 verde, ≥5 azul, <5 rojo). |
| `MiniBars data` · `MeterRow` | Gráfica de barras (actividad) y barras horizontales (asignaturas, reparto). |
| `QuestCard appId title status nota due reward onPlay` | Tarea como misión (pending/done/overdue/duel) con icono de app y anillo de nota. |
| `Pill` · `DashButton variant` · `DashEmpty` · `SectionGrid cols` | Etiquetas, botones con canto 3D (primary, amber, rose, emerald, sky, glass, soft), estado vacío con la mascota, rejillas responsive. |

Tonos (`tone`): violet, indigo, pink, rose, amber, orange, emerald/good, cyan, blue/ok, bad, slate, accent.
Variables: `--dk-ink`, `--dk-ink-2`, `--dk-ink-3`, `--dk-line`, `--dk-surface`, `--dk-surface-2`,
`--dk-inset`, `--dk-edge` (cambian con el tema).

## Reglas (OBLIGATORIAS)

1. **Solo presentación.** No cambies llamadas a Supabase/RPC, parámetros, estados de
   datos, efectos, cálculos de nota/bonus (ver CLAUDE.md "Sistema de nota y bonus"),
   permisos, ni la lógica de duelos/tareas/chat. Puedes reorganizar JSX, extraer
   subcomponentes de presentación y reescribir el CSS/clases.
2. **Ve a fondo**: no basta con cambiar colores. Rehaz la composición de cada
   pantalla con jerarquía clara, piezas del kit, ilustración (iconos de app
   `AppIcon`, insignias `BadgeIcon`, avatares `UserAvatar`, la mascota) y
   micro-animaciones (transform/opacity). Que sea divertido para el alumno y
   profesional-pero-amable para el docente.
3. Datos que hoy no llegan del servidor (ver `src/dev/mock/README.md`, "Bugs"):
   muéstralos con fallback limpio (—) en vez de valores engañosos.
4. **Tema oscuro** (`html.dark`) y **móvil** (`@media (max-width: 720px)`) cuidados.
   Sin `window.confirm/alert/prompt` (modales propios).
5. **Rendimiento**: nada de `backdrop-filter` en elementos repetidos; animaciones
   solo transform/opacity; listas largas sin animaciones de entrada pesadas.
6. No edites el kit ni ficheros fuera de tu lote; si necesitas una pieza nueva,
   créala dentro de tus ficheros o pídela en tu informe.
7. **framer-motion 10.18 + `AnimatePresence mode="wait"`**: no montes elementos
   animados nuevos dentro de una vista que está saliendo (la siguiente puede no
   aparecer nunca); móntalos desde el primer render y usa salidas cortas.

## Comprobar (modo simulado, sin cuenta)

```bash
node tools/dash-shots.mjs --role=student --path=/mi-panel --out=<dir> --tabs
node tools/dash-shots.mjs --role=teacher --path=/dashboard --out=<dir> --click="3º ESO B" --tabs
node tools/dash-shots.mjs --role=free --path=/mi-zona --out=<dir>
# --dark · --mobile · --click="texto|css:selector|key:Escape" (una captura por clic)
```
Lee las capturas, corrige, y revisa la consola (la herramienta lista errores).
