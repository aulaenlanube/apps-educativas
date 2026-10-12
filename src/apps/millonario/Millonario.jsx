// src/apps/millonario/Millonario.jsx
// Rediseño 2026 sobre el kit de interfaz (_shared/kit): plató de concurso
// nocturno con focos, pregunta y respuestas en rombos alargados unidos por el
// raíl del plató, comodines como medallones esmaltados y escalera de premios
// con el peldaño actual iluminado. La lógica de juego y el tracking no cambian.
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Trophy, Users, RefreshCw, Check, Crown, Zap, Shuffle, Sparkles,
  LayoutGrid, GraduationCap, Wand2, ShieldCheck, Coins,
} from 'lucide-react';
import { getRoscoData } from '../../services/gameDataService';
import materiasData from '../../../public/data/materias.json';
import InstructionsModal from '../_shared/InstructionsModal';
import {
  GameShell, GameHeader, Hud, HudStat, Lives, AnswerOption, GameButton, Chip,
  ModeSelect, RoundBanner, ResultsScreen, GameLoading, GameEmpty,
} from '../_shared/kit';
import './Millonario.css';

// --- Escalera de premios clásica ---
const PRIZE_LADDER = [
  100, 200, 300, 500, 1000,       // milestone 1 (1.000€)
  2000, 4000, 8000, 16000, 32000, // milestone 2 (32.000€)
  64000, 125000, 250000, 500000, 1000000,
];

const SAFE_LEVELS = [5, 10]; // niveles de red (1-based)

const MODE_CONFIG = {
  easy: {
    label: 'Fácil',
    icon: '🟢',
    questions: 5,
    lives: 3,
    helps: true,
    timer: null,
    color: '#10b981',
  },
  medium: {
    label: 'Medio',
    icon: '🟡',
    questions: 10,
    lives: 2,
    helps: true,
    timer: null,
    color: '#f59e0b',
  },
  exam: {
    label: 'Examen',
    icon: '🔴',
    questions: 15,
    lives: 1,
    helps: false,
    timer: 30,
    color: '#ef4444',
  },
};

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
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

// --- Generador de preguntas ---
const generateQuestions = (pool, count) => {
  // Filtrar: necesitamos solución + definición
  const valid = pool
    .filter((it) => it && it.solucion && it.definicion)
    .map((it) => ({
      answer: String(it.solucion).trim(),
      question: String(it.definicion).trim(),
      difficulty: it.difficulty || 2,
    }))
    .filter((it) => it.answer.length > 0);

  if (valid.length < 4) return [];

  // Ordenar por dificultad ascendente para la pirámide (fácil primero)
  const byDiff = [...valid].sort((a, b) => {
    if (a.difficulty !== b.difficulty) return a.difficulty - b.difficulty;
    return Math.random() - 0.5;
  });

  // Tomar los primeros N como "correctas"
  const correctas = byDiff.slice(0, Math.min(count, byDiff.length));

  const questions = [];
  for (const q of correctas) {
    // 3 distractores aleatorios distintos del correcto
    const distractores = shuffle(
      valid.filter((x) => x.answer !== q.answer)
    ).slice(0, 3);
    if (distractores.length < 3) continue;

    const options = shuffle([q.answer, ...distractores.map((d) => d.answer)]);
    const correctIndex = options.indexOf(q.answer);

    questions.push({
      question: q.question,
      correct: q.answer,
      options,
      correctIndex,
      difficulty: q.difficulty,
    });
  }
  return questions;
};

const Millonario = ({ onGameComplete }) => {
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
  const [gameMode, setGameMode] = useState(null); // null | 'easy' | 'medium' | 'exam'
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [status, setStatus] = useState('playing'); // 'playing' | 'correct' | 'wrong' | 'won' | 'lost'
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [lives, setLives] = useState(3);
  const [maxReached, setMaxReached] = useState(0);

  // Comodines (disponibles en TODOS los modos)
  const [usedFifty, setUsedFifty] = useState(false);
  const [usedAudience, setUsedAudience] = useState(false);
  const [usedSwap, setUsedSwap] = useState(false);
  const [hiddenOptions, setHiddenOptions] = useState(new Set()); // para 50:50
  const [audiencePoll, setAudiencePoll] = useState(null); // { index: percentage }

  // Timer (solo examen)
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);
  const trackedRef = useRef(false);
  const gameStartRef = useRef(0);

  // Instrucciones
  const [showHelp, setShowHelp] = useState(false);

  // --- Cargar rosco ---
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const load = async () => {
      try {
        const data = await getRoscoData(level, grade, asignatura);
        if (cancelled) return;
        setAllWords(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Millonario: error cargando datos', err);
        setAllWords([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [level, grade, asignatura]);

  // --- Iniciar/reiniciar partida ---
  const startGame = useCallback(() => {
    const cfg = MODE_CONFIG[gameMode];
    const qs = generateQuestions(allWords, cfg.questions);
    setQuestions(qs);
    setCurrentIndex(0);
    setStatus('playing');
    setSelectedIndex(null);
    setLives(cfg.lives);
    setMaxReached(0);
    setUsedFifty(false);
    setUsedAudience(false);
    setUsedSwap(false);
    setHiddenOptions(new Set());
    setAudiencePoll(null);
    trackedRef.current = false;
    if (cfg.timer) setTimeLeft(cfg.timer);
    gameStartRef.current = Date.now();
  }, [gameMode, allWords]);

  // --- Al cargar o elegir modo, iniciar partida ---
  useEffect(() => {
    if (!gameMode) return; // pantalla previa: aún no hay partida
    if (!loading && allWords.length >= 4) {
      startGame();
    }
  }, [loading, gameMode, allWords, startGame]);

  // --- Reset comodines visuales al cambiar de pregunta ---
  useEffect(() => {
    setHiddenOptions(new Set());
    setAudiencePoll(null);
    setSelectedIndex(null);
  }, [currentIndex]);

  // --- Timer para modo examen ---
  useEffect(() => {
    const cfg = MODE_CONFIG[gameMode];
    if (!cfg || !cfg.timer || status !== 'playing' || !questions.length) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    setTimeLeft(cfg.timer);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          // Tiempo agotado → tratar como fallo
          setStatus('wrong');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [currentIndex, status, gameMode, questions.length]);

  // --- Responder a una opción ---
  const answer = useCallback((idx) => {
    if (status !== 'playing') return;
    if (hiddenOptions.has(idx)) return;
    setSelectedIndex(idx);
    if (timerRef.current) clearInterval(timerRef.current);

    const current = questions[currentIndex];
    if (!current) return;

    if (idx === current.correctIndex) {
      setStatus('correct');
      setMaxReached((m) => Math.max(m, currentIndex + 1));
    } else {
      setStatus('wrong');
      setLives((l) => l - 1);
    }
  }, [status, hiddenOptions, questions, currentIndex]);

  // --- Avanzar a siguiente pregunta ---
  const nextQuestion = useCallback(() => {
    const cfg = MODE_CONFIG[gameMode];
    // Si se acabó la vida, fin
    if (status === 'wrong' && lives <= 0) {
      setStatus('lost');
      return;
    }
    if (status === 'wrong' && cfg.helps) {
      // En práctica con vidas restantes, permitir seguir en la misma pregunta
      setSelectedIndex(null);
      setStatus('playing');
      return;
    }
    // Si completó todas
    if (currentIndex + 1 >= questions.length) {
      setStatus('won');
      return;
    }
    setCurrentIndex((i) => i + 1);
    setStatus('playing');
    setSelectedIndex(null);
  }, [status, lives, currentIndex, questions.length, gameMode]);

  // --- Confetti y tracking al ganar o perder ---
  useEffect(() => {
    if ((status === 'won' || status === 'lost') && !trackedRef.current) {
      trackedRef.current = true;
      if (status === 'won') {
        confetti({
          particleCount: 240,
          spread: 120,
          origin: { y: 0.5 },
          colors: ['#fbbf24', '#f59e0b', '#10b981', '#3b82f6', '#ec4899'],
        });
      }
      const correct = maxReached;
      const total = questions.length || 1;
      const isExamMode = gameMode === 'exam';
      // Bonus por rapidez en examen: 15s/pregunta de presupuesto
      const elapsedSec = gameStartRef.current
        ? Math.max(1, Math.round((Date.now() - gameStartRef.current) / 1000))
        : 0;
      const TIME_BUDGET = total * 15;
      const SPEED_COEF = 5;
      const timeBonus = isExamMode && elapsedSec > 0
        ? Math.max(0, Math.round((TIME_BUDGET - elapsedSec) * SPEED_COEF))
        : 0;
      const examScore = correct * 100 + (correct >= total ? 100 : 0) + timeBonus;
      onGameComplete?.({
        mode: isExamMode ? 'test' : 'practice',
        score: isExamMode ? examScore : 0,
        maxScore: isExamMode ? total * 100 + 100 + TIME_BUDGET * SPEED_COEF : 0,
        correctAnswers: correct,
        totalQuestions: total,
        durationSeconds: elapsedSec,
      });
    }
  }, [status, maxReached, questions.length, gameMode, onGameComplete]);

  // --- Comodines ---
  const useFifty = useCallback(() => {
    if (usedFifty || status !== 'playing') return;
    const current = questions[currentIndex];
    if (!current) return;
    // Dejar correcta + 1 distractor
    const wrongIndices = [0, 1, 2, 3].filter((i) => i !== current.correctIndex);
    const shuffled = shuffle(wrongIndices);
    const toHide = shuffled.slice(0, 2);
    setHiddenOptions(new Set(toHide));
    setUsedFifty(true);
  }, [usedFifty, status, questions, currentIndex]);

  const useAudience = useCallback(() => {
    if (usedAudience || status !== 'playing') return;
    const current = questions[currentIndex];
    if (!current) return;
    // Generar porcentajes: sesgo a la correcta (~45-70%) + ruido
    const correctPct = 40 + Math.floor(Math.random() * 30);
    let remaining = 100 - correctPct;
    const wrongIndices = [0, 1, 2, 3].filter(
      (i) => i !== current.correctIndex && !hiddenOptions.has(i)
    );
    const poll = {};
    poll[current.correctIndex] = correctPct;
    for (let i = 0; i < wrongIndices.length; i++) {
      if (i === wrongIndices.length - 1) {
        poll[wrongIndices[i]] = remaining;
      } else {
        const p = Math.floor(Math.random() * remaining);
        poll[wrongIndices[i]] = p;
        remaining -= p;
      }
    }
    setAudiencePoll(poll);
    setUsedAudience(true);
  }, [usedAudience, status, questions, currentIndex, hiddenOptions]);

  const useSwap = useCallback(() => {
    if (usedSwap || status !== 'playing') return;
    // Generar una nueva pregunta aleatoria del pool y sustituir la actual
    const cfg = MODE_CONFIG[gameMode];
    const alreadyUsedAnswers = new Set(questions.map((q) => q.correct));
    const pool = allWords.filter(
      (w) => w && w.solucion && w.definicion && !alreadyUsedAnswers.has(String(w.solucion).trim())
    );
    if (pool.length === 0) return;
    const newQs = generateQuestions(pool, 1);
    if (newQs.length === 0) return;
    const updated = [...questions];
    updated[currentIndex] = { ...newQs[0], difficulty: questions[currentIndex].difficulty };
    setQuestions(updated);
    setUsedSwap(true);
    setHiddenOptions(new Set());
    setAudiencePoll(null);
    // Reiniciar timer para la nueva pregunta
    if (cfg.timer) setTimeLeft(cfg.timer);
  }, [usedSwap, status, gameMode, questions, currentIndex, allWords]);

  // --- Auto-avance tras respuesta correcta ---
  useEffect(() => {
    if (status !== 'correct') return;
    const t = setTimeout(() => {
      if (currentIndex + 1 >= questions.length) {
        setStatus('won');
      } else {
        setCurrentIndex((i) => i + 1);
        setStatus('playing');
      }
    }, 1400);
    return () => clearTimeout(t);
  }, [status, currentIndex, questions.length]);

  // --- Datos derivados ---
  const currentQ = questions[currentIndex];
  // En la pantalla previa (gameMode null) se usa la config fácil solo para pintar.
  const cfg = MODE_CONFIG[gameMode] || MODE_CONFIG.easy;
  const prizeLadder = useMemo(() => {
    // Escalar el ladder a la cantidad de preguntas
    const total = cfg.questions;
    // Coger primeros 5, 10 o 15 niveles del ladder clásico
    return PRIZE_LADDER.slice(0, total);
  }, [cfg.questions]);

  const currentPrize = currentIndex < prizeLadder.length ? prizeLadder[currentIndex] : 0;
  const reachedPrize = maxReached > 0 ? prizeLadder[maxReached - 1] : 0;
  // Red de seguridad (solo para medio/examen)
  const safePrize = useMemo(() => {
    if (gameMode === 'easy') return 0;
    let safe = 0;
    for (const level of SAFE_LEVELS) {
      if (maxReached >= level && level <= prizeLadder.length) {
        safe = prizeLadder[level - 1];
      }
    }
    return safe;
  }, [maxReached, gameMode, prizeLadder]);

  const formatMoney = (n) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1)}M €`;
    if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k €`;
    return `${n} €`;
  };

  // Nota sobre 10 (para el modo examen) + puntos paralelos
  const nota = questions.length > 0
    ? Math.round((maxReached / questions.length) * 100) / 10
    : 0;
  const isExamMode = gameMode === 'exam';

  // Volver a la pantalla de modos. El estado vuelve al inicial ('playing') para
  // que, al elegir otro modo, el efecto de tracking no vea el 'won'/'lost' de
  // la partida anterior mientras arranca la nueva.
  const backToModes = () => {
    setStatus('playing');
    setGameMode(null);
  };

  const instructions = (
    <InstructionsModal
      isOpen={showHelp}
      onClose={() => setShowHelp(false)}
      title="Cómo jugar al Millonario"
    >
      <h3>🎯 Objetivo</h3>
      <p>
        Responde correctamente para subir por la <strong>escalera de premios</strong>.
        Cada acierto te hace avanzar un nivel. Un solo fallo te puede hacer perder lo
        ganado... salvo que llegues a las <strong>redes de seguridad</strong>.
      </p>

      <h3>🕹️ Cómo se juega</h3>
      <ul>
        <li>Lee la pregunta (la definición del vocabulario).</li>
        <li>Elige una de las <strong>4 opciones</strong> (A, B, C, D).</li>
        <li>Si aciertas, sumas puntos y avanzas.</li>
        <li>Si fallas en práctica y tienes vidas, puedes continuar.</li>
        <li>En examen solo tienes <strong>1 vida</strong> y <strong>30 segundos por pregunta</strong>.</li>
      </ul>

      <h3>🪄 Comodines (disponibles en TODOS los modos, incluido examen)</h3>
      <ul>
        <li><strong>50:50</strong> — Elimina 2 respuestas incorrectas.</li>
        <li><strong>👥 Público</strong> — Muestra una encuesta orientativa del público.</li>
        <li><strong>🔄 Cambio</strong> — Sustituye la pregunta actual por otra.</li>
      </ul>
      <p>Cada comodín solo se puede usar <strong>una vez por partida</strong>.</p>

      <h3>🎓 Niveles de dificultad</h3>
      <div className="instr-modes">
        <div className="instr-mode easy">
          <strong>🟢 Fácil</strong>
          5 preguntas, 3 vidas, sin tiempo.
        </div>
        <div className="instr-mode medium">
          <strong>🟡 Medio</strong>
          10 preguntas, 2 vidas, red en nivel 5.
        </div>
        <div className="instr-mode exam">
          <strong>🔴 Examen</strong>
          15 preguntas, 1 vida, 30s/pregunta, redes 5 y 10.
        </div>
      </div>

      <div className="instr-tips">
        <strong>💡 Redes de seguridad:</strong> al superar los niveles 5 y 10 en modo medio/examen,
        si fallas después te llevas el último premio asegurado.
      </div>
    </InstructionsModal>
  );

  const shellProps = { accent: '#7c3aed', accent2: '#f59e0b', theme: 'dark', className: 'mil-shell' };

  // --- Render ---
  if (loading) {
    return (
      <GameShell {...shellProps}>
        <GameLoading label="Encendiendo los focos del plató…" />
      </GameShell>
    );
  }

  if (allWords.length < 4) {
    return (
      <GameShell {...shellProps}>
        <GameHeader onHelp={() => setShowHelp(true)} />
        <GameEmpty title="No hay suficientes preguntas">
          Se necesitan al menos 4 palabras con definición en el Rosco de esta asignatura.
        </GameEmpty>
        {instructions}
      </GameShell>
    );
  }

  // --- Pantalla previa: elegir modo ---
  if (!gameMode) {
    const modes = [
      {
        id: 'easy', tone: 'easy', title: 'Fácil',
        desc: 'Cinco preguntas para calentar bajo los focos.',
        features: ['5 preguntas · 3 vidas', 'Sin reloj', `Hasta ${formatMoney(PRIZE_LADDER[4])}`],
      },
      {
        id: 'medium', tone: 'medium', title: 'Medio',
        desc: 'Diez preguntas con redes de seguridad.',
        features: ['10 preguntas · 2 vidas', 'Redes en los niveles 5 y 10', `Hasta ${formatMoney(PRIZE_LADDER[9])}`],
      },
      {
        id: 'exam', tone: 'exam', title: 'Examen',
        desc: 'Quince preguntas, una vida y 30 segundos por pregunta.',
        features: ['Nota sobre 10', '30 s por pregunta', 'A por el millón'],
      },
    ];
    return (
      <GameShell {...shellProps} scene={<MillStudio />}>
        <ModeSelect
          modes={modes}
          onSelect={(id) => setGameMode(id)}
          onHelp={() => setShowHelp(true)}
          footer={(
            <span className="mil-modes-foot">
              <Wand2 size={15} /> Comodines 50:50, Público y Cambio en todos los modos · uno de cada por partida
            </span>
          )}
        />
        {instructions}
      </GameShell>
    );
  }

  const isFinished = status === 'won' || status === 'lost';
  const finalPrize = status === 'won' ? prizeLadder[prizeLadder.length - 1] : Math.max(reachedPrize, safePrize);
  const usedHelps = [usedFifty, usedAudience, usedSwap].filter(Boolean).length;

  // --- Examen terminado: resumen con la nota ---
  if (isFinished && isExamMode) {
    return (
      <GameShell {...shellProps} scene={<MillStudio />}>
        <ResultsScreen
          title={status === 'won' ? '¡Eres millonario!' : 'Examen terminado'}
          subtitle={`Millonario · ${subjectInfo.icon} ${subjectInfo.nombre || 'General'}`}
          nota={nota}
          points={finalPrize}
          pointsLabel="€ de premio · ¡supera tu récord!"
          stats={[
            { icon: Check, tone: 'good', label: 'Aciertos', value: `${maxReached}/${questions.length}` },
            { icon: ShieldCheck, tone: 'accent', label: 'Red de seguridad', value: safePrize > 0 ? formatMoney(safePrize) : '—' },
            { icon: Wand2, tone: 'streak', label: 'Comodines', value: `${usedHelps}/3` },
          ]}
          actions={[
            { label: 'Jugar otra vez', onClick: startGame, icon: RefreshCw },
            { label: 'Cambiar de modo', onClick: backToModes, icon: LayoutGrid, variant: 'soft' },
          ]}
        />
        {instructions}
      </GameShell>
    );
  }

  const showResult = status === 'correct' || status === 'wrong';
  const timedOut = status === 'wrong' && cfg.timer && timeLeft === 0;
  // Texto del botón tras fallar: refleja lo que hará nextQuestion.
  const nextLabel = status === 'wrong' && lives <= 0
    ? 'Ver resultado'
    : status === 'wrong' && cfg.helps
      ? 'Volver a intentarlo'
      : currentIndex + 1 >= questions.length ? 'Ver resultado' : 'Siguiente pregunta';

  const renderOption = (i) => {
    const opt = currentQ.options[i];
    const isHidden = hiddenOptions.has(i);
    const isSelected = selectedIndex === i;
    const isCorrect = i === currentQ.correctIndex;
    const reveal = showResult && isCorrect;
    const wrong = showResult && isSelected && !isCorrect;
    const pollPct = audiencePoll?.[i];
    const state = reveal ? 'correct' : wrong ? 'wrong' : isSelected ? 'selected' : 'idle';
    return (
      <AnswerOption
        key={`${currentIndex}-${i}`}
        letter={OPTION_LETTERS[i]}
        state={state}
        className={`mil-opt ${isHidden ? 'is-hidden' : ''} ${showResult && !reveal && !wrong ? 'is-dim' : ''}`}
        onClick={() => answer(i)}
        disabled={isHidden || status !== 'playing'}
        aria-label={isHidden ? `Opción ${OPTION_LETTERS[i]} eliminada` : `Opción ${OPTION_LETTERS[i]}: ${opt}`}
      >
        <span className="mil-opt__label">{isHidden ? '' : opt}</span>
        {pollPct !== undefined && !isHidden && (
          <span className="mil-poll" aria-label={`Público: ${pollPct}%`}>
            <span className="mil-poll__track">
              <span className="mil-poll__bar" style={{ transform: `scaleX(${pollPct / 100})` }} />
            </span>
            <span className="mil-poll__pct">{pollPct}%</span>
          </span>
        )}
      </AnswerOption>
    );
  };

  return (
    <GameShell {...shellProps} scene={<MillStudio mood={status} />}>
      <GameHeader
        mode={gameMode}
        modeLabel={cfg.label}
        onHelp={() => setShowHelp(true)}
        right={(
          <Hud>
            {cfg.helps && !isFinished && (
              <span className="mil-lives"><Lives total={cfg.lives} left={Math.max(0, lives)} /></span>
            )}
            <HudStat icon={Crown} tone="streak" value={formatMoney(reachedPrize)} label="Premio" />
          </Hud>
        )}
      />

      {/* --- Partida de práctica terminada --- */}
      {isFinished && (
        <motion.div
          className={`mil-finale is-${status}`}
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 170, damping: 18 }}
        >
          <span className="mil-finale__rays" aria-hidden="true" />
          <div className="mil-finale__medal" aria-hidden="true">
            {status === 'won' ? <Crown size={46} /> : <Trophy size={44} />}
          </div>
          <h2 className="mil-finale__title">{status === 'won' ? '¡Eres millonario!' : '¡Partida terminada!'}</h2>
          <div className="mil-cheque">
            <span className="mil-cheque__label"><Coins size={15} /> Te llevas</span>
            <strong className="mil-cheque__amount">{formatMoney(finalPrize)}</strong>
          </div>
          <div className="mil-finale__stats">
            <Chip tone="good" icon={Check}>{maxReached} / {questions.length} correctas</Chip>
            {gameMode !== 'easy' && safePrize > 0 && (
              <Chip tone="soft" icon={Sparkles}>Red de seguridad: {formatMoney(safePrize)}</Chip>
            )}
          </div>
          <div className="mil-finale__actions">
            <GameButton size="lg" icon={RefreshCw} onClick={startGame}>Jugar otra vez</GameButton>
            <GameButton size="lg" variant="soft" icon={LayoutGrid} onClick={backToModes}>Cambiar de modo</GameButton>
          </div>
        </motion.div>
      )}

      {/* --- Plató --- */}
      {!isFinished && currentQ && (
        <div className={`mil-stage is-${status}`}>
          <div className="mil-main">
            <div className="mil-qmeta">
              <span className="mil-qnum">Pregunta <strong>{currentIndex + 1}</strong> de {questions.length}</span>
              <span className="mil-qprize"><Coins size={15} /> {formatMoney(currentPrize)}</span>
            </div>

            {cfg.timer && <MillClock timeLeft={timeLeft} total={cfg.timer} paused={status !== 'playing'} />}

            <AnimatePresence mode="wait">
              <motion.div
                key={`${currentIndex}-${currentQ.question}`}
                className="mil-q"
                initial={{ opacity: 0, scaleX: 0.86 }}
                animate={{ opacity: 1, scaleX: 1 }}
                exit={{ opacity: 0, scaleX: 0.9 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="mil-lozenge">
                  <p className="mil-q__text">{currentQ.question}</p>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="mil-options" role="group" aria-label="Respuestas">
              {[0, 2].map((start) => (
                <div className="mil-row" key={start}>
                  {renderOption(start)}
                  {renderOption(start + 1)}
                </div>
              ))}
            </div>
          </div>

          <aside className="mil-board" aria-label="Comodines y escalera de premios">
            <div className="mil-lifelines">
              <Lifeline used={usedFifty} disabled={usedFifty || status !== 'playing'} onClick={useFifty} label="Mitad" title="50:50 — elimina 2 opciones incorrectas">
                <span className="mil-ll__fifty">50:50</span>
              </Lifeline>
              <Lifeline used={usedAudience} disabled={usedAudience || status !== 'playing'} onClick={useAudience} label="Público" title="Público — consulta al público">
                <Users size={20} />
              </Lifeline>
              <Lifeline used={usedSwap} disabled={usedSwap || status !== 'playing'} onClick={useSwap} label="Cambio" title="Cambio — sustituye la pregunta por otra">
                <Shuffle size={20} />
              </Lifeline>
            </div>

            <div className="mil-ladder-head"><Crown size={14} /> Escalera de premios</div>
            <ol className="mil-ladder">
              {[...prizeLadder].reverse().map((prize, idx) => {
                const level = prizeLadder.length - idx; // 1-based
                const isCurrent = level === currentIndex + 1 && status === 'playing';
                const isWon = level <= maxReached;
                const isSafe = SAFE_LEVELS.includes(level) && gameMode !== 'easy';
                const isNear = Math.abs(level - (currentIndex + 1)) <= 2;
                return (
                  <li
                    key={level}
                    className={[
                      'mil-rung',
                      isCurrent && 'is-current',
                      isWon && 'is-won',
                      isSafe && 'is-safe',
                      isNear && 'is-near',
                      level === prizeLadder.length && 'is-top',
                    ].filter(Boolean).join(' ')}
                  >
                    {isCurrent && (
                      <motion.span layoutId="mil-rung-hl" className="mil-rung__hl" transition={{ type: 'spring', stiffness: 320, damping: 30 }} />
                    )}
                    <span className="mil-rung__num">{level}</span>
                    <span className="mil-rung__amount">{formatMoney(prize)}</span>
                    <span className="mil-rung__mark">
                      {isWon ? <Check size={13} strokeWidth={3} /> : isSafe ? <Sparkles size={12} /> : null}
                    </span>
                  </li>
                );
              })}
            </ol>
            {gameMode === 'exam' && (
              <div className="mil-ladder-note">
                <Zap size={12} /> Red: niveles 5 y 10
              </div>
            )}
          </aside>
        </div>
      )}

      <RoundBanner
        show={!isFinished && showResult}
        status={status === 'correct' ? 'won' : 'lost'}
        title={status === 'correct' ? '¡Correcto!' : timedOut ? '¡Se acabó el tiempo!' : 'Incorrecto'}
        subtitle={status === 'correct'
          ? `+${formatMoney(currentPrize)} · ${currentIndex + 1 < questions.length ? 'subes un peldaño' : '¡última pregunta superada!'}`
          : <>La respuesta correcta era <strong>{currentQ?.correct}</strong></>}
        action={status === 'wrong' ? nextQuestion : undefined}
        actionLabel={nextLabel}
      />

      {!isFinished && (
        <div className="mil-footer">
          {!isExamMode ? (
            <GameButton variant="soft" size="sm" icon={LayoutGrid} onClick={backToModes}>
              Cambiar modo
            </GameButton>
          ) : (
            <span className="mil-footer__info">
              <GraduationCap size={14} /> Modo examen · 1 vida · 30 s por pregunta
            </span>
          )}
          <span className="mil-footer__info mil-footer__subject">
            {subjectInfo.icon} {subjectInfo.nombre || 'General'}
          </span>
        </div>
      )}

      {instructions}
    </GameShell>
  );
};

// Decorado del plató: focos cenitales, suelo brillante y destellos. Estático
// salvo el leve vaivén de los focos con nivel de efectos alto.
const MillStudio = ({ mood }) => (
  <div className={`mil-studio ${mood ? `is-${mood}` : ''}`} aria-hidden="true">
    <span className="mil-studio__beam mil-studio__beam--l" />
    <span className="mil-studio__beam mil-studio__beam--r" />
    <span className="mil-studio__floor" />
    <span className="mil-studio__flash" />
    {[0, 1, 2, 3, 4, 5].map((i) => <span key={i} className={`mil-studio__star s${i}`} />)}
  </div>
);

// Comodín: medallón ovalado de esmalte con aro dorado. Usado → aspa roja.
const Lifeline = ({ used, disabled, onClick, label, title, children }) => (
  <button
    type="button"
    className={`mil-ll ${used ? 'is-used' : ''}`}
    onClick={onClick}
    disabled={disabled}
    title={title}
    aria-label={title}
  >
    <span className="mil-ll__medal">
      {children}
      {used && <span className="mil-ll__x" aria-hidden="true" />}
    </span>
    <span className="mil-ll__label">{label}</span>
  </button>
);

// Reloj del examen: aro que se vacía segundo a segundo (sin transición: un
// salto por segundo) con el número en el centro.
const MillClock = ({ timeLeft, total, paused }) => {
  const r = 26;
  const c = 2 * Math.PI * r;
  const pct = total ? Math.max(0, Math.min(1, timeLeft / total)) : 0;
  const danger = timeLeft <= 10;
  return (
    <div className={`mil-clock ${danger ? 'is-danger' : ''} ${paused ? 'is-paused' : ''}`} role="timer" aria-label={`${timeLeft} segundos`}>
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r={r} className="mil-clock__track" />
        <circle
          cx="32" cy="32" r={r}
          className="mil-clock__arc"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          transform="rotate(-90 32 32)"
        />
      </svg>
      <span key={timeLeft} className="mil-clock__num">{timeLeft}</span>
    </div>
  );
};

export default Millonario;
