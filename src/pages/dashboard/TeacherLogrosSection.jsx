import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Lock, Filter, Gamepad2, Clock, Target, BookOpen, TrendingUp, Award, BarChart3 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useGamification } from '@/hooks/useGamification';
import BadgeIcon from '@/components/ui/BadgeIcon';

const RARITY_CONFIG = {
  common:    { label: 'Comun',      color: 'border-slate-300 bg-slate-50',     badge: 'bg-slate-200 text-slate-700' },
  rare:      { label: 'Rara',       color: 'border-blue-400 bg-blue-50',       badge: 'bg-blue-100 text-blue-700' },
  epic:      { label: 'Epica',      color: 'border-purple-500 bg-purple-50',   badge: 'bg-purple-100 text-purple-700' },
  legendary: { label: 'Legendaria', color: 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-amber-50', badge: 'bg-amber-100 text-amber-700' },
};

const CHART_DAYS = 14;

const formatDuration = (totalSeconds) => {
  if (!totalSeconds) return '0m';
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

const StatCard = ({ icon: Icon, label, value, hint, gradient }) => (
  <div className={`rounded-xl p-3.5 text-white ${gradient} shadow-sm`}>
    <div className="flex items-center gap-2 mb-1.5 opacity-90">
      <Icon className="w-3.5 h-3.5" />
      <span className="text-[11px] font-bold uppercase tracking-wide">{label}</span>
    </div>
    <div className="text-2xl font-black leading-none">{value}</div>
    {hint && <div className="text-[10px] mt-1 opacity-80">{hint}</div>}
  </div>
);

export default function TeacherLogrosSection() {
  const { user } = useAuth();
  const { totalXp, level, xpForCurrentLevel, xpForNextLevel, allBadges, totalEarned, totalAvailable, loading: gamifLoading } = useGamification();
  const [filterRarity, setFilterRarity] = useState('all');
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    const load = async () => {
      setLoadingSessions(true);
      try {
        const { data, error } = await supabase
          .from('game_sessions')
          .select('id, app_id, app_name, mode, score, correct_answers, total_questions, duration_seconds, completed, nota, created_at, subject_id')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1000);
        if (cancelled) return;
        if (error) {
          console.error('TeacherLogrosSection: error loading sessions', error);
          setSessions([]);
        } else {
          setSessions(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('TeacherLogrosSection: unexpected error', err);
        if (!cancelled) setSessions([]);
      } finally {
        if (!cancelled) setLoadingSessions(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [user?.id]);

  const xpInLevel = totalXp - xpForCurrentLevel;
  const xpNeeded = xpForNextLevel - xpForCurrentLevel;
  const progress = xpNeeded > 0 ? Math.min(100, Math.round((xpInLevel / xpNeeded) * 100)) : 100;

  const filteredBadges = filterRarity === 'all' ? allBadges : allBadges.filter(b => b.rarity === filterRarity);

  const stats = useMemo(() => {
    const completed = sessions.filter(s => s.completed);
    const exams = completed.filter(s => s.mode === 'test');
    const practices = completed.filter(s => s.mode === 'practice');
    const totalSecs = sessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0);

    const notas = completed.map(s => Number(s.nota)).filter(n => Number.isFinite(n) && n > 0);
    const avgNota = notas.length ? notas.reduce((a, b) => a + b, 0) / notas.length : 0;

    const examNotas = exams.map(s => Number(s.nota)).filter(n => Number.isFinite(n) && n > 0);
    const avgExamNota = examNotas.length ? examNotas.reduce((a, b) => a + b, 0) / examNotas.length : 0;

    const totalCorrect = completed.reduce((acc, s) => acc + (s.correct_answers || 0), 0);
    const totalQuestions = completed.reduce((acc, s) => acc + (s.total_questions || 0), 0);
    const accuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;

    const uniqueApps = new Set(sessions.map(s => s.app_id).filter(Boolean)).size;
    const uniqueSubjects = new Set(sessions.map(s => s.subject_id).filter(Boolean)).size;

    // Top apps por nº de partidas
    const appCounts = {};
    completed.forEach(s => {
      if (!s.app_id) return;
      if (!appCounts[s.app_id]) appCounts[s.app_id] = { name: s.app_name || s.app_id, count: 0 };
      appCounts[s.app_id].count += 1;
    });
    const topApps = Object.values(appCounts).sort((a, b) => b.count - a.count).slice(0, 5);

    return {
      total: sessions.length,
      completed: completed.length,
      exams: exams.length,
      practices: practices.length,
      totalSecs,
      avgNota,
      avgExamNota,
      accuracy,
      uniqueApps,
      uniqueSubjects,
      topApps,
    };
  }, [sessions]);

  // Datos del gráfico (últimos N días)
  const chartData = useMemo(() => {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = CHART_DAYS - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      days.push({ date: d, count: 0, key: d.toISOString().slice(0, 10) });
    }
    const map = Object.fromEntries(days.map(d => [d.key, d]));
    sessions.forEach(s => {
      if (!s.created_at) return;
      const key = new Date(s.created_at).toISOString().slice(0, 10);
      if (map[key]) map[key].count += 1;
    });
    const max = Math.max(1, ...days.map(d => d.count));
    return { days, max };
  }, [sessions]);

  const loading = gamifLoading || loadingSessions;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-purple-100 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Mis Logros y Estadísticas</h3>
            <p className="text-xs text-slate-500">Nivel {level} · {totalXp.toLocaleString()} XP · {totalEarned}/{totalAvailable} insignias</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-xs font-bold text-amber-600">Nv.{level}</span>
          <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
          </div>
        ) : (
          <>
            {/* XP Summary */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <span className="text-xl font-black">{level}</span>
                  </div>
                  <div>
                    <p className="text-xs text-white/70">Nivel actual</p>
                    <p className="text-lg font-bold">Nivel {level}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/70">XP Total</p>
                  <p className="text-lg font-bold">{totalXp.toLocaleString()}</p>
                </div>
              </div>
              <div className="w-full h-2.5 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-full"
                />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-[11px] text-white/60">{xpInLevel} / {xpNeeded} XP</span>
                <span className="text-[11px] text-white/60 flex items-center gap-1">
                  <Trophy className="w-3 h-3" /> {totalEarned} insignias
                </span>
              </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              <StatCard
                icon={Gamepad2}
                label="Partidas"
                value={stats.completed}
                hint={`${stats.exams} exámenes · ${stats.practices} práctica`}
                gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
              />
              <StatCard
                icon={Award}
                label="Nota media"
                value={stats.avgNota.toFixed(1)}
                hint={`Examen: ${stats.avgExamNota.toFixed(1)} / 10`}
                gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
              />
              <StatCard
                icon={Target}
                label="Precisión"
                value={`${stats.accuracy.toFixed(0)}%`}
                hint="Aciertos sobre total"
                gradient="bg-gradient-to-br from-purple-500 to-fuchsia-600"
              />
              <StatCard
                icon={Clock}
                label="Tiempo jugado"
                value={formatDuration(stats.totalSecs)}
                hint={`${stats.total} sesiones`}
                gradient="bg-gradient-to-br from-amber-500 to-orange-600"
              />
              <StatCard
                icon={BookOpen}
                label="Apps usadas"
                value={stats.uniqueApps}
                hint="Diferentes"
                gradient="bg-gradient-to-br from-pink-500 to-rose-600"
              />
              <StatCard
                icon={TrendingUp}
                label="Asignaturas"
                value={stats.uniqueSubjects}
                hint="Diferentes"
                gradient="bg-gradient-to-br from-cyan-500 to-blue-600"
              />
              <StatCard
                icon={Trophy}
                label="Insignias"
                value={`${totalEarned}/${totalAvailable}`}
                hint={`Nivel ${level}`}
                gradient="bg-gradient-to-br from-yellow-500 to-amber-600"
              />
              <StatCard
                icon={BarChart3}
                label="XP Total"
                value={totalXp.toLocaleString()}
                hint={`+${xpInLevel} en este nivel`}
                gradient="bg-gradient-to-br from-violet-500 to-purple-600"
              />
            </div>

            {/* Gráfico de uso */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-600" />
                  <h4 className="text-sm font-bold text-slate-700">Actividad de los últimos {CHART_DAYS} días</h4>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">{stats.total} partidas totales</span>
              </div>
              <div className="flex items-end gap-1.5 h-32">
                {chartData.days.map((d) => {
                  const heightPct = (d.count / chartData.max) * 100;
                  const isToday = d.key === new Date().toISOString().slice(0, 10);
                  return (
                    <div key={d.key} className="flex-1 flex flex-col items-center gap-1 group">
                      <div className="relative w-full flex-1 flex items-end">
                        <div
                          className={`w-full rounded-t-md transition-all ${
                            d.count === 0
                              ? 'bg-slate-200'
                              : isToday
                                ? 'bg-gradient-to-t from-amber-500 to-orange-400'
                                : 'bg-gradient-to-t from-indigo-500 to-purple-400'
                          } group-hover:opacity-80`}
                          style={{ height: `${Math.max(heightPct, d.count === 0 ? 4 : 8)}%` }}
                          title={`${d.count} partida${d.count !== 1 ? 's' : ''}`}
                        />
                        {d.count > 0 && (
                          <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-bold text-slate-600">
                            {d.count}
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] text-slate-400 font-medium">
                        {d.date.getDate()}/{d.date.getMonth() + 1}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top apps */}
            {stats.topApps.length > 0 && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500" /> Apps más jugadas
                </h4>
                <div className="space-y-2">
                  {stats.topApps.map((app, i) => {
                    const pct = (app.count / stats.topApps[0].count) * 100;
                    return (
                      <div key={app.name} className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                          {i + 1}
                        </span>
                        <span className="text-xs font-medium text-slate-700 w-32 truncate">{app.name}</span>
                        <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-600 w-10 text-right">{app.count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Filtros insignias */}
            <div className="pt-2">
              <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-500" /> Insignias
              </h4>
              <div className="flex items-center gap-2 flex-wrap mb-3">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                {['all', 'common', 'rare', 'epic', 'legendary'].map(r => (
                  <button
                    key={r}
                    onClick={() => setFilterRarity(r)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      filterRarity === r ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {r === 'all' ? 'Todas' : RARITY_CONFIG[r]?.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {filteredBadges.map((badge) => {
                  const rarity = RARITY_CONFIG[badge.rarity] || RARITY_CONFIG.common;
                  return (
                    <div
                      key={badge.code}
                      className={`rounded-xl border-2 p-3 transition-all ${
                        badge.earned
                          ? `${rarity.color} shadow-sm`
                          : 'border-slate-200 bg-slate-50/50 opacity-40'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="flex-shrink-0 relative">
                          <BadgeIcon code={badge.code} rarity={badge.rarity} size={48} earned={badge.earned} />
                          {!badge.earned && (
                            <Lock className="w-3.5 h-3.5 text-slate-400 absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-bold truncate ${badge.earned ? 'text-slate-800' : 'text-slate-400'}`}>
                            {badge.name_es}
                          </p>
                          <p className={`text-[10px] leading-snug ${badge.earned ? 'text-slate-500' : 'text-slate-400'}`}>
                            {badge.description_es}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className={`text-[9px] px-1 py-px rounded-full font-bold ${rarity.badge}`}>{rarity.label}</span>
                            <span className="text-[9px] text-slate-400">+{badge.xp_reward} XP</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredBadges.length === 0 && (
                <div className="text-center py-6">
                  <Trophy className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">No hay insignias con este filtro</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
