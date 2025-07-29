import { useState, useEffect, useCallback, useRef } from 'react';

const TOTAL_TEST_STORIES = 5;

export const useOrdenaLaHistoriaGame = (historias, withTimer = false) => {
    const [historiaCorrecta, setHistoriaCorrecta] = useState([]);
    const [frasesDesordenadas, setFrasesDesordenadas] = useState([]);
    const [feedback, setFeedback] = useState({ texto: '', clase: '' });
    const draggedItem = useRef(null);
    const [isTestMode, setIsTestMode] = useState(false);
    const [testQuestions, setTestQuestions] = useState([]);
    const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState([]);
    const [startTime, setStartTime] = useState(0);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [score, setScore] = useState(0);
    const [showResults, setShowResults] = useState(false);

    // Función para añadir IDs únicos a cada frase
    const mapToUniqueItems = (frasesArray) => 
        frasesArray.map((frase, index) => ({
            id: `frase-${Date.now()}-${index}`,
            texto: frase
        }));

    const cargarSiguienteHistoria = useCallback(() => {
        setFeedback({ texto: '', clase: '' });
        let nuevaHistoria;
        do {
            nuevaHistoria = historias[Math.floor(Math.random() * historias.length)];
        } while (JSON.stringify(nuevaHistoria) === JSON.stringify(historiaCorrecta) && historias.length > 1);

        setHistoriaCorrecta(mapToUniqueItems(nuevaHistoria));
        setFrasesDesordenadas(mapToUniqueItems([...nuevaHistoria].sort(() => Math.random() - 0.5)));
    }, [historias, historiaCorrecta]);

    useEffect(() => {
        if (!isTestMode) {
            cargarSiguienteHistoria();
        }
    }, [isTestMode]);
    
    const startPracticeMission = () => {
        setFeedback({ texto: '', clase: '' });
        cargarSiguienteHistoria();
    };

    const startTest = () => {
        const selected = new Set(historias);
        const questions = Array.from(selected).slice(0, TOTAL_TEST_STORIES);
        
        setTestQuestions(questions.map(q => mapToUniqueItems(q)));
        setCurrentStoryIndex(0);
        setUserAnswers([]);

        const primeraHistoria = questions[0];
        setHistoriaCorrecta(mapToUniqueItems(primeraHistoria));
        setFrasesDesordenadas(mapToUniqueItems([...primeraHistoria].sort(() => Math.random() - 0.5)));
        
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
            timer = setInterval(() => setElapsedTime(Math.floor((Date.now() - startTime) / 1000)), 1000);
        }
        return () => clearInterval(timer);
    }, [isTestMode, withTimer, showResults, startTime]);

    const calculateScore = (correctCount, time) => {
        let baseScore = correctCount * 200;
        if (withTimer && correctCount > 0) {
            baseScore += Math.max(0, 100 - (time / correctCount));
        }
        return Math.floor(baseScore);
    };

    const handleNextStory = () => {
        const userAnswer = [...frasesDesordenadas];
        const newAnswers = [...userAnswers, userAnswer];
        setUserAnswers(newAnswers);

        if (currentStoryIndex < testQuestions.length - 1) {
            const nextIndex = currentStoryIndex + 1;
            setCurrentStoryIndex(nextIndex);
            const nextStory = testQuestions[nextIndex];
            setHistoriaCorrecta(nextStory);
            setFrasesDesordenadas([...nextStory].sort(() => Math.random() - 0.5));
        } else {
            const finalTime = withTimer ? Math.floor((Date.now() - startTime) / 1000) : 0;
            setElapsedTime(finalTime);
            let correctCount = 0;
            testQuestions.forEach((story, index) => {
                const userOrder = newAnswers[index].map(f => f.texto).join();
                const correctOrder = story.map(f => f.texto).join();
                if (userOrder === correctOrder) {
                    correctCount++;
                }
            });
            setScore(calculateScore(correctCount, finalTime));
            setShowResults(true);
        }
    };
    
    const exitTestMode = () => setIsTestMode(false);

    const checkStory = () => {
        const userOrder = frasesDesordenadas.map(f => f.texto).join();
        const correctOrder = historiaCorrecta.map(f => f.texto).join();
        if (userOrder === correctOrder) {
            setFeedback({ texto: "¡Correcto! La historia tiene sentido.", clase: 'correcta' });
        } else {
            setFeedback({ texto: "Casi... Intenta ordenar las frases de otra manera.", clase: 'incorrecta' });
        }
    };

    const handleDragStart = (e, frase) => {
        draggedItem.current = frase;
        e.target.classList.add('dragging');
    };

    const handleDragEnd = (e) => {
        if(e.target.classList) e.target.classList.remove('dragging');
        draggedItem.current = null;
    };
    
    const getDragAfterElement = (container, y) => {
        const draggableElements = [...container.querySelectorAll('.frase:not(.dragging)')];
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    };
    
    const handleDrop = (e) => {
        e.preventDefault();
        if (!draggedItem.current) return;
    
        const container = e.currentTarget;
        const afterElement = getDragAfterElement(container, e.clientY);
        
        let newList = frasesDesordenadas.filter(f => f.id !== draggedItem.current.id);
    
        if (afterElement == null) {
            newList.push(draggedItem.current);
        } else {
            const afterElementId = afterElement.getAttribute('data-id');
            const insertIndex = newList.findIndex(f => f.id === afterElementId);
            newList.splice(insertIndex, 0, draggedItem.current);
        }
        setFrasesDesordenadas(newList);
    };

    const handleDragOver = (e) => e.preventDefault();

    return {
        isTestMode, startTest, exitTestMode,
        frasesDesordenadas, feedback,
        checkStory, cargarSiguienteHistoria,
        handleDragStart, handleDragEnd, handleDragOver, handleDrop,
        currentStoryIndex, TOTAL_TEST_STORIES, elapsedTime,
        showResults, score, testQuestions, userAnswers,
        handleNextStory, historiaCorrecta
    };
};