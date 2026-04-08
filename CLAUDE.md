# CLAUDE.md — Guía para crear apps en EduApps

> **⚠️ OBLIGATORIO:** Este fichero debe consultarse **siempre** antes de crear una nueva app educativa. Claude Code lo lee automáticamente en cada sesión.

Este repositorio es una plataforma React + Vite de apps educativas para Primaria (1-6) y ESO (1-4). Cada app debe cumplir la checklist de abajo para integrarse correctamente con el resto del portal (autenticación, estadísticas, gamificación, navegación y diseño).

---

## 📋 Checklist obligatoria para cada app nueva

Marca cada punto antes de considerar la app "terminada":

### 1. Estructura y ubicación

- [ ] Crear carpeta `src/apps/<nombre-app>/` (kebab-case)
- [ ] Componente principal: `src/apps/<nombre-app>/<Nombre>.jsx`
- [ ] Estilos: `src/apps/<nombre-app>/<Nombre>.css`
- [ ] Si hay lógica compleja (generador de puzzles, etc.), extraerla a un fichero aparte `*.js`

### 2. Fuente de datos

**Prioridad:** reutiliza los datos existentes siempre que sea posible. Tenemos **muchos datos del Rosco** (>110 ficheros validados).

- **Apps de palabras** → `getRoscoData(level, grade, asignatura)` del `gameDataService.js`
  - Devuelve `[{id, letra, tipo, definicion, solucion, materia, difficulty}]`
  - Úsalas como palabra (`solucion`) + pista (`definicion`)
  - Los distractores para test pueden ser otras soluciones del mismo rosco
- **Apps de frases** → `getOrdenaFrasesData(level, grade, asignatura)`
- **Otras fuentes disponibles:** `getRunnerData`, `getIntrusoData`, `getParejasData`, `getOrdenaHistoriasData`, `getDetectiveData`, `getComprensionData`

Solo crea datos propios si la mecánica lo exige y no se puede reutilizar nada existente.

### 3. Modos de juego (obligatorio)

**Tres niveles de dificultad** con la siguiente convención:

| Nivel | Nombre | Ayudas | Características |
|---|---|---|---|
| 🟢 **Fácil** | `easy` | **Muchas** | Menor cantidad de contenido, más vidas, pistas siempre visibles, comodines extra (el fácil tiene SIEMPRE alguna ayuda más que el medio) |
| 🟡 **Medio** | `medium` | **Algunas** | Cantidad media de contenido, vidas reducidas, pistas en botón |
| 🔴 **Examen (difícil)** | `exam` | **Sin ayudas tradicionales** | Mayor cantidad de contenido, 1 vida, timer si aplica, feedback al final |

**Reglas:**
- A mayor dificultad → más preguntas / palabras / elementos
- El **modo examen NO tiene ayudas de práctica** (nada de reintentos, comprobar, mostrar solución, saltar)
- Los **comodines tipo concurso** (50:50, pista definición, primera letra, mezclar banco, etc.) **sí pueden estar disponibles en examen**, pero limitados en número
- El modo examen envía `mode: 'test'` al tracker. Los modos fácil/medio envían `mode: 'practice'`

### 4. Botón de instrucciones (obligatorio)

Cada app debe tener un botón accesible para ver las instrucciones:

```jsx
import InstructionsModal, { InstructionsButton } from '../_shared/InstructionsModal';

// Estado
const [showHelp, setShowHelp] = useState(false);

// En la cabecera, junto al título:
<div className="mi-app-title">
  <span>🎮</span>
  <span>Mi App</span>
  <InstructionsButton onClick={() => setShowHelp(true)} />
</div>

// Al final del JSX (antes del </div> raíz):
<InstructionsModal
  isOpen={showHelp}
  onClose={() => setShowHelp(false)}
  title="Cómo jugar a Mi App"
>
  <h3>🎯 Objetivo</h3>
  <p>...</p>

  <h3>🕹️ Cómo se juega</h3>
  <ul><li>...</li></ul>

  <h3>🪄 Ayudas / Comodines</h3>
  <ul><li>...</li></ul>

  <h3>🎓 Modos de juego</h3>
  <div className="instr-modes">
    <div className="instr-mode easy"><strong>🟢 Fácil</strong>...</div>
    <div className="instr-mode medium"><strong>🟡 Medio</strong>...</div>
    <div className="instr-mode exam"><strong>🔴 Examen</strong>...</div>
  </div>

  <div className="instr-tips">
    <strong>💡 Consejo:</strong> ...
  </div>
</InstructionsModal>
```

El CSS del modal está en `_shared/InstructionsModal.css` y ya soporta `h3`, `ul`, `kbd`, `.instr-modes`, `.instr-mode.{easy,medium,exam}` y `.instr-tips`.

### 5. Estadísticas y gamificación (obligatorio)

Cada app debe llamar a la prop `onGameComplete` al terminar (win o lost), con este formato:

```js
onGameComplete?.({
  mode: 'practice' | 'test',      // 'test' para modo examen, 'practice' para el resto
  score: <número>,                  // puntos conseguidos
  maxScore: <número>,               // puntos máximos posibles
  correctAnswers: <número>,         // respuestas correctas
  totalQuestions: <número>,         // total de preguntas/items
  durationSeconds: <número>,        // segundos jugados (si hay timer)
});
```

Esto dispara automáticamente:
- Registro en `game_sessions` (Supabase) vía `track_session_finish`
- Cálculo de nota sobre 10
- Procesamiento de XP e insignias por `gamification_process_session` / `gamification_process_teacher_session`

**Reglas importantes:**
- Usa un `useRef(false)` + flag para asegurar que solo se llama UNA vez por partida
- En modo examen, llama `onGameComplete` una sola vez al final con el resultado global
- En modo práctica, puedes llamarlo al final de cada ronda si lo prefieres, pero siempre con `mode: 'practice'`

### 6. Props y parámetros

```jsx
const MiApp = ({ onGameComplete }) => {
  const { level, grade: gradeParam, subjectId } = useParams();
  const grade = useMemo(() => parseInt(gradeParam, 10), [gradeParam]);
  const asignatura = subjectId || (level === 'primaria' ? 'lengua' : 'general');
  // ...
};
```

Siempre lee `level`, `grade` y `subjectId` de `useParams()`. Pasa `asignatura` a los servicios.

### 7. Tema de asignatura (recomendado)

Para mostrar el nombre humano de la asignatura (ej. "Matemáticas" en vez de "matematicas"):

```jsx
import materiasData from '../../../public/data/materias.json';

const getSubjectInfo = (level, grade, subjectId) => {
  if (!level || !grade || !subjectId) return { nombre: '', icon: '📚' };
  const curso = materiasData?.[level]?.[String(grade)];
  if (!Array.isArray(curso)) return { nombre: '', icon: '📚' };
  const found = curso.find((m) => m.id === subjectId);
  return found || { nombre: '', icon: '📚' };
};

// En el componente:
const subjectInfo = useMemo(() => getSubjectInfo(level, grade, asignatura), [level, grade, asignatura]);
// Uso: {subjectInfo.icon} {subjectInfo.nombre}
```

### 8. Carga de datos (defensiva)

```jsx
useEffect(() => {
  let cancelled = false;
  setLoading(true);
  const load = async () => {
    try {
      const data = await getRoscoData(level, grade, asignatura);
      if (cancelled) return;
      // procesar data
    } catch (err) {
      console.error('MiApp: error cargando datos', err);
      if (!cancelled) setItems([]);
    } finally {
      if (!cancelled) setLoading(false);
    }
  };
  load();
  return () => { cancelled = true; };
}, [level, grade, asignatura]);
```

**Siempre `try/catch/finally`** para que `setLoading(false)` se ejecute sí o sí.

### 9. Registro en la app list

**Tres ficheros a tocar:**

**a) `src/apps/config/commonApps.js`** — importar y exportar:

```js
import MiApp from '../mi-app/MiApp';

export const appMiApp = {
  id: 'mi-app',
  name: '🎮 Mi App',
  description: 'Descripción corta que aparecerá en la tarjeta.',
  component: MiApp
};
```

**b) `src/apps/config/primariaApps.js`** — importar `appMiApp` y añadirlo a cada una de las listas de asignaturas. **Truco rápido:** puedes usar `Edit` con `replace_all: true` para insertar `appMiApp` justo después de otra app que ya esté en todas las listas:

```js
// Antes de la edición, el import ya debe incluir appMiApp
import {
  appMiApp,
  // ... resto
} from './commonApps';

// Luego replace_all de `appUsadaEnTodas,` por `appUsadaEnTodas, appMiApp,`
```

**c) `src/apps/config/esoApps.js`** — igual que primariaApps.js

**Verificación:** tras los cambios, comprueba que el número de ocurrencias coincide con las demás apps del catálogo (hay 55 listas en primariaApps y 67 en esoApps, contando el import).

### 10. Diseño y estética

- **Paleta**: usa gradientes violeta-rosa-ámbar por defecto, pero cada app puede tener su color principal propio (ej: crucigrama→azul/índigo, sopa de letras→verde/teal, millonario→dorado/navy)
- **Tipografía**: `system-ui, -apple-system, 'Segoe UI', sans-serif`
- **Card principal**: fondo `rgba(255, 255, 255, 0.88)` con `backdrop-filter: blur(12px)`, border-radius 24px, shadow multi-capa
- **Framer-motion** para transiciones suaves (`motion.div`, `AnimatePresence`, `layoutId` si hay elementos que se mueven)
- **Canvas-confetti** para celebrar victorias
- **Lucide-react** para iconos (consistente con el resto)
- **Responsive**: `@media (max-width: 720px)` ajustando grids a 1 columna, padding reducido y fuentes menores
- **Touch-friendly**: `touch-action: none` en grids interactivos para evitar scroll durante drag

### 11. Colores de los modos (convención del portal)

Al aplicar colores a los tabs de dificultad, mantén esta convención:

- **Fácil** (easy): verde `#10b981` → `#059669`
- **Medio** (medium): ámbar `#fbbf24` → `#f59e0b`
- **Examen** (exam): rojo `#ef4444` → `#dc2626`

### 12. Auto-verificación final

Antes de commitear:

```bash
npm run build
```

Debe terminar con `✓ built in ...s` sin errores. Los warnings de bundle size son aceptables.

---

## 🎯 Ejemplos de apps que ya cumplen esta guía

Todas las apps de la carpeta siguiente siguen esta estructura. **Úsalas como referencia**:

- `src/apps/ahorcado/` — 2 modos + modo examen con 5 preguntas
- `src/apps/crucigrama/` — 3 tamaños + modo examen grande
- `src/apps/sopa-de-letras/` — 3 tamaños + 8 direcciones
- `src/apps/millonario/` — 3 niveles + comodines 50:50/público/cambio
- `src/apps/anagramas/` — 3 niveles + tiles con layoutId + racha multiplicador

---

## 🧭 Comandos típicos

```bash
npm install           # Instalar dependencias
npm run dev           # Desarrollo local
npm run build         # Build de producción (obligatorio antes de commit)
npm run lint          # Lint (puede dar warnings preexistentes - centrarse en errores nuevos)
```

## 🗂️ Ficheros clave del proyecto

- `src/apps/config/commonApps.js` — Definición de todas las apps exportadas
- `src/apps/config/primariaApps.js` — Listas de apps por curso/asignatura de Primaria
- `src/apps/config/esoApps.js` — Listas de apps por curso/asignatura de ESO
- `src/services/gameDataService.js` — Servicios para obtener datos (rosco, frases, etc.)
- `src/hooks/useGameTracker.js` — Hook de tracking de sesiones (no tocar)
- `src/pages/AppRunnerPage.jsx` — Wrapper que monta cada app y conecta `onGameComplete`
- `src/apps/_shared/InstructionsModal.jsx` — Modal de instrucciones reutilizable
- `public/data/materias.json` — Catálogo de asignaturas con nombre humano e icono
