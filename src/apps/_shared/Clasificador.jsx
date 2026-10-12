// Clasificador — rediseño 2026 sobre el kit de interfaz (_shared/kit).
// Cada palabra es una pieza que cae en una de las cestas (categorías). Se
// juega pulsando la cesta o arrastrando la pieza hasta ella: los dos caminos
// llaman a handleAnswer, que es la lógica original sin cambios (puntos,
// rachas, tiempos de espera y tracking intactos). Todo lo demás es solo
// presentación: vuelo de la pieza, cestas que se llenan, avisos y resultados.
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  Flame, RefreshCw, ArrowRight, BookOpen, Clock, Lightbulb, SkipForward, LayoutGrid, X,
  Check, Target, Zap, Trophy, Shapes, Hand, GraduationCap, Sparkles,
} from 'lucide-react';
import {
  motion, AnimatePresence, useAnimationControls, useMotionValue, useReducedMotion,
} from 'framer-motion';
import confetti from 'canvas-confetti';
import { getRunnerData } from '../../services/gameDataService';
import useArtIds from '@/components/art/useArtIds';
import InstructionsModal from './InstructionsModal';
import {
  GameShell, GameHeader, Hud, HudStat, ProgressDots, GameButton, ModeSelect,
  ResultsScreen, FeedbackItem, GameLoading, GameEmpty,
} from './kit';
import './Clasificador.css';

// Constantes de configuración
const TEST_QUESTION_COUNT = 10;
const MAX_CATEGORIES = 4;
const POINTS_PER_CORRECT = 100;
const MAX_SPEED_BONUS = 200;
const SPEED_BONUS_WINDOW_SEC = 120; // ~12s por pregunta como referencia
const MAX_STREAK_BONUS = 200;

const SHELL = { accent: '#14b8a6', accent2: '#6366f1' };

// Cestas: color y emblema de forma (como un juego de encajar formas).
const BIN_THEMES = [
  { id: 'violet', light: '#ddd6fe', base: '#8b5cf6', dark: '#4c1d95', shape: 'circle' },
  { id: 'pink', light: '#fbcfe8', base: '#ec4899', dark: '#831843', shape: 'triangle' },
  { id: 'sky', light: '#bae6fd', base: '#0ea5e9', dark: '#0c4a6e', shape: 'square' },
  { id: 'orange', light: '#fed7aa', base: '#f97316', dark: '#7c2d12', shape: 'star' },
];
const PIECE_COLORS = ['#fbbf24', '#34d399', '#f472b6', '#60a5fa', '#a78bfa', '#fb923c'];

const prettyCat = (cat = '') => String(cat).replace(/_/g, ' ');

// Función auxiliar para barajar
const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

/* ───────────── Ilustración de la cesta (SVG sin filtros) ───────────── */

const Emblem = ({ shape, fill }) => {
  if (shape === 'triangle') return <path d="M80 72 L91 91 H69 Z" fill={fill} strokeLinejoin="round" stroke={fill} strokeWidth="3" />;
  if (shape === 'square') return <rect x="70.5" y="72.5" width="19" height="19" rx="4" fill={fill} />;
  if (shape === 'star') return <path d="M80 70.5 l3.3 6.9 7.5 1 -5.5 5.2 1.4 7.5 -6.7 -3.7 -6.7 3.7 1.4 -7.5 -5.5 -5.2 7.5 -1 Z" fill={fill} />;
  return <circle cx="80" cy="82" r="10" fill={fill} />;
};

const BinArt = ({ theme, fill = 0 }) => {
  const [id, url] = useArtIds();
  const shown = Math.min(fill, 6);
  // Piezas asomando por la boca de la cesta (las que ya has acertado)
  const pieces = Array.from({ length: shown }).map((_, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    return { x: 48 + col * 24 + (row ? 12 : 0), y: 22 - row * 9, c: PIECE_COLORS[i % PIECE_COLORS.length], r: (i % 2 ? -1 : 1) * (8 + i * 3) };
  });
  return (
    <svg className="clf-binart" viewBox="0 0 160 128" aria-hidden="true">
      <defs>
        <linearGradient id={id('body')} x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0" stopColor={theme.light} />
          <stop offset="0.45" stopColor={theme.base} />
          <stop offset="1" stopColor={theme.dark} />
        </linearGradient>
        <linearGradient id={id('inside')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={theme.dark} />
          <stop offset="1" stopColor={theme.base} stopOpacity=".7" />
        </linearGradient>
        <linearGradient id={id('gloss')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity=".55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={id('shade')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={theme.dark} stopOpacity="0" />
          <stop offset="1" stopColor={theme.dark} stopOpacity=".45" />
        </linearGradient>
        <radialGradient id={id('ground')} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#1e1b4b" stopOpacity=".35" />
          <stop offset="1" stopColor="#1e1b4b" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={id('glow')} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff" stopOpacity=".9" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="80" cy="121" rx="62" ry="6" fill={url('ground')} />
      {/* boca (interior) */}
      <ellipse cx="80" cy="34" rx="64" ry="13" fill={url('inside')} />
      <ellipse className="clf-binart__glow" cx="80" cy="34" rx="50" ry="9" fill={url('glow')} />
      {/* piezas ya clasificadas */}
      {pieces.map((p, i) => (
        <g key={i} transform={`rotate(${p.r} ${p.x} ${p.y + 12})`}>
          <rect x={p.x - 10} y={p.y} width="20" height="20" rx="5" fill={p.c} />
          <rect x={p.x - 7} y={p.y + 3} width="9" height="4" rx="2" fill="#fff" opacity=".6" />
        </g>
      ))}
      {/* cuerpo */}
      <path d="M16 36 L28 110 Q30 118 39 118 H121 Q130 118 132 110 L144 36 Q112 50 80 50 Q48 50 16 36 Z" fill={url('body')} />
      {/* trenzado de la cesta */}
      <path d="M21 62 Q80 76 139 62 M24.5 84 Q80 97 135.5 84" stroke="#fff" strokeOpacity=".28" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M21 66 Q80 80 139 66 M24.5 88 Q80 101 135.5 88" stroke={theme.dark} strokeOpacity=".25" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* sombra propia (derecha) y brillo (izquierda) */}
      <path d="M110 48 Q128 44 144 36 L132 110 Q130 118 121 118 H112 Z" fill={url('shade')} />
      <path d="M24 44 L33 104 Q34 108 38 109 L32 46 Z" fill={url('gloss')} />
      {/* borde de la boca */}
      <ellipse cx="80" cy="34" rx="64" ry="13" fill="none" stroke={theme.light} strokeWidth="5" />
      <path d="M22 30 Q50 20 80 21" stroke="#fff" strokeOpacity=".75" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      {/* emblema */}
      <circle cx="80" cy="82" r="18" fill="#fff" opacity=".96" />
      <circle cx="80" cy="82" r="18" fill="none" stroke={theme.dark} strokeOpacity=".2" strokeWidth="2" />
      <Emblem shape={theme.shape} fill={theme.base} />
    </svg>
  );
};

/* ───────────── Pieza (la palabra que hay que clasificar) ───────────── */

// innerRef: para medir la pieza y calcular el vuelo hasta la cesta.
// flight: { ok, dx, dy } → vuela a la cesta (acierto) o rebota (fallo).
const ClfPiece = ({ word, feedback, flight, canDrag, innerRef, onDropOnBin, onHoverBin }) => {
  const reduce = useReducedMotion();
  const controls = useAnimationControls();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const draggedRef = useRef(false);

  useEffect(() => {
    controls.start({ opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 320, damping: 22 } });
  }, [controls]);

  useEffect(() => {
    if (!flight || reduce) return;
    const x0 = x.get();
    const y0 = y.get();
    if (flight.ok) {
      controls.start({
        x: x0 + flight.dx,
        y: [y0, y0 + flight.dy - 40, y0 + flight.dy],
        scale: [1, 0.8, 0.22],
        rotate: [0, -6, 8],
        opacity: [1, 1, 0],
        transition: { duration: 0.55, times: [0, 0.55, 1], ease: 'easeIn' },
      });
    } else {
      controls.start({
        x: [x0, x0 + flight.dx * 0.82, 0, -14, 12, -6, 0],
        y: [y0, y0 + flight.dy * 0.7, 0, 0, 0, 0, 0],
        scale: [1, 0.66, 1, 1, 1, 1, 1],
        rotate: [0, -10, 0, 0, 0, 0, 0],
        transition: { duration: 1.05, times: [0, 0.32, 0.62, 0.72, 0.82, 0.92, 1] },
      });
    }
  }, [flight, reduce, controls, x, y]);

  // Cesta bajo el puntero (los dos ejes en coordenadas de ventana)
  const binAt = (event, info) => {
    const cx = event?.clientX ?? (info.point.x - window.scrollX);
    const cy = event?.clientY ?? (info.point.y - window.scrollY);
    const els = document.elementsFromPoint(cx, cy);
    const bin = els.find((el) => el.dataset && el.dataset.clfBin);
    return bin ? bin.dataset.clfBin : null;
  };

  const state = feedback === 'correct' ? 'is-good' : feedback === 'incorrect' ? 'is-bad' : '';
  return (
    <motion.div
      ref={innerRef}
      className={`clf-piece ${state} ${canDrag ? 'can-drag' : ''}`}
      style={{ x, y }}
      initial={{ opacity: 0, y: -46, scale: 0.85 }}
      animate={controls}
      exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.18 } }}
      drag={canDrag}
      dragMomentum={false}
      whileDrag={{ scale: 0.72, rotate: -4, cursor: 'grabbing' }}
      onDragStart={() => { draggedRef.current = true; }}
      onDrag={(e, info) => onHoverBin(binAt(e, info))}
      onDragEnd={(e, info) => {
        const cat = binAt(e, info);
        onHoverBin(null);
        if (cat) onDropOnBin(cat);
        else controls.start({ x: 0, y: 0, rotate: 0, scale: 1, transition: { type: 'spring', stiffness: 380, damping: 26 } });
      }}
    >
      <span className="clf-piece__edge" aria-hidden="true" />
      <span className="clf-piece__face">
        <span className="clf-piece__tag">
          {feedback === 'correct' ? <><Check size={13} strokeWidth={3} /> ¡Bien!</>
            : feedback === 'incorrect' ? <><X size={13} strokeWidth={3} /> No va ahí</>
              : <><Hand size={13} /> ¿Dónde va?</>}
        </span>
        <span className="clf-piece__word">{word}</span>
      </span>
    </motion.div>
  );
};

const Clasificador = ({ onGameComplete }) => {
  const { level, grade, subjectId } = useParams();
  const effectiveSubject = subjectId || 'general';

  // --- ESTADOS ---
  const [gameMode, setGameMode] = useState('selection');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [allQuestions, setAllQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [rawGameData, setRawGameData] = useState(null);
  const [showCheatSheet, setShowCheatSheet] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [highStreak, setHighStreak] = useState(0);
  const [finished, setFinished] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const gameStartRef = useRef(null);
  const [skipTimeout, setSkipTimeout] = useState(null);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [examResult, setExamResult] = useState(null); // { nota, basePoints, timeBonus, streakBonus, total, elapsed }

  // --- Solo presentación ---
  const [flight, setFlight] = useState(null); // { n, ok, dx, dy }
  const [hit, setHit] = useState(null); // { n, cat, ok, gain }
  const [hoverBin, setHoverBin] = useState(null);
  const [binFill, setBinFill] = useState({}); // piezas acertadas en cada cesta
  const [answerLog, setAnswerLog] = useState([]); // [{ ok, chosen }] por pregunta (examen)
  const pieceRef = useRef(null);
  const binRefs = useRef({});

  // --- Selección de preguntas ---
  const activeQuestions = useMemo(() => {
    if (gameMode === 'selection' || allQuestions.length === 0) return [];

    let shuffled = shuffleArray(allQuestions);

    if (gameMode === 'test' && shuffled.length > TEST_QUESTION_COUNT) {
      return shuffled.slice(0, TEST_QUESTION_COUNT);
    }
    return shuffled;
  }, [gameMode, allQuestions]);

  const totalQuestions = activeQuestions.length;

  // --- Tracking onGameComplete ---
  const trackedRef = useRef(false);
  useEffect(() => {
    if (finished && !trackedRef.current && totalQuestions > 0) {
      trackedRef.current = true;
      const isExamMode = gameMode === 'test';
      const elapsed = gameStartRef.current ? Math.round((Date.now() - gameStartRef.current) / 1000) : 0;
      const basePoints = correctAnswersCount * POINTS_PER_CORRECT;
      const speedRatio = Math.max(0, 1 - Math.min(elapsed, SPEED_BONUS_WINDOW_SEC) / SPEED_BONUS_WINDOW_SEC);
      const timeBonus = Math.round(MAX_SPEED_BONUS * speedRatio);
      const streakBonus = Math.min(highStreak * 15, MAX_STREAK_BONUS);
      const totalPoints = basePoints + timeBonus + streakBonus;
      const nota = Math.round((correctAnswersCount / totalQuestions) * 100) / 10;
      if (isExamMode) {
        setExamResult({ nota, basePoints, timeBonus, streakBonus, total: totalPoints, elapsed });
      }
      onGameComplete?.({
        mode: isExamMode ? 'test' : 'practice',
        score: isExamMode ? totalPoints : 0,
        maxScore: isExamMode ? totalQuestions * POINTS_PER_CORRECT + MAX_SPEED_BONUS + MAX_STREAK_BONUS : 0,
        correctAnswers: correctAnswersCount,
        totalQuestions,
        durationSeconds: elapsed,
      });
    }
    if (!finished) trackedRef.current = false;
  }, [finished, correctAnswersCount, totalQuestions, highStreak, gameMode, onGameComplete]);

  // --- CARGA DE DATOS ---
  useEffect(() => {
    setLoading(true);
    getRunnerData(level, grade, effectiveSubject)
      .then(data => {
        if (!data || Object.keys(data).length === 0) throw new Error("Datos no encontrados");
        setRawGameData(data);
        const allCats = Object.keys(data).filter(k => k !== 'title' && k !== 'instructions');
        const selectedCats = shuffleArray(allCats).slice(0, MAX_CATEGORIES);
        setCategories(selectedCats);

        let items = [];
        selectedCats.forEach(cat => {
          if (Array.isArray(data[cat])) {
            data[cat].forEach(word => items.push({ word, category: cat }));
          }
        });

        if (items.length < MAX_CATEGORIES || items.length === 0) {
          throw new Error("Datos insuficientes");
        }

        setAllQuestions(items);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError("Error al cargar la actividad.");
        setLoading(false);
      });
  }, [level, grade, effectiveSubject]);

  // --- LÓGICA DE NAVEGACIÓN ---
  const handleNextWord = useCallback(() => {
    if (skipTimeout) clearTimeout(skipTimeout);
    setFeedback(null);
    setCorrectAnswer(null);

    const nextIndex = currentIndex + 1;
    if (nextIndex < totalQuestions) {
      setCurrentIndex(nextIndex);
    } else {
      setFinished(true);
    }
    setSkipTimeout(null);
  }, [currentIndex, totalQuestions, skipTimeout]);

  const handleAnswer = (selectedCategory) => {
    if (finished || feedback) return;
    if (skipTimeout) clearTimeout(skipTimeout);

    const currentItem = activeQuestions[currentIndex];
    const isCorrect = currentItem.category === selectedCategory;

    let nextTimeout = 1200;

    if (isCorrect) {
      const isPractice = gameMode === 'practice';
      const streakBonus = isPractice ? 0 : Math.min(streak, 5) * 2;

      setScore(s => s + 10 + streakBonus);
      setCorrectAnswersCount(c => c + 1);

      setStreak(s => {
        const newStreak = s + 1;
        if (newStreak > highStreak) setHighStreak(newStreak);
        return newStreak;
      });
      setFeedback('correct');

    } else {
      setStreak(0);
      setFeedback('incorrect');
      setCorrectAnswer(currentItem.category);
      nextTimeout = 2500;
    }

    const timeoutId = setTimeout(handleNextWord, nextTimeout);
    setSkipTimeout(timeoutId);
  };

  const skipWord = () => {
    setStreak(0);
    handleNextWord();
  };

  const restart = () => {
    if (skipTimeout) clearTimeout(skipTimeout);
    setScore(0);
    setStreak(0);
    setHighStreak(0);
    setCurrentIndex(0);
    setFinished(false);
    setFeedback(null);
    setCorrectAnswer(null);
    setCorrectAnswersCount(0);
    setExamResult(null);
    setGameMode('selection');
    setAllQuestions(shuffleArray([...allQuestions]));
  };

  const startPractice = () => {
    setGameMode('practice');
    setCurrentIndex(0);
    setFinished(false);
    setFeedback(null);
    setCorrectAnswer(null);
    setCorrectAnswersCount(0);
    setScore(0);
    setStreak(0);
    setHighStreak(0);
    setExamResult(null);
    setAllQuestions(shuffleArray([...allQuestions]));
  };

  const startTest = () => {
    setGameMode('test');
    setCurrentIndex(0);
    setFinished(false);
    setFeedback(null);
    setCorrectAnswer(null);
    setCorrectAnswersCount(0);
    setScore(0);
    setStreak(0);
    setHighStreak(0);
    setExamResult(null);
    setAllQuestions(shuffleArray([...allQuestions]));
    gameStartRef.current = Date.now();
  };

  // --- Envoltorios de presentación (la lógica de arriba no cambia) ---
  const resetUi = () => {
    setFlight(null);
    setHit(null);
    setHoverBin(null);
    setBinFill({});
    setAnswerLog([]);
  };
  const beginPractice = () => { resetUi(); startPractice(); };
  const beginTest = () => { resetUi(); startTest(); };
  const backToModes = () => { resetUi(); restart(); };

  // Elegir cesta (pulsándola o soltando la pieza encima)
  const pickBin = (cat) => {
    if (finished || feedback) return;
    const item = activeQuestions[currentIndex];
    if (!item) return;
    const ok = item.category === cat;
    const gain = 10 + (gameMode === 'practice' ? 0 : Math.min(streak, 5) * 2);
    const pr = pieceRef.current?.getBoundingClientRect();
    const br = binRefs.current[cat]?.getBoundingClientRect();
    if (pr && br) {
      setFlight({
        n: currentIndex,
        ok,
        dx: br.left + br.width / 2 - (pr.left + pr.width / 2),
        dy: br.top + br.height * 0.3 - (pr.top + pr.height / 2),
      });
    }
    setHit({ n: currentIndex, cat, ok, gain });
    if (ok) setBinFill((f) => ({ ...f, [cat]: (f[cat] || 0) + 1 }));
    setAnswerLog((log) => {
      const next = [...log];
      next[currentIndex] = { ok, chosen: cat };
      return next;
    });
    handleAnswer(cat);
  };

  // Celebración al terminar (mismos umbrales que el confeti original)
  const celebratedRef = useRef(false);
  useEffect(() => {
    if (!finished) { celebratedRef.current = false; return; }
    if (celebratedRef.current) return;
    const isTestFinish = gameMode === 'test' && examResult;
    if (gameMode === 'test' && !examResult) return;
    celebratedRef.current = true;
    const great = isTestFinish ? examResult.nota >= 9 : totalQuestions > 0 && score / (totalQuestions * 10) >= 0.9;
    if (great) confetti({ particleCount: 180, spread: 100, origin: { y: 0.45 }, colors: ['#14b8a6', '#6366f1', '#f472b6', '#fbbf24'] });
  }, [finished, gameMode, examResult, score, totalQuestions]);

  const instructions = (
    <InstructionsModal isOpen={showHelp} onClose={() => setShowHelp(false)} title="Cómo jugar al Clasificador">
      <h3>🎯 Objetivo</h3>
      <p>Cada palabra pertenece a una <strong>categoría</strong>. Métela en su cesta.</p>
      <h3>🕹️ Cómo se juega</h3>
      <ul>
        <li><strong>Arrastra</strong> la pieza hasta la cesta correcta, o simplemente <strong>pulsa la cesta</strong>.</li>
        <li>Si aciertas, la pieza cae dentro y la cesta se va llenando.</li>
        <li>Si fallas, la pieza rebota y verás cuál era la cesta buena.</li>
      </ul>
      <h3>🎓 Modos de juego</h3>
      <div className="instr-modes">
        <div className="instr-mode easy">
          <strong>Práctica</strong>
          Todas las palabras, sin tiempo. Puedes saltar las que no sepas.
        </div>
        <div className="instr-mode exam">
          <strong>Examen</strong>
          {TEST_QUESTION_COUNT} palabras al azar. Nota sobre 10 y puntos extra por rapidez y racha.
        </div>
      </div>
      <div className="instr-tips">
        <strong>💡 Consejo:</strong> antes de empezar repasa la <kbd>Guía de categorías</kbd> (Material de estudio).
      </div>
    </InstructionsModal>
  );

  // Guía de categorías (material de estudio): modal propio
  const cheatSheet = (
    <AnimatePresence>
      {showCheatSheet && (
        <motion.div
          className="clf-sheet-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowCheatSheet(false)}
        >
          <motion.div
            className="clf-sheet"
            initial={{ scale: 0.92, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, y: 20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Guía de categorías"
          >
            <div className="clf-sheet__head">
              <span className="clf-sheet__icon"><BookOpen size={22} /></span>
              <div>
                <h2>Guía de categorías</h2>
                <p>Estudia qué palabras van en cada cesta</p>
              </div>
              <button type="button" className="gk-iconbtn clf-sheet__close" onClick={() => setShowCheatSheet(false)} aria-label="Cerrar guía">
                <X size={18} />
              </button>
            </div>

            <div className="clf-sheet__body">
              {rawGameData && Object.entries(rawGameData)
                .filter(([key]) => key !== 'title' && key !== 'instructions')
                .map(([category, words]) => {
                  const ti = categories.indexOf(category);
                  const theme = ti >= 0 ? BIN_THEMES[ti % BIN_THEMES.length] : null;
                  return (
                    <div
                      key={category}
                      className={`clf-sheet__cat${theme ? ' is-in-game' : ''}`}
                      style={theme ? { '--bin': theme.base, '--bin-light': theme.light } : undefined}
                    >
                      <h3><span className="clf-sheet__dot" />{prettyCat(category)}</h3>
                      <div className="clf-sheet__words">
                        {Array.isArray(words) && words.map((word, wIdx) => (
                          <span key={wIdx} className="clf-sheet__word">{word}</span>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>

            <div className="clf-sheet__foot">
              <GameButton variant="primary" size="lg" icon={Check} onClick={() => setShowCheatSheet(false)}>
                ¡Entendido! Vamos allá
              </GameButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (loading) return (
    <GameShell {...SHELL}>
      <GameLoading label="Preparando las cestas…" />
    </GameShell>
  );

  if (error) return (
    <GameShell {...SHELL}>
      <GameHeader />
      <GameEmpty
        title="Algo salió mal"
        action={<GameButton variant="soft" icon={RefreshCw} onClick={() => window.location.reload()}>Reintentar</GameButton>}
      >
        {error}
      </GameEmpty>
    </GameShell>
  );

  const currentItem = activeQuestions[currentIndex];
  const isPractice = gameMode === 'practice';
  const isTestPossible = allQuestions.length >= TEST_QUESTION_COUNT;

  // ---------------------------------------------------------
  // PANTALLA DE SELECCIÓN DE MODO
  // ---------------------------------------------------------
  if (gameMode === 'selection') {
    const modes = [
      {
        id: 'practice', tone: 'easy', icon: Shapes, title: 'Práctica',
        desc: 'Clasifica todas las palabras sin prisa. Puedes saltar las que no sepas.',
        features: ['Sin tiempo ni presión', `${allQuestions.length} palabras`],
      },
      isTestPossible && {
        id: 'test', tone: 'exam', title: 'Examen',
        desc: `${TEST_QUESTION_COUNT} palabras al azar: demuestra lo que sabes.`,
        features: ['Nota sobre 10', 'Bonus por rapidez y racha'],
      },
    ].filter(Boolean);
    const onSelect = (id) => (id === 'test' ? beginTest() : beginPractice());
    return (
      <GameShell {...SHELL}>
        <ModeSelect
          modes={modes}
          onSelect={onSelect}
          onHelp={() => setShowHelp(true)}
          onStudy={() => setShowCheatSheet(true)}
          extra={(
            <div className="clf-cats-preview">
              <span className="clf-cats-preview__label"><Shapes size={15} /> Cestas</span>
              {categories.map((cat, idx) => {
                const theme = BIN_THEMES[idx % BIN_THEMES.length];
                return (
                  <span key={cat} className="clf-cat-chip" style={{ '--bin': theme.base, '--bin-light': theme.light }}>
                    <span className="clf-cat-chip__dot" />{prettyCat(cat)}
                  </span>
                );
              })}
            </div>
          )}
          footer={!isTestPossible ? `El examen necesita al menos ${TEST_QUESTION_COUNT} palabras.` : null}
        />
        {instructions}
        {cheatSheet}
      </GameShell>
    );
  }

  // ---------------------------------------------------------
  // PANTALLA FINAL (RESULTADOS)
  // ---------------------------------------------------------
  if (finished) {
    if (gameMode === 'test') {
      if (!examResult) return <GameShell {...SHELL}><GameLoading label="Corrigiendo…" /></GameShell>;
      return (
        <GameShell {...SHELL}>
          <ResultsScreen
            title={correctAnswersCount === TEST_QUESTION_COUNT ? '¡Perfecto!' : 'Examen terminado'}
            nota={examResult.nota}
            points={examResult.total}
            stats={[
              { icon: Target, tone: 'good', label: 'Aciertos', value: `${correctAnswersCount}/${totalQuestions}` },
              { icon: Zap, tone: 'time', label: `Velocidad · ${examResult.elapsed}s`, value: `+${examResult.timeBonus}` },
              { icon: Flame, tone: 'streak', label: 'Bonus racha', value: `+${examResult.streakBonus}` },
              { icon: Trophy, tone: 'score', label: 'Base', value: examResult.basePoints },
            ]}
            actions={[
              { label: 'Repetir examen', onClick: beginTest, icon: RefreshCw },
              { label: 'Cambiar de modo', onClick: backToModes, icon: LayoutGrid, variant: 'soft' },
            ]}
          >
            {activeQuestions.map((q, i) => {
              const a = answerLog[i];
              if (!a) return null;
              return (
                <FeedbackItem key={i} index={i + 1} ok={a.ok} title={q.word}>
                  {a.ok
                    ? <>Cesta: <strong>{prettyCat(q.category)}</strong></>
                    : <>Era <strong>{prettyCat(q.category)}</strong> · elegiste {prettyCat(a.chosen)}</>}
                </FeedbackItem>
              );
            })}
          </ResultsScreen>
          {instructions}
        </GameShell>
      );
    }

    return (
      <GameShell {...SHELL}>
        <motion.div
          className="clf-summary"
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 170, damping: 20 }}
        >
          <span className="clf-summary__medal"><Trophy size={44} /></span>
          <span className="gk-chip gk-chip--mode gk-tone-easy"><Shapes size={13} /> Práctica</span>
          <h2 className="clf-summary__title">¡Ronda completada!</h2>
          <p className="clf-summary__sub">Has pasado por todas las palabras del clasificador.</p>
          <div className="clf-summary__stats">
            <HudStat icon={Target} tone="good" value={`${correctAnswersCount}/${totalQuestions}`} label="Aciertos" />
            <HudStat icon={Trophy} tone="score" value={score} label="Puntos" />
            <HudStat icon={Flame} tone="streak" value={highStreak} label="Mejor racha" />
          </div>
          <div className="clf-summary__bins">
            {categories.map((cat, idx) => (
              <div key={cat} className="clf-summary__bin">
                <BinArt theme={BIN_THEMES[idx % BIN_THEMES.length]} fill={binFill[cat] || 0} />
                <span>{prettyCat(cat)} · {binFill[cat] || 0}</span>
              </div>
            ))}
          </div>
          <div className="clf-summary__actions">
            <GameButton size="lg" icon={RefreshCw} onClick={beginPractice}>Otra ronda</GameButton>
            <GameButton size="lg" variant="soft" icon={LayoutGrid} onClick={backToModes}>Cambiar de modo</GameButton>
          </div>
        </motion.div>
        {instructions}
      </GameShell>
    );
  }

  // ---------------------------------------------------------
  // PANTALLA DE JUEGO ACTIVO
  // ---------------------------------------------------------
  const curFlight = flight && flight.n === currentIndex ? flight : null;
  const curHit = hit && hit.n === currentIndex && feedback ? hit : null;
  const canDrag = feedback === null;

  return (
    <GameShell {...SHELL}>
      <GameHeader
        mode={isPractice ? 'easy' : 'exam'}
        modeLabel={isPractice ? 'Práctica' : 'Examen'}
        onHelp={() => setShowHelp(true)}
        right={(
          <Hud>
            {streak > 1 && <HudStat icon={Flame} tone="streak" value={`x${Math.min(streak, 5)}`} label="Racha" />}
            <HudStat icon={Trophy} tone="score" value={score} label="Puntos" />
            <HudStat
              icon={isPractice ? Shapes : GraduationCap}
              tone="progress"
              value={`${Math.min(currentIndex + 1, totalQuestions)}/${totalQuestions}`}
              label={isPractice ? 'Palabra' : 'Pregunta'}
            />
          </Hud>
        )}
      />

      {!isPractice && (
        <ProgressDots total={totalQuestions} current={currentIndex} results={answerLog.map((a) => (a ? a.ok : undefined))} />
      )}

      {/* Escenario: la pieza sobre su peana */}
      <div className={`clf-stage ${feedback ? `is-${feedback}` : ''}`}>
        <span className="clf-stage__spot" aria-hidden="true" />
        <span className="clf-stage__pedestal" aria-hidden="true" />
        <AnimatePresence mode="wait">
          {currentItem && (
            <ClfPiece
              key={`${currentIndex}-${currentItem.word}`}
              word={currentItem.word}
              feedback={feedback}
              flight={curFlight}
              canDrag={canDrag}
              innerRef={pieceRef}
              onDropOnBin={pickBin}
              onHoverBin={setHoverBin}
            />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {feedback === 'incorrect' && correctAnswer && (
            <motion.div
              className="clf-stage__answer"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.5 } }}
              exit={{ opacity: 0 }}
            >
              <Lightbulb size={16} /> Correcta: <strong>{prettyCat(correctAnswer)}</strong>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Cestas */}
      <div className="clf-bins" style={{ '--n': categories.length }}>
        {categories.map((cat, idx) => {
          const theme = BIN_THEMES[idx % BIN_THEMES.length];
          const isHit = curHit && curHit.cat === cat;
          const isTarget = feedback === 'incorrect' && correctAnswer === cat;
          const cls = [
            'clf-bin',
            isHit ? (curHit.ok ? 'is-good' : 'is-bad') : '',
            isTarget ? 'is-target' : '',
            hoverBin === cat && canDrag ? 'is-over' : '',
            feedback && !isHit && !isTarget ? 'is-dim' : '',
          ].filter(Boolean).join(' ');
          return (
            <motion.button
              key={cat}
              type="button"
              ref={(el) => { binRefs.current[cat] = el; }}
              data-clf-bin={cat}
              className={cls}
              style={{ '--bin': theme.base, '--bin-light': theme.light, '--bin-dark': theme.dark }}
              onClick={() => pickBin(cat)}
              disabled={feedback !== null}
              aria-label={`Cesta ${prettyCat(cat)}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08, type: 'spring', stiffness: 260, damping: 22 }}
            >
              <span className="clf-bin__art">
                <BinArt theme={theme} fill={binFill[cat] || 0} />
              </span>
              <span className="clf-bin__label">{prettyCat(cat)}</span>
              {isTarget && <span className="clf-bin__flag"><ArrowRight size={13} strokeWidth={3} /> Era aquí</span>}
              <AnimatePresence>
                {isHit && curHit.ok && (
                  <motion.span
                    className="clf-bin__plus"
                    initial={{ opacity: 0, y: 10, scale: 0.6 }}
                    animate={{ opacity: 1, y: -18, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: 0.35, type: 'spring', stiffness: 300, damping: 18 }}
                  >
                    +{curHit.gain}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      <div className="clf-footer">
        {isPractice ? (
          <>
            <GameButton variant="soft" size="sm" icon={LayoutGrid} onClick={backToModes}>Cambiar modo</GameButton>
            <GameButton variant="ghost" size="sm" icon={SkipForward} onClick={skipWord} disabled={feedback !== null}>Saltar</GameButton>
            <span className="clf-footer__info"><Sparkles size={14} /> Arrastra la pieza o pulsa su cesta</span>
          </>
        ) : (
          <span className="clf-footer__info"><Clock size={14} /> Modo examen · cuenta el tiempo y la racha</span>
        )}
      </div>

      {instructions}
    </GameShell>
  );
};

export default Clasificador;
