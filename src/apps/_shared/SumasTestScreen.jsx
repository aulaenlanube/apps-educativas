// src/apps/_shared/SumasTestScreen.jsx
import React, { useEffect, useState } from 'react';
import '/src/apps/_shared/Sumas.css';

// Tablero 100% React (mismo que en práctica)
function ProblemBoard({ num1, num2, answer, setAnswer, questionKey }) {
  const [slots, setSlots] = useState(['', '']);

  // Reset al cambiar de pregunta (clave distinta)
  useEffect(() => {
    setSlots(['', '']);
    setAnswer('');
  }, [questionKey, setAnswer]);

  useEffect(() => {
    const val = (slots[0] || '0') + (slots[1] || '0');
    setAnswer(val);
  }, [slots, setAnswer]);

  const onDropTo = (idx, e) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    if (!/^\d$/.test(data)) return;
    setSlots(prev => {
      const n = [...prev];
      n[idx] = data;
      return n;
    });
  };

  const onDragOver = (e) => e.preventDefault();
  const clearSlot = (idx) => setSlots(prev => { const n = [...prev]; n[idx]=''; return n; });

  const n1 = num1.toString().padStart(2, '0').split('');
  const n2 = num2.toString().padStart(2, '0').split('');

  return (
    <div className="board" key={questionKey}>
      <div className="operator">+</div>

      <div className="column">
        <div className="carry-placeholder"></div>
        <div className="digit-display">{n1[0]}</div>
        <div className="digit-display">{n2[0]}</div>
        <hr className="operation-line" />
        <div className={`box result-box ${slots[0] ? 'filled' : ''}`}
             onDrop={(e)=>onDropTo(0,e)} onDragOver={onDragOver} onClick={()=>clearSlot(0)}>
          {slots[0]}
        </div>
      </div>

      <div className="column">
        <div className="carry-placeholder"></div>
        <div className="digit-display">{n1[1]}</div>
        <div className="digit-display">{n2[1]}</div>
        <hr className="operation-line" />
        <div className={`box result-box ${slots[1] ? 'filled' : ''}`}
             onDrop={(e)=>onDropTo(1,e)} onDragOver={onDragOver} onClick={()=>clearSlot(1)}>
          {slots[1]}
        </div>
      </div>

      <div className="operator-spacer" />
    </div>
  );
}

const SumasTestScreen = ({ game }) => {
  const {
    TOTAL_TEST_QUESTIONS,
    currentQuestionIndex,
    elapsedTime,
    showResults,
    score,
    testQuestions,
    userAnswers,
    handleNextQuestion,
    startTest,
    exitTestMode,
    currentOperands,
    currentAnswer,
    setCurrentAnswer
  } = game;

  const progressPercentage = ((currentQuestionIndex + 1) / TOTAL_TEST_QUESTIONS) * 100;

  if (showResults) {
    const correctAnswers = testQuestions.reduce((acc, q, i) => {
      const correct = (q.num1 + q.num2).toString().padStart(2, '0');
      return acc + (userAnswers[i] === correct ? 1 : 0);
    }, 0);

    return (
      <div id="app-container" className="test-results">
        <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
          <span role="img" aria-label="Icono test">🧮</span> <span className="gradient-text">¡Test Completado!</span>
        </h1>
        <div className="score">Tu puntuación: <span>{score}</span></div>
        <p>Has acertado {correctAnswers} de {TOTAL_TEST_QUESTIONS} sumas.</p>
        {elapsedTime > 0 && <p>Tiempo total: {elapsedTime} segundos.</p>}

        <div className="results-summary">
          {testQuestions.map((q, i) => {
            const correct = (q.num1 + q.num2).toString().padStart(2, '0');
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
    );
  }

  const q = testQuestions[currentQuestionIndex];
  const questionKey = `q-${currentQuestionIndex}-${q?.num1}-${q?.num2}`;

  return (
    <div id="app-container">
      <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
        <span role="img" aria-label="Icono test">🧮</span> <span className="gradient-text">Test de Sumas</span>
      </h1>

      <div className="test-header">
        <div className="question-counter">Suma {currentQuestionIndex + 1} / {TOTAL_TEST_QUESTIONS}</div>
        {elapsedTime > 0 && <div className="timer">Tiempo: {elapsedTime}s</div>}
      </div>

      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${progressPercentage}%` }} />
      </div>

      <ProblemBoard
        num1={currentOperands.num1}
        num2={currentOperands.num2}
        answer={currentAnswer}
        setAnswer={setCurrentAnswer}
        questionKey={questionKey}
      />

      <div className="controles" style={{ marginTop: 16 }}>
        <button onClick={handleNextQuestion} className="btn-test">
          {currentQuestionIndex === TOTAL_TEST_QUESTIONS - 1 ? 'Finalizar' : 'Siguiente'}
        </button>
      </div>

      <div id="number-palette">
        <h2>Arrastra los números 👇</h2>
        <div className="number-tiles-container">
          {[...Array(10).keys()].map(number => (
            <div
              key={number}
              className="number-tile"
              draggable="true"
              onDragStart={(e) => e.dataTransfer.setData('text/plain', number)}
            >
              {number}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SumasTestScreen;
