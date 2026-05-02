import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy, ChevronRight } from 'lucide-react';
import { rarityMeta, RarityBadge } from '@/components/ui/UserAvatar';
import { Button } from '@/components/ui/button';
import { useAvatarCatalog } from '@/hooks/useAvatarCatalog';

/**
 * Modal celebrativo. Se muestra cuando una partida desbloquea uno o varios avatares.
 * Los recibe en `avatars` (array) y los muestra en secuencia con confeti y animación.
 *
 * Props:
 *  - avatars: [{code, title, rarity, points_bonus, image_lg, unlock_label}]
 *  - onClose: () => void
 */
export default function AvatarUnlockModal({ avatars, onClose }) {
  const [index, setIndex] = useState(0);
  const list = Array.isArray(avatars) ? avatars : [];
  const current = list[index];
  const { byCode } = useAvatarCatalog();
  const fullDef = current ? byCode(current.code) : null;
  const description = fullDef?.description || current?.description;

  useEffect(() => {
    if (!current) return;
    const meta = rarityMeta(current.rarity);
    const colors = [meta.ring, meta.glow, '#ffffff'];
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.4 }, colors });
    setTimeout(() => confetti({ particleCount: 40, spread: 100, origin: { y: 0.5 }, colors }), 250);
  }, [current?.code]);

  if (!current) return null;
  const meta = rarityMeta(current.rarity);
  const isLast = index === list.length - 1;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-black/85 backdrop-blur"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          key={current.code}
          initial={{ scale: 0.6, rotate: -8, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          exit={{ scale: 0.85, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 18 }}
          className="relative max-w-md w-full bg-gradient-to-b from-slate-900 to-black rounded-3xl overflow-hidden shadow-2xl border-2"
          style={{ borderColor: meta.ring, boxShadow: `0 0 60px ${meta.glow}` }}
        >
          {/* Brillo de fondo */}
          <div
            className="absolute inset-0 pointer-events-none opacity-30"
            style={{ background: `radial-gradient(circle at 50% 30%, ${meta.glow}, transparent 60%)` }}
          />

          <div className="relative p-6 text-center text-white">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-yellow-300" />
              <span className="text-[10px] uppercase font-black tracking-[0.3em] text-yellow-300">
                ¡Avatar desbloqueado!
              </span>
              <Sparkles className="w-5 h-5 text-yellow-300" />
            </div>
            {list.length > 1 && (
              <p className="text-[11px] text-white/70 mb-2">
                {index + 1} de {list.length}
              </p>
            )}

            <motion.div
              initial={{ scale: 0.5, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 180, damping: 15, delay: 0.1 }}
              className="relative mx-auto rounded-3xl overflow-hidden"
              style={{ width: 220, height: 220, boxShadow: `0 0 40px ${meta.glow}` }}
            >
              <img
                src={current.image_lg}
                alt={current.title}
                className="w-full h-full object-cover"
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ boxShadow: `inset 0 0 0 5px ${meta.ring}` }}
              />
            </motion.div>

            <div className="mt-4 flex items-center justify-center gap-2">
              <RarityBadge rarity={current.rarity} size="lg" />
            </div>
            {description && (
              <p className="mt-3 text-sm text-white/85 italic leading-relaxed">
                {description}
              </p>
            )}
            {current.unlock_label && (
              <p className="mt-3 text-xs text-white/60">
                Recompensa: {current.unlock_label}
              </p>
            )}

            <div className="mt-4 flex items-center justify-center gap-2 bg-white/10 backdrop-blur border border-white/20 rounded-xl px-3 py-2">
              <Trophy className="w-4 h-4 text-amber-300" />
              <span className="text-sm font-bold">
                +{Number(current.points_bonus).toFixed(2)} a tu nota media
              </span>
            </div>

            <div className="mt-5 flex justify-center">
              {isLast ? (
                <Button
                  onClick={onClose}
                  className="bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-900 font-black"
                >
                  ¡Genial!
                </Button>
              ) : (
                <Button
                  onClick={() => setIndex((i) => i + 1)}
                  className="bg-white/15 hover:bg-white/25 text-white border border-white/30"
                >
                  Siguiente <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
