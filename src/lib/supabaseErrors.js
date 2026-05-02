// Mapeo de errores de Supabase / PostgREST a mensajes amables al usuario.
// Evita filtrar detalles internos (nombres de tabla, RLS, queries).

const FRIENDLY = [
  // Auth / sesión
  [/jwt|expired|not authenticated|unauthenticated|invalid_grant|sesion\s+invalida/i,
    'Tu sesión ha caducado. Vuelve a iniciar sesión.'],
  [/invalid login|invalid credentials|incorrect.*password/i,
    'Usuario o contraseña incorrectos.'],
  [/email.*not\s*confirm|email_not_confirmed/i,
    'Aún no has verificado tu correo. Revisa tu bandeja de entrada.'],

  // Permisos / RLS
  [/row-level security|rls|policy/i,
    'No tienes permisos para esta acción.'],
  [/forbidden|not allowed|permission denied/i,
    'No tienes permisos para esta acción.'],

  // Conflictos / validaciones de unicidad
  [/duplicate key|already exists|unique violation|23505/i,
    'Este dato ya existe.'],
  [/foreign key|23503/i,
    'Referencia no válida o ya eliminada.'],
  [/check constraint|23514/i,
    'Algún dato no cumple las reglas. Revisa el formulario.'],
  [/not[- ]?null|23502/i,
    'Falta algún dato obligatorio.'],

  // Red / disponibilidad
  [/timeout|timed out|fetch failed|network/i,
    'No hay conexión con el servidor. Inténtalo de nuevo.'],
  [/rate.?limit|too many|429/i,
    'Demasiados intentos. Espera unos segundos antes de volver a probar.'],

  // Explícitos por nombre de RPC
  [/student_not_in_group/i, 'El alumno no pertenece a este grupo.'],
];

// Errores cuyo mensaje original es seguro mostrar (vienen de RPCs propias).
const SAFE_PATTERNS = [
  /^Sesion expirada/i,
  /^Avatar/i,
  /^Tu nota/i,
  /^Hoy/i,
];

/**
 * Convierte un error de Supabase / RPC en un mensaje seguro para el usuario.
 * Acepta:
 *   - Error de supabase-js (con .message, .code, .details, .hint)
 *   - El campo `error` del JSON devuelto por una RPC ({ error: '...' })
 *   - Un string plano
 */
export function mapSupabaseError(err) {
  if (!err) return 'Error inesperado.';
  const raw = typeof err === 'string'
    ? err
    : (err.message || err.error || err.error_description || err.hint || err.details || '');
  if (!raw) return 'Error inesperado.';

  // Si el mensaje empieza con un texto "seguro" que tú controlas, déjalo pasar.
  if (SAFE_PATTERNS.some(p => p.test(raw))) return raw;

  for (const [re, friendly] of FRIENDLY) {
    if (re.test(raw)) return friendly;
  }
  // Default genérico — nunca exponemos el mensaje crudo si no encaja.
  return 'No se pudo completar la operación. Inténtalo de nuevo.';
}

/**
 * Devuelve un objeto compatible con `toast({ variant: 'destructive', ... })`.
 *   const { data, error } = await supabase.rpc(...);
 *   if (error || data?.error) toast(toastError(error || data.error));
 */
export function toastError(err, title = 'Error') {
  return { variant: 'destructive', title, description: mapSupabaseError(err) };
}
