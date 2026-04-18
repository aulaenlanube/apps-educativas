// src/apps/velocidad-respuesta/VelocidadRespuesta.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Zap, Timer, Flame, Star, RefreshCw, SkipForward, Eye,
  Gamepad2, GraduationCap, Award, Trophy, Check, X, Send,
} from 'lucide-react';
import { getRoscoData } from '../../services/gameDataService';
import materiasData from '../../../public/data/materias.json';
import InstructionsModal, { InstructionsButton } from '../_shared/InstructionsModal';
import './VelocidadRespuesta.css';

const normalize = (s) =>
  String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-ZÑ ]/g, '')
    .trim();

const MODE_CONFIG = {
  easy: {
    label: 'Fácil', icon: '🟢', questions: 5,
    baseTime: 10, // seconds (baseline ESO 2º/3º/4º)
    helps: { firstLetter: 3, skip: 3 },
    speedUp: false,
  },
  medium: {
    label: 'Medio', icon: '🟡', questions: 8,
    baseTime: 7,
    helps: { firstLetter: 1, skip: 1 },
    speedUp: true, // cada 3 rachas, -0.3s
  },
  exam: {
    label: 'Examen', icon: '🔴', questions: 10,
    baseTime: 5,
    helps: { firstLetter: 1, skip: 0 },
    speedUp: true,
  },
};

// Al fallar (o agotarse el tiempo) la partida NO termina: la siguiente pregunta gana
// un bonus de tiempo igual al 50% del base (minimo 2s).
const FAIL_TIME_BONUS_RATIO = 0.5;
const FAIL_TIME_BONUS_MIN = 2;

// Los alumnos pequeños leen y tipean mucho más lento — escalamos el tiempo por curso.
// Baseline (×1.0) ≈ ESO 2º. Primaria necesita más tiempo, bachillerato algo menos.
const GRADE_TIME_MULTIPLIERS = {
  'primaria-1': 2.2,
  'primaria-2': 2.0,
  'primaria-3': 1.7,
  'primaria-4': 1.5,
  'primaria-5': 1.3,
  'primaria-6': 1.15,
  'eso-1': 1.05,
  'eso-2': 1.0,
  'eso-3': 1.0,
  'eso-4': 0.95,
  'bachillerato-1': 0.9,
  'bachillerato-2': 0.85,
};
const getGradeTimeMultiplier = (level, grade) => GRADE_TIME_MULTIPLIERS[`${level}-${grade}`] || 1.0;

const getSubjectInfo = (level, grade, subjectId) => {
  if (!level || !grade || !subjectId) return { nombre: '', icon: '📚' };
  const curso = materiasData?.[level]?.[String(grade)];
  if (!Array.isArray(curso)) return { nombre: '', icon: '📚' };
  return curso.find((m) => m.id === subjectId) || { nombre: '', icon: '📚' };
};

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const VelocidadRespuesta = ({ onGameComplete }) => {
  const { level, grade: gradeParam, subjectId } = useParams();
  const grade = useMemo(() => parseInt(gradeParam, 10), [gradeParam]);
  const asignatura = subjectId || (level === 'primaria' ? 'lengua' : 'general');
  const subjectInfo = useMemo(() => getSubjectInfo(level, grade, asignatura), [level, grade, asignatura]);
  const timeMultiplier = useMemo(() => getGradeTimeMultiplier(level, grade), [level, grade]);
  const getBaseTime = useCallback((mode) => {
    const cfg = MODE_CONFIG[mode];
    if (!cfg) return 0;
    // Redondeamos a 0.5s para que los tiempos queden "humanos" (ej. 18s, 12.5s…)
    return Math.max(3, Math.round(cfg.baseTime * timeMultiplier * 2) / 2);
  }, [timeMultiplier]);

  const [allWords, setAllWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gameMode, setGameMode] = useState('easy');
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [status, setStatus] = useState('idle'); // idle|playing|correct|wrong|timeout|won|lost
  const [answer, setAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);

  // Game state
  const [mistakes, setMistakes] = useState(0);
  const [pendingTimeBonus, setPendingTimeBonus] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [lastGain, setLastGain] = useState(null);

  // Timer
  const [timeLeft, setTimeLeft] = useState(0);
  const [maxTime, setMaxTime] = useState(10);
  const timerRef = useRef(null);
  const inputRef = useRef(null);
  const trackedRef = useRef(false);

  // Helps
  const [helpsRemaining, setHelpsRemaining] = useState({});
  const [revealedFirst, setRevealedFirst] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // --- Cargar rosco ---
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const load = async () => {
      try {
        const data = await getRoscoData(level, grade, asignatura);
        if (cancelled) return;
        const words = Array.isArray(data)
          ? data
              .filter((it) => it?.solucion && it?.definicion && !/\s|-/.test(String(it.solucion).trim()))
              .map((it) => ({
                word: String(it.solucion).trim(),
                clue: String(it.definicion).trim(),
                difficulty: it.difficulty || 2,
              }))
          : [];
        setAllWords(words);
      } catch (err) {
        console.error('VelocidadRespuesta: error cargando datos', err);
        setAllWords([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [level, grade, asignatura]);

  // --- Iniciar partida ---
  const startGame = useCallback(() => {
    if (allWords.length < 4) return;
    const cfg = MODE_CONFIG[gameMode];
    const qs = shuffle(allWords).slice(0, cfg.questions);
    qs.sort((a, b) => a.difficulty - b.difficulty); // fáciles primero
    setQuestions(qs);
    setCurrentIndex(0);
    setStatus('playing');
    setAnswer('');
    setShowAnswer(false);
    setMistakes(0);
    setPendingTimeBonus(0);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setCorrectCount(0);
    setLastGain(null);
    setHelpsRemaining({ ...cfg.helps });
    setRevealedFirst(false);
    const adjBase = getBaseTime(gameMode);
    setMaxTime(adjBase);
    setTimeLeft(adjBase);
    trackedRef.current = false;
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [allWords, gameMode, getBaseTime]);

  useEffect(() => {
    if (!loading && allWords.length >= 4) startGame();
  }, [loading, gameMode, allWords, startGame]);

  // --- Timer por pregunta ---
  useEffect(() => {
    if (status !== 'playing') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 0.1) {
          clearInterval(timerRef.current);
          // Timeout: fallo sin perder vidas, se concede un bonus de tiempo para la siguiente
          setStatus('timeout');
          setMistakes((m) => m + 1);
          setStreak(0);
          setShowAnswer(true);
          const bonus = Math.max(FAIL_TIME_BONUS_MIN, Math.round(getBaseTime(gameMode) * FAIL_TIME_BONUS_RATIO * 2) / 2);
          setPendingTimeBonus((b) => b + bonus);
          return 0;
        }
        return Math.max(0, t - 0.05);
      });
    }, 50);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [status, currentIndex, gameMode, getBaseTime]);

  // --- Pregunta actual ---
  const currentQ = questions[currentIndex];

  // --- Calcular tiempo ajustado (speedUp) ---
  const getAdjustedTime = useCallback(() => {
    const cfg = MODE_CONFIG[gameMode];
    const base = getBaseTime(gameMode);
    if (!cfg.speedUp) return base;
    // Cada 3 rachas reducimos ~5% del tiempo base (mínimo 50% del base, nunca <3s)
    const reduction = Math.floor(streak / 3) * base * 0.05;
    return Math.max(3, base * 0.5, base - reduction);
  }, [gameMode, streak, getBaseTime]);

  // --- Enviar respuesta ---
  const submitAnswer = useCallback(() => {
    if (status !== 'playing' || !currentQ) return;
    if (timerRef.current) clearInterval(timerRef.current);

    const normalized = normalize(answer);
    const correct = normalize(currentQ.word);

    if (normalized === correct) {
      // ¡Correcto!
      const streakMultiplier = 1 + streak * 0.1;
      const adjBase = getBaseTime(gameMode);
      const timeBonus = Math.max(0, Math.round(20 * (timeLeft / Math.max(1, adjBase))));
      const basePoints = 100;
      const gained = Math.round(basePoints * streakMultiplier + timeBonus);
      setScore((s) => s + gained);
      setLastGain({ value: gained, key: Date.now() });
      setStreak((s) => {
        const next = s + 1;
        setMaxStreak((m) => Math.max(m, next));
        return next;
      });
      setCorrectCount((c) => c + 1);
      setStatus('correct');
    } else {
      setStatus('wrong');
      setMistakes((m) => m + 1);
      setStreak(0);
      setShowAnswer(true);
      const bonus = Math.max(FAIL_TIME_BONUS_MIN, Math.round(getBaseTime(gameMode) * FAIL_TIME_BONUS_RATIO * 2) / 2);
      setPendingTimeBonus((b) => b + bonus);
    }
  }, [status, currentQ, answer, gameMode, streak, timeLeft, getBaseTime]);

  // --- Avanzar tras feedback ---
  useEffect(() => {
    if (status !== 'correct' && status !== 'wrong' && status !== 'timeout') return;
    const delay = status === 'correct' ? 800 : 1800;
    const t = setTimeout(() => {
      // Fallar ya no termina la partida: solo se acaba cuando no quedan preguntas
      if (currentIndex + 1 >= questions.length) {
        setStatus('won');
        return;
      }
      setCurrentIndex((i) => i + 1);
      setAnswer('');
      setShowAnswer(false);
      setRevealedFirst(false);
      // Aplicamos el bonus de tiempo acumulado y lo reseteamos
      const adjTime = getAdjustedTime() + pendingTimeBonus;
      setPendingTimeBonus(0);
      setMaxTime(adjTime);
      setTimeLeft(adjTime);
      setStatus('playing');
      setTimeout(() => inputRef.current?.focus(), 50);
    }, delay);
    return () => clearTimeout(t);
  }, [status, currentIndex, questions.length, getAdjustedTime, pendingTimeBonus]);

  // --- XP tracking al terminar ---
  useEffect(() => {
    if ((status !== 'won' && status !== 'lost') || trackedRef.current) return;
    trackedRef.current = true;
    if (status === 'won') {
      confetti({ particleCount: 200, spread: 120, origin: { y: 0.5 },
        colors: ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#a855f7'] });
    }
    const isExamMode = gameMode === 'exam';
    onGameComplete?.({
      mode: isExamMode ? 'test' : 'practice',
      score: isExamMode ? score : 0,
      maxScore: isExamMode ? questions.length * 170 : 0,
      correctAnswers: correctCount,
      totalQuestions: questions.length || 1,
      durationSeconds: 0,
    });
  }, [status, score, correctCount, questions.length, gameMode, onGameComplete]);

  // --- Ayudas ---
  const useFirstLetter = useCallback(() => {
    if (!currentQ || helpsRemaining.firstLetter <= 0 || revealedFirst || status !== 'playing') return;
    setRevealedFirst(true);
    setAnswer(currentQ.word[0].toUpperCase());
    setHelpsRemaining((h) => ({ ...h, firstLetter: h.firstLetter - 1 }));
    inputRef.current?.focus();
  }, [currentQ, helpsRemaining, revealedFirst, status]);

  const skipQuestion = useCallback(() => {
    if (helpsRemaining.skip <= 0 || status !== 'playing') return;
    if (timerRef.current) clearInterval(timerRef.current);
    setHelpsRemaining((h) => ({ ...h, skip: h.skip - 1 }));
    setStreak(0);
    if (currentIndex + 1 >= questions.length) {
      setStatus('won');
    } else {
      setCurrentIndex((i) => i + 1);
      setAnswer('');
      setShowAnswer(false);
      setRevealedFirst(false);
      const adjTime = getAdjustedTime();
      setMaxTime(adjTime);
      setTimeLeft(adjTime);
      setStatus('playing');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [helpsRemaining, status, currentIndex, questions.length, getAdjustedTime]);

  // --- Teclado: Enter para enviar ---
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submitAnswer();
    }
  }, [submitAnswer]);

  // --- Derivados ---
  const cfg = MODE_CONFIG[gameMode];
  const isExam = gameMode === 'exam';
  const isFinished = status === 'won' || status === 'lost';
  const multiplier = (1 + streak * 0.2).toFixed(1);
  const timerPct = maxTime > 0 ? (timeLeft / maxTime) * 100 : 0;
  const timerColor = timerPct > 50 ? 'green' : timerPct > 25 ? 'yellow' : 'red';
  const nota = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) / 10 : 0;
  const notaColor = nota >= 8 ? 'excellent' : nota >= 5 ? 'good' : 'fail';
  const notaMsg = nota >= 9 ? '¡Excelente! 🌟' : nota >= 7 ? '¡Muy bien! 👏' : nota >= 5 ? 'Aprobado 💪' : 'Necesitas repasar 📖';

  // --- Render ---
  if (loading) {
    return <div className="veloc-root"><div className="veloc-card"><div className="veloc-loading">Cargando...</div></div></div>;
  }

  if (allWords.length < 4) {
    return (
      <div className="veloc-root"><div className="veloc-card">
        <div className="veloc-title"><span>⚡</span> Velocidad</div>
        <div className="veloc-empty"><p>No hay suficientes palabras para esta asignatura.</p></div>
      </div></div>
    );
  }

  return (
    <div className="veloc-root">
      <motion.div className="veloc-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="veloc-header">
          <div className="veloc-title">
            <span className="veloc-emoji">⚡</span>
            <span>Velocidad</span>
            <InstructionsButton onClick={() => setShowHelp(true)} />
          </div>
          <div className="veloc-stats">
            {mistakes > 0 && (
              <div className="veloc-stat lives" title="Fallos">
                <X size={14} color="#ef4444" /> <span>{mistakes}</span>
              </div>
            )}
            {pendingTimeBonus > 0 && (
              <motion.div
                className="veloc-stat streak"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                title="Tiempo extra para la siguiente pregunta"
              >
                <Timer size={14} /> <span>+{pendingTimeBonus}s</span>
              </motion.div>
            )}
            {streak >= 2 && (
              <motion.div className="veloc-stat streak" key={streak} initial={{ scale: 0.5 }} animate={{ scale: 1 }}>
                <Flame size={14} /> <span>×{multiplier}</span>
              </motion.div>
            )}
            <div className="veloc-stat score">
              <Star size={14} /> <span>{score.toLocaleString('es-ES')}</span>
            </div>
          </div>
        </div>

        <div className="veloc-subtitle">{subjectInfo.icon} {subjectInfo.nombre || 'General'}</div>

        {/* Tabs */}
        <div className="veloc-gamemode-tabs">
          {Object.entries(MODE_CONFIG).map(([key, c]) => (
            <button key={key} className={`veloc-gamemode-tab ${gameMode === key ? 'active' : ''} ${key}`} onClick={() => setGameMode(key)}>
              <span>{c.icon}</span>
              <span className="veloc-tab-label">{c.label}</span>
              <span className="veloc-tab-sub">{c.questions} · {getBaseTime(key)}s</span>
            </button>
          ))}
        </div>

        {/* Resultado final */}
        <AnimatePresence>
          {isFinished && (
            <motion.div className={`veloc-result ${status}`} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="veloc-result-icon">
                {status === 'won' ? <Trophy size={48} /> : <Award size={48} />}
              </div>
              <h2 className="veloc-result-title">{status === 'won' ? '¡Ronda completada! 🎉' : '¡Se acabó!'}</h2>

              {isExam ? (
                <>
                  <div className={`veloc-nota ${notaColor}`}>
                    <div className="veloc-nota-big">{nota.toFixed(1)}<span className="veloc-nota-small">/10</span></div>
                    <div className="veloc-nota-msg">{notaMsg}</div>
                  </div>
                  <div className="veloc-result-record">
                    <Star size={14} /> <span>{score.toLocaleString('es-ES')}</span>
                    <span className="veloc-result-record-label">puntos · ¡supérate!</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="veloc-result-score">{score.toLocaleString('es-ES')}</div>
                  <div className="veloc-result-score-label">puntos</div>
                </>
              )}

              <div className="veloc-result-stats">
                <div className="veloc-result-stat"><Check size={14} /> {correctCount}/{questions.length}</div>
                <div className="veloc-result-stat"><Flame size={14} /> Racha máx: {maxStreak}</div>
              </div>
              <button className="veloc-btn primary" onClick={startGame}><RefreshCw size={16} /> Jugar otra vez</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Juego activo */}
        {!isFinished && currentQ && (
          <>
            {/* Progreso */}
            <div className="veloc-progress-row">
              <span className="veloc-progress-label">Pregunta {currentIndex + 1}/{questions.length}</span>
              <div className="veloc-progress-bar">
                <div className="veloc-progress-fill" style={{ width: `${((currentIndex) / questions.length) * 100}%` }} />
              </div>
            </div>

            {/* Timer bar */}
            <div className="veloc-timer-bar-wrap">
              <motion.div
                className={`veloc-timer-bar ${timerColor}`}
                style={{ width: `${timerPct}%` }}
                transition={{ duration: 0.05 }}
              />
              <span className="veloc-timer-label">{Math.ceil(timeLeft)}s</span>
            </div>

            {/* Definición */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                className="veloc-question"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.25 }}
              >
                <div className="veloc-question-text">{currentQ.clue}</div>
                <div className="veloc-question-meta">{currentQ.word.length} letras</div>
              </motion.div>
            </AnimatePresence>

            {/* Input */}
            <div className={`veloc-input-wrap ${status === 'correct' ? 'correct' : ''} ${status === 'wrong' || status === 'timeout' ? 'wrong' : ''}`}>
              <input
                ref={inputRef}
                type="text"
                className="veloc-input"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe la respuesta..."
                autoComplete="off"
                autoCapitalize="off"
                spellCheck="false"
                disabled={status !== 'playing'}
              />
              <button className="veloc-send-btn" onClick={submitAnswer} disabled={status !== 'playing' || !answer.trim()}>
                <Send size={18} />
              </button>
            </div>

            {/* Feedback */}
            <AnimatePresence>
              {status === 'correct' && (
                <motion.div className="veloc-feedback correct" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <Check size={18} /> ¡Correcto!
                  {lastGain && <span className="veloc-gain">+{lastGain.value}</span>}
                </motion.div>
              )}
              {(status === 'wrong' || status === 'timeout') && showAnswer && (
                <motion.div className="veloc-feedback wrong" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <X size={18} /> {status === 'timeout' ? '¡Tiempo!' : 'Incorrecto'} → <strong>{currentQ.word}</strong>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Ayudas */}
            <div className="veloc-lifelines">
              <button className="veloc-lifeline" onClick={useFirstLetter} disabled={helpsRemaining.firstLetter <= 0 || revealedFirst || status !== 'playing'}>
                <Eye size={14} /> 1ª letra
                {helpsRemaining.firstLetter > 0 && <span className="veloc-lifeline-count">{helpsRemaining.firstLetter}</span>}
              </button>
              <button className="veloc-lifeline" onClick={skipQuestion} disabled={helpsRemaining.skip <= 0 || status !== 'playing'}>
                <SkipForward size={14} /> Saltar
                {helpsRemaining.skip > 0 && <span className="veloc-lifeline-count">{helpsRemaining.skip}</span>}
              </button>
            </div>
          </>
        )}
      </motion.div>

      <InstructionsModal isOpen={showHelp} onClose={() => setShowHelp(false)} title="Cómo jugar a Velocidad">
        <h3>🎯 Objetivo</h3>
        <p>Lee la definición y <strong>escribe la palabra correcta</strong> antes de que se agote la barra de tiempo.</p>

        <h3>🕹️ Cómo se juega</h3>
        <ul>
          <li>Aparece una definición del vocabulario de la asignatura.</li>
          <li>Escribe la respuesta en el campo de texto y pulsa <kbd>Enter</kbd> o el botón de enviar.</li>
          <li>Si aciertas: sumas puntos y la racha crece (más multiplicador).</li>
          <li>Si fallas o se acaba el tiempo: pierdes una vida y la racha se resetea.</li>
          <li>En modo medio/examen, cuanto mayor es la racha, <strong>menos tiempo</strong> tienes por pregunta.</li>
        </ul>

        <h3>🔥 Puntuación</h3>
        <ul>
          <li><strong>Base</strong>: 100 + longitud de palabra × 15</li>
          <li><strong>Multiplicador</strong>: ×1.0, ×1.2, ×1.4... (crece con la racha)</li>
          <li><strong>Bonus tiempo</strong>: cuanto más rápido respondas, más puntos extra.</li>
        </ul>

        <h3>🎓 Modos</h3>
        <div className="instr-modes">
          <div className="instr-mode easy"><strong>🟢 Fácil</strong>10 preguntas · 10s · 3 vidas · 3 pistas + 3 saltos</div>
          <div className="instr-mode medium"><strong>🟡 Medio</strong>15 preguntas · 7s · 2 vidas · velocidad sube con racha</div>
          <div className="instr-mode exam"><strong>🔴 Examen</strong>20 preguntas · 5s · 1 vida · velocidad sube · nota /10</div>
        </div>

        <div className="instr-tips"><strong>💡 Consejo:</strong> no escribas tildes — la comparación ignora acentos. Concéntrate en la velocidad.</div>
      </InstructionsModal>
    </div>
  );
};

export default VelocidadRespuesta;
