// src/apps/anagramas/Anagramas.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Shuffle, Lightbulb, Zap, SkipForward, RefreshCw, Timer, Heart,
  Award, Gamepad2, GraduationCap, Flame, Trophy, Sparkles, Check, X, Star,
} from 'lucide-react';
import { getRoscoData } from '../../services/gameDataService';
import materiasData from '../../../public/data/materias.json';
import './Anagramas.css';

// --- Paleta de colores para las fichas (se baraja al inicio de cada partida) ---
const TILE_PALETTE = [
  '#a855f7', '#ec4899', '#f59e0b', '#10b981',
  '#3b82f6', '#06b6d4', '#f97316', '#8b5cf6',
  '#14b8a6', '#ef4444', '#6366f1', '#84cc16',
  '#d946ef', '#0ea5e9', '#f43f5e', '#22c55e',
];

const MODE_CONFIG = {
  easy: {
    label: 'Fácil',
    icon: '🟢',
    questions: 5,
    lives: 3,
    minLen: 3,
    maxLen: 6,
    helpsAvailable: { hint: 3, firstLetter: 2, reshuffle: Infinity, skip: 2 },
    showHintByDefault: true,
    timer: null,
  },
  medium: {
    label: 'Medio',
    icon: '🟡',
    questions: 10,
    lives: 2,
    minLen: 4,
    maxLen: 8,
    helpsAvailable: { hint: 2, firstLetter: 1, reshuffle: Infinity, skip: 1 },
    showHintByDefault: false,
    timer: null,
  },
  exam: {
    label: 'Examen',
    icon: '🔴',
    questions: 15,
    lives: 1,
    minLen: 4,
    maxLen: 12,
    helpsAvailable: { hint: 1, firstLetter: 1, reshuffle: Infinity, skip: 0 },
    showHintByDefault: false,
    timer: 45,
  },
};

const normalize = (s) =>
  String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-ZÑ]/g, '');

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// Scramble un array asegurando que NO queda en el mismo orden
const scrambleDistinct = (arr) => {
  if (arr.length <= 1) return [...arr];
  let scrambled;
  let attempts = 0;
  do {
    scrambled = shuffle(arr);
    attempts++;
  } while (
    attempts < 20 &&
    scrambled.every((x, i) => x === arr[i])
  );
  return scrambled;
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

const Anagramas = ({ onGameComplete }) => {
  const { level, grade: gradeParam, subjectId } = useParams();
  const grade = useMemo(() => parseInt(gradeParam, 10), [gradeParam]);
  const asignatura = subjectId || (level === 'primaria' ? 'lengua' : 'general');
  const subjectInfo = useMemo(
    () => getSubjectInfo(level, grade, asignatura),
    [level, grade, asignatura]
  );

  const [allWords, setAllWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gameMode, setGameMode] = useState('easy');
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [status, setStatus] = useState('idle'); // idle|playing|correct|wrong|won|lost

  // Fichas: {id, letter, color, placedAt}
  const [tiles, setTiles] = useState([]);

  // Gamification
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [lastGain, setLastGain] = useState(null); // {value, key} for floating animation

  // Ayudas por partida
  const [helpsRemaining, setHelpsRemaining] = useState({});
  const [hintVisible, setHintVisible] = useState(false);
  const [revealedFirst, setRevealedFirst] = useState(false);

  // Timer (solo examen)
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);
  const trackedRef = useRef(false);
  const autoCheckRef = useRef(null);

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
              .filter((it) => it && it.solucion)
              .map((it) => ({
                original: String(it.solucion).trim(),
                letters: normalize(it.solucion),
                clue: it.definicion || '',
              }))
              .filter(
                (w) =>
                  w.letters.length >= 3 &&
                  w.letters.length <= 14 &&
                  !/\s|-/.test(w.original)
              )
          : [];
        setAllWords(words);
      } catch (err) {
        console.error('Anagramas: error cargando datos', err);
        setAllWords([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [level, grade, asignatura]);

  // --- Preparar fichas para una palabra concreta ---
  const buildTiles = useCallback((word) => {
    const letters = word.letters.split('');
    const scrambled = scrambleDistinct(letters);
    const palette = shuffle(TILE_PALETTE);
    return scrambled.map((letter, i) => ({
      id: `tile-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`,
      letter,
      color: palette[i % palette.length],
      placedAt: null,
    }));
  }, []);

  // --- Iniciar partida ---
  const startGame = useCallback(() => {
    if (allWords.length === 0) return;
    const cfg = MODE_CONFIG[gameMode];
    const pool = allWords.filter(
      (w) => w.letters.length >= cfg.minLen && w.letters.length <= cfg.maxLen
    );
    const chosen = shuffle(pool).slice(0, cfg.questions);
    if (chosen.length === 0) {
      setQuestions([]);
      return;
    }
    setQuestions(chosen);
    setCurrentIndex(0);
    setTiles(buildTiles(chosen[0]));
    setStatus('playing');
    setLives(cfg.lives);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setCorrectCount(0);
    setHelpsRemaining({ ...cfg.helpsAvailable });
    setHintVisible(cfg.showHintByDefault);
    setRevealedFirst(false);
    setLastGain(null);
    trackedRef.current = false;
    if (cfg.timer) setTimeLeft(cfg.timer);
  }, [allWords, gameMode, buildTiles]);

  useEffect(() => {
    if (!loading && allWords.length > 0) startGame();
  }, [loading, gameMode, allWords, startGame]);

  // --- Timer por palabra (examen) ---
  useEffect(() => {
    const cfg = MODE_CONFIG[gameMode];
    if (!cfg.timer || status !== 'playing') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    setTimeLeft(cfg.timer);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setStatus('wrong');
          setLives((l) => l - 1);
          setStreak(0);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [currentIndex, status, gameMode, questions.length]);

  // --- Resetear por cambio de pregunta ---
  useEffect(() => {
    if (status !== 'playing') return;
    const cfg = MODE_CONFIG[gameMode];
    setHintVisible(cfg.showHintByDefault);
    setRevealedFirst(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  // --- Palabra actual ---
  const currentWord = questions[currentIndex];

  // --- Slots ocupados / letras en banco ---
  const slots = useMemo(() => {
    if (!currentWord) return [];
    const result = new Array(currentWord.letters.length).fill(null);
    tiles.forEach((t) => {
      if (t.placedAt !== null && t.placedAt < result.length) {
        result[t.placedAt] = t;
      }
    });
    return result;
  }, [tiles, currentWord]);

  const bank = useMemo(() => tiles.filter((t) => t.placedAt === null), [tiles]);

  // --- Colocar ficha en el siguiente slot libre ---
  const placeTile = useCallback((tileId) => {
    if (status !== 'playing' || !currentWord) return;
    setTiles((prev) => {
      const firstEmpty = (() => {
        for (let i = 0; i < currentWord.letters.length; i++) {
          if (!prev.find((t) => t.placedAt === i)) return i;
        }
        return -1;
      })();
      if (firstEmpty === -1) return prev;
      return prev.map((t) =>
        t.id === tileId ? { ...t, placedAt: firstEmpty } : t
      );
    });
  }, [status, currentWord]);

  // --- Quitar ficha del slot (volverla al banco) ---
  const removeTile = useCallback((tileId) => {
    if (status !== 'playing') return;
    setTiles((prev) =>
      prev.map((t) => (t.id === tileId ? { ...t, placedAt: null } : t))
    );
  }, [status]);

  // --- Reordenar el banco ---
  const reshuffleBank = useCallback(() => {
    if (status !== 'playing') return;
    const helps = helpsRemaining.reshuffle;
    if (helps !== Infinity && helps <= 0) return;
    setTiles((prev) => {
      const bankTiles = prev.filter((t) => t.placedAt === null);
      const shuffledBank = scrambleDistinct(bankTiles);
      // Reconstruir con nuevo orden del banco
      const bankMap = new Map(shuffledBank.map((t, i) => [t.id, i]));
      return prev
        .map((t) => {
          if (t.placedAt !== null) return t;
          return { ...t, _order: bankMap.get(t.id) };
        })
        .sort((a, b) => {
          if (a.placedAt !== null && b.placedAt !== null) return 0;
          if (a.placedAt !== null) return -1;
          if (b.placedAt !== null) return 1;
          return (a._order ?? 0) - (b._order ?? 0);
        })
        .map((t) => {
          const { _order, ...rest } = t;
          return rest;
        });
    });
    if (helps !== Infinity) {
      setHelpsRemaining((h) => ({ ...h, reshuffle: h.reshuffle - 1 }));
    }
  }, [status, helpsRemaining.reshuffle]);

  // --- Ver pista (definición) ---
  const useHint = useCallback(() => {
    if (helpsRemaining.hint <= 0) return;
    setHintVisible(true);
    setHelpsRemaining((h) => ({ ...h, hint: h.hint - 1 }));
  }, [helpsRemaining.hint]);

  // --- Revelar primera letra ---
  const revealFirstLetter = useCallback(() => {
    if (status !== 'playing' || !currentWord) return;
    if (revealedFirst || helpsRemaining.firstLetter <= 0) return;
    const firstLetter = currentWord.letters[0];
    setTiles((prev) => {
      // Liberar slot 0 si está ocupado
      const freed = prev.map((t) => (t.placedAt === 0 ? { ...t, placedAt: null } : t));
      // Buscar un tile del banco con esa letra
      const bankTiles = freed.filter((t) => t.placedAt === null);
      const target = bankTiles.find((t) => t.letter === firstLetter);
      if (!target) return prev;
      return freed.map((t) =>
        t.id === target.id ? { ...t, placedAt: 0 } : t
      );
    });
    setRevealedFirst(true);
    setHelpsRemaining((h) => ({ ...h, firstLetter: h.firstLetter - 1 }));
  }, [status, currentWord, revealedFirst, helpsRemaining.firstLetter]);

  // --- Saltar palabra (comodín) ---
  const skipWord = useCallback(() => {
    if (helpsRemaining.skip <= 0 || status !== 'playing') return;
    setHelpsRemaining((h) => ({ ...h, skip: h.skip - 1 }));
    setStreak(0);
    // Avanzar sin sumar
    if (currentIndex + 1 >= questions.length) {
      setStatus('won');
    } else {
      setCurrentIndex((i) => i + 1);
      setTiles(buildTiles(questions[currentIndex + 1]));
    }
  }, [helpsRemaining.skip, status, currentIndex, questions, buildTiles]);

  // --- Comprobar si la palabra está completa y correcta ---
  const formedWord = useMemo(() => {
    if (!currentWord) return '';
    let s = '';
    for (let i = 0; i < currentWord.letters.length; i++) {
      const t = tiles.find((tt) => tt.placedAt === i);
      if (!t) return '';
      s += t.letter;
    }
    return s;
  }, [tiles, currentWord]);

  // --- Auto-comprobación cuando se completa la palabra ---
  useEffect(() => {
    if (status !== 'playing' || !currentWord) return;
    if (formedWord.length !== currentWord.letters.length) return;
    if (autoCheckRef.current) clearTimeout(autoCheckRef.current);

    autoCheckRef.current = setTimeout(() => {
      if (formedWord === currentWord.letters) {
        // ¡Correcto!
        const cfg = MODE_CONFIG[gameMode];
        const basePoints = currentWord.letters.length * 100;
        const streakBonus = 1 + streak * 0.15; // 1x, 1.15x, 1.3x, 1.45x...
        const timeBonus = cfg.timer ? Math.max(0, timeLeft * 8) : 0;
        const gained = Math.round(basePoints * streakBonus + timeBonus);
        setScore((s) => s + gained);
        setLastGain({ value: gained, key: Date.now() });
        setStreak((s) => {
          const next = s + 1;
          setMaxStreak((m) => Math.max(m, next));
          return next;
        });
        setCorrectCount((c) => c + 1);
        setStatus('correct');
        // Confetti pequeño
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.55 },
          colors: tiles.map((t) => t.color).slice(0, 6),
        });
      } else {
        // ¡Incorrecto!
        setStatus('wrong');
        setLives((l) => l - 1);
        setStreak(0);
      }
    }, 350);
    return () => { if (autoCheckRef.current) clearTimeout(autoCheckRef.current); };
  }, [formedWord, currentWord, status, gameMode, streak, timeLeft, tiles]);

  // --- Auto-avance tras correcto/incorrecto ---
  useEffect(() => {
    if (status !== 'correct' && status !== 'wrong') return;
    const cfg = MODE_CONFIG[gameMode];
    const delay = status === 'correct' ? 1200 : 1800;
    const t = setTimeout(() => {
      if (status === 'wrong' && lives <= 0) {
        setStatus('lost');
        return;
      }
      if (currentIndex + 1 >= questions.length) {
        setStatus(status === 'wrong' && lives <= 0 ? 'lost' : 'won');
        return;
      }
      setCurrentIndex((i) => i + 1);
      setTiles(buildTiles(questions[currentIndex + 1]));
      setStatus('playing');
    }, delay);
    return () => clearTimeout(t);
  }, [status, lives, currentIndex, questions, gameMode, buildTiles]);

  // --- Tracking al terminar ---
  useEffect(() => {
    if ((status !== 'won' && status !== 'lost') || trackedRef.current) return;
    trackedRef.current = true;
    if (status === 'won') {
      confetti({
        particleCount: 240,
        spread: 120,
        origin: { y: 0.5 },
        colors: ['#a855f7', '#ec4899', '#fbbf24', '#10b981', '#3b82f6'],
      });
    }
    onGameComplete?.({
      mode: gameMode === 'exam' ? 'test' : 'practice',
      score,
      maxScore: questions.length * 1000,
      correctAnswers: correctCount,
      totalQuestions: questions.length || 1,
      durationSeconds: 0,
    });
  }, [status, score, correctCount, questions.length, gameMode, onGameComplete]);

  // --- Render ---
  if (loading) {
    return (
      <div className="anag-root">
        <div className="anag-card">
          <div className="anag-loading">Cargando anagramas...</div>
        </div>
      </div>
    );
  }

  if (allWords.length < 3) {
    return (
      <div className="anag-root">
        <div className="anag-card">
          <div className="anag-title">
            <span>🔀</span> Anagramas
          </div>
          <div className="anag-empty">
            <p>No hay suficientes palabras disponibles para esta asignatura.</p>
          </div>
        </div>
      </div>
    );
  }

  const cfg = MODE_CONFIG[gameMode];
  const isFinished = status === 'won' || status === 'lost';
  const multiplier = (1 + streak * 0.15).toFixed(2);

  return (
    <div className="anag-root">
      <motion.div
        className="anag-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="anag-header">
          <div className="anag-title">
            <span className="anag-emoji">🔀</span>
            <span>Anagramas</span>
          </div>
          <div className="anag-stats">
            {cfg.timer && !isFinished && (
              <div className={`anag-stat timer ${timeLeft <= 10 ? 'danger' : ''}`}>
                <Timer size={14} />
                <span>{timeLeft}s</span>
              </div>
            )}
            <div className="anag-stat lives">
              {Array.from({ length: cfg.lives }).map((_, i) => (
                <Heart
                  key={i}
                  size={14}
                  fill={i < lives ? '#ef4444' : 'none'}
                  stroke={i < lives ? '#ef4444' : '#d1d5db'}
                />
              ))}
            </div>
            <div className="anag-stat streak">
              <Flame size={14} />
              <span>{streak}</span>
            </div>
            <div className="anag-stat score">
              <Star size={14} />
              <span>{score}</span>
            </div>
          </div>
        </div>

        <div className="anag-subtitle">
          {subjectInfo.icon} {subjectInfo.nombre || 'General'}
        </div>

        {/* Tabs modo */}
        <div className="anag-gamemode-tabs">
          {Object.entries(MODE_CONFIG).map(([key, c]) => (
            <button
              key={key}
              className={`anag-gamemode-tab ${gameMode === key ? 'active' : ''} ${key}`}
              onClick={() => setGameMode(key)}
            >
              <span className="anag-tab-icon">{c.icon}</span>
              <span className="anag-tab-label">{c.label}</span>
              <span className="anag-tab-sub">{c.questions} palabras</span>
            </button>
          ))}
        </div>

        {/* Pantalla final */}
        <AnimatePresence>
          {isFinished && (
            <motion.div
              className={`anag-result ${status}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="anag-result-icon">
                {status === 'won' ? <Trophy size={48} /> : <Award size={48} />}
              </div>
              <h2 className="anag-result-title">
                {status === 'won' ? '¡Partida completada! 🎉' : '¡Se acabó!'}
              </h2>
              <div className="anag-result-score">{score}</div>
              <div className="anag-result-score-label">puntos</div>
              <div className="anag-result-stats">
                <div className="anag-result-stat">
                  <Check size={14} /> {correctCount} / {questions.length} aciertos
                </div>
                <div className="anag-result-stat">
                  <Flame size={14} /> Racha máxima: {maxStreak}
                </div>
              </div>
              <button className="anag-btn primary" onClick={startGame}>
                <RefreshCw size={16} /> Jugar otra vez
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Juego */}
        {!isFinished && currentWord && (
          <>
            {/* Progreso */}
            <div className="anag-progress">
              {questions.map((_, i) => (
                <div
                  key={i}
                  className={`anag-progress-dot ${
                    i < currentIndex ? 'done' : i === currentIndex ? 'current' : ''
                  }`}
                />
              ))}
            </div>

            <div className="anag-question-meta">
              <span className="anag-question-num">
                Palabra {currentIndex + 1} / {questions.length}
              </span>
              <span className="anag-question-len">
                {currentWord.letters.length} letras
              </span>
              {streak >= 2 && (
                <motion.span
                  className="anag-multiplier"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  key={streak}
                >
                  ×{multiplier}
                </motion.span>
              )}
            </div>

            {/* Pista */}
            {(hintVisible || cfg.showHintByDefault) && currentWord.clue && (
              <motion.div
                className="anag-hint"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Lightbulb size={16} />
                <span>{currentWord.clue}</span>
              </motion.div>
            )}

            <LayoutGroup>
              {/* Slots (la palabra a completar) */}
              <div className="anag-slots-wrap">
                <div className="anag-slots">
                  {slots.map((tile, idx) => (
                    <div key={`slot-${idx}`} className="anag-slot">
                      <AnimatePresence mode="popLayout">
                        {tile && (
                          <motion.button
                            key={tile.id}
                            layoutId={tile.id}
                            className={`anag-tile placed ${
                              status === 'correct' ? 'correct' : ''
                            } ${status === 'wrong' ? 'wrong' : ''}`}
                            style={{ background: tile.color }}
                            onClick={() => removeTile(tile.id)}
                            whileHover={{ y: -3 }}
                            whileTap={{ scale: 0.92 }}
                            transition={{
                              type: 'spring',
                              stiffness: 500,
                              damping: 30,
                            }}
                          >
                            {tile.letter}
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>

                {/* Floating +points */}
                <AnimatePresence>
                  {lastGain && status === 'correct' && (
                    <motion.div
                      key={lastGain.key}
                      className="anag-gain"
                      initial={{ opacity: 0, y: 0, scale: 0.5 }}
                      animate={{ opacity: 1, y: -50, scale: 1.2 }}
                      exit={{ opacity: 0, y: -80 }}
                      transition={{ duration: 1.2 }}
                    >
                      +{lastGain.value}
                      <Sparkles size={14} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Banco de letras */}
              <div className="anag-bank">
                {bank.map((tile) => (
                  <motion.button
                    key={tile.id}
                    layoutId={tile.id}
                    className="anag-tile"
                    style={{ background: tile.color }}
                    onClick={() => placeTile(tile.id)}
                    whileHover={{ y: -4, rotate: [-2, 2, -2, 0] }}
                    whileTap={{ scale: 0.92 }}
                    transition={{
                      type: 'spring',
                      stiffness: 500,
                      damping: 30,
                    }}
                  >
                    {tile.letter}
                  </motion.button>
                ))}
                {bank.length === 0 && status === 'playing' && (
                  <div className="anag-bank-empty">Comprobando...</div>
                )}
              </div>
            </LayoutGroup>

            {/* Comodines */}
            <div className="anag-lifelines">
              <button
                className="anag-lifeline"
                onClick={useHint}
                disabled={helpsRemaining.hint <= 0 || hintVisible}
                title="Ver definición"
              >
                <Lightbulb size={16} />
                <span>Pista</span>
                {helpsRemaining.hint !== Infinity && (
                  <span className="anag-lifeline-count">{helpsRemaining.hint}</span>
                )}
              </button>
              <button
                className="anag-lifeline"
                onClick={revealFirstLetter}
                disabled={
                  helpsRemaining.firstLetter <= 0 ||
                  revealedFirst ||
                  status !== 'playing'
                }
                title="Colocar la primera letra"
              >
                <Zap size={16} />
                <span>1ª letra</span>
                {helpsRemaining.firstLetter !== Infinity && (
                  <span className="anag-lifeline-count">{helpsRemaining.firstLetter}</span>
                )}
              </button>
              <button
                className="anag-lifeline"
                onClick={reshuffleBank}
                disabled={status !== 'playing'}
                title="Reordenar letras del banco"
              >
                <Shuffle size={16} />
                <span>Mezclar</span>
              </button>
              <button
                className="anag-lifeline"
                onClick={skipWord}
                disabled={helpsRemaining.skip <= 0 || status !== 'playing'}
                title="Saltar esta palabra"
              >
                <SkipForward size={16} />
                <span>Saltar</span>
                {helpsRemaining.skip !== Infinity && (
                  <span className="anag-lifeline-count">{helpsRemaining.skip}</span>
                )}
              </button>
            </div>

            {/* Feedback visual */}
            <AnimatePresence>
              {status === 'wrong' && (
                <motion.div
                  className="anag-feedback wrong"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <X size={16} />
                  <span>Solución: <strong>{currentWord.original}</strong></span>
                </motion.div>
              )}
              {status === 'correct' && (
                <motion.div
                  className="anag-feedback correct"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <Check size={16} />
                  <span>¡{currentWord.original}!</span>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default Anagramas;
