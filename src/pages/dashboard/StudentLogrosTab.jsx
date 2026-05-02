import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Lock, Star, Zap, Clock, Target, Flame, BookOpen, Compass, Filter, Medal, Swords, Users, GraduationCap, ClipboardList, MessageSquare, CalendarDays, ThumbsUp, Crown, Sparkles, Award, Gem, Flame as FlameIcon } from 'lucide-react';
import BadgeIcon from '../../components/ui/BadgeIcon';
import BadgeModal from '../../components/ui/BadgeModal';
import AnimatedNumber from '../../components/ui/AnimatedNumber';

const RARITY_CONFIG = {
  common:    { label: 'Comun',      color: 'border-slate-300 bg-slate-50',     text: 'text-slate-600',  badge: 'bg-slate-200 text-slate-700' },
  rare:      { label: 'Rara',       color: 'border-blue-400 bg-blue-50',       text: 'text-blue-600',   badge: 'bg-blue-100 text-blue-700' },
  epic:      { label: 'Epica',      color: 'border-purple-500 bg-purple-50',   text: 'text-purple-600', badge: 'bg-purple-100 text-purple-700' },
  legendary: { label: 'Legendaria', color: 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-amber-50', text: 'text-amber-600', badge: 'bg-amber-100 text-amber-700' },
  mythic:    { label: 'Mítica',     color: 'border-fuchsia-500 bg-gradient-to-br from-fuchsia-50 via-pink-50 to-amber-50', text: 'text-fuchsia-700', badge: 'bg-gradient-to-r from-fuchsia-200 via-pink-200 to-amber-200 text-fuchsia-800' },
};

// Estilos visuales por rareza para las mini-cards de progreso
const RARITY_PROGRESS = {
  common:    { label: 'Comunes',     icon: Award,     ring: '#94a3b8', glow: '#cbd5e1', from: 'from-slate-400',   to: 'to-slate-500',   chip: 'bg-slate-100 text-slate-600' },
  rare:      { label: 'Raras',       icon: Star,      ring: '#3b82f6', glow: '#60a5fa', from: 'from-blue-400',    to: 'to-indigo-500',  chip: 'bg-blue-50 text-blue-700' },
  epic:      { label: 'Épicas',      icon: Gem,       ring: '#a855f7', glow: '#c084fc', from: 'from-purple-500',  to: 'to-fuchsia-500', chip: 'bg-purple-50 text-purple-700' },
  legendary: { label: 'Legendarias', icon: Crown,     ring: '#f59e0b', glow: '#fbbf24', from: 'from-amber-400',   to: 'to-orange-500',  chip: 'bg-amber-50 text-amber-700' },
  mythic:    { label: 'Míticas',     icon: FlameIcon, ring: '#ef4444', glow: '#f87171', from: 'from-rose-500',    to: 'to-pink-500',    chip: 'bg-rose-50 text-rose-700' },
};

const RARITY_ORDER = ['common', 'rare', 'epic', 'legendary', 'mythic'];

const CATEGORY_CONFIG = {
  mythic:           { label: 'Míticas',       icon: Crown },
  general:          { label: 'General',       icon: Target },
  exams:            { label: 'Examenes',      icon: Star },
  mastery:          { label: 'Maestria',      icon: Zap },
  exploration:      { label: 'Exploracion',   icon: Compass },
  speed:            { label: 'Velocidad',     icon: Clock },
  streaks:          { label: 'Rachas',        icon: Flame },
  dedication:       { label: 'Dedicacion',    icon: CalendarDays },
  subjects:         { label: 'Asignaturas',   icon: BookOpen },
  ranking:          { label: 'Ranking',       icon: Medal },
  battle_rank:      { label: 'Batallas',      icon: Swords },
  teacher_groups:   { label: 'Grupos',        icon: Users },
  teacher_students: { label: 'Alumnos',       icon: GraduationCap },
  teacher_tasks:    { label: 'Tareas',        icon: ClipboardList },
  teacher_battles:  { label: 'Batallas Quiz', icon: Swords },
  teacher_messages: { label: 'Mensajes',      icon: MessageSquare },
  teacher_platform: { label: 'Plataforma',    icon: CalendarDays },
  teacher_ratings:  { label: 'Valoraciones',  icon: ThumbsUp },
};

export default function StudentLogrosTab({ gamification }) {
  const { allBadges, loading } = gamification;

  const [filterCategory, setFilterCategory] = useState('all');
  const [filterRarity, setFilterRarity] = useState('all');
  const [selectedBadge, setSelectedBadge] = useState(null);

  const studentBadges = useMemo(() => {
    if (!allBadges?.length) return [];
    return allBadges.filter(b => !b.category.startsWith('teacher_'));
  }, [allBadges]);

  const categories = useMemo(() => {
    if (!studentBadges.length) return [];
    return [...new Set(studentBadges.map(b => b.category))];
  }, [studentBadges]);

  // Conteo por rareza
  const rarityStats = useMemo(() => {
    const map = Object.fromEntries(RARITY_ORDER.map(r => [r, { earned: 0, total: 0 }]));
    for (const b of studentBadges) {
      if (!map[b.rarity]) map[b.rarity] = { earned: 0, total: 0 };
      map[b.rarity].total += 1;
      if (b.earned) map[b.rarity].earned += 1;
    }
    return map;
  }, [studentBadges]);

  const filteredBadges = useMemo(() => {
    if (!studentBadges.length) return [];
    return studentBadges.filter(b => {
      if (filterCategory !== 'all' && b.category !== filterCategory) return false;
      if (filterRarity !== 'all' && b.rarity !== filterRarity) return false;
      return true;
    });
  }, [studentBadges, filterCategory, filterRarity]);

  const earnedCount = filteredBadges.filter(b => b.earned).length;
  const studentEarned = studentBadges.filter(b => b.earned).length;
  const studentTotal = studentBadges.length;
  const overallPct = studentTotal > 0 ? (studentEarned / studentTotal) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progreso de insignias — total + por rareza */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 text-white shadow-xl"
      >
        {/* Decoración de fondo */}
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 15% 20%, rgba(255,255,255,0.35) 0%, transparent 45%), radial-gradient(circle at 85% 80%, rgba(255,200,255,0.25) 0%, transparent 50%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        {/* Highlight superior */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />

        <div className="relative p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 14 }}
                className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg"
              >
                <Trophy className="w-7 h-7 text-yellow-300 drop-shadow" />
              </motion.div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-white/70">Tu colección</p>
                <p className="text-xl font-black leading-tight">Progreso de insignias</p>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="text-right"
            >
              <div className="flex items-baseline gap-1 justify-end">
                <AnimatedNumber value={studentEarned} className="text-5xl font-black drop-shadow tabular-nums" />
                <span className="text-2xl font-bold text-white/70">/{studentTotal}</span>
              </div>
              <p className="text-[11px] text-white/70 uppercase tracking-wider mt-0.5">
                {studentTotal - studentEarned} por conseguir
              </p>
            </motion.div>
          </div>

          {/* Barra global */}
          <div className="mb-1">
            <div className="flex justify-between items-center text-xs text-white/80 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <span className="font-semibold">{Math.round(overallPct)}% completado</span>
              </span>
              <span className="text-white/60">{studentEarned} de {studentTotal} insignias</span>
            </div>
            <div className="relative w-full h-3 bg-white/15 rounded-full overflow-hidden border border-white/10 backdrop-blur-sm">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${overallPct}%` }}
                transition={{ duration: 1.2, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="h-full rounded-full bg-gradient-to-r from-yellow-300 via-amber-300 to-orange-400 shadow-[0_0_16px_rgba(251,191,36,0.5)]"
              />
              {/* Brillo barrido */}
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '120%' }}
                transition={{ duration: 1.6, delay: 0.45, ease: 'easeOut' }}
                className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
              />
            </div>
          </div>

          {/* Mini-cards por rareza */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {RARITY_ORDER.map((r, i) => {
              const cfg = RARITY_PROGRESS[r];
              const stats = rarityStats[r] || { earned: 0, total: 0 };
              const Icon = cfg.icon;
              const pct = stats.total > 0 ? (stats.earned / stats.total) * 100 : 0;
              const complete = stats.total > 0 && stats.earned === stats.total;
              return (
                <motion.button
                  key={r}
                  type="button"
                  initial={{ opacity: 0, y: 12, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.35 + i * 0.07, duration: 0.4, ease: 'easeOut' }}
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFilterRarity(prev => (prev === r ? 'all' : r))}
                  className="group relative overflow-hidden rounded-xl bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 p-3 text-left transition-colors"
                  style={{
                    boxShadow: complete ? `0 0 22px ${cfg.glow}80, inset 0 0 0 1.5px ${cfg.ring}` : undefined,
                  }}
                >
                  {/* Glow de rareza al hover */}
                  <div
                    className="absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-xl"
                    style={{ boxShadow: `inset 0 0 0 1.5px ${cfg.ring}` }}
                  />

                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`w-7 h-7 rounded-lg bg-gradient-to-br ${cfg.from} ${cfg.to} flex items-center justify-center shadow-md`}
                      style={{ boxShadow: `0 0 12px ${cfg.glow}66` }}
                    >
                      <Icon className="w-3.5 h-3.5 text-white drop-shadow" />
                    </div>
                    <p className="text-[10px] uppercase font-black tracking-wider text-white/85">{cfg.label}</p>
                    <AnimatePresence>
                      {complete && (
                        <motion.span
                          initial={{ scale: 0, rotate: -90 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0 }}
                          transition={{ type: 'spring', stiffness: 350 }}
                          className="ml-auto text-yellow-300"
                          title="¡Categoría completa!"
                        >
                          <Sparkles className="w-3.5 h-3.5 drop-shadow" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <AnimatedNumber value={stats.earned} className="text-xl font-black tabular-nums drop-shadow" />
                    <span className="text-xs font-bold text-white/60">/ {stats.total}</span>
                    <span className="ml-auto text-[10px] font-bold text-white/70 tabular-nums">{Math.round(pct)}%</span>
                  </div>

                  <div className="mt-1.5 h-1.5 bg-white/15 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1, delay: 0.55 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${cfg.ring}, ${cfg.glow})` }}
                    />
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <Filter className="w-4 h-4 text-slate-400" />
        <div className="flex gap-1 flex-wrap">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filterCategory === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >Todas</button>
          {categories.map(cat => {
            const cfg = CATEGORY_CONFIG[cat] || { label: cat, icon: Target };
            const Icon = cfg.icon;
            return (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filterCategory === cat ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Icon className="w-3 h-3" />
                {cfg.label}
              </button>
            );
          })}
        </div>
        <div className="flex gap-1 ml-auto">
          {['all', 'common', 'rare', 'epic', 'legendary', 'mythic'].map(r => (
            <button
              key={r}
              onClick={() => setFilterRarity(r)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterRarity === r ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {r === 'all' ? 'Todas' : RARITY_CONFIG[r]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Badge count */}
      <p className="text-sm text-slate-500">
        Mostrando {filteredBadges.length} insignias ({earnedCount} conseguidas)
      </p>

      {/* Badge Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredBadges.map((badge, i) => {
          const rarity = RARITY_CONFIG[badge.rarity] || RARITY_CONFIG.common;
          const earned = badge.earned;

          return (
            <motion.div
              key={badge.code}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.5) }}
              onClick={() => setSelectedBadge(badge)}
              whileHover={{ y: -2 }}
              className={`relative rounded-xl border-2 p-4 transition-all cursor-pointer hover:shadow-md ${
                earned
                  ? `${rarity.color} shadow-sm`
                  : 'border-slate-200 bg-slate-50/50 opacity-50 hover:opacity-70'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 relative">
                  <BadgeIcon code={badge.code} rarity={badge.rarity} size={56} earned={earned} />
                  {!earned && (
                    <Lock className="w-4 h-4 text-slate-400 absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className={`text-sm font-bold truncate ${earned ? 'text-slate-800' : 'text-slate-400'}`}>
                      {badge.name_es}
                    </h4>
                  </div>
                  <p className={`text-xs leading-snug ${earned ? 'text-slate-600' : 'text-slate-400'}`}>
                    {badge.description_es}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${rarity.badge}`}>
                      {rarity.label}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">+{badge.xp_reward} XP</span>
                  </div>
                </div>
              </div>
              {earned && badge.earned_at && (
                <p className="text-[10px] text-slate-400 mt-2 text-right">
                  {new Date(badge.earned_at).toLocaleDateString('es-ES')}
                </p>
              )}
            </motion.div>
          );
        })}
      </div>

      <BadgeModal badge={selectedBadge} onClose={() => setSelectedBadge(null)} />

      {filteredBadges.length === 0 && (
        <div className="text-center py-10">
          <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No hay insignias con estos filtros</p>
        </div>
      )}
    </div>
  );
}
