# Seguridad — estado final

Resultado de auditar y endurecer el proyecto Supabase `qzkmllwgwlrlcbiqtknj`.

## Advisors de seguridad

| Lint                                   | Antes | Final |
|----------------------------------------|-------|-------|
| `function_search_path_mutable`         | 3     | 0     |
| `rls_policy_always_true`               | 1     | 0     |
| `rls_enabled_no_policy` (INFO)         | 0     | 1     |

El unico lint restante es **INFO** y corresponde a la tabla
`public.student_sessions`: tiene RLS habilitada y **ninguna policy** a
proposito, porque solo las funciones `SECURITY DEFINER` acceden a ella.

## Migraciones aplicadas

### Primera pasada (guards + clamps)
1. `security_set_self_role_free_rpc`
2. `security_harden_student_link_auth_user`
3. `security_clamp_admin_get_user_sessions` (H-15)
4. `security_fix_function_search_path`
5. `security_quiz_battle_insert_sanity`

### Segunda pasada (sesion custom para alumnos)
6. `security_student_sessions_infra` — tabla `student_sessions` (token
   opaco de 43 chars, TTL 60 dias, RLS sin policies), helpers internos
   `_issue_student_session` / `_resolve_student_session`, y RPC publica
   `student_logout(p_session_token)`.
7. `security_student_login_rpcs_issue_token` — `student_login`,
   `student_login_by_auth`, `student_login_email`, `student_set_password`
   emiten un `session_token` en el JSON de respuesta.
   `student_login_by_auth` ademas exige `auth.uid() = p_auth_user_id`.
8. `security_student_rpcs_require_session_token_part1..3` — anaden
   `p_session_token` obligatorio a **todas** las RPCs protegidas
   (`student_get_dashboard`, `student_get_assignments`,
   `student_get_gamification`, `student_get_chat_messages`,
   `student_send_message`, `student_get_my_groups`, `student_join_group`,
   `student_update_profile`, `student_link_email`,
   `student_resend_verification`, `student_verify_email`,
   `student_count_unread_messages`). Cada RPC resuelve el `student_id`
   desde el token via `_resolve_student_session()` y rechaza si no
   coincide con `p_student_id`. `student_confirm_email` ahora exige
   `auth.uid() = p_auth_user_id`.

## Cliente

- `AuthContext.jsx` captura `session_token` en todos los flujos de login y
  lo persiste en `sessionStorage` dentro del objeto `student`.
- `signOut()` llama a `student_logout(p_session_token)` antes de limpiar.
- Todas las llamadas a RPCs protegidas (StudentChatTab, StudentDashboard,
  StudentProfileEditor, useGamification, GroupSelector) envian
  `p_session_token: student.session_token`.

## Modelo de amenaza actual

Antes: conocer el UUID de otro alumno bastaba para leer su dashboard,
mandar mensajes en su nombre, cambiarle el avatar, etc.

Ahora:
- El `student_id` ya no es autenticador: hace falta un `session_token`
  valido emitido en login y ligado al mismo `student_id`.
- Los tokens caducan a los 60 dias desde el ultimo login. Logout los borra.
- La tabla `student_sessions` no tiene policies publicas: solo se lee y
  escribe desde funciones `SECURITY DEFINER`.
- `admin_*` siguen con guard `auth.uid() + role='admin'`.
- `teachers_update_own` policy evita cambios de rol (solo teacher->free).
- `auth.uid() = p_auth_user_id` en las RPCs que ligan cuentas Supabase.

## Advisors: detalle `rls_enabled_no_policy` (esperado)

`public.student_sessions` tiene RLS activa sin policies **a proposito**.
Si en el futuro cambia el diseno y se quisiera acceso directo desde el
cliente, habria que anadir policies explicitas.

## Pendientes fuera de BD

- **H-22** — workflow `gitleaks` en CI (no se ha tocado CI en esta pasada).
- **H-24** — documentar la lista completa de policies en `DATABASE.md`.
