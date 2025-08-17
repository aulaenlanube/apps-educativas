import React, { useEffect, useRef } from "react";
import "/src/apps/_shared/Restas.css";

const RestasPrimaria6 = () => {
  const problemAreaRef = useRef(null);
  const feedbackRef = useRef(null);

  let correctValues = { num1: 0, num2: 0, result: 0 };
  let hiddenPart = 'subtrahend'; // 'minuend' or 'subtrahend'
  let maxIntDigits = 0;
  let maxDecimalPlaces = 0;

  function generateNewProblem() {
    hiddenPart = Math.random() < 0.5 ? 'minuend' : 'subtrahend';

    const num1IntDigits = Math.floor(Math.random() * 2) + 3; // 3-4 int digits
    const num1DecimalPlaces = Math.floor(Math.random() * 3); // 0-2 dec places
    const num1TotalDigits = num1IntDigits + num1DecimalPlaces;
    const num1Factor = Math.pow(10, num1DecimalPlaces);
    const num1Min = Math.pow(10, num1TotalDigits - 1);
    const num1Max = Math.pow(10, num1TotalDigits);
    const num1Int = Math.floor(Math.random() * (num1Max - num1Min)) + num1Min;
    const num1 = num1Int / num1Factor;

    const num2DecimalPlaces = Math.floor(Math.random() * 3);
    let num2 = (Math.random() * num1 * 0.9).toFixed(num2DecimalPlaces);
    num2 = parseFloat(num2);

    const result = num1 - num2;

    correctValues = { num1, num2, result };

    const [n1IntStr, n1DecStr = ''] = num1.toString().split('.');
    const [n2IntStr, n2DecStr = ''] = num2.toString().split('.');
    const [resIntStr, resDecStr = ''] = result.toFixed(Math.max(n1DecStr.length, n2DecStr.length)).split('.');

    maxIntDigits = Math.max(n1IntStr.length, n2IntStr.length, resIntStr.length);
    maxDecimalPlaces = Math.max(n1DecStr.length, n2DecStr.length, resDecStr.length);
    const numDigits = maxIntDigits + maxDecimalPlaces;

    const formatNum = (numStr, intStr, decStr) => {
        return intStr.padStart(maxIntDigits, '0') + decStr.padEnd(maxDecimalPlaces, '0');
    }

    const n1Padded = formatNum(num1.toString(), n1IntStr, n1DecStr);
    const n2Padded = formatNum(num2.toString(), n2IntStr, n2DecStr);
    const resultPadded = formatNum(result.toFixed(maxDecimalPlaces), resIntStr, resDecStr);

    const area = problemAreaRef.current;
    const feedback = feedbackRef.current;
    area.innerHTML = "";
    feedback.textContent = "";
    feedback.className = "";

    const columnTemplate = "60px ";
    let gridColumns = `35px `;
    for (let i = 0; i < maxIntDigits; i++) gridColumns += columnTemplate;
    if (maxDecimalPlaces > 0) gridColumns += "35px ";
    for (let i = 0; i < maxDecimalPlaces; i++) gridColumns += columnTemplate;

    area.style.display = "inline-grid";
    area.style.justifyItems = "center";
    area.style.alignItems = "center";
    area.style.gridGap = "5px 0";
    area.style.gridTemplateRows = "60px 60px 12px 60px";
    area.style.gridTemplateColumns = gridColumns;

    const operator = document.createElement("div");
    operator.className = "operator";
    operator.textContent = "-";
    operator.style.gridRow = "2";
    operator.style.gridColumn = "1";
    area.appendChild(operator);

    let currentGridCol = 2;
    for (let i = 0; i < numDigits; i++) {
      if (i === maxIntDigits && maxDecimalPlaces > 0) {
        const comma = (row) => {
            const el = document.createElement("div");
            el.className = "digit-display";
            el.textContent = ",";
            el.style.gridRow = row;
            el.style.gridColumn = String(currentGridCol);
            return el;
        }
        area.appendChild(comma(1));
        area.appendChild(comma(2));
        area.appendChild(comma(4));
        currentGridCol++;
      }

      const digitCol = currentGridCol++;

      const createCell = (val, row, isInput) => {
        const el = document.createElement("div");
        el.style.gridRow = row;
        el.style.gridColumn = String(digitCol);
        if (isInput) {
            el.className = "box result-box"; // Re-use styles
            el.dataset.target = "true";
            el.dataset.index = i;
        } else {
            el.className = "digit-display";
            el.textContent = val;
        }
        return el;
      }

      area.appendChild(createCell(n1Padded[i], "1", hiddenPart === 'minuend'));
      area.appendChild(createCell(n2Padded[i], "2", hiddenPart === 'subtrahend'));
      area.appendChild(createCell(resultPadded[i], "4", false)); // Result is never hidden
    }

    const hr = document.createElement("hr");
    hr.className = "operation-line";
    hr.style.gridRow = "3";
    hr.style.gridColumn = `2 / ${currentGridCol}`;
    area.appendChild(hr);

    addDragDropListeners();
  }

  function addDragDropListeners() {
    const area = problemAreaRef.current;
    const targetBoxes = area.querySelectorAll("[data-target='true']");
    const tiles = area.parentElement?.querySelectorAll(".number-tile") || [];
    tiles.forEach(tile => tile.addEventListener("dragstart", e => e.dataTransfer.setData("text/plain", tile.textContent || "")));
    targetBoxes.forEach(box => {
      box.addEventListener("dragover", e => { e.preventDefault(); box.classList.add("drag-over"); });
      box.addEventListener("dragleave", () => box.classList.remove("drag-over"));
      box.addEventListener("drop", e => {
        e.preventDefault();
        box.classList.remove("drag-over");
        box.textContent = e.dataTransfer.getData("text/plain");
      });
    });
  }

  function checkAnswer() {
    const area = problemAreaRef.current;
    const resultBoxes = [...area.querySelectorAll(".result-box")].sort((a, b) => a.dataset.index - b.dataset.index);
    
    let userAnswerStr = resultBoxes.map(b => b.textContent?.trim() || "0").join("");
    if (maxDecimalPlaces > 0) {
        userAnswerStr = userAnswerStr.slice(0, maxIntDigits) + "." + userAnswerStr.slice(maxIntDigits);
    }
    
    const userAnswer = parseFloat(userAnswerStr);
    
    let isResultCorrect = false;
    let correctAnswer = 0;

    if (hiddenPart === 'minuend') {
        correctAnswer = correctValues.num1;
    } else { // subtrahend
        correctAnswer = correctValues.num2;
    }

    isResultCorrect = Math.abs(userAnswer - correctAnswer) < 0.001;

    const correctResultStr = correctAnswer.toFixed(maxDecimalPlaces).replace(".", "");
    const correctDigits = correctResultStr.padStart(maxIntDigits + maxDecimalPlaces, "0").split("");

    resultBoxes.forEach((box, i) => {
      box.classList.remove("correct", "incorrect");
      box.classList.add(box.textContent === correctDigits[i] ? "correct" : "incorrect");
    });

    const feedback = feedbackRef.current;
    if (isResultCorrect) {
      feedback.textContent = "¡Correcto! Has encontrado el número que faltaba. ✅";
      feedback.className = "feedback-correct";
    } else {
      feedback.textContent = "¡Ups! Ese no es el número correcto. Inténtalo de nuevo. ❌";
      feedback.className = "feedback-incorrect";
    }
  }

  useEffect(() => {
    generateNewProblem();
  }, []);

  return (
    <div id="app-container">
      <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
        <span role="img" aria-label="Resta">📝</span>{' '}
        <span className="gradient-text">Completa la resta</span>
      </h1>

      <div id="problem-area" ref={problemAreaRef}></div>
      <div id="feedback-message" ref={feedbackRef}></div>

      <div id="controls">
        <button id="check-button" onClick={checkAnswer}>Comprobar</button>
        <button id="new-problem-button" onClick={generateNewProblem}>Nuevo Problema</button>
      </div>

      <div id="number-palette">
        <h2>Arrastra los números 👇</h2>
        <div className="number-tiles-container">
          {[...Array(10).keys()].map(n => (
            <div key={n} className="number-tile" draggable="true" onDragStart={e => e.dataTransfer.setData("text/plain", n.toString())}>
              {n}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RestasPrimaria6;
