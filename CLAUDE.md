# CLAUDE.md — Guía para trabajar en EduApps

> Este fichero se lee automáticamente en cada sesión. Consultar SIEMPRE antes de crear una app nueva o tocar el sistema de notas/duelos.

Plataforma React + Vite con backend Supabase. Apps educativas para **Primaria (1º-6º)**, **ESO (1º-4º)**, **Bachillerato (1º-2º)** y **Atención a la Diversidad**. Producción en <https://apps-educativas.com>. Estructura completa de la BD documentada en [DATABASE.md](DATABASE.md).

---

## Checklist — crear una app nueva

### 1. Estructura
- Carpeta `src/apps/<nombre-app>/` (kebab-case).
- Componente: `<Nombre>.jsx` + estilos: `<Nombre>.css`.
- Reutiliza `_shared/` (Runner, RoscoUI, NumerosRomanosGame, TestScreen, etc.) si existe un patrón similar.

### 2. Fuente de datos
Reutiliza datos existentes (ver [src/services/gameDataService.js](src/services/gameDataService.js)):

| Función | Devuelve | Apps que la usan |
|---|---|---|
| `getRoscoData(level, grade, asig, maxDifficulty?)` | `[{letra, tipo, definicion, solucion, difficulty}]` | Rosco, Ahorcado, Crucigrama, Sopa, Millonario, Anagramas, Criptograma, Velocidad, Conecta Parejas, Dictado |
| `getRunnerData(level, grade, asig)` | `{categoria: [palabras]}` | Runner, Memoria, Clasificador, Lluvia, Excavación, Snake, Torre |
| `getIntrusoData` | `[{categoria, correctos, intrusos}]` | Busca el Intruso |
| `getParejasData` | `[{term_a, term_b}]` | Parejas de Cartas |
| `getOrdenaFrasesData` / `getOrdenaHistoriasData` | Frases / historias | Ordena la Frase, Ordena la Historia |
| `getDetectiveData` | Frases con palabras clave | Detective de Palabras |
| `getComprensionData` | `[{title, text_content, questions}]` | Comprensión Escrita/Oral |
| `getAppContent(tipo, level?, grade?)` | JSON libre | Mesa Crafteo, Terminal Retro, Bloques, Personajes, Banco Recursos |

### 3. Modos de juego

Estándar: tres niveles de dificultad en una pantalla de **selección previa** (no tabs durante la partida, porque cambiar de modo a mitad rompe el tracking).

| Modo | Valor interno | Ayudas | Nota → tarea |
|---|---|---|---|
| Fácil | `easy` | Muchas | No |
| Medio | `medium` | Algunas | No |
| Examen | `exam` → `mode: 'test'` | Sin/limitadas | Sí |

**Excepciones válidas**:
- Comprensión (solo examen).
- Sopa/Crucigrama (práctica + examen).
- Apps `single_mode` (registradas en `app_scoring_config` con `single_mode=true`): todas las partidas cuentan para tareas. Actualmente: Célula Animal, Célula Vegetal, Excavación Selectiva, Sistema Solar.
- Isla de la Calma, Banco de Recursos, Generador de Personajes, Laboratorio de Robótica: sin modos.

### 3.1. Nota /10 en examen (obligatorio)
```js
const nota = Math.round((correctAnswers / totalQuestions) * 100) / 10;
```
- Elemento más prominente del summary, con color (`>=8 verde`, `>=5 azul`, `<5 rojo`).
- Mensaje: `>=9 "Excelente"`, `>=7 "Muy bien"`, `>=5 "Aprobado"`, `<5 "Necesitas repasar"`.

### 3.2. Puntos paralelos (obligatorio en examen)
Nota capada a 10 + puntos sin tope (tiempo, racha, bonus por velocidad). La doble progresión evita que la nota tope a 10 quite motivación.

### 3.3. Ranking (automático)
Solo enviar `score` y `maxScore` en `onGameComplete`. `AppRunnerPage` aplica un multiplicador de curso (1.0-2.1) y guarda en `game_sessions` + `high_scores` vía `track_student_session` → `upsert_high_score`. El ranking se consulta con `get_app_ranking`.

### 4. Instrucciones y material de estudio
```jsx
import InstructionsModal, { InstructionsButton } from '../_shared/InstructionsModal';
```
Si la app se presta (vocabulario, glosario), añade también un botón **"Ver material de estudio"** que abra un modal con las palabras/términos agrupados por letra inicial (patrón en `Anagramas.jsx` y `RoscoUI.jsx`).

### 5. `onGameComplete` (obligatorio)
```js
onGameComplete?.({
  mode: 'practice' | 'test' | 'duel',
  score,
  maxScore,
  correctAnswers,
  totalQuestions,
  durationSeconds,
  nota?,   // opcional: override (si no se pasa, se calcula como correct/total · 10)
});
```
- Llama **UNA vez por partida terminada** protegido por un `useRef` flag.
- Dispara automáticamente XP + insignias + ranking via `useGameTracker` → `gamification_process_session`.
- **Mode `'duel'`** solo se usa cuando una partida forma parte de un duelo; no cuenta como intento de examen en la tarea. Ver sección duelos.

### 5.1. Tracking de sesión: una fila por partida
`useGameTracker` crea un `session_id` al montar la app (`track_session_start`). La primera `track_session_finish` actualiza esa fila y luego **consume el `session_id` (lo pone a null)**. Las siguientes rondas caen al fallback `track_student_session` (INSERT) — así cada partida queda como fila independiente y no se pisan entre sí. **No toques esta lógica sin pensarlo**: si vuelves a reutilizar el `session_id` a través de varias rondas, la última pisa a las anteriores y se pierde (pasó con Ahorcado en abril).

### 6. Props y params
```jsx
const { level, grade: gradeParam, subjectId } = useParams();
const grade = useMemo(() => parseInt(gradeParam, 10), [gradeParam]);
const asignatura = subjectId || (level === 'primaria' ? 'lengua' : 'general');
```

### 7. Registro en config (5 ficheros)
1. `src/apps/config/commonApps.js` — definir `appMiApp = { id, name, description, component }`.
2. `src/apps/config/primariaApps.js` — añadir a las listas de asignaturas.
3. `src/apps/config/esoApps.js` — idem.
4. `src/apps/config/bachilleratoApps.js` — añadir a `appsBase` (se hereda a todas las asignaturas).
5. Si tu app soporta duelo 1 vs 1, añádela también a `src/apps/config/duelableApps.js` con el componente Duel correspondiente.

### 8. Diseño
- Gradientes violeta-rosa-ámbar (o color propio por app).
- `framer-motion`, `canvas-confetti`, `lucide-react`.
- Responsive: `@media (max-width: 720px)`.
- Colores de modos: verde `#10b981`, ámbar `#fbbf24`, rojo `#ef4444`.

### 9. Build y deploy
```bash
npm run build   # debe pasar sin errores
npm run deploy  # produce dist/, empaqueta y sube a Hostinger vía SSH
```

---

## Sistema de nota y bonus (importantísimo)

La nota del alumno que ve en **Resumen** es la de la **evaluación en curso** (`groups.current_term` o inferida por fecha). Se compone de 4 partes, cada bonus capado:

```
nota_evaluación = base_tareas
                + bonus_duelos    (-0,5..+0,5)
                + bonus_batallas  ( 0..+0,5)
                + bonus_nivel     ( 0..+0,5)
                → clip [0, 10]
```

### Lo no intentado cuenta como 0
`_compute_student_term_grades` usa `COALESCE(best.best_nota, 0)` y promedia ponderando por `weight`. Las tareas sin intento o con nota inferior a `min_score` se incluyen en la media con su valor real (0 si no se intentó, la nota obtenida si se falló).

### Curvas de los 3 bonus (función √, concava)
- **Nivel**: `0,5 · √((nivel-1)/49)` → tope +0,5 en nivel 50.
- **Batallas**: score = `1·1ᵒs + 0,667·2ᵒs + 0,333·3ᵒs`, bonus = `0,5 · √(min(score, 10)/10)` → tope +0,5 con 10 primeros puestos.
- **Duelos**: dos fuentes combinadas (ver siguiente sección).

---

## Duelos 1 vs 1

Dos tipos, diferenciados por `duels.assignment_pair_id`:

### Duelo personal (`assignment_pair_id IS NULL`)
- Un alumno reta a otro con una apuesta (`stake`, normalmente 0,1 / 0,2 / 0,3 puntos).
- `student_report_duel_result`: ganador `+stake` en el ledger, perdedor `−stake`.
- Al perdedor se le crea "deuda" recuperable jugando en modo examen en solitario (`student_apply_duel_debt_recovery`).

### Duelo-tarea (`assignment_pair_id IS NOT NULL`)
- Creado por el docente con `teacher_create_duel_assignment`. Empareja al grupo por nota media similar y crea duelos ocultos + tareas.
- Al acabar: **solo el ganador** recibe una entrada en el ledger con `delta = +0,10` fijo. El perdedor **no tiene entrada** (sin penalización). El `stake` del profe se ignora.
- La UI del alumno (`DuelInbox`) usa el flag `is_task` devuelto por `student_get_duels` para mostrar el aviso correcto antes de aceptar ("+0,10 si ganas · sin penalización si pierdes").

### Suma al bonus de duelos
- `task_bonus = min(0,5, max(0, Σ deltas de entries is_task))` → tope +0,5 con 5 victorias-tarea.
- `personal_delta = Σ deltas de entries no-task` (con signo).
- `bonus_duelos_total = clamp(task_bonus + personal_delta, −0,5, +0,5)`.

### Modo `'duel'` en `game_sessions`
Las partidas lanzadas desde un Duel component (AhorcadoDuel, SnakeDuel, OrdenaBolasDuel, NavePalabrasDuel) guardan la sesión con `mode='duel'` para que **no cuenten como intento de examen** en la tarea. Solo el ledger dicta el resultado del duelo.

---

## Evaluación en curso (`groups.current_term`)

El profesor elige la evaluación activa desde **Editar grupo → Evaluación actual** (`Automática` / `1ª` / `2ª` / `3ª`). Si está en *Automática* se infiere por fecha:
- `sep-dic` → 1ª
- `ene-mar` → 2ª
- `abr-ago` → 3ª

La nota del panel **Resumen** del alumno y el desglose de la pestaña **Tareas** (cuando filtras por evaluación) se calculan solo con los datos de ese `term`. El bonus de nivel es global (igual para todas).

---

## Autenticación y sesión

- **Docentes/admin/free**: Supabase Auth estándar. `useAuth` expone `user`, `isTeacher`, `isFreeUser`.
- **Alumnos**: login custom vía `student_login(teacher_code, username, password)` que devuelve un `session_token`. Cada RPC que actúa por el alumno requiere `(p_student_id, p_session_token)` y lo valida con `_resolve_student_session` (que hace `UPDATE last_used_at`). **Importante**: las RPCs que llaman a `_resolve_student_session` deben ser `VOLATILE` (no `STABLE`), si no PostgREST las enruta a transacción read-only y el UPDATE falla con *"cannot execute UPDATE in a read-only transaction"*.

---

## Ficheros clave

| Fichero | Propósito |
|---|---|
| `src/apps/config/commonApps.js` | Definición de todas las apps |
| `src/apps/config/{primaria,eso,bachillerato}Apps.js` | Apps por curso/asignatura |
| `src/apps/config/duelableApps.js` | Apps con duelo 1 vs 1 |
| `src/services/gameDataService.js` | Wrappers RPC de contenido educativo |
| `src/services/duelService.js` | Wrappers RPC de duelos |
| `src/hooks/useGameTracker.js` | Tracking de sesiones (OJO: ver sección 5.1) |
| `src/hooks/useGamification.js` | XP, nivel, insignias del usuario |
| `src/hooks/useDuel.js` / `useDuelChannel.js` / `useIncomingDuels.js` | Duelos en tiempo real |
| `src/pages/AppRunnerPage.jsx` | Wrapper que monta cada app, inicia sesión, procesa resultado |
| `src/apps/_shared/InstructionsModal.jsx` | Modal de instrucciones |
| `src/components/duel/DuelGradePanel.jsx` | Panel "Mi nota actual" con los 3 bonus |
| `src/components/duel/DuelInbox.jsx` | Bandeja de duelos entrantes/salientes |
| `src/components/ui/RankingModal.jsx` | Modal de ranking |
| `src/components/ui/BadgeIcon.jsx` | SVGs de las 128 insignias (64x64) |
| `src/pages/dashboard/GroupsPanel.jsx` | Grupos + selector de evaluación actual |
| `src/pages/dashboard/StudentDashboard.jsx` | Panel del alumno (Resumen, Tareas, Logros, Mensajes, Apps, Historial, Comentarios, Perfil) |
| `src/pages/dashboard/AssignTaskDialog.jsx` | Crear tarea (estándar o duelo) |
| `src/pages/admin/*` | Panel de admin |
| `src/contexts/AuthContext.jsx` | Autenticación (teacher/student/free/admin) |
| `src/contexts/ThemeContext.jsx` | Tema claro/oscuro (por usuario) |
| `public/data/materias.json` | Catálogo de asignaturas |
| `tools/deploy.mjs` | Script de deploy a Hostinger |
| `DATABASE.md` | Estructura completa de la BD (46 tablas, 150+ RPCs, 128 insignias) |

---

## Comandos

```bash
npm install        # Dependencias
npm run dev        # Dev server
npm run build      # Build de producción
npm run lint       # Lint
npm run test       # Vitest (tests de seguridad)
npm run deploy     # Build + scp a Hostinger (tests como gate)
```

---

## Avisos rápidos (aprendido a la mala)

- **No pongas `STABLE` en RPCs de alumno** — si tocan `_resolve_student_session` la transacción es read-only y el UPDATE peta.
- **No reutilices `session_id` entre rondas** dentro de la misma app; cada partida es una fila en `game_sessions` (ya gestionado por `useGameTracker`).
- **`mode='test'` bogus en Duel components** ya corregido: ahora usan `mode='duel'`. Si creas un Duel component nuevo, usa ese valor, nunca `'test'` con ceros.
- **Examen Anagramas**: 10 palabras, 30 s por palabra, sin vidas. Si el alumno abandona a medias, `onGameComplete` dispara igualmente en el cleanup para que la nota parcial (aciertos/5·10) quede registrada.
- **Selector de dificultad**: siempre en pantalla previa antes de jugar. Si pones tabs arriba del tablero, cambiar de modo reinicia la partida y rompe el conteo.
