// src/apps/mesa-crafteo/ui/Album.jsx
// Álbum molecular: colección de moléculas descubiertas (en campaña, examen,
// contrarreloj o laboratorio libre) con su ficha. Las que faltan salen como
// silueta con la fórmula de pista.
import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BookOpen, Box, X } from 'lucide-react';
import { GameButton } from '../../_shared/kit';
import { displayOf } from '../chem/display';
import Blueprint from './Blueprint';
import MoleculeInfo from './MoleculeInfo';

export default function Album({ molecules, worlds, album, onBack, onView3D }) {
  const [open, setOpen] = useState(null);
  const owned = new Set(album);
  const groups = useMemo(() => {
    const used = new Set();
    const g = worlds.map((w) => {
      const ms = w.levels.map((l) => molecules.find((m) => m.id === l.mol)).filter(Boolean);
      ms.forEach((m) => used.add(m.id));
      return { id: w.id, name: w.name, color: w.color, items: ms };
    });
    const rest = molecules.filter((m) => !used.has(m.id));
    if (rest.length) g.push({ id: 'otros', name: 'Otras', color: '#94a3b8', items: rest });
    return g;
  }, [molecules, worlds]);
  const have = molecules.filter((m) => owned.has(m.id)).length;

  return (
    <div className="mc-album">
      <header className="mc-map__head">
        <button type="button" className="gk-iconbtn" onClick={onBack} aria-label="Volver"><ArrowLeft size={18} /></button>
        <div className="mc-map__title">
          <span className="mc-kicker"><BookOpen size={13} /> Álbum molecular</span>
          <h2>{have} de {molecules.length} descubiertas</h2>
        </div>
        <div className="mc-album__bar" aria-hidden="true"><i style={{ transform: `scaleX(${molecules.length ? have / molecules.length : 0})` }} /></div>
      </header>
      <div className="mc-album__groups">
        {groups.map((g) => (
          <section key={g.id} className="mc-album__group" style={{ '--w1': g.color }}>
            <h3>{g.name}</h3>
            <div className="mc-album__grid">
              {g.items.map((m) => {
                const got = owned.has(m.id);
                return (
                  <button key={m.id} type="button" className={`mc-card ${got ? '' : 'is-missing'}`}
                    onClick={() => got && setOpen(m)} disabled={!got}
                    aria-label={got ? m.name : `Sin descubrir: ${m.formula}`}>
                    <span className="mc-card__art">
                      <Blueprint {...displayOf(m)} mystery={!got} title={got ? m.name : 'Molécula sin descubrir'} />
                    </span>
                    <span className="mc-card__name">{got ? m.name : '???'}</span>
                    <span className="mc-card__formula">{m.formula}</span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div className="mc-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(null)}>
            <motion.div className="mc-sheet" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 26 }} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={open.name}>
              <button type="button" className="gk-iconbtn mc-sheet__close" onClick={() => setOpen(null)} aria-label="Cerrar"><X size={18} /></button>
              <div className="mc-sheet__art"><Blueprint {...displayOf(open)} showLP title={open.name} /></div>
              <MoleculeInfo mol={open}>
                <div className="mc-sheet__actions">
                  <GameButton variant="primary" icon={Box} onClick={() => { const m = open; setOpen(null); onView3D(m); }}>Ver en 3D</GameButton>
                </div>
              </MoleculeInfo>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
