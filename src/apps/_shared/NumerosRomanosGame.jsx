// Números romanos (rediseño 2026 sobre _shared/kit).
// Lo propio del juego: placa de bronce con el número, lápida de mármol donde
// se «graban» las letras y sillares de piedra para elegir. Reglas, validación,
// generación de números, puntuación y tracking: sin cambios.
import React, { useState, useEffect, useCallback, useRef } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Check, Clock, Delete, Eraser, LayoutGrid, RefreshCw, SkipForward, Target, Trophy, Eye, Table2, Flame,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import useArtIds from '@/components/art/useArtIds';
import InstructionsModal from './InstructionsModal';
import {
  GameShell, GameHeader, Hud, HudStat, ProgressBar, Panel, GameButton, ModeSelect, RoundBanner,
  ResultsScreen, FeedbackItem, useAppMeta,
} from './kit';

import './NumerosRomanos.css';

// --- UTILIDADES ---

const BAR = '\u0305';

const toRoman = (num) => {
  const map = [
    { s: 'M' + BAR, v: 1000000 },
    { s: 'C' + BAR + 'M' + BAR, v: 900000 },
    { s: 'D' + BAR, v: 500000 },
    { s: 'C' + BAR + 'D' + BAR, v: 400000 },
    { s: 'C' + BAR, v: 100000 },
    { s: 'X' + BAR + 'C' + BAR, v: 90000 },
    { s: 'L' + BAR, v: 50000 },
    { s: 'X' + BAR + 'L' + BAR, v: 40000 },
    { s: 'X' + BAR, v: 10000 },
    { s: 'I' + BAR + 'X' + BAR, v: 9000 },
    { s: 'V' + BAR, v: 5000 },
    { s: 'I' + BAR + 'V' + BAR, v: 4000 },
    { s: 'M', v: 1000 },
    { s: 'CM', v: 900 },
    { s: 'D', v: 500 },
    { s: 'CD', v: 400 },
    { s: 'C', v: 100 },
    { s: 'XC', v: 90 },
    { s: 'L', v: 50 },
    { s: 'XL', v: 40 },
    { s: 'X', v: 10 },
    { s: 'IX', v: 9 },
    { s: 'V', v: 5 },
    { s: 'IV', v: 4 },
    { s: 'I', v: 1 },
  ];
  let result = '';
  let n = num;
  for (const item of map) {
    while (n >= item.v) {
      result += item.s;
      n -= item.v;
    }
  }
  return result;
};

const getRomanMap = () => ({
  'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100, 'D': 500, 'M': 1000,
  ['I' + BAR]: 1000, ['V' + BAR]: 5000, ['X' + BAR]: 10000,
  ['L' + BAR]: 50000, ['C' + BAR]: 100000, ['D' + BAR]: 500000, ['M' + BAR]: 1000000
});

const getVal = (str) => getRomanMap()[str] || 0;

// Validador lógico y robusto sin Regex
const validateRomanStructure = (tiles) => {
  if (!tiles || tiles.length === 0) return false;

  const values = tiles.map(t => getVal(t));

  let repeatCount = 1;

  for (let i = 0; i < values.length; i++) {
    const curr = values[i];
    const next = values[i + 1] || 0;

    // 1. Chequeo de Repetición
    if (curr === next) {
      repeatCount++;
      // Solo potencias de 10 pueden repetirse (1, 10, 100...)
      // Las de 5 (5, 50, 500...) NO pueden repetirse
      const isPowerOf10 = (Math.log10(curr) % 1 === 0);
      if (!isPowerOf10) return false; // 5, 50, 500 repetidos -> Mal
      if (repeatCount > 3) return false; // Más de 3 veces -> Mal
    } else {
      repeatCount = 1;
    }

    // 2. Chequeo de Resta y Orden
    if (next > curr) {
      // Estamos restando (ej: IV, IX, XC...)

      // a) Solo potencias de 10 pueden restar
      const isPowerOf10 = (Math.log10(curr) % 1 === 0);
      if (!isPowerOf10) return false; // V, L, D no restan

      // b) Solo se puede restar a los dos "niveles" siguientes (5x y 10x)
      // Ejemplo: 1 resta a 5 y 10. 10 resta a 50 y 100.
      if (next > curr * 10) return false; // IL (1 a 50) -> Mal

      // c) No se puede restar dos veces (IIX -> Mal)
      // Si el anterior era igual a mí, y ahora resto -> Mal
      if (i > 0 && values[i - 1] === curr) return false;

      // d) Después de una resta, el siguiente número debe ser menor que el que restó
      // Ej: XC (90). El siguiente tiene que ser < 10 (curr). XCI (91) bien. XCL mal.
      // Así evitamos cosas como CMC (900 + 100 = 1000 => se escribe M)
      // Ojo: i+2 es el índice del que va después del next
      if (tiles[i + 2]) {
        const afterNext = getVal(tiles[i + 2]);
        if (afterNext >= curr) return false;
      }

    } else if (next < curr) {
      // Orden descendente normal. 
      // Solo verificamos que no hayamos roto la regla d) implícitamente
      // pero eso es difícil de traquear sin mirar atrás.
      // La regla general es que los valores deben bajar.
    }
  }

  return true;
};

const fromRoman = (romanArray) => {
  if (!romanArray || romanArray.length === 0) return 0;

  // Validamos la estructura ANTES de sumar
  if (!validateRomanStructure(romanArray)) return null;

  const map = getRomanMap();
  let total = 0;
  for (let i = 0; i < romanArray.length; i++) {
    const current = map[romanArray[i]];
    const next = map[romanArray[i + 1]];
    if (next && current < next) {
      total -= current;
    } else {
      total += current;
    }
  }
  return total;
};

const getAvailableTiles = (max) => {
  const base = ['I', 'V', 'X'];
  if (max <= 20) return base;
  const upTo100 = [...base, 'L', 'C'];
  if (max <= 100) return upTo100;
  const upTo4k = [...upTo100, 'D', 'M'];
  if (max <= 4000) return upTo4k;
  return [...upTo4k, 'I' + BAR, 'V' + BAR, 'X' + BAR, 'L' + BAR, 'C' + BAR, 'D' + BAR, 'M' + BAR];
};

const TOTAL_TEST_QUESTIONS = 10;

const ROMAN_VALUES = [
  { letter: 'I', value: 1 },
  { letter: 'V', value: 5 },
  { letter: 'X', value: 10 },
  { letter: 'L', value: 50 },
  { letter: 'C', value: 100 },
  { letter: 'D', value: 500 },
  { letter: 'M', value: 1000 },
];

// Puntuacion del examen: base por aciertos + bonus por tiempo.
// Dos alumnos con todos los aciertos pueden tener puntuaciones distintas segun
// lo rapido que respondan. El bonus escala con la proporcion de aciertos,
// para que solo los buenos resultados cobren bonus grande.
const computeRomanScore = (correctCount, timeSeconds) => {
  const baseScore = correctCount * 100; // 0..1000
  if (correctCount === 0) return 0;
  const fastBonus = Math.max(0, 300 - timeSeconds * 5);            // 0..300
  const longBonus = Math.max(0, 200 - Math.floor(timeSeconds / 2)); // 0..200
  const perCorrect = correctCount / TOTAL_TEST_QUESTIONS;
  const timeBonus = Math.round((fastBonus + longBonus) * perCorrect);
  return baseScore + timeBonus;
};

const ROMAN_MAX_SCORE = TOTAL_TEST_QUESTIONS * 100 + 500; // 1500 aprox.


/* ───────────────────────── Presentación ───────────────────────── */

// Separa una cadena romana en letras; la raya (U+0305) marca ×1000 y se
// dibuja con CSS encima de la letra (la fuente no siempre la pinta bien).
const splitRoman = (str) => {
  const out = [];
  for (const ch of String(str || '')) {
    if (ch === BAR && out.length) out[out.length - 1].bar = true;
    else out.push({ ch, bar: false });
  }
  return out;
};

const RomanText = ({ value, className = '' }) => (
  <span className={`rmn-rtext ${className}`}>
    {splitRoman(value).map((g, i) => (
      <span key={i} className={g.bar ? 'rmn-bar' : undefined}>{g.ch}</span>
    ))}
  </span>
);

const fmt = (n) => Number(n).toLocaleString('es-ES');

// Rama de laurel (decoración de la placa). Hojas calculadas una vez.
const LAUREL_LEAVES = (() => {
  const P0 = [30, 86];
  const P1 = [6, 58];
  const P2 = [20, 8];
  const leaves = [];
  for (let i = 0; i < 7; i += 1) {
    const t = 0.1 + i * 0.13;
    const u = 1 - t;
    const x = u * u * P0[0] + 2 * t * u * P1[0] + t * t * P2[0];
    const y = u * u * P0[1] + 2 * t * u * P1[1] + t * t * P2[1];
    const dx = 2 * u * (P1[0] - P0[0]) + 2 * t * (P2[0] - P1[0]);
    const dy = 2 * u * (P1[1] - P0[1]) + 2 * t * (P2[1] - P1[1]);
    const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
    [-1, 1].forEach((side) => {
      const a = ang + side * 40;
      const rad = (a * Math.PI) / 180;
      leaves.push({ x: x + Math.cos(rad) * 6.5, y: y + Math.sin(rad) * 6.5, r: a - 90 });
    });
  }
  return leaves;
})();

const Laurel = ({ flip = false }) => {
  const [id, url] = useArtIds();
  return (
    <svg viewBox="0 0 40 92" className={`rmn-laurel ${flip ? 'is-flip' : ''}`} aria-hidden="true">
      <defs>
        <linearGradient id={id('leaf')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ecfccb" />
          <stop offset=".45" stopColor="#84cc16" />
          <stop offset="1" stopColor="#3f6212" />
        </linearGradient>
      </defs>
      <path d="M30 86 Q6 58 20 8" stroke="#3f6212" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      {LAUREL_LEAVES.map((l, i) => (
        <ellipse key={i} cx={l.x} cy={l.y} rx="4.2" ry="8.6" transform={`rotate(${l.r} ${l.x} ${l.y})`} fill={url('leaf')} />
      ))}
      <ellipse cx="20" cy="5" rx="3.4" ry="7" fill={url('leaf')} />
    </svg>
  );
};

// Vetas del mármol (estático, sin filtros).
const MarbleVeins = () => (
  <svg className="rmn-veins" viewBox="0 0 600 160" preserveAspectRatio="none" aria-hidden="true">
    <path d="M-10 128 C70 108 120 136 190 98 S320 70 380 104 S520 140 610 92" stroke="#94a3b8" strokeOpacity=".35" strokeWidth="1.6" fill="none" />
    <path d="M40 -6 C70 30 64 52 112 70 S170 120 158 168" stroke="#94a3b8" strokeOpacity=".22" strokeWidth="1.1" fill="none" />
    <path d="M420 -8 C440 26 488 30 500 62 S560 92 612 84" stroke="#a8a29e" strokeOpacity=".3" strokeWidth="1.3" fill="none" />
    <path d="M250 168 C270 140 300 132 318 112" stroke="#94a3b8" strokeOpacity=".25" strokeWidth="1" fill="none" />
  </svg>
);

const NumerosRomanosGame = ({ maxNumber, title, onGameComplete }) => {
  const meta = useAppMeta();
  // Pantalla previa de modos (CLAUDE.md §3): 'menu' → elegir; 'play' → partida.
  const [screen, setScreen] = useState('menu');
  const [isTestMode, setIsTestMode] = useState(false);
  const [targetNumber, setTargetNumber] = useState(0);
  const [userTiles, setUserTiles] = useState([]);
  const [showHelper, setShowHelper] = useState(true);
  const [showTable, setShowTable] = useState(false);
  const [feedback, setFeedback] = useState({ text: '', type: '' });
  const [showHelp, setShowHelp] = useState(false);
  // Marcador de práctica (solo presentación).
  const [practiceHits, setPracticeHits] = useState(0);
  const [practiceStreak, setPracticeStreak] = useState(0);
  const scoredTargetRef = useRef(null);

  const dropZoneRef = useRef(null);

  // Tiempo del examen: arranca al iniciar el test y se congela al acabar.
  const testStartTimeRef = useRef(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [finalTime, setFinalTime] = useState(0);


  const [testStats, setTestStats] = useState({
    questions: [],
    currentIndex: 0,
    score: 0,
    answers: [],
    finished: false
  });

  const generateNumber = useCallback(() => {
    if (maxNumber > 3999) {
      // Distribución para 6º: mezcla de números normales y números con raya
      const r = Math.random();
      if (r < 0.2) return Math.floor(Math.random() * 3998) + 1; // 20% hasta 3999
      if (r < 0.5) return Math.floor(Math.random() * 46000) + 4000; // 30% medianos (4k-50k)
      if (r < 0.8) return Math.floor(Math.random() * 450000) + 50000; // 30% grandes (50k-500k)
      return Math.floor(Math.random() * 500000) + 500000; // 20% muy grandes (500k-1M)
    }
    return Math.floor(Math.random() * maxNumber) + 1;
  }, [maxNumber]);

  const startPractice = useCallback(() => {
    setTargetNumber(generateNumber());
    setUserTiles([]);
    setFeedback({ text: '', type: '' });
  }, [generateNumber]);

  const startTest = useCallback(() => {
    const questions = Array.from({ length: TOTAL_TEST_QUESTIONS }, () => generateNumber());
    setTestStats({
      questions,
      currentIndex: 0,
      score: 0,
      answers: [],
      finished: false
    });
    setIsTestMode(true);
    setTargetNumber(questions[0]);
    setUserTiles([]);
    setShowHelper(false);
    setFeedback({ text: '', type: '' });
    testStartTimeRef.current = Date.now();
    setElapsedTime(0);
    setFinalTime(0);
  }, [generateNumber]);

  useEffect(() => {
    startPractice();
  }, [startPractice]);

  // Cronometro del examen: se actualiza cada segundo mientras el test esta activo.
  useEffect(() => {
    if (!isTestMode || testStats.finished || !testStartTimeRef.current) return;
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - testStartTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isTestMode, testStats.finished]);

  const handleAddTile = (tileValue) => {
    setUserTiles(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), value: tileValue }]);
  };
  const handleRemoveTile = (id) => setUserTiles(prev => prev.filter(tile => tile.id !== id));
  const handleDragStart = (e, tile) => e.dataTransfer.setData('text/plain', tile);
  const handleDrop = (e) => {
    e.preventDefault();
    const tile = e.dataTransfer.getData('text/plain');
    if (tile) handleAddTile(tile);
  };
  const handleDragOver = (e) => e.preventDefault();


  const checkAnswer = () => {
    // Calculamos valor directamente del array de objetos userTiles
    // userTiles es [{id:..., value:'String'}, ...]
    // Mapeamos a array de strings ['I', 'V'...]
    const tilesStr = userTiles.map(t => t.value);

    // El validador ya se encarga de checkear estructura
    const userValueCalculated = fromRoman(tilesStr);

    // Si devuelve null es que la estructura es inválida
    const isCorrect = userValueCalculated === targetNumber;

    // Para feedback en test mode
    const userRomanString = tilesStr.join('');
    const correctRomanString = toRoman(targetNumber);

    if (isTestMode) {
      if (isCorrect) {
        if (dropZoneRef.current) {
          const rect = dropZoneRef.current.getBoundingClientRect();
          confetti({
            particleCount: 100,
            spread: 70,
            origin: {
              x: (rect.left + rect.width / 2) / window.innerWidth,
              y: (rect.top + rect.height / 2) / window.innerHeight
            }
          });
        }
      }
      handleTestNext(isCorrect, userRomanString, correctRomanString);
    } else {

      if (isCorrect) {
        setFeedback({ text: `${fmt(targetNumber)} se escribe así en números romanos.`, type: 'feedback-correct' });
        if (scoredTargetRef.current !== targetNumber) {
          scoredTargetRef.current = targetNumber;
          setPracticeHits((h) => h + 1);
          setPracticeStreak((s) => s + 1);
        }
        if (dropZoneRef.current) {
          const rect = dropZoneRef.current.getBoundingClientRect();
          confetti({
            particleCount: 100,
            spread: 70,
            origin: {
              x: (rect.left + rect.width / 2) / window.innerWidth,
              y: (rect.top + rect.height / 2) / window.innerHeight
            }
          });
        }
      } else {
        setPracticeStreak(0);
        const tilesStr = userTiles.map(t => t.value);
        const userVal = fromRoman(tilesStr);
        if (userVal === null) {
          setFeedback({ text: `Estructura no válida. Revisa las reglas.`, type: 'feedback-incorrect' });
        } else {
          setFeedback({ text: `Eso es ${fmt(userVal)}.`, type: 'feedback-incorrect' });
        }
      }
    }
  };



  const handleTestNext = (isCorrect, userRoman, correctRoman) => {
    const nextStats = {
      ...testStats,
      score: isCorrect ? testStats.score + 1 : testStats.score,
      answers: [...testStats.answers, { target: targetNumber, userRoman, correctRoman, isCorrect }]
    };

    if (testStats.currentIndex < TOTAL_TEST_QUESTIONS - 1) {
      nextStats.currentIndex += 1;
      setTestStats(nextStats);
      setTargetNumber(testStats.questions[nextStats.currentIndex]);
      setUserTiles([]);
    } else {
      nextStats.finished = true;
      setTestStats(nextStats);
      const finalT = testStartTimeRef.current
        ? Math.floor((Date.now() - testStartTimeRef.current) / 1000)
        : 0;
      setFinalTime(finalT);
      setElapsedTime(finalT);
      if (nextStats.score > TOTAL_TEST_QUESTIONS / 2) {
        confetti({ particleCount: 200, spread: 90, origin: { y: 0.6 } });
      }
    }
  };


  // Tracking
  const trackedRef2 = useRef(false);
  useEffect(() => {
    if (isTestMode && testStats.finished && !trackedRef2.current) {
      trackedRef2.current = true;
      const correct = testStats.score;
      const points = computeRomanScore(correct, finalTime);
      onGameComplete?.({
        mode: 'test',
        score: points,
        maxScore: ROMAN_MAX_SCORE,
        correctAnswers: correct,
        totalQuestions: TOTAL_TEST_QUESTIONS,
        durationSeconds: finalTime || undefined,
      });
    }
    if (!testStats.finished) trackedRef2.current = false;
  }, [isTestMode, testStats.finished, testStats.score, finalTime, onGameComplete]);

  // --- Solo presentación: atajos y limpieza del aviso al cambiar las fichas ---
  const availableTiles = getAvailableTiles(maxNumber);
  const clearPracticeFeedback = () => {
    if (!isTestMode && feedback.text) setFeedback({ text: '', type: '' });
  };
  const addTile = (tile) => { handleAddTile(tile); clearPracticeFeedback(); };
  const removeTile = (id) => { handleRemoveTile(id); clearPracticeFeedback(); };
  const removeLast = () => {
    const last = userTiles[userTiles.length - 1];
    if (last) removeTile(last.id);
  };
  const clearAll = () => { setUserTiles([]); clearPracticeFeedback(); };

  // Teclado físico: I V X L C D M añaden la ficha (si existe en este curso) y
  // Retroceso borra la última.
  const keyActionsRef = useRef({});
  keyActionsRef.current = { addTile, removeLast };
  const playing = screen === 'play' && !(isTestMode && testStats.finished);
  useEffect(() => {
    if (!playing) return undefined;
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = e.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      const k = String(e.key || '').toUpperCase();
      if (k.length === 1 && getAvailableTiles(maxNumber).includes(k)) keyActionsRef.current.addTile(k);
      else if (e.key === 'Backspace') { e.preventDefault(); keyActionsRef.current.removeLast(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [playing, maxNumber]);

  const shellProps = { accent: '#d97706', accent2: '#be123c' };
  const headerTitle = meta.name ? undefined : title;
  const backToMenu = () => { setIsTestMode(false); setScreen('menu'); };

  const instructions = (
    <InstructionsModal isOpen={showHelp} onClose={() => setShowHelp(false)} title="Cómo se escriben">
      <h3>🎯 Objetivo</h3>
      <p>Escribe en <strong>números romanos</strong> el número que aparece en la placa, grabando las letras en la lápida.</p>
      <h3>🕹️ Cómo se juega</h3>
      <ul>
        <li>Toca una ficha de piedra (o arrástrala) para grabarla en la lápida. También puedes escribir I, V, X… con el teclado.</li>
        <li>Toca una letra grabada para borrarla; <kbd>⌫</kbd> borra la última.</li>
        <li>Activa la <strong>ayuda visual</strong> para ver cuánto vale lo que llevas escrito y la <strong>tabla de valores</strong> para repasar las reglas.</li>
      </ul>
      <h3>📜 Reglas</h3>
      <ul>
        <li><strong>Suma:</strong> una letra a la derecha de otra de igual o mayor valor suma (VI = 6, XV = 15).</li>
        <li><strong>Resta:</strong> I, X y C a la izquierda de una mayor restan (IV = 4, IX = 9, XL = 40).</li>
        <li><strong>Repetición:</strong> I, X, C y M se repiten hasta 3 veces; V, L y D nunca.</li>
        <li><strong>Raya:</strong> una raya encima multiplica la letra por 1.000.</li>
      </ul>
      <div className="instr-modes">
        <div className="instr-mode easy"><strong>Práctica</strong>Números sin fin, con ayudas y corrección al momento.</div>
        <div className="instr-mode exam"><strong>Examen</strong>{TOTAL_TEST_QUESTIONS} números con cronómetro. Nota sobre 10 y puntos extra por rapidez.</div>
      </div>
    </InstructionsModal>
  );

  // Renderizado de Resultados
  if (isTestMode && testStats.finished) {
    const correct = testStats.score;
    const nota = Math.round((correct / TOTAL_TEST_QUESTIONS) * 100) / 10;
    const points = computeRomanScore(correct, finalTime);

    return (
      <GameShell {...shellProps}>
        <ResultsScreen
          nota={nota}
          points={points}
          stats={[
            { icon: Target, tone: 'good', label: 'Aciertos', value: `${correct}/${TOTAL_TEST_QUESTIONS}` },
            { icon: Clock, tone: 'time', label: 'Tiempo', value: `${finalTime}s` },
          ]}
          actions={[
            { label: 'Repetir examen', onClick: startTest, icon: RefreshCw },
            { label: 'Cambiar de modo', onClick: backToMenu, icon: LayoutGrid, variant: 'soft' },
          ]}
        >
          {testStats.answers.map((ans, idx) => (
            <FeedbackItem key={idx} index={idx + 1} ok={ans.isCorrect} title={fmt(ans.target)}>
              <span className="rmn-fb">
                <span>Tu respuesta: {ans.userRoman ? <RomanText value={ans.userRoman} className="rmn-fb__roman" /> : <em>sin responder</em>}</span>
                {!ans.isCorrect && (
                  <span>Solución: <RomanText value={ans.correctRoman} className="rmn-fb__roman is-ok" /></span>
                )}
              </span>
            </FeedbackItem>
          ))}
        </ResultsScreen>
      </GameShell>
    );
  }

  // Pantalla previa: elegir modo
  if (screen === 'menu') {
    const modes = [
      {
        id: 'practice', tone: 'easy', title: 'Práctica',
        desc: 'Graba números en la lápida con ayudas y corrección al momento.',
        features: ['Ayuda visual y tabla de valores', 'Números sin fin'],
      },
      {
        id: 'exam', tone: 'exam', title: 'Examen',
        desc: `${TOTAL_TEST_QUESTIONS} números contra el reloj. Al final verás tu nota.`,
        features: ['Nota sobre 10', 'Puntos extra por rapidez'],
      },
    ];
    const selectMode = (id) => {
      if (id === 'exam') {
        startTest();
      } else {
        setIsTestMode(false);
        startPractice();
      }
      setScreen('play');
    };
    return (
      <GameShell {...shellProps}>
        <ModeSelect title={headerTitle} modes={modes} onSelect={selectMode} onHelp={() => setShowHelp(true)} />
        {instructions}
      </GameShell>
    );
  }

  // Calcular valor actual para el helper visual
  const currentValue = fromRoman(userTiles.map(t => t.value));
  const isValid = currentValue !== null;
  const isLast = testStats.currentIndex === TOTAL_TEST_QUESTIONS - 1;
  const tabletState = !isTestMode && feedback.type === 'feedback-correct' ? 'is-won'
    : !isTestMode && feedback.type === 'feedback-incorrect' ? 'is-lost' : '';

  return (
    <GameShell {...shellProps}>
      <GameHeader
        title={headerTitle}
        mode={isTestMode ? 'exam' : 'easy'}
        modeLabel={isTestMode ? 'Examen' : 'Práctica'}
        onHelp={() => setShowHelp(true)}
        right={
          <Hud>
            {isTestMode ? (
              <>
                <HudStat icon={Target} tone="progress" value={`${testStats.currentIndex + 1}/${TOTAL_TEST_QUESTIONS}`} label="Número" />
                <HudStat icon={Clock} tone="time" value={`${elapsedTime}s`} label="Tiempo" />
              </>
            ) : (
              <>
                <HudStat icon={Trophy} tone="good" value={practiceHits} label="Aciertos" />
                <HudStat icon={Flame} tone="streak" value={practiceStreak} label="Racha" />
              </>
            )}
          </Hud>
        }
      />

      {isTestMode && (
        <div className="rmn-progress">
          <ProgressBar value={testStats.currentIndex} max={TOTAL_TEST_QUESTIONS} label="Progreso del examen" />
        </div>
      )}

      <Panel variant="inset" className="rmn-temple">
        {/* placa con el número a escribir */}
        <div className="rmn-plaque">
          <Laurel />
          <div className="rmn-plaque__body">
            <span className="rmn-plaque__rivet is-tl" aria-hidden="true" />
            <span className="rmn-plaque__rivet is-tr" aria-hidden="true" />
            <span className="rmn-plaque__rivet is-bl" aria-hidden="true" />
            <span className="rmn-plaque__rivet is-br" aria-hidden="true" />
            <span className="rmn-plaque__label">Forma el número</span>
            <motion.span
              key={targetNumber}
              className="rmn-plaque__num"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 320, damping: 20 }}
            >
              {fmt(targetNumber)}
            </motion.span>
          </div>
          <Laurel flip />
        </div>

        {/* lápida de mármol (zona donde se sueltan las fichas) */}
        <div
          ref={dropZoneRef}
          className={`rmn-tablet ${!isValid && userTiles.length > 0 ? 'is-invalid' : ''} ${tabletState}`}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <MarbleVeins />
          <div className="rmn-tablet__inner">
            {userTiles.length === 0 && (
              <span className="rmn-tablet__empty">Toca o arrastra las fichas para grabar aquí el número</span>
            )}
            <AnimatePresence mode="popLayout">
              {userTiles.map((tile) => (
                <motion.button
                  key={tile.id}
                  type="button"
                  layout
                  initial={{ scale: 0.4, opacity: 0, y: 40 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0, opacity: 0, transition: { duration: 0.15 } }}
                  transition={{ type: 'spring', stiffness: 420, damping: 28, layout: { duration: 0.2 } }}
                  className="rmn-carved"
                  onClick={() => removeTile(tile.id)}
                  aria-label={`Quitar ${tile.value}`}
                  title="Quitar"
                >
                  <RomanText value={tile.value} />
                  <span className="rmn-carved__x" aria-hidden="true"><X size={11} strokeWidth={3.2} /></span>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* sello con el valor (ayuda visual) */}
        <div className="rmn-helper" aria-live="polite">
          {showHelper && userTiles.length > 0 && (
            <span key={isValid ? currentValue : 'bad'} className={`rmn-seal gk-anim-pop ${isValid ? '' : 'is-bad'}`}>
              {isValid ? <>= {fmt(currentValue)}</> : 'No válido'}
            </span>
          )}
        </div>

        {/* cantera: fichas de piedra disponibles */}
        <div className="rmn-quarry" role="group" aria-label="Fichas de piedra">
          {availableTiles.map((tile) => (
            <button
              key={tile}
              type="button"
              className={`rmn-stone ${tile.length > 1 ? 'is-thousand' : ''}`}
              draggable="true"
              onDragStart={(e) => handleDragStart(e, tile)}
              onClick={() => addTile(tile)}
              aria-label={`Añadir ${tile}`}
            >
              <span className="rmn-stone__face"><RomanText value={tile} /></span>
            </button>
          ))}
        </div>
      </Panel>

      <div className="rmn-toggles">
        <button type="button" role="switch" aria-checked={showHelper} className={`rmn-toggle ${showHelper ? 'is-on' : ''}`} onClick={() => setShowHelper(!showHelper)}>
          <Eye size={16} /> Ayuda visual
          <span className="rmn-toggle__track" aria-hidden="true"><span className="rmn-toggle__thumb" /></span>
        </button>
        <button type="button" role="switch" aria-checked={showTable} className={`rmn-toggle ${showTable ? 'is-on' : ''}`} onClick={() => setShowTable(!showTable)}>
          <Table2 size={16} /> Tabla de valores
          <span className="rmn-toggle__track" aria-hidden="true"><span className="rmn-toggle__thumb" /></span>
        </button>
      </div>

      <AnimatePresence>
        {showTable && (
          <motion.div
            className="rmn-legend"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <div className="rmn-legend__grid">
              {ROMAN_VALUES.map((item) => (
                <div key={item.letter} className="rmn-legend__item">
                  <span className="rmn-legend__tile">{item.letter}</span>
                  <span className="rmn-legend__value">{fmt(item.value)}</span>
                </div>
              ))}
            </div>
            <ul className="rmn-legend__rules">
              <li><b>Suma:</b> una letra a la derecha de otra de igual o mayor valor suma sus valores (VI = 6, XV = 15).</li>
              <li><b>Resta:</b> las letras <b>I, X, C</b> a la izquierda de una mayor restan su valor (IV = 4, IX = 9, XL = 40).</li>
              <li><b>Repetición:</b> las letras <b>I, X, C, M</b> solo pueden repetirse hasta 3 veces seguidas.</li>
              <li><b>No repetición:</b> las letras <b>V, L, D</b> nunca se repiten ni se ponen a la izquierda de una mayor para restar.</li>
              <li><b>Restas concretas:</b> <b>I</b> solo resta a V y X; <b>X</b> solo resta a L y C; <b>C</b> solo resta a D y M.</li>
              <li><b>Multiplicación:</b> una raya horizontal sobre la letra multiplica su valor por 1.000.</li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      <RoundBanner
        show={!isTestMode && !!feedback.text}
        status={feedback.type === 'feedback-correct' ? 'won' : 'lost'}
        title={feedback.type === 'feedback-correct' ? '¡Correcto!' : 'Incorrecto'}
        subtitle={feedback.text}
      />

      <div className="rmn-actions">
        {isTestMode ? (
          <GameButton size="lg" iconRight={SkipForward} onClick={checkAnswer}>
            {isLast ? 'Finalizar' : 'Siguiente'}
          </GameButton>
        ) : (
          <>
            <GameButton size="lg" variant="success" icon={Check} onClick={checkAnswer}>Comprobar</GameButton>
            <GameButton variant="soft" icon={SkipForward} onClick={startPractice}>Nuevo número</GameButton>
          </>
        )}
        <GameButton variant="ghost" icon={Delete} onClick={removeLast} disabled={!userTiles.length} title="Borrar la última letra">Borrar</GameButton>
        <GameButton variant="ghost" icon={Eraser} onClick={clearAll} disabled={!userTiles.length} title="Borrar todas las letras">Limpiar</GameButton>
      </div>

      <div className="rmn-footer">
        {!isTestMode ? (
          <GameButton variant="soft" size="sm" icon={LayoutGrid} onClick={backToMenu}>Cambiar modo</GameButton>
        ) : (
          <span className="rmn-footer__info">Modo examen · la nota se ve al final</span>
        )}
        <span className="rmn-footer__info rmn-footer__tip">Teclado: {availableTiles.filter((t) => t.length === 1).join(' ')} · ⌫ borra</span>
      </div>

      {instructions}
    </GameShell>
  );
};

export const NumerosRomanos3 = (props) => <NumerosRomanosGame maxNumber={20} title="Números Romanos (3º)" {...props} />;
export const NumerosRomanos4 = (props) => <NumerosRomanosGame maxNumber={100} title="Números Romanos (4º)" {...props} />;
export const NumerosRomanos5 = (props) => <NumerosRomanosGame maxNumber={3999} title="Números Romanos (5º)" {...props} />;
export const NumerosRomanos6 = (props) => <NumerosRomanosGame maxNumber={1000000} title="Números Romanos (6º)" {...props} />;
export const NumerosRomanosESO = (props) => <NumerosRomanosGame maxNumber={1000000} title="Números Romanos (ESO)" {...props} />;

export default NumerosRomanosGame;
