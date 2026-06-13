// HUD (overlay DOM sobre el Canvas). Solo informativo → pointer-events:none
// salvo en los chips. Muestra objetivo (definición o pista de prioridad),
// tiempo, puntuación, combo, power-ups activos y feedback de impacto.
import React from 'react';

const fmtTime = (s) => {
  const v = Math.max(0, Math.ceil(s));
  const m = Math.floor(v / 60);
  return `${m}:${String(v % 60).padStart(2, '0')}`;
};

export default function HUD({
  timeLeft, totalTime, score, combo, mult, rapid,
  activeDef, defRemaining, defWindow, feedback, examInfo,
}) {
  const timePct = Math.max(0, Math.min(100, (timeLeft / totalTime) * 100));
  const low = timeLeft <= 10;
  return (
    <div className="cz3d-hud">
      {/* Objetivo / definición */}
      <div className="cz3d-objective">
        {activeDef ? (
          <div className="cz3d-def">
            <span className="cz3d-def-tag">📖 Dispara la palabra que significa…</span>
            <span className="cz3d-def-text">«{activeDef.definition}»</span>
            <span className="cz3d-def-bar">
              <i style={{ width: `${Math.max(0, Math.min(100, (defRemaining / defWindow) * 100))}%` }} />
            </span>
          </div>
        ) : (
          <div className="cz3d-hint">
            🎯 Prioriza las <b className="g5">doradas (5)</b> · <b className="g2">cian (2)</b> · evita las <b className="bomb">💀 bombas</b>
          </div>
        )}
      </div>

      {/* Cluster de stats arriba-derecha */}
      <div className="cz3d-stats">
        <div className={`cz3d-time ${low ? 'low' : ''}`}>
          <span className="cz3d-time-val">⏱ {fmtTime(timeLeft)}</span>
          <span className="cz3d-time-bar"><i style={{ width: `${timePct}%` }} /></span>
        </div>
        <div className="cz3d-score">⭐ {score.toLocaleString('es-ES')}</div>
        <div className="cz3d-sub">
          {combo >= 2 && <span className="cz3d-combo">🔥 Combo ×{combo}</span>}
          {examInfo && <span className="cz3d-examinfo">📖 {examInfo}</span>}
        </div>
        <div className="cz3d-powerups">
          {mult > 1 && <span className="cz3d-pu x2">✖️ ×2</span>}
          {rapid && <span className="cz3d-pu rapid">⚡ Rápido</span>}
        </div>
      </div>

      {/* Feedback de impacto (centro, bajo la mirilla) */}
      {feedback && (
        <div key={feedback.id} className="cz3d-feedback" style={{ color: feedback.color }}>
          {feedback.text}
        </div>
      )}
    </div>
  );
}
