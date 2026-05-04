import { useCallback, useEffect, useRef, useState } from 'react';

// Tiempo durante el que un mensaje permanece en pantalla mientras sube y
// se difumina. Coincide con la animación del overlay (BattleRisingMessages).
const MESSAGE_LIFETIME_MS = 5000;

// Hook compartido entre QuizBattleHost y QuizBattlePlayer. Escucha el evento
// `battle:phrase_message` del canal Realtime y mantiene un array de
// mensajes activos (efímeros). Cada mensaje recibe una posición horizontal
// aleatoria al entrar, y se elimina automáticamente tras MESSAGE_LIFETIME_MS.
//
// Devuelve también `pushPhrase(payload)` para inyectar localmente una frase
// (Supabase Realtime no devuelve el broadcast al emisor, así que el propio
// jugador lo usa para verse su propio mensaje al enviarlo).
export default function useBattlePhrases(channel, enabled = true) {
  const [messages, setMessages] = useState([]);
  const timersRef = useRef(new Map());

  const apply = useCallback((payload) => {
    if (!payload?.text) return;
    const id = `${payload.from || 'anon'}-${payload.sent_at || Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const msg = {
      id,
      text: payload.text,
      emoji: payload.emoji || '💬',
      // Posición horizontal aleatoria (15-85% del ancho) — deja margen en
      // los bordes para que las burbujas anchas no se salgan.
      x: 15 + Math.random() * 70,
    };
    setMessages((prev) => [...prev, msg]);
    const t = setTimeout(() => {
      setMessages((prev) => prev.filter((m) => m.id !== id));
      timersRef.current.delete(id);
    }, MESSAGE_LIFETIME_MS);
    timersRef.current.set(id, t);
  }, []);

  useEffect(() => {
    if (!channel?.onBroadcast || !enabled) return;
    const unsub = channel.onBroadcast('battle:phrase_message', apply);
    const timers = timersRef.current;
    return () => {
      unsub?.();
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
    };
  }, [channel, enabled, apply]);

  return { messages, pushPhrase: apply };
}
