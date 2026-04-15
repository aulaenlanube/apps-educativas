# Base de datos — Estructura completa

> Generado automaticamente desde Supabase. Ultima actualizacion: 2026-04-12.

---

## Tablas (35)

### Contenido educativo

| Tabla | Descripcion | Columnas clave |
|---|---|---|
| `rosco_questions` | Preguntas del rosco (pasapalabra, ahorcado, crucigrama...) | `letter`, `type`, `definition`, `solution`, `subject_id`, `level`, `grades[]`, `difficulty` |
| `runner_categories` | Categorias con palabras (runner, snake, memoria...) | `subject_id`, `level`, `grades[]`, `category_name`, `words` (jsonb) |
| `intruso_sets` | Conjuntos de busca-el-intruso | `subject_id`, `level`, `grades[]`, `category`, `correct_items` (jsonb), `intruder_items` (jsonb) |
| `parejas_items` | Parejas de cartas | `subject_id`, `level`, `grades[]`, `term_a`, `term_b` |
| `ordena_frases` | Frases para ordenar | `subject_id`, `level`, `grades[]`, `sentence` |
| `ordena_historias` | Historias para ordenar (5 frases) | `subject_id`, `level`, `grades[]`, `sentences` (jsonb array) |
| `detective_sentences` | Frases para detective de palabras | `subject_id`, `level`, `grades[]`, `sentence` |
| `comprension_texts` | Textos de comprension lectora/oral | `subject_id`, `level`, `grades[]`, `title`, `text_content`, `questions` (jsonb) |
| `app_content` | Contenido especifico de apps (bloques, terminal, personajes...) | `app_type`, `subject_id`, `level`, `grades[]`, `content` (jsonb) |
| `subjects` | Catalogo de asignaturas por nivel/curso | `level`, `grade`, `subject_id`, `name`, `icon` |
| `jokes` | Chistes aleatorios | `text` |

### Usuarios

| Tabla | Descripcion | Columnas clave |
|---|---|---|
| `teachers` | Docentes (auth via Supabase Auth) | `id` (uuid, FK auth.users), `email`, `display_name`, `teacher_code`, `role` (teacher/admin/free), `avatar_emoji`, `avatar_color`, `quiz_battle_monthly_quota` |
| `students` | Alumnos (auth custom via RPC) | `id`, `group_id` (FK), `teacher_id` (FK), `username`, `password_hash`, `display_name`, `avatar_emoji`, `email`, `auth_user_id` |

### Grupos y comunicacion

| Tabla | Descripcion | Columnas clave |
|---|---|---|
| `groups` | Grupos de clase | `id`, `teacher_id` (FK), `name`, `group_code` (auto), `level`, `grade`, `subject_id` |
| `student_groups` | Relacion alumno-grupo (M:N) | `student_id` (FK), `group_id` (FK), `teacher_id` (FK) |
| `group_teachers` | Co-profesores de un grupo | `group_id` (FK), `teacher_id` (FK), `added_by` (FK) |
| `group_messages` | Chat de grupo | `group_id` (FK), `student_id` (FK), `sender_type`, `sender_id`, `sender_name`, `message` |
| `chat_read_status` | Ultimo mensaje leido por usuario | `user_type`, `user_id`, `group_id` (FK), `student_id` (FK), `last_read_at` |
| `user_notifications` | Notificaciones push in-app | `user_type`, `user_id`, `type`, `title`, `message`, `data` (jsonb), `read` |

### Tareas y evaluacion

| Tabla | Descripcion | Columnas clave |
|---|---|---|
| `assignments` | Tareas asignadas por docentes | `teacher_id` (FK), `group_id` (FK), `student_id` (FK), `app_id`, `app_name`, `min_score`, `title`, `due_date`, `level`, `grade`, `subject_id` |
| `game_sessions` | Registro de cada partida | `user_type`, `user_id`, `app_id`, `app_name`, `level`, `grade`, `subject_id`, `mode`, `score`, `max_score`, `correct_answers`, `total_questions`, `duration_seconds`, `nota` |
| `high_scores` | Mejores puntuaciones por combo | `user_id`, `user_type`, `app_id`, `level`, `grade`, `subject_id`, `score`, `nota`, `mode`, `group_id` |

### Quiz Battle

| Tabla | Descripcion | Columnas clave |
|---|---|---|
| `quiz_battle_sessions` | Resultados de batallas quiz | `room_code`, `user_type`, `user_id`, `display_name`, `rank`, `score`, `correct_answers`, `total_questions`, `level`, `grade`, `subject_id`, `player_count` |
| `quiz_templates` | Plantillas de preguntas (creadas por docentes) | `teacher_id` (FK), `name`, `questions` (jsonb), `question_count` |

### Gamificacion

| Tabla | Descripcion | Columnas clave |
|---|---|---|
| `badge_definitions` | Catalogo de insignias (alumnos + docentes) | `code` (unique), `category`, `name_es`, `description_es`, `icon`, `rarity` (common/rare/epic/legendary), `xp_reward`, `check_type`, `check_params` (jsonb), `sort_order` |
| `student_badges` | Insignias ganadas por alumnos | `student_id` (FK), `badge_id` (FK), `earned_at` |
| `teacher_badges` | Insignias ganadas por docentes | `teacher_id` (FK), `badge_id` (FK), `earned_at` |
| `student_xp` | XP y nivel del alumno | `student_id` (PK, FK), `total_xp`, `level` |
| `teacher_xp` | XP y nivel del docente | `teacher_id` (PK, FK), `total_xp`, `level` |
| `xp_log` | Historial XP alumno | `student_id` (FK), `xp_amount`, `source` (session/badge), `source_id` |
| `teacher_xp_log` | Historial XP docente | `teacher_id` (FK), `xp_amount`, `source`, `source_id` |
| `user_ranking_achievements` | Logros de ranking | `user_id`, `user_type`, `app_id`, `global_rank`, `class_rank` |

### Feedback y valoraciones

| Tabla | Descripcion | Columnas clave |
|---|---|---|
| `app_feedback` | Hilos de feedback sobre apps | `user_type`, `user_id`, `app_id`, `app_name`, `level`, `grade`, `subject_id`, `status` (open/resolved) |
| `app_feedback_messages` | Mensajes dentro de un hilo de feedback | `feedback_id` (FK), `sender_type`, `sender_id`, `sender_name`, `message` |
| `app_ratings` | Valoraciones numericas de apps | `user_type`, `user_id`, `app_id`, `level`, `grade`, `subject_id`, `rating` (1-5) |

---

## Relaciones (Foreign Keys)

```
teachers ──┬── groups (teacher_id)
           ├── students (teacher_id)
           ├── assignments (teacher_id)
           ├── group_teachers (teacher_id, added_by)
           ├── student_groups (teacher_id)
           ├── quiz_templates (teacher_id)
           ├── teacher_badges (teacher_id)
           ├── teacher_xp (teacher_id)
           └── teacher_xp_log (teacher_id)

groups ────┬── students (group_id)
           ├── student_groups (group_id)
           ├── group_teachers (group_id)
           ├── group_messages (group_id)
           ├── chat_read_status (group_id)
           └── assignments (group_id)

students ──┬── student_groups (student_id)
           ├── student_badges (student_id)
           ├── student_xp (student_id)
           ├── xp_log (student_id)
           ├── group_messages (student_id)
           ├── chat_read_status (student_id)
           └── assignments (student_id)

badge_definitions ──┬── student_badges (badge_id)
                    └── teacher_badges (badge_id)

app_feedback ── app_feedback_messages (feedback_id)
```

---

## Funciones RPC (93)

### Datos educativos
| Funcion | Argumentos |
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

### Estadisticas de datos (admin)
| Funcion | Argumentos |
|---|---|
| `get_data_stats` | — (devuelve tabla) |
| `get_data_stats_json` | — (devuelve jsonb) |
| `get_app_content_stats` | — (devuelve jsonb) |

### Autenticacion y usuarios
| Funcion | Argumentos |
|---|---|
| `handle_new_user` | — (trigger on auth.users) |
| `generate_teacher_code` | — |
| `generate_group_code` | — |
| `student_login` | `p_teacher_code, p_username, p_password` |
| `student_login_by_auth` | `p_auth_user_id` |
| `student_set_password` | `p_student_id, p_group_code, p_username, p_new_password` |
| `student_link_email` | `p_student_id, p_group_id, p_email` |
| `student_link_auth_user` | `p_student_id, p_group_id, p_auth_user_id, p_email` |
| `student_verify_email` | `p_student_id, p_code` |
| `student_confirm_email` | `p_auth_user_id` |
| `student_resend_verification` | `p_student_id` |
| `student_update_profile` | `p_student_id, p_group_id, p_avatar_emoji?, p_avatar_color?, p_new_password?, p_current_password?` |
| `reset_student_password` | `p_student_id` |
| `update_student_password` | `p_student_id, p_new_password` |
| `admin_create_admin_user` | `p_email, p_password, p_display_name` |

### Grupos y alumnos
| Funcion | Argumentos |
|---|---|
| `get_teacher_groups` | — (usa auth.uid) |
| `get_group_students` | `p_group_id` |
| `create_student` | `p_group_id, p_username, p_password?, p_display_name?, p_avatar_emoji?` |
| `create_students_bulk` | `p_group_id, p_usernames[]` |
| `student_join_group` | `p_student_id, p_group_code` |
| `student_get_my_groups` | `p_student_id` |
| `add_co_teacher` | `p_group_id, p_teacher_code` |
| `remove_co_teacher` | `p_group_id, p_teacher_id` |
| `is_owner_of_group` | `p_teacher_id, p_group_id` |
| `is_teacher_of_group` | `p_teacher_id, p_group_id` |

### Chat y mensajeria
| Funcion | Argumentos |
|---|---|
| `teacher_send_message` | `p_group_id, p_student_id, p_message` |
| `student_send_message` | `p_student_id, p_group_id, p_message` |
| `get_chat_messages` | `p_group_id, p_student_id?` |
| `student_get_chat_messages` | `p_student_id, p_group_id` |
| `teacher_get_chat_overview` | `p_group_id` |
| `student_count_unread_messages` | `p_student_id, p_group_id` |
| `get_user_notifications` | `p_user_id, p_limit?` |
| `mark_notifications_read` | `p_user_id, p_notification_ids[]?` |
| `count_unread_notifications` | `p_user_id` |
| `notify_group_quiz_battle` | `p_group_id, p_teacher_name, p_room_code, p_group_name` |

### Tareas
| Funcion | Argumentos |
|---|---|
| `student_get_assignments` | `p_student_id, p_group_id` |
| `teacher_get_assignments_progress` | `p_group_id` |

### Sesiones y puntuaciones
| Funcion | Argumentos |
|---|---|
| `track_student_session` | `p_student_id, p_app_id, p_app_name, p_level, p_grade, p_subject_id, p_mode?, p_score?, p_max_score?, p_correct_answers?, p_total_questions?, p_duration_seconds?, p_completed?, p_nota?` |
| `upsert_high_score` | `p_user_id, p_user_type, p_app_id, p_level?, p_grade?, p_subject_id?, p_score?, p_nota?, ...` |
| `get_high_score_ranking` | `p_app_id, p_level?, p_grade?, p_subject_id?, p_limit?` |
| `get_class_high_score_ranking` | `p_app_id, p_group_id, p_level?, p_grade?, p_subject_id?, p_limit?` |
| `get_app_ranking` | `p_app_id, p_level?, p_grade?, p_subject_id?, p_mode?, p_time_range?, p_scope?, p_limit?` |
| `get_user_rank` | `p_user_id, p_user_type, p_app_id, p_level?, p_grade?, p_subject_id?` |

### Gamificacion (XP + Insignias)
| Funcion | Argumentos |
|---|---|
| `calculate_level` | `p_xp` |
| `xp_for_level` | `p_level` |
| `gamification_process_session` | `p_student_id, p_session_mode, p_session_nota, p_session_duration, p_session_app_id` |
| `gamification_process_teacher_session` | `p_teacher_id, p_session_mode, p_session_nota, p_session_duration, p_session_app_id` |
| `gamification_check_teacher_actions` | `p_teacher_id` |
| `gamification_retroactive_calculate` | `p_student_id` |
| `gamification_retroactive_all` | — |
| `process_ranking_badges` | `p_user_id, p_user_type, p_app_id, p_level?, p_grade?, p_subject_id?, p_score?, p_group_id?` |
| `student_get_gamification` | `p_student_id, p_group_id?` |
| `teacher_get_gamification` | `p_teacher_id` |
| `admin_reset_gamification` | `p_user_id, p_user_type` |
| `student_get_dashboard` | `p_student_id, p_group_id` |
| `teacher_get_student_stats` | `p_student_id` |

### Quiz Battle
| Funcion | Argumentos |
|---|---|
| `save_quiz_battle_results` | `p_room_code, p_host_id, p_level, p_grade, p_subject_id, p_time_per_question, p_total_questions, p_players (jsonb)` |
| `get_teacher_quiz_battle_stats` | `p_teacher_id` |
| `get_student_quiz_battle_stats` | `p_student_id` |
| `get_teacher_quiz_battle_quota` | `p_teacher_id` |
| `get_teacher_quiz_templates` | `p_teacher_id` |
| `get_quiz_template` | `p_template_id, p_teacher_id` |
| `save_quiz_template` | `p_teacher_id, p_template_id, p_name, p_description, p_questions (jsonb)` |
| `delete_quiz_template` | `p_template_id, p_teacher_id` |

### Feedback y valoraciones
| Funcion | Argumentos |
|---|---|
| `create_feedback` | `p_user_type, p_user_id, p_user_display_name, p_app_id, p_app_name, p_level, p_grade, p_subject_id, p_message` |
| `get_user_feedbacks` | `p_user_type, p_user_id` |
| `get_feedback_messages` | `p_feedback_id, p_user_id?` |
| `user_reply_feedback` | `p_feedback_id, p_user_id, p_user_name, p_message` |
| `upsert_app_rating` | `p_user_type, p_user_id, p_app_id, p_level, p_grade, p_subject_id, p_rating` |
| `delete_app_rating` | `p_user_type, p_user_id, p_app_id, p_level, p_grade, p_subject_id` |
| `get_user_rating` | `p_user_type, p_user_id, p_app_id, p_level, p_grade, p_subject_id` |
| `get_app_avg_rating` | `p_app_id, p_level, p_grade, p_subject_id` |
| `get_bulk_avg_ratings` | `p_level, p_grade, p_subject_id` |
| `get_user_difficulty` | `p_user_type, p_user_id, p_app_id, p_level, p_grade, p_subject_id` |

### Admin
| Funcion | Argumentos |
|---|---|
| `admin_get_global_stats` | — |
| `admin_get_all_users` | — |
| `admin_get_users_paginated` | `p_page?, p_page_size?, p_filter?, p_search?` |
| `admin_get_user_sessions` | `p_user_id, p_user_type, p_limit?, p_offset?` |
| `admin_get_feedbacks` | `p_status?, p_page?, p_page_size?, p_search?` |
| `admin_reply_feedback` | `p_feedback_id, p_message` |
| `admin_resolve_feedback` | `p_feedback_id, p_message?` |
| `admin_get_difficulty_summary` | — |
| `admin_set_quiz_battle_quota` | `p_teacher_id, p_new_quota` |

---

## Insignias (121 total)

### Alumno (93 insignias)
| Categoria | Insignias | check_type |
|---|---|---|
| general | 9 (first_game → games_1000) | `completed_games` |
| exams | 8 (first_exam → exams_200) | `exam_passed` |
| mastery | 11 (perfect scores + distinct apps) | `perfect_score`, `perfect_distinct_apps` |
| exploration | 7 (apps_1 → apps_30) | `distinct_apps` |
| speed | 7 (speed_60s → speed_perf_10) | `speed_exam` |
| streaks | 9 (streak_2 → streak_100) | `streak_days` |
| dedication | 8 (time_30m → time_100h) | `total_time` |
| subjects | 5 (subjects_1 → subjects_10) | `distinct_subjects` |
| ranking | 20 (top10/top3/first global/class) | `ranking_top*`, `ranking_first*` |
| battle_rank | 8 (battle_win_1/3/5/10, battle_podium_1/3/5/10) | `battle_first_place`, `battle_podium` |

### Docente (28 insignias)
| Categoria | Insignias | check_type |
|---|---|---|
| teacher_groups | 4 (1 → 10 grupos) | `teacher_groups_created` |
| teacher_students | 4 (5 → 100 alumnos) | `teacher_students_added` |
| teacher_tasks | 5 (1 → 50 tareas) | `teacher_tasks_created` |
| teacher_battles | 4 (1 → 30 batallas) | `teacher_battles_created` |
| teacher_messages | 5 (1 → 100 mensajes) | `teacher_messages_sent` |
| teacher_platform | 4 (7 → 365 dias) | `teacher_days_active` |
| teacher_ratings | 2 (1 → 10 valoraciones) | `teacher_ratings_given` |

### Rarezas y XP
| Rareza | Color | XP rango |
|---|---|---|
| common | gris | 25-50 |
| rare | azul | 75-100 |
| epic | purpura | 150-200 |
| legendary | dorado | 300-500 |

### Niveles de XP
Formula: `XP = 100 * nivel^1.5` (redondeado)

| Nivel | XP necesario |
|---|---|
| 1 | 0 |
| 2 | 100 |
| 3 | 283 |
| 5 | 1118 |
| 10 | 3162 |
| 20 | 8944 |
| 50 | 35355 |
