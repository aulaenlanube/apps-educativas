import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Lock, X, Send } from 'lucide-react';
import { getMyPhrases, teacherGetMyPhrases } from '@/services/phraseService';
import useDuelActor from '@/hooks/useDuelActor';
import './DuelChat.css';

// Cooldown progresivo (anti-spam): 10s la primera vez, 15s la siguiente, 20s
// la tercera y vuelve a 10s en la cuarta. Cíclico. La duración del bocadillo
// (5s) y este cooldown son cosas distintas: el cooldown bloquea volver a
// hablar; los bocadillos siguen apareciendo/desapareciendo a su ritmo.
const COOLDOWN_SCHEDULE_MS = [10000, 15000, 20000];

/**
 * Botón flotante (esquina inferior izquierda) para lanzar una de las 4 frases
 * configuradas por el jugador. Al pulsarlo se abre un popover con las frases.
 *
 * Reutilizable entre:
 *  - Duelos 1 vs 1 (event = 'phrase_message')
 *  - Quiz Battle (event = 'battle:phrase_message')
 *
 * El cooldown sigue una secuencia 10→15→20→10... (ver COOLDOWN_SCHEDULE_MS).
 *
 * Props:
 *  - channel: { broadcast } — canal Realtime sobre el que emitir
 *  - me: { id } — identificador del emisor (puesto en payload.from)
 *  - eventName: nombre del broadcast event. Default 'phrase_message'.
 *  - onSent: callback opcional con el payload, útil para autoeco local
 *      (Realtime no devuelve el evento al emisor).
 */
export default function PhraseLauncher({
  channel,
  me,
  eventName = 'phrase_message',
  onSent,
}) {
  const actor = useDuelActor();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  // Duración del cooldown en curso: solo para pintar el anillo que se vacía.
  const [cooldownTotal, setCooldownTotal] = useState(0);
  const [now, setNow] = useState(Date.now());
  // Contador de envíos para indexar COOLDOWN_SCHEDULE_MS. Persiste mientras
  // el componente vive (toda la sala/partida); no se resetea en cada envío.
  const sendCountRef = useRef(0);
  const popoverRef = useRef(null);
  const buttonRef = useRef(null);

  // Carga slots equipados.
  useEffect(() => {
    if (!actor) { setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    const promise = actor.type === 'teacher'
      ? teacherGetMyPhrases()
      : getMyPhrases({ studentId: actor.id, sessionToken: actor.sessionToken });
    promise
      .then((d) => { if (!cancelled) setSlots(d?.slots || []); })
      .catch(() => { /* sin frases configuradas: ocultamos */ })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [actor]);

  // Tick para refrescar el contador de cooldown mientras se ve.
  useEffect(() => {
    if (cooldownUntil <= Date.now()) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [cooldownUntil]);

  // Cerrar popover al hacer click fuera.
  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (popoverRef.current?.contains(e.target)) return;
      if (buttonRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const send = useCallback((slot) => {
    if (!slot || !channel?.broadcast || !me?.id) return;
    if (Date.now() < cooldownUntil) return;
    const payload = {
      from: me.id,
      phrase_id: slot.phrase_id,
      text: slot.text,
      emoji: slot.emoji,
      sent_at: Date.now(),
    };
    channel.broadcast(eventName, payload);
    const idx = sendCountRef.current % COOLDOWN_SCHEDULE_MS.length;
    setCooldownUntil(Date.now() + COOLDOWN_SCHEDULE_MS[idx]);
    setCooldownTotal(COOLDOWN_SCHEDULE_MS[idx]);
    sendCountRef.current += 1;
    setOpen(false);
    onSent?.(payload);
  }, [channel, me?.id, cooldownUntil, eventName, onSent]);

  if (!actor || loading || slots.length === 0) return null;

  const remaining = Math.max(0, cooldownUntil - now);
  const cooling = remaining > 0;
  const ordered = [0, 1, 2, 3]
    .map((i) => slots.find((s) => s.slot === i) || null)
    .filter(Boolean);

  // Anillo del cooldown (r = 27 en un viewBox de 60).
  const RING_C = 2 * Math.PI * 27;
  const ringLeft = cooling && cooldownTotal ? Math.min(1, remaining / cooldownTotal) : 0;

  return (
    <div className="dch-launcher">
      <div className="dch-launcher__inner">
        <AnimatePresence>
          {open && (
            <motion.div
              ref={popoverRef}
              initial={{ opacity: 0, y: 12, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95, transition: { duration: 0.15 } }}
              transition={{ type: 'spring', stiffness: 360, damping: 24 }}
              className="dch-pop"
              role="menu"
              aria-label="Tus frases"
            >
              <div className="dch-pop__head">
                <span className="dch-pop__badge" aria-hidden="true"><MessageSquare size={15} /></span>
                <span className="dch-pop__titles">
                  <span className="dch-pop__title">Tus frases</span>
                  <span className="dch-pop__hint">Elige una y tu rival la verá</span>
                </span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="dch-pop__close"
                  aria-label="Cerrar"
                >
                  <X size={15} />
                </button>
              </div>
              <div className="dch-pop__list">
                {ordered.map((s, i) => (
                  <motion.button
                    key={s.slot}
                    type="button"
                    role="menuitem"
                    onClick={() => send(s)}
                    className="dch-chip"
                    title={s.text}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.035 * i, duration: 0.2 }}
                  >
                    <span className="dch-chip__emoji" aria-hidden="true">{s.emoji}</span>
                    <span className="dch-chip__text">{s.text}</span>
                    <span className="dch-chip__send" aria-hidden="true"><Send size={14} /></span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          ref={buttonRef}
          type="button"
          onClick={() => !cooling && setOpen((v) => !v)}
          disabled={cooling}
          whileTap={!cooling ? { scale: 0.92 } : undefined}
          className={`dch-fab${cooling ? ' is-cooling' : ''}${open ? ' is-open' : ''}`}
          aria-label="Decir una frase"
          aria-expanded={open}
          title={cooling ? `Podrás hablar en ${Math.ceil(remaining / 1000)} s` : 'Decir una frase'}
        >
          {cooling ? (
            <>
              <svg className="dch-fab__ring" viewBox="0 0 60 60" aria-hidden="true">
                <circle className="dch-fab__ring-track" cx="30" cy="30" r="27" />
                <circle
                  className="dch-fab__ring-arc"
                  cx="30"
                  cy="30"
                  r="27"
                  strokeDasharray={RING_C}
                  strokeDashoffset={RING_C * (1 - ringLeft)}
                  transform="rotate(-90 30 30)"
                />
              </svg>
              <span className="dch-fab__secs">{Math.ceil(remaining / 1000)}</span>
              <span className="dch-fab__lock" aria-hidden="true"><Lock size={10} /></span>
            </>
          ) : (
            <>
              {!open && <span className="dch-fab__ping" aria-hidden="true" />}
              {open ? <X size={24} /> : <MessageSquare size={24} />}
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}
