// src/apps/regla-de-tres/ReglaDeTres.jsx
// Rediseño 2026 sobre el kit de interfaz de juego (_shared/kit). La lógica de
// partida (generador, comprobación, puntos, nota y onGameComplete) no cambia.
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Calculator, RefreshCw, Check, X, Lightbulb, Sparkles, LogOut, Eye, EyeOff,
  LayoutGrid, TrendingUp, ArrowDownUp, Target, Clock, GraduationCap, Flame, Sprout, Trophy,
} from 'lucide-react';
import InstructionsModal from '../_shared/InstructionsModal';
import {
  GameShell, GameHeader, Hud, HudStat, Panel, GameButton, ModeSelect, RoundBanner,
  ResultsScreen, FeedbackItem,
} from '../_shared/kit';
import { generateProblem, formatNumber, checkAnswer } from './problemGenerator';
import './ReglaDeTres.css';

const TOTAL_EXAM_QUESTIONS = 10;
const POINTS_PER_CORRECT = 100;
const MAX_SPEED_BONUS = 100;
const SPEED_BONUS_WINDOW_SEC = 30; // por pregunta

// Tarjetas de la pantalla previa (los ids son los valores internos de siempre)
const MODES = [
  {
    id: 'easy', tone: 'easy', icon: Sprout, title: 'Fácil',
    desc: 'Solo regla de tres directa: más cantidad, más resultado.',
    features: ['Resultados enteros', 'Tabla con flechas y fórmula'],
  },
  {
    id: 'medium', tone: 'medium', icon: Flame, title: 'Medio',
    desc: 'Directa e inversa mezcladas: decide tú cuál es.',
    features: ['Hasta 1 decimal', 'Ayuda visual opcional'],
  },
  {
    id: 'exam', tone: 'exam', icon: GraduationCap, title: 'Examen',
    desc: `${TOTAL_EXAM_QUESTIONS} preguntas, sin ayudas.`,
    features: ['Hasta 2 decimales', 'Nota /10 y puntos por rapidez'],
  },
];

const TYPE_INFO = {
  directa: { label: 'Directa', icon: TrendingUp, hint: 'más → más' },
  inversa: { label: 'Inversa', icon: ArrowDownUp, hint: 'más → menos' },
};

// =============================================================
//  TABLERO DE LA PROPORCIÓN
// =============================================================

// Ficha con volumen: canto, cara con degradado y brillo.
const Tile = ({ x, y, w = 160, h = 66, tone, value, unit }) => (
  <g className={`r3-tile r3-tile--${tone}`}>
    <rect x={x} y={y + 5} width={w} height={h} rx="16" className="r3-tile__edge" />
    <rect x={x} y={y} width={w} height={h} rx="16" fill={`url(#r3-face-${tone})`} />
    <rect x={x + 10} y={y + 5} width={w * 0.45} height="7" rx="3.5" fill="#fff" opacity=".35" />
    <text x={x + w / 2} y={y + (unit ? 39 : 44)} textAnchor="middle" className="r3-tile__value">{value}</text>
    {unit && <text x={x + w / 2} y={y + 56} textAnchor="middle" className="r3-tile__unit">{unit}</text>}
  </g>
);

// Cabecera de columna (magnitud).
const HeadPill = ({ cx, label }) => {
  const w = Math.max(56, String(label).length * 8.4 + 26);
  return (
    <g className="r3-head">
      <rect x={cx - w / 2} y="8" width={w} height="26" rx="13" />
      <text x={cx} y="26" textAnchor="middle">{label}</text>
    </g>
  );
};

// Diagrama de la proporción: dos magnitudes (columnas) y dos situaciones (filas).
// Con la ayuda activa muestra el sentido de la relación y qué se multiplica y
// entre qué se divide; tras comprobar revela el valor de x.
const ProportionBoard = ({ problem, showRelation, reveal }) => {
  const { type, a1, b1, a2, a1Label, b1Label, unit } = problem;
  const directa = type === 'directa';
  const L = 30;   // columna izquierda
  const R = 290;  // columna derecha
  const T1 = 56;  // fila conocida
  const T2 = 170; // fila con la incógnita
  const W = 160;
  const H = 66;
  const xTone = reveal === 'correct' ? 'good' : reveal === 'incorrect' ? 'bad' : null;

  return (
    <svg viewBox="0 0 480 252" className="r3-board__svg" role="img"
      aria-label={`${formatNumber(a1)} ${a1Label || ''} → ${formatNumber(b1)} ${b1Label || ''}; ${formatNumber(a2)} ${a1Label || ''} → x ${unit}`}>
      <defs>
        <linearGradient id="r3-face-known" x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0" stopColor="#a5b4fc" />
          <stop offset=".5" stopColor="#6366f1" />
          <stop offset="1" stopColor="#4338ca" />
        </linearGradient>
        <linearGradient id="r3-face-ask" x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0" stopColor="#f9a8d4" />
          <stop offset=".5" stopColor="#ec4899" />
          <stop offset="1" stopColor="#be185d" />
        </linearGradient>
        <linearGradient id="r3-face-good" x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0" stopColor="#6ee7b7" />
          <stop offset=".5" stopColor="#10b981" />
          <stop offset="1" stopColor="#047857" />
        </linearGradient>
        <linearGradient id="r3-face-bad" x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0" stopColor="#fda4af" />
          <stop offset=".5" stopColor="#f43f5e" />
          <stop offset="1" stopColor="#be123c" />
        </linearGradient>
        <marker id="r3-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 Z" className="r3-svg-arrowhead" />
        </marker>
        <marker id="r3-arrow-good" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 Z" fill="#10b981" />
        </marker>
        <marker id="r3-arrow-bad" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 Z" fill="#f97316" />
        </marker>
      </defs>

      <HeadPill cx={L + W / 2} label={a1Label || 'A'} />
      <HeadPill cx={R + W / 2} label={b1Label || 'B'} />

      {/* Flechas de cada fila: una cantidad "corresponde" a la otra */}
      <line x1={L + W + 10} y1={T1 + H / 2} x2={R - 12} y2={T1 + H / 2} className="r3-svg-arrow" markerEnd="url(#r3-arrow)" />
      <line x1={L + W + 10} y1={T2 + H / 2} x2={R - 12} y2={T2 + H / 2} className="r3-svg-arrow" markerEnd="url(#r3-arrow)" />

      {/* Ayuda: qué se multiplica */}
      {showRelation && (directa ? (
        <g className="r3-mult">
          <line x1={R + 8} y1={T1 + H - 4} x2={L + W - 8} y2={T2 + 4} />
          <g className="r3-badge r3-badge--mult" transform={`translate(${(L + W + R) / 2} ${(T1 + H + T2) / 2})`}>
            <circle r="13" />
            <text y="5" textAnchor="middle">×</text>
          </g>
        </g>
      ) : (
        <g className="r3-mult">
          <path d={`M ${L + W / 2 + 30} ${T1 - 2} Q 240 ${T1 - 34} ${R + W / 2 - 30} ${T1 - 2}`} />
          <g className="r3-badge r3-badge--mult" transform={`translate(240 ${T1 - 18})`}>
            <circle r="13" />
            <text y="5" textAnchor="middle">×</text>
          </g>
        </g>
      ))}

      <Tile x={L} y={T1} w={W} h={H} tone="known" value={formatNumber(a1)} unit={a1Label} />
      <Tile x={R} y={T1} w={W} h={H} tone="known" value={formatNumber(b1)} unit={b1Label} />
      <Tile x={L} y={T2} w={W} h={H} tone="ask" value={formatNumber(a2)} unit={a1Label} />

      {/* La incógnita: hueco punteado o, tras comprobar, el valor correcto */}
      {xTone ? (
        <g className="r3-reveal">
          <Tile x={R} y={T2} w={W} h={H} tone={xTone} value={formatNumber(problem.answer)} unit={unit} />
        </g>
      ) : (
        <g className="r3-slot">
          <rect x={R} y={T2} width={W} height={H} rx="16" className="r3-slot__box" />
          <text x={R + W / 2} y={T2 + 41} textAnchor="middle" className="r3-slot__x">x</text>
          <text x={R + W / 2} y={T2 + 58} textAnchor="middle" className="r3-slot__unit">{unit}</text>
        </g>
      )}

      {/* Ayuda: sentido de la relación entre filas */}
      {showRelation && (
        <>
          <line x1={L + W / 2} y1={T1 + H + 10} x2={L + W / 2} y2={T2 - 8} stroke="#10b981" strokeWidth="3" strokeLinecap="round" markerEnd="url(#r3-arrow-good)" />
          {directa ? (
            <line x1={R + W / 2} y1={T1 + H + 10} x2={R + W / 2} y2={T2 - 8} stroke="#10b981" strokeWidth="3" strokeLinecap="round" markerEnd="url(#r3-arrow-good)" />
          ) : (
            <line x1={R + W / 2} y1={T2 - 8} x2={R + W / 2} y2={T1 + H + 10} stroke="#f97316" strokeWidth="3" strokeLinecap="round" markerEnd="url(#r3-arrow-bad)" />
          )}
          {/* Divisor */}
          <g className="r3-badge r3-badge--div" transform={`translate(${L + W - 4} ${directa ? T1 + 2 : T2 + 2})`}>
            <circle r="12" />
            <rect x="-6" y="-1.3" width="12" height="2.6" rx="1.3" fill="#fff" />
            <circle cy="-5" r="1.9" fill="#fff" stroke="none" />
            <circle cy="5" r="1.9" fill="#fff" stroke="none" />
          </g>
        </>
      )}
    </svg>
  );
};

// Pantalla con la fórmula desarrollada — sin calcular el resultado.
const FormulaHint = ({ problem }) => {
  const { type, a1, b1, a2 } = problem;
  const directa = type === 'directa';
  const num = directa
    ? `${formatNumber(b1)} × ${formatNumber(a2)}`
    : `${formatNumber(a1)} × ${formatNumber(b1)}`;
  const den = directa ? formatNumber(a1) : formatNumber(a2);

  return (
    <Panel variant="screen" className="r3-formula">
      <div className="r3-formula__title">
        <span className="r3-formula__bulb"><Lightbulb size={15} /></span>
        <span>
          {directa
            ? 'Regla de 3 directa: multiplica en cruz y divide.'
            : 'Regla de 3 inversa: multiplica en línea y divide.'}
        </span>
      </div>
      <div className="r3-formula__row">
        <span className="r3-formula__x">x =</span>
        <span className="r3-frac">
          <span className="r3-frac__num">{num}</span>
          <span className="r3-frac__bar" />
          <span className="r3-frac__den">{den}</span>
        </span>
        <span className="r3-formula__eq">=</span>
        <span className="r3-formula__q">?</span>
      </div>
      <p className="r3-formula__tip">Haz tú la cuenta y escribe el resultado.</p>
    </Panel>
  );
};

// Progreso del examen: un tramo por pregunta (sin revelar aciertos)
const ExamSteps = ({ total, current }) => (
  <div className="r3-steps" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={current}>
    {Array.from({ length: total }).map((_, i) => (
      <span key={i} className={`r3-steps__seg ${i < current ? 'is-done' : i === current ? 'is-current' : ''}`} />
    ))}
  </div>
);

// Confirmación propia para entregar el examen antes de tiempo
const ExitModal = ({ open, correct, answered, onCancel, onConfirm }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        className="r3-modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
      >
        <motion.div
          className="r3-modal__card"
          role="dialog"
          aria-modal="true"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
        >
          <span className="r3-modal__icon"><LogOut size={28} /></span>
          <h3>¿Salir del examen?</h3>
          <p>
            Llevas <strong>{correct} de {answered}</strong> respuestas correctas.<br />
            Si sales ahora, tu nota será <strong>{((correct / TOTAL_EXAM_QUESTIONS) * 10).toFixed(1)}/10</strong>
            {' '}y se guardará el intento.
          </p>
          <div className="r3-modal__actions">
            <GameButton variant="soft" onClick={onCancel}>Cancelar</GameButton>
            <GameButton variant="danger" icon={LogOut} onClick={onConfirm}>Salir y guardar</GameButton>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const SHELL = { accent: '#6366f1', accent2: '#ec4899', className: 'r3' };

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
  // Marcador de la práctica (solo visual, no se registra)
  const [practiceStats, setPracticeStats] = useState({ ok: 0, streak: 0 });
  const inputRef = useRef(null);

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
    setPracticeStats({ ok: 0, streak: 0 });
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
      setPracticeStats((s) => (correct ? { ok: s.ok + 1, streak: s.streak + 1 } : { ...s, streak: 0 }));
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

  // Devuelve el foco a la pantalla de respuesta con cada problema nuevo (solo UX)
  useEffect(() => {
    if (phase === 'play' && !feedback) inputRef.current?.focus();
  }, [phase, problem, feedback]);

  const instructions = (
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
        <li>En práctica, <strong>Otro problema</strong> genera un enunciado nuevo.</li>
        <li>En examen, <strong>Salir del examen</strong> entrega con tu nota actual.</li>
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
  );

  // --- Render: SETUP ---
  if (phase === 'setup') {
    return (
      <GameShell {...SHELL}>
        <ModeSelect
          modes={MODES}
          onSelect={startGame}
          onHelp={() => setShowInstructions(true)}
          extra={(
            <div className="r3-kinds">
              {Object.entries(TYPE_INFO).map(([id, info]) => (
                <span key={id} className={`r3-kind r3-kind--${id}`}>
                  <span className="r3-kind__icon"><info.icon size={16} /></span>
                  <span><strong>{info.label}</strong> {info.hint}</span>
                </span>
              ))}
            </div>
          )}
        />
        {instructions}
      </GameShell>
    );
  }

  // --- Render: FINISHED (resumen examen) ---
  if (phase === 'finished') {
    const nota = Math.round((examCorrect / TOTAL_EXAM_QUESTIONS) * 100) / 10;
    const elapsed = examStartRef.current
      ? Math.round((Date.now() - examStartRef.current) / 1000)
      : 0;

    return (
      <GameShell {...SHELL}>
        <ResultsScreen
          nota={nota}
          points={examPoints}
          stats={[
            { icon: Target, tone: 'good', label: 'Aciertos', value: `${examCorrect}/${TOTAL_EXAM_QUESTIONS}` },
            { icon: Clock, tone: 'time', label: 'Tiempo', value: `${elapsed}s` },
            { icon: Trophy, tone: 'streak', label: 'Respondidas', value: `${examHistory.length}/${TOTAL_EXAM_QUESTIONS}` },
          ]}
          actions={[
            { label: 'Repetir examen', onClick: () => startGame('exam'), icon: RefreshCw },
            { label: 'Cambiar dificultad', onClick: () => setPhase('setup'), icon: LayoutGrid, variant: 'soft' },
          ]}
        >
          {examHistory.map((it, idx) => (
            <FeedbackItem key={idx} index={idx + 1} ok={it.isCorrect} title={`Regla de tres ${it.type}`}>
              <span className="r3-fb__text">{it.text}</span>
              <span className="r3-fb__line">
                {it.isCorrect ? (
                  <span className="r3-fb__pill is-ok"><Sparkles size={12} /> +{it.points} pts · {it.elapsedSec}s</span>
                ) : (
                  <>
                    <span className="r3-fb__pill is-ko">Tu respuesta: {it.userAnswer || '—'}</span>
                    <span className="r3-fb__pill is-sol">Era {formatNumber(it.correctAnswer)} {it.unit}</span>
                  </>
                )}
              </span>
            </FeedbackItem>
          ))}
        </ResultsScreen>
      </GameShell>
    );
  }

  // --- Render: PLAY ---
  const helpVisible = showHelp && !isExam;
  const typeInfo = problem ? TYPE_INFO[problem.type] : null;
  const isLast = examIndex + 1 >= TOTAL_EXAM_QUESTIONS;

  return (
    <GameShell {...SHELL}>
      <GameHeader
        mode={difficulty}
        onHelp={() => setShowInstructions(true)}
        right={(
          <Hud>
            {isExam ? (
              <HudStat icon={GraduationCap} tone="progress" value={`${examIndex + 1}/${TOTAL_EXAM_QUESTIONS}`} label="Pregunta" />
            ) : (
              <>
                <HudStat icon={Check} tone="good" value={practiceStats.ok} label="Aciertos" />
                <HudStat icon={Flame} tone="streak" value={practiceStats.streak} label="Racha" />
              </>
            )}
          </Hud>
        )}
      />

      {isExam && <ExamSteps total={TOTAL_EXAM_QUESTIONS} current={examIndex} />}

      {problem && (
        <>
          <motion.div
            key={`${examIndex}-${problem.text}`}
            className="r3-problem"
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
          >
            <span className="r3-problem__medal" aria-hidden="true"><Calculator size={26} /></span>
            <div className="r3-problem__body">
              {typeInfo && (
                <span className={`r3-problem__tag r3-kind--${problem.type}`}>
                  <typeInfo.icon size={13} /> {typeInfo.label} · {typeInfo.hint}
                </span>
              )}
              <p className="r3-problem__text">{problem.text}</p>
            </div>
          </motion.div>

          <div className={`r3-work ${helpVisible ? 'has-help' : ''}`}>
            <div className="r3-board">
              <ProportionBoard problem={problem} showRelation={helpVisible} reveal={isExam ? null : feedback} />
              {helpVisible && (
                <span className={`r3-board__relation r3-kind--${problem.type}`}>
                  {problem.type === 'directa' ? '↓ ↓ misma dirección (directa)' : '↓ ↑ direcciones opuestas (inversa)'}
                </span>
              )}
            </div>

            {helpVisible && <FormulaHint problem={problem} />}

            <div className="r3-answer">
              <Panel
                variant="screen"
                className={`r3-display is-${feedback || 'idle'} ${feedback === 'incorrect' ? 'gk-anim-shake' : ''}`}
              >
                <label htmlFor="r3-input" className="r3-display__label">
                  <span className="r3-display__x">x</span> Tu respuesta
                </label>
                <div className="r3-display__row">
                  <input
                    id="r3-input"
                    ref={inputRef}
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    className="r3-display__input"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="?"
                    autoFocus
                    disabled={feedback !== null && !isExam}
                  />
                  {problem.unit && <span className="r3-display__unit">{problem.unit}</span>}
                  {feedback && (
                    <span className={`r3-display__mark is-${feedback}`} aria-hidden="true">
                      {feedback === 'correct' ? <Check size={22} strokeWidth={3} /> : <X size={22} strokeWidth={3} />}
                    </span>
                  )}
                </div>
                <span className="r3-display__hint">Usa coma o punto para los decimales · <kbd>Enter</kbd></span>
              </Panel>

              {(feedback === null || isExam) && (
                <div className="r3-actions">
                  <GameButton
                    size="lg"
                    icon={isExam && isLast ? GraduationCap : Check}
                    onClick={handleCheck}
                    disabled={!userInput.trim()}
                  >
                    {isExam ? (isLast ? 'Finalizar' : 'Siguiente') : 'Comprobar'}
                  </GameButton>
                  {!isExam && (
                    <GameButton variant="soft" icon={RefreshCw} onClick={nextProblem} title="Generar otro problema">
                      Otro problema
                    </GameButton>
                  )}
                </div>
              )}
            </div>
          </div>

          <RoundBanner
            show={!!feedback && !isExam}
            status={feedback === 'correct' ? 'won' : 'lost'}
            title={feedback === 'correct' ? '¡Correcto!' : 'No es correcto'}
            subtitle={<>La respuesta {feedback === 'correct' ? 'es' : 'era'} <strong>{formatNumber(problem.answer)}{problem.unit ? ` ${problem.unit}` : ''}</strong>.</>}
            action={nextProblem}
            actionLabel="Otro problema"
            actionIcon={Sparkles}
          />

          {!isExam && feedback === 'incorrect' && (
            <motion.div className="r3-explain" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <span className="r3-explain__icon"><Lightbulb size={18} /></span>
              <div>
                <strong>Cómo se resuelve ({problem.type})</strong>
                {problem.type === 'directa' ? (
                  <p>x = {formatNumber(problem.b1)} × {formatNumber(problem.a2)} ÷ {formatNumber(problem.a1)} = <strong>{formatNumber(problem.answer)}</strong></p>
                ) : (
                  <p>x = {formatNumber(problem.a1)} × {formatNumber(problem.b1)} ÷ {formatNumber(problem.a2)} = <strong>{formatNumber(problem.answer)}</strong></p>
                )}
              </div>
            </motion.div>
          )}

          <div className="r3-footer">
            {!isExam ? (
              <>
                <GameButton variant="soft" size="sm" icon={LayoutGrid} onClick={() => setPhase('setup')}>
                  Cambiar dificultad
                </GameButton>
                {difficulty === 'medium' && (
                  <GameButton
                    variant={showHelp ? 'warning' : 'soft'}
                    size="sm"
                    icon={showHelp ? Eye : EyeOff}
                    onClick={() => setShowHelp((s) => !s)}
                    aria-pressed={showHelp}
                    title={showHelp ? 'Ocultar ayuda' : 'Mostrar ayuda'}
                  >
                    {showHelp ? 'Ayuda activa' : 'Ver ayuda'}
                  </GameButton>
                )}
                <span className="r3-footer__info"><Calculator size={14} /> Problemas nuevos sin fin</span>
              </>
            ) : (
              <>
                <span className="r3-footer__info r3-footer__info--left">
                  <GraduationCap size={14} /> Modo examen · sin ayudas
                </span>
                <GameButton
                  variant="ghost"
                  size="sm"
                  icon={LogOut}
                  className="r3-footer__exit"
                  onClick={() => setShowExitModal(true)}
                  title="Entregar el examen con tu nota actual"
                >
                  Salir del examen
                </GameButton>
              </>
            )}
          </div>
        </>
      )}

      {instructions}

      <ExitModal
        open={showExitModal}
        correct={examCorrect}
        answered={examIndex}
        onCancel={() => setShowExitModal(false)}
        onConfirm={handleExitExam}
      />
    </GameShell>
  );
};

export default ReglaDeTres;
