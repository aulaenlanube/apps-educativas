# Modo mock (solo desarrollo)

Permite ver y capturar los paneles **logueados** (alumno, docente, usuario libre) en local **sin credenciales**, con datos falsos realistas y coherentes. Pensado para rediseñar los dashboards y para sacar capturas con `tools/dash-shots.mjs`.

> Nunca llega a producción: `main.jsx` lo carga con `import()` dentro de `if (import.meta.env.DEV)`. En el build, `import.meta.env.DEV` es `false`, Vite elimina la rama y el chunk no se genera.

## Activarlo

Con el dev server arrancado (`pnpm run dev`), abre cualquier URL con `?mock=<rol>`:

| URL | Entras como |
|---|---|
| `/mi-panel?mock=student` | **Lucía Martín**, alumna de **3º ESO B** (código de grupo `GRP-3B7K`, docente Edu) |
| `/dashboard?mock=teacher` | **Edu Torregrosa**, docente (`EDUT-4821`) con 3 grupos: 1º ESO A, 3º ESO B (co-docente Laura Gómez) y 2º Bachillerato (propietaria Carmen Llopis; Edu es co-docente) |
| `/mi-zona?mock=free` | **Marta Ruiz**, usuaria libre |

- El rol se guarda en `sessionStorage['eduapps-dev-mock']`: después ya no hace falta el parámetro (vale para recargar y navegar).
- `?mock=off` lo desactiva y limpia la sesión de alumno falsa (si había una sesión de alumno real en la pestaña, se restaura).
- **Cerrar sesión** desde la app también desactiva el mock: el cliente vuelve a ser el real sin recargar.
- Cambiar de rol requiere una carga completa (escribir la URL con `?mock=otro`), no navegación interna.
- En el panel docente, **selecciona un grupo** (p. ej. 3º ESO B) para ver alumnos, tareas, chat, duelos y batallas.
- En la consola: `window.__eduappsDevMock` (rol, mundo de datos, RPC mockeadas y RPC desconocidas).

## Cómo funciona

1. `main.jsx` (solo en DEV) espera a `bootstrapDevMock()` (`index.js`) antes del primer render.
2. Si hay rol activo, `install.js` carga `/data/avatars.json`, construye el mundo (`fixtures/world.js`) y **parchea en sitio** el cliente único de `src/lib/supabase.js`:
   - `supabase.rpc(nombre, params)` → `handlers/*` (devuelve un builder "thenable", admite `.single()` etc.).
   - `supabase.from(tabla)` → `handlers/tables.js` con un query builder falso (`queryBuilder.js`: select/insert/update/delete, eq/in/gte…, order, limit, single).
   - `supabase.channel()` → canal falso (`realtimeStub.js`): `subscribe` responde `SUBSCRIBED`, `send/track` no hacen nada.
   - `supabase.auth.*` → sesión falsa para docente/libre (`onAuthStateChange` emite `INITIAL_SESSION`; `from('teachers')` devuelve el perfil). Para alumno se escribe `sessionStorage['student_session']` con el mismo shape que `student_login`.
3. **`AuthContext` no se toca**: su flujo real construye `user`, `teacher`, `freeUser`, `student`, `role`, `displayName`… con el mismo shape que en producción. `signIn*`/`signUp` son inocuos (devuelven sesión falsa o un error explicativo), `signOut` desactiva el mock.
4. Las RPC de **contenido público de solo lectura** (`get_rosco_data`, `get_app_content`, `get_subjects`… ver `PASSTHROUGH_RPCS` en `handlers/index.js`) y `from('subjects')` (solo SELECT) siguen yendo al Supabase real, para que las apps tengan contenido si navegas a ellas. **Ninguna escritura llega a la BD real**: tracking de partidas, valoraciones, chats, duelos… se resuelven en memoria.
5. RPC sin handler → `{ data: null, error: null }` y un `console.info` (una vez por nombre) para que sea fácil ampliarlo.

El estado es **en memoria**: lo que cambies (enviar un mensaje, equipar avatar o frase, crear tarea…) se refleja en la sesión actual y se pierde al recargar. Los datos son deterministas (mismo resultado en cada recarga) y las fechas son relativas a "ahora" (pendientes / vencidas / actividad de 30 días siempre cuadran).

## Datos principales

- **Lucía** (nivel 23, 12.890 XP): nota de la evaluación en curso **8,28** = tareas 7,8 · 0,9 + duelos +0,20 (2 duelos-tarea ganados) + batallas +0,33 (3 primeros y 2 segundos) + nivel +0,34 + avatares +0,40 (3 desbloqueados, equipado *Detective Filósofo*). 8 tareas (completadas, pendiente sin intentar, vencida suspendida, duelo-tarea), 64 partidas en 15 apps reales, 20 insignias (común → legendaria), 4 frases de duelo, 2 duelos entrantes (uno oculto de tarea) y 1 saliente, una deuda de duelo, chat con anuncios e hilo privado, 2 comentarios de apps, 6 notificaciones.
- **Edu**: 3 grupos de 22-25 alumnos con avatares/notas variadas, 20 tareas con progreso (4 son filas de duelo-tarea), matriz de notas por alumno, 15 batallas de grupo + historial de anfitrión con detalle por pregunta, 19 duelos de grupo en todos los estados, chats con no leídos, 5 plantillas de batalla, horario de clase, gamificación (nivel 31, 25 insignias), colección de avatares, retos 1 vs 1 propios.
- **Marta**: 26 partidas (Primaria y ESO), nivel 9, insignias, un comentario abierto.

## Estructura

```
src/dev/mock/
  index.js          entrada (bandera + import perezoso de install.js)
  flag.js           sessionStorage: rol, sesión de alumno falsa, ?mock=
  install.js        parcheo del cliente de Supabase (rpc/from/channel/auth)
  queryBuilder.js   builder encadenable de PostgREST
  realtimeStub.js   canal Realtime falso
  fixtures/
    catalog.js      insignias, frases (copias de BD), curva de XP, apps reales
    people.js       docentes, grupos, alumnos
    activity.js     generador de partidas + agregados del panel
    world.js        mundo coherente: tareas, notas, batallas, duelos, chat…
    util.js         PRNG determinista, ids, fechas
  handlers/
    student.js      RPC de alumno (student_*, avatar_*, duelos)
    teacher.js      RPC de docente (grupos, tareas, chat, batallas…)
    shared.js       notificaciones, comentarios, catálogos, rankings, tracking
    tables.js       supabase.from(tabla)
    index.js        registro + passthrough + RPC desconocidas
```

## Añadir o cambiar fixtures

- **Nueva RPC**: añade una entrada al objeto de handlers que corresponda (`handlers/student.js`, `teacher.js` o `shared.js`):
  ```js
  mi_nueva_rpc: (params, { world, role, meId, state }) => ({ success: true, ... }),
  ```
  `params` son los mismos que recibe la RPC real (`p_student_id`, `p_group_id`…). Devuelve exactamente el shape de la RPC real (consulta su definición en Supabase o el componente que la consume). El resultado se clona antes de llegar al componente.
- **Nueva tabla** para `from()`: añade `nombre: (state, ctx) => filas | { data, error }` en `handlers/tables.js`; el builder ya aplica `eq/in/order/limit/single`.
- **Más datos**: edita `fixtures/world.js` (tareas en `asgDefs`, duelos en `duelSpecs`, chat, notificaciones…) o `people.js` (alumnos/grupos). Mantén la coherencia: `termGradesFor()` replica `_compute_student_term_grades`, así que la nota se recalcula sola.
- **RPC de contenido público** que deba ir al Supabase real: añádela a `PASSTHROUGH_RPCS` (solo lecturas anónimas).
- Para saber qué falta: `window.__eduappsDevMock.unknownRpcs` o la salida de `tools/dash-shots.mjs`.

## Capturas: `tools/dash-shots.mjs`

```bash
node tools/dash-shots.mjs --role=student --path=/mi-panel --out=shots/alumno --tabs
node tools/dash-shots.mjs --role=teacher --path=/dashboard --out=shots/docente --click="3º ESO B" --tabs
node tools/dash-shots.mjs --role=free --path=/mi-zona --out=shots/libre
# vistas secundarias del docente
node tools/dash-shots.mjs --role=teacher --out=shots/docente-alumno --click="3º ESO B" --click='css:button[title="Ver estadisticas"]'
node tools/dash-shots.mjs --role=teacher --out=shots/docente-duelos --viewport --click="3º ESO B" --click=Duelo
```

Opciones: `--tabs` (detecta `[role=tab]` o la barra de botones; o `--tabs=Resumen,Tareas`), `--click` (texto visible, `title`/`aria-label`, `css:<selector>` o `key:Escape`; se repite y hace una captura por clic), `--viewport` (solo la pantalla; por defecto página completa con carga de imágenes lazy), `--mobile`, `--dark`, `--width/--height`, `--wait`, `--base` (por defecto `http://localhost:5199` o `DASH_BASE`), `--strict` (código 1 si hay errores). Al final imprime los errores de consola / `pageerror` y las RPC sin fixture.

## Diferencias conocidas con producción

- (Resuelto el 12-oct-2026, migración `20261012_dashboard_nota_fields`) `student_get_dashboard` y `teacher_get_student_stats` ya devuelven `stats.best_nota`, `stats.avg_test_nota`, `apps_detail[].best_nota`/`best_test_nota` y `recent_sessions[].nota`; el informe del docente agrupa por app + curso + asignatura como el del alumno. `student_get_duel_state`/`teacher_get_duel_state` devuelven `is_task` (migración `20261012_duel_state_is_task`). Las gráficas planas y las *keys* duplicadas se arreglaron en el rediseño de los paneles.
- `in_class_window` de los duelos-tarea es siempre `true`; la jugada de un duelo y la Batalla en directo (QuizBattleHost/Player) no se simulan.
- `select('col1, col2')` no proyecta columnas (devuelve la fila entera); los filtros `or/not/filter` no se evalúan.
- El "ruido" `Fetch error from :` de la consola viene del parche de fetch del plugin de Horizons en `vite.config.js` y aparece también con el mock apagado.
