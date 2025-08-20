// src/apps/sumas/primaria-5/SumasPrimaria5.jsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import '/src/apps/_shared/Sumas.css';

const TOTAL_TEST_QUESTIONS = 5;

/* ------------ Utilidades ------------ */
const toFloat = (s) => parseFloat(s.replace(',', '.'));
const countDecimals = (s) => (s.split(',')[1] || '').length;

const generarNumero = (cifrasEnteras, decimales) => {
  const min = cifrasEnteras === 2 ? 10 : 100;
  const max = cifrasEnteras === 2 ? 99 : 999;
  const entero = Math.floor(Math.random() * (max - min + 1)) + min;
  if (decimales === 0) return entero.toString();
  const parteDecimal = Math.floor(Math.random() * Math.pow(10, decimales))
    .toString()
    .padStart(decimales, '0');
  return `${entero},${parteDecimal}`;
};

/* Genera ejercicio con 2/3 cifras enteras y 0..2 decimales (siempre al menos uno con decimales) */
const generarEjercicio = () => {
  const cifrasEnteras = Math.random() < 0.5 ? 2 : 3;
  const mismaCantidad = Math.random() > 0.3;
  let dec1, dec2;
  if (mismaCantidad) {
    dec1 = [1, 2][Math.floor(Math.random() * 2)];
    dec2 = dec1;
  } else {
    const opts = [0, 1, 2];
    do {
      dec1 = opts[Math.floor(Math.random() * opts.length)];
      dec2 = opts[Math.floor(Math.random() * opts.length)];
    } while (dec1 === dec2 || (dec1 === 0 && dec2 === 0));
  }
  const num1 = generarNumero(cifrasEnteras, dec1);
  const num2 = generarNumero(cifrasEnteras, dec2);
  return { num1, num2, cifrasEnteras };
};

/* ---------- ¡IMPORTANTE!: función PURA (no hook) para construir el plan de columnas ---------- */
function buildColumnPlan(num1, num2, cifrasEnteras) {
  const dec1 = countDecimals(num1);
  const dec2 = countDecimals(num2);
  const maxDec = Math.max(dec1, dec2);

  // totalCols: [guardia] [enteros...] [,] [decimales...]
  const totalCols = 1 + cifrasEnteras + (maxDec > 0 ? (1 + maxDec) : 0);

  const padNumero = (num) => {
    const tieneComa = num.includes(',');
    const [entCruda, decCruda = ''] = tieneComa ? num.split(',') : [num, ''];
    const entPad = entCruda.padStart(cifrasEnteras + 1, ' '); // +1 por la guardia
    if (maxDec > 0) {
      const decPad = decCruda.padEnd(maxDec, ' ');
      return `${entPad},${decPad}`;
    }
    return entPad;
  };

  const str1 = padNumero(num1);
  const str2 = padNumero(num2);

  const commaIndex = maxDec > 0 ? str1.indexOf(',') : -1;
  const digitIndices = Array.from({ length: totalCols }, (_, i) => i).filter(i => i !== commaIndex);

  return {
    totalCols,
    commaIndex,
    digitIndices, // índices de columnas que son dígitos (sin la coma)
    maxDec,
    chars1: str1.split(''),
    chars2: str2.split(''),
  };
}

/* Inserta coma en una cadena de dígitos según nº decimales */
const withComma = (digits, decCount) => {
  if (decCount <= 0) return digits.replace(/^0+(?=\d)/, '');
  const n = digits.length;
  const left = digits.slice(0, n - decCount) || '0';
  const right = digits.slice(n - decCount).padStart(decCount, '0');
  return `${left},${right}`;
};

/* ---------- Tablero React ---------- */
function ProblemBoard({
  num1, num2, cifrasEnteras,
  showCarries,
  resultSlots, setResultSlots,
  carrySlots, setCarrySlots,
  checkInfo,
}) {
  // Aquí SÍ usamos useMemo (dentro de un componente) para cachear el plan
  const plan = useMemo(() => buildColumnPlan(num1, num2, cifrasEnteras), [num1, num2, cifrasEnteras]);

  const onDragOver = (e) => e.preventDefault();

  const dropResult = (digitIdx, e) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    if (!/^\d$/.test(data)) return;
    setResultSlots(prev => {
      const next = [...prev];
      next[digitIdx] = data;
      return next;
    });
  };
  const clearResult = (digitIdx) => {
    setResultSlots(prev => {
      const next = [...prev];
      next[digitIdx] = '';
      return next;
    });
  };

  const dropCarry = (digitIdx, e) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    if (!/^\d$/.test(data)) return;
    setCarrySlots(prev => {
      const next = [...prev];
      next[digitIdx] = data;
      return next;
    });
  };
  const clearCarry = (digitIdx) => {
    setCarrySlots(prev => {
      const next = [...prev];
      next[digitIdx] = '';
      return next;
    });
  };

  const resultCls = (digitIdx) => {
    if (!checkInfo?.show) return '';
    const user = (resultSlots[digitIdx] || '0');
    // regla de ceros a la izquierda → neutral si está vacío y el esperado es 0 antes del primer no-cero
    if ((resultSlots[digitIdx] || '') === '' &&
        checkInfo.expectedDigits[digitIdx] === '0' &&
        (checkInfo.firstNonZeroIdx === -1 || digitIdx < checkInfo.firstNonZeroIdx)) {
      return '';
    }
    return user === checkInfo.expectedDigits[digitIdx] ? 'correct' : 'incorrect';
  };

  const carryCls = (digitIdx) => {
    if (!checkInfo?.show) return '';
    const expected = (checkInfo.expectedCarries?.[digitIdx] ?? 0).toString();
    const user = carrySlots[digitIdx] || '';
    const ok = user === '' ? expected === '0' : user === expected;
    return ok ? 'correct' : 'incorrect';
  };

  let runningDigitIdx = 0;

  return (
    <div className={`board ${!showCarries ? 'carries-hidden' : ''}`}>
      <div className="operator">+</div>

      {Array.from({ length: plan.totalCols }).map((_, colIdx) => {
        const isComma = colIdx === plan.commaIndex;
        const showCarryBox = !isComma && colIdx !== plan.totalCols - 1;

        let digitIdxThisCol = null;
        if (!isComma) {
          digitIdxThisCol = runningDigitIdx;
          runningDigitIdx++;
        }

        return (
          <div className="column" key={colIdx}>
            {showCarryBox ? (
              <div
                className={`box carry-box ${carryCls(digitIdxThisCol)}`}
                onDragOver={onDragOver}
                onDrop={(e) => dropCarry(digitIdxThisCol, e)}
                onClick={() => clearCarry(digitIdxThisCol)}
              >
                {carrySlots[digitIdxThisCol]}
              </div>
            ) : (
              <div className="carry-placeholder" />
            )}

            <div className="digit-display">{plan.chars1[colIdx] ?? ' '}</div>
            <div className="digit-display">{plan.chars2[colIdx] ?? ' '}</div>

            <hr className="operation-line" />

            {isComma ? (
              <div className="box comma-box"><span>,</span></div>
            ) : (
              <div
                className={`box result-box ${resultSlots[digitIdxThisCol] ? 'filled' : ''} ${resultCls(digitIdxThisCol)}`}
                onDragOver={onDragOver}
                onDrop={(e) => dropResult(digitIdxThisCol, e)}
                onClick={() => clearResult(digitIdxThisCol)}
              >
                {resultSlots[digitIdxThisCol]}
              </div>
            )}
          </div>
        );
      })}

      <div className="operator-spacer" />
    </div>
  );
}

/* ---------- App 5º Primaria: práctica + test con decimales ---------- */
const SumasPrimaria5 = () => {
  const [current, setCurrent] = useState({ num1: '10,0', num2: '10,0', cifrasEnteras: 2 });
  const [showCarries, setShowCarries] = useState(true);

  // Plan del ejercicio actual (aquí SÍ usamos useMemo porque es dentro del componente)
  const plan = useMemo(
    () => buildColumnPlan(current.num1, current.num2, current.cifrasEnteras),
    [current.num1, current.num2, current.cifrasEnteras]
  );

  // Slots de usuario (iniciales con el plan actual; se resetean en loadExercise)
  const [resultSlots, setResultSlots] = useState(Array(plan.digitIndices.length).fill(''));
  const [carrySlots, setCarrySlots] = useState(Array(Math.max(plan.digitIndices.length - 1, 0)).fill(''));

  // Feedback práctica
  const [feedback, setFeedback] = useState({ text: '', cls: '' });
  const [checkInfo, setCheckInfo] = useState({ show: false, expectedDigits: [], expectedCarries: [], firstNonZeroIdx: -1 });

  // Test
  const [isTestMode, setIsTestMode] = useState(false);
  const [testQuestions, setTestQuestions] = useState([]); // [{ num1, num2, cifrasEnteras }]
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]); // ["cadena dígitos sin coma"]
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  /* Carga/Reseteo del ejercicio (usa la FUNCIÓN PURA buildColumnPlan, no hooks) */
  const loadExercise = useCallback(({ num1, num2, cifrasEnteras }) => {
    setCurrent({ num1, num2, cifrasEnteras });

    const plan2 = buildColumnPlan(num1, num2, cifrasEnteras);
    setResultSlots(Array(plan2.digitIndices.length).fill(''));
    setCarrySlots(Array(Math.max(plan2.digitIndices.length - 1, 0)).fill(''));
    setFeedback({ text: '', cls: '' });

    const maxDec = Math.max(countDecimals(num1), countDecimals(num2));
    const expectedStr = (toFloat(num1) + toFloat(num2)).toFixed(maxDec).replace('.', ',');
    const expectedDigits = expectedStr
      .replace(',', '')
      .padStart(plan2.digitIndices.length, '0')
      .split('');

    const firstNonZeroIdx = expectedDigits.findIndex(d => d !== '0');

    // Carries esperadas
    const [e1, d1 = ''] = num1.replace(',', '.').split('.');
    const [e2, d2 = ''] = num2.replace(',', '.').split('.');
    const maxD = Math.max(d1.length, d2.length);
    const plano1 = (e1 + d1.padEnd(maxD, '0')).padStart(plan2.digitIndices.length, '0');
    const plano2 = (e2 + d2.padEnd(maxD, '0')).padStart(plan2.digitIndices.length, '0');
    const expectedCarries = Array(Math.max(plan2.digitIndices.length - 1, 0)).fill(0);
    let carry = 0;
    for (let i = plan2.digitIndices.length - 1; i >= 1; i--) {
      const s = parseInt(plano1[i], 10) + parseInt(plano2[i], 10) + carry;
      const c = Math.floor(s / 10);
      expectedCarries[i - 1] = c;
      carry = c;
    }

    setCheckInfo({ show: false, expectedDigits, expectedCarries, firstNonZeroIdx });
  }, []);

  /* PRÁCTICA */
  const startPractice = useCallback(() => {
    loadExercise(generarEjercicio());
  }, [loadExercise]);

  const checkPractice = useCallback(() => {
    const maxDec = Math.max(countDecimals(current.num1), countDecimals(current.num2));
    const expectedStr = (toFloat(current.num1) + toFloat(current.num2)).toFixed(maxDec).replace('.', ',');
    const expectedDigits = expectedStr.replace(',', '').padStart(plan.digitIndices.length, '0').split('');
    const firstNonZeroIdx = expectedDigits.findIndex(d => d !== '0');

    // carries esperadas
    const [e1, d1 = ''] = current.num1.replace(',', '.').split('.');
    const [e2, d2 = ''] = current.num2.replace(',', '.').split('.');
    const maxD = Math.max(d1.length, d2.length);
    const plano1 = (e1 + d1.padEnd(maxD, '0')).padStart(plan.digitIndices.length, '0');
    const plano2 = (e2 + d2.padEnd(maxD, '0')).padStart(plan.digitIndices.length, '0');
    const expectedCarries = Array(Math.max(plan.digitIndices.length - 1, 0)).fill(0);
    let carry = 0;
    for (let i = plan.digitIndices.length - 1; i >= 1; i--) {
      const s = parseInt(plano1[i], 10) + parseInt(plano2[i], 10) + carry;
      const c = Math.floor(s / 10);
      expectedCarries[i - 1] = c;
      carry = c;
    }

    setCheckInfo({ show: true, expectedDigits, expectedCarries, firstNonZeroIdx });

    const userDigits = resultSlots.map(x => x || '0').join('');
    if (userDigits === expectedDigits.join('')) {
      setFeedback({ text: '¡Excelente! ¡Suma correcta! 🎉', cls: 'feedback-correct' });
    } else {
      setFeedback({ text: 'Casi... ¡Revisa las casillas!', cls: 'feedback-incorrect' });
    }
  }, [current, plan.digitIndices.length, resultSlots]);

  /* TEST */
  const startTest = useCallback(() => {
    const qs = Array.from({ length: TOTAL_TEST_QUESTIONS }, () => generarEjercicio());
    setTestQuestions(qs);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setShowResults(false);
    setScore(0);
    setIsTestMode(true);
    loadExercise(qs[0]);
  }, [loadExercise]);

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
        const planQ = buildColumnPlan(q.num1, q.num2, q.cifrasEnteras);
        const maxDec = Math.max(countDecimals(q.num1), countDecimals(q.num2));
        const expected = (toFloat(q.num1) + toFloat(q.num2))
          .toFixed(maxDec)
          .replace('.', ',')
          .replace(',', '')
          .padStart(planQ.digitIndices.length, '0');
        if (newAnswers[i] === expected) correctCount++;
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

  // Arranque en práctica
  useEffect(() => { startPractice(); }, [startPractice]);

  // Progreso test
  const progressPct = ((currentQuestionIndex + 1) / TOTAL_TEST_QUESTIONS) * 100;

  const formatUserAnswer = (digits, q) => {
    const maxDec = Math.max(countDecimals(q.num1), countDecimals(q.num2));
    return withComma(digits, maxDec);
    };

  return (
    <div id="app-container">
      <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
        <span role="img" aria-label="Suma">🧮</span>{' '}
        <span className="gradient-text">Suma con decimales</span>
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

      

      {/* Tablero (oculto en resultados) */}
      {!(isTestMode && showResults) && (
        <ProblemBoard
          num1={current.num1}
          num2={current.num2}
          cifrasEnteras={current.cifrasEnteras}
          showCarries={showCarries}
          resultSlots={resultSlots} setResultSlots={setResultSlots}
          carrySlots={carrySlots}   setCarrySlots={setCarrySlots}
          checkInfo={checkInfo}
        />
      )}

            {/* Controles Test */}
      {isTestMode && !showResults && (
        <div className="controles" style={{ marginTop: 16 }}>
          <button onClick={handleNextQuestion} className="btn-test">
            {currentQuestionIndex === TOTAL_TEST_QUESTIONS - 1 ? 'Finalizar' : 'Siguiente'}
          </button>
        </div>
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

      {/* Paleta de números (oculta en resultados) */}
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



      {/* Resultados del Test (sin mostrar la última operación en tablero) */}
      {isTestMode && showResults && (
        <div className="test-results" style={{ marginTop: 20 }}>
          <h2 className="score">Puntuación: <span>{score}</span></h2>

          <div className="results-summary" style={{ marginTop: 12 }}>
            {testQuestions.map((q, i) => {
              const planQ = buildColumnPlan(q.num1, q.num2, q.cifrasEnteras);
              const maxDec = Math.max(countDecimals(q.num1), countDecimals(q.num2));
              const correct = (toFloat(q.num1) + toFloat(q.num2)).toFixed(maxDec).replace('.', ',');
              const user = userAnswers[i] ? formatUserAnswer(userAnswers[i], q) : 'No contestada';
              const expectedDigits = correct.replace(',', '').padStart(planQ.digitIndices.length, '0');
              const ok = userAnswers[i] === expectedDigits;

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

export default SumasPrimaria5;
