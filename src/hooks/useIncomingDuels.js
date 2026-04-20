import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getDuels } from '@/services/duelService';

// Mantiene sincronizada la lista de duelos del alumno y se suscribe a
// notificaciones nuevas (duel_invite / duel_accepted / duel_result) via
// Realtime sobre public.user_notifications.
export default function useIncomingDuels(student) {
  const [duels, setDuels] = useState({ incoming: [], outgoing: [] });
  const [loading, setLoading] = useState(true);
  const [lastEvent, setLastEvent] = useState(null);
  const studentIdRef = useRef(null);

  const refresh = useCallback(async () => {
    if (!student?.id || !student?.session_token) return;
    try {
      const data = await getDuels({ studentId: student.id, sessionToken: student.session_token });
      setDuels({ incoming: data?.incoming || [], outgoing: data?.outgoing || [] });
    } catch (e) {
      // silencio
    } finally {
      setLoading(false);
    }
  }, [student?.id, student?.session_token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!student?.id) return;
    studentIdRef.current = student.id;

    const ch = supabase.channel(`duel-notifs:${student.id}`);
    ch.on('postgres_changes', {
      event: 'INSERT', schema: 'public', table: 'user_notifications',
      filter: `user_id=eq.${student.id}`,
    }, (payload) => {
      const row = payload.new;
      if (!row) return;
      if (!['duel_invite', 'duel_accepted', 'duel_result'].includes(row.type)) return;
      setLastEvent({ ...row, received_at: Date.now() });
      refresh();
    });

    ch.subscribe();
    return () => { ch.unsubscribe(); };
  }, [student?.id, refresh]);

  return { duels, loading, lastEvent, refresh };
}
