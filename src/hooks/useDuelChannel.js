import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

// Canal Realtime por duelo. Usa presence + broadcast.
// Uno de los dos participantes es "host" (retador) y es la autoridad del
// estado del juego. El otro solo escucha estado y envia inputs.
//
// @param duelId  string UUID del duelo
// @param user    { id, name, emoji }
// @param enabled true para suscribirse
export default function useDuelChannel(duelId, user, enabled = true) {
  const channelRef = useRef(null);
  const listenersRef = useRef(new Map());
  const [presence, setPresence] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!duelId || !enabled || !user?.id) return;

    const ch = supabase.channel(`duel:${duelId}`, {
      config: { presence: { key: user.id } },
    });

    ch.on('presence', { event: 'sync' }, () => {
      const state = ch.presenceState();
      const list = Object.values(state).flat().map(p => ({
        id: p.id,
        name: p.name || '',
        emoji: p.emoji || '',
        role: p.role || 'player',
      }));
      setPresence(list);
    });

    ch.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        setIsConnected(true);
        await ch.track({
          id: user.id, name: user.name, emoji: user.emoji, role: user.role || 'player',
        });
      }
    });

    channelRef.current = ch;
    return () => {
      ch.unsubscribe();
      channelRef.current = null;
      listenersRef.current.clear();
      setIsConnected(false);
      setPresence([]);
    };
  }, [duelId, enabled, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const broadcast = useCallback((event, payload) => {
    channelRef.current?.send({ type: 'broadcast', event, payload });
  }, []);

  const onBroadcast = useCallback((event, handler) => {
    const ch = channelRef.current;
    if (!ch) return () => {};
    const wrapped = ({ payload }) => handler(payload);
    ch.on('broadcast', { event }, wrapped);
    const key = `${event}-${Math.random()}`;
    listenersRef.current.set(key, { event, wrapped });
    return () => {
      listenersRef.current.delete(key);
      // Supabase no expone off() limpio para on('broadcast'); al desmontar
      // el canal se limpia todo.
    };
  }, []);

  return { presence, isConnected, broadcast, onBroadcast, channel: channelRef.current };
}
