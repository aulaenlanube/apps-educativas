// src/apps/sumas/primaria-6/SumasPrimaria6.jsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import '/src/apps/_shared/Sumas.css';

const TOTAL_TEST_QUESTIONS = 5;

/* ================= Utilidades ================= */
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

/** Tres números, 2–3 cifras enteras y 0..3 decimales.
 *  Regla: siempre al menos uno con decimales. 70% misma cantidad; 30% distinta.
 */
const generarEjercicio = () => {
  const cifrasEnteras = Math.random() < 0.5 ? 2 : 3;
  const mismaCantidad = Math.random() > 0.3;

  let decs = [];
  if (mismaCantidad) {
    const d = [1, 2, 3][Math.floor(Math.random() * 3)]; // aseguramos decimales
    decs = [d, d, d];
  } else {
    const r = () => [0, 1, 2, 3][Math.floor(Math.random() * 4)];
    do {
      decs = [r(), r(), r()];
    } while ((decs[0] === decs[1] && decs[1] === decs[2]) || Math.max(...decs) === 0);
  }

  const nums = decs.map(d => generarNumero(cifrasEnteras, d));
  return { nums, cifrasEnteras };
};

/** Construye el plan de columnas (función PURA, no hook)
 *  Estructura: [guardia] [enteros...] [,] [decimales...]
 */
function buildColumnPlan(nums, cifrasEnteras) {
  const maxDec = Math.max(...nums.map(n => countDecimals(n)));
  const totalCols = 1 + cifrasEnteras + (maxDec > 0 ? (1 + maxDec) : 0);

  const padNumero = (num) => {
    const tieneComa = num.includes(',');
    const [ent, dec = ''] = tieneComa ? num.split(',') : [num, ''];
    const entPad = ent.padStart(cifrasEnteras + 1, ' '); // +1 por la guardia
    if (maxDec > 0) {
      const decPad = dec.padEnd(maxDec, ' ');
      return `${entPad},${decPad}`;
    }
    return entPad;
  };

  const rows = nums.map(n => padNumero(n).split(''));
  const commaIndex = maxDec > 0 ? rows[0].indexOf(',') : -1;
  const digitIndices = Array.from({ length: totalCols }, (_, i) => i).filter(i => i !== commaIndex);

  return { totalCols, commaIndex, digitIndices, maxDec, rows };
}

/** Calcula llevadas esperadas para varios sumandos sobre 'digitCount' columnas (sin coma). */
function computeCarriesMany(nums, cifrasEnteras) {
  const plan = buildColumnPlan(nums, cifrasEnteras);
  const digitCount = plan.digitIndices.length;

  // Construir "planos" sin coma, alineados al ancho total de dígitos
  const maxDec = plan.maxDec;
  const planos = nums.map(num => {
    const [e, d = ''] = num.replace(',', '.').split('.');
    const plano = (e + (d || '').padEnd(maxDec, '0'));
    return plano.padStart(digitCount, '0');
  });

  const expectedCarries = Array(Math.max(digitCount - 1, 0)).fill(0);
  let carry = 0;
  for (let i = digitCount - 1; i >= 1; i--) {
    const sum = planos.reduce((acc, p) => acc + parseInt(p[i], 10), 0) + carry;
    const c = Math.floor(sum / 10);
    expectedCarries[i - 1] = c; // llevada que cae a la columna de la izquierda
    carry = c;
  }
  return expectedCarries;
}

/** Inserta coma en una cadena de dígitos usando nº de decimales */
const withComma = (digits, decCount) => {
  if (decCount <= 0) return digits.replace(/^0+(?=\d)/, '');
  const n = digits.length;
  const left = digits.slice(0, n - decCount) || '0';
  const right = digits.slice(n - decCount).padStart(decCount, '0');
  return `${left},${right}`;
};

/* ================= Tablero React ================= */
function ProblemBoard({
  nums, cifrasEnteras,
  showCarries,
  resultSlots, setResultSlots,     // length = digitCount
  carrySlots, setCarrySlots,       // length = digitCount - 1
  checkInfo                        // { show, expectedDigits[], expectedCarries[], firstNonZeroIdx }
}) {
  const plan = useMemo(() => buildColumnPlan(nums, cifrasEnteras), [nums, cifrasEnteras]);

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
    const expected = checkInfo.expectedDigits[digitIdx];
    const user = (resultSlots[digitIdx] || '0');
    // neutral si es cero a la izquierda y está vacío
    if ((resultSlots[digitIdx] || '') === '' &&
        expected === '0' &&
        (checkInfo.firstNonZeroIdx === -1 || digitIdx < checkInfo.firstNonZeroIdx)) {
      return '';
    }
    return user === expected ? 'correct' : 'incorrect';
  };

  const carryCls = (digitIdx) => {
    if (!checkInfo?.show) return '';
    const expected = (checkInfo.expectedCarries?.[digitIdx] ?? 0).toString();
    const user = carrySlots[digitIdx] || '';
    const ok = user === '' ? expected === '0' : user === expected;
    return ok ? 'correct' : 'incorrect';
  };

  // Render columnas (incluye la coma como caja fija)
  let runningDigitIdx = 0;

  return (
    <div className={`board ${!showCarries ? 'carries-hidden' : ''}`}>
      <div className="operator">+</div>

      {Array.from({ length: plan.totalCols }).map((_, colIdx) => {
        const isComma = colIdx === plan.commaIndex;
        const showCarryBox = !isComma && colIdx !== plan.totalCols - 1; // no carry sobre unidades

        let digitIdxThisCol = null;
        if (!isComma) {
          digitIdxThisCol = runningDigitIdx;
          runningDigitIdx++;
        }

        return (
          <div className="column" key={colIdx}>
            {/* Llevadas */}
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

            {/* Tres filas de sumandos */}
            {plan.rows.map((row, r) => (
              <div className="digit-display" key={`r${r}`}>{row[colIdx] ?? ' '}</div>
            ))}

            <hr className="operation-line" />

            {/* Resultado o coma */}
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

/* ================= App 6º: práctica + test con 3 sumandos decimales ================= */
const SumasPrimaria6 = () => {
  const [current, setCurrent] = useState({ nums: ['10,0','10,0','10,0'], cifrasEnteras: 2 });
  const [showCarries, setShowCarries] = useState(true);

  // Plan del ejercicio actual
  const plan = useMemo(() => buildColumnPlan(current.nums, current.cifrasEnteras), [current]);

  // Slots de usuario (se resetean en loadExercise)
  const [resultSlots, setResultSlots] = useState(Array(plan.digitIndices.length).fill(''));
  const [carrySlots, setCarrySlots] = useState(Array(Math.max(plan.digitIndices.length - 1, 0)).fill(''));

  // Feedback práctica
  const [feedback, setFeedback] = useState({ text: '', cls: '' });
  const [checkInfo, setCheckInfo] = useState({ show:false, expectedDigits:[], expectedCarries:[], firstNonZeroIdx:-1 });

  // Test
  const [isTestMode, setIsTestMode] = useState(false);
  const [testQuestions, setTestQuestions] = useState([]); // [{ nums, cifrasEnteras }]
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);     // ["cadena de dígitos sin coma"]
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const loadExercise = useCallback(({ nums, cifrasEnteras }) => {
    setCurrent({ nums, cifrasEnteras });

    const plan2 = buildColumnPlan(nums, cifrasEnteras);
    setResultSlots(Array(plan2.digitIndices.length).fill(''));
    setCarrySlots(Array(Math.max(plan2.digitIndices.length - 1, 0)).fill(''));
    setFeedback({ text:'', cls:'' });

    const maxDec = plan2.maxDec;
    const expectedStr = (nums.reduce((acc, n) => acc + toFloat(n), 0))
      .toFixed(maxDec).replace('.', ',');
    const expectedDigits = expectedStr
      .replace(',', '')
      .padStart(plan2.digitIndices.length, '0')
      .split('');

    const firstNonZeroIdx = expectedDigits.findIndex(d => d !== '0');
    const expectedCarries = computeCarriesMany(nums, cifrasEnteras);

    setCheckInfo({ show:false, expectedDigits, expectedCarries, firstNonZeroIdx });
  }, []);

  /* -------- PRÁCTICA -------- */
  const startPractice = useCallback(() => {
    loadExercise(generarEjercicio());
  }, [loadExercise]);

  const checkPractice = useCallback(() => {
    const planNow = buildColumnPlan(current.nums, current.cifrasEnteras);
    const expectedStr = (current.nums.reduce((acc, n) => acc + toFloat(n), 0))
      .toFixed(planNow.maxDec).replace('.', ',');
    const expectedDigits = expectedStr.replace(',', '').padStart(planNow.digitIndices.length, '0').split('');
    const firstNonZeroIdx = expectedDigits.findIndex(d => d !== '0');
    const expectedCarries = computeCarriesMany(current.nums, current.cifrasEnteras);

    setCheckInfo({ show:true, expectedDigits, expectedCarries, firstNonZeroIdx });

    const userDigits = resultSlots.map(x => x || '0').join('');
    if (userDigits === expectedDigits.join('')) {
      setFeedback({ text:'¡Excelente! ¡Suma correcta! 🎉', cls:'feedback-correct' });
    } else {
      setFeedback({ text:'Casi... ¡Revisa las casillas!', cls:'feedback-incorrect' });
    }
  }, [current, resultSlots]);

  /* -------- TEST -------- */
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
        const planQ = buildColumnPlan(q.nums, q.cifrasEnteras);
        const expected = (q.nums.reduce((acc, n) => acc + toFloat(n), 0))
          .toFixed(planQ.maxDec).replace('.', ',')
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
    const maxDec = Math.max(...q.nums.map(n => countDecimals(n)));
    return withComma(digits, maxDec);
  };

  return (
    <div id="app-container">
      <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
        <span role="img" aria-label="Suma">🧮</span>{' '}
        <span className="gradient-text">Suma con decimales</span>
      </h1>

      {/* Botones de modo (idénticos a otras apps) */}
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

      {/* Tablero: oculto en resultados para no mostrar la última operación */}
      {!(isTestMode && showResults) && (
        <ProblemBoard
          nums={current.nums}
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



      {/* Resultados del Test */}
      {isTestMode && showResults && (
        <div className="test-results" style={{ marginTop: 20 }}>
          <h2 className="score">Puntuación: <span>{score}</span></h2>

          <div className="results-summary" style={{ marginTop: 12 }}>
            {testQuestions.map((q, i) => {
              const planQ = buildColumnPlan(q.nums, q.cifrasEnteras);
              const expected = (q.nums.reduce((acc, n) => acc + toFloat(n), 0))
                .toFixed(planQ.maxDec).replace('.', ',');
              const user = userAnswers[i] ? formatUserAnswer(userAnswers[i], q) : 'No contestada';
              const expectedDigits = expected.replace(',', '').padStart(planQ.digitIndices.length, '0');
              const ok = userAnswers[i] === expectedDigits;

              return (
                <div key={i} className="result-item">
                  <p><strong>Suma {i + 1}:</strong> {q.nums[0]} + {q.nums[1]} + {q.nums[2]}</p>
                  <p className={ok ? 'correcta' : 'incorrecta'}>Tu respuesta: {user}</p>
                  {!ok && <p className="correcta">Solución: {expected}</p>}
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

export default SumasPrimaria6;
