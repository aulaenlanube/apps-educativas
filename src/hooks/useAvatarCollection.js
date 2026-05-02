import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

// mode: 'student' (default) | 'teacher'
// Para 'student' usa avatar_get_my_collection con (student_id, session_token).
// Para 'teacher' usa teacher_avatar_get_my_collection() y se infiere por auth.uid().
export function useAvatarCollection(mode = 'student') {
  const { student, isStudent, teacher } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (mode === 'teacher') {
      if (!teacher?.id) return;
      setLoading(true);
      // Otorga avatares que ya cumplan el requisito antes de devolver la colección.
      try { await supabase.rpc('teacher_avatar_check_unlocks'); }
      catch (e) { console.warn('[avatar] teacher check_unlocks failed:', e?.message); }
      const { data, error } = await supabase.rpc('teacher_avatar_get_my_collection');
      setLoading(false);
      if (error) {
        console.warn('[avatar] teacher collection fetch failed:', error.message);
        setItems([]);
        return;
      }
      setItems(Array.isArray(data) ? data : []);
      return;
    }

    if (!isStudent || !student?.id || !student?.session_token) return;
    setLoading(true);
    const { data, error } = await supabase.rpc('avatar_get_my_collection', {
      p_student_id: student.id,
      p_session_token: student.session_token,
    });
    setLoading(false);
    if (error) {
      console.warn('[avatar] collection fetch failed:', error.message);
      setItems([]);
      return;
    }
    setItems(Array.isArray(data) ? data : []);
  }, [mode, isStudent, student?.id, student?.session_token, teacher?.id]);

  useEffect(() => { fetch(); }, [fetch]);

  const ownedCount = items.filter((i) => i.owned).length;
  const totalCount = items.length;
  const totalBonusRaw = items
    .filter((i) => i.owned)
    .reduce((sum, i) => sum + Number(i.points_bonus || 0), 0);
  const totalBonus = Math.min(0.5, totalBonusRaw);

  return {
    items,
    loading,
    ownedCount,
    totalCount,
    totalBonus,
    totalBonusRaw,
    refresh: fetch,
  };
}
