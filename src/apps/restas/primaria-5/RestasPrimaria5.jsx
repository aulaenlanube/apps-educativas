import React, { useEffect, useRef } from "react";
import "/src/apps/_shared/Restas.css";

const RestasPrimaria5 = () => {
  const problemAreaRef = useRef(null);
  const feedbackRef = useRef(null);
  const helpToggleRef = useRef(null);

  let originalOperands = { num1: 0, num2: 0 };
  let userBorrows = [];
  let maxIntDigits = 0;
  let maxDecimalPlaces = 0;

  function generateNewProblem() {
    const num1IntDigits = Math.floor(Math.random() * 2) + 2; // 1-2
    const num1DecimalPlaces = Math.floor(Math.random() * 2) + 2; // 1-2
    const num1TotalDigits = num1IntDigits + num1DecimalPlaces;

    const num1Factor = Math.pow(10, num1DecimalPlaces);
    const num1Min = Math.pow(10, num1TotalDigits - 1);
    const num1Max = Math.pow(10, num1TotalDigits);
    const num1Int = Math.floor(Math.random() * (num1Max - num1Min)) + num1Min;
    const num1 = num1Int / num1Factor;

    const num2DecimalPlaces = Math.floor(Math.random() * 2) + 1; // 1-2
    let num2 = (Math.random() * num1).toFixed(num2DecimalPlaces);
    if (parseFloat(num2) >= num1) {
        num2 = (num1 * 0.9).toFixed(num2DecimalPlaces);
    }
    num2 = parseFloat(num2);

    originalOperands = { num1, num2 };

    const [n1IntStr, n1DecStr = ''] = num1.toString().split('.');
    const [n2IntStr, n2DecStr = ''] = num2.toString().split('.');

    maxIntDigits = Math.max(n1IntStr.length, n2IntStr.length);
    maxDecimalPlaces = Math.max(n1DecStr.length, n2DecStr.length);
    const numDigits = maxIntDigits + maxDecimalPlaces;

    userBorrows = new Array(numDigits).fill(0);

    const n1Padded = n1IntStr.padStart(maxIntDigits, '0') + n1DecStr.padEnd(maxDecimalPlaces, '0');
    const n2Padded = n2IntStr.padStart(maxIntDigits, '0') + n2DecStr.padEnd(maxDecimalPlaces, '0');

    const area = problemAreaRef.current;
    const feedback = feedbackRef.current;
    area.innerHTML = "";
    feedback.textContent = "";
    feedback.className = "";

    const columnTemplate = "25px 60px ";
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

      const circleCol = currentGridCol++;
      const digitCol = currentGridCol++;

      if (i !== 0) {
        const borrowBox = document.createElement("div");
        borrowBox.className = "borrow-helper-box";
        borrowBox.dataset.target = "true";
        borrowBox.dataset.type = "borrow";
        borrowBox.dataset.index = String(i);
        borrowBox.style.gridRow = "1";
        borrowBox.style.gridColumn = String(circleCol);
        Object.assign(borrowBox.style, { width: "40px", height: "40px", borderRadius: "50%", border: "2px dashed #ccc", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "0.8em", color: "#005a9c", marginRight: "-15px", userSelect: "none" });
        borrowBox.addEventListener("dragover", (e) => { e.preventDefault(); borrowBox.classList.add("drag-over"); });
        borrowBox.addEventListener("dragleave", () => borrowBox.classList.remove("drag-over"));
        borrowBox.addEventListener("drop", (e) => {
          e.preventDefault();
          borrowBox.classList.remove("drag-over");
          const dropped = e.dataTransfer.getData("text/plain");
          const idx = parseInt(borrowBox.dataset.index || "0", 10);
          userBorrows[idx] = dropped === "1" ? 1 : 0;
          borrowBox.textContent = userBorrows[idx] ? "1" : "";
          updateSubtrahendDisplay();
        });
        area.appendChild(borrowBox);
      }

      const createDigit = (text, row, col) => {
        const el = document.createElement("div");
        el.textContent = text;
        el.style.gridRow = row;
        el.style.gridColumn = col;
        return el;
      }

      const topDigit = createDigit(n1Padded[i], "1", String(digitCol));
      topDigit.className = "digit-display";
      area.appendChild(topDigit);

      const bottomDigit = createDigit(n2Padded[i], "2", String(digitCol));
      bottomDigit.className = "digit-display subtrahend-digit";
      bottomDigit.dataset.index = String(i);
      area.appendChild(bottomDigit);

      const resultBox = createDigit("", "4", String(digitCol));
      resultBox.className = "box result-box";
      resultBox.dataset.target = "true";
      resultBox.dataset.index = i;
      area.appendChild(resultBox);
    }

    const hr = document.createElement("hr");
    hr.className = "operation-line";
    hr.style.gridRow = "3";
    hr.style.gridColumn = `2 / ${currentGridCol}`;
    area.appendChild(hr);

    toggleBorrowVisibility(helpToggleRef.current?.checked ?? true);
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
        const dropped = e.dataTransfer.getData("text/plain");
        if (box.dataset.type !== "borrow") box.textContent = dropped;
      });
    });
  }

  function updateSubtrahendDisplay() {
    if (!helpToggleRef.current?.checked) return;
    const area = problemAreaRef.current;
    const subEls = area.querySelectorAll(".subtrahend-digit");
    if (!subEls.length) return;

    const n2Padded = originalOperands.num2.toFixed(maxDecimalPlaces).replace('.', '').padStart(maxIntDigits + maxDecimalPlaces, '0');
    const originalDigits = n2Padded.split("").map(Number);

    subEls.forEach(el => {
      const i = parseInt(el.dataset.index, 10);
      const carryFromRight = i < originalDigits.length - 1 && userBorrows[i + 1] === 1 ? 1 : 0;
      const newVal = originalDigits[i] + carryFromRight;
      el.textContent = String(newVal);
      el.classList.toggle("modified-digit", newVal !== originalDigits[i]);
    });
  }

  function toggleBorrowVisibility(show) {
    const area = problemAreaRef.current;
    area.querySelectorAll(".borrow-helper-box").forEach(c => c.style.visibility = show ? "visible" : "hidden");
    if (show) {
        updateSubtrahendDisplay();
    } else {
      const subEls = area.querySelectorAll(".subtrahend-digit");
      const n2Padded = originalOperands.num2.toFixed(maxDecimalPlaces).replace('.', '').padStart(maxIntDigits + maxDecimalPlaces, '0');
      const originalDigits = n2Padded.split("");
      subEls.forEach(el => {
        const i = parseInt(el.dataset.index, 10);
        el.textContent = originalDigits[i];
        el.classList.remove("modified-digit");
      });
    }
  }

  function checkAnswer() {
    const area = problemAreaRef.current;
    const resultBoxes = [...area.querySelectorAll(".result-box")].sort((a, b) => a.dataset.index - b.dataset.index);
    const borrowBoxes = area.querySelectorAll(".borrow-helper-box");
    const helpEnabled = !!helpToggleRef.current?.checked;

    let userAnswerStr = resultBoxes.map(b => b.textContent?.trim() || "0").join("");
    if (maxDecimalPlaces > 0) {
        userAnswerStr = userAnswerStr.slice(0, maxIntDigits) + "." + userAnswerStr.slice(maxIntDigits);
    }
    
    const userAnswer = parseFloat(userAnswerStr);
    const correctAnswer = originalOperands.num1 - originalOperands.num2;
    
    const isResultCorrect = Math.abs(userAnswer - correctAnswer) < 0.001;

    const correctResultStr = correctAnswer.toFixed(maxDecimalPlaces).replace(".", "");
    const correctDigits = correctResultStr.padStart(maxIntDigits + maxDecimalPlaces, "0").split("");

    resultBoxes.forEach((box, i) => {
      box.classList.remove("correct", "incorrect");
      box.classList.add(box.textContent === correctDigits[i] ? "correct" : "incorrect");
    });

    let wrongBorrow = false;
    if (helpEnabled) {
      const n1Padded = originalOperands.num1.toFixed(maxDecimalPlaces).replace('.', '').padStart(maxIntDigits + maxDecimalPlaces, '0');
      const n2Padded = originalOperands.num2.toFixed(maxDecimalPlaces).replace('.', '').padStart(maxIntDigits + maxDecimalPlaces, '0');
      const minuendDigits = n1Padded.split("").map(Number);
      const subtrahendDigits = n2Padded.split("").map(Number);
      let carry = 0;

      borrowBoxes.forEach(b => b.classList.remove("correct", "incorrect"));

      for (let i = minuendDigits.length - 1; i >= 0; i--) {
        const top = minuendDigits[i];
        const bottom = subtrahendDigits[i] + carry;
        const neededBorrow = top < bottom;
        const userPlaced = userBorrows[i] === 1;
        const circle = area.querySelector(`.borrow-helper-box[data-index="${i}"]`);

        if (circle) {
            if (userPlaced) {
                if (neededBorrow) circle.classList.add("correct");
                else { circle.classList.add("incorrect"); wrongBorrow = true; }
            }
            if (!isResultCorrect && neededBorrow && !userPlaced) {
                circle.classList.add("incorrect");
                wrongBorrow = true;
            }
        }
        carry = neededBorrow ? 1 : 0;
      }
    }

    const feedback = feedbackRef.current;
    if (isResultCorrect) {
      if (!helpEnabled || !wrongBorrow) {
        feedback.textContent = "¡Perfecto! ¡Resta correcta! ✅";
        feedback.className = "feedback-correct";
        borrowBoxes.forEach(b => b.classList.remove("incorrect"));
      } else {
        feedback.textContent = "El resultado es correcto, pero alguna llevada es incorrecta.";
        feedback.className = "feedback-incorrect";
      }
    } else {
      feedback.textContent = "¡Ups! Revisa los números y las llevadas. ❌";
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
        <span className="gradient-text">Restas con Decimales</span>
      </h1>

      <div id="options-area">
        <label htmlFor="help-toggle">Ayuda con llevadas</label>
        <label className="switch">
          <input type="checkbox" id="help-toggle" defaultChecked ref={helpToggleRef} onChange={() => toggleBorrowVisibility(!!helpToggleRef.current?.checked)} />
          <span className="slider round"></span>
        </label>
      </div>

      <div id="problem-area" ref={problemAreaRef}></div>
      <div id="feedback-message" ref={feedbackRef}></div>

      <div id="controls">
        <button id="check-button" onClick={checkAnswer}>Comprobar</button>
        <button id="new-problem-button" onClick={generateNewProblem}>Nueva Resta</button>
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

export default RestasPrimaria5;
