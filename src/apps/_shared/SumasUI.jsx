// src/apps/_shared/SumasUI.jsx
import React, { useEffect, useState } from 'react';
import '/src/apps/_shared/Sumas.css';

// Tablero 100% React (sin innerHTML)
function ProblemBoard({ num1, num2, answer, setAnswer }) {
  // Dos casillas de resultado: decenas, unidades
  const [slots, setSlots] = useState(['', '']);

  // Reset al cambiar de sumandos
  useEffect(() => {
    setSlots(['', '']);
    setAnswer('');
  }, [num1, num2, setAnswer]);

  // Construye la respuesta y la propaga al hook
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

  const clearSlot = (idx) => {
    setSlots(prev => {
      const n = [...prev];
      n[idx] = '';
      return n;
    });
  };

  const n1 = num1.toString().padStart(2, '0').split('');
  const n2 = num2.toString().padStart(2, '0').split('');

  return (
    <div className="board">
      <div className="operator">+</div>

      {/* Decenas */}
      <div className="column">
        <div className="carry-placeholder"></div>
        <div className="digit-display">{n1[0]}</div>
        <div className="digit-display">{n2[0]}</div>
        <hr className="operation-line" />
        <div
          className={`box result-box ${slots[0] ? 'filled' : ''}`}
          onDrop={(e) => onDropTo(0, e)}
          onDragOver={onDragOver}
          onClick={() => clearSlot(0)}
          data-idx="0"
        >
          {slots[0]}
        </div>
      </div>

      {/* Unidades */}
      <div className="column">
        <div className="carry-placeholder"></div>
        <div className="digit-display">{n1[1]}</div>
        <div className="digit-display">{n2[1]}</div>
        <hr className="operation-line" />
        <div
          className={`box result-box ${slots[1] ? 'filled' : ''}`}
          onDrop={(e) => onDropTo(1, e)}
          onDragOver={onDragOver}
          onClick={() => clearSlot(1)}
          data-idx="1"
        >
          {slots[1]}
        </div>
      </div>

      <div className="operator-spacer" />
    </div>
  );
}

const SumasUI = ({
  currentOperands,
  currentAnswer,
  setCurrentAnswer,
  startPracticeMission,
  checkPracticeAnswer,
  startTest
}) => {
  const [feedback, setFeedback] = useState({ text: '', cls: '' });

  const handleCheck = () => {
    const { isCorrect } = checkPracticeAnswer();
    if (isCorrect) setFeedback({ text: '¡Excelente! ¡Suma correcta! 🎉', cls: 'feedback-correct' });
    else setFeedback({ text: 'Casi... ¡Revisa las casillas en rojo!', cls: 'feedback-incorrect' });
  };

  return (
    <div id="app-container">
      <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
        <span role="img" aria-label="Suma">🧮</span> <span className="gradient-text">Suma como en el cole</span>
      </h1>

      <div className="mode-selection">
        <button className="btn-mode active">Práctica Libre</button>
        <button className="btn-mode" onClick={startTest}>Iniciar Test</button>
      </div>

      <ProblemBoard
        num1={currentOperands.num1}
        num2={currentOperands.num2}
        answer={currentAnswer}
        setAnswer={setCurrentAnswer}
      />

      <div id="feedback-message" className={feedback.cls}>{feedback.text}</div>

      <div id="controls">
        <button id="check-button" onClick={handleCheck}>Comprobar</button>
        <button id="new-problem-button" onClick={() => { setFeedback({ text: '', cls: '' }); startPracticeMission(); }}>
          Nueva Suma
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

export default SumasUI;
