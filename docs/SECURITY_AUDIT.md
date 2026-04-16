# Auditoría de Seguridad — EduApps

**Fecha:** 16 de abril de 2026
**Repositorio:** `aulaenlanube/apps-educativas`
**Rama auditada:** `claude/security-audit-report-H9ntm`
**Stack:** React 18 + Vite + Supabase (Auth, BD PostgreSQL, RPCs)
**Alcance:** auditoría completa del frontend, configuración, contratos con Supabase y plugin de editor visual.

---

## 1. Resumen ejecutivo

El proyecto sigue varias buenas prácticas de seguridad: no hay credenciales hardcodeadas, las variables `VITE_*` se usan correctamente, las sesiones de alumno viven en `sessionStorage`, no se utilizan `eval`, `new Function` ni `dangerouslySetInnerHTML` en `src/`, React escapa todo el contenido renderizado por defecto, y existe una suite de tests automáticos en `src/__tests__/security.test.js` que valida varias de estas prácticas.

El **mayor riesgo** del proyecto **no está en el código JavaScript**, sino en la **dependencia exclusiva de validaciones cliente** para autorización (rol `admin`, `teacher`, `student`). Si las RPCs de Supabase y las RLS policies no validan `auth.uid()` y el rol del llamador, varios escenarios críticos son explotables: auto-promoción a `admin`, lectura/modificación de datos de otros usuarios, reset de gamificación de cualquier cuenta, y manipulación de cuotas. Estos hallazgos están marcados como **CRÍTICA** en este informe y deben verificarse contra el SQL real de cada RPC.

Adicionalmente, el plugin `plugins/visual-editor/edit-mode-script.js` contiene dos vulnerabilidades **CRÍTICAS** de XSS / postMessage (asignación a `innerHTML` y listener de `message` sin validar `event.origin`), pero su explotabilidad real depende de en qué contexto se carga ese script.

### Conteo de hallazgos

| Severidad | Nº |
|---|---|
| CRÍTICA | 5 |
| ALTA    | 4 |
| MEDIA   | 7 |
| BAJA    | 5 |
| INFO    | 4 |

---

## 2. Tabla resumida de hallazgos

| # | Severidad | Categoría | Título | Ubicación |
|---|---|---|---|---|
| H-01 | CRÍTICA | AuthZ | Validación de roles solo client-side en `ProtectedRoute` | `src/components/auth/ProtectedRoute.jsx`, `src/main.jsx` |
| H-02 | CRÍTICA | AuthZ | Posible auto-promoción a `admin` mediante `update` directo a `teachers` | `src/contexts/AuthContext.jsx:112-121` |
| H-03 | CRÍTICA | AuthZ | RPCs admin invocables sin validación server-side documentada | `src/pages/admin/*` |
| H-04 | CRÍTICA | XSS | `popupElement.innerHTML = ...` con datos provenientes de `postMessage` | `plugins/visual-editor/edit-mode-script.js:48,221` |
| H-05 | CRÍTICA | XSS | `window.addEventListener('message', ...)` sin validar `event.origin` | `plugins/visual-editor/edit-mode-script.js:311-321` |
| H-06 | ALTA | AuthZ | `student_link_email` / `student_set_password` deben validar pertenencia | DATABASE.md (RPCs) |
| H-07 | ALTA | AuthZ | Cambios sensibles (`admin_set_quiz_battle_quota`, reset XP) sin doble check | `src/pages/admin/UserDetail.jsx` |
| H-08 | ALTA | Net | `fetch` directo a Supabase con `apikey`/`Authorization` redundantes | `src/hooks/useGameTracker.js:241-245` |
| H-09 | ALTA | Headers | Faltan CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy | `index.html`, hosting |
| H-10 | MEDIA | Validación | `bio` (textarea) sin validación server-side robusta | `src/pages/auth/ProfilePage.jsx:308-313` |
| H-11 | MEDIA | Validación | Bulk create de alumnos sin regex de username | `src/pages/dashboard/StudentsPanel.jsx:36-48` |
| H-12 | MEDIA | XSS | `display_name` / `bio` sin sanitización defensiva en escritura | `src/pages/auth/ProfilePage.jsx`, `StudentProfileEditor.jsx` |
| H-13 | MEDIA | Auth | Sin rate-limiting client-side en login | `src/pages/auth/LoginPage.jsx` |
| H-14 | MEDIA | Auth | Política de contraseñas débil (≥6 caracteres) | `src/pages/auth/RegisterPage.jsx:37` |
| H-15 | MEDIA | Privacy | RPC `admin_get_user_sessions` puede exponer historial sin paginación | DATABASE.md |
| H-16 | MEDIA | Config | `vite.config.js` permisivo en dev (`cors:true`, `allowedHosts:true`) | `vite.config.js:199-205` |
| H-17 | BAJA | Validación | `roomCode` y `guestName` en Quiz Battle sin saneo | `src/apps/quiz-battle/QuizBattlePlayer.jsx:90-95` |
| H-18 | BAJA | postMessage | `window.parent.postMessage(..., '*')` en helpers de Vite | `vite.config.js:52-102` |
| H-19 | BAJA | OAuth | `redirectTo: window.location.origin` sin whitelist explícita | `src/contexts/AuthContext.jsx:175,184,320` |
| H-20 | BAJA | Storage | Flag `pending_free_google_auth` en `localStorage` en lugar de `sessionStorage` | `src/contexts/AuthContext.jsx:76,172` |
| H-21 | BAJA | Logging | Logs de error con `error.message` (sin datos sensibles, pero en prod) | `src/contexts/AuthContext.jsx:30,45,...` |
| H-22 | INFO | CI/CD | Sin secret-scanning automatizado (`truffleHog`, `gitleaks`) | repositorio |
| H-23 | INFO | Tests | Faltan tests para postMessage origin y XSS en perfil | `src/__tests__/security.test.js` |
| H-24 | INFO | Docs | RLS policies no documentadas en `DATABASE.md` | `DATABASE.md` |
| H-25 | INFO | Tests | No hay validación de límites máximos en inputs largos | varios |

---

## 3. Hallazgos críticos (detalle)

### H-01 · CRÍTICA · Validación de roles solo client-side

**Ubicación:** `src/components/auth/ProtectedRoute.jsx:18-22`, `src/main.jsx:78-127`

```jsx
const hasAccess = isAdmin || currentRole === role;
if (!hasAccess) return <Navigate to="/" replace />;
```

`isAdmin` y `currentRole` provienen del estado de React (`AuthContext`), poblado desde el JWT y la fila de `teachers`. Un atacante con conocimiento de React puede:

1. Modificar el estado en memoria con DevTools / extensiones.
2. Llamar directamente a las RPCs admin desde `window.supabase`.

`ProtectedRoute` solo evita que se monte la UI; **no** protege los datos.

**Impacto:** acceso al panel admin, lectura/escritura de tablas privilegiadas si Supabase no aplica RLS.

**Recomendación:**
- Auditar **cada** RPC admin para asegurar `IF NOT EXISTS (SELECT 1 FROM teachers WHERE id = auth.uid() AND role = 'admin') THEN RAISE EXCEPTION ...`.
- Activar RLS (`ALTER TABLE … ENABLE ROW LEVEL SECURITY`) en todas las tablas con datos de usuarios.
- Considerar custom claims en el JWT (`role`) para que el cliente pueda verificar contra el JWT firmado y no contra una columna mutable.

---

### H-02 · CRÍTICA · Auto-promoción de rol via `update` directo

**Ubicación:** `src/contexts/AuthContext.jsx:112-121`

```js
await supabase
  .from('teachers')
  .update({ role: 'free' })
  .eq('id', user.id)
  .eq('role', 'teacher');
```

El cliente usa `.update()` directo sobre `teachers`. Si las RLS de `teachers` permiten `UPDATE WHERE id = auth.uid()`, el usuario puede ejecutar:

```js
await supabase.from('teachers').update({ role: 'admin' }).eq('id', myId);
```

**Impacto:** elevación a `admin` desde cualquier cuenta `teacher`/`free`.

**Recomendación:**
- Reemplazar `.update()` directo por un RPC `set_user_role(p_user_id, p_new_role)` que valide en SQL que `auth.uid() = admin` para cambios sensibles.
- RLS policy explícita:
  ```sql
  CREATE POLICY "no_self_role_change" ON teachers FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (role = (SELECT role FROM teachers WHERE id = auth.uid()));
  ```

---

### H-03 · CRÍTICA · RPCs admin sin validación server-side documentada

**Ubicación:** múltiples invocaciones en `src/pages/admin/*`

RPCs invocadas sin que `DATABASE.md` documente la verificación de rol:

- `admin_get_global_stats` (`AdminPanel.jsx:25`)
- `admin_get_user_sessions` (`UserDetail.jsx:20`)
- `admin_reset_gamification` (`UserDetail.jsx:73`)
- `admin_set_quiz_battle_quota` (`UserDetail.jsx:43`)
- `admin_get_users_paginated` (`UsersTable.jsx:236`)
- `admin_create_free_user` / `admin_create_admin_user` (`UsersTable.jsx:22,135`)
- `admin_get_feedbacks` / `admin_get_difficulty_summary` (`FeedbackPanel.jsx:54,65`)

**Impacto:** si alguna no valida el rol, cualquier usuario autenticado puede invocarla con `supabase.rpc('admin_…', { … })`.

**Recomendación:** plantilla obligatoria al inicio de cada `admin_*` RPC:

```sql
CREATE OR REPLACE FUNCTION admin_reset_gamification(p_user_id uuid, p_user_type text)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM teachers WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;
  -- lógica
END;
$$;
```

Documentar la guard en `DATABASE.md`.

---

### H-04 · CRÍTICA · `innerHTML` con datos de `postMessage`

**Ubicación:** `plugins/visual-editor/edit-mode-script.js:48,221`

```js
popupElement.innerHTML = getPopupHTMLTemplate(translations.save, translations.cancel);
```

`translations` se mezcla con datos recibidos vía `postMessage` (ver H-05) sin sanear, y se interpolan en el HTML del template. Permite XSS si un origen malicioso emite el mensaje.

**Recomendación:**
- Construir el DOM con `document.createElement` + `textContent`.
- Si se mantiene el template, escapar con whitelist de caracteres (sin `<`, `>`, `&`, comillas) o usar `<template>` + `cloneNode`.

---

### H-05 · CRÍTICA · `message` listener sin validar `event.origin`

**Ubicación:** `plugins/visual-editor/edit-mode-script.js:311-321`

```js
window.addEventListener("message", function(event) {
  if (event.data?.type === "enable-edit-mode") {
    if (event.data?.translations) {
      translations = { ...translations, ...event.data.translations };
    }
    enableEditMode();
  }
});
```

No valida `event.origin`. Cualquier ventana que haya logrado meter un iframe de la app o ejecutar `window.opener.postMessage` puede inyectar `translations` y disparar el flujo de H-04.

**Recomendación:**
```js
const ALLOWED = new Set([
  'https://horizons.hostinger.com',
  'https://horizons.hostinger.dev',
  'http://localhost:4000',
]);
window.addEventListener('message', (event) => {
  if (!ALLOWED.has(event.origin)) return;
  // … whitelist de keys + truncado de longitud …
});
```

Si el plugin solo se usa en el editor visual (Hostinger Horizons) y nunca se sirve al cliente final, marcar como **ALTA** en lugar de CRÍTICA y excluirlo del bundle de producción explícitamente.

---

## 4. Hallazgos altos

### H-06 · ALTA · RPCs de alumno sin garantía de pertenencia

**Ubicación:** `DATABASE.md` (sección de RPCs)

`student_set_password(p_student_id, p_group_code, p_username, p_new_password)` y `student_link_email(p_student_id, p_group_id, p_email)` reciben `student_id` por parámetro. Si la RPC no valida que `(p_group_code, p_username, p_password)` resuelven al mismo `student_id`, un alumno puede:
- Vincular su email a la cuenta de otro alumno.
- Cambiar la contraseña de otro alumno conociendo su `student_id`.

**Recomendación:** dentro de cada RPC, resolver el `student_id` desde las credenciales aportadas y comparar con `p_student_id`; rechazar si no coinciden. Añadir rate-limit (intentos fallidos por IP/grupo).

---

### H-07 · ALTA · Cambios admin sin doble confirmación

**Ubicación:** `src/pages/admin/UserDetail.jsx:39-86`

`handleResetXP` y `handleQuotaChange` ejecutan acciones destructivas sin modal de confirmación y dependen 100% del rol cliente. Aunque H-03 cubre la parte server, un click accidental hoy resetea el progreso real del usuario.

**Recomendación:** añadir confirmación explícita (modal con typed-in confirm para reset) y registrar en `audit_log` quién hizo qué (server-side).

---

### H-08 · ALTA · `fetch` directo a Supabase con headers redundantes

**Ubicación:** `src/hooks/useGameTracker.js:241-245`

```js
await fetch(url, {
  headers: {
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`,
  },
  body: payload,
  keepalive: true,
});
```

El uso de `keepalive` sugiere que es un envío *on unload*; no se puede llamar al SDK ahí. Pero los headers **bypassan el JWT del usuario autenticado**: usan la `anon key` como `Authorization`, perdiendo `auth.uid()` server-side y rompiendo cualquier RLS basada en usuario para esa inserción.

**Recomendación:** usar `navigator.sendBeacon` con un endpoint Supabase Edge Function que reciba el `access_token` del usuario en el body, o re-emitir la sesión con `Authorization: Bearer <session.access_token>` en lugar de la anon key.

---

### H-09 · ALTA · Faltan headers de seguridad en producción

**Ubicación:** `index.html`, hosting (.htaccess en `public/`)

Solo se define `X-Content-Type-Options: nosniff`. Faltan:

- `Content-Security-Policy` (con `connect-src` limitado a Supabase y CDNs concretos).
- `X-Frame-Options: DENY` o equivalente CSP `frame-ancestors`.
- `Referrer-Policy: strict-origin-when-cross-origin`.
- `Permissions-Policy` bloqueando cámara, micro, geo, USB, etc.
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`.

**Recomendación:** configurarlos en el hosting (Hostinger, Netlify, Vercel — según despliegue) o en el `.htaccess` ya presente en `public/`.

---

## 5. Hallazgos medios

| ID | Resumen | Recomendación breve |
|---|---|---|
| H-10 | `bio` con `maxLength` solo en HTML, sin truncado server | Truncar en RPC `update_teacher_profile` |
| H-11 | Bulk create alumnos sin regex de username | Validar `^[a-zA-Z0-9_-]{3,20}$` cliente + server |
| H-12 | `display_name`/`bio` sin saneo defensivo | `DOMPurify.sanitize(value, { ALLOWED_TAGS: [] })` antes de escribir |
| H-13 | Sin throttle client-side en login | Bloquear UI tras 5 intentos / minuto |
| H-14 | Min password = 6 | Subir a 8, exigir mayúscula + dígito |
| H-15 | `admin_get_user_sessions` sin paginación | Añadir LIMIT/OFFSET y RLS |
| H-16 | Vite dev abierto (`allowedHosts:true`, `cors:true`) | Restringir a `localhost`/host explícito |

---

## 6. Hallazgos bajos e info

- **H-17 — Quiz Battle:** validar `roomCode` con `^[A-Z0-9]{4,8}$` y limitar `guestName` a 30 chars.
- **H-18 — `vite.config.js`:** sustituir `postMessage(..., '*')` por origen explícito en producción (estos helpers solo cargan en dev, riesgo bajo).
- **H-19 — OAuth `redirectTo`:** sustituir `window.location.origin` por `import.meta.env.VITE_PUBLIC_URL` para inmunizar frente a host manipulado.
- **H-20 — `pending_free_google_auth`:** moverlo a `sessionStorage` ya que el flujo OAuth no abandona la pestaña.
- **H-21 — Logs:** envolver `console.*` en `if (import.meta.env.DEV)` o usar `vite-plugin-remove-console` en build.
- **H-22 — CI:** añadir `gitleaks` o `trufflehog` como GitHub Action en `pull_request`.
- **H-23 — Tests faltantes:** suite de XSS para perfiles, suite de origen permitido para postMessage, suite de límites de input.
- **H-24 — `DATABASE.md`:** documentar las RLS policies y, en cada RPC, qué rol/condición valida.
- **H-25 — Inputs largos:** test que envíe 10⁴ caracteres a cada campo de texto y verifique rechazo en cliente y RPC.

---

## 7. Lo que está bien

Pruebas y prácticas que **deben mantenerse**:

- `src/__tests__/security.test.js`: valida ausencia de `service_role`, prefijo `VITE_*`, `student_session` en `sessionStorage`, ausencia de `eval`/`new Function`/`dangerouslySetInnerHTML`, validación básica de inputs en `signInStudent`.
- Cliente Supabase inicializado solo con `anon key` (`src/lib/supabase.js`).
- `.gitignore` cubre `.env*`, `.claude/settings.local.json`, `.mcp.json`.
- Eliminación previa de `.mcp.json` (commit `e42169e`) y `.claude/settings.local.json` (`e989324`) del histórico tracked.
- React escapa contenido por defecto: las apps de juegos renderizan datos de Supabase sin XSS.
- Sesiones de alumno en `sessionStorage`, no en `localStorage`.
- Validación de longitud (`groupCode ≤ 20`, `username ≤ 100`) en `signInStudent`.
- `rel="noopener noreferrer"` en enlaces externos.
- Terminal Retro evalúa pseudo-código sin `eval`, con cota de 1000 iteraciones.

---

## 8. Plan de acción priorizado

### Sprint 0 — Inmediato (esta semana)

1. **Auditoría SQL completa de todas las RPCs `admin_*` y `student_*`** verificando `auth.uid()` y rol (H-01, H-02, H-03, H-06).
2. **Sustituir `.update()` directos a `teachers`** por RPCs con guard de rol (H-02).
3. **Plugin visual editor:** validar `event.origin` y eliminar `innerHTML` (H-04, H-05). Confirmar que el bundle de producción **no** lo incluye.
4. **`useGameTracker.js`:** dejar de mandar `apikey` como `Authorization`; usar el `access_token` del usuario (H-08).

### Sprint 1 — Próxima semana

5. Headers de seguridad (H-09): CSP, X-Frame, Referrer, Permissions, HSTS.
6. Confirmaciones explícitas para acciones admin destructivas (H-07).
7. Saneo defensivo (`DOMPurify`) en `bio` y `display_name` (H-12).
8. Validaciones de input fuertes (H-10, H-11, H-13, H-14, H-17).

### Sprint 2 — Endurecimiento

9. Activar `gitleaks`/`trufflehog` en CI (H-22).
10. Tests de seguridad ampliados (H-23, H-25).
11. Documentar RLS policies en `DATABASE.md` (H-24).
12. Strip de `console.*` en build de producción (H-21).
13. Restringir Vite dev server (H-16).

### Backlog

14. Custom claims `role` en JWT y `ProtectedRoute` que verifique claim firmado.
15. MFA opcional para cuentas `admin`.
16. Audit log inmutable de acciones admin con retención.
17. Penetration test externo antes de cualquier release público importante.

---

## 9. Comandos sugeridos para verificar las RPCs

Ejecutar en el SQL editor de Supabase para listar la definición de cada RPC y revisar manualmente la presencia de la guard de rol:

```sql
SELECT  p.proname,
        pg_get_functiondef(p.oid) AS definition
FROM    pg_proc p
JOIN    pg_namespace n ON n.oid = p.pronamespace
WHERE   n.nspname = 'public'
  AND   (p.proname LIKE 'admin\_%' ESCAPE '\'
     OR  p.proname LIKE 'student\_%' ESCAPE '\'
     OR  p.proname LIKE 'teacher\_%' ESCAPE '\')
ORDER BY p.proname;
```

Verificar para cada una:
- `SECURITY DEFINER` consciente.
- Guard inicial con `auth.uid()` y rol.
- `RAISE EXCEPTION` con `ERRCODE` apropiado en caso de violación.

---

*Informe generado mediante revisión estática del código en la rama `claude/security-audit-report-H9ntm`. No se realizaron pruebas activas (DAST) ni se accedió a la base de datos productiva. Las verificaciones de RLS y RPCs requieren acceso al panel de Supabase o al SQL fuente.*
