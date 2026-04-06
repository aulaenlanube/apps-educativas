import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export function useGamification() {
  const { user, student, isStudent, isTeacher, isFreeUser, isAdmin } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchGamification = useCallback(async () => {
    setLoading(true);
    try {
      let result = null;

      if (isStudent && student?.id) {
        const { data: d } = await supabase.rpc('student_get_gamification', {
          p_student_id: student.id,
          p_group_id: student.group_id || null,
        });
        if (d?.success) result = d;
      } else if ((isTeacher || isFreeUser || isAdmin) && user?.id) {
        const { data: d } = await supabase.rpc('teacher_get_gamification', {
          p_teacher_id: user.id,
        });
        if (d?.success) result = d;
      }

      if (result) setData(result);
    } catch (err) {
      console.warn('[Gamification] Error fetching:', err);
    } finally {
      setLoading(false);
    }
  }, [isStudent, isTeacher, isFreeUser, isAdmin, student?.id, student?.group_id, user?.id]);

  useEffect(() => {
    if (isStudent || isTeacher || isFreeUser || isAdmin) {
      fetchGamification();
    }
  }, [fetchGamification, isStudent, isTeacher, isFreeUser, isAdmin]);

  return {
    loading,
    totalXp: data?.total_xp ?? 0,
    level: data?.level ?? 1,
    xpForCurrentLevel: data?.xp_for_current_level ?? 0,
    xpForNextLevel: data?.xp_for_next_level ?? 50,
    earnedBadges: data?.earned_badges ?? [],
    allBadges: data?.all_badges ?? [],
    totalEarned: data?.total_earned ?? 0,
    totalAvailable: data?.total_available ?? 0,
    refresh: fetchGamification,
  };
}
