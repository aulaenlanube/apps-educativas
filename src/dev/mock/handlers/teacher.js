// Handlers de RPCs del DOCENTE (SOLO desarrollo). Las RPCs reales se autorizan
// con auth.uid(); aquí ese papel lo hace ctx.meId (Edu Torregrosa en modo
// teacher, Marta Ruiz en modo free).
import { mockId } from '../fixtures/util.js';
import { createDuel, duelState, setDuelStatus } from './student.js';

let localSeq = 0;
const nextId = (block) => { localSeq += 1; return mockId(block, 0x9000 + localSeq); };
const asc = (a, b) => (a.created_at < b.created_at ? -1 : 1);
const desc = (a, b) => (a.created_at < b.created_at ? 1 : -1);
const pickMsg = (m) => ({ id: m.id, sender_type: m.sender_type, sender_id: m.sender_id, sender_name: m.sender_name, message: m.message, created_at: m.created_at });

function groupStudents(world, groupId) {
  return world.byGroup.get(groupId) || [];
}

export const teacherHandlers = {
  // ─── Grupos y alumnos ────────────────────────────────────────────────────
  get_teacher_groups: (p, { world }) => world.groups.map((g) => ({ ...g, student_count: groupStudents(world, g.id).length })),

  get_group_students: (p, { world }) => groupStudents(world, p.p_group_id).map((s) => ({
    id: s.id, username: s.username, display_name: s.display_name, avatar_emoji: s.avatar_emoji,
    avatar_color: s.avatar_color, selected_avatar_code: s.selected_avatar_code, password_hash: s.password_hash,
    created_at: s.created_at,
  })),

  teacher_get_group_class_hours: (p, { world }) => ({ success: true, hours: world.classHours[p.p_group_id] || [] }),
  teacher_set_group_class_hours: (p, { world }) => {
    const list = Array.isArray(p.p_hours) ? p.p_hours : [];
    world.classHours[p.p_group_id] = list.map((h) => ({ id: nextId('c1a5'), weekday: h.weekday, start_time: h.start_time, end_time: h.end_time }));
    return { success: true };
  },
  teacher_create_group_with_hours: (p, { world, meId }) => {
    const teacher = world.teacherById.get(meId);
    const id = nextId('6400');
    const nowIso = new Date().toISOString();
    world.groups.push({
      id, name: p.p_name, description: p.p_description || null, group_code: `GRP-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      teacher_id: meId, created_at: nowIso, updated_at: nowIso, level: p.p_level || null, grade: p.p_grade || null,
      subject_id: p.p_subject_id || null, current_term: null, is_owner: true, student_count: 0,
      owner_name: teacher?.display_name || 'Docente', co_teachers: null,
    });
    world.byGroup.set(id, []);
    if (Array.isArray(p.p_hours)) teacherHandlers.teacher_set_group_class_hours({ p_group_id: id, p_hours: p.p_hours }, { world });
    return { success: true, group_id: id };
  },

  create_students_bulk: (p) => ({ success: true, created: (p.p_usernames || []).length, errors: [] }),
  reset_student_password: () => ({ success: true }),
  teacher_reset_student_course_progress: () => ({ success: true, total_resets: 1 }),
  add_co_teacher: (p) => ({ success: true, teacher: { display_name: `Docente ${String(p.p_teacher_code || '').toUpperCase()}` } }),
  remove_co_teacher: () => ({ success: true }),

  // ─── Estadísticas de un alumno ──────────────────────────────────────────
  teacher_get_student_stats: (p, { world }) => {
    const st = world.byId.get(p.p_student_id);
    if (!st) return { error: 'Alumno no encontrado' };
    const g = world.groupById.get(st.group_id);
    return {
      success: true,
      student: {
        id: st.id, username: st.username, display_name: st.display_name, avatar_emoji: st.avatar_emoji,
        avatar_color: st.avatar_color, selected_avatar_code: st.selected_avatar_code, group_name: g?.name, created_at: st.created_at,
      },
      ...world.aggregateSessions(world.sessionsFor(st.id)),
    };
  },
  teacher_get_student_term_grades: (p, { world }) => world.termGradesFor(p.p_student_id),

  // ─── Tareas ──────────────────────────────────────────────────────────────
  teacher_get_assignments_progress: (p, { world }) => {
    const students = groupStudents(world, p.p_group_id);
    const rows = world.assignments.filter((a) => a.group_id === p.p_group_id).sort(desc).map((a) => {
      const targets = a.student_id ? students.filter((s) => s.id === a.student_id) : students;
      const completed = targets.filter((s) => {
        const m = world.matrix.get(`${a.id}|${s.id}`);
        return m && m.best_nota != null && m.best_nota >= a.min_score;
      }).length;
      return {
        id: a.id, app_id: a.app_id, app_name: a.app_name, min_score: a.min_score, title: a.title, description: a.description,
        due_date: a.due_date, created_at: a.created_at, student_id: a.student_id, teacher_id: a.teacher_id,
        weight: a.weight, term: a.term,
        teacher_name: world.teacherById.get(a.teacher_id)?.display_name || null,
        student_name: a.student_id ? world.byId.get(a.student_id)?.display_name || null : null,
        completed_count: completed,
        total_students: a.student_id ? 1 : students.length,
      };
    });
    return { success: true, assignments: rows };
  },
  teacher_get_assignment_scores: (p, { world }) => {
    const a = world.assignments.find((x) => x.id === p.p_assignment_id);
    if (!a) return { error: 'Tarea no encontrada' };
    const students = groupStudents(world, a.group_id).filter((s) => !a.student_id || s.id === a.student_id);
    const scores = students.map((s) => {
      const m = world.matrix.get(`${a.id}|${s.id}`) || {};
      return {
        student_id: s.id, display_name: s.display_name, avatar_emoji: s.avatar_emoji, avatar_color: s.avatar_color,
        best_nota: m.best_nota ?? null, best_score: m.best_score ?? null, attempts_count: m.attempts || 0,
        last_played_at: m.last_attempt ?? null, passed: m.best_nota != null && m.best_nota >= a.min_score,
      };
    }).sort((x, y) => {
      if (x.best_nota == null && y.best_nota != null) return 1;
      if (y.best_nota == null && x.best_nota != null) return -1;
      if (x.best_nota !== y.best_nota) return (y.best_nota || 0) - (x.best_nota || 0);
      return x.display_name.localeCompare(y.display_name, 'es');
    });
    return { success: true, min_score: a.min_score, scores };
  },
  teacher_update_assignment: (p, { world }) => {
    const a = world.assignments.find((x) => x.id === p.p_assignment_id);
    if (!a) return { error: 'Tarea no encontrada' };
    if (p.p_weight != null) a.weight = p.p_weight;
    if (p.p_term != null) a.term = p.p_term;
    return { success: true };
  },
  teacher_delete_assignment: (p, { world }) => {
    const i = world.assignments.findIndex((x) => x.id === p.p_assignment_id);
    if (i >= 0) world.assignments.splice(i, 1);
    return { success: true };
  },

  // ─── Chat del grupo ──────────────────────────────────────────────────────
  teacher_get_chat_overview: (p, { world }) => {
    const gid = p.p_group_id;
    const threads = groupStudents(world, gid).map((s) => {
      const list = world.chat.filter((m) => m.group_id === gid && m.student_id === s.id).sort(asc);
      const last = list[list.length - 1];
      const lastRead = world.teacherLastRead.get(`${gid}|${s.id}`) || '1970-01-01T00:00:00.000Z';
      const unread = list.filter((m) => m.sender_type === 'student' && m.created_at > lastRead).length;
      return {
        student_id: s.id, display_name: s.display_name, avatar_emoji: s.avatar_emoji,
        message_count: list.length, last_message_at: last?.created_at || null, last_message: last?.message || null,
        last_sender: last?.sender_type || null, unread_count: unread, has_unread: unread > 0,
      };
    }).sort((x, y) => {
      // ORDER BY has_unread DESC, last_message_at DESC (Postgres: NULLS FIRST en DESC)
      if (x.has_unread !== y.has_unread) return x.has_unread ? -1 : 1;
      if (x.last_message_at === y.last_message_at) return 0;
      if (x.last_message_at == null) return -1;
      if (y.last_message_at == null) return 1;
      return x.last_message_at < y.last_message_at ? 1 : -1;
    });
    const broadcasts = world.chat.filter((m) => m.group_id === gid && !m.student_id).sort(asc);
    const lastB = broadcasts[broadcasts.length - 1];
    return {
      threads,
      broadcast_count: broadcasts.length,
      last_broadcast: lastB ? { message: lastB.message, sender_name: lastB.sender_name, created_at: lastB.created_at } : null,
    };
  },
  get_chat_messages: (p, { world }) => {
    const gid = p.p_group_id;
    const sid = p.p_student_id || null;
    if (sid) world.teacherLastRead.set(`${gid}|${sid}`, new Date().toISOString());
    return world.chat.filter((m) => m.group_id === gid && (sid ? m.student_id === sid : !m.student_id)).sort(asc).map(pickMsg);
  },
  teacher_send_message: (p, { world, meId }) => {
    const t = world.teacherById.get(meId);
    world.chat.push({
      id: world.nextMessageId(), group_id: p.p_group_id, student_id: p.p_student_id || null, sender_type: 'teacher',
      sender_id: meId, sender_name: t?.display_name || 'Docente', message: String(p.p_message || ''), created_at: new Date().toISOString(),
    });
    return { success: true };
  },

  // ─── Duelos y batallas del grupo (moderación) ───────────────────────────
  teacher_get_group_battles: (p, { world }) => ({
    success: true,
    battles: world.battles.filter((b) => b.group_id === p.p_group_id).map((b) => ({
      room_code: b.room_code, created_at: b.created_at, level: b.level, grade: b.grade, subject_id: b.subject_id,
      term: b.term, total_questions: b.total_questions, player_count: b.player_count, group_player_count: b.group_player_count,
      players: b.players.map((x) => ({
        rank: x.rank, display_name: x.display_name, avatar_emoji: x.avatar_emoji, score: x.score,
        correct_answers: x.correct_answers, user_type: x.user_type, user_id: x.user_id, in_group: x.in_group,
      })),
    })),
  }),
  teacher_get_group_duels: (p, { world }) => {
    const mini = (id) => {
      const s = world.byId.get(id);
      return { id: s ? id : null, name: s?.display_name || null, emoji: s?.avatar_emoji || null };
    };
    return {
      success: true,
      duels: world.duels.filter((d) => d.group_id === p.p_group_id).sort(desc).map((d) => ({
        id: d.id, status: d.status, app_id: d.app_id, app_name: d.app_name, level: d.level, grade: d.grade, subject_id: d.subject_id,
        stake: d.stake, best_of: d.best_of, is_hidden: d.is_hidden, winner_id: d.winner_id, void_reason: d.void_reason,
        created_at: d.created_at, accepted_at: d.accepted_at, started_at: d.started_at, finished_at: d.finished_at,
        challenger: mini(d.challenger_id), opponent: mini(d.opponent_id),
      })),
    };
  },
  teacher_delete_duel: (p, { world }) => {
    const i = world.duels.findIndex((d) => d.id === p.p_duel_id);
    if (i >= 0) world.duels.splice(i, 1);
    return { success: true };
  },
  teacher_delete_battle: (p, { world }) => {
    const i = world.battles.findIndex((b) => b.room_code === p.p_room_code);
    const affected = i >= 0 ? world.battles[i].players.length : 0;
    if (i >= 0) world.battles.splice(i, 1);
    return { success: true, affected_students: affected };
  },

  // ─── Retos 1 vs 1 del docente ────────────────────────────────────────────
  teacher_get_duel_opponents: (p, { world }) => ({
    opponents: world.groups.flatMap((g) => groupStudents(world, g.id).map((s) => ({
      id: s.id, name: s.display_name, emoji: s.avatar_emoji, color: s.avatar_color,
      selected_avatar_code: s.selected_avatar_code, group_id: g.id, group_name: g.name,
    }))).sort((a, b) => (a.group_name + a.name).localeCompare(b.group_name + b.name, 'es')),
  }),
  teacher_get_my_duels: (p, { world, meId }) => ({
    outgoing: world.duels
      .filter((d) => d.challenger_type === 'teacher' && d.challenger_id === meId && ['pending', 'accepted', 'in_progress'].includes(d.status))
      .sort(desc)
      .map((d) => ({
        duel_id: d.id, group_id: d.group_id, opponent: world.actorInfo(d.opponent_id, d.opponent_type),
        app_id: d.app_id, app_name: d.app_name, stake: d.stake, status: d.status, is_hidden: false,
        best_of: d.best_of, created_at: d.created_at, is_task: false, rival_is_teacher: false,
      })),
  }),
  teacher_create_duel: (p, { world, meId }) => {
    const d = createDuel(world, {
      challengerId: meId, challengerType: 'teacher', opponentId: p.p_opponent_id,
      app: { app_id: p.p_app_id, app_name: p.p_app_name, level: p.p_level, grade: p.p_grade, subject_id: p.p_subject_id },
      stake: 0, bestOf: p.p_best_of, isHidden: false, groupId: null,
    });
    return { success: true, duel_id: d.id };
  },
  teacher_get_duel_state: (p, { world }) => {
    const d = world.duelById.get(p.p_duel_id);
    return d ? duelState(world, d) : { error: 'Duelo inexistente' };
  },
  teacher_start_duel: (p, { world }) => setDuelStatus(world, p.p_duel_id, 'in_progress'),
  teacher_void_duel: (p, { world }) => setDuelStatus(world, p.p_duel_id, 'void', { void_reason: p.p_reason || 'cancelled' }),
  teacher_report_duel_result: (p, { world }) => setDuelStatus(world, p.p_duel_id, 'finished', { winner_id: p.p_winner_id, winner_type: p.p_winner_type || 'student' }),
  teacher_create_duel_assignment: (p, { world }) => {
    const roster = groupStudents(world, p.p_group_id);
    const pairs = [];
    for (let i = 0; i + 1 < roster.length; i += 2) pairs.push({ a: roster[i].id, b: roster[i + 1].id, duel_id: nextId('d0e1') });
    const bye = roster.length % 2 ? { student_id: roster[roster.length - 1].id } : null;
    return { success: true, pairs, bye };
  },

  // ─── Gamificación / avatares / frases del docente ───────────────────────
  teacher_get_gamification: (p, { world }) => world.gamificationFor(p.p_teacher_id),
  teacher_avatar_check_unlocks: () => [],
  teacher_avatar_get_my_collection: (p, { world, meId, state }) => {
    const t = world.teacherById.get(meId);
    return world.avatarCollectionFor(meId, state.selectedAvatar.get(meId) ?? t?.selected_avatar_code ?? null);
  },
  teacher_avatar_select: (p, { world, meId, state }) => {
    if (p.p_code && !world.avatarByCode.has(p.p_code)) return { error: 'Avatar inexistente' };
    state.selectedAvatar.set(meId, p.p_code || null);
    const t = world.teacherById.get(meId);
    if (t) t.selected_avatar_code = p.p_code || null;
    return { success: true };
  },
  teacher_get_my_phrases: (p, { world, meId }) => world.phrasesFor(meId),
  teacher_set_phrase_slot: (p, { world, meId }) => {
    world.setPhraseSlot(meId, p.p_slot, p.p_phrase_id);
    return { success: true };
  },

  // ─── Batallas (plantillas, historial, detalle) ──────────────────────────
  get_teacher_quiz_templates: (p, { world }) => (world.quizTemplates.get(p.p_teacher_id) || []).slice().sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1)),
  delete_quiz_template: (p, { world }) => {
    const list = world.quizTemplates.get(p.p_teacher_id) || [];
    world.quizTemplates.set(p.p_teacher_id, list.filter((t) => t.id !== p.p_template_id));
    return { success: true };
  },
  get_teacher_quiz_battle_stats: (p, { world }) => {
    const rows = world.hostHistory.filter((h) => h.user_id === p.p_teacher_id);
    if (!rows.length) return { total_hosted: 0, total_players_served: 0, avg_players: null, subjects_used: 0 };
    const players = rows.reduce((a, h) => a + (h.player_count || 0), 0);
    return {
      total_hosted: rows.length,
      total_players_served: players,
      avg_players: Math.round((players / rows.length) * 10) / 10,
      subjects_used: new Set(rows.map((h) => h.subject_id).filter(Boolean)).size,
    };
  },
  get_teacher_quiz_battle_quota: (p, { world }) => {
    const start = new Date(world.now.getFullYear(), world.now.getMonth(), 1).toISOString();
    const used = world.hostHistory.filter((h) => h.user_id === p.p_teacher_id && h.created_at >= start).length;
    const quota = 10;
    return { quota, used, remaining: Math.max(0, quota - used) };
  },
  get_quiz_battle_detail: (p, { world }) => world.battleDetail(p.p_room_code),
  get_quiz_template: (p, { world }) => world.templateDetail(p.p_template_id),
  save_quiz_template: (p, { world, meId }) => ({
    success: true,
    id: world.saveTemplate(p.p_teacher_id || meId, {
      id: p.p_template_id, name: p.p_name, description: p.p_description, questions: p.p_questions,
    }),
  }),
};
