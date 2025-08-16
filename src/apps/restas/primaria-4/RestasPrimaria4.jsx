import React, { useState, useEffect, useRef, useCallback } from 'react';
import '/src/apps/_shared/Restas.css';

/**
 * Componente para 4º de Primaria: restas de tres números (resta triple) con 3 o 4 cifras.
 *
 * Este componente genera restas en las que hay que calcular num1 - num2 - num3.
 * Los tres números comparten el mismo número de cifras (3 o 4, elegidas al azar) y
 * el minuendo siempre es mayor o igual que la suma de los dos sustraendos para evitar
 * resultados negativos. Se muestran cajas de llevadas para que el alumno practique
 * dónde debe pedir prestado en cada columna.
 */
const RestasPrimaria4 = () => {
  const problemAreaRef = useRef(null);
  const feedbackRef = useRef(null);
  // operandos: array de tres números y el número de cifras
  const [operands, setOperands] = useState({ nums: [], digits: 3 });
  const [helpEnabled, setHelpEnabled] = useState(true);
  const userBorrowsRef = useRef([]);

  /**
   * Genera un nuevo ejercicio triple. Se asegura que num1 >= num2 + num3.
   */
  const generateNewProblem = useCallback(() => {
    const digits = Math.random() < 0.5 ? 3 : 4;
    const min = Math.pow(10, digits - 1);
    const max = Math.pow(10, digits) - 1;
    let num1, num2, num3;
    do {
      num1 = Math.floor(Math.random() * (max - min + 1)) + min;
      num2 = Math.floor(Math.random() * (max - min + 1)) + min;
      num3 = Math.floor(Math.random() * (max - min + 1)) + min;
    } while (num1 < num2 + num3);
    setOperands({ nums: [num1, num2, num3], digits });
    userBorrowsRef.current = new Array(digits).fill(0);
    const problemArea = problemAreaRef.current;
    const feedback = feedbackRef.current;
    if (!problemArea || !feedback) return;
    problemArea.innerHTML = '';
    feedback.textContent = '';
    feedback.className = '';
    const columnTemplate = '25px 60px ';
    problemArea.style.gridTemplateColumns = `35px ${columnTemplate.repeat(digits)}`;
    // Colocar el operador en la fila del primer sustraendo (fila 3)
    const operator = document.createElement('div');
    operator.className = 'operator';
    operator.textContent = '-';
    operator.style.gridRow = '3';
    operator.style.gridColumn = '1';
    problemArea.appendChild(operator);
    // Convertir números a cadenas con relleno
    const [n1, n2, n3] = [num1, num2, num3];
    const num1Str = n1.toString().padStart(digits, '0');
    const num2Str = n2.toString().padStart(digits, '0');
    const num3Str = n3.toString().padStart(digits, '0');
    for (let i = 0; i < digits; i++) {
      const circleGridCol = 2 + i * 2;
      const digitGridCol = 3 + i * 2;
      // Caja de llevada (salvo en la columna más a la izquierda)
      if (i !== 0) {
        const borrowBox = document.createElement('div');
        borrowBox.className = 'borrow-helper-box';
        borrowBox.dataset.target = 'true';
        borrowBox.dataset.type = 'borrow';
        borrowBox.dataset.index = i.toString();
        borrowBox.style.gridRow = '1';
        borrowBox.style.gridColumn = circleGridCol.toString();
        problemArea.appendChild(borrowBox);
      }
      // Dígito del minuendo
      const top = document.createElement('div');
      top.className = 'digit-display';
      top.textContent = num1Str[i];
      top.style.gridRow = '2';
      top.style.gridColumn = digitGridCol.toString();
      problemArea.appendChild(top);
      // Dígito del primer sustraendo
      const mid = document.createElement('div');
      mid.className = 'digit-display';
      mid.textContent = num2Str[i];
      mid.style.gridRow = '3';
      mid.style.gridColumn = digitGridCol.toString();
      problemArea.appendChild(mid);
      // Dígito del segundo sustraendo
      const bot = document.createElement('div');
      bot.className = 'digit-display';
      bot.textContent = num3Str[i];
      bot.style.gridRow = '4';
      bot.style.gridColumn = digitGridCol.toString();
      problemArea.appendChild(bot);
      // Caja de resultado
      const result = document.createElement('div');
      result.className = 'box result-box';
      result.dataset.target = 'true';
      result.style.gridRow = '6';
      result.style.gridColumn = digitGridCol.toString();
      problemArea.appendChild(result);
    }
    // Línea de operación
    const hr = document.createElement('hr');
    hr.className = 'operation-line';
    hr.style.gridRow = '5';
    hr.style.gridColumn = `2 / ${2 + digits * 2}`;
    problemArea.appendChild(hr);
    // Mostrar/ocultar cajas de llevadas
    problemArea.classList.toggle('borrows-hidden', !helpEnabled);
    addDragDropListeners();
  }, [helpEnabled]);

  /**
   * Listeners de drag & drop para las cajas de resultado y las de llevadas.
   */
  const addDragDropListeners = () => {
    const problemArea = problemAreaRef.current;
    if (!problemArea) return;
    const targets = problemArea.querySelectorAll('[data-target="true"]');
    const tiles = document.querySelectorAll('.number-tile');
    tiles.forEach(tile => {
      tile.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', tile.textContent);
      });
    });
    targets.forEach(box => {
      box.addEventListener('dragover', e => {
        e.preventDefault();
        box.classList.add('drag-over');
      });
      box.addEventListener('dragleave', () => box.classList.remove('drag-over'));
      box.addEventListener('drop', e => {
        e.preventDefault();
        box.classList.remove('drag-over', 'correct', 'incorrect');
        const digit = e.dataTransfer.getData('text/plain');
        box.textContent = digit;
        if (box.dataset.type === 'borrow') {
          const idx = parseInt(box.dataset.index);
          userBorrowsRef.current[idx] = digit === '1' ? 1 : 0;
        }
      });
    });
  };

  /**
   * Comprueba la resta triple y las llevadas.
   */
  const checkAnswer = () => {
    const problemArea = problemAreaRef.current;
    if (!problemArea) return;
    const resultBoxes = problemArea.querySelectorAll('.result-box');
    const borrowBoxes = problemArea.querySelectorAll('.borrow-helper-box');
    const n = resultBoxes.length;
    const userAnswerStr = Array.from(resultBoxes)
      .map(box => box.textContent.trim() || '0')
      .join('');
    const userAnswerNum = parseInt(userAnswerStr, 10);
    const [num1, num2, num3] = operands.nums;
    const correctAnswer = num1 - num2 - num3;
    const isResultCorrect = userAnswerNum === correctAnswer;
    const correctDigits = correctAnswer
      .toString()
      .padStart(n, '0')
      .split('');
    resultBoxes.forEach((box, i) => {
      box.classList.remove('correct', 'incorrect');
      if (box.textContent === correctDigits[i]) {
        box.classList.add('correct');
      } else {
        box.classList.add('incorrect');
      }
    });
    let hasWrongBorrow = false;
    if (helpEnabled) {
      const pad = (num) => num.toString().padStart(n, '0').split('').map(d => parseInt(d));
      const aDigits = pad(num1);
      const bDigits = pad(num2);
      const cDigits = pad(num3);
      let carry = 0;
      borrowBoxes.forEach(b => b.classList.remove('correct', 'incorrect'));
      for (let i = n - 1; i >= 0; i--) {
        const top = aDigits[i];
        const bottomSum = bDigits[i] + cDigits[i] + carry;
        const neededBorrow = top < bottomSum;
        const userPlaced = userBorrowsRef.current[i] === 1;
        const caja = problemArea.querySelector(
          `.borrow-helper-box[data-index="${i}"]`
        );
        if (userPlaced) {
          if (neededBorrow) {
            if (caja) caja.classList.add('correct');
          } else {
            if (caja) caja.classList.add('incorrect');
            hasWrongBorrow = true;
          }
        }
        if (!isResultCorrect && neededBorrow && !userPlaced) {
          if (caja) caja.classList.add('incorrect');
          hasWrongBorrow = true;
        }
        carry = neededBorrow ? 1 : 0;
      }
    }
    const feedback = feedbackRef.current;
    if (!feedback) return;
    if (isResultCorrect) {
      if (!helpEnabled || !hasWrongBorrow) {
        feedback.textContent = '¡Muy bien! ¡Resta correcta! ✅';
        feedback.className = 'feedback-correct';
        borrowBoxes.forEach(b => b.classList.remove('incorrect'));
      } else {
        feedback.textContent = 'El resultado es correcto, pero revisa las llevadas.';
        feedback.className = 'feedback-incorrect';
      }
    } else {
      feedback.textContent = '¡Ups! Revisa los números y las llevadas.';
      feedback.className = 'feedback-incorrect';
    }
  };

  const handleToggleHelp = () => {
    setHelpEnabled(prev => !prev);
    const area = problemAreaRef.current;
    if (area) area.classList.toggle('borrows-hidden', helpEnabled);
  };

  useEffect(() => {
    generateNewProblem();
  }, [generateNewProblem]);

  return (
    <>
      <h1>Resta como en el cole 📝</h1>
      <div id="options-area">
        <label htmlFor="help-toggle">Ayuda con llevadas</label>
        <label className="switch">
          <input
            id="help-toggle"
            type="checkbox"
            checked={helpEnabled}
            onChange={handleToggleHelp}
          />
          <span className="slider round"></span>
        </label>
      </div>
      <div ref={problemAreaRef} id="problem-area"></div>
      <div ref={feedbackRef} id="feedback-message"></div>
      <div id="controls">
        <button onClick={checkAnswer}>Comprobar</button>
        <button onClick={generateNewProblem}>Nueva Resta</button>
      </div>
      <div id="number-palette">
        <h2>Arrastra los números 👇</h2>
        <div className="number-tiles-container">
          {[...Array(10).keys()].map(n => (
            <div key={n} className="number-tile" draggable="true">
              {n}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default RestasPrimaria4;