// src/apps/criptograma/Criptograma.jsx
// Rediseño 2026 sobre el kit de interfaz de juego (_shared/kit): pantalla previa
// de modos, visor de caja fuerte con el mensaje cifrado (número arriba, letra
// abajo), teclado del kit, comodines y resumen con la nota /10. La generación,
// la puntuación y el tracking no cambian.
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Lock, Unlock, RefreshCw, Lightbulb, Eye, Timer,
  BarChart3, Eraser, Check, LayoutGrid, Type, AlignLeft, KeyRound,
} from 'lucide-react';
import { getRoscoData, getOrdenaFrasesData } from '../../services/gameDataService';
import { generateCipherMap, encryptText, SPANISH_FREQ } from './cipherGenerator';
import materiasData from '../../../public/data/materias.json';
import InstructionsModal from '../_shared/InstructionsModal';
import {
  GameShell, GameHeader, Hud, HudStat, Panel, KeyTile, GameButton, ProgressBar,
  ModeSelect, RoundBanner, ResultsScreen, GameLoading, GameEmpty,
} from '../_shared/kit';
import './Criptograma.css';

const ALPHABET_KEYS = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');

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
    helps: { reveal: 0, freq: false, check: false },
    revealVowels: false, timer: 300, // 5 minutos
  },
};

const EXAM_REF_TIME_SEC = 300;

const EXAM_POINTS_PER_LETTER = 100;

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
  // null = pantalla previa de modos (CLAUDE.md §3: el modo se elige ANTES de jugar)
  const [gameMode, setGameMode] = useState(null); // null | 'easy' | 'medium' | 'exam'

  // Puzzle
  const [cipherMap, setCipherMap] = useState(null);
  const [encrypted, setEncrypted] = useState([]);
  // eslint-disable-next-line no-unused-vars -- estado preexistente, se deja intacto
  const [originalText, setOriginalText] = useState('');
  const [hint, setHint] = useState('');
  const [guesses, setGuesses] = useState({}); // code → guessedLetter
  const [selectedCode, setSelectedCode] = useState(null);
  const [lockedCodes, setLockedCodes] = useState(new Set()); // códigos revelados (no editables)
  const [wrongCodes, setWrongCodes] = useState(new Set());
  const [completed, setCompleted] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [revealsUsed, setRevealsUsed] = useState(0);
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
    setRevealsUsed(0);
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
    if (!loading && gameMode && (palabras.length > 0 || frases.length > 0)) generatePuzzle();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deps originales
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

  // --- Puntuación y nota ---
  const totalLetters = uniqueCodes.length;
  const correctCount = uniqueCodes.filter((c) => guesses[c] === cipherMap?.codeToLetter[c]).length;
  const nota = totalLetters > 0 ? Math.round((correctCount / totalLetters) * 100) / 10 : 0;
  const isExam = gameMode === 'exam';

  const finalScore = useMemo(() => {
    if (isExam) {
      const basePoints = correctCount * EXAM_POINTS_PER_LETTER;
      const speedBonus = Math.max(0, Math.round(EXAM_REF_TIME_SEC * (1 - timer / EXAM_REF_TIME_SEC)));
      return basePoints + speedBonus;
    }
    // Práctica: cálculo informativo (no se manda al ranking)
    const base = correctCount * 100;
    const tBonus = Math.max(0, Math.round(180 * (1 - timer / 180)));
    const noHintsBonus = hintsUsed === 0 && revealsUsed === 0 ? 100 : 0;
    return base + tBonus + noHintsBonus;
  }, [isExam, correctCount, timer, hintsUsed, revealsUsed]);

  useEffect(() => {
    if (!completed || trackedRef.current) return;
    trackedRef.current = true;
    onGameComplete?.({
      mode: isExam ? 'test' : 'practice',
      score: isExam ? finalScore : 0,
      maxScore: isExam ? totalLetters * EXAM_POINTS_PER_LETTER + EXAM_REF_TIME_SEC : 0,
      correctAnswers: correctCount,
      totalQuestions: totalLetters,
      durationSeconds: timer,
    });
  }, [completed, finalScore, totalLetters, correctCount, timer, isExam, onGameComplete]);

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
      if (!gameMode || completed || showHelp) return;
      if (e.key === 'Backspace' || e.key === 'Delete') { e.preventDefault(); clearGuess(); return; }
      if (e.key === 'Escape') { setSelectedCode(null); return; }
      if (e.key.length === 1 && /[a-zA-ZñÑ]/.test(e.key)) {
        e.preventDefault();
        assignLetter(e.key);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [assignLetter, clearGuess, completed, showHelp, gameMode]);

  // --- Ayudas ---
  // En la pantalla previa aún no hay modo: valores de Fácil solo para que el render no falle.
  const cfg = MODE_CONFIG[gameMode] || MODE_CONFIG.easy;

  const revealsRemaining = Math.max(0, cfg.helps.reveal - revealsUsed);

  const revealLetter = useCallback(() => {
    if (!cipherMap) return;
    if (revealsUsed >= cfg.helps.reveal) return;
    // Revelar un código no adivinado al azar
    const pending = uniqueCodes.filter((c) => !lockedCodes.has(c) && guesses[c] !== cipherMap.codeToLetter[c]);
    if (pending.length === 0) return;
    const code = pending[Math.floor(Math.random() * pending.length)];
    const letter = cipherMap.codeToLetter[code];
    setGuesses((prev) => ({ ...prev, [code]: letter }));
    setLockedCodes((prev) => new Set(prev).add(code));
    setRevealsUsed((r) => r + 1);
  }, [cipherMap, cfg, revealsUsed, lockedCodes, uniqueCodes, guesses]);

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

  // --- Render ---
  const shellProps = { accent: '#0d9488', accent2: '#06b6d4' };

  const instructions = (
    <InstructionsModal isOpen={showHelp} onClose={() => setShowHelp(false)} title="Cómo jugar al Criptograma">
      <h3>🎯 Objetivo</h3>
      <p>Cada letra de la frase ha sido sustituida por un <strong>número secreto</strong>. Tu misión es descubrir qué letra se esconde detrás de cada número.</p>

      <h3>🕹️ Cómo se juega</h3>
      <ul>
        <li><strong>Click en un número</strong> del texto cifrado para seleccionarlo.</li>
        <li><strong>Escribe o pulsa la letra</strong> que creas que corresponde.</li>
        <li>Todas las apariciones del mismo número se actualizan a la vez.</li>
        <li>Las letras que ya has usado aparecen atenuadas en el teclado.</li>
        <li>Usa <kbd>⌫</kbd> o el botón <strong>Borrar</strong> para limpiar una asignación.</li>
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
        <div className="instr-mode exam"><strong>🔴 Examen</strong>Frase larga. 5 min. <strong>Sin ayudas</strong>: ni reveals, ni frecuencias, ni comprobar.</div>
      </div>

      <h3>📊 Nota y puntos en el examen</h3>
      <p>Tu nota va de <strong>0 a 10</strong> según las letras adivinadas:</p>
      <p className="instr-formula"><strong>Nota</strong> = letras correctas / total × 10</p>
      <p>Además ganas <strong>puntos para el ranking</strong>:</p>
      <p className="instr-formula"><strong>Puntos</strong> = letras × {EXAM_POINTS_PER_LETTER} + bonus de velocidad (hasta {EXAM_REF_TIME_SEC})</p>
      <p className="instr-note">Dos partidas con un 10 dan distinto ranking según el tiempo: gana quien la termine antes.</p>

      <div className="instr-tips"><strong>💡 Consejo:</strong> empieza por las letras más repetidas en el texto; probablemente sean E, A u O.</div>
    </InstructionsModal>
  );

  if (loading) {
    return (
      <GameShell {...shellProps}>
        <GameLoading label="Cerrando la caja fuerte…" />
      </GameShell>
    );
  }

  if (palabras.length === 0 && frases.length === 0) {
    return (
      <GameShell {...shellProps}>
        <GameHeader onHelp={() => setShowHelp(true)} />
        <GameEmpty title="Sin mensajes secretos">
          No hay suficientes datos disponibles para esta asignatura.
        </GameEmpty>
        {instructions}
      </GameShell>
    );
  }

  // --- Pantalla previa: elegir modo (CLAUDE.md §3) ---
  if (!gameMode) {
    const modes = [
      {
        id: 'easy', tone: 'easy', icon: Type, title: 'Fácil',
        desc: 'Una palabra con su definición y las vocales ya descifradas.',
        features: ['Vocales reveladas', '3 revelar · frecuencias · comprobar', 'Sin límite de tiempo'],
      },
      {
        id: 'medium', tone: 'medium', icon: AlignLeft, title: 'Medio',
        desc: 'Una frase corta sin ninguna letra de partida.',
        features: ['2 revelar · frecuencias · comprobar', 'Frases cortas', 'Sin límite de tiempo'],
      },
      {
        id: 'exam', tone: 'exam', title: 'Examen',
        desc: 'Una frase larga, 5 minutos y ninguna ayuda.',
        features: ['Nota sobre 10', '5 minutos, sin ayudas', 'Puntos por rapidez'],
      },
    ];
    return (
      <GameShell {...shellProps}>
        <ModeSelect
          modes={modes}
          onSelect={(id) => setGameMode(id)}
          onHelp={() => setShowHelp(true)}
          footer={<span className="cph-modes-foot"><KeyRound size={14} /> Cada número esconde siempre la misma letra</span>}
        />
        {instructions}
      </GameShell>
    );
  }

  const backToModes = () => {
    setGameMode(null);
    setEncrypted([]);
    setSelectedCode(null);
  };

  // Mensaje agrupado por palabras para que no se parta al saltar de línea (solo presentación)
  const cipherWords = [];
  let currentWordChars = [];
  encrypted.forEach((ch, i) => {
    if (ch.original === ' ') {
      if (currentWordChars.length) cipherWords.push(currentWordChars);
      currentWordChars = [];
    } else {
      currentWordChars.push({ ...ch, i });
    }
  });
  if (currentWordChars.length) cipherWords.push(currentWordChars);

  const renderCipher = (interactive) => (
    <div className={`cph-text ${encrypted.length > 40 ? 'is-long' : ''}`}>
      {cipherWords.map((word, wi) => (
        <span key={wi} className="cph-word">
          {word.map((ch) => {
            if (!ch.isLetter) {
              return (
                <span key={ch.i} className="cph-char is-punct">
                  <span className="cph-char__code">&nbsp;</span>
                  <span className="cph-char__slot">{ch.original}</span>
                </span>
              );
            }
            const guess = guesses[ch.code];
            const isCorrect = completed && guess === ch.normalized;
            const isMissed = completed && !isCorrect;
            const isWrong = wrongCodes.has(ch.code);
            const isLocked = lockedCodes.has(ch.code);
            const isSelected = interactive && !completed && selectedCode === ch.code;
            const isSameGuess = interactive && selectedCode && guesses[selectedCode] && guess === guesses[selectedCode] && !isSelected;
            return (
              <span
                key={ch.i}
                className={`cph-char is-letter ${isSelected ? 'is-sel' : ''} ${
                  isSameGuess ? 'is-same' : ''
                } ${isCorrect ? 'is-correct' : ''} ${isMissed ? 'is-missed' : ''} ${isWrong ? 'is-wrong' : ''} ${
                  isLocked ? 'is-locked' : ''
                } ${guess ? 'is-filled' : ''}`}
                onClick={interactive ? () => !completed && !isLocked && setSelectedCode(ch.code) : undefined}
              >
                <span className="cph-char__code">{ch.code}</span>
                <span key={guess || 'empty'} className="cph-char__slot">
                  {guess || (completed ? ch.normalized : '')}
                </span>
              </span>
            );
          })}
        </span>
      ))}
    </div>
  );

  // --- Examen terminado: resumen con la nota ---
  if (isExam && completed) {
    return (
      <GameShell {...shellProps}>
        <ResultsScreen
          title={isAllCorrect ? '¡Descifrado!' : 'Tiempo agotado'}
          subtitle={`Criptograma · ${subjectInfo.icon} ${subjectInfo.nombre || 'General'}`}
          nota={nota}
          points={finalScore}
          stats={[
            { icon: Unlock, tone: 'good', label: 'Letras', value: `${correctCount}/${totalLetters}` },
            { icon: Timer, tone: 'time', label: 'Tiempo', value: formatTime(timer) },
          ]}
          actions={[
            { label: 'Otro criptograma', onClick: generatePuzzle, icon: RefreshCw },
            { label: 'Cambiar de modo', onClick: backToModes, icon: LayoutGrid, variant: 'soft' },
          ]}
        >
          <Panel variant="screen" className={`cph-board is-review ${isAllCorrect ? 'is-won' : 'is-lost'}`}>
            <div className="cph-board__bar">
              <span className="cph-board__label">{isAllCorrect ? <Unlock size={14} /> : <Lock size={14} />} Mensaje descifrado</span>
            </div>
            {renderCipher(false)}
          </Panel>
        </ResultsScreen>
        {instructions}
      </GameShell>
    );
  }

  const selectedGuess = selectedCode ? guesses[selectedCode] : null;

  return (
    <GameShell {...shellProps}>
      <GameHeader
        mode={gameMode}
        modeLabel={`${cfg.label} · ${cfg.source === 'word' ? 'Palabra' : 'Frase'}`}
        onHelp={() => setShowHelp(true)}
        right={(
          <Hud>
            {cfg.timer && !completed && (
              <HudStat icon={Timer} tone={timeLeft <= 30 ? 'lives' : 'time'} value={formatTime(timeLeft)} label="Quedan" />
            )}
            {!cfg.timer && (
              <HudStat icon={Timer} tone="time" value={formatTime(timer)} label="Tiempo" />
            )}
            <HudStat icon={Unlock} tone="good" value={`${correctCount}/${totalLetters}`} label="Descifradas" />
          </Hud>
        )}
      />

      <div className="cph-progress" aria-hidden="true">
        <ProgressBar value={correctCount} max={totalLetters || 1} tone="good" />
      </div>

      {hint && !isExam && (
        <div className="cph-hint">
          <span className="cph-hint__icon"><Lightbulb size={17} /></span>
          <span>{hint}</span>
        </div>
      )}

      <RoundBanner
        show={completed && !isExam}
        status={isAllCorrect ? 'won' : 'lost'}
        title={isAllCorrect ? '¡Descifrado!' : 'Tiempo agotado'}
        subtitle={`${correctCount}/${totalLetters} letras · ${formatTime(timer)} · ${finalScore.toLocaleString('es-ES')} puntos${hintsUsed > 0 ? ` · ${hintsUsed} ayudas` : ''}`}
        action={generatePuzzle}
        actionLabel="Otro criptograma"
        actionIcon={RefreshCw}
      />

      {/* Visor de la caja fuerte con el mensaje cifrado */}
      <Panel variant="screen" className={`cph-board ${completed ? (isAllCorrect ? 'is-won' : 'is-lost') : ''}`}>
        <div className="cph-board__bar">
          <span className="cph-board__label">
            {completed && isAllCorrect ? <Unlock size={14} /> : <Lock size={14} />}
            {completed && isAllCorrect ? 'Mensaje descifrado' : 'Mensaje cifrado'}
          </span>
          <span className="cph-board__leds" aria-hidden="true"><i /><i /><i /></span>
        </div>
        {renderCipher(true)}
      </Panel>

      {!completed && (
        <div className="cph-pad">
          <div className={`cph-target ${selectedCode ? 'is-on' : ''}`}>
            {selectedCode ? (
              <>
                <span>Número</span>
                <b className="cph-target__code">{selectedCode}</b>
                <span>es la letra</span>
                <b className="cph-target__letter">{selectedGuess || '?'}</b>
              </>
            ) : (
              <span>Toca un número del mensaje y elige su letra</span>
            )}
          </div>

          {/* Teclado on-screen */}
          <div className="cph-keys" role="group" aria-label="Teclado">
            {ALPHABET_KEYS.map((letter) => {
              // Comprobar si esa letra ya está asignada a algún código
              const usedByCode = Object.entries(guesses).find(([, v]) => v === letter);
              const isUsed = !!usedByCode;
              return (
                <KeyTile
                  key={letter}
                  state={selectedGuess === letter ? 'selected' : 'idle'}
                  className={`cph-key ${isUsed ? 'is-used' : ''}`}
                  onClick={() => assignLetter(letter)}
                  disabled={completed}
                  aria-label={`Letra ${letter}`}
                >
                  {letter}
                </KeyTile>
              );
            })}
            <KeyTile className="cph-key cph-key--erase" onClick={clearGuess} aria-label="Borrar letra">
              <Eraser size={17} /> Borrar
            </KeyTile>
          </div>
        </div>
      )}

      {/* Ayudas */}
      {!completed && (
        <div className="cph-tools">
          {cfg.helps.reveal > 0 && (
            <GameButton
              variant="primary"
              icon={Eye}
              onClick={revealLetter}
              disabled={revealsRemaining <= 0}
              title={revealsRemaining > 0 ? 'Revelar una letra al azar' : 'Sin reveals disponibles'}
              className="cph-life"
            >
              Revelar
              <b className="cph-life__count">{revealsRemaining}</b>
            </GameButton>
          )}
          {cfg.helps.freq && (
            <GameButton
              variant={showFreq ? 'warning' : 'soft'}
              icon={BarChart3}
              onClick={() => setShowFreq((f) => !f)}
              title="Tabla de frecuencias del español"
            >
              Frecuencias
            </GameButton>
          )}
          {cfg.helps.check && (
            <GameButton variant="soft" icon={Check} onClick={checkAnswers} title="Marcar letras incorrectas">
              Comprobar
            </GameButton>
          )}
          <GameButton variant="ghost" icon={RefreshCw} onClick={generatePuzzle}>
            Nuevo
          </GameButton>
        </div>
      )}

      {/* Tabla de frecuencias */}
      <AnimatePresence>
        {showFreq && !completed && (
          <motion.div
            className="cph-freq"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <div className="cph-freq__title"><BarChart3 size={14} /> Frecuencia de letras en español</div>
            <div className="cph-freq__grid">
              {Object.entries(SPANISH_FREQ).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([letter, pct]) => (
                <div key={letter} className="cph-freq__item">
                  <span className="cph-freq__letter">{letter}</span>
                  <span className="cph-freq__track">
                    <span className="cph-freq__bar" style={{ transform: `scaleX(${pct / 14})` }} />
                  </span>
                  <span className="cph-freq__pct">{pct}%</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="cph-footer">
        {!isExam && (
          <GameButton variant="soft" size="sm" icon={LayoutGrid} onClick={backToModes}>
            Cambiar modo
          </GameButton>
        )}
        <span className="cph-footer__info">
          <KeyRound size={14} />
          {isExam ? 'Modo examen · 5 minutos · sin ayudas' : 'También puedes escribir con el teclado · ⌫ borra'}
        </span>
      </div>

      {instructions}
    </GameShell>
  );
};

export default Criptograma;
