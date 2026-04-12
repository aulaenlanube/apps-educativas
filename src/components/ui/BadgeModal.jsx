import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Star, Calendar } from 'lucide-react';
import BadgeIcon from './BadgeIcon';

const RARITY = {
  common:    { label: 'Comun',      grad: 'from-slate-400 to-slate-600',     text: 'text-slate-700',  ring: 'ring-slate-300' },
  rare:      { label: 'Rara',       grad: 'from-blue-400 to-indigo-600',     text: 'text-blue-700',   ring: 'ring-blue-300' },
  epic:      { label: 'Epica',      grad: 'from-purple-500 to-fuchsia-600',  text: 'text-purple-700', ring: 'ring-purple-300' },
  legendary: { label: 'Legendaria', grad: 'from-amber-400 to-orange-500',    text: 'text-amber-700',  ring: 'ring-amber-300' },
};

export default function BadgeModal({ badge, onClose }) {
  useEffect(() => {
    if (!badge) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [badge, onClose]);

  const rarity = badge ? (RARITY[badge.rarity] || RARITY.common) : null;
  const earned = !!badge?.earned;

  return (
    <AnimatePresence>
      {badge && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" />

          {/* Card */}
          <motion.div
            className="relative bg-white dark:bg-slate-800 dark:text-gray-200 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
            initial={{ scale: 0.7, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 10 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top gradient bar by rarity */}
            <div className={`h-2 bg-gradient-to-r ${rarity.grad}`} />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center justify-center transition-colors z-10"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 p-8">
              {/* Big badge with glow */}
              <motion.div
                className="relative flex items-center justify-center mx-auto"
                initial={{ rotate: -12, scale: 0.4, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.1 }}
              >
                {/* Halo pulse */}
                <motion.div
                  className={`absolute inset-0 rounded-full bg-gradient-to-br ${rarity.grad} blur-2xl opacity-40`}
                  animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
                />
                {/* Rotating ring */}
                <motion.div
                  className={`absolute -inset-3 rounded-full border-4 border-dashed ${rarity.text} opacity-30`}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
                />
                <div className="relative">
                  <BadgeIcon
                    code={badge.code}
                    rarity={badge.rarity}
                    size={200}
                    earned={earned}
                    animated
                  />
                  {!earned && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white/90 rounded-full p-3 shadow-lg">
                        <Lock className="w-10 h-10 text-slate-400" />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Info */}
              <motion.div
                className="flex flex-col justify-center min-w-0"
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.25, duration: 0.4 }}
              >
                <span
                  className={`inline-block self-start text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-gradient-to-r ${rarity.grad} text-white shadow-sm mb-3`}
                >
                  {rarity.label}
                </span>

                <h2 className="text-3xl font-black text-slate-800 leading-tight mb-2">
                  {badge.name_es}
                </h2>

                <p className="text-slate-600 leading-relaxed mb-5">
                  {badge.description_es}
                </p>

                <div className="space-y-2 border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="w-4 h-4 text-amber-500" />
                    <span className="text-slate-500">Recompensa:</span>
                    <span className="font-bold text-slate-800">+{badge.xp_reward} XP</span>
                  </div>

                  {earned ? (
                    badge.earned_at && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-emerald-500" />
                        <span className="text-slate-500">Conseguida:</span>
                        <span className="font-semibold text-slate-700">
                          {new Date(badge.earned_at).toLocaleDateString('es-ES', {
                            day: 'numeric', month: 'long', year: 'numeric',
                          })}
                        </span>
                      </div>
                    )
                  ) : (
                    <div className="flex items-center gap-2 text-sm">
                      <Lock className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-500 italic">Aun no conseguida</span>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
