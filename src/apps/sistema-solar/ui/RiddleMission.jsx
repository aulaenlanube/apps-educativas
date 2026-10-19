// src/apps/sistema-solar/ui/RiddleMission.jsx
// «¿Qué planeta soy?»: se juega SOBRE la escena 3D. Cada enigma enseña una
// pista; el alumno toca el astro en la escena o en la barra inferior (el
// toque llega como pickEvent). Fallar revela la siguiente pista; con la
// tercera fallada se muestra la solución. La cámara vuela al astro al
// resolverlo (onFocus).
// Nota: enigmas acertados al primer intento (con las pistas que hicieran
// falta). Puntos: 300/200/120 según las pistas vistas + racha.
// Registro: onComplete UNA vez al terminar (doneRef).
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Lightbulb, Check, X, MousePointerClick, Flame, Sparkles } from 'lucide-react';
import { GameButton, FeedbackItem } from '../../_shared/kit';
import { FACTS, BODY_COLOR, bodyName, theName, fmt, fmtSmart, fmtDays } from '../model/planetFacts';
import { makeRiddles, RIDDLE_POINTS } from '../model/questions';
import { mulberry32, randomSeed } from '../model/rng';
import { missionResult, buildPayload, streakBonus, STREAK_CAP } from '../missionScoring';
import { MissionTopBar, MissionResults } from './MissionFrame';
import PlanetOrb from './PlanetOrb';

function factLine(id) {
  const f = FACTS[id];
  if (id === 'sun') return `${f.typeLabel} · ${f.ageText} · 109 veces el diámetro de la Tierra`;
  if (id === 'moon') return `${f.typeLabel} · ${f.distanceNote} · gira en ${fmtDays(f.orbitDays)}`;
  return `${f.typeLabel} · ${fmtSmart(f.au)} UA del Sol · año de ${fmtDays(f.orbitDays)} · ${fmt(f.moons)} ${f.moons === 1 ? 'luna' : 'lunas'}`;
}

export default function RiddleMission({ mission, stage, pickEvent, onFocus, onComplete, onExit, onRestart, onHub, onExplore, outcome }) {
  const seed = useMemo(() => randomSeed(), []);
  const riddles = useMemo(() => makeRiddles(stage, mulberry32(seed)), [stage, seed]);
  const total = riddles.length;

  const [idx, setIdx] = useState(0);
  const [clues, setClues] = useState(1);
  const [status, setStatus] = useState('asking'); // asking | won | lost
  const [firstTry, setFirstTry] = useState(true);
  const [wrong, setWrong] = useState(null);
  const [results, setResults] = useState([]);
  const [log, setLog] = useState([]);
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [gain, setGain] = useState(0);
  const [summary, setSummary] = useState(null);

  const startRef = useRef(Date.now());
  const bonusRef = useRef(0);
  const doneRef = useRef(false);
  const lastSeq = useRef(pickEvent?.seq ?? 0);
  const r = riddles[idx];

  useEffect(() => () => onFocus?.(null), []); // eslint-disable-line react-hooks/exhaustive-deps

  // Toque en la escena o en la barra
  useEffect(() => {
    if (!pickEvent || pickEvent.seq === lastSeq.current) return;
    lastSeq.current = pickEvent.seq;
    if (status !== 'asking' || summary) return;
    const id = pickEvent.id;
    if (id === r.answer) {
      const nextStreak = firstTry ? streak + 1 : 0;
      const bonus = firstTry ? RIDDLE_POINTS[clues - 1] + streakBonus(nextStreak) : 0;
      bonusRef.current += bonus;
      setPoints((p) => p + (firstTry ? 100 + bonus : 0));
      setGain(firstTry ? 100 + bonus : 0);
      setStreak(nextStreak);
      setResults((x) => [...x, firstTry]);
      setLog((x) => [...x, { id: r.answer, ok: firstTry, clues }]);
      setStatus('won');
      onFocus?.(r.answer);
      return;
    }
    setWrong({ id, n: pickEvent.seq });
    setFirstTry(false);
    setStreak(0);
    if (clues < 3) {
      setClues((c) => c + 1);
    } else {
      setResults((x) => [...x, false]);
      setLog((x) => [...x, { id: r.answer, ok: false, clues: 3, lost: true }]);
      setStatus('lost');
      onFocus?.(r.answer);
    }
  }, [pickEvent]); // eslint-disable-line react-hooks/exhaustive-deps

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    const durationSeconds = (Date.now() - startRef.current) / 1000;
    const correct = results.filter(Boolean).length;
    const result = missionResult({ correct, total, bonus: bonusRef.current, bonusMax: total * (RIDDLE_POINTS[0] + STREAK_CAP) });
    setSummary({ result, durationSeconds });
    onFocus?.(null);
    onComplete?.(buildPayload(result, durationSeconds), result);
  };

  const next = () => {
    if (idx + 1 >= total) { finish(); return; }
    setIdx((i) => i + 1);
    setClues(1);
    setStatus('asking');
    setFirstTry(true);
    setWrong(null);
    setGain(0);
    onFocus?.(null);
  };

  if (summary) {
    return (
      <div className="ssq-overlay">
        <MissionResults
          mission={mission}
          result={summary.result}
          durationSeconds={summary.durationSeconds}
          stats={[{ icon: Lightbulb, tone: 'accent', label: 'Pistas usadas', value: log.reduce((n, l) => n + l.clues, 0) }]}
          outcome={outcome}
          onRestart={onRestart}
          onHub={onHub}
          onExplore={onExplore}
        >
          {log.map((l, i) => (
            <FeedbackItem key={`${l.id}-${i}`} index={i + 1} ok={l.ok} title={bodyName(l.id)}>
              {l.ok ? `A la primera, con ${l.clues} ${l.clues === 1 ? 'pista' : 'pistas'}.` : l.lost ? 'No lo adivinaste con las 3 pistas.' : 'Lo encontraste tras algún fallo.'} {riddles[i].clues[2]}
            </FeedbackItem>
          ))}
        </MissionResults>
      </div>
    );
  }

  return (
    <div className="ssr-hud" style={{ '--mt': mission.tone }}>
      <MissionTopBar mission={mission} label={`Enigma ${idx + 1} de ${total}`} index={idx} total={total} results={results} points={points} streak={streak} onExit={onExit} compact />
      <motion.section
        key={`${r.id}-${wrong?.n || 0}`}
        className={`ssr-card is-${status} ${wrong && status === 'asking' ? 'gk-anim-shake' : ''}`}
        initial={false}
      >
        {status === 'asking' && (
          <>
            <header className="ssr-card__head">
              <span className="ssr-card__q">?</span>
              <div>
                <strong>¿Qué astro soy?</strong>
                <span>Pista {clues} de 3 · ahora vale {100 + RIDDLE_POINTS[clues - 1]} puntos</span>
              </div>
            </header>
            <ol className="ssr-clues">
              <AnimatePresence initial={false}>
                {r.clues.slice(0, clues).map((c, i) => (
                  <motion.li key={c} className={i === clues - 1 ? 'is-new' : ''} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
                    <span>{i + 1}</span>{c}
                  </motion.li>
                ))}
              </AnimatePresence>
            </ol>
            {wrong && (
              <p className="ssr-wrong"><X size={15} strokeWidth={3} /> No es {theName(wrong.id)}. {clues > 1 ? 'Tienes una pista nueva.' : ''}</p>
            )}
            <div className="ssr-card__foot">
              <span className="ssr-hint"><MousePointerClick size={15} /> Toca el astro en la escena o en la barra de abajo</span>
              <GameButton variant="soft" size="sm" icon={Lightbulb} onClick={() => setClues((c) => Math.min(3, c + 1))} disabled={clues >= 3}>
                Otra pista
              </GameButton>
            </div>
          </>
        )}
        {status !== 'asking' && (
          <div className="ssr-solved" style={{ '--pc': BODY_COLOR[r.answer] }}>
            <span className="ssr-solved__orb"><PlanetOrb id={r.answer} size={72} /></span>
            <div className="ssr-solved__text">
              <span className={`ssr-solved__tag ${status === 'won' && firstTry ? 'is-ok' : 'is-ko'}`}>
                {status === 'won' ? (firstTry ? <><Check size={14} strokeWidth={3} /> ¡Correcto!</> : <><Sparkles size={14} /> ¡Encontrado!</>) : <><X size={14} strokeWidth={3} /> Era…</>}
                {gain > 0 && <em className="ssq-gain">+{gain}</em>}
                {streak > 1 && <em className="ssr-streak"><Flame size={13} /> ×{streak}</em>}
              </span>
              <strong>{bodyName(r.answer)}</strong>
              <p>{factLine(r.answer)}</p>
            </div>
            <GameButton variant="primary" iconRight={ArrowRight} onClick={next} autoFocus>
              {idx + 1 >= total ? 'Ver resultado' : 'Siguiente enigma'}
            </GameButton>
          </div>
        )}
      </motion.section>
    </div>
  );
}
