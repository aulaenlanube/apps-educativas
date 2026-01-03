import React, { useState, useEffect, useCallback, useRef } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import confetti from 'canvas-confetti';



import './NumerosRomanos.css';

// --- UTILIDADES ---

const toRoman = (num) => {
  const map = {
    M: 1000, CM: 900, D: 500, CD: 400,
    C: 100, XC: 90, L: 50, XL: 40,
    X: 10, IX: 9, V: 5, IV: 4, I: 1,
  };
  let result = '';
  for (let key in map) {
    while (num >= map[key]) {
      result += key;
      num -= map[key];
    }
  }
  return result;
};

const isValidRoman = (romanStr) => {
  if (!romanStr) return false;
  const regex = /^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/;
  return regex.test(romanStr);
};

const fromRoman = (romanArray) => {
  if (!romanArray || romanArray.length === 0) return 0;
  const romanStr = romanArray.join('');
  if (!isValidRoman(romanStr)) return null;

  const map = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
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
  if (max <= 20) return ['I', 'V', 'X'];
  if (max <= 100) return ['I', 'V', 'X', 'L', 'C'];
  return ['I', 'V', 'X', 'L', 'C', 'D', 'M'];
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

// --- COMPONENTE PRINCIPAL ---


const NumerosRomanosGame = ({ maxNumber, title }) => {
  const [isTestMode, setIsTestMode] = useState(false);
  const [targetNumber, setTargetNumber] = useState(0);
  const [userTiles, setUserTiles] = useState([]);
  const [showHelper, setShowHelper] = useState(true);
  const [showTable, setShowTable] = useState(false);
  const [feedback, setFeedback] = useState({ text: '', type: '' });

  const dropZoneRef = useRef(null);





  const [testStats, setTestStats] = useState({
    questions: [],
    currentIndex: 0,
    score: 0,
    answers: [],
    finished: false
  });

  const generateNumber = useCallback(() => {
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
  }, [generateNumber]);

  useEffect(() => {
    startPractice();
  }, [startPractice]);

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
    const userRomanString = userTiles.map(t => t.value).join('');
    const correctRomanString = toRoman(targetNumber);
    const isCorrect = userRomanString === correctRomanString;

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



        const userVal = fromRoman(userTiles.map(t => t.value));
        if (userVal === null) {
          setFeedback({ text: `⚠️ "${userRomanString}" no es válido.`, type: 'feedback-incorrect' });
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
      if (nextStats.score > TOTAL_TEST_QUESTIONS / 2) {
        confeti();
      }
    }
  };


  // Renderizado de Resultados (Mismo contenedor)
  if (isTestMode && testStats.finished) {
    return (
      <div className="roman-container">
        <h1 className="text-4xl mb-4"><span className="gradient-text">Resultados</span></h1>
        <h2 className="text-2xl font-bold mb-4">Puntuación: {testStats.score} / {TOTAL_TEST_QUESTIONS}</h2>

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
                  delay: idx * 0.1,
                  type: "spring",
                  stiffness: 100
                }}
                className={`p-4 mb-3 rounded-xl border-2 ${ans.isCorrect ? 'bg-green-50 border-green-200 shadow-sm' : 'bg-red-50 border-red-200 shadow-sm'}`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">Pregunta {idx + 1}: <span className="text-2xl ml-2">{ans.target}</span></span>
                  {ans.isCorrect ? <span className="text-2xl">✅</span> : <span className="text-2xl">❌</span>}
                </div>
                <div className="flex justify-between items-center text-sm mt-2 pt-2 border-t border-black/5">
                  <span>Tu respuesta: <strong className="text-lg">{ans.userRoman || '-'}</strong></span>
                  {!ans.isCorrect && (
                    <span className="text-red-700 font-bold bg-white px-2 py-1 rounded-lg border border-red-100">
                      Solución: {ans.correctRoman}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>



        <div className="controles">
          <button onClick={startTest}>Repetir Test</button>
          <button onClick={() => { setIsTestMode(false); startPractice(); }} className="btn-saltar">Salir</button>
        </div>
      </div>
    );
  }

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
        <button className={`btn-mode ${isTestMode ? 'active' : ''}`} onClick={startTest}>Iniciar Test</button>
      </div>

      {/* Switch de Ayuda */}
      <div className="switch-container">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-600">Ayuda Visual</span>
            <label className="switch">
              <input type="checkbox" checked={showHelper} onChange={(e) => setShowHelper(e.target.checked)} />
              <span className="slider round"></span>
            </label>
          </div>
          <button
            className={`btn-mode text-xs py-1 px-3 ${showTable ? 'active' : ''}`}
            onClick={() => setShowTable(!showTable)}
          >
            {showTable ? 'Ocultar Tabla' : 'Ver Tabla'}
          </button>
        </div>
      </div>


      {isTestMode && <div className="text-gray-400 font-bold text-sm text-right mb-2">Pregunta {testStats.currentIndex + 1} / {TOTAL_TEST_QUESTIONS}</div>}

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
                  <h4>Reglas Principales</h4>
                  <ul>
                    <li>Se lee de izquierda a derecha, de mayor a menor valor.</li>
                    <li>Una letra no puede repetirse más de tres veces seguidas.</li>
                    <li>Letra menor a la izquierda de una mayor: <b>se resta</b> (ej: IV = 4).</li>
                    <li>Letra menor a la derecha de una mayor: <b>se suma</b> (ej: VI = 6).</li>
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

export const NumerosRomanos3 = () => <NumerosRomanosGame maxNumber={20} title="Números Romanos" />;
export const NumerosRomanos4 = () => <NumerosRomanosGame maxNumber={100} title="Números Romanos" />;
export const NumerosRomanos5y6 = () => <NumerosRomanosGame maxNumber={3999} title="Números Romanos" />;

export default NumerosRomanosGame;