import React, { useState, useEffect, useRef, useCallback } from 'react';
import '/src/apps/_shared/Restas.css';

/**
 * Componente para 5º de Primaria: restas con números decimales (hasta 2 decimales).
 *
 * Se generan dos números de 2 o 3 cifras con uno o dos decimales. El
 * alumno debe realizar la resta arrastrando los dígitos correctos a las
 * casillas de resultado. Las cajas de llevada permiten indicar cuándo
 * es necesario pedir prestado en cada columna. Las cifras se muestran
 * alineadas por columnas, incluyendo la coma decimal.
 */
const RestasPrimaria5 = () => {
  const problemAreaRef = useRef(null);
  const feedbackRef = useRef(null);
  const [nums, setNums] = useState({ num1: '', num2: '' });
  const [meta, setMeta] = useState({ digitsCount: 0, maxDec: 0, cifrasEnteras: 0 });
  const [helpEnabled, setHelpEnabled] = useState(true);
  const userBorrowsRef = useRef([]);

  /**
   * Genera un número aleatorio con una cantidad dada de cifras enteras y decimales.
   * Devuelve una cadena con coma como separador decimal (por ejemplo "123,4").
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
   * Convierte un número como cadena con coma decimal a un string de dígitos y
   * coma, con relleno a la izquierda (enteros) y derecha (decimales) usando
   * espacios. También incluye una columna de guardia a la izquierda.
   */
  const padNumero = (num, maxEnteros, maxDec) => {
    const tieneComa = num.includes(',');
    const [entCruda, decCruda = ''] = tieneComa ? num.split(',') : [num, ''];
    // Rellenar parte entera: maxEnteros + 1 (incluye guardia)
    const entPad = entCruda.padStart(maxEnteros + 1, ' ');
    if (maxDec > 0) {
      const decPad = decCruda.padEnd(maxDec, ' ');
      return `${entPad},${decPad}`;
    } else {
      return entPad;
    }
  };

  /**
   * Genera un nuevo ejercicio decimal, asegurando que num1 >= num2.
   */
  const generateNewProblem = useCallback(() => {
    // Elegir 2 o 3 cifras enteras
    const cifrasEnteras = Math.random() < 0.5 ? 2 : 3;
    // 70% misma cantidad de decimales, 30% distinta
    const mismaCantidad = Math.random() > 0.3;
    let dec1, dec2;
    if (mismaCantidad) {
      dec1 = [1, 2][Math.floor(Math.random() * 2)];
      dec2 = dec1;
    } else {
      const opciones = [0, 1, 2];
      do {
        dec1 = opciones[Math.floor(Math.random() * opciones.length)];
        dec2 = opciones[Math.floor(Math.random() * opciones.length)];
      } while (dec1 === dec2 || (dec1 === 0 && dec2 === 0));
    }
    // Generar números
    let a = generarNumero(cifrasEnteras, dec1);
    let b = generarNumero(cifrasEnteras, dec2);
    // Asegurar que a >= b
    const parseNum = (str) => parseFloat(str.replace(',', '.'));
    if (parseNum(a) < parseNum(b)) {
      const tmp = a;
      a = b;
      b = tmp;
    }
    setNums({ num1: a, num2: b });
    const maxDec = Math.max(dec1, dec2);
    const digitsCount = cifrasEnteras + (maxDec > 0 ? 1 + maxDec : 0);
    setMeta({ digitsCount, maxDec, cifrasEnteras });
    userBorrowsRef.current = new Array(digitsCount).fill(0);
    const problemArea = problemAreaRef.current;
    const feedback = feedbackRef.current;
    if (!problemArea || !feedback) return;
    problemArea.innerHTML = '';
    feedback.textContent = '';
    feedback.className = '';
    // Configurar rejilla: una columna para el operador y dos subcolumnas por cada carácter
    const columnTemplate = '25px 60px ';
    problemArea.style.gridTemplateColumns = `35px ${columnTemplate.repeat(digitsCount)}`;
    // Operador '-' en la fila del sustraendo (fila 3)
    const operator = document.createElement('div');
    operator.className = 'operator';
    operator.textContent = '-';
    operator.style.gridRow = '3';
    operator.style.gridColumn = '1';
    problemArea.appendChild(operator);
    // Preparar cadenas con relleno
    const aPadded = padNumero(a, cifrasEnteras, maxDec);
    const bPadded = padNumero(b, cifrasEnteras, maxDec);
    // Índice de la coma (si existe)
    const commaIndex = maxDec > 0 ? cifrasEnteras + 1 /* guardia + enteros */ : -1;
    // Crear columnas
    for (let i = 0; i < digitsCount; i++) {
      const circleCol = 2 + i * 2;
      const digitCol = 3 + i * 2;
      const charA = aPadded[i] ?? ' ';
      const charB = bPadded[i] ?? ' ';
      const esComa = i === commaIndex;
      // Caja de llevada si no es coma ni primera columna
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
      // Dígitos del minuendo y sustraendo
      const top = document.createElement('div');
      top.className = 'digit-display';
      top.textContent = charA;
      top.style.gridRow = '2';
      top.style.gridColumn = digitCol.toString();
      problemArea.appendChild(top);
      const bot = document.createElement('div');
      bot.className = 'digit-display';
      bot.textContent = charB;
      bot.style.gridRow = '3';
      bot.style.gridColumn = digitCol.toString();
      problemArea.appendChild(bot);
      // Caja de resultado o coma
      if (esComa) {
        const commaBox = document.createElement('div');
        commaBox.className = 'box';
        commaBox.style.gridRow = '5';
        commaBox.style.gridColumn = digitCol.toString();
        const span = document.createElement('span');
        span.textContent = ',';
        commaBox.appendChild(span);
        problemArea.appendChild(commaBox);
      } else {
        const resBox = document.createElement('div');
        resBox.className = 'box result-box';
        resBox.dataset.target = 'true';
        resBox.style.gridRow = '5';
        resBox.style.gridColumn = digitCol.toString();
        problemArea.appendChild(resBox);
      }
    }
    // Línea de operación justo antes de la fila de resultado (fila 4)
    const hr = document.createElement('hr');
    hr.className = 'operation-line';
    hr.style.gridRow = '4';
    hr.style.gridColumn = `2 / ${2 + digitsCount * 2}`;
    problemArea.appendChild(hr);
    // Mostrar/ocultar cajas de llevadas
    problemArea.classList.toggle('borrows-hidden', !helpEnabled);
    addDragDropListeners();
  }, [helpEnabled]);

  /**
   * Añade listeners de drag & drop a las casillas de resultado y a las de llevadas.
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
   * Construye la respuesta del usuario a partir de las casillas de resultado y
   * devuelve tanto el número como la cadena de caracteres completa con coma.
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
        const box = problemArea.querySelector(
          `.result-box[style*="grid-column: ${3 + i * 2}px"]`
        );
        // Fallback: buscar por orden
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
   * Comprueba la respuesta del usuario y las llevadas introducidas.
   */
  const checkAnswer = () => {
    const { str: userStr, num: userNum } = buildUserAnswer();
    const a = parseFloat(nums.num1.replace(',', '.'));
    const b = parseFloat(nums.num2.replace(',', '.'));
    const correctNum = a - b;
    const maxDec = meta.maxDec;
    // Formatear la respuesta correcta con el mismo número de decimales
    const correctStrWithDec = correctNum
      .toFixed(maxDec)
      .replace('.', ',');
    // Rellenar a la izquierda y derecha para comparar por columnas
    const padCorrect = padNumero(correctStrWithDec, meta.cifrasEnteras, maxDec);
    const problemArea = problemAreaRef.current;
    if (!problemArea) return;
    const resultBoxes = problemArea.querySelectorAll('.result-box');
    // Índice de coma
    const commaIndex = maxDec > 0 ? meta.cifrasEnteras + 1 : -1;
    // Comparar dígitos
    let boxIdx = 0;
    for (let i = 0; i < meta.digitsCount; i++) {
      if (i === commaIndex) continue; // no hay caja de resultado aquí
      const correctChar = padCorrect[i];
      const box = resultBoxes[boxIdx++];
      box.classList.remove('correct', 'incorrect');
      const userChar = box.textContent.trim() || '0';
      // Se permite dejar en blanco un cero a la izquierda
      const isCorrect =
        userChar === correctChar ||
        (correctChar === '0' && userChar === '');
      box.classList.add(isCorrect ? 'correct' : 'incorrect');
    }
    const isResultCorrect = parseFloat(userStr.replace(',', '.')) === correctNum;
    // Calcular llevadas correctas
    let hasWrongBorrow = false;
    if (helpEnabled) {
      // Crear arrays de dígitos (0 para espacios o coma)
      const toDigits = (str) =>
        str.split('').map(ch => (ch >= '0' && ch <= '9' ? parseInt(ch) : 0));
      const aDigits = toDigits(padNumero(nums.num1, meta.cifrasEnteras, maxDec));
      const bDigits = toDigits(padNumero(nums.num2, meta.cifrasEnteras, maxDec));
      let carry = 0;
      // Resetear clases de las cajas de llevada
      const borrowBoxes = problemArea.querySelectorAll('.borrow-helper-box');
      borrowBoxes.forEach(b => b.classList.remove('correct', 'incorrect'));
      for (let i = meta.digitsCount - 1; i >= 0; i--) {
        if (i === commaIndex) {
          continue;
        }
        const top = aDigits[i];
        const bottom = bDigits[i] + carry;
        const neededBorrow = top < bottom;
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
        feedback.textContent = '¡Genial! ¡Resta correcta! ✅';
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

export default RestasPrimaria5;