import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Swords, EyeOff, Eye, Check, X, ArrowRight, Clock, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { acceptDuel, rejectDuel, setDuelReveal } from '@/services/duelService';
import { useToast } from '@/components/ui/use-toast';

function stakeLabel(n) {
  return `${(+n).toFixed(1).replace('.', ',')} pt`;
}

function statusLabel(s) {
  return {
    pending: 'Pendiente',
    accepted: 'Aceptado',
    in_progress: 'En curso',
  }[s] || s;
}

export default function DuelInbox({ duels, onChange }) {
  const { student } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [busy, setBusy] = useState(null);
  const [revealBusy, setRevealBusy] = useState(null);

  const { incoming = [], outgoing = [] } = duels || {};
  if (incoming.length === 0 && outgoing.length === 0) return null;

  async function handleAccept(duelId) {
    setBusy(duelId);
    try {
      await acceptDuel({ studentId: student.id, sessionToken: student.session_token, duelId });
      onChange?.();
      navigate(`/duelo/${duelId}`);
    } finally { setBusy(null); }
  }

  async function handleReject(duelId) {
    setBusy(duelId);
    try {
      await rejectDuel({ studentId: student.id, sessionToken: student.session_token, duelId });
      onChange?.();
    } finally { setBusy(null); }
  }

  function handleEnter(d) {
    // Duelos-tarea: bloquear fuera del horario de clase del grupo.
    if (d.is_task && d.in_class_window === false) {
      toast({
        variant: 'destructive',
        title: 'Fuera del horario de clase',
        description: 'Este duelo solo se puede jugar dentro de la franja configurada por tu profesor.',
      });
      return;
    }
    navigate(`/duelo/${d.duel_id}`);
  }

  // Cada jugador controla SU PROPIA visibilidad: al pulsar "Mostrar mi
  // identidad" se persiste en el servidor y el RIVAL te verá. Tú sigues sin
  // ver al rival hasta que el rival lo active voluntariamente.
  async function handleToggleMyReveal(d) {
    setRevealBusy(d.duel_id);
    try {
      await setDuelReveal({
        studentId: student.id,
        sessionToken: student.session_token,
        duelId: d.duel_id,
        revealed: !d.me_revealed,
      });
      onChange?.();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    } finally {
      setRevealBusy(null);
    }
  }

  function renderCard(d, kind) {
    const isTask = !!d.is_task;
    const rival = kind === 'incoming' ? d.challenger : d.opponent;
    // El rival es visible solo si el RIVAL ha activado su reveal. Para duelos
    // personales clásicos el backend inicializa ambos flags a true, así que
    // este flujo no cambia su comportamiento.
    const rivalHidden = rival?.hidden === true || d.rival_revealed === false;
    const rivalEmoji = rivalHidden ? '🕵️' : (rival?.emoji || '🎓');
    const rivalName = rivalHidden ? 'Rival oculto' : (rival?.name || 'Rival');

    const canEnter = !(isTask && d.in_class_window === false);
    const isPending = d.status === 'pending';
    const showAcceptButtons = kind === 'incoming' && isPending && !isTask;

    return (
      <motion.div
        key={d.duel_id}
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className={`p-3 rounded-xl border ${
          isTask || kind === 'incoming'
            ? 'bg-gradient-to-r from-violet-50 to-fuchsia-50 border-violet-200'
            : 'bg-slate-50 border-slate-200'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="text-3xl shrink-0">{rivalEmoji}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-bold text-slate-800 truncate">
                {kind === 'outgoing' && !rivalHidden ? `vs ${rivalName}` : rivalName}
              </p>
              <span className={`text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded-full font-bold ${
                isTask
                  ? 'bg-violet-600 text-white'
                  : kind === 'incoming'
                    ? 'bg-violet-600 text-white'
                    : 'bg-slate-600 text-white'
              }`}>
                {isTask ? 'Tarea · pendiente' : (kind === 'incoming' ? 'te reta' : statusLabel(d.status))}
              </span>
              {d.is_hidden && (
                <span title="Duelo oculto" className="text-slate-400">
                  <EyeOff className="w-3.5 h-3.5" />
                </span>
              )}
              {/* Toggle propio: solo relevante cuando el duelo empieza oculto
                  (tarea o personal con is_hidden). Para personales visibles
                  me_revealed ya viene true y no mostramos el botón. */}
              {(isTask || d.is_hidden) && (
                <button
                  type="button"
                  onClick={() => handleToggleMyReveal(d)}
                  disabled={revealBusy === d.duel_id}
                  title={d.me_revealed
                    ? 'Tu rival puede verte. Pulsa para volver a ocultarte.'
                    : 'Tu rival no sabe quién eres. Pulsa para mostrarle tu identidad.'}
                  className={`text-[10px] inline-flex items-center gap-1 px-2 py-0.5 rounded-full border font-semibold transition-all ${
                    d.me_revealed
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100'
                      : 'bg-white/80 border-violet-300 text-violet-700 hover:bg-white'
                  } disabled:opacity-50`}
                >
                  {d.me_revealed ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  {d.me_revealed ? 'Mi rival me ve' : 'Mostrar mi identidad'}
                </button>
              )}
            </div>
            <p className="text-xs text-slate-500 truncate">
              {d.app_name} {d.best_of > 1 && `· al mejor de ${d.best_of}`}
            </p>
          </div>

          {showAcceptButtons ? (
            <div className="flex gap-1 shrink-0">
              <button
                onClick={() => handleAccept(d.duel_id)}
                disabled={busy === d.duel_id}
                title="Aceptar"
                className="w-9 h-9 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center disabled:opacity-50"
              ><Check className="w-4 h-4" /></button>
              <button
                onClick={() => handleReject(d.duel_id)}
                disabled={busy === d.duel_id}
                title="Rechazar"
                className="w-9 h-9 rounded-lg bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center disabled:opacity-50"
              ><X className="w-4 h-4" /></button>
            </div>
          ) : kind === 'outgoing' && isPending && !isTask ? (
            <div className="flex items-center gap-1 text-xs text-slate-400 shrink-0">
              <Clock className="w-3.5 h-3.5" /> esperando
            </div>
          ) : (
            <button
              onClick={() => handleEnter(d)}
              disabled={!canEnter}
              title={canEnter ? 'Entrar al duelo' : 'Fuera del horario de clase'}
              className={`px-3 py-1.5 rounded-lg text-white text-xs font-bold flex items-center gap-1 ${
                canEnter
                  ? (isTask || kind === 'incoming' ? 'bg-violet-600 hover:bg-violet-700' : 'bg-slate-800 hover:bg-slate-900')
                  : 'bg-slate-400 cursor-not-allowed'
              }`}
            >
              {canEnter
                ? (<>Entrar <ArrowRight className="w-3 h-3" /></>)
                : (<><Lock className="w-3 h-3" /> Fuera de horario</>)}
            </button>
          )}
        </div>

        {/* Aviso clásico de duelo personal pendiente */}
        {isPending && !isTask && kind === 'incoming' && (
          <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-white/80 border border-violet-300">
            <div className="flex flex-col items-center px-2">
              <span className="text-[9px] uppercase font-bold text-violet-600">En juego</span>
              <span className="text-base font-black text-violet-700">±{stakeLabel(d.stake)}</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-tight">
              Si <strong>ganas</strong> sumas <strong className="text-emerald-600">+{stakeLabel(d.stake)}</strong> a tu nota.
              Si <strong>pierdes</strong> restas <strong className="text-rose-600">−{stakeLabel(d.stake)}</strong>.
              Decide si aceptas el reto.
            </p>
          </div>
        )}

        {isTask && (
          <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-white/80 border border-violet-300">
            <div className="flex flex-col items-center px-2">
              <span className="text-[9px] uppercase font-bold text-violet-600">Tarea</span>
              <span className="text-base font-black text-violet-700">+0,10</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-tight">
              Tienes un <strong>duelo pendiente</strong> asignado por tu profesor. Si <strong>ganas</strong> sumas <strong className="text-emerald-600">+0,10</strong> a tu bonus de duelos; si pierdes, <strong>sin penalización</strong>.
              {d.in_class_window === false && (
                <> <br /><span className="text-amber-700 font-semibold">Solo se puede jugar dentro del horario de clase.</span></>
              )}
            </p>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-violet-200 shadow-sm p-4 mb-6"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
          <Swords className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-base font-bold text-slate-800">Duelos</h3>
        <span className="text-xs text-slate-400 ml-auto">
          {incoming.length + outgoing.length} activo{incoming.length + outgoing.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {incoming.map(d => renderCard(d, 'incoming'))}
          {outgoing.map(d => renderCard(d, 'outgoing'))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
