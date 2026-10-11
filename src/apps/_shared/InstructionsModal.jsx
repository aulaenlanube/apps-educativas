// src/apps/_shared/InstructionsModal.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, HelpCircle } from 'lucide-react';
import './InstructionsModal.css';

/**
 * Modal reutilizable de instrucciones para las apps.
 * Uso:
 *   <InstructionsModal isOpen={showHelp} onClose={() => setShowHelp(false)} title="Ahorcado">
 *     <h3>Objetivo</h3>
 *     <p>Adivina la palabra...</p>
 *   </InstructionsModal>
 */
const InstructionsModal = ({ isOpen, onClose, title, children }) => {
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
            initial={{ scale: 0.88, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.88, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Capas decorativas: banda de aurora superior + orbes de luz */}
            <span className="instr-modal-aurora" aria-hidden="true" />
            <span className="instr-modal-orb instr-modal-orb--a" aria-hidden="true" />
            <span className="instr-modal-orb instr-modal-orb--b" aria-hidden="true" />
            <button
              className="instr-modal-close"
              onClick={onClose}
              aria-label="Cerrar instrucciones"
            >
              <X size={18} />
            </button>
            <motion.h2
              className="instr-modal-title"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.08, duration: 0.35 }}
            >
              <span className="instr-modal-title-icon">
                <HelpCircle size={22} />
              </span>
              {title}
            </motion.h2>
            <div className="instr-modal-body">{children}</div>
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
