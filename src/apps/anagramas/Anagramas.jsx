// src/apps/anagramas/Anagramas.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Shuffle, Lightbulb, Zap, RefreshCw, Timer,
  Award, Gamepad2, GraduationCap, Flame, Trophy, Sparkles, Check, X, Star, BookOpen,
} from 'lucide-react';
import { getRoscoData } from '../../services/gameDataService';
import materiasData from '../../../public/data/materias.json';
import InstructionsModal, { InstructionsButton } from '../_shared/InstructionsModal';
import './Anagramas.css';

// --- Paleta de colores para las fichas (se baraja al inicio de cada partida) ---
const TILE_PALETTE = [
  '#a855f7', '#ec4899', '#f59e0b', '#10b981',
  '#3b82f6', '#06b6d4', '#f97316', '#8b5cf6',
  '#14b8a6', '#ef4444', '#6366f1', '#84cc16',
  '#d946ef', '#0ea5e9', '#f43f5e', '#22c55e',
];

// Todos los modos: 10 palabras, 30s por palabra, sin vidas, sin saltos.
// Si se acaba el tiempo o el alumno pulsa "Comprobar" con la palabra incorrecta,
// cuenta como fallo y pasa automaticamente a la siguiente.
// La diferencia entre modos es solo la cantidad de ayudas disponibles:
const MODE_CONFIG = {
  easy: {
    label: 'Fácil',
    icon: '🟢',
    questions: 10,
    minLen: 3,
    maxLen: 8,
    // 10 pistas -> una por cada palabra.
    helpsAvailable: { hint: 10, firstLetter: 5, reshuffle: Infinity, skip: 0 },
    showHintByDefault: true,
    timer: 30,
  },
  medium: {
    label: 'Medio',
    icon: '🟡',
    questions: 10,
    minLen: 4,
    maxLen: 10,
    helpsAvailable: { hint: 5, firstLetter: 5, reshuffle: Infinity, skip: 0 },
    showHintByDefault: false,
    timer: 30,
  },
  exam: {
    label: 'Examen',
    icon: '🔴',
    questions: 10,
    minLen: 4,
    maxLen: 12,
    helpsAvailable: { hint: 2, firstLetter: 2, reshuffle: Infinity, skip: 0 },
    showHintByDefault: false,
    timer: 30,
  },
};

const normalize = (s) =>
  String(s || '')
    .toUpperCase()
    .replace(/Ñ/g, '\u0001')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\u0001/g, 'Ñ')
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
  // 'select' = pantalla de dificultad; 'playing' = partida en curso/terminada.
  // Solo se inicializa una partida al pasar de 'select' a 'playing', asi evitamos
  // que un cambio de modo reinicie la partida sin querer.
  const [phase, setPhase] = useState('select');
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [status, setStatus] = useState('idle'); // idle|playing|correct|wrong|won

  // Fichas: {id, letter, color, placedAt}
  const [tiles, setTiles] = useState([]);

  // Gamification
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

  // Instrucciones
  const [showHelp, setShowHelp] = useState(false);
  // Material de estudio
  const [showStudy, setShowStudy] = useState(false);
  const [selectedStudyLetter, setSelectedStudyLetter] = useState(null);

  // Agrupa todas las palabras por primera letra para el modal de estudio.
  const studySections = useMemo(() => {
    if (!allWords.length) return [];
    const map = {};
    for (const w of allWords) {
      const L = (w.letra || normalize(w.original).charAt(0) || '').toUpperCase();
      if (!L) continue;
      if (!map[L]) map[L] = [];
      // Deduplicar por palabra (ignora mayusculas/tildes)
      if (!map[L].find((x) => x.letters === w.letters)) {
        map[L].push(w);
      }
    }
    return Object.entries(map)
      .map(([letra, items]) => ({
        letra,
        items: items.sort((a, b) => a.original.localeCompare(b.original, 'es')),
      }))
      .sort((a, b) => a.letra.localeCompare(b.letra, 'es'));
  }, [allWords]);

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
                letra: (it.letra || normalize(it.solucion).charAt(0) || '').toUpperCase(),
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

  // Arranca partida SOLO cuando el alumno entra en 'playing'. Los cambios de
  // gameMode en la pantalla de seleccion NO inician partida; asi no se reinicia
  // cada vez que tocas otra dificultad.
  useEffect(() => {
    if (phase === 'playing' && !loading && allWords.length > 0 && questions.length === 0) {
      startGame();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, loading, allWords.length]);

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
        const basePoints = 100;
        const streakMultiplier = 1 + streak * 0.15;
        // Bonus fuerte por velocidad: hasta +200 por palabra si resuelves rapido.
        const timeBonus = cfg.timer ? Math.max(0, Math.round(200 * (timeLeft / cfg.timer))) : 0;
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
        // Confetti pequeño
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.55 },
          colors: tiles.map((t) => t.color).slice(0, 6),
        });
      } else {
        // ¡Incorrecto! Sin vidas: solo rompe la racha y pasa a la siguiente.
        setStatus('wrong');
        setStreak(0);
      }
    }, 350);
    return () => { if (autoCheckRef.current) clearTimeout(autoCheckRef.current); };
  }, [formedWord, currentWord, status, gameMode, streak, timeLeft, tiles]);

  // --- Auto-avance tras correcto/incorrecto ---
  // Sin vidas: un fallo o acierto simplemente avanza a la siguiente. La partida
  // solo termina cuando se completan las 10 palabras (status='won').
  useEffect(() => {
    if (status !== 'correct' && status !== 'wrong') return;
    const delay = status === 'correct' ? 1200 : 1800;
    const t = setTimeout(() => {
      if (currentIndex + 1 >= questions.length) {
        setStatus('won');
        return;
      }
      setCurrentIndex((i) => i + 1);
      setTiles(buildTiles(questions[currentIndex + 1]));
      setStatus('playing');
    }, delay);
    return () => clearTimeout(t);
  }, [status, currentIndex, questions, gameMode, buildTiles]);

  // --- Tracking al terminar ---
  useEffect(() => {
    if (status !== 'won' || trackedRef.current) return;
    trackedRef.current = true;
    if (status === 'won') {
      confetti({
        particleCount: 240,
        spread: 120,
        origin: { y: 0.5 },
        colors: ['#a855f7', '#ec4899', '#fbbf24', '#10b981', '#3b82f6'],
      });
    }
    const isExamMode = gameMode === 'exam';
    // Max teorico por palabra: 100*(1+9*0.15) + 200 = 435. Usamos 450 como referencia
    // para el ratio score/maxScore (ranking). La nota es correctos/10 * 10.
    onGameComplete?.({
      mode: isExamMode ? 'test' : 'practice',
      score,
      maxScore: questions.length * 450,
      correctAnswers: correctCount,
      totalQuestions: questions.length || 1,
      durationSeconds: cfg.timer ? (cfg.timer * questions.length - timeLeft) : 0,
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
  const isFinished = status === 'won';
  const multiplier = (1 + streak * 0.15).toFixed(2);

  // Nota sobre 10 (solo relevante en examen, pero la calculamos siempre)
  const nota = questions.length > 0
    ? Math.round((correctCount / questions.length) * 100) / 10
    : 0;
  const notaColor = nota >= 8 ? 'excellent' : nota >= 5 ? 'good' : 'fail';
  const notaMsg = nota >= 9 ? '¡Excelente! 🌟'
    : nota >= 7 ? '¡Muy bien! 👏'
    : nota >= 5 ? 'Aprobado. Sigue practicando 💪'
    : 'Necesitas repasar más 📖';

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
            <InstructionsButton onClick={() => setShowHelp(true)} />
          </div>
          <div className="anag-header-right">
            <div className="anag-toolbar">
              <button
                type="button"
                className="anag-study-btn"
                onClick={() => {
                  if (studySections.length > 0 && !selectedStudyLetter) {
                    setSelectedStudyLetter(studySections[0].letra);
                  }
                  setShowStudy(true);
                }}
                title="Ver material de estudio"
              >
                <BookOpen size={16} />
                <span>Ver material de estudio</span>
              </button>
              {phase === 'playing' && (
                <button
                  type="button"
                  className="anag-mode-change"
                  onClick={() => {
                    setPhase('select');
                    setQuestions([]);
                    setStatus('idle');
                  }}
                  title="Cambiar de dificultad"
                >
                  <RefreshCw size={16} />
                  <span>Cambiar modo</span>
                </button>
              )}
            </div>
            <div className="anag-stats">
              {cfg.timer && !isFinished && (
                <div className={`anag-stat timer ${timeLeft <= 10 ? 'danger' : ''}`}>
                  <Timer size={14} />
                  <span>{timeLeft}s</span>
                </div>
              )}
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
        </div>

        <div className="anag-subtitle">
          {subjectInfo.icon} {subjectInfo.nombre || 'General'}
          {phase === 'playing' && (
            <span className="anag-mode-badge">
              {cfg.icon} {cfg.label}
            </span>
          )}
        </div>

        {/* Pantalla de seleccion de dificultad (antes de jugar) */}
        {phase === 'select' && (
          <div className="anag-select">
            <h3 className="anag-select-title">Elige tu dificultad</h3>
            <p className="anag-select-sub">
              Todos los modos tienen 10 palabras y 30 s por palabra. Cambia solo el número de ayudas disponibles.
            </p>
            <div className="anag-select-grid">
              {Object.entries(MODE_CONFIG).map(([key, c]) => (
                <button
                  key={key}
                  className={`anag-select-card ${key} ${gameMode === key ? 'active' : ''}`}
                  onClick={() => setGameMode(key)}
                >
                  <span className="anag-select-icon">{c.icon}</span>
                  <span className="anag-select-label">{c.label}</span>
                  <ul className="anag-select-helps">
                    <li><Lightbulb size={12} /> {c.helpsAvailable.hint} pistas</li>
                    <li><Zap size={12} /> {c.helpsAvailable.firstLetter} · 1ª letra</li>
                    <li><Shuffle size={12} /> Mezclar ilimitado</li>
                  </ul>
                </button>
              ))}
            </div>
            <button
              className="anag-btn primary anag-select-start"
              onClick={() => setPhase('playing')}
              disabled={loading || allWords.length < 3}
            >
              <GraduationCap size={18} /> ¡Empezar partida!
            </button>
          </div>
        )}

        {/* Pantalla final */}
        <AnimatePresence>
          {phase === 'playing' && isFinished && (
            <motion.div
              className={`anag-result ${status}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="anag-result-icon">
                <Trophy size={48} />
              </div>
              <h2 className="anag-result-title">¡Partida completada! 🎉</h2>

              {/* Nota principal sobre 10 */}
              <div className={`anag-nota ${notaColor}`}>
                <div className="anag-nota-big">
                  {nota.toFixed(1)}
                  <span className="anag-nota-small">/10</span>
                </div>
                <div className="anag-nota-msg">{notaMsg}</div>
              </div>
              {/* Puntos: dependen de la velocidad */}
              <div className="anag-result-record">
                <Star size={16} />
                <span className="anag-result-record-value">{score.toLocaleString('es-ES')}</span>
                <span className="anag-result-record-label">puntos · ¡supérate!</span>
              </div>

              <div className="anag-result-stats">
                <div className="anag-result-stat">
                  <Check size={14} /> {correctCount} / {questions.length} aciertos
                </div>
                <div className="anag-result-stat">
                  <Flame size={14} /> Racha máxima: {maxStreak}
                </div>
              </div>
              <div className="anag-result-actions">
                <button className="anag-btn primary" onClick={startGame}>
                  <RefreshCw size={16} /> Jugar otra vez
                </button>
                <button
                  className="anag-btn ghost"
                  onClick={() => {
                    setPhase('select');
                    setQuestions([]);
                    setStatus('idle');
                    trackedRef.current = false;
                  }}
                >
                  Cambiar dificultad
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Juego */}
        {phase === 'playing' && !isFinished && currentWord && (
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
                <div className={`anag-slots ${status === 'wrong' ? 'shake' : ''}`}>
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
                            whileHover={{ y: -4, rotate: 4, scale: 1.04 }}
                            whileTap={{ scale: 0.88, rotate: -6 }}
                            // Al caer en el slot: giro rapido + asentamiento con rebote.
                            initial={{ rotate: 0 }}
                            // Secuencia de "onda" al acertar: cada letra rota/rebota con retraso.
                            animate={
                              status === 'correct'
                                ? {
                                    y: [0, -14, 0],
                                    rotate: [0, 8, -6, 0],
                                    scale: [1, 1.18, 1],
                                    transition: {
                                      duration: 0.7,
                                      delay: idx * 0.08,
                                      ease: 'easeInOut',
                                    },
                                  }
                                : status === 'wrong'
                                ? {
                                    x: [0, -6, 6, -4, 4, 0],
                                    rotate: [0, -3, 3, -2, 2, 0],
                                    transition: { duration: 0.45 },
                                  }
                                : { y: 0, rotate: 0, scale: 1 }
                            }
                            transition={{
                              type: 'spring',
                              stiffness: 420,
                              damping: 22,
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
                {bank.map((tile, i) => (
                  <motion.button
                    key={tile.id}
                    layoutId={tile.id}
                    className="anag-tile anag-tile-bank"
                    style={{ background: tile.color }}
                    onClick={() => placeTile(tile.id)}
                    // Animacion ociosa: flotan sutilmente con ritmos distintos por tile.
                    animate={{
                      y: [0, -3, 0, 2, 0],
                      rotate: [0, -1.2, 0, 1.2, 0],
                    }}
                    transition={{
                      y: { duration: 3 + (i % 3) * 0.4, repeat: Infinity, ease: 'easeInOut' },
                      rotate: { duration: 3 + (i % 3) * 0.4, repeat: Infinity, ease: 'easeInOut' },
                      layout: { type: 'spring', stiffness: 420, damping: 24 },
                    }}
                    whileHover={{ y: -6, scale: 1.08, rotate: 0 }}
                    whileTap={{ scale: 0.88, rotate: -8 }}
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

      <InstructionsModal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        title="Cómo jugar a Anagramas"
      >
        <h3>🎯 Objetivo</h3>
        <p>
          Reordena las <strong>fichas de colores</strong> para formar la palabra correcta
          del vocabulario. Cada letra tiene un color único que cambia cada partida.
        </p>

        <h3>🕹️ Cómo se juega</h3>
        <ul>
          <li><strong>Click en una ficha del banco</strong> → vuela al siguiente hueco libre.</li>
          <li><strong>Click en una ficha ya colocada</strong> → vuelve al banco.</li>
          <li>Cuando rellenas todos los huecos, se comprueba automáticamente.</li>
          <li>Si aciertas: las fichas bailan y confetti. Si fallas: se agitan en rojo.</li>
        </ul>

        <h3>🔥 Racha y multiplicador</h3>
        <p>
          Aciertos consecutivos suben un <strong>multiplicador ×1.15</strong> por cada racha.
          Un fallo lo resetea. A más velocidad, más puntos.
        </p>
        <p className="instr-formula">
          <strong>Puntos</strong> = 100 × multiplicador + bonus de tiempo restante
        </p>

        <h3>🪄 Comodines</h3>
        <ul>
          <li><strong>💡 Pista</strong> — muestra la definición de la palabra.</li>
          <li><strong>⚡ 1ª letra</strong> — coloca automáticamente la primera letra.</li>
          <li><strong>🔀 Mezclar</strong> — reordena el banco de letras (sin límite).</li>
        </ul>
        <p>
          Los contadores en rojo arriba de cada botón indican cuántos usos te quedan en la partida.
        </p>

        <h3>🎓 Niveles de dificultad</h3>
        <p className="instr-note">
          En todos los niveles: <strong>10 palabras</strong>, <strong>30 s</strong> por palabra.
          Si fallas o se acaba el tiempo, pasas a la siguiente (sin vidas, sin saltos).
        </p>
        <div className="instr-modes">
          <div className="instr-mode easy">
            <strong>🟢 Fácil</strong>
            10 pistas de definición, 5 de 1ª letra.
          </div>
          <div className="instr-mode medium">
            <strong>🟡 Medio</strong>
            5 pistas de definición, 5 de 1ª letra.
          </div>
          <div className="instr-mode exam">
            <strong>🔴 Examen</strong>
            2 pistas de definición, 2 de 1ª letra.
          </div>
        </div>

        <div className="instr-tips">
          <strong>💡 Consejo:</strong> si no encuentras la palabra, pulsa <kbd>🔀 Mezclar</kbd>
          para que el banco se baraje de otra forma — a veces ayuda a ver la palabra más claro.
        </div>
      </InstructionsModal>

      {/* Modal: material de estudio */}
      <AnimatePresence>
        {showStudy && (
          <motion.div
            className="anag-study-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowStudy(false)}
          >
            <motion.div
              className="anag-study-modal"
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="anag-study-header">
                <div className="anag-study-title">
                  <BookOpen size={20} />
                  <h2>Material de estudio</h2>
                </div>
                <button
                  className="anag-study-close"
                  onClick={() => setShowStudy(false)}
                  aria-label="Cerrar"
                >
                  <X size={18} />
                </button>
              </div>
              <p className="anag-study-sub">
                {subjectInfo.icon} {subjectInfo.nombre || 'General'} · repasa este vocabulario
                para formar los anagramas más rápido.
              </p>

              {studySections.length === 0 ? (
                <div className="anag-study-empty">
                  No hay palabras disponibles para esta asignatura.
                </div>
              ) : (
                <>
                  <div className="anag-study-letters">
                    {studySections.map((sec) => (
                      <button
                        key={sec.letra}
                        className={`anag-study-letter ${selectedStudyLetter === sec.letra ? 'active' : ''}`}
                        onClick={() => setSelectedStudyLetter(sec.letra)}
                      >
                        {sec.letra}
                        <span className="anag-study-letter-count">{sec.items.length}</span>
                      </button>
                    ))}
                  </div>
                  <div className="anag-study-content">
                    {studySections
                      .find((s) => s.letra === selectedStudyLetter)
                      ?.items.map((w, i) => (
                        <div key={`${w.letters}-${i}`} className="anag-study-item">
                          <div className="anag-study-word">{w.original}</div>
                          {w.clue && <div className="anag-study-clue">{w.clue}</div>}
                        </div>
                      ))}
                  </div>
                </>
              )}

              <button
                className="anag-btn primary anag-study-done"
                onClick={() => setShowStudy(false)}
              >
                ¡Entendido, a jugar!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Anagramas;
