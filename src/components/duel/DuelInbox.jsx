import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Swords, EyeOff, Check, X, ArrowRight, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { acceptDuel, rejectDuel } from '@/services/duelService';

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
  const [busy, setBusy] = useState(null);

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
          {incoming.map(d => (
            <motion.div
              key={d.duel_id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-violet-50 to-fuchsia-50 border border-violet-200"
            >
              <div className="text-3xl shrink-0">
                {d.challenger?.hidden ? '🕵️' : (d.challenger?.emoji || '🎓')}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-bold text-slate-800 truncate">
                    {d.challenger?.hidden ? 'Rival oculto' : d.challenger?.name}
                  </p>
                  <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-violet-600 text-white font-bold">
                    te reta
                  </span>
                  {d.is_hidden && (
                    <span title="Duelo oculto" className="text-slate-400"><EyeOff className="w-3.5 h-3.5" /></span>
                  )}
                </div>
                <p className="text-xs text-slate-500 truncate">
                  {d.app_name} · {stakeLabel(d.stake)} {d.best_of > 1 && `· al mejor de ${d.best_of}`}
                </p>
              </div>
              {d.status === 'pending' ? (
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
              ) : (
                <button
                  onClick={() => navigate(`/duelo/${d.duel_id}`)}
                  className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold flex items-center gap-1"
                >
                  Entrar <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </motion.div>
          ))}

          {outgoing.map(d => (
            <motion.div
              key={d.duel_id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200"
            >
              <div className="text-3xl shrink-0">{d.opponent?.emoji || '🎓'}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-bold text-slate-800 truncate">vs {d.opponent?.name}</p>
                  <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-slate-600 text-white font-bold">
                    {statusLabel(d.status)}
                  </span>
                  {d.is_hidden && <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
                </div>
                <p className="text-xs text-slate-500 truncate">
                  {d.app_name} · {stakeLabel(d.stake)} {d.best_of > 1 && `· al mejor de ${d.best_of}`}
                </p>
              </div>
              {d.status === 'pending' ? (
                <div className="flex items-center gap-1 text-xs text-slate-400 shrink-0">
                  <Clock className="w-3.5 h-3.5" /> esperando
                </div>
              ) : (
                <button
                  onClick={() => navigate(`/duelo/${d.duel_id}`)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold flex items-center gap-1"
                >
                  Entrar <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
