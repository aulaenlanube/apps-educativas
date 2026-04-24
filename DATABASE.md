# Base de datos — Estructura completa

> Snapshot de la instancia de Supabase. Última actualización: 2026-04-24.
> 46 tablas · 150+ RPCs públicas · 128 insignias.

---

## Tablas (46)

### Contenido educativo

| Tabla | Descripción | Columnas clave |
|---|---|---|
| `rosco_questions` | Preguntas del rosco (pasapalabra, ahorcado, crucigrama, sopa, anagramas…) | `letter`, `type`, `definition`, `solution`, `subject_id`, `level`, `grades[]`, `difficulty` |
| `runner_categories` | Categorías con palabras (runner, snake, memoria, lluvia, excavación…) | `subject_id`, `level`, `grades[]`, `category_name`, `words` (jsonb) |
| `intruso_sets` | Conjuntos de busca-el-intruso | `subject_id`, `level`, `grades[]`, `category`, `correct_items` (jsonb), `intruder_items` (jsonb) |
| `parejas_items` | Parejas de cartas | `subject_id`, `level`, `grades[]`, `term_a`, `term_b` |
| `ordena_frases` | Frases para ordenar | `subject_id`, `level`, `grades[]`, `sentence` |
| `ordena_historias` | Historias para ordenar (5 frases) | `subject_id`, `level`, `grades[]`, `sentences` (jsonb array) |
| `detective_sentences` | Frases para detective de palabras | `subject_id`, `level`, `grades[]`, `sentence` |
| `comprension_texts` | Textos de comprensión lectora/oral | `subject_id`, `level`, `grades[]`, `title`, `text_content`, `questions` (jsonb) |
| `app_content` | Contenido específico de apps (bloques, terminal, personajes, banco recursos…) | `app_type`, `subject_id`, `level`, `grades[]`, `content` (jsonb) |
| `subjects` | Catálogo de asignaturas por nivel/curso | `level`, `grade`, `subject_id`, `name`, `icon` |
| `jokes` | Chistes aleatorios | `text` |

### Configuración de apps

| Tabla | Descripción | Columnas clave |
|---|---|---|
| `app_scoring_config` | Declara qué apps son "modo único" (todas las partidas cuentan para tareas/ranking) y cuáles tienen examen | `app_id` (PK), `single_mode`, `has_test_mode`, `notes` |

### Usuarios y autenticación

| Tabla | Descripción | Columnas clave |
|---|---|---|
| `teachers` | Docentes (auth vía Supabase Auth) | `id` (FK auth.users), `email`, `display_name`, `teacher_code`, `role` (`teacher`/`admin`/`free`), `avatar_emoji`, `avatar_color`, `timezone`, `quiz_battle_monthly_quota` |
| `students` | Alumnos (auth custom vía RPC) | `id`, `group_id` (FK), `teacher_id` (FK), `username`, `password_hash`, `display_name`, `avatar_emoji`, `email`, `auth_user_id` |
| `student_sessions` | Tokens de sesión del alumno | `token` (PK), `student_id`, `created_at`, `expires_at`, `last_used_at` |

### Grupos y comunicación

| Tabla | Descripción | Columnas clave |
|---|---|---|
| `groups` | Grupos de clase | `id`, `teacher_id`, `name`, `group_code` (auto), `level`, `grade`, `subject_id`, **`current_term`** (1/2/3 o NULL = auto por fecha) |
| `student_groups` | Relación alumno-grupo (M:N) | `student_id`, `group_id`, `teacher_id` |
| `group_teachers` | Co-profesores de un grupo | `group_id`, `teacher_id`, `added_by` |
| `group_class_hours` | Franjas horarias de clase del grupo | `group_id`, `weekday` (1-7 ISO), `start_time`, `end_time` |
| `group_messages` | Chat de grupo | `group_id`, `student_id`, `sender_type`, `sender_id`, `sender_name`, `message` |
| `chat_read_status` | Último mensaje leído por usuario | `user_type`, `user_id`, `group_id`, `student_id`, `last_read_at` |
| `user_notifications` | Notificaciones push in-app | `user_type`, `user_id`, `type`, `title`, `message`, `data` (jsonb), `read` |

### Tareas y evaluación

| Tabla | Descripción | Columnas clave |
|---|---|---|
| `assignments` | Tareas asignadas por docentes | `teacher_id`, `group_id`, `student_id` (NULL = a todo el grupo), `app_id`, `app_name`, `min_score`, `title`, `due_date`, `level`, `grade`, `subject_id`, `weight` (1-3), `term` (1/2/3), `assignment_type` (`standard`/`duel`), `duel_stake`, `duel_pair_id`, `duel_id` |
| `game_sessions` | Registro de cada partida | `user_type`, `user_id`, `app_id`, `app_name`, `level`, `grade`, `subject_id`, **`mode`** (`practice` / `test` / `duel`), `score`, `max_score`, `correct_answers`, `total_questions`, `duration_seconds`, `completed`, `nota` |
| `high_scores` | Mejores puntuaciones por combo | `user_id`, `user_type`, `app_id`, `level`, `grade`, `subject_id`, `score`, `nota`, `mode`, `group_id` |

> **Nota mode=`duel`**: no cuenta como intento de examen (`session_counts_for_task` solo acepta `test/hard/exam/difficult` o apps `single_mode`). Los duelos producen su propio ledger aparte (`duel_grade_ledger`).

### Duelos 1 vs 1

| Tabla | Descripción | Columnas clave |
|---|---|---|
| `duels` | Duelos entre alumnos | `id`, `challenger_id`, `opponent_id`, `teacher_id`, `group_id`, `app_id`, `app_name`, `level`, `grade`, `subject_id`, `stake`, `is_hidden`, `best_of`, `status` (`pending`/`accepted`/`in_progress`/`finished`/`void`), `winner_id`, `void_reason`, **`assignment_pair_id`** (NOT NULL → duelo-tarea), `accepted_at`, `started_at`, `finished_at` |
| `duel_rounds` | Rondas de un duelo (best-of-N) | `duel_id`, `round_index`, `winner_id`, `payload` (jsonb) |
| `duel_grade_ledger` | Historial de puntos ganados/perdidos | `student_id`, `duel_id`, `delta`, `reason` (`win`/`loss`/`recovery`), `game_session_id`, `created_at` |

### Quiz Battle

| Tabla | Descripción | Columnas clave |
|---|---|---|
| `quiz_battle_sessions` | Resultados de batallas | `room_code`, `user_type`, `user_id`, `display_name`, `rank`, `score`, `correct_answers`, `total_questions`, `level`, `grade`, `subject_id`, `player_count`, **`term`** |
| `quiz_battle_question_results` | Respuestas individuales por pregunta | `room_code`, `user_id`, `question_index`, `question_text`, `correct_text`, `answer_index`, `correct_index`, `is_correct`, `score_delta`, `response_time_ms` |
| `quiz_templates` | Plantillas de preguntas reutilizables | `teacher_id`, `name`, `questions` (jsonb), `question_count` |

### Robótica (Misiones + Laboratorio)

| Tabla | Descripción | Columnas clave |
|---|---|---|
| `robot_missions` | Catálogo de misiones | `slug`, `level`, `grade`, `kind`, `order_index`, `title`, `description`, `hint`, `grid` (jsonb), `start_dir`, `objectives` (jsonb), `suggested_blocks` (jsonb), `is_active` |
| `robot_reto_completions` | Retos completados por usuario | `user_id`, `user_type`, `mission_slug`, `grade`, `blocks_used`, `nota` |
| `robot_lab_designs` | Diseños del laboratorio de robótica | `user_id`, `user_type`, `name`, `components` (jsonb), `wires` (jsonb) |
| `robot_user_levels` | Niveles/retos creados por usuarios | `creator_type`, `creator_id`, `creator_name`, `title`, `description`, `world`, `level`, `grade`, `subject_id`, `shared`, `group_id`, `plays` |

### Gamificación (XP + insignias)

| Tabla | Descripción | Columnas clave |
|---|---|---|
| `badge_definitions` | Catálogo de insignias (alumnos + docentes) | `code` (unique), `category`, `name_es`, `description_es`, `icon`, `rarity` (common/rare/epic/legendary), `xp_reward`, `check_type`, `check_params` (jsonb), `sort_order` |
| `student_badges` | Insignias ganadas por alumnos | `student_id`, `badge_id`, `earned_at` |
| `teacher_badges` | Insignias ganadas por docentes | `teacher_id`, `badge_id`, `earned_at` |
| `student_xp` | XP y nivel del alumno | `student_id` (PK), `total_xp`, `level`, `updated_at` |
| `teacher_xp` | XP y nivel del docente | `teacher_id` (PK), `total_xp`, `level` |
| `xp_log` | Historial XP alumno | `student_id`, `xp_amount`, `source` (session/badge), `source_id` |
| `teacher_xp_log` | Historial XP docente | `teacher_id`, `xp_amount`, `source`, `source_id` |
| `user_ranking_achievements` | Logros de ranking registrados | `user_id`, `user_type`, `app_id`, `global_rank`, `class_rank` |

### Feedback y valoraciones

| Tabla | Descripción | Columnas clave |
|---|---|---|
| `app_feedback` | Hilos de feedback sobre apps | `user_type`, `user_id`, `app_id`, `app_name`, `level`, `grade`, `subject_id`, `status` (open/resolved) |
| `app_feedback_messages` | Mensajes dentro de un hilo | `feedback_id`, `sender_type`, `sender_id`, `sender_name`, `message` |
| `app_ratings` | Valoraciones numéricas de apps | `user_type`, `user_id`, `app_id`, `level`, `grade`, `subject_id`, `rating` (1-5) |

---

## Relaciones principales (FKs)

```
teachers ──┬── groups (teacher_id)
           ├── students (teacher_id)
           ├── assignments (teacher_id)
           ├── duels (teacher_id)
           ├── group_teachers (teacher_id, added_by)
           ├── student_groups (teacher_id)
           ├── quiz_templates (teacher_id)
           ├── teacher_badges (teacher_id)
           ├── teacher_xp (teacher_id)
           └── teacher_xp_log (teacher_id)

groups ────┬── students (group_id)
           ├── student_groups (group_id)
           ├── group_teachers (group_id)
           ├── group_class_hours (group_id)
           ├── group_messages (group_id)
           ├── chat_read_status (group_id)
           ├── duels (group_id)
           └── assignments (group_id)

students ──┬── student_groups (student_id)
           ├── student_sessions (student_id)
           ├── student_badges (student_id)
           ├── student_xp (student_id)
           ├── xp_log (student_id)
           ├── duels (challenger_id / opponent_id)
           ├── duel_grade_ledger (student_id)
           ├── group_messages (student_id)
           └── assignments (student_id, NULL = a todo el grupo)

duels ─────┬── duel_rounds (duel_id)
           └── duel_grade_ledger (duel_id)

badge_definitions ──┬── student_badges (badge_id)
                    └── teacher_badges (badge_id)

app_feedback ── app_feedback_messages (feedback_id)
```

---

## Cálculo de la nota

La nota del alumno en cada evaluación se calcula en `_compute_student_term_grades(p_student_id)` y se expone al frontend vía `student_get_grade_with_duel_bonus` (alumno) o `teacher_get_student_term_grades` (docente). Fórmula:

```
nota_evaluación = media_ponderada_tareas
                + bonus_batallas  (0..+0,5)
                + bonus_duelos    (-0,5..+0,5)
                + bonus_nivel     (0..+0,5)
                → clip [0, 10]
```

### Media de tareas
Se promedia por `weight`. Lo no intentado o no superado cuenta como 0.

### Bonus de batallas (Quiz Battle)
Score = 1·(1ᵒs) + 0,667·(2ᵒs) + 0,333·(3ᵒs).
`bonus = 0,5 · √(min(score, 10) / 10)` → tope +0,5 con 10 primeros puestos.

### Bonus de duelos
- **Duelos personales** (`duels.assignment_pair_id IS NULL`): ganador `+stake`, perdedor `−stake`. Suma de deltas del ledger → `personal_delta`.
- **Duelos-tarea** (`duels.assignment_pair_id IS NOT NULL`): el ganador suma **`+0,10`** fijo; el perdedor **no tiene entrada** en el ledger (sin penalización). La suma positiva de deltas se capa en `min(0,5, Σ delta_task)`.
- **Total** = `clamp(task_bonus + personal_delta, −0,5, +0,5)`.

### Bonus de nivel
`0,5 · √(min(level-1, 49) / 49)` → tope +0,5 al llegar a nivel 50.

### Asignación por evaluación
- Tareas: campo `assignments.term` (elegido por el profe al crear).
- Batallas: `quiz_battle_sessions.term` (elegido por el profe) o inferido por fecha de `created_at` si es NULL.
- Duelos: siempre inferido por la fecha del ledger (heurística `sep-dic → 1`, `ene-mar → 2`, `abr-ago → 3` en Europe/Madrid).
- Nivel: global (se aplica por igual a todas las evaluaciones).

### Evaluación "en curso"
`groups.current_term` (editable por el profesor desde el panel de grupo). Si es NULL se infiere por la fecha actual. El panel **Mi nota actual** del alumno muestra siempre los valores de la evaluación en curso.

---

## Funciones RPC (150+)

### Datos educativos
| Función | Argumentos |
|---|---|
| `get_rosco_data` | `p_level, p_grade, p_subject, p_max_difficulty` |
| `get_runner_data` | `p_level, p_grade, p_subject` |
| `get_intruso_data` | `p_level, p_grade, p_subject` |
| `get_parejas_data` | `p_level, p_grade, p_subject` |
| `get_ordena_frases_data` | `p_level, p_grade, p_subject` |
| `get_ordena_historias_data` | `p_level, p_grade, p_subject` |
| `get_detective_data` | `p_level, p_grade, p_subject` |
| `get_comprension_data` | `p_level, p_grade, p_subject` |
| `get_app_content` | `p_app_type, p_level?, p_grade?` |
| `get_subjects` | `p_level, p_grade` |
| `get_jokes` | — |
| `get_robot_missions` | `p_grade?, p_kind?` |
| `session_counts_for_task` | `p_app_id, p_mode` — ¿cuenta para tareas? |

### Autenticación
| Función | Argumentos |
|---|---|
| `handle_new_user` | trigger on `auth.users` |
| `generate_teacher_code` / `generate_group_code` | — |
| `student_login` | `p_teacher_code, p_username, p_password` |
| `student_login_email` / `student_login_by_auth` | — |
| `student_logout` | `p_session_token` |
| `student_set_password` / `student_update_profile` | — |
| `student_link_email` / `student_verify_email` / `student_confirm_email` / `student_resend_verification` / `student_link_auth_user` | Onboarding email opcional |
| `reset_student_password` / `update_student_password` | Admin/docente |
| `admin_create_admin_user` | `p_email, p_password, p_display_name` |
| `set_self_role_free` | Auto-conversión a usuario free |

### Grupos y horarios
| Función | Argumentos |
|---|---|
| `get_teacher_groups` | — |
| `teacher_create_group_with_hours` | `p_name, p_description, p_level, p_grade, p_subject_id, p_hours (jsonb[])` |
| `teacher_set_group_class_hours` | `p_group_id, p_hours` |
| `teacher_get_group_class_hours` | `p_group_id` |
| `teacher_group_can_run_now` | `p_group_id` — ¿estamos en franja de clase? |
| `get_group_students` / `get_group_public_info` | — |
| `create_student` / `create_students_bulk` | — |
| `student_join_group` / `student_get_my_groups` | — |
| `add_co_teacher` / `remove_co_teacher` / `is_owner_of_group` / `is_teacher_of_group` | — |

### Chat y notificaciones
| Función | Argumentos |
|---|---|
| `teacher_send_message` / `student_send_message` | — |
| `get_chat_messages` / `student_get_chat_messages` / `teacher_get_chat_overview` | — |
| `student_count_unread_messages` | — |
| `get_user_notifications` / `mark_notifications_read` / `count_unread_notifications` | — |
| `notify_group_quiz_battle` | Avisa al grupo cuando empieza una batalla |

### Tareas y notas
| Función | Argumentos |
|---|---|
| `student_get_assignments` | `p_student_id, p_group_id, p_session_token` |
| `teacher_get_assignments_progress` | `p_group_id` |
| `teacher_get_assignment_scores` | `p_assignment_id` |
| `teacher_update_assignment` / `teacher_delete_assignment` | — |
| `student_get_grade_with_duel_bonus` | `p_student_id, p_session_token` — **nota actual del alumno con los 3 bonus** |
| `teacher_get_student_term_grades` | `p_student_id` — versión docente |
| `student_get_final_grade` | — |

### Sesiones y puntuaciones
| Función | Argumentos |
|---|---|
| `track_session_start` / `track_session_finish` / `track_session_abandon` / `track_session_start_and_finish` | Flujo moderno (2 pasos) |
| `track_student_session` | Inserta una fila completa (fallback usado por `useGameTracker` tras la primera ronda) |
| `upsert_high_score` | `p_user_id, p_user_type, p_app_id, ...` |
| `get_high_score_ranking` / `get_class_high_score_ranking` / `get_app_ranking` / `get_user_rank` | — |

### Duelos 1 vs 1
| Función | Argumentos |
|---|---|
| `student_create_duel` | `p_student_id, p_session_token, p_opponent_id, p_app_id, ..., p_stake, p_best_of, p_is_hidden` |
| `student_accept_duel` / `student_reject_duel` / `student_start_duel` / `student_void_duel` | — |
| `student_report_duel_result` | Ganador reportado. Duelos-tarea → solo `+0,10` al ganador; personales → `±stake` |
| `student_get_duel_opponents` / `student_get_duels` / `student_get_duel_state` | Devuelven `is_task` para que la UI avise al retado |
| `student_apply_duel_debt_recovery` | Recuperar puntos perdidos jugando en solitario |
| `teacher_create_duel_assignment` | Empareja al grupo por nota similar y crea duelos + tareas ocultas |
| `teacher_get_group_duels` / `teacher_delete_duel` | — |

### Quiz Battle
| Función | Argumentos |
|---|---|
| `save_quiz_battle_results` | `p_room_code, p_host_id, p_level, p_grade, p_subject_id, p_time_per_question, p_total_questions, p_players (jsonb), p_term?, p_group_id?` — valida franja horaria si se pasa `p_group_id` |
| `save_quiz_battle_question_results` | Detalle por pregunta |
| `get_quiz_battle_detail` | — |
| `get_student_quiz_battle_stats` / `get_teacher_quiz_battle_stats` / `get_teacher_quiz_battle_quota` | — |
| `get_teacher_quiz_templates` / `get_quiz_template` / `save_quiz_template` / `delete_quiz_template` | — |
| `teacher_get_group_battles` / `teacher_delete_battle` | — |

### Gamificación
| Función | Argumentos |
|---|---|
| `calculate_level` / `xp_for_level` | Fórmula: `XP = 100 · nivel^1.5` |
| `gamification_process_session` / `gamification_process_teacher_session` | Procesa XP + insignias al terminar una partida |
| `gamification_process_battle` | Procesa Quiz Battle |
| `gamification_check_teacher_actions` | Chequea insignias docentes (grupos, tareas, mensajes…) |
| `gamification_retroactive_calculate` / `gamification_retroactive_all` | Recálculo completo |
| `process_ranking_badges` | Insignias de ranking (top 10 / top 3 / #1 global y clase) |
| `student_get_gamification` / `teacher_get_gamification` | Inventario de insignias + XP + nivel |
| `student_get_dashboard` | Stats agregadas del alumno (usado en el panel) |
| `teacher_get_student_stats` | Versión docente |
| `admin_reset_gamification` | — |

### Robótica
| Función | Argumentos |
|---|---|
| `record_robot_reto` | `p_mission_slug, p_grade, p_blocks_used, p_nota` |
| `save_robot_lab_design` / `list_robot_lab_designs` / `delete_robot_lab_design` | — |
| `robot_level_create` / `robot_level_update` / `robot_level_delete` / `robot_level_list_mine` / `robot_level_list_shared` / `robot_level_increment_plays` | Niveles creados por usuarios |

### Feedback y valoraciones
| Función | Argumentos |
|---|---|
| `create_feedback` / `get_user_feedbacks` / `get_feedback_messages` / `user_reply_feedback` | — |
| `upsert_app_rating` / `delete_app_rating` / `get_user_rating` / `get_app_avg_rating` / `get_bulk_avg_ratings` / `get_user_difficulty` | — |

### Admin
| Función | Argumentos |
|---|---|
| `admin_get_global_stats` / `admin_get_all_users` / `admin_get_users_paginated` / `admin_get_user_sessions` | — |
| `admin_get_groups` / `admin_get_group_detail` | — |
| `admin_get_feedbacks` / `admin_reply_feedback` / `admin_resolve_feedback` | — |
| `admin_get_difficulty_summary` / `admin_apps_mode_report` | — |
| `admin_set_quiz_battle_quota` / `admin_set_app_single_mode` / `admin_set_app_has_test_mode` | — |
| `get_data_stats` / `get_data_stats_json` / `get_app_content_stats` | Estadísticas de contenido educativo |

---

## Insignias (128 total)

### Alumnado (100 insignias)
| Categoría | N | check_type |
|---|---:|---|
| general | 9 | `completed_games` |
| exams | 8 | `exam_passed` |
| mastery | 11 | `perfect_score`, `perfect_distinct_apps` |
| exploration | 7 | `distinct_apps` |
| speed | 8 | `speed_exam` |
| streaks | 9 | `streak_days` |
| dedication | 8 | `total_time` |
| subjects | 5 | `distinct_subjects` |
| ranking | 20 | `ranking_top*`, `ranking_first*` |
| battle_rank | 11 | `battle_first_place`, `battle_podium`, `battle_played` |
| programacion | 4 | Retos de robótica |

### Docente (28 insignias)
| Categoría | N | check_type |
|---|---:|---|
| teacher_groups | 4 | `teacher_groups_created` |
| teacher_students | 4 | `teacher_students_added` |
| teacher_tasks | 5 | `teacher_tasks_created` |
| teacher_battles | 4 | `teacher_battles_created` |
| teacher_messages | 5 | `teacher_messages_sent` |
| teacher_platform | 4 | `teacher_days_active` |
| teacher_ratings | 2 | `teacher_ratings_given` |

### Rarezas y XP
| Rareza | Color | XP reward |
|---|---|---|
| common | gris | 25-50 |
| rare | azul | 75-100 |
| epic | púrpura | 150-200 |
| legendary | dorado | 300-500 |

### Niveles de XP
Fórmula: `XP_necesario = round(100 · nivel^1.5)`

| Nivel | XP |
|---:|---:|
| 1 | 0 |
| 2 | 100 |
| 3 | 283 |
| 5 | 1.118 |
| 10 | 3.162 |
| 20 | 8.944 |
| 50 | 35.355 |

---

## Convenciones y garantías

- **RLS activa en todas las tablas**. La UI jamás lee/escribe directamente una tabla crítica — siempre vía RPC `SECURITY DEFINER` que valida permisos.
- **Sesión de alumno**: cada RPC que actúa por un alumno requiere `(p_student_id, p_session_token)` y la valida con `_resolve_student_session`. El token se renueva en cada llamada (`last_used_at`).
- **Modos de `game_sessions`**: solo se permiten `practice`, `test` o `duel` (CHECK constraint). Solo `test` (o apps `single_mode`) cuentan para completar tareas.
- **Una fila por partida**: `useGameTracker` consume el `session_id` tras la primera `track_session_finish`; las siguientes rondas usan el fallback `track_student_session` (INSERT). Así cada partida queda como fila independiente y el `MAX(nota)` por app refleja el mejor intento real.
- **Timezone**: todas las operaciones de franja (batallas/duelos) y cálculo de evaluaciones por fecha usan `Europe/Madrid`.
