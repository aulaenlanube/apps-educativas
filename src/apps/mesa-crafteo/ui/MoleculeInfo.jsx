// src/apps/mesa-crafteo/ui/MoleculeInfo.jsx
// Ficha científica de una molécula (resultado, álbum y visor) + estrellas.
import React from 'react';
import { motion } from 'framer-motion';
import { Star, Shapes, Triangle, Magnet, Lightbulb, FlaskConical, Zap } from 'lucide-react';

export function Stars({ value = 0, max = 3, size = 22, animate = false }) {
  return (
    <span className="mc-stars" aria-label={`${value} de ${max} estrellas`}>
      {Array.from({ length: max }, (_, i) => (
        <motion.span
          key={i}
          className={`mc-star ${i < value ? 'is-on' : ''}`}
          initial={animate ? { scale: 0.2, opacity: 0, rotate: -40 } : false}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ delay: animate ? 0.35 + i * 0.22 : 0, type: 'spring', stiffness: 380, damping: 14 }}
        >
          <Star size={size} strokeWidth={2.2} />
        </motion.span>
      ))}
    </span>
  );
}

const polarText = (p) => (p == null ? 'Ion' : p ? 'Polar' : 'Apolar');

export function FactChips({ mol }) {
  return (
    <div className="mc-facts">
      <span className="mc-fchip"><Shapes size={13} /> {mol.shape}</span>
      {mol.angle && <span className="mc-fchip"><Triangle size={13} /> {mol.angle}</span>}
      <span className={`mc-fchip ${mol.polar == null ? 'is-ion' : mol.polar ? 'is-polar' : ''}`}>
        {mol.polar == null ? <Zap size={13} /> : <Magnet size={13} />} {polarText(mol.polar)}
        {mol.charge ? ` (${mol.charge > 0 ? '+' : '−'}${Math.abs(mol.charge)})` : ''}
      </span>
    </div>
  );
}

export default function MoleculeInfo({ mol, children }) {
  return (
    <div className="mc-info">
      <div className="mc-info__title">
        <h3>{mol.name}</h3>
        <strong className="mc-info__formula">{mol.formula}</strong>
      </div>
      <FactChips mol={mol} />
      <p className="mc-info__uses"><FlaskConical size={15} /> <span>{mol.uses}</span></p>
      <div className="mc-info__fact">
        <span className="mc-info__facticon"><Lightbulb size={16} /></span>
        <p><strong>¿Sabías que…?</strong> {mol.fact}</p>
      </div>
      {children}
    </div>
  );
}
