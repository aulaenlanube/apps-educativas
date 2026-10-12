// src/apps/crucigrama/Crucigrama.jsx
// Rediseño 2026 sobre el kit de interfaz de juego (_shared/kit): pantalla previa
// de modos (práctica con tamaño / examen), tablero de casillas con volumen sobre
// pantalla nocturna, pista activa destacada y listas de pistas. La generación,
// la puntuación y el tracking no cambian.
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  RefreshCw, Gamepad2, Lightbulb, Eye, CheckCircle2,
  ArrowRight, ArrowDown, Trophy, Timer, Puzzle, Sparkles, BookOpen,
  LayoutGrid, Grid3x3, Keyboard, Check,
} from 'lucide-react';
import { getRoscoData } from '../../services/gameDataService';
import { generateCrossword, groupClues } from './crosswordGenerator';
import materiasData from '../../../public/data/materias.json';
import InstructionsModal from '../_shared/InstructionsModal';
import {
  GameShell, GameHeader, Hud, HudStat, Panel, Chip, GameButton, Segmented,
  ModeSelect, RoundBanner, ResultsScreen, FeedbackItem, GameLoading, GameEmpty,
} from '../_shared/kit';
import './Crucigrama.css';

const normalize = (s) =>
  String(s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase();

// Carácter "centinela" que mantenemos en el input oculto para que el botón de
// borrar del teclado virtual siempre tenga algo que eliminar y dispare un evento.
const HIDDEN_SENTINEL = ' ';


const SIZE_CONFIG = {
  small:  { label: 'Pequeño',  words: 6,  maxSize: 13, icon: '🟢' },
  medium: { label: 'Mediano',  words: 10, maxSize: 16, icon: '🟡' },
  large:  { label: 'Grande',   words: 15, maxSize: 20, icon: '🔴' },
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

const Crucigrama = ({ onGameComplete }) => {
  const { level, grade: gradeParam, subjectId } = useParams();
  const grade = useMemo(() => parseInt(gradeParam, 10), [gradeParam]);
  const asignatura = subjectId || (level === 'primaria' ? 'lengua' : 'general');
  const subjectInfo = useMemo(() => getSubjectInfo(level, grade, asignatura), [level, grade, asignatura]);

  // --- Estado ---
  const [allWords, setAllWords] = useState([]);
  const [loading, setLoading] = useState(true);
  // null = pantalla previa de modos (CLAUDE.md §3: el modo se elige ANTES de jugar)
  const [gameMode, setGameMode] = useState(null); // null | 'practice' | 'exam'
  const [size, setSize] = useState('medium');
  const [crossword, setCrossword] = useState(null);
  const [userGrid, setUserGrid] = useState(null);
  const [selected, setSelected] = useState(null); // {row, col}
  const [direction, setDirection] = useState('h'); // 'h' | 'v'
  const [wrongCells, setWrongCells] = useState(new Set()); // "r,c"
  const [revealedCells, setRevealedCells] = useState(new Set()); // "r,c"
  const [hintsUsed, setHintsUsed] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [timer, setTimer] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [noPuzzle, setNoPuzzle] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const timerRef = useRef(null);
  const trackedRef = useRef(false);
  const cellRefs = useRef({});
  const hiddenInputRef = useRef(null);

  // --- Cargar datos del rosco ---
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const load = async () => {
      try {
        const data = await getRoscoData(level, grade, asignatura);
        if (cancelled) return;
        const words = Array.isArray(data)
          ? data
              .filter((it) => it && it.solucion && it.definicion)
              .map((it) => ({
                word: String(it.solucion).trim(),
                clue: String(it.definicion).trim(),
              }))
              // Solo palabras simples (sin espacios, sin guiones)
              .filter((w) => !/\s|-/.test(w.word) && w.word.length >= 3)
          : [];
        setAllWords(words);
      } catch (err) {
        console.error('Crucigrama: error cargando datos', err);
        setAllWords([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [level, grade, asignatura]);

  // --- Generar crucigrama cuando cambian palabras, size o gameMode ---
  const regenerate = useCallback(() => {
    if (allWords.length < 3) {
      setNoPuzzle(true);
      setCrossword(null);
      return;
    }
    setGenerating(true);
    setNoPuzzle(false);

    // En examen siempre tamaño grande
    const effectiveSize = gameMode === 'exam' ? 'large' : size;
    const cfg = SIZE_CONFIG[effectiveSize];

    // Limitar la lista de candidatos para no tardar demasiado (cogemos el doble de target)
    const poolSize = Math.min(allWords.length, cfg.words * 3);
    const shuffled = [...allWords].sort(() => Math.random() - 0.5).slice(0, poolSize);

    const puzzle = generateCrossword(shuffled, {
      targetWords: cfg.words,
      maxSize: cfg.maxSize,
    });

    if (!puzzle || puzzle.placed.length < 3) {
      setCrossword(null);
      setNoPuzzle(true);
      setGenerating(false);
      return;
    }

    setCrossword(puzzle);
    const empty = Array.from({ length: puzzle.height }, () =>
      Array(puzzle.width).fill('')
    );
    setUserGrid(empty);
    setWrongCells(new Set());
    setRevealedCells(new Set());
    setHintsUsed(0);
    setCompleted(false);
    setTimer(0);
    trackedRef.current = false;

    // Seleccionar primera celda de la primera palabra horizontal
    const firstH = puzzle.placed.find((p) => p.direction === 'h') || puzzle.placed[0];
    if (firstH) {
      setSelected({ row: firstH.row, col: firstH.col });
      setDirection(firstH.direction);
    }
    setGenerating(false);
  }, [allWords, size, gameMode]);

  useEffect(() => {
    if (!loading && gameMode) regenerate();
  }, [loading, size, gameMode, regenerate]);

  // --- Timer ---
  useEffect(() => {
    if (!crossword || completed) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [crossword, completed]);

  // --- Comprobar si el crucigrama está completo y correcto ---
  const checkComplete = useCallback((grid) => {
    if (!crossword || !grid) return false;
    for (let r = 0; r < crossword.height; r++) {
      for (let c = 0; c < crossword.width; c++) {
        if (crossword.grid[r][c]) {
          if (normalize(grid[r][c]) !== crossword.grid[r][c]) return false;
        }
      }
    }
    return true;
  }, [crossword]);

  // --- Efecto de completado ---
  useEffect(() => {
    if (!userGrid || !crossword || completed) return;
    if (checkComplete(userGrid)) {
      setCompleted(true);
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#a855f7', '#ec4899', '#fbbf24', '#10b981', '#3b82f6'],
      });
    }
  }, [userGrid, crossword, completed, checkComplete]);

  // --- Puntuación compuesta ---
  const finalScore = useMemo(() => {
    if (!crossword || !completed) return 0;
    const wordCount = crossword.placed.length;
    const basePoints = wordCount * 100;
    const refTime = 300;
    const timeBonus = Math.max(0, Math.round(300 * (1 - timer / refTime)));
    const noHintsBonus = hintsUsed === 0 ? 100 : 0;
    return basePoints + timeBonus + noHintsBonus;
  }, [crossword, completed, timer, hintsUsed]);

  // --- Tracking XP al completar ---
  useEffect(() => {
    if (!completed || trackedRef.current) return;
    trackedRef.current = true;
    const words = crossword?.placed?.length || 0;
    const isExamMode = gameMode === 'exam';
    onGameComplete?.({
      mode: isExamMode ? 'test' : 'practice',
      score: isExamMode ? finalScore : 0,
      maxScore: isExamMode ? words * 100 + 400 : 0,
      correctAnswers: words,
      totalQuestions: words,
      durationSeconds: timer,
    });
  }, [completed, crossword, timer, gameMode, finalScore, onGameComplete]);

  // --- Helpers de navegación ---
  const isBlack = useCallback((r, c) => {
    if (!crossword) return true;
    if (r < 0 || c < 0 || r >= crossword.height || c >= crossword.width) return true;
    return !crossword.grid[r][c];
  }, [crossword]);

  const moveSelection = useCallback((dr, dc) => {
    if (!selected || !crossword) return;
    let { row, col } = selected;
    for (let step = 0; step < Math.max(crossword.width, crossword.height); step++) {
      row += dr;
      col += dc;
      if (row < 0 || col < 0 || row >= crossword.height || col >= crossword.width) return;
      if (!isBlack(row, col)) {
        setSelected({ row, col });
        return;
      }
    }
  }, [selected, crossword, isBlack]);

  const moveInDirection = useCallback((forward = true) => {
    if (!selected) return;
    if (direction === 'h') {
      moveSelection(0, forward ? 1 : -1);
    } else {
      moveSelection(forward ? 1 : -1, 0);
    }
  }, [selected, direction, moveSelection]);

  // --- Entrada de letras ---
  const writeLetter = useCallback((letter) => {
    if (!selected || !crossword || completed) return;
    const { row, col } = selected;
    if (isBlack(row, col)) return;
    const key = `${row},${col}`;
    // No permitimos sobrescribir celdas reveladas
    if (revealedCells.has(key)) {
      moveInDirection(true);
      return;
    }
    setUserGrid((prev) => {
      const next = prev.map((r) => [...r]);
      next[row][col] = letter;
      return next;
    });
    // Quitar marca de wrong si la tenía
    setWrongCells((prev) => {
      if (!prev.has(key)) return prev;
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
    moveInDirection(true);
  }, [selected, crossword, completed, isBlack, moveInDirection, revealedCells]);

  const deleteLetter = useCallback(() => {
    if (!selected || !crossword || completed) return;
    const { row, col } = selected;
    if (isBlack(row, col)) return;
    const key = `${row},${col}`;
    if (revealedCells.has(key)) return;
    setUserGrid((prev) => {
      const next = prev.map((r) => [...r]);
      if (next[row][col]) {
        next[row][col] = '';
      } else {
        // Si ya estaba vacío, retroceder y borrar
        if (direction === 'h' && col > 0 && !isBlack(row, col - 1)) {
          next[row][col - 1] = '';
          setSelected({ row, col: col - 1 });
        } else if (direction === 'v' && row > 0 && !isBlack(row - 1, col)) {
          next[row - 1][col] = '';
          setSelected({ row: row - 1, col });
        }
      }
      return next;
    });
    setWrongCells((prev) => {
      if (!prev.has(key)) return prev;
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  }, [selected, crossword, completed, isBlack, direction, revealedCells]);

  // --- Enfocar el input oculto (invoca el teclado virtual en móvil) ---
  const focusHiddenInput = useCallback(() => {
    const el = hiddenInputRef.current;
    if (!el) return;
    // El sentinel garantiza que el "Backspace" del teclado virtual (Android)
    // siempre tenga algo que borrar y dispare un evento de input.
    el.value = HIDDEN_SENTINEL;
    try { el.focus({ preventScroll: true }); } catch { el.focus(); }
  }, []);

  // Mantener el foco en el input mientras haya una casilla seleccionada y la
  // partida esté activa (permite teclear en desktop sin volver a hacer click).
  useEffect(() => {
    if (selected && crossword && !completed) focusHiddenInput();
  }, [selected, crossword, completed, focusHiddenInput]);

  // --- Teclado físico (eventos sobre el input oculto enfocado) ---
  const handleInputKeyDown = useCallback((e) => {
    if (!crossword || completed) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); moveSelection(0, 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); moveSelection(0, -1); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); moveSelection(1, 0); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); moveSelection(-1, 0); }
    else if (e.key === 'Backspace' || e.key === 'Delete') { e.preventDefault(); deleteLetter(); }
    else if (e.key === ' ') {
      e.preventDefault();
      setDirection((d) => (d === 'h' ? 'v' : 'h'));
    } else if (e.key.length === 1 && /[a-zA-ZñÑáéíóúÁÉÍÓÚ]/.test(e.key)) {
      e.preventDefault();
      writeLetter(normalize(e.key));
    }
  }, [crossword, completed, moveSelection, deleteLetter, writeLetter]);

  // --- Teclado virtual (móvil): leemos el evento de input cuando el keydown
  //     no nos da una tecla utilizable (Android reporta key="Unidentified"). ---
  const handleInputChange = useCallback((e) => {
    const el = e.target;
    if (!crossword || completed) { el.value = HIDDEN_SENTINEL; return; }
    const inputType = e.nativeEvent?.inputType;
    if (inputType === 'deleteContentBackward' || inputType === 'deleteContentForward') {
      deleteLetter();
    } else {
      // Caracteres recién insertados (data del evento o, en su defecto, el valor sin el sentinel).
      const data = e.nativeEvent?.data ?? el.value.split(HIDDEN_SENTINEL).join('');
      for (const ch of String(data || '')) {
        if (/[a-zA-ZñÑáéíóúÁÉÍÓÚ]/.test(ch)) writeLetter(normalize(ch));
      }
    }
    el.value = HIDDEN_SENTINEL;
  }, [crossword, completed, deleteLetter, writeLetter]);

  // --- Click en una celda ---
  const handleCellClick = useCallback((row, col) => {
    if (isBlack(row, col)) return;
    if (selected && selected.row === row && selected.col === col) {
      setDirection((d) => (d === 'h' ? 'v' : 'h'));
    } else {
      setSelected({ row, col });
    }
    // Enfocar dentro del gesto del usuario: esto es lo que abre el teclado en móvil.
    focusHiddenInput();
  }, [isBlack, selected, focusHiddenInput]);

  // --- Palabra / pista actual ---
  const currentWord = useMemo(() => {
    if (!crossword || !selected) return null;
    // Buscar palabra en la dirección actual que contenga la celda seleccionada
    const match = crossword.placed.find((p) => {
      if (p.direction !== direction) return false;
      if (direction === 'h') {
        return p.row === selected.row &&
          selected.col >= p.col && selected.col < p.col + p.word.length;
      }
      return p.col === selected.col &&
        selected.row >= p.row && selected.row < p.row + p.word.length;
    });
    // Si no hay en esta dirección, buscar en la otra
    if (match) return match;
    return crossword.placed.find((p) => {
      if (direction === 'h') {
        return p.col === selected.col &&
          selected.row >= p.row && selected.row < p.row + p.word.length;
      }
      return p.row === selected.row &&
        selected.col >= p.col && selected.col < p.col + p.word.length;
    });
  }, [crossword, selected, direction]);

  // --- Highlighting de la palabra actual ---
  const highlightedCells = useMemo(() => {
    const set = new Set();
    if (!currentWord) return set;
    for (let i = 0; i < currentWord.word.length; i++) {
      const r = currentWord.direction === 'v' ? currentWord.row + i : currentWord.row;
      const c = currentWord.direction === 'h' ? currentWord.col + i : currentWord.col;
      set.add(`${r},${c}`);
    }
    return set;
  }, [currentWord]);

  // --- Revelar una letra (help) ---
  const revealLetter = useCallback(() => {
    if (!selected || !crossword || gameMode === 'exam') return;
    const { row, col } = selected;
    if (isBlack(row, col)) return;
    const key = `${row},${col}`;
    const correct = crossword.grid[row][col];
    setUserGrid((prev) => {
      const next = prev.map((r) => [...r]);
      next[row][col] = correct;
      return next;
    });
    setRevealedCells((prev) => new Set(prev).add(key));
    setWrongCells((prev) => {
      if (!prev.has(key)) return prev;
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
    setHintsUsed((h) => h + 1);
  }, [selected, crossword, isBlack, gameMode]);

  // --- Comprobar (marca celdas mal) ---
  const checkAnswers = useCallback(() => {
    if (!crossword || !userGrid || gameMode === 'exam') return;
    const wrong = new Set();
    for (let r = 0; r < crossword.height; r++) {
      for (let c = 0; c < crossword.width; c++) {
        if (crossword.grid[r][c]) {
          const entered = normalize(userGrid[r][c] || '');
          if (entered && entered !== crossword.grid[r][c]) {
            wrong.add(`${r},${c}`);
          }
        }
      }
    }
    setWrongCells(wrong);
    setHintsUsed((h) => h + 1);
  }, [crossword, userGrid, gameMode]);

  // --- Resolver todo (solo desarrollo / fin) ---
  const revealAll = useCallback(() => {
    if (!crossword || gameMode === 'exam') return;
    setUserGrid(() => {
      const next = Array.from({ length: crossword.height }, (_, r) =>
        Array.from({ length: crossword.width }, (_, c) =>
          crossword.grid[r][c] || ''
        )
      );
      return next;
    });
    const all = new Set();
    for (let r = 0; r < crossword.height; r++) {
      for (let c = 0; c < crossword.width; c++) {
        if (crossword.grid[r][c]) all.add(`${r},${c}`);
      }
    }
    setRevealedCells(all);
    setHintsUsed((h) => h + 10);
  }, [crossword, gameMode]);

  // --- Formato tiempo ---
  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  // --- Render ---
  const shellProps = { accent: '#6366f1', accent2: '#8b5cf6' };

  const instructions = (
    <InstructionsModal
      isOpen={showHelp}
      onClose={() => setShowHelp(false)}
      title="Cómo jugar al Crucigrama"
    >
      <h3>🎯 Objetivo</h3>
      <p>
        Rellena todas las casillas blancas con la palabra correcta usando las
        <strong> pistas horizontales y verticales</strong>. Las palabras se cruzan
        entre ellas compartiendo letras.
      </p>

      <h3>🕹️ Cómo se juega</h3>
      <ul>
        <li><strong>Click en una casilla</strong> para seleccionarla. Un segundo click cambia la dirección (↔ / ↕).</li>
        <li>Escribe la letra con el teclado físico y avanza automáticamente.</li>
        <li>Usa <kbd>←</kbd><kbd>→</kbd><kbd>↑</kbd><kbd>↓</kbd> para moverte entre casillas.</li>
        <li><kbd>Espacio</kbd> cambia entre dirección horizontal y vertical.</li>
        <li><kbd>Retroceso</kbd> borra y retrocede.</li>
        <li>Click en una pista de las listas salta a esa palabra.</li>
        <li>La tarjeta de arriba siempre muestra la pista de la palabra activa.</li>
      </ul>

      <h3>💡 Ayudas (solo en Práctica)</h3>
      <ul>
        <li><strong>👁 Revelar letra</strong>: muestra la letra correcta de la casilla seleccionada.</li>
        <li><strong>✅ Comprobar</strong>: marca en rojo las letras incorrectas.</li>
        <li><strong>✨ Solución</strong>: revela el crucigrama completo.</li>
      </ul>

      <h3>🎓 Modos y tamaños</h3>
      <div className="instr-modes">
        <div className="instr-mode easy">
          <strong>🟢 Pequeño</strong>
          ~6 palabras, ideal para empezar.
        </div>
        <div className="instr-mode medium">
          <strong>🟡 Mediano</strong>
          ~10 palabras, reto equilibrado.
        </div>
        <div className="instr-mode exam">
          <strong>🔴 Grande</strong>
          ~15 palabras. Obligatorio en modo examen (sin ayudas).
        </div>
      </div>

      <div className="instr-tips">
        <strong>💡 Consejo:</strong> empieza por las pistas que creas más fáciles. Las letras
        que coloques te ayudarán a descifrar las palabras que se cruzan con ellas.
      </div>
    </InstructionsModal>
  );

  if (loading) {
    return (
      <GameShell {...shellProps}>
        <GameLoading label="Preparando el crucigrama…" />
      </GameShell>
    );
  }

  if (allWords.length < 3) {
    return (
      <GameShell {...shellProps}>
        <GameHeader onHelp={() => setShowHelp(true)} />
        <GameEmpty title="Faltan palabras">
          No hay suficientes palabras disponibles para esta asignatura. Se necesitan al menos
          3 palabras simples del vocabulario.
        </GameEmpty>
        {instructions}
      </GameShell>
    );
  }

  // --- Pantalla previa: elegir modo (CLAUDE.md §3: práctica + examen) ---
  if (!gameMode) {
    const modes = [
      {
        id: 'practice', tone: 'easy', icon: Gamepad2, title: 'Práctica',
        desc: 'Elige el tamaño y usa las ayudas cuando te atasques.',
        features: ['Revelar letra, comprobar y solución', 'Tres tamaños: 6, 10 o 15 palabras', 'Puntos por rapidez'],
      },
      {
        id: 'exam', tone: 'exam', title: 'Examen',
        desc: 'Crucigrama grande de 15 palabras y sin ninguna ayuda.',
        features: ['Nota sobre 10 al completarlo', 'Tamaño grande, sin ayudas', 'Puntos por rapidez'],
      },
    ];
    return (
      <GameShell {...shellProps}>
        <ModeSelect
          modes={modes}
          onSelect={(id) => setGameMode(id)}
          onHelp={() => setShowHelp(true)}
          extra={(
            <div className="cw-size">
              <span className="cw-size__label"><Grid3x3 size={15} /> Tamaño en práctica</span>
              <Segmented
                options={Object.entries(SIZE_CONFIG).map(([key, c]) => ({ value: key, label: `${c.label} · ${c.words}` }))}
                value={size}
                onChange={setSize}
              />
            </div>
          )}
          footer={<span className="cw-modes-foot"><Keyboard size={14} /> Se juega con el teclado: escribe, muévete con las flechas y cambia de dirección con Espacio</span>}
        />
        {instructions}
      </GameShell>
    );
  }

  const { horizontales = [], verticales = [] } = crossword ? groupClues(crossword) : {};
  const isExam = gameMode === 'exam';
  const effectiveSize = isExam ? 'large' : size;
  const wordCount = crossword?.placed?.length || 0;

  const backToModes = () => {
    setGameMode(null);
    setCrossword(null);
  };

  // --- Examen completado: resumen con la nota ---
  if (isExam && completed) {
    // En examen, la nota siempre es 10 porque solo se llega aquí si completaste todo
    const nota = 10;
    const solved = [...horizontales.map((p) => ({ ...p, dir: 'h' })), ...verticales.map((p) => ({ ...p, dir: 'v' }))]
      .sort((a, b) => a.number - b.number || (a.dir === 'h' ? -1 : 1));
    return (
      <GameShell {...shellProps}>
        <ResultsScreen
          title="¡Crucigrama completado!"
          subtitle={`Crucigrama · ${subjectInfo.icon} ${subjectInfo.nombre || 'General'}`}
          nota={nota}
          points={finalScore}
          stats={[
            { icon: Timer, tone: 'time', label: 'Tiempo', value: formatTime(timer) },
            { icon: Puzzle, tone: 'progress', label: 'Palabras', value: wordCount },
            { icon: Trophy, tone: 'good', label: 'Ayudas', value: 'Ninguna' },
          ]}
          actions={[
            { label: 'Otro crucigrama', onClick: regenerate, icon: RefreshCw },
            { label: 'Cambiar de modo', onClick: backToModes, icon: LayoutGrid, variant: 'soft' },
          ]}
        >
          {solved.map((p) => (
            <FeedbackItem key={`${p.dir}-${p.number}`} index={p.number} ok title={(p.original || p.word).toUpperCase()}>
              {p.dir === 'h' ? 'Horizontal' : 'Vertical'} · {p.clue}
            </FeedbackItem>
          ))}
        </ResultsScreen>
        {instructions}
      </GameShell>
    );
  }

  // Palabras con todas sus casillas escritas (solo presentación, no dice si están bien)
  const isWordFilled = (p) => {
    if (!userGrid) return false;
    for (let i = 0; i < p.word.length; i++) {
      const r = p.direction === 'v' ? p.row + i : p.row;
      const c = p.direction === 'h' ? p.col + i : p.col;
      if (!userGrid[r]?.[c]) return false;
    }
    return true;
  };

  const clueColumns = [
    { dir: 'h', label: 'Horizontales', Icon: ArrowRight, list: horizontales },
    { dir: 'v', label: 'Verticales', Icon: ArrowDown, list: verticales },
  ];

  return (
    <GameShell {...shellProps}>
      <GameHeader
        mode={isExam ? 'exam' : 'practice'}
        modeLabel={isExam ? 'Examen' : `Práctica · ${SIZE_CONFIG[effectiveSize].label}`}
        onHelp={() => setShowHelp(true)}
        right={(
          <Hud>
            <HudStat icon={Timer} tone="time" value={formatTime(timer)} label="Tiempo" />
            <HudStat icon={Puzzle} tone="progress" value={wordCount} label="Palabras" />
            {!isExam && hintsUsed > 0 && (
              <HudStat icon={Lightbulb} tone="streak" value={hintsUsed} label="Ayudas" />
            )}
          </Hud>
        )}
      />

      {/* Pista de la palabra activa */}
      {currentWord && crossword && !completed && (
        <motion.div
          className="cw-now"
          key={`${currentWord.number}-${currentWord.direction}`}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <span className="cw-now__num">{currentWord.number}</span>
          <div className="cw-now__body">
            <span className="cw-now__dir">
              {currentWord.direction === 'h'
                ? <><ArrowRight size={13} /> Horizontal</>
                : <><ArrowDown size={13} /> Vertical</>}
              <span className="cw-now__len">{currentWord.word.length} letras</span>
            </span>
            <span className="cw-now__text">{currentWord.clue}</span>
          </div>
        </motion.div>
      )}

      <RoundBanner
        show={completed && !isExam}
        status="won"
        title="¡Crucigrama completado!"
        subtitle={`${wordCount} palabras en ${formatTime(timer)} · ${finalScore.toLocaleString('es-ES')} puntos · ${hintsUsed} ayudas`}
        action={regenerate}
        actionLabel="Otro crucigrama"
        actionIcon={RefreshCw}
      />

      <div className="cw-layout">
        <div className="cw-board-col">
          {/* Input oculto: al enfocarlo (tap en una casilla) invoca el teclado virtual en móvil */}
          <input
            ref={hiddenInputRef}
            className="cw-hidden-input"
            type="text"
            defaultValue={HIDDEN_SENTINEL}
            inputMode="text"
            autoCapitalize="characters"
            autoCorrect="off"
            autoComplete="off"
            spellCheck={false}
            aria-hidden="true"
            tabIndex={-1}
            onKeyDown={handleInputKeyDown}
            onInput={handleInputChange}
          />
          {generating && <GameLoading label="Generando crucigrama…" />}
          {noPuzzle && (
            <GameEmpty
              title="No ha salido el crucigrama"
              action={<GameButton icon={RefreshCw} onClick={regenerate}>Intentar de nuevo</GameButton>}
            >
              No se ha podido generar el crucigrama con las palabras disponibles.
            </GameEmpty>
          )}
          {crossword && !generating && (
            <Panel variant="screen" className={`cw-board ${completed ? 'is-done' : ''}`}>
              <div
                className="cw-grid"
                data-dir={direction}
                style={{ '--cols': crossword.width, '--rows': crossword.height }}
              >
                {Array.from({ length: crossword.height }).map((_, r) =>
                  Array.from({ length: crossword.width }).map((_, c) => {
                    const letter = crossword.grid[r][c];
                    const num = crossword.numbers[r][c];
                    const key = `${r},${c}`;
                    const userLetter = userGrid?.[r]?.[c] || '';
                    const isSelected = selected && selected.row === r && selected.col === c;
                    const isHighlight = highlightedCells.has(key);
                    const isWrong = wrongCells.has(key);
                    const isRevealed = revealedCells.has(key);

                    if (!letter) {
                      return <div key={key} className="cw-cell is-void" />;
                    }
                    return (
                      <div
                        key={key}
                        ref={(el) => { cellRefs.current[key] = el; }}
                        className={`cw-cell ${isSelected ? 'is-sel' : ''} ${
                          isHighlight ? 'is-hl' : ''
                        } ${isWrong ? 'is-wrong' : ''} ${isRevealed ? 'is-revealed' : ''} ${userLetter ? 'is-filled' : ''}`}
                        style={completed ? { '--d': r + c } : undefined}
                        onClick={() => handleCellClick(r, c)}
                      >
                        {num > 0 && <span className="cw-cell__num">{num}</span>}
                        <span key={userLetter || 'empty'} className="cw-cell__letter">{userLetter}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </Panel>
          )}
        </div>

        {/* Listas de pistas */}
        {crossword && (
          <div className="cw-clues">
            {clueColumns.map(({ dir, label, Icon, list }) => (
              <Panel key={dir} variant="surface" className="cw-cluebox">
                <div className="cw-cluebox__title">
                  <span className="cw-cluebox__icon"><Icon size={14} /></span>
                  {label}
                  <span className="cw-cluebox__count">{list.length}</span>
                </div>
                <ul className="cw-cluelist">
                  {list.map((p) => {
                    const active = currentWord && currentWord.number === p.number && currentWord.direction === dir;
                    const filled = isWordFilled(p);
                    return (
                      <li
                        key={`${dir}-${p.number}`}
                        className={`cw-clueitem ${active ? 'is-active' : ''} ${filled ? 'is-filled' : ''}`}
                        onClick={() => {
                          setSelected({ row: p.row, col: p.col });
                          setDirection(dir);
                        }}
                      >
                        <span className="cw-clueitem__num">{filled ? <Check size={12} strokeWidth={3} /> : p.number}</span>
                        <span className="cw-clueitem__text">{p.clue}</span>
                        <span className="cw-clueitem__len">{p.word.length}</span>
                      </li>
                    );
                  })}
                </ul>
              </Panel>
            ))}
          </div>
        )}
      </div>

      {/* Ayudas y acciones */}
      {crossword && !completed && (
        <div className="cw-tools">
          {!isExam ? (
            <>
              <GameButton variant="soft" icon={Eye} onClick={revealLetter} title="Revelar letra seleccionada">
                Revelar letra
              </GameButton>
              <GameButton variant="soft" icon={CheckCircle2} onClick={checkAnswers} title="Comprobar respuestas">
                Comprobar
              </GameButton>
              <GameButton variant="warning" icon={Sparkles} onClick={revealAll} title="Mostrar solución completa">
                Solución
              </GameButton>
            </>
          ) : (
            <Chip tone="soft" icon={BookOpen} className="cw-exam-chip">Sin ayudas. ¡Suerte!</Chip>
          )}
          <GameButton variant="ghost" icon={RefreshCw} onClick={regenerate} title="Nuevo crucigrama">
            Nuevo
          </GameButton>
        </div>
      )}

      <div className="cw-footer">
        {!isExam && (
          <GameButton variant="soft" size="sm" icon={LayoutGrid} onClick={backToModes}>
            Cambiar modo
          </GameButton>
        )}
        <span className="cw-footer__info">
          <Keyboard size={14} /> Doble toque en una casilla o <kbd>Espacio</kbd> para cambiar de dirección
        </span>
      </div>

      {instructions}
    </GameShell>
  );
};

export default Crucigrama;
