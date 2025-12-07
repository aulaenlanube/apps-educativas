import React, { useCallback, useEffect, useMemo, useState } from 'react';
import '/src/apps/_shared/Sumas.css';

const TOTAL_TEST_QUESTIONS = 5;

/** Calcula llevadas para varios sumandos (nums) con columnCount columnas (incluye la extra de la izquierda). */
function computeCarriesMany(nums, columnCount) {
  const padded = nums.map(n =>
    n.toString().padStart(columnCount, '0').split('').map(d => parseInt(d, 10))
  );
  const carries = Array(columnCount - 1).fill(0);
  let carry = 0;
  for (let i = columnCount - 1; i >= 0; i--) {
    const colSum = padded.reduce((acc, arr) => acc + arr[i], 0) + carry;
    const nextCarry = Math.floor(colSum / 10);
    if (i - 1 >= 0) carries[i - 1] = nextCarry;
    carry = nextCarry;
  }
  return carries;
}

/** Tablero React para 3 ó 4 cifras + 3 sumandos, con llevadas opcionales. */
function ProblemBoard({
  nums, cifras,
  showCarries,
  resultSlots, setResultSlots,     // length = columnCount
  carrySlots, setCarrySlots,       // length = columnCount - 1
  checkInfo,                       // { show, correctResult, correctCarries[] }
  activeSlot, setActiveSlot
}) {
  const columnCount = cifras + 1; // añadimos columna extra a la izquierda (posible llevada final)
  const digitRows = useMemo(
    () => nums.map(n => n.toString().padStart(columnCount, ' ').split('')),
    [nums, columnCount]
  );

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

      {Array.from({ length: columnCount }).map((_, colIdx) => (
        <div className="column" key={colIdx}>
          {/* Carry en todas menos la última (unidades) */}
          {colIdx < columnCount - 1 ? (
            <div
              className={`box carry-box ${carryCls(colIdx)} ${isSelected('carry', colIdx) ? 'selected' : ''}`}
              onDragOver={onDragOver}
              onDrop={(e) => dropCarry(colIdx, e)}
              onClick={(e) => handleSlotClick('carry', colIdx, e)}
            >
              {carrySlots[colIdx]}
            </div>
          ) : (
            <div className="carry-placeholder" />
          )}

          {/* Tres filas de dígitos (tres sumandos) */}
          {digitRows.map((row, r) => (
            <div className="digit-display" key={`r${r}`}>{row[colIdx]}</div>
          ))}

          <hr className="operation-line" />

          <div
            className={`box result-box ${resultSlots[colIdx] ? 'filled' : ''} ${resultCls(colIdx)} ${isSelected('result', colIdx) ? 'selected' : ''}`}
            onDragOver={onDragOver}
            onDrop={(e) => dropResult(colIdx, e)}
            onClick={(e) => handleSlotClick('result', colIdx, e)}
          >
            {resultSlots[colIdx]}
          </div>
        </div>
      ))}

      <div className="operator-spacer" />
    </div>
  );
}

const SumasPrimaria4 = () => {
  // Estado principal (3 sumandos, 3 o 4 cifras)
  const [current, setCurrent] = useState({ nums: [0,0,0], cifras: 3 });
  const [showCarries, setShowCarries] = useState(true);

  // Slots tablero
  const [resultSlots, setResultSlots] = useState(['','','','']); // se ajusta según cifras
  const [carrySlots, setCarrySlots]   = useState(['','','']);
  const [activeSlot, setActiveSlot]   = useState(null);

  // Feedback práctica
  const [feedback, setFeedback] = useState({ text: '', cls: '' });
  const [checkInfo, setCheckInfo] = useState({ show:false, correctResult:'', correctCarries:[] });

  // Test
  const [isTestMode, setIsTestMode] = useState(false);
  const [testQuestions, setTestQuestions] = useState([]); // [{ nums:[n1,n2,n3], cifras }]
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);     // ["cadena de dígitos"]
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  /** Generar ejercicio de 3 ó 4 cifras para 3 sumandos */
  const generateExercise = useCallback(() => {
    const cifras = Math.random() < 0.5 ? 3 : 4;
    const min = cifras === 3 ? 100 : 1000;
    const max = cifras === 3 ? 999 : 9999;
    const n1 = Math.floor(Math.random() * (max - min + 1)) + min;
    const n2 = Math.floor(Math.random() * (max - min + 1)) + min;
    const n3 = Math.floor(Math.random() * (max - min + 1)) + min;
    return { nums: [n1, n2, n3], cifras };
  }, []);

  /** Carga ejercicio en el tablero (práctica o test) */
  const loadExercise = useCallback(({ nums, cifras }) => {
    const columnCount = cifras + 1;
    setCurrent({ nums, cifras });
    setResultSlots(Array(columnCount).fill(''));
    setCarrySlots(Array(columnCount - 1).fill(''));
    setActiveSlot(null);
    setFeedback({ text:'', cls:'' });

    const correctResult = nums.reduce((a,b)=>a+b,0).toString().padStart(columnCount, '0');
    const correctCarries = computeCarriesMany(nums, columnCount);
    setCheckInfo({ show:false, correctResult, correctCarries });
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
    loadExercise(generateExercise());
  }, [generateExercise, loadExercise]);

  const checkPractice = useCallback(() => {
    const columnCount = current.cifras + 1;
    const correct = current.nums.reduce((a,b)=>a+b,0).toString().padStart(columnCount, '0');
    const user = resultSlots.map(x => x || '0').join('');
    const carriesOk = computeCarriesMany(current.nums, columnCount);
    setCheckInfo({ show:true, correctResult: correct, correctCarries: carriesOk });

    if (user === correct) {
      setFeedback({ text:'¡Excelente! ¡Suma correcta! 🎉', cls:'feedback-correct' });
      setActiveSlot(null);
    } else {
      setFeedback({ text:'Casi... ¡Revisa las casillas!', cls:'feedback-incorrect' });
    }
  }, [current, resultSlots]);

  /** TEST */
  const startTest = useCallback(() => {
    const qs = Array.from({ length: TOTAL_TEST_QUESTIONS }, () => generateExercise());
    setTestQuestions(qs);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setShowResults(false);
    setScore(0);
    setIsTestMode(true);
    loadExercise(qs[0]);
  }, [generateExercise, loadExercise]);

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
        const correct = q.nums.reduce((a,b)=>a+b,0).toString().padStart(colCount, '0');
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
        <span className="gradient-text">Suma como en el cole (4º)</span>
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
          nums={current.nums}
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

      {/* Controles Test */}
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
              const correct = q.nums.reduce((a,b)=>a+b,0).toString().padStart(colCount, '0');
              const user = userAnswers[i] || 'No contestada';
              const ok = user === correct;
              return (
                <div key={i} className="result-item">
                  <p><strong>Suma {i + 1}:</strong> {q.nums[0]} + {q.nums[1]} + {q.nums[2]}</p>
                  <p className={ok ? 'correcta' : 'incorrecta'}>Tu respuesta: {user}</p>
                  {!ok && <p className="correcta">Solución: {correct}</p>}
                </div>
              );
            })}
          </div>
          <div className="test-controls" style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16 }}>
            <button onClick={startTest} className="btn-test">Volver a intentar</button>
            <button onClick={exitTestMode} className="btn-mode">Modo Práctica</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SumasPrimaria4;
