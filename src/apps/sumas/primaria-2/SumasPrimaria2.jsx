// src/apps/sumas/SumasPrimaria2.jsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import '/src/apps/_shared/Sumas.css';

const TOTAL_TEST_QUESTIONS = 5;

/** ==== Tablero React con llevadas (3 columnas) ==== */
function ProblemBoard({
  num1, num2,
  showCarries,
  resultSlots, setResultSlots,        // ['','',''] -> centenas, decenas, unidades
  carrySlots, setCarrySlots,          // ['','']   -> [carry a centenas, carry a decenas]
  checkInfo                           // { show:boolean, correctResult:'XYZ', correctCarries:[cHundreds,cTens] }
}) {
  // Dígitos mostrados (3 columnas, con huecos en centenas si procede)
  const d1 = useMemo(() => num1.toString().padStart(3, ' ').split(''), [num1]);
  const d2 = useMemo(() => num2.toString().padStart(3, ' ').split(''), [num2]);

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
  };
  const clearResult = (i) => {
    setResultSlots(prev => {
      const next = [...prev];
      next[i] = '';
      return next;
    });
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
  };
  const clearCarry = (i) => {
    setCarrySlots(prev => {
      const next = [...prev];
      next[i] = '';
      return next;
    });
  };

  // Clases de corrección solo si checkInfo.show
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

  return (
    <div className="board">
      <div className="operator">+</div>

      {/* Centenas */}
      <div className="column">
        {showCarries ? (
          <div className={`box carry-box ${carryCls(0)}`}
               onDragOver={onDragOver} onDrop={(e)=>dropCarry(0,e)} onClick={()=>clearCarry(0)}>
            {carrySlots[0]}
          </div>
        ) : (<div className="carry-placeholder" />)}
        <div className="digit-display">{d1[0]}</div>
        <div className="digit-display">{d2[0]}</div>
        <hr className="operation-line" />
        <div className={`box result-box ${resultSlots[0] ? 'filled' : ''} ${resultCls(0)}`}
             onDragOver={onDragOver} onDrop={(e)=>dropResult(0,e)} onClick={()=>clearResult(0)}>
          {resultSlots[0]}
        </div>
      </div>

      {/* Decenas */}
      <div className="column">
        {showCarries ? (
          <div className={`box carry-box ${carryCls(1)}`}
               onDragOver={onDragOver} onDrop={(e)=>dropCarry(1,e)} onClick={()=>clearCarry(1)}>
            {carrySlots[1]}
          </div>
        ) : (<div className="carry-placeholder" />)}
        <div className="digit-display">{d1[1]}</div>
        <div className="digit-display">{d2[1]}</div>
        <hr className="operation-line" />
        <div className={`box result-box ${resultSlots[1] ? 'filled' : ''} ${resultCls(1)}`}
             onDragOver={onDragOver} onDrop={(e)=>dropResult(1,e)} onClick={()=>clearResult(1)}>
          {resultSlots[1]}
        </div>
      </div>

      {/* Unidades */}
      <div className="column">
        <div className="carry-placeholder" />
        <div className="digit-display">{d1[2]}</div>
        <div className="digit-display">{d2[2]}</div>
        <hr className="operation-line" />
        <div className={`box result-box ${resultSlots[2] ? 'filled' : ''} ${resultCls(2)}`}
             onDragOver={onDragOver} onDrop={(e)=>dropResult(2,e)} onClick={()=>clearResult(2)}>
          {resultSlots[2]}
        </div>
      </div>

      <div className="operator-spacer" />
    </div>
  );
}

/** ==== Pantalla principal 2º Primaria con modo práctica + test ==== */
const SumasPrimaria2 = () => {
  // Estado núcleo
  const [currentOperands, setCurrentOperands] = useState({ num1: 0, num2: 0 });
  const [showCarries, setShowCarries] = useState(true);

  // Slots actuales del tablero
  const [resultSlots, setResultSlots] = useState(['','','']); // C,D,U
  const [carrySlots, setCarrySlots]   = useState(['','']);    // [carry a C, carry a D]

  // Feedback práctica
  const [feedback, setFeedback] = useState({ text: '', cls: '' });
  const [checkInfo, setCheckInfo] = useState({ show:false, correctResult:'000', correctCarries:[0,0] });

  // Test
  const [isTestMode, setIsTestMode] = useState(false);
  const [testQuestions, setTestQuestions] = useState([]); // [{num1,num2}]
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);     // ["XYZ", ...]
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  /** Generar dos números aleatorios de 2 cifras 10..99 */
  const generateOperands = useCallback(() => {
    const num1 = Math.floor(Math.random() * 90) + 10;
    const num2 = Math.floor(Math.random() * 90) + 10;
    return { num1, num2 };
  }, []);

  /** Calcular llevadas correctas para num1+num2: [carry a centenas, carry a decenas] */
  const computeCarries = useCallback((a, b) => {
    const aU = a % 10, bU = b % 10;
    const cTens = Math.floor((aU + bU) / 10);
    const aT = Math.floor(a/10)%10, bT = Math.floor(b/10)%10;
    const cHundreds = Math.floor((aT + bT + cTens) / 10);
    return [cHundreds, cTens];
  }, []);

  /** Práctica: nueva suma */
  const startPractice = useCallback(() => {
    const { num1, num2 } = generateOperands();
    setCurrentOperands({ num1, num2 });
    setResultSlots(['','','']);
    setCarrySlots(['','']);
    setFeedback({ text:'', cls:'' });
    const correct = (num1 + num2).toString().padStart(3,'0');
    const carries = computeCarries(num1, num2);
    setCheckInfo({ show:false, correctResult: correct, correctCarries: carries });
  }, [generateOperands, computeCarries]);

  /** Práctica: comprobar */
  const checkPractice = useCallback(() => {
    const { num1, num2 } = currentOperands;
    const correct = (num1 + num2).toString().padStart(3,'0');
    const user = resultSlots.map(x => x || '0').join('');
    const carriesOk = computeCarries(num1, num2);
    setCheckInfo({ show:true, correctResult: correct, correctCarries: carriesOk });

    if (user === correct) {
      setFeedback({ text:'¡Excelente! ¡Suma correcta! 🎉', cls:'feedback-correct' });
    } else {
      setFeedback({ text:'Casi... ¡Revisa las casillas!', cls:'feedback-incorrect' });
    }
  }, [currentOperands, resultSlots, computeCarries]);

  /** Test: iniciar */
  const startTest = useCallback(() => {
    const qs = Array.from({length: TOTAL_TEST_QUESTIONS}, () => generateOperands());
    setTestQuestions(qs);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setShowResults(false);
    setScore(0);
    setIsTestMode(true);

    const { num1, num2 } = qs[0];
    setCurrentOperands({ num1, num2 });
    setResultSlots(['','','']);
    setCarrySlots(['','']);
    setFeedback({ text:'', cls:'' });

    const correct = (num1 + num2).toString().padStart(3,'0');
    const carries = computeCarries(num1, num2);
    setCheckInfo({ show:false, correctResult: correct, correctCarries: carries });
  }, [generateOperands, computeCarries]);

  /** Test: siguiente o finalizar */
  const handleNextQuestion = useCallback(() => {
    const user = resultSlots.map(x => x || '0').join('');
    const newAnswers = [...userAnswers, user];
    setUserAnswers(newAnswers);

    const isLast = currentQuestionIndex >= TOTAL_TEST_QUESTIONS - 1;
    if (!isLast) {
      const next = currentQuestionIndex + 1;
      setCurrentQuestionIndex(next);
      const { num1, num2 } = testQuestions[next];
      setCurrentOperands({ num1, num2 });
      setResultSlots(['','','']);
      setCarrySlots(['','']);
      setFeedback({ text:'', cls:'' });
      const correct = (num1 + num2).toString().padStart(3,'0');
      const carries = computeCarries(num1, num2);
      setCheckInfo({ show:false, correctResult: correct, correctCarries: carries });
    } else {
      let correctCount = 0;
      testQuestions.forEach((q, i) => {
        const correct = (q.num1 + q.num2).toString().padStart(3,'0');
        if (newAnswers[i] === correct) correctCount++;
      });
      setScore(correctCount * 200);
      setShowResults(true);
    }
  }, [resultSlots, userAnswers, currentQuestionIndex, testQuestions, computeCarries]);

  /** Test: salir a práctica */
  const exitTestMode = useCallback(() => {
    setIsTestMode(false);
    setShowResults(false);
    startPractice();
  }, [startPractice]);

  useEffect(() => { startPractice(); }, [startPractice]);

  // Progreso para test
  const progressPct = ((currentQuestionIndex + 1) / TOTAL_TEST_QUESTIONS) * 100;

  return (
    <div id="app-container">
      <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
        <span role="img" aria-label="Suma">🧮</span> <span className="gradient-text">Suma como en el cole</span>
      </h1>

      {/* Botones de modo */}
      <div className="mode-selection">
        <button
          className={`btn-mode ${!isTestMode ? 'active' : ''}`}
          onClick={() => { setIsTestMode(false); setShowResults(false); startPractice(); }}
        >
          Práctica Libre
        </button>
        <button className="btn-mode" onClick={startTest}>Iniciar Test</button>
      </div>

      {/* Toggle de llevadas */}
      <div id="options-area" style={{ display:'flex', alignItems:'center', gap:12, justifyContent:'center', marginBottom:8 }}>
        <label htmlFor="help-toggle">Ayuda con llevadas</label>
        <label className="switch">
          <input type="checkbox" id="help-toggle" checked={showCarries} onChange={()=>setShowCarries(v=>!v)} />
          <span className="slider round"></span>
        </label>
      </div>

      {/* Cabecera y progreso test */}
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

      {/* Mostrar tablero solo si NO estamos en resultados */}
      {!(isTestMode && showResults) && (
        <ProblemBoard
          num1={currentOperands.num1}
          num2={currentOperands.num2}
          showCarries={showCarries}
          resultSlots={resultSlots} setResultSlots={setResultSlots}
          carrySlots={carrySlots}   setCarrySlots={setCarrySlots}
          checkInfo={checkInfo}
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

      {/* Controles test */}
      {isTestMode && !showResults && (
        <div className="controles" style={{ marginTop: 16 }}>
          <button onClick={handleNextQuestion} className="btn-test">
            {currentQuestionIndex === TOTAL_TEST_QUESTIONS - 1 ? 'Finalizar' : 'Siguiente'}
          </button>
        </div>
      )}

      {/* Paleta de números en ambos modos salvo resultados */}
      {!showResults && (
        <div id="number-palette">
          <h2>Arrastra los números 👇</h2>
          <div className="number-tiles-container">
            {[...Array(10).keys()].map(n => (
              <div
                key={n}
                className="number-tile"
                draggable="true"
                onDragStart={(e) => e.dataTransfer.setData('text/plain', n)}
              >
                {n}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resultados del test */}
      {isTestMode && showResults && (
        <div className="test-results" style={{ marginTop: 20 }}>
          <h2 className="score">Puntuación: <span>{score}</span></h2>
          <div className="results-summary" style={{ marginTop: 12 }}>
            {testQuestions.map((q, i) => {
              const correct = (q.num1 + q.num2).toString().padStart(3, '0');
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
            <button onClick={exitTestMode} className="btn-mode">Modo Práctica</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SumasPrimaria2;
