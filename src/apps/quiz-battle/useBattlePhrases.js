import { useEffect, useRef, useState } from 'react';

// Tiempo durante el que un bocadillo permanece visible una vez recibido.
// Se resetea si el mismo emisor manda otra frase.
const BUBBLE_DURATION_MS = 4500;

// Hook compartido entre QuizBattleHost y QuizBattlePlayer. Escucha el evento
// `battle:phrase_message` del canal Realtime y mantiene un map
// { playerId: { text, emoji, sentAt } } con la frase activa de cada
// jugador. Limpia automáticamente la frase tras BUBBLE_DURATION_MS.
//
// El componente que muestra el avatar consulta `phrases[player.id]` para
// decidir si pintar un bocadillo encima.
export default function useBattlePhrases(channel, enabled = true) {
  const [phrases, setPhrases] = useState({});
  const timersRef = useRef(new Map());

  useEffect(() => {
    if (!channel?.onBroadcast || !enabled) return;
    const unsub = channel.onBroadcast('battle:phrase_message', (payload) => {
      if (!payload?.from || !payload.text) return;
      setPhrases((prev) => ({
        ...prev,
        [payload.from]: {
          text: payload.text,
          emoji: payload.emoji || '💬',
          sentAt: payload.sent_at || Date.now(),
        },
      }));
      // Reseteamos el timer del emisor.
      const prevTimer = timersRef.current.get(payload.from);
      if (prevTimer) clearTimeout(prevTimer);
      const t = setTimeout(() => {
        setPhrases((prev) => {
          if (!(payload.from in prev)) return prev;
          const next = { ...prev };
          delete next[payload.from];
          return next;
        });
        timersRef.current.delete(payload.from);
      }, BUBBLE_DURATION_MS);
      timersRef.current.set(payload.from, t);
    });
    return () => {
      unsub?.();
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current.clear();
    };
  }, [channel, enabled]);

  return { phrases };
}
