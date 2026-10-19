// src/apps/mesa-crafteo/ui/CampaignMap.jsx
// Mapa de la campaña: mundos con su camino de niveles, estrellas y candados.
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, Star, Trophy, Sparkles } from 'lucide-react';
import { worldLevels, worldStats, isWorldUnlocked, isLevelUnlocked } from '../campaign';

const RANK_LABEL = { 1: '1º ESO', 2: '2º ESO', 3: '3º ESO', 4: '4º ESO', 5: 'Bachillerato', 6: 'Bachillerato' };

export default function CampaignMap({ worlds, progress, rank, onPlay, onBack }) {
  const totals = worlds.reduce((acc, w) => {
    const s = worldStats(w, progress);
    return { stars: acc.stars + s.stars, max: acc.max + s.maxStars, done: acc.done + s.done, total: acc.total + s.total };
  }, { stars: 0, max: 0, done: 0, total: 0 });

  return (
    <div className="mc-map">
      <header className="mc-map__head">
        <button type="button" className="gk-iconbtn" onClick={onBack} aria-label="Volver"><ArrowLeft size={18} /></button>
        <div className="mc-map__title">
          <span className="mc-kicker"><Sparkles size={13} /> Campaña</span>
          <h2>Mundos de moléculas</h2>
        </div>
        <div className="mc-map__totals">
          <span className="mc-pill is-star"><Star size={15} /> {totals.stars}/{totals.max}</span>
          <span className="mc-pill"><Trophy size={15} /> {(progress.points || 0).toLocaleString('es-ES')}</span>
        </div>
      </header>

      <div className="mc-map__list">
        {worlds.map((w, wi) => {
          const st = worldStats(w, progress);
          const open = isWorldUnlocked(worlds, wi, progress, rank);
          const levels = worldLevels(w);
          const review = w.rank < rank;
          return (
            <motion.section
              key={w.id}
              className={`mc-world ${open ? '' : 'is-locked'}`}
              style={{ '--w1': w.color, '--w2': w.color2 }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(0.4, wi * 0.05), duration: 0.35 }}
            >
              <div className="mc-world__band">
                <span className="mc-world__num">{wi + 1}</span>
                <div className="mc-world__text">
                  <h3>{w.name}</h3>
                  <p>{w.subtitle}</p>
                </div>
                <div className="mc-world__meta">
                  <span className="mc-pill is-star"><Star size={13} /> {st.stars}/{st.maxStars}</span>
                  <span className="mc-pill is-soft">{review ? 'Repaso' : RANK_LABEL[w.rank]}</span>
                </div>
              </div>
              {!open && (() => {
                const prev = worldStats(worlds[wi - 1], progress);
                return (
                  <p className="mc-world__lock">
                    <Lock size={14} /> Completa {prev.need} niveles de «{worlds[wi - 1].name}» para abrirlo (llevas {prev.done}).
                  </p>
                );
              })()}
              <ol className="mc-path">
                {levels.map((lv, li) => {
                  const unlocked = open && isLevelUnlocked(worlds, wi, li, progress, rank);
                  const stars = progress.levels?.[lv.id]?.stars || 0;
                  return (
                    <li key={lv.id} className={`mc-node ${stars ? 'is-done' : ''} ${unlocked ? '' : 'is-locked'}`}>
                      <button type="button" disabled={!unlocked} onClick={() => onPlay(w, lv)}
                        aria-label={`Nivel ${li + 1}: ${unlocked ? lv.molecule.name : 'bloqueado'}`}>
                        <span className="mc-node__disc">
                          {unlocked ? <b>{lv.help === 'name' ? '?' : lv.molecule.formula}</b> : <Lock size={16} />}
                        </span>
                        <span className="mc-node__label">{unlocked ? lv.molecule.name : `Nivel ${li + 1}`}</span>
                        <span className="mc-node__stars" aria-hidden="true">
                          {[0, 1, 2].map((k) => <Star key={k} size={11} className={k < stars ? 'is-on' : ''} />)}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </motion.section>
          );
        })}
      </div>
    </div>
  );
}
