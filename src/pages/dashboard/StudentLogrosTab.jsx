import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Lock, Star, Zap, Clock, Target, Flame, BookOpen, Compass, Filter } from 'lucide-react';
import BadgeIcon from '../../components/ui/BadgeIcon';

const RARITY_CONFIG = {
  common:    { label: 'Comun',      color: 'border-slate-300 bg-slate-50',     text: 'text-slate-600',  badge: 'bg-slate-200 text-slate-700' },
  rare:      { label: 'Rara',       color: 'border-blue-400 bg-blue-50',       text: 'text-blue-600',   badge: 'bg-blue-100 text-blue-700' },
  epic:      { label: 'Epica',      color: 'border-purple-500 bg-purple-50',   text: 'text-purple-600', badge: 'bg-purple-100 text-purple-700' },
  legendary: { label: 'Legendaria', color: 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-amber-50', text: 'text-amber-600', badge: 'bg-amber-100 text-amber-700' },
};

const CATEGORY_CONFIG = {
  general:     { label: 'General',      icon: Target },
  exams:       { label: 'Examenes',     icon: Star },
  mastery:     { label: 'Maestria',     icon: Zap },
  exploration: { label: 'Exploracion',  icon: Compass },
  speed:       { label: 'Velocidad',    icon: Clock },
  streaks:     { label: 'Rachas',       icon: Flame },
  dedication:  { label: 'Dedicacion',   icon: Clock },
  subjects:    { label: 'Asignaturas',  icon: BookOpen },
};

export default function StudentLogrosTab({ gamification }) {
  const {
    totalXp, level, xpForCurrentLevel, xpForNextLevel,
    allBadges, totalEarned, totalAvailable, loading,
  } = gamification;

  const [filterCategory, setFilterCategory] = useState('all');
  const [filterRarity, setFilterRarity] = useState('all');

  const xpInCurrentLevel = totalXp - xpForCurrentLevel;
  const xpNeededForNext = xpForNextLevel - xpForCurrentLevel;
  const progress = xpNeededForNext > 0 ? Math.min(100, Math.round((xpInCurrentLevel / xpNeededForNext) * 100)) : 100;

  const categories = useMemo(() => {
    if (!allBadges?.length) return [];
    return [...new Set(allBadges.map(b => b.category))];
  }, [allBadges]);

  const filteredBadges = useMemo(() => {
    if (!allBadges?.length) return [];
    return allBadges.filter(b => {
      if (filterCategory !== 'all' && b.category !== filterCategory) return false;
      if (filterRarity !== 'all' && b.rarity !== filterRarity) return false;
      return true;
    });
  }, [allBadges, filterCategory, filterRarity]);

  const earnedCount = filteredBadges.filter(b => b.earned).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* XP Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-2xl p-6 text-white shadow-lg"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <span className="text-3xl font-black">{level}</span>
            </div>
            <div>
              <p className="text-sm text-white/70">Nivel actual</p>
              <p className="text-2xl font-bold">Nivel {level}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-white/70">XP Total</p>
            <p className="text-2xl font-bold">{totalXp.toLocaleString()}</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-white/80">
            <span>Progreso al nivel {level + 1}</span>
            <span>{xpInCurrentLevel} / {xpNeededForNext} XP</span>
          </div>
          <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-full"
            />
          </div>
        </div>
        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-white/20">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-300" />
            <div>
              <p className="text-lg font-bold">{totalEarned}</p>
              <p className="text-xs text-white/60">Insignias</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-white/60" />
            <div>
              <p className="text-lg font-bold">{totalAvailable - totalEarned}</p>
              <p className="text-xs text-white/60">Por conseguir</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-300" />
            <div>
              <p className="text-lg font-bold">{totalAvailable > 0 ? Math.round((totalEarned / totalAvailable) * 100) : 0}%</p>
              <p className="text-xs text-white/60">Completado</p>
            </div>
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
          {['all', 'common', 'rare', 'epic', 'legendary'].map(r => (
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
              className={`relative rounded-xl border-2 p-4 transition-all ${
                earned
                  ? `${rarity.color} shadow-sm`
                  : 'border-slate-200 bg-slate-50/50 opacity-50'
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

      {filteredBadges.length === 0 && (
        <div className="text-center py-10">
          <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No hay insignias con estos filtros</p>
        </div>
      )}
    </div>
  );
}
