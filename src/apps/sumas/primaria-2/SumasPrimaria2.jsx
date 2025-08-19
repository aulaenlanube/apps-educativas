import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useConfetti } from "/src/apps/_shared/ConfettiProvider";
import '/src/apps/_shared/Sumas.css';

const SumasPrimaria2 = () => {
    const problemAreaRef = useRef(null);
    const feedbackMessageRef = useRef(null);
    const { confeti } = useConfetti();
    
    const [currentOperands, setCurrentOperands] = useState({ num1: 0, num2: 0 });
    const [showCarries, setShowCarries] = useState(true);

    // --- GENERACIÓN DEL PROBLEMA (2 cifras, con posibles llevadas) ---
    const generateNewProblem = useCallback(() => {
        // Generamos dos números aleatorios de 2 cifras
        const num1 = Math.floor(Math.random() * 90) + 10; // 10-99
        const num2 = Math.floor(Math.random() * 90) + 10; // 10-99

        setCurrentOperands({ num1, num2 });

        const problemArea = problemAreaRef.current;
        const feedbackMessage = feedbackMessageRef.current;
        if (!problemArea || !feedbackMessage) return;

        // El número total de columnas es 3 (2 para los dígitos, 1 para la llevada final)
        const totalColumns = 3; 
        const num1Str = num1.toString().padStart(totalColumns, ' ');
        const num2Str = num2.toString().padStart(totalColumns, ' ');
        
        problemArea.innerHTML = '';
        feedbackMessage.textContent = '';
        feedbackMessage.className = '';

        const operator = document.createElement('div');
        operator.className = 'operator';
        operator.textContent = '+';
        problemArea.appendChild(operator);

        for (let i = 0; i < totalColumns; i++) {
            const column = document.createElement('div');
            column.className = 'column';

            const carry = document.createElement('div');
            // La última columna de la izquierda no tiene caja de llevada encima
            if (i < totalColumns - 1) { 
                carry.className = 'box carry-box';
                carry.dataset.target = 'true';
            } else {
                carry.className = 'carry-placeholder';
            }
            column.appendChild(carry);

            column.innerHTML += `
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
        
        const spacer = document.createElement('div');
        spacer.className = 'operator-spacer';
        problemArea.appendChild(spacer);
        
        // Aplica el estado del toggle de ayuda
        problemArea.classList.toggle('carries-hidden', !showCarries);

        addDragDropListeners();
    }, [showCarries]); // Se regenera si cambia la visibilidad de las llevadas

    // --- LÓGICA DE DRAG & DROP (sin cambios) ---
    const addDragDropListeners = () => {
        const targetBoxes = problemAreaRef.current.querySelectorAll('[data-target="true"]');
        const numberTiles = document.querySelectorAll('.number-tile');
        
        numberTiles.forEach(tile => {
            tile.addEventListener('dragstart', e => e.dataTransfer.setData('text/plain', tile.textContent));
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

    // --- COMPROBACIÓN DE RESPUESTA (Lógica original con llevadas) ---
    const checkAnswer = () => {
        const resultBoxes = problemAreaRef.current.querySelectorAll('.result-box');
        const carryBoxes = problemAreaRef.current.querySelectorAll('.carry-box');
        const feedbackMessage = feedbackMessageRef.current;
        
        const solution = currentOperands.num1 + currentOperands.num2;
        const solutionDigits = solution.toString().padStart(resultBoxes.length, '0').split('');
        
        let userAnswerStr = Array.from(resultBoxes).map(box => box.textContent.trim()).join('');
        const userAnswerNum = parseInt(userAnswerStr) || 0;
        const isResultCorrect = (userAnswerNum === solution);

        // Colorear casillas del resultado
        resultBoxes.forEach((box, i) => {
            box.classList.remove('correct', 'incorrect');
            if (box.textContent === solutionDigits[i]) {
                box.classList.add('correct');
            } else {
                box.classList.add('incorrect');
            }
        });
        
        // Comprobar las llevadas
        let hasWrittenIncorrectCarry = false;
        if (showCarries) {
            let carry = 0;
            const num1Padded = currentOperands.num1.toString().padStart(resultBoxes.length, '0');
            const num2Padded = currentOperands.num2.toString().padStart(resultBoxes.length, '0');

            carryBoxes.forEach(box => box.classList.remove('correct', 'incorrect'));

            for (let i = resultBoxes.length - 1; i >= 1; i--) {
                const num1Digit = parseInt(num1Padded[i]);
                const num2Digit = parseInt(num2Padded[i]);
                
                const correctCarry = Math.floor((num1Digit + num2Digit + carry) / 10);
                const userCarryText = carryBoxes[i - 1].textContent;

                if (userCarryText !== '') {
                    const userCarryNum = parseInt(userCarryText);
                    if (userCarryNum === correctCarry) {
                        carryBoxes[i - 1].classList.add('correct');
                    } else {
                        carryBoxes[i - 1].classList.add('incorrect');
                        hasWrittenIncorrectCarry = true;
                    }
                }
                
                if (!isResultCorrect && correctCarry > 0 && userCarryText === '') {
                     carryBoxes[i - 1].classList.add('incorrect');
                     hasWrittenIncorrectCarry = true;
                }
                carry = correctCarry;
            }
        }

        // Feedback final
        if (isResultCorrect) {
            if (!showCarries || !hasWrittenIncorrectCarry) {
                feedbackMessage.textContent = '¡Excelente! ¡Suma correcta! 🎉';
                feedbackMessage.className = 'feedback-correct';
                //confeti();
                carryBoxes.forEach(box => box.classList.remove('incorrect'));
            } else {
                feedbackMessage.textContent = 'El resultado es correcto, ¡pero revisa las llevadas!';
                feedbackMessage.className = 'feedback-incorrect';
            }
        } else {
            feedbackMessage.textContent = 'Casi... ¡Revisa las casillas en rojo!';
            feedbackMessage.className = 'feedback-incorrect';
        }
    };

    const handleToggleCarries = () => {
        setShowCarries(prev => !prev);
    };
    
    useEffect(() => {
        generateNewProblem();
    }, [generateNewProblem]);

    return (
        <div id="app-container">
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
    <span role="img" aria-label="Suma">📝</span> <span className="gradient-text">Suma como en el cole</span>
</h1>

            <div id="options-area">
                <label htmlFor="help-toggle">Ayuda con llevadas</label>
                <label className="switch">
                    <input type="checkbox" id="help-toggle" checked={showCarries} onChange={handleToggleCarries} />
                    <span className="slider round"></span>
                </label>
            </div>
            
            <div id="problem-area" ref={problemAreaRef}></div>
            
            <div id="feedback-message" ref={feedbackMessageRef}></div>

            <div id="controls">
                <button id="check-button" onClick={checkAnswer}>Comprobar</button>
                <button id="new-problem-button" onClick={generateNewProblem}>Nueva Suma</button>
            </div>

            <div id="number-palette">
                <h2>Arrastra los números 👇</h2>
                <div className="number-tiles-container">
                    {[...Array(10).keys()].map(number => (
                        <div key={number} className="number-tile" draggable="true" onDragStart={(e) => e.dataTransfer.setData('text/plain', number)}>
                            {number}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SumasPrimaria2;