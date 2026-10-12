// HUD (overlay DOM sobre el Canvas). Solo informativo → pointer-events:none.
// Muestra objetivo (definición), tiempo, puntuación, combo, feedback y la LEYENDA
// de las 2 categorías que puntúan (principal +5 · secundaria +2). El resto de
// palabras no puntúan: dispararlas hace desaparecer válidas (regla, abajo).
// Rediseño 2026: piezas del kit (HudStat) dentro del ámbito gk-shell de la
// partida; las barras se escalan con transform (sin reflow a ~11 Hz).
import React from 'react';
import {
  Timer, Star, Flame, BookOpen, Target, Crosshair, AlertTriangle, Snail, ArrowLeftRight, Vibrate, Zap, Rocket,
} from 'lucide-react';
import { HudStat } from '../../_shared/kit';

const fmtTime = (s) => {
  const v = Math.max(0, Math.ceil(s));
  const m = Math.floor(v / 60);
  return `${m}:${String(v % 60).padStart(2, '0')}`;
};

const DEBUFF_META = {
  slow: { Icon: Snail, label: 'Mirilla lenta' },
  invert: { Icon: ArrowLeftRight, label: 'Controles al revés' },
  shake: { Icon: Vibrate, label: 'Vibración' },
};
const BUFF_META = {
  rapid: { Icon: Zap, label: 'Disparo rápido' },
  swift: { Icon: Rocket, label: 'Mirilla ágil' },
};
const effectFrac = (e) => Math.max(0, Math.min(1, e.remaining / e.total));
const prettyCat = (name) => String(name || '').replace(/[_-]+/g, ' ').trim();

export default function HUD({
  timeLeft, totalTime, score, combo,
  activeDef, defRemaining, defWindow, feedback, examInfo, categories, debuffs, buffs,
}) {
  const timeFrac = Math.max(0, Math.min(1, timeLeft / totalTime));
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
          {bff.map((b) => {
            const meta = BUFF_META[b.type];
            if (!meta) return null;
            return (
              <span key={`b-${b.type}`} className="cz3d-effect is-buff">
                <span className="cz3d-effect__label"><span className="cz3d-effect__ico"><meta.Icon size={14} /></span> {meta.label}</span>
                <span className="cz3d-effect__bar"><i style={{ transform: `scaleX(${effectFrac(b)})` }} /></span>
              </span>
            );
          })}
          {dbf.map((d) => {
            const meta = DEBUFF_META[d.type];
            if (!meta) return null;
            return (
              <span key={`d-${d.type}`} className="cz3d-effect is-debuff">
                <span className="cz3d-effect__label"><span className="cz3d-effect__ico"><meta.Icon size={14} /></span> {meta.label}</span>
                <span className="cz3d-effect__bar"><i style={{ transform: `scaleX(${effectFrac(d)})` }} /></span>
              </span>
            );
          })}
        </div>
      )}

      {/* Objetivo / definición */}
      <div className="cz3d-objective">
        {activeDef ? (
          <div className="cz3d-def">
            <span className="cz3d-def__tag"><BookOpen size={14} /> Dispara la palabra que significa…</span>
            <span className="cz3d-def__text">«{activeDef.definition}»</span>
            <span className="cz3d-def__bar">
              <i style={{ transform: `scaleX(${Math.max(0, Math.min(1, defRemaining / defWindow))})` }} />
            </span>
          </div>
        ) : (
          <div className="cz3d-hint"><Target size={15} /> Lee la palabra antes de disparar</div>
        )}
      </div>

      {/* Marcador arriba-derecha */}
      <div className="cz3d-stats">
        <div className={`cz3d-time ${low ? 'is-low' : ''}`}>
          <span className="cz3d-time__ico"><Timer size={16} /></span>
          <span className="cz3d-time__val">{fmtTime(timeLeft)}</span>
          <span className="cz3d-time__bar"><i style={{ transform: `scaleX(${timeFrac})` }} /></span>
        </div>
        <div className="cz3d-stats__row">
          <HudStat icon={Star} tone="score" value={score.toLocaleString('es-ES')} label="Puntos" />
          {combo >= 2 && <HudStat icon={Flame} tone="streak" value={`×${combo}`} label="Combo" />}
          {examInfo && <HudStat icon={BookOpen} tone="good" value={examInfo} label="Definiciones" />}
        </div>
      </div>

      {/* Leyenda: SOLO las 2 categorías que puntúan + regla del resto */}
      {cats.length > 0 && (
        <div className="cz3d-legend">
          <div className="cz3d-legend__row">
            <span className="cz3d-legend__label"><Crosshair size={14} /> Dispara</span>
            {cats.map((c) => (
              <span key={c.name} className={`cz3d-cat ${c.role === 'principal' ? 't5' : 't2'}`}>
                {prettyCat(c.name)} <b>+{c.points}</b>
              </span>
            ))}
          </div>
          <div className="cz3d-legend__note">
            <AlertTriangle size={13} />
            <span>El resto de palabras no puntúan: dispararlas hace <b>desaparecer válidas</b></span>
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
