// Examen POE (Predice → Observa → Explica). 10 preguntas generadas con
// semilla; la fase Observa ejecuta la simulación real con los parámetros del
// enunciado para que el alumno COMPRUEBE su predicción.
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight, FlaskConical, Lightbulb, Eye, Brain, GraduationCap, Flame, X, Check,
} from 'lucide-react';
import {
  GameHeader, Hud, HudStat, ProgressDots, Panel, AnswerOption, GameButton, RoundBanner,
} from '../../_shared/kit';
import SimViewport from './SimViewport';
import { GLOBAL_QUALITY_PARAMS } from '@/services/graphicsQuality';
import { simPorId, defaultsDe } from '../registry';
import { answerMatches, relError, parseStudentNumber, fmt } from '../engine/integrator';
import { puntosPregunta } from '../engine/exam';
import { temaDeSim, pickAmbience, NEUTRAL_AMBIENCE } from '../engine/ambiences';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];
const POE = [
  { icon: Lightbulb, label: 'Predice' },
  { icon: Eye, label: 'Observa' },
  { icon: Brain, label: 'Explica' },
];

export default function ExamScreen({ questions, tier, prefAuto, onAutoDowngrade, onProgress, onFinish, onAbandon }) {
  const [qIndex, setQIndex] = useState(0);
  const [phase, setPhase] = useState('predict'); // predict | observe | verdict | explain | explainFb
  const [answerText, setAnswerText] = useState('');
  const [answerChoice, setAnswerChoice] = useState(null);
  const [explChoice, setExplChoice] = useState(null);
  const [streak, setStreak] = useState(0);
  const resultsRef = useRef([]);
  const questionStartRef = useRef(performance.now());
  const observeDoneRef = useRef(false);
  const worldRef = useRef({ t: 0, _acc: 0, data: {} });

  const q = questions[qIndex];
  const sim = useMemo(() => simPorId(q.simId), [q.simId]);
  const simParams = useMemo(() => ({ ...defaultsDe(sim), ...q.simParams }), [sim, q]);
  // clima del entorno, estable por pregunta (semilla derivada del índice)
  const ambience = useMemo(
    () => (sim.entornoNeutro
      ? NEUTRAL_AMBIENCE
      : pickAmbience(temaDeSim(q.simId), ((qIndex * 2654435761) >>> 0) / 4294967296)),
    [sim, q.simId, qIndex],
  );
  const current = resultsRef.current[qIndex];

  // la fase Observa termina cuando la simulación acaba o cumple su duración
  const handleTelemetry = useCallback((tel) => {
    if (observeDoneRef.current) return;
    if (tel.done || tel.t >= (q.simDuracion || 4)) {
      observeDoneRef.current = true;
      // setState desde useFrame: fuera del render, es seguro
      setPhase((ph) => (ph === 'observe' ? 'verdict' : ph));
    }
  }, [q]);

  const comprobar = () => {
    const timeMs = performance.now() - questionStartRef.current;
    let predOk = false;
    let precision = false;
    let given = null;
    if (q.tipo === 'numerica') {
      given = parseStudentNumber(answerText);
      predOk = answerMatches(given, q.respuesta, q.toleranciaAbs ?? 0.05);
      precision = predOk && relError(given, q.respuesta) < 0.01;
    } else {
      given = answerChoice;
      predOk = answerChoice === q.correcta;
    }
    const newStreak = predOk ? streak + 1 : 0;
    setStreak(newStreak);
    resultsRef.current[qIndex] = {
      numero: q.numero,
      simIcono: q.simIcono,
      simNombre: q.simNombre,
      enunciado: q.enunciado,
      predOk,
      precision,
      given,
      timeMs,
      streakAt: newStreak,
      explOk: null,
    };
    onProgress?.(resultsRef.current.slice());
    // fase Observa: simulación desde cero
    observeDoneRef.current = false;
    worldRef.current = { t: 0, _acc: 0, data: {} };
    setPhase('observe');
  };

  const responderExplica = (i) => {
    setExplChoice(i);
    const r = resultsRef.current[qIndex];
    r.explOk = i === q.explica.correcta;
    r.puntos = puntosPregunta({
      predOk: r.predOk, explOk: r.explOk, timeMs: r.timeMs,
      precision: r.precision, streak: r.streakAt,
    });
    onProgress?.(resultsRef.current.slice());
    setPhase('explainFb');
  };

  const siguiente = () => {
    if (qIndex + 1 >= questions.length) {
      onFinish?.(resultsRef.current.slice());
      return;
    }
    setQIndex(qIndex + 1);
    setPhase('predict');
    setAnswerText('');
    setAnswerChoice(null);
    setExplChoice(null);
    questionStartRef.current = performance.now();
  };

  const SimScene = sim.Scene;
  const enObserva = phase === 'observe' || phase === 'verdict' || phase === 'explain' || phase === 'explainFb';
  // solo presentación: paso POE activo y resultado de cada predicción para los puntos
  const poeStep = phase === 'predict' ? 0 : (phase === 'observe' || phase === 'verdict') ? 1 : 2;
  const dotResults = questions.map((_, i) => resultsRef.current[i]?.predOk);
  const ultima = qIndex + 1 >= questions.length;

  return (
    <div className="fislab-exam">
      <GameHeader
        mode="exam"
        modeLabel="Examen"
        right={(
          <>
            <Hud>
              <HudStat icon={GraduationCap} tone="progress" value={`${qIndex + 1}/${questions.length}`} label="Pregunta" />
              {streak >= 2 && <HudStat icon={Flame} tone="streak" value={`×${streak}`} label="Racha" />}
            </Hud>
            <GameButton variant="danger" size="sm" icon={X} onClick={onAbandon}>Entregar</GameButton>
          </>
        )}
      />

      <ProgressDots total={questions.length} current={qIndex} results={dotResults} />

      <ol className="fislab-poe" aria-label="Paso de la pregunta">
        {POE.map((p, i) => (
          <li key={p.label} className={i < poeStep ? 'is-done' : i === poeStep ? 'is-current' : ''}>
            <span className="fislab-poe__ico">{i < poeStep ? <Check size={16} strokeWidth={3} /> : <p.icon size={16} />}</span>
            <strong>{p.label}</strong>
          </li>
        ))}
      </ol>

      <div className="fislab-exam__body">
        <motion.div
          key={`${qIndex}-enunciado`}
          className="fislab-exam__q"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Panel variant="surface" className="fislab-question">
            <span className="fislab-question__sim">
              <span className="fislab-question__emoji" aria-hidden="true">{q.simIcono}</span> {q.simNombre}
            </span>
            <p className="fislab-question__text">{q.enunciado}</p>

            {/* ---- fase PREDICE ---- */}
            {phase === 'predict' && (
              q.tipo === 'numerica' ? (
                <div className="fislab-answer">
                  <label className="fislab-answer__field">
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="Tu predicción…"
                      value={answerText}
                      autoFocus
                      aria-label="Tu predicción"
                      onChange={(e) => setAnswerText(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && answerText.trim()) comprobar(); }}
                    />
                    <span className="fislab-answer__unit">{q.unidad}</span>
                  </label>
                  <p className="fislab-answer__hint">Puedes usar coma o punto decimal.</p>
                  <GameButton
                    variant="primary"
                    size="lg"
                    icon={FlaskConical}
                    disabled={!answerText.trim() || Number.isNaN(parseStudentNumber(answerText))}
                    onClick={comprobar}
                  >
                    Comprobar con la simulación
                  </GameButton>
                </div>
              ) : (
                <div className="fislab-answer">
                  <div className="fislab-options">
                    {q.opciones.map((op, i) => (
                      <AnswerOption
                        key={op}
                        letter={LETTERS[i]}
                        state={answerChoice === i ? 'selected' : 'idle'}
                        onClick={() => setAnswerChoice(i)}
                      >
                        {op}
                      </AnswerOption>
                    ))}
                  </div>
                  <GameButton variant="primary" size="lg" icon={FlaskConical} disabled={answerChoice === null} onClick={comprobar}>
                    Comprobar con la simulación
                  </GameButton>
                </div>
              )
            )}

            {/* ---- veredicto tras Observa ---- */}
            {(phase === 'verdict' || phase === 'explain' || phase === 'explainFb') && current && (
              <RoundBanner
                show
                status={current.predOk ? 'won' : 'lost'}
                title={current.predOk ? '¡Predicción correcta!' : 'Predicción incorrecta'}
                subtitle={q.tipo === 'numerica'
                  ? <>Resultado: <strong>{fmt(q.respuesta, 2)} {q.unidad}</strong>{current.precision && ' · 🎯 ¡clavada! (+25)'}</>
                  : <>Respuesta: <strong>{q.opciones[q.correcta]}</strong></>}
                action={phase === 'verdict' ? () => setPhase('explain') : undefined}
                actionLabel="Continuar"
                actionIcon={ChevronRight}
              />
            )}

            {/* ---- fase EXPLICA ---- */}
            {(phase === 'explain' || phase === 'explainFb') && (
              <div className="fislab-explain">
                <h4><span className="fislab-explain__ico"><Brain size={16} /></span> Explica: {q.explica.pregunta}</h4>
                <div className="fislab-options">
                  {q.explica.opciones.map((op, i) => {
                    let state = 'idle';
                    let dim = false;
                    if (phase === 'explainFb') {
                      if (i === q.explica.correcta) state = 'correct';
                      else if (i === explChoice) state = 'wrong';
                      else dim = true;
                    }
                    return (
                      <AnswerOption
                        key={op}
                        letter={LETTERS[i]}
                        state={state}
                        className={dim ? 'is-dim' : ''}
                        disabled={phase === 'explainFb'}
                        onClick={() => responderExplica(i)}
                      >
                        {op}
                      </AnswerOption>
                    );
                  })}
                </div>
                {phase === 'explainFb' && (
                  <div className="fislab-next">
                    <GameButton variant="primary" size="lg" iconRight={ChevronRight} onClick={siguiente}>
                      {ultima ? 'Ver resultados' : 'Siguiente pregunta'}
                    </GameButton>
                  </div>
                )}
              </div>
            )}
          </Panel>
        </motion.div>

        {/* ---- fase OBSERVA: la simulación real con los datos del enunciado ---- */}
        <div className={`fislab-exam__stage ${enObserva ? '' : 'is-idle'}`}>
          {!enObserva && (
            <div className="fislab-standby" aria-hidden="true">
              <span className="fislab-standby__tile">{q.simIcono}</span>
              <strong>Laboratorio en espera</strong>
              <span>Haz tu predicción: al comprobarla, la simulación real se ejecutará aquí con los datos del enunciado.</span>
            </div>
          )}
          <AnimatePresence>
            {enObserva && (
              <motion.div
                className="fislab-exam-viewport"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <SimViewport
                  tier={tier}
                  prefAuto={prefAuto}
                  onAutoDowngrade={onAutoDowngrade}
                  camera={sim.camara}
                  controls={sim.controles}
                  ambience={ambience}
                  groundY={sim.entornoY}
                >
                  <SimScene
                    world={worldRef.current}
                    params={simParams}
                    playing={phase === 'observe'}
                    speed={1}
                    resetToken={qIndex}
                    showVectors
                    showTrajectory
                    quality={{ tier, particleBudget: GLOBAL_QUALITY_PARAMS[tier].particleBudget, shadows: GLOBAL_QUALITY_PARAMS[tier].shadows }}
                    onTelemetry={handleTelemetry}
                  />
                </SimViewport>
                {phase === 'observe' && (
                  <div className="fislab-exam-observing"><i aria-hidden="true" /><Eye size={15} /> Observa la simulación…</div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
