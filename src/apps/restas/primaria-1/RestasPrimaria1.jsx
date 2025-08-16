import React, { useState, useEffect, useRef, useCallback } from 'react';
// Mismo patrón que Sumas: ruta absoluta al CSS compartido
import '/src/apps/_shared/Restas.css';

const RestasPrimaria1 = () => {
  const problemAreaRef = useRef(null);
  const feedbackMessageRef = useRef(null);

  const [currentOperands, setCurrentOperands] = useState({ num1: 0, num2: 0 });

  // Comprueba si haría falta llevada (no la queremos en 1º)
  const requiereLlevada = (a, b) => {
    const uA = a % 10;
    const dA = Math.floor(a / 10);
    const uB = b % 10;
    const dB = Math.floor(b / 10);
    return uA < uB || dA < dB; // en alguna columna el sustraendo > minuendo
  };

  // --- GENERACIÓN DEL PROBLEMA (2 cifras, sin llevadas) ---
  const generateNewProblem = useCallback(() => {
    let num1, num2;

    // Aseguramos num1 >= num2 y sin necesidad de llevadas por columna
    do {
      num1 = Math.floor(Math.random() * 90) + 10; // 10..99
      num2 = Math.floor(Math.random() * 90) + 10; // 10..99
      if (num2 > num1) [num1, num2] = [num2, num1]; // intercambio simple
    } while (requiereLlevada(num1, num2));

    setCurrentOperands({ num1, num2 });

    const problemArea = problemAreaRef.current;
    const feedbackMessage = feedbackMessageRef.current;
    if (!problemArea || !feedbackMessage) return;

    const num1Str = num1.toString().padStart(2, '0');
    const num2Str = num2.toString().padStart(2, '0');

    // Limpiar área
    problemArea.innerHTML = '';
    feedbackMessage.textContent = '';
    feedbackMessage.className = '';

    // Operador a la izquierda (igual que en Sumas)
    const operator = document.createElement('div');
    operator.className = 'operator';
    operator.textContent = '-';
    problemArea.appendChild(operator);

    // Dos columnas (decenas y unidades)
    for (let i = 0; i < 2; i++) {
      const column = document.createElement('div');
      column.className = 'column';

      // Mismo esqueleto que Sumas: placeholder arriba, las dos filas de dígitos, línea y luego caja de resultado
      column.innerHTML = `
        <div class="carry-placeholder"></div>
        <div class="digit-display">${num1Str[i]}</div>
        <div class="digit-display">${num2Str[i]}</div>
        <hr class="operation-line">
      `;

      const resultBox = document.createElement('div');
      resultBox.className = 'box result-box';
      resultBox.dataset.target = 'true';
      column.appendChild(resultBox);

      problemArea.appendChild(column);
    }

    // Espaciador para equilibrar el ancho como en Sumas
    const spacer = document.createElement('div');
    spacer.className = 'operator-spacer';
    problemArea.appendChild(spacer);

    addDragDropListeners();
  }, []);

  // --- DRAG & DROP idéntico a Sumas ---
  const addDragDropListeners = () => {
    const targetBoxes = problemAreaRef.current.querySelectorAll('[data-target="true"]');
    const numberTiles = document.querySelectorAll('.number-tile');

    numberTiles.forEach(tile => {
      tile.addEventListener('dragstart', e =>
        e.dataTransfer.setData('text/plain', tile.textContent)
      );
    });

    targetBoxes.forEach(box => {
      box.addEventListener('dragover', e => { e.preventDefault(); box.classList.add('drag-over'); });
      box.addEventListener('dragleave', () => box.classList.remove('drag-over'));
      box.addEventListener('drop', e => {
        e.preventDefault();
        box.classList.remove('drag-over', 'correct', 'incorrect');
        box.textContent = e.dataTransfer.getData('text/plain');
      });
    });
  };

  // --- COMPROBACIÓN ---
  const checkAnswer = () => {
    const resultBoxes = problemAreaRef.current.querySelectorAll('.result-box');
    const feedbackMessage = feedbackMessageRef.current;

    const solution = currentOperands.num1 - currentOperands.num2;
    const solutionDigits = solution.toString().padStart(2, '0').split('');

    let userAnswerStr = Array.from(resultBoxes)
      .map(box => box.textContent.trim() || '0')
      .join('');
    const userAnswerNum = parseInt(userAnswerStr, 10);

    let allCorrect = true;
    resultBoxes.forEach((box, i) => {
      box.classList.remove('correct', 'incorrect');
      if (box.textContent === solutionDigits[i]) {
        box.classList.add('correct');
      } else {
        box.classList.add('incorrect');
        allCorrect = false;
      }
    });

    if (allCorrect && userAnswerNum === solution) {
      feedbackMessage.textContent = '¡Genial! ¡Resta correcta! ✅';
      feedbackMessage.className = 'feedback-correct';
    } else {
      feedbackMessage.textContent = 'Revisa las casillas en rojo';
      feedbackMessage.className = 'feedback-incorrect';
    }
  };

  useEffect(() => {
    generateNewProblem();
  }, [generateNewProblem]);

  return (
    <div id="app-container">
      <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
        <span role="img" aria-label="Resta">📝</span>{' '}
        <span className="gradient-text">Resta como en el cole</span>
      </h1>

      <div id="problem-area" ref={problemAreaRef}></div>

      <div id="feedback-message" ref={feedbackMessageRef}></div>

      <div id="controls">
        <button id="check-button" onClick={checkAnswer}>Comprobar</button>
        <button id="new-problem-button" onClick={generateNewProblem}>Nueva Resta</button>
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

export default RestasPrimaria1;
