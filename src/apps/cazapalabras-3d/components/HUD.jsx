// HUD (overlay DOM sobre el Canvas). Solo informativo → pointer-events:none.
// Muestra objetivo (definición), tiempo, puntuación, combo, feedback y la LEYENDA
// de las 2 categorías que puntúan (principal +5 · secundaria +2). El resto de
// palabras no puntúan: dispararlas hace desaparecer válidas (regla, abajo).
import React from 'react';

const fmtTime = (s) => {
  const v = Math.max(0, Math.ceil(s));
  const m = Math.floor(v / 60);
  return `${m}:${String(v % 60).padStart(2, '0')}`;
};

const DEBUFF_META = {
  slow: { ic: '🐌', label: 'Mirilla lenta' },
  invert: { ic: '🔄', label: 'Controles al revés' },
  shake: { ic: '📳', label: 'Vibración' },
};
const BUFF_META = {
  rapid: { ic: '⚡', label: 'Disparo rápido' },
  swift: { ic: '🚀', label: 'Mirilla ágil' },
};
const effectPct = (e) => Math.max(0, Math.min(100, (e.remaining / e.total) * 100));

export default function HUD({
  timeLeft, totalTime, score, combo,
  activeDef, defRemaining, defWindow, feedback, examInfo, categories, debuffs, buffs,
}) {
  const timePct = Math.max(0, Math.min(100, (timeLeft / totalTime) * 100));
  const low = timeLeft <= 10;
  const cats = categories || [];
  const dbf = debuffs || [];
  const bff = buffs || [];

  return (
    <div className="cz3d-hud">
      {/* efectos activos: buffs (verde, gema dorada) y debuffs (rojo, penalización),
          cada uno con su BARRA DE DURACIÓN. El tinte rojo de fondo lo pinta el shell. */}
      {(bff.length > 0 || dbf.length > 0) && (
        <div className="cz3d-effects">
          {bff.map((b) => (BUFF_META[b.type] ? (
            <span key={`b-${b.type}`} className="cz3d-effect buff">
              <span className="cz3d-effect-label"><span className="ic">{BUFF_META[b.type].ic}</span> {BUFF_META[b.type].label}</span>
              <span className="cz3d-effect-bar"><i style={{ width: `${effectPct(b)}%` }} /></span>
            </span>
          ) : null))}
          {dbf.map((d) => (DEBUFF_META[d.type] ? (
            <span key={`d-${d.type}`} className="cz3d-effect debuff">
              <span className="cz3d-effect-label"><span className="ic">{DEBUFF_META[d.type].ic}</span> {DEBUFF_META[d.type].label}</span>
              <span className="cz3d-effect-bar"><i style={{ width: `${effectPct(d)}%` }} /></span>
            </span>
          ) : null))}
        </div>
      )}
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

      {/* Leyenda: SOLO las 2 categorías que puntúan + regla del resto */}
      {cats.length > 0 && (
        <div className="cz3d-legend">
          <div className="cz3d-legend-row">
            <span className="cz3d-legend-label good">✓ DISPARA</span>
            {cats.map((c) => (
              <span key={c.name} className={`cz3d-cat ${c.role === 'principal' ? 't5' : 't2'}`}>
                {c.name} <b>+{c.points}</b>
              </span>
            ))}
          </div>
          <div className="cz3d-legend-note">
            ⚠️ El resto de palabras no puntúan: dispararlas hace <b>desaparecer válidas</b>
          </div>
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
