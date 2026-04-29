// src/apps/regla-de-tres/ReglaDeTres.jsx
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Calculator, RefreshCw, Check, X,
  Lightbulb, ChevronRight, Sparkles, LogOut, Eye, EyeOff,
} from 'lucide-react';
import InstructionsModal, { InstructionsButton } from '../_shared/InstructionsModal';
import { generateProblem, formatNumber, checkAnswer } from './problemGenerator';
import './ReglaDeTres.css';

const TOTAL_EXAM_QUESTIONS = 10;
const POINTS_PER_CORRECT = 100;
const MAX_SPEED_BONUS = 100;
const SPEED_BONUS_WINDOW_SEC = 30; // por pregunta

const DIFFICULTIES = [
  {
    id: 'easy',
    label: 'Fácil',
    icon: '🟢',
    desc: 'Solo regla de 3 directa. Resultados enteros.',
    helps: 'con ayudas',
  },
  {
    id: 'medium',
    label: 'Medio',
    icon: '🟡',
    desc: 'Directa e inversa. Resultados con hasta 1 decimal.',
    helps: 'con ayudas',
  },
  {
    id: 'exam',
    label: 'Examen',
    icon: '🔴',
    desc: '10 preguntas, sin ayudas. Resultados hasta 2 decimales.',
    helps: 'sin ayudas',
  },
];

// =============================================================
//  COMPONENTES DE AYUDA VISUAL
// =============================================================

// Diagrama SVG de la proporción con flechas estilizadas.
const ProportionDiagram = ({ problem, showRelation }) => {
  const { type, a1, b1, a2, a1Label, b1Label, unit } = problem;
  const directa = type === 'directa';

  return (
    <div className="r3-diagram-wrap">
      <svg
        viewBox="0 0 480 240"
        className="r3-diagram-svg"
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="r3-grad-known" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#818CF8" />
            <stop offset="1" stopColor="#4338CA" />
          </linearGradient>
          <linearGradient id="r3-grad-unknown" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#F472B6" />
            <stop offset="1" stopColor="#BE185D" />
          </linearGradient>
          <marker id="r3-arrow-head" viewBox="0 0 10 10" refX="9" refY="5"
                  markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 Z" fill="#64748B" />
          </marker>
          <marker id="r3-arrow-head-green" viewBox="0 0 10 10" refX="9" refY="5"
                  markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 Z" fill="#10B981" />
          </marker>
          <marker id="r3-arrow-head-red" viewBox="0 0 10 10" refX="9" refY="5"
                  markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 Z" fill="#EF4444" />
          </marker>
        </defs>

        {/* Cabeceras de columnas */}
        <text x="100" y="22" className="r3-svg-header" textAnchor="middle">{a1Label || 'A'}</text>
        <text x="380" y="22" className="r3-svg-header" textAnchor="middle">{b1Label || 'B'}</text>

        {/* Fila 1 (conocida): a1 → b1 */}
        <rect x="22" y="38" width="156" height="62" rx="14" fill="url(#r3-grad-known)" />
        <text x="100" y="78" className="r3-svg-value-light" textAnchor="middle">{formatNumber(a1)}</text>
        <text x="100" y="92" className="r3-svg-unit-light" textAnchor="middle">{a1Label || ''}</text>

        <line x1="186" y1="69" x2="290" y2="69" stroke="#64748B" strokeWidth="2" markerEnd="url(#r3-arrow-head)" />

        <rect x="302" y="38" width="156" height="62" rx="14" fill="url(#r3-grad-known)" />
        <text x="380" y="78" className="r3-svg-value-light" textAnchor="middle">{formatNumber(b1)}</text>
        <text x="380" y="92" className="r3-svg-unit-light" textAnchor="middle">{b1Label || ''}</text>

        {/* Flechas verticales (relación entre filas) — solo si showRelation */}
        {showRelation && (
          <>
            <line x1="100" y1="106" x2="100" y2="134" stroke="#10B981" strokeWidth="2.5" markerEnd="url(#r3-arrow-head-green)" />
            {directa ? (
              <line x1="380" y1="106" x2="380" y2="134" stroke="#10B981" strokeWidth="2.5" markerEnd="url(#r3-arrow-head-green)" />
            ) : (
              <line x1="380" y1="134" x2="380" y2="106" stroke="#EF4444" strokeWidth="2.5" markerEnd="url(#r3-arrow-head-red)" />
            )}
          </>
        )}

        {/* Fila 2 (desconocida): a2 → x */}
        <rect x="22" y="148" width="156" height="62" rx="14" fill="url(#r3-grad-unknown)" />
        <text x="100" y="188" className="r3-svg-value-light" textAnchor="middle">{formatNumber(a2)}</text>
        <text x="100" y="202" className="r3-svg-unit-light" textAnchor="middle">{a1Label || ''}</text>

        <line x1="186" y1="179" x2="290" y2="179" stroke="#64748B" strokeWidth="2" markerEnd="url(#r3-arrow-head)" />

        <rect x="302" y="148" width="156" height="62" rx="14"
              fill="rgba(255,255,255,0.85)"
              stroke="#9333EA" strokeWidth="2.5" strokeDasharray="6 4" />
        <text x="380" y="188" className="r3-svg-q" textAnchor="middle">x</text>
        <text x="380" y="204" className="r3-svg-unit-dark" textAnchor="middle">{unit}</text>

        {/* Etiqueta de relación */}
        {showRelation && (
          <text x="240" y="125" textAnchor="middle" className="r3-svg-relation-label" fill={directa ? '#047857' : '#B91C1C'}>
            {directa ? '↓ misma dirección (directa)' : '↑↓ direcciones opuestas (inversa)'}
          </text>
        )}
      </svg>
    </div>
  );
};

// Panel con la fórmula desarrollada — sin calcular el resultado.
const FormulaHint = ({ problem }) => {
  const { type, a1, b1, a2 } = problem;
  const directa = type === 'directa';
  const num = directa
    ? `${formatNumber(b1)} × ${formatNumber(a2)}`
    : `${formatNumber(a1)} × ${formatNumber(b1)}`;
  const den = directa ? formatNumber(a1) : formatNumber(a2);

  return (
    <div className="r3-formula-hint">
      <div className="r3-formula-title">
        <Lightbulb size={16} />
        <span>
          {directa
            ? 'Regla de 3 directa: multiplica en cruz y divide.'
            : 'Regla de 3 inversa: multiplica en línea y divide.'}
        </span>
      </div>
      <div className="r3-formula-row">
        <span className="r3-formula-x">x =</span>
        <div className="r3-fraction">
          <div className="r3-fraction-num">{num}</div>
          <div className="r3-fraction-bar" />
          <div className="r3-fraction-den">{den}</div>
        </div>
        <span className="r3-formula-equals">=</span>
        <div className="r3-formula-result">?</div>
      </div>
      <p className="r3-formula-tip">Haz tú la cuenta y escribe el resultado.</p>
    </div>
  );
};

// =============================================================

const ReglaDeTres = ({ onGameComplete }) => {
  // Params se mantienen por consistencia con otras apps; la app no depende del curso.
  useParams();

  const [phase, setPhase] = useState('setup'); // 'setup' | 'play' | 'finished'
  const [difficulty, setDifficulty] = useState('easy');
  const [problem, setProblem] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState(null); // 'correct' | 'incorrect' | null
  const [showInstructions, setShowInstructions] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  // Ayuda visual: en fácil siempre on, en medio toggleable (off por defecto), en examen siempre off
  const [showHelp, setShowHelp] = useState(true);

  // Estado del examen
  const [examIndex, setExamIndex] = useState(0);
  const [examCorrect, setExamCorrect] = useState(0);
  const [examPoints, setExamPoints] = useState(0);
  const [examHistory, setExamHistory] = useState([]);
  const examStartRef = useRef(null);
  const questionStartRef = useRef(null);
  const trackedRef = useRef(false);

  const isExam = difficulty === 'exam';

  // --- Iniciar partida ---
  const startGame = useCallback((diff) => {
    setDifficulty(diff);
    setPhase('play');
    setProblem(generateProblem(diff));
    setUserInput('');
    setFeedback(null);
    setExamIndex(0);
    setExamCorrect(0);
    setExamPoints(0);
    setExamHistory([]);
    trackedRef.current = false;
    // Ayuda visual: en fácil siempre on, en medio off por defecto, en examen off
    setShowHelp(diff === 'easy');
    if (diff === 'exam') {
      examStartRef.current = Date.now();
      questionStartRef.current = Date.now();
    }
  }, []);

  // --- Siguiente problema (práctica) ---
  const nextProblem = useCallback(() => {
    setProblem(generateProblem(difficulty));
    setUserInput('');
    setFeedback(null);
  }, [difficulty]);

  // --- Salir del examen entregándolo con la nota actual ---
  const handleExitExam = useCallback(() => {
    setShowExitModal(false);
    setPhase('finished');
  }, []);

  // --- Comprobar respuesta ---
  const handleCheck = useCallback(() => {
    if (!problem || feedback) return;
    const correct = checkAnswer(userInput, problem.answer);
    if (isExam) {
      const elapsedSec = questionStartRef.current
        ? (Date.now() - questionStartRef.current) / 1000
        : SPEED_BONUS_WINDOW_SEC;
      const speedBonus = Math.max(
        0,
        Math.round((1 - Math.min(elapsedSec, SPEED_BONUS_WINDOW_SEC) / SPEED_BONUS_WINDOW_SEC) * MAX_SPEED_BONUS)
      );
      const questionPoints = correct ? POINTS_PER_CORRECT + speedBonus : 0;

      setExamHistory((prev) => [
        ...prev,
        {
          text: problem.text,
          userAnswer: userInput,
          correctAnswer: problem.answer,
          unit: problem.unit,
          isCorrect: correct,
          elapsedSec: Math.round(elapsedSec * 10) / 10,
          points: questionPoints,
          type: problem.type,
        },
      ]);
      setExamCorrect((c) => c + (correct ? 1 : 0));
      setExamPoints((p) => p + questionPoints);

      // Avanzar inmediatamente
      if (examIndex + 1 >= TOTAL_EXAM_QUESTIONS) {
        setPhase('finished');
      } else {
        setExamIndex((i) => i + 1);
        setProblem(generateProblem(difficulty));
        setUserInput('');
        questionStartRef.current = Date.now();
      }
    } else {
      setFeedback(correct ? 'correct' : 'incorrect');
      if (correct) {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 }, colors: ['#10b981', '#34d399', '#059669'] });
      }
    }
  }, [problem, userInput, isExam, examIndex, difficulty, feedback]);

  // --- Tracking onGameComplete cuando termina el examen ---
  useEffect(() => {
    if (phase !== 'finished' || trackedRef.current) return;
    trackedRef.current = true;
    const elapsed = examStartRef.current
      ? Math.round((Date.now() - examStartRef.current) / 1000)
      : 0;
    onGameComplete?.({
      mode: 'test',
      score: examPoints,
      maxScore: TOTAL_EXAM_QUESTIONS * (POINTS_PER_CORRECT + MAX_SPEED_BONUS),
      correctAnswers: examCorrect,
      totalQuestions: TOTAL_EXAM_QUESTIONS,
      durationSeconds: elapsed,
    });
  }, [phase, examPoints, examCorrect, onGameComplete]);

  // --- Enter para validar ---
  useEffect(() => {
    const handler = (e) => {
      if (phase !== 'play') return;
      if (e.key === 'Enter') {
        e.preventDefault();
        if (feedback === 'correct' || feedback === 'incorrect') {
          if (!isExam) nextProblem();
        } else {
          handleCheck();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [phase, handleCheck, nextProblem, feedback, isExam]);

  // --- Render: SETUP ---
  if (phase === 'setup') {
    return (
      <div className="r3-root">
        <motion.div
          className="r3-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="r3-header">
            <div className="r3-title">
              <span className="r3-emoji">📐</span>
              <span>Regla de Tres</span>
              <InstructionsButton onClick={() => setShowInstructions(true)} />
            </div>
          </div>

          <p className="r3-intro">
            Aprende a resolver problemas de proporcionalidad <strong>directa</strong> e <strong>inversa</strong>.
            Elige la dificultad para empezar.
          </p>

          <div className="r3-difficulty-grid">
            {DIFFICULTIES.map((d) => (
              <motion.button
                key={d.id}
                className={`r3-difficulty-card r3-diff-${d.id}`}
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => startGame(d.id)}
              >
                <div className="r3-diff-icon">{d.icon}</div>
                <div className="r3-diff-label">{d.label}</div>
                <div className="r3-diff-desc">{d.desc}</div>
                <div className="r3-diff-helps">{d.helps}</div>
                <ChevronRight size={18} className="r3-diff-arrow" />
              </motion.button>
            ))}
          </div>
        </motion.div>

        <InstructionsModal
          isOpen={showInstructions}
          onClose={() => setShowInstructions(false)}
          title="Cómo jugar a Regla de Tres"
        >
          <h3>🎯 Objetivo</h3>
          <p>
            Resuelve problemas de proporcionalidad. Te dan una relación entre dos cantidades
            (por ejemplo, "4 kg de manzanas cuestan 8 €") y tienes que averiguar el valor que
            corresponde a otra cantidad ("¿cuánto cuestan 7 kg?").
          </p>

          <h3>🧮 Tipos de regla de tres</h3>
          <ul>
            <li>
              <strong>Directa</strong>: cuando una cantidad aumenta, la otra también
              (más kg → más €). Se calcula con <em>cruzar y multiplicar</em>:
              <p className="instr-formula"><strong>x</strong> = b₁ × a₂ / a₁</p>
            </li>
            <li>
              <strong>Inversa</strong>: cuando una cantidad aumenta, la otra disminuye
              (más obreros → menos horas). Se calcula con <em>multiplicar en línea</em>:
              <p className="instr-formula"><strong>x</strong> = a₁ × b₁ / a₂</p>
            </li>
          </ul>

          <h3>🕹️ Cómo se juega</h3>
          <ul>
            <li>Lee el enunciado y mira la tabla de proporciones.</li>
            <li>Calcula el resultado mentalmente o con papel y boli.</li>
            <li>Escribe el número (con coma o punto si es decimal) y pulsa <strong>Comprobar</strong> o <kbd>Enter</kbd>.</li>
          </ul>

          <h3>🎓 Niveles de dificultad</h3>
          <div className="instr-modes">
            <div className="instr-mode easy">
              <strong>🟢 Fácil</strong>
              Solo regla de 3 directa. Resultados enteros. Con ayudas (resolución paso a paso).
            </div>
            <div className="instr-mode medium">
              <strong>🟡 Medio</strong>
              Directa e inversa. Hasta 1 decimal. Con ayudas.
            </div>
            <div className="instr-mode exam">
              <strong>🔴 Examen</strong>
              {' '}{TOTAL_EXAM_QUESTIONS} preguntas. Hasta 2 decimales. Sin ayudas.
            </div>
          </div>

          <h3>📊 Nota y puntos en el examen</h3>
          <p>
            Tu nota va de <strong>0 a 10</strong>:
          </p>
          <p className="instr-formula">
            <strong>Nota</strong> = aciertos / {TOTAL_EXAM_QUESTIONS} × 10
          </p>
          <p>
            Además ganas <strong>puntos para el ranking</strong> en cada acierto. Cuanto más
            rápido respondas, más puntos:
          </p>
          <p className="instr-formula">
            <strong>Puntos</strong> = {POINTS_PER_CORRECT} + bonus de velocidad (hasta {MAX_SPEED_BONUS})
          </p>
          <p className="instr-note">
            Dos exámenes con un 10 pueden tener distinta puntuación: gana el ranking quien
            lo resuelva antes.
          </p>

          <div className="instr-tips">
            <strong>💡 Consejo:</strong> identifica primero si las magnitudes son
            <em> directamente</em> proporcionales (más → más) o <em>inversamente</em>
            proporcionales (más → menos). Te evitará errores típicos.
          </div>
        </InstructionsModal>
      </div>
    );
  }

  // --- Render: FINISHED (resumen examen) ---
  if (phase === 'finished') {
    const nota = Math.round((examCorrect / TOTAL_EXAM_QUESTIONS) * 100) / 10;
    const notaColor = nota >= 8 ? '#10b981' : nota >= 5 ? '#3b82f6' : '#ef4444';
    const notaMsg = nota >= 9 ? '¡Excelente! 🌟'
      : nota >= 7 ? '¡Muy bien!'
        : nota >= 5 ? 'Aprobado'
          : 'Necesitas repasar';
    const elapsed = examStartRef.current
      ? Math.round((Date.now() - examStartRef.current) / 1000)
      : 0;

    return (
      <div className="r3-root">
        <motion.div
          className="r3-card r3-result-card"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="r3-header">
            <div className="r3-title">
              <span className="r3-emoji">🏁</span>
              <span>Examen finalizado</span>
            </div>
          </div>

          <div className="r3-result-hero">
            <div className="r3-nota-block" style={{ borderColor: notaColor }}>
              <div className="r3-nota-label">Tu nota</div>
              <div className="r3-nota-value" style={{ color: notaColor }}>
                {nota.toFixed(1)}<span className="r3-nota-max">/10</span>
              </div>
              <div className="r3-nota-msg" style={{ color: notaColor }}>{notaMsg}</div>
            </div>
            <div className="r3-stats-block">
              <div className="r3-stat">
                <span className="r3-stat-label">Aciertos</span>
                <span className="r3-stat-value">{examCorrect} / {TOTAL_EXAM_QUESTIONS}</span>
              </div>
              <div className="r3-stat">
                <span className="r3-stat-label">Puntos</span>
                <span className="r3-stat-value">{examPoints}</span>
              </div>
              <div className="r3-stat">
                <span className="r3-stat-label">Tiempo</span>
                <span className="r3-stat-value">{elapsed}s</span>
              </div>
            </div>
          </div>

          <div className="r3-history">
            {examHistory.map((it, idx) => (
              <div key={idx} className={`r3-history-item ${it.isCorrect ? 'correct' : 'incorrect'}`}>
                <div className="r3-history-head">
                  <span className="r3-history-num">P{idx + 1}</span>
                  <span className={`r3-history-type ${it.type}`}>{it.type}</span>
                  {it.isCorrect ? (
                    <span className="r3-history-result correct">
                      <Check size={14} /> +{it.points} pts ({it.elapsedSec}s)
                    </span>
                  ) : (
                    <span className="r3-history-result incorrect">
                      <X size={14} /> Era {formatNumber(it.correctAnswer)} {it.unit}
                    </span>
                  )}
                </div>
                <div className="r3-history-text">{it.text}</div>
                {!it.isCorrect && (
                  <div className="r3-history-user">
                    Tu respuesta: <strong>{it.userAnswer || '—'}</strong>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="r3-result-actions">
            <button className="r3-btn primary" onClick={() => startGame('exam')}>
              <RefreshCw size={16} /> Repetir examen
            </button>
            <button className="r3-btn ghost" onClick={() => setPhase('setup')}>
              Cambiar dificultad
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // --- Render: PLAY ---
  const diffMeta = DIFFICULTIES.find((d) => d.id === difficulty);

  return (
    <div className="r3-root">
      <motion.div
        className="r3-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="r3-header">
          <div className="r3-title">
            <span className="r3-emoji">📐</span>
            <span>Regla de Tres</span>
            <InstructionsButton onClick={() => setShowInstructions(true)} />
          </div>
          <div className="r3-stats">
            <span className={`r3-badge r3-badge-${difficulty}`}>
              {diffMeta?.icon} {diffMeta?.label}
            </span>
            {problem?.type && (
              <span className={`r3-badge r3-tag-${problem.type}`}>
                {problem.type === 'directa' ? '↗ directa' : '↘ inversa'}
              </span>
            )}
            {isExam && (
              <span className="r3-badge r3-badge-progress">
                {examIndex + 1} / {TOTAL_EXAM_QUESTIONS}
              </span>
            )}
            {difficulty === 'medium' && (
              <button
                type="button"
                className={`r3-help-toggle ${showHelp ? 'on' : ''}`}
                onClick={() => setShowHelp((s) => !s)}
                title={showHelp ? 'Ocultar ayuda' : 'Mostrar ayuda'}
                aria-pressed={showHelp}
              >
                {showHelp ? <Eye size={14} /> : <EyeOff size={14} />}
                <span>{showHelp ? 'Ayuda activa' : 'Ayuda'}</span>
              </button>
            )}
          </div>
        </div>

        {isExam && (
          <div className="r3-progress-bar">
            <div
              className="r3-progress-fill"
              style={{ width: `${((examIndex) / TOTAL_EXAM_QUESTIONS) * 100}%` }}
            />
          </div>
        )}

        {problem && (
          <>
            <div className="r3-problem-text">
              <Calculator size={20} className="r3-problem-icon" />
              <p>{problem.text}</p>
            </div>

            <ProportionDiagram problem={problem} showRelation={showHelp && !isExam} />

            {showHelp && !isExam && (
              <FormulaHint problem={problem} />
            )}

            <div className="r3-input-row">
              <label className="r3-input-label">Tu respuesta:</label>
              <div className="r3-input-wrap">
                <input
                  type="text"
                  inputMode="decimal"
                  className={`r3-input ${feedback === 'correct' ? 'correct' : feedback === 'incorrect' ? 'incorrect' : ''}`}
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="?"
                  autoFocus
                  disabled={feedback !== null && !isExam}
                />
                <span className="r3-input-unit">{problem.unit}</span>
              </div>
            </div>

            {feedback && !isExam && (
              <motion.div
                className={`r3-feedback ${feedback}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {feedback === 'correct' ? (
                  <>
                    <Check size={20} /> ¡Correcto! La respuesta es <strong>{formatNumber(problem.answer)} {problem.unit}</strong>.
                  </>
                ) : (
                  <>
                    <X size={20} /> No es correcto. La respuesta era <strong>{formatNumber(problem.answer)} {problem.unit}</strong>.
                  </>
                )}
              </motion.div>
            )}

            {!isExam && feedback === 'incorrect' && (
              <motion.div className="r3-explanation" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Lightbulb size={16} className="r3-explanation-icon" />
                <div>
                  <p><strong>Cómo se resuelve ({problem.type}):</strong></p>
                  {problem.type === 'directa' ? (
                    <p>x = {formatNumber(problem.b1)} × {formatNumber(problem.a2)} ÷ {formatNumber(problem.a1)} = <strong>{formatNumber(problem.answer)}</strong></p>
                  ) : (
                    <p>x = {formatNumber(problem.a1)} × {formatNumber(problem.b1)} ÷ {formatNumber(problem.a2)} = <strong>{formatNumber(problem.answer)}</strong></p>
                  )}
                </div>
              </motion.div>
            )}

            <div className="r3-actions">
              {feedback === null || isExam ? (
                <button
                  className="r3-btn primary"
                  onClick={handleCheck}
                  disabled={!userInput.trim()}
                >
                  <Check size={16} /> {isExam ? (examIndex + 1 >= TOTAL_EXAM_QUESTIONS ? 'Finalizar' : 'Siguiente') : 'Comprobar'}
                </button>
              ) : (
                <button className="r3-btn primary" onClick={nextProblem}>
                  <Sparkles size={16} /> Otro problema
                </button>
              )}

              {!isExam && feedback === null && (
                <button className="r3-btn ghost" onClick={nextProblem} title="Generar otro problema">
                  <RefreshCw size={16} /> Otro problema
                </button>
              )}

              {!isExam && (
                <button className="r3-btn ghost" onClick={() => setPhase('setup')}>
                  Cambiar dificultad
                </button>
              )}

              {isExam && (
                <button
                  className="r3-btn danger"
                  onClick={() => setShowExitModal(true)}
                  title="Entregar el examen con tu nota actual"
                >
                  <LogOut size={16} /> Salir del examen
                </button>
              )}
            </div>
          </>
        )}
      </motion.div>

      <InstructionsModal
        isOpen={showInstructions}
        onClose={() => setShowInstructions(false)}
        title="Cómo jugar a Regla de Tres"
      >
        <h3>🎯 Objetivo</h3>
        <p>
          Resuelve problemas de proporcionalidad <strong>directa</strong> (más → más) o
          <strong> inversa</strong> (más → menos).
        </p>

        <h3>🧮 Fórmulas</h3>
        <p className="instr-formula"><strong>Directa</strong>: x = b₁ × a₂ / a₁</p>
        <p className="instr-formula"><strong>Inversa</strong>: x = a₁ × b₁ / a₂</p>

        <h3>🕹️ Controles</h3>
        <ul>
          <li>Escribe el resultado (con coma o punto para decimales).</li>
          <li><kbd>Enter</kbd> = comprobar / siguiente.</li>
          <li>En práctica, <strong>Otro problema</strong> genera un enunciado nuevo.</li>
          <li>En examen, <strong>Salir del examen</strong> entrega con tu nota actual.</li>
        </ul>

        <h3>📊 Nota y puntos</h3>
        <p className="instr-formula"><strong>Nota</strong> = aciertos / {TOTAL_EXAM_QUESTIONS} × 10</p>
        <p className="instr-formula"><strong>Puntos</strong> = {POINTS_PER_CORRECT} + bonus de velocidad (hasta {MAX_SPEED_BONUS}) por acierto</p>
      </InstructionsModal>

      <AnimatePresence>
        {showExitModal && (
          <motion.div
            className="r3-exit-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowExitModal(false)}
          >
            <motion.div
              className="r3-exit-modal"
              initial={{ scale: 0.88, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.88, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="r3-exit-icon"><LogOut size={32} /></div>
              <h3 className="r3-exit-title">¿Salir del examen?</h3>
              <p className="r3-exit-text">
                Llevas <strong>{examCorrect} de {examIndex}</strong> respuestas correctas.<br />
                Si sales ahora, tu nota será <strong>{((examCorrect / TOTAL_EXAM_QUESTIONS) * 10).toFixed(1)}/10</strong>
                {' '}y se guardará el intento.
              </p>
              <div className="r3-exit-actions">
                <button className="r3-btn ghost" onClick={() => setShowExitModal(false)}>
                  Cancelar
                </button>
                <button className="r3-btn danger" onClick={handleExitExam}>
                  <LogOut size={16} /> Salir y guardar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReglaDeTres;
