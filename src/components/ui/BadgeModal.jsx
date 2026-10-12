// Detalle de una insignia (alumno y docente) — rediseño 2026.
// Escenario oscuro con rayos y halo por rareza, la medalla animada sobre un
// pedestal y la ficha (rareza, categoría, recompensa, fecha). Si está
// conseguida, un pequeño confeti de celebración. Se monta en un portal para
// quedar por encima de cabeceras y docks pegajosos.
// API: <BadgeModal badge={obj|null} onClose={fn} />
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { X, Lock, Star, Calendar, Sparkles, Tag } from 'lucide-react';
import BadgeIcon from './BadgeIcon';
import './BadgeModal.css';

const RARITY = {
  common:    { label: 'Común',      colors: ['#e2e8f0', '#94a3b8', '#ffffff'] },
  rare:      { label: 'Rara',       colors: ['#93c5fd', '#3b82f6', '#ffffff'] },
  epic:      { label: 'Épica',      colors: ['#d8b4fe', '#a855f7', '#ffffff'] },
  legendary: { label: 'Legendaria', colors: ['#fde68a', '#f59e0b', '#ffffff'] },
  mythic:    { label: 'Mítica',     colors: ['#f0abfc', '#f472b6', '#fbbf24', '#67e8f9'] },
};

const CATEGORY_LABEL = {
  mythic: 'Míticas', general: 'General', exams: 'Exámenes', mastery: 'Maestría', exploration: 'Exploración',
  speed: 'Velocidad', streaks: 'Rachas', dedication: 'Dedicación', subjects: 'Asignaturas', ranking: 'Ranking',
  battle_rank: 'Batallas', programacion: 'Programación', teacher_groups: 'Grupos', teacher_students: 'Alumnos',
  teacher_tasks: 'Tareas', teacher_battles: 'Batallas Quiz', teacher_messages: 'Mensajes',
  teacher_platform: 'Plataforma', teacher_ratings: 'Valoraciones',
};

export default function BadgeModal({ badge, onClose }) {
  useEffect(() => {
    if (!badge) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [badge, onClose]);

  const rarityKey = badge && RARITY[badge.rarity] ? badge.rarity : 'common';
  const rarity = RARITY[rarityKey];
  const earned = !!badge?.earned;

  // Celebración breve al abrir una insignia conseguida.
  const celebrateKey = badge && earned ? badge.code : null;
  useEffect(() => {
    if (!celebrateKey) return undefined;
    const t = setTimeout(() => {
      confetti({
        particleCount: 70,
        spread: 80,
        startVelocity: 32,
        origin: { y: 0.42 },
        colors: RARITY[rarityKey].colors,
        zIndex: 10050,
        disableForReducedMotion: true,
      });
    }, 260);
    return () => clearTimeout(t);
  }, [celebrateKey, rarityKey]);

  if (typeof document === 'undefined') return null;

  const earnedDate = earned && badge?.earned_at
    ? new Date(badge.earned_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;
  const category = badge?.category ? (CATEGORY_LABEL[badge.category] || badge.category) : null;

  return createPortal(
    <AnimatePresence>
      {badge && (
        <motion.div
          className={`bdm r-${rarityKey}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={badge.name_es}
        >
          <div className="bdm__backdrop" aria-hidden="true" />

          <motion.div
            className="bdm__card"
            initial={{ scale: 0.8, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 10 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" onClick={onClose} className="bdm__close" aria-label="Cerrar">
              <X size={20} />
            </button>

            {/* Escenario */}
            <div className={`bdm__stage${earned ? '' : ' is-locked'}`}>
              <span className="bdm__rays" aria-hidden="true" />
              <span className="bdm__glow" aria-hidden="true" />
              <span className="bdm__sparkles" aria-hidden="true">
                <i /><i /><i /><i /><i /><i />
              </span>
              <motion.div
                className="bdm__medal"
                initial={{ rotate: -14, scale: 0.4, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 13, delay: 0.08 }}
              >
                <BadgeIcon code={badge.code} rarity={badge.rarity} size={188} earned={earned} animated />
                {!earned && (
                  <span className="bdm__lock"><Lock size={34} /></span>
                )}
              </motion.div>
              <span className="bdm__pedestal" aria-hidden="true" />
            </div>

            {/* Ficha */}
            <motion.div
              className="bdm__info"
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.35 }}
            >
              <div className="bdm__tags">
                <span className="bdm__rarity">{rarity.label}</span>
                {category && <span className="bdm__cat"><Tag size={12} /> {category}</span>}
              </div>

              <h2 className="bdm__title">{badge.name_es}</h2>
              <p className="bdm__desc">{badge.description_es}</p>

              <div className="bdm__facts">
                <div className="bdm__fact is-xp">
                  <span className="bdm__fact-icon"><Star size={16} /></span>
                  <span className="bdm__fact-label">Recompensa</span>
                  <strong>+{badge.xp_reward} XP</strong>
                </div>

                {earned ? (
                  earnedDate && (
                    <div className="bdm__fact is-good">
                      <span className="bdm__fact-icon"><Calendar size={16} /></span>
                      <span className="bdm__fact-label">Conseguida</span>
                      <strong>{earnedDate}</strong>
                    </div>
                  )
                ) : (
                  <div className="bdm__fact is-locked">
                    <span className="bdm__fact-icon"><Lock size={16} /></span>
                    <span className="bdm__fact-label">Estado</span>
                    <strong>Aún no conseguida</strong>
                  </div>
                )}
              </div>

              <p className={`bdm__note${earned ? ' is-good' : ''}`}>
                {earned ? (
                  <><Sparkles size={15} /> ¡Ya brilla en tu vitrina de trofeos!</>
                ) : (
                  <>Cumple el reto y se desbloqueará sola al terminar la partida.</>
                )}
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
