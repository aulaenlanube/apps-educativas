import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useConfetti } from "/src/apps/_shared/ConfettiProvider";
import '/src/apps/_shared/Sumas.css';


const SumasPrimaria1 = () => {

    const { fire } = useConfetti();

    // Refs para acceder a los elementos del DOM directamente, como en el script original
    const problemAreaRef = useRef(null);
    const feedbackMessageRef = useRef(null);
    
    // Estado para guardar los números del problema actual
    const [currentOperands, setCurrentOperands] = useState({ num1: 0, num2: 0 });

    // --- GENERACIÓN DEL PROBLEMA (Adaptado para 1º de Primaria) ---
    const generateNewProblem = useCallback(() => {
        let num1, num2;

        // Generamos números hasta que la suma de sus dígitos no produzca llevadas
        do {
            num1 = Math.floor(Math.random() * 90) + 10; // Números de 10 a 99
            num2 = Math.floor(Math.random() * 90) + 10;
        } while (
            (num1 % 10) + (num2 % 10) >= 10 || // Comprueba la columna de las unidades
            (Math.floor(num1 / 10) + Math.floor(num2 / 10)) >= 10 // Comprueba la columna de las decenas
        );

        setCurrentOperands({ num1, num2 });

        const problemArea = problemAreaRef.current;
        const feedbackMessage = feedbackMessageRef.current;

        if (!problemArea || !feedbackMessage) return;

        const num1Str = num1.toString();
        const num2Str = num2.toString();
        
        // Limpiamos el área antes de generar un nuevo problema
        problemArea.innerHTML = '';
        feedbackMessage.textContent = '';
        feedbackMessage.className = '';

        // Creamos la estructura del problema dinámicamente, como en el script original
        const operator = document.createElement('div');
        operator.className = 'operator';
        operator.textContent = '+';
        problemArea.appendChild(operator);

        // Columnas para los dígitos
        for (let i = 0; i < 2; i++) { // Siempre 2 columnas para 2 cifras
            const column = document.createElement('div');
            column.className = 'column';

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
        
        const spacer = document.createElement('div');
        spacer.className = 'operator-spacer';
        problemArea.appendChild(spacer);

        // Añadimos los listeners de drag & drop a las nuevas casillas
        addDragDropListeners();
    }, []); // El array vacío asegura que la función no se recree innecesariamente

    // --- LÓGICA DE DRAG & DROP ---
    const addDragDropListeners = () => {
        const targetBoxes = problemAreaRef.current.querySelectorAll('[data-target="true"]');
        const numberTiles = document.querySelectorAll('.number-tile'); // Seleccionamos desde el documento
        
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

    // --- COMPROBACIÓN DE LA RESPUESTA ---
    const checkAnswer = () => {
        const resultBoxes = problemAreaRef.current.querySelectorAll('.result-box');
        const feedbackMessage = feedbackMessageRef.current;
        
        const solution = currentOperands.num1 + currentOperands.num2;
        const solutionDigits = solution.toString().padStart(2, '0').split('');
        
        let userAnswerStr = Array.from(resultBoxes).map(box => box.textContent.trim() || '0').join('');
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
        
        if (allCorrect) {
            feedbackMessage.textContent = '¡Excelente! ¡Suma correcta! 🎉';
            feedbackMessage.className = 'feedback-correct';
            fire("success"); // Dispara confeti
        } else {
            feedbackMessage.textContent = 'Casi... ¡Revisa las casillas en rojo!';
            feedbackMessage.className = 'feedback-incorrect';
        }
    };

    // useEffect se ejecuta una vez cuando el componente se monta (como DOMContentLoaded)
    useEffect(() => {
        generateNewProblem();
    }, [generateNewProblem]);

    // --- RENDERIZADO DEL COMPONENTE (JSX) ---
    return (
        <div id="app-container">
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
    <span role="img" aria-label="Suma">📝</span> <span className="gradient-text">Suma como en el cole</span>
</h1>

            {/* El área del problema se llenará dinámicamente con el ref */}
            <div id="problem-area" ref={problemAreaRef}></div>
            
            {/* El mensaje de feedback se actualizará con el ref */}
            <div id="feedback-message" ref={feedbackMessageRef}></div>

            <div id="controls">
                <button id="check-button" onClick={checkAnswer}>Comprobar</button>
                <button id="new-problem-button" onClick={generateNewProblem}>Nueva Suma</button>
            </div>

            <div id="number-palette">
                <h2>Arrastra los números 👇</h2>
                <div className="number-tiles-container">
                    {/* Generamos los números para arrastrar */}
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

export default SumasPrimaria1;