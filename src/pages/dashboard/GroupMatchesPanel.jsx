import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Swords, Zap, Trash2, RefreshCw, Trophy, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel,
} from '@/components/ui/alert-dialog';

const DUEL_STATUS_LABEL = {
  pending:     { label: 'Pendiente',   cls: 'bg-amber-50 text-amber-700' },
  accepted:    { label: 'Aceptado',    cls: 'bg-blue-50 text-blue-700' },
  in_progress: { label: 'En curso',    cls: 'bg-violet-50 text-violet-700' },
  finished:    { label: 'Terminado',   cls: 'bg-emerald-50 text-emerald-700' },
  void:        { label: 'Anulado',     cls: 'bg-slate-100 text-slate-500' },
  rejected:    { label: 'Rechazado',   cls: 'bg-rose-50 text-rose-700' },
};

function formatDateTime(s) {
  if (!s) return '—';
  return new Date(s).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

export default function GroupMatchesPanel({ groupId, groupName }) {
  const { toast } = useToast();
  const [duels, setDuels] = useState([]);
  const [battles, setBattles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toDelete, setToDelete] = useState(null); // { kind: 'duel'|'battle', id }

  const load = useCallback(async () => {
    if (!groupId) return;
    setLoading(true);
    const [dRes, bRes] = await Promise.all([
      supabase.rpc('teacher_get_group_duels',   { p_group_id: groupId }),
      supabase.rpc('teacher_get_group_battles', { p_group_id: groupId }),
    ]);
    setDuels(dRes.data?.duels || []);
    setBattles(bRes.data?.battles || []);
    setLoading(false);
  }, [groupId]);

  useEffect(() => { load(); }, [load]);

  const confirmDelete = async () => {
    if (!toDelete) return;
    if (toDelete.kind === 'duel') {
      const { data, error } = await supabase.rpc('teacher_delete_duel', { p_duel_id: toDelete.id });
      if (error || data?.error) {
        toast({ variant: 'destructive', title: 'Error', description: error?.message || data?.error });
      } else {
        toast({ title: 'Duelo eliminado', description: 'Se han retirado sus puntos del ranking.' });
      }
    } else {
      const { data, error } = await supabase.rpc('teacher_delete_battle', { p_room_code: toDelete.id });
      if (error || data?.error) {
        toast({ variant: 'destructive', title: 'Error', description: error?.message || data?.error });
      } else {
        toast({ title: 'Batalla eliminada', description: `Retirados ${data?.affected_students || 0} alumnos.` });
      }
    }
    setToDelete(null);
    load();
  };

  const deleteLabel = useMemo(() => {
    if (!toDelete) return '';
    return toDelete.kind === 'duel'
      ? 'Esto borrará el duelo, sus rondas y los puntos (ganados o perdidos) que generó en las notas de ambos alumnos. La XP e insignias ya otorgadas se conservan.'
      : 'Esto borrará la batalla, todas sus respuestas y el bonus de podio aplicado a las notas de los alumnos. La XP e insignias ya otorgadas se conservan.';
  }, [toDelete]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-purple-100 p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" />
          Duelos y batallas de {groupName || 'este grupo'}
        </h3>
        <Button size="sm" variant="ghost" onClick={load} disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Duelos */}
      <section className="mb-5">
        <h4 className="text-sm font-semibold text-slate-600 flex items-center gap-1.5 mb-2">
          <Swords className="w-4 h-4 text-violet-500" />
          Duelos ({duels.length})
        </h4>
        {duels.length === 0 ? (
          <div className="text-center py-5 text-xs text-slate-400">Ningún duelo aún.</div>
        ) : (
          <ul className="space-y-1.5 max-h-72 overflow-y-auto scrollbar-hide">
            {duels.map(d => {
              const winnerName = d.winner_id === d.challenger?.id ? d.challenger?.name
                               : d.winner_id === d.opponent?.id   ? d.opponent?.name
                               : null;
              const st = DUEL_STATUS_LABEL[d.status] || { label: d.status, cls: 'bg-slate-100 text-slate-500' };
              return (
                <li key={d.id} className="flex items-center gap-3 p-2 rounded-lg border border-slate-100 hover:border-purple-200 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-slate-700 truncate">
                        {d.challenger?.emoji} {d.challenger?.name || '—'} vs {d.opponent?.emoji} {d.opponent?.name || '—'}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${st.cls}`}>{st.label}</span>
                      {d.is_hidden && <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-white font-semibold">OCULTO</span>}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 flex-wrap">
                      <span>{d.app_name}</span>
                      <span>·</span>
                      <span>stake {Number(d.stake).toFixed(2)}</span>
                      {winnerName && (<><span>·</span><span className="text-emerald-600 font-semibold">🏆 {winnerName}</span></>)}
                      <span>·</span>
                      <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> {formatDateTime(d.created_at)}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setToDelete({ kind: 'duel', id: d.id })}
                    className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                    title="Eliminar duelo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Batallas */}
      <section>
        <h4 className="text-sm font-semibold text-slate-600 flex items-center gap-1.5 mb-2">
          <Zap className="w-4 h-4 text-amber-500" />
          Batallas ({battles.length})
        </h4>
        {battles.length === 0 ? (
          <div className="text-center py-5 text-xs text-slate-400">Ninguna batalla aún.</div>
        ) : (
          <ul className="space-y-1.5 max-h-72 overflow-y-auto scrollbar-hide">
            {battles.map(b => (
              <li key={b.room_code} className="flex items-center gap-3 p-2 rounded-lg border border-slate-100 hover:border-purple-200 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-mono font-semibold text-slate-700">#{b.room_code}</span>
                    {b.term && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-pink-50 text-pink-700 font-semibold">
                        {b.term}ª ev.
                      </span>
                    )}
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                      {b.group_player_count}/{b.player_count} del grupo
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2 flex-wrap">
                    <span>{b.total_questions} preg.</span>
                    <span>·</span>
                    <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> {formatDateTime(b.created_at)}</span>
                    {Array.isArray(b.players) && b.players.slice(0, 3).map((p) => (
                      <span key={`${b.room_code}-${p.rank}`} className={`${p.in_group ? 'text-amber-600 font-semibold' : ''}`}>
                        · {p.rank}º {p.avatar_emoji} {p.display_name}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setToDelete({ kind: 'battle', id: b.room_code })}
                  className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                  title="Eliminar batalla"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <AlertDialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar {toDelete?.kind === 'duel' ? 'duelo' : 'batalla'}?</AlertDialogTitle>
            <AlertDialogDescription>{deleteLabel}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
