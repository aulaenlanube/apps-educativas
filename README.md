# EduApps — Apps educativas interactivas para primaria y secundaria

Plataforma web gratuita con **más de 100 apps educativas** para **Primaria (1º-6º)**, **ESO (1º-4º)**, **Bachillerato (1º-2º)** y **Atención a la Diversidad**. Cada app es un mini-juego diseñado para reforzar contenidos curriculares; todas comparten un sistema común de modos de dificultad, nota sobre 10, gamificación y evaluación.

Producción: <https://apps-educativas.com>

---

## ✨ Qué incluye

### Para el alumnado
- **Catálogo por curso y asignatura**: al entrar eliges nivel → curso → asignatura → app.
- **Tres modos por app**: Fácil · Medio · Examen. Solo el modo Examen cuenta para completar tareas asignadas por el profesor.
- **Mi panel**: estadísticas, logros, tareas por evaluación, chat con el profe, historial, comentarios y perfil.
- **Nota actual por evaluación** con desglose: base (tareas) + bonus de duelos + bonus de batallas + bonus de nivel. Cada bonus está capado en ±0,5.
- **XP, niveles e insignias**: XP por partida, 124 insignias desbloqueables, nivel 1 → 50 con curva progresiva.
- **Duelos 1 vs 1 entre alumnos**: reto personal con apuesta de nota, o duelo asignado por el profe (ganador +0,10 al bonus, perdedor sin penalización).
- **Quiz Battle en directo** estilo Kahoot: el docente monta una sala, los alumnos se unen con código y compiten en tiempo real.

### Para el profesorado
- **Grupos de clase** con código de unión, co-profesorado, horario de clase (los duelos/batallas solo se hacen dentro de la franja) y selector de evaluación en curso.
- **Panel de grupo**: lista de alumnos, estadísticas de cada uno, feedback sobre apps, insignias conseguidas, tareas activas.
- **Tareas**: asigna una app concreta al grupo o a un alumno con nota mínima, peso (x1-x3), fecha límite y evaluación. Dos tipos de tarea: **estándar** (jugar en modo examen y pasar la nota mínima) o **duelo 1 vs 1** (se empareja al grupo automáticamente por nota similar).
- **Chat**: mensajes grupales (anuncios) o privados con cada alumno.
- **Quiz Battle**: crea plantillas reutilizables de preguntas o lanza batallas con preguntas generadas desde los datos de la asignatura.
- **Gamificación propia**: insignias de docente por crear grupos, asignar tareas, dar feedback, etc.

### Rol free
- Usuario registrado sin grupo asignado. Puede jugar y recibir XP/insignias pero no participa en tareas ni ranking de clase.

### Admin
- Panel para ver métricas globales, estadísticas de datos, gestión de usuarios y feedback, catálogo de insignias/XP, exploración directa de datos.

---

## 🧱 Arquitectura

Aplicación **SPA React + Vite** con backend **Supabase**. El contenido educativo vive íntegramente en Postgres (no en ficheros JSON). La plataforma se sirve como estático desde Hostinger; las llamadas al backend se hacen directas a Supabase desde el navegador via `@supabase/supabase-js`.

```
┌─────────────────────────┐         ┌──────────────────────────────────┐
│  apps-educativas.com    │         │  qzkmllwgwlrlcbiqtknj.supabase.co │
│  (Hostinger · estático) │◀──RPCs──▶  · Postgres (35 tablas)           │
│   React + Vite bundle   │         │  · Auth (teacher/admin)           │
└─────────────────────────┘         │  · RLS + 93 RPCs públicas         │
                                    │  · Realtime channels (duelos)     │
                                    └──────────────────────────────────┘
```

- **Auth**: Supabase Auth para docentes/admin/free. Los alumnos usan un esquema propio (login por `teacher_code + username + password` → devuelve un `session_token` que se renueva en cada RPC).
- **RLS + RPCs `SECURITY DEFINER`**: la UI jamás escribe directa en tablas — todo pasa por RPCs que validan permisos. Ver [DATABASE.md](DATABASE.md) para el catálogo completo.
- **Realtime**: canales Supabase Realtime para sincronizar rondas de duelos 1 vs 1 y salas de Quiz Battle.
- **Despliegue**: `npm run deploy` → tests de seguridad → build → tar de `dist/` → scp a Hostinger → swap atómico de `public_html` (mantiene 2 rollbacks).

---

## 🧩 Sistema de apps

Cada app vive en `src/apps/<nombre>/` con su componente JSX y su CSS. Todas siguen el mismo contrato:

1. **Leen contenido** vía `gameDataService.js` (RPCs `get_rosco_data`, `get_runner_data`, `get_app_content`, etc.).
2. **Llaman a `onGameComplete({ mode, score, maxScore, correctAnswers, totalQuestions, durationSeconds, nota? })`** al terminar la partida — una sola vez, protegido por un ref para evitar dobles envíos.
3. **Se registran** en `src/apps/config/commonApps.js` y se asignan a los cursos/asignaturas correspondientes en `primariaApps.js`, `esoApps.js`, `bachilleratoApps.js`.

`AppRunnerPage.jsx` envuelve cada app: inicia la sesión (`track_session_start`), trackea el resultado, aplica el multiplicador de dificultad por curso al score de ranking y dispara XP, insignias y ranking al terminar.

### Fuentes de datos

| Función del servicio | Qué devuelve | Apps que la usan |
|---|---|---|
| `getRoscoData` | `[{letra, tipo, definicion, solucion, difficulty}]` | Rosco, Ahorcado, Crucigrama, Sopa, Millonario, Anagramas, Criptograma, Velocidad, Conecta Parejas, Dictado |
| `getRunnerData` | `{categoria: [palabras]}` | Runner, Memoria, Clasificador, Lluvia, Excavación, Snake, Torre |
| `getIntrusoData` | `[{categoria, correctos, intrusos}]` | Busca el Intruso |
| `getParejasData` | `[{term_a, term_b}]` | Parejas de Cartas |
| `getOrdenaFrasesData` / `getOrdenaHistoriasData` | Frases / historias | Ordena la Frase, Ordena la Historia |
| `getDetectiveData` | Frases con palabras clave | Detective de Palabras |
| `getComprensionData` | `[{title, text_content, questions}]` | Comprensión Escrita/Oral |
| `getAppContent(tipo)` | JSON libre por app | Mesa Crafteo, Terminal Retro, Bloques, Personajes, Banco Recursos |

---

## 🏆 Nota y gamificación

La nota del alumno en el panel **Resumen** es la de la **evaluación en curso** (el profesor la fija en el grupo o se infiere por fecha). Se calcula así:

```
nota_evaluación = media_tareas  +  bonus_duelos  +  bonus_batallas  +  bonus_nivel
                                  (±0,5 c/u)    (+0,5 máx)       (+0,5 máx)
                        ↓ clip [0, 10]
```

- **Tareas**: media ponderada por peso de las tareas de la evaluación. Lo no intentado cuenta como 0.
- **Duelos**:
  - Personales → se apuesta stake (ganador `+stake`, perdedor `−stake`).
  - Tarea → ganador `+0,10` al bonus (tope +0,5 en 5 victorias), perdedor sin penalización.
  - Total capado en `[-0,5, +0,5]`.
- **Batallas** (Quiz Battle): score = 1·1ᵒs + 0,67·2ᵒs + 0,33·3ᵒs, `bonus = 0,5 · √(min(score,10)/10)` → tope +0,5 con 10 primeros puestos.
- **Nivel de progreso**: `0,5 · √((nivel-1)/49)` → tope +0,5 al llegar a nivel 50.

El bonus por **nivel** es global (no por evaluación); duelos y batallas se asignan a evaluación por fecha (`sep-dic → 1ª`, `ene-mar → 2ª`, `abr-ago → 3ª` en zona Europa/Madrid).

---

## 🛠️ Stack

- **Frontend**: React 18 + Vite, React Router, Framer Motion, canvas-confetti, lucide-react, shadcn/ui (Radix), Tailwind CSS + CSS vanilla por app.
- **Backend**: Supabase (Postgres 17, Auth, Realtime, Storage).
- **Testing**: Vitest (tests de seguridad como gate del deploy).
- **CI/deploy**: script Node en `tools/deploy.mjs` — SSH end-to-end a Hostinger sin File Manager ni FTP.
- **Analytics**: Google Analytics 4 con Consent Mode v2 (RGPD).

---

## 🗂️ Estructura del proyecto

```
src/
  apps/                    # 100+ apps educativas (1 carpeta por app)
    _shared/               # Componentes reutilizables (Runner, RoscoUI, NumerosRomanos...)
    config/                # commonApps.js, primariaApps.js, esoApps.js, bachilleratoApps.js, duelableApps.js
    rosco/, ahorcado/, snake/, quiz-battle/, ...
  components/
    duel/                  # DuelCreateModal, DuelInbox, DuelGradePanel
    layout/                # Header, Footer, ...
    ui/                    # shadcn primitives + RankingModal, BadgeIcon, GradeCardIcon...
  contexts/                # AuthContext, ThemeContext, ToastContext
  hooks/                   # useGameTracker, useGamification, useDuel, useIncomingDuels, useDuelChannel...
  pages/
    admin/                 # Panel de admin (stats, insignias, feedback, usuarios)
    dashboard/              # Panel docente + panel alumno (grupos, tareas, chat, logros...)
    legal/                 # Privacy policy, cookies
    AppRunnerPage.jsx      # Wrapper que monta y traquea cada app
    HomePage.jsx, LoginPage.jsx, SubjectPage.jsx, ...
  services/                # gameDataService, duelService (wrappers RPC)
  lib/                     # supabase client, utils
public/
  data/materias.json       # Catálogo de asignaturas por nivel/curso
  images/                  # Assets
tools/
  deploy.mjs               # Script de deploy end-to-end a Hostinger
```

Documentación adicional:
- [CLAUDE.md](CLAUDE.md) — guía para crear apps nuevas (estructura, hooks obligatorios, registro).
- [DATABASE.md](DATABASE.md) — estructura completa de la BD: 35 tablas, 93+ RPCs, 124 insignias.

---

## 🚀 Ejecutar en local

Requisitos: Node 18+, variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en `.env.local`.

```bash
npm install
npm run dev          # servidor de desarrollo en http://localhost:5173
npm run build        # build de producción en dist/
npm run lint
npm run test         # vitest (tests de seguridad)
```

---

## 📦 Despliegue

El deploy es un único comando que requiere un alias SSH `hostinger-wp` configurado en `~/.ssh/config`:

```bash
npm run deploy
```

El script:
1. Ejecuta los tests de seguridad (`src/__tests__/security.test.js`). Si fallan, aborta.
2. Hace `npm run build`.
3. Empaqueta `dist/` en `dist.tar.gz`.
4. `scp` al servidor y extrae en `public_html.new/`.
5. Swap atómico: mueve el `public_html` anterior a `public_html.old-YYYYMMDD-HHMM` y renombra `public_html.new` → `public_html`.
6. Mantiene los 2 rollbacks más recientes.

Rollback manual:
```bash
ssh hostinger-wp 'cd domains/apps-educativas.com && rm -rf public_html && mv public_html.old-YYYYMMDD-HHMM public_html'
```

---

## 📝 Licencia y autoría

Hecho por **Edu Torregrosa**. Código del cliente en este repositorio; los datos educativos y la lógica de backend viven en la instancia de Supabase asociada al proyecto.
