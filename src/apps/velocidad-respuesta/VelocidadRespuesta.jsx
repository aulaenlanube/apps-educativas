// src/apps/velocidad-respuesta/VelocidadRespuesta.jsx
// Rediseño 2026 sobre el kit de interfaz (_shared/kit): consola de carreras
// con cuentarrevoluciones (la aguja corre hacia la zona roja según se agota
// el tiempo), mecha de tiempo, casillas de letras que se rellenan al escribir
// y feedback de acierto/fallo. Tiempos, puntuación y tracking sin cambios.
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Timer, Flame, Star, RefreshCw, SkipForward, Eye, Trophy, Check, X, Send,
  LayoutGrid, GraduationCap, Zap, Gauge,
} from 'lucide-react';
import { getRoscoData } from '../../services/gameDataService';
import materiasData from '../../../public/data/materias.json';
import InstructionsModal from '../_shared/InstructionsModal';
import {
  GameShell, GameHeader, Hud, HudStat, ProgressDots, GameButton, Chip, ModeSelect,
  RoundBanner, ResultsScreen, FeedbackItem, GameLoading, GameEmpty,
} from '../_shared/kit';
import './VelocidadRespuesta.css';

const normalize = (s) =>
  String(s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[^A-ZÑ ]/g, '')
    .trim();

const MODE_CONFIG = {
  easy: {
    label: 'Fácil', icon: '🟢', questions: 5,
    baseTime: 10, // seconds (baseline ESO 2º/3º/4º)
    helps: { firstLetter: 3, skip: 3 },
    speedUp: false,
  },
  medium: {
    label: 'Medio', icon: '🟡', questions: 8,
    baseTime: 7,
    helps: { firstLetter: 1, skip: 1 },
    speedUp: true, // cada 3 rachas, -0.3s
  },
  exam: {
    label: 'Examen', icon: '🔴', questions: 10,
    baseTime: 5,
    helps: { firstLetter: 1, skip: 0 },
    speedUp: true,
  },
};

// Al fallar (o agotarse el tiempo) la partida NO termina: la siguiente pregunta gana
// un bonus de tiempo igual al 50% del base (minimo 2s).
const FAIL_TIME_BONUS_RATIO = 0.5;
const FAIL_TIME_BONUS_MIN = 2;

// Los alumnos pequeños leen y tipean mucho más lento — escalamos el tiempo por curso.
// Baseline (×1.0) ≈ ESO 2º. Primaria necesita más tiempo, bachillerato algo menos.
const GRADE_TIME_MULTIPLIERS = {
  'primaria-1': 2.2,
  'primaria-2': 2.0,
  'primaria-3': 1.7,
  'primaria-4': 1.5,
  'primaria-5': 1.3,
  'primaria-6': 1.15,
  'eso-1': 1.05,
  'eso-2': 1.0,
  'eso-3': 1.0,
  'eso-4': 0.95,
  'bachillerato-1': 0.9,
  'bachillerato-2': 0.85,
};
const getGradeTimeMultiplier = (level, grade) => GRADE_TIME_MULTIPLIERS[`${level}-${grade}`] || 1.0;

const getSubjectInfo = (level, grade, subjectId) => {
  if (!level || !grade || !subjectId) return { nombre: '', icon: '📚' };
  const curso = materiasData?.[level]?.[String(grade)];
  if (!Array.isArray(curso)) return { nombre: '', icon: '📚' };
  return curso.find((m) => m.id === subjectId) || { nombre: '', icon: '📚' };
};

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const VelocidadRespuesta = ({ onGameComplete }) => {
  const { level, grade: gradeParam, subjectId } = useParams();
  const grade = useMemo(() => parseInt(gradeParam, 10), [gradeParam]);
  const asignatura = subjectId || (level === 'primaria' ? 'lengua' : 'general');
  const subjectInfo = useMemo(() => getSubjectInfo(level, grade, asignatura), [level, grade, asignatura]);
  const timeMultiplier = useMemo(() => getGradeTimeMultiplier(level, grade), [level, grade]);
  const getBaseTime = useCallback((mode) => {
    const cfg = MODE_CONFIG[mode];
    if (!cfg) return 0;
    // Redondeamos a 0.5s para que los tiempos queden "humanos" (ej. 18s, 12.5s…)
    return Math.max(3, Math.round(cfg.baseTime * timeMultiplier * 2) / 2);
  }, [timeMultiplier]);

  const [allWords, setAllWords] = useState([]);
  const [loading, setLoading] = useState(true);
  // null = pantalla previa de modos (CLAUDE.md §3: el modo se elige ANTES de jugar)
  const [gameMode, setGameMode] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [status, setStatus] = useState('idle'); // idle|playing|correct|wrong|timeout|won|lost
  const [answer, setAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);

  // Game state
  const [mistakes, setMistakes] = useState(0);
  const [pendingTimeBonus, setPendingTimeBonus] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [lastGain, setLastGain] = useState(null);

  // Timer
  const [timeLeft, setTimeLeft] = useState(0);
  const [maxTime, setMaxTime] = useState(10);
  const timerRef = useRef(null);
  const inputRef = useRef(null);
  const trackedRef = useRef(false);

  // Helps
  const [helpsRemaining, setHelpsRemaining] = useState({});
  const [revealedFirst, setRevealedFirst] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Solo presentación: resultado de cada pregunta (true/false) para los puntos
  // de progreso y la retroalimentación del resumen.
  const [resultados, setResultados] = useState([]);

  // --- Cargar rosco ---
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const load = async () => {
      try {
        const data = await getRoscoData(level, grade, asignatura);
        if (cancelled) return;
        const words = Array.isArray(data)
          ? data
              .filter((it) => it?.solucion && it?.definicion && !/\s|-/.test(String(it.solucion).trim()))
              .map((it) => ({
                word: String(it.solucion).trim(),
                clue: String(it.definicion).trim(),
                difficulty: it.difficulty || 2,
              }))
          : [];
        setAllWords(words);
      } catch (err) {
        console.error('VelocidadRespuesta: error cargando datos', err);
        setAllWords([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [level, grade, asignatura]);

  // --- Iniciar partida ---
  const startGame = useCallback(() => {
    if (allWords.length < 4) return;
    const cfg = MODE_CONFIG[gameMode];
    const qs = shuffle(allWords).slice(0, cfg.questions);
    qs.sort((a, b) => a.difficulty - b.difficulty); // fáciles primero
    setQuestions(qs);
    setCurrentIndex(0);
    setStatus('playing');
    setAnswer('');
    setShowAnswer(false);
    setMistakes(0);
    setPendingTimeBonus(0);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setCorrectCount(0);
    setLastGain(null);
    setHelpsRemaining({ ...cfg.helps });
    setRevealedFirst(false);
    const adjBase = getBaseTime(gameMode);
    setMaxTime(adjBase);
    setTimeLeft(adjBase);
    trackedRef.current = false;
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [allWords, gameMode, getBaseTime]);

  useEffect(() => {
    if (!gameMode) return; // pantalla previa: aún no hay partida
    if (!loading && allWords.length >= 4) startGame();
  }, [loading, gameMode, allWords, startGame]);

  // --- Timer por pregunta ---
  useEffect(() => {
    if (status !== 'playing') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 0.1) {
          clearInterval(timerRef.current);
          // Timeout: fallo sin perder vidas, se concede un bonus de tiempo para la siguiente
          setStatus('timeout');
          setMistakes((m) => m + 1);
          setStreak(0);
          setShowAnswer(true);
          const bonus = Math.max(FAIL_TIME_BONUS_MIN, Math.round(getBaseTime(gameMode) * FAIL_TIME_BONUS_RATIO * 2) / 2);
          setPendingTimeBonus((b) => b + bonus);
          return 0;
        }
        return Math.max(0, t - 0.05);
      });
    }, 50);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [status, currentIndex, gameMode, getBaseTime]);

  // --- Pregunta actual ---
  const currentQ = questions[currentIndex];

  // --- Calcular tiempo ajustado (speedUp) ---
  const getAdjustedTime = useCallback(() => {
    const cfg = MODE_CONFIG[gameMode];
    const base = getBaseTime(gameMode);
    if (!cfg.speedUp) return base;
    // Cada 3 rachas reducimos ~5% del tiempo base (mínimo 50% del base, nunca <3s)
    const reduction = Math.floor(streak / 3) * base * 0.05;
    return Math.max(3, base * 0.5, base - reduction);
  }, [gameMode, streak, getBaseTime]);

  // --- Enviar respuesta ---
  const submitAnswer = useCallback(() => {
    if (status !== 'playing' || !currentQ) return;
    if (timerRef.current) clearInterval(timerRef.current);

    const normalized = normalize(answer);
    const correct = normalize(currentQ.word);

    if (normalized === correct) {
      // ¡Correcto!
      const streakMultiplier = 1 + streak * 0.1;
      const adjBase = getBaseTime(gameMode);
      const timeBonus = Math.max(0, Math.round(20 * (timeLeft / Math.max(1, adjBase))));
      const basePoints = 100;
      const gained = Math.round(basePoints * streakMultiplier + timeBonus);
      setScore((s) => s + gained);
      setLastGain({ value: gained, key: Date.now() });
      setStreak((s) => {
        const next = s + 1;
        setMaxStreak((m) => Math.max(m, next));
        return next;
      });
      setCorrectCount((c) => c + 1);
      setStatus('correct');
    } else {
      setStatus('wrong');
      setMistakes((m) => m + 1);
      setStreak(0);
      setShowAnswer(true);
      const bonus = Math.max(FAIL_TIME_BONUS_MIN, Math.round(getBaseTime(gameMode) * FAIL_TIME_BONUS_RATIO * 2) / 2);
      setPendingTimeBonus((b) => b + bonus);
    }
  }, [status, currentQ, answer, gameMode, streak, timeLeft, getBaseTime]);

  // --- Avanzar tras feedback ---
  useEffect(() => {
    if (status !== 'correct' && status !== 'wrong' && status !== 'timeout') return;
    const delay = status === 'correct' ? 800 : 1800;
    const t = setTimeout(() => {
      // Fallar ya no termina la partida: solo se acaba cuando no quedan preguntas
      if (currentIndex + 1 >= questions.length) {
        setStatus('won');
        return;
      }
      setCurrentIndex((i) => i + 1);
      setAnswer('');
      setShowAnswer(false);
      setRevealedFirst(false);
      // Aplicamos el bonus de tiempo acumulado y lo reseteamos
      const adjTime = getAdjustedTime() + pendingTimeBonus;
      setPendingTimeBonus(0);
      setMaxTime(adjTime);
      setTimeLeft(adjTime);
      setStatus('playing');
      setTimeout(() => inputRef.current?.focus(), 50);
    }, delay);
    return () => clearTimeout(t);
  }, [status, currentIndex, questions.length, getAdjustedTime, pendingTimeBonus]);

  // --- XP tracking al terminar ---
  useEffect(() => {
    if ((status !== 'won' && status !== 'lost') || trackedRef.current) return;
    trackedRef.current = true;
    if (status === 'won') {
      confetti({ particleCount: 200, spread: 120, origin: { y: 0.5 },
        colors: ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#a855f7'] });
    }
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

  // Solo presentación: anota el resultado de la pregunta al resolverse.
  useEffect(() => { setResultados([]); }, [questions]);
  useEffect(() => {
    if (status !== 'correct' && status !== 'wrong' && status !== 'timeout') return;
    setResultados((r) => {
      const next = [...r];
      next[currentIndex] = status === 'correct';
      return next;
    });
  }, [status, currentIndex]);

  // --- Ayudas ---
  const useFirstLetter = useCallback(() => {
    if (!currentQ || helpsRemaining.firstLetter <= 0 || revealedFirst || status !== 'playing') return;
    setRevealedFirst(true);
    setAnswer(currentQ.word[0].toUpperCase());
    setHelpsRemaining((h) => ({ ...h, firstLetter: h.firstLetter - 1 }));
    inputRef.current?.focus();
  }, [currentQ, helpsRemaining, revealedFirst, status]);

  const skipQuestion = useCallback(() => {
    if (helpsRemaining.skip <= 0 || status !== 'playing') return;
    if (timerRef.current) clearInterval(timerRef.current);
    setHelpsRemaining((h) => ({ ...h, skip: h.skip - 1 }));
    setStreak(0);
    if (currentIndex + 1 >= questions.length) {
      setStatus('won');
    } else {
      setCurrentIndex((i) => i + 1);
      setAnswer('');
      setShowAnswer(false);
      setRevealedFirst(false);
      const adjTime = getAdjustedTime();
      setMaxTime(adjTime);
      setTimeLeft(adjTime);
      setStatus('playing');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [helpsRemaining, status, currentIndex, questions.length, getAdjustedTime]);

  // --- Teclado: Enter para enviar ---
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submitAnswer();
    }
  }, [submitAnswer]);

  // Volver a la pantalla de modos. El estado vuelve al inicial ('idle'): se
  // detienen el cronómetro y el auto-avance, y al elegir otro modo el efecto
  // de tracking no ve el final de la partida anterior.
  const backToModes = () => {
    setStatus('idle');
    setGameMode(null);
  };

  // --- Derivados ---
  // En la pantalla previa (gameMode null) se usa la config fácil solo para pintar.
  const cfg = MODE_CONFIG[gameMode] || MODE_CONFIG.easy;
  const isExam = gameMode === 'exam';
  const isFinished = status === 'won' || status === 'lost';
  const multiplier = (1 + streak * 0.2).toFixed(1);
  const timerPct = maxTime > 0 ? (timeLeft / maxTime) * 100 : 0;
  const timerColor = timerPct > 50 ? 'green' : timerPct > 25 ? 'yellow' : 'red';
  const nota = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) / 10 : 0;

  const instructions = (
    <InstructionsModal isOpen={showHelp} onClose={() => setShowHelp(false)} title="Cómo jugar a Velocidad">
      <h3>🎯 Objetivo</h3>
      <p>Lee la definición y <strong>escribe la palabra correcta</strong> antes de que se agote la barra de tiempo.</p>

      <h3>🕹️ Cómo se juega</h3>
      <ul>
        <li>Aparece una definición del vocabulario de la asignatura.</li>
        <li>Escribe la respuesta en el campo de texto y pulsa <kbd>Enter</kbd> o el botón de enviar.</li>
        <li>Si aciertas: sumas puntos y la racha crece (más multiplicador).</li>
        <li>Si fallas o se acaba el tiempo: la racha se resetea y la siguiente pregunta gana tiempo extra.</li>
        <li>En modo medio/examen, cuanto mayor es la racha, <strong>menos tiempo</strong> tienes por pregunta.</li>
      </ul>

      <h3>🔥 Puntuación</h3>
      <ul>
        <li><strong>Base</strong>: 100 puntos por acierto.</li>
        <li><strong>Multiplicador</strong>: crece con la racha.</li>
        <li><strong>Bonus tiempo</strong>: cuanto más rápido respondas, más puntos extra.</li>
      </ul>

      <h3>🎓 Modos</h3>
      <div className="instr-modes">
        <div className="instr-mode easy"><strong>🟢 Fácil</strong>{MODE_CONFIG.easy.questions} preguntas · {getBaseTime('easy')}s · 3 pistas + 3 saltos</div>
        <div className="instr-mode medium"><strong>🟡 Medio</strong>{MODE_CONFIG.medium.questions} preguntas · {getBaseTime('medium')}s · la velocidad sube con la racha</div>
        <div className="instr-mode exam"><strong>🔴 Examen</strong>{MODE_CONFIG.exam.questions} preguntas · {getBaseTime('exam')}s · la velocidad sube · nota /10</div>
      </div>

      <div className="instr-tips"><strong>💡 Consejo:</strong> no escribas tildes — la comparación ignora acentos. Concéntrate en la velocidad.</div>
    </InstructionsModal>
  );

  const shellProps = { accent: '#ef4444', accent2: '#f59e0b', className: 'vr-shell' };

  // --- Render ---
  if (loading) {
    return (
      <GameShell {...shellProps}>
        <GameLoading label="Calentando motores…" />
      </GameShell>
    );
  }

  if (allWords.length < 4) {
    return (
      <GameShell {...shellProps}>
        <GameHeader onHelp={() => setShowHelp(true)} />
        <GameEmpty title="Faltan palabras">No hay suficientes palabras para esta asignatura.</GameEmpty>
        {instructions}
      </GameShell>
    );
  }

  // --- Pantalla previa: elegir modo ---
  if (!gameMode) {
    const modes = [
      {
        id: 'easy', tone: 'easy', title: 'Fácil',
        desc: 'Ritmo tranquilo para coger confianza.',
        features: [`${MODE_CONFIG.easy.questions} preguntas · ${getBaseTime('easy')} s`, '3 primeras letras + 3 saltos'],
      },
      {
        id: 'medium', tone: 'medium', title: 'Medio',
        desc: 'Cada racha acelera el reloj.',
        features: [`${MODE_CONFIG.medium.questions} preguntas · ${getBaseTime('medium')} s`, 'El tiempo baja con la racha'],
      },
      {
        id: 'exam', tone: 'exam', title: 'Examen',
        desc: 'A toda velocidad y sin saltos.',
        features: ['Nota sobre 10', `${MODE_CONFIG.exam.questions} preguntas · ${getBaseTime('exam')} s`, 'Puntos por racha y rapidez'],
      },
    ];
    return (
      <GameShell {...shellProps}>
        <ModeSelect
          modes={modes}
          onSelect={(id) => setGameMode(id)}
          onHelp={() => setShowHelp(true)}
          footer={<span className="vr-modes-foot"><Gauge size={15} /> Tiempos ajustados a tu curso · sin tildes</span>}
        />
        {instructions}
      </GameShell>
    );
  }

  // --- Examen terminado ---
  if (isFinished && isExam) {
    return (
      <GameShell {...shellProps}>
        <ResultsScreen
          title="¡Carrera terminada!"
          subtitle={`Velocidad · ${subjectInfo.icon} ${subjectInfo.nombre || 'General'}`}
          nota={nota}
          points={score}
          stats={[
            { icon: Check, tone: 'good', label: 'Aciertos', value: `${correctCount}/${questions.length}` },
            { icon: Flame, tone: 'streak', label: 'Racha máx.', value: maxStreak },
            { icon: X, tone: 'bad', label: 'Fallos', value: mistakes },
          ]}
          actions={[
            { label: 'Jugar otra vez', onClick: startGame, icon: RefreshCw },
            { label: 'Cambiar de modo', onClick: backToModes, icon: LayoutGrid, variant: 'soft' },
          ]}
        >
          {questions.map((q, i) => (
            <FeedbackItem key={i} index={i + 1} ok={resultados[i] === true} title={q.word.toUpperCase()}>
              {resultados[i] === undefined ? 'Saltada · ' : ''}{q.clue}
            </FeedbackItem>
          ))}
        </ResultsScreen>
        {instructions}
      </GameShell>
    );
  }

  const wordLen = currentQ ? currentQ.word.length : 0;
  const typed = normalize(answer).replace(/ /g, '');
  const revealWord = (status === 'wrong' || status === 'timeout') && showAnswer;
  const slots = currentQ
    ? Array.from({ length: wordLen }, (_, i) => (revealWord ? currentQ.word[i].toUpperCase() : typed[i] || ''))
    : [];

  return (
    <GameShell {...shellProps}>
      <GameHeader
        mode={gameMode}
        modeLabel={cfg.label}
        onHelp={() => setShowHelp(true)}
        right={(
          <Hud>
            {pendingTimeBonus > 0 && !isFinished && (
              <HudStat icon={Timer} tone="time" value={`+${pendingTimeBonus}s`} label="Extra" title="Tiempo extra para la siguiente pregunta" />
            )}
            {streak >= 2 && <HudStat icon={Flame} tone="streak" value={`×${multiplier}`} label="Racha" />}
            {mistakes > 0 && <HudStat icon={X} tone="bad" value={mistakes} label="Fallos" />}
            <HudStat icon={Star} tone="score" value={score.toLocaleString('es-ES')} label="Puntos" />
          </Hud>
        )}
      />

      {/* --- Partida de práctica terminada --- */}
      {isFinished && (
        <motion.div
          className="vr-finish"
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <span className="vr-finish__flag" aria-hidden="true"><Trophy size={42} /></span>
          <h2 className="vr-finish__title">¡Ronda completada!</h2>
          <div className="vr-finish__score"><strong>{score.toLocaleString('es-ES')}</strong><span>puntos</span></div>
          <div className="vr-finish__stats">
            <Chip tone="good" icon={Check}>{correctCount}/{questions.length} aciertos</Chip>
            <Chip tone="soft" icon={Flame}>Racha máx: {maxStreak}</Chip>
          </div>
          <div className="vr-finish__actions">
            <GameButton size="lg" icon={RefreshCw} onClick={startGame}>Jugar otra vez</GameButton>
            <GameButton size="lg" variant="soft" icon={LayoutGrid} onClick={backToModes}>Cambiar de modo</GameButton>
          </div>
        </motion.div>
      )}

      {/* --- Juego activo --- */}
      {!isFinished && currentQ && (
        <>
          <ProgressDots total={questions.length} current={currentIndex} results={resultados} />

          <div className={`vr-console is-${status}`}>
            <SpeedGauge pct={timerPct} timeLeft={timeLeft} tone={timerColor} />

            <div className="vr-clue">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  className="vr-clue__body"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.25 }}
                >
                  <span className="vr-clue__label"><Zap size={13} /> Definición</span>
                  <p className="vr-clue__text">{currentQ.clue}</p>
                  <div className="vr-slots" style={{ '--n': wordLen }} aria-label={`${wordLen} letras`}>
                    {slots.map((ch, i) => (
                      <span
                        key={i}
                        className={`vr-slot ${ch ? 'is-filled' : ''} ${revealWord ? 'is-reveal' : ''} ${status === 'correct' ? 'is-ok' : ''}`}
                      >
                        {ch}
                      </span>
                    ))}
                  </div>
                  <span className="vr-clue__meta">{wordLen} letras</span>
                </motion.div>
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {status === 'correct' && lastGain && (
                <motion.span
                  key={lastGain.key}
                  className="vr-gain"
                  initial={{ opacity: 0, y: 10, scale: 0.7 }}
                  animate={{ opacity: 1, y: -6, scale: 1 }}
                  exit={{ opacity: 0, y: -24 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                >
                  <Check size={18} strokeWidth={3} /> +{lastGain.value}
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Mecha de tiempo */}
          <div className={`vr-fuse is-${timerColor}`} aria-hidden="true">
            <span className="vr-fuse__fill" style={{ transform: `scaleX(${Math.max(0, Math.min(1, timerPct / 100))})` }} />
          </div>

          {/* Entrada */}
          <div className={`vr-input ${status === 'correct' ? 'is-correct' : ''} ${status === 'wrong' || status === 'timeout' ? 'is-wrong' : ''}`}>
            <input
              ref={inputRef}
              type="text"
              className="vr-input__field"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe la respuesta…"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck="false"
              disabled={status !== 'playing'}
              aria-label="Tu respuesta"
            />
            <GameButton
              className="vr-input__send"
              icon={Send}
              onClick={submitAnswer}
              disabled={status !== 'playing' || !answer.trim()}
              aria-label="Enviar respuesta"
            >
              Enviar
            </GameButton>
          </div>

          <RoundBanner
            show={revealWord}
            status="lost"
            title={status === 'timeout' ? '¡Tiempo!' : 'Incorrecto'}
            subtitle={<>La respuesta era <strong>{currentQ.word}</strong>{pendingTimeBonus > 0 ? ` · +${pendingTimeBonus}s para la siguiente` : ''}</>}
          />

          <div className="vr-tools">
            <GameButton
              variant="soft"
              size="sm"
              icon={Eye}
              onClick={useFirstLetter}
              disabled={helpsRemaining.firstLetter <= 0 || revealedFirst || status !== 'playing'}
            >
              1ª letra
              {helpsRemaining.firstLetter > 0 && <span className="vr-count">{helpsRemaining.firstLetter}</span>}
            </GameButton>
            <GameButton
              variant="soft"
              size="sm"
              icon={SkipForward}
              onClick={skipQuestion}
              disabled={helpsRemaining.skip <= 0 || status !== 'playing'}
            >
              Saltar
              {helpsRemaining.skip > 0 && <span className="vr-count">{helpsRemaining.skip}</span>}
            </GameButton>
            {!isExam ? (
              <GameButton variant="ghost" size="sm" icon={LayoutGrid} onClick={backToModes}>Cambiar modo</GameButton>
            ) : (
              <span className="vr-tools__info"><GraduationCap size={14} /> Modo examen · sin saltos</span>
            )}
          </div>
        </>
      )}

      {instructions}
    </GameShell>
  );
};

// Cuentarrevoluciones: arco verde → ámbar → rojo, marcas y aguja. La aguja va
// de la izquierda (tiempo lleno) a la derecha (sin tiempo). Solo transform.
const ARC = (a0, a1, r = 78) => {
  const p = (a) => [100 + r * Math.cos((a * Math.PI) / 180), 100 + r * Math.sin((a * Math.PI) / 180)];
  const [x0, y0] = p(a0);
  const [x1, y1] = p(a1);
  return `M${x0.toFixed(2)} ${y0.toFixed(2)} A${r} ${r} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
};
const TICKS = Array.from({ length: 11 }, (_, i) => {
  const a = ((180 + i * 18) * Math.PI) / 180;
  const r1 = i % 5 === 0 ? 58 : 63;
  return `M${(100 + r1 * Math.cos(a)).toFixed(2)} ${(100 + r1 * Math.sin(a)).toFixed(2)} L${(100 + 69 * Math.cos(a)).toFixed(2)} ${(100 + 69 * Math.sin(a)).toFixed(2)}`;
}).join(' ');

const SpeedGauge = ({ pct, timeLeft, tone }) => {
  const angle = -90 + 180 * (1 - Math.max(0, Math.min(100, pct)) / 100);
  return (
    <div className={`vr-gauge is-${tone}`} role="timer" aria-label={`${Math.ceil(timeLeft)} segundos`}>
      <svg viewBox="0 0 200 118" aria-hidden="true">
        <defs>
          <radialGradient id="vr-hub" cx=".38" cy=".32" r=".8">
            <stop offset="0" stopColor="#f8fafc" />
            <stop offset=".6" stopColor="#cbd5e1" />
            <stop offset="1" stopColor="#64748b" />
          </radialGradient>
          <linearGradient id="vr-needle" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#fecaca" />
            <stop offset=".5" stopColor="#ef4444" />
            <stop offset="1" stopColor="#991b1b" />
          </linearGradient>
        </defs>
        <path d={ARC(180, 360, 84)} className="vr-gauge__bezel" />
        <path d={ARC(181, 270)} className="vr-gauge__zone is-green" />
        <path d={ARC(270, 318)} className="vr-gauge__zone is-yellow" />
        <path d={ARC(318, 359)} className="vr-gauge__zone is-red" />
        <path d={TICKS} className="vr-gauge__ticks" />
        <g className="vr-gauge__needle" style={{ transform: `rotate(${angle}deg)` }}>
          <path d="M97 100 L100 34 L103 100 Z" fill="url(#vr-needle)" />
        </g>
        <circle cx="100" cy="100" r="11" fill="url(#vr-hub)" />
        <circle cx="100" cy="100" r="4" fill="#334155" />
      </svg>
      <span className="vr-gauge__value">{Math.ceil(timeLeft)}<small>s</small></span>
    </div>
  );
};

export default VelocidadRespuesta;
