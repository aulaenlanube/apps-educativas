// Utilidades deterministas para generar fixtures (SOLO desarrollo).
// Mismo seed → mismos datos en cada recarga, para que las capturas sean estables.

export function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** PRNG mulberry32 → función () => [0, 1). */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function rngFor(key) {
  return mulberry32(hashString(String(key)));
}

export const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
export const randInt = (r, min, max) => min + Math.floor(r() * (max - min + 1));
export const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
export const round1 = (n) => Math.round(n * 10) / 10;
export const round2 = (n) => Math.round(n * 100) / 100;
export const round3 = (n) => Math.round(n * 1000) / 1000;

/** UUID con formato válido y prefijo reconocible ("de…" = dev). */
export function mockId(block, n) {
  return `de000000-0000-4000-${block}-${Number(n).toString(16).padStart(12, '0')}`;
}

/** Fecha ISO relativa a `now` (días atrás, hora local). Días negativos = futuro. */
export function daysAgo(now, days, hour = 10, minute = 0) {
  const d = new Date(now);
  d.setDate(d.getDate() - days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export function hoursAgo(now, hours) {
  return new Date(now.getTime() - (hours * 3600 * 1000)).toISOString();
}

export function dayKey(iso) {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

/** "Lucía Martín" → "lucia.martin" (cumple USERNAME_RE). */
export function toUsername(displayName) {
  return displayName
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .trim()
    .replace(/\s+/g, '.');
}

/** Evaluación (1/2/3) a partir de una fecha, igual que el backend. */
export function termForDate(date) {
  const m = date.getMonth() + 1;
  if (m >= 9 && m <= 12) return 1;
  if (m >= 1 && m <= 3) return 2;
  return 3;
}

/** Bonus de nivel: 0,5·√((nivel-1)/49), redondeado a 3 decimales. */
export function progressBonusForLevel(level) {
  return round3(0.5 * Math.sqrt(clamp(level - 1, 0, 49) / 49));
}

/** Bonus de batallas: 0,5·√(min(score,10)/10). */
export function battleBonusForScore(score) {
  return round3(0.5 * Math.sqrt(Math.min(score, 10) / 10));
}
