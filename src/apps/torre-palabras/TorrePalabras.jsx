// src/apps/torre-palabras/TorrePalabras.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Layers, RefreshCw, Timer, Award, Trophy, Star, Heart, Flame,
  Gamepad2, GraduationCap, Check, X, Lightbulb, SkipForward, Zap,
} from 'lucide-react';
import { getRunnerData } from '../../services/gameDataService';
import materiasData from '../../../public/data/materias.json';
import InstructionsModal, { InstructionsButton } from '../_shared/InstructionsModal';
import './TorrePalabras.css';

const BLOCK_COLORS = [
  '#a855f7', '#ec4899', '#3b82f6', '#10b981', '#f59e0b',
  '#06b6d4', '#f97316', '#8b5cf6', '#14b8a6', '#ef4444',
];

const MODE_CONFIG = {
  easy: {
    label: 'Fácil', icon: '🟢', rounds: 8, categories: 2, lives: 3,
    showCategory: true, timer: null,
    helps: { skip: 2, hint: 3 },
  },
  medium: {
    label: 'Medio', icon: '🟡', rounds: 12, categories: 3, lives: 2,
    showCategory: false, timer: null,
    helps: { skip: 1, hint: 1 },
  },
  exam: {
    label: 'Examen', icon: '🔴', rounds: 18, categories: 4, lives: 1,
    showCategory: false, timer: 8,
    helps: { skip: 0, hint: 1 },
  },
};

const shuffle = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

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
  const [gameMode, setGameMode] = useState('easy');

  // Puzzle
  const [categories, setCategories] = useState([]); // [{name, color, words}]
  const [blocks, setBlocks] = useState([]); // [{id, word, categoryIdx, answered}]
  const [currentBlockIdx, setCurrentBlockIdx] = useState(0);
  const [status, setStatus] = useState('idle'); // idle|playing|correct|wrong|timeout|won|lost
  const [towerHeight, setTowerHeight] = useState(0);
  const [shaking, setShaking] = useState(false);

  // Stats
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [helpsRemaining, setHelpsRemaining] = useState({});
  const [hintVisible, setHintVisible] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

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
    setLives(cfg.lives);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setCorrectCount(0);
    setHelpsRemaining({ ...cfg.helps });
    setHintVisible(cfg.showCategory);
    trackedRef.current = false;
    if (cfg.timer) setTimeLeft(cfg.timer);
  }, [allCategories, gameMode]);

  useEffect(() => {
    if (!loading && Object.keys(allCategories).length >= 2) startGame();
  }, [loading, gameMode, startGame]);

  // --- Timer por bloque (examen) ---
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
          setStatus('timeout');
          setLives((l) => l - 1);
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
  const cfg = MODE_CONFIG[gameMode];

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
      setLives((l) => l - 1);
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
      if ((status === 'wrong' || status === 'timeout') && lives <= 0) { setStatus('lost'); return; }
      if (currentBlockIdx + 1 >= blocks.length) { setStatus('won'); return; }
      setCurrentBlockIdx((i) => i + 1);
      setHintVisible(cfg.showCategory);
      setStatus('playing');
    }, delay);
    return () => clearTimeout(t);
  }, [status, lives, currentBlockIdx, blocks.length, cfg.showCategory]);

  // --- XP ---
  useEffect(() => {
    if ((status !== 'won' && status !== 'lost') || trackedRef.current) return;
    trackedRef.current = true;
    if (status === 'won') confetti({ particleCount: 200, spread: 120, origin: { y: 0.5 }, colors: BLOCK_COLORS.slice(0, 6) });
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

  // --- Derivados ---
  const isExam = gameMode === 'exam';
  const isFinished = status === 'won' || status === 'lost';
  const nota = blocks.length > 0 ? Math.round((correctCount / blocks.length) * 100) / 10 : 0;
  const notaColor = nota >= 8 ? 'excellent' : nota >= 5 ? 'good' : 'fail';
  const notaMsg = nota >= 9 ? '¡Excelente! 🌟' : nota >= 7 ? '¡Muy bien! 👏' : nota >= 5 ? 'Aprobado 💪' : 'Necesitas repasar 📖';

  if (loading) return <div className="torre-root"><div className="torre-card"><div className="torre-loading">Cargando...</div></div></div>;

  if (Object.keys(allCategories).length < 2) {
    return <div className="torre-root"><div className="torre-card">
      <div className="torre-title"><span>🏗️</span> Torre de Palabras</div>
      <div className="torre-empty"><p>No hay suficientes categorías para esta asignatura (mínimo 2).</p></div>
    </div></div>;
  }

  return (
    <div className="torre-root">
      <motion.div className="torre-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="torre-header">
          <div className="torre-title">
            <span className="torre-emoji">🏗️</span>
            <span>Torre de Palabras</span>
            <InstructionsButton onClick={() => setShowHelp(true)} />
          </div>
          <div className="torre-stats">
            {cfg.timer && !isFinished && status === 'playing' && (
              <div className={`torre-stat timer ${timeLeft <= 3 ? 'danger' : ''}`}>
                <Timer size={14} /> <span>{timeLeft}s</span>
              </div>
            )}
            <div className="torre-stat lives">
              {Array.from({ length: cfg.lives }).map((_, i) => (
                <Heart key={i} size={14} fill={i < lives ? '#ef4444' : 'none'} stroke={i < lives ? '#ef4444' : '#d1d5db'} />
              ))}
            </div>
            {streak >= 2 && (
              <motion.div className="torre-stat streak" key={streak} initial={{ scale: 0.5 }} animate={{ scale: 1 }}>
                <Flame size={14} /> <span>{streak}</span>
              </motion.div>
            )}
            <div className="torre-stat score"><Star size={14} /> <span>{score.toLocaleString('es-ES')}</span></div>
          </div>
        </div>

        <div className="torre-subtitle">{subjectInfo.icon} {subjectInfo.nombre || 'General'}</div>

        {/* Tabs */}
        <div className="torre-gamemode-tabs">
          {Object.entries(MODE_CONFIG).map(([key, c]) => (
            <button key={key} className={`torre-gamemode-tab ${gameMode === key ? 'active' : ''} ${key}`} onClick={() => setGameMode(key)}>
              <span>{c.icon}</span>
              <span className="torre-tab-label">{c.label}</span>
              <span className="torre-tab-sub">{c.rounds} bloques · {c.categories} cat.</span>
            </button>
          ))}
        </div>

        {/* Resultado */}
        <AnimatePresence>
          {isFinished && (
            <motion.div className={`torre-result ${status}`} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="torre-result-icon">{status === 'won' ? <Trophy size={48} /> : <Award size={48} />}</div>
              <h2 className="torre-result-title">{status === 'won' ? '¡Torre completada! 🎉' : '¡La torre se derrumbó!'}</h2>

              {isExam ? (
                <>
                  <div className={`torre-nota ${notaColor}`}>
                    <div className="torre-nota-big">{nota.toFixed(1)}<span className="torre-nota-small">/10</span></div>
                    <div className="torre-nota-msg">{notaMsg}</div>
                  </div>
                  <div className="torre-result-record"><Star size={14} /> <span>{score.toLocaleString('es-ES')}</span> <span className="torre-result-record-label">puntos · ¡supérate!</span></div>
                </>
              ) : (
                <>
                  <div className="torre-result-score">{score.toLocaleString('es-ES')}</div>
                  <div className="torre-result-score-label">puntos</div>
                </>
              )}

              <div className="torre-result-stats">
                <div className="torre-result-stat"><Layers size={14} /> {towerHeight} bloques apilados</div>
                <div className="torre-result-stat"><Check size={14} /> {correctCount}/{blocks.length}</div>
                <div className="torre-result-stat"><Flame size={14} /> Racha: {maxStreak}</div>
              </div>
              <button className="torre-btn primary" onClick={startGame}><RefreshCw size={16} /> Jugar otra vez</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Juego */}
        {!isFinished && currentBlock && (
          <>
            {/* Progreso */}
            <div className="torre-progress-row">
              <span className="torre-progress-label">Bloque {currentBlockIdx + 1}/{blocks.length}</span>
              <div className="torre-progress-bar"><div className="torre-progress-fill" style={{ width: `${(currentBlockIdx / blocks.length) * 100}%` }} /></div>
            </div>

            {/* Torre visual */}
            <div className={`torre-visual ${shaking ? 'shaking' : ''}`}>
              <div className="torre-stack">
                {Array.from({ length: towerHeight }).map((_, i) => (
                  <motion.div
                    key={`block-${i}`}
                    className="torre-block stacked"
                    style={{ background: BLOCK_COLORS[i % BLOCK_COLORS.length] }}
                    initial={{ opacity: 0, y: -30, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.05 }}
                  />
                ))}
              </div>
              <div className="torre-stack-label">
                <Layers size={14} /> {towerHeight}
              </div>
            </div>

            {/* Bloque actual */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentBlockIdx}
                className={`torre-current-block ${status === 'correct' ? 'correct' : ''} ${status === 'wrong' || status === 'timeout' ? 'wrong' : ''}`}
                style={{ borderColor: status === 'correct' ? '#10b981' : status === 'wrong' || status === 'timeout' ? '#ef4444' : '#a855f7' }}
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <span className="torre-current-word">{currentBlock.word}</span>
                {(status === 'wrong' || status === 'timeout') && (
                  <span className="torre-correct-cat">
                    → {categories[currentBlock.categoryIdx]?.name}
                  </span>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Botones de categoría */}
            <div className="torre-categories">
              {categories.map((cat, idx) => (
                <motion.button
                  key={cat.name}
                  className={`torre-cat-btn ${hintVisible && idx === currentBlock?.categoryIdx ? 'hint-glow' : ''}`}
                  style={{ '--cat-color': cat.color }}
                  onClick={() => answerCategory(idx)}
                  disabled={status !== 'playing'}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="torre-cat-dot" style={{ background: cat.color }} />
                  <span className="torre-cat-name">{cat.name}</span>
                </motion.button>
              ))}
            </div>

            {/* Ayudas */}
            <div className="torre-lifelines">
              {!hintVisible && !cfg.showCategory && (
                <button className="torre-lifeline" onClick={useHint} disabled={helpsRemaining.hint <= 0}>
                  <Lightbulb size={14} /> Pista
                  {helpsRemaining.hint > 0 && <span className="torre-lifeline-count">{helpsRemaining.hint}</span>}
                </button>
              )}
              <button className="torre-lifeline" onClick={skipBlock} disabled={helpsRemaining.skip <= 0 || status !== 'playing'}>
                <SkipForward size={14} /> Saltar
                {helpsRemaining.skip > 0 && <span className="torre-lifeline-count">{helpsRemaining.skip}</span>}
              </button>
              <button className="torre-lifeline ghost" onClick={startGame}><RefreshCw size={14} /> Nuevo</button>
            </div>
          </>
        )}
      </motion.div>

      <InstructionsModal isOpen={showHelp} onClose={() => setShowHelp(false)} title="Cómo jugar a Torre de Palabras">
        <h3>🎯 Objetivo</h3>
        <p>Cada bloque muestra una palabra. Debes <strong>clasificarla en su categoría correcta</strong> pulsando el botón correspondiente. Cada acierto apila un bloque en la torre; cada fallo la hace temblar.</p>

        <h3>🕹️ Cómo se juega</h3>
        <ul>
          <li>Aparece una palabra en el bloque central.</li>
          <li>Debajo verás los botones con los nombres de las categorías (ej: "Animales", "Plantas", "Minerales").</li>
          <li>Pulsa la categoría a la que pertenece la palabra.</li>
          <li>Si aciertas: el bloque se apila y la torre crece. Si fallas: la torre tiembla y pierdes una vida.</li>
        </ul>

        <h3>🏗️ La torre</h3>
        <p>La torre es tu progreso visual. Cada bloque correcto la hace más alta. ¡El objetivo es construir la torre más alta posible!</p>

        <h3>🎓 Modos</h3>
        <div className="instr-modes">
          <div className="instr-mode easy"><strong>🟢 Fácil</strong>8 bloques · 2 categorías · 3 vidas · categoría visible</div>
          <div className="instr-mode medium"><strong>🟡 Medio</strong>12 bloques · 3 categorías · 2 vidas</div>
          <div className="instr-mode exam"><strong>🔴 Examen</strong>18 bloques · 4 categorías · 1 vida · 8s/bloque · nota /10</div>
        </div>

        <div className="instr-tips"><strong>💡 Consejo:</strong> si dudas, usa la pista para ver qué categoría se resalta. En modo fácil, la categoría correcta siempre está visible.</div>
      </InstructionsModal>
    </div>
  );
};

export default TorrePalabras;
