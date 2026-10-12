import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Lock, Gamepad2, Clock, Target, BookOpen, TrendingUp, Award, BarChart3, Filter } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useGamification } from '@/hooks/useGamification';
import BadgeIcon from '@/components/ui/BadgeIcon';
import BadgeModal from '@/components/ui/BadgeModal';
import BrandLoader from '@/components/ui/BrandLoader';
import AppIcon, { hasAppIcon } from '@/components/AppIcon';
import { DashCard, StatTile, SectionGrid, LevelShield, XPBar, Pill, DashEmpty } from '@/components/dashboard/kit';
import './teacherPanels.css';

const RARITY_CONFIG = {
  common:    { label: 'Común' },
  rare:      { label: 'Rara' },
  epic:      { label: 'Épica' },
  legendary: { label: 'Legendaria' },
};
const RARITY_FILTERS = ['all', 'common', 'rare', 'epic', 'legendary'];
// Orden para elegir las insignias de la vitrina (solo presentación).
const RARITY_RANK = { mythic: 4, legendary: 3, epic: 2, rare: 1, common: 0 };

const CHART_DAYS = 14;

const formatDuration = (totalSeconds) => {
  if (!totalSeconds) return '0m';
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

const fmt1 = (v) => Number(v).toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

// Sala de trofeos del docente (también la usa el panel del usuario libre):
// vitrina con las mejores insignias, nivel y XP, indicadores, actividad,
// apps favoritas y la colección completa de insignias.
export default function TeacherLogrosSection() {
  const { user } = useAuth();
  const { totalXp, level, xpForCurrentLevel, xpForNextLevel, allBadges, totalEarned, totalAvailable, loading: gamifLoading } = useGamification();
  const [filterRarity, setFilterRarity] = useState('all');
  const [selectedBadge, setSelectedBadge] = useState(null);
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

    // Top apps por nº de partidas (el id solo se usa para pintar su icono)
    const appCounts = {};
    completed.forEach(s => {
      if (!s.app_id) return;
      if (!appCounts[s.app_id]) appCounts[s.app_id] = { id: s.app_id, name: s.app_name || s.app_id, count: 0 };
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

  // Vitrina: las 3 insignias conseguidas más raras (2ª · 1ª · 3ª en la balda)
  const showcase = useMemo(() => {
    const best = allBadges
      .filter(b => b.earned)
      .sort((a, b) => ((RARITY_RANK[b.rarity] || 0) - (RARITY_RANK[a.rarity] || 0)) || ((b.xp_reward || 0) - (a.xp_reward || 0)))
      .slice(0, 3);
    return [best[1], best[0], best[2]].filter(Boolean);
  }, [allBadges]);

  const rarityCounts = useMemo(() => Object.keys(RARITY_CONFIG).map(id => {
    const all = allBadges.filter(b => b.rarity === id);
    return { id, label: RARITY_CONFIG[id].label, total: all.length, earned: all.filter(b => b.earned).length };
  }), [allBadges]);

  const filterCount = (r) => (r === 'all' ? allBadges.length : allBadges.filter(b => b.rarity === r).length);

  const loading = gamifLoading || loadingSessions;
  const todayKey = new Date().toISOString().slice(0, 10);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="tp-root tp-logros"
    >
      {/* Sala de trofeos: nivel, XP y vitrina */}
      <section className="tp-trophy">
        <div className="tp-trophy__main">
          <div className="tp-trophy__shield"><LevelShield level={level} /></div>
          <div className="tp-trophy__text">
            <span className="tp-trophy__eyebrow">Sala de trofeos</span>
            <h2 className="tp-trophy__title">Mis logros y estadísticas</h2>
            <XPBar
              value={xpInLevel}
              max={xpNeeded}
              level={level}
              label={`Nivel ${level} · ${progress}% · ${totalXp.toLocaleString('es-ES')} XP en total`}
            />
            <div className="tp-trophy__rar">
              {rarityCounts.map(r => (
                <span key={r.id}><i className={`tp-rardot--${r.id}`} />{r.label} {r.earned}/{r.total}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="tp-shelf">
          <span className="tp-shelf__label">Vitrina · {totalEarned}/{totalAvailable} insignias</span>
          {gamifLoading ? (
            <div className="tp-center"><span className="tp-spin tp-spin--light" /></div>
          ) : showcase.length > 0 ? (
            <>
              <div className="tp-shelf__row">
                {showcase.map((b, i) => {
                  const center = showcase.length === 1 || (showcase.length > 1 && i === 1);
                  return (
                    <button
                      key={b.code}
                      type="button"
                      className={`tp-shelf__item ${center ? 'tp-shelf__item--center' : ''}`}
                      onClick={() => setSelectedBadge(b)}
                      title={b.name_es}
                    >
                      <span className="tp-shelf__medal">
                        <BadgeIcon code={b.code} rarity={b.rarity} size={center ? 104 : 78} earned />
                      </span>
                      <span className="tp-shelf__name">{b.name_es}</span>
                    </button>
                  );
                })}
              </div>
              <div className="tp-shelf__plank" />
            </>
          ) : (
            <div className="tp-shelf__empty">Tu vitrina está vacía: juega a cualquier app para ganar tu primera insignia.</div>
          )}
        </div>
      </section>

      {loading ? (
        <DashCard tone="amber">
          <div className="tp-center"><BrandLoader variant="inline" /></div>
        </DashCard>
      ) : (
        <>
          <SectionGrid cols={4}>
            <StatTile icon={Gamepad2} tone="blue" label="Partidas" value={stats.completed}
              sub={`${stats.exams} exámenes · ${stats.practices} práctica`} />
            <StatTile icon={Award} tone="emerald" label="Nota media" value={stats.avgNota} format={fmt1}
              sub={`Examen: ${fmt1(stats.avgExamNota)} / 10`} progress={stats.avgNota / 10} />
            <StatTile icon={Target} tone="violet" label="Precisión" value={stats.accuracy}
              format={(v) => `${Math.round(v)} %`} sub="Aciertos sobre total" progress={stats.accuracy / 100} />
            <StatTile icon={Clock} tone="amber" label="Tiempo jugado" value={formatDuration(stats.totalSecs)}
              sub={`${stats.total} sesiones`} />
            <StatTile icon={BookOpen} tone="pink" label="Apps usadas" value={stats.uniqueApps} sub="Diferentes" />
            <StatTile icon={TrendingUp} tone="cyan" label="Asignaturas" value={stats.uniqueSubjects} sub="Diferentes" />
            <StatTile icon={Trophy} tone="orange" label="Insignias" value={`${totalEarned}/${totalAvailable}`}
              sub={`Nivel ${level}`} progress={totalAvailable ? totalEarned / totalAvailable : 0} />
            <StatTile icon={BarChart3} tone="indigo" label="XP Total" value={totalXp}
              sub={`+${xpInLevel.toLocaleString('es-ES')} en este nivel`} />
          </SectionGrid>

          <SectionGrid cols={2}>
            {/* Gráfico de uso */}
            <DashCard
              icon={BarChart3}
              tone="indigo"
              title="Actividad"
              subtitle={`Últimos ${CHART_DAYS} días`}
              actions={<Pill>{stats.total} partidas totales</Pill>}
            >
              <div className="tp-chart" style={{ '--n': chartData.days.length }}>
                {chartData.days.map((d, i) => {
                  const heightPct = (d.count / chartData.max) * 100;
                  const isToday = d.key === todayKey;
                  return (
                    <div key={d.key} className="tp-chart__col" title={`${d.count} partida${d.count !== 1 ? 's' : ''}`}>
                      <span
                        className={`tp-chart__bar ${d.count === 0 ? 'is-zero' : ''} ${isToday && d.count > 0 ? 'is-today' : ''}`}
                        style={{ height: `${Math.max(heightPct, d.count === 0 ? 4 : 8)}%`, '--i': i }}
                      >
                        {d.count > 0 && <span className="tp-chart__n">{d.count}</span>}
                      </span>
                      <span className={`tp-chart__day ${isToday ? 'is-today' : ''}`}>
                        {d.date.getDate()}/{d.date.getMonth() + 1}
                      </span>
                    </div>
                  );
                })}
              </div>
            </DashCard>

            {/* Top apps */}
            <DashCard icon={Trophy} tone="amber" title="Apps más jugadas" subtitle="Tu podio personal de juegos">
              {stats.topApps.length > 0 ? (
                <div className="tp-topapps">
                  {stats.topApps.map((app, i) => {
                    const pct = app.count / stats.topApps[0].count;
                    return (
                      <div key={app.name} className="tp-topapp">
                        <span className="tp-topapp__rank">{i + 1}</span>
                        {hasAppIcon(app.id)
                          ? <AppIcon appId={app.id} size={40} />
                          : <span className="tp-apptile__fallback">🎮</span>}
                        <div className="tp-topapp__body">
                          <div className="tp-topapp__name">{app.name}</div>
                          <div className="tp-topapp__track"><i style={{ width: `${pct * 100}%` }} /></div>
                        </div>
                        <span className="tp-topapp__count">{app.count} <small>partidas</small></span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <DashEmpty mascot={false} title="Aún no hay partidas">Juega a cualquier app y aquí aparecerán tus favoritas.</DashEmpty>
              )}
            </DashCard>
          </SectionGrid>

          {/* Insignias */}
          <DashCard
            icon={Award}
            tone="violet"
            title="Colección de insignias"
            subtitle={`${totalEarned} de ${totalAvailable} conseguidas · pulsa una para ver cómo se gana`}
          >
            <div className="tp-filters" style={{ marginBottom: 14 }}>
              <Filter size={15} style={{ alignSelf: 'center', color: 'var(--dk-ink-3)' }} />
              {RARITY_FILTERS.map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setFilterRarity(r)}
                  className={`tp-filter ${filterRarity === r ? 'is-on' : ''}`}
                >
                  {r === 'all' ? 'Todas' : RARITY_CONFIG[r]?.label}
                  <span className="tp-filter__n">{filterCount(r)}</span>
                </button>
              ))}
            </div>

            <div className="tp-badges">
              {filteredBadges.map((badge) => {
                const rarity = RARITY_CONFIG[badge.rarity] || RARITY_CONFIG.common;
                return (
                  <button
                    key={badge.code}
                    type="button"
                    onClick={() => setSelectedBadge(badge)}
                    className={`tp-badge tp-badge--${badge.rarity || 'common'} ${badge.earned ? 'is-earned' : 'is-locked'}`}
                  >
                    <span className="tp-badge__icon">
                      <BadgeIcon code={badge.code} rarity={badge.rarity} size={52} earned={badge.earned} />
                      {!badge.earned && <span className="tp-badge__lock"><Lock size={11} /></span>}
                    </span>
                    <span className="tp-badge__body">
                      <span className="tp-badge__name" style={{ display: 'block' }}>{badge.name_es}</span>
                      <span className="tp-badge__desc">{badge.description_es}</span>
                      <span className="tp-badge__meta">
                        <span className="tp-rar">{rarity.label}</span>
                        <span className="tp-xp">+{badge.xp_reward} XP</span>
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            {filteredBadges.length === 0 && (
              <DashEmpty mascot={false} title="No hay insignias con este filtro" />
            )}
          </DashCard>
        </>
      )}
      <BadgeModal badge={selectedBadge} onClose={() => setSelectedBadge(null)} />
    </motion.div>
  );
}
