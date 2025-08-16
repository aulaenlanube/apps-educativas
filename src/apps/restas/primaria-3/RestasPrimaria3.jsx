import React, { useState, useEffect, useRef, useCallback } from 'react';
import '/src/apps/_shared/Restas.css';

/**
 * Componente para 3º de Primaria: restas de 3 o 4 cifras con llevadas.
 *
 * Genera restas de tres o cuatro dígitos en las que el minuendo es
 * siempre mayor o igual que el sustraendo. Permite practicar las
 * llevadas entre columnas. El número de cifras se elige aleatoriamente
 * (50% de probabilidad de cada uno) para aportar variedad.
 */
const RestasPrimaria3 = () => {
  const problemAreaRef = useRef(null);
  const feedbackRef = useRef(null);
  const [originalOperands, setOriginalOperands] = useState({ num1: 0, num2: 0, digits: 3 });
  const [helpEnabled, setHelpEnabled] = useState(true);
  const userBorrowsRef = useRef([]);

  /**
   * Genera un nuevo ejercicio de resta. Puede ser de 3 o 4 cifras.
   */
  const generateNewProblem = useCallback(() => {
    // Decide aleatoriamente si se usan 3 o 4 cifras
    const digits = Math.random() < 0.5 ? 3 : 4;
    const min = Math.pow(10, digits - 1);
    const max = Math.pow(10, digits) - 1;
    let num1, num2;
    // Garantizar que num1 >= num2
    do {
      num1 = Math.floor(Math.random() * (max - min + 1)) + min;
      num2 = Math.floor(Math.random() * (max - min + 1)) + min;
    } while (num1 < num2);
    setOriginalOperands({ num1, num2, digits });
    userBorrowsRef.current = new Array(digits).fill(0);
    const problemArea = problemAreaRef.current;
    const feedback = feedbackRef.current;
    if (!problemArea || !feedback) return;
    problemArea.innerHTML = '';
    feedback.textContent = '';
    feedback.className = '';
    const columnTemplate = '25px 60px ';
    problemArea.style.gridTemplateColumns = `35px ${columnTemplate.repeat(digits)}`;
    // Operador '-'
    const operator = document.createElement('div');
    operator.className = 'operator';
    operator.textContent = '-';
    operator.style.gridRow = '2';
    operator.style.gridColumn = '1';
    problemArea.appendChild(operator);
    const num1Str = num1.toString().padStart(digits, '0');
    const num2Str = num2.toString().padStart(digits, '0');
    for (let i = 0; i < digits; i++) {
      const circleGridCol = 2 + i * 2;
      const digitGridCol = 3 + i * 2;
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
      // minuendo
      const topDigit = document.createElement('div');
      topDigit.className = 'digit-display';
      topDigit.textContent = num1Str[i];
      topDigit.style.gridRow = '1';
      topDigit.style.gridColumn = digitGridCol.toString();
      problemArea.appendChild(topDigit);
      // sustraendo
      const botDigit = document.createElement('div');
      botDigit.className = 'digit-display subtrahend-digit';
      botDigit.textContent = num2Str[i];
      botDigit.style.gridRow = '2';
      botDigit.style.gridColumn = digitGridCol.toString();
      botDigit.dataset.index = i.toString();
      problemArea.appendChild(botDigit);
      // resultado
      const resultBox = document.createElement('div');
      resultBox.className = 'box result-box';
      resultBox.dataset.target = 'true';
      resultBox.style.gridRow = '4';
      resultBox.style.gridColumn = digitGridCol.toString();
      problemArea.appendChild(resultBox);
    }
    const hr = document.createElement('hr');
    hr.className = 'operation-line';
    hr.style.gridRow = '3';
    hr.style.gridColumn = `2 / ${2 + digits * 2}`;
    problemArea.appendChild(hr);
    problemArea.classList.toggle('borrows-hidden', !helpEnabled);
    addDragDropListeners();
    updateSubtrahendDisplay();
  }, [helpEnabled]);

  /**
   * Drag & drop listeners.
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
          updateSubtrahendDisplay();
        }
      });
    });
  };

  /**
   * Actualiza los dígitos del sustraendo aplicando las llevadas definidas
   * por el usuario. Si hay una llevada en la columna i+1, se suma 1 al
   * dígito de la columna i del sustraendo.
   */
  const updateSubtrahendDisplay = () => {
    if (!helpEnabled) return;
    const problemArea = problemAreaRef.current;
    if (!problemArea) return;
    const subDigits = problemArea.querySelectorAll('.subtrahend-digit');
    const n = subDigits.length;
    if (n === 0) return;
    const orig = originalOperands.num2
      .toString()
      .padStart(n, '0')
      .split('')
      .map(d => parseInt(d));
    subDigits.forEach((el, i) => {
      let carryFromRight = 0;
      if (i < n - 1 && userBorrowsRef.current[i + 1] === 1) carryFromRight = 1;
      const newVal = orig[i] + carryFromRight;
      el.textContent = newVal.toString();
      el.classList.remove('modified-digit');
      if (newVal !== orig[i]) {
        el.classList.add('modified-digit');
      }
    });
  };

  /**
   * Comprueba la respuesta y las llevadas del usuario.
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
    const correctAnswer = originalOperands.num1 - originalOperands.num2;
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
    let hasWrittenIncorrectBorrow = false;
    if (helpEnabled) {
      const minuendDigits = originalOperands.num1
        .toString()
        .padStart(n, '0')
        .split('')
        .map(d => parseInt(d));
      const subDigits = originalOperands.num2
        .toString()
        .padStart(n, '0')
        .split('')
        .map(d => parseInt(d));
      let carry = 0;
      borrowBoxes.forEach(b => b.classList.remove('correct', 'incorrect'));
      for (let i = n - 1; i >= 0; i--) {
        const topDigit = minuendDigits[i];
        const bottomDigit = subDigits[i] + carry;
        const neededBorrow = topDigit < bottomDigit;
        const userPlaced = userBorrowsRef.current[i] === 1;
        const caja = problemArea.querySelector(
          `.borrow-helper-box[data-index="${i}"]`
        );
        if (userPlaced) {
          if (neededBorrow) {
            if (caja) caja.classList.add('correct');
          } else {
            if (caja) caja.classList.add('incorrect');
            hasWrittenIncorrectBorrow = true;
          }
        }
        if (!isResultCorrect && neededBorrow && !userPlaced) {
          if (caja) caja.classList.add('incorrect');
          hasWrittenIncorrectBorrow = true;
        }
        carry = neededBorrow ? 1 : 0;
      }
    }
    const feedback = feedbackRef.current;
    if (!feedback) return;
    if (isResultCorrect) {
      if (!helpEnabled || !hasWrittenIncorrectBorrow) {
        feedback.textContent = '¡Perfecto! ¡Resta correcta! ✅';
        feedback.className = 'feedback-correct';
        borrowBoxes.forEach(b => b.classList.remove('incorrect'));
      } else {
        feedback.textContent = 'El resultado es correcto, pero revisa las llevadas.';
        feedback.className = 'feedback-incorrect';
      }
    } else {
      feedback.textContent = '¡Ups! Revisa los números y las llevadas. ❌';
      feedback.className = 'feedback-incorrect';
    }
  };

  const handleToggleHelp = () => {
    setHelpEnabled(prev => !prev);
    const problemArea = problemAreaRef.current;
    if (problemArea) {
      problemArea.classList.toggle('borrows-hidden', helpEnabled);
    }
    setTimeout(() => updateSubtrahendDisplay(), 0);
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

export default RestasPrimaria3;