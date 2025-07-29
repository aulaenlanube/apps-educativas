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
    const dropZoneRef = useRef(null);
    const originZoneRef = useRef(null);
    const draggedCloneRef = useRef(null);


    const cargarSiguienteFrase = useCallback(() => {
        setFeedback({ texto: '', clase: '' });
        setMision(prevMision => {
            let nuevaFrase;
            do {
                nuevaFrase = frases[Math.floor(Math.random() * frases.length)];
            } while (nuevaFrase === prevMision.solucion && frases.length > 1);

            const palabras = nuevaFrase.split(' ').sort(() => Math.random() - 0.5);
            setPalabrasOrigen(palabras.map((p, i) => ({ id: `p-${Date.now()}-${i}`, texto: p })));
            setPalabrasDestino([]);
            
            return { texto: `Forma la frase:`, solucion: nuevaFrase };
        });
    }, [frases]);

    const startPracticeMission = useCallback(() => {
        cargarSiguienteFrase();
    }, [cargarSiguienteFrase]);
    
    useEffect(() => {
        if (!isTestMode) {
            startPracticeMission();
        }
    }, [isTestMode, startPracticeMission]);


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

    const getDragAfterElement = (container, x) => {
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
    };

    const handleDragStart = (e, palabra) => {
        draggedItem.current = palabra;
        e.target.classList.add('dragging');
    };

    const handleDragEnd = () => {
        // --- CAMBIO AQUÍ: Limpia cualquier palabra que se haya quedado "pillada" ---
        document.querySelectorAll('.palabra.dragging').forEach(el => el.classList.remove('dragging'));
        draggedItem.current = null;
    };

    const handleDrop = (e, targetZoneId) => {
        e.preventDefault();
        if (!draggedItem.current) return;
        
        const palabraArrastrada = draggedItem.current;
        let nuevasPalabrasOrigen = palabrasOrigen.filter(p => p.id !== palabraArrastrada.id);
        let nuevasPalabrasDestino = palabrasDestino.filter(p => p.id !== palabraArrastrada.id);

        if (targetZoneId === 'origen') {
            nuevasPalabrasOrigen.push(palabraArrastrada);
            nuevasPalabrasOrigen.sort((a, b) => parseInt(a.id.split('-')[2]) - parseInt(b.id.split('-')[2]));
        } else {
            const afterElement = getDragAfterElement(e.currentTarget, e.clientX);
            if (afterElement == null) {
                nuevasPalabrasDestino.push(palabraArrastrada);
            } else {
                const index = nuevasPalabrasDestino.findIndex(p => p.id === afterElement.dataset.id);
                nuevasPalabrasDestino.splice(index, 0, palabraArrastrada);
            }
        }
        
        setPalabrasOrigen(nuevasPalabrasOrigen);
        setPalabrasDestino(nuevasPalabrasDestino);
    };

    const handleDragOver = (e) => e.preventDefault();
    
    const handleTouchStart = (e, palabra) => {
        draggedItem.current = palabra;
        const touchElement = e.currentTarget;
        const rect = touchElement.getBoundingClientRect();

        const clone = touchElement.cloneNode(true);
        clone.classList.add('palabra-clone');
        clone.style.width = `${rect.width}px`;
        clone.style.height = `${rect.height}px`;
        clone.style.top = `${rect.top}px`;
        clone.style.left = `${rect.left}px`;
        document.body.appendChild(clone);
        draggedCloneRef.current = clone;

        touchElement.classList.add('dragging');
        document.body.classList.add('no-scroll');
    };

    const handleTouchMove = (e) => {
        if (!draggedCloneRef.current) return;              
        
        const touch = e.touches[0];
        const clone = draggedCloneRef.current;
        // Centramos el clon en el dedo
        clone.style.transform = `translate(${touch.clientX - parseFloat(clone.style.left) - clone.offsetWidth / 2}px, ${touch.clientY - parseFloat(clone.style.top) - clone.offsetHeight / 2}px)`;
    };

    const handleTouchEnd = (e) => {
        if (!draggedItem.current) return;
        
        // --- CAMBIO AQUÍ: Limpieza más robusta ---
        if (draggedCloneRef.current) {
            document.body.removeChild(draggedCloneRef.current);
            draggedCloneRef.current = null;
        }
        document.body.classList.remove('no-scroll');
        document.querySelectorAll('.palabra.dragging').forEach(el => el.classList.remove('dragging'));
        
        const touch = e.changedTouches[0];
        const dropZone = dropZoneRef.current;
        const palabraArrastrada = draggedItem.current;

        let nuevasPalabrasOrigen = palabrasOrigen.filter(p => p.id !== palabraArrastrada.id);
        let nuevasPalabrasDestino = palabrasDestino.filter(p => p.id !== palabraArrastrada.id);
        
        const dropZoneRect = dropZone.getBoundingClientRect();
        
        if (touch.clientX >= dropZoneRect.left && touch.clientX <= dropZoneRect.right &&
            touch.clientY >= dropZoneRect.top && touch.clientY <= dropZoneRect.bottom) {
            
            const afterElement = getDragAfterElement(dropZone, touch.clientX);
            if (afterElement == null) {
                nuevasPalabrasDestino.push(palabraArrastrada);
            } else {
                const index = nuevasPalabrasDestino.findIndex(p => p.id === afterElement.dataset.id);
                nuevasPalabrasDestino.splice(index, 0, palabraArrastrada);
            }
        } else {
            nuevasPalabrasOrigen.push(palabraArrastrada);
            nuevasPalabrasOrigen.sort((a, b) => parseInt(a.id.split('-')[2]) - parseInt(b.id.split('-')[2]));
        }

        setPalabrasOrigen(nuevasPalabrasOrigen);
        setPalabrasDestino(nuevasPalabrasDestino);

        draggedItem.current = null;
    };

    return {
        isTestMode, startTest, exitTestMode,
        mision, palabrasOrigen, palabrasDestino, feedback,
        checkPracticeAnswer, startPracticeMission,
        handleDragStart, handleDragEnd, handleDragOver, handleDrop,
        handleTouchStart, handleTouchMove, handleTouchEnd,
        dropZoneRef, originZoneRef,
        currentQuestionIndex, TOTAL_TEST_QUESTIONS, elapsedTime,
        showResults, score, testQuestions, userAnswers,
        handleNextQuestion
    };
};