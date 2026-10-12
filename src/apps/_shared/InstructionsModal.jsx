// src/apps/_shared/InstructionsModal.jsx
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, HelpCircle, Check } from 'lucide-react';
import AppIcon, { hasAppIcon } from '@/components/AppIcon';
import { useAppMeta } from './kit/AppMetaContext';
import './InstructionsModal.css';

/**
 * Modal reutilizable de instrucciones para las apps (rediseño 2026, a juego con
 * el kit _shared/kit). Hoja de cristal con cabecera (icono de la app + nombre),
 * cuerpo con tipografía cuidada y botón "¡Entendido!".
 *
 * Uso (API sin cambios):
 *   <InstructionsModal isOpen={showHelp} onClose={() => setShowHelp(false)} title="Ahorcado">
 *     <h3>Objetivo</h3>
 *     <p>Adivina la palabra...</p>
 *     <div className="instr-modes">
 *       <div className="instr-mode easy"><strong>Fácil</strong> …</div>
 *       <div className="instr-mode medium"><strong>Medio</strong> …</div>
 *       <div className="instr-mode exam"><strong>Examen</strong> …</div>
 *     </div>
 *     <div className="instr-tips"><strong>💡 Consejos:</strong> …</div>
 *   </InstructionsModal>
 *
 * Clases que pueden usar los hijos: instr-modes / instr-mode (easy|medium|exam),
 * instr-tips, instr-formula, instr-note, kbd. Las apps con tema propio
 * (.mr-shell, .rob-shell…) siguen pudiendo sobrescribir .instr-modal-*.
 * El color de acento sale de --gk-accent / --gk-accent-2 si el modal vive dentro
 * de un GameShell (la app pinta el modal con sus colores).
 */
const LEVEL_LABEL = { primaria: 'Primaria', eso: 'ESO', bachillerato: 'Bachillerato', ad: 'Diversidad' };
const cleanName = (name = '') =>
  String(name).replace(/^[\p{Extended_Pictographic}\p{Emoji_Presentation}️‍\s]+/u, '').trim();

const InstructionsModal = ({ isOpen, onClose, title, children }) => {
  const meta = useAppMeta();
  const showAppIcon = !!(meta.appId && hasAppIcon(meta.appId));
  const appName = cleanName(meta.name);
  const course = meta.level
    ? (meta.grade && meta.level !== 'ad' ? `${meta.grade}º ${LEVEL_LABEL[meta.level] || meta.level}` : (LEVEL_LABEL[meta.level] || meta.level))
    : '';
  const eyebrow = [appName, course].filter(Boolean).join(' · ');

  // Escape cierra el modal
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="instr-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="instr-modal-content"
            role="dialog"
            aria-modal="true"
            aria-label={typeof title === 'string' ? title : 'Instrucciones'}
            initial={{ scale: 0.92, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 16 }}
            transition={{ type: 'spring', stiffness: 360, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Capas decorativas: banda de luz superior + halo del acento */}
            <span className="instr-modal-aurora" aria-hidden="true" />
            <span className="instr-modal-orb instr-modal-orb--a" aria-hidden="true" />
            <span className="instr-modal-orb instr-modal-orb--b" aria-hidden="true" />

            <header className="instr-modal-head">
              <span className={`instr-modal-title-icon ${showAppIcon ? 'has-app' : ''}`}>
                {showAppIcon ? <AppIcon appId={meta.appId} size={52} /> : <HelpCircle size={24} />}
              </span>
              <div className="instr-modal-heading">
                <span className="instr-modal-eyebrow">
                  <HelpCircle size={13} /> {eyebrow || 'Instrucciones'}
                </span>
                <h2 className="instr-modal-title">{title}</h2>
              </div>
              <button
                type="button"
                className="instr-modal-close"
                onClick={onClose}
                aria-label="Cerrar instrucciones"
              >
                <X size={18} />
              </button>
            </header>

            <div className="instr-modal-body">{children}</div>

            <footer className="instr-modal-foot">
              <button type="button" className="instr-modal-ok" onClick={onClose}>
                <Check size={18} strokeWidth={3} /> ¡Entendido!
              </button>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * Botón con icono de interrogación para abrir el modal.
 */
export const InstructionsButton = ({ onClick, className = '' }) => (
  <button
    className={`instr-open-btn ${className}`}
    onClick={onClick}
    title="Instrucciones"
    aria-label="Ver instrucciones"
    type="button"
  >
    <span className="instr-open-btn-halo" aria-hidden="true" />
    <HelpCircle size={18} />
  </button>
);

export default InstructionsModal;
