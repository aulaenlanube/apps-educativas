import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getMyPhrases } from '@/services/phraseService';
import UserAvatar from '@/components/ui/UserAvatar';

const SEND_COOLDOWN_MS = 4000;
const RECEIVED_DURATION_MS = 3500;

/**
 * Caja de frases predefinidas en duelos 1 vs 1.
 *
 * Props:
 *  - channel: el { broadcast, onBroadcast } de useDuelChannel
 *  - me: { id }
 *  - rival: { name, emoji, color, selectedAvatarCode, hidden } — para pintar
 *      la burbuja de mensaje recibido con el avatar del rival
 *  - onIncoming(phrase): callback opcional cuando llega un mensaje del rival
 *  - className: estilos opcionales para el contenedor
 */
export default function DuelChatBar({ channel, me, rival, onIncoming, className }) {
  const { student } = useAuth();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [received, setReceived] = useState(null); // { from, text, emoji, sentAt }
  const receivedTimerRef = useRef(null);

  // Carga de slots
  useEffect(() => {
    if (!student) return;
    let cancelled = false;
    setLoading(true);
    getMyPhrases({ studentId: student.id, sessionToken: student.session_token })
      .then(d => { if (!cancelled) setSlots(d?.slots || []); })
      .catch(() => { /* en duelo, fallar silenciosamente */ })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [student]);

  // Tick del cooldown
  useEffect(() => {
    if (cooldownUntil <= Date.now()) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [cooldownUntil]);

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

  const send = useCallback((slot) => {
    if (!slot || !channel?.broadcast) return;
    if (Date.now() < cooldownUntil) return;
    channel.broadcast('phrase_message', {
      from: me.id,
      phrase_id: slot.phrase_id,
      text: slot.text,
      emoji: slot.emoji,
      sent_at: Date.now(),
    });
    setCooldownUntil(Date.now() + SEND_COOLDOWN_MS);
  }, [channel, me?.id, cooldownUntil]);

  if (loading) return null;
  const remaining = Math.max(0, cooldownUntil - now);
  const cooling = remaining > 0;

  // Ordenamos por slot (0..3) y rellenamos los huecos para mostrar 4 botones.
  const ordered = [0, 1, 2, 3].map(i => slots.find(s => s.slot === i) || null);

  return (
    <div className={className}>
      {/* Notificación flotante: aparece fija arriba-derecha sin importar el
          scroll, así el jugador la ve aunque esté mirando el centro del juego. */}
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
              {/* Cola del bocadillo apuntando al avatar */}
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

      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <div className="hidden sm:flex items-center gap-1.5 text-violet-600 px-2">
          <MessageSquare className="w-4 h-4" />
          <span className="text-[11px] font-bold uppercase tracking-wide">Frases</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1">
          {ordered.map((s, idx) => s ? (
            <button
              key={s.slot}
              type="button"
              disabled={cooling}
              onClick={() => send(s)}
              className={`group relative px-3 py-2 rounded-xl text-left text-sm font-semibold transition-all border-2
                ${cooling
                  ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-white border-violet-200 hover:border-violet-400 hover:bg-violet-50 active:scale-[0.97] text-slate-800 shadow-sm'}`}
              title={s.text}
            >
              <span className="text-lg mr-1.5">{s.emoji}</span>
              <span className="truncate inline-block align-middle max-w-[calc(100%-1.7rem)]">{s.text}</span>
            </button>
          ) : (
            <div
              key={`empty-${idx}`}
              className="px-3 py-2 rounded-xl text-xs text-slate-300 italic border-2 border-dashed border-slate-200 flex items-center justify-center"
            >
              Slot vacío
            </div>
          ))}
        </div>
        {cooling && (
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 px-2">
            <Lock className="w-3 h-3" /> {Math.ceil(remaining / 1000)}s
          </span>
        )}
      </div>
    </div>
  );
}
