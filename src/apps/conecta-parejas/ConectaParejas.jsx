// src/apps/conecta-parejas/ConectaParejas.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Link2, RefreshCw, Eye, CheckCircle2, Timer, Award, Trophy,
  Gamepad2, GraduationCap, Star, Heart, Check, X, Flame,
} from 'lucide-react';
import { getRoscoData } from '../../services/gameDataService';
import materiasData from '../../../public/data/materias.json';
import InstructionsModal, { InstructionsButton } from '../_shared/InstructionsModal';
import './ConectaParejas.css';

const PAIR_COLORS = [
  '#a855f7', '#ec4899', '#10b981', '#3b82f6', '#f59e0b',
  '#06b6d4', '#f97316', '#8b5cf6', '#14b8a6', '#ef4444',
  '#6366f1', '#84cc16',
];

const MODE_CONFIG = {
  easy:   { label: 'Fácil',   icon: '🟢', pairs: 5,  lives: Infinity, helps: { reveal: 2, check: 3 }, timer: null },
  medium: { label: 'Medio',   icon: '🟡', pairs: 8,  lives: 3,        helps: { reveal: 1, check: 1 }, timer: null },
  exam:   { label: 'Examen',  icon: '🔴', pairs: 12, lives: 2,        helps: { reveal: 1, check: 0 }, timer: 180 },
};

const shuffle = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

const getSubjectInfo = (level, grade, subjectId) => {
  if (!level || !grade || !subjectId) return { nombre: '', icon: '📚' };
  const curso = materiasData?.[level]?.[String(grade)];
  if (!Array.isArray(curso)) return { nombre: '', icon: '📚' };
  return curso.find((m) => m.id === subjectId) || { nombre: '', icon: '📚' };
};

const ConectaParejas = ({ onGameComplete }) => {
  const { level, grade: gradeParam, subjectId } = useParams();
  const grade = useMemo(() => parseInt(gradeParam, 10), [gradeParam]);
  const asignatura = subjectId || (level === 'primaria' ? 'lengua' : 'general');
  const subjectInfo = useMemo(() => getSubjectInfo(level, grade, asignatura), [level, grade, asignatura]);

  const [allWords, setAllWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gameMode, setGameMode] = useState('easy');

  // Puzzle
  const [leftItems, setLeftItems] = useState([]);   // [{id, text, pairId}]
  const [rightItems, setRightItems] = useState([]);  // [{id, text, pairId}]
  const [selected, setSelected] = useState(null);    // {side:'left'|'right', id, pairId}
  const [matched, setMatched] = useState({});        // pairId → colorIndex
  const [wrongFlash, setWrongFlash] = useState(null); // {leftId, rightId}
  const [completed, setCompleted] = useState(false);

  // Stats
  const [lives, setLives] = useState(Infinity);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [timer, setTimer] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [helpsRemaining, setHelpsRemaining] = useState({});
  const [showHelp, setShowHelp] = useState(false);

  const timerRef = useRef(null);
  const trackedRef = useRef(false);
  const containerRef = useRef(null);
  const leftRefs = useRef({});
  const rightRefs = useRef({});
  const [lines, setLines] = useState([]);

  // --- Cargar datos ---
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const load = async () => {
      try {
        const data = await getRoscoData(level, grade, asignatura);
        if (cancelled) return;
        setAllWords(
          Array.isArray(data)
            ? data.filter((it) => it?.solucion && it?.definicion && !/\s/.test(String(it.solucion).trim()))
            : []
        );
      } catch (err) {
        console.error('ConectaParejas: error cargando datos', err);
        setAllWords([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [level, grade, asignatura]);

  // --- Generar puzzle ---
  const generatePuzzle = useCallback(() => {
    const cfg = MODE_CONFIG[gameMode];
    if (allWords.length < cfg.pairs) return;

    const picked = shuffle(allWords).slice(0, cfg.pairs);
    const left = shuffle(picked.map((w, i) => ({
      id: `l-${i}`,
      text: String(w.solucion).trim(),
      pairId: i,
    })));
    const right = shuffle(picked.map((w, i) => ({
      id: `r-${i}`,
      text: String(w.definicion).trim(),
      pairId: i,
    })));

    setLeftItems(left);
    setRightItems(right);
    setSelected(null);
    setMatched({});
    setWrongFlash(null);
    setCompleted(false);
    setLives(cfg.lives);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setCorrectCount(0);
    setWrongCount(0);
    setTimer(0);
    setHelpsRemaining({ ...cfg.helps });
    setLines([]);
    trackedRef.current = false;
    if (cfg.timer) setTimeLeft(cfg.timer);
  }, [allWords, gameMode]);

  useEffect(() => {
    if (!loading && allWords.length >= 5) generatePuzzle();
  }, [loading, gameMode, generatePuzzle, allWords.length]);

  // --- Timer ---
  useEffect(() => {
    const cfg = MODE_CONFIG[gameMode];
    if (!leftItems.length || completed) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setTimer((t) => t + 1);
      if (cfg.timer) {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            setCompleted(true);
            return 0;
          }
          return t - 1;
        });
      }
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [leftItems.length, completed, gameMode]);

  // --- Calcular líneas SVG entre items emparejados ---
  const recalcLines = useCallback(() => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const newLines = [];

    Object.entries(matched).forEach(([pairIdStr, colorIdx]) => {
      const pairId = Number(pairIdStr);
      const leftItem = leftItems.find((it) => it.pairId === pairId);
      const rightItem = rightItems.find((it) => it.pairId === pairId);
      if (!leftItem || !rightItem) return;

      const leftEl = leftRefs.current[leftItem.id];
      const rightEl = rightRefs.current[rightItem.id];
      if (!leftEl || !rightEl) return;

      const lr = leftEl.getBoundingClientRect();
      const rr = rightEl.getBoundingClientRect();

      newLines.push({
        x1: lr.right - containerRect.left,
        y1: lr.top + lr.height / 2 - containerRect.top,
        x2: rr.left - containerRect.left,
        y2: rr.top + rr.height / 2 - containerRect.top,
        color: PAIR_COLORS[colorIdx % PAIR_COLORS.length],
      });
    });
    setLines(newLines);
  }, [matched, leftItems, rightItems]);

  useEffect(() => { recalcLines(); }, [recalcLines]);
  useEffect(() => {
    window.addEventListener('resize', recalcLines);
    return () => window.removeEventListener('resize', recalcLines);
  }, [recalcLines]);

  // --- Click en un item ---
  const handleClick = useCallback((side, item) => {
    if (completed || matched[item.pairId] !== undefined) return;

    if (!selected) {
      setSelected({ side, ...item });
      return;
    }

    // Click en el mismo lado → cambiar selección
    if (selected.side === side) {
      setSelected(selected.id === item.id ? null : { side, ...item });
      return;
    }

    // Click en lado opuesto → verificar par
    const leftPairId = side === 'left' ? item.pairId : selected.pairId;
    const rightPairId = side === 'right' ? item.pairId : selected.pairId;

    if (leftPairId === rightPairId) {
      // ¡Correcto!
      const colorIdx = Object.keys(matched).length;
      setMatched((prev) => ({ ...prev, [leftPairId]: colorIdx }));
      setCorrectCount((c) => c + 1);
      setStreak((s) => {
        const next = s + 1;
        setMaxStreak((m) => Math.max(m, next));
        return next;
      });
      const streakMultiplier = 1 + streak * 0.1;
      const refTime = MODE_CONFIG[gameMode].timer || 120;
      const timeBonus = Math.max(0, Math.round(20 * (1 - timer / refTime)));
      const gained = Math.round(100 * streakMultiplier + timeBonus);
      setScore((s) => s + gained);
      setSelected(null);
    } else {
      // ¡Incorrecto!
      const leftId = side === 'left' ? item.id : selected.id;
      const rightId = side === 'right' ? item.id : selected.id;
      setWrongFlash({ leftId, rightId });
      setWrongCount((w) => w + 1);
      setStreak(0);
      setLives((l) => l - 1);
      setSelected(null);
      setTimeout(() => setWrongFlash(null), 600);
    }
  }, [selected, matched, completed, streak, timer, timeLeft, gameMode]);

  // --- Victoria / derrota ---
  const totalPairs = leftItems.length;
  useEffect(() => {
    if (totalPairs > 0 && correctCount >= totalPairs && !completed) {
      setCompleted(true);
      confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 },
        colors: ['#a855f7', '#ec4899', '#fbbf24', '#10b981', '#3b82f6'] });
    }
  }, [correctCount, totalPairs, completed]);

  useEffect(() => {
    if (lives <= 0 && !completed) setCompleted(true);
  }, [lives, completed]);

  // --- XP tracking ---
  useEffect(() => {
    if (!completed || trackedRef.current) return;
    trackedRef.current = true;
    const isExamMode = gameMode === 'exam';
    onGameComplete?.({
      mode: isExamMode ? 'test' : 'practice',
      score: isExamMode ? score : 0,
      maxScore: isExamMode ? totalPairs * 170 : 0,
      correctAnswers: correctCount,
      totalQuestions: totalPairs,
      durationSeconds: timer,
    });
  }, [completed, score, correctCount, totalPairs, timer, gameMode, onGameComplete]);

  // --- Ayudas ---
  const revealPair = useCallback(() => {
    if (helpsRemaining.reveal <= 0) return;
    const pending = leftItems.filter((it) => matched[it.pairId] === undefined);
    if (pending.length === 0) return;
    const pick = pending[Math.floor(Math.random() * pending.length)];
    const colorIdx = Object.keys(matched).length;
    setMatched((prev) => ({ ...prev, [pick.pairId]: colorIdx }));
    setCorrectCount((c) => c + 1);
    setHelpsRemaining((h) => ({ ...h, reveal: h.reveal - 1 }));
    setSelected(null);
  }, [helpsRemaining, leftItems, matched]);

  const checkAnswers = useCallback(() => {
    if (helpsRemaining.check <= 0) return;
    // No hay "wrong connections" en este juego — las conexiones son inmediatas
    // En su lugar, iluminamos brevemente un par no resuelto
    revealPair();
    setHelpsRemaining((h) => ({ ...h, check: h.check - 1 }));
  }, [helpsRemaining, revealPair]);

  // --- Derivados ---
  const cfg = MODE_CONFIG[gameMode];
  const isExam = gameMode === 'exam';
  const isWon = completed && correctCount >= totalPairs;
  const isLost = completed && !isWon;
  const nota = totalPairs > 0 ? Math.round((correctCount / totalPairs) * 100) / 10 : 0;
  const notaColor = nota >= 8 ? 'excellent' : nota >= 5 ? 'good' : 'fail';
  const notaMsg = nota >= 9 ? '¡Excelente! 🌟' : nota >= 7 ? '¡Muy bien! 👏' : nota >= 5 ? 'Aprobado 💪' : 'Necesitas repasar 📖';
  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  // --- Render ---
  if (loading) {
    return <div className="cparejas-root"><div className="cparejas-card"><div className="cparejas-loading">Cargando...</div></div></div>;
  }

  if (allWords.length < 5) {
    return (
      <div className="cparejas-root"><div className="cparejas-card">
        <div className="cparejas-title"><span>🧲</span> Conecta Parejas</div>
        <div className="cparejas-empty"><p>No hay suficientes palabras para esta asignatura.</p></div>
      </div></div>
    );
  }

  return (
    <div className="cparejas-root">
      <motion.div className="cparejas-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="cparejas-header">
          <div className="cparejas-title">
            <span className="cparejas-emoji">🧲</span>
            <span>Conecta Parejas</span>
            <InstructionsButton onClick={() => setShowHelp(true)} />
          </div>
          <div className="cparejas-stats">
            {cfg.timer && !completed && (
              <div className={`cparejas-stat timer ${timeLeft <= 30 ? 'danger' : ''}`}>
                <Timer size={14} /> <span>{formatTime(timeLeft)}</span>
              </div>
            )}
            {cfg.lives !== Infinity && (
              <div className="cparejas-stat lives">
                {Array.from({ length: Math.min(cfg.lives, 5) }).map((_, i) => (
                  <Heart key={i} size={14} fill={i < lives ? '#ef4444' : 'none'} stroke={i < lives ? '#ef4444' : '#d1d5db'} />
                ))}
              </div>
            )}
            <div className="cparejas-stat matched">
              <Link2 size={14} /> <span>{correctCount}/{totalPairs}</span>
            </div>
            <div className="cparejas-stat score">
              <Star size={14} /> <span>{score.toLocaleString('es-ES')}</span>
            </div>
          </div>
        </div>

        <div className="cparejas-subtitle">{subjectInfo.icon} {subjectInfo.nombre || 'General'}</div>

        {/* Tabs */}
        <div className="cparejas-gamemode-tabs">
          {Object.entries(MODE_CONFIG).map(([key, c]) => (
            <button key={key} className={`cparejas-gamemode-tab ${gameMode === key ? 'active' : ''} ${key}`} onClick={() => setGameMode(key)}>
              <span>{c.icon}</span>
              <span className="cparejas-tab-label">{c.label}</span>
              <span className="cparejas-tab-sub">{c.pairs} pares</span>
            </button>
          ))}
        </div>

        {/* Resultado */}
        <AnimatePresence>
          {completed && (
            <motion.div className={`cparejas-result ${isWon ? 'won' : 'lost'}`} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="cparejas-result-icon">{isWon ? <Trophy size={48} /> : <Award size={48} />}</div>
              <h2 className="cparejas-result-title">{isWon ? '¡Todas conectadas! 🎉' : '¡Se acabó!'}</h2>

              {isExam ? (
                <>
                  <div className={`cparejas-nota ${notaColor}`}>
                    <div className="cparejas-nota-big">{nota.toFixed(1)}<span className="cparejas-nota-small">/10</span></div>
                    <div className="cparejas-nota-msg">{notaMsg}</div>
                  </div>
                  <div className="cparejas-result-record">
                    <Star size={14} /> <span>{score.toLocaleString('es-ES')}</span>
                    <span className="cparejas-result-record-label">puntos · ¡supérate!</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="cparejas-result-score">{score.toLocaleString('es-ES')}</div>
                  <div className="cparejas-result-score-label">puntos</div>
                </>
              )}

              <div className="cparejas-result-stats">
                <div className="cparejas-result-stat"><Check size={14} /> {correctCount}/{totalPairs} pares</div>
                <div className="cparejas-result-stat"><X size={14} /> {wrongCount} fallos</div>
                <div className="cparejas-result-stat"><Timer size={14} /> {formatTime(timer)}</div>
                {maxStreak > 1 && <div className="cparejas-result-stat"><Flame size={14} /> Racha: {maxStreak}</div>}
              </div>
              <button className="cparejas-btn primary" onClick={generatePuzzle}><RefreshCw size={16} /> Jugar otra vez</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Juego */}
        {!completed && leftItems.length > 0 && (
          <>
            {/* Columnas con SVG overlay */}
            <div className="cparejas-board" ref={containerRef}>
              {/* SVG lines */}
              <svg className="cparejas-svg" aria-hidden>
                {lines.map((line, i) => {
                  const mx = (line.x1 + line.x2) / 2;
                  return (
                    <path
                      key={i}
                      d={`M ${line.x1} ${line.y1} C ${mx} ${line.y1}, ${mx} ${line.y2}, ${line.x2} ${line.y2}`}
                      stroke={line.color}
                      strokeWidth="3"
                      fill="none"
                      strokeLinecap="round"
                      opacity="0.7"
                    />
                  );
                })}
              </svg>

              {/* Columna izquierda (palabras) */}
              <div className="cparejas-col left">
                <div className="cparejas-col-title">Palabra</div>
                {leftItems.map((item) => {
                  const isMatched = matched[item.pairId] !== undefined;
                  const isSelected = selected?.id === item.id;
                  const isWrongItem = wrongFlash?.leftId === item.id;
                  const color = isMatched ? PAIR_COLORS[matched[item.pairId] % PAIR_COLORS.length] : null;
                  return (
                    <motion.button
                      key={item.id}
                      ref={(el) => { leftRefs.current[item.id] = el; }}
                      className={`cparejas-item ${isMatched ? 'matched' : ''} ${isSelected ? 'selected' : ''} ${isWrongItem ? 'wrong' : ''}`}
                      style={isMatched ? { borderColor: color, background: `${color}18` } : undefined}
                      onClick={() => handleClick('left', item)}
                      disabled={isMatched}
                      whileTap={{ scale: 0.97 }}
                      layout
                    >
                      {isMatched && <span className="cparejas-item-dot" style={{ background: color }} />}
                      <span className="cparejas-item-text">{item.text}</span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Columna derecha (definiciones) */}
              <div className="cparejas-col right">
                <div className="cparejas-col-title">Definición</div>
                {rightItems.map((item) => {
                  const isMatched = matched[item.pairId] !== undefined;
                  const isSelected = selected?.id === item.id;
                  const isWrongItem = wrongFlash?.rightId === item.id;
                  const color = isMatched ? PAIR_COLORS[matched[item.pairId] % PAIR_COLORS.length] : null;
                  return (
                    <motion.button
                      key={item.id}
                      ref={(el) => { rightRefs.current[item.id] = el; }}
                      className={`cparejas-item def ${isMatched ? 'matched' : ''} ${isSelected ? 'selected' : ''} ${isWrongItem ? 'wrong' : ''}`}
                      style={isMatched ? { borderColor: color, background: `${color}18` } : undefined}
                      onClick={() => handleClick('right', item)}
                      disabled={isMatched}
                      whileTap={{ scale: 0.97 }}
                      layout
                    >
                      {isMatched && <span className="cparejas-item-dot" style={{ background: color }} />}
                      <span className="cparejas-item-text">{item.text}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Ayudas */}
            <div className="cparejas-lifelines">
              <button className="cparejas-lifeline" onClick={revealPair} disabled={helpsRemaining.reveal <= 0}>
                <Eye size={14} /> Revelar par
                {helpsRemaining.reveal > 0 && <span className="cparejas-lifeline-count">{helpsRemaining.reveal}</span>}
              </button>
              {helpsRemaining.check > 0 && (
                <button className="cparejas-lifeline" onClick={checkAnswers} disabled={helpsRemaining.check <= 0}>
                  <CheckCircle2 size={14} /> Pista extra
                  <span className="cparejas-lifeline-count">{helpsRemaining.check}</span>
                </button>
              )}
              <button className="cparejas-lifeline ghost" onClick={generatePuzzle}>
                <RefreshCw size={14} /> Nuevo
              </button>
            </div>
          </>
        )}
      </motion.div>

      <InstructionsModal isOpen={showHelp} onClose={() => setShowHelp(false)} title="Cómo jugar a Conecta Parejas">
        <h3>🎯 Objetivo</h3>
        <p>Une cada <strong>palabra</strong> de la columna izquierda con su <strong>definición</strong> correcta de la columna derecha.</p>

        <h3>🕹️ Cómo se juega</h3>
        <ul>
          <li>Haz click en un elemento de cualquier columna para seleccionarlo.</li>
          <li>Luego click en el elemento de la otra columna que creas que es su pareja.</li>
          <li>Si aciertas: se unen con una <strong>línea de color</strong> y ambos se bloquean.</li>
          <li>Si fallas: flash rojo y pierdes una vida (si aplica).</li>
          <li>Puedes cambiar de selección haciendo click en otro elemento del mismo lado.</li>
        </ul>

        <h3>🎓 Modos</h3>
        <div className="instr-modes">
          <div className="instr-mode easy"><strong>🟢 Fácil</strong>5 pares · Sin límite de vidas · 2 reveals + 3 pistas</div>
          <div className="instr-mode medium"><strong>🟡 Medio</strong>8 pares · 3 vidas · 1 reveal + 1 pista</div>
          <div className="instr-mode exam"><strong>🔴 Examen</strong>12 pares · 2 vidas · 3 min · 1 reveal · Nota /10</div>
        </div>

        <div className="instr-tips"><strong>💡 Consejo:</strong> empieza por las parejas que tengas más claras. Cada acierto consecutivo aumenta tu multiplicador de puntos.</div>
      </InstructionsModal>
    </div>
  );
};

export default ConectaParejas;
