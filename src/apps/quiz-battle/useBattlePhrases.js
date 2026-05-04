import { useCallback, useEffect, useState } from 'react';

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
//
// IMPORTANTE: el primer parámetro es la función `onBroadcast` directamente
// (referencia estable, useCallback en useQuizChannel). Si se envuelve en
// un objeto `{ onBroadcast }` la referencia cambia en cada render, el
// useEffect se reejecuta sin parar y el cleanup mata los setTimeout de
// expiración antes de que disparen — los mensajes se acumulan en estado y
// reaparecen todos de golpe cuando la fase 'question' deja paso a 'results'.
export default function useBattlePhrases(onBroadcast, enabled = true) {
  const [messages, setMessages] = useState([]);

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
    // Fire-and-forget: el timer dispara solo, no lo trackeamos. Si el
    // componente se desmonta, React simplemente ignora el setMessages.
    setTimeout(() => {
      setMessages((prev) => prev.filter((m) => m.id !== id));
    }, MESSAGE_LIFETIME_MS);
  }, []);

  useEffect(() => {
    if (!onBroadcast || !enabled) return;
    const unsub = onBroadcast('battle:phrase_message', apply);
    return () => {
      unsub?.();
      // Vaciamos al desactivar (transición a fase 'question' u otras): no
      // queremos que mensajes "viejos" sobrevivan al cambio de fase y
      // re-aparezcan cuando el overlay vuelva a montarse.
      setMessages([]);
    };
  }, [onBroadcast, enabled, apply]);

  return { messages, pushPhrase: apply };
}
