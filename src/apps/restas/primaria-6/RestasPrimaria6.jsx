import React, { useState, useEffect, useRef, useCallback } from 'react';
import '/src/apps/_shared/Restas.css';

/**
 * Componente para 6º de Primaria: restas de tres números decimales.
 *
 * Este componente amplía el ejercicio de 5º al incluir tres operandos (num1 - num2 - num3).
 * Los números pueden tener 2 o 3 cifras en la parte entera y hasta 2 decimales. Se
 * asegura que el minuendo es mayor o igual que la suma de los dos sustraendos para
 * evitar resultados negativos. La interfaz alinea las cifras por columnas (incluida
 * la coma decimal) y permite colocar cifras arrastrándolas, así como indicar las
 * llevadas necesarias en cada columna.
 */
const RestasPrimaria6 = () => {
  const problemAreaRef = useRef(null);
  const feedbackRef = useRef(null);
  const [nums, setNums] = useState({ num1: '', num2: '', num3: '' });
  // meta contiene: número total de columnas, decimales máximos y cifras enteras de entrada
  const [meta, setMeta] = useState({ digitsCount: 0, maxDec: 0, cifrasEnteras: 0 });
  const [helpEnabled, setHelpEnabled] = useState(true);
  // userBorrowsRef guarda en cada índice si el usuario ha marcado una llevada (1) o no (0)
  const userBorrowsRef = useRef([]);

  /**
   * Genera un número aleatorio con la cantidad indicada de cifras enteras y decimales.
   * Devuelve una cadena utilizando coma como separador decimal. Por ejemplo, "123,4".
   */
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

  /**
   * Toma un número en formato de cadena con coma decimal y lo rellena a la izquierda
   * (parte entera) y derecha (parte decimal) con espacios para alinear columnas.
   * También se incluye una "columna de guardia" adicional a la izquierda. Por
   * ejemplo, padNumero("23,5", 3, 2) devuelve " 23,50".
   */
  const padNumero = (num, maxEnteros, maxDec) => {
    const tieneComa = num.includes(',');
    const [entCruda, decCruda = ''] = tieneComa ? num.split(',') : [num, ''];
    // Rellenar la parte entera a la izquierda con espacios. Incluimos una columna de guardia
    const entPad = entCruda.padStart(maxEnteros + 1, ' ');
    if (maxDec > 0) {
      const decPad = decCruda.padEnd(maxDec, ' ');
      return `${entPad},${decPad}`;
    }
    return entPad;
  };

  /**
   * Genera un nuevo ejercicio triple con números decimales. Se asegura que
   * num1 >= num2 + num3 para evitar resultados negativos.
   */
  const generateNewProblem = useCallback(() => {
    // Elegir 2 o 3 cifras en la parte entera
    const cifrasEnteras = Math.random() < 0.5 ? 2 : 3;
    // Generar números de decimales para cada operando (0, 1 o 2) y asegurarse de que
    // al menos uno de ellos tenga decimales distintos de 0 (para hacer el ejercicio variado)
    const decOptions = [0, 1, 2];
    let d1 = decOptions[Math.floor(Math.random() * decOptions.length)];
    let d2 = decOptions[Math.floor(Math.random() * decOptions.length)];
    let d3 = decOptions[Math.floor(Math.random() * decOptions.length)];
    if (d1 === 0 && d2 === 0 && d3 === 0) {
      // Obligamos al menos un decimal si todos son cero
      const idx = Math.floor(Math.random() * 3);
      if (idx === 0) d1 = 1; else if (idx === 1) d2 = 1; else d3 = 1;
    }
    let a, b, c;
    do {
      a = generarNumero(cifrasEnteras, d1);
      b = generarNumero(cifrasEnteras, d2);
      c = generarNumero(cifrasEnteras, d3);
    } while (
      parseFloat(a.replace(',', '.')) <
      parseFloat(b.replace(',', '.')) + parseFloat(c.replace(',', '.'))
    );
    setNums({ num1: a, num2: b, num3: c });
    const maxDec = Math.max(d1, d2, d3);
    // Número de columnas: cifras enteras + coma (si hay decimales) + decimales
    const digitsCount = cifrasEnteras + (maxDec > 0 ? 1 + maxDec : 0);
    setMeta({ digitsCount, maxDec, cifrasEnteras });
    userBorrowsRef.current = new Array(digitsCount).fill(0);
    const problemArea = problemAreaRef.current;
    const feedback = feedbackRef.current;
    if (!problemArea || !feedback) return;
    // Limpiar interfaz
    problemArea.innerHTML = '';
    feedback.textContent = '';
    feedback.className = '';
    // Configurar el grid. Cada columna del número se compone de dos subcolumnas: una para la
    // caja de llevada (círculo) y otra para el dígito. La primera columna (35px) se reserva
    // para el operador '-'.
    const columnTemplate = '25px 60px ';
    problemArea.style.gridTemplateColumns = `35px ${columnTemplate.repeat(digitsCount)}`;
    // Colocar el operador '-' en la fila del primer sustraendo (fila 3)
    const operator = document.createElement('div');
    operator.className = 'operator';
    operator.textContent = '-';
    operator.style.gridRow = '3';
    operator.style.gridColumn = '1';
    problemArea.appendChild(operator);
    // Preparar cadenas con relleno para cada número
    const aPadded = padNumero(a, cifrasEnteras, maxDec);
    const bPadded = padNumero(b, cifrasEnteras, maxDec);
    const cPadded = padNumero(c, cifrasEnteras, maxDec);
    // Índice de la coma (en el string rellenado) si hay decimales
    const commaIndex = maxDec > 0 ? cifrasEnteras + 1 /* guardia + enteros */ : -1;
    // Construir columnas
    for (let i = 0; i < digitsCount; i++) {
      const circleCol = 2 + i * 2;
      const digitCol = 3 + i * 2;
      const charA = aPadded[i] ?? ' ';
      const charB = bPadded[i] ?? ' ';
      const charC = cPadded[i] ?? ' ';
      const esComa = i === commaIndex;
      // Caja de llevada (salvo en la primera columna y en la coma)
      if (i !== 0 && !esComa) {
        const borrowBox = document.createElement('div');
        borrowBox.className = 'borrow-helper-box';
        borrowBox.dataset.target = 'true';
        borrowBox.dataset.type = 'borrow';
        borrowBox.dataset.index = i.toString();
        borrowBox.style.gridRow = '1';
        borrowBox.style.gridColumn = circleCol.toString();
        problemArea.appendChild(borrowBox);
      }
      // Dígitos del minuendo (num1)
      const top = document.createElement('div');
      top.className = 'digit-display';
      top.textContent = charA;
      top.style.gridRow = '2';
      top.style.gridColumn = digitCol.toString();
      problemArea.appendChild(top);
      // Dígitos del primer sustraendo (num2)
      const mid = document.createElement('div');
      mid.className = 'digit-display';
      mid.textContent = charB;
      mid.style.gridRow = '3';
      mid.style.gridColumn = digitCol.toString();
      problemArea.appendChild(mid);
      // Dígitos del segundo sustraendo (num3)
      const bot = document.createElement('div');
      bot.className = 'digit-display';
      bot.textContent = charC;
      bot.style.gridRow = '4';
      bot.style.gridColumn = digitCol.toString();
      problemArea.appendChild(bot);
      // Casilla de resultado o coma
      if (esComa) {
        const commaBox = document.createElement('div');
        commaBox.className = 'box';
        commaBox.style.gridRow = '6';
        commaBox.style.gridColumn = digitCol.toString();
        const span = document.createElement('span');
        span.textContent = ',';
        commaBox.appendChild(span);
        problemArea.appendChild(commaBox);
      } else {
        const resBox = document.createElement('div');
        resBox.className = 'box result-box';
        resBox.dataset.target = 'true';
        resBox.style.gridRow = '6';
        resBox.style.gridColumn = digitCol.toString();
        problemArea.appendChild(resBox);
      }
    }
    // Línea de operación antes de la fila de resultado (fila 5)
    const hr = document.createElement('hr');
    hr.className = 'operation-line';
    hr.style.gridRow = '5';
    hr.style.gridColumn = `2 / ${2 + digitsCount * 2}`;
    problemArea.appendChild(hr);
    // Mostrar/ocultar cajas de llevadas según la ayuda
    problemArea.classList.toggle('borrows-hidden', !helpEnabled);
    addDragDropListeners();
  }, [helpEnabled]);

  /**
   * Añade listeners de arrastrar y soltar a las casillas de resultado y de llevada.
   * Permite arrastrar las fichas de números desde la paleta y soltarlas en las
   * casillas correspondientes. También registra las llevadas elegidas por el usuario.
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
   * Construye la respuesta del usuario leyendo las casillas de resultado. Devuelve tanto la
   * cadena con coma decimal como el número en punto flotante.
   */
  const buildUserAnswer = () => {
    const problemArea = problemAreaRef.current;
    if (!problemArea) return { str: '', num: 0 };
    const digitsCount = meta.digitsCount;
    const cifrasEnteras = meta.cifrasEnteras;
    const maxDec = meta.maxDec;
    const commaIndex = maxDec > 0 ? cifrasEnteras + 1 : -1;
    let chars = [];
    let resultIdx = 0;
    for (let i = 0; i < digitsCount; i++) {
      if (i === commaIndex) {
        chars.push(',');
      } else {
        // Seleccionar la caja correspondiente. Si no existe, tomamos la siguiente por orden.
        const box = problemArea.querySelector(
          `.result-box[style*="grid-column: ${3 + i * 2}px"]`
        );
        const resultBoxes = problemArea.querySelectorAll('.result-box');
        const current = resultBoxes[resultIdx++];
        const char = current && current.textContent.trim() ? current.textContent.trim() : '0';
        chars.push(char);
      }
    }
    const str = chars.join('');
    const num = parseFloat(str.replace(',', '.'));
    return { str, num };
  };

  /**
   * Comprueba la respuesta del usuario y las llevadas introducidas. Marca las casillas de
   * resultado como correctas o incorrectas y muestra un mensaje informativo. Si la ayuda
   * está activada, también valida las llevadas.
   */
  const checkAnswer = () => {
    const { str: userStr, num: userNum } = buildUserAnswer();
    const a = parseFloat(nums.num1.replace(',', '.'));
    const b = parseFloat(nums.num2.replace(',', '.'));
    const c = parseFloat(nums.num3.replace(',', '.'));
    const correctNum = a - b - c;
    const maxDec = meta.maxDec;
    // Formatear la respuesta correcta con el mismo número de decimales para comparar columna a columna
    const correctStrWithDec = maxDec > 0 ? correctNum.toFixed(maxDec).replace('.', ',') : Math.round(correctNum).toString();
    // Rellenar la respuesta correcta con el mismo número de cifras enteras que los operandos
    const padCorrect = padNumero(correctStrWithDec, meta.cifrasEnteras, maxDec);
    const problemArea = problemAreaRef.current;
    if (!problemArea) return;
    const resultBoxes = problemArea.querySelectorAll('.result-box');
    const commaIndex = maxDec > 0 ? meta.cifrasEnteras + 1 : -1;
    // Comparar dígito a dígito
    let boxIdx = 0;
    for (let i = 0; i < meta.digitsCount; i++) {
      if (i === commaIndex) continue;
      const correctChar = padCorrect[i];
      const box = resultBoxes[boxIdx++];
      box.classList.remove('correct', 'incorrect');
      const userChar = box.textContent.trim() || '0';
      const isCorrect =
        userChar === correctChar ||
        (correctChar === '0' && userChar === '');
      box.classList.add(isCorrect ? 'correct' : 'incorrect');
    }
    const isResultCorrect = parseFloat(userStr.replace(',', '.')) === correctNum;
    // Validar llevadas si la ayuda está activada
    let hasWrongBorrow = false;
    if (helpEnabled) {
      // Convertir cada cadena paddeada en un array de dígitos (la coma y espacios cuentan como 0)
      const toDigits = (str) =>
        str.split('').map(ch => (ch >= '0' && ch <= '9' ? parseInt(ch) : 0));
      const aDigits = toDigits(padNumero(nums.num1, meta.cifrasEnteras, maxDec));
      const bDigits = toDigits(padNumero(nums.num2, meta.cifrasEnteras, maxDec));
      const cDigits = toDigits(padNumero(nums.num3, meta.cifrasEnteras, maxDec));
      let carry = 0;
      const borrowBoxes = problemArea.querySelectorAll('.borrow-helper-box');
      borrowBoxes.forEach(bx => bx.classList.remove('correct', 'incorrect'));
      for (let i = meta.digitsCount - 1; i >= 0; i--) {
        if (i === commaIndex) continue;
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

export default RestasPrimaria6;