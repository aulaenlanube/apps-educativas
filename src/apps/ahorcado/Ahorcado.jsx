// src/apps/ahorcado/Ahorcado.jsx
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  RefreshCw, BookOpen, Type, AlignLeft, Lightbulb, Trophy, Skull,
  GraduationCap, Award, ArrowRight, LayoutGrid, Target, Clock,
} from 'lucide-react';
import { getRoscoData, getOrdenaFrasesData } from '../../services/gameDataService';
import materiasData from '../../../public/data/materias.json';
import InstructionsModal from '../_shared/InstructionsModal';
import {
  GameShell, GameHeader, Hud, HudStat, Lives, ProgressDots, Panel, Chip, KeyTile,
  GameButton, ModeSelect, RoundBanner, ResultsScreen, FeedbackItem, GameLoading, GameEmpty,
} from '../_shared/kit';
import './Ahorcado.css';

const MAX_FAILS = 6; // cabeza, torso, brazo izq, brazo der, pierna izq, pierna der
const ALPHABET = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');
const EXAM_QUESTIONS = 5;

// Quitar tildes y poner en mayúsculas — el ahorcado compara sin acentos
const normalize = (s) =>
  String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();

// Obtener nombre y icono de la materia desde materias.json
const getSubjectInfo = (level, grade, subjectId) => {
  if (!level || !grade || !subjectId) return { nombre: '', icon: '📚' };
  const nivel = materiasData?.[level];
  const curso = nivel?.[String(grade)];
  if (!Array.isArray(curso)) return { nombre: '', icon: '📚' };
  const found = curso.find((m) => m.id === subjectId);
  if (!found) return { nombre: '', icon: '📚' };
  return { nombre: found.nombre || '', icon: found.icon || '📚' };
};

const Ahorcado = ({ onGameComplete }) => {
  const { level, grade: gradeParam, subjectId } = useParams();
  const grade = useMemo(() => parseInt(gradeParam, 10), [gradeParam]);
  const asignatura = subjectId || (level === 'primaria' ? 'lengua' : 'general');

  const subjectInfo = useMemo(
    () => getSubjectInfo(level, grade, asignatura),
    [level, grade, asignatura]
  );

  // null = pantalla previa de modos (CLAUDE.md §3: el modo se elige ANTES de jugar)
  const [gameMode, setGameMode] = useState(null); // null | 'practice' | 'exam'
  const [mode, setMode] = useState('palabra'); // 'palabra' | 'frase' (solo en practice)
  const [palabras, setPalabras] = useState([]);
  const [frases, setFrases] = useState([]);
  const [loading, setLoading] = useState(true);

  const [current, setCurrent] = useState(null); // { texto, pista, tema, sourceMode }
  const [guessed, setGuessed] = useState(new Set());
  const [fails, setFails] = useState(0);
  const [status, setStatus] = useState('playing'); // 'playing' | 'won' | 'lost'
  const [showHint, setShowHint] = useState(false);
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);

  // Estado específico del examen
  const [examQuestions, setExamQuestions] = useState([]); // [{texto, pista, tema, sourceMode}]
  const [examIndex, setExamIndex] = useState(0);
  const [examResults, setExamResults] = useState([]); // [{question, won, fails, guessed}]
  const [examFinished, setExamFinished] = useState(false);

  // Instrucciones
  const [showHelp, setShowHelp] = useState(false);

  const trackedRef = useRef(false);
  const examTrackedRef = useRef(false);
  const examStartRef = useRef(null);
  // Refs vivos para poder registrar el examen aunque el alumno se vaya a mitad.
  const examResultsRef = useRef([]);
  const examModeRef = useRef(false);
  const onGameCompleteRef = useRef(onGameComplete);
  useEffect(() => { onGameCompleteRef.current = onGameComplete; }, [onGameComplete]);

  // --- Cargar datos (rosco y frases) ---
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const safeFetch = (fn) =>
      Promise.resolve()
        .then(() => fn())
        .catch((err) => {
          console.error('Ahorcado: error cargando datos', err);
          return [];
        });

    const load = async () => {
      try {
        const [roscoData, frasesData] = await Promise.all([
          safeFetch(() => getRoscoData(level, grade, asignatura)),
          safeFetch(() => getOrdenaFrasesData(level, grade, asignatura)),
        ]);
        if (cancelled) return;

        const temaBase = subjectInfo.nombre || 'General';

        const palabrasLimpias = Array.isArray(roscoData)
          ? roscoData
              .filter((it) => it && it.solucion && String(it.solucion).trim().length >= 2)
              .map((it) => ({
                texto: String(it.solucion).trim(),
                pista: it.definicion || null,
                tema: temaBase,
              }))
          : [];

        const frasesLimpias = Array.isArray(frasesData)
          ? frasesData
              .filter((f) => typeof f === 'string' && f.trim().length > 0)
              .map((f) => ({
                texto: f.trim(),
                pista: null,
                tema: temaBase,
              }))
          : [];

        setPalabras(palabrasLimpias);
        setFrases(frasesLimpias);
      } catch (err) {
        console.error('Ahorcado: fallo inesperado cargando datos', err);
        if (!cancelled) {
          setPalabras([]);
          setFrases([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [level, grade, asignatura, subjectInfo.nombre]);

  // --- Elegir item aleatorio ---
  const pickRandom = useCallback(
    (sourceMode) => {
      const pool = sourceMode === 'frase' ? frases : palabras;
      if (!pool || pool.length === 0) return null;
      const idx = Math.floor(Math.random() * pool.length);
      return { ...pool[idx], sourceMode };
    },
    [palabras, frases]
  );

  // --- Generar 5 preguntas para el examen (mezcla palabra/frase) ---
  const generateExamQuestions = useCallback(() => {
    const questions = [];
    const hayPalabras = palabras.length > 0;
    const hayFrases = frases.length > 0;
    if (!hayPalabras && !hayFrases) return [];

    for (let i = 0; i < EXAM_QUESTIONS; i++) {
      let src;
      if (hayPalabras && hayFrases) {
        src = Math.random() < 0.5 ? 'palabra' : 'frase';
      } else if (hayPalabras) {
        src = 'palabra';
      } else {
        src = 'frase';
      }
      const pool = src === 'frase' ? frases : palabras;
      const idx = Math.floor(Math.random() * pool.length);
      questions.push({ ...pool[idx], sourceMode: src });
    }
    return questions;
  }, [palabras, frases]);

  // --- Nueva partida (modo práctica) ---
  const newPracticeRound = useCallback(() => {
    const item = pickRandom(mode);
    setCurrent(item);
    setGuessed(new Set());
    setFails(0);
    setStatus('playing');
    setShowHint(false);
    trackedRef.current = false;
  }, [mode, pickRandom]);

  // --- Iniciar / reiniciar examen ---
  const startExam = useCallback(() => {
    const questions = generateExamQuestions();
    setExamQuestions(questions);
    setExamIndex(0);
    setExamResults([]);
    setExamFinished(false);
    examTrackedRef.current = false;
    examStartRef.current = Date.now();
    if (questions.length > 0) {
      setCurrent(questions[0]);
      setGuessed(new Set());
      setFails(0);
      setStatus('playing');
      setShowHint(false);
      trackedRef.current = false;
    }
  }, [generateExamQuestions]);

  // --- Avanzar a la siguiente pregunta del examen ---
  const nextExamQuestion = useCallback(() => {
    const nextIdx = examIndex + 1;
    if (nextIdx >= examQuestions.length) {
      setExamFinished(true);
      return;
    }
    setExamIndex(nextIdx);
    setCurrent(examQuestions[nextIdx]);
    setGuessed(new Set());
    setFails(0);
    setStatus('playing');
    setShowHint(false);
    trackedRef.current = false;
  }, [examIndex, examQuestions]);

  // --- Al cargar datos o cambiar modo/tipo, iniciar ronda ---
  useEffect(() => {
    if (loading || !gameMode) return;
    if (gameMode === 'practice') {
      newPracticeRound();
    } else {
      startExam();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, gameMode, mode]);

  // --- Letras necesarias ---
  const lettersNeeded = useMemo(() => {
    if (!current) return new Set();
    const norm = normalize(current.texto);
    return new Set(Array.from(norm).filter((c) => /[A-ZÑ]/.test(c)));
  }, [current]);

  // --- Detectar victoria ---
  useEffect(() => {
    if (!current || status !== 'playing') return;
    const allFound = Array.from(lettersNeeded).every((l) => guessed.has(l));
    if (allFound && lettersNeeded.size > 0) {
      setStatus('won');
      if (gameMode === 'practice') {
        setWins((w) => w + 1);
      }
      confetti({
        particleCount: gameMode === 'exam' ? 80 : 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#a855f7', '#ec4899', '#fbbf24', '#10b981'],
      });
    }
  }, [guessed, current, lettersNeeded, status, gameMode]);

  // --- Detectar derrota ---
  useEffect(() => {
    if (status === 'playing' && fails >= MAX_FAILS) {
      setStatus('lost');
      if (gameMode === 'practice') {
        setLosses((l) => l + 1);
      }
    }
  }, [fails, status, gameMode]);

  // --- Al terminar una ronda en examen, guardar resultado ---
  useEffect(() => {
    if (gameMode !== 'exam') return;
    if (status !== 'won' && status !== 'lost') return;
    if (trackedRef.current) return;
    trackedRef.current = true;

    const result = {
      question: current,
      won: status === 'won',
      fails,
      guessed: new Set(guessed),
    };
    setExamResults((prev) => {
      const next = [...prev, result];
      examResultsRef.current = next;
      return next;
    });
  }, [status, gameMode, current, fails, guessed]);

  // Refs sincronizados para el tracking al salir.
  useEffect(() => { examResultsRef.current = examResults; }, [examResults]);
  useEffect(() => { examModeRef.current = gameMode === 'exam'; }, [gameMode]);

  // Si el alumno abandona el examen sin terminar las 5 preguntas, registramos
  // lo que lleva para que la tarea pueda subir nota (cada pregunta fallada o
  // no contestada cuenta como 0).
  useEffect(() => {
    return () => {
      if (examTrackedRef.current) return;
      if (!examModeRef.current) return;
      const results = examResultsRef.current;
      if (!results || results.length === 0) return;
      examTrackedRef.current = true;
      const correct = results.filter(r => r.won).length;
      const nota = Math.round((correct / EXAM_QUESTIONS) * 10 * 10) / 10;
      const elapsed = examStartRef.current
        ? Math.round((Date.now() - examStartRef.current) / 1000)
        : 0;
      onGameCompleteRef.current?.({
        mode: 'test',
        score: correct * 100,
        maxScore: EXAM_QUESTIONS * 100,
        correctAnswers: correct,
        totalQuestions: EXAM_QUESTIONS,
        durationSeconds: elapsed,
        nota,
      });
    };
  }, []);

  // --- Tracking al terminar (XP) en modo práctica ---
  useEffect(() => {
    if (gameMode !== 'practice') return;
    if ((status === 'won' || status === 'lost') && !trackedRef.current) {
      trackedRef.current = true;
      const total = lettersNeeded.size || 1;
      const hits = Array.from(lettersNeeded).filter((l) => guessed.has(l)).length;
      onGameComplete?.({
        mode: 'practice',
        score: 0,
        maxScore: 0,
        correctAnswers: hits,
        totalQuestions: total,
        durationSeconds: 0,
      });
    }
  }, [status, fails, guessed, lettersNeeded, onGameComplete, gameMode]);

  // --- Nota del examen (0-10) ---
  const examScore = useMemo(() => {
    if (examResults.length === 0) return 0;
    const correct = examResults.filter((r) => r.won).length;
    return Math.round((correct / EXAM_QUESTIONS) * 10 * 10) / 10; // 1 decimal
  }, [examResults]);

  // --- Puntos paralelos del examen ---
  const examElapsed = useMemo(() => {
    if (!examFinished || !examStartRef.current) return 0;
    return Math.round((Date.now() - examStartRef.current) / 1000);
  }, [examFinished]);

  const examPoints = useMemo(() => {
    if (examResults.length === 0) return 0;
    // Base: 100 por acierto
    const base = examResults.filter((r) => r.won).length * 100;
    // Bonus vidas: 30 por vida sobrante por pregunta
    const vidasBonus = examResults.reduce((acc, r) => acc + (r.won ? (MAX_FAILS - r.fails) * 30 : 0), 0);
    // Bonus tiempo: max 300, proporcional (referencia: 120s para 5 preguntas)
    const refTime = EXAM_QUESTIONS * 24;
    const elapsed = examStartRef.current ? Math.round((Date.now() - examStartRef.current) / 1000) : refTime;
    const timeBonus = Math.max(0, Math.round(300 * (1 - elapsed / refTime)));
    return base + vidasBonus + timeBonus;
  }, [examResults]);

  // --- Tracking al terminar el examen completo ---
  useEffect(() => {
    if (!examFinished || examTrackedRef.current) return;
    if (examResults.length < EXAM_QUESTIONS) return;
    examTrackedRef.current = true;
    const correct = examResults.filter((r) => r.won).length;
    // eslint-disable-next-line no-unused-vars -- variable preexistente, se deja intacta
    const elapsed = examStartRef.current ? Math.round((Date.now() - examStartRef.current) / 1000) : 0;
    onGameComplete?.({
      mode: 'test',
      score: examPoints,
      maxScore: EXAM_QUESTIONS * 100 + EXAM_QUESTIONS * MAX_FAILS * 30 + 300,
      correctAnswers: correct,
      totalQuestions: EXAM_QUESTIONS,
      durationSeconds: examElapsed,
    });
    if (examScore >= 8) {
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#a855f7', '#ec4899', '#fbbf24', '#10b981', '#3b82f6'],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deps originales (no tocar tracking)
  }, [examFinished, examResults, examScore, onGameComplete]);

  // --- Pulsar una letra ---
  const handleGuess = useCallback(
    (letra) => {
      if (status !== 'playing' || !current) return;
      const L = normalize(letra);
      if (guessed.has(L)) return;

      const next = new Set(guessed);
      next.add(L);
      setGuessed(next);

      if (!lettersNeeded.has(L)) {
        setFails((f) => f + 1);
      }
    },
    [guessed, lettersNeeded, current, status]
  );

  // --- Continuar (siguiente ronda o siguiente pregunta del examen) ---
  const continuar = useCallback(() => {
    if (gameMode === 'exam') {
      nextExamQuestion();
    } else {
      newPracticeRound();
    }
  }, [gameMode, nextExamQuestion, newPracticeRound]);

  // --- Teclado físico ---
  useEffect(() => {
    const handler = (e) => {
      if (!gameMode || examFinished) return;
      if (status !== 'playing') {
        if (e.key === 'Enter' || e.key === ' ') continuar();
        return;
      }
      const key = e.key;
      if (key.length === 1 && /[a-zA-ZñÑáéíóúÁÉÍÓÚ]/.test(key)) {
        handleGuess(key);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleGuess, continuar, status, examFinished, gameMode]);

  // --- Render del texto oculto: una ficha por letra ---
  const renderHidden = () => {
    if (!current) return null;
    const original = current.texto;
    const norm = normalize(original);
    const reveal = status !== 'playing';

    const words = original.split(/(\s+)/);
    let idx = 0;
    return (
      <div className={`ahc-word ${original.length > 22 ? 'is-long' : ''}`}>
        {words.map((word, wi) => {
          if (/^\s+$/.test(word)) {
            idx += word.length;
            return <span key={wi} className="ahc-gap" />;
          }
          return (
            <span key={wi} className="ahc-word__group">
              {Array.from(word).map((ch, ci) => {
                const normChar = norm[idx];
                idx++;
                const isLetter = /[A-ZÑ]/.test(normChar);
                const revealed = reveal || !isLetter || guessed.has(normChar);
                const missed = reveal && isLetter && !guessed.has(normChar);
                return (
                  <span
                    key={ci}
                    className={`ahc-tile ${revealed ? 'is-revealed' : ''} ${!isLetter ? 'is-punct' : ''} ${missed ? 'is-missed' : ''}`}
                  >
                    {revealed ? ch : ''}
                  </span>
                );
              })}
            </span>
          );
        })}
      </div>
    );
  };

  // --- Instrucciones (compartidas por la pantalla previa y el juego) ---
  const instructions = (
    <InstructionsModal
      isOpen={showHelp}
      onClose={() => setShowHelp(false)}
      title="Cómo jugar al Ahorcado"
    >
      <h3>🎯 Objetivo</h3>
      <p>
        Adivina la <strong>palabra</strong> o <strong>frase</strong> oculta letra a letra antes
        de que el muñeco quede completamente dibujado (6 fallos permitidos).
      </p>

      <h3>🕹️ Cómo se juega</h3>
      <ul>
        <li>Pulsa una letra del teclado en pantalla <em>o</em> escribe con el teclado físico.</li>
        <li>Si la letra está en la palabra, se revela en su posición.</li>
        <li>Si falla, pierdes una vida y se añade una parte al muñeco.</li>
        <li>Elige <strong>Palabras</strong>, <strong>Frases</strong> o <strong>Examen</strong> antes de empezar.</li>
        <li>En modo frase verás el <strong>tema</strong> (asignatura) para que sepas de qué va.</li>
      </ul>

      <h3>🎓 Modos de juego</h3>
      <div className="instr-modes">
        <div className="instr-mode easy">
          <strong>Palabras</strong>
          Rondas infinitas. Puedes pedir pista, saltar y ver el contador.
        </div>
        <div className="instr-mode medium">
          <strong>Frases</strong>
          Mismo juego con una frase completa y el tema visible siempre.
        </div>
        <div className="instr-mode exam">
          <strong>Examen</strong>
          5 preguntas mixtas. Al final recibes nota sobre 10 y feedback de cada una.
        </div>
      </div>

      <div className="instr-tips">
        <strong>💡 Consejos:</strong> empieza por las vocales (A, E, O) y consonantes frecuentes
        (S, R, N, L). En modo palabra puedes pulsar <kbd>💡 Ver pista</kbd> para leer la definición.
      </div>
    </InstructionsModal>
  );

  const shellProps = { accent: '#f97316', accent2: '#ec4899' };

  // --- Estado: cargando ---
  if (loading) {
    return (
      <GameShell {...shellProps}>
        <GameLoading label="Preparando palabras…" />
      </GameShell>
    );
  }

  // --- Sin ningún contenido para esta asignatura ---
  if (palabras.length === 0 && frases.length === 0) {
    return (
      <GameShell {...shellProps}>
        <GameHeader onHelp={() => setShowHelp(true)} />
        <GameEmpty title="Aún no hay palabras">
          No hay palabras ni frases disponibles para esta asignatura todavía.
        </GameEmpty>
        {instructions}
      </GameShell>
    );
  }

  // --- Pantalla previa: elegir modo ---
  if (!gameMode) {
    const modes = [
      palabras.length > 0 && {
        id: 'palabra', tone: 'easy', icon: Type, title: 'Palabras',
        desc: 'Adivina palabras del temario con su definición como pista.',
        features: ['Pista con la definición', `${palabras.length} palabras`],
      },
      frases.length > 0 && {
        id: 'frase', tone: 'medium', icon: AlignLeft, title: 'Frases',
        desc: 'Frases completas del temario: más letras, más reto.',
        features: ['Tema siempre visible', `${frases.length} frases`],
      },
      {
        id: 'exam', tone: 'exam', title: 'Examen',
        desc: 'Cinco retos mezclados, sin pistas ni saltos.',
        features: ['Nota sobre 10', 'Puntos por vidas y rapidez'],
      },
    ].filter(Boolean);
    const selectMode = (id) => {
      if (id === 'exam') { setGameMode('exam'); return; }
      setMode(id);
      setGameMode('practice');
    };
    return (
      <GameShell {...shellProps}>
        <ModeSelect modes={modes} onSelect={selectMode} onHelp={() => setShowHelp(true)} />
        {instructions}
      </GameShell>
    );
  }

  // --- Estado: examen finalizado ---
  if (gameMode === 'exam' && examFinished) {
    const correctCount = examResults.filter((r) => r.won).length;
    const livesKept = examResults.reduce((acc, r) => acc + (r.won ? MAX_FAILS - r.fails : 0), 0);
    return (
      <GameShell {...shellProps}>
        <ResultsScreen
          subtitle={`Ahorcado · ${subjectInfo.icon} ${subjectInfo.nombre}`}
          nota={examScore}
          points={examPoints}
          stats={[
            { icon: Target, tone: 'good', label: 'Aciertos', value: `${correctCount}/${EXAM_QUESTIONS}` },
            { icon: Trophy, tone: 'lives', label: 'Vidas salvadas', value: livesKept },
            { icon: Clock, tone: 'time', label: 'Tiempo', value: `${examElapsed}s` },
          ]}
          actions={[
            { label: 'Otro examen', onClick: startExam, icon: RefreshCw },
            { label: 'Cambiar de modo', onClick: () => setGameMode(null), icon: LayoutGrid, variant: 'soft' },
          ]}
        >
          {examResults.map((r, i) => (
            <FeedbackItem
              key={i}
              index={i + 1}
              ok={r.won}
              title={r.question.texto}
            >
              {r.question.sourceMode === 'frase' ? 'Frase' : 'Palabra'}
              {r.question.pista ? ` · 💡 ${r.question.pista}` : ''}
            </FeedbackItem>
          ))}
        </ResultsScreen>
      </GameShell>
    );
  }

  const vidasRestantes = MAX_FAILS - fails;
  const isExam = gameMode === 'exam';
  const sourceLabel = current?.sourceMode === 'frase' ? 'frase' : 'palabra';
  const currentPool = mode === 'frase' ? frases : palabras;

  return (
    <GameShell {...shellProps}>
      <GameHeader
        mode={isExam ? 'exam' : mode === 'frase' ? 'medium' : 'easy'}
        modeLabel={isExam ? 'Examen' : mode === 'frase' ? 'Frases' : 'Palabras'}
        onHelp={() => setShowHelp(true)}
        right={
          <Hud>
            {!isExam ? (
              <>
                <HudStat icon={Trophy} tone="good" value={wins} label="Ganadas" />
                <HudStat icon={Skull} tone="bad" value={losses} label="Perdidas" />
              </>
            ) : (
              <HudStat icon={GraduationCap} tone="progress" value={`${Math.min(examIndex + 1, EXAM_QUESTIONS)}/${EXAM_QUESTIONS}`} label="Pregunta" />
            )}
          </Hud>
        }
      />

      {isExam && (
        <ProgressDots
          total={EXAM_QUESTIONS}
          current={examIndex}
          results={examResults.map((r) => r.won)}
        />
      )}

      <div className="ahc-stage">
        <Panel variant="surface" className={`ahc-gallows is-${status}`}>
          <motion.div
            key={fails}
            className="ahc-gallows__art"
            animate={{ x: fails === 0 ? 0 : [0, -6, 6, -3, 3, 0] }}
            transition={{ duration: 0.4 }}
          >
            <HangmanArt fails={fails} status={status} />
          </motion.div>
          <Lives total={MAX_FAILS} left={vidasRestantes} />
        </Panel>

        <div className="ahc-play">
          {current && (
            <div className="ahc-tags">
              <Chip tone="accent" icon={sourceLabel === 'frase' ? AlignLeft : Type}>
                {sourceLabel === 'frase' ? 'Frase' : 'Palabra'}
              </Chip>
              {current.tema && (
                <Chip icon={BookOpen}>Tema: {subjectInfo.icon} {current.tema}</Chip>
              )}
            </div>
          )}

          <Panel variant="screen" className={`ahc-board is-${status}`}>
            <AnimatePresence mode="wait">
              <motion.div
                key={current?.texto || 'none'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.28 }}
              >
                {renderHidden()}
              </motion.div>
            </AnimatePresence>
          </Panel>

          {!isExam && current?.pista && (
            <div className="ahc-hint">
              {!showHint ? (
                <GameButton variant="warning" size="sm" icon={Lightbulb} onClick={() => setShowHint(true)}>
                  Ver pista
                </GameButton>
              ) : (
                <motion.div className="ahc-hint__box" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
                  <Lightbulb size={18} />
                  <span>{current.pista}</span>
                </motion.div>
              )}
            </div>
          )}

          <div className="ahc-keyboard" role="group" aria-label="Teclado">
            {ALPHABET.map((letra) => {
              const L = normalize(letra);
              const used = guessed.has(L);
              const state = used ? (lettersNeeded.has(L) ? 'correct' : 'wrong') : 'idle';
              return (
                <KeyTile
                  key={letra}
                  state={state}
                  onClick={() => handleGuess(letra)}
                  disabled={used || status !== 'playing'}
                  aria-label={`Letra ${letra}`}
                >
                  {letra}
                </KeyTile>
              );
            })}
          </div>
        </div>
      </div>

      <RoundBanner
        show={status !== 'playing' && !examFinished}
        status={status === 'won' ? 'won' : 'lost'}
        title={status === 'won' ? '¡Enhorabuena!' : '¡Te han ahorcado!'}
        subtitle={status === 'won'
          ? `Has adivinado la ${sourceLabel}.`
          : <>La solución era: <strong>{current?.texto}</strong></>}
        action={continuar}
        actionLabel={isExam && examIndex + 1 < EXAM_QUESTIONS ? 'Siguiente pregunta' : isExam ? 'Ver resultado' : 'Nueva partida'}
        actionIcon={isExam && examIndex + 1 >= EXAM_QUESTIONS ? Award : isExam ? ArrowRight : RefreshCw}
      />

      {status === 'playing' && (
        <div className="ahc-footer">
          {!isExam ? (
            <>
              <GameButton variant="soft" size="sm" icon={LayoutGrid} onClick={() => setGameMode(null)}>
                Cambiar modo
              </GameButton>
              <GameButton variant="ghost" size="sm" icon={RefreshCw} onClick={continuar}>
                Saltar
              </GameButton>
              <span className="ahc-footer__info">
                <BookOpen size={14} /> {currentPool.length} {mode === 'frase' ? 'frases' : 'palabras'} disponibles
              </span>
            </>
          ) : (
            <span className="ahc-footer__info">
              <GraduationCap size={14} /> Modo examen · sin pistas ni saltos
            </span>
          )}
        </div>
      )}

      {instructions}
    </GameShell>
  );
};

// Escena del ahorcado: horca de madera sobre una colina y un muñeco amable que
// aparece pieza a pieza (cabeza, cuerpo, brazos, piernas). Sin filtros SVG.
const HangmanArt = ({ fails, status }) => {
  const lost = status === 'lost';
  const won = status === 'won';
  const parts = [
    // cabeza
    <g key="head">
      <circle cx="96" cy="62" r="15" fill="url(#ahc-skin)" />
      <circle cx="96" cy="62" r="15" fill="none" stroke="#b45309" strokeOpacity=".35" strokeWidth="1.5" />
      <ellipse cx="91" cy="56" rx="5" ry="3.4" fill="#fff" opacity=".55" />
      {lost ? (
        <g stroke="#7c2d12" strokeWidth="2.2" strokeLinecap="round">
          <path d="M88 58 l5 5 M93 58 l-5 5 M99 58 l5 5 M104 58 l-5 5" />
          <path d="M90 70 q6 -4 12 0" fill="none" />
        </g>
      ) : (
        <g>
          <circle cx="90.5" cy="61" r="2.3" fill="#1e1b4b" />
          <circle cx="101.5" cy="61" r="2.3" fill="#1e1b4b" />
          <circle cx="91.3" cy="60.2" r=".8" fill="#fff" />
          <circle cx="102.3" cy="60.2" r=".8" fill="#fff" />
          <path d={won ? 'M89 67 q7 7 14 0' : fails >= 4 ? 'M90 70 q6 -4 12 0' : 'M90 68 q6 4 12 0'} stroke="#7c2d12" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <ellipse cx="86" cy="67" rx="3" ry="1.8" fill="#fb7185" opacity=".5" />
          <ellipse cx="106" cy="67" rx="3" ry="1.8" fill="#fb7185" opacity=".5" />
        </g>
      )}
    </g>,
    // cuerpo (camiseta)
    <path key="torso" d="M83 82 q13 -6 26 0 l3 30 q-16 6 -32 0 Z" fill="url(#ahc-shirt)" />,
    <path key="armL" d="M85 86 q-12 8 -16 22" stroke="url(#ahc-shirt)" strokeWidth="8" strokeLinecap="round" fill="none" />,
    <path key="armR" d="M107 86 q12 8 16 22" stroke="url(#ahc-shirt)" strokeWidth="8" strokeLinecap="round" fill="none" />,
    <path key="legL" d="M89 111 l-6 26" stroke="#3730a3" strokeWidth="8.5" strokeLinecap="round" />,
    <path key="legR" d="M103 111 l6 26" stroke="#3730a3" strokeWidth="8.5" strokeLinecap="round" />,
  ];
  return (
    <svg viewBox="0 0 160 170" className="ahc-art" aria-label={`Ahorcado: ${fails} fallos de ${MAX_FAILS}`}>
      <defs>
        <linearGradient id="ahc-wood" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#b45309" />
          <stop offset=".45" stopColor="#d97706" />
          <stop offset="1" stopColor="#92400e" />
        </linearGradient>
        <linearGradient id="ahc-wood-h" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f59e0b" />
          <stop offset="1" stopColor="#92400e" />
        </linearGradient>
        <linearGradient id="ahc-hill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#86efac" />
          <stop offset="1" stopColor="#16a34a" />
        </linearGradient>
        <radialGradient id="ahc-skin" cx=".38" cy=".32" r=".75">
          <stop offset="0" stopColor="#fde7c8" />
          <stop offset=".7" stopColor="#f6c08f" />
          <stop offset="1" stopColor="#e8a46a" />
        </radialGradient>
        <linearGradient id="ahc-shirt" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#a78bfa" />
          <stop offset="1" stopColor="#6d28d9" />
        </linearGradient>
        <radialGradient id="ahc-sun" cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor={won ? '#fde68a' : lost ? '#fecaca' : '#e0e7ff'} />
          <stop offset="1" stopColor={won ? '#fde68a' : lost ? '#fecaca' : '#e0e7ff'} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="122" cy="40" r="34" fill="url(#ahc-sun)" />
      <path d="M0 152 Q50 132 100 146 T160 140 V170 H0 Z" fill="url(#ahc-hill)" />
      <path d="M0 152 Q50 132 100 146 T160 140" stroke="#fff" strokeOpacity=".5" strokeWidth="2" fill="none" />
      {/* horca */}
      <rect x="14" y="146" width="76" height="9" rx="4" fill="url(#ahc-wood-h)" />
      <rect x="30" y="18" width="10" height="132" rx="3" fill="url(#ahc-wood)" />
      <rect x="31.5" y="22" width="2.4" height="124" rx="1.2" fill="#fde68a" opacity=".5" />
      <rect x="28" y="14" width="78" height="10" rx="4" fill="url(#ahc-wood-h)" />
      <path d="M40 38 L58 24" stroke="url(#ahc-wood)" strokeWidth="6" strokeLinecap="round" />
      <path d="M96 24 v22" stroke="#a16207" strokeWidth="3" strokeLinecap="round" strokeDasharray="3 2" />
      {parts.slice(0, fails).map((el, i) => (
        <motion.g
          key={i}
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 320, damping: 16 }}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        >
          {el}
        </motion.g>
      ))}
    </svg>
  );
};

export default Ahorcado;
