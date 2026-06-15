// Examen POE (Predice → Observa → Explica). 10 preguntas generadas con
// semilla; la fase Observa ejecuta la simulación real con los parámetros del
// enunciado para que el alumno COMPRUEBE su predicción.
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, ChevronRight, FlaskConical } from 'lucide-react';
import SimViewport from './SimViewport';
import { GLOBAL_QUALITY_PARAMS } from '@/services/graphicsQuality';
import { simPorId, defaultsDe } from '../registry';
import { answerMatches, relError, parseStudentNumber, fmt } from '../engine/integrator';
import { puntosPregunta } from '../engine/exam';
import { temaDeSim, pickAmbience } from '../engine/ambiences';

export default function ExamScreen({ questions, tier, prefAuto, onAutoDowngrade, onProgress, onFinish }) {
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
    () => pickAmbience(temaDeSim(q.simId), ((qIndex * 2654435761) >>> 0) / 4294967296),
    [q.simId, qIndex],
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

  return (
    <div className="fislab-exam">
      <div className="fislab-exam-header">
        <span className="fislab-exam-progress">Pregunta {qIndex + 1} / {questions.length}</span>
        <span className="fislab-exam-sim">{q.simIcono} {q.simNombre}</span>
        {streak >= 2 && <span className="fislab-exam-streak">🔥 racha ×{streak}</span>}
      </div>

      <div className="fislab-exam-body">
        <motion.div
          key={`${qIndex}-enunciado`}
          className="fislab-exam-question"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="fislab-exam-enunciado">{q.enunciado}</p>

          {/* ---- fase PREDICE ---- */}
          {phase === 'predict' && (
            q.tipo === 'numerica' ? (
              <div className="fislab-exam-answer">
                <div className="fislab-exam-input-row">
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="Tu predicción…"
                    value={answerText}
                    autoFocus
                    onChange={(e) => setAnswerText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && answerText.trim()) comprobar(); }}
                  />
                  <span className="fislab-exam-unit">{q.unidad}</span>
                </div>
                <p className="fislab-exam-hint-coma">Puedes usar coma o punto decimal.</p>
                <button
                  type="button"
                  className="fislab-btn-primary"
                  disabled={!answerText.trim() || Number.isNaN(parseStudentNumber(answerText))}
                  onClick={comprobar}
                >
                  <FlaskConical size={16} /> Comprobar con la simulación
                </button>
              </div>
            ) : (
              <div className="fislab-exam-options">
                {q.opciones.map((op, i) => (
                  <button
                    key={op}
                    type="button"
                    className={answerChoice === i ? 'selected' : ''}
                    onClick={() => setAnswerChoice(i)}
                  >
                    {op}
                  </button>
                ))}
                <button
                  type="button"
                  className="fislab-btn-primary"
                  disabled={answerChoice === null}
                  onClick={comprobar}
                >
                  <FlaskConical size={16} /> Comprobar con la simulación
                </button>
              </div>
            )
          )}

          {/* ---- veredicto tras Observa ---- */}
          {(phase === 'verdict' || phase === 'explain' || phase === 'explainFb') && current && (
            <div className={`fislab-exam-verdict ${current.predOk ? 'ok' : 'ko'}`}>
              {current.predOk ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
              <div>
                <strong>{current.predOk ? '¡Predicción correcta!' : 'Predicción incorrecta'}</strong>
                {q.tipo === 'numerica' && (
                  <span> Resultado: <strong>{fmt(q.respuesta, 2)} {q.unidad}</strong>
                    {current.precision && ' · 🎯 ¡clavada! (+25)'}
                  </span>
                )}
                {q.tipo === 'opciones' && (
                  <span> Respuesta: <strong>{q.opciones[q.correcta]}</strong></span>
                )}
              </div>
            </div>
          )}

          {phase === 'verdict' && (
            <button type="button" className="fislab-btn-primary" onClick={() => setPhase('explain')}>
              Continuar <ChevronRight size={16} />
            </button>
          )}

          {/* ---- fase EXPLICA ---- */}
          {(phase === 'explain' || phase === 'explainFb') && (
            <div className="fislab-exam-explica">
              <h4>🧠 Explica: {q.explica.pregunta}</h4>
              <div className="fislab-exam-options">
                {q.explica.opciones.map((op, i) => {
                  let cls = '';
                  if (phase === 'explainFb') {
                    if (i === q.explica.correcta) cls = 'right';
                    else if (i === explChoice) cls = 'wrong';
                  }
                  return (
                    <button
                      key={op}
                      type="button"
                      className={cls}
                      disabled={phase === 'explainFb'}
                      onClick={() => responderExplica(i)}
                    >
                      {op}
                    </button>
                  );
                })}
              </div>
              {phase === 'explainFb' && (
                <button type="button" className="fislab-btn-primary" onClick={siguiente}>
                  {qIndex + 1 >= questions.length ? 'Ver resultados' : 'Siguiente pregunta'} <ChevronRight size={16} />
                </button>
              )}
            </div>
          )}
        </motion.div>

        {/* ---- fase OBSERVA: la simulación real con los datos del enunciado ---- */}
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
              {phase === 'observe' && <div className="fislab-exam-observing">👀 Observa la simulación…</div>}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
