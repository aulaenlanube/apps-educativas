import React, { useEffect, useRef } from "react";
import "/src/apps/_shared/Restas.css"; // usa el CSS que ya tienes adaptado

const RestasPrimaria2 = () => {
  const problemAreaRef = useRef(null);
  const feedbackRef = useRef(null);
  const helpToggleRef = useRef(null);

  // Estado interno no reactivo porque reconstruimos el DOM de la operación cada vez
  let originalOperands = { num1: 0, num2: 0 };
  let userBorrows = [];

  // Genera un problema 2-4 cifras, num1 > num2
  function generateNewProblem() {
    const numDigits = Math.floor(Math.random() * 2) + 2; // 2..3 cifras
    const min = Math.pow(10, numDigits - 1);
    const max = Math.pow(10, numDigits);
    const num1 = Math.floor(Math.random() * (max - min)) + min;
    const num2 = Math.floor(Math.random() * num1);

    originalOperands = { num1, num2 };
    userBorrows = new Array(numDigits).fill(0);

    const n1 = num1.toString().padStart(numDigits, "0");
    const n2 = num2.toString().padStart(numDigits, "0");

    const area = problemAreaRef.current;
    const feedback = feedbackRef.current;
    area.innerHTML = "";
    feedback.textContent = "";
    feedback.className = "";

    // Define rejilla: 1 columna operador + (círculo 25px, dígito 60px) × dígitos
    const columnTemplate = "25px 60px ";
    area.style.display = "inline-grid";
    area.style.justifyItems = "center";
    area.style.alignItems = "center";
    area.style.gridGap = "5px 0";
    area.style.gridTemplateRows = "60px 60px 12px 60px";
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
      const circleCol = 2 + i * 2;
      const digitCol = 3 + i * 2;

      // Círculo de llevada solo si no es la columna más a la izquierda
      if (i !== 0) {
        const borrowBox = document.createElement("div");
        borrowBox.className = "borrow-helper-box";
        borrowBox.dataset.target = "true";
        borrowBox.dataset.type = "borrow";
        borrowBox.dataset.index = String(i);
        borrowBox.style.gridRow = "1";
        borrowBox.style.gridColumn = String(circleCol);

        // Estilos inline para garantizar visibilidad aunque el CSS no tenga la clase
        Object.assign(borrowBox.style, {
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          border: "2px dashed #ccc",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "0.8em",
          color: "#005a9c",
          marginRight: "-15px",
          userSelect: "none",
        });

        // Soporta DnD sobre el círculo de llevada
        borrowBox.addEventListener("dragover", (e) => {
          e.preventDefault();
          borrowBox.classList.add("drag-over");
        });
        borrowBox.addEventListener("dragleave", () => borrowBox.classList.remove("drag-over"));
        borrowBox.addEventListener("drop", (e) => {
          e.preventDefault();
          borrowBox.classList.remove("drag-over");
          const dropped = e.dataTransfer.getData("text/plain");
          const idx = parseInt(borrowBox.dataset.index || "0", 10);
          userBorrows[idx] = dropped === "1" ? 1 : 0;
          borrowBox.textContent = userBorrows[idx] ? "1" : ""; // Muestra 1 si hay llevada
          updateSubtrahendDisplay();
        });

        area.appendChild(borrowBox);
      }

      // Dígito superior (minuendo)
      const topDigit = document.createElement("div");
      topDigit.className = "digit-display";
      topDigit.textContent = n1[i];
      topDigit.style.gridRow = "1";
      topDigit.style.gridColumn = String(digitCol);
      area.appendChild(topDigit);

      // Dígito inferior (sustraendo, se actualiza si hay llevada a la derecha)
      const bottomDigit = document.createElement("div");
      bottomDigit.className = "digit-display subtrahend-digit";
      bottomDigit.dataset.index = String(i);
      bottomDigit.textContent = n2[i];
      bottomDigit.style.gridRow = "2";
      bottomDigit.style.gridColumn = String(digitCol);
      area.appendChild(bottomDigit);

      // Casilla de resultado
      const resultBox = document.createElement("div");
      resultBox.className = "box result-box";
      resultBox.dataset.target = "true";
      resultBox.style.gridRow = "4";
      resultBox.style.gridColumn = String(digitCol);
      area.appendChild(resultBox);
    }

    // Línea de operación
    const hr = document.createElement("hr");
    hr.className = "operation-line";
    hr.style.gridRow = "3";
    hr.style.gridColumn = `2 / ${2 + numDigits * 2}`;
    area.appendChild(hr);

    // Visibilidad de llevadas según el toggle
    toggleBorrowVisibility(helpToggleRef.current?.checked ?? true);

    // Activa DnD para los números y para las casillas de resultado
    addDragDropListeners();
  }

  // Activa DnD en casillas de resultado y en paleta de números
  function addDragDropListeners() {
    const area = problemAreaRef.current;
    const targetBoxes = area.querySelectorAll("[data-target='true']");
    const tiles = area.parentElement?.querySelectorAll(".number-tile") || [];

    tiles.forEach((tile) => {
      tile.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", tile.textContent || "");
      });
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
        const dropped = e.dataTransfer.getData("text/plain");

        // Si es círculo de llevada, ya lo tratamos en su listener inline
        if (box.dataset.type === "borrow") return;

        // Resultado: escribe el dígito
        box.textContent = dropped;
      });
    });
  }

  // Actualiza visualmente el sustraendo cuando hay llevadas a la derecha
  function updateSubtrahendDisplay() {
    if (!helpToggleRef.current?.checked) return;

    const area = problemAreaRef.current;
    const subEls = area.querySelectorAll(".subtrahend-digit");
    const numDigits = subEls.length;
    if (!numDigits) return;

    const originalDigits = originalOperands.num2
      .toString()
      .padStart(numDigits, "0")
      .split("")
      .map(Number);

    subEls.forEach((el, i) => {
      const carryFromRight = i < numDigits - 1 && userBorrows[i + 1] === 1 ? 1 : 0;
      const newVal = originalDigits[i] + carryFromRight;
      el.textContent = String(newVal);
      el.classList.remove("modified-digit");
      if (newVal !== originalDigits[i]) el.classList.add("modified-digit");
    });
  }

  // Muestra u oculta los círculos de llevadas de forma robusta
  function toggleBorrowVisibility(show) {
    const area = problemAreaRef.current;
    const circles = area.querySelectorAll(".borrow-helper-box");
    circles.forEach((c) => {
      c.style.visibility = show ? "visible" : "hidden";
    });
    // Si se muestran, recalcular subtrahendo visual
    if (show) updateSubtrahendDisplay();
    else {
      // Restaurar dígitos originales
      const subEls = area.querySelectorAll(".subtrahend-digit");
      const numDigits = subEls.length;
      const originalDigits = originalOperands.num2
        .toString()
        .padStart(numDigits, "0")
        .split("");
      subEls.forEach((el, i) => {
        el.textContent = originalDigits[i];
        el.classList.remove("modified-digit");
      });
    }
  }

  // Comprueba el resultado y la corrección de las llevadas si la ayuda está activa
  function checkAnswer() {
    const area = problemAreaRef.current;
    const resultBoxes = area.querySelectorAll(".result-box");
    const borrowBoxes = area.querySelectorAll(".borrow-helper-box");
    const numDigits = resultBoxes.length;
    const helpEnabled = !!helpToggleRef.current?.checked;

    const userAnswerStr = Array.from(resultBoxes)
      .map((b) => (b.textContent?.trim() || "0"))
      .join("");
    const userAnswer = parseInt(userAnswerStr, 10);
    const correctAnswer = originalOperands.num1 - originalOperands.num2;
    const isResultCorrect = userAnswer === correctAnswer;

    // Colorea casillas de resultado
    const correctDigits = correctAnswer.toString().padStart(numDigits, "0").split("");
    resultBoxes.forEach((box, i) => {
      box.classList.remove("correct", "incorrect");
      box.classList.add(box.textContent === correctDigits[i] ? "correct" : "incorrect");
    });

    // Validación de llevadas si la ayuda está activa
    let wrongBorrow = false;
    if (helpEnabled) {
      const minuendDigits = originalOperands.num1.toString().padStart(numDigits, "0").split("").map(Number);
      const subtrahendDigits = originalOperands.num2.toString().padStart(numDigits, "0").split("").map(Number);
      let carry = 0;

      borrowBoxes.forEach((b) => b.classList.remove("correct", "incorrect"));

      for (let i = numDigits - 1; i >= 0; i--) {
        const top = minuendDigits[i];
        const bottom = subtrahendDigits[i] + carry;
        const neededBorrow = top < bottom;
        const userPlaced = userBorrows[i] === 1;
        const circle = area.querySelector(`.borrow-helper-box[data-index="${i}"]`);

        if (userPlaced) {
          if (neededBorrow) circle && circle.classList.add("correct");
          else {
            circle && circle.classList.add("incorrect");
            wrongBorrow = true;
          }
        }
        if (!isResultCorrect && neededBorrow && !userPlaced) {
          circle && circle.classList.add("incorrect");
          wrongBorrow = true;
        }

        carry = neededBorrow ? 1 : 0;
      }
    }

    // Mensaje de feedback
    if (isResultCorrect) {
      if (!helpEnabled || !wrongBorrow) {
        feedbackRef.current.textContent = "¡Perfecto! ¡Resta correcta! ✅";
        feedbackRef.current.className = "feedback-correct";
        borrowBoxes.forEach((b) => b.classList.remove("incorrect"));
      } else {
        feedbackRef.current.textContent = "El resultado es correcto, pero has puesto alguna llevada incorrecta";
        feedbackRef.current.className = "feedback-incorrect";
      }
    } else {
      feedbackRef.current.textContent = "¡Ups! Revisa los números y las llevadas ❌";
      feedbackRef.current.className = "feedback-incorrect";
    }
  }

  useEffect(() => {
    generateNewProblem();
  }, []);

  return (
    <div id="app-container">
      <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
        <span role="img" aria-label="Resta">📝</span>{' '}
        <span className="gradient-text">Resta como en el cole</span>
      </h1>

      <div id="options-area">
        <label htmlFor="help-toggle">Ayuda con llevadas</label>
        <label className="switch">
          <input
            type="checkbox"
            id="help-toggle"
            defaultChecked
            ref={helpToggleRef}
            onChange={() => toggleBorrowVisibility(!!helpToggleRef.current?.checked)}
          />
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
          {[...Array(10).keys()].map((n) => (
            <div
              key={n}
              className="number-tile"
              draggable="true"
              onDragStart={(e) => e.dataTransfer.setData("text/plain", n.toString())}
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
