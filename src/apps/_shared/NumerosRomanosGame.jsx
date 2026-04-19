import React, { useState, useEffect, useCallback, useRef } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import confetti from 'canvas-confetti';



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

const isValidRoman = (romanStr) => {
  // Wrapper para mantener compatibilidad si se llama con string
  // Pero idealmente fromRoman debería pasar array
  return true; // Deprecated for internal array check
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

// --- COMPONENTE PRINCIPAL ---


const NumerosRomanosGame = ({ maxNumber, title, onGameComplete }) => {
  const [isTestMode, setIsTestMode] = useState(false);
  const [targetNumber, setTargetNumber] = useState(0);
  const [userTiles, setUserTiles] = useState([]);
  const [showHelper, setShowHelper] = useState(true);
  const [showTable, setShowTable] = useState(false);
  const [feedback, setFeedback] = useState({ text: '', type: '' });

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
        setFeedback({ text: '¡Correcto! 🎉', type: 'feedback-correct' });
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
        const tilesStr = userTiles.map(t => t.value);
        const userVal = fromRoman(tilesStr);
        if (userVal === null) {
          setFeedback({ text: `⚠️ Estructura no válida. Revisa las reglas.`, type: 'feedback-incorrect' });
        } else {
          setFeedback({ text: `Incorrecto. Eso es ${userVal}.`, type: 'feedback-incorrect' });
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

  // Renderizado de Resultados (Mismo contenedor)
  if (isTestMode && testStats.finished) {
    const correct = testStats.score;
    const nota = Math.round((correct / TOTAL_TEST_QUESTIONS) * 100) / 10;
    const notaColor = nota >= 8 ? 'excellent' : nota >= 5 ? 'good' : 'fail';
    const notaMsg = nota >= 9 ? '¡Excelente! 🌟'
      : nota >= 7 ? '¡Muy bien! 👏'
      : nota >= 5 ? 'Aprobado 💪'
      : 'Necesitas repasar 📖';
    const points = computeRomanScore(correct, finalTime);

    return (
      <div className="roman-container">
        <h1 className="text-4xl mb-2"><span className="gradient-text">¡Examen completado!</span></h1>

        <div className={`roman-nota ${notaColor}`}>
          <div className="roman-nota-big">{nota.toFixed(1)}<span className="roman-nota-small">/10</span></div>
          <div className="roman-nota-msg">{notaMsg}</div>
        </div>

        <div className="roman-score-row">
          <span className="roman-score-chip points"><strong>{points.toLocaleString('es-ES')}</strong> puntos</span>
          <span className="roman-score-chip">{correct}/{TOTAL_TEST_QUESTIONS} aciertos</span>
          <span className="roman-score-chip">⏱ {finalTime}s</span>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-left overflow-y-auto mb-6"
          style={{ maxHeight: '300px', paddingRight: '10px' }}
        >
          <AnimatePresence>
            {testStats.answers.map((ans, idx) => (
              <motion.div
                key={idx}
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{
                  delay: idx * 0.05,
                  type: "spring",
                  stiffness: 100
                }}
                className={`roman-answer-card ${ans.isCorrect ? 'ok' : 'ko'}`}
              >
                <div className="roman-answer-row">
                  <span className="roman-answer-q">Pregunta {idx + 1}: <strong>{ans.target}</strong></span>
                  <span className="roman-answer-icon">{ans.isCorrect ? '✅' : '❌'}</span>
                </div>
                <div className="roman-answer-row small">
                  <span>Tu respuesta: <strong>{ans.userRoman || '-'}</strong></span>
                  {!ans.isCorrect && (
                    <span className="roman-answer-sol">Solución: {ans.correctRoman}</span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>



        <div className="controles">
          <button onClick={startTest}>Repetir examen</button>
          <button onClick={() => { setIsTestMode(false); startPractice(); }} className="btn-saltar">Salir</button>
        </div>
      </div>
    );
  }

  // Calcular valor actual para el helper visual
  const currentValue = fromRoman(userTiles.map(t => t.value));
  const isValid = currentValue !== null;


  return (
    <div className="roman-container">
      {/* Título dentro del contenedor blanco */}
      <h1 className="text-4xl mb-2">
        <span role="img" aria-label="Romanos">🏛️</span> <span className="gradient-text">{title}</span>
      </h1>
      <p className="instrucciones">Arrastra las fichas para formar el número romano correcto.</p>

      {/* Selectores de Modo dentro del contenedor */}
      <div className="mode-selection">
        <button className={`btn-mode ${!isTestMode ? 'active' : ''}`} onClick={() => { setIsTestMode(false); startPractice(); }}>Práctica Libre</button>
        <button className={`btn-mode ${isTestMode ? 'active' : ''}`} onClick={startTest}>Iniciar examen</button>
      </div>

      {/* Switch de Ayuda */}
      <div className="switch-container">
        <div className="flex flex-wrap items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-600">Ayuda Visual</span>
            <label className="switch">
              <input type="checkbox" checked={showHelper} onChange={(e) => setShowHelper(e.target.checked)} />
              <span className="slider round"></span>
            </label>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-600">Ayuda Valores</span>
            <label className="switch">
              <input type="checkbox" checked={showTable} onChange={(e) => setShowTable(e.target.checked)} />
              <span className="slider round"></span>
            </label>
          </div>
        </div>
      </div>


      {isTestMode && (
        <div className="roman-test-header">
          <span className="roman-test-chip counter">Pregunta {testStats.currentIndex + 1} / {TOTAL_TEST_QUESTIONS}</span>
          <span className="roman-test-chip timer">⏱ {elapsedTime}s</span>
        </div>
      )}
      {isTestMode && (
        <div className="roman-progress">
          <div
            className="roman-progress-bar"
            style={{ width: `${((testStats.currentIndex) / TOTAL_TEST_QUESTIONS) * 100}%` }}
          />
        </div>
      )}

      <div className="game-area">
        <h2 className="text-xl text-gray-600">Forma el número:</h2>
        <motion.div
          key={targetNumber}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="target-number"
        >
          {targetNumber}
        </motion.div>


        <div
          ref={dropZoneRef}
          className={`drop-zone ${!isValid && userTiles.length > 0 ? 'border-red-300 bg-red-50' : ''}`}
          onDragOver={handleDragOver} onDrop={handleDrop}
        >


          <AnimatePresence mode="popLayout">
            {userTiles.map((tile) => (
              <motion.div
                key={tile.id}
                layout
                initial={{ scale: 0.5, opacity: 0, y: 150, rotate: -10 }}
                animate={{ scale: 1, opacity: 1, y: 0, rotate: 0 }}
                exit={{
                  scale: 0,
                  opacity: 0,
                  transition: { duration: 0.15 }
                }}
                whileHover={{ scale: 1.05, rotate: 2 }}
                whileTap={{ scale: 0.95 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 30,
                  layout: { duration: 0.2 }
                }}
                className="roman-tile"
                onClick={() => handleRemoveTile(tile.id)}
              >
                {tile.value}
                <div className="delete-btn">
                  <X />
                </div>
              </motion.div>

            ))}
          </AnimatePresence>
        </div>




        <div className="helper-display">
          {showHelper && userTiles.length > 0 && (
            <span className="fade-in">
              {isValid ? <strong className="text-green-600 text-2xl">{currentValue}</strong> : <strong className="text-red-500">No válido</strong>}
            </span>
          )}
        </div>

        <AnimatePresence>
          {showTable && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="roman-reference-table">
                <h3>Valores de las letras</h3>
                <div className="reference-grid">
                  {ROMAN_VALUES.map(item => (
                    <div key={item.letter} className="reference-item">
                      <div className="ref-tile">{item.letter}</div>
                      <div className="ref-value">{item.value}</div>
                    </div>
                  ))}
                </div>
                <div className="roman-rules">
                  <h4>Reglas de los Números Romanos</h4>
                  <ul>
                    <li><b>Suma:</b> Una letra a la derecha de otra de igual o mayor valor suma sus valores (ej: VI = 6, XV = 15).</li>
                    <li><b>Resta:</b> Las letras <b>I, X, C</b> a la izquierda de una mayor restan su valor (ej: IV = 4, IX = 9, XL = 40).</li>
                    <li><b>Repetición:</b> Las letras <b>I, X, C, M</b> solo pueden repetirse hasta 3 veces seguidas.</li>
                    <li><b>No Repetición:</b> Las letras <b>V, L, D</b> nunca se repiten ni se ponen a la izquierda de una mayor para restar.</li>
                    <li><b>Restas específicas:</b> <b>I</b> solo resta a V y X; <b>X</b> solo resta a L y C; <b>C</b> solo resta a D y M.</li>
                    <li><b>Multiplicación:</b> Una raya horizontal sobre la letra multiplica su valor por 1.000.</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>


        <AnimatePresence mode="wait">
          {!isTestMode && feedback.text && (
            <motion.div
              key={feedback.text}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`feedback-message ${feedback.type}`}
            >
              {feedback.text}
            </motion.div>
          )}
        </AnimatePresence>


        <div className="palette">
          {getAvailableTiles(maxNumber).map(tile => (
            <motion.div
              key={tile}
              whileHover={{ scale: 1.1, translateY: -2 }}
              whileTap={{ scale: 0.9 }}
              className="roman-tile"
              draggable="true"
              onDragStart={(e) => handleDragStart(e, tile)}
              onClick={() => handleAddTile(tile)}
            >
              {tile}
            </motion.div>
          ))}
        </div>


        <div className="controles">
          {isTestMode ? (
            <button onClick={checkAnswer}>
              {testStats.currentIndex === TOTAL_TEST_QUESTIONS - 1 ? 'Finalizar' : 'Siguiente'}
            </button>
          ) : (
            <>
              <button onClick={checkAnswer}>Comprobar</button>
              <button onClick={startPractice} className="btn-saltar">Nuevo Número</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export const NumerosRomanos3 = (props) => <NumerosRomanosGame maxNumber={20} title="Números Romanos (3º)" {...props} />;
export const NumerosRomanos4 = (props) => <NumerosRomanosGame maxNumber={100} title="Números Romanos (4º)" {...props} />;
export const NumerosRomanos5 = (props) => <NumerosRomanosGame maxNumber={3999} title="Números Romanos (5º)" {...props} />;
export const NumerosRomanos6 = (props) => <NumerosRomanosGame maxNumber={1000000} title="Números Romanos (6º)" {...props} />;
export const NumerosRomanosESO = (props) => <NumerosRomanosGame maxNumber={1000000} title="Números Romanos (ESO)" {...props} />;

export default NumerosRomanosGame;