// Throttle client-side de intentos de login.
// Defensa superficial: el server sigue siendo la autoridad, esto solo frena
// ataques de fuerza bruta ingenuos desde el mismo navegador.

const STORAGE_PREFIX = 'login_throttle_';
const MAX_ATTEMPTS = 5;
const LOCK_MS = 60_000; // 1 minuto de bloqueo tras alcanzar el limite.

function readState(key) {
  try {
    const raw = sessionStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return { attempts: 0, lockedUntil: 0 };
    const parsed = JSON.parse(raw);
    return {
      attempts: Number(parsed.attempts) || 0,
      lockedUntil: Number(parsed.lockedUntil) || 0,
    };
  } catch {
    return { attempts: 0, lockedUntil: 0 };
  }
}

function writeState(key, state) {
  try {
    sessionStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(state));
  } catch {
    // Storage lleno o denegado; seguimos adelante (no es critico).
  }
}

export function getLockRemainingMs(key) {
  const { lockedUntil } = readState(key);
  return Math.max(0, lockedUntil - Date.now());
}

export function isLocked(key) {
  return getLockRemainingMs(key) > 0;
}

export function registerFailedAttempt(key) {
  const state = readState(key);
  const attempts = state.attempts + 1;
  const lockedUntil = attempts >= MAX_ATTEMPTS ? Date.now() + LOCK_MS : 0;
  writeState(key, { attempts, lockedUntil });
  return { attempts, lockedUntil, limitReached: attempts >= MAX_ATTEMPTS };
}

export function clearAttempts(key) {
  try {
    sessionStorage.removeItem(STORAGE_PREFIX + key);
  } catch {
    // ignore
  }
}

export const LOGIN_MAX_ATTEMPTS = MAX_ATTEMPTS;
export const LOGIN_LOCK_MS = LOCK_MS;
