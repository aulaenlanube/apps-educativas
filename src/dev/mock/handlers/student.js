// Handlers de RPCs del ALUMNO (SOLO desarrollo). Cada handler recibe
// (params, ctx) con ctx = { world, role, state } y devuelve lo mismo que la RPC
// real (los nombres de parámetro siguen la firma real: p_student_id,
// p_group_id, p_session_token…).
import { mockId } from '../fixtures/util.js';

const ACTIVE_DUEL = new Set(['pending', 'accepted', 'in_progress']);
let localSeq = 0;
const nextId = (block) => { localSeq += 1; return mockId(block, 0x8000 + localSeq); };

function studentOr(world, id) {
  return world.byId.get(id) || world.byId.get(world.IDS.lucia);
}

// viewerStudentId: alumno que pregunta (en duelos ocultos no ve al retador
// hasta que empieza, igual que student_get_duel_state). null = docente.
export function duelState(world, d, viewerStudentId = null) {
  const meIsChallenger = d.challenger_type === 'student' && d.challenger_id === viewerStudentId;
  const reveal = !viewerStudentId || !d.is_hidden || ['finished', 'void', 'in_progress'].includes(d.status) || meIsChallenger;
  return {
    id: d.id, status: d.status, app_id: d.app_id, app_name: d.app_name,
    level: d.level, grade: d.grade, subject_id: d.subject_id,
    stake: d.stake, best_of: d.best_of, is_hidden: d.is_hidden,
    is_task: !!d.assignment_pair_id,
    winner_id: d.winner_id, winner_type: d.winner_type, void_reason: d.void_reason,
    challenger_id: d.challenger_id, challenger_type: d.challenger_type,
    opponent_id: d.opponent_id, opponent_type: d.opponent_type,
    challenger: reveal ? world.actorInfo(d.challenger_id, d.challenger_type) : { id: d.challenger_id, hidden: true },
    opponent: world.actorInfo(d.opponent_id, d.opponent_type),
    rounds: [],
  };
}

export function createDuel(world, { challengerId, challengerType, opponentId, app, stake, bestOf, isHidden, groupId }) {
  const opp = world.byId.get(opponentId);
  const g = world.groupById.get(groupId || opp?.group_id);
  const d = {
    id: nextId('d0e1'),
    group_id: groupId || null,
    challenger_id: challengerId,
    challenger_type: challengerType,
    opponent_id: opponentId,
    opponent_type: 'student',
    app_id: app.app_id,
    app_name: app.app_name,
    level: app.level || g?.level || 'eso',
    grade: String(app.grade || g?.grade || ''),
    subject_id: app.subject_id || g?.subject_id || null,
    stake: Number(stake) || 0,
    best_of: bestOf || 1,
    is_hidden: !!isHidden,
    status: 'pending',
    winner_id: null,
    winner_type: null,
    void_reason: null,
    created_at: new Date().toISOString(),
    accepted_at: null,
    started_at: null,
    finished_at: null,
    assignment_pair_id: null,
    is_task: false,
    challenger_revealed: true,
    opponent_revealed: !isHidden,
  };
  world.duels.unshift(d);
  world.duelById.set(d.id, d);
  return d;
}

export const studentHandlers = {
  // ─── Login / sesión ──────────────────────────────────────────────────────
  student_login: (p, { world }) => {
    const student = { ...world.studentSession };
    delete student.group_code;
    delete student.session_token;
    return { success: true, session_token: world.studentSession.session_token, student };
  },
  student_set_password: (p, ctx) => studentHandlers.student_login(p, ctx),
  student_login_by_auth: (p, { world }) => {
    const s = world.studentSession;
    return {
      success: true,
      session_token: s.session_token,
      student: { id: s.id, username: s.username, display_name: s.display_name, avatar_emoji: s.avatar_emoji, avatar_color: s.avatar_color, selected_avatar_code: s.selected_avatar_code },
      groups: world.studentGroups.get(s.id) || [],
    };
  },
  student_logout: () => ({ success: true }),
  student_confirm_email: () => ({ success: true }),
  student_link_auth_user: () => ({ success: true }),

  // ─── Panel ───────────────────────────────────────────────────────────────
  student_get_dashboard: (p, { world }) => {
    const st = studentOr(world, p.p_student_id);
    const g = world.groupById.get(p.p_group_id) || world.groupById.get(st.group_id);
    const agg = world.aggregateSessions(world.sessionsFor(st.id));
    return {
      success: true,
      student: {
        id: st.id, username: st.username, display_name: st.display_name, avatar_emoji: st.avatar_emoji,
        group_name: g?.name || null, created_at: st.created_at,
      },
      ...agg,
    };
  },

  student_get_assignments: (p, { world }) => {
    const st = studentOr(world, p.p_student_id);
    const gid = p.p_group_id || st.group_id;
    const rows = world.assignments
      .filter((a) => a.group_id === gid && (!a.student_id || a.student_id === st.id))
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
      .map((a) => {
        const m = world.matrix.get(`${a.id}|${st.id}`) || {};
        return {
          id: a.id, app_id: a.app_id, app_name: a.app_name, level: a.level, grade: a.grade, subject_id: a.subject_id,
          min_score: a.min_score, title: a.title, description: a.description, due_date: a.due_date, created_at: a.created_at,
          weight: a.weight, term: a.term, is_individual: !!a.student_id,
          best_nota: m.best_nota ?? null, best_score: m.best_score ?? null, attempts: m.attempts || 0, last_attempt: m.last_attempt ?? null,
          completed: Number(m.best_nota || 0) >= a.min_score,
        };
      });
    return { success: true, assignments: rows };
  },

  get_student_quiz_battle_stats: (p, { world }) => world.quizStatsFor(p.p_student_id),

  student_get_gamification: (p, { world }) => world.gamificationFor(studentOr(world, p.p_student_id).id),

  student_get_grade_with_duel_bonus: (p, { world, state }) => {
    const st = studentOr(world, p.p_student_id);
    const t = world.termGradesFor(st.id);
    const myLedger = world.ledger.filter((l) => l.student_id === st.id && l.group_id === st.group_id);
    const raw = Math.round(myLedger.reduce((a, l) => a + l.delta, 0) * 1000) / 1000;
    const battleCounts = t.terms.reduce((acc, x) => ({
      first: acc.first + (x.battle_counts?.first || 0),
      second: acc.second + (x.battle_counts?.second || 0),
      third: acc.third + (x.battle_counts?.third || 0),
    }), { first: 0, second: 0, third: 0 });
    return {
      nota_base: t.final_grade_base || null,
      bonus: t.duel_bonus_total,
      bonus_raw: raw,
      battle_bonus: t.battle_bonus_total,
      battle_score_total: t.battle_score_total,
      progress_bonus: t.progress_bonus,
      avatar_bonus: t.avatar_bonus,
      avatar_count: t.avatar_count,
      selected_avatar_code: state.selectedAvatar.get(st.id) ?? st.selected_avatar_code ?? null,
      level: t.level,
      current_term: t.current_term,
      current_term_data: t.current_term_data,
      progress_reset_at: null,
      duel_task_bonus: t.duel_task_bonus_total,
      duel_personal_bonus: t.duel_personal_bonus_total,
      duel_counts: t.duel_counts_total,
      battle_counts: battleCounts,
      nota_final: t.final_grade,
      terms: t.terms,
      duel_bonus_total: t.duel_bonus_total,
      duel_bonus_total_raw: raw,
      total_assignments: t.total_assignments,
      debts: world.debts[st.id] || [],
      history: myLedger
        .slice()
        .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
        .slice(0, 20)
        .map((l) => {
          const d = world.duelById.get(l.duel_id);
          return { duel_id: l.duel_id, delta: l.delta, reason: l.reason, app_id: d?.app_id, app_name: d?.app_name, at: l.created_at };
        }),
    };
  },

  // ─── Duelos ──────────────────────────────────────────────────────────────
  student_get_duels: (p, { world }) => {
    const sid = p.p_student_id;
    const active = world.duels.filter((d) => ACTIVE_DUEL.has(d.status)).sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
    const common = (d) => ({
      duel_id: d.id, group_id: d.group_id, app_id: d.app_id, app_name: d.app_name, stake: d.stake,
      status: d.status, is_hidden: d.is_hidden, best_of: d.best_of, created_at: d.created_at,
      is_task: d.is_task, in_class_window: true,
    });
    return {
      incoming: active.filter((d) => d.opponent_type === 'student' && d.opponent_id === sid).map((d) => ({
        ...common(d),
        challenger: d.challenger_revealed ? world.actorInfo(d.challenger_id, d.challenger_type) : { hidden: true },
        me_revealed: d.opponent_revealed,
        rival_revealed: d.challenger_revealed,
        rival_is_teacher: d.challenger_type === 'teacher',
      })),
      outgoing: active.filter((d) => d.challenger_type === 'student' && d.challenger_id === sid).map((d) => ({
        ...common(d),
        opponent: d.opponent_revealed ? world.actorInfo(d.opponent_id, d.opponent_type) : { hidden: true },
        me_revealed: d.challenger_revealed,
        rival_revealed: d.opponent_revealed,
        rival_is_teacher: d.opponent_type === 'teacher',
      })),
    };
  },
  student_get_duel_opponents: (p, { world }) => {
    const st = studentOr(world, p.p_student_id);
    const g = world.groupById.get(st.group_id);
    return {
      opponents: world.byGroup.get(st.group_id)
        .filter((s) => s.id !== st.id)
        .map((s) => ({
          id: s.id, name: s.display_name, emoji: s.avatar_emoji, color: s.avatar_color,
          selected_avatar_code: s.selected_avatar_code, group_id: g.id, group_name: g.name, same_group: true,
        })),
    };
  },
  student_get_duel_state: (p, { world }) => {
    const d = world.duelById.get(p.p_duel_id);
    return d ? duelState(world, d, p.p_student_id) : { error: 'Duelo inexistente' };
  },
  student_create_duel: (p, { world }) => {
    const d = createDuel(world, {
      challengerId: p.p_student_id, challengerType: 'student', opponentId: p.p_opponent_id,
      app: { app_id: p.p_app_id, app_name: p.p_app_name, level: p.p_level, grade: p.p_grade, subject_id: p.p_subject_id },
      stake: p.p_stake, bestOf: p.p_best_of, isHidden: p.p_is_hidden, groupId: studentOr(world, p.p_student_id).group_id,
    });
    return { success: true, duel_id: d.id };
  },
  student_accept_duel: (p, { world }) => setDuelStatus(world, p.p_duel_id, 'accepted'),
  student_reject_duel: (p, { world }) => setDuelStatus(world, p.p_duel_id, 'rejected'),
  student_start_duel: (p, { world }) => setDuelStatus(world, p.p_duel_id, 'in_progress'),
  student_void_duel: (p, { world }) => setDuelStatus(world, p.p_duel_id, 'void', { void_reason: p.p_reason || 'cancelled' }),
  student_report_duel_result: (p, { world }) => setDuelStatus(world, p.p_duel_id, 'finished', { winner_id: p.p_winner_id, winner_type: 'student' }),
  student_set_duel_reveal: (p, { world }) => {
    const d = world.duelById.get(p.p_duel_id);
    if (!d) return { error: 'Duelo inexistente' };
    if (d.challenger_id === p.p_student_id) d.challenger_revealed = !!p.p_revealed;
    else d.opponent_revealed = !!p.p_revealed;
    return { success: true };
  },
  student_apply_duel_debt_recovery: () => ({ success: true, recovered: 0 }),

  // ─── Mensajes ────────────────────────────────────────────────────────────
  student_get_chat_messages: (p, { world }) => {
    const gid = p.p_group_id;
    const pick = (m) => ({ id: m.id, sender_type: m.sender_type, sender_id: m.sender_id, sender_name: m.sender_name, message: m.message, created_at: m.created_at });
    const asc = (a, b) => (a.created_at < b.created_at ? -1 : 1);
    const broadcasts = world.chat.filter((m) => m.group_id === gid && !m.student_id).sort(asc).map(pick);
    const privateMessages = world.chat.filter((m) => m.group_id === gid && m.student_id === p.p_student_id).sort(asc).map(pick);
    return {
      broadcasts,
      private_messages: privateMessages,
      unread_broadcasts: 0,
      unread_private: 0,
    };
  },
  student_send_message: (p, { world }) => {
    const st = studentOr(world, p.p_student_id);
    world.chat.push({
      id: world.nextMessageId(), group_id: p.p_group_id, student_id: st.id, sender_type: 'student',
      sender_id: st.id, sender_name: st.display_name, message: String(p.p_message || ''), created_at: new Date().toISOString(),
    });
    return { success: true };
  },

  // ─── Perfil / grupos ─────────────────────────────────────────────────────
  student_get_my_groups: (p, { world }) => {
    const st = studentOr(world, p.p_student_id);
    if (world.studentGroups.has(st.id)) return world.studentGroups.get(st.id);
    const g = world.groupById.get(st.group_id);
    return [{ group_id: g.id, group_name: g.name, group_code: g.group_code, teacher_name: g.owner_name, joined_at: st.created_at }];
  },
  student_join_group: (p, { world }) => {
    const st = studentOr(world, p.p_student_id);
    const code = String(p.p_group_code || '').trim().toUpperCase();
    const group = { group_id: nextId('6400'), group_name: `Grupo ${code}`, group_code: code, teacher_name: 'Docente de prueba', joined_at: new Date().toISOString() };
    const list = world.studentGroups.get(st.id) || [];
    world.studentGroups.set(st.id, [...list, group]);
    return { success: true, group };
  },
  student_update_profile: (p, { world }) => {
    const st = studentOr(world, p.p_student_id);
    if (p.p_avatar_emoji) st.avatar_emoji = p.p_avatar_emoji;
    if (p.p_avatar_color) st.avatar_color = p.p_avatar_color;
    return { success: true };
  },

  // ─── Avatares / frases (alumno) ──────────────────────────────────────────
  avatar_get_my_collection: (p, { world, state }) => {
    const st = studentOr(world, p.p_student_id);
    return world.avatarCollectionFor(st.id, state.selectedAvatar.get(st.id) ?? st.selected_avatar_code);
  },
  avatar_select: (p, { world, state }) => {
    if (p.p_code && !world.avatarByCode.has(p.p_code)) return { error: 'Avatar inexistente' };
    state.selectedAvatar.set(p.p_student_id, p.p_code || null);
    const st = world.byId.get(p.p_student_id);
    if (st) st.selected_avatar_code = p.p_code || null;
    return { success: true };
  },
  avatar_check_unlocks: () => [],
  student_get_my_phrases: (p, { world }) => world.phrasesFor(studentOr(world, p.p_student_id).id),
  student_set_phrase_slot: (p, { world }) => {
    world.setPhraseSlot(studentOr(world, p.p_student_id).id, p.p_slot, p.p_phrase_id);
    return { success: true };
  },
};

export function setDuelStatus(world, duelId, status, extra = {}) {
  const d = world.duelById.get(duelId);
  if (!d) return { error: 'Duelo inexistente' };
  const nowIso = new Date().toISOString();
  Object.assign(d, { status, ...extra });
  if (status === 'accepted') d.accepted_at = nowIso;
  if (status === 'in_progress') d.started_at = nowIso;
  if (status === 'finished' || status === 'void') d.finished_at = nowIso;
  return { success: true, status };
}
