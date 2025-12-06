import React, { useState, useEffect, useCallback } from 'react';
import './NumerosRomanos.css';

// --- UTILIDADES ---

// Convierte de Arábigo a Romano
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

// Validación estricta usando Regex (1-3999)
const isValidRoman = (romanStr) => {
  if (!romanStr) return false;
  // Regex desglosada:
  // ^M{0,3}            -> Inicio: 0 a 3 M (0-3000)
  // (CM|CD|D?C{0,3})   -> Centenas: 900 (CM), 400 (CD), o D opcional seguido de 0-3 C (ej: DCC)
  // (XC|XL|L?X{0,3})   -> Decenas: 90 (XC), 40 (XL), o L opcional seguido de 0-3 X
  // (IX|IV|V?I{0,3})$  -> Unidades: 9 (IX), 4 (IV), o V opcional seguido de 0-3 I
  const regex = /^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/;
  return regex.test(romanStr);
};

// Convierte de Romano a Arábigo con validación
const fromRoman = (romanArray) => {
  if (!romanArray || romanArray.length === 0) return 0;
  
  const romanStr = romanArray.join('');
  
  // Si no cumple las reglas estrictas, devolvemos null
  if (!isValidRoman(romanStr)) {
    return null; 
  }
  
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

// Determina qué fichas mostrar según el rango máximo
const getAvailableTiles = (max) => {
  if (max <= 20) return ['I', 'V', 'X']; // 3º Primaria
  if (max <= 100) return ['I', 'V', 'X', 'L', 'C']; // 4º Primaria
  return ['I', 'V', 'X', 'L', 'C', 'D', 'M']; // 5º y 6º Primaria
};

const TOTAL_TEST_QUESTIONS = 10;

// --- COMPONENTE PRINCIPAL ---

const NumerosRomanosGame = ({ maxNumber, title }) => {
  const [isTestMode, setIsTestMode] = useState(false);
  const [targetNumber, setTargetNumber] = useState(0);
  const [userTiles, setUserTiles] = useState([]); // Array de letras ['X', 'I', 'V']
  const [showHelper, setShowHelper] = useState(true);
  const [feedback, setFeedback] = useState({ text: '', type: '' });
  
  // Estado del Test
  const [testStats, setTestStats] = useState({
    questions: [], // array de números objetivo
    currentIndex: 0,
    score: 0,
    answers: [], // { target, userRoman, correctRoman, isCorrect }
    finished: false
  });

  // Generar nueva pregunta
  const generateNumber = useCallback(() => {
    return Math.floor(Math.random() * maxNumber) + 1;
  }, [maxNumber]);

  // Iniciar Práctica
  const startPractice = useCallback(() => {
    setTargetNumber(generateNumber());
    setUserTiles([]);
    setFeedback({ text: '', type: '' });
  }, [generateNumber]);

  // Iniciar Test
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

  // Manejadores de Interacción
  const handleAddTile = (tile) => {
    setUserTiles(prev => [...prev, tile]);
  };

  const handleRemoveTile = (index) => {
    setUserTiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragStart = (e, tile) => {
    e.dataTransfer.setData('text/plain', tile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const tile = e.dataTransfer.getData('text/plain');
    if (tile) handleAddTile(tile);
  };

  const handleDragOver = (e) => e.preventDefault();

  // Comprobar respuesta
  const checkAnswer = () => {
    const userRomanString = userTiles.join('');
    const correctRomanString = toRoman(targetNumber);
    const isCorrect = userRomanString === correctRomanString;

    if (isTestMode) {
      handleTestNext(isCorrect, userRomanString, correctRomanString);
    } else {
      if (isCorrect) {
        setFeedback({ text: '¡Correcto! 🎉', type: 'feedback-correct' });
        setTimeout(startPractice, 1500);
      } else {
        // En práctica, damos feedback más detallado
        const userVal = fromRoman(userTiles);
        
        if (userVal === null) {
          setFeedback({ 
            text: `⚠️ La secuencia "${userRomanString}" no es un número romano válido.`, 
            type: 'feedback-incorrect' 
          });
        } else {
          setFeedback({ 
            text: `Incorrecto. Has escrito ${userVal} (${userRomanString}), pero buscamos ${targetNumber}.`, 
            type: 'feedback-incorrect' 
          });
        }
      }
    }
  };

  const handleTestNext = (isCorrect, userRoman, correctRoman) => {
    const nextStats = {
      ...testStats,
      score: isCorrect ? testStats.score + 1 : testStats.score,
      answers: [...testStats.answers, { 
        target: targetNumber, 
        userRoman, 
        correctRoman, 
        isCorrect 
      }]
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

  // Renderizado de Resultados
  if (isTestMode && testStats.finished) {
    return (
      <div id="app-container" className="roman-container">
        <h1 className="text-4xl font-extrabold mb-4 gradient-text">Resultados</h1>
        <div className="roman-card" style={{justifyContent: 'flex-start'}}>
          <h2 className="text-2xl font-bold mb-4">Puntuación: {testStats.score} / {TOTAL_TEST_QUESTIONS}</h2>
          <div className="text-left overflow-y-auto" style={{maxHeight: '400px'}}>
            {testStats.answers.map((ans, idx) => (
              <div key={idx} className={`p-3 mb-2 rounded border ${ans.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <p className="font-bold text-lg">Pregunta {idx + 1}: Convertir {ans.target}</p>
                <div className="flex justify-between items-center mt-1">
                    <span>Tu respuesta: <strong>{ans.userRoman || '(vacío)'}</strong></span>
                    {ans.isCorrect ? <span>✅</span> : <span className="text-red-600 font-bold">Solución: {ans.correctRoman}</span>}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex gap-4 justify-center">
            <button onClick={startTest} className="btn-test">Repetir Test</button>
            <button onClick={() => { setIsTestMode(false); startPractice(); }} className="btn-mode">Volver a Práctica</button>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDERIZADO DEL JUEGO ---
  const currentValue = fromRoman(userTiles);
  const isValid = currentValue !== null;

  return (
    <div id="app-container" className="roman-container">
      <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight mb-2">
        <span role="img" aria-label="Romanos">🏛️</span>{' '}
        <span className="gradient-text">{title}</span>
      </h1>

      {/* Controles Superiores */}
      <div className="controls-row">
        <div className="mode-selection flex gap-2">
            <button className={`btn-mode ${!isTestMode ? 'active' : ''}`} onClick={() => {setIsTestMode(false); startPractice();}}>Práctica</button>
            <button className={`btn-mode ${isTestMode ? 'active' : ''}`} onClick={startTest}>Test</button>
        </div>
        
        <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm border">
            <span className="text-sm font-bold text-gray-600">Ayuda</span>
            <label className="switch">
                <input type="checkbox" checked={showHelper} onChange={(e) => setShowHelper(e.target.checked)} />
                <span className="slider round"></span>
            </label>
        </div>
      </div>

      <div className="roman-card">
        {isTestMode && <div className="text-gray-400 font-bold text-sm text-right">Pregunta {testStats.currentIndex + 1} / {TOTAL_TEST_QUESTIONS}</div>}
        
        <div>
            <h2 className="text-xl text-gray-600">Convierte a Números Romanos:</h2>
            <div className="target-number">{targetNumber}</div>
        </div>

        {/* Zona de Drop */}
        <div 
            className={`drop-zone ${!isValid && userTiles.length > 0 ? 'border-red-300 bg-red-50' : ''}`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            {userTiles.map((tile, index) => (
                <div 
                    key={index} 
                    className="roman-tile"
                    onClick={() => handleRemoveTile(index)}
                    title="Clic para borrar"
                >
                    {tile}
                </div>
            ))}
        </div>

        {/* Ayuda Visual en tiempo real */}
        <div className="helper-display" style={{minHeight: '2rem'}}>
            {showHelper && userTiles.length > 0 && (
                <span className="fade-in">
                   {isValid ? (
                     <>Llevas formado: <strong className="text-green-600 text-2xl">{currentValue}</strong></>
                   ) : (
                     <strong className="text-red-500">❌ Número no válido</strong>
                   )}
                </span>
            )}
        </div>

        {/* Feedback en modo práctica */}
        {!isTestMode && feedback.text && (
            <div className={`feedback-message ${feedback.type} mb-4`}>
                {feedback.text}
            </div>
        )}

        {/* Paleta de Fichas Draggable */}
        <div className="palette">
            {getAvailableTiles(maxNumber).map(tile => (
                <div 
                    key={tile}
                    className="roman-tile"
                    draggable="true"
                    onDragStart={(e) => handleDragStart(e, tile)}
                    onClick={() => handleAddTile(tile)}
                >
                    {tile}
                </div>
            ))}
        </div>

        <button onClick={checkAnswer} className="btn-test w-full mt-4 text-xl py-3">
            {isTestMode ? (testStats.currentIndex === TOTAL_TEST_QUESTIONS - 1 ? 'Finalizar' : 'Siguiente') : 'Comprobar'}
        </button>
      </div>
    </div>
  );
};

// --- WRAPPERS EXPORTADOS PARA CADA NIVEL ---
export const NumerosRomanos3 = () => <NumerosRomanosGame maxNumber={20} title="Números Romanos (1-20)" />;
export const NumerosRomanos4 = () => <NumerosRomanosGame maxNumber={100} title="Números Romanos (1-100)" />;
export const NumerosRomanos5y6 = () => <NumerosRomanosGame maxNumber={3999} title="Números Romanos Avanzados" />;

export default NumerosRomanosGame;