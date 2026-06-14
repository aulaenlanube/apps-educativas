// HUD (overlay DOM sobre el Canvas). Solo informativo → pointer-events:none
// salvo en los chips. Muestra objetivo (definición), tiempo, puntuación, combo,
// power-ups, feedback y la LEYENDA de categorías (qué dispara da puntos y qué
// penaliza), bien visible en la parte inferior.
import React from 'react';

const fmtTime = (s) => {
  const v = Math.max(0, Math.ceil(s));
  const m = Math.floor(v / 60);
  return `${m}:${String(v % 60).padStart(2, '0')}`;
};

const tierClass = (p) => (p >= 5 ? 't5' : p === 2 ? 't2' : 't1');

export default function HUD({
  timeLeft, totalTime, score, combo,
  activeDef, defRemaining, defWindow, feedback, examInfo, categories,
}) {
  const timePct = Math.max(0, Math.min(100, (timeLeft / totalTime) * 100));
  const low = timeLeft <= 10;
  const cats = categories || [];
  const scoring = cats.filter((c) => !c.penalty);
  const penalties = cats.filter((c) => c.penalty);

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
          <div className="cz3d-hint">🎯 Lee la palabra antes de disparar</div>
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
      </div>

      {/* Leyenda de categorías (abajo, bien legible) */}
      {cats.length > 0 && (
        <div className="cz3d-legend">
          <div className="cz3d-legend-row">
            <span className="cz3d-legend-label good">✓ DISPARA</span>
            {scoring.map((c) => (
              <span key={c.name} className={`cz3d-cat ${tierClass(c.points)}`}>
                {c.name} <b>+{c.points}</b>
              </span>
            ))}
          </div>
          {penalties.length > 0 && (
            <div className="cz3d-legend-row">
              <span className="cz3d-legend-label bad">⛔ NO dispares</span>
              {penalties.map((c) => (
                <span key={c.name} className="cz3d-cat pen">
                  {c.name} <b>−{c.points}</b>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Feedback de impacto (centro, bajo la mirilla) */}
      {feedback && (
        <div key={feedback.id} className="cz3d-feedback" style={{ color: feedback.color }}>
          {feedback.text}
        </div>
      )}
    </div>
  );
}
