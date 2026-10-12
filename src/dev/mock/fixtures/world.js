// ─────────────────────────────────────────────────────────────────────────────
// "Mundo" falso coherente para el modo mock (SOLO desarrollo).
//
// Todo se genera de forma determinista (mismos datos en cada recarga) y con
// fechas relativas a "ahora", así las tareas pendientes/vencidas, la actividad
// de 30 días y las rachas siempre tienen sentido. Las cifras de Lucía Martín
// están ajustadas a mano para que la nota cuadre con el desglose del backend:
//   tareas 7,8 (·0,9) + duelos 0,20 + batallas 0,33 + nivel 0,34 + avatares 0,40 = 8,28
// ─────────────────────────────────────────────────────────────────────────────
import { APPS, BADGES, PHRASES, xpForLevel, levelForXp } from './catalog.js';
import { IDS, MOCK_STUDENT_TOKEN, GROUP_DEFS, buildTeachers, buildRosters } from './people.js';
import { APP_POOLS, makeSession, randomSessions, aggregateSessions, currentStreak, momentOnDay } from './activity.js';
import {
  mockId, rngFor, randInt, clamp, round1, round2, round3, daysAgo, hoursAgo, termForDate,
  progressBonusForLevel, battleBonusForScore,
} from './util.js';

const A = (n) => mockId('a550', n);
const DUEL = (n) => mockId('d0e1', n);
const PAIR = (n) => mockId('9a12', n);
const ROOM_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

const when = (now, d) => (d < 1 ? hoursAgo(now, Math.max(0.2, d * 24)) : daysAgo(now, d, 11, 15));

export function buildWorld({ avatars = [] } = {}) {
  const now = new Date();
  const currentTerm = termForDate(now);
  const teachers = buildTeachers(now);
  const teacherById = new Map(Object.values(teachers).map((t) => [t.id, t]));
  const { students, byGroup, byId } = buildRosters(now);
  const groupDefById = new Map(GROUP_DEFS.map((g) => [g.id, g]));
  const byName = (name) => {
    const s = students.find((x) => x.display_name === name);
    if (!s) throw new Error(`[dev-mock] alumno inexistente en fixtures: ${name}`);
    return s;
  };
  const lucia = byId.get(IDS.lucia);

  // ─── Grupos ────────────────────────────────────────────────────────────────
  let coSeq = 0;
  const groups = GROUP_DEFS.map((g) => ({
    id: g.id,
    name: g.name,
    description: g.description,
    group_code: g.group_code,
    teacher_id: g.ownerId,
    created_at: daysAgo(now, g.createdDaysAgo, 17, 30),
    updated_at: daysAgo(now, 3, 18, 0),
    level: g.level,
    grade: g.grade,
    subject_id: g.subject_id,
    current_term: null,
    is_owner: g.ownerId === IDS.teacherEdu,
    student_count: byGroup.get(g.id).length,
    owner_name: teacherById.get(g.ownerId).display_name,
    co_teachers: (g.coTeacherIds || []).length
      ? g.coTeacherIds.map((tid) => {
        const t = teacherById.get(tid);
        coSeq += 1;
        return { id: mockId('c07e', coSeq), teacher_id: tid, display_name: t.display_name, teacher_code: t.teacher_code };
      })
      : null,
  }));
  const groupById = new Map(groups.map((g) => [g.id, g]));

  const classHours = {
    [IDS.group1A]: [
      { id: mockId('c1a5', 1), weekday: 1, start_time: '08:00', end_time: '08:55' },
      { id: mockId('c1a5', 2), weekday: 3, start_time: '10:00', end_time: '10:55' },
      { id: mockId('c1a5', 3), weekday: 5, start_time: '12:25', end_time: '13:20' },
    ],
    [IDS.group3B]: [
      { id: mockId('c1a5', 4), weekday: 1, start_time: '09:00', end_time: '09:55' },
      { id: mockId('c1a5', 5), weekday: 3, start_time: '11:30', end_time: '12:25' },
      { id: mockId('c1a5', 6), weekday: 4, start_time: '10:00', end_time: '10:55' },
    ],
    [IDS.group2Bach]: [
      { id: mockId('c1a5', 7), weekday: 2, start_time: '08:00', end_time: '08:55' },
      { id: mockId('c1a5', 8), weekday: 4, start_time: '12:25', end_time: '13:20' },
    ],
  };

  // ─── Tareas ────────────────────────────────────────────────────────────────
  const daniel = byName('Daniel Castro');
  const paula = byName('Paula Sanz');
  const mario = byName('Mario Gil');
  const asgDefs = [
    // 3º ESO B (Lengua) — el grupo de Lucía
    { n: 1, g: IDS.group3B, app: APPS.rosco, subject: 'lengua', title: 'Rosco: vocabulario del Tema 2', description: 'Repasa el vocabulario de la unidad antes del control.', min: 5, weight: 3, created: 24, due: 10 },
    { n: 2, g: IDS.group3B, app: APPS.millonario, subject: 'lengua', title: 'Examen de evaluación: literatura medieval', description: 'Cuenta triple. Modo examen, sin comodines.', min: 5, weight: 3, created: 20, due: 3 },
    { n: 3, g: IDS.group3B, app: APPS.ahorcado, subject: 'lengua', title: null, description: null, min: 5, weight: 2, created: 18, due: 6 },
    { n: 4, g: IDS.group3B, app: APPS.intruso, subject: 'lengua', title: 'Categorías gramaticales', description: 'Encuentra la palabra que no pertenece a la categoría.', min: 6, weight: 1, created: 15, due: 2, by: IDS.teacherLaura },
    { n: 5, g: IDS.group3B, app: APPS.ordenaFrase, subject: 'lengua', title: 'Sintaxis: el orden de la oración', description: null, min: 5, weight: 1, created: 12, due: -3 },
    { n: 6, g: IDS.group3B, app: APPS.crucigrama, subject: 'lengua', title: 'Crucigrama del Lazarillo', description: 'Personajes y vocabulario de la obra.', min: 5, weight: 1, created: 2, due: -5 },
    { n: 7, g: IDS.group3B, app: APPS.sopa, subject: 'lengua', title: 'Ortografía: b/v', description: null, min: 5, weight: 1, created: 14, due: 4 },
    // Duelo-tarea (filas individuales, una por alumno emparejado)
    { n: 8, g: IDS.group3B, app: APPS.snake, subject: 'lengua', title: 'Duelo · Snake', description: null, min: 0, weight: 1, created: 1, due: -6, student: lucia.id, duel: DUEL(2), pair: PAIR(1) },
    { n: 9, g: IDS.group3B, app: APPS.snake, subject: 'lengua', title: 'Duelo · Snake', description: null, min: 0, weight: 1, created: 1, due: -6, student: daniel.id, duel: DUEL(2), pair: PAIR(1) },
    { n: 10, g: IDS.group3B, app: APPS.snake, subject: 'lengua', title: 'Duelo · Snake', description: null, min: 0, weight: 1, created: 1, due: -6, student: paula.id, duel: DUEL(4), pair: PAIR(2) },
    { n: 11, g: IDS.group3B, app: APPS.snake, subject: 'lengua', title: 'Duelo · Snake', description: null, min: 0, weight: 1, created: 1, due: -6, student: mario.id, duel: DUEL(4), pair: PAIR(2) },
    // 1º ESO A (Matemáticas)
    { n: 20, g: IDS.group1A, app: APPS.fracciones, subject: 'matematicas', title: 'Fracciones equivalentes', description: null, min: 5, weight: 2, created: 22, due: 8 },
    { n: 21, g: IDS.group1A, app: APPS.reglaTres, subject: 'matematicas', title: null, description: null, min: 5, weight: 1, created: 16, due: 5 },
    { n: 22, g: IDS.group1A, app: APPS.porcentajes, subject: 'matematicas', title: 'Porcentajes en la vida real', description: 'Rebajas, IVA y propinas.', min: 6, weight: 1, created: 9, due: -2 },
    { n: 23, g: IDS.group1A, app: APPS.millonario, subject: 'matematicas', title: 'Examen de evaluación', description: 'Cuenta triple.', min: 5, weight: 3, created: 5, due: -9 },
    { n: 24, g: IDS.group1A, app: APPS.romanos, subject: 'matematicas', title: 'Números romanos', description: null, min: 5, weight: 1, created: 27, due: 15 },
    // 2º Bachillerato (Historia de España, propietaria Carmen)
    { n: 30, g: IDS.group2Bach, app: APPS.rosco, subject: 'historia-espana', title: 'Rosco: conceptos del bloque 9', description: null, min: 5, weight: 1, created: 20, due: 9, by: IDS.teacherCarmen },
    { n: 31, g: IDS.group2Bach, app: APPS.ordenaHistoria, subject: 'historia-espana', title: 'La Transición en orden', description: 'Ordena los hitos de 1975 a 1982.', min: 6, weight: 2, created: 13, due: 1, by: IDS.teacherCarmen },
    { n: 32, g: IDS.group2Bach, app: APPS.millonario, subject: 'historia-espana', title: 'Simulacro PAU', description: 'Preguntas tipo examen de acceso.', min: 5, weight: 3, created: 6, due: -7, by: IDS.teacherCarmen },
    { n: 33, g: IDS.group2Bach, app: APPS.comprension, subject: 'historia-espana', title: 'Comentario de fuentes', description: null, min: 5, weight: 1, created: 4, due: -4 },
  ];
  const assignments = asgDefs.map((d) => {
    const g = groupDefById.get(d.g);
    const teacherId = d.by || IDS.teacherEdu;
    return {
      id: A(d.n),
      teacher_id: teacherId,
      group_id: d.g,
      student_id: d.student || null,
      app_id: d.app.app_id,
      app_name: d.app.app_name,
      level: g.level,
      grade: g.grade,
      subject_id: d.subject,
      min_score: d.min,
      title: d.title,
      description: d.description,
      due_date: daysAgo(now, d.due, 23, 59),
      created_at: daysAgo(now, d.created, 8, 30 + (d.n % 20)),
      updated_at: daysAgo(now, d.created, 8, 30),
      weight: d.weight,
      term: currentTerm,
      assignment_type: d.duel ? 'duel' : 'standard',
      duel_stake: d.duel ? 0.1 : null,
      duel_pair_id: d.pair || null,
      duel_id: d.duel || null,
      _createdDays: d.created,
      _dueDays: d.due,
      _subject: d.subject,
    };
  });

  // ─── Matriz de notas por (tarea, alumno) + sesiones de examen asociadas ─────
  // Lucía: intentos fijos [días atrás, nota].
  const LUCIA_ATTEMPTS = {
    [A(1)]: [[21, 8.4], [19, 9.6]],
    [A(2)]: [[5, 10]],
    [A(3)]: [[17, 7.2], [16, 8.8], [13, 9.3]],
    [A(4)]: [[9, 9.5]],
    [A(5)]: [[10, 9.0], [4, 10]],
    [A(7)]: [[12, 3.8], [7, 4.5]],
  };
  const matrix = new Map(); // `${asgId}|${studentId}` → { best_nota, best_score, attempts, last_attempt }
  const taskSessions = new Map(); // studentId → [sessions]
  const pushTaskSession = (sid, s) => {
    if (!taskSessions.has(sid)) taskSessions.set(sid, []);
    taskSessions.get(sid).push(s);
  };
  for (const asg of assignments) {
    const targets = asg.student_id ? [byId.get(asg.student_id)] : byGroup.get(asg.group_id);
    const pool = APP_POOLS[groupDefById.get(asg.group_id).key];
    for (const st of targets) {
      const key = `${asg.id}|${st.id}`;
      if (asg.assignment_type === 'duel') {
        matrix.set(key, { best_nota: null, best_score: null, attempts: 0, last_attempt: null });
        continue;
      }
      const r = rngFor(`matrix:${key}`);
      let attempts = [];
      if (st.id === IDS.lucia) {
        attempts = LUCIA_ATTEMPTS[asg.id] || [];
      } else {
        const fresh = asg._createdDays <= 3;
        const p = fresh ? 0.3 : 0.5 + (st.skill * 0.45);
        if (r() < p) {
          const n = randInt(r, 1, 4);
          const best = clamp(round1((st.skill * 10) + ((r() - 0.45) * 3.4)), 1, 10);
          const lo = Math.max(0, asg._dueDays);
          const hi = Math.max(lo, asg._createdDays - 1);
          for (let i = 0; i < n; i += 1) {
            const nota = i === n - 1 ? best : clamp(round1(best - (0.4 + (r() * 2.8))), 0.5, best);
            attempts.push([randInt(r, lo, hi), nota]);
          }
          attempts.sort((a, b) => b[0] - a[0]);
        }
      }
      if (!attempts.length) {
        matrix.set(key, { best_nota: null, best_score: null, attempts: 0, last_attempt: null });
        continue;
      }
      const sessions = attempts.map(([d, nota]) => makeSession({
        r, userId: st.id, app: asg, subject: asg._subject, level: pool.level, grade: pool.grade,
        mode: 'test', nota, createdAt: momentOnDay(now, r, d), skill: st.skill,
      }));
      sessions.forEach((s) => pushTaskSession(st.id, s));
      matrix.set(key, {
        best_nota: Math.max(...sessions.map((s) => s.nota)),
        best_score: Math.max(...sessions.map((s) => s.score)),
        attempts: sessions.length,
        last_attempt: sessions.map((s) => s.created_at).sort().pop(),
      });
    }
  }

  // ─── Partidas por usuario (perezoso + memo) ───────────────────────────────
  const sessionCache = new Map();
  const taskAppIdsByGroup = new Map();
  for (const a of assignments) {
    if (!taskAppIdsByGroup.has(a.group_id)) taskAppIdsByGroup.set(a.group_id, new Set());
    taskAppIdsByGroup.get(a.group_id).add(a.app_id);
  }
  function studentSessions(st) {
    const pool = APP_POOLS[st.group_key];
    const isLucia = st.id === IDS.lucia;
    const r = rngFor(`count:${st.id}`);
    const count = isLucia ? 53 : 6 + Math.floor(st.skill * 38) + randInt(r, 0, 10);
    const random = randomSessions({
      now, userId: st.id, pool, count, skill: isLucia ? 0.88 : st.skill, seed: `sessions:${st.id}`,
      testRatio: 0.32, activeDays: isLucia ? [0, 1, 2, 3, 4, 5, 6] : [],
    });
    // Las apps con tarea solo cuentan como práctica fuera de la tarea: así la
    // "mejor nota" de cada tarea es exactamente la de la matriz.
    const taskApps = taskAppIdsByGroup.get(st.group_id) || new Set();
    random.forEach((s) => { if (taskApps.has(s.app_id)) s.mode = 'practice'; });
    return [...(taskSessions.get(st.id) || []), ...random];
  }
  const teacherPools = [
    [APP_POOLS['3B'], 16], [APP_POOLS['1A'], 12], [APP_POOLS['2BACH'], 6],
  ];
  const primariaPool = {
    level: 'primaria', grade: '4',
    apps: [
      [APPS.sumas, 'matematicas', 3], [APPS.multiplicaciones, 'matematicas', 4], [APPS.supermercado, 'matematicas', 3],
      [APPS.rosco, 'lengua', 3], [APPS.ahorcado, 'lengua', 2], [APPS.parejas, 'ingles', 2], [APPS.memoria, 'ciencias-naturales', 2],
    ],
  };
  function adultSessions(userId) {
    if (userId === IDS.teacherEdu) {
      const out = [];
      teacherPools.forEach(([pool, count], i) => {
        out.push(...randomSessions({ now, userId, userType: 'teacher', pool, count, skill: 0.93, seed: `teacher:${i}`, testRatio: 0.45, spanDays: 30 }));
      });
      out.push(...randomSessions({ now, userId, userType: 'teacher', pool: primariaPool, count: 5, skill: 0.95, seed: 'teacher:prim', testRatio: 0.4, spanDays: 30 }));
      return out;
    }
    if (userId === IDS.freeMarta) {
      return [
        ...randomSessions({ now, userId, userType: 'teacher', pool: primariaPool, count: 18, skill: 0.78, seed: 'free:prim', testRatio: 0.4, spanDays: 40, activeDays: [0, 1, 2] }),
        ...randomSessions({ now, userId, userType: 'teacher', pool: APP_POOLS['1A'], count: 8, skill: 0.7, seed: 'free:eso', testRatio: 0.3, spanDays: 40 }),
      ];
    }
    return [];
  }
  function sessionsFor(userId) {
    if (!sessionCache.has(userId)) {
      const st = byId.get(userId);
      const list = st ? studentSessions(st) : adultSessions(userId);
      list.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
      sessionCache.set(userId, list);
    }
    return sessionCache.get(userId);
  }

  // ─── Batallas (quiz_battle_sessions) ───────────────────────────────────────
  const battles = [];
  function buildBattles(groupId, hostId, dayList, fixedRanks = {}) {
    const g = groupDefById.get(groupId);
    const roster = byGroup.get(groupId);
    dayList.forEach((d, i) => {
      const r = rngFor(`battle:${groupId}:${i}`);
      let code = '';
      for (let k = 0; k < 6; k += 1) code += ROOM_ALPHABET[randInt(r, 0, ROOM_ALPHABET.length - 1)];
      const nPlayers = Math.min(roster.length, randInt(r, roster.length - 7, roster.length - 1));
      const fixed = Object.entries(fixedRanks).map(([sid, ranks]) => [sid, ranks[i]]).filter(([, rk]) => rk);
      const fixedIds = new Set(fixed.map(([sid]) => sid));
      const others = roster
        .filter((s) => !fixedIds.has(s.id))
        .map((s) => ({ s, k: s.skill + ((r() - 0.5) * 0.5) }))
        .sort((a, b) => b.k - a.k)
        .slice(0, nPlayers - fixed.length)
        .map((x) => x.s);
      const ordered = others.slice();
      fixed.sort((a, b) => a[1] - b[1]).forEach(([sid, rk]) => ordered.splice(rk - 1, 0, byId.get(sid)));
      const totalQ = [10, 12, 15][randInt(r, 0, 2)];
      let score = randInt(r, 8400, 9700);
      const players = ordered.map((s, idx) => {
        if (idx > 0) score -= randInt(r, 140, 520);
        const correct = clamp(Math.round(totalQ * (0.97 - (idx * 0.035) + ((r() - 0.5) * 0.08))), 1, totalQ);
        return {
          rank: idx + 1, display_name: s.display_name, avatar_emoji: s.avatar_emoji, score: Math.max(score, 300),
          correct_answers: correct, user_type: 'student', user_id: s.id, in_group: true,
          _selected_avatar_code: s.selected_avatar_code, _total_questions: totalQ,
        };
      });
      battles.push({
        room_code: code,
        group_id: groupId,
        host_id: hostId,
        created_at: daysAgo(now, d, 12, 10 + i),
        level: g.level,
        grade: g.grade,
        subject_id: g.subject_id,
        term: currentTerm,
        total_questions: totalQ,
        time_per_question: [15, 20, 20, 30][randInt(r, 0, 3)],
        player_count: players.length,
        group_player_count: players.length,
        players,
      });
    });
  }
  buildBattles(IDS.group3B, IDS.teacherEdu, [30, 26, 22, 18, 13, 9, 5, 2], { [IDS.lucia]: [1, 4, 1, 2, 6, 1, 2, 5] });
  buildBattles(IDS.group1A, IDS.teacherEdu, [28, 17, 10, 3]);
  buildBattles(IDS.group2Bach, IDS.teacherCarmen, [25, 12, 6]);
  battles.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));

  function quizStatsFor(studentId) {
    const mine = [];
    for (const b of battles) {
      const p = b.players.find((x) => x.user_id === studentId);
      if (p) mine.push({ ...p, total_questions: b.total_questions });
    }
    if (!mine.length) {
      return { total_played: 0, total_wins: 0, total_podium: 0, total_correct: 0, total_questions: 0, avg_rank: null, avg_score: null, best_score: 0, avg_accuracy: 0 };
    }
    const tc = mine.reduce((a, p) => a + p.correct_answers, 0);
    const tq = mine.reduce((a, p) => a + p.total_questions, 0);
    return {
      total_played: mine.length,
      total_wins: mine.filter((p) => p.rank === 1).length,
      total_podium: mine.filter((p) => p.rank <= 3).length,
      total_correct: tc,
      total_questions: tq,
      avg_rank: round1(mine.reduce((a, p) => a + p.rank, 0) / mine.length),
      avg_score: Math.round(mine.reduce((a, p) => a + p.score, 0) / mine.length),
      best_score: Math.max(...mine.map((p) => p.score)),
      avg_accuracy: tq ? round1((tc / tq) * 100) : 0,
    };
  }

  // ─── Duelos ────────────────────────────────────────────────────────────────
  const S = (name) => byName(name).id;
  const duelSpecs = [
    // 3º ESO B
    { n: 1, g: IDS.group3B, ch: S('Hugo Navarro'), op: lucia.id, app: APPS.snake, stake: 0.2, status: 'pending', d: 0.12 },
    { n: 2, g: IDS.group3B, ch: daniel.id, op: lucia.id, app: APPS.snake, stake: 0.1, status: 'pending', d: 1, hidden: true, pair: PAIR(1) },
    { n: 3, g: IDS.group3B, ch: lucia.id, op: S('Álex Romero'), app: APPS.ordenaBolas, stake: 0, status: 'pending', d: 0.2 },
    { n: 4, g: IDS.group3B, ch: paula.id, op: mario.id, app: APPS.snake, stake: 0.1, status: 'pending', d: 1, hidden: true, pair: PAIR(2) },
    { n: 5, g: IDS.group3B, ch: lucia.id, op: S('Hugo Navarro'), app: APPS.ordenaBolas, stake: 0.1, status: 'finished', winner: lucia.id, d: 6 },
    { n: 6, g: IDS.group3B, ch: S('Iker Ramos'), op: lucia.id, app: APPS.snake, stake: 0.1, status: 'finished', winner: S('Iker Ramos'), d: 9 },
    { n: 7, g: IDS.group3B, ch: S('Sara Vidal'), op: S('Bruno Ortiz'), app: APPS.ahorcado, stake: 0.3, status: 'finished', winner: S('Sara Vidal'), d: 4, bestOf: 3 },
    { n: 8, g: IDS.group3B, ch: S('Claudia Vega'), op: S('Marcos León'), app: APPS.rosco, stake: 0.1, status: 'void', voidReason: 'timeout', d: 8 },
    { n: 9, g: IDS.group3B, ch: S('Noa Ferrer'), op: S('Enzo Prieto'), app: APPS.snake, stake: 0.2, status: 'rejected', d: 2 },
    { n: 10, g: IDS.group3B, ch: S('Martina López'), op: lucia.id, app: APPS.ahorcado, stake: 0.1, status: 'finished', winner: lucia.id, d: 12, hidden: true, pair: PAIR(3) },
    { n: 11, g: IDS.group3B, ch: lucia.id, op: S('Carla Benítez'), app: APPS.snake, stake: 0.1, status: 'finished', winner: lucia.id, d: 20, hidden: true, pair: PAIR(4) },
    { n: 12, g: IDS.group3B, ch: S('Adrián Molina'), op: S('Valeria Cano'), app: APPS.ahorcado, stake: 0, status: 'finished', winner: S('Valeria Cano'), d: 3 },
    { n: 13, g: IDS.group3B, ch: S('Javier Peña'), op: S('Diego Serrano'), app: APPS.rosco, stake: 0.2, status: 'in_progress', d: 0.05 },
    // Retos del docente (sin grupo)
    { n: 14, g: null, chType: 'teacher', ch: IDS.teacherEdu, op: S('Sara Vidal'), app: APPS.ahorcado, stake: 0, status: 'accepted', d: 0.6 },
    { n: 15, g: null, chType: 'teacher', ch: IDS.teacherEdu, op: S('Pablo Ortega'), app: APPS.snake, stake: 0, status: 'pending', d: 0.1 },
  ];
  // 1º ESO A: algunos duelos generados
  {
    const r = rngFor('duels:1A');
    const roster = byGroup.get(IDS.group1A);
    const statuses = ['finished', 'finished', 'finished', 'pending', 'void', 'finished'];
    statuses.forEach((status, i) => {
      const a = roster[randInt(r, 0, roster.length - 1)];
      let b = roster[randInt(r, 0, roster.length - 1)];
      if (b.id === a.id) b = roster[(roster.indexOf(a) + 1) % roster.length];
      duelSpecs.push({
        n: 30 + i, g: IDS.group1A, ch: a.id, op: b.id, app: [APPS.snake, APPS.rosco, APPS.ahorcado, APPS.ordenaBolas][i % 4],
        stake: [0.1, 0.2, 0, 0.1, 0.3, 0.1][i], status, winner: status === 'finished' ? (r() < 0.5 ? a.id : b.id) : null,
        voidReason: status === 'void' ? 'abandon' : null, d: 2 + (i * 4),
      });
    });
  }
  const duels = duelSpecs.map((s) => {
    const g = s.g ? groupDefById.get(s.g) : groupDefById.get(byId.get(s.op).group_id);
    const created = when(now, s.d);
    const accepted = ['accepted', 'in_progress', 'finished'].includes(s.status) ? when(now, Math.max(0, s.d - 0.02)) : null;
    const isTask = !!s.pair;
    return {
      id: DUEL(s.n),
      group_id: s.g,
      challenger_id: s.ch,
      challenger_type: s.chType || 'student',
      opponent_id: s.op,
      opponent_type: 'student',
      app_id: s.app.app_id,
      app_name: s.app.app_name,
      level: g.level,
      grade: g.grade,
      subject_id: g.subject_id,
      stake: s.stake,
      best_of: s.bestOf || 1,
      is_hidden: !!s.hidden,
      status: s.status,
      winner_id: s.winner || null,
      winner_type: s.winner ? 'student' : null,
      void_reason: s.voidReason || null,
      created_at: created,
      accepted_at: accepted,
      started_at: ['in_progress', 'finished'].includes(s.status) ? accepted : null,
      finished_at: s.status === 'finished' || s.status === 'void' ? when(now, Math.max(0, s.d - 0.03)) : null,
      assignment_pair_id: s.pair || null,
      is_task: isTask,
      // Duelo-tarea: ambos empiezan ocultos; personales: visibles.
      challenger_revealed: !(isTask || s.hidden),
      opponent_revealed: !(isTask || s.hidden),
    };
  });
  const duelById = new Map(duels.map((d) => [d.id, d]));

  // Ledger de nota: personales con apuesta → ±stake; duelo-tarea → +0,10 al ganador.
  const ledger = [];
  for (const d of duels) {
    if (d.status !== 'finished' || !d.winner_id || d.challenger_type !== 'student') continue;
    const loser = d.winner_id === d.challenger_id ? d.opponent_id : d.challenger_id;
    if (d.is_task) {
      ledger.push({ duel_id: d.id, student_id: d.winner_id, delta: 0.1, reason: 'task_win', created_at: d.finished_at, is_task: true, group_id: d.group_id });
    } else if (Number(d.stake) > 0) {
      ledger.push({ duel_id: d.id, student_id: d.winner_id, delta: Number(d.stake), reason: 'duel_win', created_at: d.finished_at, is_task: false, group_id: d.group_id });
      ledger.push({ duel_id: d.id, student_id: loser, delta: -Number(d.stake), reason: 'duel_loss', created_at: d.finished_at, is_task: false, group_id: d.group_id });
    }
  }
  const debts = {
    [IDS.lucia]: [{
      duel_id: DUEL(6), app_id: APPS.snake.app_id, app_name: APPS.snake.app_name, level: 'eso', grade: '3',
      subject_id: 'lengua', original_stake: 0.1, remaining: 0.05, finished_at: duelById.get(DUEL(6)).finished_at,
    }],
  };
  const duelsWonBy = (sid) => duels.filter((d) => d.status === 'finished' && d.winner_id === sid).length;

  function actorInfo(id, type) {
    if (type === 'teacher') {
      const t = teacherById.get(id);
      return {
        id, name: t?.display_name || 'Docente', emoji: t?.avatar_emoji || '🎓',
        color: t?.avatar_color || 'from-blue-500 to-purple-500', selected_avatar_code: t?.selected_avatar_code || null, is_teacher: true,
      };
    }
    const s = byId.get(id);
    return {
      id, name: s?.display_name, emoji: s?.avatar_emoji, color: s?.avatar_color,
      selected_avatar_code: s?.selected_avatar_code || null, is_teacher: false,
    };
  }

  // ─── Avatares ──────────────────────────────────────────────────────────────
  const avatarCatalog = avatars.map((a) => ({
    code: a.code, title: a.title, description: a.description, rarity: a.rarity,
    points_bonus: Number(a.points_bonus || 0), image_lg: a.image_lg, image_md: a.image_md, image_sm: a.image_sm,
    unlock_label: a.unlock_label, unlock_requirement: a.unlock_requirement || a.unlock || null, sort_order: a.sort_order,
  })).sort((x, y) => x.sort_order - y.sort_order);
  const avatarByCode = new Map(avatarCatalog.map((a) => [a.code, a]));
  const ownedAvatars = new Map([
    [IDS.lucia, new Map([['avatar_031', daysAgo(now, 32)], ['avatar_082', daysAgo(now, 30)], ['avatar_005', daysAgo(now, 11, 18)]])],
    [IDS.teacherEdu, new Map([
      ['avatar_031', daysAgo(now, 300)], ['avatar_090', daysAgo(now, 290)], ['avatar_057', daysAgo(now, 200)],
      ['avatar_077', daysAgo(now, 180)], ['avatar_017', daysAgo(now, 60)], ['avatar_093', daysAgo(now, 20)],
    ])],
    [IDS.freeMarta, new Map([['avatar_031', daysAgo(now, 55)], ['avatar_090', daysAgo(now, 54)]])],
  ]);
  function ownedFor(userId) {
    if (!ownedAvatars.has(userId)) {
      const st = byId.get(userId);
      const m = new Map();
      if (st) {
        const r = rngFor(`avatars:${userId}`);
        if (st.selected_avatar_code) m.set(st.selected_avatar_code, daysAgo(now, randInt(r, 2, 25)));
        ['avatar_031', 'avatar_090', 'avatar_082', 'avatar_085'].forEach((c, i) => {
          if (r() < 0.8 - (i * 0.18)) m.set(c, daysAgo(now, randInt(r, 5, 33)));
        });
      }
      ownedAvatars.set(userId, m);
    }
    return ownedAvatars.get(userId);
  }
  function avatarBonusFor(userId) {
    const owned = ownedFor(userId);
    let sum = 0;
    for (const code of owned.keys()) sum += avatarByCode.get(code)?.points_bonus || 0;
    return { bonus: round2(Math.min(0.5, sum)), count: owned.size };
  }

  // ─── Nivel / XP ────────────────────────────────────────────────────────────
  const fixedXp = { [IDS.lucia]: 12890, [IDS.teacherEdu]: 21430, [IDS.freeMarta]: 2780, [IDS.teacherLaura]: 6120, [IDS.teacherCarmen]: 9400 };
  function xpFor(userId) {
    if (fixedXp[userId] != null) return fixedXp[userId];
    const st = byId.get(userId);
    if (!st) return 0;
    const r = rngFor(`xp:${userId}`);
    return Math.round((sessionsFor(userId).length * (140 + (st.skill * 160))) + randInt(r, 0, 900));
  }
  const levelFor = (userId) => levelForXp(xpFor(userId));

  // ─── Nota por evaluación (réplica de _compute_student_term_grades) ─────────
  function termGradesFor(studentId) {
    const st = byId.get(studentId);
    if (!st) return { error: 'Alumno no encontrado' };
    const gid = st.group_id;
    const level = levelFor(studentId);
    const progress = progressBonusForLevel(level);
    const { bonus: avatarBonus, count: avatarCount } = avatarBonusFor(studentId);
    const asgs = assignments.filter((a) => a.group_id === gid && (!a.student_id || a.student_id === studentId));
    const rows = asgs.map((a) => {
      const m = matrix.get(`${a.id}|${studentId}`) || {};
      const nota = Number(m.best_nota || 0);
      return { term: a.term, weight: Math.max(1, a.weight || 1), nota: clamp(nota, 0, 10), completed: nota >= a.min_score };
    });
    const myLedger = ledger.filter((l) => l.student_id === studentId && l.group_id === gid);
    const termCalc = (term) => {
      const tr = rows.filter((x) => x.term === term);
      const weightSum = tr.reduce((a, x) => a + x.weight, 0);
      const weighted = tr.reduce((a, x) => a + (x.nota * x.weight), 0);
      let bScore = 0;
      const counts = { first: 0, second: 0, third: 0 };
      for (const b of battles) {
        if (b.group_id !== gid || b.term !== term || b.player_count < 2) continue;
        const p = b.players.find((x) => x.user_id === studentId);
        if (!p || p.rank > 3) continue;
        bScore += [1, 2 / 3, 1 / 3][p.rank - 1];
        counts[['first', 'second', 'third'][p.rank - 1]] += 1;
      }
      const dl = term === currentTerm ? myLedger : [];
      const taskDelta = dl.filter((l) => l.is_task).reduce((a, l) => a + l.delta, 0);
      const persDelta = dl.filter((l) => !l.is_task).reduce((a, l) => a + l.delta, 0);
      const battleBonus = battleBonusForScore(bScore);
      const taskBonus = round3(Math.min(0.5, Math.max(0, taskDelta)));
      const personalBonus = round3(persDelta);
      const duelBonus = round3(clamp(taskBonus + personalBonus, -0.5, 0.5));
      const bonusSum = battleBonus + duelBonus + progress + avatarBonus;
      let finalGrade = null;
      if (weightSum > 0) finalGrade = round2(clamp(((weighted / weightSum) * 0.9) + bonusSum, 0, 10));
      else if (bonusSum !== 0) finalGrade = round2(clamp(bonusSum, 0, 10));
      return {
        term,
        total: tr.length,
        completed: tr.filter((x) => x.completed).length,
        base_grade: weightSum > 0 ? round1(weighted / weightSum) : null,
        battle_bonus: battleBonus,
        battle_score: round2(bScore),
        battle_counts: counts,
        duel_bonus: duelBonus,
        duel_task_bonus: taskBonus,
        duel_personal_bonus: personalBonus,
        duel_counts: {
          task_wins: dl.filter((l) => l.is_task && l.delta > 0).length,
          task_losses: dl.filter((l) => l.is_task && l.delta < 0).length,
          personal_wins: dl.filter((l) => !l.is_task && l.delta > 0).length,
          personal_losses: dl.filter((l) => !l.is_task && l.delta < 0).length,
        },
        progress_bonus: progress,
        avatar_bonus: avatarBonus,
        bonus_total: round2(bonusSum),
        final_grade: finalGrade,
        _weightSum: weightSum,
        _weighted: weighted,
        _taskDelta: taskDelta,
      };
    };
    const all = [1, 2, 3].map(termCalc);
    const strip = (t) => Object.fromEntries(Object.entries(t).filter(([k]) => !k.startsWith('_')));
    const visibleTerms = all.filter((t) => t.total > 0 || t.battle_bonus !== 0 || (t.duel_task_bonus + t.duel_personal_bonus) !== 0);
    const ws = all.reduce((a, t) => a + t._weightSum, 0);
    const wn = all.reduce((a, t) => a + t._weighted, 0);
    const bScoreTotal = all.reduce((a, t) => a + t.battle_score, 0);
    const taskTotal = round3(Math.min(0.5, Math.max(0, all.reduce((a, t) => a + t._taskDelta, 0))));
    const persTotal = round3(all.reduce((a, t) => a + t.duel_personal_bonus, 0));
    const duelTotal = round3(clamp(taskTotal + persTotal, -0.5, 0.5));
    const battleTotal = battleBonusForScore(bScoreTotal);
    const ct = { ...strip(all[currentTerm - 1]) };
    delete ct.bonus_total;
    const sumCounts = (k) => all.reduce((a, t) => a + t.duel_counts[k], 0);
    return {
      success: true,
      level,
      progress_bonus: progress,
      avatar_bonus: avatarBonus,
      avatar_count: avatarCount,
      current_term: currentTerm,
      progress_reset_at: null,
      terms: visibleTerms.map(strip),
      current_term_data: ct,
      final_grade_base: ws > 0 ? round1(wn / ws) : null,
      battle_bonus_total: battleTotal,
      battle_score_total: round2(bScoreTotal),
      duel_bonus_total: duelTotal,
      duel_task_bonus_total: taskTotal,
      duel_personal_bonus_total: persTotal,
      duel_counts_total: {
        task_wins: sumCounts('task_wins'), task_losses: sumCounts('task_losses'),
        personal_wins: sumCounts('personal_wins'), personal_losses: sumCounts('personal_losses'),
      },
      final_grade: ws > 0 ? round2(clamp(((wn / ws) * 0.9) + battleTotal + duelTotal + progress + avatarBonus, 0, 10)) : null,
      total_assignments: rows.length,
      completed_assignments: rows.filter((x) => x.completed).length,
    };
  }

  // ─── Estadísticas para requisitos de avatares / frases ─────────────────────
  const extraStats = {
    [IDS.lucia]: { streak_days: 7, apps_rated: 4, feedback_messages: 3, badges_count: 20, top_class: 1 },
    [IDS.teacherEdu]: { apps_rated: 14, feedback_messages: 9, badges_count: 25 },
    [IDS.freeMarta]: { apps_rated: 2, feedback_messages: 2, badges_count: 9 },
  };
  const statsCache = new Map();
  function statsFor(userId) {
    if (statsCache.has(userId)) return statsCache.get(userId);
    const sessions = sessionsFor(userId);
    const tuple = (s) => [s.app_id, s.level, s.grade, s.subject_id].join('|');
    const tests = sessions.filter((s) => s.mode === 'test');
    const perApp = new Map();
    sessions.forEach((s) => perApp.set(s.app_id, (perApp.get(s.app_id) || 0) + 1));
    const perAppPerfect = new Map();
    tests.filter((s) => s.nota >= 9.95).forEach((s) => perAppPerfect.set(s.app_id, (perAppPerfect.get(s.app_id) || 0) + 1));
    const extra = extraStats[userId] || {};
    const out = {
      sessions,
      tests,
      tuple,
      total_sessions: sessions.length,
      unique_apps: new Set(sessions.map(tuple)).size,
      level: levelFor(userId),
      xp: xpFor(userId),
      duels_won: duelsWonBy(userId) + (byId.has(userId) ? 0 : 1),
      battles_won: battles.filter((b) => b.players[0]?.user_id === userId).length,
      streak_days: extra.streak_days ?? currentStreak(sessions, now),
      apps_rated: extra.apps_rated ?? 0,
      feedback_messages: extra.feedback_messages ?? 0,
      badges_count: extra.badges_count ?? 0,
      top_class: extra.top_class ?? 0,
      same_app_sessions: Math.max(0, ...perApp.values()),
      same_app_perfect_exams: Math.max(0, ...perAppPerfect.values()),
    };
    statsCache.set(userId, out);
    return out;
  }

  function evalRequirement(req, st) {
    if (!req || !req.type) return { progress: 0, target: 1 };
    const count = Number(req.count ?? req.value ?? 1);
    const distinctTests = (pred) => new Set(st.tests.filter(pred).map(st.tuple)).size;
    switch (req.type) {
      case 'first_session': return { progress: Math.min(1, st.total_sessions), target: 1 };
      case 'total_sessions': {
        const n = req.mode ? st.sessions.filter((s) => s.mode === req.mode).length : st.total_sessions;
        return { progress: n, target: count };
      }
      case 'unique_apps': return { progress: st.unique_apps, target: count };
      case 'app_sessions': {
        const n = st.sessions.filter((s) => s.app_id === req.app_id && (!req.mode || s.mode === req.mode) && (req.min_nota == null || s.nota >= req.min_nota)).length;
        return { progress: n, target: count };
      }
      case 'subject_exams':
        return { progress: distinctTests((s) => s.subject_id === req.subject_id && (req.min_nota == null || s.nota >= req.min_nota)), target: count };
      case 'perfect_exams': return { progress: distinctTests((s) => s.nota >= 9.95), target: count };
      case 'high_score_exams': return { progress: distinctTests((s) => s.nota >= Number(req.min_nota || 8)), target: count };
      case 'fast_exams':
        return { progress: st.tests.filter((s) => s.duration_seconds <= Number(req.max_seconds || 60) && s.nota >= Number(req.min_nota || 5)).length, target: count };
      case 'same_app_sessions': return { progress: st.same_app_sessions, target: count };
      case 'same_app_perfect_exams': return { progress: st.same_app_perfect_exams, target: count };
      case 'level': return { progress: st.level, target: Number(req.value ?? req.count ?? 1) };
      case 'xp': return { progress: st.xp, target: Number(req.value ?? req.count ?? 1) };
      case 'duels_won': return { progress: st.duels_won, target: count };
      case 'battles_won': return { progress: st.battles_won, target: count };
      case 'badges_count': return { progress: st.badges_count, target: count };
      case 'streak_days': return { progress: st.streak_days, target: count };
      case 'apps_rated': return { progress: st.apps_rated, target: count };
      case 'feedback_messages': return { progress: st.feedback_messages, target: count };
      case 'top_class': return { progress: st.top_class ? 1 : 0, target: 1 };
      case 'top_global': return { progress: 0, target: 1 };
      case 'combined': {
        const parts = (req.requirements || []).map((x) => evalRequirement(x, st));
        return {
          progress: parts.reduce((a, p) => a + Math.min(p.progress, p.target), 0),
          target: parts.reduce((a, p) => a + p.target, 0) || 1,
        };
      }
      default: return { progress: 0, target: count || 1 };
    }
  }
  const pctOf = (p, t) => (t > 0 ? Math.min(100, Math.round((p / t) * 100)) : 0);

  function avatarCollectionFor(userId, selectedCode) {
    const owned = ownedFor(userId);
    const st = statsFor(userId);
    return avatarCatalog.map((a) => {
      const ev = evalRequirement(a.unlock_requirement, st);
      const isOwned = owned.has(a.code);
      const target = Math.max(1, ev.target);
      const progress = isOwned ? target : Math.min(ev.progress, target - 1);
      return {
        ...a,
        owned: isOwned,
        earned_at: owned.get(a.code) || null,
        selected: a.code === selectedCode,
        progress,
        target,
        pct: pctOf(progress, target),
      };
    });
  }

  // ─── Frases de duelo ───────────────────────────────────────────────────────
  const phraseCatalog = PHRASES.map((p, i) => ({ ...p, id: mockId('9a5e', i + 1) }));
  const phraseByCode = new Map(phraseCatalog.map((p) => [p.code, p]));
  const phraseSlots = new Map([
    [IDS.lucia, ['default_01', 'spicy_17', 'default_11', 'default_20']],
    [IDS.teacherEdu, ['default_02', 'default_05', 'default_14', 'default_23']],
  ]);
  function phrasesFor(userId) {
    const st = statsFor(userId);
    const slotsCodes = phraseSlots.get(userId) || ['default_01', 'default_05', 'default_13', 'default_20'];
    const slots = slotsCodes
      .map((code, slot) => (code ? { slot, ...phraseShape(phraseByCode.get(code)) } : null))
      .filter(Boolean);
    const unlocked = [];
    const locked = [];
    for (const p of phraseCatalog) {
      if (p.is_default) continue;
      const ev = evalRequirement(p.unlock_requirement, st);
      if (ev.progress >= ev.target) unlocked.push(p);
      else locked.push({ ...phraseShape(p), unlock_requirement: p.unlock_requirement, progress: { progress: ev.progress, target: ev.target, pct: pctOf(ev.progress, ev.target) } });
    }
    const available = [
      ...phraseCatalog.filter((p) => p.is_default).map((p) => ({ ...phraseShape(p), is_default: true, unlocked: false })),
      ...unlocked.map((p) => ({ ...phraseShape(p), is_default: false, unlocked: true })),
    ];
    return { slots, available, locked };
  }
  function phraseShape(p) {
    return { phrase_id: p.id, code: p.code, text: p.text, emoji: p.emoji, category: p.category, rarity: p.rarity };
  }
  function setPhraseSlot(userId, slot, phraseId) {
    const codes = (phraseSlots.get(userId) || ['default_01', 'default_05', 'default_13', 'default_20']).slice();
    const p = phraseId ? phraseCatalog.find((x) => x.id === phraseId) : null;
    codes[slot] = p ? p.code : null;
    phraseSlots.set(userId, codes);
  }

  // ─── Insignias / gamificación ──────────────────────────────────────────────
  const earnedBadges = new Map([
    [IDS.lucia, {
      first_game: 33, games_5: 32, games_10: 29, games_25: 21, games_50: 6, first_exam: 31, exams_3: 27,
      exams_10: 9, perfect_1: 24, perfect_5: 4, apps_3: 32, apps_10: 15, streak_3: 25, streak_7: 1,
      battle_win_1: 30, battle_win_3: 9, perfect_5_apps: 4, speed_perf_30: 12, rank_class1_5: 8, speed_perfect: 3,
    }],
    [IDS.teacherEdu, {
      teacher_first_group: 400, teacher_groups_3: 33, teacher_students_5: 398, teacher_students_25: 300,
      teacher_students_50: 31, teacher_first_task: 395, teacher_tasks_5: 380, teacher_tasks_15: 210,
      teacher_tasks_30: 18, teacher_first_battle: 360, teacher_battles_5: 300, teacher_battles_15: 41,
      teacher_first_message: 399, teacher_messages_10: 350, teacher_messages_25: 120, teacher_days_7: 403,
      teacher_days_30: 380, teacher_days_90: 320, teacher_first_rating: 390, teacher_ratings_10: 150,
      first_game: 409, games_5: 405, games_10: 401, apps_3: 404, perfect_1: 300,
    }],
    [IDS.freeMarta, {
      first_game: 57, games_5: 50, games_10: 31, apps_1: 57, apps_3: 44, streak_2: 40, time_30m: 38, perfect_1: 20, first_exam: 45,
    }],
  ]);
  function gamificationFor(userId) {
    const earned = earnedBadges.get(userId) || {};
    const xp = xpFor(userId);
    const level = levelForXp(xp);
    const earnedAt = (code) => daysAgo(now, earned[code], 18, (earned[code] * 7) % 60);
    const all = BADGES.map((b) => ({ ...b, earned: earned[b.code] != null }))
      .sort((a, b) => a.sort_order - b.sort_order);
    const earnedList = BADGES.filter((b) => earned[b.code] != null)
      .map((b) => {
        const row = { ...b, earned_at: earnedAt(b.code) };
        delete row.sort_order;
        return row;
      })
      .sort((a, b) => (a.earned_at < b.earned_at ? 1 : -1));
    // StudentLogrosTab muestra la fecha si viene earned_at en all_badges.
    all.forEach((b) => { if (b.earned) b.earned_at = earnedAt(b.code); });
    return {
      success: true,
      total_xp: xp,
      level,
      xp_for_current_level: xpForLevel(level),
      xp_for_next_level: xpForLevel(level + 1),
      earned_badges: earnedList,
      all_badges: all,
      total_earned: earnedList.length,
      total_available: BADGES.length,
    };
  }

  // ─── Chat de grupo ─────────────────────────────────────────────────────────
  let msgSeq = 0;
  const msg = (gid, studentId, senderType, senderId, senderName, text, iso) => {
    msgSeq += 1;
    return { id: mockId('3e55', msgSeq), group_id: gid, student_id: studentId, sender_type: senderType, sender_id: senderId, sender_name: senderName, message: text, created_at: iso };
  };
  const edu = teachers.edu;
  const T = (gid, text, d, h = 9, by = edu) => msg(gid, null, 'teacher', by.id, by.display_name, text, daysAgo(now, d, h, 5));
  const chat = [
    T(IDS.group3B, '¡Bienvenidos a 3º B! 👋 Este trimestre trabajaremos con las apps de la plataforma. Recordad: las tareas en modo examen son las que cuentan para la nota.', 33, 8),
    T(IDS.group3B, 'Nueva tarea: Rosco del vocabulario del Tema 2. Tenéis hasta el día 10. ¡Se puede repetir las veces que queráis!', 24, 9),
    T(IDS.group3B, 'Recordad entregar el comentario de texto del Lazarillo el viernes. Os he dejado un crucigrama para repasar los personajes 📚', 2, 16, teachers.laura),
    T(IDS.group3B, 'Mañana hacemos Batalla en clase ⚡ ¡Traed la tablet cargada!', 6, 18),
    T(IDS.group3B, 'He asignado duelos 1 vs 1 de Snake. Solo se pueden jugar en horario de clase y si ganáis sumáis +0,10 a vuestro bonus de duelos 🐍', 1, 12),
    T(IDS.group1A, '¡Hola 1º A! Esta semana empezamos con fracciones. Tenéis la primera tarea en el panel.', 22, 8),
    T(IDS.group1A, 'El examen de evaluación (Millonario) cuenta triple. Practicad antes en modo fácil.', 5, 17),
    T(IDS.group1A, 'Felicidades a los tres primeros de la batalla de hoy 🏆', 3, 13),
    T(IDS.group2Bach, 'Os dejo el simulacro tipo PAU. Hacedlo en modo examen y sin apuntes.', 6, 10, teachers.carmen),
    T(IDS.group2Bach, 'Hola, soy Edu: os he añadido una tarea de comentario de fuentes para practicar la parte práctica.', 4, 12),
  ];
  const thread = (gid, st, lines) => lines.forEach(([who, text, d, h]) => {
    chat.push(who === 'S'
      ? msg(gid, st.id, 'student', st.id, st.display_name, text, daysAgo(now, d, h, 20))
      : msg(gid, st.id, 'teacher', edu.id, edu.display_name, text, daysAgo(now, d, h, 25)));
  });
  thread(IDS.group3B, lucia, [
    ['S', 'Profe, en la sopa de letras de b/v no me aparece una palabra, ¿puede ser un error?', 6, 18],
    ['T', 'Hola Lucía, lo reviso. Si es un error lo corrijo y te aviso 👍', 6, 20],
    ['T', 'Corregido. Ya puedes volver a intentarlo cuando quieras.', 5, 9],
    ['S', '¡Gracias! ¿El examen del Millonario cuenta triple?', 2, 17],
    ['T', 'Sí, es la tarea con más peso de esta evaluación. ¡Ánimo!', 2, 19],
  ]);
  thread(IDS.group3B, byName('Hugo Navarro'), [
    ['T', 'Hugo, te falta la tarea del Ahorcado. ¿Has tenido algún problema?', 5, 10],
    ['S', 'Se me cerró la app a mitad, lo vuelvo a hacer hoy', 0, 9],
  ]);
  thread(IDS.group3B, byName('Martina López'), [
    ['S', '¿Se puede repetir el rosco para subir nota?', 1, 21],
  ]);
  thread(IDS.group3B, byName('Diego Serrano'), [
    ['S', 'No puedo entrar al duelo, me dice fuera de horario', 1, 19],
    ['T', 'Es correcto: los duelos-tarea solo se juegan en clase. Mañana lo hacemos a primera hora.', 1, 20],
    ['S', 'Vale, gracias!', 1, 20],
  ]);
  thread(IDS.group1A, byName('Pablo Ortega'), [
    ['S', 'Profe, ¿el reto de Snake cuenta para nota?', 0, 10],
  ]);
  // Último acceso del docente a cada hilo (para "no leídos").
  const teacherLastRead = new Map([[`${IDS.group3B}|${lucia.id}`, daysAgo(now, 2, 20, 0)], [`${IDS.group3B}|${byName('Diego Serrano').id}`, daysAgo(now, 1, 21, 0)]]);

  // ─── Notificaciones ────────────────────────────────────────────────────────
  let nSeq = 0;
  const notif = (type, title, message, data, read, iso) => {
    nSeq += 1;
    return { id: mockId('b311', nSeq), type, title, message, data, read, created_at: iso };
  };
  const b3 = battles.filter((b) => b.group_id === IDS.group3B);
  const notifications = new Map([
    [IDS.lucia, [
      notif('duel_invite', 'Te han retado a un duelo', '🐍 Snake', { duel_id: DUEL(1), app_id: 'snake', stake: 0.2 }, false, hoursAgo(now, 3)),
      notif('duel_invite', 'Tu profesor te asigno un duelo', '🐍 Snake', { duel_id: DUEL(2), app_id: 'snake', stake: 0.1, assignment: true }, false, hoursAgo(now, 24)),
      notif('feedback_reply', 'Respuesta a tu comentario', 'El equipo ha respondido sobre 🧩 Crucigrama', { feedback_id: mockId('fb00', 1) }, false, daysAgo(now, 2, 11)),
      notif('quiz_battle_invite', 'Quiz Battle en directo!', 'Edu Torregrosa ha abierto una batalla para 3º ESO B', { room_code: b3[0]?.room_code }, true, daysAgo(now, 2, 12)),
      notif('duel_result', 'Has ganado el duelo', '🔴 Ordena las Bolas · +0,10 a tu nota', { duel_id: DUEL(5) }, true, daysAgo(now, 6, 11)),
      notif('duel_result', 'Has perdido el duelo', '🐍 Snake · −0,10 (recuperable en modo examen)', { duel_id: DUEL(6) }, true, daysAgo(now, 9, 11)),
    ]],
    [IDS.teacherEdu, [
      notif('duel_accepted', 'Tu duelo ha sido aceptado', 'Sara Vidal ha aceptado tu reto de 🎯 Ahorcado', { duel_id: DUEL(14) }, false, hoursAgo(now, 14)),
      notif('feedback_reply', 'Respuesta a tu comentario', 'El equipo ha respondido sobre 🏰 La Fortaleza', { feedback_id: mockId('fb00', 3) }, false, daysAgo(now, 1, 10)),
      notif('feedback_resolved', 'Comentario resuelto', '🅿️ El Rosco del Saber', { feedback_id: mockId('fb00', 4) }, true, daysAgo(now, 8, 16)),
    ]],
    [IDS.freeMarta, [
      notif('feedback_reply', 'Respuesta a tu comentario', 'El equipo ha respondido sobre 🛒 Supermercado Matemático', { feedback_id: mockId('fb00', 6) }, false, daysAgo(now, 1, 18)),
    ]],
  ]);

  // ─── Comentarios / feedback de apps ───────────────────────────────────────
  let fmSeq = 0;
  const fm = (type, name, text, iso) => {
    fmSeq += 1;
    return { id: mockId('fb11', fmSeq), sender_type: type, sender_id: null, sender_name: name, message: text, created_at: iso };
  };
  const ADMIN = 'Equipo EduApps';
  const feedbacks = new Map([
    [IDS.lucia, [
      { id: mockId('fb00', 1), app_id: 'crucigrama', app_name: APPS.crucigrama.app_name, level: 'eso', grade: '3', subject_id: 'lengua', status: 'open', created_at: daysAgo(now, 3, 17), messages: [
        fm('user', 'Lucía Martín', 'En el crucigrama de 3º hay una definición que no coincide con la palabra (la 7 horizontal).', daysAgo(now, 3, 17)),
        fm('admin', ADMIN, '¡Gracias, Lucía! Lo revisamos esta semana y te avisamos en cuanto esté corregido.', daysAgo(now, 2, 11)),
      ] },
      { id: mockId('fb00', 2), app_id: 'sopa-de-letras', app_name: APPS.sopa.app_name, level: 'eso', grade: '3', subject_id: 'lengua', status: 'resolved', created_at: daysAgo(now, 7, 19), messages: [
        fm('user', 'Lucía Martín', 'Me encanta la sopa de letras, pero en móvil cuesta seleccionar en diagonal.', daysAgo(now, 7, 19)),
        fm('admin', ADMIN, 'Hemos aumentado la zona táctil en móvil. ¿Puedes probar de nuevo?', daysAgo(now, 6, 10)),
        fm('user', 'Lucía Martín', '¡Ahora va genial, gracias!', daysAgo(now, 6, 18)),
      ] },
    ]],
    [IDS.teacherEdu, [
      { id: mockId('fb00', 3), app_id: 'la-fortaleza', app_name: APPS.fortaleza.app_name, level: 'eso', grade: '3', subject_id: 'fisica', status: 'open', created_at: daysAgo(now, 4, 21), messages: [
        fm('user', 'Edu Torregrosa', 'Sería genial poder jugar La Fortaleza en duelo 1 vs 1. Mis alumnos lo piden mucho.', daysAgo(now, 4, 21)),
        fm('admin', ADMIN, 'Está en el roadmap: el motor ya está preparado para duelos. ¡Pronto!', daysAgo(now, 1, 10)),
        fm('user', 'Edu Torregrosa', '¡Genial! Avisad cuando esté para probarlo en clase.', daysAgo(now, 1, 12)),
      ] },
      { id: mockId('fb00', 4), app_id: 'rosco-del-saber', app_name: APPS.rosco.app_name, level: 'bachillerato', grade: '2', subject_id: 'historia-espana', status: 'resolved', created_at: daysAgo(now, 12, 9), messages: [
        fm('user', 'Edu Torregrosa', 'En el rosco de Historia de España de 2º Bach la definición de la letra Q está repetida.', daysAgo(now, 12, 9)),
        fm('admin', ADMIN, 'Corregido, gracias por avisar.', daysAgo(now, 8, 16)),
      ] },
      { id: mockId('fb00', 5), app_id: 'laboratorio-fisica', app_name: APPS.laboratorioFisica.app_name, level: 'eso', grade: '4', subject_id: 'fisica', status: 'open', created_at: daysAgo(now, 0, 8), messages: [
        fm('user', 'Edu Torregrosa', 'En tablets antiguas la escena del plano inclinado va a pocos FPS incluso en calidad baja.', daysAgo(now, 0, 8)),
      ] },
    ]],
    [IDS.freeMarta, [
      { id: mockId('fb00', 6), app_id: 'supermercado-matematico-4', app_name: APPS.supermercado.app_name, level: 'primaria', grade: '4', subject_id: 'matematicas', status: 'open', created_at: daysAgo(now, 3, 20), messages: [
        fm('user', 'Marta Ruiz', 'Mi hija de 4º lo usa a diario. ¿Podríais añadir céntimos en el nivel difícil?', daysAgo(now, 3, 20)),
        fm('admin', ADMIN, '¡Qué bien que le guste! Lo apuntamos para la próxima versión.', daysAgo(now, 1, 18)),
      ] },
    ]],
  ]);

  // ─── Batallas: plantillas e historial del anfitrión ───────────────────────
  const quizTemplates = new Map([
    [IDS.teacherEdu, [
      { id: mockId('7e3d', 1), name: 'Repaso Tema 2: la oración simple', description: 'Sujeto, predicado y complementos', question_count: 15, created_at: daysAgo(now, 30), updated_at: daysAgo(now, 6, 21) },
      { id: mockId('7e3d', 2), name: 'Literatura medieval', description: 'Mester de juglaría y clerecía', question_count: 12, created_at: daysAgo(now, 26), updated_at: daysAgo(now, 13, 19) },
      { id: mockId('7e3d', 3), name: 'Ortografía: b/v y g/j', description: null, question_count: 20, created_at: daysAgo(now, 21), updated_at: daysAgo(now, 18, 17) },
      { id: mockId('7e3d', 4), name: 'Fracciones exprés', description: '1º ESO · cálculo mental', question_count: 10, created_at: daysAgo(now, 19), updated_at: daysAgo(now, 10, 8) },
      { id: mockId('7e3d', 5), name: 'Lazarillo de Tormes', description: 'Personajes, tratados y crítica social', question_count: 14, created_at: daysAgo(now, 3), updated_at: daysAgo(now, 2, 22) },
    ]],
  ]);
  const hostHistory = [
    ...battles.filter((b) => b.host_id === IDS.teacherEdu),
    // Dos batallas del curso pasado (cuentan en el total, no en la cuota del mes)
    { room_code: 'K7TQ2M', created_at: daysAgo(now, 140, 12), player_count: 24, total_questions: 12, level: 'eso', grade: '2', subject_id: 'lengua', time_per_question: 20, host_id: IDS.teacherEdu },
    { room_code: 'P3XW9A', created_at: daysAgo(now, 152, 11), player_count: 26, total_questions: 15, level: 'eso', grade: '2', subject_id: 'lengua', time_per_question: 20, host_id: IDS.teacherEdu },
  ].map((b) => ({
    room_code: b.room_code, created_at: b.created_at, player_count: b.player_count, total_questions: b.total_questions,
    level: b.level, grade: b.grade, subject_id: b.subject_id, time_per_question: b.time_per_question,
    user_id: b.host_id, user_type: 'host',
  })).sort((a, b) => (a.created_at < b.created_at ? 1 : -1));

  const QUESTION_BANK = [
    ['¿Qué es un sintagma nominal?', 'Grupo de palabras cuyo núcleo es un sustantivo'],
    ['¿Quién escribió el Cantar de mio Cid?', 'Es anónimo'],
    ['Señala el complemento directo: «Leí tu carta»', 'tu carta'],
    ['¿Qué figura literaria es «tus dientes son perlas»?', 'Metáfora'],
    ['¿En qué siglo se publica el Lazarillo?', 'Siglo XVI'],
    ['¿Cuál es el sujeto en «Me gustan las fresas»?', 'las fresas'],
    ['¿Se escribe «haber» o «a ver» en «Vamos ___ la película»?', 'a ver'],
    ['¿Qué tipo de texto es una noticia?', 'Expositivo-informativo'],
    ['¿Qué es el mester de clerecía?', 'Escuela poética culta medieval'],
    ['¿Cuál es el núcleo del predicado en «Ana come manzanas»?', 'come'],
    ['Plural de «el análisis»', 'los análisis'],
    ['¿Qué tilde lleva «cómo» en una pregunta?', 'Tilde diacrítica'],
    ['¿Qué es un hiato?', 'Dos vocales seguidas en sílabas distintas'],
    ['Antónimo de «efímero»', 'Duradero'],
    ['¿Cuántos tratados tiene el Lazarillo?', 'Siete'],
  ];
  function battleDetail(roomCode) {
    const b = battles.find((x) => x.room_code === roomCode);
    if (!b) return { error: 'Batalla no encontrada' };
    const r = rngFor(`detail:${roomCode}`);
    const questions = Array.from({ length: b.total_questions }, (_, i) => ({
      question_index: i,
      question_text: QUESTION_BANK[i % QUESTION_BANK.length][0],
      correct_text: QUESTION_BANK[i % QUESTION_BANK.length][1],
    }));
    const cells = [];
    let msSum = 0;
    let msN = 0;
    for (const p of b.players) {
      const wrongIdx = new Set();
      while (wrongIdx.size < b.total_questions - p.correct_answers) wrongIdx.add(randInt(r, 0, b.total_questions - 1));
      for (const q of questions) {
        const answered = r() > 0.03;
        const ms = answered ? randInt(r, 1400, (b.time_per_question * 1000) - 800) : null;
        if (ms != null) { msSum += ms; msN += 1; }
        const ok = answered && !wrongIdx.has(q.question_index);
        cells.push({
          user_id: p.user_id, display_name: p.display_name, avatar_emoji: p.avatar_emoji, question_index: q.question_index,
          answer_index: answered ? randInt(r, 0, 3) : null, is_correct: ok, response_time_ms: ms,
          score_delta: ok ? Math.max(100, 1000 - Math.round((ms || 0) / 25)) : 0,
        });
      }
    }
    return {
      meta: { room_code: b.room_code, created_at: b.created_at, level: b.level, grade: b.grade, subject_id: b.subject_id, total_questions: b.total_questions },
      questions,
      players: b.players.map((p) => ({ user_id: p.user_id, display_name: p.display_name, avatar_emoji: p.avatar_emoji, rank: p.rank, score: p.score })),
      cells,
      avg_response_ms: msN ? Math.round(msSum / msN) : 0,
    };
  }

  // Preguntas de una plantilla (QuizTemplateEditor): opciones = correcta + 3 distractores.
  const templateQuestions = new Map();
  function templateDetail(templateId) {
    const tpl = [...quizTemplates.values()].flat().find((t) => t.id === templateId);
    if (!tpl) return null;
    if (!templateQuestions.has(templateId)) {
      const r = rngFor(`template:${templateId}`);
      const answers = QUESTION_BANK.map((q) => q[1]);
      templateQuestions.set(templateId, Array.from({ length: tpl.question_count }, (_, i) => {
        const [question, correct] = QUESTION_BANK[i % QUESTION_BANK.length];
        const wrong = answers.filter((a) => a !== correct).sort(() => r() - 0.5).slice(0, 3);
        const correctIndex = randInt(r, 0, 3);
        const options = wrong.slice();
        options.splice(correctIndex, 0, correct);
        return { question, correct, options, correctIndex, difficulty: randInt(r, 1, 3), source: i % 3 === 0 ? 'custom' : 'rosco' };
      }));
    }
    return { id: tpl.id, name: tpl.name, description: tpl.description, questions: templateQuestions.get(templateId) };
  }
  function saveTemplate(teacherId, { id, name, description, questions }) {
    const list = quizTemplates.get(teacherId) || [];
    const nowIso = new Date().toISOString();
    let tpl = id ? list.find((t) => t.id === id) : null;
    if (!tpl) {
      tpl = { id: mockId('7e3d', 0x100 + list.length + 1), created_at: nowIso };
      list.push(tpl);
      quizTemplates.set(teacherId, list);
    }
    Object.assign(tpl, { name, description: description || null, question_count: (questions || []).length, updated_at: nowIso });
    templateQuestions.set(tpl.id, questions || []);
    return tpl.id;
  }

  // ─── Sesión del alumno (lo que guarda AuthContext tras student_login) ─────
  const g3 = groupById.get(IDS.group3B);
  const studentSession = {
    id: lucia.id,
    username: lucia.username,
    display_name: lucia.display_name,
    group_id: g3.id,
    group_name: g3.name,
    group_level: g3.level,
    group_grade: g3.grade,
    group_subject_id: g3.subject_id,
    avatar_emoji: lucia.avatar_emoji,
    avatar_color: lucia.avatar_color,
    selected_avatar_code: lucia.selected_avatar_code,
    group_code: g3.group_code,
    session_token: MOCK_STUDENT_TOKEN,
  };
  const studentGroups = new Map([
    [lucia.id, [
      { group_id: g3.id, group_name: g3.name, group_code: g3.group_code, teacher_name: edu.display_name, joined_at: daysAgo(now, 34, 9) },
      { group_id: IDS.groupClub, group_name: 'Club de Lectura', group_code: 'GRP-CL24', teacher_name: teachers.carmen.display_name, joined_at: daysAgo(now, 12, 17) },
    ]],
  ]);

  return {
    now,
    currentTerm,
    IDS,
    teachers,
    teacherById,
    students,
    byGroup,
    byId,
    groups,
    groupById,
    classHours,
    assignments,
    matrix,
    sessionsFor,
    aggregateSessions: (sessions) => aggregateSessions(sessions, now),
    battles,
    quizStatsFor,
    duels,
    duelById,
    ledger,
    debts,
    actorInfo,
    termGradesFor,
    levelFor,
    xpFor,
    gamificationFor,
    avatarCatalog,
    avatarByCode,
    avatarCollectionFor,
    phrasesFor,
    setPhraseSlot,
    phraseCatalog,
    chat,
    teacherLastRead,
    nextMessageId: () => { msgSeq += 1; return mockId('3e55', msgSeq); },
    notifications,
    feedbacks,
    nextFeedbackMessageId: () => { fmSeq += 1; return mockId('fb11', fmSeq); },
    quizTemplates,
    hostHistory,
    battleDetail,
    templateDetail,
    saveTemplate,
    studentSession,
    studentGroups,
    teacherUser: authUserFor(teachers.edu, now),
    freeAuthUser: authUserFor(teachers.marta, now),
  };
}

function authUserFor(profile, now) {
  return {
    id: profile.id,
    aud: 'authenticated',
    role: 'authenticated',
    email: profile.email,
    email_confirmed_at: profile.created_at,
    phone: '',
    confirmed_at: profile.created_at,
    last_sign_in_at: now.toISOString(),
    app_metadata: { provider: 'email', providers: ['email'] },
    user_metadata: { full_name: profile.display_name, ...(profile.role === 'free' ? { role: 'free' } : {}) },
    identities: [],
    created_at: profile.created_at,
    updated_at: now.toISOString(),
    is_anonymous: false,
  };
}
