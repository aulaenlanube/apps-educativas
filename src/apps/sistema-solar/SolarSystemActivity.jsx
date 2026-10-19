import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, Reorder } from 'framer-motion';
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, CheckCheck, ArrowRight, Eye, Check, X, Sun, GripVertical, ListOrdered } from 'lucide-react';
import { GameButton, FeedbackItem } from '../_shared/kit';
import { FACTS, PLANET_IDS, BODY_COLOR, bodyName } from './model/planetFacts';
import { ORDER_CRITERIA, orderRoundsFor, correctOrder, scrambled } from './model/questions';
import { mulberry32, randomSeed } from './model/rng';
import { aciertosOrden } from './desafioScoring';
import { missionResult, buildPayload, speedBonus } from './missionScoring';
import { MissionTopBar, MissionResults } from './ui/MissionFrame';
import PlanetOrb from './ui/PlanetOrb';
import './SolarSystemActivity.css';

// Se mantiene la exportación para quien importaba el orbe desde aquí
export { PlanetOrb };

// «Ordena el Sistema Solar» (antes «Desafío de planetas»): una o varias
// rondas según el curso (distancia, tamaño, masa, densidad). Se arrastran
// las tarjetas (o se mueven con las flechas). Cuenta lo que está en su sitio
// en la PRIMERA comprobación de cada ronda; después se puede corregir hasta
// resolverla, para aprender. Al terminar la última ronda se llama a
// onComplete UNA vez (doneRef) con el payload de buildPayload (mode 'test').
// «Repetir» vuelve a montar el componente (key en SistemaSolar).

const ROUND_PAR = 70;           // segundos de referencia por ronda
const ROUND_SPEED_MAX = 120;    // bonus máximo de rapidez por ronda

function useNarrow() {
  const q = '(max-width: 720px)';
  const [narrow, setNarrow] = useState(() => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(q).matches : false));
  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const m = window.matchMedia(q);
    const on = () => setNarrow(m.matches);
    m.addEventListener?.('change', on);
    return () => m.removeEventListener?.('change', on);
  }, []);
  return narrow;
}

function sizeScale(id) {
  // tamaño relativo (raíz) para la revelación de la ronda de tamaño
  return 0.42 + 0.58 * Math.sqrt(FACTS[id].radiusRel / FACTS.jupiter.radiusRel);
}

export default function OrderMission({ mission, stage, onComplete, onExit, onRestart, onHub, onExplore, outcome }) {
  const narrow = useNarrow();
  const seed = useMemo(() => randomSeed(), []);
  const rng = useMemo(() => mulberry32(seed), [seed]);
  const rounds = useMemo(() => orderRoundsFor(stage), [stage]);

  const [round, setRound] = useState(0);
  const [items, setItems] = useState(() => scrambled(PLANET_IDS, rng));
  const [checks, setChecks] = useState(0);
  const [marks, setMarks] = useState(null); // {id: bool} tras comprobar
  const [solved, setSolved] = useState(false);
  const [firstHits, setFirstHits] = useState([]);
  const [points, setPoints] = useState(0);
  const [summary, setSummary] = useState(null);

  const startRef = useRef(Date.now());
  const roundStart = useRef(Date.now());
  const bonusRef = useRef(0);
  const doneRef = useRef(false);

  const crit = ORDER_CRITERIA[rounds[round]];
  const target = useMemo(() => correctOrder(crit.id), [crit.id]);
  const total = rounds.length * PLANET_IDS.length;

  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= items.length || solved) return;
    const n = [...items];
    [n[i], n[j]] = [n[j], n[i]];
    setItems(n);
    setMarks(null);
  };

  const check = () => {
    if (solved) return;
    const hits = aciertosOrden(items, target);
    const ok = hits === target.length;
    if (checks === 0) {
      const secs = (Date.now() - roundStart.current) / 1000;
      const bonus = Math.round(speedBonus(secs, ROUND_PAR, ROUND_SPEED_MAX) * (hits / target.length));
      bonusRef.current += bonus;
      setFirstHits((f) => [...f, hits]);
      setPoints((p) => p + hits * 100 + bonus);
    }
    setChecks((c) => c + 1);
    setMarks(Object.fromEntries(items.map((id, i) => [id, id === target[i]])));
    if (ok) setSolved(true);
  };

  const reveal = () => {
    setItems(target);
    setMarks(Object.fromEntries(target.map((id) => [id, true])));
    setSolved(true);
  };

  const nextRound = () => {
    if (round + 1 >= rounds.length) {
      if (doneRef.current) return;
      doneRef.current = true;
      const durationSeconds = (Date.now() - startRef.current) / 1000;
      const correct = firstHits.reduce((a, b) => a + b, 0);
      const result = missionResult({ correct, total, bonus: bonusRef.current, bonusMax: rounds.length * ROUND_SPEED_MAX });
      setSummary({ result, durationSeconds });
      onComplete?.(buildPayload(result, durationSeconds), result);
      return;
    }
    setRound((r) => r + 1);
    setItems(scrambled(PLANET_IDS, rng));
    setChecks(0);
    setMarks(null);
    setSolved(false);
    roundStart.current = Date.now();
  };

  if (summary) {
    return (
      <div className="ssq-overlay">
        <MissionResults
          mission={mission}
          result={summary.result}
          durationSeconds={summary.durationSeconds}
          stats={[{ icon: ListOrdered, tone: 'accent', label: 'Rondas', value: rounds.length }]}
          outcome={outcome}
          onRestart={onRestart}
          onHub={onHub}
          onExplore={onExplore}
        >
          {rounds.map((rid, i) => {
            const c = ORDER_CRITERIA[rid];
            return (
              <FeedbackItem key={rid} index={i + 1} ok={firstHits[i] === PLANET_IDS.length} title={`${c.title}: ${firstHits[i]}/8 a la primera`}>
                {correctOrder(rid).map((id) => `${bodyName(id)} (${c.show(FACTS[id])})`).join(' → ')}
              </FeedbackItem>
            );
          })}
        </MissionResults>
      </div>
    );
  }

  const hitsNow = marks ? Object.values(marks).filter(Boolean).length : 0;
  const reveal3d = solved && crit.id === 'size';
  const Prev = narrow ? ChevronUp : ChevronLeft;
  const Next = narrow ? ChevronDown : ChevronRight;

  return (
    <div className="ssq-overlay">
      <div className="ssq-panel sso-panel" style={{ '--mt': mission.tone }}>
        <MissionTopBar
          mission={mission}
          label={`Ronda ${round + 1} de ${rounds.length}`}
          index={round}
          total={rounds.length}
          results={firstHits.map((h) => h === PLANET_IDS.length)}
          points={points}
          streak={0}
          onExit={onExit}
        />

        <section className={`sso-board ${solved ? 'is-solved' : ''}`}>
          <header className="sso-head">
            <h2>{crit.title}</h2>
            <p>Ordena los 8 planetas {crit.id === 'distance' ? 'del más cercano al más lejano del Sol' : `de ${crit.from.toLowerCase()} a ${crit.to.toLowerCase()}`}.</p>
          </header>

          <div className="sso-axis" aria-hidden="true">
            <span className="sso-axis__from">{crit.id === 'distance' && <Sun size={14} />} {crit.from}</span>
            <span className="sso-axis__line" />
            <span className="sso-axis__to">{crit.to}</span>
          </div>

          <div className={`sso-track ${crit.id === 'distance' ? 'has-sun' : ''}`}>
            {crit.id === 'distance' && <span className="sso-sun" aria-hidden="true" />}
            <Reorder.Group axis={narrow ? 'y' : 'x'} values={items} onReorder={(v) => { if (!solved) { setItems(v); setMarks(null); } }} className="sso-list">
              {items.map((id, i) => {
                const mark = marks ? marks[id] : null;
                return (
                  <Reorder.Item
                    key={id}
                    value={id}
                    className={`sso-card ${mark === true ? 'is-ok' : mark === false ? 'is-ko' : ''}`}
                    style={{ '--pc': BODY_COLOR[id] }}
                    dragListener={!solved}
                    whileDrag={{ scale: 1.06, zIndex: 5 }}
                  >
                    <span className="sso-card__pos">{i + 1}</span>
                    <span className="sso-card__grip" aria-hidden="true"><GripVertical size={14} /></span>
                    <motion.span className="sso-card__orb" animate={{ scale: reveal3d ? sizeScale(id) : 1 }} transition={{ type: 'spring', stiffness: 160, damping: 16 }}>
                      <PlanetOrb id={id} size={narrow ? 40 : 54} />
                    </motion.span>
                    <span className="sso-card__name">{bodyName(id)}</span>
                    {solved && <span className="sso-card__val">{crit.show(FACTS[id])}</span>}
                    {mark != null && !solved && (
                      <span className={`sso-card__mark ${mark ? 'is-ok' : 'is-ko'}`}>{mark ? <Check size={13} strokeWidth={3.5} /> : <X size={13} strokeWidth={3.5} />}</span>
                    )}
                    {!solved && (
                      <span className="sso-card__ctrl">
                        <button type="button" onPointerDown={(e) => e.stopPropagation()} onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Mover ${bodyName(id)} antes`}>
                          <Prev size={16} strokeWidth={3} />
                        </button>
                        <button type="button" onPointerDown={(e) => e.stopPropagation()} onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label={`Mover ${bodyName(id)} después`}>
                          <Next size={16} strokeWidth={3} />
                        </button>
                      </span>
                    )}
                  </Reorder.Item>
                );
              })}
            </Reorder.Group>
          </div>

          <footer className="sso-foot">
            <p className={`sso-status ${solved ? 'is-ok' : marks ? 'is-ko' : ''}`} aria-live="polite">
              {solved
                ? `¡Ronda resuelta! A la primera: ${firstHits[round] ?? 0} de 8.`
                : marks
                  ? `${hitsNow} de 8 en su sitio. Corrige los rojos y vuelve a comprobar (la nota ya cuenta la 1ª comprobación).`
                  : narrow ? 'Arrastra las tarjetas o usa las flechas. Arriba va el primero.' : 'Arrastra las tarjetas o usa las flechas. A la izquierda va el primero.'}
            </p>
            <div className="sso-actions">
              {!solved && checks >= 2 && <GameButton variant="soft" icon={Eye} onClick={reveal}>Ver solución</GameButton>}
              {!solved && <GameButton variant="primary" icon={CheckCheck} onClick={check}>Comprobar</GameButton>}
              {solved && (
                <GameButton variant="success" iconRight={ArrowRight} onClick={nextRound} autoFocus>
                  {round + 1 >= rounds.length ? 'Ver resultado' : 'Siguiente ronda'}
                </GameButton>
              )}
            </div>
          </footer>
        </section>
      </div>
    </div>
  );
}
