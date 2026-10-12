// Handlers de RPCs comunes a todos los roles (SOLO desarrollo):
// notificaciones, comentarios de apps, catálogos, rankings y escrituras de
// tracking (que en modo mock se tragan sin tocar la base de datos real).

const desc = (a, b) => (a.created_at < b.created_at ? 1 : -1);

function findFeedback(world, feedbackId) {
  for (const list of world.feedbacks.values()) {
    const fb = list.find((f) => f.id === feedbackId);
    if (fb) return fb;
  }
  return null;
}

function rankingRows(world, { appId, mode, students, limit }) {
  const rows = [];
  for (const s of students) {
    const sessions = world.sessionsFor(s.id).filter((x) => x.app_id === appId && (!mode || x.mode === mode));
    if (!sessions.length) continue;
    const best = sessions.reduce((m, x) => (x.score > m.score ? x : m), sessions[0]);
    rows.push({
      student_id: s.id, user_id: s.id, user_type: 'student', display_name: s.display_name,
      avatar: s.avatar_emoji, avatar_color: s.avatar_color, selected_avatar_code: s.selected_avatar_code,
      level: best.level, grade: best.grade, subject_id: best.subject_id, duration_seconds: best.duration_seconds,
      mode: best.mode, score: best.score, nota: best.nota, created_at: best.created_at,
    });
  }
  return rows
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r, i) => ({ rank: i + 1, ...r }));
}

export const sharedHandlers = {
  // ─── Notificaciones ──────────────────────────────────────────────────────
  count_unread_notifications: (p, { world }) => ({
    count: (world.notifications.get(p.p_user_id) || []).filter((n) => !n.read).length,
  }),
  get_user_notifications: (p, { world }) => (world.notifications.get(p.p_user_id) || [])
    .slice().sort(desc).slice(0, p.p_limit || 20),
  mark_notifications_read: (p, { world }) => {
    const ids = Array.isArray(p.p_notification_ids) ? p.p_notification_ids : null;
    (world.notifications.get(p.p_user_id) || []).forEach((n) => { if (!ids || ids.includes(n.id)) n.read = true; });
    return { success: true };
  },

  // ─── Comentarios de apps (MyFeedbacksSection) ───────────────────────────
  get_user_feedbacks: (p, { world }) => (world.feedbacks.get(p.p_user_id) || []).map((fb) => {
    const last = fb.messages[fb.messages.length - 1];
    return {
      id: fb.id, app_id: fb.app_id, app_name: fb.app_name, level: fb.level, grade: fb.grade, subject_id: fb.subject_id,
      status: fb.status, created_at: fb.created_at, updated_at: last?.created_at || fb.created_at,
      message_count: fb.messages.length, last_message: last?.message || null, last_sender: last?.sender_type || null,
    };
  }).sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1)),
  get_feedback_messages: (p, { world }) => {
    const fb = findFeedback(world, p.p_feedback_id);
    return fb ? fb.messages : { error: 'No autorizado' };
  },
  user_reply_feedback: (p, { world }) => {
    const fb = findFeedback(world, p.p_feedback_id);
    if (!fb) return { error: 'No encontrado' };
    fb.messages.push({
      id: world.nextFeedbackMessageId(), sender_type: 'user', sender_id: p.p_user_id || null,
      sender_name: p.p_user_name || 'Usuario', message: String(p.p_message || ''), created_at: new Date().toISOString(),
    });
    fb.status = 'open';
    return { success: true };
  },
  create_feedback: () => ({ success: true }),

  // ─── Catálogos ───────────────────────────────────────────────────────────
  avatar_list_definitions: (p, { world }) => world.avatarCatalog,
  phrase_list_definitions: (p, { world }) => world.phraseCatalog.map((x) => ({
    id: x.id, code: x.code, text: x.text, emoji: x.emoji, category: x.category, rarity: x.rarity,
    is_default: x.is_default, sort_order: x.sort_order,
  })),

  // ─── Rankings (RankingModal, en AppRunnerPage) ──────────────────────────
  get_app_ranking: (p, { world }) => rankingRows(world, {
    appId: p.p_app_id, mode: p.p_mode || null, students: world.students, limit: p.p_limit || 15,
  }),
  get_class_high_score_ranking: (p, { world }) => rankingRows(world, {
    appId: p.p_app_id, mode: null, students: world.byGroup.get(p.p_group_id) || [], limit: p.p_limit || 5,
  }),

  // ─── Escrituras de partidas / valoraciones: se ignoran ──────────────────
  // track_session_start devuelve null a propósito: sin session_id, useGameTracker
  // usa el fallback (también falso) y el beacon de abandono (fetch directo a
  // la API REST) nunca se dispara.
  track_session_start: () => null,
  track_session_finish: () => ({ success: true }),
  track_student_session: () => ({ success: true }),
  track_session_start_and_finish: () => ({ success: true }),
  upsert_high_score: () => null,
  gamification_process_session: () => null,
  gamification_process_teacher_session: () => null,
  process_ranking_badges: () => null,
  mythic_badges_check: () => null,
  get_user_rating: () => null,
  get_user_difficulty: () => null,
  upsert_app_rating: () => ({ success: true }),
  delete_app_rating: () => ({ success: true }),
  set_self_role_free: () => null,
};
