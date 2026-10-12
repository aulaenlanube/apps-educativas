// src/apps/sopa-de-letras/SopaDeLetras.jsx
// Rediseño 2026 sobre el kit de interfaz de juego (_shared/kit): pantalla previa
// de modos con tamaño, tarjeta de letras con cápsulas de rotulador (selección y
// palabras encontradas), panel de palabras/pistas y resumen con la nota /10.
// La generación, la puntuación y el tracking no cambian.
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Timer, Search, Lightbulb, RefreshCw, GraduationCap, Gamepad2,
  CheckCircle2, Puzzle, LayoutGrid, Grid3x3, MousePointer2, X,
} from 'lucide-react';
import { getRoscoData } from '../../services/gameDataService';
import { generateWordSearch, snapSelection, checkSelection } from './wordSearchGenerator';
import materiasData from '../../../public/data/materias.json';
import InstructionsModal from '../_shared/InstructionsModal';
import {
  GameShell, GameHeader, Hud, HudStat, Panel, GameButton, Segmented, ProgressBar,
  ModeSelect, RoundBanner, ResultsScreen, FeedbackItem, GameLoading, GameEmpty,
} from '../_shared/kit';
import './SopaDeLetras.css';

// Cápsula de rotulador que une la primera y la última casilla de una palabra.
// Posición en % del tablero (cuadrado, sin huecos entre casillas), así sirve
// para horizontales, verticales y diagonales. Solo presentación.
const capsuleStyle = (cells, n) => {
  const a = cells[0];
  const b = cells[cells.length - 1];
  const dr = b.r - a.r;
  const dc = b.c - a.c;
  const len = Math.sqrt(dr * dr + dc * dc) + 1; // en casillas
  const angle = (Math.atan2(dr, dc) * 180) / Math.PI;
  const head = (0.5 / len) * 100;
  return {
    left: `${((a.c + 0.5) / n) * 100}%`,
    top: `${((a.r + 0.5) / n) * 100}%`,
    width: `${(len / n) * 100}%`,
    height: `${(0.8 / n) * 100}%`,
    transformOrigin: `${head}% 50%`,
    transform: `translate(${-head}%, -50%) rotate(${angle}deg)`,
  };
};

// Configuración de tamaños
const SIZE_CONFIG = {
  small: {
    label: 'Pequeño',
    size: 10,
    words: 8,
    allowReverse: false,
    allowDiagonal: false,
    icon: '🟢',
  },
  medium: {
    label: 'Mediano',
    size: 12,
    words: 10,
    allowReverse: false,
    allowDiagonal: true,
    icon: '🟡',
  },
  large: {
    label: 'Grande',
    size: 14,
    words: 12,
    allowReverse: true,
    allowDiagonal: true,
    icon: '🔴',
  },
};

const REF_TIME_SEC = 300;
const POINTS_PER_WORD = 100;

// Paleta de colores para las palabras encontradas
const FOUND_COLORS = [
  '#10b981', '#3b82f6', '#a855f7', '#ec4899',
  '#f59e0b', '#06b6d4', '#f97316', '#8b5cf6',
  '#14b8a6', '#ef4444', '#6366f1', '#84cc16',
  '#d946ef', '#0ea5e9', '#f43f5e', '#22c55e',
  '#eab308', '#14b8a6',
];

const getSubjectInfo = (level, grade, subjectId) => {
  if (!level || !grade || !subjectId) return { nombre: '', icon: '📚' };
  const nivel = materiasData?.[level];
  const curso = nivel?.[String(grade)];
  if (!Array.isArray(curso)) return { nombre: '', icon: '📚' };
  const found = curso.find((m) => m.id === subjectId);
  if (!found) return { nombre: '', icon: '📚' };
  return { nombre: found.nombre || '', icon: found.icon || '📚' };
};

const SopaDeLetras = ({ onGameComplete }) => {
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
  // null = pantalla previa de modos (CLAUDE.md §3: el modo se elige ANTES de jugar)
  const [gameMode, setGameMode] = useState(null); // null | 'practice' | 'exam'
  const [size, setSize] = useState('medium');
  const [puzzle, setPuzzle] = useState(null);
  const [foundMap, setFoundMap] = useState({}); // word -> colorIndex
  const [foundCount, setFoundCount] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [timer, setTimer] = useState(0);
  const [generating, setGenerating] = useState(false);

  // Drag selection
  const [isDragging, setIsDragging] = useState(false);
  const [selectionStart, setSelectionStart] = useState(null);
  const [selectionCells, setSelectionCells] = useState([]);
  const [hintCells, setHintCells] = useState([]); // parpadean brevemente
  const [wrongFlash, setWrongFlash] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showSurrenderModal, setShowSurrenderModal] = useState(false);

  const timerRef = useRef(null);
  const trackedRef = useRef(false);

  // --- Cargar palabras del rosco ---
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
                word: String(it.solucion).trim(),
                clue: it.definicion || '',
              }))
              .filter((w) => !/\s|-/.test(w.word) && w.word.length >= 3 && w.word.length <= 15)
          : [];
        setAllWords(words);
      } catch (err) {
        console.error('SopaDeLetras: error cargando datos', err);
        setAllWords([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [level, grade, asignatura]);

  // --- Generar puzzle ---
  const regenerate = useCallback(() => {
    if (allWords.length < 3) return;
    setGenerating(true);

    const cfg = SIZE_CONFIG[size];

    // Coger al menos cfg.words * 2 candidatos
    const pool = [...allWords]
      .filter((w) => w.word.length <= cfg.size)
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.max(cfg.words * 2, 30));

    const p = generateWordSearch(pool, {
      size: cfg.size,
      targetWords: cfg.words,
      allowReverse: cfg.allowReverse,
      allowDiagonal: cfg.allowDiagonal,
    });

    setPuzzle(p);
    setFoundMap({});
    setFoundCount(0);
    setCompleted(false);
    setTimer(0);
    setSelectionStart(null);
    setSelectionCells([]);
    setHintCells([]);
    trackedRef.current = false;
    setGenerating(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- gameMode regenera la sopa al cambiar de modo (intencionado)
  }, [allWords, size, gameMode]);

  useEffect(() => {
    if (!loading && gameMode) regenerate();
  }, [loading, size, gameMode, regenerate]);

  // --- Timer ---
  useEffect(() => {
    if (!puzzle || completed) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [puzzle, completed]);

  // --- Detectar victoria ---
  useEffect(() => {
    if (!puzzle) return;
    if (foundCount > 0 && foundCount >= puzzle.placed.length && !completed) {
      setCompleted(true);
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#a855f7', '#ec4899', '#fbbf24', '#10b981', '#3b82f6'],
      });
    }
  }, [foundCount, puzzle, completed]);

  // --- Puntuación compuesta (puntos por aciertos + bonus por velocidad) ---
  const finalScore = useMemo(() => {
    if (!puzzle || !completed) return 0;
    const basePoints = foundCount * POINTS_PER_WORD;
    const timeBonus = Math.max(0, Math.round(REF_TIME_SEC * (1 - timer / REF_TIME_SEC)));
    return basePoints + timeBonus;
  }, [puzzle, completed, timer, foundCount]);

  const totalWords = puzzle?.placed?.length || 0;
  const nota = useMemo(() => {
    if (totalWords === 0) return 0;
    return Math.round((foundCount / totalWords) * 100) / 10;
  }, [foundCount, totalWords]);

  // --- Tracking XP al completar ---
  useEffect(() => {
    if (!completed || trackedRef.current) return;
    trackedRef.current = true;
    const isExamMode = gameMode === 'exam';
    onGameComplete?.({
      mode: isExamMode ? 'test' : 'practice',
      score: isExamMode ? finalScore : 0,
      maxScore: isExamMode ? totalWords * POINTS_PER_WORD + REF_TIME_SEC : 0,
      correctAnswers: foundCount,
      totalQuestions: totalWords,
      durationSeconds: timer,
    });
  }, [completed, totalWords, foundCount, gameMode, timer, finalScore, onGameComplete]);

  // --- Entregar examen anticipadamente (con modal de confirmación) ---
  const handleSurrender = useCallback(() => {
    if (!puzzle || completed) return;
    setShowSurrenderModal(true);
  }, [puzzle, completed]);

  const confirmSurrender = useCallback(() => {
    setShowSurrenderModal(false);
    setCompleted(true);
  }, []);

  // --- Mapa de celdas ocupadas por palabras ya encontradas ---
  const foundCellsMap = useMemo(() => {
    const map = new Map();
    if (!puzzle) return map;
    let colorIdx = 0;
    for (const p of puzzle.placed) {
      if (p.found && foundMap[p.word] !== undefined) {
        const color = FOUND_COLORS[foundMap[p.word] % FOUND_COLORS.length];
        for (const { r, c } of p.cells) {
          map.set(`${r},${c}`, color);
        }
      }
      // eslint-disable-next-line no-unused-vars -- contador preexistente, se deja intacto
      colorIdx += 1;
    }
    return map;
  }, [puzzle, foundMap]);

  // --- Set de celdas en la selección actual ---
  const selectionCellsSet = useMemo(() => {
    const s = new Set();
    selectionCells.forEach(({ r, c }) => s.add(`${r},${c}`));
    return s;
  }, [selectionCells]);

  const hintCellsSet = useMemo(() => {
    const s = new Set();
    hintCells.forEach(({ r, c }) => s.add(`${r},${c}`));
    return s;
  }, [hintCells]);

  // --- Manejo de selección (pointer events) ---
  const startSelection = useCallback((r, c) => {
    if (!puzzle || completed) return;
    setIsDragging(true);
    setSelectionStart({ r, c });
    setSelectionCells([{ r, c }]);
  }, [puzzle, completed]);

  const updateSelection = useCallback((r, c) => {
    if (!isDragging || !selectionStart) return;
    const cells = snapSelection(selectionStart.r, selectionStart.c, r, c);
    setSelectionCells(cells);
  }, [isDragging, selectionStart]);

  const endSelection = useCallback(() => {
    if (!isDragging || !puzzle) {
      setIsDragging(false);
      return;
    }
    setIsDragging(false);

    if (selectionCells.length < 2) {
      setSelectionCells([]);
      setSelectionStart(null);
      return;
    }

    const match = checkSelection(selectionCells, puzzle.grid, puzzle.placed);
    if (match) {
      // Marcar como encontrada
      const updatedPlaced = puzzle.placed.map((p) =>
        p.word === match.word ? { ...p, found: true } : p
      );
      setPuzzle({ ...puzzle, placed: updatedPlaced });
      setFoundMap((prev) => ({
        ...prev,
        [match.word]: Object.keys(prev).length,
      }));
      setFoundCount((c) => c + 1);
    } else {
      // Flash rojo breve
      setWrongFlash(true);
      setTimeout(() => setWrongFlash(false), 350);
    }

    setSelectionCells([]);
    setSelectionStart(null);
  }, [isDragging, puzzle, selectionCells]);

  // Cancelar selección si pointer sale del grid
  useEffect(() => {
    const handleUp = () => {
      if (isDragging) endSelection();
    };
    window.addEventListener('pointerup', handleUp);
    return () => window.removeEventListener('pointerup', handleUp);
  }, [isDragging, endSelection]);

  // --- Pista (solo en práctica) ---
  const giveHint = useCallback(() => {
    if (!puzzle || gameMode === 'exam') return;
    const pending = puzzle.placed.filter((p) => !p.found);
    if (pending.length === 0) return;
    const pick = pending[Math.floor(Math.random() * pending.length)];
    // Mostrar la primera letra brevemente
    setHintCells([pick.cells[0]]);
    setTimeout(() => setHintCells([]), 1600);
  }, [puzzle, gameMode]);

  // --- Tiempo formateado ---
  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  // --- Render ---
  const shellProps = { accent: '#10b981', accent2: '#0ea5e9' };

  const instructions = (
    <InstructionsModal
      isOpen={showHelp}
      onClose={() => setShowHelp(false)}
      title="Cómo jugar a la Sopa de Letras"
    >
      <h3>🎯 Objetivo</h3>
      <p>
        Encuentra todas las palabras escondidas en la sopa. Las palabras pueden estar
        en <strong>8 direcciones distintas</strong>: horizontal, vertical, diagonal,
        y también al revés (según el tamaño elegido).
      </p>

      <h3>🕹️ Cómo se juega</h3>
      <ul>
        <li><strong>Haz click y arrastra</strong> desde la primera letra de la palabra hasta la última.</li>
        <li>La selección se <strong>ajusta automáticamente</strong> a la línea más cercana (horizontal, vertical o diagonal).</li>
        <li>Si la palabra es válida, se queda rodeada con una cápsula de su propio color.</li>
        <li>Si no, la selección se limpia con un temblor rojo.</li>
        <li>Las palabras encontradas se tachan en el panel de palabras.</li>
        <li>Funciona igual con <strong>touch</strong> en móviles y tablets.</li>
      </ul>

      <h3>💡 Ayudas (solo en Práctica)</h3>
      <ul>
        <li><strong>💡 Pista</strong>: ilumina brevemente la primera letra de una palabra al azar.</li>
        <li>En práctica, la <strong>lista de palabras</strong> está siempre visible.</li>
      </ul>

      <h3>🎓 Tamaños</h3>
      <div className="instr-modes">
        <div className="instr-mode easy">
          <strong>🟢 Pequeño</strong>
          10×10, 8 palabras. Solo horizontal y vertical.
        </div>
        <div className="instr-mode medium">
          <strong>🟡 Mediano</strong>
          12×12, 10 palabras. Añade diagonales.
        </div>
        <div className="instr-mode exam">
          <strong>🔴 Grande</strong>
          14×14, 12 palabras. Las 8 direcciones (incluye al revés).
        </div>
      </div>

      <h3>📊 Nota y puntos en el examen</h3>
      <p>
        Tu nota va de <strong>0 a 10</strong> según las palabras encontradas:
      </p>
      <p className="instr-formula">
        <strong>Nota</strong> = encontradas / total × 10
      </p>
      <p>
        Puedes pulsar <strong>"Entregar examen"</strong> en cualquier momento para
        terminar antes y que se calcule la nota con lo que llevas. Además, ganas
        <strong> puntos para el ranking</strong>:
      </p>
      <p className="instr-formula">
        <strong>Puntos</strong> = encontradas × {POINTS_PER_WORD} + bonus de velocidad
      </p>
      <p className="instr-note">
        Dos partidas con un 10 pueden tener distinta puntuación: gana el ranking quien
        la termine antes.
      </p>

      <div className="instr-tips">
        <strong>💡 Consejo para examen:</strong> en modo examen no ves la lista de palabras,
        sino las <em>definiciones</em> del vocabulario — tienes que adivinar qué
        palabra es y después encontrarla en la sopa.
      </div>
    </InstructionsModal>
  );

  if (loading) {
    return (
      <GameShell {...shellProps}>
        <GameLoading label="Removiendo la sopa…" />
      </GameShell>
    );
  }

  if (allWords.length < 3) {
    return (
      <GameShell {...shellProps}>
        <GameHeader onHelp={() => setShowHelp(true)} />
        <GameEmpty title="Faltan palabras">
          No hay suficientes palabras disponibles para esta asignatura. Se necesitan al menos
          3 palabras del vocabulario.
        </GameEmpty>
        {instructions}
      </GameShell>
    );
  }

  // --- Pantalla previa: elegir modo y tamaño (CLAUDE.md §3: práctica + examen) ---
  if (!gameMode) {
    const modes = [
      {
        id: 'practice', tone: 'easy', icon: Gamepad2, title: 'Práctica',
        desc: 'Ves la lista de palabras y puedes pedir pistas cuando te atasques.',
        features: ['Lista de palabras visible', 'Pistas: se ilumina una primera letra', 'Puntos por rapidez'],
      },
      {
        id: 'exam', tone: 'exam', title: 'Examen',
        desc: 'Solo ves las definiciones: adivina la palabra y búscala en la sopa.',
        features: ['Nota sobre 10', 'Entrega cuando quieras', 'Puntos por rapidez'],
      },
    ];
    return (
      <GameShell {...shellProps}>
        <ModeSelect
          modes={modes}
          onSelect={(id) => setGameMode(id)}
          onHelp={() => setShowHelp(true)}
          extra={(
            <div className="ws-size">
              <span className="ws-size__label"><Grid3x3 size={15} /> Tamaño de la sopa</span>
              <Segmented
                options={Object.entries(SIZE_CONFIG).map(([key, c]) => ({ value: key, label: c.label }))}
                value={size}
                onChange={setSize}
              />
              <span className="ws-size__hint">
                {SIZE_CONFIG[size].size}×{SIZE_CONFIG[size].size} · {SIZE_CONFIG[size].words} palabras · {SIZE_CONFIG[size].allowReverse
                  ? 'en las 8 direcciones'
                  : SIZE_CONFIG[size].allowDiagonal ? 'horizontales, verticales y diagonales' : 'solo horizontales y verticales'}
              </span>
            </div>
          )}
        />
        {instructions}
      </GameShell>
    );
  }

  const isExam = gameMode === 'exam';
  const effectiveSize = size;

  const backToModes = () => {
    setGameMode(null);
    setPuzzle(null);
  };

  const surrenderModal = (
    <AnimatePresence>
      {showSurrenderModal && (
        <motion.div
          className="ws-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowSurrenderModal(false)}
        >
          <motion.div
            className="ws-modal__panel"
            role="dialog"
            aria-modal="true"
            aria-label="Entregar el examen"
            initial={{ scale: 0.88, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.88, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <span className="ws-modal__icon"><GraduationCap size={34} /></span>
            <h3 className="ws-modal__title">¿Entregar el examen?</h3>
            <p className="ws-modal__text">
              Llevas <strong>{foundCount} de {totalWords}</strong> palabras encontradas.<br />
              Tu nota será <strong>{nota.toFixed(1)}/10</strong>.
            </p>
            <div className="ws-modal__actions">
              <GameButton variant="soft" icon={X} onClick={() => setShowSurrenderModal(false)}>
                Cancelar
              </GameButton>
              <GameButton variant="danger" icon={GraduationCap} onClick={confirmSurrender}>
                Entregar
              </GameButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // --- Examen terminado (completo o entregado): resumen con la nota ---
  if (isExam && completed) {
    return (
      <GameShell {...shellProps}>
        <ResultsScreen
          title={foundCount === totalWords ? '¡Examen completado!' : 'Examen entregado'}
          subtitle={`Sopa de Letras · ${subjectInfo.icon} ${subjectInfo.nombre || 'General'}`}
          nota={nota}
          points={finalScore}
          stats={[
            { icon: Puzzle, tone: 'good', label: 'Encontradas', value: `${foundCount}/${totalWords}` },
            { icon: Timer, tone: 'time', label: 'Tiempo', value: formatTime(timer) },
            { icon: Grid3x3, tone: 'progress', label: 'Tamaño', value: `${SIZE_CONFIG[effectiveSize].size}×${SIZE_CONFIG[effectiveSize].size}` },
          ]}
          actions={[
            { label: 'Otra sopa', onClick: regenerate, icon: RefreshCw },
            { label: 'Cambiar de modo', onClick: backToModes, icon: LayoutGrid, variant: 'soft' },
          ]}
        >
          {(puzzle?.placed || []).map((p, i) => (
            <FeedbackItem key={p.word} index={i + 1} ok={!!p.found} title={(p.original || p.word).toUpperCase()}>
              {p.clue || '(sin pista)'}
            </FeedbackItem>
          ))}
        </ResultsScreen>
        {instructions}
      </GameShell>
    );
  }

  const n = puzzle?.size || SIZE_CONFIG[effectiveSize].size;
  const colorOf = (word) => FOUND_COLORS[foundMap[word] % FOUND_COLORS.length];

  return (
    <GameShell {...shellProps}>
      <GameHeader
        mode={isExam ? 'exam' : 'practice'}
        modeLabel={isExam ? 'Examen' : `Práctica · ${SIZE_CONFIG[effectiveSize].label}`}
        onHelp={() => setShowHelp(true)}
        right={(
          <Hud>
            <HudStat icon={Timer} tone="time" value={formatTime(timer)} label="Tiempo" />
            <HudStat icon={Puzzle} tone="good" value={`${foundCount}/${puzzle?.placed?.length || 0}`} label="Encontradas" />
          </Hud>
        )}
      />

      <RoundBanner
        show={completed && !isExam}
        status="won"
        title="¡Sopa completada!"
        subtitle={`${foundCount}/${totalWords} palabras en ${formatTime(timer)} · ${finalScore.toLocaleString('es-ES')} puntos`}
        action={regenerate}
        actionLabel="Otra sopa"
        actionIcon={RefreshCw}
      />

      <div className="ws-layout">
        {/* Tablero */}
        <div className="ws-board-col">
          {generating && <GameLoading label="Generando sopa…" />}
          {puzzle && !generating && (
            <div className={`ws-board ${wrongFlash ? 'is-wrong' : ''} ${completed ? 'is-done' : ''}`}>
              <div
                className="ws-grid"
                style={{ '--n': puzzle.size, gridTemplateColumns: `repeat(${puzzle.size}, minmax(0, 1fr))` }}
              >
                {/* Cápsulas: palabras encontradas + selección en curso */}
                <div className="ws-caps" aria-hidden="true">
                  {puzzle.placed.filter((p) => p.found && foundMap[p.word] !== undefined).map((p) => {
                    const st = capsuleStyle(p.cells, n);
                    return (
                      <span key={p.word} className="ws-cap is-found" style={{ ...st, '--cap': colorOf(p.word) }}>
                        <span className="ws-cap__ink" style={{ transformOrigin: st.transformOrigin }} />
                      </span>
                    );
                  })}
                  {selectionCells.length > 0 && (
                    <span className="ws-cap is-live" style={capsuleStyle(selectionCells, n)}>
                      <span className="ws-cap__ink" />
                    </span>
                  )}
                </div>

                {puzzle.grid.map((row, r) =>
                  row.map((letter, c) => {
                    const key = `${r},${c}`;
                    const inSelection = selectionCellsSet.has(key);
                    const foundColor = foundCellsMap.get(key);
                    const isHint = hintCellsSet.has(key);
                    return (
                      <div
                        key={key}
                        className={`ws-cell ${inSelection ? 'is-sel' : ''} ${
                          foundColor ? 'is-found' : ''
                        } ${isHint ? 'is-hint' : ''}`}
                        style={foundColor ? { '--cap': foundColor } : undefined}
                        onPointerDown={(e) => {
                          e.preventDefault();
                          startSelection(r, c);
                        }}
                        onPointerEnter={() => updateSelection(r, c)}
                      >
                        <span className="ws-cell__letter">{letter}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Palabras (práctica) o pistas (examen) */}
        {puzzle && (
          <Panel variant="surface" className="ws-words">
            <div className="ws-words__head">
              <span className="ws-words__icon">{isExam ? <Search size={15} /> : <Puzzle size={15} />}</span>
              <span className="ws-words__title">{isExam ? 'Pistas' : 'Palabras a encontrar'}</span>
              <span className="ws-words__count">{foundCount}/{totalWords}</span>
            </div>
            <ProgressBar value={foundCount} max={totalWords || 1} tone="good" />
            <ul className={`ws-words__list ${isExam ? 'is-clues' : ''}`}>
              {puzzle.placed.map((p, i) => {
                const color = foundMap[p.word] !== undefined ? colorOf(p.word) : null;
                return (
                  <li
                    key={p.word}
                    className={`ws-word ${p.found ? 'is-found' : ''}`}
                    style={p.found ? { '--cap': color } : undefined}
                  >
                    {isExam ? (
                      <>
                        <span className="ws-word__num">{p.found ? <CheckCircle2 size={14} /> : i + 1}</span>
                        <span className="ws-word__body">
                          <span className="ws-word__clue">{p.clue || '(sin pista)'}</span>
                          {p.found ? (
                            <span className="ws-word__solution">{p.original || p.word}</span>
                          ) : (
                            <span className="ws-word__len">{p.word.length} letras</span>
                          )}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="ws-word__dot">{p.found && <CheckCircle2 size={14} />}</span>
                        <span className="ws-word__text">{p.original || p.word}</span>
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
          </Panel>
        )}
      </div>

      {/* Acciones */}
      {puzzle && !completed && (
        <div className="ws-tools">
          {!isExam && (
            <GameButton variant="warning" icon={Lightbulb} onClick={giveHint}>
              Pista
            </GameButton>
          )}
          {isExam ? (
            <GameButton variant="danger" icon={GraduationCap} onClick={handleSurrender}>
              Entregar examen
            </GameButton>
          ) : (
            <GameButton variant="ghost" icon={RefreshCw} onClick={regenerate}>
              Nueva sopa
            </GameButton>
          )}
        </div>
      )}

      <div className="ws-footer">
        {!isExam && (
          <GameButton variant="soft" size="sm" icon={LayoutGrid} onClick={backToModes}>
            Cambiar modo
          </GameButton>
        )}
        <span className="ws-footer__info">
          <MousePointer2 size={14} />
          {isExam
            ? 'Modo examen · sin pistas · el tamaño se elige antes de empezar'
            : 'Arrastra de la primera a la última letra de cada palabra'}
        </span>
      </div>

      {surrenderModal}
      {instructions}
    </GameShell>
  );
};

export default SopaDeLetras;
