// src/apps/crucigrama/Crucigrama.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  RefreshCw, GraduationCap, Gamepad2, Lightbulb, Eye, CheckCircle2,
  ArrowRight, ArrowDown, Trophy, Timer, Puzzle, Award, Sparkles, BookOpen
} from 'lucide-react';
import { getRoscoData } from '../../services/gameDataService';
import { generateCrossword, groupClues } from './crosswordGenerator';
import materiasData from '../../../public/data/materias.json';
import InstructionsModal, { InstructionsButton } from '../_shared/InstructionsModal';
import './Crucigrama.css';

const normalize = (s) =>
  String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();

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
  const [gameMode, setGameMode] = useState('practice'); // 'practice' | 'exam'
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
    if (!loading) regenerate();
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

  // --- Teclado físico ---
  useEffect(() => {
    const handler = (e) => {
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
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [crossword, completed, moveSelection, deleteLetter, writeLetter]);

  // --- Click en una celda ---
  const handleCellClick = useCallback((row, col) => {
    if (isBlack(row, col)) return;
    if (selected && selected.row === row && selected.col === col) {
      setDirection((d) => (d === 'h' ? 'v' : 'h'));
    } else {
      setSelected({ row, col });
    }
  }, [isBlack, selected]);

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
  if (loading) {
    return (
      <div className="cruci-root">
        <div className="cruci-card">
          <div className="cruci-loading">Cargando crucigrama...</div>
        </div>
      </div>
    );
  }

  if (allWords.length < 3) {
    return (
      <div className="cruci-root">
        <div className="cruci-card">
          <div className="cruci-title">
            <span>🧩</span> Crucigrama
          </div>
          <div className="cruci-empty">
            <p>No hay suficientes palabras disponibles para esta asignatura.</p>
            <p className="cruci-empty-sub">Se necesitan al menos 3 palabras simples del vocabulario.</p>
          </div>
        </div>
      </div>
    );
  }

  const { horizontales = [], verticales = [] } = crossword ? groupClues(crossword) : {};
  const isExam = gameMode === 'exam';
  const effectiveSize = isExam ? 'large' : size;

  return (
    <div className="cruci-root">
      <motion.div
        className="cruci-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="cruci-header">
          <div className="cruci-title">
            <span className="cruci-emoji">🧩</span>
            <span>Crucigrama</span>
            <InstructionsButton onClick={() => setShowHelp(true)} />
          </div>
          <div className="cruci-stats">
            <div className="cruci-stat timer" title="Tiempo">
              <Timer size={16} />
              <span>{formatTime(timer)}</span>
            </div>
            <div className="cruci-stat words" title="Palabras">
              <Puzzle size={16} />
              <span>{crossword?.placed?.length || 0}</span>
            </div>
            {!isExam && hintsUsed > 0 && (
              <div className="cruci-stat hints" title="Ayudas usadas">
                <Lightbulb size={16} />
                <span>{hintsUsed}</span>
              </div>
            )}
          </div>
        </div>

        {/* Subtitle */}
        <div className="cruci-subtitle">
          {subjectInfo.icon} {subjectInfo.nombre || 'General'}
        </div>

        {/* Tabs práctica / examen */}
        <div className="cruci-gamemode-tabs">
          <button
            className={`cruci-gamemode-tab ${!isExam ? 'active' : ''}`}
            onClick={() => setGameMode('practice')}
          >
            <Gamepad2 size={16} /> Práctica
          </button>
          <button
            className={`cruci-gamemode-tab ${isExam ? 'active' : ''}`}
            onClick={() => setGameMode('exam')}
          >
            <GraduationCap size={16} /> Examen
          </button>
        </div>

        {/* Selector de tamaño (solo práctica) */}
        {!isExam && (
          <div className="cruci-size-switch">
            {Object.entries(SIZE_CONFIG).map(([key, cfg]) => (
              <button
                key={key}
                className={`cruci-size-btn ${size === key ? 'active' : ''}`}
                onClick={() => setSize(key)}
              >
                <span className="cruci-size-icon">{cfg.icon}</span>
                <span className="cruci-size-label">{cfg.label}</span>
                <span className="cruci-size-count">{cfg.words} palabras</span>
              </button>
            ))}
          </div>
        )}

        {isExam && (
          <div className="cruci-exam-banner">
            <GraduationCap size={16} />
            <span>Modo examen · tamaño grande · sin pistas</span>
          </div>
        )}

        {/* Pista actual */}
        {currentWord && crossword && !completed && (
          <motion.div
            className="cruci-clue-current"
            key={`${currentWord.number}-${currentWord.direction}`}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="cruci-clue-badge">
              <span className="cruci-clue-num">{currentWord.number}</span>
              <span className="cruci-clue-dir">
                {currentWord.direction === 'h' ? (
                  <><ArrowRight size={14} /> Horizontal</>
                ) : (
                  <><ArrowDown size={14} /> Vertical</>
                )}
              </span>
            </div>
            <div className="cruci-clue-text">{currentWord.clue}</div>
          </motion.div>
        )}

        {/* Grid + Clues */}
        <div className="cruci-layout">
          <div className="cruci-grid-wrap">
            {generating && <div className="cruci-generating">Generando crucigrama...</div>}
            {noPuzzle && (
              <div className="cruci-empty">
                <p>No se ha podido generar el crucigrama con las palabras disponibles.</p>
                <button className="cruci-btn primary" onClick={regenerate}>
                  <RefreshCw size={16} /> Intentar de nuevo
                </button>
              </div>
            )}
            {crossword && !generating && (
              <div
                className={`cruci-grid size-${effectiveSize}`}
                style={{
                  gridTemplateColumns: `repeat(${crossword.width}, minmax(0, 1fr))`,
                }}
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
                      return <div key={key} className="cruci-cell black" />;
                    }
                    return (
                      <div
                        key={key}
                        ref={(el) => { cellRefs.current[key] = el; }}
                        className={`cruci-cell ${isSelected ? 'selected' : ''} ${
                          isHighlight ? 'highlight' : ''
                        } ${isWrong ? 'wrong' : ''} ${isRevealed ? 'revealed' : ''}`}
                        onClick={() => handleCellClick(r, c)}
                      >
                        {num > 0 && <span className="cruci-cell-num">{num}</span>}
                        <span className="cruci-cell-letter">{userLetter}</span>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Lista de pistas */}
          {crossword && (
            <div className="cruci-clues">
              <div className="cruci-clues-col">
                <div className="cruci-clues-title">
                  <ArrowRight size={14} /> Horizontales
                </div>
                <ul className="cruci-clues-list">
                  {horizontales.map((p) => (
                    <li
                      key={`h-${p.number}`}
                      className={`cruci-clue-item ${
                        currentWord && currentWord.number === p.number && currentWord.direction === 'h'
                          ? 'active'
                          : ''
                      }`}
                      onClick={() => {
                        setSelected({ row: p.row, col: p.col });
                        setDirection('h');
                      }}
                    >
                      <span className="cruci-clue-item-num">{p.number}.</span>
                      <span className="cruci-clue-item-text">{p.clue}</span>
                      <span className="cruci-clue-item-len">({p.word.length})</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="cruci-clues-col">
                <div className="cruci-clues-title">
                  <ArrowDown size={14} /> Verticales
                </div>
                <ul className="cruci-clues-list">
                  {verticales.map((p) => (
                    <li
                      key={`v-${p.number}`}
                      className={`cruci-clue-item ${
                        currentWord && currentWord.number === p.number && currentWord.direction === 'v'
                          ? 'active'
                          : ''
                      }`}
                      onClick={() => {
                        setSelected({ row: p.row, col: p.col });
                        setDirection('v');
                      }}
                    >
                      <span className="cruci-clue-item-num">{p.number}.</span>
                      <span className="cruci-clue-item-text">{p.clue}</span>
                      <span className="cruci-clue-item-len">({p.word.length})</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Acciones */}
        {crossword && !completed && (
          <div className="cruci-actions">
            {!isExam ? (
              <>
                <button className="cruci-btn hint" onClick={revealLetter} title="Revelar letra seleccionada">
                  <Eye size={16} /> Revelar letra
                </button>
                <button className="cruci-btn hint" onClick={checkAnswers} title="Comprobar respuestas">
                  <CheckCircle2 size={16} /> Comprobar
                </button>
                <button className="cruci-btn hint" onClick={revealAll} title="Mostrar solución completa">
                  <Sparkles size={16} /> Solución
                </button>
              </>
            ) : (
              <div className="cruci-exam-info">
                <BookOpen size={14} />
                <span>Sin ayudas. Suerte!</span>
              </div>
            )}
            <button className="cruci-btn ghost" onClick={regenerate} title="Nuevo crucigrama">
              <RefreshCw size={16} /> Nuevo
            </button>
          </div>
        )}

        {/* Pantalla de completado */}
        <AnimatePresence>
          {completed && (() => {
            // En examen, la nota siempre es 10 porque solo se llega aquí si completaste todo
            // pero aplicamos una penalización si tardaste mucho (para dar matices)
            const nota = 10;
            const notaColor = 'excellent';
            return (
              <motion.div
                className="cruci-completed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="cruci-completed-icon">
                  <Award size={48} />
                </div>
                <h2 className="cruci-completed-title">¡Crucigrama completado! 🎉</h2>

                {isExam ? (
                  <>
                    <div className={`cruci-nota ${notaColor}`}>
                      <div className="cruci-nota-big">
                        {nota.toFixed(1)}<span className="cruci-nota-small">/10</span>
                      </div>
                      <div className="cruci-nota-msg">¡Excelente! 🌟</div>
                    </div>
                    <div className="cruci-completed-record">
                      <Trophy size={14} />
                      <span className="cruci-completed-record-value">
                        {finalScore.toLocaleString('es-ES')}
                      </span>
                      <span className="cruci-completed-record-label">puntos · ¡supera tu récord!</span>
                    </div>
                  </>
                ) : (
                  <div className="cruci-completed-score">
                    <Trophy size={14} /> {finalScore.toLocaleString('es-ES')} puntos
                  </div>
                )}

                <div className="cruci-completed-stats">
                  <div className="cruci-completed-stat">
                    <Timer size={16} /> {formatTime(timer)}
                  </div>
                  <div className="cruci-completed-stat">
                    <Puzzle size={16} /> {crossword?.placed?.length || 0} palabras
                  </div>
                  {!isExam && (
                    <div className="cruci-completed-stat">
                      <Lightbulb size={16} /> {hintsUsed} ayudas
                    </div>
                  )}
                  {isExam && (
                    <div className="cruci-completed-stat exam">
                      <Trophy size={16} /> ¡Sin ayudas!
                    </div>
                  )}
                </div>
                <button className="cruci-btn primary" onClick={regenerate}>
                  <RefreshCw size={16} /> Otro crucigrama
                </button>
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </motion.div>

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
          <li>Click en una pista del panel derecho salta a esa palabra.</li>
          <li>El banner morado de arriba siempre muestra la pista de la palabra activa.</li>
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
    </div>
  );
};

export default Crucigrama;
