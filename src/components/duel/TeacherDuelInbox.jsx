import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, X, Clock, Loader2, CheckCircle2, Trash2, RefreshCw } from 'lucide-react';
import { teacherGetMyDuels, teacherVoidDuel } from '@/services/duelService';
import UserAvatar from '@/components/ui/UserAvatar';
import { useToast } from '@/components/ui/use-toast';
import { toastError } from '@/lib/supabaseErrors';

const STATUS_META = {
  pending:     { label: 'Esperando',     icon: Clock,        cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  accepted:    { label: 'Aceptado',      icon: CheckCircle2, cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  in_progress: { label: 'En curso',      icon: Loader2,      cls: 'bg-blue-50 text-blue-700 border-blue-200' },
};

export default function TeacherDuelInbox({ open, onClose, onCreateClick }) {
  const { toast } = useToast();
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const d = await teacherGetMyDuels();
      setOutgoing(Array.isArray(d?.outgoing) ? d.outgoing : []);
    } catch (e) {
      toast(toastError(e));
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { if (open) reload(); }, [open, reload]);

  async function cancel(duelId) {
    setCancelling(duelId);
    try {
      await teacherVoidDuel({ duelId, reason: 'cancelled' });
      await reload();
      toast({ title: 'Duelo cancelado' });
    } catch (e) {
      toast(toastError(e));
    } finally {
      setCancelling(null);
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
                  <h2 className="text-lg font-bold">Mis duelos</h2>
                  <p className="text-xs text-white/80">Retos amistosos a tus alumnos</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={reload} className="p-2 rounded-lg hover:bg-white/15" title="Recargar">
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/15">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {loading ? (
                <div className="text-sm text-slate-400 py-6 text-center">Cargando…</div>
              ) : outgoing.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <Swords className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-600 mb-1">No tienes duelos en curso</p>
                  <p className="text-xs text-slate-400 mb-4">Reta a un alumno para empezar uno amistoso.</p>
                  <button
                    onClick={() => { onClose?.(); onCreateClick?.(); }}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm font-bold shadow hover:shadow-lg"
                  >
                    Retar a un alumno
                  </button>
                </div>
              ) : (
                outgoing.map(d => {
                  const meta = STATUS_META[d.status] || STATUS_META.pending;
                  const Icon = meta.icon;
                  return (
                    <div key={d.duel_id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-violet-200 transition-colors">
                      <UserAvatar
                        selectedAvatarCode={d.opponent?.selected_avatar_code}
                        avatarEmoji={d.opponent?.emoji}
                        avatarColor={d.opponent?.color}
                        size="md"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-bold text-slate-800 truncate">vs {d.opponent?.name || 'Alumno'}</p>
                          <span className={`inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wide px-1.5 py-0.5 rounded-full border ${meta.cls}`}>
                            <Icon className={`w-3 h-3 ${d.status === 'in_progress' ? 'animate-spin' : ''}`} />
                            {meta.label}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate">{d.app_name} · amistoso</p>
                      </div>
                      <button
                        onClick={() => cancel(d.duel_id)}
                        disabled={cancelling === d.duel_id}
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                        title="Cancelar duelo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {outgoing.length > 0 && (
              <div className="p-4 border-t border-slate-100 bg-slate-50">
                <button
                  onClick={() => { onClose?.(); onCreateClick?.(); }}
                  className="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold shadow hover:shadow-lg"
                >
                  Retar a otro alumno
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
