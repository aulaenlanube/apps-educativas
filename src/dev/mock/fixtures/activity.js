// Partidas (game_sessions) falsas y sus agregados (SOLO desarrollo).
import { APPS } from './catalog.js';
import { rngFor, randInt, clamp, round1, daysAgo, hoursAgo, dayKey, mockId } from './util.js';

// Pool de apps por grupo: [app, subject_id, peso]
export const APP_POOLS = {
  '3B': {
    level: 'eso', grade: '3',
    apps: [
      [APPS.rosco, 'lengua', 6], [APPS.ahorcado, 'lengua', 5], [APPS.millonario, 'lengua', 3],
      [APPS.intruso, 'lengua', 3], [APPS.ordenaFrase, 'lengua', 3], [APPS.sopa, 'lengua', 2],
      [APPS.crucigrama, 'lengua', 2], [APPS.nave, 'lengua', 3], [APPS.comprension, 'lengua', 2],
      [APPS.anagramas, 'ingles', 3], [APPS.ahorcado, 'ingles', 2], [APPS.snake, 'biologia', 3],
      [APPS.memoria, 'biologia', 2], [APPS.celula, 'biologia', 1], [APPS.runner, 'historia', 2],
      [APPS.millonario, 'historia', 1], [APPS.reglaTres, 'matematicas', 1], [APPS.porcentajes, 'matematicas', 1],
    ],
  },
  '1A': {
    level: 'eso', grade: '1',
    apps: [
      [APPS.fracciones, 'matematicas', 5], [APPS.reglaTres, 'matematicas', 3], [APPS.porcentajes, 'matematicas', 3],
      [APPS.romanos, 'matematicas', 2], [APPS.rosco, 'matematicas', 3], [APPS.millonario, 'matematicas', 3],
      [APPS.velocidad, 'matematicas', 2], [APPS.conecta, 'matematicas', 2], [APPS.snake, 'matematicas', 2],
      [APPS.ahorcado, 'lengua', 1], [APPS.nave, 'ingles', 1],
    ],
  },
  '2BACH': {
    level: 'bachillerato', grade: '2',
    apps: [
      [APPS.rosco, 'historia-espana', 5], [APPS.millonario, 'historia-espana', 4],
      [APPS.ordenaHistoria, 'historia-espana', 4], [APPS.comprension, 'historia-espana', 2],
      [APPS.intruso, 'historia-espana', 3], [APPS.criptograma, 'historia-espana', 1],
      [APPS.conecta, 'historia-espana', 2], [APPS.ahorcado, 'filosofia', 1],
    ],
  },
};

function weightedPick(r, entries) {
  const total = entries.reduce((a, e) => a + e[2], 0);
  let x = r() * total;
  for (const e of entries) {
    x -= e[2];
    if (x <= 0) return e;
  }
  return entries[entries.length - 1];
}

/** Busca un nº de preguntas con el que `nota` sea exacta (p. ej. 9,6 → 24/25). */
function questionsForNota(nota) {
  for (const total of [10, 25, 20, 15, 12, 30, 16, 14]) {
    const correct = Math.round((nota / 10) * total);
    if (round1((correct / total) * 10) === round1(nota)) return { total, correct };
  }
  return { total: 10, correct: Math.round(nota) };
}

let sessionSeq = 1;

/**
 * Crea una fila de game_sessions.
 * @param {object} o { userId, userType, app, subject, level, grade, mode, createdAt, skill, nota?, r }
 */
export function makeSession(o) {
  const { r } = o;
  let total;
  let correct;
  if (o.nota != null) {
    ({ total, correct } = questionsForNota(o.nota));
  } else {
    total = [10, 10, 12, 15, 20][randInt(r, 0, 4)];
    const perf = clamp(o.skill + ((r() - 0.5) * 0.35), 0.15, 1);
    correct = clamp(Math.round(total * perf), 0, total);
  }
  const nota = round1((correct / total) * 10);
  const isTest = o.mode === 'test';
  const duration = isTest ? randInt(r, 70, 420) : randInt(r, 45, 600);
  const score = (correct * (isTest ? 120 : 90)) + randInt(r, 0, isTest ? 650 : 300);
  return {
    id: mockId('9e55', (sessionSeq += 1)),
    user_id: o.userId,
    user_type: o.userType || 'student',
    app_id: o.app.app_id,
    app_name: o.app.app_name,
    level: o.level,
    grade: o.grade,
    subject_id: o.subject,
    mode: o.mode,
    score,
    max_score: total * 150,
    correct_answers: correct,
    total_questions: total,
    duration_seconds: duration,
    completed: true,
    nota,
    created_at: o.createdAt,
  };
}

/** Momento aleatorio de un día "d días atrás" (hoy → hace unas horas, nunca de madrugada). */
export function momentOnDay(now, r, d) {
  // Siempre las mismas 3 tiradas: los datos no cambian según la hora del día.
  const hour = randInt(r, 9, 21);
  const minute = randInt(r, 0, 59);
  const frac = r();
  if (d <= 0) {
    const h = now.getHours() + (now.getMinutes() / 60);
    if (h >= 10) return hoursAgo(now, 0.3 + (frac * Math.min(2.5, h - 9.5)));
    return daysAgo(now, 1, 17 + (hour % 5), minute); // antes de las 10: ayer por la tarde
  }
  return daysAgo(now, d, hour, minute);
}

/**
 * Genera `count` partidas aleatorias de un pool. `activeDays` (opcional) fuerza
 * actividad en esos días (racha); el resto se reparte en los últimos `spanDays`.
 */
export function randomSessions({ now, userId, userType = 'student', pool, count, skill, seed, spanDays = 33, testRatio = 0.35, activeDays = [] }) {
  const r = rngFor(seed);
  const out = [];
  const days = [];
  for (const d of activeDays) days.push(d);
  while (days.length < count) {
    // Más actividad reciente que antigua
    days.push(Math.floor((r() ** 1.35) * spanDays));
  }
  for (let i = 0; i < count; i += 1) {
    const [app, subject] = weightedPick(r, pool.apps);
    out.push(makeSession({
      r, userId, userType, app, subject, level: pool.level, grade: pool.grade,
      mode: r() < testRatio ? 'test' : 'practice',
      skill,
      createdAt: momentOnDay(now, r, days[i]),
    }));
  }
  return out;
}

// ─── Agregados (mismo shape que student_get_dashboard / teacher_get_student_stats) ───

const sum = (arr, f) => arr.reduce((a, s) => a + (Number(f(s)) || 0), 0);
const avgRound = (arr, f) => (arr.length ? Math.round(sum(arr, f) / arr.length) : 0);

export function aggregateSessions(sessions, now) {
  const sorted = sessions.slice().sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  const tests = sorted.filter((s) => s.mode === 'test');
  const practices = sorted.filter((s) => s.mode === 'practice');
  const totalCorrect = sum(sorted, (s) => s.correct_answers);
  const totalQuestions = sum(sorted, (s) => s.total_questions);
  const testNotas = tests.map((s) => s.nota).filter((n) => n != null);

  const stats = {
    total_sessions: sorted.length,
    total_time_seconds: sum(sorted, (s) => s.duration_seconds),
    total_score: sum(sorted, (s) => s.score),
    total_correct: totalCorrect,
    total_questions: totalQuestions,
    avg_accuracy: totalQuestions ? round1((totalCorrect / totalQuestions) * 100) : 0,
    apps_played: new Set(sorted.map((s) => s.app_id)).size,
    practice_sessions: practices.length,
    test_sessions: tests.length,
    avg_practice_score: avgRound(practices, (s) => s.score),
    avg_test_score: avgRound(tests, (s) => s.score),
    best_score: sorted.reduce((m, s) => Math.max(m, s.score || 0), 0),
    longest_session_seconds: sorted.reduce((m, s) => Math.max(m, s.duration_seconds || 0), 0),
    first_activity: sorted.length ? sorted[sorted.length - 1].created_at : null,
    last_activity: sorted.length ? sorted[0].created_at : null,
    days_active: new Set(sorted.map((s) => dayKey(s.created_at))).size,
    // La RPC real aún no devuelve estos dos (la UI los soporta y si faltan
    // muestra "—"). Se incluyen para poder diseñar la tarjeta con datos.
    best_nota: testNotas.length ? Math.max(...testNotas) : null,
    avg_test_nota: testNotas.length ? round1(testNotas.reduce((a, b) => a + b, 0) / testNotas.length) : null,
  };

  const appMap = new Map();
  for (const s of sorted) {
    const key = [s.app_id, s.app_name, s.level, s.grade, s.subject_id].join('|');
    if (!appMap.has(key)) appMap.set(key, []);
    appMap.get(key).push(s);
  }
  const apps_detail = [...appMap.values()].map((list) => {
    const t = list.filter((s) => s.mode === 'test');
    const p = list.filter((s) => s.mode === 'practice');
    const c = sum(list, (s) => s.correct_answers);
    const q = sum(list, (s) => s.total_questions);
    const notas = t.map((s) => s.nota);
    return {
      app_id: list[0].app_id,
      app_name: list[0].app_name,
      total_plays: list.length,
      practice_plays: p.length,
      test_plays: t.length,
      avg_score: avgRound(list, (s) => s.score),
      avg_practice_score: avgRound(p, (s) => s.score),
      avg_test_score: avgRound(t, (s) => s.score),
      best_score: list.reduce((m, s) => Math.max(m, s.score), 0),
      best_test_score: t.reduce((m, s) => Math.max(m, s.score), 0),
      total_correct: c,
      total_questions: q,
      accuracy: q ? round1((c / q) * 100) : 0,
      total_time_seconds: sum(list, (s) => s.duration_seconds),
      avg_duration_seconds: avgRound(list, (s) => s.duration_seconds),
      last_played: list[0].created_at,
      level: list[0].level,
      grade: list[0].grade,
      subject_id: list[0].subject_id,
      // No viene en la RPC real (la UI cae a best_score); ver README.
      best_nota: notas.length ? Math.max(...notas) : null,
    };
  }).sort((a, b) => b.total_plays - a.total_plays);

  const recent_sessions = sorted.slice(0, 20).map((s) => ({
    app_id: s.app_id, app_name: s.app_name, level: s.level, grade: s.grade, subject_id: s.subject_id,
    mode: s.mode, score: s.score, max_score: s.max_score, correct_answers: s.correct_answers,
    total_questions: s.total_questions, duration_seconds: s.duration_seconds, completed: s.completed,
    created_at: s.created_at,
    nota: s.nota, // idem: la RPC real no lo devuelve todavía
  }));

  const since = new Date(now);
  since.setDate(since.getDate() - 30);
  since.setHours(0, 0, 0, 0);
  const dayMap = new Map();
  for (const s of sorted) {
    if (new Date(s.created_at) < since) continue;
    const k = dayKey(s.created_at);
    const e = dayMap.get(k) || { day: k, sessions: 0, total_seconds: 0 };
    e.sessions += 1;
    e.total_seconds += s.duration_seconds || 0;
    dayMap.set(k, e);
  }
  const daily_activity = [...dayMap.values()].sort((a, b) => (a.day < b.day ? -1 : 1));

  const subjMap = new Map();
  for (const s of sorted) {
    if (!s.subject_id) continue;
    if (!subjMap.has(s.subject_id)) subjMap.set(s.subject_id, []);
    subjMap.get(s.subject_id).push(s);
  }
  const by_subject = [...subjMap.entries()].map(([subject_id, list]) => {
    const c = sum(list, (s) => s.correct_answers);
    const q = sum(list, (s) => s.total_questions);
    return {
      subject_id,
      total_plays: list.length,
      total_time_seconds: sum(list, (s) => s.duration_seconds),
      avg_score: avgRound(list, (s) => s.score),
      accuracy: q ? round1((c / q) * 100) : 0,
    };
  }).sort((a, b) => b.total_plays - a.total_plays);

  return { stats, apps_detail, recent_sessions, daily_activity, by_subject };
}

/** Días seguidos con actividad terminando hoy (o ayer). */
export function currentStreak(sessions, now) {
  const days = new Set(sessions.map((s) => dayKey(s.created_at)));
  let streak = 0;
  const d = new Date(now);
  if (!days.has(dayKey(d.toISOString()))) d.setDate(d.getDate() - 1);
  while (days.has(dayKey(d.toISOString()))) {
    streak += 1;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}
