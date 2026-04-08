// src/apps/ahorcado/Ahorcado.jsx
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Heart, RefreshCw, BookOpen, Type, AlignLeft, Lightbulb, Trophy, Skull } from 'lucide-react';
import { getRoscoData, getOrdenaFrasesData } from '../../services/gameDataService';
import './Ahorcado.css';

const MAX_FAILS = 6; // cabeza, torso, brazo izq, brazo der, pierna izq, pierna der
const ALPHABET = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');

// Quitar tildes y poner en mayúsculas — el ahorcado compara sin acentos
const normalize = (s) =>
  String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();

const Ahorcado = ({ onGameComplete }) => {
  const { level, grade: gradeParam, subjectId } = useParams();
  const grade = useMemo(() => parseInt(gradeParam, 10), [gradeParam]);
  const asignatura = subjectId || (level === 'primaria' ? 'lengua' : 'general');

  const [mode, setMode] = useState('palabra'); // 'palabra' | 'frase'
  const [palabras, setPalabras] = useState([]);
  const [frases, setFrases] = useState([]);
  const [loading, setLoading] = useState(true);

  const [current, setCurrent] = useState(null); // { texto, pista }
  const [guessed, setGuessed] = useState(new Set()); // Letras acertadas y falladas
  const [fails, setFails] = useState(0);
  const [status, setStatus] = useState('playing'); // 'playing' | 'won' | 'lost'
  const [showHint, setShowHint] = useState(false);
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);

  const containerRef = useRef(null);
  const trackedRef = useRef(false);

  // --- Cargar datos (rosco y frases) ---
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    // Cada fetch se envuelve para que un error no tumbe al otro
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

        const palabrasLimpias = Array.isArray(roscoData)
          ? roscoData
              .filter((it) => it && it.solucion && String(it.solucion).trim().length >= 2)
              .map((it) => ({
                texto: String(it.solucion).trim(),
                pista: it.definicion || null,
              }))
          : [];

        const frasesLimpias = Array.isArray(frasesData)
          ? frasesData
              .filter((f) => typeof f === 'string' && f.trim().length > 0)
              .map((f) => ({ texto: f.trim(), pista: null }))
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
  }, [level, grade, asignatura]);

  // --- Elegir item aleatorio ---
  const pickRandom = useCallback(
    (sourceMode) => {
      const pool = sourceMode === 'frase' ? frases : palabras;
      if (!pool || pool.length === 0) return null;
      const idx = Math.floor(Math.random() * pool.length);
      return pool[idx];
    },
    [palabras, frases]
  );

  // --- Nueva partida ---
  const newRound = useCallback(
    (sourceMode = mode) => {
      const item = pickRandom(sourceMode);
      setCurrent(item);
      setGuessed(new Set());
      setFails(0);
      setStatus('playing');
      setShowHint(false);
      trackedRef.current = false;
    },
    [mode, pickRandom]
  );

  // Al cargar datos, iniciar primera ronda
  useEffect(() => {
    if (!loading) {
      newRound(mode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, mode]);

  // --- Letras necesarias (solo letras del alfabeto, no espacios ni signos) ---
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
      setWins((w) => w + 1);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#a855f7', '#ec4899', '#fbbf24', '#10b981'],
      });
    }
  }, [guessed, current, lettersNeeded, status]);

  // --- Detectar derrota ---
  useEffect(() => {
    if (status === 'playing' && fails >= MAX_FAILS) {
      setStatus('lost');
      setLosses((l) => l + 1);
    }
  }, [fails, status]);

  // --- Tracking al terminar (XP) ---
  useEffect(() => {
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
  }, [status, fails, guessed, lettersNeeded, onGameComplete]);

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

  // --- Teclado físico ---
  useEffect(() => {
    const handler = (e) => {
      if (status !== 'playing') {
        if (e.key === 'Enter' || e.key === ' ') newRound();
        return;
      }
      const key = e.key;
      if (key.length === 1 && /[a-zA-ZñÑáéíóúÁÉÍÓÚ]/.test(key)) {
        handleGuess(key);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleGuess, newRound, status]);

  // --- Render del texto oculto ---
  const renderHidden = () => {
    if (!current) return null;
    const original = current.texto;
    const norm = normalize(original);
    const reveal = status !== 'playing'; // al terminar mostrar todo

    // Dividimos por palabras
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
      // 0. Base
      <line key="base" x1="10" y1="140" x2="110" y2="140" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />,
      // 1. Poste vertical
      <line key="poste" x1="30" y1="140" x2="30" y2="20" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />,
      // 2. Travesaño
      <line key="travesano" x1="30" y1="20" x2="85" y2="20" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />,
      // 3. Cuerda
      <line key="cuerda" x1="85" y1="20" x2="85" y2="35" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />,
    ];

    // Partes del muñeco: cabeza, torso, brazoI, brazoD, piernaI, piernaD
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

  // --- Estados UI ---
  if (loading) {
    return (
      <div className="ahorcado-root">
        <div className="ahorcado-card">
          <div className="ahorcado-loading">Cargando juego...</div>
        </div>
      </div>
    );
  }

  const currentPool = mode === 'frase' ? frases : palabras;
  if (!currentPool || currentPool.length === 0) {
    return (
      <div className="ahorcado-root">
        <div className="ahorcado-card">
          <div className="ahorcado-title">
            <span>🎯</span> Ahorcado
          </div>
          <div className="ahorcado-empty">
            <p>No hay {mode === 'frase' ? 'frases' : 'palabras'} disponibles para esta asignatura.</p>
            {mode === 'frase' && palabras.length > 0 && (
              <button className="ahorcado-btn primary" onClick={() => setMode('palabra')}>
                Probar con palabras
              </button>
            )}
            {mode === 'palabra' && frases.length > 0 && (
              <button className="ahorcado-btn primary" onClick={() => setMode('frase')}>
                Probar con frases
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const vidasRestantes = MAX_FAILS - fails;

  return (
    <div className="ahorcado-root" ref={containerRef}>
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
            <div className="ahorcado-stat wins" title="Victorias">
              <Trophy size={16} />
              <span>{wins}</span>
            </div>
            <div className="ahorcado-stat losses" title="Derrotas">
              <Skull size={16} />
              <span>{losses}</span>
            </div>
          </div>
        </div>

        {/* Selector de modo */}
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

            {/* Pista */}
            {current?.pista && (
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

        {/* Resultado */}
        <AnimatePresence>
          {status !== 'playing' && (
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
                    <small>Has adivinado la {mode === 'frase' ? 'frase' : 'palabra'}</small>
                  </>
                ) : (
                  <>
                    <span>💀 ¡Te han ahorcado!</span>
                    <small>La solución era: <strong>{current?.texto}</strong></small>
                  </>
                )}
              </div>
              <button className="ahorcado-btn primary" onClick={() => newRound()}>
                <RefreshCw size={16} /> Nueva partida
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer con nueva partida si sigue jugando */}
        {status === 'playing' && (
          <div className="ahorcado-footer">
            <button className="ahorcado-btn ghost" onClick={() => newRound()}>
              <RefreshCw size={14} /> Saltar
            </button>
            <div className="ahorcado-info">
              <BookOpen size={14} />
              <span>
                {currentPool.length} {mode === 'frase' ? 'frases' : 'palabras'} disponibles
              </span>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Ahorcado;
