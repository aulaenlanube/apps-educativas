import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ClipboardList, ArrowUp, ArrowDown, Minus, CheckCircle2, XCircle, Trophy } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

function notaColor(nota) {
  if (nota == null) return 'text-slate-400';
  if (nota >= 8) return 'text-green-600';
  if (nota >= 5) return 'text-blue-600';
  return 'text-red-500';
}

export default function AssignmentScoresDialog({ open, onOpenChange, assignment }) {
  const [loading, setLoading] = useState(false);
  const [scores, setScores] = useState([]);
  const [minScore, setMinScore] = useState(assignment?.min_score ?? 5);
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' | 'asc' | 'name'

  const load = useCallback(async () => {
    if (!assignment?.id) return;
    setLoading(true);
    const { data } = await supabase.rpc('teacher_get_assignment_scores', {
      p_assignment_id: assignment.id,
    });
    if (data?.scores) {
      setScores(data.scores);
      if (data.min_score != null) setMinScore(Number(data.min_score));
    } else {
      setScores([]);
    }
    setLoading(false);
  }, [assignment?.id]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  const sortedScores = useMemo(() => {
    const arr = [...scores];
    if (sortOrder === 'name') {
      arr.sort((a, b) => (a.display_name || '').localeCompare(b.display_name || ''));
    } else {
      arr.sort((a, b) => {
        const av = a.best_nota == null ? 0 : Number(a.best_nota);
        const bv = b.best_nota == null ? 0 : Number(b.best_nota);
        return sortOrder === 'desc' ? bv - av : av - bv;
      });
    }
    return arr;
  }, [scores, sortOrder]);

  // Nota media de la clase: los que no lo han intentado cuentan como 0
  // (coherente con "siempre tienes una nota, si no lo has intentado es 0").
  const stats = useMemo(() => {
    const played = scores.filter(s => s.best_nota != null);
    const passed = played.filter(s => s.passed).length;
    const avg = scores.length
      ? scores.reduce((sum, s) => sum + Number(s.best_nota ?? 0), 0) / scores.length
      : null;
    return {
      total: scores.length,
      played: played.length,
      passed,
      avg: avg != null ? Math.round(avg * 10) / 10 : null,
    };
  }, [scores]);

  if (!assignment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto scrollbar-hide">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-purple-500" />
            {assignment.title || assignment.app_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {assignment.title && (
              <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-600">{assignment.app_name}</span>
            )}
            <span className="px-2 py-1 rounded-full bg-purple-50 text-purple-700">
              Nota mínima: <strong>{minScore}/10</strong>
            </span>
            {assignment.weight > 1 && (
              <span className="px-2 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold shadow-sm">
                x{assignment.weight} en la nota final
              </span>
            )}
            {assignment.term && (
              <span className="px-2 py-1 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold shadow-sm">
                {assignment.term}ª Evaluación
              </span>
            )}
            {assignment.due_date && (
              <span className="px-2 py-1 rounded-full bg-amber-50 text-amber-700">
                Fecha límite: {formatDate(assignment.due_date)}
              </span>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100 p-3 text-center">
              <div className="text-xs text-slate-500">Han jugado</div>
              <div className="text-lg font-bold text-slate-800">{stats.played}/{stats.total}</div>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 p-3 text-center">
              <div className="text-xs text-slate-500">Aprobados</div>
              <div className="text-lg font-bold text-green-600">{stats.passed}</div>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-100 p-3 text-center">
              <div className="text-xs text-slate-500">Nota media</div>
              <div className="text-lg font-bold text-amber-600">{stats.avg != null ? stats.avg : '—'}</div>
            </div>
          </div>

          {/* Sort toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700">Alumnos</span>
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
              <button
                onClick={() => setSortOrder('desc')}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all ${
                  sortOrder === 'desc' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
                title="Mejor nota primero"
              >
                <ArrowDown className="w-3 h-3" /> Nota
              </button>
              <button
                onClick={() => setSortOrder('asc')}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all ${
                  sortOrder === 'asc' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
                title="Peor nota primero"
              >
                <ArrowUp className="w-3 h-3" /> Nota
              </button>
              <button
                onClick={() => setSortOrder('name')}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all ${
                  sortOrder === 'name' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
                title="Por nombre"
              >
                <Minus className="w-3 h-3" /> A–Z
              </button>
            </div>
          </div>

          {/* List */}
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
            </div>
          ) : sortedScores.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">No hay alumnos en este grupo.</div>
          ) : (
            <ol className="space-y-2">
              {sortedScores.map((s, idx) => {
                const isTop = sortOrder === 'desc' && idx === 0 && s.best_nota != null;
                return (
                  <li
                    key={s.student_id}
                    className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${
                      isTop ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200' : 'bg-white border-slate-100 hover:border-purple-200'
                    }`}
                  >
                    <span className="w-6 text-center text-xs font-bold text-slate-400">{idx + 1}</span>
                    <span
                      className="w-9 h-9 rounded-full flex items-center justify-center text-lg shrink-0"
                      style={{ backgroundColor: s.avatar_color || '#e9d5ff' }}
                    >
                      {s.avatar_emoji || '🙂'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-slate-800 truncate">{s.display_name}</span>
                        {isTop && <Trophy className="w-3.5 h-3.5 text-amber-500" />}
                      </div>
                      <div className="text-xs text-slate-400">
                        {s.best_nota != null ? (
                          <>
                            {s.attempts_count} {s.attempts_count === 1 ? 'intento' : 'intentos'}
                            {s.last_played_at && ` · ${formatDate(s.last_played_at)}`}
                          </>
                        ) : (
                          'Sin intentos'
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {s.best_nota != null ? (
                        s.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400" />
                        )
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-300" />
                      )}
                      <span className={`text-lg font-bold min-w-[3.5ch] text-right ${notaColor(s.best_nota ?? 0)}`}>
                        {Number(s.best_nota ?? 0).toFixed(1)}
                      </span>
                      <span className="text-xs text-slate-400">/10</span>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
