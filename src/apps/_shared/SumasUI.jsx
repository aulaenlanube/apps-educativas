import React, { useEffect, useState } from 'react';
import '/src/apps/_shared/Sumas.css';

// Tablero 100% React (sin innerHTML)
// Ahora recibe slots y manejadores desde el padre para permitir interacción externa (paleta)
function ProblemBoard({ num1, num2, slots, updateSlot, activeSlot, setActiveSlot }) {

  const onDropTo = (idx, e) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    if (!/^\d$/.test(data)) return;
    updateSlot(idx, data);
    setActiveSlot(idx); // Seleccionar la casilla donde se soltó
  };

  const onDragOver = (e) => e.preventDefault();

  const handleBoxClick = (idx) => {
    // Si ya está seleccionada, deseleccionamos. Si no, seleccionamos.
    if (activeSlot === idx) {
      setActiveSlot(null);
    } else {
      setActiveSlot(idx);
    }
  };

  const clearSlot = (idx, e) => {
    e.stopPropagation(); // Evitar disparar el click del padre si hubiera conflicto
    updateSlot(idx, '');
    setActiveSlot(idx); // Mantener foco
  };

  const n1 = num1.toString().padStart(2, '0').split('');
  const n2 = num2.toString().padStart(2, '0').split('');

  // Función auxiliar para renderizar una caja de resultado
  const renderResultBox = (idx) => (
    <div
      className={`box result-box ${slots[idx] ? 'filled' : ''} ${activeSlot === idx ? 'selected' : ''}`}
      onDrop={(e) => onDropTo(idx, e)}
      onDragOver={onDragOver}
      onClick={() => handleBoxClick(idx)}
      data-idx={idx}
    >
      {slots[idx]}
    </div>
  );

  return (
    <div className="board">
      <div className="operator">+</div>

      {/* Decenas */}
      <div className="column">
        <div className="carry-placeholder"></div>
        <div className="digit-display">{n1[0]}</div>
        <div className="digit-display">{n2[0]}</div>
        <hr className="operation-line" />
        {renderResultBox(0)}
      </div>

      {/* Unidades */}
      <div className="column">
        <div className="carry-placeholder"></div>
        <div className="digit-display">{n1[1]}</div>
        <div className="digit-display">{n2[1]}</div>
        <hr className="operation-line" />
        {renderResultBox(1)}
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
  
  // Estado elevado del tablero
  const [slots, setSlots] = useState(['', '']);
  const [activeSlot, setActiveSlot] = useState(null); // null, 0, o 1

  // Reset al cambiar de sumandos
  useEffect(() => {
    setSlots(['', '']);
    setActiveSlot(null);
    setFeedback({ text: '', cls: '' });
  }, [currentOperands]);

  // Construye la respuesta y la propaga al hook
  useEffect(() => {
    const val = (slots[0] || '0') + (slots[1] || '0');
    setCurrentAnswer(val);
  }, [slots, setCurrentAnswer]);

  const updateSlot = (idx, val) => {
    setSlots(prev => {
      const n = [...prev];
      n[idx] = val;
      return n;
    });
  };

  const handlePaletteClick = (number) => {
    if (activeSlot !== null) {
      updateSlot(activeSlot, number.toString());
      // Opcional: Podríamos pasar al siguiente slot automáticamente, 
      // pero a veces confunde si quieres corregir. Lo dejamos seleccionado.
    }
  };

  const handleCheck = () => {
    const { isCorrect } = checkPracticeAnswer();
    if (isCorrect) {
      setFeedback({ text: '¡Excelente! ¡Suma correcta! 🎉', cls: 'feedback-correct' });
      setActiveSlot(null); // Quitar selección al acertar
    }
    else {
      setFeedback({ text: 'Casi... ¡Revisa las casillas en rojo!', cls: 'feedback-incorrect' });
    }
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
        slots={slots}
        updateSlot={updateSlot}
        activeSlot={activeSlot}
        setActiveSlot={setActiveSlot}
      />

      <div id="feedback-message" className={feedback.cls}>{feedback.text}</div>

      <div id="controls">
        <button id="check-button" onClick={handleCheck}>Comprobar</button>
        <button id="new-problem-button" onClick={() => { startPracticeMission(); }}>
          Nueva Suma
        </button>
      </div>

      <div id="number-palette">
        <h2>Arrastra o pulsa los números 👇</h2>
        <div className="number-tiles-container">
          {[...Array(10).keys()].map(number => (
            <div
              key={number}
              className="number-tile"
              draggable="true"
              onDragStart={(e) => e.dataTransfer.setData('text/plain', number)}
              onClick={() => handlePaletteClick(number)}
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