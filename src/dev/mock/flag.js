// ─────────────────────────────────────────────────────────────────────────────
// Modo mock (SOLO desarrollo): bandera persistente en sessionStorage.
// Ver src/dev/mock/README.md. Este fichero no se incluye nunca en el bundle de
// producción: solo se carga desde main.jsx dentro de `if (import.meta.env.DEV)`.
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_STORAGE_KEY = 'eduapps-dev-mock';
export const MOCK_ROLES = ['student', 'teacher', 'free'];

// Marca que llevan las sesiones de alumno falsas para poder limpiarlas sin
// tocar una sesión de alumno real que hubiera en la pestaña.
export const MOCK_STUDENT_MARKER = '__eduappsDevMock';
const STUDENT_SESSION_KEY = 'student_session';
const REAL_STUDENT_BACKUP_KEY = 'eduapps-dev-mock:real-student-session';

function safeGet(key) {
  try { return window.sessionStorage.getItem(key); } catch { return null; }
}
function safeSet(key, value) {
  try { window.sessionStorage.setItem(key, value); } catch { /* sin storage */ }
}
function safeRemove(key) {
  try { window.sessionStorage.removeItem(key); } catch { /* sin storage */ }
}

export function readMockRole() {
  const v = safeGet(MOCK_STORAGE_KEY);
  return MOCK_ROLES.includes(v) ? v : null;
}

export function writeMockRole(role) {
  if (MOCK_ROLES.includes(role)) safeSet(MOCK_STORAGE_KEY, role);
}

export function clearMockRole() {
  safeRemove(MOCK_STORAGE_KEY);
}

export function isMockActive() {
  return readMockRole() !== null;
}

function readStudentSession() {
  const raw = safeGet(STUDENT_SESSION_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function isMockStudentSession(s) {
  return !!(s && s[MOCK_STUDENT_MARKER]);
}

// Guarda aparte una sesión de alumno REAL antes de pisarla con la falsa.
function backupRealStudentSession() {
  const raw = safeGet(STUDENT_SESSION_KEY);
  const s = readStudentSession();
  if (raw && s && !isMockStudentSession(s)) safeSet(REAL_STUDENT_BACKUP_KEY, raw);
}

/** Escribe la sesión de alumno falsa (la lee AuthContext al montar). */
export function seedMockStudentSession(studentSession) {
  backupRealStudentSession();
  safeSet(STUDENT_SESSION_KEY, JSON.stringify({ ...studentSession, [MOCK_STUDENT_MARKER]: true }));
}

/** En modo docente/libre no debe quedar ninguna sesión de alumno en la pestaña. */
export function clearStudentSessionForNonStudentRole() {
  backupRealStudentSession();
  safeRemove(STUDENT_SESSION_KEY);
}

/** Quita la sesión falsa y, si la había, restaura la sesión real guardada. */
export function restoreRealStudentSession() {
  if (isMockStudentSession(readStudentSession())) safeRemove(STUDENT_SESSION_KEY);
  const backup = safeGet(REAL_STUDENT_BACKUP_KEY);
  if (backup && !safeGet(STUDENT_SESSION_KEY)) safeSet(STUDENT_SESSION_KEY, backup);
  safeRemove(REAL_STUDENT_BACKUP_KEY);
}

/**
 * Aplica el parámetro `?mock=` de la URL a la bandera persistente.
 *   ?mock=student | teacher | free → activa ese rol
 *   ?mock=off (o false / 0)        → desactiva y limpia
 * Devuelve el rol activo resultante (o null).
 */
export function applyMockParamFromUrl() {
  let param = null;
  try { param = new URLSearchParams(window.location.search).get('mock'); } catch { /* noop */ }
  if (param != null) {
    const v = param.trim().toLowerCase();
    if (v === 'off' || v === 'false' || v === '0' || v === 'none') {
      clearMockRole();
    } else if (MOCK_ROLES.includes(v)) {
      writeMockRole(v);
    }
  }
  return readMockRole();
}
