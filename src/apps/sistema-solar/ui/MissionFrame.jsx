// src/apps/sistema-solar/ui/MissionFrame.jsx
// Piezas comunes de las misiones: barra superior (progreso, puntos, racha,
// salir con confirmación propia) y resumen final con el kit (ResultsScreen):
// nota /10 protagonista, puntos paralelos, estrellas ganadas y rango.
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, Star, Flame, Trophy, RefreshCw, LayoutGrid, Orbit, Clock, Target, Award } from 'lucide-react';
import { ProgressDots, HudStat, ResultsScreen, ConfirmDialog } from '../../_shared/kit';

export const fmtClock = (s) => `${Math.floor(s / 60)}:${String(Math.round(s) % 60).padStart(2, '0')}`;

export function MissionTopBar({ mission, label, index, total, results, points, streak, onExit, compact = false }) {
  const [confirm, setConfirm] = useState(false);
  const ref = useRef(null);
  const [host, setHost] = useState(null);
  // el diálogo se monta en el escenario: así no queda atrapado en el panel (z-index/transform)
  useEffect(() => { setHost(ref.current?.closest('.gk-shell') || document.body); }, []);
  const dialog = (
    <ConfirmDialog
      open={confirm}
      title="¿Abandonar la misión?"
      confirmLabel="Sí, abandonar"
      cancelLabel="Seguir jugando"
      onConfirm={() => { setConfirm(false); onExit(); }}
      onCancel={() => setConfirm(false)}
    >
      Si sales ahora, esta misión no tendrá nota ni contará para tus tareas.
    </ConfirmDialog>
  );
  return (
    <div ref={ref} className={`ssm-top ${compact ? 'is-compact' : ''}`} style={{ '--mt': mission.tone }}>
      <div className="ssm-top__id">
        <span className="ssm-top__badge"><Target size={16} /></span>
        <div className="ssm-top__titles">
          <strong>{mission.title}</strong>
          <span>{label || `${Math.min(index + 1, total)} de ${total}`}</span>
        </div>
      </div>
      <div className="ssm-top__dots"><ProgressDots total={total} current={index} results={results} /></div>
      <div className="ssm-top__hud">
        <HudStat icon={Trophy} tone="score" value={Math.round(points).toLocaleString('es-ES')} label="puntos" />
        {streak > 1 && <HudStat icon={Flame} tone="streak" value={`×${streak}`} label="racha" />}
      </div>
      <button type="button" className="gk-iconbtn ssm-top__exit" onClick={() => setConfirm(true)} aria-label="Abandonar la misión" title="Abandonar">
        <X size={18} />
      </button>
      {host && createPortal(dialog, host)}
    </div>
  );
}

function StarsEarned({ stars = 0, prev = 0 }) {
  return (
    <div className="ssm-stars" aria-label={`${stars} de 3 estrellas`}>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className={`ssm-star ${i < stars ? 'is-on' : ''} ${i < stars && i >= prev ? 'is-new' : ''}`}
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5 + i * 0.18, type: 'spring', stiffness: 320, damping: 16 }}
        >
          <Star size={30} strokeWidth={2.2} fill={i < stars ? 'currentColor' : 'none'} />
        </motion.span>
      ))}
    </div>
  );
}

export function MissionResults({ mission, result, durationSeconds, stats = [], outcome, onRestart, onHub, onExplore, children }) {
  const stars = outcome?.stars ?? 0;
  return (
    <div className="ssm-results">
      <ResultsScreen
        mode="test"
        title="¡Misión completada!"
        subtitle={mission.title}
        nota={result.nota}
        points={result.points}
        stats={[
          { icon: Target, tone: 'good', label: 'Aciertos a la primera', value: `${result.correct}/${result.total}` },
          ...stats,
          { icon: Clock, tone: 'time', label: 'Tiempo', value: fmtClock(durationSeconds) },
        ]}
        actions={[
          { label: 'Repetir misión', onClick: onRestart, icon: RefreshCw },
          { label: 'Otra misión', onClick: onHub, icon: LayoutGrid, variant: 'soft' },
          { label: 'Explorar', onClick: onExplore, icon: Orbit, variant: 'soft' },
        ]}
      >
        <div className="ssm-reward">
          <StarsEarned stars={stars} prev={outcome?.prevStars ?? 0} />
          <div className="ssm-reward__text">
            {outcome?.record && <span className="ssm-reward__chip is-record"><Award size={14} /> ¡Nuevo récord en esta misión!</span>}
            {outcome?.newRank && <span className="ssm-reward__chip is-rank"><Star size={14} /> Nuevo rango: {outcome.newRank}</span>}
            {outcome?.unlocked?.length > 0 && <span className="ssm-reward__chip is-unlock"><Trophy size={14} /> Desbloqueada: {outcome.unlocked.join(', ')}</span>}
            <span className="ssm-reward__hint">
              {stars >= 3 ? 'Misión dominada: 3 estrellas.' : `Saca un ${[5, 7, 9][stars]} o más para la ${stars + 1}ª estrella.`}
            </span>
          </div>
        </div>
        {children}
      </ResultsScreen>
    </div>
  );
}
