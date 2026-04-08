// src/apps/ahorcado/Ahorcado.jsx
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Heart, RefreshCw, BookOpen, Type, AlignLeft, Lightbulb, Trophy, Skull,
  GraduationCap, Gamepad2, Check, X, Award, ArrowRight
} from 'lucide-react';
import { getRoscoData, getOrdenaFrasesData } from '../../services/gameDataService';
import materiasData from '../../../public/data/materias.json';
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

  const [gameMode, setGameMode] = useState('practice'); // 'practice' | 'exam'
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

  const trackedRef = useRef(false);
  const examTrackedRef = useRef(false);

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
    if (loading) return;
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
    setExamResults((prev) => [...prev, result]);
  }, [status, gameMode, current, fails, guessed]);

  // --- Tracking al terminar (XP) en modo práctica ---
  useEffect(() => {
    if (gameMode !== 'practice') return;
    if ((status === 'won' || status === 'lost') && !trackedRef.current) {
      trackedRef.current = true;
      const total = lettersNeeded.size || 1;
      const hits = Array.from(lettersNeeded).filter((l) => guessed.has(l)).length;
      onGameComplete?.({
        mode: 'practice',
        score: status === 'won' ? (MAX_FAILS - fails) * 100 : hits * 10,
        maxScore: MAX_FAILS * 100,
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

  // --- Tracking al terminar el examen completo ---
  useEffect(() => {
    if (!examFinished || examTrackedRef.current) return;
    if (examResults.length < EXAM_QUESTIONS) return;
    examTrackedRef.current = true;
    const correct = examResults.filter((r) => r.won).length;
    onGameComplete?.({
      mode: 'test',
      score: correct * 100,
      maxScore: EXAM_QUESTIONS * 100,
      correctAnswers: correct,
      totalQuestions: EXAM_QUESTIONS,
      durationSeconds: 0,
    });
    if (examScore >= 8) {
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#a855f7', '#ec4899', '#fbbf24', '#10b981', '#3b82f6'],
      });
    }
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
      if (examFinished) return;
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
  }, [handleGuess, continuar, status, examFinished]);

  // --- Render del texto oculto ---
  const renderHidden = () => {
    if (!current) return null;
    const original = current.texto;
    const norm = normalize(original);
    const reveal = status !== 'playing';

    const words = original.split(/(\s+)/);
    let idx = 0;
    return (
      <div className="ahorcado-palabra">
        {words.map((word, wi) => {
          if (/^\s+$/.test(word)) {
            idx += word.length;
            return <span key={wi} className="ahorcado-espacio">&nbsp;</span>;
          }
          return (
            <span key={wi} className="ahorcado-word">
              {Array.from(word).map((ch, ci) => {
                const originalChar = ch;
                const normChar = norm[idx];
                idx++;
                const isLetter = /[A-ZÑ]/.test(normChar);
                const revealed = reveal || !isLetter || guessed.has(normChar);
                return (
                  <span
                    key={ci}
                    className={`ahorcado-letra ${revealed ? 'revealed' : ''} ${
                      !isLetter ? 'is-punct' : ''
                    }`}
                  >
                    {revealed ? originalChar : ''}
                    {isLetter && <span className="ahorcado-underline" />}
                  </span>
                );
              })}
            </span>
          );
        })}
      </div>
    );
  };

  // --- Render del ahorcado SVG ---
  const renderHangman = () => {
    const parts = [
      <line key="base" x1="10" y1="140" x2="110" y2="140" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />,
      <line key="poste" x1="30" y1="140" x2="30" y2="20" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />,
      <line key="travesano" x1="30" y1="20" x2="85" y2="20" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />,
      <line key="cuerda" x1="85" y1="20" x2="85" y2="35" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />,
    ];
    const body = [
      <circle key="cabeza" cx="85" cy="45" r="10" stroke="currentColor" strokeWidth="3" fill="none" />,
      <line key="torso" x1="85" y1="55" x2="85" y2="90" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />,
      <line key="brazoI" x1="85" y1="65" x2="70" y2="80" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />,
      <line key="brazoD" x1="85" y1="65" x2="100" y2="80" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />,
      <line key="piernaI" x1="85" y1="90" x2="72" y2="110" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />,
      <line key="piernaD" x1="85" y1="90" x2="98" y2="110" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />,
    ];
    return (
      <svg viewBox="0 0 120 150" className="ahorcado-svg" aria-label="Ahorcado">
        {parts}
        {body.slice(0, fails).map((el, i) => (
          <motion.g
            key={i}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {el}
          </motion.g>
        ))}
      </svg>
    );
  };

  // --- Estado: cargando ---
  if (loading) {
    return (
      <div className="ahorcado-root">
        <div className="ahorcado-card">
          <div className="ahorcado-loading">Cargando juego...</div>
        </div>
      </div>
    );
  }

  // --- Estado: sin contenido ---
  const currentPool = mode === 'frase' ? frases : palabras;
  const examPoolEmpty = palabras.length === 0 && frases.length === 0;
  if ((gameMode === 'practice' && (!currentPool || currentPool.length === 0)) ||
      (gameMode === 'exam' && examPoolEmpty)) {
    return (
      <div className="ahorcado-root">
        <div className="ahorcado-card">
          <div className="ahorcado-title">
            <span>🎯</span> Ahorcado
          </div>
          <div className="ahorcado-empty">
            <p>No hay {mode === 'frase' ? 'frases' : 'palabras'} disponibles para esta asignatura.</p>
            {mode === 'frase' && palabras.length > 0 && gameMode === 'practice' && (
              <button className="ahorcado-btn primary" onClick={() => setMode('palabra')}>
                Probar con palabras
              </button>
            )}
            {mode === 'palabra' && frases.length > 0 && gameMode === 'practice' && (
              <button className="ahorcado-btn primary" onClick={() => setMode('frase')}>
                Probar con frases
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- Estado: examen finalizado ---
  if (gameMode === 'exam' && examFinished) {
    const correctCount = examResults.filter((r) => r.won).length;
    const notaColor = examScore >= 8 ? 'excellent' : examScore >= 5 ? 'good' : 'fail';
    const mensaje = examScore >= 9 ? '¡Excelente! 🌟'
      : examScore >= 7 ? '¡Muy bien! 👏'
      : examScore >= 5 ? 'Aprobado. Sigue practicando 💪'
      : 'Necesitas repasar más 📖';

    return (
      <div className="ahorcado-root">
        <motion.div
          className="ahorcado-card ahorcado-exam-summary"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="ahorcado-summary-header">
            <Award size={36} className="ahorcado-summary-icon" />
            <div>
              <h2 className="ahorcado-summary-title">Examen terminado</h2>
              <p className="ahorcado-summary-subtitle">{subjectInfo.icon} {subjectInfo.nombre}</p>
            </div>
          </div>

          <div className={`ahorcado-nota ${notaColor}`}>
            <div className="ahorcado-nota-big">
              {examScore.toFixed(1)}
              <span className="ahorcado-nota-small">/10</span>
            </div>
            <div className="ahorcado-nota-msg">
              <strong>{mensaje}</strong>
              <small>{correctCount} de {EXAM_QUESTIONS} preguntas correctas</small>
            </div>
          </div>

          <div className="ahorcado-feedback-title">Retroalimentación:</div>
          <div className="ahorcado-feedback-list">
            {examResults.map((r, i) => (
              <motion.div
                key={i}
                className={`ahorcado-feedback-item ${r.won ? 'ok' : 'ko'}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <div className="ahorcado-feedback-num">{i + 1}</div>
                <div className="ahorcado-feedback-body">
                  <div className="ahorcado-feedback-meta">
                    {r.question.sourceMode === 'frase' ? (
                      <span className="ahorcado-feedback-tag frase">
                        <AlignLeft size={12} /> Frase
                      </span>
                    ) : (
                      <span className="ahorcado-feedback-tag palabra">
                        <Type size={12} /> Palabra
                      </span>
                    )}
                    {r.won ? (
                      <span className="ahorcado-feedback-state ok">
                        <Check size={14} /> Correcta
                      </span>
                    ) : (
                      <span className="ahorcado-feedback-state ko">
                        <X size={14} /> Incorrecta
                      </span>
                    )}
                  </div>
                  <div className="ahorcado-feedback-text">
                    <strong>Solución:</strong> {r.question.texto}
                  </div>
                  {r.question.pista && (
                    <div className="ahorcado-feedback-pista">
                      💡 {r.question.pista}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="ahorcado-summary-actions">
            <button className="ahorcado-btn primary" onClick={startExam}>
              <RefreshCw size={16} /> Otro examen
            </button>
            <button className="ahorcado-btn ghost" onClick={() => setGameMode('practice')}>
              <Gamepad2 size={16} /> Volver a práctica
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const vidasRestantes = MAX_FAILS - fails;
  const isExam = gameMode === 'exam';
  const sourceLabel = current?.sourceMode === 'frase' ? 'frase' : 'palabra';

  return (
    <div className="ahorcado-root">
      <motion.div
        className="ahorcado-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="ahorcado-header">
          <div className="ahorcado-title">
            <span className="ahorcado-emoji">🎯</span>
            <span>Ahorcado</span>
          </div>
          <div className="ahorcado-stats">
            {!isExam ? (
              <>
                <div className="ahorcado-stat wins" title="Victorias">
                  <Trophy size={16} />
                  <span>{wins}</span>
                </div>
                <div className="ahorcado-stat losses" title="Derrotas">
                  <Skull size={16} />
                  <span>{losses}</span>
                </div>
              </>
            ) : (
              <div className="ahorcado-stat exam" title="Progreso del examen">
                <GraduationCap size={16} />
                <span>{Math.min(examIndex + 1, EXAM_QUESTIONS)}/{EXAM_QUESTIONS}</span>
              </div>
            )}
          </div>
        </div>

        {/* Tabs práctica / examen */}
        <div className="ahorcado-gamemode-tabs">
          <button
            className={`ahorcado-gamemode-tab ${!isExam ? 'active' : ''}`}
            onClick={() => setGameMode('practice')}
          >
            <Gamepad2 size={16} /> Práctica
          </button>
          <button
            className={`ahorcado-gamemode-tab ${isExam ? 'active' : ''}`}
            onClick={() => setGameMode('exam')}
          >
            <GraduationCap size={16} /> Examen
          </button>
        </div>

        {/* Selector palabra/frase (solo en práctica) */}
        {!isExam && (
          <div className="ahorcado-mode-switch">
            <button
              className={`ahorcado-mode-btn ${mode === 'palabra' ? 'active' : ''}`}
              onClick={() => setMode('palabra')}
            >
              <Type size={16} /> Palabra
            </button>
            <button
              className={`ahorcado-mode-btn ${mode === 'frase' ? 'active' : ''}`}
              onClick={() => setMode('frase')}
              disabled={frases.length === 0}
            >
              <AlignLeft size={16} /> Frase
            </button>
          </div>
        )}

        {/* Barra de progreso del examen */}
        {isExam && (
          <div className="ahorcado-exam-progress">
            {examQuestions.map((_, i) => {
              const result = examResults[i];
              return (
                <div
                  key={i}
                  className={`ahorcado-progress-dot ${
                    result ? (result.won ? 'ok' : 'ko') : i === examIndex ? 'current' : 'pending'
                  }`}
                >
                  {result ? (result.won ? <Check size={12} /> : <X size={12} />) : i + 1}
                </div>
              );
            })}
          </div>
        )}

        {/* Cuerpo principal */}
        <div className="ahorcado-main">
          <div className="ahorcado-left">
            <div className="ahorcado-hangman-wrap">{renderHangman()}</div>
            <div className="ahorcado-vidas">
              {Array.from({ length: MAX_FAILS }).map((_, i) => (
                <Heart
                  key={i}
                  size={20}
                  className={i < vidasRestantes ? 'vida on' : 'vida off'}
                  fill={i < vidasRestantes ? 'currentColor' : 'none'}
                />
              ))}
            </div>
          </div>

          <div className="ahorcado-right">
            {/* Tema / tipo */}
            {current && (
              <div className="ahorcado-tema-row">
                <span className={`ahorcado-tag ${sourceLabel}`}>
                  {sourceLabel === 'frase' ? <AlignLeft size={12} /> : <Type size={12} />}
                  {sourceLabel === 'frase' ? 'Frase' : 'Palabra'}
                </span>
                {current.tema && (
                  <span className="ahorcado-tema-tag">
                    <BookOpen size={12} /> Tema: {subjectInfo.icon} {current.tema}
                  </span>
                )}
              </div>
            )}

            {/* Texto oculto */}
            <AnimatePresence mode="wait">
              <motion.div
                key={current?.texto || 'none'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="ahorcado-texto-wrap"
              >
                {renderHidden()}
              </motion.div>
            </AnimatePresence>

            {/* Pista (oculta en examen) */}
            {!isExam && current?.pista && (
              <div className="ahorcado-pista-wrap">
                {!showHint ? (
                  <button className="ahorcado-pista-btn" onClick={() => setShowHint(true)}>
                    <Lightbulb size={16} /> Ver pista
                  </button>
                ) : (
                  <motion.div
                    className="ahorcado-pista"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <Lightbulb size={16} />
                    <span>{current.pista}</span>
                  </motion.div>
                )}
              </div>
            )}

            {/* Teclado */}
            <div className="ahorcado-keyboard">
              {ALPHABET.map((letra) => {
                const L = normalize(letra);
                const used = guessed.has(L);
                const correct = used && lettersNeeded.has(L);
                const wrong = used && !lettersNeeded.has(L);
                return (
                  <motion.button
                    key={letra}
                    whileTap={{ scale: 0.9 }}
                    className={`ahorcado-key ${correct ? 'correct' : ''} ${wrong ? 'wrong' : ''}`}
                    onClick={() => handleGuess(letra)}
                    disabled={used || status !== 'playing'}
                  >
                    {letra}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Resultado de ronda */}
        <AnimatePresence>
          {status !== 'playing' && !examFinished && (
            <motion.div
              className={`ahorcado-result ${status}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="ahorcado-result-text">
                {status === 'won' ? (
                  <>
                    <span>🎉 ¡Enhorabuena!</span>
                    <small>Has adivinado la {sourceLabel}</small>
                  </>
                ) : (
                  <>
                    <span>💀 ¡Te han ahorcado!</span>
                    <small>La solución era: <strong>{current?.texto}</strong></small>
                  </>
                )}
              </div>
              <button className="ahorcado-btn primary" onClick={continuar}>
                {isExam && examIndex + 1 < EXAM_QUESTIONS ? (
                  <>
                    <ArrowRight size={16} /> Siguiente pregunta
                  </>
                ) : isExam ? (
                  <>
                    <Award size={16} /> Ver resultado
                  </>
                ) : (
                  <>
                    <RefreshCw size={16} /> Nueva partida
                  </>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        {status === 'playing' && (
          <div className="ahorcado-footer">
            {!isExam ? (
              <button className="ahorcado-btn ghost" onClick={continuar}>
                <RefreshCw size={14} /> Saltar
              </button>
            ) : (
              <div className="ahorcado-info">
                <GraduationCap size={14} />
                <span>Modo examen · Sin pistas ni saltos</span>
              </div>
            )}
            {!isExam && (
              <div className="ahorcado-info">
                <BookOpen size={14} />
                <span>
                  {currentPool.length} {mode === 'frase' ? 'frases' : 'palabras'} disponibles
                </span>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Ahorcado;
