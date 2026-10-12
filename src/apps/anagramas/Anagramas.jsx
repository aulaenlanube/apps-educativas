// src/apps/anagramas/Anagramas.jsx
// Rediseño 2026 sobre el kit de interfaz de juego (_shared/kit): pantalla previa
// de modos, atril oscuro con huecos hundidos, fichas de colores con volumen y
// resumen con la nota /10. La lógica de juego, puntos y tracking no cambia.
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Shuffle, Lightbulb, Zap, RefreshCw, Timer,
  Flame, Trophy, Sparkles, Check, X, Star, BookOpen,
  LayoutGrid, Hash, Type, Target, EyeOff,
} from 'lucide-react';
import { getRoscoData } from '../../services/gameDataService';
import materiasData from '../../../public/data/materias.json';
import InstructionsModal from '../_shared/InstructionsModal';
import {
  GameShell, GameHeader, Hud, HudStat, ProgressDots, ProgressBar, Panel, Chip,
  GameButton, ModeSelect, ModeChip, RoundBanner, ResultsScreen, FeedbackItem,
  GameLoading, GameEmpty, GradeRing, notaMessage, notaTone,
} from '../_shared/kit';
import useArtIds from '@/components/art/useArtIds';
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
    // eslint-disable-next-line no-control-regex -- marcador temporal intencionado
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deps originales (no tocar tracking)
  }, [status, score, correctCount, questions.length, gameMode, onGameComplete]);

  // --- Resultado de cada palabra (solo presentación: puntos de progreso y repaso) ---
  const [roundResults, setRoundResults] = useState([]);
  useEffect(() => { setRoundResults([]); }, [questions]);
  useEffect(() => {
    if (status !== 'correct' && status !== 'wrong') return;
    setRoundResults((prev) => {
      const next = [...prev];
      next[currentIndex] = status === 'correct';
      return next;
    });
  }, [status, currentIndex]);

  // --- Render ---
  const shellProps = { accent: '#d946ef', accent2: '#8b5cf6' };

  const openStudy = () => {
    if (studySections.length > 0 && !selectedStudyLetter) {
      setSelectedStudyLetter(studySections[0].letra);
    }
    setShowStudy(true);
  };

  // Modales compartidos por todas las pantallas (instrucciones y material de estudio)
  const modals = (
    <>
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
          El número de cada botón indica cuántos usos te quedan en la partida.
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
            className="anag-study"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowStudy(false)}
          >
            <motion.div
              className="anag-study__panel"
              role="dialog"
              aria-modal="true"
              aria-label="Material de estudio"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 340, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
            >
              <header className="anag-study__head">
                <span className="anag-study__icon"><BookOpen size={20} /></span>
                <div className="anag-study__titles">
                  <h2>Material de estudio</h2>
                  <p>
                    {subjectInfo.icon} {subjectInfo.nombre || 'General'} · repasa este vocabulario
                    para formar los anagramas más rápido.
                  </p>
                </div>
                <button
                  type="button"
                  className="anag-study__close"
                  onClick={() => setShowStudy(false)}
                  aria-label="Cerrar"
                >
                  <X size={18} />
                </button>
              </header>

              {studySections.length === 0 ? (
                <div className="anag-study__empty">
                  No hay palabras disponibles para esta asignatura.
                </div>
              ) : (
                <>
                  <div className="anag-study__letters">
                    {studySections.map((sec) => (
                      <button
                        key={sec.letra}
                        type="button"
                        className={`anag-study__letter ${selectedStudyLetter === sec.letra ? 'is-active' : ''}`}
                        onClick={() => setSelectedStudyLetter(sec.letra)}
                      >
                        {sec.letra}
                        <span className="anag-study__count">{sec.items.length}</span>
                      </button>
                    ))}
                  </div>
                  <div className="anag-study__list">
                    {studySections
                      .find((s) => s.letra === selectedStudyLetter)
                      ?.items.map((w, i) => (
                        <div key={`${w.letters}-${i}`} className="anag-study__item">
                          <div className="anag-study__word">{w.original}</div>
                          {w.clue && <div className="anag-study__clue">{w.clue}</div>}
                        </div>
                      ))}
                  </div>
                </>
              )}

              <div className="anag-study__foot">
                <GameButton variant="primary" icon={Check} onClick={() => setShowStudy(false)}>
                  ¡Entendido, a jugar!
                </GameButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  if (loading) {
    return (
      <GameShell {...shellProps}>
        <GameLoading label="Barajando las fichas…" />
      </GameShell>
    );
  }

  if (allWords.length < 3) {
    return (
      <GameShell {...shellProps}>
        <GameHeader onHelp={() => setShowHelp(true)} />
        <GameEmpty title="Faltan palabras">
          No hay suficientes palabras disponibles para esta asignatura.
        </GameEmpty>
        {modals}
      </GameShell>
    );
  }

  // --- Pantalla previa: elegir dificultad (CLAUDE.md §3) ---
  if (phase === 'select') {
    const MODE_COPY = {
      easy: {
        desc: 'La definición siempre a la vista y ayudas de sobra para empezar.',
        features: ['Definición siempre visible', '10 pistas · 5 primeras letras', 'Palabras de 3 a 8 letras'],
      },
      medium: {
        desc: 'Palabras más largas; la definición solo aparece si la pides.',
        features: ['5 pistas · 5 primeras letras', 'Palabras de 4 a 10 letras', 'Mezclar sin límite'],
      },
      exam: {
        desc: 'Palabras de hasta 12 letras y muy pocas ayudas. Cuenta para tus tareas.',
        features: ['Nota sobre 10', '2 pistas · 2 primeras letras', 'Puntos por racha y rapidez'],
      },
    };
    const modes = Object.entries(MODE_CONFIG).map(([key, c]) => ({
      id: key,
      tone: key,
      title: c.label,
      desc: MODE_COPY[key].desc,
      features: MODE_COPY[key].features,
    }));
    const selectMode = (key) => {
      setGameMode(key);
      setPhase('playing');
    };
    return (
      <GameShell {...shellProps}>
        <ModeSelect
          modes={modes}
          onSelect={selectMode}
          onHelp={() => setShowHelp(true)}
          onStudy={openStudy}
          footer={<span className="anag-modes-foot"><Timer size={14} /> Todos los modos: 10 palabras · 30 s por palabra · sin vidas</span>}
        />
        {modals}
      </GameShell>
    );
  }

  const cfg = MODE_CONFIG[gameMode];
  const isFinished = status === 'won';
  const isExam = gameMode === 'exam';
  const multiplier = (1 + streak * 0.15).toFixed(2);

  // Nota sobre 10 (solo relevante en examen, pero la calculamos siempre)
  const nota = questions.length > 0
    ? Math.round((correctCount / questions.length) * 100) / 10
    : 0;

  const backToModesFromResults = () => {
    setPhase('select');
    setQuestions([]);
    setStatus('idle');
    trackedRef.current = false;
  };

  // --- Partida terminada ---
  if (isFinished) {
    const wordReview = questions.map((q, i) => (
      <FeedbackItem key={`${q.letters}-${i}`} index={i + 1} ok={roundResults[i] === true} title={q.original}>
        {q.clue || null}
      </FeedbackItem>
    ));
    const stats = [
      { icon: Target, tone: 'good', label: 'Aciertos', value: `${correctCount}/${questions.length}` },
      { icon: Flame, tone: 'streak', label: 'Racha máxima', value: maxStreak },
    ];
    const actions = [
      { label: 'Jugar otra vez', onClick: startGame, icon: RefreshCw },
      { label: 'Cambiar dificultad', onClick: backToModesFromResults, icon: LayoutGrid, variant: 'soft' },
    ];
    return (
      <GameShell {...shellProps}>
        {isExam ? (
          <ResultsScreen
            subtitle={`Anagramas · ${subjectInfo.icon} ${subjectInfo.nombre || 'General'}`}
            nota={nota}
            points={score}
            stats={stats}
            actions={actions}
          >
            {wordReview}
          </ResultsScreen>
        ) : (
          <PracticeSummary
            mode={gameMode}
            modeLabel={cfg.label}
            subtitle={`${subjectInfo.icon} ${subjectInfo.nombre || 'General'}`}
            nota={nota}
            points={score}
            stats={stats}
            actions={actions}
            words={questions.map((q, i) => ({ word: q.original, ok: roundResults[i] === true }))}
          />
        )}
        {modals}
      </GameShell>
    );
  }

  // --- Sin palabras para esta dificultad (o preparando la primera) ---
  if (!currentWord) {
    const available = allWords.filter(
      (w) => w.letters.length >= cfg.minLen && w.letters.length <= cfg.maxLen
    ).length;
    return (
      <GameShell {...shellProps}>
        <GameHeader mode={gameMode} modeLabel={cfg.label} onHelp={() => setShowHelp(true)} onStudy={openStudy} />
        {available === 0 ? (
          <GameEmpty
            title="No hay palabras para este nivel"
            action={<GameButton variant="soft" icon={LayoutGrid} onClick={backToModesFromResults}>Elegir otro modo</GameButton>}
          >
            Prueba con otra dificultad: las palabras de esta asignatura no encajan en este tamaño.
          </GameEmpty>
        ) : (
          <GameLoading label="Barajando las fichas…" />
        )}
        {modals}
      </GameShell>
    );
  }

  const len = currentWord.letters.length;
  const nextSlot = status === 'playing' ? slots.findIndex((s) => !s) : -1;
  const timeTone = timeLeft > 15 ? 'good' : timeLeft > 7 ? 'warn' : 'bad';
  const clueVisible = (hintVisible || cfg.showHintByDefault) && currentWord.clue;
  const roundOver = status === 'correct' || status === 'wrong';

  return (
    <GameShell {...shellProps}>
      <GameHeader
        mode={gameMode}
        modeLabel={cfg.label}
        onHelp={() => setShowHelp(true)}
        onStudy={openStudy}
        right={(
          <Hud>
            {cfg.timer && (
              <HudStat icon={Timer} tone={timeLeft <= 10 ? 'lives' : 'time'} value={`${timeLeft}s`} label="Tiempo" />
            )}
            <HudStat icon={Flame} tone="streak" value={streak} label="Racha" />
            <HudStat icon={Star} tone="score" value={score.toLocaleString('es-ES')} label="Puntos" />
          </Hud>
        )}
      />

      <ProgressDots total={questions.length} current={currentIndex} results={roundResults} />

      <div className="anag-stage">
        <div className="anag-meta">
          <Chip tone="accent" icon={Type}>Palabra {currentIndex + 1} de {questions.length}</Chip>
          <Chip icon={Hash}>{len} letras</Chip>
          <AnimatePresence>
            {streak >= 2 && (
              <motion.span
                key={streak}
                className="anag-mult"
                initial={{ scale: 0, rotate: -12 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 16 }}
              >
                <Flame size={13} /> ×{multiplier}
              </motion.span>
            )}
          </AnimatePresence>
          {cfg.timer && (
            <div className={`anag-timebar is-${timeTone}`} aria-label={`Quedan ${timeLeft} segundos`}>
              <ProgressBar value={timeLeft} max={cfg.timer} tone={timeTone} />
            </div>
          )}
        </div>

        {/* Pista (definición) */}
        {currentWord.clue && (
          <AnimatePresence mode="wait" initial={false}>
            {clueVisible ? (
              <motion.div
                key={`clue-${currentIndex}`}
                className="anag-clue"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <span className="anag-clue__icon"><Lightbulb size={18} /></span>
                <span className="anag-clue__text">{currentWord.clue}</span>
              </motion.div>
            ) : (
              <motion.div
                key={`noclue-${currentIndex}`}
                className="anag-clue is-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <span className="anag-clue__icon"><EyeOff size={18} /></span>
                <span className="anag-clue__text">
                  {helpsRemaining.hint > 0
                    ? 'Definición oculta: pulsa «Pista» si la necesitas.'
                    : 'Sin pistas: ¡confía en tu vocabulario!'}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        <LayoutGroup>
          {/* Atril: los huecos de la palabra */}
          <Panel variant="screen" className={`anag-rack is-${status}`}>
            <div
              className={`anag-slots ${len > 9 ? 'is-long' : ''}`}
              style={{ '--n': len }}
            >
              {slots.map((tile, idx) => (
                <div key={`slot-${idx}`} className={`anag-slot ${idx === nextSlot ? 'is-next' : ''}`}>
                  <AnimatePresence mode="popLayout">
                    {tile && (
                      <motion.button
                        key={tile.id}
                        type="button"
                        layoutId={tile.id}
                        className={`anag-tile is-placed ${
                          status === 'correct' ? 'is-correct' : ''
                        } ${status === 'wrong' ? 'is-wrong' : ''}`}
                        style={{ '--tile': tile.color }}
                        onClick={() => removeTile(tile.id)}
                        aria-label={`Quitar ${tile.letter}`}
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
                        <span className="anag-tile__body">{tile.letter}</span>
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* +puntos flotantes */}
            <AnimatePresence>
              {lastGain && status === 'correct' && (
                <motion.div
                  key={lastGain.key}
                  className="anag-gain"
                  initial={{ opacity: 0, y: 0, scale: 0.5 }}
                  animate={{ opacity: 1, y: -46, scale: 1.15 }}
                  exit={{ opacity: 0, y: -70 }}
                  transition={{ duration: 1.1 }}
                >
                  <Sparkles size={15} /> +{lastGain.value}
                </motion.div>
              )}
            </AnimatePresence>
          </Panel>

          {/* Banco de letras */}
          <Panel variant="inset" className="anag-tray">
            {bank.map((tile, i) => (
              <motion.button
                key={tile.id}
                type="button"
                layoutId={tile.id}
                className="anag-tile is-bank"
                style={{ '--tile': tile.color, '--i': i }}
                onClick={() => placeTile(tile.id)}
                aria-label={`Colocar ${tile.letter}`}
                transition={{ layout: { type: 'spring', stiffness: 420, damping: 24 } }}
                whileHover={{ y: -6, scale: 1.08 }}
                whileTap={{ scale: 0.88, rotate: -8 }}
              >
                <span className="anag-tile__body">{tile.letter}</span>
              </motion.button>
            ))}
            {bank.length === 0 && status === 'playing' && (
              <div className="anag-tray__empty"><Check size={16} /> Comprobando…</div>
            )}
          </Panel>
        </LayoutGroup>

        {/* Comodines / aviso de la palabra */}
        <div className="anag-controls">
          {!roundOver && (
            <div className="anag-lifelines">
              <GameButton
                variant="warning"
                icon={Lightbulb}
                onClick={useHint}
                disabled={helpsRemaining.hint <= 0 || hintVisible}
                title="Ver definición"
                className="anag-life"
              >
                Pista
                {helpsRemaining.hint !== Infinity && (
                  <b className="anag-life__count">{helpsRemaining.hint}</b>
                )}
              </GameButton>
              <GameButton
                variant="primary"
                icon={Zap}
                onClick={revealFirstLetter}
                disabled={
                  helpsRemaining.firstLetter <= 0 ||
                  revealedFirst ||
                  status !== 'playing'
                }
                title="Colocar la primera letra"
                className="anag-life"
              >
                1ª letra
                {helpsRemaining.firstLetter !== Infinity && (
                  <b className="anag-life__count">{helpsRemaining.firstLetter}</b>
                )}
              </GameButton>
              <GameButton
                variant="soft"
                icon={Shuffle}
                onClick={reshuffleBank}
                disabled={status !== 'playing'}
                title="Reordenar letras del banco"
                className="anag-life"
              >
                Mezclar
              </GameButton>
            </div>
          )}
          <RoundBanner
            show={roundOver}
            status={status === 'correct' ? 'won' : 'lost'}
            title={status === 'correct'
              ? `¡${currentWord.original.toUpperCase()}!`
              : timeLeft === 0 ? '¡Se acabó el tiempo!' : 'No es esa palabra'}
            subtitle={status === 'correct'
              ? (lastGain ? `+${lastGain.value} puntos${streak >= 2 ? ` · racha de ${streak}` : ''}` : '¡Bien hecho!')
              : <>Solución: <strong>{currentWord.original}</strong></>}
          />
        </div>
      </div>

      <div className="anag-footer">
        {!isExam ? (
          <GameButton
            variant="soft"
            size="sm"
            icon={LayoutGrid}
            onClick={() => {
              setPhase('select');
              setQuestions([]);
              setStatus('idle');
            }}
          >
            Cambiar modo
          </GameButton>
        ) : null}
        <span className="anag-footer__info">
          {isExam
            ? <><Trophy size={14} /> Modo examen · 10 palabras · cuenta para tus tareas</>
            : <><Timer size={14} /> 10 palabras · 30 s por palabra · sin vidas</>}
        </span>
      </div>

      {modals}
    </GameShell>
  );
};

/* ───────────────────────── Piezas propias ───────────────────────── */

// Resumen de una partida de práctica (el examen usa ResultsScreen del kit).
const PracticeSummary = ({ mode, modeLabel, subtitle, nota, points, stats, actions, words }) => (
  <motion.div
    className="anag-sum"
    initial={{ opacity: 0, y: 24, scale: 0.98 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ type: 'spring', stiffness: 170, damping: 20 }}
  >
    <div className="anag-sum__head">
      <TrophyTiles />
      <div className="anag-sum__titles">
        <ModeChip mode={mode} label={modeLabel} />
        <h2>¡Partida completada!</h2>
        <p>{subtitle}</p>
      </div>
    </div>

    <div className={`anag-sum__score is-${notaTone(nota)}`}>
      <GradeRing nota={nota} size={138} />
      <div className="anag-sum__verdict">
        <strong>{notaMessage(nota)}</strong>
        <span className="anag-sum__points">
          <Trophy size={16} /> {Math.round(points).toLocaleString('es-ES')} <small>puntos · ¡supérate!</small>
        </span>
        <div className="anag-sum__stats">
          {stats.map((s) => (
            <span key={s.label} className={`anag-sum__stat gk-stat--${s.tone}`}>
              <span className="gk-stat__icon"><s.icon size={14} /></span>
              <b>{s.value}</b> {s.label}
            </span>
          ))}
        </div>
      </div>
    </div>

    <div className="anag-sum__words" aria-label="Palabras de la partida">
      {words.map((w, i) => (
        <span key={`${w.word}-${i}`} className={`anag-sum__word ${w.ok ? 'is-ok' : 'is-ko'}`}>
          {w.ok ? <Check size={13} strokeWidth={3} /> : <X size={13} strokeWidth={3} />} {w.word}
        </span>
      ))}
    </div>

    <div className="anag-sum__actions">
      {actions.map((a, i) => (
        <GameButton key={a.label} variant={a.variant || (i === 0 ? 'primary' : 'soft')} size="lg" icon={a.icon} onClick={a.onClick}>
          {a.label}
        </GameButton>
      ))}
    </div>
  </motion.div>
);

// Ilustración del resumen: fichas "B I E N" sobre un pedestal (sin filtros SVG).
const TILE_ART = [
  { l: 'B', x: 6, y: 30, r: -9, c: ['#f5d0fe', '#d946ef', '#86198f'] },
  { l: 'I', x: 34, y: 20, r: -3, c: ['#ddd6fe', '#8b5cf6', '#4c1d95'] },
  { l: 'E', x: 62, y: 20, r: 4, c: ['#fde68a', '#f59e0b', '#92400e'] },
  { l: 'N', x: 90, y: 30, r: 10, c: ['#a7f3d0', '#10b981', '#065f46'] },
];
const TrophyTiles = () => {
  const [id, url] = useArtIds();
  return (
    <svg className="anag-sum__art" viewBox="0 0 124 84" aria-hidden="true">
      <defs>
        <radialGradient id={id('shadow')} cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#3b0764" stopOpacity=".35" />
          <stop offset="1" stopColor="#3b0764" stopOpacity="0" />
        </radialGradient>
        {TILE_ART.map((t) => (
          <linearGradient key={t.l} id={id(`t${t.l}`)} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={t.c[0]} />
            <stop offset=".55" stopColor={t.c[1]} />
            <stop offset="1" stopColor={t.c[2]} />
          </linearGradient>
        ))}
      </defs>
      <ellipse cx="62" cy="76" rx="56" ry="6" fill={url('shadow')} />
      {TILE_ART.map((t) => (
        <g key={t.l} transform={`rotate(${t.r} ${t.x + 14} ${t.y + 15})`}>
          <rect x={t.x} y={t.y + 4} width="28" height="30" rx="7" fill={t.c[2]} />
          <rect x={t.x} y={t.y} width="28" height="30" rx="7" fill={url(`t${t.l}`)} />
          <rect x={t.x + 3} y={t.y + 2.5} width="22" height="9" rx="4.5" fill="#fff" opacity=".35" />
          <text x={t.x + 14} y={t.y + 22} textAnchor="middle" fontFamily="Fredoka, Nunito, sans-serif" fontWeight="700" fontSize="17" fill="#fff">{t.l}</text>
        </g>
      ))}
      <path d="M116 8 q1 5 6 6 q-5 1 -6 6 q-1 -5 -6 -6 q5 -1 6 -6Z" fill="#fbbf24" />
      <path d="M8 6 q.7 3.4 4 4 q-3.3.6 -4 4 q-.7 -3.4 -4 -4 q3.3 -.6 4 -4Z" fill="#f0abfc" />
    </svg>
  );
};

export default Anagramas;
