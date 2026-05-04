import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, X, Users, Gamepad2, Search, Sparkles } from 'lucide-react';
import { teacherGetDuelOpponents, teacherCreateDuel } from '@/services/duelService';
import { DUELABLE_APPS } from '@/apps/config/duelableApps';
import UserAvatar from '@/components/ui/UserAvatar';

// Modal de "retar a un alumno" para el docente. Siempre crea un duelo
// amistoso (stake=0), sin oculto. El alumno verá el reto en su inbox y
// debe aceptarlo desde su panel para que el duelo arranque.

export default function TeacherDuelCreateModal({ open, onClose, onCreated }) {
  const navigate = useNavigate();
  const [opponents, setOpponents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [opponentId, setOpponentId] = useState(null);
  const [appId, setAppId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!open) return;
    setLoading(true); setErr(null);
    teacherGetDuelOpponents()
      .then(list => setOpponents(Array.isArray(list) ? list : []))
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false));
  }, [open]);

  useEffect(() => {
    if (!open) {
      setOpponentId(null); setAppId(null); setErr(null); setSearch('');
    }
  }, [open]);

  const filteredOpponents = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return opponents;
    return opponents.filter(o =>
      (o.name || '').toLowerCase().includes(q) ||
      (o.group_name || '').toLowerCase().includes(q)
    );
  }, [opponents, search]);

  const opponent = opponents.find(o => o.id === opponentId);
  const canSubmit = opponentId && appId && !submitting;

  async function onSubmit() {
    if (!canSubmit) return;
    const app = DUELABLE_APPS.find(a => a.id === appId);
    if (!app || !opponent) return;
    setSubmitting(true); setErr(null);
    try {
      const res = await teacherCreateDuel({
        opponentId,
        appId,
        appName: app.name,
        // duels.level/grade/subject_id son referenciales: la propia app
        // duel los recoge de duelInfo cuando arranca. Pasamos vacíos:
        // useDuel + las apps caen al fallback de level/grade del path.
        level: '', grade: '', subjectId: null,
        bestOf: app.duel?.bestOf || 1,
      });
      onCreated?.(res?.duel_id);
      onClose?.();
      // Entra el profesor en la sala de duelo: el alumno verá el reto en
      // su inbox, lo aceptará y se reunirá aquí.
      if (res?.duel_id) navigate(`/duelo/${res.duel_id}`);
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
                  <h2 className="text-lg font-bold">Retar a un alumno</h2>
                  <p className="text-xs text-white/80">Duelo amistoso (no se juega nota)</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/15">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              <section>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-violet-600" />
                  <h3 className="text-sm font-bold text-slate-800">Elige a tu alumno rival</h3>
                </div>
                <div className="relative mb-2">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Buscar por nombre o grupo…"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-violet-400"
                  />
                </div>
                {loading ? (
                  <div className="text-sm text-slate-400 py-3">Cargando alumnos…</div>
                ) : opponents.length === 0 ? (
                  <div className="text-sm text-slate-400 py-3">
                    No tienes alumnos en ningún grupo todavía.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                    {filteredOpponents.map(o => (
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
                        <UserAvatar
                          selectedAvatarCode={o.selected_avatar_code}
                          avatarEmoji={o.emoji}
                          avatarColor={o.color}
                          size="md"
                          showRarityBorder={false}
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">{o.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{o.group_name}</p>
                        </div>
                      </button>
                    ))}
                    {filteredOpponents.length === 0 && (
                      <p className="text-xs text-slate-400 italic col-span-full text-center py-2">
                        Sin coincidencias.
                      </p>
                    )}
                  </div>
                )}
              </section>

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

              <div className="flex items-start gap-2 bg-violet-50 border border-violet-200 rounded-lg p-3 text-xs text-violet-900">
                <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>
                  Es un duelo <strong>amistoso</strong>: ni tú ni el alumno os jugáis puntos en la nota.
                  El alumno recibirá el reto en su bandeja de duelos y deberá aceptarlo para empezar.
                </p>
              </div>

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
