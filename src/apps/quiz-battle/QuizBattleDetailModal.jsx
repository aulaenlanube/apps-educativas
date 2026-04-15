import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Users, Target, Trophy, Timer, TrendingUp, Hash } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

function fmtMs(ms) {
  if (ms === null || ms === undefined) return '—';
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(1)} s`;
}
function fmtDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function QuizBattleDetailModal({ roomCode, onClose }) {
  const { teacher } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!teacher?.id || !roomCode) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    supabase.rpc('get_quiz_battle_detail', {
      p_teacher_id: teacher.id,
      p_room_code: roomCode,
    }).then(({ data, error }) => {
      if (cancelled) return;
      if (error) { setError(error.message); setLoading(false); return; }
      if (data?.error) { setError('No tienes acceso a esta batalla'); setLoading(false); return; }
      setData(data);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [teacher?.id, roomCode]);

  // Construir el pivot: filas = jugadores, columnas = preguntas
  const pivot = useMemo(() => {
    if (!data) return null;
    const cells = data.cells || [];
    const questions = (data.questions || []).slice().sort((a, b) => a.question_index - b.question_index);
    const players = (data.players || []).slice().sort((a, b) => (a.rank || 99) - (b.rank || 99));

    // Map: player (id o nombre) → { [qIdx]: cell }
    const byPlayer = new Map();
    const playerKeys = new Map(); // key consistente para match con players
    players.forEach((p) => {
      const key = p.user_id || `guest-${p.display_name}`;
      playerKeys.set(p.display_name, key);
      byPlayer.set(key, {
        info: p,
        cells: {},
        totalMs: 0,
        answeredCount: 0,
      });
    });
    // También alumnos que estén en cells pero no en players (por si acaso)
    cells.forEach((c) => {
      const key = c.user_id || `guest-${c.display_name}`;
      if (!byPlayer.has(key)) {
        byPlayer.set(key, {
          info: { display_name: c.display_name, avatar_emoji: c.avatar_emoji, rank: 99, score: 0 },
          cells: {},
          totalMs: 0,
          answeredCount: 0,
        });
      }
      byPlayer.get(key).cells[c.question_index] = c;
      if (c.response_time_ms !== null && c.response_time_ms !== undefined) {
        byPlayer.get(key).totalMs += c.response_time_ms;
        byPlayer.get(key).answeredCount += 1;
      }
    });

    // Array final ordenado por ranking
    const rows = Array.from(byPlayer.values())
      .sort((a, b) => (a.info.rank || 99) - (b.info.rank || 99));

    return { rows, questions };
  }, [data]);

  const fastestPlayer = useMemo(() => {
    if (!pivot) return null;
    let best = null;
    pivot.rows.forEach((r) => {
      if (r.answeredCount === 0) return;
      const avg = r.totalMs / r.answeredCount;
      if (!best || avg < best.avg) best = { name: r.info.display_name, emoji: r.info.avatar_emoji, avg };
    });
    return best;
  }, [pivot]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
          transition={{ type: 'spring', stiffness: 220, damping: 22 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[92vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10">
            <div>
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-purple-500" />
                <span className="font-mono font-bold text-purple-700">{roomCode}</span>
                {data?.meta?.created_at && (
                  <span className="text-xs text-slate-500">· {fmtDate(data.meta.created_at)}</span>
                )}
              </div>
              <h3 className="text-lg font-bold text-slate-800 mt-0.5">Detalle de la batalla</h3>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-4 h-4 text-slate-600" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-auto">
            {loading && (
              <div className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600" />
              </div>
            )}
            {error && !loading && (
              <div className="p-10 text-center text-rose-500 text-sm">{error}</div>
            )}
            {!loading && !error && pivot && (
              <div className="p-6 space-y-6">
                {/* Summary cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <SummaryCard icon={<Users className="w-4 h-4" />} label="Jugadores"
                    value={pivot.rows.length} color="indigo" />
                  <SummaryCard icon={<Target className="w-4 h-4" />} label="Preguntas"
                    value={pivot.questions.length} color="purple" />
                  <SummaryCard icon={<Timer className="w-4 h-4" />} label="Tiempo medio resp."
                    value={fmtMs(Math.round(data.avg_response_ms || 0))} color="amber" />
                  <SummaryCard icon={<TrendingUp className="w-4 h-4" />} label="Más rápido"
                    value={fastestPlayer
                      ? `${fastestPlayer.emoji || ''} ${fastestPlayer.name} (${fmtMs(Math.round(fastestPlayer.avg))})`
                      : '—'} color="emerald" compact />
                </div>

                {/* Pivot table */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="overflow-auto max-h-[55vh]">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-slate-100 shadow-sm z-10">
                        <tr className="text-left">
                          <th className="px-3 py-2.5 text-xs font-bold text-slate-600">#</th>
                          <th className="px-3 py-2.5 text-xs font-bold text-slate-600">Jugador</th>
                          {pivot.questions.map((q) => (
                            <th key={q.question_index} className="px-2 py-2 text-xs font-bold text-slate-600 text-center min-w-[88px]"
                              title={q.question_text}>
                              P{q.question_index + 1}
                            </th>
                          ))}
                          <th className="px-3 py-2.5 text-xs font-bold text-slate-600 text-center">Aciertos</th>
                          <th className="px-3 py-2.5 text-xs font-bold text-slate-600 text-center">T. medio</th>
                          <th className="px-3 py-2.5 text-xs font-bold text-slate-600 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {pivot.rows.map((row) => {
                          const info = row.info;
                          const avgMs = row.answeredCount > 0 ? Math.round(row.totalMs / row.answeredCount) : null;
                          const correctCount = Object.values(row.cells).filter((c) => c.is_correct).length;
                          return (
                            <tr key={info.display_name + (info.user_id || '')} className="hover:bg-indigo-50/30 transition-colors">
                              <td className="px-3 py-2">
                                <span className={`inline-flex w-7 h-7 rounded-lg items-center justify-center text-xs font-black ${
                                  info.rank === 1 ? 'bg-amber-100 text-amber-700' :
                                  info.rank === 2 ? 'bg-slate-100 text-slate-700' :
                                  info.rank === 3 ? 'bg-orange-100 text-orange-700' :
                                  'bg-slate-50 text-slate-400'
                                }`}>
                                  {info.rank === 1 ? '🥇' : info.rank === 2 ? '🥈' : info.rank === 3 ? '🥉' : info.rank}
                                </span>
                              </td>
                              <td className="px-3 py-2">
                                <div className="flex items-center gap-2 font-semibold text-slate-700">
                                  <span className="text-base">{info.avatar_emoji || '🙂'}</span>
                                  <span className="truncate max-w-[140px]">{info.display_name}</span>
                                </div>
                              </td>
                              {pivot.questions.map((q) => {
                                const cell = row.cells[q.question_index];
                                return (
                                  <td key={q.question_index} className="px-2 py-2 text-center">
                                    <Cell cell={cell} />
                                  </td>
                                );
                              })}
                              <td className="px-3 py-2 text-center text-xs font-bold text-emerald-600">
                                {correctCount}/{pivot.questions.length}
                              </td>
                              <td className="px-3 py-2 text-center text-xs text-slate-600 font-mono">
                                {fmtMs(avgMs)}
                              </td>
                              <td className="px-3 py-2 text-right text-sm font-black text-amber-600">
                                {(info.score || 0).toLocaleString('es-ES')}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Per-question summary */}
                <div>
                  <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-2">
                    <Trophy className="w-4 h-4 text-amber-500" /> Preguntas
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {pivot.questions.map((q) => (
                      <div key={q.question_index} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">P{q.question_index + 1}</span>
                        </div>
                        <div className="text-sm text-slate-800 mb-1 line-clamp-2">{q.question_text}</div>
                        <div className="text-xs text-emerald-600 font-semibold">✓ {q.correct_text}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function SummaryCard({ icon, label, value, color, compact }) {
  const bg = {
    indigo:  'from-indigo-500 to-indigo-600',
    purple:  'from-purple-500 to-fuchsia-600',
    amber:   'from-amber-500 to-orange-500',
    emerald: 'from-emerald-500 to-teal-600',
  }[color] || 'from-slate-500 to-slate-600';
  return (
    <div className={`rounded-xl p-3 bg-gradient-to-br ${bg} text-white shadow-sm`}>
      <div className="flex items-center gap-1.5 text-xs font-medium opacity-90">{icon} {label}</div>
      <div className={`font-black mt-1 leading-tight ${compact ? 'text-sm' : 'text-2xl'}`}>{value}</div>
    </div>
  );
}

function Cell({ cell }) {
  if (!cell) {
    return <span className="text-slate-300 text-xs">—</span>;
  }
  if (cell.answer_index === null || cell.answer_index === undefined) {
    return (
      <div className="inline-flex flex-col items-center gap-0.5 text-slate-400">
        <span className="text-xs font-bold">⏰</span>
        <span className="text-[10px]">sin resp.</span>
      </div>
    );
  }
  const correct = cell.is_correct;
  const delta = cell.score_delta || 0;
  const ms = cell.response_time_ms;
  return (
    <div className="inline-flex flex-col items-center gap-0.5">
      <span className={`text-sm font-black ${correct ? 'text-emerald-600' : 'text-rose-400'}`}>
        {correct ? `+${delta}` : '✗'}
      </span>
      <span className="text-[10px] text-slate-500 font-mono">{fmtMs(ms)}</span>
    </div>
  );
}
