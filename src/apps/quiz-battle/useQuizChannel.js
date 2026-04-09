import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * Shared hook for Supabase Realtime channel for Quiz Battle.
 * Used by both host (teacher) and player (student).
 *
 * @param {string} roomCode  — 6-char room code
 * @param {object} userInfo  — { id, name, emoji }
 * @param {boolean} enabled  — subscribe only when true
 * @returns { channel, players, broadcast, isConnected }
 */
export default function useQuizChannel(roomCode, userInfo, enabled = true) {
  const channelRef = useRef(null);
  const [players, setPlayers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const listenersRef = useRef(new Map());

  // ── Subscribe ──
  useEffect(() => {
    if (!roomCode || !enabled) return;

    const ch = supabase.channel(`quiz-battle:${roomCode}`, {
      config: { presence: { key: userInfo?.id || crypto.randomUUID() } },
    });

    ch.on('presence', { event: 'sync' }, () => {
      const state = ch.presenceState();
      const list = Object.values(state)
        .flat()
        .map((p) => ({
          id: p.id || p.presence_ref,
          name: p.name || 'Anon',
          emoji: p.emoji || '🙂',
        }));
      setPlayers(list);
    });

    ch.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        setIsConnected(true);
        if (userInfo) {
          await ch.track({
            id: userInfo.id,
            name: userInfo.name,
            emoji: userInfo.emoji,
          });
        }
      }
    });

    channelRef.current = ch;

    return () => {
      ch.unsubscribe();
      channelRef.current = null;
      setIsConnected(false);
      setPlayers([]);
    };
  }, [roomCode, enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Broadcast ──
  const broadcast = useCallback((event, payload) => {
    channelRef.current?.send({
      type: 'broadcast',
      event,
      payload,
    });
  }, []);

  // ── Listen for broadcast events ──
  const onBroadcast = useCallback((event, handler) => {
    const ch = channelRef.current;
    if (!ch) return;
    // Avoid duplicate listeners
    if (listenersRef.current.has(event)) return;
    ch.on('broadcast', { event }, ({ payload }) => handler(payload));
    listenersRef.current.set(event, true);
  }, []);

  return {
    channel: channelRef.current,
    players,
    broadcast,
    onBroadcast,
    isConnected,
  };
}

/**
 * Generate a 6-char alphanumeric room code (uppercase).
 */
export function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}
