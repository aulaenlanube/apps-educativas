import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import UserAvatar from '@/components/ui/UserAvatar';
import PhraseLauncher from './PhraseLauncher';

const RECEIVED_DURATION_MS = 5000;

/**
 * Caja de frases en duelos 1 vs 1. Renderiza dos elementos flotantes:
 *   - Botón flotante (esquina inferior izq.) para emitir una de las 4 frases
 *     equipadas (PhraseLauncher).
 *   - Bocadillo flotante (esquina superior der.) que muestra el último
 *     mensaje del rival, con su avatar al lado.
 *
 * Como ambos elementos son `fixed`, este componente no necesita un wrapper
 * con tamaño/posición — basta con montarlo en cualquier parte del JSX.
 *
 * Props:
 *   - channel: el { broadcast, onBroadcast } de useDuelChannel
 *   - me: { id }
 *   - rival: { name, emoji, color, selectedAvatarCode, hidden } — para pintar
 *       la burbuja de mensaje recibido con el avatar del rival
 *   - onIncoming(phrase): callback opcional cuando llega un mensaje del rival
 */
export default function DuelChatBar({ channel, me, rival, onIncoming }) {
  const [received, setReceived] = useState(null); // { from, text, emoji, sentAt }
  const receivedTimerRef = useRef(null);

  // Suscripción a mensajes entrantes
  useEffect(() => {
    if (!channel?.onBroadcast || !me?.id) return;
    const unsub = channel.onBroadcast('phrase_message', (payload) => {
      if (!payload || payload.from === me.id) return; // ignora ecos propios
      const incoming = {
        from: payload.from,
        text: payload.text,
        emoji: payload.emoji,
        sentAt: payload.sent_at || Date.now(),
      };
      setReceived(incoming);
      onIncoming?.(incoming);
      clearTimeout(receivedTimerRef.current);
      receivedTimerRef.current = setTimeout(() => setReceived(null), RECEIVED_DURATION_MS);
    });
    return () => {
      unsub?.();
      clearTimeout(receivedTimerRef.current);
    };
  }, [channel, me?.id, onIncoming]);

  return (
    <>
      {/* Bocadillo flotante con la frase del rival, fijo arriba-derecha
          para que el jugador la vea aunque esté mirando el centro del juego. */}
      <AnimatePresence>
        {received && (
          <motion.div
            key={received.sentAt}
            initial={{ opacity: 0, x: 40, y: -10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 40, transition: { duration: 0.2 } }}
            transition={{ type: 'spring', stiffness: 340, damping: 24 }}
            className="fixed top-4 right-4 z-[60] flex items-end gap-2 max-w-[calc(100vw-2rem)] sm:max-w-md pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0.6 }}
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 0.5, times: [0, 0.4, 1] }}
              className="shrink-0"
            >
              <UserAvatar
                selectedAvatarCode={rival?.hidden ? null : rival?.selectedAvatarCode}
                avatarEmoji={rival?.hidden ? '🕵️' : (rival?.emoji || '🎓')}
                avatarColor={rival?.hidden ? null : rival?.color}
                size="lg"
                showRarityGlow
              />
            </motion.div>
            <motion.div
              initial={{ scale: 0.7, opacity: 0, originX: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 22, delay: 0.05 }}
              className="relative px-4 py-2.5 rounded-2xl bg-white border-2 border-violet-300 shadow-2xl"
            >
              {/* Cola del bocadillo apuntando al avatar (a la izquierda). */}
              <span
                aria-hidden
                className="absolute left-[-9px] bottom-3 w-0 h-0"
                style={{
                  borderTop: '8px solid transparent',
                  borderBottom: '8px solid transparent',
                  borderRight: '10px solid #c4b5fd',
                }}
              />
              <span
                aria-hidden
                className="absolute left-[-6px] bottom-[14px] w-0 h-0"
                style={{
                  borderTop: '6px solid transparent',
                  borderBottom: '6px solid transparent',
                  borderRight: '8px solid white',
                }}
              />
              <p className="text-[10px] uppercase font-bold tracking-widest text-violet-500 mb-0.5">
                {rival?.hidden ? 'Rival' : (rival?.name || 'Rival')}
              </p>
              <p className="text-sm sm:text-base font-semibold text-slate-800 leading-snug">
                <span className="text-xl mr-1.5 align-middle">{received.emoji}</span>
                {received.text}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botón flotante (esquina inf. izq.) para emitir una frase. */}
      <PhraseLauncher
        channel={channel}
        me={me}
        eventName="phrase_message"
      />
    </>
  );
}
