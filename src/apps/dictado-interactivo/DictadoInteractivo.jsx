// src/apps/dictado-interactivo/DictadoInteractivo.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  PenLine, RefreshCw, Eye, Timer, Award, Trophy, Star, Heart,
  Gamepad2, GraduationCap, Check, X, Flame, ArrowRight, Lightbulb,
} from 'lucide-react';
import { getRoscoData, getOrdenaFrasesData } from '../../services/gameDataService';
import materiasData from '../../../public/data/materias.json';
import InstructionsModal, { InstructionsButton } from '../_shared/InstructionsModal';
import './DictadoInteractivo.css';

const normalize = (s) =>
  String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().trim();

const MODE_CONFIG = {
  easy: {
    label: 'Fácil', icon: '🟢', questions: 8, lives: 3, source: 'word',
    showHint: true, showLength: true, showFirstLetter: true, timer: null,
    helps: { reveal: 3 },
  },
  medium: {
    label: 'Medio', icon: '🟡', questions: 12, lives: 2, source: 'word',
    showHint: false, showLength: true, showFirstLetter: false, timer: null,
    helps: { reveal: 1 },
  },
  exam: {
    label: 'Examen', icon: '🔴', questions: 15, lives: 1, source: 'mixed',
    showHint: false, showLength: true, showFirstLetter: false, timer: 20,
    helps: { reveal: 1 },
  },
};

const shuffle = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

const getSubjectInfo = (level, grade, subjectId) => {
  if (!level || !grade || !subjectId) return { nombre: '', icon: '📚' };
  const curso = materiasData?.[level]?.[String(grade)];
  if (!Array.isArray(curso)) return { nombre: '', icon: '📚' };
  return curso.find((m) => m.id === subjectId) || { nombre: '', icon: '📚' };
};

/** Compara letra a letra y devuelve array de {char, expected, correct, extra, missing} */
const diffWord = (input, expected) => {
  const a = Array.from(input);
  const b = Array.from(expected);
  const result = [];
  const maxLen = Math.max(a.length, b.length);
  for (let i = 0; i < maxLen; i++) {
    const got = a[i] || '';
    const exp = b[i] || '';
    if (i >= b.length) {
      result.push({ char: got, expected: '', correct: false, extra: true });
    } else if (i >= a.length) {
      result.push({ char: '', expected: exp, correct: false, missing: true });
    } else if (normalize(got) === normalize(exp)) {
      result.push({ char: got, expected: exp, correct: true });
    } else {
      result.push({ char: got, expected: exp, correct: false });
    }
  }
  return result;
};

const DictadoInteractivo = ({ onGameComplete }) => {
  const { level, grade: gradeParam, subjectId } = useParams();
  const grade = useMemo(() => parseInt(gradeParam, 10), [gradeParam]);
  const asignatura = subjectId || (level === 'primaria' ? 'lengua' : 'general');
  const subjectInfo = useMemo(() => getSubjectInfo(level, grade, asignatura), [level, grade, asignatura]);

  const [palabras, setPalabras] = useState([]);
  const [frases, setFrases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gameMode, setGameMode] = useState('easy');

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [status, setStatus] = useState('idle'); // idle|playing|correct|wrong|won|lost
  const [diff, setDiff] = useState(null);

  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [hintVisible, setHintVisible] = useState(false);
  const [helpsRemaining, setHelpsRemaining] = useState({});
  const [showHelp, setShowHelp] = useState(false);

  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);
  const inputRef = useRef(null);
  const trackedRef = useRef(false);

  // --- Cargar datos ---
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const load = async () => {
      try {
        const [rosco, frasesData] = await Promise.all([
          getRoscoData(level, grade, asignatura).catch(() => []),
          getOrdenaFrasesData(level, grade, asignatura).catch(() => []),
        ]);
        if (cancelled) return;
        const words = Array.isArray(rosco)
          ? rosco.filter((it) => it?.solucion && it?.definicion && !/\s/.test(String(it.solucion).trim()))
              .map((it) => ({ text: String(it.solucion).trim(), hint: String(it.definicion).trim(), type: 'word' }))
          : [];
        const phrases = Array.isArray(frasesData)
          ? frasesData.filter((f) => typeof f === 'string' && f.trim().length > 8)
              .map((f) => ({ text: f.trim(), hint: '', type: 'phrase' }))
          : [];
        setPalabras(words);
        setFrases(phrases);
      } catch (err) {
        console.error('Dictado: error cargando datos', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [level, grade, asignatura]);

  // --- Generar ronda ---
  const startGame = useCallback(() => {
    const cfg = MODE_CONFIG[gameMode];
    let pool;
    if (cfg.source === 'word') {
      pool = palabras.length > 0 ? palabras : frases;
    } else {
      // mixed: combinar ambos
      pool = [...palabras, ...(frases.length > 0 ? frases.slice(0, Math.floor(cfg.questions / 3)) : [])];
      if (pool.length === 0) pool = palabras;
    }
    if (pool.length === 0) return;

    const qs = shuffle(pool).slice(0, cfg.questions);
    setQuestions(qs);
    setCurrentIndex(0);
    setAnswer('');
    setDiff(null);
    setStatus('playing');
    setLives(cfg.lives);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setCorrectCount(0);
    setHintVisible(cfg.showHint);
    setHelpsRemaining({ ...cfg.helps });
    trackedRef.current = false;
    if (cfg.timer) setTimeLeft(cfg.timer);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [palabras, frases, gameMode]);

  useEffect(() => {
    if (!loading && (palabras.length > 0 || frases.length > 0)) startGame();
  }, [loading, gameMode, startGame]);

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
          // Timeout → tratar como fallo
          const currentQ = questions[currentIndex];
          if (currentQ) setDiff(diffWord('', currentQ.text));
          setStatus('wrong');
          setLives((l) => l - 1);
          setStreak(0);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [currentIndex, status, gameMode, questions]);

  const currentQ = questions[currentIndex];
  const cfg = MODE_CONFIG[gameMode];

  // --- Enviar respuesta ---
  const submitAnswer = useCallback(() => {
    if (status !== 'playing' || !currentQ) return;
    if (timerRef.current) clearInterval(timerRef.current);

    const trimmed = answer.trim();
    const isCorrect = normalize(trimmed) === normalize(currentQ.text);
    const d = diffWord(trimmed, currentQ.text);
    setDiff(d);

    if (isCorrect) {
      // Bonus por ortografía perfecta (con tildes)
      const perfectOrtho = trimmed === currentQ.text;
      const basePoints = 100 + currentQ.text.length * 10;
      const mult = 1 + streak * 0.15;
      const orthoBonus = perfectOrtho ? 50 : 0;
      const timeBonus = cfg.timer ? Math.max(0, timeLeft * 8) : 0;
      const gained = Math.round(basePoints * mult + orthoBonus + timeBonus);
      setScore((s) => s + gained);
      setStreak((s) => { const next = s + 1; setMaxStreak((m) => Math.max(m, next)); return next; });
      setCorrectCount((c) => c + 1);
      setStatus('correct');
    } else {
      setStatus('wrong');
      setLives((l) => l - 1);
      setStreak(0);
    }
  }, [status, currentQ, answer, streak, cfg.timer, timeLeft]);

  // --- Avanzar ---
  useEffect(() => {
    if (status !== 'correct' && status !== 'wrong') return;
    const delay = status === 'correct' ? 1200 : 2500;
    const t = setTimeout(() => {
      if (status === 'wrong' && lives <= 0) { setStatus('lost'); return; }
      if (currentIndex + 1 >= questions.length) { setStatus('won'); return; }
      setCurrentIndex((i) => i + 1);
      setAnswer('');
      setDiff(null);
      setHintVisible(cfg.showHint);
      setStatus('playing');
      setTimeout(() => inputRef.current?.focus(), 50);
    }, delay);
    return () => clearTimeout(t);
  }, [status, lives, currentIndex, questions.length, cfg.showHint]);

  // --- XP ---
  useEffect(() => {
    if ((status !== 'won' && status !== 'lost') || trackedRef.current) return;
    trackedRef.current = true;
    if (status === 'won') confetti({ particleCount: 200, spread: 120, origin: { y: 0.5 }, colors: ['#a855f7', '#ec4899', '#fbbf24', '#10b981'] });
    onGameComplete?.({
      mode: gameMode === 'exam' ? 'test' : 'practice',
      score,
      maxScore: questions.length * 300,
      correctAnswers: correctCount,
      totalQuestions: questions.length || 1,
      durationSeconds: 0,
    });
  }, [status, score, correctCount, questions.length, gameMode, onGameComplete]);

  // --- Ayudas ---
  const revealHint = useCallback(() => {
    if (helpsRemaining.reveal <= 0) return;
    setHintVisible(true);
    setHelpsRemaining((h) => ({ ...h, reveal: h.reveal - 1 }));
  }, [helpsRemaining]);

  const handleKeyDown = (e) => { if (e.key === 'Enter') { e.preventDefault(); submitAnswer(); } };

  // --- Derivados ---
  const isExam = gameMode === 'exam';
  const isFinished = status === 'won' || status === 'lost';
  const nota = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) / 10 : 0;
  const notaColor = nota >= 8 ? 'excellent' : nota >= 5 ? 'good' : 'fail';
  const notaMsg = nota >= 9 ? '¡Excelente! 🌟' : nota >= 7 ? '¡Muy bien! 👏' : nota >= 5 ? 'Aprobado 💪' : 'Necesitas repasar 📖';

  if (loading) return <div className="dictado-root"><div className="dictado-card"><div className="dictado-loading">Cargando...</div></div></div>;
  if (palabras.length === 0 && frases.length === 0) {
    return <div className="dictado-root"><div className="dictado-card"><div className="dictado-title"><span>✍️</span> Dictado</div><div className="dictado-empty"><p>No hay datos para esta asignatura.</p></div></div></div>;
  }

  return (
    <div className="dictado-root">
      <motion.div className="dictado-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="dictado-header">
          <div className="dictado-title">
            <span className="dictado-emoji">✍️</span>
            <span>Dictado</span>
            <InstructionsButton onClick={() => setShowHelp(true)} />
          </div>
          <div className="dictado-stats">
            {cfg.timer && !isFinished && status === 'playing' && (
              <div className={`dictado-stat timer ${timeLeft <= 5 ? 'danger' : ''}`}>
                <Timer size={14} /> <span>{timeLeft}s</span>
              </div>
            )}
            <div className="dictado-stat lives">
              {Array.from({ length: cfg.lives }).map((_, i) => (
                <Heart key={i} size={14} fill={i < lives ? '#ef4444' : 'none'} stroke={i < lives ? '#ef4444' : '#d1d5db'} />
              ))}
            </div>
            {streak >= 2 && (
              <motion.div className="dictado-stat streak" key={streak} initial={{ scale: 0.5 }} animate={{ scale: 1 }}>
                <Flame size={14} /> <span>{streak}</span>
              </motion.div>
            )}
            <div className="dictado-stat score"><Star size={14} /> <span>{score.toLocaleString('es-ES')}</span></div>
          </div>
        </div>

        <div className="dictado-subtitle">{subjectInfo.icon} {subjectInfo.nombre || 'General'}</div>

        {/* Tabs */}
        <div className="dictado-gamemode-tabs">
          {Object.entries(MODE_CONFIG).map(([key, c]) => (
            <button key={key} className={`dictado-gamemode-tab ${gameMode === key ? 'active' : ''} ${key}`} onClick={() => setGameMode(key)}>
              <span>{c.icon}</span>
              <span className="dictado-tab-label">{c.label}</span>
              <span className="dictado-tab-sub">{c.questions} · {c.source === 'mixed' ? 'mixto' : 'palabras'}</span>
            </button>
          ))}
        </div>

        {/* Resultado */}
        <AnimatePresence>
          {isFinished && (
            <motion.div className={`dictado-result ${status}`} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="dictado-result-icon">{status === 'won' ? <Trophy size={48} /> : <Award size={48} />}</div>
              <h2 className="dictado-result-title">{status === 'won' ? '¡Dictado completado! 🎉' : '¡Se acabó!'}</h2>

              {isExam ? (
                <>
                  <div className={`dictado-nota ${notaColor}`}>
                    <div className="dictado-nota-big">{nota.toFixed(1)}<span className="dictado-nota-small">/10</span></div>
                    <div className="dictado-nota-msg">{notaMsg}</div>
                  </div>
                  <div className="dictado-result-record"><Star size={14} /> <span>{score.toLocaleString('es-ES')}</span> <span className="dictado-result-record-label">puntos · ¡supérate!</span></div>
                </>
              ) : (
                <>
                  <div className="dictado-result-score">{score.toLocaleString('es-ES')}</div>
                  <div className="dictado-result-score-label">puntos</div>
                </>
              )}

              <div className="dictado-result-stats">
                <div className="dictado-result-stat"><Check size={14} /> {correctCount}/{questions.length}</div>
                <div className="dictado-result-stat"><Flame size={14} /> Racha: {maxStreak}</div>
              </div>
              <button className="dictado-btn primary" onClick={startGame}><RefreshCw size={16} /> Jugar otra vez</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Juego */}
        {!isFinished && currentQ && (
          <>
            <div className="dictado-progress-row">
              <span className="dictado-progress-label">{currentIndex + 1}/{questions.length}</span>
              <div className="dictado-progress-bar"><div className="dictado-progress-fill" style={{ width: `${(currentIndex / questions.length) * 100}%` }} /></div>
              {currentQ.type === 'phrase' && <span className="dictado-type-tag">Frase</span>}
            </div>

            {/* Pista / definición */}
            <AnimatePresence mode="wait">
              <motion.div key={currentIndex} className="dictado-clue" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                {currentQ.hint && hintVisible && (
                  <div className="dictado-clue-hint"><Lightbulb size={16} /> {currentQ.hint}</div>
                )}
                <div className="dictado-clue-meta">
                  {cfg.showLength && <span className="dictado-clue-len">{currentQ.text.length} caracteres</span>}
                  {cfg.showFirstLetter && <span className="dictado-clue-first">Empieza por «{currentQ.text[0].toUpperCase()}»</span>}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Input */}
            <div className={`dictado-input-wrap ${status === 'correct' ? 'correct' : ''} ${status === 'wrong' ? 'wrong' : ''}`}>
              <input
                ref={inputRef}
                type="text"
                className="dictado-input"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe la respuesta con buena ortografía..."
                autoComplete="off"
                spellCheck="false"
                disabled={status !== 'playing'}
              />
              <button className="dictado-send-btn" onClick={submitAnswer} disabled={status !== 'playing' || !answer.trim()}>
                <ArrowRight size={18} />
              </button>
            </div>

            {/* Diff visual */}
            <AnimatePresence>
              {diff && (status === 'correct' || status === 'wrong') && (
                <motion.div className={`dictado-diff ${status}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div className="dictado-diff-title">{status === 'correct' ? '✅ ¡Correcto!' : '❌ Solución correcta:'}</div>
                  <div className="dictado-diff-chars">
                    {diff.map((d, i) => (
                      <span key={i} className={`dictado-diff-char ${d.correct ? 'ok' : d.missing ? 'missing' : d.extra ? 'extra' : 'wrong'}`}>
                        {d.correct ? d.char : d.missing ? d.expected : d.extra ? d.char : (
                          <><span className="dictado-diff-got">{d.char}</span><span className="dictado-diff-exp">{d.expected}</span></>
                        )}
                      </span>
                    ))}
                  </div>
                  {status === 'wrong' && (
                    <div className="dictado-diff-expected">
                      <strong>Respuesta correcta:</strong> {currentQ.text}
                    </div>
                  )}
                  {status === 'correct' && normalize(answer.trim()) === normalize(currentQ.text) && answer.trim() !== currentQ.text && (
                    <div className="dictado-diff-ortho">💡 Con tildes perfectas: <strong>{currentQ.text}</strong> (+50 pts extra)</div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Ayudas */}
            <div className="dictado-lifelines">
              {!hintVisible && currentQ.hint && (
                <button className="dictado-lifeline" onClick={revealHint} disabled={helpsRemaining.reveal <= 0}>
                  <Eye size={14} /> Ver pista
                  {helpsRemaining.reveal > 0 && <span className="dictado-lifeline-count">{helpsRemaining.reveal}</span>}
                </button>
              )}
              <button className="dictado-lifeline ghost" onClick={startGame}><RefreshCw size={14} /> Nuevo</button>
            </div>
          </>
        )}
      </motion.div>

      <InstructionsModal isOpen={showHelp} onClose={() => setShowHelp(false)} title="Cómo jugar al Dictado Interactivo">
        <h3>🎯 Objetivo</h3>
        <p>Lee la pista o definición y <strong>escribe la palabra o frase correcta</strong> con la mejor ortografía posible. Se evalúa carácter a carácter.</p>

        <h3>🕹️ Cómo se juega</h3>
        <ul>
          <li>Aparece una definición o contexto del vocabulario.</li>
          <li>Escribe tu respuesta y pulsa <kbd>Enter</kbd>.</li>
          <li>El sistema compara <strong>letra por letra</strong> y resalta aciertos/fallos.</li>
          <li>La comparación ignora tildes para decidir acierto/fallo, pero si escribes las tildes perfectas obtienes <strong>+50 pts extra</strong>.</li>
        </ul>

        <h3>📝 Feedback visual</h3>
        <ul>
          <li><strong>Verde</strong>: letra correcta en la posición correcta.</li>
          <li><strong>Rojo</strong>: letra incorrecta (se muestra la esperada debajo).</li>
          <li><strong>Gris tachado</strong>: letra sobrante que has puesto de más.</li>
          <li><strong>Hueco azul</strong>: letra que faltaba.</li>
        </ul>

        <h3>🎓 Modos</h3>
        <div className="instr-modes">
          <div className="instr-mode easy"><strong>🟢 Fácil</strong>8 palabras · 3 vidas · pista visible · 1ª letra · 3 reveals</div>
          <div className="instr-mode medium"><strong>🟡 Medio</strong>12 palabras · 2 vidas · pista oculta · 1 reveal</div>
          <div className="instr-mode exam"><strong>🔴 Examen</strong>15 mixtas · 1 vida · 20s/pregunta · 1 reveal · nota /10</div>
        </div>

        <div className="instr-tips"><strong>💡 Consejo:</strong> presta atención a las tildes. Aunque no son obligatorias para acertar, ¡dan puntos extra!</div>
      </InstructionsModal>
    </div>
  );
};

export default DictadoInteractivo;
