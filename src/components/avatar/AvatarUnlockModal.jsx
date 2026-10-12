import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy, ChevronRight, Target } from 'lucide-react';
import { rarityMeta, RarityBadge } from '@/components/ui/UserAvatar';
import RobotMascot from '@/components/RobotMascot';
import { useAvatarCatalog } from '@/hooks/useAvatarCatalog';
import './AvatarUnlockModal.css';

// Momento (ms) en que la carta termina de girar y se "revela" el avatar:
// destello, onda de rareza, confeti y la mascota celebrando.
const REVEAL_MS = 950;
const RARE_RANK = { common: 0, rare: 1, epic: 2, legendary: 3, mythic: 4 };

/**
 * Modal celebrativo. Se muestra cuando una partida desbloquea uno o varios avatares.
 * Los recibe en `avatars` (array) y los muestra en secuencia con confeti y animación:
 * la carta llega boca abajo, gira y se revela con un destello y una onda del
 * color de la rareza mientras la mascota lo celebra.
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
  const reduceMotion = useReducedMotion();
  const [revealed, setRevealed] = useState(false);

  const code = current?.code;
  const rarity = current?.rarity;

  // Revelado + confeti (por cada avatar de la secuencia).
  useEffect(() => {
    if (!code) return undefined;
    const meta = rarityMeta(rarity);
    const colors = [meta.ring, meta.glow, '#ffffff'];
    const delay = reduceMotion ? 0 : REVEAL_MS;
    const timers = [];
    setRevealed(false);
    timers.push(setTimeout(() => setRevealed(true), delay));
    timers.push(setTimeout(() => confetti({ particleCount: 80, spread: 70, origin: { y: 0.4 }, colors, zIndex: 10060 }), delay));
    timers.push(setTimeout(() => confetti({ particleCount: 40, spread: 100, origin: { y: 0.5 }, colors, zIndex: 10060 }), delay + 250));
    // Épicos o mejores: cañones laterales.
    if ((RARE_RANK[rarity] || 0) >= 2) {
      timers.push(setTimeout(() => {
        confetti({ particleCount: 50, angle: 60, spread: 60, origin: { x: 0, y: 0.7 }, colors, zIndex: 10060 });
        confetti({ particleCount: 50, angle: 120, spread: 60, origin: { x: 1, y: 0.7 }, colors, zIndex: 10060 });
      }, delay + 450));
    }
    return () => timers.forEach(clearTimeout);
  }, [code, rarity, reduceMotion]);

  if (!current || typeof document === 'undefined') return null;
  const meta = rarityMeta(current.rarity);
  const isLast = index === list.length - 1;
  const rk = RARE_RANK[current.rarity] != null ? current.rarity : 'common';
  const t0 = reduceMotion ? 0 : REVEAL_MS / 1000;

  return createPortal(
    <AnimatePresence>
      <motion.div
        className={`aum r-${rk}${revealed ? ' is-revealed' : ''}`}
        style={{ '--rc1': meta.ring, '--rc2': meta.glow }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        role="dialog"
        aria-modal="true"
        aria-label="¡Avatar desbloqueado!"
      >
        <div className="aum__bg" aria-hidden="true">
          <span className="aum__rays" />
          <span className="aum__glow" />
          <span className="aum__stars" />
        </div>

        <motion.div
          key={current.code}
          className="aum__panel"
          initial={{ scale: 0.85, opacity: 0, y: 24 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 20 }}
        >
          <div className="aum__kicker">
            <Sparkles size={16} />
            <span>¡Avatar desbloqueado!</span>
            <Sparkles size={16} />
          </div>
          {list.length > 1 && (
            <div className="aum__steps" aria-label={`${index + 1} de ${list.length}`}>
              {list.map((a, i) => <i key={a.code || i} className={i === index ? 'is-on' : i < index ? 'is-done' : ''} />)}
              <span>{index + 1} de {list.length}</span>
            </div>
          )}

          {/* Carta que gira y se revela */}
          <div className="aum__reveal">
            <span className="aum__burst" aria-hidden="true" />
            <span className="aum__burst aum__burst--2" aria-hidden="true" />
            <motion.div
              className="aum__flip"
              initial={reduceMotion ? false : { rotateY: 180, scale: 0.7, y: 20 }}
              animate={{ rotateY: 0, scale: 1, y: 0 }}
              transition={{ rotateY: { delay: 0.25, duration: 0.7, ease: [0.34, 1.3, 0.64, 1] }, scale: { duration: 0.5, ease: 'easeOut' }, y: { duration: 0.5 } }}
            >
              <div className="aum__face aum__face--front">
                <img src={current.image_lg} alt={current.title} />
                <span className="aum__holo" aria-hidden="true" />
              </div>
              <div className="aum__face aum__face--back" aria-hidden="true">
                <span className="aum__back-mark">?</span>
              </div>
            </motion.div>
            <span className="aum__flash" aria-hidden="true" />
            <div className="aum__mascot" aria-hidden="true">
              <RobotMascot act={revealed ? 'cheer' : null} actKey={index} />
            </div>
          </div>

          {/* Ficha */}
          <motion.div
            className="aum__text"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: t0 + 0.1, duration: 0.4 }}
          >
            <h2 className="aum__title">{current.title}</h2>
            <div className="aum__rarity">
              <RarityBadge rarity={current.rarity} size="lg" />
            </div>
            {description && (
              <p className="aum__desc">{description}</p>
            )}
            {current.unlock_label && (
              <p className="aum__goal">
                <Target size={14} /> Reto superado: {current.unlock_label}
              </p>
            )}

            <div className="aum__bonus">
              <Trophy size={18} />
              <span>
                <strong>+{Number(current.points_bonus).toFixed(2)}</strong> a tu nota media
              </span>
            </div>

            <div className="aum__actions">
              {isLast ? (
                <button type="button" onClick={onClose} className="aum__btn aum__btn--gold">
                  ¡Genial!
                </button>
              ) : (
                <button type="button" onClick={() => setIndex((i) => i + 1)} className="aum__btn aum__btn--glass">
                  Siguiente <ChevronRight size={18} />
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}
