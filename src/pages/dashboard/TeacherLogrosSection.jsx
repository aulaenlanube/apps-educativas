import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ChevronDown, ChevronUp, Lock, Star, Target, Filter } from 'lucide-react';
import { useGamification } from '@/hooks/useGamification';

const RARITY_CONFIG = {
  common:    { label: 'Comun',      color: 'border-slate-300 bg-slate-50',     badge: 'bg-slate-200 text-slate-700' },
  rare:      { label: 'Rara',       color: 'border-blue-400 bg-blue-50',       badge: 'bg-blue-100 text-blue-700' },
  epic:      { label: 'Epica',      color: 'border-purple-500 bg-purple-50',   badge: 'bg-purple-100 text-purple-700' },
  legendary: { label: 'Legendaria', color: 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-amber-50', badge: 'bg-amber-100 text-amber-700' },
};

export default function TeacherLogrosSection() {
  const { totalXp, level, xpForCurrentLevel, xpForNextLevel, allBadges, totalEarned, totalAvailable, loading } = useGamification();
  const [expanded, setExpanded] = useState(false);
  const [filterRarity, setFilterRarity] = useState('all');

  const xpInLevel = totalXp - xpForCurrentLevel;
  const xpNeeded = xpForNextLevel - xpForCurrentLevel;
  const progress = xpNeeded > 0 ? Math.min(100, Math.round((xpInLevel / xpNeeded) * 100)) : 100;

  const filteredBadges = filterRarity === 'all' ? allBadges : allBadges.filter(b => b.rarity === filterRarity);

  if (loading) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-purple-100 overflow-hidden"
    >
      {/* Header clicable */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between p-5 hover:bg-purple-50/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <h3 className="text-base font-bold text-slate-800">Mis Logros</h3>
            <p className="text-xs text-slate-500">Nivel {level} · {totalXp.toLocaleString()} XP · {totalEarned}/{totalAvailable} insignias</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Mini barra XP */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs font-bold text-amber-600">Nv.{level}</span>
            <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }} />
            </div>
          </div>
          {expanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </div>
      </button>

      {/* Contenido expandible */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4 border-t border-slate-100 pt-4">
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

              {/* Filtros */}
              <div className="flex items-center gap-2 flex-wrap">
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

              {/* Grid de insignias */}
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
                        <div className={`text-2xl flex-shrink-0 ${badge.earned ? '' : 'grayscale'}`}>
                          {badge.earned ? badge.icon : <Lock className="w-6 h-6 text-slate-300" />}
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
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
