// src/apps/sistema-solar/ui/QuizMission.jsx
// Misiones de preguntas: «¿Más o menos?» (duelos de datos entre dos
// planetas), «Plan de vuelo» (cálculo de distancias y tiempos) y el «Gran
// examen» (mezcla de todo). Una respuesta por pregunta: se puntúa a la
// primera y después se explica el porqué con los datos reales.
//
// Registro: al terminar la última pregunta se llama a onComplete UNA vez
// (doneRef) con el payload de missionScoring.buildPayload (mode 'test').
// «Repetir» vuelve a montar el componente (key) → partida nueva.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, X, Zap, Flame, Sun as SunIcon, Lightbulb } from 'lucide-react';
import { AnswerOption, GameButton, FeedbackItem } from '../../_shared/kit';
import { FACTS, BODY_COLOR, bodyName } from '../model/planetFacts';
import { makeVersusQuestions, makeTripQuestions, makeExamQuestions, isCorrect } from '../model/questions';
import { SPEED_LIMIT } from '../model/missions';
import { mulberry32, randomSeed } from '../model/rng';
import { missionResult, buildPayload, speedBonus, streakBonus } from '../missionScoring';
import { MissionTopBar, MissionResults } from './MissionFrame';
import PlanetOrb from './PlanetOrb';

const LETTERS = ['A', 'B', 'C', 'D'];
const SPEED_MAX = 50;

function makeQuestions(missionId, stage, seed) {
  const rng = mulberry32(seed);
  if (missionId === 'versus') return makeVersusQuestions(stage, rng);
  if (missionId === 'viaje') return makeTripQuestions(stage, rng);
  return makeExamQuestions(stage, rng);
}

// Mapa de ruta: el Sol a la izquierda y los planetas en escala logarítmica
const ROUTE_IDS = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
const routeX = (id) => (id === 'sun' ? 3 : 10 + (Math.log10(FACTS[id].au / 0.3) / Math.log10(32 / 0.3)) * 86);

function RouteMap({ visual, revealed }) {
  const x1 = routeX(visual.from);
  const x2 = routeX(visual.to);
  return (
    <div className="ssq-route" aria-hidden="true">
      <div className="ssq-route__track">
        <span className="ssq-route__sun" />
        {ROUTE_IDS.map((id) => (
          <span key={id} className={`ssq-route__p ${id === visual.to || id === visual.from ? 'is-key' : ''}`} style={{ left: `${routeX(id)}%` }}>
            <PlanetOrb id={id} size={id === visual.to || id === visual.from ? 26 : 16} />
            <small>{bodyName(id)}</small>
          </span>
        ))}
        <span className={`ssq-route__run ${x2 < x1 ? 'is-rev' : ''}`} style={{ left: `${Math.min(x1, x2)}%`, width: `${Math.abs(x2 - x1)}%` }}>
          <span className="ssq-route__line" />
          <i key={`${visual.from}-${visual.to}`} className="ssq-route__probe" />
        </span>
      </div>
      <span className="ssq-route__legend">Escala logarítmica · {revealed ? visual.label : '¿cuánto será?'}</span>
    </div>
  );
}

function VersusCard({ id, state, value, onPick, disabled, side }) {
  return (
    <motion.button
      type="button"
      className={`ssq-vs__card is-${state}`}
      style={{ '--pc': BODY_COLOR[id] }}
      onClick={() => onPick(id)}
      disabled={disabled}
      initial={{ opacity: 0, x: side === 'l' ? -24 : 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
    >
      <span className="ssq-vs__orb"><PlanetOrb id={id} size={112} /></span>
      <strong className="ssq-vs__name">{bodyName(id)}</strong>
      <span className="ssq-vs__value">{value || FACTS[id].typeLabel}</span>
      {state === 'correct' && <span className="ssq-vs__mark is-ok"><Check size={20} strokeWidth={3} /></span>}
      {state === 'wrong' && <span className="ssq-vs__mark is-ko"><X size={20} strokeWidth={3} /></span>}
    </motion.button>
  );
}

function PlanetChoice({ q, chosen, revealed, onPick }) {
  return (
    <div className={`ssq-planets ssq-planets--${q.options.length}`}>
      {q.options.map((id) => {
        const state = !revealed ? (chosen === id ? 'selected' : 'idle') : id === q.answer ? 'correct' : chosen === id ? 'wrong' : 'dim';
        return (
          <button key={id} type="button" className={`ssq-pl is-${state}`} style={{ '--pc': BODY_COLOR[id] }} onClick={() => onPick(id)} disabled={revealed}>
            <PlanetOrb id={id} size={58} />
            <span>{bodyName(id)}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function QuizMission({ mission, stage, onComplete, onExit, onRestart, onHub, onExplore, outcome }) {
  const seed = useMemo(() => randomSeed(), []);
  const questions = useMemo(() => makeQuestions(mission.id, stage, seed), [mission.id, stage, seed]);
  const total = questions.length;
  const limit = SPEED_LIMIT[mission.id] || 20;

  const [idx, setIdx] = useState(0);
  const [chosen, setChosen] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState([]);
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [gain, setGain] = useState(null);
  const [summary, setSummary] = useState(null);

  const startRef = useRef(Date.now());
  const qStartRef = useRef(Date.now());
  const bonusRef = useRef(0);
  const doneRef = useRef(false);

  const q = questions[idx];
  useEffect(() => { qStartRef.current = Date.now(); }, [idx]);

  const answer = (value) => {
    if (revealed || summary) return;
    const ok = isCorrect(q, value);
    const secs = (Date.now() - qStartRef.current) / 1000;
    const nextStreak = ok ? streak + 1 : 0;
    const bonus = ok ? speedBonus(secs, limit, SPEED_MAX) + streakBonus(nextStreak) : 0;
    bonusRef.current += bonus;
    setChosen(value);
    setRevealed(true);
    setResults((r) => [...r, ok]);
    setStreak(nextStreak);
    setBestStreak((b) => Math.max(b, nextStreak));
    setPoints((p) => p + (ok ? 100 + bonus : 0));
    setGain(ok ? { pts: 100 + bonus, fast: secs < limit * 0.4 } : null);
  };

  const finish = (allResults) => {
    if (doneRef.current) return;
    doneRef.current = true;
    const durationSeconds = (Date.now() - startRef.current) / 1000;
    const correct = allResults.filter(Boolean).length;
    const result = missionResult({ correct, total, bonus: bonusRef.current, bonusMax: total * (SPEED_MAX + 100) });
    setSummary({ result, durationSeconds });
    onComplete?.(buildPayload(result, durationSeconds), result);
  };

  const next = () => {
    if (idx + 1 >= total) { finish(results); return; }
    setIdx((i) => i + 1);
    setChosen(null);
    setRevealed(false);
    setGain(null);
  };

  if (summary) {
    return (
      <div className="ssq-overlay">
        <MissionResults
          mission={mission}
          result={summary.result}
          durationSeconds={summary.durationSeconds}
          stats={[{ icon: Flame, tone: 'streak', label: 'Mejor racha', value: bestStreak }]}
          outcome={outcome}
          onRestart={onRestart}
          onHub={onHub}
          onExplore={onExplore}
        >
          {questions.map((qq, i) => (
            <FeedbackItem key={qq.id} index={i + 1} ok={results[i]} title={qq.prompt}>
              {qq.explain}
            </FeedbackItem>
          ))}
        </MissionResults>
      </div>
    );
  }

  const stateFor = (value) => {
    if (!revealed) return chosen === value ? 'selected' : 'idle';
    if (value === q.answer) return 'correct';
    if (value === chosen) return 'wrong';
    return 'idle';
  };

  return (
    <div className="ssq-overlay">
      <div className="ssq-panel" style={{ '--mt': mission.tone }}>
        <MissionTopBar mission={mission} index={idx} total={total} results={results} points={points} streak={streak} onExit={onExit} />

        <AnimatePresence mode="wait">
          <motion.section
            key={q.id}
            className={`ssq-card ssq-card--${q.type}`}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.12 } }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="ssq-timer" aria-hidden="true">
              <span key={`${q.id}-${revealed}`} className={`ssq-timer__fill ${revealed ? 'is-stop' : ''}`} style={{ '--dur': `${limit}s` }} />
              <span className="ssq-timer__label"><Zap size={12} /> Bonus por rapidez</span>
            </div>

            <h2 className="ssq-prompt">{q.prompt}</h2>

            {q.clues?.length > 0 && (
              <ol className="ssq-clues">
                {q.clues.map((c, i) => <li key={c}><span>{i + 1}</span>{c}</li>)}
              </ol>
            )}

            {q.visual?.kind === 'route' && <RouteMap visual={q.visual} revealed={revealed} />}

            {q.type === 'versus' && (
              <div className="ssq-vs">
                <VersusCard id={q.options[0]} side="l" state={stateFor(q.options[0])} value={revealed ? q.values[q.options[0]] : null} onPick={answer} disabled={revealed} />
                <span className="ssq-vs__vs">VS</span>
                <VersusCard id={q.options[1]} side="r" state={stateFor(q.options[1])} value={revealed ? q.values[q.options[1]] : null} onPick={answer} disabled={revealed} />
              </div>
            )}

            {q.type === 'choice' && (
              <div className={`ssq-options ${q.options.length === 3 ? 'is-three' : ''}`}>
                {q.options.map((o, i) => (
                  <AnswerOption key={o} letter={LETTERS[i]} state={stateFor(i)} onClick={() => answer(i)} disabled={revealed}>
                    {o}
                  </AnswerOption>
                ))}
              </div>
            )}

            {q.type === 'planet' && <PlanetChoice q={q} chosen={chosen} revealed={revealed} onPick={answer} />}

            <div className={`ssq-explain ${revealed ? 'is-on' : ''} ${results[idx] ? 'is-ok' : 'is-ko'}`} aria-live="polite">
              {revealed && (
                <>
                  <span className="ssq-explain__badge">{results[idx] ? <Check size={18} strokeWidth={3} /> : <Lightbulb size={18} />}</span>
                  <div className="ssq-explain__text">
                    <strong>
                      {results[idx] ? '¡Correcto!' : 'No era esa.'}
                      {gain && <em className="ssq-gain">+{gain.pts}{gain.fast ? ' ⚡' : ''}</em>}
                    </strong>
                    <p>{q.explain}</p>
                  </div>
                  <GameButton variant={results[idx] ? 'success' : 'primary'} iconRight={ArrowRight} onClick={next} autoFocus>
                    {idx + 1 >= total ? 'Ver resultado' : 'Siguiente'}
                  </GameButton>
                </>
              )}
              {!revealed && (
                <span className="ssq-explain__hint"><SunIcon size={14} /> {q.type === 'versus' ? 'Toca el astro que creas.' : 'Elige una respuesta: solo cuenta la primera.'}</span>
              )}
            </div>
          </motion.section>
        </AnimatePresence>
      </div>
    </div>
  );
}
