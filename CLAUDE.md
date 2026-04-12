# CLAUDE.md — Guia para crear apps en EduApps

> Este fichero se lee automaticamente en cada sesion. Consultar SIEMPRE antes de crear una app nueva.

Plataforma React + Vite de apps educativas para Primaria (1-6), ESO (1-4) y Bachillerato (1-2). Supabase como backend (auth, BD, RPCs). Estructura de la BD documentada en `DATABASE.md`.

---

## Checklist app nueva

### 1. Estructura
- Carpeta `src/apps/<nombre-app>/` (kebab-case)
- Componente: `<Nombre>.jsx` + Estilos: `<Nombre>.css`

### 2. Fuente de datos
Reutilizar datos existentes (ver `src/services/gameDataService.js`):

| Funcion | Devuelve | Apps que la usan |
|---|---|---|
| `getRoscoData(level, grade, asig)` | `[{letra, tipo, definicion, solucion, difficulty}]` | Rosco, Ahorcado, Crucigrama, Sopa, Millonario, Anagramas, Criptograma, Velocidad, Conecta Parejas, Dictado |
| `getRunnerData` | `{categoria: [palabras]}` | Runner, Memoria, Clasificador, Lluvia, Excavacion, Snake, Torre |
| `getIntrusoData` | `[{categoria, correctos, intrusos}]` | Busca el Intruso |
| `getParejasData` | `[{term_a, term_b}]` | Parejas de Cartas |
| `getOrdenaFrasesData` | `[frase, ...]` | Ordena la Frase |
| `getOrdenaHistoriasData` | `[[frase1..frase5], ...]` | Ordena la Historia |
| `getDetectiveData` | `[frase, ...]` | Detective de Palabras |
| `getComprensionData` | `[{title, text_content, questions}]` | Comprension Escrita/Oral |
| `getAppContent(tipo, level?, grade?)` | JSON variable | Mesa Crafteo, Terminal, Bloques, Personajes, Banco Tutoria |

### 3. Modos de juego

| Modo | Valor | Ayudas | Examen |
|---|---|---|---|
| Facil | `easy` | Muchas | No |
| Medio | `medium` | Algunas | No |
| Examen | `exam` → `mode:'test'` | Sin ayudas (comodines limitados OK) | Nota /10 + puntos |

**Excepciones validas:** Comprension (solo examen), Sopa/Crucigrama (practica+examen), Isla de la Calma/Banco Recursos/Generador Personajes (sin modos).

### 3.1. Nota /10 en examen (obligatorio)
```js
const nota = Math.round((correctAnswers / totalQuestions) * 100) / 10;
```
- Elemento mas prominente, coloreado (verde >=8, azul >=5, rojo <5)
- Mensaje: >=9 "Excelente", >=7 "Muy bien", >=5 "Aprobado", <5 "Necesitas repasar"

### 3.2. Puntos paralelos (obligatorio en examen)
Nota capada a 10 + puntos sin tope (tiempo, racha, bonus). Doble progresion.

### 3.3. Ranking (automatico)
Solo enviar `score` en `onGameComplete`. AppRunnerPage aplica multiplicador por curso (1.0-2.1) y guarda en `game_sessions` + `high_scores`. Ranking via RPC `get_app_ranking`.

### 4. Instrucciones
```jsx
import InstructionsModal, { InstructionsButton } from '../_shared/InstructionsModal';
```

### 5. onGameComplete (obligatorio)
```js
onGameComplete?.({ mode: 'practice'|'test', score, maxScore, correctAnswers, totalQuestions, durationSeconds });
```
Llamar UNA vez por partida (useRef flag). Dispara XP + insignias automaticamente.

### 6. Props y params
```jsx
const { level, grade: gradeParam, subjectId } = useParams();
const grade = useMemo(() => parseInt(gradeParam, 10), [gradeParam]);
const asignatura = subjectId || (level === 'primaria' ? 'lengua' : 'general');
```

### 7. Registro en config (3 ficheros)
1. `src/apps/config/commonApps.js` — definir `appMiApp = { id, name, description, component }`
2. `src/apps/config/primariaApps.js` — anadir a las listas de asignaturas
3. `src/apps/config/esoApps.js` — idem
4. `src/apps/config/bachilleratoApps.js` — anadir a `appsBase` (se hereda a todas las asignaturas)

### 8. Diseno
- Gradientes violeta-rosa-ambar (o color propio por app)
- Framer-motion, canvas-confetti, lucide-react
- Responsive: `@media (max-width: 720px)`
- Colores modos: verde `#10b981`, ambar `#fbbf24`, rojo `#ef4444`

### 9. Build
```bash
npm run build  # Debe pasar sin errores
```

---

## Ficheros clave

| Fichero | Proposito |
|---|---|
| `src/apps/config/commonApps.js` | Definicion de todas las apps |
| `src/apps/config/{primaria,eso,bachillerato}Apps.js` | Apps por curso/asignatura |
| `src/services/gameDataService.js` | Servicios de datos (RPCs Supabase) |
| `src/hooks/useGameTracker.js` | Tracking de sesiones (no tocar) |
| `src/hooks/useGamification.js` | XP, nivel, insignias del usuario |
| `src/pages/AppRunnerPage.jsx` | Wrapper que monta cada app |
| `src/apps/_shared/InstructionsModal.jsx` | Modal de instrucciones |
| `src/components/ui/RankingModal.jsx` | Modal de ranking |
| `src/components/ui/BadgeIcon.jsx` | 113 SVGs de insignias (64x64) |
| `src/components/GradeCardIcon.jsx` | SVGs de las tarjetas de la homepage |
| `src/pages/admin/DataExplorer.jsx` | Explorador de datos del admin |
| `src/pages/admin/DataStatsTable.jsx` | Tabla de cantidades de datos (13 fuentes) |
| `src/pages/admin/XPConfigPanel.jsx` | Catalogo de insignias y XP |
| `src/contexts/AuthContext.jsx` | Autenticacion (teacher/student/free/admin) |
| `src/contexts/ThemeContext.jsx` | Tema claro/oscuro (por usuario) |
| `public/data/materias.json` | Catalogo de asignaturas |
| `DATABASE.md` | Estructura completa de la BD (tablas, RPCs, insignias) |

---

## Comandos

```bash
npm install    # Dependencias
npm run dev    # Dev server
npm run build  # Build produccion
npm run lint   # Lint
```
