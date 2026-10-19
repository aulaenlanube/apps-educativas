// src/apps/sistema-solar/ui/LayersMission.jsx
// «Viaje al interior»: el astro aparece abierto con las capas separadas y
// numeradas (sin nombres). El alumno toca la capa que se pide (por su nombre
// o, en cursos altos, por una descripción). Una respuesta por capa; después
// se ilumina la correcta y se explica.
// La escena 3D la pinta SistemaSolar con lo que esta misión pide (onScene);
// los toques vuelven como pickEvent. Registro: onComplete UNA vez (doneRef).
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Check, X, Layers, Hand } from 'lucide-react';
import { GameButton, FeedbackItem } from '../../_shared/kit';
import { bodyName } from '../model/planetFacts';
import { INTERIORS, layersFor } from '../model/interiors';
import { makeLayerQuestions } from '../model/questions';
import { SPEED_LIMIT } from '../model/missions';
import { mulberry32, randomSeed } from '../model/rng';
import { missionResult, buildPayload, speedBonus, streakBonus, STREAK_CAP } from '../missionScoring';
import { MissionTopBar, MissionResults } from './MissionFrame';

const SPEED_MAX = 50;

export default function LayersMission({ mission, stage, pickEvent, onScene, onComplete, onExit, onRestart, onHub, onExplore, outcome }) {
  const seed = useMemo(() => randomSeed(), []);
  const questions = useMemo(() => makeLayerQuestions(stage, mulberry32(seed)), [stage, seed]);
  const total = questions.length;
  const limit = SPEED_LIMIT.capas;

  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState(null);
  const [results, setResults] = useState([]);
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [summary, setSummary] = useState(null);

  const startRef = useRef(Date.now());
  const qStart = useRef(Date.now());
  const bonusRef = useRef(0);
  const doneRef = useRef(false);
  const lastSeq = useRef(pickEvent?.seq ?? 0);
  const q = questions[idx];
  const revealed = picked != null;
  const layers = layersFor(q.bodyId, stage);
  const answerLayer = layers.find((l) => l.id === q.answer);
  const pickedLayer = layers.find((l) => l.id === picked);

  // Lo que debe mostrar la escena
  useEffect(() => {
    if (summary) return;
    const feedback = revealed ? { [q.answer]: 1, ...(picked !== q.answer ? { [picked]: -1 } : {}) } : null;
    onScene?.({ bodyId: q.bodyId, selected: revealed ? q.answer : null, feedback, markerMode: revealed ? 'names' : 'numbers' });
  }, [q, picked, revealed, summary]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { qStart.current = Date.now(); }, [idx]);

  useEffect(() => {
    if (!pickEvent || pickEvent.seq === lastSeq.current) return;
    lastSeq.current = pickEvent.seq;
    if (revealed || summary) return;
    const ok = pickEvent.id === q.answer;
    const nextStreak = ok ? streak + 1 : 0;
    const bonus = ok ? speedBonus((Date.now() - qStart.current) / 1000, limit, SPEED_MAX) + streakBonus(nextStreak) : 0;
    bonusRef.current += bonus;
    setPicked(pickEvent.id);
    setResults((r) => [...r, ok]);
    setStreak(nextStreak);
    setPoints((p) => p + (ok ? 100 + bonus : 0));
  }, [pickEvent]); // eslint-disable-line react-hooks/exhaustive-deps

  const next = () => {
    if (idx + 1 >= total) {
      if (doneRef.current) return;
      doneRef.current = true;
      const durationSeconds = (Date.now() - startRef.current) / 1000;
      const correct = results.filter(Boolean).length;
      const result = missionResult({ correct, total, bonus: bonusRef.current, bonusMax: total * (SPEED_MAX + STREAK_CAP) });
      setSummary({ result, durationSeconds });
      onComplete?.(buildPayload(result, durationSeconds), result);
      return;
    }
    setIdx((i) => i + 1);
    setPicked(null);
  };

  if (summary) {
    return (
      <div className="ssq-overlay">
        <MissionResults mission={mission} result={summary.result} durationSeconds={summary.durationSeconds} outcome={outcome} onRestart={onRestart} onHub={onHub} onExplore={onExplore}>
          {questions.map((qq, i) => (
            <FeedbackItem key={qq.id} index={i + 1} ok={results[i]} title={`${bodyName(qq.bodyId)} · ${qq.name}`}>
              {qq.byClue ? `«${qq.prompt}» ` : ''}{qq.explain}
            </FeedbackItem>
          ))}
        </MissionResults>
      </div>
    );
  }

  const ok = results[idx];
  return (
    <div className="ssl-hud" style={{ '--mt': mission.tone }}>
      <MissionTopBar mission={mission} label={`${INTERIORS[q.bodyId].title} · capa ${idx + 1} de ${total}`} index={idx} total={total} results={results} points={points} streak={streak} onExit={onExit} compact />
      <section key={q.id} className={`ssl-card ${revealed ? (ok ? 'is-ok' : 'is-ko') : ''}`}>
        <header className="ssl-card__head">
          <span className="ssl-card__icon"><Layers size={20} /></span>
          <div>
            <span className="ssl-card__kicker">{q.byClue ? 'Toca la capa que corresponde a…' : 'Toca en el modelo 3D la capa:'}</span>
            <strong className={q.byClue ? 'is-clue' : ''}>{q.byClue ? `«${q.prompt}»` : q.name}</strong>
          </div>
        </header>
        {!revealed && (
          <p className="ssl-hint"><Hand size={15} /> Gira el modelo arrastrando. Puedes tocar la capa o su número.</p>
        )}
        {revealed && (
          <div className="ssl-answer">
            <span className={`ssl-answer__tag ${ok ? 'is-ok' : 'is-ko'}`}>
              {ok ? <><Check size={14} strokeWidth={3} /> ¡Correcto!</> : <><X size={14} strokeWidth={3} /> Tocaste: {pickedLayer?.name}</>}
            </span>
            <strong style={{ '--lc': answerLayer?.color }}>{answerLayer?.name}</strong>
            <p>{q.explain}</p>
            <dl className="ssl-answer__facts">
              {answerLayer?.state && <><dt>Estado</dt><dd>{answerLayer.state}</dd></>}
              {answerLayer?.temp && <><dt>Temperatura</dt><dd>{answerLayer.temp}</dd></>}
            </dl>
            <GameButton variant={ok ? 'success' : 'primary'} iconRight={ArrowRight} onClick={next} autoFocus>
              {idx + 1 >= total ? 'Ver resultado' : 'Siguiente capa'}
            </GameButton>
          </div>
        )}
      </section>
    </div>
  );
}
