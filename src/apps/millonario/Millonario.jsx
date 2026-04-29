// src/apps/millonario/Millonario.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Trophy, Users, RefreshCw, GraduationCap, Gamepad2, Timer, Award,
  Check, X, Crown, Zap, Shuffle, Sparkles,
} from 'lucide-react';
import { getRoscoData } from '../../services/gameDataService';
import materiasData from '../../../public/data/materias.json';
import InstructionsModal, { InstructionsButton } from '../_shared/InstructionsModal';
import './Millonario.css';

// --- Escalera de premios clásica ---
const PRIZE_LADDER = [
  100, 200, 300, 500, 1000,       // milestone 1 (1.000€)
  2000, 4000, 8000, 16000, 32000, // milestone 2 (32.000€)
  64000, 125000, 250000, 500000, 1000000,
];

const SAFE_LEVELS = [5, 10]; // niveles de red (1-based)

const MODE_CONFIG = {
  easy: {
    label: 'Fácil',
    icon: '🟢',
    questions: 5,
    lives: 3,
    helps: true,
    timer: null,
    color: '#10b981',
  },
  medium: {
    label: 'Medio',
    icon: '🟡',
    questions: 10,
    lives: 2,
    helps: true,
    timer: null,
    color: '#f59e0b',
  },
  exam: {
    label: 'Examen',
    icon: '🔴',
    questions: 15,
    lives: 1,
    helps: false,
    timer: 30,
    color: '#ef4444',
  },
};

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const getSubjectInfo = (level, grade, subjectId) => {
  if (!level || !grade || !subjectId) return { nombre: '', icon: '📚' };
  const nivel = materiasData?.[level];
  const curso = nivel?.[String(grade)];
  if (!Array.isArray(curso)) return { nombre: '', icon: '📚' };
  const found = curso.find((m) => m.id === subjectId);
  if (!found) return { nombre: '', icon: '📚' };
  return { nombre: found.nombre || '', icon: found.icon || '📚' };
};

// --- Generador de preguntas ---
const generateQuestions = (pool, count) => {
  // Filtrar: necesitamos solución + definición
  const valid = pool
    .filter((it) => it && it.solucion && it.definicion)
    .map((it) => ({
      answer: String(it.solucion).trim(),
      question: String(it.definicion).trim(),
      difficulty: it.difficulty || 2,
    }))
    .filter((it) => it.answer.length > 0);

  if (valid.length < 4) return [];

  // Ordenar por dificultad ascendente para la pirámide (fácil primero)
  const byDiff = [...valid].sort((a, b) => {
    if (a.difficulty !== b.difficulty) return a.difficulty - b.difficulty;
    return Math.random() - 0.5;
  });

  // Tomar los primeros N como "correctas"
  const correctas = byDiff.slice(0, Math.min(count, byDiff.length));

  const questions = [];
  for (const q of correctas) {
    // 3 distractores aleatorios distintos del correcto
    const distractores = shuffle(
      valid.filter((x) => x.answer !== q.answer)
    ).slice(0, 3);
    if (distractores.length < 3) continue;

    const options = shuffle([q.answer, ...distractores.map((d) => d.answer)]);
    const correctIndex = options.indexOf(q.answer);

    questions.push({
      question: q.question,
      correct: q.answer,
      options,
      correctIndex,
      difficulty: q.difficulty,
    });
  }
  return questions;
};

const Millonario = ({ onGameComplete }) => {
  const { level, grade: gradeParam, subjectId } = useParams();
  const grade = useMemo(() => parseInt(gradeParam, 10), [gradeParam]);
  const asignatura = subjectId || (level === 'primaria' ? 'lengua' : 'general');
  const subjectInfo = useMemo(
    () => getSubjectInfo(level, grade, asignatura),
    [level, grade, asignatura]
  );

  // --- Estado ---
  const [allWords, setAllWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gameMode, setGameMode] = useState('easy');
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [status, setStatus] = useState('playing'); // 'playing' | 'correct' | 'wrong' | 'won' | 'lost'
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [lives, setLives] = useState(3);
  const [maxReached, setMaxReached] = useState(0);

  // Comodines (disponibles en TODOS los modos)
  const [usedFifty, setUsedFifty] = useState(false);
  const [usedAudience, setUsedAudience] = useState(false);
  const [usedSwap, setUsedSwap] = useState(false);
  const [hiddenOptions, setHiddenOptions] = useState(new Set()); // para 50:50
  const [audiencePoll, setAudiencePoll] = useState(null); // { index: percentage }

  // Timer (solo examen)
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);
  const trackedRef = useRef(false);
  const gameStartRef = useRef(0);

  // Instrucciones
  const [showHelp, setShowHelp] = useState(false);

  // --- Cargar rosco ---
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const load = async () => {
      try {
        const data = await getRoscoData(level, grade, asignatura);
        if (cancelled) return;
        setAllWords(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Millonario: error cargando datos', err);
        setAllWords([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [level, grade, asignatura]);

  // --- Iniciar/reiniciar partida ---
  const startGame = useCallback(() => {
    const cfg = MODE_CONFIG[gameMode];
    const qs = generateQuestions(allWords, cfg.questions);
    setQuestions(qs);
    setCurrentIndex(0);
    setStatus('playing');
    setSelectedIndex(null);
    setLives(cfg.lives);
    setMaxReached(0);
    setUsedFifty(false);
    setUsedAudience(false);
    setUsedSwap(false);
    setHiddenOptions(new Set());
    setAudiencePoll(null);
    trackedRef.current = false;
    if (cfg.timer) setTimeLeft(cfg.timer);
    gameStartRef.current = Date.now();
  }, [gameMode, allWords]);

  // --- Al cargar o cambiar modo, iniciar partida ---
  useEffect(() => {
    if (!loading && allWords.length >= 4) {
      startGame();
    }
  }, [loading, gameMode, allWords, startGame]);

  // --- Reset comodines visuales al cambiar de pregunta ---
  useEffect(() => {
    setHiddenOptions(new Set());
    setAudiencePoll(null);
    setSelectedIndex(null);
  }, [currentIndex]);

  // --- Timer para modo examen ---
  useEffect(() => {
    const cfg = MODE_CONFIG[gameMode];
    if (!cfg.timer || status !== 'playing' || !questions.length) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    setTimeLeft(cfg.timer);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          // Tiempo agotado → tratar como fallo
          setStatus('wrong');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [currentIndex, status, gameMode, questions.length]);

  // --- Responder a una opción ---
  const answer = useCallback((idx) => {
    if (status !== 'playing') return;
    if (hiddenOptions.has(idx)) return;
    setSelectedIndex(idx);
    if (timerRef.current) clearInterval(timerRef.current);

    const current = questions[currentIndex];
    if (!current) return;

    if (idx === current.correctIndex) {
      setStatus('correct');
      setMaxReached((m) => Math.max(m, currentIndex + 1));
    } else {
      setStatus('wrong');
      setLives((l) => l - 1);
    }
  }, [status, hiddenOptions, questions, currentIndex]);

  // --- Avanzar a siguiente pregunta ---
  const nextQuestion = useCallback(() => {
    const cfg = MODE_CONFIG[gameMode];
    // Si se acabó la vida, fin
    if (status === 'wrong' && lives <= 0) {
      setStatus('lost');
      return;
    }
    if (status === 'wrong' && cfg.helps) {
      // En práctica con vidas restantes, permitir seguir en la misma pregunta
      setSelectedIndex(null);
      setStatus('playing');
      return;
    }
    // Si completó todas
    if (currentIndex + 1 >= questions.length) {
      setStatus('won');
      return;
    }
    setCurrentIndex((i) => i + 1);
    setStatus('playing');
    setSelectedIndex(null);
  }, [status, lives, currentIndex, questions.length, gameMode]);

  // --- Confetti y tracking al ganar o perder ---
  useEffect(() => {
    if ((status === 'won' || status === 'lost') && !trackedRef.current) {
      trackedRef.current = true;
      if (status === 'won') {
        confetti({
          particleCount: 240,
          spread: 120,
          origin: { y: 0.5 },
          colors: ['#fbbf24', '#f59e0b', '#10b981', '#3b82f6', '#ec4899'],
        });
      }
      const correct = maxReached;
      const total = questions.length || 1;
      const isExamMode = gameMode === 'exam';
      // Bonus por rapidez en examen: 15s/pregunta de presupuesto
      const elapsedSec = gameStartRef.current
        ? Math.max(1, Math.round((Date.now() - gameStartRef.current) / 1000))
        : 0;
      const TIME_BUDGET = total * 15;
      const SPEED_COEF = 5;
      const timeBonus = isExamMode && elapsedSec > 0
        ? Math.max(0, Math.round((TIME_BUDGET - elapsedSec) * SPEED_COEF))
        : 0;
      const examScore = correct * 100 + (correct >= total ? 100 : 0) + timeBonus;
      onGameComplete?.({
        mode: isExamMode ? 'test' : 'practice',
        score: isExamMode ? examScore : 0,
        maxScore: isExamMode ? total * 100 + 100 + TIME_BUDGET * SPEED_COEF : 0,
        correctAnswers: correct,
        totalQuestions: total,
        durationSeconds: elapsedSec,
      });
    }
  }, [status, maxReached, questions.length, gameMode, onGameComplete]);

  // --- Comodines ---
  const useFifty = useCallback(() => {
    if (usedFifty || status !== 'playing') return;
    const current = questions[currentIndex];
    if (!current) return;
    // Dejar correcta + 1 distractor
    const wrongIndices = [0, 1, 2, 3].filter((i) => i !== current.correctIndex);
    const shuffled = shuffle(wrongIndices);
    const toHide = shuffled.slice(0, 2);
    setHiddenOptions(new Set(toHide));
    setUsedFifty(true);
  }, [usedFifty, status, questions, currentIndex]);

  const useAudience = useCallback(() => {
    if (usedAudience || status !== 'playing') return;
    const current = questions[currentIndex];
    if (!current) return;
    // Generar porcentajes: sesgo a la correcta (~45-70%) + ruido
    const correctPct = 40 + Math.floor(Math.random() * 30);
    let remaining = 100 - correctPct;
    const wrongIndices = [0, 1, 2, 3].filter(
      (i) => i !== current.correctIndex && !hiddenOptions.has(i)
    );
    const poll = {};
    poll[current.correctIndex] = correctPct;
    for (let i = 0; i < wrongIndices.length; i++) {
      if (i === wrongIndices.length - 1) {
        poll[wrongIndices[i]] = remaining;
      } else {
        const p = Math.floor(Math.random() * remaining);
        poll[wrongIndices[i]] = p;
        remaining -= p;
      }
    }
    setAudiencePoll(poll);
    setUsedAudience(true);
  }, [usedAudience, status, questions, currentIndex, hiddenOptions]);

  const useSwap = useCallback(() => {
    if (usedSwap || status !== 'playing') return;
    // Generar una nueva pregunta aleatoria del pool y sustituir la actual
    const cfg = MODE_CONFIG[gameMode];
    const alreadyUsedAnswers = new Set(questions.map((q) => q.correct));
    const pool = allWords.filter(
      (w) => w && w.solucion && w.definicion && !alreadyUsedAnswers.has(String(w.solucion).trim())
    );
    if (pool.length === 0) return;
    const newQs = generateQuestions(pool, 1);
    if (newQs.length === 0) return;
    const updated = [...questions];
    updated[currentIndex] = { ...newQs[0], difficulty: questions[currentIndex].difficulty };
    setQuestions(updated);
    setUsedSwap(true);
    setHiddenOptions(new Set());
    setAudiencePoll(null);
    // Reiniciar timer para la nueva pregunta
    if (cfg.timer) setTimeLeft(cfg.timer);
  }, [usedSwap, status, gameMode, questions, currentIndex, allWords]);

  // --- Auto-avance tras respuesta correcta ---
  useEffect(() => {
    if (status !== 'correct') return;
    const t = setTimeout(() => {
      if (currentIndex + 1 >= questions.length) {
        setStatus('won');
      } else {
        setCurrentIndex((i) => i + 1);
        setStatus('playing');
      }
    }, 1400);
    return () => clearTimeout(t);
  }, [status, currentIndex, questions.length]);

  // --- Datos derivados ---
  const currentQ = questions[currentIndex];
  const cfg = MODE_CONFIG[gameMode];
  const prizeLadder = useMemo(() => {
    // Escalar el ladder a la cantidad de preguntas
    const total = cfg.questions;
    // Coger primeros 5, 10 o 15 niveles del ladder clásico
    return PRIZE_LADDER.slice(0, total);
  }, [cfg.questions]);

  const currentPrize = currentIndex < prizeLadder.length ? prizeLadder[currentIndex] : 0;
  const reachedPrize = maxReached > 0 ? prizeLadder[maxReached - 1] : 0;
  // Red de seguridad (solo para medio/examen)
  const safePrize = useMemo(() => {
    if (gameMode === 'easy') return 0;
    let safe = 0;
    for (const level of SAFE_LEVELS) {
      if (maxReached >= level && level <= prizeLadder.length) {
        safe = prizeLadder[level - 1];
      }
    }
    return safe;
  }, [maxReached, gameMode, prizeLadder]);

  const formatMoney = (n) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1)}M €`;
    if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k €`;
    return `${n} €`;
  };

  // Nota sobre 10 (para el modo examen) + puntos paralelos
  const nota = questions.length > 0
    ? Math.round((maxReached / questions.length) * 100) / 10
    : 0;
  const notaColor = nota >= 8 ? 'excellent' : nota >= 5 ? 'good' : 'fail';
  const notaMsg = nota >= 9 ? '¡Excelente! 🌟'
    : nota >= 7 ? '¡Muy bien! 👏'
    : nota >= 5 ? 'Aprobado. Sigue practicando 💪'
    : 'Necesitas repasar más 📖';
  const isExamMode = gameMode === 'exam';

  // --- Render ---
  if (loading) {
    return (
      <div className="mill-root">
        <div className="mill-card">
          <div className="mill-loading">Cargando...</div>
        </div>
      </div>
    );
  }

  if (allWords.length < 4) {
    return (
      <div className="mill-root">
        <div className="mill-card">
          <div className="mill-title">
            <span>💰</span> Millonario
          </div>
          <div className="mill-empty">
            <p>No hay suficientes preguntas para esta asignatura.</p>
            <p className="mill-empty-sub">Se necesitan al menos 4 palabras con definición en el Rosco.</p>
          </div>
        </div>
      </div>
    );
  }

  const isFinished = status === 'won' || status === 'lost';

  return (
    <div className="mill-root">
      <motion.div
        className="mill-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="mill-header">
          <div className="mill-title">
            <span className="mill-emoji">💰</span>
            <span>Millonario</span>
            <InstructionsButton onClick={() => setShowHelp(true)} />
          </div>
          <div className="mill-stats">
            {cfg.timer && !isFinished && (
              <div className={`mill-stat timer ${timeLeft <= 10 ? 'danger' : ''}`}>
                <Timer size={16} />
                <span>{timeLeft}s</span>
              </div>
            )}
            {cfg.helps && (
              <div className="mill-stat lives">
                {'❤️'.repeat(Math.max(0, lives))}
              </div>
            )}
            <div className="mill-stat prize">
              <Crown size={16} />
              <span>{formatMoney(reachedPrize)}</span>
            </div>
          </div>
        </div>

        <div className="mill-subtitle">
          {subjectInfo.icon} {subjectInfo.nombre || 'General'}
        </div>

        {/* Tabs modo */}
        <div className="mill-gamemode-tabs">
          {Object.entries(MODE_CONFIG).map(([key, c]) => (
            <button
              key={key}
              className={`mill-gamemode-tab ${gameMode === key ? 'active' : ''} ${key}`}
              onClick={() => setGameMode(key)}
            >
              <span className="mill-tab-icon">{c.icon}</span>
              <span className="mill-tab-label">{c.label}</span>
              <span className="mill-tab-sub">{c.questions} preguntas</span>
            </button>
          ))}
        </div>

        {/* Pantalla final */}
        <AnimatePresence>
          {isFinished && (
            <motion.div
              className={`mill-result ${status}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="mill-result-icon">
                {status === 'won' ? <Crown size={48} /> : <Trophy size={48} />}
              </div>
              <h2 className="mill-result-title">
                {status === 'won' ? '¡ERES MILLONARIO! 🎉' : '¡Partida terminada!'}
              </h2>

              {isExamMode ? (
                <>
                  {/* Nota principal sobre 10 */}
                  <div className={`mill-nota ${notaColor}`}>
                    <div className="mill-nota-big">
                      {nota.toFixed(1)}
                      <span className="mill-nota-small">/10</span>
                    </div>
                    <div className="mill-nota-msg">{notaMsg}</div>
                  </div>
                  {/* Dinero como récord superable */}
                  <div className="mill-result-record">
                    <Crown size={16} />
                    <span className="mill-result-record-value">
                      {formatMoney(status === 'won' ? prizeLadder[prizeLadder.length - 1] : Math.max(reachedPrize, safePrize))}
                    </span>
                    <span className="mill-result-record-label">· ¡supera tu récord!</span>
                  </div>
                </>
              ) : (
                <div className="mill-result-prize">
                  {formatMoney(status === 'won' ? prizeLadder[prizeLadder.length - 1] : Math.max(reachedPrize, safePrize))}
                </div>
              )}

              <div className="mill-result-stats">
                <div className="mill-result-stat">
                  <Check size={16} /> {maxReached} / {questions.length} correctas
                </div>
                {gameMode !== 'easy' && safePrize > 0 && (
                  <div className="mill-result-stat safe">
                    <Sparkles size={14} /> Red de seguridad: {formatMoney(safePrize)}
                  </div>
                )}
              </div>
              <button className="mill-btn primary" onClick={startGame}>
                <RefreshCw size={16} /> Jugar otra vez
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Layout del juego */}
        {!isFinished && currentQ && (
          <div className="mill-layout">
            <div className="mill-main">
              {/* Comodines */}
              <div className="mill-lifelines">
                <button
                  className={`mill-lifeline ${usedFifty ? 'used' : ''}`}
                  onClick={useFifty}
                  disabled={usedFifty || status !== 'playing'}
                  title="50:50 — elimina 2 opciones incorrectas"
                >
                  <span className="mill-lifeline-icon">50:50</span>
                  <span className="mill-lifeline-label">Mitad</span>
                </button>
                <button
                  className={`mill-lifeline ${usedAudience ? 'used' : ''}`}
                  onClick={useAudience}
                  disabled={usedAudience || status !== 'playing'}
                  title="Público — consulta al público"
                >
                  <Users size={20} />
                  <span className="mill-lifeline-label">Público</span>
                </button>
                <button
                  className={`mill-lifeline ${usedSwap ? 'used' : ''}`}
                  onClick={useSwap}
                  disabled={usedSwap || status !== 'playing'}
                  title="Cambio — sustituye la pregunta por otra"
                >
                  <Shuffle size={20} />
                  <span className="mill-lifeline-label">Cambio</span>
                </button>
              </div>

              {/* Número de pregunta y prize */}
              <div className="mill-question-meta">
                <span className="mill-question-num">
                  Pregunta {currentIndex + 1} de {questions.length}
                </span>
                <span className="mill-question-prize">
                  {formatMoney(currentPrize)}
                </span>
              </div>

              {/* Pregunta */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  className="mill-question"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mill-question-text">{currentQ.question}</div>
                </motion.div>
              </AnimatePresence>

              {/* Opciones */}
              <div className="mill-options">
                {currentQ.options.map((opt, i) => {
                  const isHidden = hiddenOptions.has(i);
                  const isSelected = selectedIndex === i;
                  const isCorrect = i === currentQ.correctIndex;
                  const showResult = status === 'correct' || status === 'wrong';
                  const reveal = showResult && isCorrect;
                  const wrong = showResult && isSelected && !isCorrect;
                  const pollPct = audiencePoll?.[i];

                  return (
                    <motion.button
                      key={`${currentIndex}-${i}`}
                      className={`mill-option ${isHidden ? 'hidden' : ''} ${
                        isSelected ? 'selected' : ''
                      } ${reveal ? 'correct' : ''} ${wrong ? 'wrong' : ''}`}
                      onClick={() => answer(i)}
                      disabled={isHidden || status !== 'playing'}
                      whileTap={{ scale: 0.97 }}
                    >
                      <div className="mill-option-main">
                        <span className="mill-option-letter">{OPTION_LETTERS[i]}</span>
                        <span className="mill-option-text">
                          {isHidden ? '' : opt}
                        </span>
                        {showResult && isCorrect && <Check size={18} className="mill-option-icon" />}
                        {wrong && <X size={18} className="mill-option-icon" />}
                      </div>
                      {pollPct !== undefined && !isHidden && (
                        <div className="mill-option-poll">
                          <div
                            className="mill-option-poll-bar"
                            style={{ width: `${pollPct}%` }}
                          />
                          <span className="mill-option-poll-label">{pollPct}%</span>
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Feedback + botón siguiente */}
              <AnimatePresence>
                {(status === 'correct' || status === 'wrong') && (
                  <motion.div
                    className={`mill-feedback ${status}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {status === 'correct' ? (
                      <>
                        <div className="mill-feedback-msg">
                          <Check size={18} /> ¡Correcto! +{formatMoney(currentPrize)}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="mill-feedback-msg">
                          <X size={18} /> Incorrecto. Solución: <strong>{currentQ.correct}</strong>
                        </div>
                        {(cfg.helps && lives > 0) || currentIndex + 1 < questions.length ? (
                          <button className="mill-btn primary" onClick={nextQuestion}>
                            {lives > 0 && cfg.helps ? 'Intentar siguiente' : 'Ver resultado'}
                          </button>
                        ) : (
                          <button className="mill-btn primary" onClick={nextQuestion}>
                            Ver resultado
                          </button>
                        )}
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Escalera de premios */}
            <div className="mill-ladder">
              <div className="mill-ladder-title">
                <Crown size={14} /> Escalera
              </div>
              <ul className="mill-ladder-list">
                {[...prizeLadder].reverse().map((prize, idx) => {
                  const level = prizeLadder.length - idx; // 1-based
                  const isCurrent = level === currentIndex + 1 && status === 'playing';
                  const isWon = level <= maxReached;
                  const isSafe = SAFE_LEVELS.includes(level) && gameMode !== 'easy';
                  return (
                    <li
                      key={level}
                      className={`mill-ladder-item ${isCurrent ? 'current' : ''} ${
                        isWon ? 'won' : ''
                      } ${isSafe ? 'safe' : ''}`}
                    >
                      <span className="mill-ladder-num">{level}</span>
                      <span className="mill-ladder-amount">{formatMoney(prize)}</span>
                      {isSafe && <Sparkles size={12} className="mill-ladder-safe-icon" />}
                    </li>
                  );
                })}
              </ul>
              {gameMode === 'exam' && (
                <div className="mill-ladder-note">
                  <Zap size={12} /> Red: niveles 5 y 10
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>

      <InstructionsModal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        title="Cómo jugar al Millonario"
      >
        <h3>🎯 Objetivo</h3>
        <p>
          Responde correctamente para subir por la <strong>escalera de premios</strong>.
          Cada acierto te hace avanzar un nivel. Un solo fallo te puede hacer perder lo
          ganado... salvo que llegues a las <strong>redes de seguridad</strong>.
        </p>

        <h3>🕹️ Cómo se juega</h3>
        <ul>
          <li>Lee la pregunta (la definición del vocabulario).</li>
          <li>Elige una de las <strong>4 opciones</strong> (A, B, C, D).</li>
          <li>Si aciertas, sumas puntos y avanzas.</li>
          <li>Si fallas en práctica y tienes vidas, puedes continuar.</li>
          <li>En examen solo tienes <strong>1 vida</strong> y <strong>30 segundos por pregunta</strong>.</li>
        </ul>

        <h3>🪄 Comodines (disponibles en TODOS los modos, incluido examen)</h3>
        <ul>
          <li><strong>50:50</strong> — Elimina 2 respuestas incorrectas.</li>
          <li><strong>👥 Público</strong> — Muestra una encuesta orientativa del público.</li>
          <li><strong>🔄 Cambio</strong> — Sustituye la pregunta actual por otra.</li>
        </ul>
        <p>Cada comodín solo se puede usar <strong>una vez por partida</strong>.</p>

        <h3>🎓 Niveles de dificultad</h3>
        <div className="instr-modes">
          <div className="instr-mode easy">
            <strong>🟢 Fácil</strong>
            5 preguntas, 3 vidas, sin tiempo.
          </div>
          <div className="instr-mode medium">
            <strong>🟡 Medio</strong>
            10 preguntas, 2 vidas, red en nivel 5.
          </div>
          <div className="instr-mode exam">
            <strong>🔴 Examen</strong>
            15 preguntas, 1 vida, 30s/pregunta, redes 5 y 10.
          </div>
        </div>

        <div className="instr-tips">
          <strong>💡 Redes de seguridad:</strong> al superar los niveles 5 y 10 en modo medio/examen,
          si fallas después te llevas el último premio asegurado.
        </div>
      </InstructionsModal>
    </div>
  );
};

export default Millonario;
