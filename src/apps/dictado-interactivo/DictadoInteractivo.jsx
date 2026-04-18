// src/apps/dictado-interactivo/DictadoInteractivo.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  RefreshCw, Timer, Trophy, Star, X,
  Check, Flame, ArrowRight, Lightbulb,
  Volume2, VolumeX,
} from 'lucide-react';
import { getRoscoData, getOrdenaFrasesData } from '../../services/gameDataService';
import materiasData from '../../../public/data/materias.json';
import InstructionsModal, { InstructionsButton } from '../_shared/InstructionsModal';
import './DictadoInteractivo.css';

const normalize = (s) =>
  String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().trim();

const MODE_CONFIG = {
  easy: {
    label: 'Fácil', icon: '🟢', questions: 8, source: 'word',
    // Repeticiones ilimitadas + pista/definicion visible
    defaultRate: 'slow', replays: Infinity, showHint: true, timer: null,
  },
  medium: {
    label: 'Medio', icon: '🟡', questions: 10, source: 'word',
    // 3 repeticiones por palabra
    defaultRate: 'normal', replays: 3, showHint: false, timer: null,
  },
  exam: {
    label: 'Examen', icon: '🔴', questions: 10, source: 'mixed',
    // 1 repeticion, temporizador. Siempre se completan todas: fallar no termina la partida.
    defaultRate: 'normal', replays: 1, showHint: false, timer: 20,
  },
};

// Velocidades de reproduccion que puede elegir el alumno
const PLAYBACK_SPEEDS = {
  slow: { label: 'Lento', icon: '🐢', rate: 0.75 },
  normal: { label: 'Normal', icon: '⚡', rate: 1.0 },
  fast: { label: 'Rápido', icon: '🚀', rate: 1.25 },
};

// --- TTS helper (Web Speech API) ---
const pickSpanishVoice = () => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => /es[-_]ES/i.test(v.lang)) ||
    voices.find((v) => /^es/i.test(v.lang)) ||
    null
  );
};

const speakText = (text, rate = 1.0) => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return false;
  try {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'es-ES';
    utter.rate = rate;
    utter.pitch = 1.0;
    const voice = pickSpanishVoice();
    if (voice) utter.voice = voice;
    window.speechSynthesis.speak(utter);
    return true;
  } catch {
    return false;
  }
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

  const [mistakes, setMistakes] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState('normal'); // 'slow' | 'normal' | 'fast'
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [replaysLeft, setReplaysLeft] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [ttsReady, setTtsReady] = useState(
    typeof window !== 'undefined' && !!window.speechSynthesis
  );

  // Precarga de voces (en algunos navegadores getVoices() es asincrono)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setTtsReady(false);
      return;
    }
    const onVoices = () => setTtsReady(true);
    if (window.speechSynthesis.getVoices().length > 0) setTtsReady(true);
    window.speechSynthesis.addEventListener?.('voiceschanged', onVoices);
    return () => {
      window.speechSynthesis.removeEventListener?.('voiceschanged', onVoices);
      window.speechSynthesis.cancel();
    };
  }, []);

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
    setMistakes(0);
    setPlaybackSpeed(cfg.defaultRate);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setCorrectCount(0);
    setReplaysLeft(cfg.replays === Infinity ? Infinity : cfg.replays);
    trackedRef.current = false;
    if (cfg.timer) setTimeLeft(cfg.timer);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [palabras, frases, gameMode]);

  useEffect(() => {
    if (!loading && (palabras.length > 0 || frases.length > 0)) startGame();
  }, [loading, gameMode, startGame]);

  // Reproducir el dictado automaticamente al presentar cada pregunta y reiniciar
  // el contador de repeticiones a la cantidad del modo.
  useEffect(() => {
    if (status !== 'playing' || !questions[currentIndex]) return;
    const cfg = MODE_CONFIG[gameMode];
    setReplaysLeft(cfg.replays === Infinity ? Infinity : cfg.replays);
    // Pequeno delay para evitar clipping al entrar en la pregunta
    const t = setTimeout(() => {
      speakText(questions[currentIndex].text, PLAYBACK_SPEEDS[playbackSpeed].rate);
    }, 200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, status === 'playing', gameMode]);

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
          // Timeout → tratar como fallo, pero la partida continua
          const currentQ = questions[currentIndex];
          if (currentQ) setDiff(diffWord('', currentQ.text));
          setStatus('wrong');
          setMistakes((m) => m + 1);
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
      const basePoints = 100;
      const streakMultiplier = 1 + streak * 0.1;
      const orthoBonus = perfectOrtho ? 20 : 0;
      const timeBonus = cfg.timer ? Math.max(0, Math.round(20 * (timeLeft / cfg.timer))) : 0;
      const gained = Math.round(basePoints * streakMultiplier + orthoBonus + timeBonus);
      setScore((s) => s + gained);
      setStreak((s) => { const next = s + 1; setMaxStreak((m) => Math.max(m, next)); return next; });
      setCorrectCount((c) => c + 1);
      setStatus('correct');
    } else {
      setStatus('wrong');
      setMistakes((m) => m + 1);
      setStreak(0);
    }
  }, [status, currentQ, answer, streak, cfg.timer, timeLeft]);

  // --- Avanzar ---
  useEffect(() => {
    if (status !== 'correct' && status !== 'wrong') return;
    const delay = status === 'correct' ? 1200 : 2500;
    const t = setTimeout(() => {
      // Fallar no termina la partida: siempre se completan todas las palabras
      if (currentIndex + 1 >= questions.length) { setStatus('won'); return; }
      setCurrentIndex((i) => i + 1);
      setAnswer('');
      setDiff(null);
      setStatus('playing');
      setTimeout(() => inputRef.current?.focus(), 50);
    }, delay);
    return () => clearTimeout(t);
  }, [status, currentIndex, questions.length]);

  // --- XP ---
  useEffect(() => {
    if (status !== 'won' || trackedRef.current) return;
    trackedRef.current = true;
    if (status === 'won') confetti({ particleCount: 200, spread: 120, origin: { y: 0.5 }, colors: ['#a855f7', '#ec4899', '#fbbf24', '#10b981'] });
    const isExamMode = gameMode === 'exam';
    onGameComplete?.({
      mode: isExamMode ? 'test' : 'practice',
      score: isExamMode ? score : 0,
      maxScore: isExamMode ? questions.length * 170 : 0,
      correctAnswers: correctCount,
      totalQuestions: questions.length || 1,
      durationSeconds: 0,
    });
  }, [status, score, correctCount, questions.length, gameMode, onGameComplete]);

  // --- Repetir dictado ---
  const repeatDictation = useCallback(() => {
    if (!currentQ || status !== 'playing') return;
    if (replaysLeft !== Infinity && replaysLeft <= 0) return;
    const ok = speakText(currentQ.text, PLAYBACK_SPEEDS[playbackSpeed].rate);
    if (ok && replaysLeft !== Infinity) setReplaysLeft((r) => r - 1);
  }, [currentQ, status, replaysLeft, playbackSpeed]);

  const handleKeyDown = (e) => { if (e.key === 'Enter') { e.preventDefault(); submitAnswer(); } };

  // --- Derivados ---
  const isExam = gameMode === 'exam';
  const isFinished = status === 'won';
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
            {mistakes > 0 && (
              <div className="dictado-stat lives" title="Fallos">
                <X size={14} color="#ef4444" /> <span>{mistakes}</span>
              </div>
            )}
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
              <span className="dictado-tab-sub">{c.questions} · {c.replays === Infinity ? '∞ repeticiones' : `${c.replays} rep.`}</span>
            </button>
          ))}
        </div>

        {/* Resultado */}
        <AnimatePresence>
          {isFinished && (
            <motion.div className={`dictado-result ${status}`} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="dictado-result-icon"><Trophy size={48} /></div>
              <h2 className="dictado-result-title">¡Dictado completado! 🎉</h2>

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

            {/* Audio del dictado */}
            <AnimatePresence mode="wait">
              <motion.div key={currentIndex} className="dictado-clue" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                {!ttsReady ? (
                  <div className="dictado-clue-hint" style={{ background: '#fef3c7', borderColor: '#fcd34d', color: '#78350f' }}>
                    <VolumeX size={16} /> Tu navegador no soporta audio. Usa Chrome o Edge.
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
                    <button
                      onClick={repeatDictation}
                      disabled={status !== 'playing' || (replaysLeft !== Infinity && replaysLeft <= 0)}
                      className="dictado-send-btn"
                      style={{ width: 72, height: 72, borderRadius: 20, flexShrink: 0 }}
                      title="Escuchar de nuevo"
                      aria-label="Escuchar de nuevo"
                    >
                      <Volume2 size={30} />
                    </button>
                    <div style={{ fontSize: 13, color: '#64748b', textAlign: 'left', lineHeight: 1.35 }}>
                      <div style={{ fontWeight: 700, color: '#334155', marginBottom: 2 }}>
                        🎧 Escucha con atención
                      </div>
                      {replaysLeft === Infinity ? (
                        <span>Repite las veces que quieras</span>
                      ) : replaysLeft > 0 ? (
                        <span>{replaysLeft} {replaysLeft === 1 ? 'repetición' : 'repeticiones'} disponibles</span>
                      ) : (
                        <span style={{ color: '#ef4444' }}>Sin repeticiones — escribe lo que recuerdes</span>
                      )}
                    </div>
                  </div>
                )}
                {/* Selector de velocidad de reproduccion */}
                {ttsReady && (
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 12, flexWrap: 'wrap' }}>
                    {Object.entries(PLAYBACK_SPEEDS).map(([key, s]) => (
                      <button
                        key={key}
                        onClick={() => setPlaybackSpeed(key)}
                        className={`dictado-lifeline ${playbackSpeed === key ? '' : 'ghost'}`}
                        style={{
                          background: playbackSpeed === key ? '#a855f7' : undefined,
                          color: playbackSpeed === key ? '#fff' : undefined,
                          borderColor: playbackSpeed === key ? '#a855f7' : undefined,
                          fontWeight: 700,
                        }}
                        title={`Velocidad ${s.label.toLowerCase()}`}
                      >
                        <span>{s.icon}</span> {s.label}
                      </button>
                    ))}
                  </div>
                )}
                {cfg.showHint && currentQ.hint && (
                  <div className="dictado-clue-hint" style={{ marginTop: 10 }}>
                    <Lightbulb size={16} /> Pista: {currentQ.hint}
                  </div>
                )}
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
                placeholder="Escribe lo que has escuchado..."
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
              <button
                className="dictado-lifeline"
                onClick={repeatDictation}
                disabled={status !== 'playing' || !ttsReady || (replaysLeft !== Infinity && replaysLeft <= 0)}
              >
                <Volume2 size={14} /> Repetir
                {replaysLeft !== Infinity && replaysLeft > 0 && (
                  <span className="dictado-lifeline-count">{replaysLeft}</span>
                )}
              </button>
              <button className="dictado-lifeline ghost" onClick={startGame}><RefreshCw size={14} /> Nuevo</button>
            </div>
          </>
        )}
      </motion.div>

      <InstructionsModal isOpen={showHelp} onClose={() => setShowHelp(false)} title="Cómo jugar al Dictado">
        <h3>🎯 Objetivo</h3>
        <p>El sistema <strong>pronuncia</strong> una palabra o frase y tú debes <strong>escribirla con la ortografía correcta</strong>. Se evalúa letra a letra.</p>

        <h3>🕹️ Cómo se juega</h3>
        <ul>
          <li>Al comenzar cada pregunta se reproduce automáticamente el audio.</li>
          <li>Pulsa el botón 🔊 <strong>Repetir</strong> para volver a escucharlo (limitado según el modo).</li>
          <li>Escribe lo que hayas escuchado y pulsa <kbd>Enter</kbd>.</li>
          <li>El sistema compara <strong>letra por letra</strong> y resalta aciertos y errores.</li>
          <li>La comparación ignora tildes para decidir acierto, pero si las escribes perfectas obtienes <strong>puntos extra</strong>.</li>
        </ul>

        <h3>📝 Feedback visual</h3>
        <ul>
          <li><strong>Verde</strong>: letra correcta en la posición correcta.</li>
          <li><strong>Rojo</strong>: letra incorrecta (se muestra la esperada debajo).</li>
          <li><strong>Gris tachado</strong>: letra sobrante.</li>
          <li><strong>Hueco azul</strong>: letra que faltaba.</li>
        </ul>

        <h3>🎓 Modos</h3>
        <div className="instr-modes">
          <div className="instr-mode easy"><strong>🟢 Fácil</strong>8 dictados · velocidad inicial lenta · repeticiones ilimitadas + pista visible</div>
          <div className="instr-mode medium"><strong>🟡 Medio</strong>10 dictados · velocidad normal · 3 repeticiones por palabra</div>
          <div className="instr-mode exam"><strong>🔴 Examen</strong>10 dictados mixtos · 1 repetición · 20s/pregunta · nota /10</div>
        </div>
        <div className="instr-tips"><strong>🎚️ Velocidad:</strong> puedes elegir Lento 🐢 / Normal ⚡ / Rápido 🚀 en cualquier momento para adaptar el audio a tu ritmo.</div>
        <div className="instr-tips"><strong>♾️ Siempre terminas:</strong> aunque falles, la partida no se acaba; completarás todas las palabras.</div>

        <div className="instr-tips"><strong>💡 Consejo:</strong> presta atención a las tildes y a las letras silenciosas (h, b/v, g/j). ¡Las tildes dan puntos extra!</div>
        <div className="instr-tips"><strong>🔊 Audio:</strong> se usa la voz del sistema. Si no oyes nada, sube el volumen o usa Chrome/Edge.</div>
      </InstructionsModal>
    </div>
  );
};

export default DictadoInteractivo;
