// src/apps/mesa-crafteo/ui/MissionPanel.jsx
// Ficha de la misión: objetivo, fórmula, contador de átomos en vivo frente al
// objetivo, valencias completas, carga total y pistas. En móvil se pliega a
// una franja (toca para desplegar).
import React, { useMemo, useState } from 'react';
import { Check, ChevronDown, Lightbulb, Map as MapIcon, Target, EyeOff, Atom, Zap } from 'lucide-react';
import { tokenInfo } from '../chem/elements';
import { atomStatus, elementCounts, hillFormula, totalCharge } from '../chem/graph';
import { displayOf } from '../chem/display';
import Blueprint from './Blueprint';

const chargeText = (q) => (q === 0 ? '0' : `${q > 0 ? '+' : '−'}${Math.abs(q)}`);

export default function MissionPanel({
  kicker, target, model, showFormula = true, showCounts = true, showPlan = false,
  hintsLeft = 0, hintLabel, onHint, hintCost, extra, children, compact = false,
}) {
  const [open, setOpen] = useState(false);
  const counts = useMemo(() => elementCounts(model.atoms.map((a) => a.tok)), [model]);
  const need = useMemo(() => (target ? elementCounts(target.atoms) : {}), [target]);
  const done = model.atoms.filter((a) => atomStatus(model, a.id).ok).length;
  const total = model.atoms.length;
  const charge = totalCharge(model);
  const targetCharge = target?.charge || 0;
  const built = total ? hillFormula(model.atoms.map((a) => a.tok)) : '—';
  const plan = target && showPlan ? displayOf(target) : null;

  const els = target ? Object.keys(need).sort((a, b) => tokenInfo(a).z - tokenInfo(b).z) : Object.keys(counts);
  const extraEls = target ? Object.keys(counts).filter((e) => !need[e]) : [];

  return (
    <section className={`mc-mission ${compact ? 'is-compact' : ''} ${open ? 'is-open' : ''}`} aria-label="Misión">
      <button type="button" className="mc-mission__toggle" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className="mc-kicker"><Target size={13} /> {kicker}</span>
        <ChevronDown size={16} className="mc-mission__chev" />
      </button>
      {target ? (
        <div className="mc-mission__head">
          <h2 className="mc-mission__name">{target.name}</h2>
          {showFormula
            ? <strong className="mc-mission__formula">{target.formula}</strong>
            : <span className="mc-mission__hidden"><EyeOff size={14} /> Fórmula oculta</span>}
        </div>
      ) : (
        <div className="mc-mission__head">
          <h2 className="mc-mission__name">Laboratorio libre</h2>
          <span className="mc-mission__hidden"><Atom size={14} /> Construye lo que quieras</span>
        </div>
      )}

      <div className="mc-mission__body">
        {(showCounts || !target) && (
          <div className="mc-counts" aria-label="Átomos colocados">
            {els.map((el) => {
              const have = counts[el] || 0; const want = need[el];
              const state = want == null ? 'free' : have === want ? 'ok' : have > want ? 'over' : 'todo';
              return (
                <span key={el} className={`mc-count is-${state}`} style={{ '--el': tokenInfo(el).color }}>
                  <b>{el}</b>
                  <span>{have}{want != null && <small>/{want}</small>}</span>
                  {state === 'ok' && <Check size={12} strokeWidth={3} />}
                </span>
              );
            })}
            {extraEls.map((el) => (
              <span key={el} className="mc-count is-over" style={{ '--el': tokenInfo(el).color }}>
                <b>{el}</b><span>{counts[el]}<small>/0</small></span>
              </span>
            ))}
          </div>
        )}

        <div className="mc-status">
          <div className="mc-status__row">
            <span>Tu molécula</span>
            <strong className="mc-status__formula">{built}</strong>
          </div>
          <div className="mc-status__row">
            <span>Valencias completas</span>
            <strong className={total && done === total ? "is-good" : ""}>{total ? `${done}/${total}` : "—"}</strong>
          </div>
          <div className="mc-status__bar"><i style={{ transform: `scaleX(${total ? done / total : 0})` }} /></div>
          {(targetCharge !== 0 || charge !== 0) && (
            <div className="mc-status__row">
              <span><Zap size={12} /> Carga total</span>
              <strong className={target && charge === targetCharge ? 'is-good' : ''}>{chargeText(charge)}{target ? ` (objetivo ${chargeText(targetCharge)})` : ''}</strong>
            </div>
          )}
        </div>

        {plan && (
          <figure className="mc-plan">
            <figcaption><MapIcon size={13} /> Plano de la molécula</figcaption>
            <Blueprint {...plan} showLP={false} title={`Plano de ${target.name}`} />
          </figure>
        )}

        {onHint && hintsLeft > 0 && (
          <button type="button" className="mc-hintbtn" onClick={onHint}>
            <Lightbulb size={16} /> <span>{hintLabel}</span>
            {hintCost && <small>{hintCost}</small>}
          </button>
        )}
        {extra}
        {children}
      </div>
    </section>
  );
}
