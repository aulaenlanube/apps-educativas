import React, { useEffect, useState, useCallback } from 'react';
import { MessageSquare, Lock } from 'lucide-react';
import { getMyPhrases, teacherGetMyPhrases } from '@/services/phraseService';
import useDuelActor from '@/hooks/useDuelActor';

// Cooldown mínimo entre dos envíos del mismo jugador (10s, según especificación).
const SEND_COOLDOWN_MS = 10000;

// Barra de envío de frases dentro de un quiz battle. Muestra los 4 slots
// equipados del jugador (alumno auth o docente). Si no hay actor (guests),
// no se renderiza nada.
//
// Props:
//   - channel: hook de useQuizChannel ({ broadcast, onBroadcast })
//   - me: { id } — id que aparecerá como `from` en el broadcast
//   - className: estilos extra del contenedor
export default function BattlePhraseBar({ channel, me, className }) {
  const actor = useDuelActor();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [now, setNow] = useState(Date.now());

  // Carga de slots equipados.
  useEffect(() => {
    if (!actor) { setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    const promise = actor.type === 'teacher'
      ? teacherGetMyPhrases()
      : getMyPhrases({ studentId: actor.id, sessionToken: actor.sessionToken });
    promise
      .then((d) => { if (!cancelled) setSlots(d?.slots || []); })
      .catch(() => { /* sin frases configuradas o error: ocultar barra */ })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [actor]);

  useEffect(() => {
    if (cooldownUntil <= Date.now()) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [cooldownUntil]);

  const send = useCallback((slot) => {
    if (!slot || !channel?.broadcast || !me?.id) return;
    if (Date.now() < cooldownUntil) return;
    channel.broadcast('battle:phrase_message', {
      from: me.id,
      phrase_id: slot.phrase_id,
      text: slot.text,
      emoji: slot.emoji,
      sent_at: Date.now(),
    });
    setCooldownUntil(Date.now() + SEND_COOLDOWN_MS);
  }, [channel, me?.id, cooldownUntil]);

  // Sin actor (guest) o aún cargando o sin slots: no mostrar.
  if (!actor || loading || slots.length === 0) return null;

  const remaining = Math.max(0, cooldownUntil - now);
  const cooling = remaining > 0;
  const ordered = [0, 1, 2, 3].map((i) => slots.find((s) => s.slot === i) || null);

  return (
    <div className={className}>
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
