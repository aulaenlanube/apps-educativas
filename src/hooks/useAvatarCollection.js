import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export function useAvatarCollection() {
  const { student, isStudent } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
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
  }, [isStudent, student?.id, student?.session_token]);

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
