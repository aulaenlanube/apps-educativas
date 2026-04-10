// src/apps/criptograma/Criptograma.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Lock, Unlock, RefreshCw, Lightbulb, Eye, Timer, Award, Trophy,
  Gamepad2, GraduationCap, Star, BarChart3, Eraser, Check, X,
} from 'lucide-react';
import { getRoscoData, getOrdenaFrasesData } from '../../services/gameDataService';
import { generateCipherMap, encryptText, getUniqueLetters, SPANISH_FREQ } from './cipherGenerator';
import materiasData from '../../../public/data/materias.json';
import InstructionsModal, { InstructionsButton } from '../_shared/InstructionsModal';
import './Criptograma.css';

const normalize = (s) =>
  String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();

const MODE_CONFIG = {
  easy: {
    label: 'Fácil', icon: '🟢', source: 'word',
    helps: { reveal: 3, freq: true, check: true },
    revealVowels: true, timer: null,
  },
  medium: {
    label: 'Medio', icon: '🟡', source: 'phrase_short',
    helps: { reveal: 2, freq: true, check: true },
    revealVowels: false, timer: null,
  },
  exam: {
    label: 'Examen', icon: '🔴', source: 'phrase_long',
    helps: { reveal: 1, freq: false, check: false },
    revealVowels: false, timer: 300, // 5 minutos
  },
};

const VOWELS = new Set(['A', 'E', 'I', 'O', 'U']);

const getSubjectInfo = (level, grade, subjectId) => {
  if (!level || !grade || !subjectId) return { nombre: '', icon: '📚' };
  const curso = materiasData?.[level]?.[String(grade)];
  if (!Array.isArray(curso)) return { nombre: '', icon: '📚' };
  return curso.find((m) => m.id === subjectId) || { nombre: '', icon: '📚' };
};

const Criptograma = ({ onGameComplete }) => {
  const { level, grade: gradeParam, subjectId } = useParams();
  const grade = useMemo(() => parseInt(gradeParam, 10), [gradeParam]);
  const asignatura = subjectId || (level === 'primaria' ? 'lengua' : 'general');
  const subjectInfo = useMemo(() => getSubjectInfo(level, grade, asignatura), [level, grade, asignatura]);

  const [palabras, setPalabras] = useState([]);
  const [frases, setFrases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gameMode, setGameMode] = useState('easy');

  // Puzzle
  const [cipherMap, setCipherMap] = useState(null);
  const [encrypted, setEncrypted] = useState([]);
  const [originalText, setOriginalText] = useState('');
  const [hint, setHint] = useState('');
  const [guesses, setGuesses] = useState({}); // code → guessedLetter
  const [selectedCode, setSelectedCode] = useState(null);
  const [lockedCodes, setLockedCodes] = useState(new Set()); // códigos revelados (no editables)
  const [wrongCodes, setWrongCodes] = useState(new Set());
  const [completed, setCompleted] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [showFreq, setShowFreq] = useState(false);

  // Timer + score
  const [timer, setTimer] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);
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
          ? rosco.filter((it) => it?.solucion && it?.definicion).map((it) => ({
              text: String(it.solucion).trim(),
              hint: String(it.definicion).trim(),
            }))
          : [];
        const phrases = Array.isArray(frasesData)
          ? frasesData.filter((f) => typeof f === 'string' && f.trim().length > 10).map((f) => ({
              text: f.trim(),
              hint: '',
            }))
          : [];
        setPalabras(words);
        setFrases(phrases);
      } catch (err) {
        console.error('Criptograma: error cargando datos', err);
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
    let pool;
    if (cfg.source === 'word') {
      pool = palabras.length > 0 ? palabras : frases;
    } else if (cfg.source === 'phrase_short') {
      const shortPhrases = frases.filter((f) => f.text.length <= 60);
      pool = shortPhrases.length >= 3 ? shortPhrases : frases.length > 0 ? frases : palabras;
    } else {
      const longPhrases = frases.filter((f) => f.text.length > 30);
      pool = longPhrases.length >= 3 ? longPhrases : frases.length > 0 ? frases : palabras;
    }
    if (pool.length === 0) return;

    const pick = pool[Math.floor(Math.random() * pool.length)];
    const map = generateCipherMap();
    const enc = encryptText(pick.text, map.letterToCode);

    setCipherMap(map);
    setEncrypted(enc);
    setOriginalText(pick.text);
    setHint(pick.hint);
    setSelectedCode(null);
    setCompleted(false);
    setWrongCodes(new Set());
    trackedRef.current = false;
    setHintsUsed(0);
    setTimer(0);
    setShowFreq(false);

    // Vocales reveladas en fácil
    const initGuesses = {};
    const initLocked = new Set();
    if (cfg.revealVowels) {
      const norm = normalize(pick.text);
      const usedVowels = new Set(Array.from(norm).filter((c) => VOWELS.has(c)));
      usedVowels.forEach((v) => {
        const code = map.letterToCode[v];
        initGuesses[code] = v;
        initLocked.add(code);
      });
    }
    setGuesses(initGuesses);
    setLockedCodes(initLocked);
    if (cfg.timer) setTimeLeft(cfg.timer);
  }, [gameMode, palabras, frases]);

  useEffect(() => {
    if (!loading && (palabras.length > 0 || frases.length > 0)) generatePuzzle();
  }, [loading, gameMode, generatePuzzle]);

  // --- Timer (examen) ---
  useEffect(() => {
    const cfg = MODE_CONFIG[gameMode];
    if (!encrypted.length || completed) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setTimer((t) => t + 1);
      if (cfg.timer) {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            setCompleted(true); // se acabó el tiempo
            return 0;
          }
          return t - 1;
        });
      }
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [encrypted.length, completed, gameMode]);

  // --- Códigos únicos que aparecen en el texto ---
  const uniqueCodes = useMemo(() => {
    const codes = new Set();
    encrypted.forEach((ch) => { if (ch.code) codes.add(ch.code); });
    return Array.from(codes).sort((a, b) => a - b);
  }, [encrypted]);

  // --- Comprobar victoria ---
  const isAllCorrect = useMemo(() => {
    if (!cipherMap || uniqueCodes.length === 0) return false;
    return uniqueCodes.every((code) => {
      const guess = guesses[code];
      return guess && guess === cipherMap.codeToLetter[code];
    });
  }, [guesses, uniqueCodes, cipherMap]);

  useEffect(() => {
    if (isAllCorrect && !completed && encrypted.length > 0) {
      setCompleted(true);
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#10b981', '#a855f7', '#fbbf24', '#3b82f6', '#ec4899'],
      });
    }
  }, [isAllCorrect, completed, encrypted.length]);

  // --- XP tracking ---
  const totalLetters = uniqueCodes.length;
  const correctCount = uniqueCodes.filter((c) => guesses[c] === cipherMap?.codeToLetter[c]).length;
  const nota = totalLetters > 0 ? Math.round((correctCount / totalLetters) * 100) / 10 : 0;
  const baseScore = correctCount * 100;
  const refTime = MODE_CONFIG[gameMode].timer || 180;
  const timeBonus = Math.max(0, Math.round(300 * (1 - timer / refTime)));
  const noHintsBonus = hintsUsed === 0 ? 100 : 0;
  const finalScore = baseScore + timeBonus + noHintsBonus;

  useEffect(() => {
    if (!completed || trackedRef.current) return;
    trackedRef.current = true;
    const isExamMode = gameMode === 'exam';
    onGameComplete?.({
      mode: isExamMode ? 'test' : 'practice',
      score: isExamMode ? finalScore : 0,
      maxScore: isExamMode ? totalLetters * 100 + 400 : 0,
      correctAnswers: correctCount,
      totalQuestions: totalLetters,
      durationSeconds: timer,
    });
  }, [completed, finalScore, totalLetters, correctCount, timer, gameMode, onGameComplete]);

  // --- Asignar letra a un código ---
  const assignLetter = useCallback((letter) => {
    if (!selectedCode || completed || lockedCodes.has(selectedCode)) return;
    const L = normalize(letter);
    if (!/^[A-ZÑ]$/.test(L)) return;
    setGuesses((prev) => ({ ...prev, [selectedCode]: L }));
    setWrongCodes((prev) => {
      const next = new Set(prev);
      next.delete(selectedCode);
      return next;
    });
    // Auto-avanzar al siguiente código no resuelto
    const idx = uniqueCodes.indexOf(selectedCode);
    for (let i = 1; i <= uniqueCodes.length; i++) {
      const nextCode = uniqueCodes[(idx + i) % uniqueCodes.length];
      if (!lockedCodes.has(nextCode) && !guesses[nextCode]) {
        setSelectedCode(nextCode);
        return;
      }
    }
  }, [selectedCode, completed, lockedCodes, uniqueCodes, guesses]);

  const clearGuess = useCallback(() => {
    if (!selectedCode || lockedCodes.has(selectedCode)) return;
    setGuesses((prev) => {
      const next = { ...prev };
      delete next[selectedCode];
      return next;
    });
  }, [selectedCode, lockedCodes]);

  // --- Teclado físico ---
  useEffect(() => {
    const handler = (e) => {
      if (completed || showHelp) return;
      if (e.key === 'Backspace' || e.key === 'Delete') { e.preventDefault(); clearGuess(); return; }
      if (e.key === 'Escape') { setSelectedCode(null); return; }
      if (e.key.length === 1 && /[a-zA-ZñÑ]/.test(e.key)) {
        e.preventDefault();
        assignLetter(e.key);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [assignLetter, clearGuess, completed, showHelp]);

  // --- Ayudas ---
  const cfg = MODE_CONFIG[gameMode];

  const revealLetter = useCallback(() => {
    if (!cipherMap || cfg.helps.reveal <= hintsUsed - (lockedCodes.size - (cfg.revealVowels ? new Set(Array.from(normalize(originalText)).filter(c => VOWELS.has(c))).size : 0))) return;
    // Revelar un código no adivinado al azar
    const pending = uniqueCodes.filter((c) => !lockedCodes.has(c) && guesses[c] !== cipherMap.codeToLetter[c]);
    if (pending.length === 0) return;
    const code = pending[Math.floor(Math.random() * pending.length)];
    const letter = cipherMap.codeToLetter[code];
    setGuesses((prev) => ({ ...prev, [code]: letter }));
    setLockedCodes((prev) => new Set(prev).add(code));
    setHintsUsed((h) => h + 1);
  }, [cipherMap, cfg, hintsUsed, lockedCodes, uniqueCodes, guesses, originalText]);

  const checkAnswers = useCallback(() => {
    if (!cipherMap || !cfg.helps.check) return;
    const wrong = new Set();
    uniqueCodes.forEach((code) => {
      const guess = guesses[code];
      if (guess && guess !== cipherMap.codeToLetter[code]) {
        wrong.add(code);
      }
    });
    setWrongCodes(wrong);
    setHintsUsed((h) => h + 1);
  }, [cipherMap, cfg, uniqueCodes, guesses]);

  // --- Formato tiempo ---
  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  // --- Nota visual ---
  const notaColor = nota >= 8 ? 'excellent' : nota >= 5 ? 'good' : 'fail';
  const notaMsg = nota >= 9 ? '¡Excelente! 🌟'
    : nota >= 7 ? '¡Muy bien! 👏'
    : nota >= 5 ? 'Aprobado. Sigue practicando 💪'
    : 'Necesitas repasar más 📖';

  // --- Render ---
  if (loading) {
    return <div className="cripto-root"><div className="cripto-card"><div className="cripto-loading">Cargando criptograma...</div></div></div>;
  }

  if (palabras.length === 0 && frases.length === 0) {
    return (
      <div className="cripto-root"><div className="cripto-card">
        <div className="cripto-title"><span>🔐</span> Criptograma</div>
        <div className="cripto-empty"><p>No hay suficientes datos disponibles para esta asignatura.</p></div>
      </div></div>
    );
  }

  const isExam = gameMode === 'exam';

  return (
    <div className="cripto-root">
      <motion.div className="cripto-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        {/* Header */}
        <div className="cripto-header">
          <div className="cripto-title">
            <span className="cripto-emoji">🔐</span>
            <span>Criptograma</span>
            <InstructionsButton onClick={() => setShowHelp(true)} />
          </div>
          <div className="cripto-stats">
            {cfg.timer && !completed && (
              <div className={`cripto-stat timer ${timeLeft <= 30 ? 'danger' : ''}`}>
                <Timer size={14} /> <span>{formatTime(timeLeft)}</span>
              </div>
            )}
            {!cfg.timer && (
              <div className="cripto-stat timer">
                <Timer size={14} /> <span>{formatTime(timer)}</span>
              </div>
            )}
            <div className="cripto-stat progress">
              <Unlock size={14} />
              <span>{correctCount}/{totalLetters}</span>
            </div>
          </div>
        </div>

        <div className="cripto-subtitle">{subjectInfo.icon} {subjectInfo.nombre || 'General'}</div>

        {/* Tabs modo */}
        <div className="cripto-gamemode-tabs">
          {Object.entries(MODE_CONFIG).map(([key, c]) => (
            <button key={key} className={`cripto-gamemode-tab ${gameMode === key ? 'active' : ''} ${key}`} onClick={() => setGameMode(key)}>
              <span>{c.icon}</span>
              <span className="cripto-tab-label">{c.label}</span>
              <span className="cripto-tab-sub">{c.source === 'word' ? 'Palabra' : 'Frase'}</span>
            </button>
          ))}
        </div>

        {/* Pista */}
        {hint && !isExam && (
          <div className="cripto-hint">
            <Lightbulb size={16} /> <span>{hint}</span>
          </div>
        )}

        {/* Texto cifrado */}
        <div className="cripto-text-wrap">
          <div className="cripto-text">
            {encrypted.map((ch, i) => {
              if (!ch.isLetter) {
                return (
                  <span key={i} className="cripto-char punct">
                    <span className="cripto-char-top">&nbsp;</span>
                    <span className="cripto-char-bottom">{ch.original}</span>
                  </span>
                );
              }
              const guess = guesses[ch.code];
              const isCorrect = completed && guess === ch.normalized;
              const isWrong = wrongCodes.has(ch.code);
              const isLocked = lockedCodes.has(ch.code);
              const isSelected = selectedCode === ch.code;
              const isSameGuess = selectedCode && guesses[selectedCode] && guess === guesses[selectedCode] && !isSelected;
              return (
                <span
                  key={i}
                  className={`cripto-char letter ${isSelected ? 'selected' : ''} ${
                    isSameGuess ? 'same-guess' : ''
                  } ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''} ${
                    isLocked ? 'locked' : ''
                  } ${guess ? 'filled' : ''}`}
                  onClick={() => !completed && !isLocked && setSelectedCode(ch.code)}
                >
                  <span className="cripto-char-top">{ch.code}</span>
                  <span className="cripto-char-bottom">
                    {guess || (completed ? ch.normalized : '_')}
                  </span>
                </span>
              );
            })}
          </div>
        </div>

        {/* Teclado on-screen */}
        {!completed && (
          <div className="cripto-keyboard">
            {'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('').map((letter) => {
              // Comprobar si esa letra ya está asignada a algún código
              const usedByCode = Object.entries(guesses).find(([, v]) => v === letter);
              const isUsed = !!usedByCode;
              return (
                <motion.button
                  key={letter}
                  className={`cripto-key ${isUsed ? 'used' : ''}`}
                  onClick={() => assignLetter(letter)}
                  whileTap={{ scale: 0.9 }}
                  disabled={completed}
                >
                  {letter}
                </motion.button>
              );
            })}
            <motion.button className="cripto-key erase" onClick={clearGuess} whileTap={{ scale: 0.9 }}>
              <Eraser size={16} />
            </motion.button>
          </div>
        )}

        {/* Ayudas */}
        {!completed && (
          <div className="cripto-lifelines">
            <button className="cripto-lifeline" onClick={revealLetter} disabled={cfg.helps.reveal <= 0} title="Revelar una letra al azar">
              <Eye size={16} /> <span>Revelar</span>
              {cfg.helps.reveal > 0 && <span className="cripto-lifeline-count">{Math.max(0, cfg.helps.reveal - hintsUsed)}</span>}
            </button>
            {cfg.helps.freq && (
              <button className="cripto-lifeline" onClick={() => setShowFreq((f) => !f)} title="Tabla de frecuencias del español">
                <BarChart3 size={16} /> <span>Frecuencias</span>
              </button>
            )}
            {cfg.helps.check && (
              <button className="cripto-lifeline" onClick={checkAnswers} title="Marcar letras incorrectas">
                <Check size={16} /> <span>Comprobar</span>
              </button>
            )}
            <button className="cripto-lifeline ghost" onClick={generatePuzzle}>
              <RefreshCw size={16} /> <span>Nuevo</span>
            </button>
          </div>
        )}

        {/* Tabla de frecuencias */}
        <AnimatePresence>
          {showFreq && !completed && (
            <motion.div className="cripto-freq" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
              <div className="cripto-freq-title"><BarChart3 size={14} /> Frecuencia de letras en español</div>
              <div className="cripto-freq-grid">
                {Object.entries(SPANISH_FREQ).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([letter, pct]) => (
                  <div key={letter} className="cripto-freq-item">
                    <span className="cripto-freq-letter">{letter}</span>
                    <div className="cripto-freq-bar" style={{ width: `${(pct / 14) * 100}%` }} />
                    <span className="cripto-freq-pct">{pct}%</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Resultado */}
        <AnimatePresence>
          {completed && (
            <motion.div
              className={`cripto-result ${isAllCorrect ? 'won' : 'lost'}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="cripto-result-icon">
                {isAllCorrect ? <Unlock size={48} /> : <Lock size={48} />}
              </div>
              <h2 className="cripto-result-title">
                {isAllCorrect ? '¡Descifrado! 🎉' : 'Tiempo agotado'}
              </h2>

              {isExam && (
                <>
                  <div className={`cripto-nota ${notaColor}`}>
                    <div className="cripto-nota-big">{nota.toFixed(1)}<span className="cripto-nota-small">/10</span></div>
                    <div className="cripto-nota-msg">{notaMsg}</div>
                  </div>
                  <div className="cripto-result-record">
                    <Star size={14} />
                    <span>{finalScore.toLocaleString('es-ES')}</span>
                    <span className="cripto-result-record-label">puntos · ¡supérate!</span>
                  </div>
                </>
              )}

              {!isExam && (
                <div className="cripto-result-score">
                  <Star size={14} /> {finalScore.toLocaleString('es-ES')} puntos
                </div>
              )}

              <div className="cripto-result-stats">
                <div className="cripto-result-stat"><Check size={14} /> {correctCount}/{totalLetters} letras</div>
                <div className="cripto-result-stat"><Timer size={14} /> {formatTime(timer)}</div>
                {hintsUsed > 0 && <div className="cripto-result-stat"><Lightbulb size={14} /> {hintsUsed} ayudas</div>}
              </div>
              <button className="cripto-btn primary" onClick={generatePuzzle}>
                <RefreshCw size={16} /> Otro criptograma
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <InstructionsModal isOpen={showHelp} onClose={() => setShowHelp(false)} title="Cómo jugar al Criptograma">
        <h3>🎯 Objetivo</h3>
        <p>Cada letra de la frase ha sido sustituida por un <strong>número secreto</strong>. Tu misión es descubrir qué letra se esconde detrás de cada número.</p>

        <h3>🕹️ Cómo se juega</h3>
        <ul>
          <li><strong>Click en un número</strong> del texto cifrado para seleccionarlo.</li>
          <li><strong>Escribe o pulsa la letra</strong> que creas que corresponde.</li>
          <li>Todas las apariciones del mismo número se actualizan a la vez.</li>
          <li>Cada letra solo puede usarse para UN número (si la reasignas, el anterior se queda vacío).</li>
          <li>Usa <kbd>⌫</kbd> o el botón de borrador para limpiar una asignación.</li>
        </ul>

        <h3>💡 Pistas para descifrar</h3>
        <ul>
          <li>Busca <strong>palabras de 1-2 letras</strong>: "a", "y", "de", "el", "la"...</li>
          <li>Las letras más frecuentes en español son <strong>E, A, O, S, R, N</strong>.</li>
          <li>Los patrones de letras dobles (LL, RR, CC) son muy reveladores.</li>
          <li>Usa la tabla de <strong>Frecuencias</strong> como referencia.</li>
        </ul>

        <h3>🎓 Modos de juego</h3>
        <div className="instr-modes">
          <div className="instr-mode easy"><strong>🟢 Fácil</strong>Palabra sola. Vocales reveladas. 3 reveals + frecuencias + comprobar.</div>
          <div className="instr-mode medium"><strong>🟡 Medio</strong>Frase corta. Sin vocales. 2 reveals + frecuencias + comprobar.</div>
          <div className="instr-mode exam"><strong>🔴 Examen</strong>Frase larga. 5 min. 1 reveal. Sin frecuencias ni comprobar.</div>
        </div>

        <div className="instr-tips"><strong>💡 Consejo:</strong> empieza por las letras más repetidas en el texto; probablemente sean E, A u O.</div>
      </InstructionsModal>
    </div>
  );
};

export default Criptograma;
