// src/apps/torre-palabras/TorrePalabras.jsx
// Rediseño 2026 sobre el kit de interfaz (_shared/kit): obra con grúa y torre
// de bloques con volumen (cara, techo y lateral) que cae y se apila con cada
// acierto y se tambalea con cada fallo; el bloque actual cuelga del gancho y
// las categorías son cajones de color. Reglas, tiempos y tracking intactos.
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Layers, RefreshCw, Timer, Trophy, Star, Flame,
  Check, X, Lightbulb, SkipForward, LayoutGrid, GraduationCap,
} from 'lucide-react';
import { getRunnerData } from '../../services/gameDataService';
import materiasData from '../../../public/data/materias.json';
import InstructionsModal from '../_shared/InstructionsModal';
import {
  GameShell, GameHeader, Hud, HudStat, ProgressBar, AnswerOption, GameButton, Chip,
  ModeSelect, ResultsScreen, FeedbackItem, GameLoading, GameEmpty,
} from '../_shared/kit';
import './TorrePalabras.css';

const BLOCK_COLORS = [
  '#a855f7', '#ec4899', '#3b82f6', '#10b981', '#f59e0b',
  '#06b6d4', '#f97316', '#8b5cf6', '#14b8a6', '#ef4444',
];

const MODE_CONFIG = {
  easy: {
    label: 'Fácil', icon: '🟢', rounds: 12, categories: 2,
    showCategory: true, timer: null,
    helps: { skip: 2, hint: 3 },
  },
  medium: {
    label: 'Medio', icon: '🟡', rounds: 12, categories: 3,
    showCategory: false, timer: null,
    helps: { skip: 1, hint: 1 },
  },
  exam: {
    label: 'Examen', icon: '🔴', rounds: 12, categories: 4,
    showCategory: false, timer: 8,
    helps: { skip: 0, hint: 1 },
  },
};

const shuffle = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

const formatCategoryName = (name) => {
  if (!name) return '';
  const clean = String(name).replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
  return clean.charAt(0).toUpperCase() + clean.slice(1);
};

const getSubjectInfo = (level, grade, subjectId) => {
  if (!level || !grade || !subjectId) return { nombre: '', icon: '📚' };
  const curso = materiasData?.[level]?.[String(grade)];
  if (!Array.isArray(curso)) return { nombre: '', icon: '📚' };
  return curso.find((m) => m.id === subjectId) || { nombre: '', icon: '📚' };
};

const TorrePalabras = ({ onGameComplete }) => {
  const { level, grade: gradeParam, subjectId } = useParams();
  const grade = useMemo(() => parseInt(gradeParam, 10), [gradeParam]);
  const asignatura = subjectId || (level === 'primaria' ? 'lengua' : 'general');
  const subjectInfo = useMemo(() => getSubjectInfo(level, grade, asignatura), [level, grade, asignatura]);

  const [allCategories, setAllCategories] = useState({}); // {cat: [words]}
  const [loading, setLoading] = useState(true);
  // null = pantalla previa de modos (CLAUDE.md §3: el modo se elige ANTES de jugar)
  const [gameMode, setGameMode] = useState(null);

  // Puzzle
  const [categories, setCategories] = useState([]); // [{name, color, words}]
  const [blocks, setBlocks] = useState([]); // [{id, word, categoryIdx, answered}]
  const [currentBlockIdx, setCurrentBlockIdx] = useState(0);
  const [status, setStatus] = useState('idle'); // idle|playing|correct|wrong|timeout|won|lost
  const [towerHeight, setTowerHeight] = useState(0);
  const [shaking, setShaking] = useState(false);

  // Stats
  const [score, setScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [helpsRemaining, setHelpsRemaining] = useState({});
  const [hintVisible, setHintVisible] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Solo presentación: última categoría pulsada y resultado de cada bloque.
  const [lastPick, setLastPick] = useState(null);
  const [resultados, setResultados] = useState([]);

  // Timer
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);
  const trackedRef = useRef(false);

  // --- Cargar datos (runner: {categoria: [palabras]}) ---
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const load = async () => {
      try {
        const data = await getRunnerData(level, grade, asignatura);
        if (cancelled) return;
        if (data && typeof data === 'object') {
          // Filtrar categorías con al menos 3 palabras
          const filtered = {};
          Object.entries(data).forEach(([cat, words]) => {
            if (Array.isArray(words) && words.length >= 3) {
              filtered[cat] = words.map((w) => String(w).trim()).filter(Boolean);
            }
          });
          setAllCategories(filtered);
        }
      } catch (err) {
        console.error('TorrePalabras: error cargando datos', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [level, grade, asignatura]);

  // --- Generar puzzle ---
  const startGame = useCallback(() => {
    const cfg = MODE_CONFIG[gameMode];
    const catNames = Object.keys(allCategories);
    if (catNames.length < 2) return;

    // Elegir N categorías al azar
    const chosen = shuffle(catNames).slice(0, Math.min(cfg.categories, catNames.length));
    const cats = chosen.map((name, i) => ({
      name,
      color: BLOCK_COLORS[i % BLOCK_COLORS.length],
      words: allCategories[name],
    }));
    setCategories(cats);

    // Generar bloques: repartir rounds entre las categorías
    const allBlocks = [];
    let id = 0;
    const perCat = Math.ceil(cfg.rounds / cats.length);
    cats.forEach((cat, catIdx) => {
      const words = shuffle(cat.words).slice(0, perCat);
      words.forEach((word) => {
        allBlocks.push({ id: id++, word, categoryIdx: catIdx, answered: false });
      });
    });

    // Barajar y limitar a rounds
    const final = shuffle(allBlocks).slice(0, cfg.rounds);
    setBlocks(final);
    setCurrentBlockIdx(0);
    setTowerHeight(0);
    setShaking(false);
    setStatus('playing');
    setScore(0);
    setWrongCount(0);
    setStreak(0);
    setMaxStreak(0);
    setCorrectCount(0);
    setHelpsRemaining({ ...cfg.helps });
    setHintVisible(cfg.showCategory);
    trackedRef.current = false;
    if (cfg.timer) setTimeLeft(cfg.timer);
  }, [allCategories, gameMode]);

  useEffect(() => {
    if (!gameMode) return; // pantalla previa: aún no hay partida
    if (!loading && Object.keys(allCategories).length >= 2) startGame();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, gameMode, startGame]);

  // --- Timer por bloque (examen) ---
  useEffect(() => {
    const cfg = MODE_CONFIG[gameMode];
    if (!cfg || !cfg.timer || status !== 'playing') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    setTimeLeft(cfg.timer);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setStatus('timeout');
          setWrongCount((w) => w + 1);
          setStreak(0);
          setShaking(true);
          setTimeout(() => setShaking(false), 600);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [currentBlockIdx, status, gameMode]);

  const currentBlock = blocks[currentBlockIdx];
  // En la pantalla previa (gameMode null) se usa la config fácil solo para pintar.
  const cfg = MODE_CONFIG[gameMode] || MODE_CONFIG.easy;

  // --- Responder: elegir categoría ---
  const answerCategory = useCallback((catIdx) => {
    if (status !== 'playing' || !currentBlock) return;
    if (timerRef.current) clearInterval(timerRef.current);

    if (catIdx === currentBlock.categoryIdx) {
      // ¡Correcto!
      const streakMultiplier = 1 + streak * 0.1;
      const timeBonus = cfg.timer ? Math.max(0, Math.round(20 * (timeLeft / cfg.timer))) : 0;
      const gained = Math.round(100 * streakMultiplier + timeBonus);
      setScore((s) => s + gained);
      setStreak((s) => { const n = s + 1; setMaxStreak((m) => Math.max(m, n)); return n; });
      setCorrectCount((c) => c + 1);
      setTowerHeight((h) => h + 1);
      setStatus('correct');
    } else {
      setStatus('wrong');
      setWrongCount((w) => w + 1);
      setStreak(0);
      setShaking(true);
      setTimeout(() => setShaking(false), 600);
    }
  }, [status, currentBlock, streak, cfg.timer, timeLeft]);

  // --- Auto-avanzar ---
  useEffect(() => {
    if (status !== 'correct' && status !== 'wrong' && status !== 'timeout') return;
    const delay = status === 'correct' ? 700 : 1400;
    const t = setTimeout(() => {
      if (currentBlockIdx + 1 >= blocks.length) { setStatus('won'); return; }
      setCurrentBlockIdx((i) => i + 1);
      setHintVisible(cfg.showCategory);
      setStatus('playing');
    }, delay);
    return () => clearTimeout(t);
  }, [status, currentBlockIdx, blocks.length, cfg.showCategory]);

  // --- XP ---
  useEffect(() => {
    if (status !== 'won' || trackedRef.current) return;
    trackedRef.current = true;
    confetti({ particleCount: 200, spread: 120, origin: { y: 0.5 }, colors: BLOCK_COLORS.slice(0, 6) });
    const isExamMode = gameMode === 'exam';
    onGameComplete?.({
      mode: isExamMode ? 'test' : 'practice',
      score: isExamMode ? score : 0,
      maxScore: isExamMode ? blocks.length * 170 : 0,
      correctAnswers: correctCount,
      totalQuestions: blocks.length || 1,
      durationSeconds: 0,
    });
  }, [status, score, correctCount, blocks.length, gameMode, onGameComplete]);

  // Solo presentación: resultado de cada bloque (puntos de progreso y resumen).
  useEffect(() => { setResultados([]); }, [blocks]);
  useEffect(() => {
    if (status !== 'correct' && status !== 'wrong' && status !== 'timeout') return;
    setResultados((r) => {
      const next = [...r];
      next[currentBlockIdx] = status === 'correct';
      return next;
    });
  }, [status, currentBlockIdx]);

  // --- Ayudas ---
  const useHint = useCallback(() => {
    if (helpsRemaining.hint <= 0) return;
    setHintVisible(true);
    setHelpsRemaining((h) => ({ ...h, hint: h.hint - 1 }));
  }, [helpsRemaining]);

  const skipBlock = useCallback(() => {
    if (helpsRemaining.skip <= 0 || status !== 'playing') return;
    if (timerRef.current) clearInterval(timerRef.current);
    setHelpsRemaining((h) => ({ ...h, skip: h.skip - 1 }));
    setStreak(0);
    if (currentBlockIdx + 1 >= blocks.length) { setStatus('won'); return; }
    setCurrentBlockIdx((i) => i + 1);
    setHintVisible(cfg.showCategory);
  }, [helpsRemaining, status, currentBlockIdx, blocks.length, cfg.showCategory]);

  // Volver a la pantalla de modos. El estado vuelve al inicial ('idle'): se
  // paran reloj y auto-avance, y al elegir otro modo el efecto de tracking no
  // ve el final de la partida anterior.
  const backToModes = () => {
    setStatus('idle');
    setGameMode(null);
  };

  // --- Derivados ---
  const isExam = gameMode === 'exam';
  const isFinished = status === 'won';
  const nota = blocks.length > 0 ? Math.round((correctCount / blocks.length) * 100) / 10 : 0;

  const instructions = (
    <InstructionsModal isOpen={showHelp} onClose={() => setShowHelp(false)} title="Cómo jugar a Torre de Palabras">
      <h3>🎯 Objetivo</h3>
      <p>Cada bloque muestra una palabra. Debes <strong>clasificarla en su categoría correcta</strong> pulsando el botón correspondiente. Cada acierto apila un bloque en la torre; cada fallo la hace temblar.</p>

      <h3>🕹️ Cómo se juega</h3>
      <ul>
        <li>Aparece una palabra en el bloque central.</li>
        <li>Debajo verás los botones con los nombres de las categorías (ej: "Animales", "Plantas", "Minerales").</li>
        <li>Pulsa la categoría a la que pertenece la palabra.</li>
        <li>Si aciertas: el bloque se apila y la torre crece. Si fallas: la torre tiembla, se cuenta el error y pasas a la siguiente palabra.</li>
      </ul>

      <h3>🏗️ La torre</h3>
      <p>La torre es tu progreso visual. Cada bloque correcto la hace más alta. ¡El objetivo es construir la torre más alta posible!</p>

      <h3>🎓 Modos</h3>
      <div className="instr-modes">
        <div className="instr-mode easy"><strong>🟢 Fácil</strong>12 bloques · 2 categorías · categoría visible</div>
        <div className="instr-mode medium"><strong>🟡 Medio</strong>12 bloques · 3 categorías</div>
        <div className="instr-mode exam"><strong>🔴 Examen</strong>12 bloques · 4 categorías · 8s/bloque · nota /10</div>
      </div>

      <div className="instr-tips"><strong>💡 Consejo:</strong> si dudas, usa la pista para ver qué categoría se resalta. En modo fácil, la categoría correcta siempre está visible.</div>
    </InstructionsModal>
  );

  const shellProps = { accent: '#0ea5e9', accent2: '#6366f1', className: 'tp-shell' };

  if (loading) {
    return (
      <GameShell {...shellProps}>
        <GameLoading label="Preparando la obra…" />
      </GameShell>
    );
  }

  if (Object.keys(allCategories).length < 2) {
    return (
      <GameShell {...shellProps}>
        <GameHeader onHelp={() => setShowHelp(true)} />
        <GameEmpty title="Faltan categorías">No hay suficientes categorías para esta asignatura (mínimo 2).</GameEmpty>
        {instructions}
      </GameShell>
    );
  }

  // --- Pantalla previa: elegir modo ---
  if (!gameMode) {
    const modes = [
      {
        id: 'easy', tone: 'easy', title: 'Fácil',
        desc: 'Dos categorías y la correcta siempre iluminada.',
        features: ['12 bloques · 2 categorías', 'Categoría visible', '3 pistas + 2 saltos'],
      },
      {
        id: 'medium', tone: 'medium', title: 'Medio',
        desc: 'Tres categorías: ahora decides tú.',
        features: ['12 bloques · 3 categorías', '1 pista + 1 salto'],
      },
      {
        id: 'exam', tone: 'exam', title: 'Examen',
        desc: 'Cuatro categorías y 8 segundos por bloque.',
        features: ['Nota sobre 10', '8 s por bloque', '1 pista'],
      },
    ];
    return (
      <GameShell {...shellProps}>
        <ModeSelect modes={modes} onSelect={(id) => setGameMode(id)} onHelp={() => setShowHelp(true)} />
        {instructions}
      </GameShell>
    );
  }

  // --- Examen terminado ---
  if (isFinished && isExam) {
    return (
      <GameShell {...shellProps}>
        <ResultsScreen
          title="¡Torre terminada!"
          subtitle={`Torre de Palabras · ${subjectInfo.icon} ${subjectInfo.nombre || 'General'}`}
          nota={nota}
          points={score}
          stats={[
            { icon: Layers, tone: 'accent', label: 'Bloques apilados', value: towerHeight },
            { icon: Check, tone: 'good', label: 'Aciertos', value: `${correctCount}/${blocks.length}` },
            { icon: Flame, tone: 'streak', label: 'Racha máx.', value: maxStreak },
          ]}
          actions={[
            { label: 'Jugar otra vez', onClick: startGame, icon: RefreshCw },
            { label: 'Cambiar de modo', onClick: backToModes, icon: LayoutGrid, variant: 'soft' },
          ]}
        >
          {blocks.map((b, i) => (
            <FeedbackItem key={b.id} index={i + 1} ok={resultados[i] === true} title={b.word}>
              {resultados[i] === undefined ? 'Saltado · ' : ''}Categoría: {formatCategoryName(categories[b.categoryIdx]?.name)}
            </FeedbackItem>
          ))}
        </ResultsScreen>
        {instructions}
      </GameShell>
    );
  }

  const failed = status === 'wrong' || status === 'timeout';

  return (
    <GameShell {...shellProps}>
      <GameHeader
        mode={gameMode}
        modeLabel={cfg.label}
        onHelp={() => setShowHelp(true)}
        right={(
          <Hud>
            {cfg.timer && !isFinished && status === 'playing' && (
              <HudStat icon={Timer} tone={timeLeft <= 3 ? 'bad' : 'time'} value={`${timeLeft}s`} label="Tiempo" />
            )}
            {wrongCount > 0 && <HudStat icon={X} tone="bad" value={wrongCount} label="Fallos" />}
            {streak >= 2 && <HudStat icon={Flame} tone="streak" value={streak} label="Racha" />}
            <HudStat icon={Star} tone="score" value={score.toLocaleString('es-ES')} label="Puntos" />
          </Hud>
        )}
      />

      {/* --- Partida de práctica terminada --- */}
      {isFinished && (
        <motion.div
          className="tp-finish"
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <TowerScene height={towerHeight} finished />
          <div className="tp-finish__panel">
            <span className="tp-finish__badge" aria-hidden="true"><Trophy size={30} /></span>
            <h2 className="tp-finish__title">¡Torre completada!</h2>
            <div className="tp-finish__score"><strong>{score.toLocaleString('es-ES')}</strong><span>puntos</span></div>
            <div className="tp-finish__stats">
              <Chip tone="soft" icon={Layers}>{towerHeight} bloques apilados</Chip>
              <Chip tone="good" icon={Check}>{correctCount}/{blocks.length}</Chip>
              <Chip tone="soft" icon={Flame}>Racha: {maxStreak}</Chip>
            </div>
            <div className="tp-finish__actions">
              <GameButton size="lg" icon={RefreshCw} onClick={startGame}>Jugar otra vez</GameButton>
              <GameButton size="lg" variant="soft" icon={LayoutGrid} onClick={backToModes}>Cambiar de modo</GameButton>
            </div>
          </div>
        </motion.div>
      )}

      {/* --- Obra --- */}
      {!isFinished && currentBlock && (
        <>
          <div className="tp-stage">
            <TowerScene height={towerHeight} shaking={shaking} />

            <div className="tp-play">
              <div className="tp-progress">
                <span className="tp-progress__label">Bloque <strong>{currentBlockIdx + 1}</strong> de {blocks.length}</span>
                <ProgressBar value={currentBlockIdx} max={blocks.length} label="Progreso" />
              </div>

              <div className="tp-hook-area">
                <span className="tp-cable" aria-hidden="true" />
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentBlockIdx}
                    className={`tp-current ${status === 'correct' ? 'is-correct' : ''} ${failed ? 'is-wrong' : ''}`}
                    initial={{ opacity: 0, y: -46, rotate: -4 }}
                    animate={{ opacity: 1, y: 0, rotate: 0 }}
                    exit={status === 'correct' ? { opacity: 0, y: 60, scale: 0.6 } : { opacity: 0, x: 60, rotate: 8 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                  >
                    <span className="tp-current__hook" aria-hidden="true" />
                    <span className="tp-current__word">{currentBlock.word}</span>
                    {failed && (
                      <span className="tp-current__cat">
                        Era: {formatCategoryName(categories[currentBlock.categoryIdx]?.name)}
                      </span>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {cfg.timer && (
                <div className={`tp-timer ${timeLeft <= 3 ? 'is-danger' : ''}`}>
                  <ProgressBar value={status === 'playing' ? timeLeft : 0} max={cfg.timer} tone={timeLeft <= 3 ? 'bad' : 'warn'} label="Tiempo del bloque" />
                </div>
              )}

              <div className={`tp-cats is-${categories.length}`} role="group" aria-label="Categorías">
                {categories.map((cat, idx) => {
                  const isRight = idx === currentBlock.categoryIdx;
                  const state = (status === 'correct' && isRight) || (failed && isRight)
                    ? 'correct'
                    : status === 'wrong' && lastPick === idx ? 'wrong' : 'idle';
                  return (
                    <AnswerOption
                      key={cat.name}
                      state={state}
                      className={`tp-cat ${hintVisible && isRight && status === 'playing' ? 'is-hint' : ''} ${status !== 'playing' && state === 'idle' ? 'is-dim' : ''}`}
                      style={{ '--cat': cat.color }}
                      onClick={() => { setLastPick(idx); answerCategory(idx); }}
                      disabled={status !== 'playing'}
                    >
                      <span className="tp-cat__swatch" aria-hidden="true" />
                      <span className="tp-cat__name">{formatCategoryName(cat.name)}</span>
                    </AnswerOption>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="tp-tools">
            {!hintVisible && !cfg.showCategory && (
              <GameButton variant="warning" size="sm" icon={Lightbulb} onClick={useHint} disabled={helpsRemaining.hint <= 0}>
                Pista
                {helpsRemaining.hint > 0 && <span className="tp-count">{helpsRemaining.hint}</span>}
              </GameButton>
            )}
            <GameButton variant="soft" size="sm" icon={SkipForward} onClick={skipBlock} disabled={helpsRemaining.skip <= 0 || status !== 'playing'}>
              Saltar
              {helpsRemaining.skip > 0 && <span className="tp-count">{helpsRemaining.skip}</span>}
            </GameButton>
            <GameButton variant="ghost" size="sm" icon={RefreshCw} onClick={startGame}>Nuevo</GameButton>
            {!isExam ? (
              <GameButton variant="ghost" size="sm" icon={LayoutGrid} onClick={backToModes}>Cambiar modo</GameButton>
            ) : (
              <span className="tp-tools__info"><GraduationCap size={14} /> Examen · 8 s por bloque</span>
            )}
          </div>
        </>
      )}

      {instructions}
    </GameShell>
  );
};

// Obra: cielo, grúa, suelo y la torre de bloques con volumen. Cada bloque
// nuevo cae desde arriba (transform) y la torre se tambalea al fallar.
const TowerScene = ({ height, shaking = false, finished = false }) => (
  <div className={`tp-site ${finished ? 'is-finished' : ''}`} aria-label={`Torre de ${height} bloques`}>
    <span className="tp-site__sun" aria-hidden="true" />
    <span className="tp-site__cloud c1" aria-hidden="true" />
    <span className="tp-site__cloud c2" aria-hidden="true" />
    <svg className="tp-crane" viewBox="0 0 160 200" aria-hidden="true">
      <defs>
        <linearGradient id="tp-steel" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fde68a" />
          <stop offset=".5" stopColor="#f59e0b" />
          <stop offset="1" stopColor="#b45309" />
        </linearGradient>
      </defs>
      <rect x="18" y="20" width="12" height="180" fill="url(#tp-steel)" />
      <path d="M18 30 L30 42 M30 42 L18 54 M18 54 L30 66 M30 66 L18 78 M18 78 L30 90 M30 90 L18 102 M18 102 L30 114 M30 114 L18 126 M18 126 L30 138 M30 138 L18 150 M18 150 L30 162 M30 162 L18 174 M18 174 L30 186" stroke="#92400e" strokeWidth="2" strokeOpacity=".6" />
      <rect x="4" y="14" width="156" height="9" rx="2" fill="url(#tp-steel)" />
      <path d="M8 14 L24 2 L40 14" stroke="#b45309" strokeWidth="2.4" fill="none" />
      <rect x="2" y="23" width="16" height="12" rx="2" fill="#475569" />
      <rect x="31" y="24" width="14" height="11" rx="2" fill="#0ea5e9" />
      <rect x="33" y="26" width="10" height="5" rx="1" fill="#e0f2fe" opacity=".85" />
    </svg>
    <div className={`tp-tower ${shaking ? 'is-shaking' : ''}`}>
      {Array.from({ length: height }).map((_, i) => (
        <motion.div
          key={`block-${i}`}
          className="tp-brick"
          style={{ '--c': BLOCK_COLORS[i % BLOCK_COLORS.length], '--dx': `${((i * 37) % 9) - 4}px` }}
          initial={{ opacity: 0, y: -160 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 22, delay: finished ? i * 0.07 : 0 }}
        />
      ))}
      {!finished && <span className="tp-ghost" aria-hidden="true" />}
    </div>
    <span className="tp-site__ground" aria-hidden="true" />
    <span className="tp-site__count"><Layers size={14} /> {height}</span>
  </div>
);

export default TorrePalabras;
