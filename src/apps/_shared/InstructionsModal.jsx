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
            <button
              className="instr-modal-close"
              onClick={onClose}
              aria-label="Cerrar instrucciones"
            >
              <X size={18} />
            </button>
            <h2 className="instr-modal-title">
              <HelpCircle size={22} />
              {title}
            </h2>
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
    <HelpCircle size={18} />
  </button>
);

export default InstructionsModal;
