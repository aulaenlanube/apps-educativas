import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, X, EyeOff, Users, Gamepad2, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getDuelOpponents, createDuel } from '@/services/duelService';
import { DUELABLE_APPS } from '@/apps/config/duelableApps';

const STAKES = [
  { value: 0.1, label: '0,1 puntos', color: 'from-emerald-400 to-emerald-600' },
  { value: 0.2, label: '0,2 puntos', color: 'from-amber-400 to-amber-600' },
  { value: 0.3, label: '0,3 puntos', color: 'from-rose-400 to-rose-600' },
];

export default function DuelCreateModal({ open, onClose }) {
  const { student } = useAuth();
  const navigate = useNavigate();
  const [opponents, setOpponents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [filter, setFilter] = useState('');
  const [opponentId, setOpponentId] = useState(null);
  const [appId, setAppId] = useState(null);
  const [stake, setStake] = useState(0.1);
  const [isHidden, setIsHidden] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open || !student) return;
    setLoading(true); setErr(null);
    getDuelOpponents({ studentId: student.id, sessionToken: student.session_token })
      .then(list => setOpponents(list))
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false));
  }, [open, student]);

  useEffect(() => {
    if (!open) {
      setOpponentId(null); setAppId(null); setStake(0.1);
      setIsHidden(false); setFilter(''); setErr(null);
    }
  }, [open]);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return opponents;
    return opponents.filter(o => (o.name || '').toLowerCase().includes(q));
  }, [opponents, filter]);

  const canSubmit = opponentId && appId && stake && !submitting;

  async function onSubmit() {
    if (!canSubmit) return;
    const app = DUELABLE_APPS.find(a => a.id === appId);
    setSubmitting(true); setErr(null);
    try {
      const res = await createDuel({
        studentId: student.id,
        sessionToken: student.session_token,
        opponentId,
        appId,
        appName: app.name,
        level: student.group_level,
        grade: student.group_grade,
        subjectId: student.group_subject_id || null,
        stake,
        bestOf: app.duel?.bestOf || 1,
        isHidden,
      });
      onClose?.();
      navigate(`/duelo/${res.duel_id}`);
    } catch (e) {
      setErr(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-500 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                  <Swords className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Crear duelo 1 vs 1</h2>
                  <p className="text-xs text-white/80">Reta a un compañero y juega tu nota</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/15">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Oponente */}
              <section>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-violet-600" />
                  <h3 className="text-sm font-bold text-slate-800">Elige a tu rival</h3>
                </div>
                <input
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                  placeholder="Buscar por nombre…"
                  className="w-full px-3 py-2 mb-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
                {loading ? (
                  <div className="text-sm text-slate-400">Cargando compañeros…</div>
                ) : filtered.length === 0 ? (
                  <div className="text-sm text-slate-400">
                    {opponents.length === 0
                      ? 'No hay compañeros disponibles en tus grupos.'
                      : 'Ningun compañero coincide con la busqueda.'}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-52 overflow-y-auto pr-1">
                    {filtered.map(o => (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => setOpponentId(o.id)}
                        className={`flex items-center gap-2 p-2 rounded-lg border transition-all text-left ${
                          opponentId === o.id
                            ? 'border-violet-500 bg-violet-50 shadow-sm'
                            : 'border-slate-200 hover:border-violet-300 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-2xl shrink-0">{o.emoji || '🎓'}</span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">{o.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {o.same_group ? 'Tu grupo' : o.group_name}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </section>

              {/* App */}
              <section>
                <div className="flex items-center gap-2 mb-2">
                  <Gamepad2 className="w-4 h-4 text-violet-600" />
                  <h3 className="text-sm font-bold text-slate-800">Elige el juego</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {DUELABLE_APPS.map(a => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => setAppId(a.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        appId === a.id
                          ? 'border-violet-500 bg-violet-50 shadow-sm'
                          : 'border-slate-200 hover:border-violet-300 hover:bg-slate-50'
                      }`}
                    >
                      <p className="text-sm font-bold text-slate-800">{a.name}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{a.description}</p>
                      {a.duel?.bestOf > 1 && (
                        <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold">
                          Al mejor de {a.duel.bestOf}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </section>

              {/* Stake */}
              <section>
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-violet-600" />
                  <h3 className="text-sm font-bold text-slate-800">¿Qué os jugáis?</h3>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {STAKES.map(s => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setStake(s.value)}
                      className={`p-3 rounded-xl border-2 transition-all text-center ${
                        stake === s.value
                          ? 'border-violet-500 shadow-md'
                          : 'border-slate-200 hover:border-violet-300'
                      }`}
                    >
                      <div className={`text-white font-bold text-lg bg-gradient-to-br ${s.color} rounded-lg py-2`}>
                        +/- {s.value.toString().replace('.', ',')}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">{s.label}</p>
                    </button>
                  ))}
                </div>
              </section>

              {/* Oculto */}
              <section>
                <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={isHidden}
                    onChange={e => setIsHidden(e.target.checked)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <EyeOff className="w-4 h-4 text-slate-500" /> Duelo oculto
                    </p>
                    <p className="text-xs text-slate-500">
                      Tu rival no sabrá quién le ha retado hasta el final de la partida.
                    </p>
                  </div>
                </label>
              </section>

              {err && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                  {err}
                </div>
              )}
            </div>

            <div className="flex gap-2 p-4 border-t border-slate-100 bg-slate-50">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 text-slate-600 font-medium hover:bg-white"
              >
                Cancelar
              </button>
              <button
                onClick={onSubmit}
                disabled={!canSubmit}
                className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold shadow hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? 'Enviando reto…' : 'Retar'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
