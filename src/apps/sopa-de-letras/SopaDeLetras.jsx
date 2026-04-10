// src/apps/sopa-de-letras/SopaDeLetras.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Timer, Search, Lightbulb, RefreshCw, GraduationCap, Gamepad2, Award,
  CheckCircle2, Trophy, Puzzle,
} from 'lucide-react';
import { getRoscoData } from '../../services/gameDataService';
import { generateWordSearch, snapSelection, checkSelection } from './wordSearchGenerator';
import materiasData from '../../../public/data/materias.json';
import InstructionsModal, { InstructionsButton } from '../_shared/InstructionsModal';
import './SopaDeLetras.css';

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
    size: 13,
    words: 12,
    allowReverse: false,
    allowDiagonal: true,
    icon: '🟡',
  },
  large: {
    label: 'Grande',
    size: 16,
    words: 18,
    allowReverse: true,
    allowDiagonal: true,
    icon: '🔴',
  },
};

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
  const [gameMode, setGameMode] = useState('practice'); // 'practice' | 'exam'
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

    // En examen, siempre tamaño grande
    const effectiveSize = gameMode === 'exam' ? 'large' : size;
    const cfg = SIZE_CONFIG[effectiveSize];

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
  }, [allWords, size, gameMode]);

  useEffect(() => {
    if (!loading) regenerate();
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

  // --- Puntuación compuesta ---
  const finalScore = useMemo(() => {
    if (!puzzle || !completed) return 0;
    const wordCount = puzzle.placed.length;
    const basePoints = wordCount * 100;
    const refTime = 300; // 5 min referencia
    const timeBonus = Math.max(0, Math.round(300 * (1 - timer / refTime)));
    return basePoints + timeBonus;
  }, [puzzle, completed, timer]);

  // --- Tracking XP al completar ---
  useEffect(() => {
    if (!completed || trackedRef.current) return;
    trackedRef.current = true;
    const total = puzzle?.placed?.length || 0;
    const isExamMode = gameMode === 'exam';
    onGameComplete?.({
      mode: isExamMode ? 'test' : 'practice',
      score: isExamMode ? finalScore : 0,
      maxScore: isExamMode ? total * 100 + 300 : 0,
      correctAnswers: total,
      totalQuestions: total,
      durationSeconds: timer,
    });
  }, [completed, puzzle, gameMode, timer, finalScore, onGameComplete]);

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
  if (loading) {
    return (
      <div className="sopa-root">
        <div className="sopa-card">
          <div className="sopa-loading">Cargando sopa de letras...</div>
        </div>
      </div>
    );
  }

  if (allWords.length < 3) {
    return (
      <div className="sopa-root">
        <div className="sopa-card">
          <div className="sopa-title">
            <span>🔍</span> Sopa de Letras
          </div>
          <div className="sopa-empty">
            <p>No hay suficientes palabras disponibles para esta asignatura.</p>
            <p className="sopa-empty-sub">Se necesitan al menos 3 palabras del vocabulario.</p>
          </div>
        </div>
      </div>
    );
  }

  const isExam = gameMode === 'exam';
  const effectiveSize = isExam ? 'large' : size;

  return (
    <div className="sopa-root">
      <motion.div
        className="sopa-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="sopa-header">
          <div className="sopa-title">
            <span className="sopa-emoji">🔍</span>
            <span>Sopa de Letras</span>
            <InstructionsButton onClick={() => setShowHelp(true)} />
          </div>
          <div className="sopa-stats">
            <div className="sopa-stat timer" title="Tiempo">
              <Timer size={16} />
              <span>{formatTime(timer)}</span>
            </div>
            <div className="sopa-stat words" title="Encontradas">
              <Puzzle size={16} />
              <span>{foundCount}/{puzzle?.placed?.length || 0}</span>
            </div>
          </div>
        </div>

        <div className="sopa-subtitle">
          {subjectInfo.icon} {subjectInfo.nombre || 'General'}
        </div>

        {/* Tabs modo de juego */}
        <div className="sopa-gamemode-tabs">
          <button
            className={`sopa-gamemode-tab ${!isExam ? 'active' : ''}`}
            onClick={() => setGameMode('practice')}
          >
            <Gamepad2 size={16} /> Práctica
          </button>
          <button
            className={`sopa-gamemode-tab ${isExam ? 'active' : ''}`}
            onClick={() => setGameMode('exam')}
          >
            <GraduationCap size={16} /> Examen
          </button>
        </div>

        {/* Selector de tamaño (solo práctica) */}
        {!isExam && (
          <div className="sopa-size-switch">
            {Object.entries(SIZE_CONFIG).map(([key, cfg]) => (
              <button
                key={key}
                className={`sopa-size-btn ${size === key ? 'active' : ''}`}
                onClick={() => setSize(key)}
              >
                <span className="sopa-size-icon">{cfg.icon}</span>
                <span className="sopa-size-label">{cfg.label}</span>
                <span className="sopa-size-count">{cfg.size}×{cfg.size} · {cfg.words} palabras</span>
              </button>
            ))}
          </div>
        )}

        {isExam && (
          <div className="sopa-exam-banner">
            <GraduationCap size={16} />
            <span>Modo examen · tamaño grande · 8 direcciones · sin pistas</span>
          </div>
        )}

        {/* Layout: grid + lista */}
        <div className={`sopa-layout ${wrongFlash ? 'wrong-flash' : ''}`}>
          <div className="sopa-grid-wrap">
            {generating && <div className="sopa-generating">Generando sopa...</div>}
            {puzzle && !generating && (
              <div
                className={`sopa-grid size-${effectiveSize}`}
                style={{
                  gridTemplateColumns: `repeat(${puzzle.size}, minmax(0, 1fr))`,
                }}
              >
                {puzzle.grid.map((row, r) =>
                  row.map((letter, c) => {
                    const key = `${r},${c}`;
                    const inSelection = selectionCellsSet.has(key);
                    const foundColor = foundCellsMap.get(key);
                    const isHint = hintCellsSet.has(key);
                    return (
                      <div
                        key={key}
                        className={`sopa-cell ${inSelection ? 'selecting' : ''} ${
                          foundColor ? 'found' : ''
                        } ${isHint ? 'hint' : ''}`}
                        style={foundColor ? { background: foundColor } : undefined}
                        onPointerDown={(e) => {
                          e.preventDefault();
                          startSelection(r, c);
                        }}
                        onPointerEnter={() => updateSelection(r, c)}
                      >
                        {letter}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Lista de palabras o pistas */}
          {puzzle && (
            <div className="sopa-words-panel">
              <div className="sopa-words-title">
                {isExam ? (
                  <><Search size={14} /> Pistas</>
                ) : (
                  <><Puzzle size={14} /> Palabras a encontrar</>
                )}
              </div>
              <ul className="sopa-words-list">
                {puzzle.placed.map((p, i) => {
                  const colorIdx = foundMap[p.word];
                  const color = colorIdx !== undefined
                    ? FOUND_COLORS[colorIdx % FOUND_COLORS.length]
                    : null;
                  return (
                    <li
                      key={p.word}
                      className={`sopa-word-item ${p.found ? 'found' : ''}`}
                      style={p.found ? { borderColor: color, background: `${color}15` } : undefined}
                    >
                      {isExam ? (
                        <div className="sopa-word-exam">
                          <div className="sopa-word-exam-clue">
                            {p.found ? '✓' : `${i + 1}.`} {p.clue || '(sin pista)'}
                          </div>
                          <div className="sopa-word-exam-meta">
                            {p.found ? (
                              <span className="sopa-word-solution" style={{ color }}>
                                {p.original || p.word}
                              </span>
                            ) : (
                              <span className="sopa-word-len">{p.word.length} letras</span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="sopa-word-normal">
                          {p.found && <CheckCircle2 size={14} style={{ color }} />}
                          <span className={p.found ? 'struck' : ''}>
                            {p.original || p.word}
                          </span>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        {/* Acciones */}
        {puzzle && !completed && (
          <div className="sopa-actions">
            {!isExam && (
              <button className="sopa-btn hint" onClick={giveHint}>
                <Lightbulb size={16} /> Pista
              </button>
            )}
            <button className="sopa-btn ghost" onClick={regenerate}>
              <RefreshCw size={16} /> Nueva sopa
            </button>
          </div>
        )}

        {/* Pantalla de victoria */}
        <AnimatePresence>
          {completed && (
            <motion.div
              className="sopa-completed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="sopa-completed-icon">
                <Award size={48} />
              </div>
              <h2 className="sopa-completed-title">¡Sopa completada! 🎉</h2>

              {isExam ? (
                <>
                  <div className="sopa-nota excellent">
                    <div className="sopa-nota-big">
                      10.0<span className="sopa-nota-small">/10</span>
                    </div>
                    <div className="sopa-nota-msg">¡Excelente! 🌟</div>
                  </div>
                  <div className="sopa-completed-record">
                    <Trophy size={14} />
                    <span className="sopa-completed-record-value">
                      {finalScore.toLocaleString('es-ES')}
                    </span>
                    <span className="sopa-completed-record-label">puntos · ¡supera tu récord!</span>
                  </div>
                </>
              ) : (
                <div className="sopa-completed-score">
                  <Trophy size={14} /> {finalScore.toLocaleString('es-ES')} puntos
                </div>
              )}

              <div className="sopa-completed-stats">
                <div className="sopa-completed-stat">
                  <Timer size={16} /> {formatTime(timer)}
                </div>
                <div className="sopa-completed-stat">
                  <Puzzle size={16} /> {puzzle.placed.length} palabras
                </div>
                {isExam && (
                  <div className="sopa-completed-stat exam">
                    <Trophy size={16} /> ¡Sin ayudas!
                  </div>
                )}
              </div>
              <button className="sopa-btn primary" onClick={regenerate}>
                <RefreshCw size={16} /> Otra sopa
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

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
          <li>Si la palabra es válida, se queda marcada con su propio color.</li>
          <li>Si no, la selección se limpia con un flash rojo.</li>
          <li>Las palabras encontradas se tachan en el panel de la derecha.</li>
          <li>Funciona igual con <strong>touch</strong> en móviles y tablets.</li>
        </ul>

        <h3>💡 Ayudas (solo en Práctica)</h3>
        <ul>
          <li><strong>💡 Pista</strong>: ilumina brevemente la primera letra de una palabra al azar.</li>
          <li>En práctica, la <strong>lista de palabras</strong> está siempre visible.</li>
        </ul>

        <h3>🎓 Modos y tamaños</h3>
        <div className="instr-modes">
          <div className="instr-mode easy">
            <strong>🟢 Pequeño</strong>
            10×10, 8 palabras. Solo horizontal y vertical.
          </div>
          <div className="instr-mode medium">
            <strong>🟡 Mediano</strong>
            13×13, 12 palabras. Añade diagonales.
          </div>
          <div className="instr-mode exam">
            <strong>🔴 Grande</strong>
            16×16, 18 palabras. Las 8 direcciones. Obligatorio en examen.
          </div>
        </div>

        <div className="instr-tips">
          <strong>💡 Consejo para examen:</strong> en modo examen no ves la lista de palabras.
          Ves las <em>definiciones</em> del vocabulario en la derecha — tienes que adivinar qué
          palabra es y después encontrarla en la sopa.
        </div>
      </InstructionsModal>
    </div>
  );
};

export default SopaDeLetras;
