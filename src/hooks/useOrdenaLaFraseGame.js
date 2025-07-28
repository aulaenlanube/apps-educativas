import { useState, useEffect, useCallback, useRef } from 'react';

const TOTAL_TEST_QUESTIONS = 5;

export const useOrdenaLaFraseGame = (frases, withTimer = false) => {
    const [mision, setMision] = useState({ texto: '', solucion: '' });
    const [palabrasOrigen, setPalabrasOrigen] = useState([]);
    const [palabrasDestino, setPalabrasDestino] = useState([]);
    const [feedback, setFeedback] = useState({ texto: '', clase: '' });
    const draggedItem = useRef(null);
    const [isTestMode, setIsTestMode] = useState(false);
    const [testQuestions, setTestQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState([]);
    const [startTime, setStartTime] = useState(0);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [score, setScore] = useState(0);
    const [showResults, setShowResults] = useState(false);

    const cargarSiguienteFrase = useCallback(() => {
        setFeedback({ texto: '', clase: '' });
        let nuevaFrase;
        do {
            nuevaFrase = frases[Math.floor(Math.random() * frases.length)];
        } while (nuevaFrase === mision.solucion && frases.length > 1);
        
        const palabras = nuevaFrase.split(' ').sort(() => Math.random() - 0.5);
        setMision({ texto: `Forma la frase:`, solucion: nuevaFrase });
        setPalabrasOrigen(palabras.map((p, i) => ({ id: `p-${Date.now()}-${i}`, texto: p })));
        setPalabrasDestino([]);
    }, [frases, mision.solucion]);

    useEffect(() => {
        if (!isTestMode) {
            startPracticeMission();
        }
    }, [isTestMode]);
    
    const startPracticeMission = () => {
        setFeedback({ texto: '', clase: '' });
        cargarSiguienteFrase();
    };

    const startTest = () => {
        const selectedFrases = new Set();
        while (selectedFrases.size < TOTAL_TEST_QUESTIONS && selectedFrases.size < frases.length) {
            const frase = frases[Math.floor(Math.random() * frases.length)];
            selectedFrases.add(frase);
        }
        const questions = Array.from(selectedFrases).map(frase => ({
            texto: 'Forma la frase:',
            solucion: frase
        }));

        setTestQuestions(questions);
        setCurrentQuestionIndex(0);
        setUserAnswers([]);
        const { solucion } = questions[0];
        const palabras = solucion.split(' ').sort(() => Math.random() - 0.5);
        setMision(questions[0]);
        setPalabrasOrigen(palabras.map((p, i) => ({ id: `p-${Date.now()}-${i}`, texto: p })));
        setPalabrasDestino([]);
        setFeedback({ texto: '', clase: '' });
        setShowResults(false);
        setScore(0);
        setIsTestMode(true);
        if (withTimer) {
            setStartTime(Date.now());
            setElapsedTime(0);
        }
    };
    
    useEffect(() => {
        let timer;
        if (isTestMode && withTimer && !showResults) {
            timer = setInterval(() => {
                setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isTestMode, withTimer, showResults, startTime]);

    const calculateScore = (correctCount, time) => {
        let baseScore = correctCount * 200;
        if (withTimer && correctCount > 0) {
            const timeBonus = Math.max(0, 100 - (time * 2));
            baseScore += timeBonus;
        }
        return Math.floor(baseScore);
    };

    const handleNextQuestion = () => {
        const fraseUsuario = palabrasDestino.map(p => p.texto).join(' ');
        const newAnswers = [...userAnswers, fraseUsuario];
        setUserAnswers(newAnswers);

        if (currentQuestionIndex < TOTAL_TEST_QUESTIONS - 1) {
            const nextIndex = currentQuestionIndex + 1;
            setCurrentQuestionIndex(nextIndex);
            const { solucion } = testQuestions[nextIndex];
            const palabras = solucion.split(' ').sort(() => Math.random() - 0.5);
            setMision(testQuestions[nextIndex]);
            setPalabrasOrigen(palabras.map((p, i) => ({ id: `p-${Date.now()}-${i}`, texto: p })));
            setPalabrasDestino([]);
        } else {
            const finalTime = withTimer ? Math.floor((Date.now() - startTime) / 1000) : 0;
            setElapsedTime(finalTime);
            
            let correctCount = 0;
            testQuestions.forEach((q, index) => {
                if (newAnswers[index] === q.solucion) {
                    correctCount++;
                }
            });

            setScore(calculateScore(correctCount, finalTime));
            setShowResults(true);
        }
    };
    
    const exitTestMode = () => {
        setIsTestMode(false);
    };

    const checkPracticeAnswer = () => {
        const fraseUsuario = palabrasDestino.map(p => p.texto).join(' ');
        if (fraseUsuario === mision.solucion) {
            setFeedback({ texto: "¡Correcto! ¡Muy bien!", clase: 'correcta' });
        } else {
            setFeedback({ texto: "Casi... Revisa el orden de las palabras.", clase: 'incorrecta' });
        }
    };

    const handleDragStart = (e, palabra) => {
        draggedItem.current = palabra;
        e.target.classList.add('dragging');
    };

    const handleDragEnd = (e) => {
        if (e.target.classList) {
            e.target.classList.remove('dragging');
        }
        draggedItem.current = null;
    };
    
    const handleDrop = (e, targetZone) => {
        e.preventDefault();
        if (!draggedItem.current) return;
    
        const draggedWord = draggedItem.current;
        let fromZone = palabrasOrigen.some(p => p.id === draggedWord.id) ? 'origen' : 'destino';
    
        // Si se suelta en la misma zona, solo reordenamos
        if (targetZone === fromZone) {
            if (targetZone === 'destino') {
                let newDestino = palabrasDestino.filter(p => p.id !== draggedWord.id);
                const afterElement = getDragAfterElement(e.currentTarget, e.clientX);
                if (afterElement == null) {
                    newDestino.push(draggedWord);
                } else {
                    const insertIndex = newDestino.findIndex(p => p.id === afterElement.id);
                    newDestino.splice(insertIndex, 0, draggedWord);
                }
                setPalabrasDestino(newDestino);
            }
            // No es necesario reordenar en la zona de origen
            return;
        }
    
        // Si se mueve entre zonas
        let newOrigen = [...palabrasOrigen];
        let newDestino = [...palabrasDestino];
    
        if (targetZone === 'origen') {
            newDestino = newDestino.filter(p => p.id !== draggedWord.id);
            newOrigen.push(draggedWord);
            newOrigen.sort((a,b) => parseInt(a.id.split('-')[2]) - parseInt(b.id.split('-')[2]));
        } else { // targetZone === 'destino'
            newOrigen = newOrigen.filter(p => p.id !== draggedWord.id);
            const afterElement = getDragAfterElement(e.currentTarget, e.clientX);
            if (afterElement == null) {
                newDestino.push(draggedWord);
            } else {
                const insertIndex = newDestino.findIndex(p => p.id === afterElement.id);
                newDestino.splice(insertIndex, 0, draggedWord);
            }
        }
        setPalabrasOrigen(newOrigen);
        setPalabrasDestino(newDestino);
    };
    
    function getDragAfterElement(container, x) {
        const draggableElements = [...container.querySelectorAll('.palabra:not(.dragging)')];
    
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = x - box.left - box.width / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    const handleDragOver = (e) => e.preventDefault();

    return {
        isTestMode, startTest, exitTestMode,
        mision, palabrasOrigen, palabrasDestino, feedback,
        checkPracticeAnswer, startPracticeMission,
        handleDragStart, handleDragEnd, handleDragOver, handleDrop,
        currentQuestionIndex, TOTAL_TEST_QUESTIONS, elapsedTime,
        showResults, score, testQuestions, userAnswers,
        handleNextQuestion
    };
};