import { supabase } from '@/lib/supabase';

// Wrappers tipados de las RPCs de duelo. Todas las RPCs de alumno
// requieren student_id + session_token; la del profesor va por auth.uid.

function unwrap(res) {
  if (res.error) throw new Error(res.error.message);
  const d = res.data;
  if (d && typeof d === 'object' && d.error) throw new Error(d.error);
  return d;
}

export async function createDuel({
  studentId, sessionToken, opponentId, appId, appName,
  level, grade, subjectId, stake, bestOf = 1, isHidden = false,
}) {
  return unwrap(await supabase.rpc('student_create_duel', {
    p_student_id: studentId,
    p_session_token: sessionToken,
    p_opponent_id: opponentId,
    p_app_id: appId,
    p_app_name: appName,
    p_level: level,
    p_grade: String(grade),
    p_subject_id: subjectId,
    p_stake: stake,
    p_best_of: bestOf,
    p_is_hidden: isHidden,
  }));
}

export async function acceptDuel({ studentId, sessionToken, duelId }) {
  return unwrap(await supabase.rpc('student_accept_duel', {
    p_student_id: studentId, p_session_token: sessionToken, p_duel_id: duelId,
  }));
}

export async function rejectDuel({ studentId, sessionToken, duelId }) {
  return unwrap(await supabase.rpc('student_reject_duel', {
    p_student_id: studentId, p_session_token: sessionToken, p_duel_id: duelId,
  }));
}

export async function startDuel({ studentId, sessionToken, duelId }) {
  return unwrap(await supabase.rpc('student_start_duel', {
    p_student_id: studentId, p_session_token: sessionToken, p_duel_id: duelId,
  }));
}

export async function voidDuel({ studentId, sessionToken, duelId, reason }) {
  return unwrap(await supabase.rpc('student_void_duel', {
    p_student_id: studentId, p_session_token: sessionToken, p_duel_id: duelId, p_reason: reason,
  }));
}

export async function reportDuelResult({ studentId, sessionToken, duelId, winnerId, rounds = null }) {
  return unwrap(await supabase.rpc('student_report_duel_result', {
    p_student_id: studentId, p_session_token: sessionToken,
    p_duel_id: duelId, p_winner_id: winnerId, p_rounds: rounds,
  }));
}

export async function getDuelOpponents({ studentId, sessionToken }) {
  const d = unwrap(await supabase.rpc('student_get_duel_opponents', {
    p_student_id: studentId, p_session_token: sessionToken,
  }));
  return d?.opponents || [];
}

export async function getDuels({ studentId, sessionToken }) {
  return unwrap(await supabase.rpc('student_get_duels', {
    p_student_id: studentId, p_session_token: sessionToken,
  }));
}

export async function setDuelReveal({ studentId, sessionToken, duelId, revealed }) {
  return unwrap(await supabase.rpc('student_set_duel_reveal', {
    p_student_id: studentId, p_session_token: sessionToken,
    p_duel_id: duelId, p_revealed: revealed,
  }));
}

export async function getDuelState({ studentId, sessionToken, duelId }) {
  return unwrap(await supabase.rpc('student_get_duel_state', {
    p_student_id: studentId, p_session_token: sessionToken, p_duel_id: duelId,
  }));
}

export async function getGradeWithDuelBonus({ studentId, sessionToken }) {
  return unwrap(await supabase.rpc('student_get_grade_with_duel_bonus', {
    p_student_id: studentId, p_session_token: sessionToken,
  }));
}

export async function applyDuelDebtRecovery({ studentId, sessionToken, sessionId }) {
  return unwrap(await supabase.rpc('student_apply_duel_debt_recovery', {
    p_student_id: studentId, p_session_token: sessionToken, p_session_id: sessionId,
  }));
}

export async function teacherCreateDuelAssignment({
  teacherId, groupId, appId, appName, level, grade, subjectId,
  stake, bestOf, title, dueDate,
}) {
  return unwrap(await supabase.rpc('teacher_create_duel_assignment', {
    p_teacher_id: teacherId, p_group_id: groupId, p_app_id: appId, p_app_name: appName,
    p_level: level, p_grade: String(grade), p_subject_id: subjectId, p_stake: stake,
    p_best_of: bestOf, p_title: title, p_due_date: dueDate,
  }));
}
