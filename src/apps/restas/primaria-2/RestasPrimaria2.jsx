import React, { useEffect, useRef } from "react";
import "/src/apps/_shared/Restas.css"; // usa el CSS que ya tienes adaptado

const RestasPrimaria2 = () => {
  const problemAreaRef = useRef(null);
  const feedbackRef = useRef(null);
  const helpToggleRef = useRef(null);

  let originalOperands = { num1: 0, num2: 0 };
  let userBorrows = [];

  // --- GENERACIÓN DEL PROBLEMA ---
  function generateNewProblem() {
    const numDigits = Math.floor(Math.random() * 3) + 2; // 2, 3 o 4 cifras

    const min = Math.pow(10, numDigits - 1);
    const max = Math.pow(10, numDigits);
    const num1 = Math.floor(Math.random() * (max - min)) + min;
    const num2 = Math.floor(Math.random() * num1);

    originalOperands = { num1, num2 };
    const num1Str = num1.toString().padStart(numDigits, "0");
    const num2Str = num2.toString().padStart(numDigits, "0");

    userBorrows = new Array(numDigits).fill(0);

    const area = problemAreaRef.current;
    const feedback = feedbackRef.current;
    area.innerHTML = "";
    feedback.textContent = "";
    feedback.className = "";

    const columnTemplate = "25px 60px ";
    area.style.gridTemplateColumns = `35px ${columnTemplate.repeat(numDigits)}`;

    // Operador
    const operator = document.createElement("div");
    operator.className = "operator";
    operator.textContent = "-";
    operator.style.gridRow = "2";
    operator.style.gridColumn = "1";
    area.appendChild(operator);

    // Celdas por dígito
    for (let i = 0; i < numDigits; i++) {
      const circleGridCol = 2 + i * 2;
      const digitGridCol = 3 + i * 2;

      if (i !== 0) {
        const borrowBox = document.createElement("div");
        borrowBox.className = "borrow-helper-box";
        borrowBox.dataset.target = "true";
        borrowBox.dataset.type = "borrow";
        borrowBox.dataset.index = i;
        borrowBox.style.gridRow = "1";
        borrowBox.style.gridColumn = circleGridCol;
        area.appendChild(borrowBox);
      }

      const topNumber = document.createElement("div");
      topNumber.className = "digit-display";
      topNumber.textContent = num1Str[i];
      topNumber.style.gridRow = "1";
      topNumber.style.gridColumn = digitGridCol;
      area.appendChild(topNumber);

      const bottomNumber = document.createElement("div");
      bottomNumber.className = "digit-display subtrahend-digit";
      bottomNumber.textContent = num2Str[i];
      bottomNumber.style.gridRow = "2";
      bottomNumber.style.gridColumn = digitGridCol;
      bottomNumber.dataset.index = i;
      area.appendChild(bottomNumber);

      const resultBox = document.createElement("div");
      resultBox.className = "box result-box";
      resultBox.dataset.target = "true";
      resultBox.style.gridRow = "4";
      resultBox.style.gridColumn = digitGridCol;
      area.appendChild(resultBox);
    }

    const hr = document.createElement("hr");
    hr.className = "operation-line";
    hr.style.gridRow = "3";
    hr.style.gridColumn = `2 / ${2 + numDigits * 2}`;
    area.appendChild(hr);

    area.classList.toggle("borrows-hidden", !helpToggleRef.current.checked);

    addDragDropListeners();
  }

  // --- DRAG & DROP ---
  function addDragDropListeners() {
    const numberTiles = document.querySelectorAll(".number-tile");
    const targetBoxes = problemAreaRef.current.querySelectorAll("[data-target='true']");

    numberTiles.forEach((tile) => {
      tile.addEventListener("dragstart", (e) =>
        e.dataTransfer.setData("text/plain", tile.textContent)
      );
    });

    targetBoxes.forEach((box) => {
      box.addEventListener("dragover", (e) => {
        e.preventDefault();
        box.classList.add("drag-over");
      });
      box.addEventListener("dragleave", () => box.classList.remove("drag-over"));
      box.addEventListener("drop", (e) => {
        e.preventDefault();
        box.classList.remove("drag-over");
        const digit = e.dataTransfer.getData("text/plain");
        box.textContent = digit;

        if (box.dataset.type === "borrow") {
          const index = parseInt(box.dataset.index);
          userBorrows[index] = digit === "1" ? 1 : 0;
          updateSubtrahendDisplay();
        }
      });
    });
  }

  // --- ACTUALIZAR SUSTRAENDO ---
  function updateSubtrahendDisplay() {
    if (!helpToggleRef.current.checked) return;

    const subtrahendEls = problemAreaRef.current.querySelectorAll(".subtrahend-digit");
    const numDigits = subtrahendEls.length;
    const originalDigits = originalOperands.num2
      .toString()
      .padStart(numDigits, "0")
      .split("")
      .map(Number);

    subtrahendEls.forEach((el, i) => {
      let carryFromRight = i < numDigits - 1 && userBorrows[i + 1] === 1 ? 1 : 0;
      const newVal = originalDigits[i] + carryFromRight;
      el.textContent = newVal;
      el.classList.toggle("modified-digit", newVal !== originalDigits[i]);
    });
  }

  // --- COMPROBAR RESPUESTA ---
  function checkAnswer() {
    const resultBoxes = problemAreaRef.current.querySelectorAll(".result-box");
    const borrowBoxes = problemAreaRef.current.querySelectorAll(".borrow-helper-box");
    const numDigits = resultBoxes.length;
    const helpEnabled = helpToggleRef.current.checked;

    const userAnswerStr = Array.from(resultBoxes)
      .map((box) => box.textContent.trim() || "0")
      .join("");
    const userAnswerNum = parseInt(userAnswerStr, 10);
    const correctAnswer = originalOperands.num1 - originalOperands.num2;
    const isResultCorrect = userAnswerNum === correctAnswer;

    const correctDigits = correctAnswer.toString().padStart(numDigits, "0").split("");
    resultBoxes.forEach((box, i) => {
      box.classList.remove("correct", "incorrect");
      box.classList.add(
        box.textContent === correctDigits[i] ? "correct" : "incorrect"
      );
    });

    let hasWrongBorrow = false;
    if (helpEnabled) {
      const minuendDigits = originalOperands.num1
        .toString()
        .padStart(numDigits, "0")
        .split("")
        .map(Number);
      const subtrahendDigits = originalOperands.num2
        .toString()
        .padStart(numDigits, "0")
        .split("")
        .map(Number);
      let carry = 0;

      borrowBoxes.forEach((box) => box.classList.remove("correct", "incorrect"));

      for (let i = numDigits - 1; i >= 0; i--) {
        const top = minuendDigits[i];
        const bottom = subtrahendDigits[i] + carry;
        const neededBorrow = top < bottom;
        const userPlacedBorrow = userBorrows[i] === 1;

        const borrowBox = problemAreaRef.current.querySelector(
          `.borrow-helper-box[data-index="${i}"]`
        );

        if (userPlacedBorrow) {
          if (neededBorrow) borrowBox?.classList.add("correct");
          else {
            borrowBox?.classList.add("incorrect");
            hasWrongBorrow = true;
          }
        }
        if (!isResultCorrect && neededBorrow && !userPlacedBorrow) {
          borrowBox?.classList.add("incorrect");
          hasWrongBorrow = true;
        }

        carry = neededBorrow ? 1 : 0;
      }
    }

    if (isResultCorrect) {
      if (!helpEnabled || !hasWrongBorrow) {
        feedbackRef.current.textContent = "¡Perfecto! ¡Resta correcta! ✅";
        feedbackRef.current.className = "feedback-correct";
        borrowBoxes.forEach((box) => box.classList.remove("incorrect"));
      } else {
        feedbackRef.current.textContent =
          "El resultado es correcto, pero has puesto alguna llevada incorrecta.";
        feedbackRef.current.className = "feedback-incorrect";
      }
    } else {
      feedbackRef.current.textContent = "¡Ups! Revisa los números y las llevadas. ❌";
      feedbackRef.current.className = "feedback-incorrect";
    }
  }

  useEffect(() => {
    generateNewProblem();
  }, []);

  return (
    <div id="app-container">
      <h1>Resta como en el cole 📝</h1>

      <div id="options-area">
        <label htmlFor="help-toggle">Ayuda con llevadas</label>
        <label className="switch">
          <input
            type="checkbox"
            id="help-toggle"
            defaultChecked
            ref={helpToggleRef}
            onChange={() => {
              problemAreaRef.current.classList.toggle(
                "borrows-hidden",
                !helpToggleRef.current.checked
              );
              if (helpToggleRef.current.checked) updateSubtrahendDisplay();
              else {
                const subtrahendEls =
                  problemAreaRef.current.querySelectorAll(".subtrahend-digit");
                const originalDigits = originalOperands.num2
                  .toString()
                  .padStart(subtrahendEls.length, "0")
                  .split("");
                subtrahendEls.forEach((el, i) => {
                  el.textContent = originalDigits[i];
                  el.classList.remove("modified-digit");
                });
              }
            }}
          />
          <span className="slider round"></span>
        </label>
      </div>

      <div id="problem-area" ref={problemAreaRef}></div>

      <div id="feedback-message" ref={feedbackRef}></div>

      <div id="controls">
        <button id="check-button" onClick={checkAnswer}>
          Comprobar
        </button>
        <button id="new-problem-button" onClick={generateNewProblem}>
          Nueva Resta
        </button>
      </div>

      <div id="number-palette">
        <h2>Arrastra los números 👇</h2>
        <div className="number-tiles-container">
          {[...Array(10).keys()].map((n) => (
            <div
              key={n}
              className="number-tile"
              draggable="true"
              onDragStart={(e) =>
                e.dataTransfer.setData("text/plain", n.toString())
              }
            >
              {n}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RestasPrimaria2;
