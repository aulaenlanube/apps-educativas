import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Info } from 'lucide-react';
import { GameButton } from '../_shared/kit';

// Diálogo propio (el proyecto prohíbe window.confirm/alert/prompt).
// Overlay + tarjeta con el lenguaje del kit. Escape o clic fuera = cancelar.
//   tone: 'danger' | 'info'
//   actions: [{ label, onClick, variant, icon, autoFocus }]
export default function PbDialog({ open, tone = 'info', title, text, actions = [], onClose, icon: Icon }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const Glyph = Icon || (tone === 'danger' ? AlertTriangle : Info);
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="pbx-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={`pbx-dialog is-${tone}`}
            role="alertdialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, y: 18, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 340, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
          >
            <span className="pbx-dialog__icon" aria-hidden="true"><Glyph size={26} /></span>
            <h3 className="pbx-dialog__title">{title}</h3>
            {text && <p className="pbx-dialog__text">{text}</p>}
            <div className="pbx-dialog__actions">
              {actions.map((a) => (
                <GameButton key={a.label} variant={a.variant || 'soft'} icon={a.icon} onClick={a.onClick} autoFocus={a.autoFocus}>
                  {a.label}
                </GameButton>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
