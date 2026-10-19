// src/apps/sistema-solar/ui/MissionHub.jsx
// Centro de misiones: rango del explorador (estrellas de este dispositivo),
// diario de exploración y tarjetas de misión con estrellas, mejor nota y
// desbloqueos. Cada misión terminada tiene nota y cuenta para las tareas.
import React from 'react';
import { motion } from 'framer-motion';
import { X, Star, Lock, Play, RotateCcw, Globe2, MapPin, Layers3, GraduationCap, Medal } from 'lucide-react';
import { GameButton, Chip } from '../../_shared/kit';
import { MISSIONS, TIER_LABEL } from '../model/missions';
import { totalStars, rankFor, isUnlocked, MAX_STARS, RANKS } from '../progress';
import MissionArt from './MissionArt';

function RankMedal({ index }) {
  const hue = ['#94a3b8', '#60a5fa', '#34d399', '#a78bfa', '#f472b6', '#fbbf24'][index] || '#fbbf24';
  return (
    <span className="ssh-medal" style={{ '--rc': hue }} aria-hidden="true">
      <Medal size={30} />
      <i>{index + 1}</i>
    </span>
  );
}

export default function MissionHub({ progress, stage, onStart, onClose, explored }) {
  const stars = totalStars(progress);
  const { rank, index, next, progress: pr } = rankFor(stars);
  return (
    <div className="ssh-overlay" role="dialog" aria-modal="true" aria-label="Centro de misiones">
      <motion.div className="ssh-panel" initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
        <header className="ssh-head">
          <div className="ssh-rank">
            <RankMedal index={index} />
            <div className="ssh-rank__text">
              <span className="ssh-rank__kicker">Tu rango de explorador</span>
              <strong>{rank.name}</strong>
              <div className="ssh-rank__bar"><i style={{ transform: `scaleX(${pr})` }} /></div>
              <span className="ssh-rank__next">
                <Star size={13} fill="currentColor" /> {stars}/{MAX_STARS}
                {next ? ` · ${next.min - stars} ★ para «${next.name}»` : ' · ¡Rango máximo!'}
              </span>
            </div>
          </div>
          <div className="ssh-diary" aria-label="Diario de exploración">
            <Chip tone="soft" icon={GraduationCap}>{TIER_LABEL[stage]}</Chip>
            <Chip tone="soft" icon={Globe2}>Astros: {explored.bodies}/10</Chip>
            <Chip tone="soft" icon={MapPin}>Puntos: {explored.spots}/{explored.spotsTotal}</Chip>
            <Chip tone="soft" icon={Layers3}>Interiores: {explored.interiors}/10</Chip>
          </div>
          <button type="button" className="gk-iconbtn ssh-close" onClick={onClose} aria-label="Cerrar el centro de misiones"><X size={18} /></button>
        </header>

        <p className="ssh-intro">
          Cada misión terminada tiene <strong>nota sobre 10</strong> y cuenta para tus tareas. Consigue estrellas (5 → ★, 7 → ★★, 9 → ★★★) para subir de rango y desbloquear misiones.
        </p>

        <div className="ssh-grid">
          {MISSIONS.map((m, i) => {
            const rec = progress.missions[m.id];
            const open = isUnlocked(m, progress);
            const s = rec?.stars || 0;
            return (
              <motion.article
                key={m.id}
                className={`ssh-card ${open ? '' : 'is-locked'}`}
                style={{ '--mt': m.tone }}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + i * 0.05, duration: 0.4 }}
              >
                <div className="ssh-card__art"><MissionArt id={m.id} /></div>
                <div className="ssh-card__body">
                  <span className="ssh-card__skill">{m.skill}</span>
                  <h3>{m.title}</h3>
                  <p>{m.desc}</p>
                  <div className="ssh-card__meta">
                    <span className="ssh-card__stars" aria-label={`${s} de 3 estrellas`}>
                      {[0, 1, 2].map((k) => <Star key={k} size={16} fill={k < s ? 'currentColor' : 'none'} className={k < s ? 'is-on' : ''} />)}
                    </span>
                    {rec ? <span className="ssh-card__best">Mejor: {String(rec.best).replace('.', ',')}</span> : <span className="ssh-card__best is-new">Nueva</span>}
                  </div>
                  {open ? (
                    <GameButton variant={rec ? 'soft' : 'primary'} size="sm" icon={rec ? RotateCcw : Play} onClick={() => onStart(m.id)} className="ssh-card__cta">
                      {rec ? 'Mejorar' : 'Empezar'}
                    </GameButton>
                  ) : (
                    <span className="ssh-card__lock"><Lock size={14} /> Consigue {m.unlock} ★ en total</span>
                  )}
                </div>
              </motion.article>
            );
          })}
        </div>

        <footer className="ssh-foot">
          <span className="ssh-foot__ranks">
            {RANKS.map((r, i) => <span key={r.id} className={i <= index ? 'is-on' : ''} title={`${r.name} (${r.min} ★)`} />)}
          </span>
          <span>El progreso se guarda en este dispositivo. La nota de cada misión se guarda en tu cuenta.</span>
        </footer>
      </motion.div>
    </div>
  );
}
