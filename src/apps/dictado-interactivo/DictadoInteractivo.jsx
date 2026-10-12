// src/apps/dictado-interactivo/DictadoInteractivo.jsx
// Rediseño 2026 sobre el kit de interfaz de juego (_shared/kit): pantalla previa
// de modos, altavoz protagonista con ondas, selector de velocidad, renglón de
// cuaderno para escribir, corrección letra a letra en fichas y resumen con la
// nota /10. La voz, la puntuación y el tracking no cambian.
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  RefreshCw, Timer, Trophy, Star, X,
  Check, Flame, ArrowRight, Lightbulb,
  Volume2, VolumeX, Turtle, Rabbit, Gauge, LayoutGrid, Target, SpellCheck,
  Headphones, Type, AlignLeft, Infinity as InfinityIcon,
} from 'lucide-react';
import { getRoscoData, getOrdenaFrasesData } from '../../services/gameDataService';
import materiasData from '../../../public/data/materias.json';
import InstructionsModal from '../_shared/InstructionsModal';
import {
  GameShell, GameHeader, Hud, HudStat, ProgressDots, ProgressBar, Panel, Chip,
  GameButton, Segmented, ModeSelect, ModeChip, RoundBanner, ResultsScreen, FeedbackItem,
  GameLoading, GameEmpty,
} from '../_shared/kit';
import useArtIds from '@/components/art/useArtIds';
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
  // null = pantalla previa de modos (CLAUDE.md §3: el modo se elige ANTES de jugar)
  const [gameMode, setGameMode] = useState(null); // null | 'easy' | 'medium' | 'exam'

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
    if (!loading && gameMode && (palabras.length > 0 || frases.length > 0)) startGame();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (!cfg || !cfg.timer || status !== 'playing') {
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
  // En la pantalla previa aún no hay modo: valores de Fácil solo para que el render no falle.
  const cfg = MODE_CONFIG[gameMode] || MODE_CONFIG.easy;

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

  // --- Registro de cada pregunta (solo presentación: progreso y repaso final) ---
  const [roundLog, setRoundLog] = useState([]);
  const [playPulse, setPlayPulse] = useState(0); // ondas del altavoz al pulsar "escuchar"
  useEffect(() => { setRoundLog([]); }, [questions]);
  useEffect(() => {
    if (status !== 'correct' && status !== 'wrong') return;
    setRoundLog((prev) => {
      const next = [...prev];
      next[currentIndex] = {
        ok: status === 'correct',
        typed: answer.trim(),
        timedOut: status === 'wrong' && timeLeft === 0 && !!MODE_CONFIG[gameMode]?.timer,
      };
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo al cerrar cada pregunta
  }, [status, currentIndex]);

  // --- Render ---
  const shellProps = { accent: '#f97316', accent2: '#f59e0b' };

  const instructions = (
    <InstructionsModal isOpen={showHelp} onClose={() => setShowHelp(false)} title="Cómo jugar al Dictado">
      <h3>🎯 Objetivo</h3>
      <p>El sistema <strong>pronuncia</strong> una palabra o frase y tú debes <strong>escribirla con la ortografía correcta</strong>. Se evalúa letra a letra.</p>

      <h3>🕹️ Cómo se juega</h3>
      <ul>
        <li>Al comenzar cada pregunta se reproduce automáticamente el audio.</li>
        <li>Pulsa el altavoz 🔊 o <strong>Repetir</strong> para volver a escucharlo (limitado según el modo).</li>
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
  );

  if (loading) {
    return (
      <GameShell {...shellProps}>
        <GameLoading label="Afinando la voz…" />
      </GameShell>
    );
  }
  if (palabras.length === 0 && frases.length === 0) {
    return (
      <GameShell {...shellProps}>
        <GameHeader onHelp={() => setShowHelp(true)} />
        <GameEmpty title="Sin dictados">No hay datos para esta asignatura.</GameEmpty>
        {instructions}
      </GameShell>
    );
  }

  // --- Pantalla previa: elegir modo (CLAUDE.md §3) ---
  if (!gameMode) {
    const modes = [
      {
        id: 'easy', tone: 'easy', title: 'Fácil',
        desc: 'Palabras dictadas despacio y con su definición como pista.',
        features: ['8 dictados', 'Repeticiones ilimitadas', 'Pista con la definición'],
      },
      {
        id: 'medium', tone: 'medium', title: 'Medio',
        desc: 'Velocidad normal y solo tres repeticiones por palabra.',
        features: ['10 dictados', '3 repeticiones por palabra', 'Bonus por tildes perfectas'],
      },
      {
        id: 'exam', tone: 'exam', title: 'Examen',
        desc: 'Palabras y frases, una sola repetición y 20 s por pregunta.',
        features: ['Nota sobre 10', '1 repetición · 20 s', 'Puntos por racha y rapidez'],
      },
    ];
    return (
      <GameShell {...shellProps}>
        <ModeSelect
          modes={modes}
          onSelect={(id) => setGameMode(id)}
          onHelp={() => setShowHelp(true)}
          footer={<span className="dict-modes-foot"><Headphones size={14} /> Mejor con auriculares · usa Chrome o Edge para oír la voz</span>}
        />
        {instructions}
      </GameShell>
    );
  }

  const backToModes = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
    setGameMode(null);
    setStatus('idle');
    setQuestions([]);
  };

  // --- Partida terminada ---
  if (isFinished) {
    const actions = [
      { label: 'Jugar otra vez', onClick: startGame, icon: RefreshCw },
      { label: 'Cambiar de modo', onClick: backToModes, icon: LayoutGrid, variant: 'soft' },
    ];
    if (isExam) {
      return (
        <GameShell {...shellProps}>
          <ResultsScreen
            title="¡Dictado completado!"
            subtitle={`Dictado · ${subjectInfo.icon} ${subjectInfo.nombre || 'General'}`}
            nota={nota}
            points={score}
            stats={[
              { icon: Target, tone: 'good', label: 'Aciertos', value: `${correctCount}/${questions.length}` },
              { icon: Flame, tone: 'streak', label: 'Racha máxima', value: maxStreak },
              { icon: X, tone: 'bad', label: 'Fallos', value: mistakes },
            ]}
            actions={actions}
          >
            {questions.map((q, i) => {
              const log = roundLog[i];
              return (
                <FeedbackItem key={`${q.text}-${i}`} index={i + 1} ok={!!log?.ok} title={q.text}>
                  {q.type === 'phrase' ? 'Frase' : 'Palabra'} · {log?.timedOut || !log?.typed
                    ? 'sin responder a tiempo'
                    : <>escribiste «<span className={log.ok ? 'dict-typed is-ok' : 'dict-typed is-ko'}>{log.typed}</span>»</>}
                </FeedbackItem>
              );
            })}
          </ResultsScreen>
          {instructions}
        </GameShell>
      );
    }
    return (
      <GameShell {...shellProps}>
        <motion.div
          className="dict-sum"
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 170, damping: 20 }}
        >
          <div className="dict-sum__head">
            <NotebookArt />
            <div className="dict-sum__titles">
              <ModeChip mode={gameMode} label={cfg.label} />
              <h2>¡Dictado completado!</h2>
              <p>{subjectInfo.icon} {subjectInfo.nombre || 'General'}</p>
            </div>
          </div>
          <div className="dict-sum__score">
            <span className="dict-sum__points">
              <Trophy size={18} /> {score.toLocaleString('es-ES')} <small>puntos</small>
            </span>
            <div className="dict-sum__stats">
              <span className="dict-sum__stat gk-stat--good"><span className="gk-stat__icon"><Check size={14} /></span><b>{correctCount}/{questions.length}</b> aciertos</span>
              <span className="dict-sum__stat gk-stat--streak"><span className="gk-stat__icon"><Flame size={14} /></span><b>{maxStreak}</b> racha máxima</span>
            </div>
          </div>
          <div className="dict-sum__words" aria-label="Dictados de la partida">
            {questions.map((q, i) => (
              <span key={`${q.text}-${i}`} className={`dict-sum__word ${roundLog[i]?.ok ? 'is-ok' : 'is-ko'}`}>
                {roundLog[i]?.ok ? <Check size={13} strokeWidth={3} /> : <X size={13} strokeWidth={3} />} {q.text}
              </span>
            ))}
          </div>
          <div className="dict-sum__actions">
            {actions.map((a, i) => (
              <GameButton key={a.label} variant={a.variant || (i === 0 ? 'primary' : 'soft')} size="lg" icon={a.icon} onClick={a.onClick}>
                {a.label}
              </GameButton>
            ))}
          </div>
        </motion.div>
        {instructions}
      </GameShell>
    );
  }

  const roundOver = status === 'correct' || status === 'wrong';
  const lastLog = roundLog[currentIndex];
  const replaysFinite = replaysLeft !== Infinity;
  const canReplay = status === 'playing' && (replaysLeft === Infinity || replaysLeft > 0);
  const speedIcons = { slow: Turtle, normal: Gauge, fast: Rabbit };

  return (
    <GameShell {...shellProps}>
      <GameHeader
        mode={gameMode}
        modeLabel={cfg.label}
        onHelp={() => setShowHelp(true)}
        right={(
          <Hud>
            {cfg.timer && !isFinished && status === 'playing' && (
              <HudStat icon={Timer} tone={timeLeft <= 5 ? 'lives' : 'time'} value={`${timeLeft}s`} label="Tiempo" />
            )}
            {mistakes > 0 && <HudStat icon={X} tone="bad" value={mistakes} label="Fallos" />}
            {streak >= 2 && <HudStat icon={Flame} tone="streak" value={streak} label="Racha" />}
            <HudStat icon={Star} tone="score" value={score.toLocaleString('es-ES')} label="Puntos" />
          </Hud>
        )}
      />

      {questions.length > 0 && (
        <ProgressDots total={questions.length} current={currentIndex} results={roundLog.map((l) => l?.ok)} />
      )}

      {!currentQ ? (
        <GameLoading label="Preparando el dictado…" />
      ) : (
        <div className="dict-stage">
          <div className="dict-meta">
            <Chip tone="accent" icon={currentQ.type === 'phrase' ? AlignLeft : Type}>
              {currentQ.type === 'phrase' ? 'Frase' : 'Palabra'} {currentIndex + 1} de {questions.length}
            </Chip>
            {cfg.timer && status === 'playing' && (
              <div className="dict-timebar">
                <ProgressBar value={timeLeft} max={cfg.timer} tone={timeLeft > 10 ? 'good' : timeLeft > 5 ? 'warn' : 'bad'} />
              </div>
            )}
          </div>

          {/* Audio del dictado */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
            >
              <Panel variant="screen" className="dict-audio">
                {!ttsReady ? (
                  <div className="dict-audio__off">
                    <VolumeX size={22} /> Tu navegador no soporta audio. Usa Chrome o Edge.
                  </div>
                ) : (
                  <div className="dict-audio__row">
                    <button
                      type="button"
                      onClick={() => { if (canReplay) setPlayPulse((k) => k + 1); repeatDictation(); }}
                      disabled={status !== 'playing' || (replaysLeft !== Infinity && replaysLeft <= 0)}
                      className="dict-speaker"
                      title="Escuchar de nuevo"
                      aria-label="Escuchar de nuevo"
                    >
                      <span key={`${currentIndex}-${playPulse}`} className="dict-speaker__waves" aria-hidden="true">
                        <i /><i /><i />
                      </span>
                      <span className="dict-speaker__body"><Volume2 size={38} /></span>
                    </button>
                    <div className="dict-audio__info">
                      <strong>Escucha con atención</strong>
                      {replaysLeft === Infinity ? (
                        <span className="dict-audio__sub"><InfinityIcon size={15} /> Repite las veces que quieras</span>
                      ) : replaysLeft > 0 ? (
                        <span className="dict-audio__sub">{replaysLeft === 1 ? '1 repetición disponible' : `${replaysLeft} repeticiones disponibles`}</span>
                      ) : (
                        <span className="dict-audio__sub is-out">Sin repeticiones — escribe lo que recuerdes</span>
                      )}
                      {replaysFinite && (
                        <span className="dict-pips" aria-hidden="true">
                          {Array.from({ length: MODE_CONFIG[gameMode].replays }).map((_, i) => (
                            <i key={i} className={i < replaysLeft ? 'is-on' : ''} />
                          ))}
                        </span>
                      )}
                    </div>
                    {/* Selector de velocidad de reproduccion */}
                    <div className="dict-speed">
                      <span className="dict-speed__label">Velocidad</span>
                      <Segmented
                        size="sm"
                        value={playbackSpeed}
                        onChange={setPlaybackSpeed}
                        options={Object.entries(PLAYBACK_SPEEDS).map(([key, s]) => ({ value: key, label: s.label, icon: speedIcons[key] }))}
                      />
                    </div>
                  </div>
                )}
              </Panel>
              {cfg.showHint && currentQ.hint && (
                <div className="dict-hint">
                  <span className="dict-hint__icon"><Lightbulb size={17} /></span>
                  <span><b>Pista:</b> {currentQ.hint}</span>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Renglón para escribir */}
          <div className={`dict-write is-${status}`}>
            <span className="dict-write__margin" aria-hidden="true" />
            <input
              ref={inputRef}
              type="text"
              className="dict-input"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe lo que has escuchado..."
              autoComplete="off"
              spellCheck="false"
              disabled={status !== 'playing'}
            />
            <GameButton
              variant="primary"
              size="lg"
              icon={ArrowRight}
              onClick={submitAnswer}
              disabled={status !== 'playing' || !answer.trim()}
              aria-label="Comprobar"
              className="dict-send"
            />
          </div>

          {/* Corrección letra a letra */}
          <AnimatePresence>
            {diff && roundOver && (
              <motion.div
                className={`dict-diff is-${status}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className="dict-diff__chars">
                  {diff.map((d, i) => (
                    <span
                      key={i}
                      className={`dict-char ${d.correct ? 'is-ok' : d.missing ? 'is-missing' : d.extra ? 'is-extra' : 'is-wrong'} ${(d.char || d.expected) === ' ' ? 'is-space' : ''}`}
                      style={{ '--i': i }}
                    >
                      {d.correct ? d.char : d.missing ? d.expected : d.extra ? d.char : (
                        <><span className="dict-char__got">{d.char}</span><span className="dict-char__exp">{d.expected}</span></>
                      )}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <RoundBanner
            show={roundOver}
            status={status === 'correct' ? 'won' : 'lost'}
            title={status === 'correct'
              ? '¡Correcto!'
              : lastLog?.timedOut ? '¡Se acabó el tiempo!' : 'Casi… revisa la ortografía'}
            subtitle={status === 'correct'
              ? (normalize(answer.trim()) === normalize(currentQ.text) && answer.trim() !== currentQ.text
                ? <>Con tildes perfectas: <strong>{currentQ.text}</strong> (+20 puntos extra)</>
                : 'Ortografía perfecta, tildes incluidas.')
              : <>Respuesta correcta: <strong>{currentQ.text}</strong></>}
          />

          {/* Ayudas */}
          {!roundOver && (
            <div className="dict-tools">
              <GameButton
                variant="soft"
                icon={Volume2}
                onClick={() => { if (canReplay) setPlayPulse((k) => k + 1); repeatDictation(); }}
                disabled={status !== 'playing' || !ttsReady || (replaysLeft !== Infinity && replaysLeft <= 0)}
                className="dict-life"
              >
                Repetir
                {replaysLeft !== Infinity && replaysLeft > 0 && (
                  <b className="dict-life__count">{replaysLeft}</b>
                )}
              </GameButton>
              <GameButton variant="ghost" icon={RefreshCw} onClick={startGame}>Nuevo</GameButton>
            </div>
          )}
        </div>
      )}

      <div className="dict-footer">
        {!isExam && (
          <GameButton variant="soft" size="sm" icon={LayoutGrid} onClick={backToModes}>
            Cambiar modo
          </GameButton>
        )}
        <span className="dict-footer__info">
          <SpellCheck size={14} /> Se corrige letra a letra · las tildes perfectas suman puntos
        </span>
      </div>

      {instructions}
    </GameShell>
  );
};

// Ilustración del resumen: cuaderno pautado con un gran visto bueno y un lápiz.
const NotebookArt = () => {
  const [id, url] = useArtIds();
  return (
    <svg className="dict-sum__art" viewBox="0 0 120 96" aria-hidden="true">
      <defs>
        <radialGradient id={id('shadow')} cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#7c2d12" stopOpacity=".35" />
          <stop offset="1" stopColor="#7c2d12" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id('paper')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#ffedd5" />
        </linearGradient>
        <linearGradient id={id('check')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#34d399" />
          <stop offset="1" stopColor="#059669" />
        </linearGradient>
        <linearGradient id={id('pencil')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fdba74" />
          <stop offset=".5" stopColor="#f97316" />
          <stop offset="1" stopColor="#c2410c" />
        </linearGradient>
      </defs>
      <ellipse cx="58" cy="89" rx="50" ry="6" fill={url('shadow')} />
      <g transform="rotate(-5 56 48)">
        <rect x="20" y="12" width="70" height="76" rx="7" fill="#fdba74" />
        <rect x="16" y="8" width="70" height="76" rx="7" fill={url('paper')} />
        {[24, 34, 44, 54, 64, 74].map((y) => (
          <path key={y} d={`M24 ${y} H80`} stroke="#bfdbfe" strokeWidth="1.2" />
        ))}
        <path d="M30 8 V84" stroke="#fda4af" strokeWidth="1.4" />
        {[18, 38, 58, 78].map((y) => <circle key={y} cx="16" cy={y} r="3" fill="#fed7aa" />)}
        <path d="M36 21 q3 -5 6 0 t6 0 t6 0 t6 0" stroke="#4338ca" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M36 31 q3 -5 6 0 t6 0 t6 0" stroke="#4338ca" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M40 56 l10 10 l20 -24" stroke={url('check')} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>
      <g transform="translate(92 30) rotate(32)">
        <rect x="-4" y="0" width="8" height="40" rx="2" fill={url('pencil')} />
        <rect x="-4" y="-6" width="8" height="6" rx="2" fill="#f9a8d4" />
        <path d="M-4 40 L0 50 L4 40 Z" fill="#fde7c8" />
        <path d="M-1.4 46.5 L0 50 L1.4 46.5 Z" fill="#334155" />
      </g>
      <path d="M108 12 q1 5 6 6 q-5 1 -6 6 q-1 -5 -6 -6 q5 -1 6 -6Z" fill="#fbbf24" />
    </svg>
  );
};

export default DictadoInteractivo;
