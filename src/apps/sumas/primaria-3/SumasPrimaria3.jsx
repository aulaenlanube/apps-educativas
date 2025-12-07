import React, { useCallback, useEffect, useMemo, useState } from 'react';
import '/src/apps/_shared/Sumas.css';

const TOTAL_TEST_QUESTIONS = 5;

/** Calcula las llevadas por columna (de izquierda a derecha) para un resultado con `columnCount` columnas */
function computeCarriesGeneral(a, b, columnCount) {
  const A = a.toString().padStart(columnCount, '0').split('').map(d => parseInt(d, 10));
  const B = b.toString().padStart(columnCount, '0').split('').map(d => parseInt(d, 10));
  const carries = Array(columnCount - 1).fill(0);
  let carry = 0;
  for (let i = columnCount - 1; i >= 0; i--) {
    const sum = A[i] + B[i] + carry;
    const nextCarry = Math.floor(sum / 10);
    if (i - 1 >= 0) carries[i - 1] = nextCarry; // llevada que caerá sobre la columna de la izquierda
    carry = nextCarry;
  }
  return carries;
}

/** Tablero React (cifras dinámicas 3 o 4 + columna extra para posible llevada final a la izquierda) */
function ProblemBoard({
  num1, num2, cifras,
  showCarries,
  resultSlots, setResultSlots,          // longitud = columnCount
  carrySlots, setCarrySlots,            // longitud = columnCount - 1
  checkInfo,                            // { show, correctResult, correctCarries[] }
  activeSlot, setActiveSlot
}) {
  const columnCount = cifras + 1; // añadimos columna extra a la izquierda
  const d1 = useMemo(() => num1.toString().padStart(columnCount, ' ').split(''), [num1, columnCount]);
  const d2 = useMemo(() => num2.toString().padStart(columnCount, ' ').split(''), [num2, columnCount]);

  const onDragOver = (e) => e.preventDefault();

  const dropResult = (i, e) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    if (!/^\d$/.test(data)) return;
    setResultSlots(prev => {
      const next = [...prev];
      next[i] = data;
      return next;
    });
    setActiveSlot({ type: 'result', index: i });
  };
  const clearResult = (i) => {
    setResultSlots(prev => {
      const next = [...prev];
      next[i] = '';
      return next;
    });
    setActiveSlot({ type: 'result', index: i });
  };

  const dropCarry = (i, e) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    if (!/^\d$/.test(data)) return;
    setCarrySlots(prev => {
      const next = [...prev];
      next[i] = data;
      return next;
    });
    setActiveSlot({ type: 'carry', index: i });
  };
  const clearCarry = (i) => {
    setCarrySlots(prev => {
      const next = [...prev];
      next[i] = '';
      return next;
    });
    setActiveSlot({ type: 'carry', index: i });
  };

  const handleSlotClick = (type, index, e) => {
    e.stopPropagation();
    if (activeSlot && activeSlot.type === type && activeSlot.index === index) {
      setActiveSlot(null);
    } else {
      setActiveSlot({ type, index });
    }
  };

  // Clases de corrección (solo cuando checkInfo.show)
  const resultCls = (i) => {
    if (!checkInfo?.show) return '';
    const user = (resultSlots[i] || '0');
    const ok = user === checkInfo.correctResult[i];
    return ok ? 'correct' : 'incorrect';
  };
  const carryCls = (i) => {
    if (!checkInfo?.show) return '';
    const expected = (checkInfo.correctCarries?.[i] ?? 0).toString();
    const user = carrySlots[i] || '';
    const ok = user === '' ? expected === '0' : user === expected;
    return ok ? 'correct' : 'incorrect';
  };

  const isSelected = (type, index) => activeSlot?.type === type && activeSlot?.index === index;

  return (
    <div className={`board ${!showCarries ? 'carries-hidden' : ''}`}>
      <div className="operator">+</div>

      {Array.from({ length: columnCount }).map((_, i) => (
        <div className="column" key={i}>
          {/* Carry box en todas salvo la última (derecha/unidades) */}
          {i < columnCount - 1 ? (
            <div
              className={`box carry-box ${carryCls(i)} ${isSelected('carry', i) ? 'selected' : ''}`}
              onDragOver={onDragOver}
              onDrop={(e) => dropCarry(i, e)}
              onClick={(e) => handleSlotClick('carry', i, e)}
            >
              {carrySlots[i]}
            </div>
          ) : (
            <div className="carry-placeholder" />
          )}

          <div className="digit-display">{d1[i]}</div>
          <div className="digit-display">{d2[i]}</div>
          <hr className="operation-line" />

          <div
            className={`box result-box ${resultSlots[i] ? 'filled' : ''} ${resultCls(i)} ${isSelected('result', i) ? 'selected' : ''}`}
            onDragOver={onDragOver}
            onDrop={(e) => dropResult(i, e)}
            onClick={(e) => handleSlotClick('result', i, e)}
          >
            {resultSlots[i]}
          </div>
        </div>
      ))}

      <div className="operator-spacer" />
    </div>
  );
}

/** App 3º Primaria: práctica + test (3 o 4 cifras con llevadas opcionales) */
const SumasPrimaria3 = () => {
  // Estado núcleo
  const [current, setCurrent] = useState({ num1: 0, num2: 0, cifras: 3 });
  const [showCarries, setShowCarries] = useState(true);

  // Slots del tablero (dependen de cifras)
  const [resultSlots, setResultSlots] = useState(['', '', '', '']); 
  const [carrySlots, setCarrySlots] = useState(['', '', '']);
  const [activeSlot, setActiveSlot] = useState(null);

  // Feedback práctica
  const [feedback, setFeedback] = useState({ text: '', cls: '' });
  const [checkInfo, setCheckInfo] = useState({ show: false, correctResult: '', correctCarries: [] });

  // Test
  const [isTestMode, setIsTestMode] = useState(false);
  const [testQuestions, setTestQuestions] = useState([]); // [{num1,num2,cifras}]
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);     // ["cadena de dígitos por columna"]
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  /** Generar ejercicio de 3 ó 4 cifras */
  const generateOperands = useCallback(() => {
    const cifras = Math.random() < 0.5 ? 3 : 4;
    const min = cifras === 3 ? 100 : 1000;
    const max = cifras === 3 ? 999 : 9999;
    const num1 = Math.floor(Math.random() * (max - min + 1)) + min;
    const num2 = Math.floor(Math.random() * (max - min + 1)) + min;
    return { num1, num2, cifras };
  }, []);

  /** Ajusta tablero a partir de operandos (práctica o test) */
  const loadExercise = useCallback(({ num1, num2, cifras }) => {
    const columnCount = cifras + 1;
    setCurrent({ num1, num2, cifras });
    setResultSlots(Array(columnCount).fill(''));
    setCarrySlots(Array(columnCount - 1).fill(''));
    setActiveSlot(null);
    setFeedback({ text: '', cls: '' });

    const correctResult = (num1 + num2).toString().padStart(columnCount, '0');
    const correctCarries = computeCarriesGeneral(num1, num2, columnCount);
    setCheckInfo({ show: false, correctResult, correctCarries });
  }, []);

  const handlePaletteClick = (val) => {
    if (!activeSlot) return;
    const { type, index } = activeSlot;
    const strVal = val.toString();

    if (type === 'result') {
      setResultSlots(prev => {
        const n = [...prev];
        n[index] = strVal;
        return n;
      });
    } else if (type === 'carry') {
      setCarrySlots(prev => {
        const n = [...prev];
        n[index] = strVal;
        return n;
      });
    }
  };

  /** PRÁCTICA */
  const startPractice = useCallback(() => {
    loadExercise(generateOperands());
  }, [generateOperands, loadExercise]);

  const checkPractice = useCallback(() => {
    const columnCount = current.cifras + 1;
    const correct = (current.num1 + current.num2).toString().padStart(columnCount, '0');
    const user = resultSlots.map(x => x || '0').join('');
    const carriesOk = computeCarriesGeneral(current.num1, current.num2, columnCount);
    setCheckInfo({ show: true, correctResult: correct, correctCarries: carriesOk });

    if (user === correct) {
      setFeedback({ text: '¡Excelente! ¡Suma correcta! 🎉', cls: 'feedback-correct' });
      setActiveSlot(null);
    } else {
      setFeedback({ text: 'Casi... ¡Revisa las casillas!', cls: 'feedback-incorrect' });
    }
  }, [current, resultSlots]);

  /** TEST */
  const startTest = useCallback(() => {
    const qs = Array.from({ length: TOTAL_TEST_QUESTIONS }, () => generateOperands());
    setTestQuestions(qs);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setShowResults(false);
    setScore(0);
    setIsTestMode(true);
    loadExercise(qs[0]);
  }, [generateOperands, loadExercise]);

  const handleNextQuestion = useCallback(() => {
    const user = resultSlots.map(x => x || '0').join('');
    const newAnswers = [...userAnswers, user];
    setUserAnswers(newAnswers);

    const isLast = currentQuestionIndex >= TOTAL_TEST_QUESTIONS - 1;
    if (!isLast) {
      const next = currentQuestionIndex + 1;
      setCurrentQuestionIndex(next);
      loadExercise(testQuestions[next]);
    } else {
      let correctCount = 0;
      testQuestions.forEach((q, i) => {
        const colCount = q.cifras + 1;
        const correct = (q.num1 + q.num2).toString().padStart(colCount, '0');
        if (newAnswers[i] === correct) correctCount++;
      });
      setScore(correctCount * 200);
      setShowResults(true);
    }
  }, [resultSlots, userAnswers, currentQuestionIndex, testQuestions, loadExercise]);

  const exitTestMode = useCallback(() => {
    setIsTestMode(false);
    setShowResults(false);
    startPractice();
  }, [startPractice]);

  useEffect(() => { startPractice(); }, [startPractice]);

  // Progreso test
  const progressPct = ((currentQuestionIndex + 1) / TOTAL_TEST_QUESTIONS) * 100;

  return (
    <div id="app-container">
      <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
        <span role="img" aria-label="Suma">🧮</span>{' '}
        <span className="gradient-text">Suma como en el cole</span>
      </h1>

      {/* Modo */}
      <div className="mode-selection">
        <button
          className={`btn-mode ${!isTestMode ? 'active' : ''}`}
          onClick={() => { setIsTestMode(false); setShowResults(false); startPractice(); }}
        >
          Práctica Libre
        </button>
        <button className="btn-mode" onClick={startTest}>Iniciar Test</button>
      </div>

      {/* Toggle llevadas */}
      <div id="options-area" style={{ display:'flex', alignItems:'center', gap:12, justifyContent:'center', marginBottom:8 }}>
        <label htmlFor="help-toggle">Ayuda con llevadas</label>
        <label className="switch">
          <input
            type="checkbox"
            id="help-toggle"
            checked={showCarries}
            onChange={() => setShowCarries(v => !v)}
          />
          <span className="slider round"></span>
        </label>
      </div>

      {/* Cabecera y progreso Test */}
      {isTestMode && !showResults && (
        <>
          <div className="test-header">
            <div>Pregunta {currentQuestionIndex + 1} / {TOTAL_TEST_QUESTIONS}</div>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${progressPct}%` }} />
          </div>
        </>
      )}

      {/* Tablero: se oculta en resultados */}
      {!(isTestMode && showResults) && (
        <ProblemBoard
          num1={current.num1}
          num2={current.num2}
          cifras={current.cifras}
          showCarries={showCarries}
          resultSlots={resultSlots} setResultSlots={setResultSlots}
          carrySlots={carrySlots}   setCarrySlots={setCarrySlots}
          checkInfo={checkInfo}
          activeSlot={activeSlot} setActiveSlot={setActiveSlot}
        />
      )}

      {/* Controles práctica */}
      {!isTestMode && (
        <>
          <div id="feedback-message" className={feedback.cls}>{feedback.text}</div>
          <div id="controls">
            <button id="check-button" onClick={checkPractice}>Comprobar</button>
            <button id="new-problem-button" onClick={startPractice}>Nueva Suma</button>
          </div>
        </>
      )}

      {/* Controles de Test */}
      {isTestMode && !showResults && (
        <div className="controles" style={{ marginTop: 16 }}>
          <button onClick={handleNextQuestion} className="btn-test">
            {currentQuestionIndex === TOTAL_TEST_QUESTIONS - 1 ? 'Finalizar' : 'Siguiente'}
          </button>
        </div>
      )}

      {/* Paleta de números: oculta en resultados */}
      {!showResults && (
        <div id="number-palette">
          <h2>Arrastra o pulsa los números 👇</h2>
          <div className="number-tiles-container">
            {[...Array(10).keys()].map(n => (
              <div
                key={n}
                className="number-tile"
                draggable="true"
                onDragStart={(e) => e.dataTransfer.setData('text/plain', n)}
                onClick={() => handlePaletteClick(n)}
              >
                {n}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resultados del Test */}
      {isTestMode && showResults && (
        <div className="test-results" style={{ marginTop: 20 }}>
          <h2 className="score">Puntuación: <span>{score}</span></h2>
          <div className="results-summary" style={{ marginTop: 12 }}>
            {testQuestions.map((q, i) => {
              const colCount = q.cifras + 1;
              const correct = (q.num1 + q.num2).toString().padStart(colCount, '0');
              const user = userAnswers[i] || 'No contestada';
              const ok = user === correct;
              return (
                <div key={i} className="result-item">
                  <p><strong>Suma {i + 1}:</strong> {q.num1} + {q.num2}</p>
                  <p className={ok ? 'correcta' : 'incorrecta'}>Tu respuesta: {user}</p>
                  {!ok && <p className="correcta">Solución: {correct}</p>}
                </div>
              );
            })}
          </div>
          <div className="test-controls" style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16 }}>
            <button onClick={startTest} className="btn-test">Volver a intentar</button>
            <button onClick={() => { setIsTestMode(false); exitTestMode(); }} className="btn-mode">Modo Práctica</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SumasPrimaria3;
