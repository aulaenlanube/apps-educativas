import { supabase } from '@/lib/supabase';

function unwrap(res) {
  if (res.error) throw new Error(res.error.message);
  const d = res.data;
  if (d && typeof d === 'object' && d.error) throw new Error(d.error);
  return d;
}

export async function listPhraseDefinitions() {
  return unwrap(await supabase.rpc('phrase_list_definitions'));
}

export async function getMyPhrases({ studentId, sessionToken }) {
  return unwrap(await supabase.rpc('student_get_my_phrases', {
    p_student_id: studentId,
    p_session_token: sessionToken,
  }));
}

export async function setPhraseSlot({ studentId, sessionToken, slot, phraseId }) {
  return unwrap(await supabase.rpc('student_set_phrase_slot', {
    p_student_id: studentId,
    p_session_token: sessionToken,
    p_slot: slot,
    p_phrase_id: phraseId, // null para vaciar
  }));
}

// --- Variantes para docente (auth via auth.uid()) ---

export async function teacherGetMyPhrases() {
  return unwrap(await supabase.rpc('teacher_get_my_phrases'));
}

export async function teacherSetPhraseSlot({ slot, phraseId }) {
  return unwrap(await supabase.rpc('teacher_set_phrase_slot', {
    p_slot: slot,
    p_phrase_id: phraseId,
  }));
}
