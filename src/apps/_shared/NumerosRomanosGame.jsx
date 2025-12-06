import React, { useState, useEffect, useCallback } from 'react';
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

// --- COMPONENTE PRINCIPAL ---

const NumerosRomanosGame = ({ maxNumber, title }) => {
  const [isTestMode, setIsTestMode] = useState(false);
  const [targetNumber, setTargetNumber] = useState(0);
  const [userTiles, setUserTiles] = useState([]);
  const [showHelper, setShowHelper] = useState(true);
  const [feedback, setFeedback] = useState({ text: '', type: '' });
  
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

  const handleAddTile = (tile) => setUserTiles(prev => [...prev, tile]);
  const handleRemoveTile = (index) => setUserTiles(prev => prev.filter((_, i) => i !== index));
  const handleDragStart = (e, tile) => e.dataTransfer.setData('text/plain', tile);
  const handleDrop = (e) => {
    e.preventDefault();
    const tile = e.dataTransfer.getData('text/plain');
    if (tile) handleAddTile(tile);
  };
  const handleDragOver = (e) => e.preventDefault();

  const checkAnswer = () => {
    const userRomanString = userTiles.join('');
    const correctRomanString = toRoman(targetNumber);
    const isCorrect = userRomanString === correctRomanString;

    if (isTestMode) {
      handleTestNext(isCorrect, userRomanString, correctRomanString);
    } else {
      if (isCorrect) {
        setFeedback({ text: '¡Correcto! 🎉', type: 'feedback-correct' });
      } else {
        const userVal = fromRoman(userTiles);
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
    }
  };

  // Renderizado de Resultados (Mismo contenedor)
  if (isTestMode && testStats.finished) {
    return (
      <div className="roman-container">
        <h1 className="text-4xl mb-4"><span className="gradient-text">Resultados</span></h1>
        <h2 className="text-2xl font-bold mb-4">Puntuación: {testStats.score} / {TOTAL_TEST_QUESTIONS}</h2>
        
        <div className="text-left overflow-y-auto mb-6" style={{maxHeight: '300px'}}>
          {testStats.answers.map((ans, idx) => (
            <div key={idx} className={`p-3 mb-2 rounded border ${ans.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <p className="font-bold">Pregunta {idx + 1}: {ans.target}</p>
              <div className="flex justify-between text-sm mt-1">
                  <span>Tu respuesta: <strong>{ans.userRoman || '-'}</strong></span>
                  {!ans.isCorrect && <span className="text-red-600 font-bold">Solución: {ans.correctRoman}</span>}
              </div>
            </div>
          ))}
        </div>
        
        <div className="controles">
          <button onClick={startTest}>Repetir Test</button>
          <button onClick={() => { setIsTestMode(false); startPractice(); }} className="btn-saltar">Salir</button>
        </div>
      </div>
    );
  }

  const currentValue = fromRoman(userTiles);
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
          <button className={`btn-mode ${!isTestMode ? 'active' : ''}`} onClick={() => {setIsTestMode(false); startPractice();}}>Práctica Libre</button>
          <button className={`btn-mode ${isTestMode ? 'active' : ''}`} onClick={startTest}>Iniciar Test</button>
      </div>

      {/* Switch de Ayuda */}
      <div className="switch-container">
          <span className="text-sm font-bold text-gray-600">Ayuda Visual</span>
          <label className="switch">
              <input type="checkbox" checked={showHelper} onChange={(e) => setShowHelper(e.target.checked)} />
              <span className="slider round"></span>
          </label>
      </div>

      {isTestMode && <div className="text-gray-400 font-bold text-sm text-right mb-2">Pregunta {testStats.currentIndex + 1} / {TOTAL_TEST_QUESTIONS}</div>}
      
      <div className="game-area">
        <h2 className="text-xl text-gray-600">Forma el número:</h2>
        <div className="target-number">{targetNumber}</div>

        <div className={`drop-zone ${!isValid && userTiles.length > 0 ? 'border-red-300 bg-red-50' : ''}`}
            onDragOver={handleDragOver} onDrop={handleDrop}>
            {userTiles.map((tile, index) => (
                <div key={index} className="roman-tile" onClick={() => handleRemoveTile(index)}>
                    {tile}
                </div>
            ))}
        </div>

        <div className="helper-display">
            {showHelper && userTiles.length > 0 && (
                <span className="fade-in">
                   {isValid ? <strong className="text-green-600 text-2xl">{currentValue}</strong> : <strong className="text-red-500">No válido</strong>}
                </span>
            )}
        </div>

        {!isTestMode && feedback.text && (
            <div className={`feedback-message ${feedback.type}`}>{feedback.text}</div>
        )}

        <div className="palette">
            {getAvailableTiles(maxNumber).map(tile => (
                <div key={tile} className="roman-tile" draggable="true"
                    onDragStart={(e) => handleDragStart(e, tile)}
                    onClick={() => handleAddTile(tile)}>
                    {tile}
                </div>
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