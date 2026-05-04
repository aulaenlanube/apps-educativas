import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Lock, X } from 'lucide-react';
import { getMyPhrases, teacherGetMyPhrases } from '@/services/phraseService';
import useDuelActor from '@/hooks/useDuelActor';

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

  return (
    <div className="fixed bottom-4 left-4 z-[55] pointer-events-none">
      <div className="relative pointer-events-auto">
        <AnimatePresence>
          {open && (
            <motion.div
              ref={popoverRef}
              initial={{ opacity: 0, y: 10, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95, transition: { duration: 0.15 } }}
              transition={{ type: 'spring', stiffness: 360, damping: 24 }}
              className="absolute bottom-[64px] left-0 w-[280px] sm:w-[320px] bg-white border-2 border-violet-300 rounded-2xl shadow-2xl p-2"
            >
              <div className="flex items-center justify-between px-2 py-1 mb-1 border-b border-slate-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-violet-600 flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5" /> Tus frases
                </span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                  aria-label="Cerrar"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex flex-col gap-1.5">
                {ordered.map((s) => (
                  <button
                    key={s.slot}
                    type="button"
                    onClick={() => send(s)}
                    className="text-left px-3 py-2 rounded-xl border-2 border-violet-100 hover:border-violet-400 hover:bg-violet-50 active:scale-[0.97] transition-all text-sm font-semibold text-slate-800"
                    title={s.text}
                  >
                    <span className="text-lg mr-1.5 align-middle">{s.emoji}</span>
                    <span className="align-middle">{s.text}</span>
                  </button>
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
          className={`relative flex items-center justify-center w-14 h-14 rounded-full shadow-2xl border-2 transition-all
            ${cooling
              ? 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed'
              : open
                ? 'bg-gradient-to-br from-violet-600 to-fuchsia-600 border-white text-white'
                : 'bg-gradient-to-br from-violet-500 to-fuchsia-500 border-white text-white hover:scale-105'}`}
          aria-label="Decir una frase"
        >
          {cooling ? <Lock className="w-5 h-5" /> : <MessageSquare className="w-6 h-6" />}
          {cooling && (
            <span className="absolute -top-1 -right-1 bg-white text-slate-700 text-[10px] font-black px-1.5 py-0.5 rounded-full shadow border border-slate-200">
              {Math.ceil(remaining / 1000)}s
            </span>
          )}
        </motion.button>
      </div>
    </div>
  );
}
